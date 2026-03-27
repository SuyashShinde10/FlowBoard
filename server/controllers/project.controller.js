const Project = require('../models/Project.model');
const Workspace = require('../models/Workspace.model');
const Task = require('../models/Task.model');
const { v4: uuidv4 } = require('uuid');

const getUserWorkspaceRole = (workspace, userId) => {
  const m = workspace.members.find(m => m.user?.toString() === userId.toString());
  return m ? m.role : null;
};

// @GET /api/projects/workspace/:workspaceId
const getProjects = async (req, res) => {
  const workspace = await Workspace.findById(req.params.workspaceId);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const isMember = workspace.members.some(m => m.user?.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ message: 'Access denied' });
  const projects = await Project.find({ workspace: req.params.workspaceId })
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort('-createdAt');
  res.json(projects);
};

// @POST /api/projects
const createProject = async (req, res) => {
  const { name, description, workspaceId, deadline, color } = req.body;
  if (!name || !workspaceId) return res.status(400).json({ message: 'Name and workspaceId are required' });
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!role || !['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Only admins/managers can create projects' });
  const project = await Project.create({ name, description, workspace: workspaceId, createdBy: req.user._id, members: [req.user._id], deadline, color });
  await project.populate('createdBy', 'name email avatar');
  res.status(201).json(project);
};

// @GET /api/projects/:id
const getProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const m = workspace?.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!m) return res.status(403).json({ message: 'Access denied' });
  
  res.json({ ...project.toObject(), myRole: m.role });
};

// @PUT /api/projects/:id
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });
  const { name, description, deadline, color, status } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (deadline) project.deadline = deadline;
  if (color) project.color = color;
  if (status) project.status = status;
  await project.save();
  res.json(project);
};

// @DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
};

// @POST /api/projects/:id/columns
const addColumn = async (req, res) => {
  const { title, color } = req.body;
  if (!title) return res.status(400).json({ message: 'Column title is required' });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });
  const newColumn = { id: uuidv4(), title, color: color || '#6C63FF', order: project.columns.length };
  project.columns.push(newColumn);
  await project.save();
  res.json(project);
};

// @PUT /api/projects/:id/columns — reorder or rename columns
const updateColumns = async (req, res) => {
  const { columns } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });
  project.columns = columns;
  await project.save();
  res.json(project);
};

// @DELETE /api/projects/:id/columns/:columnId
const deleteColumn = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });
  const tasks = await Task.countDocuments({ project: project._id, columnId: req.params.columnId });
  if (tasks > 0) return res.status(400).json({ message: 'Cannot delete column with tasks. Move tasks first.' });
  project.columns = project.columns.filter(c => c.id !== req.params.columnId);
  await project.save();
  res.json(project);
};

// @POST /api/projects/:id/members
const addProjectMember = async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied. Only admins/managers can assign members.' });

  if (!project.members.includes(userId)) {
    project.members.push(userId);
    await project.save();
  }
  await project.populate('members', 'name email avatar');
  res.json(project);
};

// @DELETE /api/projects/:id/members/:userId
const removeProjectMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  
  const workspace = await Workspace.findById(project.workspace);
  const role = getUserWorkspaceRole(workspace, req.user._id);
  if (!['admin', 'manager'].includes(role)) return res.status(403).json({ message: 'Access denied' });

  project.members = project.members.filter(m => m.toString() !== req.params.userId.toString());
  await project.save();
  await project.populate('members', 'name email avatar');
  res.json(project);
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addColumn, updateColumns, deleteColumn, addProjectMember, removeProjectMember };
