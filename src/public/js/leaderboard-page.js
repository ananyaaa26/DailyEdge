// Real-time Streaks Leaderboard Page
class StreaksLeaderboardPage {
    constructor(containerId = 'leaderboard-container') {
        this.container = document.getElementById(containerId);
        this.socket = io();
        this.leaderboard = [];
        this.userRank = null;
        this.colorPalette = [
            { light: 'rgba(16, 185, 129, 0.15)', dark: '#10b981' },      // Green
            { light: 'rgba(59, 130, 246, 0.15)', dark: '#3b82f6' },      // Blue
            { light: 'rgba(168, 85, 247, 0.15)', dark: '#a855f7' },      // Purple
            { light: 'rgba(236, 72, 153, 0.15)', dark: '#ec4899' },      // Pink
            { light: 'rgba(249, 115, 22, 0.15)', dark: '#f97316' },      // Orange
            { light: 'rgba(6, 182, 212, 0.15)', dark: '#06b6d4' },       // Cyan
            { light: 'rgba(139, 92, 246, 0.15)', dark: '#8b5cf6' },      // Violet
            { light: 'rgba(244, 63, 94, 0.15)', dark: '#f43f5e' },       // Rose
            { light: 'rgba(34, 197, 94, 0.15)', dark: '#22c55e' },       // Green-2
            { light: 'rgba(14, 165, 233, 0.15)', dark: '#0ea5e9' },      // Sky
        ];
        this.init();
    }

    getColorForUser(userId) {
        // Generate a consistent color for each user based on their ID
        const colorIndex = userId % this.colorPalette.length;
        return this.colorPalette[colorIndex];
    }

    init() {
        // Join leaderboard room
        this.socket.emit('join_leaderboard', sessionStorage.getItem('userId'));

        // Listen for real-time leaderboard updates
        this.socket.on('leaderboard_update', (data) => {
            if (data.success) {
                this.leaderboard = data.leaderboard;
                this.updateUserRank();
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
                this.updateUserRank();
                this.render();
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

    updateUserRank() {
        const currentUserId = parseInt(sessionStorage.getItem('userId'));
        const currentUser = this.leaderboard.find(user => user.id === currentUserId);
        
        if (currentUser) {
            this.userRank = currentUser.rank;
            // Update sidebar rank display
            const rankElement = document.querySelector('.sidebar-stats .stat-value');
            if (rankElement) {
                rankElement.textContent = '#' + this.userRank;
            }
        }
    }

    render() {
        if (!this.container) return;

        const currentUserId = parseInt(sessionStorage.getItem('userId'));

        // Get top 3
        const top3 = this.leaderboard.slice(0, 3);
        const restUsers = this.leaderboard.slice(3, 50);

        const html = `
            <div class="leaderboard-modern">
                <!-- Top 3 Compact -->
                <div class="lb-featured-section">
                    <div class="lb-featured-container">
                        ${top3.map((user, index) => {
                            const isCurrentUser = user.id === currentUserId;
                            const medals = ['🥇', '🥈', '🥉'];
                            const colors = this.getColorForUser(user.id);
                            return `
                            <div class="lb-featured-card-compact ${isCurrentUser ? 'current-user' : ''}" style="--avatar-light: ${colors.light}; --avatar-dark: ${colors.dark};">
                                <div class="lb-medal">${medals[index]}</div>
                                <div class="lb-compact-avatar" style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.dark}dd 100%);">${(isCurrentUser ? 'YOU' : user.username).charAt(0).toUpperCase()}</div>
                                <div class="lb-compact-name">${isCurrentUser ? 'YOU' : user.username}</div>
                                <div class="lb-compact-rank">#${user.rank}</div>
                                <div class="lb-compact-xp">⭐ ${user.xp}</div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Leaderboard Table -->
                <div class="lb-table-section">
                    <table class="lb-table">
                        <thead>
                            <tr>
                                <th class="lb-rank-col">Rank</th>
                                <th class="lb-player-col">Player</th>
                                <th class="lb-xp-col">XP</th>
                                <th class="lb-streak-col">Streak</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${restUsers.map((user, index) => {
                                const isCurrentUser = user.id === currentUserId;
                                const colors = this.getColorForUser(user.id);
                                return `
                                <tr class="lb-table-row ${isCurrentUser ? 'current-user-row' : ''}">
                                    <td class="lb-rank-col">#${user.rank}</td>
                                    <td class="lb-player-col">
                                        <div class="lb-player-info">
                                            <span class="lb-player-avatar" style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.dark}dd 100%);">${(isCurrentUser ? 'YOU' : user.username).charAt(0).toUpperCase()}</span>
                                            <span class="lb-player-name">${isCurrentUser ? 'YOU' : user.username}</span>
                                        </div>
                                    </td>
                                    <td class="lb-xp-col">⭐ ${user.xp}</td>
                                    <td class="lb-streak-col">🔥 ${user.total_streak}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Footer -->
                <div class="lb-footer">
                    <span class="lb-total-players">Total Players: ${this.leaderboard.length}</span>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }
}

// Global reference for onclick handlers
let leaderboardPage;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('leaderboard-container');
    if (container) {
        leaderboardPage = new StreaksLeaderboardPage('leaderboard-container');
    }
});
