require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const http = require('http');
const { Server } = require('socket.io');

// Redis connection
const redisClient = require('./config/redis');

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const challengesRoutes = require('./routes/challenges');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// Session Configuration
// ================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, '../node_modules/chart.js/dist')));

// Make session available in templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    next();
});

// Global suspension check middleware
const { checkSuspended } = require('./middleware/auth');
app.use(checkSuspended);

// Routes
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/habits', habitRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/challenges', challengesRoutes);
app.use('/', adminRoutes);

// Cron Job
cron.schedule('0 9 * * *', () => {
    console.log('---------------------');
    console.log("DailyEdge Reminder: Don't forget to complete your habits today!");
    console.log('---------------------');
});

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/500', { title: 'Server Error' });
});

// ================================
// WebSocket Setup
// ================================
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room: user_${userId}`);
    });

    socket.on('habit_completed', (data) => {
        io.to(`user_${data.userId}`).emit('habit_update', data);
    });

    socket.on('challenge_completed', (data) => {
        io.to(`user_${data.userId}`).emit('challenge_update', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
