// Redis is optional - if REDIS_URL is not set, app will run without caching
if (!process.env.REDIS_URL) {
    console.log('Redis URL not found - running without Redis cache');
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
