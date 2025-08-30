class TableTennisReactionApp {
    constructor() {
        this.selectedTime = 0;
        this.selectedMode = null;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.isPaused = false;
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
        this.pausedTime = 0; // Track time when paused
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
    }

    initializeElements() {
        // Header
        this.header = document.getElementById('header');
        
        // Combined selection page elements
        this.selectionPage = document.getElementById('selectionPage');
        this.timerButtons = document.querySelectorAll('.timer-btn');
        this.customMinutesSlider = document.getElementById('customMinutesSlider');
        this.customTimeDisplay = document.getElementById('customTimeDisplay');
        this.minutesMinusBtn = document.getElementById('minutesMinus');
        this.minutesPlusBtn = document.getElementById('minutesPlus');
        this.quickBtns = document.querySelectorAll('.quick-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.startPracticeBtn = document.getElementById('startPracticeBtn');
        this.selectionStatus = document.getElementById('selectionStatus');
        
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
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
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
        
        // Custom duration slider
        this.customMinutesSlider.addEventListener('input', (e) => {
            this.selectCustomTimer(parseFloat(e.target.value));
        });
        
        // Stepper buttons
        this.minutesMinusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(this.customMinutesSlider.value);
            const newValue = Math.max(0.5, currentValue - 0.5);
            this.customMinutesSlider.value = newValue;
            this.selectCustomTimer(newValue);
        });
        
        this.minutesPlusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(this.customMinutesSlider.value);
            const newValue = Math.min(10, currentValue + 0.5);
            this.customMinutesSlider.value = newValue;
            this.selectCustomTimer(newValue);
        });
        
        // Quick adjust buttons
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseFloat(e.target.dataset.minutes);
                this.customMinutesSlider.value = minutes;
                this.selectCustomTimer(minutes);
                
                // Update quick button selection state
                this.quickBtns.forEach(qBtn => qBtn.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        
        // Set default custom duration to 2 minutes
        this.selectCustomTimer(2);

        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMode(e.target.closest('.mode-btn').dataset.mode);
            });
        });

        // Start practice button
        this.startPracticeBtn.addEventListener('click', () => this.showPracticeArea());

        // Control buttons
        this.startBtn.addEventListener('click', () => this.startPractice());
        this.pauseBtn.addEventListener('click', () => this.pausePractice());
        this.resumeBtn.addEventListener('click', () => this.resumePractice());
        this.backBtn.addEventListener('click', () => this.backToSelection());
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
        
        // Update button selection state
        this.timerButtons.forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
        
        // Clear custom slider selection visual state
        this.customMinutesSlider.classList.remove('selected');
        
        this.updateStartButton();
    }
    
    selectCustomTimer(minutes) {
        const seconds = Math.round(minutes * 60);
        this.selectedTime = seconds;
        this.timeRemaining = seconds;
        this.updateTimeDisplay();
        
        // Update custom time display
        this.updateCustomTimeDisplay(minutes);
        
        // Clear button selection state
        this.timerButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Check if the current value matches a quick button and highlight it
        const matchingQuickBtn = Array.from(this.quickBtns).find(btn => 
            parseFloat(btn.dataset.minutes) === minutes
        );
        
        this.quickBtns.forEach(btn => btn.classList.remove('selected'));
        if (matchingQuickBtn) {
            matchingQuickBtn.classList.add('selected');
        }
        
        // Add visual feedback for custom slider
        this.customMinutesSlider.classList.add('selected');
        
        this.updateStartButton();
    }
    
    updateCustomTimeDisplay(minutes) {
        const totalSeconds = Math.round(minutes * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        this.customTimeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    selectMode(mode) {
        this.selectedMode = mode;
        
        // Update button selection state
        this.modeButtons.forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.mode-btn').classList.add('selected');
        
        this.updateStartButton();
    }

    updateStartButton() {
        if (this.selectedTime > 0 && this.selectedMode) {
            this.startPracticeBtn.disabled = false;
            this.selectionStatus.textContent = `${this.selectedTime/60}min ${this.selectedMode} mode - Ready to start!`;
        } else {
            this.startPracticeBtn.disabled = true;
            if (!this.selectedTime && !this.selectedMode) {
                this.selectionStatus.textContent = 'Select duration and mode to start';
            } else if (!this.selectedTime) {
                this.selectionStatus.textContent = 'Select practice duration';
            } else {
                this.selectionStatus.textContent = 'Select practice mode';
            }
        }
    }

    showPracticeArea() {
        this.selectionPage.style.display = 'none';
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
        this.selectionPage.style.display = 'block';
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
        this.pauseBtn.style.display = 'inline-block';
        this.resumeBtn.style.display = 'none';
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

    pausePractice() {
        if (!this.isRunning && !this.isCountingDown) return;
        
        this.isPaused = true;
        this.isRunning = false;
        this.isCountingDown = false;
        
        this.pauseBtn.style.display = 'none';
        this.resumeBtn.style.display = 'inline-block';
        
        // Clear all intervals and timeouts but preserve state
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
        
        // Show pause status
        this.statusText.textContent = 'Paused';
        this.statusText.style.display = 'block';
        this.statusText.classList.remove('countdown');
        this.clearBoxHighlights();
    }

    resumePractice() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.resumeBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        // Resume with countdown
        this.isCountingDown = true;
        this.countdownValue = 3;
        
        // Show countdown in status text
        this.statusText.style.display = 'block';
        this.statusText.textContent = this.countdownValue.toString();
        this.statusText.classList.add('countdown');
        
        // Play initial countdown beep for "3"
        this.playBeep(600, 200);
        
        // Start countdown
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            
            if (this.countdownValue > 0) {
                this.statusText.textContent = this.countdownValue.toString();
                this.playBeep(600, 200);
            } else {
                // Countdown finished, resume the actual practice
                this.statusText.textContent = 'GO!';
                this.statusText.classList.remove('countdown');
                this.playBeep(1000, 300);
                
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.isCountingDown = false;
                
                setTimeout(() => {
                    this.resumeActualPractice();
                }, 500);
            }
        }, 1000);
    }

    resumeActualPractice() {
        this.isRunning = true;
        
        // Update last call time to current time to avoid timing issues
        this.lastCallTime = Date.now();
        
        // Hide the status text
        this.statusText.style.display = 'none';
        
        // Resume the main timer
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimeDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endPractice();
            }
        }, 1000);

        // Resume direction calling
        this.scheduleNextDirection();
    }

    stopPractice() {
        if (!this.isRunning && !this.isCountingDown && !this.isPaused) return;
        
        this.isRunning = false;
        this.isCountingDown = false;
        this.isPaused = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.resumeBtn.style.display = 'none';
        
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
        this.isPaused = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.resumeBtn.style.display = 'none';
        
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
        this.isPaused = false;
        this.statsDiv.style.display = 'none';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TableTennisReactionApp();
});

// Add some keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    // Space bar to start/pause/resume
    if (e.code === 'Space') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const startPracticeBtn = document.getElementById('startPracticeBtn');
        
        if (startBtn.style.display !== 'none') {
            startBtn.click();
        } else if (pauseBtn.style.display !== 'none') {
            pauseBtn.click();
        } else if (resumeBtn.style.display !== 'none') {
            resumeBtn.click();
        } else if (startPracticeBtn && !startPracticeBtn.disabled) {
            startPracticeBtn.click();
        }
    }
    
    // Escape to go back
    if (e.code === 'Escape') {
        const practiceArea = document.getElementById('practiceArea');
        const backBtn = document.getElementById('backBtn');
        
        if (practiceArea.style.display !== 'none' && backBtn) {
            backBtn.click();
        }
    }
    
    // Number keys for timer selection
    if (e.code === 'Digit1') {
        document.querySelector('[data-time="60"]')?.click();
    }
    if (e.code === 'Digit2') {
        const customMinutesSlider = document.getElementById('customMinutesSlider');
        if (customMinutesSlider) {
            customMinutesSlider.value = 2;
            customMinutesSlider.dispatchEvent(new Event('input'));
        }
    }
    
    // Mode selection shortcuts (B for Basic, A for Advanced)
    if (e.code === 'KeyB') {
        document.querySelector('[data-mode="basic"]')?.click();
    }
    if (e.code === 'KeyA') {
        document.querySelector('[data-mode="advanced"]')?.click();
    }
});
