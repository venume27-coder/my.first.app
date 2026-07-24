/**
 * Wheel of Fortune Physics & Rewards Module
 */
const WheelOfFortune = {
    sectors: [
        { id: 0, name: '500 Кредитов', type: 'credits', val: 500, color: '#161b33', textColor: '#00f0ff', weight: 30 },
        { id: 1, name: 'Разгон 2x (60с)', type: 'buff_global_2x', val: 60000, color: '#2d142c', textColor: '#ff007f', weight: 15 },
        { id: 2, name: '2 500 Кредитов', type: 'credits', val: 2500, color: '#0d2b45', textColor: '#00f0ff', weight: 20 },
        { id: 3, name: 'Узлы 3x (45с)', type: 'buff_cps_3x', val: 45000, color: '#311142', textColor: '#a124db', weight: 12 },
        { id: 4, name: '10 000 Кредитов', type: 'credits', val: 10000, color: '#161b33', textColor: '#00f0ff', weight: 10 },
        { id: 5, name: 'Импульс XP (+500)', type: 'xp', val: 500, color: '#112211', textColor: '#39ff14', weight: 15 },
        { id: 6, name: '50 000 Кредитов', type: 'credits', val: 50000, color: '#0d2b45', textColor: '#00f0ff', weight: 5 },
        { id: 7, name: 'НЕОН ДЖЕКПОТ!', type: 'jackpot', val: 500000, color: '#ffb300', textColor: '#ffffff', weight: 2 }
    ],

    // Spin animation variables
    isSpinning: false,
    angle: 0,          // Current angle in radians
    angularVelocity: 0, // Radians per frame
    friction: 0.985,   // Friction coefficient slowing down the spin
    targetReward: null,
    
    // Canvas context references
    canvas: null,
    ctx: null,

    // Time calculations
    getTimeRemaining() {
        const now = Date.now();
        const lastSpin = GameState.wheelLastFreeSpin;
        const oneDayMs = 24 * 60 * 60 * 1000;
        return Math.max(0, (lastSpin + oneDayMs) - now);
    },

    getSpinCost() {
        // Spin cost scales with core level to prevent late-game spamming
        return Math.max(500, Math.floor(150 * Math.pow(1.3, GameState.level)));
    },

    isFreeSpinAvailable() {
        return this.getTimeRemaining() === 0;
    },

    // Set canvas context
    setCanvas(canvasElement) {
        this.canvas = canvasElement;
        if (canvasElement) {
            this.ctx = canvasElement.getContext('2d');
            this.drawWheel();
        }
    },

    // Draw the static or rotating wheel
    drawWheel() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - 15; // Outer padding for neon glowing rim

        ctx.clearRect(0, 0, w, h);

        const numSectors = this.sectors.length;
        const arc = (Math.PI * 2) / numSectors;

        // Draw sectors
        for (let i = 0; i < numSectors; i++) {
            const sectorAngle = this.angle + i * arc;
            ctx.beginPath();
            ctx.fillStyle = this.sectors[i].color;
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, sectorAngle, sectorAngle + arc);
            ctx.lineTo(cx, cy);
            ctx.fill();

            // Inner divider lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw Sector Text
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(sectorAngle + arc / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this.sectors[i].textColor;
            ctx.font = 'bold 11px "Orbitron", sans-serif';
            
            // Neon glow for jackpot
            if (this.sectors[i].type === 'jackpot') {
                ctx.shadowColor = '#ffb300';
                ctx.shadowBlur = 10;
            }
            
            ctx.fillText(this.sectors[i].name, r - 20, 0);
            ctx.restore();
        }

        // Draw Outer Cyber Glowing Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Draw Centre Core Spinner
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#0f0c1b';
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw central core symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☢️', cx, cy);
    },

    // Trigger physical spin animation
    spin(isFree = true) {
        if (this.isSpinning) return;

        if (isFree) {
            if (!this.isFreeSpinAvailable()) return;
            GameState.wheelLastFreeSpin = Date.now();
        } else {
            const cost = this.getSpinCost();
            if (GameState.credits < cost) return;
            GameState.spendCredits(cost);
        }

        this.isSpinning = true;
        GameState.stats.wheelSpins++;
        GameState.saveGame();

        // Check achievements
        if (window.AchievementsRegistry) {
            window.AchievementsRegistry.checkUnlocks();
        }

        // Initial spin velocity (between 0.4 and 0.7 radians per frame)
        this.angularVelocity = 0.45 + Math.random() * 0.25;

        // Sound cues helper
        let lastTickAngle = this.angle;
        const numSectors = this.sectors.length;
        const arc = (Math.PI * 2) / numSectors;

        const animate = () => {
            if (!this.isSpinning) return;

            // Apply friction
            this.angularVelocity *= this.friction;
            this.angle += this.angularVelocity;

            // Trigger tick sound as lines pass the top arrow (which is at -Math.PI / 2)
            // Arrow is pointing down at top of the wheel (angle = 3 * Math.PI / 2 or -Math.PI / 2)
            // Relative sector position = (-Math.PI / 2 - this.angle)
            const sectorWidth = Math.PI * 2 / numSectors;
            const currentTickIndex = Math.floor((Math.PI * 2 - (this.angle % (Math.PI * 2))) / sectorWidth) % numSectors;
            const lastTickIndex = Math.floor((Math.PI * 2 - (lastTickAngle % (Math.PI * 2))) / sectorWidth) % numSectors;

            if (currentTickIndex !== lastTickIndex) {
                AudioEngine.playWheelTick();
            }
            lastTickAngle = this.angle;

            this.drawWheel();

            // Check if spin has stopped
            if (this.angularVelocity < 0.001) {
                this.isSpinning = false;
                this.angularVelocity = 0;
                this.determineWinner();
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    // Work out winning sector based on top position
    determineWinner() {
        const numSectors = this.sectors.length;
        const sectorWidth = Math.PI * 2 / numSectors;
        
        // Arrow is at top (-Math.PI / 2 or 1.5 * Math.PI).
        // The wheel turns clockwise, meaning sectors move right.
        // We find the sector at angle = 1.5 * Math.PI relative to our rotation.
        let normAngle = (1.5 * Math.PI - this.angle) % (Math.PI * 2);
        if (normAngle < 0) normAngle += Math.PI * 2;
        
        const winnerIndex = Math.floor(normAngle / sectorWidth) % numSectors;
        const reward = this.sectors[winnerIndex];
        
        this.grantReward(reward);
    },

    grantReward(reward) {
        AudioEngine.playWheelWin();

        let finalValue = reward.val;

        // Apply reward
        switch (reward.type) {
            case 'credits':
            case 'jackpot':
                GameState.credits += finalValue;
                GameState.totalCreditsEarned += finalValue;
                break;
            case 'xp':
                GameState.gainExp(finalValue);
                break;
            case 'buff_global_2x':
                GameState.addBuff('global', 2.0, finalValue);
                break;
            case 'buff_cps_3x':
                GameState.addBuff('cps', 3.0, finalValue);
                break;
        }

        GameState.saveGame();

        // Call UI callback to display win modal/popup
        if (window.Game && Game.UI) {
            Game.UI.showWheelWinPopup(reward);
            Game.UI.updateCurrencyDisplay();
        }
    }
};
// Make globally available
window.WheelOfFortune = WheelOfFortune;
