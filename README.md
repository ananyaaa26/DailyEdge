# DailyEdge 📊

A comprehensive habit tracking application designed to help users build consistent habits, stay motivated, and achieve their goals through gamification and analytics.

## 🌟 Features

- **Habit Tracking**: Create, manage, and track your daily habits
- **Dashboard**: Visualize your progress with an intuitive dashboard
- **Analytics**: Detailed analytics and insights into your habit performance
- **Challenges**: Participate in challenges to stay motivated
- **Gamification**: Earn rewards and track your progress with gamified elements
- **User Authentication**: Secure login and signup system
- **Daily Quotes**: Get inspired with daily motivational quotes
- **Automated Tasks**: Scheduled cron jobs for daily updates and logging

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **EJS** - Template engine for server-side rendering

### Frontend
- **HTML/CSS/JavaScript** - Core web technologies
- **Chart.js** - Data visualization library
- **Custom animations** - Enhanced user experience

### Other Tools
- **bcrypt** - Password hashing and security
- **express-session** - Session management
- **node-cron** - Task scheduling
- **axios** - HTTP client for API requests
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ananyaaa26/DailyEdge.git
   cd DailyEdge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Create a new PostgreSQL database named `dailyedge`
   - Update the database configuration in `src/models/db.js` or use environment variables

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   SESSION_SECRET=your_session_secret_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dailyedge
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

5. **Initialize the database**
   Run the provided scripts to set up tables and initial data:
   ```bash
   node test_connection.js
   node insert_challenges.js
   node create_challenge_logs.js
   ```

## 💻 Usage

### Development Mode
Run the application with auto-reload on file changes:
```bash
npm run dev
```

### Production Mode
Run the application in production:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
dailyedge/
├── src/
│   ├── app.js                      # Main application file
│   ├── cli.js                      # CLI utilities
│   ├── controllers/                # Request handlers
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── challengesController.js
│   │   ├── dashboardController.js
│   │   └── habitController.js
│   ├── models/
│   │   └── db.js                   # Database configuration
│   ├── routes/                     # Route definitions
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── challenges.js
│   │   ├── dashboard.js
│   │   ├── habits.js
│   │   └── main.js
│   ├── utils/                      # Utility functions
│   │   ├── gamification.js
│   │   └── quoteFetcher.js
│   ├── views/                      # EJS templates
│   │   ├── pages/
│   │   └── partials/
│   └── public/                     # Static files
│       ├── css/
│       └── js/
├── package.json
└── README.md
```

## 🎯 Key Features Explained

### Habit Management
- Add new habits with customizable tracking
- Mark habits as complete/incomplete
- Track streak and consistency

### Analytics Dashboard
- Visual representation of habit completion rates
- Trend analysis over time
- Performance metrics and insights

### Challenges System
- Participate in predefined challenges
- Track challenge progress
- Earn rewards for completing challenges

### Gamification
- Point system for completing habits
- Achievement badges
- Leaderboards and progress tracking

## 🔐 Security

- Passwords are hashed using bcrypt
- Session-based authentication
- Environment variables for sensitive data
- Secure cookie configuration


