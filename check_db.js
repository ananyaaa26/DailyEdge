const db = require('./src/models/db');

async function checkTables() {
    const tables = ['users', 'habits', 'habit_logs', 'challenges', 'user_challenges', 'challenge_logs', 'badges'];
    
    for (const table of tables) {
        try {
            const result = await db.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = '${table}' 
                ORDER BY ordinal_position
            `);
            
            console.log(`\n${table.toUpperCase()} table structure:`);
            result.rows.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
            });
        } catch (err) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
    process.exit();
}

checkTables();