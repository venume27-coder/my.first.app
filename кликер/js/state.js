/**
 * Game State and Core Math Module
 */
const GameState = {
    // Current live state
    credits: 0,
    totalCreditsEarned: 0,
    totalEarnedThisRun: 0,
    nanocores: 0,
    prestigeUpgrades: {},
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    
    // Core parameters (calculated based on upgrades)
    clickPower: 1,
    critChance: 0.05, // 5% base
    critMultiplier: 2, // 2x base
    cps: 0, // Credits Per Second

    // Upgrades and Autoclickers counts
    upgrades: {},
    autoclickers: {},
    
    // Systems state
    unlockedAchievements: [],
    dailyRewardStreak: 0,
    dailyRewardLastClaim: 0, // Timestamp
    wheelLastFreeSpin: 0,    // Timestamp
    
    // Stats tracking
    stats: {
        totalClicks: 0,
        totalEarned: 0,
        upgradesBought: 0,
        wheelSpins: 0,
        eventsClicked: 0,
        timePlayed: 0, // in seconds
        maxCps: 0,
        maxClick: 0
    },

    // Current buffs / active events
    buffs: {
        multiplier: 1.0,
        multiplierEndTime: 0,
        boostCpsMultiplier: 1.0,
        boostCpsEndTime: 0
    },

    // Constants
    SAVE_KEY: 'cybercore_game_save_v1',
    LEVEL_XP_MULTIPLIER: 1.5,
    BASE_XP: 100,

    init() {
        this.resetToDefaults(false);
        this.loadGame();
        
        // Start play time ticker
        setInterval(() => {
            this.stats.timePlayed++;
            this.updateBuffs();
        }, 1000);
    },

    resetToDefaults(triggerSave = true) {
        this.credits = 0;
        this.totalCreditsEarned = 0;
        this.totalEarnedThisRun = 0;
        this.nanocores = 0;
        this.prestigeUpgrades = {};
        this.level = 1;
        this.exp = 0;
        this.nextLevelExp = this.BASE_XP;
        
        this.clickPower = 1;
        this.critChance = 0.05;
        this.critMultiplier = 2;
        this.cps = 0;

        this.upgrades = {};
        this.autoclickers = {};
        this.unlockedAchievements = [];
        this.dailyRewardStreak = 0;
        this.dailyRewardLastClaim = 0;
        this.wheelLastFreeSpin = 0;

        this.stats = {
            totalClicks: 0,
            totalEarned: 0,
            upgradesBought: 0,
            wheelSpins: 0,
            eventsClicked: 0,
            timePlayed: 0,
            maxCps: 0,
            maxClick: 0
        };

        this.buffs = {
            multiplier: 1.0,
            multiplierEndTime: 0,
            boostCpsMultiplier: 1.0,
            boostCpsEndTime: 0
        };

        if (triggerSave) {
            this.saveGame();
        }
    },

    saveGame() {
        const saveData = {
            credits: this.credits,
            totalCreditsEarned: this.totalCreditsEarned,
            totalEarnedThisRun: this.totalEarnedThisRun,
            nanocores: this.nanocores,
            prestigeUpgrades: this.prestigeUpgrades,
            level: this.level,
            exp: this.exp,
            nextLevelExp: this.nextLevelExp,
            upgrades: this.upgrades,
            autoclickers: this.autoclickers,
            unlockedAchievements: this.unlockedAchievements,
            dailyRewardStreak: this.dailyRewardStreak,
            dailyRewardLastClaim: this.dailyRewardLastClaim,
            wheelLastFreeSpin: this.wheelLastFreeSpin,
            stats: this.stats,
            buffs: this.buffs
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    },

    loadGame() {
        const saved = localStorage.getItem(this.SAVE_KEY);
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            this.credits = data.credits ?? 0;
            this.totalCreditsEarned = data.totalCreditsEarned ?? 0;
            this.totalEarnedThisRun = data.totalEarnedThisRun ?? 0;
            this.nanocores = data.nanocores ?? 0;
            this.prestigeUpgrades = data.prestigeUpgrades ?? {};
            this.level = data.level ?? 1;
            this.exp = data.exp ?? 0;
            this.nextLevelExp = data.nextLevelExp ?? this.BASE_XP;
            this.upgrades = data.upgrades ?? {};
            this.autoclickers = data.autoclickers ?? {};
            this.unlockedAchievements = data.unlockedAchievements ?? [];
            this.dailyRewardStreak = data.dailyRewardStreak ?? 0;
            this.dailyRewardLastClaim = data.dailyRewardLastClaim ?? 0;
            this.wheelLastFreeSpin = data.wheelLastFreeSpin ?? 0;
            
            if (data.stats) {
                this.stats = { ...this.stats, ...data.stats };
            }
            if (data.buffs) {
                this.buffs = { ...this.buffs, ...data.buffs };
            }
        } catch (e) {
            console.error("Failed to load game save. Using defaults.", e);
        }
    },

    addCredits(amount) {
        if (amount <= 0) return;
        
        // Apply global active multipliers
        const finalAmount = amount * this.getActiveMultiplier();
        this.credits += finalAmount;
        this.totalCreditsEarned += finalAmount;
        this.totalEarnedThisRun += finalAmount;
        this.stats.totalEarned += finalAmount;

        // Check level-up and achievements
        this.gainExp(Math.max(1, Math.floor(finalAmount * 0.1)));
        
        if (this.stats.totalEarned > this.stats.maxClick) {
            // Checked inside click handler or overall max
        }
        return finalAmount;
    },

    spendCredits(amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            this.saveGame();
            return true;
        }
        return false;
    },

    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        while (this.exp >= this.nextLevelExp) {
            this.exp -= this.nextLevelExp;
            this.level++;
            this.nextLevelExp = Math.floor(this.BASE_XP * Math.pow(this.LEVEL_XP_MULTIPLIER, this.level - 1));
            leveledUp = true;
        }

        if (leveledUp) {
            AudioEngine.playLevelUp();
            if (window.Game && Game.UI) {
                Game.UI.triggerLevelUpEffect(this.level);
            }
        }
    },

    // Buff handlers
    getActiveMultiplier() {
        let mult = 1.0;
        const now = Date.now();
        if (now < this.buffs.multiplierEndTime) {
            mult *= this.buffs.multiplier;
        }
        return mult;
    },

    getActiveCpsMultiplier() {
        let mult = 1.0;
        const now = Date.now();
        if (now < this.buffs.boostCpsEndTime) {
            mult *= this.buffs.boostCpsMultiplier;
        }
        return mult;
    },

    addBuff(type, multiplier, durationMs) {
        const now = Date.now();
        if (type === 'global') {
            this.buffs.multiplier = multiplier;
            this.buffs.multiplierEndTime = now + durationMs;
        } else if (type === 'cps') {
            this.buffs.boostCpsMultiplier = multiplier;
            this.buffs.boostCpsEndTime = now + durationMs;
        }
        this.saveGame();
    },

    updateBuffs() {
        const now = Date.now();
        // Check if any buff expired just now to update UI
        let changed = false;
        if (this.buffs.multiplierEndTime > 0 && now >= this.buffs.multiplierEndTime) {
            this.buffs.multiplierEndTime = 0;
            this.buffs.multiplier = 1.0;
            changed = true;
        }
        if (this.buffs.boostCpsEndTime > 0 && now >= this.buffs.boostCpsEndTime) {
            this.buffs.boostCpsEndTime = 0;
            this.buffs.boostCpsMultiplier = 1.0;
            changed = true;
        }
        if (changed) {
            this.saveGame();
            if (window.Game && Game.UI) {
                Game.UI.updateBuffDisplay();
            }
        }
    },

    // Number formatting: Scientific/Idle notation
    // 1200 -> 1.20 K
    // 1450000 -> 1.45 M
    formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num < 1000) {
            return num % 1 === 0 ? num.toString() : num.toFixed(1);
        }
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const i = Math.floor(Math.log10(num) / 3);
        
        if (i >= suffixes.length) {
            return num.toExponential(2);
        }

        const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
        return `${formatted} ${suffixes[i]}`;
    },

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins < 60) return `${mins}m ${secs}s`;
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        return `${hrs}h ${remMins}m`;
    }
};
