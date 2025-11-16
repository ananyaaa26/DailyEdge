const db = require('../models/db');
const { calculateStreak, calculateChallengeStreak } = require('../utils/gamification');
const redisClient = require('../config/redis');

exports.getAnalytics = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    
    try {
        const userId = req.session.user.id;
        const cacheKey = `analytics:${userId}`;
        
        // Try cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log(`Analytics cache HIT for user ${userId}`);
            const analyticsData = JSON.parse(cached);
            return res.render('pages/analytics', {
                title: 'Analytics',
                ...analyticsData,
                currentUser: req.session.user
            });
        }
        
        console.log(`Analytics cache MISS for user ${userId}`);

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
            habit.type = 'habit';
            if (streak > longestStreak) {
                longestStreak = streak;
                longestStreakHabit = habit.name;
            }
        }

        // Get all active challenges with their completion stats
        const challengesResult = await db.query(`
            SELECT c.id, c.title as name, c.duration_days, uc.start_date, uc.id as user_challenge_id,
                   COUNT(cl.id) FILTER (WHERE cl.status = 'done') as total_completions,
                   COUNT(DISTINCT cl.date) FILTER (WHERE cl.status = 'done') as active_days
            FROM challenges c
            JOIN user_challenges uc ON c.id = uc.challenge_id
            LEFT JOIN challenge_logs cl ON cl.user_challenge_id = uc.id
            WHERE uc.user_id = $1 AND uc.status = 'in_progress'
            GROUP BY c.id, c.title, c.duration_days, uc.start_date, uc.id
            ORDER BY total_completions DESC
        `, [userId]);

        const challenges = challengesResult.rows;
        
        // Calculate streaks for each challenge and set category
        for (const challenge of challenges) {
            const streak = await calculateChallengeStreak(challenge.user_challenge_id);
            challenge.streak = streak;
            challenge.type = 'challenge';
            
            // Set category based on challenge name
            if (challenge.name.toLowerCase().includes('fitness') || challenge.name.toLowerCase().includes('workout')) {
                challenge.category = 'Health';
            } else if (challenge.name.toLowerCase().includes('study') || challenge.name.toLowerCase().includes('read')) {
                challenge.category = 'Study';
            } else if (challenge.name.toLowerCase().includes('meditation') || challenge.name.toLowerCase().includes('mindfulness')) {
                challenge.category = 'Mindfulness';
            } else {
                challenge.category = 'Challenge';
            }
            
            challenge.created_at = challenge.start_date;
            
            if (streak > longestStreak) {
                longestStreak = streak;
                longestStreakHabit = challenge.name;
            }
        }

        // Combine habits and challenges
        const allItems = [...habits, ...challenges];

        // Overall statistics
        const totalHabits = habits.length;
        const totalChallenges = challenges.length;
        const totalCompletions = allItems.reduce((sum, item) => sum + parseInt(item.total_completions), 0);
        
        // Today's statistics (including both habits and challenges)
        const today = new Date().toISOString().split('T')[0];
        const todayResult = await db.query(`
            SELECT 
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT CASE WHEN hl.status = 'done' THEN h.id END) as completed_habits,
                COUNT(DISTINCT uc.id) as total_challenges,
                COUNT(DISTINCT CASE WHEN cl.status = 'done' THEN uc.id END) as completed_challenges
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = $1
            LEFT JOIN user_challenges uc ON uc.user_id = $2 AND uc.status = 'in_progress'
            LEFT JOIN challenge_logs cl ON cl.user_challenge_id = uc.id AND cl.date = $1
            WHERE h.user_id = $2
        `, [today, userId]);
        
        const todayData = todayResult.rows[0];
        const totalToday = parseInt(todayData.total_habits) + parseInt(todayData.total_challenges);
        const completedToday = parseInt(todayData.completed_habits) + parseInt(todayData.completed_challenges);
        const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
        
        const todayStats = {
            completed_today: completedToday,
            total_today: totalToday
        };

        // Weekly statistics (including both habits and challenges)
        const weeklyResult = await db.query(`
            SELECT 
                COUNT(DISTINCT hl.date) + COUNT(DISTINCT cl.date) as active_days,
                COALESCE(COUNT(DISTINCT hl.id) FILTER (WHERE hl.status = 'done'), 0) + 
                COALESCE(COUNT(DISTINCT cl.id) FILTER (WHERE cl.status = 'done'), 0) as total_completions,
                COUNT(DISTINCT h.id) + COUNT(DISTINCT uc.id) as items_worked_on
            FROM habits h
            LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
                AND hl.date >= CURRENT_DATE - INTERVAL '7 days'
            LEFT JOIN user_challenges uc ON uc.user_id = $1 AND uc.status = 'in_progress'
            LEFT JOIN challenge_logs cl ON cl.user_challenge_id = uc.id 
                AND cl.date >= CURRENT_DATE - INTERVAL '7 days'
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

        // Get completion data for the last 30 days (including both habits and challenges)
        const chartDataResult = await db.query(`
            SELECT 
                date_series.date,
                COALESCE(COUNT(DISTINCT hl.id) FILTER (WHERE hl.status = 'done'), 0) + 
                COALESCE(COUNT(DISTINCT cl.id) FILTER (WHERE cl.status = 'done'), 0) as completions
            FROM (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '29 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date as date
            ) date_series
            LEFT JOIN habit_logs hl ON date_series.date = hl.date 
                AND hl.habit_id IN (SELECT id FROM habits WHERE user_id = $1)
            LEFT JOIN challenge_logs cl ON date_series.date = cl.date 
                AND cl.user_challenge_id IN (SELECT id FROM user_challenges WHERE user_id = $1)
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

        // Prepare data for caching
        const analyticsData = {
            user,
            habits: allItems,
            totalHabits,
            totalChallenges,
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
                items_worked_on: weeklyStats.items_worked_on
            },
            badges: badgesResult.rows,
            chartData,
            categoryStats
        };
        
        // Cache for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(analyticsData));

        res.render('pages/analytics', {
            title: 'Analytics',
            ...analyticsData,
            currentUser: req.session.user
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
        const cacheKey = `chartdata:${userId}`;
        
        // Try cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log(`Chart data cache HIT for user ${userId}`);
            return res.json(JSON.parse(cached));
        }
        
        console.log(`Chart data cache MISS for user ${userId}`);
        
        // Build a reliable per-user 30-day completion series including both habits and challenges
        const last30Days = await db.query(`
            SELECT 
                dd::date AS day,
                COALESCE(COUNT(DISTINCT hl.id), 0) + COALESCE(COUNT(DISTINCT cl.id), 0) AS completions
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
            LEFT JOIN (
                SELECT cl.id, cl.date
                FROM challenge_logs cl
                JOIN user_challenges uc ON cl.user_challenge_id = uc.id
                WHERE uc.user_id = $1 AND cl.status = 'done'
            ) cl ON dd::date = cl.date
            GROUP BY dd
            ORDER BY dd;
        `, [userId]);

        const labels = last30Days.rows.map(row => new Date(row.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const data = last30Days.rows.map(row => parseInt(row.completions, 10));

        // Get category breakdown data
        const categoryResult = await db.query(`
            SELECT category, COUNT(*) as count
            FROM habits
            WHERE user_id = $1
            GROUP BY category
            ORDER BY count DESC
        `, [userId]);

        const categoryLabels = categoryResult.rows.map(row => row.category);
        const categoryCounts = categoryResult.rows.map(row => parseInt(row.count, 10));

        const chartData = { 
            labels, 
            data,
            categoryLabels,
            categoryCounts
        };
        
        // Cache for 2 minutes
        await redisClient.setEx(cacheKey, 120, JSON.stringify(chartData));
        
        res.json(chartData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};