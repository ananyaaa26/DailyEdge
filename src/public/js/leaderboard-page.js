// Real-time Streaks Leaderboard Page
class StreaksLeaderboardPage {
    constructor(containerId = 'leaderboard-container') {
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

        // Refresh every 5 minutes
        setInterval(() => {
            this.fetchLeaderboard();
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

    render() {
        if (!this.container) return;

        const currentUserId = parseInt(sessionStorage.getItem('userId'));

        const html = `
            <div class="leaderboard-full-page">
                <div class="leaderboard-header-section">
                    <h2 class="leaderboard-title">🔥 Leaderboards</h2>
                    <p class="leaderboard-subtitle">Ranked by Experience Points (XP)</p>
                    <span class="leaderboard-count">${this.leaderboard.length} players competing</span>
                </div>

                <div class="leaderboard-list-full">
                    ${this.leaderboard.map((user, index) => {
                        const isCurrentUser = user.id === currentUserId || user.isCurrentUser;
                        return `
                        <div class="leaderboard-item-full ${isCurrentUser ? 'current-user' : ''}">
                            <div class="leaderboard-rank-full">
                                ${this.getRankBadgeFull(index + 1)}
                            </div>
                            <div class="leaderboard-info-full">
                                <span class="leaderboard-name-full">${isCurrentUser ? 'YOU' : user.username}</span>
                                <span class="leaderboard-xp-full">${user.xp} XP</span>
                            </div>
                            <div class="leaderboard-streak-full">
                                <span class="streak-fire">🔥</span>
                                <span class="streak-value-full">${user.total_streak}</span>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    getRankBadgeFull(rank) {
        switch(rank) {
            case 1:
                return '<span class="rank-badge-full gold">🥇</span>';
            case 2:
                return '<span class="rank-badge-full silver">🥈</span>';
            case 3:
                return '<span class="rank-badge-full bronze">🥉</span>';
            default:
                return `<span class="rank-badge-full">${rank}</span>`;
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('leaderboard-container');
    if (container) {
        new StreaksLeaderboardPage('leaderboard-container');
    }
});
