// Real-time Streaks Leaderboard Widget
class StreaksLeaderboard {
    constructor(containerId = 'leaderboard-widget') {
        this.container = document.getElementById(containerId);
        this.socket = io();
        this.leaderboard = [];
        this.userRank = null;
        this.init();
    }

    init() {
        // Join leaderboard room
        this.socket.emit('join_leaderboard', sessionStorage.getItem('userId'));

        // Listen for real-time leaderboard updates
        this.socket.on('leaderboard_update', (data) => {
            if (data.success) {
                this.leaderboard = data.leaderboard;
                this.render();
                console.log('Leaderboard updated via Socket.io');
            }
        });

        // Initial load
        this.fetchLeaderboard();
        this.fetchUserRank();

        // Refresh every 5 minutes
        setInterval(() => {
            this.fetchLeaderboard();
            this.fetchUserRank();
        }, 5 * 60 * 1000);
    }

    async fetchLeaderboard() {
        try {
            const response = await fetch('/leaderboard/streaks');
            const data = await response.json();
            if (data.success) {
                this.leaderboard = data.leaderboard;
                this.render();
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

    async fetchUserRank() {
        try {
            const response = await fetch('/leaderboard/user-rank');
            const data = await response.json();
            if (data.success) {
                this.userRank = data;
                this.renderUserRank();
            }
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
    }

    render() {
        if (!this.container) return;

        const html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h3>🔥 Top Streaks</h3>
                    <span class="leaderboard-count">${this.leaderboard.length} players</span>
                </div>

                ${this.userRank ? `
                    <div class="user-rank-badge">
                        <div class="rank-item">
                            <span class="rank-label">Your Rank</span>
                            <span class="rank-value">#${this.userRank.rank}</span>
                        </div>
                        <div class="rank-item">
                            <span class="rank-label">Your Streak</span>
                            <span class="rank-value">🔥 ${this.userRank.total_streak}</span>
                        </div>
                    </div>
                ` : ''}

                <div class="leaderboard-list">
                    ${this.leaderboard.slice(0, 5).map((user, index) => `
                        <div class="leaderboard-item ${user.id === parseInt(sessionStorage.getItem('userId')) ? 'current-user' : ''}">
                            <div class="leaderboard-rank">
                                ${this.getRankBadge(index + 1)}
                            </div>
                            <div class="leaderboard-info">
                                <span class="leaderboard-name">${user.username}</span>
                                <span class="leaderboard-xp">${user.xp} XP</span>
                            </div>
                            <div class="leaderboard-streak">
                                <span class="streak-fire">🔥</span>
                                <span class="streak-value">${user.total_streak}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="leaderboard-footer">
                    <a href="/leaderboard/streaks" class="view-full-btn">View Full Leaderboard →</a>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderUserRank() {
        // This is already included in the main render, but can be called separately if needed
        this.render();
    }

    getRankBadge(rank) {
        switch(rank) {
            case 1:
                return '<span class="rank-badge gold">🥇</span>';
            case 2:
                return '<span class="rank-badge silver">🥈</span>';
            case 3:
                return '<span class="rank-badge bronze">🥉</span>';
            default:
                return `<span class="rank-badge">${rank}</span>`;
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('leaderboard-widget');
    if (container) {
        new StreaksLeaderboard('leaderboard-widget');
    }
});
