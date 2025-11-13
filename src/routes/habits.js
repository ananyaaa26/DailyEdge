const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { requireLogin, checkSuspended } = require('../middleware/auth');

// Add habit
router.get('/add', requireLogin, checkSuspended, habitController.getAddHabit);
router.post('/add', requireLogin, checkSuspended, habitController.postAddHabit);

// Edit habit
router.get('/edit/:id', requireLogin, checkSuspended, habitController.getEditHabit);
router.post('/edit/:id', requireLogin, checkSuspended, habitController.postUpdateHabit);

// Delete habit
router.post('/delete/:id', requireLogin, checkSuspended, habitController.postDeleteHabit);

// Toggle habit completion status
router.post('/toggle/:id', requireLogin, checkSuspended, habitController.toggleHabitStatus);

module.exports = router;