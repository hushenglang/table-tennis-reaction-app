// Lightweight i18n utility
const I18N_DICTIONARY = {
	en: {
		title: '🏓 Table Tennis Reaction Practice',
		titlePlain: 'Table Tennis Reaction Practice',
		subtitle: 'Train your reflexes with random direction calls',
		duration: 'Practice Duration',
		mode: 'Practice Mode',
		basicMode: 'Basic Mode',
		basicDesc: 'Left & Right only',
		advancedMode: 'Advanced Mode',
		advancedDesc: '4 directions with forward shots',
		startPractice: 'Start Practice',
		ready: 'Ready?',
		pause: 'Pause',
		resume: 'Resume',
		back: 'Back',
		complete: 'Practice Complete!',
		totalCallsLabel: 'Total directions called:',
		avgIntervalLabel: 'Average interval:',
		secondsSuffix: 's',
		selectionStatus: '{minutes}min {mode} mode - Ready to start!',
		modeBasicLabel: 'basic',
		modeAdvancedLabel: 'advanced',
		go: 'GO!',
		paused: 'Paused',
		stopped: 'Stopped',
		good: 'Awesome~'
	},
	zh: {
		title: '🏓 乒乓球反应训练',
		titlePlain: '乒乓球反应训练',
		subtitle: '通过随机方向口令训练反应能力',
		duration: '练习时长',
		mode: '练习模式',
		basicMode: '基础模式',
		basicDesc: '仅左与右',
		advancedMode: '进阶模式',
		advancedDesc: '四个方向含前球',
		startPractice: '开始练习',
		ready: '准备好了吗？',
		pause: '暂停',
		resume: '继续',
		back: '返回',
		complete: '练习完成！',
		totalCallsLabel: '方向提示总数：',
		avgIntervalLabel: '平均间隔：',
		secondsSuffix: '秒',
		selectionStatus: '{minutes}分钟 {mode} 模式 - 准备开始！',
		modeBasicLabel: '基础',
		modeAdvancedLabel: '进阶',
		go: '开始！',
		paused: '已暂停',
		stopped: '已停止',
		good: '很棒~'
	}
};

let CURRENT_LANG = 'en';

function normalizeLanguage(langParam) {
	if (!langParam) return 'en';
	const lower = String(langParam).toLowerCase();
	if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh_hans') return 'zh';
	return 'en';
}

function detectLanguageFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return normalizeLanguage(params.get('lang'));
}

function translate(key, vars = undefined) {
	const dict = I18N_DICTIONARY[CURRENT_LANG] || I18N_DICTIONARY.en;
	let template = dict[key] ?? I18N_DICTIONARY.en[key] ?? key;
	if (vars && typeof template === 'string') {
		template = template.replace(/\{(\w+)\}/g, (m, p1) => (p1 in vars ? String(vars[p1]) : m));
	}
	return template;
}

function applyStaticTranslations() {
	// Update elements marked with data-i18n
	document.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		if (key) {
			el.textContent = translate(key);
		}
	});

	// Update document title and html lang attribute
	document.title = translate('titlePlain');
	document.documentElement.setAttribute('lang', CURRENT_LANG === 'zh' ? 'zh' : 'en');
}

function setLanguage(lang) {
	CURRENT_LANG = lang;
	applyStaticTranslations();
}

class TableTennisReactionApp {
    constructor() {
        this.selectedTime = 60; // Default 1 minute
        this.selectedMode = 'basic'; // Default basic mode
        this.timeRemaining = 60;
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
        this.updateTimeDisplay(); // Initialize time display
        this.updateStartButton(); // Initialize localized selection status
    }

    initializeElements() {
        // Header
        this.header = document.getElementById('header');
        
        // Combined selection page elements
        this.selectionPage = document.getElementById('selectionPage');
        this.durationInput = document.getElementById('durationInput');
        this.decreaseBtn = document.getElementById('decreaseBtn');
        this.increaseBtn = document.getElementById('increaseBtn');

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
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Stats elements
        this.statsDiv = document.getElementById('stats');
        this.totalCallsSpan = document.getElementById('totalCalls');
        this.avgIntervalSpan = document.getElementById('avgInterval');
    }

    bindEvents() {
        // Duration controls
        this.decreaseBtn.addEventListener('click', () => this.adjustDuration(-0.5));
        this.increaseBtn.addEventListener('click', () => this.adjustDuration(0.5));
        
        this.durationInput.addEventListener('input', (e) => {
            this.selectTimer(parseFloat(e.target.value) * 60); // Convert minutes to seconds
        });
        
        // Remove unused event listeners for elements that don't exist

        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMode(e.target.closest('.mode-btn').dataset.mode);
            });
        });

        // Start practice button - now auto-starts practice
        this.startPracticeBtn.addEventListener('click', () => this.showPracticeAreaAndStart());

        // Control buttons
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

    playCompletionSound() {
        const audioContext = this.createAudioContext();
        if (!audioContext) return;

        try {
            // Resume audio context if it's suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            // Play a pleasant ascending melody to indicate completion
            const notes = [
                { frequency: 523, startTime: 0, duration: 0.3 },      // C5
                { frequency: 659, startTime: 0.2, duration: 0.3 },    // E5
                { frequency: 784, startTime: 0.4, duration: 0.3 },    // G5
                { frequency: 1047, startTime: 0.6, duration: 0.5 }    // C6 (longer final note)
            ];

            notes.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime + note.startTime);
                oscillator.type = 'sine';

                // Create smooth envelope
                const startTime = audioContext.currentTime + note.startTime;
                const endTime = startTime + note.duration;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

                oscillator.start(startTime);
                oscillator.stop(endTime);
            });
        } catch (e) {
            console.warn('Error playing completion sound:', e);
        }
    }

    adjustDuration(change) {
        const currentValue = parseFloat(this.durationInput.value);
        const newValue = Math.max(0.5, Math.min(10, currentValue + change));
        this.durationInput.value = newValue;
        this.selectTimer(newValue * 60);
    }

    selectTimer(seconds) {
        this.selectedTime = seconds;
        this.timeRemaining = seconds;
        this.updateTimeDisplay();
        this.updateStartButton();
    }
    
    // Removed unused methods that reference non-existent elements

    selectMode(mode) {
        this.selectedMode = mode;
        
        // Update button selection state
        this.modeButtons.forEach(btn => btn.classList.remove('selected'));
        // Find the button with the matching mode and add selected class
        const selectedButton = Array.from(this.modeButtons).find(btn => btn.dataset.mode === mode);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        
        this.updateStartButton();
    }

    updateStartButton() {
        const durationMinutes = this.selectedTime / 60;
        const modeLabel = this.selectedMode === 'basic' ? translate('modeBasicLabel') : translate('modeAdvancedLabel');
        this.selectionStatus.textContent = translate('selectionStatus', { minutes: durationMinutes, mode: modeLabel });
    }

    showPracticeAreaAndStart() {
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
        
        this.clearBoxHighlights();
        this.lastDirection = null;
        
        // Clear timer warning states
        const timerElement = this.timeDisplay.parentElement;
        timerElement.classList.remove('warning', 'critical');
        
        this.resetStats();
        
        // Auto-start practice
        setTimeout(() => {
            this.startPractice();
        }, 100);
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
                this.statusText.textContent = translate('go');
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
        this.statusText.textContent = translate('paused');
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
                this.statusText.textContent = translate('go');
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
        this.statusText.textContent = translate('stopped');
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
        
        // Play completion sound - a pleasant ascending melody
        this.playCompletionSound();
        
        // Show completion message
        this.statusText.textContent = translate('good');
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
    // Initialize language from URL and apply static translations first
    setLanguage(detectLanguageFromUrl());
    // Then boot the app so dynamic strings use CURRENT_LANG
    new TableTennisReactionApp();
});

// Add some keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    // Space bar to start/pause/resume
    if (e.code === 'Space') {
        e.preventDefault();
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const startPracticeBtn = document.getElementById('startPracticeBtn');
        
        if (pauseBtn.style.display !== 'none') {
            pauseBtn.click();
        } else if (resumeBtn.style.display !== 'none') {
            resumeBtn.click();
        } else if (startPracticeBtn) {
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
    
    // Number keys for duration input
    if (e.code === 'Digit1') {
        const durationInput = document.getElementById('durationInput');
        if (durationInput && document.getElementById('selectionPage').style.display !== 'none') {
            durationInput.value = '1';
            durationInput.dispatchEvent(new Event('input'));
        }
    }
    if (e.code === 'Digit2') {
        const durationInput = document.getElementById('durationInput');
        if (durationInput && document.getElementById('selectionPage').style.display !== 'none') {
            durationInput.value = '2';
            durationInput.dispatchEvent(new Event('input'));
        }
    }
    if (e.code === 'Digit3') {
        const durationInput = document.getElementById('durationInput');
        if (durationInput && document.getElementById('selectionPage').style.display !== 'none') {
            durationInput.value = '3';
            durationInput.dispatchEvent(new Event('input'));
        }
    }
    
    // Plus/Minus keys for duration adjustment
    if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        const increaseBtn = document.getElementById('increaseBtn');
        if (increaseBtn && document.getElementById('selectionPage').style.display !== 'none') {
            increaseBtn.click();
        }
    }
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        const decreaseBtn = document.getElementById('decreaseBtn');
        if (decreaseBtn && document.getElementById('selectionPage').style.display !== 'none') {
            decreaseBtn.click();

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
