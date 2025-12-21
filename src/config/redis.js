const DEMO_MODE = process.env.DEMO_MODE === "true";

if (DEMO_MODE) {
    console.log("Redis disabled (DEMO MODE)");
    module.exports = null;
    return;
}

const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;
