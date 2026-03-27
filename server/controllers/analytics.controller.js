const Task = require('../models/Task.model');
const ActivityLog = require('../models/ActivityLog.model');

// @GET /api/analytics/project/:projectId
const getProjectAnalytics = async (req, res) => {
  const { projectId } = req.params;
  const project = await (require('../models/Project.model')).findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await (require('../models/Workspace.model')).findById(project.workspace);
  const m = workspace?.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!m || !['admin', 'manager'].includes(m.role)) {
    return res.status(403).json({ message: 'Access denied. Only admins/managers can view analytics.' });
  }

  const { days = 30 } = req.query;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 1. Tasks completed over time (grouped by day)
  const completedOverTime = await Task.aggregate([
    { $match: { project: new (require('mongoose').Types.ObjectId)(projectId), completedAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // 2. Tasks created over time (for burn-down context)
  const createdOverTime = await Task.aggregate([
    { $match: { project: new (require('mongoose').Types.ObjectId)(projectId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // 3. Priority distribution
  const priorityDistribution = await Task.aggregate([
    { $match: { project: new (require('mongoose').Types.ObjectId)(projectId) } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
  ]);

  // 4. Productivity per member (tasks completed)
  const productivityPerMember = await Task.aggregate([
    { $match: { project: new (require('mongoose').Types.ObjectId)(projectId), completedAt: { $exists: true } } },
    { $unwind: '$assignees' },
    { $group: { _id: '$assignees', completed: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { name: '$user.name', avatar: '$user.avatar', completed: 1, _id: 0 } },
    { $sort: { completed: -1 } },
  ]);

  // 5. Overdue tasks trend
  const overdueTrend = await Task.aggregate([
    {
      $match: {
        project: new (require('mongoose').Types.ObjectId)(projectId),
        dueDate: { $lt: new Date() },
        completedAt: { $exists: false },
      }
    },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', overdue: '$count', _id: 0 } },
  ]);

  // 6. Column distribution (current state)
  const columnDistribution = await Task.aggregate([
    { $match: { project: new (require('mongoose').Types.ObjectId)(projectId) } },
    { $group: { _id: '$columnId', count: { $sum: 1 } } },
    { $project: { columnId: '$_id', count: 1, _id: 0 } },
  ]);

  // 7. Summary stats
  const totalTasks = await Task.countDocuments({ project: projectId });
  const completedTasks = await Task.countDocuments({ project: projectId, completedAt: { $exists: true } });
  const overdueTasks = await Task.countDocuments({ project: projectId, dueDate: { $lt: new Date() }, completedAt: { $exists: false } });
  const inProgressTasks = await Task.countDocuments({ project: projectId, columnId: 'in-progress' });

  res.json({
    summary: { totalTasks, completedTasks, overdueTasks, inProgressTasks, completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
    completedOverTime,
    createdOverTime,
    priorityDistribution,
    productivityPerMember,
    overdueTrend,
    columnDistribution,
  });
};

module.exports = { getProjectAnalytics };
