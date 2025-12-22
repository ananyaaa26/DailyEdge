const { Pool } = require('pg');

// Use DATABASE_URL from environment or fallback to local database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ananya@26@localhost:8000/dailyedge',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
