if (process.env.DEMO_MODE === "true") {
    console.log("Database disabled in DEMO MODE");

    module.exports = {
        query: async () => {
            return { rows: [] };
        }
    };
    return;
}

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
