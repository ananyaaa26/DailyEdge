const db = require('../models/db');

// Get admin dashboard with overview statistics
exports.getDashboard = async (req, res, next) => {
    try {
        // Get total users count
        const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE is_suspended = false');
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // Get active users (users who logged in within last 7 days or have habits)
        const activeUsersResult = await db.query(`
            SELECT COUNT(DISTINCT user_id) as count 
            FROM habits 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
        const activeUsers = parseInt(activeUsersResult.rows[0].count);

        // Get suspended users count
        const suspendedUsersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE is_suspended = true');
        const suspendedUsers = parseInt(suspendedUsersResult.rows[0].count);

        // Get total challenges
        const totalChallengesResult = await db.query('SELECT COUNT(*) as count FROM challenges');
        const totalChallenges = parseInt(totalChallengesResult.rows[0].count);

        // Get admin-created challenges
        const adminChallengesResult = await db.query('SELECT COUNT(*) as count FROM challenges WHERE is_admin_created = true');
        const adminChallenges = parseInt(adminChallengesResult.rows[0].count);

        // Get recent activity
        const recentActivity = await db.query(`
            SELECT action, target_type, target_id, details, created_at 
            FROM admin_activity_log 
            WHERE admin_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `, [req.session.admin.id]);

        // Get top users by XP
        const topUsers = await db.query(`
            SELECT id, username, email, xp 
            FROM users 
            WHERE is_suspended = false
            ORDER BY xp DESC 
            LIMIT 5
        `);

        res.render('pages/admin-dashboard', {
            title: 'Admin Dashboard',
            currentAdmin: req.session.admin,
            stats: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalChallenges,
                adminChallenges
            },
            recentActivity: recentActivity.rows,
            topUsers: topUsers.rows
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        next(err);
    }
};

// Get all users with search and filter
exports.getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const status = req.query.status || 'all';

        let query = `
            SELECT u.id, u.username, u.email, u.xp, u.created_at, u.is_suspended, u.suspended_reason,
                   COUNT(DISTINCT h.id) as habit_count,
                   COUNT(DISTINCT uc.id) as challenge_count,
                   COUNT(DISTINCT b.id) as badge_count
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN user_challenges uc ON u.id = uc.user_id
            LEFT JOIN badges b ON u.id = b.user_id
            WHERE (u.username ILIKE $1 OR u.email ILIKE $1)
        `;

        const params = [`%${search}%`];

        if (status === 'active') {
            query += ' AND u.is_suspended = false';
        } else if (status === 'suspended') {
            query += ' AND u.is_suspended = true';
        }

        query += ' GROUP BY u.id ORDER BY u.created_at DESC';

        const result = await db.query(query, params);

        res.render('pages/admin-users', {
            title: 'User Management',
            currentAdmin: req.session.admin,
            users: result.rows,
            search,
            status
        });
    } catch (err) {
        console.error('Admin users page error:', err);
        next(err);
    }
};

// Get individual user profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Get user details
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = userResult.rows[0];

        // Get user habits
        const habitsResult = await db.query(`
            SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC
        `, [userId]);

        // Get user challenges
        const challengesResult = await db.query(`
            SELECT c.*, uc.status, uc.start_date
            FROM challenges c
            JOIN user_challenges uc ON c.id = uc.challenge_id
            WHERE uc.user_id = $1
            ORDER BY uc.start_date DESC
        `, [userId]);

        // Get user badges
        const badgesResult = await db.query(`
            SELECT * FROM badges WHERE user_id = $1 ORDER BY earned_at DESC
        `, [userId]);

        res.render('pages/admin-user-profile', {
            title: `User Profile - ${user.username}`,
            currentAdmin: req.session.admin,
            user,
            habits: habitsResult.rows,
            challenges: challengesResult.rows,
            badges: badgesResult.rows
        });
    } catch (err) {
        console.error('Admin user profile error:', err);
        next(err);
    }
};

// Suspend user account
exports.suspendUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { reason } = req.body;

        await db.query(`
            UPDATE users 
            SET is_suspended = true, suspended_at = NOW(), suspended_reason = $1 
            WHERE id = $2
        `, [reason || 'No reason provided', userId]);

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'suspend_user', 'user', userId, reason || 'No reason provided']
        );

        res.json({ success: true, message: 'User suspended successfully' });
    } catch (err) {
        console.error('Suspend user error:', err);
        res.status(500).json({ error: 'An error occurred while suspending the user' });
    }
};

// Unsuspend user account
exports.unsuspendUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        await db.query(`
            UPDATE users 
            SET is_suspended = false, suspended_at = NULL, suspended_reason = NULL 
            WHERE id = $1
        `, [userId]);

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'unsuspend_user', 'user', userId, 'User account reactivated']
        );

        res.json({ success: true, message: 'User unsuspended successfully' });
    } catch (err) {
        console.error('Unsuspend user error:', err);
        res.status(500).json({ error: 'An error occurred while unsuspending the user' });
    }
};

// Delete user account
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Delete user's related data first (due to foreign key constraints)
        await db.query('DELETE FROM habit_logs WHERE habit_id IN (SELECT id FROM habits WHERE user_id = $1)', [userId]);
        await db.query('DELETE FROM habits WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_challenges WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM badges WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'delete_user', 'user', userId, 'User account permanently deleted']
        );

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'An error occurred while deleting the user' });
    }
};

// Update user XP
exports.updateUserXP = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { xp } = req.body;

        if (xp === undefined || isNaN(xp)) {
            return res.status(400).json({ error: 'Invalid XP value' });
        }

        await db.query('UPDATE users SET xp = $1 WHERE id = $2', [parseInt(xp), userId]);

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'update_xp', 'user', userId, `Updated XP to ${xp}`]
        );

        res.json({ success: true, message: 'XP updated successfully' });
    } catch (err) {
        console.error('Update XP error:', err);
        res.status(500).json({ error: 'An error occurred while updating XP' });
    }
};

// Award badge to user
exports.awardBadge = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { badgeName } = req.body;

        await db.query(
            'INSERT INTO badges (user_id, badge_name) VALUES ($1, $2)',
            [userId, badgeName]
        );

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'award_badge', 'user', userId, `Awarded badge: ${badgeName}`]
        );

        res.json({ success: true, message: 'Badge awarded successfully' });
    } catch (err) {
        console.error('Award badge error:', err);
        res.status(500).json({ error: 'An error occurred while awarding the badge' });
    }
};

// Get all challenges (admin view)
exports.getChallenges = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT c.*, 
                   COUNT(DISTINCT uc.user_id) as participant_count,
                   COUNT(DISTINCT CASE WHEN uc.status = 'completed' THEN uc.user_id END) as completion_count
            FROM challenges c
            LEFT JOIN user_challenges uc ON c.id = uc.challenge_id
            GROUP BY c.id
            ORDER BY c.id DESC
        `);

        res.render('pages/admin-challenges', {
            title: 'Challenge Management',
            currentAdmin: req.session.admin,
            challenges: result.rows
        });
    } catch (err) {
        console.error('Admin challenges page error:', err);
        next(err);
    }
};

// Get create challenge page
exports.getCreateChallenge = (req, res) => {
    res.render('pages/admin-create-challenge', {
        title: 'Create Challenge',
        currentAdmin: req.session.admin,
        errors: [],
        formData: {}
    });
};

// Create new challenge
exports.createChallenge = async (req, res, next) => {
    try {
        const { name, description, duration_days, xp_reward } = req.body;
        const errors = [];

        // Validation
        if (!name || name.trim().length < 3) {
            errors.push('Challenge name must be at least 3 characters');
        }
        if (!description || description.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        if (!duration_days || duration_days < 1) {
            errors.push('Duration must be at least 1 day');
        }
        if (!xp_reward || xp_reward < 0) {
            errors.push('XP reward must be 0 or greater');
        }

        if (errors.length > 0) {
            return res.render('pages/admin-create-challenge', {
                title: 'Create Challenge',
                currentAdmin: req.session.admin,
                errors,
                formData: req.body
            });
        }

        const result = await db.query(
            `INSERT INTO challenges (title, description, duration_days, xp_reward, is_admin_created, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [name, description, duration_days, xp_reward, true, 'admin']
        );

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'create_challenge', 'challenge', result.rows[0].id, `Created challenge: ${name}`]
        );

        res.redirect('/admin/challenges?success=created');
    } catch (err) {
        console.error('Create challenge error:', err);
        res.render('pages/admin-create-challenge', {
            title: 'Create Challenge',
            currentAdmin: req.session.admin,
            errors: ['An error occurred while creating the challenge'],
            formData: req.body
        });
    }
};

// Get edit challenge page
exports.getEditChallenge = async (req, res, next) => {
    try {
        const challengeId = req.params.id;
        const result = await db.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Challenge not found');
        }

        res.render('pages/admin-edit-challenge', {
            title: 'Edit Challenge',
            currentAdmin: req.session.admin,
            challenge: result.rows[0],
            errors: []
        });
    } catch (err) {
        console.error('Get edit challenge error:', err);
        next(err);
    }
};

// Update challenge
exports.updateChallenge = async (req, res, next) => {
    try {
        const challengeId = req.params.id;
        const { name, description, duration_days, xp_reward } = req.body;
        const errors = [];

        // Validation
        if (!name || name.trim().length < 3) {
            errors.push('Challenge name must be at least 3 characters');
        }
        if (!description || description.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        if (!duration_days || duration_days < 1) {
            errors.push('Duration must be at least 1 day');
        }
        if (!xp_reward || xp_reward < 0) {
            errors.push('XP reward must be 0 or greater');
        }

        if (errors.length > 0) {
            const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
            return res.render('pages/admin-edit-challenge', {
                title: 'Edit Challenge',
                currentAdmin: req.session.admin,
                challenge: { ...challengeResult.rows[0], ...req.body },
                errors
            });
        }

        await db.query(
            'UPDATE challenges SET title = $1, description = $2, duration_days = $3, xp_reward = $4 WHERE id = $5',
            [name, description, duration_days, xp_reward, challengeId]
        );

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'update_challenge', 'challenge', challengeId, `Updated challenge: ${name}`]
        );

        res.redirect('/admin/challenges?success=updated');
    } catch (err) {
        console.error('Update challenge error:', err);
        next(err);
    }
};

// Delete challenge
exports.deleteChallenge = async (req, res, next) => {
    try {
        const challengeId = req.params.id;

        // Delete related user challenges first
        await db.query('DELETE FROM user_challenges WHERE challenge_id = $1', [challengeId]);
        await db.query('DELETE FROM challenges WHERE id = $1', [challengeId]);

        // Log activity
        await db.query(
            'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [req.session.admin.id, 'delete_challenge', 'challenge', challengeId, 'Challenge deleted']
        );

        res.json({ success: true, message: 'Challenge deleted successfully' });
    } catch (err) {
        console.error('Delete challenge error:', err);
        res.status(500).json({ error: 'An error occurred while deleting the challenge' });
    }
};
