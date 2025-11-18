const db = require('../models/db');
const { calculateStreak, calculateChallengeStreak } = require('./gamification');

/**
 * Checks and updates habit completion status based on duration and consecutive completion
 * @param {number} habitId - The habit ID to check
 * @returns {Promise<object>} Status update result
 */
async function checkHabitCompletion(habitId) {
    try {
        // Get habit details
        const habitResult = await db.query(
            'SELECT id, user_id, duration_days, created_at, status FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            return { updated: false, reason: 'Habit not found' };
        }

        const habit = habitResult.rows[0];

        // Skip if already completed or failed
        if (habit.status !== 'in_progress') {
            return { updated: false, reason: 'Already finalized', status: habit.status };
        }
        //date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(habit.created_at);
        startDate.setHours(0, 0, 0, 0);
        const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const currentStreak = await calculateStreak(habitId);

        // Check if user has completed all required consecutive days
        if (currentStreak >= habit.duration_days) {
            // SUCCESS: Completed all days consecutively
            await db.query(
                'UPDATE habits SET status = $1, completed_at = NOW() WHERE id = $2',
                ['completed', habitId]
            );
            
            return {
                updated: true,
                status: 'completed',
                streak: currentStreak,
                required: habit.duration_days
            };
        }

        // Check if duration period has passed without completing
        if (daysSinceStart >= habit.duration_days) {
            // FAILED: Duration passed but didn't maintain streak
            await db.query(
                'UPDATE habits SET status = $1, end_date = CURRENT_DATE WHERE id = $2',
                ['failed', habitId]
            );
            
            return {
                updated: true,
                status: 'failed',
                streak: currentStreak,
                required: habit.duration_days
            };
        }

        // Still in progress
        return {
            updated: false,
            reason: 'Still in progress',
            daysRemaining: habit.duration_days - daysSinceStart,
            currentStreak: currentStreak
        };

    } catch (error) {
        console.error('Error checking habit completion:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * Checks and updates challenge completion status
 * @param {number} userChallengeId - The user_challenge ID to check
 * @returns {Promise<object>} Status update result
 */
async function checkChallengeCompletion(userChallengeId) {
    try {
        // Get challenge details
        const challengeResult = await db.query(`
            SELECT uc.id, uc.user_id, uc.challenge_id, uc.start_date, uc.status,
                   c.duration_days, c.xp_reward, c.title
            FROM user_challenges uc
            JOIN challenges c ON uc.challenge_id = c.id
            WHERE uc.id = $1
        `, [userChallengeId]);

        if (challengeResult.rows.length === 0) {
            return { updated: false, reason: 'Challenge not found' };
        }

        const challenge = challengeResult.rows[0];

        // Skip if already completed or failed
        if (challenge.status !== 'in_progress') {
            return { updated: false, reason: 'Already finalized', status: challenge.status };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(challenge.start_date);
        startDate.setHours(0, 0, 0, 0);
        const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const currentStreak = await calculateChallengeStreak(userChallengeId);

        // Check if user has completed all required consecutive days
        if (currentStreak >= challenge.duration_days) {
            // SUCCESS: Completed all days - award XP and badge
            await db.query(
                'UPDATE user_challenges SET status = $1, completed_at = NOW() WHERE id = $2',
                ['completed', userChallengeId]
            );

            // Award XP
            await db.query(
                'UPDATE users SET xp = xp + $1 WHERE id = $2',
                [challenge.xp_reward, challenge.user_id]
            );

            // Award completion badge
            const badgeName = `Challenge Champion: ${challenge.title}`;
            const existingBadge = await db.query(
                'SELECT id FROM badges WHERE user_id = $1 AND badge_name = $2',
                [challenge.user_id, badgeName]
            );

            if (existingBadge.rows.length === 0) {
                await db.query(
                    'INSERT INTO badges (user_id, badge_name) VALUES ($1, $2)',
                    [challenge.user_id, badgeName]
                );
            }
            
            return {
                updated: true,
                status: 'completed',
                streak: currentStreak,
                required: challenge.duration_days,
                xpAwarded: challenge.xp_reward
            };
        }

        // Check if duration period has passed without completing
        if (daysSinceStart >= challenge.duration_days) {
            // FAILED: Duration passed but didn't maintain streak
            await db.query(
                'UPDATE user_challenges SET status = $1, failed_at = NOW() WHERE id = $2',
                ['failed', userChallengeId]
            );
            
            return {
                updated: true,
                status: 'failed',
                streak: currentStreak,
                required: challenge.duration_days
            };
        }

        // Still in progress
        return {
            updated: false,
            reason: 'Still in progress',
            daysRemaining: challenge.duration_days - daysSinceStart,
            currentStreak: currentStreak
        };

    } catch (error) {
        console.error('Error checking challenge completion:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * Checks all active habits for a user and updates their status
 * @param {number} userId - The user ID
 */
async function checkAllUserHabits(userId) {
    try {
        const habitsResult = await db.query(
            'SELECT id FROM habits WHERE user_id = $1 AND status = $2',
            [userId, 'in_progress']
        );

        const results = [];
        for (const habit of habitsResult.rows) {
            const result = await checkHabitCompletion(habit.id);
            if (result.updated) {
                results.push({ habitId: habit.id, ...result });
            }
        }

        return results;
    } catch (error) {
        console.error('Error checking user habits:', error);
        return [];
    }
}

/**
 * Checks all active challenges for a user and updates their status
 * @param {number} userId - The user ID
 */
async function checkAllUserChallenges(userId) {
    try {
        const challengesResult = await db.query(
            'SELECT id FROM user_challenges WHERE user_id = $1 AND status = $2',
            [userId, 'in_progress']
        );

        const results = [];
        for (const challenge of challengesResult.rows) {
            const result = await checkChallengeCompletion(challenge.id);
            if (result.updated) {
                results.push({ userChallengeId: challenge.id, ...result });
            }
        }

        return results;
    } catch (error) {
        console.error('Error checking user challenges:', error);
        return [];
    }
}

module.exports = {
    checkHabitCompletion,
    checkChallengeCompletion,
    checkAllUserHabits,
    checkAllUserChallenges
};
