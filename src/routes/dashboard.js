//dashboard
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireLogin, checkSuspended } = require('../middleware/auth');

router.get('/', requireLogin, checkSuspended, dashboardController.getDashboard);
router.get('/xp', requireLogin, checkSuspended, dashboardController.getUserXP);
router.get('/stats', requireLogin, checkSuspended, dashboardController.getDashboardStats);

module.exports=router;
