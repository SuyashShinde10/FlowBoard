const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, uploadAvatar } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
