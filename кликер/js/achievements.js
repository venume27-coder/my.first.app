/**
 * Achievements System Module
 */
const AchievementsRegistry = {
    data: [
        {
            id: 'click_10',
            name: 'Инициализация рукопожатия',
            desc: 'Кликните по Ядру 10 раз.',
            icon: '🖱️',
            check: () => GameState.stats.totalClicks >= 10
        },
        {
            id: 'click_100',
            name: 'Спамер терминала',
            desc: 'Кликните по Ядру 100 раз.',
            icon: '⌨️',
            check: () => GameState.stats.totalClicks >= 100
        },
        {
            id: 'click_1000',
            name: 'Туннельный синдром',
            desc: 'Кликните по Ядру 1 000 раз.',
            icon: '🦾',
            check: () => GameState.stats.totalClicks >= 1000
        },
        {
            id: 'earn_1k',
            name: 'Первые сатоши',
            desc: 'Соберите в сумме 1 000 нейрокредитов.',
            icon: '🪙',
            check: () => GameState.stats.totalEarned >= 1000
        },
        {
            id: 'earn_50k',
            name: 'Майнинг-ферма',
            desc: 'Соберите в сумме 50 000 нейрокредитов.',
            icon: '💾',
            check: () => GameState.stats.totalEarned >= 50000
        },
        {
            id: 'earn_1m',
            name: 'Хост Кремниевой долины',
            desc: 'Соберите в сумме 1 000 000 нейрокредитов.',
            icon: '💎',
            check: () => GameState.stats.totalEarned >= 1000000
        },
        {
            id: 'level_5',
            name: 'Пользовательский доступ',
            desc: 'Достигните 5 уровня Ядра.',
            icon: '🔑',
            check: () => GameState.level >= 5
        },
        {
            id: 'level_15',
            name: 'Root-администратор',
            desc: 'Достигните 15 уровня Ядра.',
            icon: '👑',
            check: () => GameState.level >= 15
        },
        {
            id: 'upg_1',
            name: 'Кастомная прошивка',
            desc: 'Купите первое улучшение.',
            icon: '⚙️',
            check: () => GameState.stats.upgradesBought >= 1
        },
        {
            id: 'upg_25',
            name: 'Перегруженное железо',
            desc: 'Купите в сумме 25 улучшений.',
            icon: '🔧',
            check: () => GameState.stats.upgradesBought >= 25
        },
        {
            id: 'auto_1',
            name: 'Автопилот активирован',
            desc: 'Купите хотя бы один пассивный узел Ядра.',
            icon: '🛰️',
            check: () => {
                return Object.values(GameState.autoclickers).some(a => a.count > 0);
            }
        },
        {
            id: 'wheel_1',
            name: 'Вращение неонового колеса',
            desc: 'Прокрутите Колесо неона один раз.',
            icon: '🎡',
            check: () => GameState.stats.wheelSpins >= 1
        }
    ],

    // Return whether an achievement is unlocked
    isUnlocked(id) {
        return GameState.unlockedAchievements.includes(id);
    },

    // Get achievement object by id
    getById(id) {
        return this.data.find(a => a.id === id);
    },

    // Return the total global achievement multiplier (e.g. +2% per achievement)
    getMultiplier() {
        return 1.0 + (GameState.unlockedAchievements.length * 0.02);
    },

    // Run verification on all achievements
    checkUnlocks() {
        let newlyUnlocked = false;

        this.data.forEach(ach => {
            if (this.isUnlocked(ach.id)) return;

            if (ach.check()) {
                GameState.unlockedAchievements.push(ach.id);
                newlyUnlocked = true;
                
                // Trigger visual achievements toast and sound
                AudioEngine.playAchievement();
                if (window.Game && Game.UI) {
                    Game.UI.triggerAchievementToast(ach);
                }
            }
        });

        if (newlyUnlocked) {
            // Re-calc bonuses due to the permanent multiplier
            if (window.UpgradesRegistry) {
                window.UpgradesRegistry.recalculateBonuses();
            }
            GameState.saveGame();
            if (window.Game && Game.UI) {
                Game.UI.updateAchievementsGrid();
            }
        }
    }
};
// Make globally available
window.AchievementsRegistry = AchievementsRegistry;
