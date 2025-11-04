const db = require('./src/models/db');

async function createChallengeLogsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS challenge_logs (
                id SERIAL PRIMARY KEY,
                user_challenge_id INTEGER NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                UNIQUE(user_challenge_id, date)
            )
        `);
        console.log('✅ challenge_logs table created successfully!');
        
        // Create index for better performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_challenge_logs_user_challenge_date 
            ON challenge_logs(user_challenge_id, date)
        `);
        console.log('✅ Index created successfully!');
        
    } catch (err) {
        console.error('❌ Error creating challenge_logs table:', err);
    } finally {
        process.exit();
    }
}

createChallengeLogsTable();
