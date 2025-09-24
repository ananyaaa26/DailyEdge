const db = require('../models/db');

exports.getChallengesPage = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        
        // Fetch all available challenges with user participation status
        const allChallengesResult = await db.query(`
            SELECT c.*, 
                   uc.status as user_status, 
                   uc.start_date,
                   CASE 
                       WHEN uc.id IS NOT NULL THEN true 
                       ELSE false 
                   END as is_participating,
                   CASE 
                       WHEN uc.status = 'completed' THEN true 
                       ELSE false 
                   END as is_completed
            FROM challenges c
            LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
            ORDER BY c.duration_days, c.xp_reward
        `, [userId]);

        // Get user's current XP and badges
        const userStatsResult = await db.query(
            'SELECT xp, (SELECT COUNT(*) FROM badges WHERE user_id = $1) as badge_count FROM users WHERE id = $1',
            [userId]
        );

        const userStats = userStatsResult.rows[0] || { xp: 0, badge_count: 0 };

        // Separate challenges into categories
        const availableChallenges = allChallengesResult.rows.filter(c => !c.is_participating);
        const activeChallenges = allChallengesResult.rows.filter(c => c.is_participating && !c.is_completed);
        const completedChallenges = allChallengesResult.rows.filter(c => c.is_completed);

        // Calculate progress for active challenges
        for (const challenge of activeChallenges) {
            if (challenge.start_date) {
                const startDate = new Date(challenge.start_date);
                const today = new Date();
                const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                challenge.progress = Math.min(daysPassed, challenge.duration_days);
                challenge.progress_percentage = Math.round((challenge.progress / challenge.duration_days) * 100);
                challenge.days_remaining = Math.max(0, challenge.duration_days - daysPassed);
            }
        }

        res.render('pages/challenges', {
            title: 'Challenges',
            currentUser: req.session.user,
            availableChallenges,
            activeChallenges,
            completedChallenges,
            userStats
        });
    } catch (err) {
        console.error('Challenges page error:', err);
        next(err);
    }
};

exports.joinChallenge = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const challengeId = req.params.id;

        // Check if challenge exists
        const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
        if (challengeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Check if user is already participating
        const existingParticipation = await db.query(
            'SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2',
            [userId, challengeId]
        );

        if (existingParticipation.rows.length > 0) {
            return res.status(400).json({ error: 'Already participating in this challenge' });
        }

        // Join the challenge
        await db.query(
            'INSERT INTO user_challenges (user_id, challenge_id, status) VALUES ($1, $2, $3)',
            [userId, challengeId, 'in_progress']
        );

        res.json({ success: true, message: 'Successfully joined the challenge!' });
    } catch (err) {
        console.error('Join challenge error:', err);
        res.status(500).json({ error: 'An error occurred while joining the challenge' });
    }
};

exports.completeChallenge = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const challengeId = req.params.id;

        // Get challenge details
        const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
        if (challengeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challenge = challengeResult.rows[0];

        // Update challenge status to completed
        await db.query(
            'UPDATE user_challenges SET status = $1 WHERE user_id = $2 AND challenge_id = $3',
            ['completed', userId, challengeId]
        );

        // Award XP
        await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [challenge.xp_reward, userId]);

        // Award badge for completing challenge
        const badgeName = `Challenge Champion: ${challenge.title}`;
        await db.query(
            'INSERT INTO badges (user_id, badge_name) VALUES ($1, $2)',
            [userId, badgeName]
        );

        res.json({ 
            success: true, 
            message: `Challenge completed! You earned ${challenge.xp_reward} XP and a new badge!`,
            xp_earned: challenge.xp_reward
        });
    } catch (err) {
        console.error('Complete challenge error:', err);
        res.status(500).json({ error: 'An error occurred while completing the challenge' });
    }
};