const axios = require('axios');
const https = require('https');

// Create an HTTPS agent that ignores self-signed or expired certificates
// This is generally not recommended, but is useful for local development
// or when an external API temporarily has certificate issues.
const agent = new https.Agent({
  rejectUnauthorized: false
});

const getQuote = async () => {
    try {
        // Pass the agent in the request config
        const response = await axios.get('https://api.quotable.io/random', { httpsAgent: agent });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch quote:", error.message); // Log only the message for cleaner output
        // Return a fallback quote
        return {
            content: "The secret of getting ahead is getting started.",
            author: "Mark Twain"
        };
    }
};

module.exports = { getQuote };