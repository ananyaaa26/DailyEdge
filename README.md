# DailyEdge 📊

A comprehensive habit tracking application designed to help users build consistent habits, stay motivated, and achieve their goals through gamification and analytics.

## 🌟 Features

- **Habit Tracking**: Create, manage, and track your daily habits
- **Dashboard**: Visualize your progress with an intuitive dashboard and real-time stats
- **Analytics**: Detailed analytics and insights into your habit performance
- **Challenges**: Participate in challenges to stay motivated with consistent sidebar navigation
- **Leaderboard**: Compete with other users on a comprehensive leaderboard ranked by XP
  - View all users ranked by their total XP
  - Featured top 3 players with personalized avatar colors
  - Real-time ranking updates via Socket.io
  - Personalized avatars with 10 theme-appropriate random colors (consistent per user)
- **Gamification**: Earn rewards and track your progress with gamified elements
- **User Authentication**: Secure login and signup system with admin controls
- **Daily Quotes**: Get inspired with daily motivational quotes
- **Automated Tasks**: Scheduled cron jobs for daily updates and logging
- **Real-Time Updates**: Live leaderboard updates and instant rank changes via WebSockets
- **Performance Caching**: Redis-based caching for optimized leaderboard queries
- **Consistent UI**: Unified sidebar navigation across all pages with user profile and stats

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **EJS** - Template engine for server-side rendering
- **Socket.io** - Real-time bidirectional communication for live updates
- **Redis** - In-memory data store for caching and performance optimization

### Frontend
- **HTML/CSS/JavaScript** - Core web technologies
- **Chart.js** - Data visualization library
- **Socket.io Client** - Real-time communication with server
- **CSS Grid & Flexbox** - Modern responsive layouts
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
- [Redis](https://redis.io/) (for caching and real-time features)
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
   REDIS_URL=redis://localhost:6379
   MAIL_USER=your_email@gmail.com
   MAIL_PASSWORD=your_app_password_here
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
│   ├── app.js                      # Main application file with Socket.io
│   ├── cli.js                      # CLI utilities
│   ├── controllers/                # Request handlers
│   │   ├── adminAuthController.js  # Admin authentication
│   │   ├── adminController.js      # Admin dashboard and management
│   │   ├── analyticsController.js  # Analytics page rendering
│   │   ├── authController.js       # User authentication
│   │   ├── challengesController.js # Challenges page with stats
│   │   ├── dashboardController.js  # Dashboard rendering
│   │   ├── habitController.js      # Habit CRUD operations
│   │   ├── leaderboardController.js # Leaderboard logic and caching
│   │   └── authController.test.js  # Authentication tests
│   ├── config/                     # Configuration files
│   │   ├── mail.js                 # Email configuration
│   │   └── redis.js                # Redis client setup
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/
│   │   └── db.js                   # Database configuration
│   ├── routes/                     # Route definitions
│   │   ├── admin.js                # Admin routes
│   │   ├── analytics.js            # Analytics routes
│   │   ├── auth.js                 # Authentication routes
│   │   ├── challenges.js           # Challenges routes
│   │   ├── dashboard.js            # Dashboard routes
│   │   ├── habits.js               # Habits CRUD routes
│   │   ├── leaderboard.js          # Leaderboard routes
│   │   └── main.js                 # Main/home routes
│   ├── utils/                      # Utility functions
│   │   ├── cacheHelper.js          # Cache management utilities
│   │   ├── completionChecker.js    # Habit/challenge completion logic
│   │   ├── gamification.js         # Streak and XP calculations
│   │   ├── mailHelper.js           # Email sending utilities
│   │   └── quoteFetcher.js         # Daily quote fetching
│   ├── views/                      # EJS templates
│   │   ├── pages/                  # Page templates
│   │   │   ├── dashboard.ejs
│   │   │   ├── challenges.ejs
│   │   │   ├── leaderboard-page.ejs
│   │   │   ├── analytics.ejs
│   │   │   ├── admin-*.ejs
│   │   │   └── ...
│   │   └── partials/               # Reusable components
│   │       ├── header.ejs
│   │       ├── navbar.ejs
│   │       └── footer.ejs
│   └── public/                     # Static files
│       ├── css/
│       │   ├── style.css           # Main styles
│       │   └── leaderboard.css     # Leaderboard-specific styles
│       └── js/
│           ├── leaderboard-page.js # Client-side leaderboard rendering
│           ├── leaderboard.js      # Leaderboard utilities
│           ├── animations.js       # Page animations
│           └── storage-utils.js    # Local storage helpers
├── tests/                          # Test files
│   └── integration/
│       ├── login.test.js
│       └── screenshots/
├── DATABASE_SETUP.sql              # Database initialization script
├── jest.config.js                  # Jest testing configuration
├── package.json                    # Project dependencies
└── README.md
```

## 🎯 Key Features Explained

### Habit Management
- Add new habits with customizable tracking
- Mark habits as complete/incomplete
- Track streak and consistency
- Integrated weekly statistics and progress tracking

### Dashboard
- Personalized user profile with XP and level badge
- Today's progress overview with completion statistics
- Weekly activity stats and streak information
- Quick navigation to all major features
- Unified sidebar with consistent navigation across all pages

### Challenges System
- Participate in predefined challenges
- Track challenge progress
- Earn rewards for completing challenges
- Consistent sidebar matching dashboard UI
- Integration with habit tracking system

### Analytics Dashboard
- Visual representation of habit completion rates
- Trend analysis over time
- Performance metrics and insights
- Detailed performance statistics

### Leaderboard System
- **Comprehensive Ranking**: All users ranked by total XP
- **Featured Top 3**: Visually prominent display of top 3 players with horizontal card layout
- **Avatar Personalization**: Each player has a unique theme-appropriate color avatar
  - 10 vibrant color options: Green, Blue, Purple, Pink, Orange, Cyan, Violet, Rose, and more
  - Colors are consistent per user (same user always gets same color)
  - Colors are not too dark for optimal visibility
- **Current User Indicator**: Users can see themselves marked as "YOU" on the leaderboard
- **Real-Time Updates**: Live rank synchronization with sidebar stats
- **Responsive Design**: Compact and professional UI matching gaming industry standards
- **Performance Optimized**: Redis caching for fast leaderboard queries (5-minute TTL)

### Real-Time Updates
- Socket.io integration for instant leaderboard updates
- Live rank changes when users earn XP
- Real-time notification of position changes
- Seamless experience without page refresh

### Gamification
- Point system for completing habits and challenges
- Achievement-based progression
- Visual rank and level system
- Competitive leaderboards to motivate users
- Streak tracking and maintenance bonuses

## 🔐 Security

- Passwords are hashed using bcrypt
- Session-based authentication
- Environment variables for sensitive data
- Secure cookie configuration
- Admin role-based access control
- Input validation and sanitization

## 🎨 UI/UX Improvements

### Consistent Design System
- Unified sidebar navigation across all pages (Dashboard, Challenges, Leaderboard, Analytics)
- Persistent user profile section with XP and level badge
- Consistent color palette and typography
- Responsive design for mobile and desktop

### Leaderboard UI
- Modern compact layout inspired by professional gaming platforms
- Featured section showcasing top 3 players in horizontal card layout
- Full leaderboard table with sortable columns
- Personalized player avatars with theme colors
- Current user highlighted with blue indicator
- Optimized spacing and typography for readability

### Performance Optimizations
- Redis caching for leaderboard queries (5-minute TTL)
- Efficient database queries for habit completion tracking
- Client-side state management with sessionStorage
- Socket.io for real-time updates without polling

## 📊 Database Schema

The application uses PostgreSQL with tables for:
- Users (with XP and suspension status)
- Habits (with streak tracking)
- Challenges (with completion logs)
- User sessions and authentication data
- Analytics and performance metrics

Run `DATABASE_SETUP.sql` to initialize all required tables and relationships.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Tests include:
- Authentication flow integration tests
- Habit completion logic
- Challenge system validation
- Database connection tests

## 📈 Future Enhancements

- Mobile app version
- Social features (friend lists, challenges with friends)
- Advanced analytics with predictive insights
- Email notifications for streaks and achievements
- Dark mode theme
- Multi-language support
- Badge and achievement system

## 💾 Caching Strategy

The application implements intelligent caching for optimal performance:

- **Leaderboard Cache**: Redis TTL of 5 minutes for leaderboard rankings
- **Cache Invalidation**: Automatic cache refresh when users earn XP
- **Session Storage**: Client-side caching for user ID and session data
- **Database Query Optimization**: Indexed queries for fast habit and challenge lookups

## 📞 Support & Contributing

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/ananyaaa26/DailyEdge).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

**Ananya** - Full-stack development and application design

---

**Last Updated**: May 2026
**Version**: 2.0 - Leaderboard and UI Enhancements


