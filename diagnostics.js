const db = require('./src/models/db');

(async () => {
    try {
        console.log('\n=== DATABASE DIAGNOSTIC ===\n');
        
        // Check all users
        const users = await db.query('SELECT id, username, email FROM users ORDER BY id');
        console.log('📋 ALL USERS:');
        users.rows.forEach(u => {
            console.log(`  ID: ${u.id} | Username: ${u.username} | Email: ${u.email}`);
        });
        
        // Check all habits
        const habits = await db.query('SELECT id, user_id, name, status FROM habits ORDER BY user_id, id');
        console.log('\n📋 ALL HABITS:');
        habits.rows.forEach(h => {
            const user = users.rows.find(u => u.id === h.user_id);
            console.log(`  ID: ${h.id} | User: ${user?.username || 'Unknown'} (${h.user_id}) | Name: "${h.name}" | Status: ${h.status}`);
        });
        
        // Check for any username/email confusion
        console.log('\n🔍 CHECKING FOR DATA ISSUES:');
        const ananyaUser = users.rows.find(u => u.username.toLowerCase() === 'ananya');
        const aanchalUser = users.rows.find(u => u.username.toLowerCase() === 'aanchal');
        
        if (ananyaUser) {
            const ananyaHabits = habits.rows.filter(h => h.user_id === ananyaUser.id);
            console.log(`\n  Ananya (ID: ${ananyaUser.id}) has ${ananyaHabits.length} habits`);
        }
        
        if (aanchalUser) {
            const aanchalHabits = habits.rows.filter(h => h.user_id === aanchalUser.id);
            console.log(`  Aanchal (ID: ${aanchalUser.id}) has ${aanchalHabits.length} habits`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
