const db = require('../models/db');
const { getQuote } = require('../utils/quoteFetcher');
const { calculateStreak, calculateChallengeStreak } = require('../utils/gamification');
const redisClient = require('../config/redis');
const { checkAllUserHabits, checkAllUserChallenges } = require('../utils/completionChecker');

// Ensure "exports." is here. This is the fix.
exports.getDashboard = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const cacheKey = `dashboard:${userId}`;
        
        // Check for any habits/challenges that need status updates
        const habitUpdates = await checkAllUserHabits(userId);
        const challengeUpdates = await checkAllUserChallenges(userId);
        
        // Try cache first (skip cache if updates were made)
        const cached = habitUpdates.length === 0 && challengeUpdates.length === 0 ? await redisClient.get(cacheKey) : null;
        if (cached) {
            const dashboardData = JSON.parse(cached);
            return res.render('pages/dashboard', {
                title: 'Dashboard',
                ...dashboardData,
                currentUser: req.session.user
            });
        }

        // Fetch habits with today's completion status - ONLY active habits
        const habitsResult = await db.query(
            `SELECT h.id, h.name, h.category, h.duration_days, h.created_at, h.status,
             EXISTS(SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $1 AND hl.status = 'done') as is_completed
             FROM habits h 
             WHERE h.user_id = $2 AND h.status = 'in_progress'
             ORDER BY h.created_at ASC`, [today, userId]
        );
        
        const habits = habitsResult.rows;

        // Fetch completed habits
        const completedHabitsResult = await db.query(
            `SELECT h.id, h.name, h.category, h.duration_days, h.created_at, h.completed_at, h.status
             FROM habits h 
             WHERE h.user_id = $1 AND h.status = 'completed'
             ORDER BY h.completed_at DESC`, [userId]
        );
        
        const completedHabits = completedHabitsResult.rows;

        // Fetch failed habits
        const failedHabitsResult = await db.query(
            `SELECT h.id, h.name, h.category, h.duration_days, h.created_at, h.end_date, h.status
             FROM habits h 
             WHERE h.user_id = $1 AND h.status = 'failed'
             ORDER BY h.end_date DESC`, [userId]
        );
        
        const failedHabits = failedHabitsResult.rows;

        // Calculate consecutive streak for each habit (resets to 0 if a day is missed)
        for (const habit of habits) {
            habit.streak = await calculateStreak(habit.id);
            
            // Calculate progress and days remaining
            const startDate = new Date(habit.created_at);
            const todayDate = new Date();
            const daysPassed = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            habit.progress = Math.min(daysPassed, habit.duration_days);
            habit.days_remaining = Math.max(0, habit.duration_days - daysPassed);
        }

        // Calculate streaks for completed habits
        for (const habit of completedHabits) {
            habit.streak = await calculateStreak(habit.id);
        }

        // Fetch active challenges - ONLY in_progress
        const activeChallengesResult = await db.query(`
            SELECT c.id, c.title as name, c.description, c.duration_days, c.xp_reward,
                   uc.start_date, uc.status,
                   EXISTS(SELECT 1 FROM challenge_logs cl WHERE cl.user_challenge_id = uc.id AND cl.date = $1 AND cl.status = 'done') as is_completed
            FROM challenges c
            JOIN user_challenges uc ON c.id = uc.challenge_id
            WHERE uc.user_id = $2 AND uc.status = 'in_progress'
            ORDER BY uc.start_date DESC
        `, [today, userId]);
        
        const activeChallenges = activeChallengesResult.rows;

        // Fetch completed challenges
        const completedChallengesResult = await db.query(`
            SELECT c.id, c.title as name, c.description, c.duration_days, c.xp_reward,
                   uc.start_date, uc.completed_at, uc.status
            FROM challenges c
            JOIN user_challenges uc ON c.id = uc.challenge_id
            WHERE uc.user_id = $1 AND uc.status = 'completed'
            ORDER BY uc.completed_at DESC
        `, [userId]);
        
        const completedChallenges = completedChallengesResult.rows;

        // Fetch failed challenges
        const failedChallengesResult = await db.query(`
            SELECT c.id, c.title as name, c.description, c.duration_days, c.xp_reward,
                   uc.start_date, uc.failed_at, uc.status
            FROM challenges c
            JOIN user_challenges uc ON c.id = uc.challenge_id
            WHERE uc.user_id = $1 AND uc.status = 'failed'
            ORDER BY uc.failed_at DESC
        `, [userId]);
        
        const failedChallenges = failedChallengesResult.rows;

        // Calculate progress for active challenges
        for (const challenge of activeChallenges) {
            if (challenge.start_date) {
                const startDate = new Date(challenge.start_date);
                const todayDate = new Date();
                const daysPassed = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                challenge.progress = Math.min(daysPassed, challenge.duration_days);
                challenge.days_remaining = Math.max(0, challenge.duration_days - daysPassed);
                
                // Calculate consecutive streak (resets to 0 if a day is missed)
                const userChallengeResult = await db.query(
                    'SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2',
                    [userId, challenge.id]
                );
                if (userChallengeResult.rows.length > 0) {
                    const userChallengeId = userChallengeResult.rows[0].id;
                    challenge.streak = await calculateChallengeStreak(userChallengeId);
                } else {
                    challenge.streak = 0;
                }
                
                // Set category for display
                if (challenge.name.toLowerCase().includes('fitness') || challenge.name.toLowerCase().includes('workout')) {
                    challenge.category = 'Health';
                } else if (challenge.name.toLowerCase().includes('study') || challenge.name.toLowerCase().includes('read')) {
                    challenge.category = 'Study';
                } else if (challenge.name.toLowerCase().includes('meditation') || challenge.name.toLowerCase().includes('mindfulness')) {
                    challenge.category = 'Mindfulness';
                } else {
                    challenge.category = 'Challenge';
                }
                
                // Mark as challenge type
                challenge.is_challenge = true;
            }
        }

        // Get user stats
        const userResult = await db.query('SELECT username, xp, created_at FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Get today's completion stats (combine habits and challenges)
        const completedCount = habits.filter(h => h.is_completed).length + activeChallenges.filter(c => c.is_completed).length;
        const totalCount = habits.length + activeChallenges.length;
        const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Get weekly stats (combine habits and challenges)
        const weeklyStatsResult = await db.query(`
            SELECT 
                COUNT(DISTINCT hl.date) as active_days,
                COUNT(*) as total_completions
            FROM habit_logs hl
            JOIN habits h ON h.id = hl.habit_id
            WHERE h.user_id = $1 AND hl.status = 'done' AND hl.date >= CURRENT_DATE - INTERVAL '7 days'
        `, [userId]);
        
        const challengeWeeklyStatsResult = await db.query(`
            SELECT 
                COUNT(DISTINCT cl.date) as active_days,
                COUNT(*) as total_completions
            FROM challenge_logs cl
            JOIN user_challenges uc ON uc.id = cl.user_challenge_id
            WHERE uc.user_id = $1 AND cl.status = 'done' AND cl.date >= CURRENT_DATE - INTERVAL '7 days'
        `, [userId]);
        
        const weeklyStats = {
            active_days: Math.max(
                parseInt(weeklyStatsResult.rows[0]?.active_days || 0),
                parseInt(challengeWeeklyStatsResult.rows[0]?.active_days || 0)
            ),
            total_completions: 
                parseInt(weeklyStatsResult.rows[0]?.total_completions || 0) + 
                parseInt(challengeWeeklyStatsResult.rows[0]?.total_completions || 0)
        };

        // Get recent badges (last 5)
        const badgesResult = await db.query(
            'SELECT badge_name, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 5',
            [userId]
        );
        const recentBadges = badgesResult.rows;

        // Prepare data for caching
        const dashboardData = {
            habits,
            completedHabits,
            failedHabits,
            activeChallenges,
            completedChallenges,
            failedChallenges,
            completedCount,
            totalCount,
            completionPercentage,
            weeklyStats,
            recentBadges,
            user: user || req.session.user
        };
        
        // Cache for 2 minutes
        await redisClient.setEx(cacheKey, 120, JSON.stringify(dashboardData));

        res.render('pages/dashboard', {
            title: 'Dashboard',
            ...dashboardData,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        next(err);
    }
};

// API endpoint to get current user XP
exports.getUserXP = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const userId = req.session.user.id;
        const userResult = await db.query('SELECT xp FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ xp: userResult.rows[0].xp || 0 });
    } catch (err) {
        console.error('Get XP error:', err);
        res.status(500).json({ error: 'Failed to fetch XP' });
    }
};

// API endpoint to get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const userId = req.session.user.id;
        const cacheKey = `stats:${userId}`;
        
        // Try cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        const today = new Date().toISOString().split('T')[0];

        // Get user XP
        const userResult = await db.query('SELECT xp FROM users WHERE id = $1', [userId]);
        const xp = userResult.rows[0]?.xp || 0;

        // Get today's completion stats
        const habitsResult = await db.query(
            `SELECT COUNT(*) as total,
                    COUNT(CASE WHEN EXISTS(SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $1 AND hl.status = 'done') THEN 1 END) as completed
             FROM habits h WHERE h.user_id = $2`,
            [today, userId]
        );

        const challengesResult = await db.query(
            `SELECT COUNT(*) as total,
                    COUNT(CASE WHEN EXISTS(SELECT 1 FROM challenge_logs cl WHERE cl.user_challenge_id = uc.id AND cl.date = $1 AND cl.status = 'done') THEN 1 END) as completed
             FROM user_challenges uc
             WHERE uc.user_id = $2 AND uc.status = 'in_progress'`,
            [today, userId]
        );

        const totalCount = parseInt(habitsResult.rows[0].total) + parseInt(challengesResult.rows[0].total);
        const completedCount = parseInt(habitsResult.rows[0].completed) + parseInt(challengesResult.rows[0].completed);
        const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Get weekly stats
        const weeklyStatsResult = await db.query(`
            SELECT 
                COUNT(DISTINCT hl.date) as active_days,
                COUNT(*) as total_completions
            FROM habit_logs hl
            JOIN habits h ON h.id = hl.habit_id
            WHERE h.user_id = $1 AND hl.status = 'done' AND hl.date >= CURRENT_DATE - INTERVAL '7 days'
        `, [userId]);
        
        const challengeWeeklyStatsResult = await db.query(`
            SELECT 
                COUNT(DISTINCT cl.date) as active_days,
                COUNT(*) as total_completions
            FROM challenge_logs cl
            JOIN user_challenges uc ON uc.id = cl.user_challenge_id
            WHERE uc.user_id = $1 AND cl.status = 'done' AND cl.date >= CURRENT_DATE - INTERVAL '7 days'
        `, [userId]);
        
        const activeDays = Math.max(
            parseInt(weeklyStatsResult.rows[0]?.active_days || 0),
            parseInt(challengeWeeklyStatsResult.rows[0]?.active_days || 0)
        );
        
        const totalCompletions = 
            parseInt(weeklyStatsResult.rows[0]?.total_completions || 0) + 
            parseInt(challengeWeeklyStatsResult.rows[0]?.total_completions || 0);

        const stats = {
            xp,
            activeDays,
            totalCompletions,
            completedCount,
            totalCount,
            completionPercentage
        };
        
        // Cache for 30 seconds (frequently updated)
        await redisClient.setEx(cacheKey, 30, JSON.stringify(stats));
        
        res.json(stats);
    } catch (err) {
        console.error('Get dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};