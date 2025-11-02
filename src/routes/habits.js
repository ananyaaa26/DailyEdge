const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// Add habit
router.get('/add', habitController.getAddHabit);
router.post('/add', habitController.postAddHabit);

// Edit habit
router.get('/edit/:id', habitController.getEditHabit);
router.post('/edit/:id', habitController.postUpdateHabit);

// Delete habit
router.post('/delete/:id', habitController.postDeleteHabit);

// Toggle habit completion status
router.post('/toggle/:id', habitController.toggleHabitStatus);

module.exports = router;