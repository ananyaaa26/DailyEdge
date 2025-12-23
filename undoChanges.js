const db = require('./src/models/db');

(async () => {
    try {
        console.log('\n🔄 Reverting habit changes...\n');
        
        // Revert habit ID 5 (meditate 30 minutes for ananya) back to in_progress
        await db.query(
            "UPDATE habits SET status = 'in_progress', end_date = NULL WHERE id = 5 AND status = 'failed'",
            []
        );
        console.log('✓ Reverted habit ID 5 (meditate 30 minutes) back to in_progress');
        
        // Revert habit ID 2 (Drink 8 glasses of water for aanchal) back to in_progress
        await db.query(
            "UPDATE habits SET status = 'in_progress', end_date = NULL WHERE id = 2 AND status = 'failed'",
            []
        );
        console.log('✓ Reverted habit ID 2 (Drink 8 glasses of water) back to in_progress');
        
        console.log('\n✅ All changes have been reverted!\n');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
