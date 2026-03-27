const Task = require('../models/Task.model');
const Project = require('../models/Project.model');
const Workspace = require('../models/Workspace.model');
const ActivityLog = require('../models/ActivityLog.model');
const Comment = require('../models/Comment.model');
const { cloudinary } = require('../config/cloudinary');

const createActivity = async (taskId, projectId, userId, action, field, oldValue, newValue, description) => {
  try {
    await ActivityLog.create({ task: taskId, project: projectId, user: userId, action, field, oldValue, newValue, description });
  } catch (e) { /* silent */ }
};

// @GET /api/tasks/project/:projectId
const getTasks = async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignees', 'name email avatar role')
    .populate('createdBy', 'name email avatar role')
    .sort('order');
  res.json(tasks);
};

// @POST /api/tasks
const createTask = async (req, res) => {
  const { title, description, projectId, workspaceId, columnId, assignees, priority, labels, dueDate, estimatedHours } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'Title and projectId are required' });
  const lastTask = await Task.findOne({ project: projectId, columnId }).sort('-order');
  const task = await Task.create({
    title, description, project: projectId, workspace: workspaceId, columnId: columnId || 'todo',
    assignees: assignees || [], priority: priority || 'medium', labels: labels || [],
    dueDate, createdBy: req.user._id, order: lastTask ? lastTask.order + 1 : 0, estimatedHours,
  });
  await task.populate('assignees', 'name email avatar role');
  await task.populate('createdBy', 'name email avatar role');
  await createActivity(task._id, projectId, req.user._id, 'created', null, null, null, `Task "${title}" created`);

  // Emit socket event
  const io = req.app.get('io');
  if (io) io.to(`project:${projectId}`).emit('task:created', task);

  res.status(201).json(task);
};

// @GET /api/tasks/:id
const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignees', 'name email avatar role')
    .populate('createdBy', 'name email avatar role');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const logs = await ActivityLog.find({ task: task._id }).populate('user', 'name email avatar role').sort('-createdAt').limit(50);
  const comments = await Comment.find({ task: task._id }).populate('author', 'name email avatar role').sort('createdAt');
  res.json({ ...task.toObject(), activityLog: logs, comments });
};

// @PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const io = req.app.get('io');
  const { title, description, columnId, assignees, priority, labels, dueDate, estimatedHours, actualHours } = req.body;

  // Track changes for activity log
  if (columnId && columnId !== task.columnId) {
    await createActivity(task._id, task.project, req.user._id, 'moved', 'columnId', task.columnId, columnId, `Moved from "${task.columnId}" to "${columnId}"`);
    task.columnId = columnId;
    // Handle completedAt
    if (columnId === 'done' && !task.completedAt) task.completedAt = new Date();
    else if (columnId !== 'done') task.completedAt = undefined;
  }
  if (title && title !== task.title) {
    await createActivity(task._id, task.project, req.user._id, 'updated', 'title', task.title, title, `Title changed to "${title}"`);
    task.title = title;
  }
  if (priority && priority !== task.priority) {
    await createActivity(task._id, task.project, req.user._id, 'updated', 'priority', task.priority, priority, `Priority set to "${priority}"`);
    task.priority = priority;
  }
  if (dueDate !== undefined) { task.dueDate = dueDate; }
  if (description !== undefined) task.description = description;
  if (assignees) task.assignees = assignees;
  if (labels) task.labels = labels;
  if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
  if (actualHours !== undefined) task.actualHours = actualHours;

  await task.save();
  await task.populate('assignees', 'name email avatar role');
  await task.populate('createdBy', 'name email avatar role');

  if (io) io.to(`project:${task.project.toString()}`).emit('task:updated', task);
  res.json(task);
};

// @DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  // Delete cloudinary attachments
  for (const att of task.attachments) {
    if (att.publicId) {
      try { await cloudinary.uploader.destroy(att.publicId, { resource_type: 'auto' }); } catch (e) { /* silent */ }
    }
  }
  const projectId = task.project.toString();
  await ActivityLog.deleteMany({ task: task._id });
  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();

  const io = req.app.get('io');
  if (io) io.to(`project:${projectId}`).emit('task:deleted', { taskId: req.params.id });

  res.json({ message: 'Task deleted' });
};

// @PUT /api/tasks/reorder — bulk update after drag & drop
const reorderTasks = async (req, res) => {
  const { updates } = req.body; // [{ _id, columnId, order }]
  if (!updates || !Array.isArray(updates)) return res.status(400).json({ message: 'Updates array required' });
  const bulkOps = updates.map(u => {
    let setObj = { columnId: u.columnId, order: u.order };
    let unsetObj = {};

    if (u.columnId === 'done') {
      setObj.completedAt = new Date();
    } else {
      unsetObj.completedAt = 1;
    }

    const updateDef = { $set: setObj };
    if (Object.keys(unsetObj).length > 0) {
      updateDef.$unset = unsetObj;
    }

    return {
      updateOne: {
        filter: { _id: u._id },
        update: updateDef,
      }
    };
  });
  await Task.bulkWrite(bulkOps);

  const io = req.app.get('io');
  if (io && updates.length > 0) {
    const firstTask = await Task.findById(updates[0]._id).select('project');
    if (firstTask) io.to(`project:${firstTask.project.toString()}`).emit('tasks:reordered', updates);
  }
  res.json({ message: 'Tasks reordered' });
};

// @POST /api/tasks/:id/attachments
const uploadAttachment = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const attachment = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: req.file.path,
    publicId: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedBy: req.user._id,
    uploadedAt: new Date(),
  };
  task.attachments.push(attachment);
  await task.save();
  await createActivity(task._id, task.project, req.user._id, 'attachment', null, null, req.file.originalname, `Attached "${req.file.originalname}"`);
  res.json(task);
};

// @DELETE /api/tasks/:id/attachments/:filename
const deleteAttachment = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const att = task.attachments.find(a => a.filename === req.params.filename);
  if (!att) return res.status(404).json({ message: 'Attachment not found' });
  try { await cloudinary.uploader.destroy(att.publicId, { resource_type: 'auto' }); } catch (e) { /* silent */ }
  task.attachments = task.attachments.filter(a => a.filename !== req.params.filename);
  await task.save();
  res.json(task);
};

// @GET /api/tasks/:id/comments
const getComments = async (req, res) => {
  const comments = await Comment.find({ task: req.params.id }).populate('author', 'name email avatar role').sort('createdAt');
  res.json(comments);
};

// @POST /api/tasks/:id/comments
const addComment = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Comment content is required' });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const comment = await Comment.create({ task: req.params.id, author: req.user._id, content });
  await comment.populate('author', 'name email avatar role');

  const io = req.app.get('io');
  if (io) io.to(`project:${task.project.toString()}`).emit('comment:new', { taskId: req.params.id, comment });

  res.status(201).json(comment);
};

// @PUT /api/tasks/:taskId/comments/:commentId
const updateComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your comment' });
  comment.content = req.body.content;
  comment.edited = true;
  await comment.save();
  await comment.populate('author', 'name email avatar role');
  res.json(comment);
};

// @DELETE /api/tasks/:taskId/comments/:commentId
const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your comment' });
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, reorderTasks, uploadAttachment, deleteAttachment, getComments, addComment, updateComment, deleteComment };
