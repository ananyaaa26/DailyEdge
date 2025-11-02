const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 8000,
    database: 'dailyedge',
    user: 'postgres',
    password: 'Ananya@26',
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};