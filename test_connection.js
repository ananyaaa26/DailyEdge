const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 8000,
    database: 'postgres',
    user: 'postgres',
    password: 'Ananya@26',
});

async function testConnection() {
    try {
        console.log('Attempting to connect to database...');
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        
        const result = await client.query('SELECT NOW()');
        console.log('Current time from database:', result.rows[0].now);
        
        client.release();
        
        // Test if dailyedge database exists
        const dbCheck = await pool.query('SELECT datname FROM pg_database WHERE datname = $1', ['dailyedge']);
        if (dbCheck.rows.length > 0) {
            console.log('✅ Database "dailyedge" exists');
        } else {
            console.log('❌ Database "dailyedge" does not exist');
        }
        
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
    } finally {
        await pool.end();
    }
}

testConnection();