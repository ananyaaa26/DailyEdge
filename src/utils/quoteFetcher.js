const axios = require('axios'); //Used to send GET/POST requests to external APIs.
const https = require('https'); //A built-in Node.js core module for making secure HTTPS requests.


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