const Workspace = require('../models/Workspace.model');
const Project = require('../models/Project.model');
const { v4: uuidv4 } = require('uuid');

// @GET /api/workspaces
const getWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user._id })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort('-createdAt');
  res.json(workspaces);
};

// @POST /api/workspaces
const createWorkspace = async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: 'Workspace name is required' });
  const workspace = await Workspace.create({ name, description, color, owner: req.user._id });
  await workspace.populate('owner', 'name email avatar');
  res.status(201).json(workspace);
};

// @GET /api/workspaces/:id
const getWorkspace = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const isMember = workspace.members.some(m => m.user?._id.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ message: 'Access denied' });
  res.json(workspace);
};

// @PUT /api/workspaces/:id
const updateWorkspace = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const member = workspace.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!member || !['admin'].includes(member.role)) return res.status(403).json({ message: 'Only admins can update workspace' });
  const { name, description, color } = req.body;
  if (name) workspace.name = name;
  if (description !== undefined) workspace.description = description;
  if (color) workspace.color = color;
  await workspace.save();
  res.json(workspace);
};

// @DELETE /api/workspaces/:id
const deleteWorkspace = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  if (workspace.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only owner can delete workspace' });
  await Project.deleteMany({ workspace: workspace._id });
  await workspace.deleteOne();
  res.json({ message: 'Workspace deleted' });
};

// @POST /api/workspaces/:id/invite
const inviteMember = async (req, res) => {
  const { email, role = 'member' } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const inviter = workspace.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!inviter || !['admin', 'manager'].includes(inviter.role)) return res.status(403).json({ message: 'Only admins/managers can invite' });

  // Check if already a member
  const User = require('../models/User.model');
  const invitedUser = await User.findOne({ email });
  if (invitedUser) {
    const alreadyMember = workspace.members.some(m => m.user?.toString() === invitedUser._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });
    workspace.members.push({ user: invitedUser._id, role });
    await workspace.save();
    await workspace.populate('members.user', 'name email avatar');
    return res.json({ message: `${email} added to workspace`, workspace });
  }
  // Simulate invite for non-registered users
  const existing = workspace.invites.find(i => i.email === email);
  if (existing) return res.status(400).json({ message: 'Invite already sent to this email' });
  workspace.invites.push({ email, role, token: uuidv4(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  await workspace.save();
  res.json({ message: `Invite sent to ${email} (simulated)`, workspace });
};

// @PUT /api/workspaces/:id/members/:userId/role
const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const requester = workspace.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Only admins can change roles' });
  const member = workspace.members.find(m => m.user?.toString() === req.params.userId);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  member.role = role;
  await workspace.save();
  await workspace.populate('members.user', 'name email avatar');
  res.json(workspace);
};

// @DELETE /api/workspaces/:id/members/:userId
const removeMember = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
  const requester = workspace.members.find(m => m.user?.toString() === req.user._id.toString());
  if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Only admins can remove members' });
  workspace.members = workspace.members.filter(m => m.user?.toString() !== req.params.userId);
  await workspace.save();
  res.json({ message: 'Member removed' });
};

module.exports = { getWorkspaces, createWorkspace, getWorkspace, updateWorkspace, deleteWorkspace, inviteMember, updateMemberRole, removeMember };
