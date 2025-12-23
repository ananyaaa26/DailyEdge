const db = require('./src/models/db');

(async () => {
    try {
        // Find user ananya
        const user = await db.query(
            "SELECT id, username FROM users WHERE username ILIKE $1",
            ['ananya']
        );
        
        if (user.rows.length === 0) {
            console.log('❌ User ananya not found');
            process.exit(1);
        }
        
        const userId = user.rows[0].id;
        console.log('✓ Found user:', user.rows[0].username, '(ID:', userId + ')');
        
        // Find the water habit
        const habit = await db.query(
            "SELECT id, name, status FROM habits WHERE user_id = $1 AND name ILIKE $2",
            [userId, '%drink%8%glasses%']
        );
        
        if (habit.rows.length === 0) {
            console.log('❌ Habit not found. Listing all habits...\n');
            const allHabits = await db.query(
                'SELECT id, name, status FROM habits WHERE user_id = $1',
                [userId]
            );
            console.log('All habits for user:');
            allHabits.rows.forEach(h => {
                console.log(`  ID: ${h.id} | Name: ${h.name} | Status: ${h.status}`);
            });
            process.exit(1);
        }
        
        console.log('✓ Found habit:', habit.rows[0].name);
        console.log('  Current status:', habit.rows[0].status);
        
        // Mark as failed
        await db.query(
            "UPDATE habits SET status = 'failed', end_date = CURRENT_DATE WHERE id = $1",
            [habit.rows[0].id]
        );
        
        console.log('\n✅ Successfully moved habit to Failed Habits section!');
        console.log('   Refresh the dashboard to see it in the non-completed section.\n');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
