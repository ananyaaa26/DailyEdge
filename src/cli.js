require('dotenv').config();
const db = require('./models/db');

const completeHabit = async (habitName, userEmail) => {
    try {
        // Find the user by email
        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        if (userResult.rows.length === 0) {
            console.error('Error: User not found.');
            return;
        }
        const userId = userResult.rows[0].id;

        // Find the habit by name for that user
        const habitResult = await db.query(
            'SELECT id FROM habits WHERE name = $1 AND user_id = $2',
            [habitName, userId]
        );
        if (habitResult.rows.length === 0) {
            console.error('Error: Habit not found for this user.');
            return;
        }
        const habitId = habitResult.rows[0].id;

        // Log the habit as 'done' for today
        const today = new Date().toISOString().split('T')[0];
        await db.query(
            "INSERT INTO habit_logs (habit_id, date, status) VALUES ($1, $2, 'done') ON CONFLICT (habit_id, date) DO UPDATE SET status = 'done'",
            [habitId, today]
        );

        console.log(`✅ Successfully completed habit "${habitName}" for today.`);

    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        // Since db.query uses a pool, we don't need to explicitly end it
        // for a single script run. The process will exit automatically.
    }
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 3 || args[0] !== 'complete') {
    console.log('Usage: node src/cli.js complete "<Habit Name>" <user_email@example.com>');
    process.exit(1);
}

const habitName = args[1];
const userEmail = args[2];
completeHabit(habitName, userEmail);