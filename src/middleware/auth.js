const db = require('../models/db');

// Middleware to check if user is logged in
exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user account is suspended
exports.checkSuspended = async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    try {
        const result = await db.query(
            'SELECT is_suspended, suspended_reason FROM users WHERE id = $1',
            [req.session.user.id]
        );

        if (result.rows.length > 0 && result.rows[0].is_suspended) {
            // Destroy session
            const reason = result.rows[0].suspended_reason || 'No reason provided';
            req.session.destroy();
            
            // Render suspended page
            return res.render('pages/account-suspended', {
                title: 'Account Suspended',
                reason: reason
            });
        }

        next();
    } catch (err) {
        console.error('Check suspended error:', err);
        next(err);
    }
};
