const db = require('../src/models/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Starting database migration...');
        
        const sqlPath = path.join(__dirname, 'add_habit_status.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await db.query(sql);
        
        console.log('Migration completed successfully!');
        console.log('- Added status, end_date, completed_at columns to habits table');
        console.log('- Added completed_at, failed_at columns to user_challenges table');
        console.log('- Created indexes for performance');
        console.log('\nYou can now restart your server and test the completion tracking!');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
