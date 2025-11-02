const db = require('../models/db');
const { calculateStreak, awardBadges } = require('../utils/gamification');

exports.getAddHabit = (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('pages/add-habit', { title: 'Add New Habit', habit: null });
};

exports.postAddHabit = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    const { name, category, frequency } = req.body;
    try {
        await db.query(
            'INSERT INTO habits (user_id, name, category, frequency) VALUES ($1, $2, $3, $4)',
            [req.session.user.id, name, category, frequency]
        );
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.getEditHabit = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM habits WHERE id = $1 AND user_id = $2', [id, req.session.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Habit not found');
        }
        res.render('pages/add-habit', { title: 'Edit Habit', habit: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.postUpdateHabit = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    const { id } = req.params;
    const { name, category, frequency } = req.body;
    try {
        await db.query(
            'UPDATE habits SET name = $1, category = $2, frequency = $3 WHERE id = $4 AND user_id = $5',
            [name, category, frequency, id, req.session.user.id]
        );
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.postDeleteHabit = async (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    const { id } = req.params;
    try {
        await db.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [id, req.session.user.id]);
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.toggleHabitStatus = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const userId = req.session.user.id;

    try {
        // Verify the habit belongs to the user
        const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
        if (habitCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Check if log for today exists
        const existingLog = await db.query(
            'SELECT id, status FROM habit_logs WHERE habit_id = $1 AND date = $2',
            [id, today]
        );

        let newStatus = 'done';
        let wasCompleted = false;

        if (existingLog.rows.length > 0) {
            // Toggle existing log
            const currentStatus = existingLog.rows[0].status;
            newStatus = currentStatus === 'done' ? 'not done' : 'done';
            wasCompleted = currentStatus === 'done';
            
            await db.query('UPDATE habit_logs SET status = $1 WHERE id = $2', [newStatus, existingLog.rows[0].id]);
        } else {
            // Insert new log as completed
            await db.query('INSERT INTO habit_logs (habit_id, date, status) VALUES ($1, $2, $3)', [id, today, newStatus]);
        }

        // Award or remove XP based on completion status
        if (newStatus === 'done' && !wasCompleted) {
            // Completed - award XP
            await db.query('UPDATE users SET xp = xp + 10 WHERE id = $1', [userId]);
            
            // Check for streak and award badges
            try {
                const streak = await calculateStreak(id);
                await awardBadges(userId, streak);
            } catch (streakErr) {
                console.error('Error calculating streak:', streakErr);
            }
        } else if (newStatus === 'not done' && wasCompleted) {
            // Uncompleted - remove XP (but don't go below 0)
            await db.query('UPDATE users SET xp = GREATEST(xp - 10, 0) WHERE id = $1', [userId]);
        }

        res.json({ 
            success: true, 
            status: newStatus,
            completed: newStatus === 'done'
        });
    } catch (err) {
        console.error('Toggle habit error:', err);
        res.status(500).json({ error: 'An error occurred while updating the habit' });
    }
};