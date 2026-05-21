const transporter = require('../config/mail');

/**
 * Send welcome back email to user on login
 * @param {string} userEmail - User's email address
 * @param {string} username - User's username
 * @returns {Promise} - Mail send result
 */
exports.sendWelcomeBackEmail = async (userEmail, username) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                            border-radius: 8px;
                        }
                        .header {
                            text-align: center;
                            color: #ff6b35;
                            margin-bottom: 20px;
                        }
                        .content {
                            background-color: white;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .greeting {
                            font-size: 20px;
                            color: #333;
                            margin-bottom: 15px;
                        }
                        .message {
                            font-size: 16px;
                            color: #555;
                            line-height: 1.8;
                            margin-bottom: 20px;
                        }
                        .highlight {
                            color: #ff6b35;
                            font-weight: bold;
                        }
                        .tips {
                            background-color: #f0f7ff;
                            border-left: 4px solid #ff6b35;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .tips-title {
                            color: #ff6b35;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .tips ul {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .tips li {
                            margin: 5px 0;
                            color: #555;
                        }
                        .footer {
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                            margin-top: 20px;
                            border-top: 1px solid #eee;
                            padding-top: 10px;
                        }
                        .cta-button {
                            display: inline-block;
                            background-color: #ff6b35;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 15px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔥 Welcome Back to DailyEdge!</h1>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hello <span class="highlight">${username}</span>,
                            </div>
                            
                            <div class="message">
                                We're thrilled to see you back on DailyEdge! 🎉
                            </div>
                            
                            <div class="message">
                                Make sure to <span class="highlight">do your habits for today</span> and keep your streaks alive. 
                                Every small step counts toward building the best version of yourself!
                            </div>
                            
                            <div class="tips">
                                <div class="tips-title">💡 Quick Reminders:</div>
                                <ul>
                                    <li>Complete your daily habits to maintain your streak</li>
                                    <li>Check the leaderboards to see how you're doing compared to others</li>
                                    <li>Challenge yourself with new habit goals</li>
                                    <li>Track your progress on the analytics dashboard</li>
                                </ul>
                            </div>
                            
                            <div class="message">
                                Keep up the momentum and let's build those habits together! 💪
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="http://localhost:3000/dashboard" class="cta-button">
                                    Go to Dashboard
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email from DailyEdge. Please do not reply to this email.</p>
                            <p>&copy; 2026 DailyEdge. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: userEmail,
            subject: `Welcome back, ${username}! 🔥 Let's build those habits today!`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome back email sent to:', userEmail, 'Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome back email:', error);
        // Don't throw - we don't want email errors to break the login flow
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to new users on signup
 * @param {string} userEmail - User's email address
 * @param {string} username - User's username
 * @returns {Promise} - Mail send result
 */
exports.sendWelcomeEmail = async (userEmail, username) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                            border-radius: 8px;
                        }
                        .header {
                            text-align: center;
                            color: #ff6b35;
                            margin-bottom: 20px;
                        }
                        .content {
                            background-color: white;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .greeting {
                            font-size: 20px;
                            color: #333;
                            margin-bottom: 15px;
                        }
                        .message {
                            font-size: 16px;
                            color: #555;
                            line-height: 1.8;
                            margin-bottom: 20px;
                        }
                        .highlight {
                            color: #ff6b35;
                            font-weight: bold;
                        }
                        .tips {
                            background-color: #f0f7ff;
                            border-left: 4px solid #ff6b35;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .tips-title {
                            color: #ff6b35;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .tips ul {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .tips li {
                            margin: 5px 0;
                            color: #555;
                        }
                        .footer {
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                            margin-top: 20px;
                            border-top: 1px solid #eee;
                            padding-top: 10px;
                        }
                        .cta-button {
                            display: inline-block;
                            background-color: #ff6b35;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 15px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to DailyEdge!</h1>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hey <span class="highlight">${username}</span>,
                            </div>
                            
                            <div class="message">
                                Welcome aboard! 🚀 We're thrilled to have you join the DailyEdge community.
                            </div>
                            
                            <div class="message">
                                DailyEdge helps you <span class="highlight">maintain your streaks</span> and build sustainable habits that stick. 
                                Whether you're working on fitness, learning, productivity, or personal growth - we're here to help you succeed!
                            </div>
                            
                            <div class="message">
                                Your journey starts with a single habit. Hope to see you on this journey as we grow together! 💪
                            </div>
                            
                            <div class="tips">
                                <div class="tips-title">🚀 Getting Started:</div>
                                <ul>
                                    <li><strong>Create Your First Habit:</strong> Click "Add Habit" to start tracking something meaningful</li>
                                    <li><strong>Build Your Streak:</strong> Complete your habits daily to build an unstoppable streak</li>
                                    <li><strong>Earn XP & Rewards:</strong> Gain experience points and unlock badges as you progress</li>
                                    <li><strong>Join Challenges:</strong> Participate in community challenges and compete on leaderboards</li>
                                    <li><strong>Track Analytics:</strong> Monitor your progress with detailed insights and statistics</li>
                                </ul>
                            </div>
                            
                            <div class="message">
                                You've got this! Every day is a new opportunity to build better habits and become the best version of yourself. 
                                Let's start this journey together! 🔥
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="http://localhost:3000/dashboard" class="cta-button">
                                    Get Started Now
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email from DailyEdge. Please do not reply to this email.</p>
                            <p>&copy; 2026 DailyEdge. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: userEmail,
            subject: `Welcome to DailyEdge, ${username}! 🔥 Start building your habits today!`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', userEmail, 'Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw - we don't want email errors to break the signup flow
        return { success: false, error: error.message };
    }
};

/**
 * Send a generic email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @returns {Promise} - Mail send result
 */
exports.sendMail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to:', to, 'Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};
