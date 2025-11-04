const db = require('../models/db');
const { getQuote } = require('../utils/quoteFetcher');

// Ensure "exports." is here. This is the fix.
exports.getDashboard = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Fetch habits with today's completion status
        const habitsResult = await db.query(
            `SELECT h.id, h.name, h.category, h.frequency, h.created_at,
             EXISTS(SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $1 AND hl.status = 'done') as is_completed
             FROM habits h 
             WHERE h.user_id = $2
             ORDER BY h.created_at ASC`, [today, userId]
        );
        
        const habits = habitsResult.rows;

        // Calculate simple streak for each habit (days completed in the last week)
        for (const habit of habits) {
            const streakResult = await db.query(`
                SELECT COUNT(*) as streak
                FROM habit_logs 
                WHERE habit_id = $1 AND status = 'done' AND date >= CURRENT_DATE - INTERVAL '7 days'
            `, [habit.id]);
            habit.streak = parseInt(streakResult.rows[0]?.streak || 0);
        }

        // Fetch active challenges
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

        // Calculate progress for active challenges
        for (const challenge of activeChallenges) {
            if (challenge.start_date) {
                const startDate = new Date(challenge.start_date);
                const todayDate = new Date();
                const daysPassed = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                challenge.progress = Math.min(daysPassed, challenge.duration_days);
                challenge.days_remaining = Math.max(0, challenge.duration_days - daysPassed);
                
                // Calculate streak (days completed in a row)
                const streakResult = await db.query(`
                    SELECT COUNT(*) as streak
                    FROM challenge_logs 
                    WHERE user_challenge_id = (SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2) 
                    AND status = 'done' AND date >= CURRENT_DATE - INTERVAL '7 days'
                `, [userId, challenge.id]);
                challenge.streak = parseInt(streakResult.rows[0]?.streak || 0);
                
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
        const userResult = await db.query('SELECT username, xp FROM users WHERE id = $1', [userId]);
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

        res.render('pages/dashboard', {
            title: 'Dashboard',
            habits,
            activeChallenges,
            completedCount,
            totalCount,
            completionPercentage,
            weeklyStats,
            user: user || req.session.user,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        next(err);
    }
};