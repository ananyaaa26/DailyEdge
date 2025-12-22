const db = require('../models/db');
const bcrypt = require('bcrypt');

// ======================
// GET SIGNUP
// ======================
exports.getSignup = (req, res) => {
    res.render('pages/signup', { title: 'Sign Up', errors: [], formData: {} });
};

// ======================
// POST SIGNUP
// ======================
exports.postSignup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    // Validation
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    if (!email || !email.includes('@')) {
        errors.push('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.render('pages/signup', { 
            title: 'Sign Up', 
            errors, 
            formData: { username, email } 
        });
    }

    try {
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            const existingField =
                existingUser.rows[0].email === email ? 'email' : 'username';
            errors.push(`A user with this ${existingField} already exists`);

            return res.render('pages/signup', { 
                title: 'Sign Up', 
                errors, 
                formData: { username, email } 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Auto-login
        req.session.user = { 
            id: result.rows[0].id, 
            username: result.rows[0].username, 
            email: result.rows[0].email,
            xp: 0 
        };

        res.redirect('/dashboard?welcome=true');
    } catch (err) {
        console.error('Signup error:', err);
        errors.push('An error occurred during registration. Please try again.');

        res.render('pages/signup', { 
            title: 'Sign Up', 
            errors, 
            formData: { username, email } 
        });
    }
};

// ======================
// GET LOGIN
// ======================
exports.getLogin = (req, res) => {
    res.render('pages/login', { title: 'Login', errors: [], formData: {} });
};

// ======================
// POST LOGIN
// ======================
exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');

    if (errors.length > 0) {
        return res.render('pages/login', { 
            title: 'Login', 
            errors, 
            formData: { email } 
        });
    }

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            errors.push('Invalid email or password');
            return res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }

        const user = result.rows[0];

        // Check suspension
        if (user.is_suspended) {
            errors.push('Your account has been suspended. Please contact the administrator.');
            return res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }

        let passwordValid = false;

        // Hashed password
        if (user.password.startsWith('$2b$')) {
            passwordValid = await bcrypt.compare(password, user.password);
        } else {
            // Plain text password (legacy)
            if (user.password === password) {
                passwordValid = true;
                const hashedPassword = await bcrypt.hash(password, 12);
                await db.query(
                    'UPDATE users SET password = $1 WHERE id = $2',
                    [hashedPassword, user.id]
                );
            }
        }

        if (!passwordValid) {
            errors.push('Invalid email or password');
            return res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }

        req.session.user = { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            xp: user.xp || 0
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login error:', err);
        errors.push('An error occurred during login. Please try again.');

        res.render('pages/login', { 
            title: 'Login', 
            errors, 
            formData: { email } 
        });
    }
};

// ======================
// LOGOUT
// ======================
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
