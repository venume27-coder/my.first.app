/**
 * Game Orchestrator & Initialization Entrypoint
 */
const Game = {
    audioInitialized: false,

    init() {
        console.log("Initializing Cyber Core Game Core...");

        // 1. Settings configuration
        SettingsManager.init();

        // 2. Audio Engine hookup (requires click to activate)
        AudioEngine.init();

        // 3. State Management loading
        GameState.init();

        // 4. Shop Recalculations
        UpgradesRegistry.recalculateBonuses();

        // 5. Run Autoclickers Tick System
        AutoclickerRegistry.startTicking();

        // 6. UI Rendering setup
        UI.init();

        // 7. Event Spawners
        RandomEventsManager.init();

        // Register main interaction listeners for Audio resuming
        this.setupAudioTriggerListeners();

        console.log("Game Core initialized successfully.");
    },

    // Browser security blocks audio autoplay. We wake the audio engine on first click/keypress
    setupAudioTriggerListeners() {
        const resumeAudio = () => {
            if (this.audioInitialized) return;
            
            AudioEngine.resume();
            
            // Start looping BGM if enabled
            if (SettingsManager.settings.musicEnabled) {
                AudioEngine.playBGM();
            }

            this.audioInitialized = true;

            // Remove listeners once done
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };

        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);

        // Pause/resume passive income loops when tab is hidden to prevent CPU leakage
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                AutoclickerRegistry.stopTicking();
            } else {
                AutoclickerRegistry.startTicking();
            }
        });
    }
};

// Start the game loop when page completes loading
window.addEventListener('DOMContentLoaded', () => {
    // Bind modules to global Game instance to enable communication
    window.Game = Game;
    Game.Audio = AudioEngine;
    Game.State = GameState;
    Game.Upgrades = UpgradesRegistry;
    Game.Autoclickers = AutoclickerRegistry;
    Game.Achievements = AchievementsRegistry;
    Game.Daily = DailyRewardsRegistry;
    Game.Wheel = WheelOfFortune;
    Game.Events = RandomEventsManager;
    Game.Settings = SettingsManager;
    Game.Prestige = PrestigeRegistry;
    Game.UI = UI;

    Game.init();
});
