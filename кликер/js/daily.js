/**
 * Daily Login Rewards Calendar Module
 */
const DailyRewardsRegistry = {
    rewards: [
        { day: 1, name: 'Бонус запуска ядра', value: 150, type: 'credits', icon: '🪙' },
        { day: 2, name: 'Демонический кэш', value: 750, type: 'credits', icon: '📦' },
        { day: 3, name: 'Сетевой пакет', value: 3000, type: 'credits', icon: '💾' },
        { day: 4, name: 'Разогнанное ядро процессора', value: 12000, type: 'credits', icon: '⚡' },
        { day: 5, name: 'Взлом мейнфрейма', value: 50000, type: 'credits', icon: '🔌' },
        { day: 6, name: 'Нейронная перегрузка (Множитель 3x)', value: 150000, type: 'buff_global_3x', icon: '🌀' },
        { day: 7, name: 'Пакет сингулярности (Множитель 5x)', value: 750000, type: 'buff_global_5x', icon: '🌟' }
    ],

    // Return current eligibility status
    // 'claimable': eligible to claim now
    // 'locked': claimed in the last 24h (needs countdown)
    // 'reset': last claim was > 48 hours ago, resets streak
    getStatus() {
        const now = Date.now();
        const lastClaim = GameState.dailyRewardLastClaim;

        if (lastClaim === 0) {
            return 'claimable';
        }

        const msSinceLast = now - lastClaim;
        const oneDayMs = 24 * 60 * 60 * 1000;
        const twoDaysMs = 48 * 60 * 60 * 1000;

        if (msSinceLast < oneDayMs) {
            return 'locked';
        } else if (msSinceLast >= oneDayMs && msSinceLast < twoDaysMs) {
            return 'claimable';
        } else {
            return 'reset';
        }
    },

    // Get time remaining until next claim in milliseconds
    getTimeRemaining() {
        const now = Date.now();
        const lastClaim = GameState.dailyRewardLastClaim;
        const oneDayMs = 24 * 60 * 60 * 1000;
        return Math.max(0, (lastClaim + oneDayMs) - now);
    },

    // Claim the daily reward
    claim() {
        const status = this.getStatus();
        if (status === 'locked') return false;

        // If streak reset, start at day 1 (index 0)
        if (status === 'reset') {
            GameState.dailyRewardStreak = 0;
        }

        const activeDayIndex = GameState.dailyRewardStreak % 7;
        const reward = this.rewards[activeDayIndex];

        // Give reward
        if (reward.type === 'credits') {
            GameState.addCredits(reward.value);
        } else if (reward.type === 'buff_global_3x') {
            GameState.addCredits(reward.value);
            GameState.addBuff('global', 3.0, 30000); // 30s of 3x mult
        } else if (reward.type === 'buff_global_5x') {
            GameState.addCredits(reward.value);
            GameState.addBuff('global', 5.0, 60000); // 60s of 5x mult
        }

        // Increment streak and update timestamp
        GameState.dailyRewardStreak++;
        GameState.dailyRewardLastClaim = Date.now();
        
        AudioEngine.playLevelUp(); // Play celebration chime
        GameState.saveGame();

        // Check achievements
        if (window.AchievementsRegistry) {
            window.AchievementsRegistry.checkUnlocks();
        }

        return reward;
    }
};
// Make globally available
window.DailyRewardsRegistry = DailyRewardsRegistry;
