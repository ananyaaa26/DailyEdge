const db = require('../models/db');
const bcrypt = require('bcrypt');

// Middleware to check if user is admin
exports.requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};

// Get admin login page
exports.getAdminLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('pages/admin-login', { title: 'Admin Login', errors: [], formData: {} });
};

// Handle admin login
exports.postAdminLogin = async (req, res) => {
    const { email, password } = req.body;
    const errors = [];

    // Validation
    if (!email) {
        errors.push('Email is required');
    }
    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.render('pages/admin-login', { 
            title: 'Admin Login', 
            errors, 
            formData: { email } 
        });
    }

    try {
        // Fetch admin from database
        const result = await db.query('SELECT * FROM admin WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            errors.push('Invalid admin credentials');
            return res.render('pages/admin-login', { 
                title: 'Admin Login', 
                errors, 
                formData: { email } 
            });
        }

        const admin = result.rows[0];
        
        // Verify password
        const passwordValid = await bcrypt.compare(password, admin.password);

        if (passwordValid) {
            // Log admin activity
            await db.query(
                'INSERT INTO admin_activity_log (admin_id, action, details) VALUES ($1, $2, $3)',
                [admin.id, 'login', 'Admin logged in']
            );

            req.session.admin = { 
                id: admin.id, 
                username: admin.username, 
                email: admin.email
            };
            res.redirect('/admin/dashboard');
        } else {
            errors.push('Invalid admin credentials');
            res.render('pages/admin-login', { 
                title: 'Admin Login', 
                errors, 
                formData: { email } 
            });
        }
    } catch (err) {
        console.error('Admin login error:', err);
        errors.push('An error occurred during login. Please try again.');
        res.render('pages/admin-login', { 
            title: 'Admin Login', 
            errors, 
            formData: { email } 
        });
    }
};

// Handle admin logout
exports.adminLogout = async (req, res) => {
    if (req.session.admin) {
        const adminId = req.session.admin.id;
        
        try {
            // Log admin activity
            await db.query(
                'INSERT INTO admin_activity_log (admin_id, action, details) VALUES ($1, $2, $3)',
                [adminId, 'logout', 'Admin logged out']
            );
        } catch (err) {
            console.error('Error logging admin activity:', err);
        }
    }

    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
};
