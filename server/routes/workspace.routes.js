const express = require('express');
const router = express.Router();
const { getWorkspaces, createWorkspace, getWorkspace, updateWorkspace, deleteWorkspace, inviteMember, updateMemberRole, removeMember } = require('../controllers/workspace.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.post('/:id/invite', inviteMember);
router.put('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
