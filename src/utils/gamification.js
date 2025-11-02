const db = require('../models/db');

// Calculates the current streak for a given habit
const calculateStreak = async (habitId) => {
    const result = await db.query(`
        WITH DateSeries AS (
            SELECT 
                DISTINCT date,
                date - (ROW_NUMBER() OVER (ORDER BY date) * INTERVAL '1 day') as group_date
            FROM habit_logs
            WHERE habit_id = $1 AND status = 'done'
        ),
        Streaks AS (
            SELECT
                group_date,
                COUNT(*) as streak_length
            FROM DateSeries
            GROUP BY group_date
        )
        SELECT streak_length FROM Streaks ORDER BY streak_length DESC LIMIT 1;
    `, [habitId]);
    
    return result.rows.length > 0 ? parseInt(result.rows[0].streak_length, 10) : 0;
};

// Awards badges if milestones are met
const awardBadges = async (userId, streak) => {
    const milestones = {
        7: '7-Day Streak',
        30: '30-Day Streak'
    };
    
    const badgeName = milestones[streak];
    
    if (badgeName) {
        // Check if user already has this badge
        const existingBadge = await db.query(
            'SELECT id FROM badges WHERE user_id = $1 AND badge_name = $2',
            [userId, badgeName]
        );
        
        if (existingBadge.rows.length === 0) {
            await db.query(
                'INSERT INTO badges (user_id, badge_name) VALUES ($1, $2)',
                [userId, badgeName]
            );
            console.log(`Awarded badge "${badgeName}" to user ${userId}`);
        }
    }
};

module.exports = { calculateStreak, awardBadges };