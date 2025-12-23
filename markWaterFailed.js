const db = require('./src/models/db');

(async () => {
    // Check who user 2 is
    const user = await db.query('SELECT id, username FROM users WHERE id = 2');
    console.log('User 2:', user.rows[0]?.username || 'Not found');
    
    // Mark habit ID 2 as failed
    await db.query(
        "UPDATE habits SET status = 'failed', end_date = CURRENT_DATE WHERE id = $1",
        [2]
    );
    
    console.log('\n✅ Successfully marked "Drink 8 glasses of water" habit as FAILED');
    console.log('   Refresh the dashboard to see it in the Failed Habits section.\n');
    
    process.exit(0);
})();
