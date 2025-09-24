const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Main analytics page
router.get('/', analyticsController.getAnalytics);

// API endpoint for chart data
router.get('/data', analyticsController.getChartData);

module.exports = router;