const Workspace = require('../models/Workspace.model');

// Attach workspace to req and check membership
const requireWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const member = workspace.members.find(m => m.user?.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ message: 'Access denied: Not a workspace member' });

    req.workspace = workspace;
    req.workspaceRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.workspaceRole)) {
    return res.status(403).json({ message: `Access denied: Requires ${roles.join(' or ')} role` });
  }
  next();
};

// Helper to check workspace role without middleware
const getWorkspaceRole = (workspace, userId) => {
  const member = workspace.members.find(m => m.user?.toString() === userId.toString());
  return member ? member.role : null;
};

module.exports = { requireWorkspaceMember, requireRole, getWorkspaceRole };
