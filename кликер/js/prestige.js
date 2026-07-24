/**
 * Prestige (Hard Reboot) Registry and Shop Operations
 */
const PrestigeRegistry = {
    // List of permanent upgrades
    data: [
        {
            id: 'pres_cache',
            name: 'Постоянные сегменты ядра',
            desc: 'Сохраняет уровни первого улучшения клика (Квантовые нано-клики) после перезагрузки.',
            baseCost: 5,
            costMult: 2.0,
            maxLvl: 1,
            icon: '💾'
        },
        {
            id: 'pres_crit_mult',
            name: 'Резонансный критический разгон',
            desc: 'Увеличивает базовый критический множитель на +0.5x навсегда.',
            baseCost: 8,
            costMult: 1.5,
            maxLvl: 5,
            icon: '💥'
        },
        {
            id: 'pres_time_dilate',
            name: 'Сжатие временных циклов',
            desc: 'Системные гличи и квантовые кубы данных появляются на 15% чаще.',
            baseCost: 10,
            costMult: 1.6,
            maxLvl: 3,
            icon: '🌀'
        },
        {
            id: 'pres_cps_boost',
            name: 'Перегрузка нейросети',
            desc: 'Увеличивает глобальный пассивный доход (CPS) на +10% за уровень.',
            baseCost: 12,
            costMult: 1.5,
            maxLvl: null,
            icon: '🧠'
        },
        {
            id: 'pres_auto_spin',
            name: 'Автономный модуль вероятности',
            desc: 'Автоматически крутит Колесо неона, как только становится доступен бесплатный спин.',
            baseCost: 15,
            costMult: 2.5,
            maxLvl: 1,
            icon: '🤖'
        }
    ],

    getLevel(upgradeId) {
        return GameState.prestigeUpgrades[upgradeId] || 0;
    },

    getCost(upgrade) {
        const lvl = this.getLevel(upgrade.id);
        return Math.round(upgrade.baseCost * Math.pow(upgrade.costMult, lvl));
    },

    isMaxLevel(upgrade) {
        if (upgrade.maxLvl === null) return false;
        return this.getLevel(upgrade.id) >= upgrade.maxLvl;
    },

    buyUpgrade(upgradeId) {
        const upgrade = this.data.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        if (this.isMaxLevel(upgrade)) return false;

        const cost = this.getCost(upgrade);
        if (GameState.nanocores >= cost) {
            GameState.nanocores -= cost;
            GameState.prestigeUpgrades[upgradeId] = this.getLevel(upgradeId) + 1;
            
            // Recalculate game parameters
            if (window.UpgradesRegistry) {
                window.UpgradesRegistry.recalculateBonuses();
            }
            
            AudioEngine.playBuy();
            GameState.saveGame();
            return true;
        }
        return false;
    },

    calculatePendingNanocores() {
        if (GameState.level < 10) return 0;
        // 10,000 credits -> 1 nanocore, 40,000 -> 2 nanocores, etc.
        return Math.floor(Math.sqrt(GameState.totalEarnedThisRun / 10000));
    },

    canReboot() {
        return GameState.level >= 10;
    },

    performReboot() {
        if (!this.canReboot()) return false;

        const pending = this.calculatePendingNanocores();
        GameState.nanocores += pending;

        // Reset variables for new run
        GameState.credits = 0;
        GameState.totalEarnedThisRun = 0;
        GameState.level = 1;
        GameState.exp = 0;
        GameState.nextLevelExp = GameState.BASE_XP;
        
        // Save persistent upgrades to restore them
        const savedNanoTapsLevel = window.UpgradesRegistry ? window.UpgradesRegistry.getLevel('click_01') : 0;
        const hasPersistentCache = this.getLevel('pres_cache') > 0;

        // Reset basic upgrades and autoclickers
        GameState.upgrades = {};
        GameState.autoclickers = {};
        
        // Restore upgrades if persistent cache is purchased
        if (hasPersistentCache && savedNanoTapsLevel > 0) {
            GameState.upgrades['click_01'] = savedNanoTapsLevel;
        }

        // Reset buffs
        GameState.buffs = {
            multiplier: 1.0,
            multiplierEndTime: 0,
            boostCpsMultiplier: 1.0,
            boostCpsEndTime: 0
        };

        // Recalculate
        if (window.UpgradesRegistry) {
            window.UpgradesRegistry.recalculateBonuses();
        }

        // Save & reload UI
        GameState.saveGame();
        
        // Play level up for celebration
        AudioEngine.playLevelUp();
        
        return true;
    }
};

window.PrestigeRegistry = PrestigeRegistry;
