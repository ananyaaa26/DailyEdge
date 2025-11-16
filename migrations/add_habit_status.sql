-- Add status and completion tracking to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_progress';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Update existing habits to have status
UPDATE habits SET status = 'in_progress' WHERE status IS NULL;

-- Add completion tracking for challenges
ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_habits_status ON habits(status);
CREATE INDEX IF NOT EXISTS idx_habits_end_date ON habits(end_date);
