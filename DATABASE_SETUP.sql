-- =====================================================
-- DailyEdge Database Setup Script
-- PostgreSQL Database Setup for Daily Habit Tracking App
-- =====================================================

-- Create Database (run as superuser)
-- psql -U postgres
-- CREATE DATABASE dailyedge;
-- \c dailyedge

-- =====================================================
-- TABLE 1: USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0,
    is_suspended BOOLEAN DEFAULT FALSE,
    suspended_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);

-- =====================================================
-- TABLE 2: HABITS
-- =====================================================
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    duration_days INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress',  -- in_progress, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    end_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_status ON habits(status);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);

-- =====================================================
-- TABLE 3: HABIT_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'done',  -- done, not done
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create composite index for efficient date-based queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_logs_unique ON habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

-- =====================================================
-- TABLE 4: CHALLENGES
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    is_admin_created BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_challenges_is_admin_created ON challenges(is_admin_created);

-- =====================================================
-- TABLE 5: USER_CHALLENGES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress',  -- in_progress, completed, failed
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_challenges_unique ON user_challenges(user_id, challenge_id);

-- =====================================================
-- TABLE 6: CHALLENGE_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_logs (
    id SERIAL PRIMARY KEY,
    user_challenge_id INTEGER NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'done',  -- done, not done
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create composite index
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_logs_unique ON challenge_logs(user_challenge_id, date);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_date ON challenge_logs(date);

-- =====================================================
-- TABLE 7: BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON badges(earned_at);

-- =====================================================
-- TABLE 8: ADMIN USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',  -- admin, super_admin
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- =====================================================
-- TABLE 9: ADMIN ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),  -- users, habits, challenges, etc.
    target_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);

-- =====================================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- =====================================================

-- Insert sample admin user (password is hashed bcrypt of 'admin123')
INSERT INTO admin_users (username, email, password, role)
VALUES ('admin', 'admin@dailyedge.com', '$2b$12$abcdefghijklmnopqrstuvwxyz', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample challenges
INSERT INTO challenges (title, description, duration_days, xp_reward, is_admin_created)
VALUES 
    ('30-Day Fitness Challenge', 'Complete a workout every day for 30 days', 30, 150, TRUE),
    ('Reading Challenge', 'Read for at least 30 minutes daily for 21 days', 21, 100, TRUE),
    ('Meditation Streak', 'Meditate for 10 minutes every day for 14 days', 14, 75, TRUE),
    ('Coding Marathon', 'Code for at least 1 hour every day for 30 days', 30, 200, TRUE),
    ('Water Intake Challenge', 'Drink 8 glasses of water daily for 7 days', 7, 50, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USEFUL VIEWS FOR ANALYTICS
-- =====================================================

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.xp,
    COUNT(DISTINCT h.id) as total_habits,
    COUNT(DISTINCT CASE WHEN h.status = 'completed' THEN h.id END) as completed_habits,
    COUNT(DISTINCT CASE WHEN h.status = 'in_progress' THEN h.id END) as active_habits,
    COUNT(DISTINCT CASE WHEN h.status = 'failed' THEN h.id END) as failed_habits,
    COUNT(DISTINCT uc.id) as total_challenges,
    COUNT(DISTINCT CASE WHEN uc.status = 'completed' THEN uc.id END) as completed_challenges,
    COUNT(DISTINCT b.id) as badge_count,
    u.created_at
FROM users u
LEFT JOIN habits h ON u.id = h.user_id
LEFT JOIN user_challenges uc ON u.id = uc.user_id
LEFT JOIN badges b ON u.id = b.user_id
WHERE u.is_suspended = FALSE
GROUP BY u.id, u.username, u.email, u.xp, u.created_at;

-- View for habit completion rate
CREATE OR REPLACE VIEW habit_completion_stats AS
SELECT 
    h.id as habit_id,
    h.name,
    h.user_id,
    h.duration_days,
    COUNT(DISTINCT hl.date) as days_completed,
    ROUND(100.0 * COUNT(DISTINCT hl.date) / h.duration_days, 2) as completion_percentage
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.status = 'done'
GROUP BY h.id, h.name, h.user_id, h.duration_days;

-- =====================================================
-- END OF DATABASE SETUP
-- =====================================================
