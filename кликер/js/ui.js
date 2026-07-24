/**
 * User Interface Controller Module
 */
const UI = {
    // DOM Cache
    elements: {},
    tabButtons: [],
    tabContents: [],

    init() {
        this.cacheElements();
        this.setupTabs();
        this.setupEventListeners();
        this.setupSettingsListeners();
        
        // Initial setup for specific components
        if (this.elements['wheel-canvas']) {
            WheelOfFortune.setCanvas(this.elements['wheel-canvas']);
        }
        
        // Initial render
        this.renderAll();
        
        // Start timers
        this.startUiTickers();
    },

    cacheElements() {
        const ids = [
            'credits-display', 'cps-display', 'level-display', 
            'exp-progress-bar', 'exp-text',
            'click-core', 'core-rings',
            'shop-upgrades-container', 'shop-autoclickers-container',
            'daily-grid', 'daily-claim-btn', 'daily-countdown',
            'wheel-canvas', 'wheel-spin-btn', 'wheel-free-lbl', 'wheel-spin-cost',
            'achievements-grid', 'ach-unlocked-count', 'ach-total-count', 'ach-multiplier-val',
            'stat-total-clicks', 'stat-total-earned', 'stat-cps', 'stat-max-cps', 
            'stat-upgrades-bought', 'stat-wheel-spins', 'stat-events-clicked', 
            'stat-time-played', 'stat-level', 'stat-achievements',
            'volume-range', 'toggle-mute-btn', 'toggle-music-btn', 'toggle-anim-btn',
            'reset-progress-btn',
            'choice-modal', 'choice-modal-title', 'choice-modal-text', 
            'choice-btn-1', 'choice-btn-2',
            'wheel-win-modal', 'win-prize-icon', 'win-prize-name', 'win-prize-desc', 'win-close-btn',
            'toast-container',
            'buff-display-container',
            'prestige-nanocores', 'prestige-pending', 'prestige-reboot-btn', 'prestige-upgrades-container'
        ];

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                this.elements[id] = el;
            } else {
                console.warn(`Element with ID '${id}' not found in DOM`);
            }
        });

        // Cache tabs
        this.tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        this.tabContents = Array.from(document.querySelectorAll('.tab-content'));
    },

    setupTabs() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update active buttons
                this.tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active content
                this.tabContents.forEach(content => {
                    if (content.id === `${tabName}-tab`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                // Redraw wheel canvas if it's the wheel tab
                if (tabName === 'wheel') {
                    setTimeout(() => {
                        WheelOfFortune.drawWheel();
                    }, 50);
                }

                // Play click sound
                AudioEngine.playClick(false);
            });
        });
    },

    setupEventListeners() {
        // Core interaction
        if (this.elements['click-core']) {
            this.elements['click-core'].addEventListener('mousedown', (e) => {
                this.handleCoreClick(e);
            });
        }

        // Daily login claim
        if (this.elements['daily-claim-btn']) {
            this.elements['daily-claim-btn'].addEventListener('click', () => {
                const claimed = DailyRewardsRegistry.claim();
                if (claimed) {
                    this.showToast(`Получена награда: ${claimed.name}!`, '#39ff14');
                    this.renderDailyCalendar();
                    this.updateCurrencyDisplay();
                }
            });
        }

        // Wheel spin
        if (this.elements['wheel-spin-btn']) {
            this.elements['wheel-spin-btn'].addEventListener('click', () => {
                if (WheelOfFortune.isSpinning) return;
                const isFree = WheelOfFortune.isFreeSpinAvailable();
                WheelOfFortune.spin(isFree);
            });
        }

        // Wheel modal close
        if (this.elements['win-close-btn']) {
            this.elements['win-close-btn'].addEventListener('click', () => {
                this.elements['wheel-win-modal'].classList.remove('active');
            });
        }

        // Prestige Reboot
        if (this.elements['prestige-reboot-btn']) {
            this.elements['prestige-reboot-btn'].addEventListener('click', () => {
                const pending = PrestigeRegistry.calculatePendingNanocores();
                if (confirm(`ИНИЦИАЛИЗАЦИЯ ПЕРЕЗАГРУЗКИ ЯДРА. Вы получите +${pending} Наноядер.\n\nЭто сбросит ваши текущие кредиты, уровень, улучшения и пассивные узлы.\nВы уверены, что хотите продолжить?`)) {
                    if (PrestigeRegistry.performReboot()) {
                        this.showToast(`ПЕРЕЗАГРУЗКА ЯДРА ЗАВЕРШЕНА! Получено ${pending} Наноядер.`, '#ff007f');
                        this.renderAll();
                    }
                }
            });
        }
    },

    setupSettingsListeners() {
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                SettingsManager.setTheme(btn.dataset.theme);
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AudioEngine.playClick(false);
            });
        });

        // Volume slider
        if (this.elements['volume-range']) {
            this.elements['volume-range'].addEventListener('input', (e) => {
                SettingsManager.setVolume(e.target.value);
            });
        }

        // Mute button
        if (this.elements['toggle-mute-btn']) {
            this.elements['toggle-mute-btn'].addEventListener('click', () => {
                const isMuted = SettingsManager.toggleMute();
                this.updateSettingsControls();
                AudioEngine.playClick(false);
            });
        }

        // Music button
        if (this.elements['toggle-music-btn']) {
            this.elements['toggle-music-btn'].addEventListener('click', () => {
                const isMusic = SettingsManager.toggleMusic();
                this.updateSettingsControls();
                AudioEngine.playClick(false);
            });
        }

        // Animations button
        if (this.elements['toggle-anim-btn']) {
            this.elements['toggle-anim-btn'].addEventListener('click', () => {
                const isAnimDisabled = SettingsManager.toggleAnimations();
                this.updateSettingsControls();
                AudioEngine.playClick(false);
            });
        }

        // Reset progress button
        if (this.elements['reset-progress-btn']) {
            this.elements['reset-progress-btn'].addEventListener('click', () => {
                SettingsManager.confirmResetProgress();
            });
        }
    },

    updateSettingsControls() {
        const s = SettingsManager.settings;
        if (this.elements['volume-range']) {
            this.elements['volume-range'].value = s.volume;
        }

        if (this.elements['toggle-mute-btn']) {
            this.elements['toggle-mute-btn'].innerHTML = s.muted ? '🔊 Включить звуки' : '🔇 Выключить звуки';
            this.elements['toggle-mute-btn'].classList.toggle('active', s.muted);
        }

        if (this.elements['toggle-music-btn']) {
            this.elements['toggle-music-btn'].innerHTML = s.musicEnabled ? '🎵 Выключить музыку' : '🎵 Включить музыку';
            this.elements['toggle-music-btn'].classList.toggle('active', s.musicEnabled);
        }

        if (this.elements['toggle-anim-btn']) {
            this.elements['toggle-anim-btn'].innerHTML = s.disableAnimations ? '✨ Включить эффекты' : '✨ Отключить эффекты';
            this.elements['toggle-anim-btn'].classList.toggle('active', s.disableAnimations);
        }

        // Set active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === s.theme);
        });
    },

    handleCoreClick(e) {
        // Calculate critical click
        const isCrit = Math.random() < GameState.critChance;
        const multiplier = isCrit ? GameState.critMultiplier : 1.0;
        const baseEarned = GameState.clickPower * multiplier;

        // Add credits
        const finalEarned = GameState.addCredits(baseEarned);
        
        GameState.stats.totalClicks++;

        // Visual squash and stretch on Core
        if (this.elements['click-core'] && !SettingsManager.settings.disableAnimations) {
            this.elements['click-core'].classList.remove('clicked');
            void this.elements['click-core'].offsetWidth; // Trigger reflow
            this.elements['click-core'].classList.add('clicked');
        }

        // Audio
        AudioEngine.playClick(isCrit);

        // Spawn flying floating text
        this.spawnFloatingText(`+${GameState.formatNumber(finalEarned)}`, e.clientX, e.clientY, isCrit);

        // Spawn hit particles
        const particleColor = isCrit ? '#ffb300' : '#00f0ff';
        this.spawnClickParticles(e.clientX, e.clientY, isCrit ? 12 : 5, particleColor);

        // Check Achievements
        if (window.AchievementsRegistry) {
            window.AchievementsRegistry.checkUnlocks();
        }

        this.updateCurrencyDisplay();
    },

    renderAll() {
        this.updateCurrencyDisplay();
        this.renderUpgrades();
        this.renderAutoclickers();
        this.renderDailyCalendar();
        this.renderAchievements();
        this.renderPrestige();
        this.updateStatsDisplay();
        this.updateSettingsControls();
        this.updateBuffDisplay();
    },

    updateCurrencyDisplay() {
        if (this.elements['credits-display']) {
            this.elements['credits-display'].innerText = GameState.formatNumber(GameState.credits);
        }
        if (this.elements['cps-display']) {
            this.elements['cps-display'].innerText = GameState.formatNumber(GameState.cps);
        }
        if (this.elements['level-display']) {
            this.elements['level-display'].innerText = `Lvl ${GameState.level}`;
        }
        
        // Progress bar
        if (this.elements['exp-progress-bar']) {
            const percentage = Math.min(100, (GameState.exp / GameState.nextLevelExp) * 100);
            this.elements['exp-progress-bar'].style.width = `${percentage}%`;
        }

        if (this.elements['exp-text']) {
            this.elements['exp-text'].innerText = `${GameState.formatNumber(GameState.exp)} / ${GameState.formatNumber(GameState.nextLevelExp)} XP`;
        }

        this.updatePrestigeTickInfo();

        // Update purchase eligibility on shops (dynamic grey out)
        this.refreshShopPurchasability();
    },

    refreshShopPurchasability() {
        // Check upgrades
        document.querySelectorAll('.upgrade-buy-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            const maxed = btn.dataset.maxed === 'true';
            btn.disabled = maxed || GameState.credits < cost;
        });

        // Check autoclicker buys
        document.querySelectorAll('.auto-buy-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            btn.disabled = GameState.credits < cost;
        });

        // Check autoclicker upgrades
        document.querySelectorAll('.auto-upgrade-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            const owned = parseInt(btn.dataset.owned);
            btn.disabled = owned === 0 || GameState.credits < cost;
        });

        // Check Wheel of Fortune button
        if (this.elements['wheel-spin-btn']) {
            const isFree = WheelOfFortune.isFreeSpinAvailable();
            const cost = WheelOfFortune.getSpinCost();
            if (isFree) {
                this.elements['wheel-spin-btn'].disabled = WheelOfFortune.isSpinning;
            } else {
                this.elements['wheel-spin-btn'].disabled = WheelOfFortune.isSpinning || GameState.credits < cost;
            }
        }

        // Check prestige upgrades
        document.querySelectorAll('.prestige-buy-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            const maxed = btn.dataset.maxed === 'true';
            btn.disabled = maxed || GameState.nanocores < cost;
        });
    },

    renderUpgrades() {
        const container = this.elements['shop-upgrades-container'];
        if (!container) return;

        container.innerHTML = '';

        UpgradesRegistry.data.forEach(upg => {
            const lvl = UpgradesRegistry.getLevel(upg.id);
            const cost = UpgradesRegistry.getCost(upg);
            const isMax = UpgradesRegistry.isMaxLevel(upg);

            const card = document.createElement('div');
            card.className = `shop-card ${isMax ? 'maxed' : ''}`;
            card.innerHTML = `
                <div class="card-icon-wrapper">
                    <span class="card-icon">${upg.icon}</span>
                </div>
                <div class="card-details">
                    <div class="card-header">
                        <span class="card-title">${upg.name}</span>
                        <span class="card-badge">Ур. ${lvl}${upg.maxLvl ? `/${upg.maxLvl}` : ''}</span>
                    </div>
                    <p class="card-desc">${upg.desc}</p>
                    <div class="card-footer">
                        <span class="card-price">${isMax ? 'МАКСИМУМ' : `⚡ ${GameState.formatNumber(cost)}`}</span>
                        <button class="shop-btn upgrade-buy-btn" data-id="${upg.id}" data-cost="${cost}" data-maxed="${isMax}">
                            ${isMax ? 'МАКС' : 'УСТАНОВИТЬ'}
                        </button>
                    </div>
                </div>
            `;

            const btn = card.querySelector('.upgrade-buy-btn');
            btn.addEventListener('click', () => {
                if (UpgradesRegistry.buyUpgrade(upg.id)) {
                    this.renderUpgrades();
                    this.renderAutoclickers();
                    this.updateCurrencyDisplay();
                    this.updateStatsDisplay();
                }
            });

            container.appendChild(card);
        });
    },

    renderAutoclickers() {
        const container = this.elements['shop-autoclickers-container'];
        if (!container) return;

        container.innerHTML = '';

        AutoclickerRegistry.data.forEach(auto => {
            const count = AutoclickerRegistry.getCount(auto.id);
            const lvl = AutoclickerRegistry.getUpgradeLevel(auto.id);
            const cost = AutoclickerRegistry.getCost(auto);
            const upgradeCost = AutoclickerRegistry.getUpgradeCost(auto);
            const totalCps = AutoclickerRegistry.getCpsForType(auto);

            const card = document.createElement('div');
            card.className = `shop-card ${count > 0 ? 'owned' : ''}`;
            card.innerHTML = `
                <div class="card-icon-wrapper">
                    <span class="card-icon">${auto.icon}</span>
                </div>
                <div class="card-details flex-col">
                    <div class="card-header">
                        <span class="card-title">${auto.name}</span>
                        <span class="card-badge neon-green">${count} Шт.</span>
                    </div>
                    <p class="card-desc">${auto.desc}</p>
                    <div class="card-stats">
                        <span>Пассивный доход: +${GameState.formatNumber(totalCps)}/с</span>
                        <span>Ядро узла: v${lvl + 1}</span>
                    </div>
                    <div class="card-footer double-btn-row">
                        <div class="shop-btn-col">
                            <span class="btn-label">Купить узел</span>
                            <button class="shop-btn auto-buy-btn" data-id="${auto.id}" data-cost="${cost}">
                                ⚡ ${GameState.formatNumber(cost)}
                            </button>
                        </div>
                        <div class="shop-btn-col">
                            <span class="btn-label">Улучшить код</span>
                            <button class="shop-btn auto-upgrade-btn secondary" data-id="${auto.id}" data-cost="${upgradeCost}" data-owned="${count}">
                                ⚡ ${GameState.formatNumber(upgradeCost)}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Buy structure listener
            card.querySelector('.auto-buy-btn').addEventListener('click', () => {
                if (AutoclickerRegistry.buyAutoclicker(auto.id)) {
                    this.renderAutoclickers();
                    this.updateCurrencyDisplay();
                    this.updateStatsDisplay();
                }
            });

            // Buy upgrade listener
            card.querySelector('.auto-upgrade-btn').addEventListener('click', () => {
                if (AutoclickerRegistry.buyAutoclickerUpgrade(auto.id)) {
                    this.renderAutoclickers();
                    this.updateCurrencyDisplay();
                    this.updateStatsDisplay();
                }
            });

            container.appendChild(card);
        });
    },

    renderDailyCalendar() {
        const grid = this.elements['daily-grid'];
        const claimBtn = this.elements['daily-claim-btn'];
        if (!grid || !claimBtn) return;

        grid.innerHTML = '';
        
        const streak = GameState.dailyRewardStreak;
        const currentRewardIndex = streak % 7;
        const status = DailyRewardsRegistry.getStatus();

        DailyRewardsRegistry.rewards.forEach((reward, index) => {
            const card = document.createElement('div');
            card.className = 'daily-card';
            
            let badge = `День ${reward.day}`;
            if (index < currentRewardIndex && status !== 'reset') {
                card.classList.add('claimed');
                badge = '✓ Получено';
            } else if (index === currentRewardIndex && status !== 'locked') {
                card.classList.add('active');
                badge = '★ Готово';
            } else {
                card.classList.add('locked');
            }

            card.innerHTML = `
                <div class="daily-badge">${badge}</div>
                <div class="daily-icon">${reward.icon}</div>
                <div class="daily-reward-name">${reward.name}</div>
                <div class="daily-reward-val">${reward.type === 'credits' ? `+${GameState.formatNumber(reward.value)}` : 'АКТИВНЫЙ БУСТ'}</div>
            `;
            grid.appendChild(card);
        });

        // Set Claim Button Status
        if (status === 'claimable' || status === 'reset') {
            claimBtn.disabled = false;
            claimBtn.innerText = 'ЗАБРАТЬ НАГРАДУ';
            if (this.elements['daily-countdown']) {
                this.elements['daily-countdown'].style.display = 'none';
            }
        } else {
            claimBtn.disabled = true;
            claimBtn.innerText = 'БЛОК';
            if (this.elements['daily-countdown']) {
                this.elements['daily-countdown'].style.display = 'block';
                this.updateDailyCountdown();
            }
        }
    },

    updateDailyCountdown() {
        const cdLabel = this.elements['daily-countdown'];
        if (!cdLabel || DailyRewardsRegistry.getStatus() !== 'locked') return;

        const timeMs = DailyRewardsRegistry.getTimeRemaining();
        if (timeMs <= 0) {
            this.renderDailyCalendar();
            return;
        }

        const totalSecs = Math.floor(timeMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        const fHrs = hrs.toString().padStart(2, '0');
        const fMins = mins.toString().padStart(2, '0');
        const fSecs = secs.toString().padStart(2, '0');

        cdLabel.innerText = `Следующая награда через: ${fHrs}:${fMins}:${fSecs}`;
    },

    renderAchievements() {
        const grid = this.elements['achievements-grid'];
        if (!grid) return;

        grid.innerHTML = '';

        let unlockedCount = 0;
        AchievementsRegistry.data.forEach(ach => {
            const isUnlocked = AchievementsRegistry.isUnlocked(ach.id);
            if (isUnlocked) unlockedCount++;

            const card = document.createElement('div');
            card.className = `ach-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="ach-icon-wrapper">
                    <span class="ach-icon">${isUnlocked ? ach.icon : '🔒'}</span>
                </div>
                <div class="ach-details">
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${ach.desc}</div>
                </div>
                <div class="ach-reward-badge">+2% Глобальный буст</div>
            `;
            grid.appendChild(card);
        });

        // Update indicators
        if (this.elements['ach-unlocked-count']) {
            this.elements['ach-unlocked-count'].innerText = unlockedCount;
        }
        if (this.elements['ach-total-count']) {
            this.elements['ach-total-count'].innerText = AchievementsRegistry.data.length;
        }
        if (this.elements['ach-multiplier-val']) {
            const bonusMultPercent = Math.round((AchievementsRegistry.getMultiplier() - 1.0) * 100);
            this.elements['ach-multiplier-val'].innerText = `+${bonusMultPercent}%`;
        }
    },

    renderPrestige() {
        const nanocoresEl = this.elements['prestige-nanocores'];
        const pendingEl = this.elements['prestige-pending'];
        const rebootBtn = this.elements['prestige-reboot-btn'];
        const container = this.elements['prestige-upgrades-container'];

        if (nanocoresEl) nanocoresEl.innerText = GameState.nanocores;
        
        const pending = PrestigeRegistry.calculatePendingNanocores();
        if (pendingEl) pendingEl.innerText = `+${pending}`;

        if (rebootBtn) {
            const canReboot = PrestigeRegistry.canReboot();
            rebootBtn.disabled = !canReboot;
            if (canReboot) {
                rebootBtn.innerText = `ВЫПОЛНИТЬ ПЕРЕЗАГРУЗКУ (+${pending} Наноядер)`;
            } else {
                rebootBtn.innerText = `ВЫПОЛНИТЬ ПЕРЕЗАГРУЗКУ (Требуется 10 ур.)`;
            }
        }

        if (!container) return;
        container.innerHTML = '';

        PrestigeRegistry.data.forEach(upg => {
            const lvl = PrestigeRegistry.getLevel(upg.id);
            const cost = PrestigeRegistry.getCost(upg);
            const isMax = PrestigeRegistry.isMaxLevel(upg);

            const card = document.createElement('div');
            card.className = `shop-card ${isMax ? 'maxed' : ''}`;
            card.innerHTML = `
                <div class="card-icon-wrapper">
                    <span class="card-icon">${upg.icon}</span>
                </div>
                <div class="card-details">
                    <div class="card-header">
                        <span class="card-title">${upg.name}</span>
                        <span class="card-badge">Ур. ${lvl}${upg.maxLvl ? `/${upg.maxLvl}` : ''}</span>
                    </div>
                    <p class="card-desc">${upg.desc}</p>
                    <div class="card-footer">
                        <span class="card-price">${isMax ? 'МАКСИМУМ' : `💎 ${cost}`}</span>
                        <button class="shop-btn prestige-buy-btn" data-id="${upg.id}" data-cost="${cost}" data-maxed="${isMax}">
                            ${isMax ? 'МАКС' : 'УСТАНОВИТЬ'}
                        </button>
                    </div>
                </div>
            `;

            const btn = card.querySelector('.prestige-buy-btn');
            btn.addEventListener('click', () => {
                if (PrestigeRegistry.buyUpgrade(upg.id)) {
                    this.renderPrestige();
                    this.renderAll();
                    this.showToast(`Установлен мод ядра: ${upg.name}!`, '#00f0ff');
                }
            });

            container.appendChild(card);
        });
    },

    updatePrestigeTickInfo() {
        const pendingEl = this.elements['prestige-pending'];
        const rebootBtn = this.elements['prestige-reboot-btn'];
        const nanocoresEl = this.elements['prestige-nanocores'];

        if (nanocoresEl) {
            nanocoresEl.innerText = GameState.nanocores;
        }

        const pending = PrestigeRegistry.calculatePendingNanocores();
        if (pendingEl) {
            pendingEl.innerText = `+${pending}`;
        }

        if (rebootBtn) {
            const canReboot = PrestigeRegistry.canReboot();
            rebootBtn.disabled = !canReboot;
            if (canReboot) {
                rebootBtn.innerText = `ВЫПОЛНИТЬ ПЕРЕЗАГРУЗКУ (+${pending} Наноядер)`;
            } else {
                rebootBtn.innerText = `ВЫПОЛНИТЬ ПЕРЕЗАГРУЗКУ (Требуется 10 ур.)`;
            }
        }
    },

    updateStatsDisplay() {
        const stats = GameState.stats;
        
        const mappings = {
            'stat-total-clicks': stats.totalClicks,
            'stat-total-earned': GameState.formatNumber(stats.totalEarned),
            'stat-cps': GameState.formatNumber(GameState.cps),
            'stat-max-cps': GameState.formatNumber(stats.maxCps),
            'stat-upgrades-bought': stats.upgradesBought,
            'stat-wheel-spins': stats.wheelSpins,
            'stat-events-clicked': stats.eventsClicked,
            'stat-time-played': GameState.formatTime(stats.timePlayed),
            'stat-level': GameState.level,
            'stat-achievements': `${GameState.unlockedAchievements.length} / ${AchievementsRegistry.data.length}`
        };

        for (const [id, value] of Object.entries(mappings)) {
            if (this.elements[id]) {
                this.elements[id].innerText = value;
            }
        }
    },

    updateWheelTabControls() {
        if (!this.elements['wheel-spin-btn']) return;

        const isFree = WheelOfFortune.isFreeSpinAvailable();
        const countdownLabel = this.elements['wheel-free-lbl'];
        const priceLabel = this.elements['wheel-spin-cost'];

        if (isFree) {
            priceLabel.innerText = 'БЕСПЛАТНО';
            countdownLabel.innerText = 'Бесплатное вращение доступно!';
            countdownLabel.classList.add('neon-green');
            countdownLabel.classList.remove('locked');
        } else {
            const cost = WheelOfFortune.getSpinCost();
            priceLabel.innerText = `⚡ ${GameState.formatNumber(cost)}`;
            
            // Countdown ticker
            const timeMs = WheelOfFortune.getTimeRemaining();
            const totalSecs = Math.floor(timeMs / 1000);
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            
            const fHrs = hrs.toString().padStart(2, '0');
            const fMins = mins.toString().padStart(2, '0');
            const fSecs = secs.toString().padStart(2, '0');
            
            countdownLabel.innerText = `Бесплатный спин через: ${fHrs}:${fMins}:${fSecs}`;
            countdownLabel.classList.remove('neon-green');
            countdownLabel.classList.add('locked');
        }
    },

    updateBuffDisplay() {
        const container = this.elements['buff-display-container'];
        if (!container) return;

        container.innerHTML = '';
        const now = Date.now();

        // 1. Global Multiplier Buff
        if (GameState.buffs.multiplierEndTime > now) {
            const timeRem = Math.ceil((GameState.buffs.multiplierEndTime - now) / 1000);
            const item = document.createElement('div');
            item.className = 'buff-badge global';
            item.innerHTML = `
                <span class="buff-icon">🌀</span>
                <span class="buff-txt">Ядро x${GameState.buffs.multiplier} (${timeRem}с)</span>
            `;
            container.appendChild(item);
        }

        // 2. CPS Buff
        if (GameState.buffs.boostCpsEndTime > now) {
            const timeRem = Math.ceil((GameState.buffs.boostCpsEndTime - now) / 1000);
            const item = document.createElement('div');
            item.className = 'buff-badge cps';
            item.innerHTML = `
                <span class="buff-icon">⚡</span>
                <span class="buff-txt">Узлы x${GameState.buffs.boostCpsMultiplier} (${timeRem}с)</span>
            `;
            container.appendChild(item);
        }
    },

    // Modal popup systems
    showWheelWinPopup(reward) {
        const modal = this.elements['wheel-win-modal'];
        const icon = this.elements['win-prize-icon'];
        const name = this.elements['win-prize-name'];
        const desc = this.elements['win-prize-desc'];

        if (!modal) return;

        icon.innerText = reward.textColor === '#39ff14' ? '🟩' : reward.type === 'jackpot' ? '🌟' : '🎁';
        name.innerText = reward.name;
        
        switch (reward.type) {
            case 'credits':
                desc.innerText = `Успешно переведено ${GameState.formatNumber(reward.val)} кредитов на ваш зашифрованный счет ядра.`;
                break;
            case 'xp':
                desc.innerText = `Внедрено ${reward.val} массивов данных опыта непосредственно в ядро вашей операционной системы.`;
                break;
            case 'buff_global_2x':
                desc.innerText = `Активирован локальный разгон. Сила клика и пассивный доход удвоены на 60 секунд.`;
                break;
            case 'buff_cps_3x':
                desc.innerText = `Процессы автоматического сбора данных оптимизированы. Эффективность узлов умножена на 3x на 45 секунд.`;
                break;
            case 'jackpot':
                desc.innerText = `СИНГУЛЯРНОСТЬ ВЫРАВНИВАЕТСЯ! Успешно извлечено ${GameState.formatNumber(reward.val)} кредитов из Федерального Хранилища!`;
                break;
        }

        modal.classList.add('active');
        
        // Spawn confetti celebration
        this.spawnClickParticles(window.innerWidth / 2, window.innerHeight / 2, 40, '#ff007f');
    },

    showChoiceModal(title, text, opt1, opt2, callback1, callback2) {
        const modal = this.elements['choice-modal'];
        const titleEl = this.elements['choice-modal-title'];
        const textEl = this.elements['choice-modal-text'];
        const btn1 = this.elements['choice-btn-1'];
        const btn2 = this.elements['choice-btn-2'];

        if (!modal) return;

        titleEl.innerText = title;
        textEl.innerText = text;
        btn1.innerText = opt1;
        btn2.innerText = opt2;

        // Visual show
        modal.classList.add('active');

        // Clear previous listeners (cloning nodes resolves this perfectly)
        const newBtn1 = btn1.cloneNode(true);
        const newBtn2 = btn2.cloneNode(true);
        btn1.parentNode.replaceChild(newBtn1, btn1);
        btn2.parentNode.replaceChild(newBtn2, btn2);

        this.elements['choice-btn-1'] = newBtn1;
        this.elements['choice-btn-2'] = newBtn2;

        newBtn1.addEventListener('click', () => {
            modal.classList.remove('active');
            callback1();
            AudioEngine.playBuy();
        });

        newBtn2.addEventListener('click', () => {
            modal.classList.remove('active');
            callback2();
            AudioEngine.playBuy();
        });
    },

    // Toasts System
    showToast(message, color = '#00f0ff') {
        const container = this.elements['toast-container'];
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-alert';
        toast.style.borderColor = color;
        toast.style.boxShadow = `0 0 10px ${color}44`;
        toast.innerHTML = `
            <div class="toast-marker" style="background: ${color}"></div>
            <div class="toast-content">${message}</div>
        `;

        container.appendChild(toast);

        // Slide out and remove
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3500);
    },

    triggerAchievementToast(ach) {
        const container = this.elements['toast-container'];
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-alert achievement-toast';
        toast.style.borderColor = '#ffb300';
        toast.innerHTML = `
            <div class="ach-toast-icon">${ach.icon}</div>
            <div class="ach-toast-main">
                <div class="ach-toast-header">ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!</div>
                <div class="ach-toast-name">${ach.name}</div>
                <div class="ach-toast-desc">${ach.desc}</div>
            </div>
        `;

        container.appendChild(toast);

        // Slide out and remove
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4500);
    },

    triggerLevelUpEffect(newLvl) {
        this.showToast(`СИСТЕМА РАЗОГНАНА! Достигнут уровень ${newLvl}!`, '#ffb300');
        this.spawnClickParticles(window.innerWidth / 2, window.innerHeight / 2 - 100, 25, '#ffb300');
    },

    // GPU-accelerated click animations
    spawnFloatingText(text, x, y, isCrit) {
        if (SettingsManager.settings.disableAnimations) return;

        const floatText = document.createElement('div');
        floatText.className = `floating-text ${isCrit ? 'critical' : ''}`;
        floatText.innerText = text;
        floatText.style.left = `${x}px`;
        floatText.style.top = `${y}px`;

        // Add a slight random tilt and horizontal drift
        const rot = (Math.random() - 0.5) * 20;
        const drift = (Math.random() - 0.5) * 50;
        floatText.style.setProperty('--rot', `${rot}deg`);
        floatText.style.setProperty('--drift', `${drift}px`);

        document.body.appendChild(floatText);

        // Clean up
        floatText.addEventListener('animationend', () => {
            floatText.remove();
        });
    },

    spawnClickParticles(x, y, count, color) {
        if (SettingsManager.settings.disableAnimations) return;

        const container = document.body;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.background = color;
            particle.style.boxShadow = `0 0 8px ${color}`;

            // Random trajectory vectors
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 80;
            const px = Math.cos(angle) * velocity;
            const py = Math.sin(angle) * velocity;
            particle.style.setProperty('--px', `${px}px`);
            particle.style.setProperty('--py', `${py}px`);

            container.appendChild(particle);

            // Clean up
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    },

    // UI Tick loops
    startUiTickers() {
        // Tickers for countdowns (runs every 1 second)
        setInterval(() => {
            this.updateDailyCountdown();
            this.updateWheelTabControls();
            this.updateBuffDisplay();
            this.updateStatsDisplay();
            
            // Auto spinnaker check
            if (window.PrestigeRegistry && window.PrestigeRegistry.getLevel('pres_auto_spin') > 0) {
                if (window.WheelOfFortune && window.WheelOfFortune.isFreeSpinAvailable() && !window.WheelOfFortune.isSpinning) {
                    window.WheelOfFortune.spin(true);
                }
            }
            
            // Increment play time and auto save
            GameState.saveGame();
        }, 1000);
    }
};
// Make globally available
window.UI = UI;
