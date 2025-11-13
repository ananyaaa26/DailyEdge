const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireLogin, checkSuspended } = require('../middleware/auth');

router.get('/', requireLogin, checkSuspended, dashboardController.getDashboard);

module.exports = router;