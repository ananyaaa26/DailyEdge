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

        // Get user stats
        const userResult = await db.query('SELECT username, xp FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Get today's completion stats
        const completedCount = habits.filter(h => h.is_completed).length;
        const totalCount = habits.length;
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
        
        const weeklyStats = weeklyStatsResult.rows[0];

        res.render('pages/dashboard', {
            title: 'Dashboard',
            habits,
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