const { Pool } = require('pg');

// Use DATABASE_URL from environment or fallback to local database
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Ananya@26@localhost:8000/dailyedge';

// Only use SSL for remote databases (cloud providers), not for localhost
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
    connectionString: connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
