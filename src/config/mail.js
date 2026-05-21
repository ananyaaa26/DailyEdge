require('dotenv').config();
const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Mail transporter error:', error);
    } else {
        console.log('✓ Mail transporter verified and ready to send emails');
    }
});

module.exports = transporter;
