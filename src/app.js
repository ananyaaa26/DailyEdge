require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const challengesRoutes = require('./routes/challenges');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
// Serve Chart.js from node_modules
app.use('/scripts', express.static(path.join(__dirname, '../node_modules/chart.js/dist')));


// Middleware to make session available in all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    next();
});

// Routes
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/habits', habitRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/challenges', challengesRoutes);

// Cron Job for Reminders (logs to console)
// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
  console.log('---------------------');
  console.log('🚀 DailyEdge Reminder: Don\'t forget to complete your habits today!');
  console.log('---------------------');
});


// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Global Error Handler (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/500', { title: 'Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

/*
How the files work together (execution order at runtime)

node src/app.js starts Express.

Middleware (session, body-parser, static files) loads.

Routes (src/routes/*.js) register.

When a request comes in (say /habits/add):

Express matches the route → calls controller (habitController.addHabit).

Controller queries DB via db.query() (src/models/db.js).

Controller passes results to EJS view (src/views/pages/*.ejs).

EJS template renders HTML using CSS/JS from src/public/.

Response sent to browser.

Extras: cron jobs (in app.js), CLI (src/cli.js), seeding scripts (insert_challenges.js) run outside the main flow.
*/
