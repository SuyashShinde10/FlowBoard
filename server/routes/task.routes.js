const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTask, updateTask, deleteTask, reorderTasks, uploadAttachment, deleteAttachment, getComments, addComment, updateComment, deleteComment } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/project/:projectId', getTasks);
router.put('/reorder', reorderTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:filename', deleteAttachment);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);
router.put('/:taskId/comments/:commentId', updateComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

module.exports = router;
