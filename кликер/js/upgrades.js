/**
 * Upgrades Registry and Shop Operations
 */
const UpgradesRegistry = {
    // List of active upgrades in the shop
    data: [
        {
            id: 'click_01',
            name: 'Квантовые нано-клики',
            desc: 'Разгоняет ввод кликов на физическом уровне. Увеличивает силу клика на +1.',
            baseCost: 15,
            costMult: 1.15,
            type: 'click_flat',
            val: 1,
            maxLvl: null,
            icon: '⚡'
        },
        {
            id: 'click_02',
            name: 'Азотное охлаждение ядра',
            desc: 'Предотвращает перегрев при быстром кликании. Увеличивает силу клика на +5.',
            baseCost: 150,
            costMult: 1.15,
            type: 'click_flat',
            val: 5,
            maxLvl: null,
            icon: '❄️'
        },
        {
            id: 'click_03',
            name: 'Сверхпроводящие транзисторы',
            desc: 'Обеспечивает передачу импульсов без задержек. Увеличивает силу клика на +25.',
            baseCost: 1200,
            costMult: 1.18,
            type: 'click_flat',
            val: 25,
            maxLvl: null,
            icon: '🧬'
        },
        {
            id: 'click_04',
            name: 'Нейроинтерфейсная связь',
            desc: 'Подключает вашу кору напрямую к ядру. Увеличивает силу клика на +150.',
            baseCost: 9500,
            costMult: 1.20,
            type: 'click_flat',
            val: 150,
            maxLvl: null,
            icon: '🧠'
        },
        {
            id: 'click_05',
            name: 'Хроносдвиговый разгонщик',
            desc: 'Искривляет время для удвоения эффективности кликов. Увеличивает силу клика на +1000.',
            baseCost: 85000,
            costMult: 1.22,
            type: 'click_flat',
            val: 1000,
            maxLvl: null,
            icon: '🌀'
        },
        {
            id: 'crit_01',
            name: 'Предиктивные ИИ-алгоритмы',
            desc: 'Анализирует уязвимости ядра для совершения критических кликов. Шанс крита +2.5%.',
            baseCost: 300,
            costMult: 1.35,
            type: 'crit_chance',
            val: 0.025,
            maxLvl: 20,
            icon: '🎯'
        },
        {
            id: 'crit_02',
            name: 'Гармонизатор резонансных волн',
            desc: 'Усиливает всплески критических кликов. Множитель критического урона +0.5x.',
            baseCost: 800,
            costMult: 1.40,
            type: 'crit_mult',
            val: 0.5,
            maxLvl: 10,
            icon: '💥'
        },
        {
            id: 'global_01',
            name: 'Квантовый компилятор V2',
            desc: 'Оптимизирует кодовую базу. Увеличивает силу клика и пассивный доход (CPS) на +10%.',
            baseCost: 2000,
            costMult: 1.45,
            type: 'global_mult',
            val: 0.10,
            maxLvl: null,
            icon: '💻'
        }
    ],

    // Return the level of an upgrade
    getLevel(upgradeId) {
        return GameState.upgrades[upgradeId] || 0;
    },

    // Calculate current cost based on level
    getCost(upgrade) {
        const lvl = this.getLevel(upgrade.id);
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, lvl));
    },

    // Check if max level reached
    isMaxLevel(upgrade) {
        if (!upgrade.maxLvl) return false;
        return this.getLevel(upgrade.id) >= upgrade.maxLvl;
    },

    // Try to purchase upgrade
    buyUpgrade(upgradeId) {
        const upgrade = this.data.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        if (this.isMaxLevel(upgrade)) return false;

        const cost = this.getCost(upgrade);
        if (GameState.spendCredits(cost)) {
            GameState.upgrades[upgradeId] = this.getLevel(upgradeId) + 1;
            GameState.stats.upgradesBought++;
            
            // Recalculate parameters immediately
            this.recalculateBonuses();
            
            AudioEngine.playBuy();
            GameState.saveGame();
            
            // Check Achievements
            if (window.Game && Game.AchievementsRegistry) {
                Game.AchievementsRegistry.checkUnlocks();
            }

            return true;
        }
        return false;
    },

    // Recalculate click power and attributes
    recalculateBonuses() {
        let basePower = 1;
        let bonusCritChance = 0.05; // 5% base
        let bonusCritMult = 2.0;    // 2x base
        let globalMult = 1.0;

        this.data.forEach(upgrade => {
            const lvl = this.getLevel(upgrade.id);
            if (lvl === 0) return;

            switch (upgrade.type) {
                case 'click_flat':
                    basePower += upgrade.val * lvl;
                    break;
                case 'crit_chance':
                    bonusCritChance += upgrade.val * lvl;
                    break;
                case 'crit_mult':
                    bonusCritMult += upgrade.val * lvl;
                    break;
                case 'global_mult':
                    globalMult += upgrade.val * lvl;
                    break;
            }
        });

        // Apply Prestige Critical Overload upgrade (+0.5x per level)
        if (window.PrestigeRegistry) {
            const critOverloadLvl = window.PrestigeRegistry.getLevel('pres_crit_mult');
            bonusCritMult += critOverloadLvl * 0.5;
        }

        // Apply Nanocores multiplier (+2% per Nanocore)
        const nanocoresMult = 1.0 + (GameState.nanocores || 0) * 0.02;

        GameState.clickPower = Math.max(1, Math.floor(basePower * globalMult * nanocoresMult));
        GameState.critChance = Math.min(1.0, bonusCritChance);
        GameState.critMultiplier = bonusCritMult;

        // Recalculate autoclickers too
        if (window.Game && Game.AutoclickerRegistry) {
            Game.AutoclickerRegistry.recalculateCPS();
        }
    }
};
// Make globally available
window.UpgradesRegistry = UpgradesRegistry;
