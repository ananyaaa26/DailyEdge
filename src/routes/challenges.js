const express = require('express');
const router = express.Router();
const challengesController = require('../controllers/challengesController');
const { requireLogin, checkSuspended } = require('../middleware/auth');

router.get('/', requireLogin, checkSuspended, challengesController.getChallengesPage);
router.post('/join/:id', requireLogin, checkSuspended, challengesController.joinChallenge);
router.post('/complete/:id', requireLogin, checkSuspended, challengesController.completeChallenge);
router.post('/toggle/:id', requireLogin, checkSuspended, challengesController.toggleChallengeStatus);
// export
module.exports = router;
