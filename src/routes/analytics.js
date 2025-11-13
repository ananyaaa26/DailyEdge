const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireLogin, checkSuspended } = require('../middleware/auth');

// Main analytics page
router.get('/', requireLogin, checkSuspended, analyticsController.getAnalytics);

// API endpoint for chart data
router.get('/data', requireLogin, checkSuspended, analyticsController.getChartData);

module.exports = router;