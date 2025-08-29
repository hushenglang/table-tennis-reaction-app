class TableTennisReactionApp {
    constructor() {
        this.selectedTime = 0;
        this.timeRemaining = 0;
        this.isRunning = false;
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
        // Timer selection elements
        this.timerButtons = document.querySelectorAll('.timer-btn');
        this.timerSelectionDiv = document.querySelector('.timer-selection');
        this.practiceArea = document.getElementById('practiceArea');
        
        // Practice area elements
        this.timeDisplay = document.getElementById('timeRemaining');
        this.directionDisplay = document.getElementById('directionDisplay');
        this.leftBox = document.getElementById('leftBox');
        this.rightBox = document.getElementById('rightBox');
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

        // Control buttons
        this.startBtn.addEventListener('click', () => this.startPractice());
        this.stopBtn.addEventListener('click', () => this.stopPractice());
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
        this.showPracticeArea();
    }

    showPracticeArea() {
        this.timerSelectionDiv.style.display = 'none';
        this.practiceArea.style.display = 'block';
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
        this.resetStats();
    }

    startPractice() {
        if (this.isRunning) return;
        
        // Initialize audio context on user interaction
        this.createAudioContext();
        
        this.isRunning = true;
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'inline-block';
        this.statsDiv.style.display = 'none';
        
        this.totalCalls = 0;
        this.intervals = [];
        this.lastCallTime = Date.now();
        this.lastDirection = null;
        
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
        if (!this.isRunning) return;
        
        this.isRunning = false;
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
        
        // Reset display
        this.statusText.textContent = 'Stopped';
        this.statusText.style.display = 'block';
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
        this.statusText.textContent = 'Complete!';
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
        
        // Generate random direction
        const directions = ['left', 'right'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        // Clear previous highlights and hide status text
        this.clearBoxHighlights();
        this.statusText.style.display = 'none';
        
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
        // Highlight the appropriate box and play sound
        if (direction === 'left') {
            this.leftBox.classList.add('active');
            this.playBeep(800, 150); // Higher pitch for left
        } else {
            this.rightBox.classList.add('active');
            this.playBeep(400, 150); // Lower pitch for right
        }
    }

    clearBoxHighlights() {
        this.leftBox.classList.remove('active');
        this.rightBox.classList.remove('active');
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
        const backBtn = document.getElementById('backBtn');
        if (backBtn.style.display !== 'none') {
            backBtn.click();
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
});
