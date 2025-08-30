class TableTennisReactionApp {
    constructor() {
        this.selectedTime = 0;
        this.selectedMode = 'basic';
        this.timeRemaining = 0;
        this.isRunning = false;
        this.isCountingDown = false;
        this.countdownValue = 0;
        this.countdownInterval = null;
        this.timerInterval = null;
        this.directionInterval = null;
        this.directionTimeout = null;
        this.totalCalls = 0;
        this.intervals = [];
        this.lastCallTime = 0;
        this.lastDirection = null;
        this.audioContext = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
    }

    initializeElements() {
        // Header
        this.header = document.getElementById('header');
        
        // Timer selection elements
        this.timerButtons = document.querySelectorAll('.timer-btn');
        this.timerSelectionDiv = document.querySelector('.timer-selection');
        
        // Mode selection elements
        this.modeSelectionDiv = document.getElementById('modeSelection');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.backToTimerBtn = document.getElementById('backToTimerBtn');
        
        // Practice area elements
        this.practiceArea = document.getElementById('practiceArea');
        this.timeDisplay = document.getElementById('timeRemaining');
        this.directionDisplay = document.getElementById('directionDisplay');
        
        // Basic mode elements
        this.basicLayout = document.getElementById('basicLayout');
        this.leftBox = document.getElementById('leftBox');
        this.rightBox = document.getElementById('rightBox');
        
        // Advanced mode elements
        this.advancedLayout = document.getElementById('advancedLayout');
        this.leftBoxAdv = document.getElementById('leftBoxAdv');
        this.rightBoxAdv = document.getElementById('rightBoxAdv');
        this.leftForwardBox = document.getElementById('leftForwardBox');
        this.rightForwardBox = document.getElementById('rightForwardBox');
        
        this.statusText = document.getElementById('statusText');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Stats elements
        this.statsDiv = document.getElementById('stats');
        this.totalCallsSpan = document.getElementById('totalCalls');
        this.avgIntervalSpan = document.getElementById('avgInterval');
    }

    bindEvents() {
        // Timer selection
        this.timerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTimer(parseInt(e.target.dataset.time));
            });
        });

        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMode(e.target.closest('.mode-btn').dataset.mode);
            });
        });

        // Back to timer button
        this.backToTimerBtn.addEventListener('click', () => this.backToTimerSelection());

        // Control buttons
        this.startBtn.addEventListener('click', () => this.startPractice());
        this.stopBtn.addEventListener('click', () => this.stopPractice());
        this.backBtn.addEventListener('click', () => this.backToModeSelection());
    }

    initializeAudio() {
        // Initialize Web Audio API context (will be created on first user interaction)
        this.audioContext = null;
    }

    createAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported:', e);
            }
        }
        return this.audioContext;
    }

    playBeep(frequency, duration = 200) {
        const audioContext = this.createAudioContext();
        if (!audioContext) return;

        try {
            // Resume audio context if it's suspended (required by some browsers)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            // Create a smooth envelope to avoid clicks
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Error playing beep:', e);
        }
    }

    selectTimer(seconds) {
        this.selectedTime = seconds;
        this.timeRemaining = seconds;
        this.updateTimeDisplay();
        this.showModeSelection();
    }

    selectMode(mode) {
        this.selectedMode = mode;
        this.showPracticeArea();
    }

    showModeSelection() {
        this.timerSelectionDiv.style.display = 'none';
        this.modeSelectionDiv.style.display = 'block';
        this.practiceArea.style.display = 'none';
    }

    backToTimerSelection() {
        this.modeSelectionDiv.style.display = 'none';
        this.timerSelectionDiv.style.display = 'block';
        this.practiceArea.style.display = 'none';
    }

    backToModeSelection() {
        this.stopPractice();
        this.practiceArea.style.display = 'none';
        this.modeSelectionDiv.style.display = 'block';
        this.header.style.display = 'block';
        this.resetStats();
    }

    showPracticeArea() {
        this.modeSelectionDiv.style.display = 'none';
        this.practiceArea.style.display = 'block';
        this.header.style.display = 'none'; // Hide header in practice area
        
        // Show appropriate layout based on selected mode
        if (this.selectedMode === 'basic') {
            this.basicLayout.style.display = 'flex';
            this.advancedLayout.style.display = 'none';
        } else {
            this.basicLayout.style.display = 'none';
            this.advancedLayout.style.display = 'flex';
        }
        
        this.statusText.textContent = 'Ready?';
        this.statusText.style.display = 'block';
        this.clearBoxHighlights();
        this.lastDirection = null;
        
        // Clear timer warning states
        const timerElement = this.timeDisplay.parentElement;
        timerElement.classList.remove('warning', 'critical');
        
        this.resetStats();
    }

    backToSelection() {
        this.stopPractice();
        this.practiceArea.style.display = 'none';
        this.timerSelectionDiv.style.display = 'block';
        this.header.style.display = 'block';
        this.resetStats();
    }

    startPractice() {
        if (this.isRunning || this.isCountingDown) return;
        
        // Initialize audio context on user interaction
        this.createAudioContext();
        
        this.isCountingDown = true;
        this.countdownValue = 3;
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'inline-block';
        this.statsDiv.style.display = 'none';
        
        // Show countdown in status text
        this.statusText.style.display = 'block';
        this.statusText.textContent = this.countdownValue.toString();
        this.statusText.classList.add('countdown');
        
        // Clear any existing highlights
        this.clearBoxHighlights();
        
        // Play initial countdown beep for "3"
        this.playBeep(600, 200);
        
        // Start countdown
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            
            if (this.countdownValue > 0) {
                this.statusText.textContent = this.countdownValue.toString();
                // Play countdown beep
                this.playBeep(600, 200);
            } else {
                // Countdown finished, start the actual practice
                this.statusText.textContent = 'GO!';
                this.statusText.classList.remove('countdown');
                this.playBeep(1000, 300); // Different sound for "GO!"
                
                // Clear countdown interval
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.isCountingDown = false;
                
                // Start the actual practice after showing "GO!" for a moment
                setTimeout(() => {
                    this.startActualPractice();
                }, 500);
            }
        }, 1000);
    }

    startActualPractice() {
        this.isRunning = true;
        
        this.totalCalls = 0;
        this.intervals = [];
        this.lastCallTime = Date.now();
        this.lastDirection = null;
        
        // Hide the status text now that practice is starting
        this.statusText.style.display = 'none';
        
        // Start the main timer
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimeDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endPractice();
            }
        }, 1000);

        // Start the direction calling
        this.scheduleNextDirection();
        
        // Show first direction immediately
        this.showDirection();
    }

    stopPractice() {
        if (!this.isRunning && !this.isCountingDown) return;
        
        this.isRunning = false;
        this.isCountingDown = false;
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
        
        // Clear all intervals and timeouts
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.directionTimeout) {
            clearTimeout(this.directionTimeout);
            this.directionTimeout = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset display
        this.statusText.textContent = 'Stopped';
        this.statusText.style.display = 'block';
        this.statusText.classList.remove('countdown');
        this.clearBoxHighlights();
        
        // Reset timer
        this.timeRemaining = this.selectedTime;
        this.updateTimeDisplay();
        
        // Clear timer warning states
        const timerElement = this.timeDisplay.parentElement;
        timerElement.classList.remove('warning', 'critical');
    }

    endPractice() {
        this.isRunning = false;
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
        
        // Clear intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.directionTimeout) {
            clearTimeout(this.directionTimeout);
            this.directionTimeout = null;
        }
        
        // Show completion message
        this.statusText.textContent = 'Good~';
        this.statusText.style.display = 'block';
        this.clearBoxHighlights();
        
        // Show stats
        this.showStats();
        
        // Reset timer
        this.timeRemaining = this.selectedTime;
        this.updateTimeDisplay();
        
        // Clear timer warning states
        const timerElement = this.timeDisplay.parentElement;
        timerElement.classList.remove('warning', 'critical');
    }

    scheduleNextDirection() {
        if (!this.isRunning) return;
        
        // Random interval between 1 and 1.5 seconds (1000-1500ms)
        const randomInterval = Math.random() * 500 + 1000;
        
        this.directionTimeout = setTimeout(() => {
            if (this.isRunning) {
                this.showDirection();
                this.scheduleNextDirection();
            }
        }, randomInterval);
    }

    showDirection() {
        if (!this.isRunning) return;
        
        // Record interval timing
        const currentTime = Date.now();
        if (this.totalCalls > 0) {
            this.intervals.push(currentTime - this.lastCallTime);
        }
        this.lastCallTime = currentTime;
        
        // Generate random direction based on mode
        let directions;
        if (this.selectedMode === 'basic') {
            directions = ['left', 'right'];
        } else {
            directions = ['left', 'right', 'left-forward', 'right-forward'];
        }
        
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        // Clear previous highlights
        this.clearBoxHighlights();
        
        // If same direction as last time, add a clear gap before showing
        if (this.lastDirection === randomDirection && this.totalCalls > 0) {
            // Wait 200ms with clear boxes before showing the same direction
            setTimeout(() => {
                if (!this.isRunning) return;
                this.highlightBox(randomDirection);
            }, 200);
        } else {
            // Show immediately if different direction or first call
            this.highlightBox(randomDirection);
        }
        
        // Update last direction
        this.lastDirection = randomDirection;
        
        // Increment counter
        this.totalCalls++;
    }

    highlightBox(direction) {
        // Highlight the appropriate box and play sound based on mode and direction
        if (this.selectedMode === 'basic') {
            if (direction === 'left') {
                this.leftBox.classList.add('active');
                this.playBeep(800, 150); // Higher pitch for left
            } else if (direction === 'right') {
                this.rightBox.classList.add('active');
                this.playBeep(400, 150); // Lower pitch for right
            }
        } else {
            // Advanced mode
            if (direction === 'left') {
                this.leftBoxAdv.classList.add('active');
                this.playBeep(800, 150); // Higher pitch for left
            } else if (direction === 'right') {
                this.rightBoxAdv.classList.add('active');
                this.playBeep(400, 150); // Lower pitch for right
            } else if (direction === 'left-forward') {
                this.leftForwardBox.classList.add('active');
                this.playBeep(1000, 150); // Even higher pitch for forward left
            } else if (direction === 'right-forward') {
                this.rightForwardBox.classList.add('active');
                this.playBeep(300, 150); // Lower pitch for forward right
            }
        }
    }

    clearBoxHighlights() {
        // Clear highlights for both modes
        if (this.leftBox) this.leftBox.classList.remove('active');
        if (this.rightBox) this.rightBox.classList.remove('active');
        if (this.leftBoxAdv) this.leftBoxAdv.classList.remove('active');
        if (this.rightBoxAdv) this.rightBoxAdv.classList.remove('active');
        if (this.leftForwardBox) this.leftForwardBox.classList.remove('active');
        if (this.rightForwardBox) this.rightForwardBox.classList.remove('active');
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer visual state based on remaining time
        const timerElement = this.timeDisplay.parentElement;
        timerElement.classList.remove('warning', 'critical');
        
        if (this.timeRemaining <= 10) {
            timerElement.classList.add('critical');
        } else if (this.timeRemaining <= 30) {
            timerElement.classList.add('warning');
        }
    }

    showStats() {
        this.totalCallsSpan.textContent = this.totalCalls;
        
        if (this.intervals.length > 0) {
            const avgInterval = this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length;
            this.avgIntervalSpan.textContent = (avgInterval / 1000).toFixed(2);
        } else {
            this.avgIntervalSpan.textContent = '0.00';
        }
        
        this.statsDiv.style.display = 'block';
    }

    resetStats() {
        this.totalCalls = 0;
        this.intervals = [];
        this.lastDirection = null;
        this.statsDiv.style.display = 'none';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TableTennisReactionApp();
});

// Add some keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    // Space bar to start/stop
    if (e.code === 'Space') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (startBtn.style.display !== 'none') {
            startBtn.click();
        } else if (stopBtn.style.display !== 'none') {
            stopBtn.click();
        }
    }
    
    // Escape to go back
    if (e.code === 'Escape') {
        const practiceArea = document.getElementById('practiceArea');
        const modeSelection = document.getElementById('modeSelection');
        const backBtn = document.getElementById('backBtn');
        const backToTimerBtn = document.getElementById('backToTimerBtn');
        
        if (practiceArea.style.display !== 'none' && backBtn) {
            backBtn.click();
        } else if (modeSelection.style.display !== 'none' && backToTimerBtn) {
            backToTimerBtn.click();
        }
    }
    
    // Number keys for timer selection
    if (e.code === 'Digit1') {
        document.querySelector('[data-time="60"]')?.click();
    }
    if (e.code === 'Digit2') {
        document.querySelector('[data-time="120"]')?.click();
    }
    if (e.code === 'Digit3') {
        document.querySelector('[data-time="180"]')?.click();
    }
    
    // Mode selection shortcuts (B for Basic, A for Advanced)
    if (e.code === 'KeyB') {
        document.querySelector('[data-mode="basic"]')?.click();
    }
    if (e.code === 'KeyA') {
        document.querySelector('[data-mode="advanced"]')?.click();
    }
});
