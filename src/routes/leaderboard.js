const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Leaderboard page
router.get('/', leaderboardController.getLeaderboardPage);

// Get streaks leaderboard
router.get('/streaks', leaderboardController.getStreaksLeaderboard);

// Get user's streak rank
router.get('/user-rank', leaderboardController.getUserStreakRank);

module.exports = router;
