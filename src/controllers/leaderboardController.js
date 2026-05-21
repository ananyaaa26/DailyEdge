const db = require('../models/db');
const redisClient = require('../config/redis');
const { calculateStreak } = require('../utils/gamification');

// Calculate all user streaks efficiently
const calculateAllStreaks = async () => {
    try {
        // Get all active habits
        const habitsResult = await db.query(`
            SELECT id, user_id FROM habits WHERE status = 'in_progress'
        `);

        const userStreaks = {};

        // Calculate streaks for each habit
        for (const habit of habitsResult.rows) {
            const streak = await calculateStreak(habit.id);
            if (!userStreaks[habit.user_id]) {
                userStreaks[habit.user_id] = 0;
            }
            userStreaks[habit.user_id] += streak;
        }

        return userStreaks;
    } catch (error) {
        console.error('Error calculating all streaks:', error);
        return {};
    }
};

// Get streaks leaderboard with caching - ranked by XP
exports.getStreaksLeaderboard = async (req, res, next) => {
    try {
        const cacheKey = 'leaderboard:streaks:top50';
        const userId = req.session?.user?.id;
        
        // Check Redis cache first
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            const leaderboard = JSON.parse(cachedData);
            // Add currentUserId to each user entry if viewing
            if (userId) {
                leaderboard.forEach(user => {
                    user.isCurrentUser = user.id === userId;
                });
            }
            return res.json({
                success: true,
                leaderboard,
                fromCache: true,
                currentUserId: userId
            });
        }

        // Calculate streaks
        const userStreaks = await calculateAllStreaks();
        const userIds = Object.keys(userStreaks);

        if (userIds.length === 0) {
            await redisClient.setEx(cacheKey, 300, JSON.stringify([]));
            return res.json({
                success: true,
                leaderboard: [],
                fromCache: false,
                currentUserId: userId
            });
        }

        // Get user details - sorted by XP (not streaks)
        const usersResult = await db.query(`
            SELECT id, username, xp FROM users 
            WHERE id = ANY($1) AND is_suspended = FALSE
            ORDER BY xp DESC
        `, [userIds.map(Number)]);

        // Build leaderboard with streaks, sorted by XP
        const leaderboard = usersResult.rows
            .slice(0, 50)
            .map((user, index) => ({
                id: user.id,
                username: user.username,
                xp: user.xp,
                total_streak: userStreaks[user.id] || 0,
                rank: index + 1,
                isCurrentUser: user.id === userId
            }));

        // Cache for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(leaderboard));

        res.json({
            success: true,
            leaderboard,
            fromCache: false,
            currentUserId: userId
        });
    } catch (error) {
        console.error('Error fetching streaks leaderboard:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
};

// Get user's XP rank (not streak)
exports.getUserStreakRank = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const userId = req.session.user.id;

        // Get current user's XP
        const userResult = await db.query('SELECT xp FROM users WHERE id = $1', [userId]);
        const userXP = userResult.rows[0]?.xp || 0;

        // Count users with higher XP
        const rankResult = await db.query(`
            SELECT COUNT(*) as rank_count 
            FROM users 
            WHERE xp > $1 AND is_suspended = FALSE
        `, [userXP]);

        const rank = (rankResult.rows[0]?.rank_count || 0) + 1;

        // Calculate streaks for display
        const userStreaks = await calculateAllStreaks();
        const userStreak = userStreaks[userId] || 0;

        res.json({
            success: true,
            rank,
            total_xp: userXP,
            total_streak: userStreak,
            userId
        });
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch rank' });
    }
};

// Invalidate cache when habits are completed
exports.invalidateLeaderboardCache = async () => {
    try {
        await redisClient.del('leaderboard:streaks:top50');
        console.log('Leaderboard cache invalidated');
    } catch (error) {
        console.error('Error invalidating leaderboard cache:', error);
    }
};

// Render leaderboard page
exports.getLeaderboardPage = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user.id;

        // Get user's XP
        const userResult = await db.query('SELECT xp FROM users WHERE id = $1', [userId]);
        const userXP = userResult.rows[0]?.xp || 0;

        // Get user's XP-based rank
        const rankResult = await db.query(`
            SELECT COUNT(*) as rank_count 
            FROM users 
            WHERE xp > $1 AND is_suspended = FALSE
        `, [userXP]);
        
        const userRank = (rankResult.rows[0]?.rank_count || 0) + 1;

        // Get user's streaks for display
        const userStreaks = await calculateAllStreaks();
        const userStreak = userStreaks[userId] || 0;

        res.render('pages/leaderboard-page', {
            title: 'Leaderboards',
            currentUser: req.session.user,
            userXP,
            userStreak,
            userRank
        });
    } catch (error) {
        console.error('Error rendering leaderboard page:', error);
        next(error);
    }
};
