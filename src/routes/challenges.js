const express = require('express');
const router = express.Router();
const challengesController = require('../controllers/challengesController');

// Middleware to ensure user is logged in
const authCheck = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

router.get('/', authCheck, challengesController.getChallengesPage);
router.post('/join/:id', authCheck, challengesController.joinChallenge);
router.post('/complete/:id', authCheck, challengesController.completeChallenge);
router.post('/toggle/:id', authCheck, challengesController.toggleChallengeStatus);

module.exports = router;