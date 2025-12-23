const db = require('./src/models/db');

(async () => {
    try {
        // First, create the habit for ananya (user ID 1)
        const insertResult = await db.query(
            `INSERT INTO habits (user_id, name, category, duration_days, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE - INTERVAL '3 days') 
             RETURNING id, name`,
            [1, 'Drink 8 glasses of water', 'Health', 21, 'in_progress']
        );
        
        const habitId = insertResult.rows[0].id;
        console.log('✓ Created habit for ananya:', insertResult.rows[0].name, '(ID:', habitId + ')');
        
        // Now mark it as failed
        await db.query(
            "UPDATE habits SET status = 'failed', end_date = CURRENT_DATE WHERE id = $1",
            [habitId]
        );
        
        console.log('\n✅ Successfully created and marked "Drink 8 glasses of water" as FAILED for ananya');
        console.log('   Refresh the dashboard to see it in the Failed Habits section.\n');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
