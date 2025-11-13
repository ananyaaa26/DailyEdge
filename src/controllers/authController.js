const db = require('../models/db');
const bcrypt = require('bcrypt');

exports.getSignup = (req, res) => {
    res.render('pages/signup', { title: 'Sign Up', errors: [], formData: {} });
};

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
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser.rows.length > 0) {
            const existingField = existingUser.rows[0].email === email ? 'email' : 'username';
            errors.push(`A user with this ${existingField} already exists`);
            return res.render('pages/signup', { 
                title: 'Sign Up', 
                errors, 
                formData: { username, email } 
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Auto-login after successful registration
        const newUser = { 
            id: result.rows[0].id, 
            username: result.rows[0].username, 
            email: result.rows[0].email,
            xp: 0 
        };
        req.session.user = newUser;
        
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

exports.getLogin = (req, res) => {
    res.render('pages/login', { title: 'Login', errors: [], formData: {} });
};

exports.postLogin = async (req, res, next) => {
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
        return res.render('pages/login', { 
            title: 'Login', 
            errors, 
            formData: { email } 
        });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            errors.push('Invalid email or password');
            return res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }

        const user = result.rows[0];
        
        // Check if user is suspended
        if (user.is_suspended) {
            errors.push('Your account has been suspended. Please contact the administrator.');
            return res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }
        
        // Handle both hashed and plain text passwords for backward compatibility
        let passwordValid = false;
        
        if (user.password.startsWith('$2b$')) {
            // Hashed password
            passwordValid = await bcrypt.compare(password, user.password);
        } else {
            // Plain text password - upgrade to hash
            if (user.password === password) {
                passwordValid = true;
                // Upgrade to hashed password
                const hashedPassword = await bcrypt.hash(password, 12);
                await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
            }
        }

        if (passwordValid) {
            req.session.user = { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                xp: user.xp || 0
            };
            res.redirect('/dashboard');
        } else {
            errors.push('Invalid email or password');
            res.render('pages/login', { 
                title: 'Login', 
                errors, 
                formData: { email } 
            });
        }
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

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};