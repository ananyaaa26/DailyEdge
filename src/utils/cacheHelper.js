const redisClient = require('../config/redis');

/**
 * Invalidate all user-related caches
 */
async function invalidateUserCache(userId) {
    const keys = [
        `dashboard:${userId}`,
        `analytics:${userId}`,
        `stats:${userId}`,
        `chartdata:${userId}`,
        `user:${userId}:xp`
    ];
    
    try {
        await Promise.all(keys.map(key => redisClient.del(key)));
        console.log(`Cache invalidated for user ${userId}`);
    } catch (err) {
        console.error('Error invalidating user cache:', err);
    }
}

/**
 * Invalidate habit-specific caches
 */
async function invalidateHabitCache(habitId, userId) {
    try {
        await redisClient.del(`streak:${habitId}`);
        await invalidateUserCache(userId);
        console.log(`Cache invalidated for habit ${habitId}`);
    } catch (err) {
        console.error('Error invalidating habit cache:', err);
    }
}

/**
 * Invalidate challenge-specific caches
 */
async function invalidateChallengeCache(userId) {
    try {
        await invalidateUserCache(userId);
        console.log(`Cache invalidated for challenge (user ${userId})`);
    } catch (err) {
        console.error('Error invalidating challenge cache:', err);
    }
}

/**
 * Get cached data or fetch from database
 */
async function getCachedOrFetch(cacheKey, fetchFunction, ttl = 120) {
    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT: ${cacheKey}`);
            return JSON.parse(cached);
        }
        
        console.log(`Cache MISS: ${cacheKey}`);
        const data = await fetchFunction();
        
        if (data) {
            await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
        }
        
        return data;
    } catch (err) {
        console.error('Cache error:', err);
        // Fallback to fetching data if Redis fails
        return await fetchFunction();
    }
}

module.exports = {
    invalidateUserCache,
    invalidateHabitCache,
    invalidateChallengeCache,
    getCachedOrFetch
};
