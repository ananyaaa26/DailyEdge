const db = require('./src/models/db');

(async () => {
    try {
        // Get all habits for ananya (user ID 1)
        const result = await db.query(
            "SELECT id, name, status FROM habits WHERE user_id = $1 ORDER BY id",
            [1]
        );
        
        console.log('\n📋 All habits for ananya (user_id = 1):\n');
        result.rows.forEach(h => {
            console.log(`  ID: ${h.id} | Name: "${h.name}" | Status: ${h.status}`);
        });
        
        // Find the water habit (case-insensitive, flexible matching)
        const waterHabit = result.rows.find(h => 
            h.name.toLowerCase().includes('drink') || 
            h.name.toLowerCase().includes('water') ||
            h.name.toLowerCase().includes('glass')
        );
        
        if (waterHabit) {
            console.log('\n✓ Found water habit:', waterHabit.name, '(ID:', waterHabit.id + ')');
            
            // Mark it as failed
            await db.query(
                "UPDATE habits SET status = 'failed', end_date = CURRENT_DATE WHERE id = $1",
                [waterHabit.id]
            );
            
            console.log('\n✅ Successfully marked as FAILED');
            console.log('   Refresh the dashboard to see it in the Failed Habits section.\n');
        } else {
            console.log('\n❌ No water/drink habit found for ananya\n');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
