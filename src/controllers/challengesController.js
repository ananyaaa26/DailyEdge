const db = require('../models/db');
const { calculateChallengeStreak, awardBadges, getStreakMultiplier } = require('../utils/gamification');
const { invalidateChallengeCache, invalidateUserCache } = require('../utils/cacheHelper');

exports.getChallengesPage = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        
        // Fetch all available challenges with user participation Status
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
        
        // Invalidate challenge-related caches
        await invalidateChallengeCache(userId);

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

exports.toggleChallengeStatus = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const challengeId = req.params.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const userId = req.session.user.id;

    try {
        // Get the user_challenge record
        const userChallengeResult = await db.query(
            'SELECT id, status FROM user_challenges WHERE user_id = $1 AND challenge_id = $2',
            [userId, challengeId]
        );

        if (userChallengeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found or not joined' });
        }

        const userChallenge = userChallengeResult.rows[0];
        const userChallengeId = userChallenge.id;

        // Check if log for today exists
        const existingLog = await db.query(
            'SELECT id, status FROM challenge_logs WHERE user_challenge_id = $1 AND date = $2',
            [userChallengeId, today]
        );

        let newStatus = 'done';
        let wasCompleted = false;

        if (existingLog.rows.length > 0) {
            // Toggle existing log
            const currentStatus = existingLog.rows[0].status;
            newStatus = currentStatus === 'done' ? 'not done' : 'done';
            wasCompleted = currentStatus === 'done';
            
            await db.query('UPDATE challenge_logs SET status = $1 WHERE id = $2', [newStatus, existingLog.rows[0].id]);
        } else {
            // Insert new log as completed
            await db.query(
                'INSERT INTO challenge_logs (user_challenge_id, date, status) VALUES ($1, $2, $3)',
                [userChallengeId, today, newStatus]
            );
        }

        // Award or remove XP based on completion status
        if (newStatus === 'done' && !wasCompleted) {
            // Calculate current streak for this challenge
            const streak = await calculateChallengeStreak(userChallengeId);
            
            // Get streak multiplier
            const multiplier = getStreakMultiplier(streak);
            
            // Base XP for completing a challenge daily task (higher than habits)
            const baseXP = 15;
            const earnedXP = Math.round(baseXP * multiplier);
            
            // Award XP with streak bonus
            await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [earnedXP, userId]);
            
            // Invalidate caches after XP update
            await invalidateUserCache(userId);
            
            // Check for streak milestones and award badges + bonus XP
            try {
                const badgeReward = await awardBadges(userId, streak);
                
                res.json({ 
                    success: true, 
                    status: newStatus,
                    completed: newStatus === 'done',
                    xpEarned: earnedXP,
                    streak: streak,
                    multiplier: multiplier,
                    badgeReward: badgeReward
                });
                return;
            } catch (streakErr) {
                console.error('Error calculating challenge streak:', streakErr);
            }
        } else if (newStatus === 'not done' && wasCompleted) {
            // Uncompleted - remove XP (but don't go below 0)
            await db.query('UPDATE users SET xp = GREATEST(xp - 15, 0) WHERE id = $1', [userId]);
            
            // Invalidate caches after XP change
            await invalidateUserCache(userId);
        }

        res.json({ 
            success: true, 
            status: newStatus,
            completed: newStatus === 'done'
        });
    } catch (err) {
        console.error('Toggle challenge error:', err);
        res.status(500).json({ error: 'An error occurred while updating the challenge' });
    }
};
