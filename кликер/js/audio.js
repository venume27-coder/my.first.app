/**
 * Web Audio API Synth Engine for Cyber Core
 * Generates high-fidelity cyberpunk/sci-fi sound effects procedurally.
 */
const AudioEngine = {
    ctx: null,
    settings: {
        muted: false,
        volume: 0.5,
        musicEnabled: false,
        musicVolume: 0.2
    },
    bgmNode: null,
    bgmGain: null,

    init() {
        // AudioContext is initialized on first user interaction due to browser policies
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.loadSettings();
        } catch (e) {
            console.error("Web Audio API not supported in this browser", e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    loadSettings() {
        const saved = localStorage.getItem('cybercore_audio_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Error loading audio settings", e);
            }
        }
    },

    saveSettings() {
        localStorage.setItem('cybercore_audio_settings', JSON.stringify(this.settings));
    },

    setMuted(muted) {
        this.settings.muted = muted;
        this.saveSettings();
        if (muted) {
            this.stopBGM();
        } else if (this.settings.musicEnabled) {
            this.playBGM();
        }
    },

    setVolume(vol) {
        this.settings.volume = Math.max(0, Math.min(1, vol));
        this.saveSettings();
        if (this.bgmGain) {
            this.bgmGain.gain.setValueAtTime(this.settings.musicVolume * this.settings.volume, this.ctx.currentTime);
        }
    },

    setMusicEnabled(enabled) {
        this.settings.musicEnabled = enabled;
        this.saveSettings();
        if (enabled) {
            this.playBGM();
        } else {
            this.stopBGM();
        }
    },

    createGain(duration, startVal = 1) {
        if (!this.ctx) this.init();
        this.resume();
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(startVal * this.settings.volume, this.ctx.currentTime);
        // Exponential decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        gainNode.connect(this.ctx.destination);
        return gainNode;
    },

    playClick(isCrit = false) {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        if (isCrit) {
            // Critical click: higher pitch, double chime
            const duration = 0.3;
            const gain = this.createGain(duration, 0.4);

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(600, now);
            osc1.frequency.exponentialRampToValueAtTime(1200, now + duration);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1200, now);
            osc2.frequency.exponentialRampToValueAtTime(2400, now + duration);

            // Cyber filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1500, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + duration);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
        } else {
            // Regular click: short organic laser pop
            const duration = 0.08;
            const gain = this.createGain(duration, 0.25);

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + duration);

            osc.connect(gain);
            osc.start(now);
            osc.stop(now + duration);
        }
    },

    playBuy() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.25;
        const gain = this.createGain(duration, 0.3);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        // Arpeggio
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.18); // C6

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + duration);
    },

    playLevelUp() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.6;
        const gain = this.createGain(duration, 0.4);

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.linearRampToValueAtTime(523.25, now + 0.2); // C5
        osc1.frequency.linearRampToValueAtTime(1046.50, now + 0.4); // C6

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.linearRampToValueAtTime(659.25, now + 0.2); // E5
        osc2.frequency.linearRampToValueAtTime(1318.51, now + 0.4); // E6

        // High pass filter sweep
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    },

    playAchievement() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.8;
        const gain = this.createGain(duration, 0.4);

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(880.00, now + 0.2); // A5
        osc.frequency.setValueAtTime(987.77, now + 0.3); // B5
        osc.frequency.setValueAtTime(1174.66, now + 0.4); // D6

        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.value = 8; // 8Hz vibrato
        vibratoGain.gain.value = 15; // frequency deviation in Hz

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.connect(gain);
        
        vibrato.start(now);
        osc.start(now);
        
        vibrato.stop(now + duration);
        osc.stop(now + duration);
    },

    playWheelTick() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.02;
        const gain = this.createGain(duration, 0.15);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + duration);

        const noise = this.ctx.createBiquadFilter();
        noise.type = 'bandpass';
        noise.frequency.value = 1000;

        osc.connect(noise);
        noise.connect(gain);

        osc.start(now);
        osc.stop(now + duration);
    },

    playWheelWin() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.5;
        const gain = this.createGain(duration, 0.35);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 1000;
        filter.Q.value = 10;

        osc.connect(filter);
        filter.connect(gain);

        osc.start(now);
        osc.stop(now + duration);
    },

    playEventSpawn() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.8;
        const gain = this.createGain(duration, 0.3);

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(440, now + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(277.18, now); // major third
        osc2.frequency.exponentialRampToValueAtTime(554.37, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    },

    playEventClick() {
        if (this.settings.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.4;
        const gain = this.createGain(duration, 0.4);

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1760, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(220, now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + duration);

        osc.connect(filter);
        filter.connect(gain);

        osc.start(now);
        osc.stop(now + duration);
    },

    playBGM() {
        if (this.settings.muted || !this.settings.musicEnabled || !this.ctx) return;
        this.resume();

        if (this.bgmNode) return; // Already playing

        const now = this.ctx.currentTime;
        
        // Create nodes
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.settings.musicVolume * this.settings.volume, now);
        this.bgmGain.connect(this.ctx.destination);

        // Cyberpunk synth ambient drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        osc1.type = 'sawtooth';
        osc1.frequency.value = 55; // A1 (deep bass drone)

        osc2.type = 'triangle';
        osc2.frequency.value = 110; // A2

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 150; // Muffly warm tone
        lowpass.Q.value = 1;

        // Subtle LFO sweep on lowpass cutoff
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // 10s cycle
        lfoGain.gain.value = 50;

        lfo.connect(lfoGain);
        lfoGain.connect(lowpass.frequency);

        osc1.connect(lowpass);
        osc2.connect(lowpass);
        lowpass.connect(this.bgmGain);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        // Keep references to stop them later
        this.bgmNode = { osc1, osc2, lfo, lowpass, lfoGain };
    },

    stopBGM() {
        if (this.bgmNode) {
            const now = this.ctx ? this.ctx.currentTime : 0;
            
            // Fade out BGM gently
            if (this.bgmGain && this.ctx) {
                this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
                this.bgmGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
            }
            
            const node = this.bgmNode;
            setTimeout(() => {
                try {
                    node.osc1.stop();
                    node.osc2.stop();
                    node.lfo.stop();
                    node.osc1.disconnect();
                    node.osc2.disconnect();
                    node.lfo.disconnect();
                    node.lowpass.disconnect();
                    node.lfoGain.disconnect();
                } catch(e) {}
            }, 1100);

            this.bgmNode = null;
            this.bgmGain = null;
        }
    }
};
