const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Configure client with TLS support for Upstash
const redisClient = createClient({
    url: redisUrl,
    socket: {
        tls: redisUrl.startsWith('rediss://'),
        rejectUnauthorized: false // Required for some cloud Redis providers
    }
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
