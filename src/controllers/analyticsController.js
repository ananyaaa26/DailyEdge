const db = require('../models/db');
const { calculateStreak } = require('../utils/gamification');

exports.getAnalytics = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    
    try {
        const userId = req.session.user.id;

        // Get user stats
        const userResult = await db.query('SELECT username, xp, created_at FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Get all habits with their completion stats
        const habitsResult = await db.query(`
            SELECT h.id, h.name, h.category, h.created_at,
                   COUNT(hl.id) FILTER (WHERE hl.status = 'done') as total_completions,
                   COUNT(DISTINCT hl.date) FILTER (WHERE hl.status = 'done') as active_days
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id
            WHERE h.user_id = $1
            GROUP BY h.id, h.name, h.category, h.created_at
            ORDER BY total_completions DESC
        `, [userId]);

        const habits = habitsResult.rows;
        
        // Calculate streaks for each habit
        let longestStreak = 0;
        let longestStreakHabit = 'N/A';
        
        for (const habit of habits) {
            const streak = await calculateStreak(habit.id);
            habit.streak = streak;
            if (streak > longestStreak) {
                longestStreak = streak;
                longestStreakHabit = habit.name;
            }
        }

        // Overall statistics
        const totalHabits = habits.length;
        const totalCompletions = habits.reduce((sum, h) => sum + parseInt(h.total_completions), 0);
        
        // Today's statistics
        const today = new Date().toISOString().split('T')[0];
        const todayResult = await db.query(`
            SELECT COUNT(*) FILTER (WHERE hl.status = 'done') as completed_today,
                   COUNT(*) as total_today
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = $1
            WHERE h.user_id = $2
        `, [today, userId]);
        
        const todayStats = todayResult.rows[0];
        const completionRate = todayStats.total_today > 0 ? 
            Math.round((todayStats.completed_today / todayStats.total_today) * 100) : 0;

        // Weekly statistics
        const weeklyResult = await db.query(`
            SELECT 
                COUNT(DISTINCT hl.date) as active_days,
                COUNT(*) FILTER (WHERE hl.status = 'done') as total_completions,
                COUNT(DISTINCT h.id) as habits_worked_on
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
                AND hl.date >= CURRENT_DATE - INTERVAL '7 days'
            WHERE h.user_id = $1
        `, [userId]);
        
        const weeklyStats = weeklyResult.rows[0];

        // Find most productive day of the week
        const productiveDayResult = await db.query(`
            SELECT 
                EXTRACT(DOW FROM date) as day_num,
                TO_CHAR(date, 'Day') as day_name, 
                COUNT(*) as count
            FROM habit_logs hl
            JOIN habits h ON hl.habit_id = h.id
            WHERE h.user_id = $1 AND hl.status = 'done'
            GROUP BY day_num, day_name
            ORDER BY count DESC
            LIMIT 1
        `, [userId]);
        
        const mostProductiveDay = productiveDayResult.rows.length > 0 ? 
            productiveDayResult.rows[0].day_name.trim() : 'N/A';

        // Get completion data for the last 30 days
        const chartDataResult = await db.query(`
            SELECT 
                date_series.date,
                COUNT(hl.id) FILTER (WHERE hl.status = 'done') as completions
            FROM (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '29 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date as date
            ) date_series
            LEFT JOIN habit_logs hl ON date_series.date = hl.date
            LEFT JOIN habits h ON hl.habit_id = h.id AND h.user_id = $1
            GROUP BY date_series.date
            ORDER BY date_series.date
        `, [userId]);

        const chartData = chartDataResult.rows;

        // Get badges
        const badgesResult = await db.query(`
            SELECT badge_name, earned_at 
            FROM badges 
            WHERE user_id = $1 
            ORDER BY earned_at DESC
        `, [userId]);

        // Category breakdown
        const categoryResult = await db.query(`
            SELECT 
                h.category,
                COUNT(h.id) as habit_count,
                COUNT(hl.id) FILTER (WHERE hl.status = 'done') as completions
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id
            WHERE h.user_id = $1
            GROUP BY h.category
            ORDER BY completions DESC
        `, [userId]);

        const categoryStats = categoryResult.rows;

        res.render('pages/analytics', {
            title: 'Analytics',
            currentUser: req.session.user,
            user,
            habits,
            totalHabits,
            totalCompletions,
            longestStreak,
            longestStreakHabit,
            mostProductiveDay,
            todayStats: {
                completed: todayStats.completed_today,
                total: todayStats.total_today,
                completionRate
            },
            weeklyStats: {
                activeDays: weeklyStats.active_days,
                totalCompletions: weeklyStats.total_completions,
                habitsWorkedOn: weeklyStats.habits_worked_on
            },
            badges: badgesResult.rows,
            chartData,
            categoryStats
        });
    } catch (err) {
        console.error('Analytics error:', err);
        next(err);
    }
};

// API endpoint for chart data
exports.getChartData = async (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const userId = req.session.user.id;
        // Build a reliable per-user 30-day completion series using a safe LEFT JOIN
        const last30Days = await db.query(`
            SELECT 
                dd::date AS day,
                COUNT(hl.id) AS completions
            FROM generate_series(
                CURRENT_DATE - INTERVAL '29 day',
                CURRENT_DATE,
                '1 day'::interval
            ) AS dd
            LEFT JOIN (
                SELECT hl.id, hl.date
                FROM habit_logs hl
                JOIN habits h ON hl.habit_id = h.id
                WHERE h.user_id = $1 AND hl.status = 'done'
            ) hl ON dd::date = hl.date
            GROUP BY dd
            ORDER BY dd;
        `, [userId]);

        const labels = last30Days.rows.map(row => new Date(row.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const data = last30Days.rows.map(row => parseInt(row.completions, 10));

        res.json({ labels, data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};