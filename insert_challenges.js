const db = require('./src/models/db');

async function insertSampleChallenges() {
    try {
        // Check if challenges already exist
        const existingChallenges = await db.query('SELECT COUNT(*) as count FROM challenges');
        if (parseInt(existingChallenges.rows[0].count) > 0) {
            console.log('Challenges already exist. Skipping insertion.');
            return;
        }

        const challenges = [
            {
                title: '7-Day Morning Routine',
                description: 'Start your day right! Complete your morning habits for 7 consecutive days.',
                duration_days: 7,
                xp_reward: 100
            },
            {
                title: '21-Day Habit Builder',
                description: 'Build a lasting habit! Complete any habit for 21 consecutive days to form a new routine.',
                duration_days: 21,
                xp_reward: 300
            },
            {
                title: 'Weekend Warrior',
                description: 'Don\'t let weekends break your streak! Complete habits on Saturday and Sunday.',
                duration_days: 2,
                xp_reward: 50
            },
            {
                title: 'Monthly Marathon',
                description: 'Go the distance! Complete all your habits for 30 days straight.',
                duration_days: 30,
                xp_reward: 500
            },
            {
                title: 'Perfect Week',
                description: 'Achieve perfection! Complete all your habits every day for one week.',
                duration_days: 7,
                xp_reward: 150
            },
            {
                title: 'Consistency King',
                description: 'Show your consistency! Complete at least one habit every day for 14 days.',
                duration_days: 14,
                xp_reward: 200
            }
        ];

        for (const challenge of challenges) {
            await db.query(
                'INSERT INTO challenges (title, description, duration_days, xp_reward) VALUES ($1, $2, $3, $4)',
                [challenge.title, challenge.description, challenge.duration_days, challenge.xp_reward]
            );
        }

        console.log(`Successfully inserted ${challenges.length} challenges`);
    } catch (err) {
        console.error('Error inserting challenges:', err);
    } finally {
        process.exit();
    }
}

insertSampleChallenges();