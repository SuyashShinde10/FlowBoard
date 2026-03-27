const express = require('express');
const router = express.Router();
const { getProjectAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/project/:projectId', getProjectAnalytics);

module.exports = router;
