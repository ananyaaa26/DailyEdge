const db = require('./src/models/db');

(async () => {
    const result = await db.query(
        "SELECT id, name, status, user_id FROM habits WHERE name ILIKE '%water%' OR name ILIKE '%drink%'"
    );
    console.log('Water/Drink habits found:', result.rows.length);
    result.rows.forEach(h => {
        console.log(`ID: ${h.id} | User: ${h.user_id} | Name: ${h.name} | Status: ${h.status}`);
    });
    process.exit(0);
})();
