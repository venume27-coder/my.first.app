/**
 * Game Settings and Theme Configurator Module
 */
const SettingsManager = {
    settings: {
        muted: false,
        volume: 0.5,
        musicEnabled: false,
        disableAnimations: false,
        theme: 'cyber' // options: 'cyber', 'space', 'matrix'
    },

    SAVE_KEY: 'cybercore_settings_save',

    init() {
        this.loadSettings();
        this.applySettings();
    },

    loadSettings() {
        const saved = localStorage.getItem(this.SAVE_KEY);
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to load settings. Using defaults.", e);
            }
        }
    },

    saveSettings() {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.settings));
        
        // Sync with Audio Engine
        if (window.AudioEngine) {
            AudioEngine.settings.muted = this.settings.muted;
            AudioEngine.settings.volume = this.settings.volume;
            AudioEngine.settings.musicEnabled = this.settings.musicEnabled;
            AudioEngine.saveSettings();
        }
    },

    toggleMute() {
        this.settings.muted = !this.settings.muted;
        this.saveSettings();
        this.applySettings();
        return this.settings.muted;
    },

    toggleMusic() {
        this.settings.musicEnabled = !this.settings.musicEnabled;
        this.saveSettings();
        this.applySettings();
        
        if (window.AudioEngine) {
            if (this.settings.musicEnabled) {
                AudioEngine.playBGM();
            } else {
                AudioEngine.stopBGM();
            }
        }
        return this.settings.musicEnabled;
    },

    toggleAnimations() {
        this.settings.disableAnimations = !this.settings.disableAnimations;
        this.saveSettings();
        this.applySettings();
        return this.settings.disableAnimations;
    },

    setVolume(value) {
        this.settings.volume = Math.max(0, Math.min(1, parseFloat(value)));
        this.saveSettings();
        
        if (window.AudioEngine) {
            AudioEngine.setVolume(this.settings.volume);
        }
    },

    setTheme(themeName) {
        const validThemes = ['cyber', 'space', 'matrix'];
        if (validThemes.includes(themeName)) {
            this.settings.theme = themeName;
            this.saveSettings();
            this.applySettings();
        }
    },

    applySettings() {
        // Apply HTML Theme attribute
        document.body.setAttribute('data-theme', this.settings.theme);

        // Update CSS variables / body classes for performance
        if (this.settings.disableAnimations) {
            document.body.classList.add('disable-animations');
        } else {
            document.body.classList.remove('disable-animations');
        }
    },

    confirmResetProgress() {
        // First warning
        if (confirm("Вы уверены, что хотите выполнить полный сброс данных? Все кредиты, наноядра, уровень, улучшения и достижения будут БЕЗВОЗВРАТНО СТЕРТЫ.")) {
            // Second warning
            if (confirm("ЭТО ДЕЙСТВИЕ НЕОБРАТИМО! Подтвердить сброс кэша Ядра?")) {
                GameState.resetToDefaults(true);
                location.reload();
            }
        }
    }
};
// Make globally available
window.SettingsManager = SettingsManager;
