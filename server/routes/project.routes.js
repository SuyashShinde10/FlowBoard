const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProject, updateProject, deleteProject, addColumn, updateColumns, deleteColumn, addProjectMember, removeProjectMember } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/workspace/:workspaceId', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/columns', addColumn);
router.put('/:id/columns', updateColumns);
router.delete('/:id/columns/:columnId', deleteColumn);
router.post('/:id/members', addProjectMember);
router.delete('/:id/members/:userId', removeProjectMember);

module.exports = router;
