const db = require('../models/db');
const redisClient = require('../config/redis');

// Calculates the current streak for a given habit (consecutive days from today)
const calculateStreak = async (habitId) => {
    try {
        // Check cache first
        const cacheKey = `streak:${habitId}`;
        const cachedStreak = await redisClient.get(cacheKey);
        
        if (cachedStreak !== null) {
            console.log(`Streak cache HIT for habit ${habitId}`);
            return parseInt(cachedStreak);
        }
        
        console.log(`Streak cache MISS for habit ${habitId}`);
        
        // Get all completed dates for this habit, ordered from most recent
        const result = await db.query(`
            SELECT date 
            FROM habit_logs 
            WHERE habit_id = $1 AND status = 'done'
            ORDER BY date DESC
        `, [habitId]);
        
        if (result.rows.length === 0) {
            await redisClient.setEx(cacheKey, 300, '0'); // Cache for 5 minutes
            return 0;
        }
        
        const completedDates = result.rows.map(row => new Date(row.date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if today or yesterday was completed (to allow for ongoing streaks)
        const mostRecent = new Date(completedDates[0]);
        mostRecent.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
        
        // If last completion was more than 1 day ago, streak is broken
        if (daysDiff > 1) {
            await redisClient.setEx(cacheKey, 300, '0');
            return 0;
        }
        
        // Count consecutive days backwards from most recent
        let streak = 1;
        let currentDate = new Date(mostRecent);
        
        for (let i = 1; i < completedDates.length; i++) {
            const prevDate = new Date(completedDates[i]);
            prevDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
            
            if (prevDate.getTime() === expectedDate.getTime()) {
                streak++;
                currentDate = prevDate;
            } else {
                break; // Streak broken
            }
        }
        
        // Cache the calculated streak for 5 minutes
        await redisClient.setEx(cacheKey, 300, streak.toString());
        
        return streak;
    } catch (error) {
        console.error('Error calculating habit streak:', error);
        return 0;
    }
};

// Calculates the current streak for a given challenge (consecutive days from today)
const calculateChallengeStreak = async (userChallengeId) => {
    try {
        // Check cache first
        const cacheKey = `challenge_streak:${userChallengeId}`;
        const cachedStreak = await redisClient.get(cacheKey);
        
        if (cachedStreak !== null) {
            console.log(`Challenge streak cache HIT for ${userChallengeId}`);
            return parseInt(cachedStreak);
        }
        
        console.log(`Challenge streak cache MISS for ${userChallengeId}`);
        
        // Get all completed dates for this challenge, ordered from most recent
        const result = await db.query(`
            SELECT date 
            FROM challenge_logs 
            WHERE user_challenge_id = $1 AND status = 'done'
            ORDER BY date DESC
        `, [userChallengeId]);
        
        if (result.rows.length === 0) {
            await redisClient.setEx(cacheKey, 300, '0');
            return 0;
        }
        
        const completedDates = result.rows.map(row => new Date(row.date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if today or yesterday was completed (to allow for ongoing streaks)
        const mostRecent = new Date(completedDates[0]);
        mostRecent.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
        
        // If last completion was more than 1 day ago, streak is broken
        if (daysDiff > 1) {
            await redisClient.setEx(cacheKey, 300, '0');
            return 0;
        }
        
        // Count consecutive days backwards from most recent
        let streak = 1;
        let currentDate = new Date(mostRecent);
        
        for (let i = 1; i < completedDates.length; i++) {
            const prevDate = new Date(completedDates[i]);
            prevDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
            
            if (prevDate.getTime() === expectedDate.getTime()) {
                streak++;
                currentDate = prevDate;
            } else {
                break; // Streak broken
            }
        }
        
        // Cache the calculated streak for 5 minutes
        await redisClient.setEx(cacheKey, 300, streak.toString());
        
        return streak;
    } catch (error) {
        console.error('Error calculating challenge streak:', error);
        return 0;
    }
};

// Awards badges and bonus XP if milestones are met
const awardBadges = async (userId, streak) => {
    const milestones = {
        3: { badge: '3-Day Streak', xp: 10 },
        7: { badge: '7-Day Streak', xp: 25 },
        14: { badge: '14-Day Streak', xp: 50 },
        30: { badge: '30-Day Streak', xp: 100 },
        60: { badge: '60-Day Streak', xp: 200 },
        90: { badge: '90-Day Streak', xp: 300 }
    };
    
    const milestone = milestones[streak];
    
    if (milestone) {
        // Check if user already has this badge
        const existingBadge = await db.query(
            'SELECT id FROM badges WHERE user_id = $1 AND badge_name = $2',
            [userId, milestone.badge]
        );
        
        if (existingBadge.rows.length === 0) {
            // Award the badge
            await db.query(
                'INSERT INTO badges (user_id, badge_name) VALUES ($1, $2)',
                [userId, milestone.badge]
            );
            
            // Award bonus XP
            await db.query(
                'UPDATE users SET xp = xp + $1 WHERE id = $2',
                [milestone.xp, userId]
            );
            
            console.log(`Awarded badge "${milestone.badge}" and ${milestone.xp} bonus XP to user ${userId}`);
            
            return { badge: milestone.badge, bonusXp: milestone.xp };
        }
    }
    
    return null;
};

// Calculate streak bonus XP multiplier
const getStreakMultiplier = (streak) => {
    if (streak >= 30) return 3.0;      // 3x XP for 30+ day streak
    if (streak >= 14) return 2.5;      // 2.5x XP for 14+ day streak
    if (streak >= 7) return 2.0;       // 2x XP for 7+ day streak
    if (streak >= 3) return 1.5;       // 1.5x XP for 3+ day streak
    return 1.0;                        // Normal XP
};

module.exports = { calculateStreak, calculateChallengeStreak, awardBadges, getStreakMultiplier };