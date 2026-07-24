/**
 * Random Events System Module
 */
const RandomEventsManager = {
    spawnTimer: null,
    minInterval: 45, // seconds
    maxInterval: 120, // seconds
    eventDuration: 12, // seconds to click the node
    activeEventElement: null,

    eventTypes: [
        {
            id: 'neon_glitch',
            name: 'Неоновый глич',
            desc: 'Системный сбой! Массовое переполнение кредитного буфера.',
            icon: '✨',
            color: '#00f0ff',
            action: () => {
                const amount = Math.max(50, Math.floor(GameState.clickPower * 25));
                const final = GameState.addCredits(amount);
                return `Перехвачено ${GameState.formatNumber(final)} кредитов!`;
            }
        },
        {
            id: 'temporal_overclock',
            name: 'Временной разгон',
            desc: 'Глобальное ускорение. Сила клика и CPS удвоены на 30с.',
            icon: '🌀',
            color: '#ff007f',
            action: () => {
                GameState.addBuff('global', 2.0, 30000);
                return 'Временной разгон активирован! (Множитель 2x на 30с)';
            }
        },
        {
            id: 'node_burst',
            name: 'Всплеск узлов',
            desc: 'Майнинг-серверы перегружены. CPS утроен на 30с.',
            icon: '⚡',
            color: '#a124db',
            action: () => {
                GameState.addBuff('cps', 3.0, 30000);
                return 'Всплеск узлов активен! (Пассивный CPS 3x на 30с)';
            }
        },
        {
            id: 'data_cube',
            name: 'Квантовый куб данных',
            desc: 'Содержит засекреченные системные спецификации.',
            icon: '📦',
            color: '#39ff14',
            action: () => {
                // Interactive Reward choice
                const val1 = Math.max(200, Math.floor(GameState.cps * 60)); // 60s of CPS
                const val2 = Math.max(50, GameState.level * 100); // Level XP boost
                
                if (window.Game && Game.UI) {
                    Game.UI.showChoiceModal(
                        'Дешифрован квантовый куб данных',
                        'Выберите, какой сектор данных извлечь:',
                        `Извлечь нейрокредиты (+${GameState.formatNumber(val1)})`,
                        `Извлечь системный опыт (+${val2} XP)`,
                        () => {
                            GameState.addCredits(val1);
                            Game.UI.showToast('Кредиты извлечены из куба!', '#39ff14');
                            Game.UI.updateCurrencyDisplay();
                        },
                        () => {
                            GameState.gainExp(val2);
                            Game.UI.showToast('Системный опыт извлечен!', '#39ff14');
                            Game.UI.updateCurrencyDisplay();
                        }
                    );
                }
                return 'Расшифрован квантовый куб данных!';
            }
        }
    ],

    init() {
        this.scheduleNextSpawn();
    },

    scheduleNextSpawn() {
        let delay = (this.minInterval + Math.random() * (this.maxInterval - this.minInterval)) * 1000;
        
        // Apply Prestige Time Dilation upgrade (15% faster per level)
        if (window.PrestigeRegistry) {
            const timeDilateLvl = window.PrestigeRegistry.getLevel('pres_time_dilate');
            delay = delay * (1.0 - timeDilateLvl * 0.15);
        }

        this.spawnTimer = setTimeout(() => {
            this.spawnEvent();
        }, delay);
    },

    spawnEvent() {
        // If animations are disabled in settings, skip spawning or spawn static
        if (window.Game && Game.Settings && Game.Settings.settings.disableAnimations) {
            this.scheduleNextSpawn();
            return;
        }

        // Only spawn if there is no active event on screen
        if (this.activeEventElement) return;

        const event = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
        
        AudioEngine.playEventSpawn();

        // Create HTML element for the floating node
        const node = document.createElement('div');
        node.className = 'random-event-node';
        node.innerHTML = `
            <div class="node-inner" style="box-shadow: 0 0 20px ${event.color}; border: 2px solid ${event.color};">
                <span class="node-icon">${event.icon}</span>
                <span class="node-pulse" style="background: ${event.color}"></span>
            </div>
        `;
        
        // Random position within screen limits (leaving padding at edges)
        const pad = 80;
        const rx = pad + Math.random() * (window.innerWidth - pad * 2);
        const ry = pad + Math.random() * (window.innerHeight - pad * 2);

        node.style.left = `${rx}px`;
        node.style.top = `${ry}px`;

        document.body.appendChild(node);
        this.activeEventElement = node;

        // Custom floating movement trajectory
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        node.animate([
            { transform: 'translate(0, 0) scale(0)', opacity: 0 },
            { transform: 'translate(0, 0) scale(1.1)', opacity: 1, offset: 0.1 },
            { transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(1)`, opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.9)`, opacity: 0.8 },
            { transform: `translate(${dx * 1.2}px, ${dy * 1.2}px) scale(0)`, opacity: 0 }
        ], {
            duration: this.eventDuration * 1000,
            easing: 'ease-in-out'
        });

        // Trigger on click
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleNodeClick(event, rx + dx * 0.5, ry + dy * 0.5);
        });

        // Auto remove when duration finishes
        setTimeout(() => {
            this.clearActiveEvent();
        }, this.eventDuration * 1000);
    },

    handleNodeClick(event, x, y) {
        if (!this.activeEventElement) return;

        AudioEngine.playEventClick();
        GameState.stats.eventsClicked++;
        GameState.saveGame();

        // Trigger action and get message
        const message = event.action();

        // Spawn hit particles
        if (window.Game && Game.UI) {
            Game.UI.spawnClickParticles(x, y, 15, event.color);
            Game.UI.showToast(message, event.color);
            Game.UI.updateCurrencyDisplay();
            
            // Check Achievements
            if (window.AchievementsRegistry) {
                window.AchievementsRegistry.checkUnlocks();
            }
        }

        this.clearActiveEvent();
    },

    clearActiveEvent() {
        if (this.activeEventElement) {
            this.activeEventElement.remove();
            this.activeEventElement = null;
            this.scheduleNextSpawn();
        }
    }
};
// Make globally available
window.RandomEventsManager = RandomEventsManager;
