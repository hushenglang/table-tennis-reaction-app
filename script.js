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
        
        // Camera and pose detection
        this.videoElement = null;
        this.cameraCanvas = null;
        this.cameraContext = null;
        this.poseCanvas = null;
        this.poseContext = null;
        this.pose = null;
        this.camera = null;
        this.poseDetectionEnabled = false;
        this.movementSensitivity = 0.3;
        this.lastMovementDirection = null;
        this.movementCorrect = false;
        this.poseDetectionActive = false;
        this.showPoseOverlay = false;
        this.currentPose = null;
        this.previousPose = null;
        this.baselinePose = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
        this.setupCamera();
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
        
        // Camera status element
        this.cameraStatusElement = document.getElementById('cameraStatus');
        
        // Pose detection elements
        this.poseOptionsDiv = document.getElementById('poseOptions');
        this.showPoseOverlayCheckbox = document.getElementById('showPoseOverlay');
        this.movementSensitivitySlider = document.getElementById('movementSensitivity');
        this.poseCanvas = document.getElementById('poseCanvas');
        this.calibrateButton = document.getElementById('calibrateButton');
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
        
        // Pose detection controls
        if (this.showPoseOverlayCheckbox) {
            this.showPoseOverlayCheckbox.addEventListener('change', (e) => {
                this.showPoseOverlay = e.target.checked;
                this.togglePoseOverlay();
            });
        }
        
        if (this.movementSensitivitySlider) {
            this.movementSensitivitySlider.addEventListener('input', (e) => {
                this.movementSensitivity = parseFloat(e.target.value);
            });
        }
        
        if (this.calibrateButton) {
            this.calibrateButton.addEventListener('click', () => {
                this.startCalibration();
            });
        }
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
        
        // Start motion detection if camera is available
        this.startPoseDetection();
        
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
        
        // Stop pose detection
        this.stopPoseDetection();
        
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
        
        // Stop pose detection
        this.stopPoseDetection();
        
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
        this.leftBox.classList.remove('active', 'movement-correct', 'movement-incorrect');
        this.rightBox.classList.remove('active', 'movement-correct', 'movement-incorrect');
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

    async setupCamera() {
        try {
            // Check if MediaPipe is available
            if (typeof Pose === 'undefined') {
                throw new Error('MediaPipe Pose not loaded');
            }

            // Create video element for camera feed
            this.videoElement = document.createElement('video');
            this.videoElement.setAttribute('autoplay', '');
            this.videoElement.setAttribute('muted', '');
            this.videoElement.setAttribute('playsinline', '');
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            // Setup pose canvas
            if (this.poseCanvas) {
                this.poseContext = this.poseCanvas.getContext('2d');
            }

            // Initialize MediaPipe Pose
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            this.pose.setOptions({
                modelComplexity: 1,
                smoothSegmentation: true,
                enableSegmentation: false,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.pose.onResults((results) => this.onPoseResults(results));

            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = resolve;
            });

            // Initialize camera utility
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.poseDetectionActive) {
                        await this.pose.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            console.log('Camera and pose detection initialized successfully');
            this.poseDetectionEnabled = true;
            this.updateCameraStatus('✅ Camera ready for pose-based movement tracking');
            
            // Show pose options
            if (this.poseOptionsDiv) {
                this.poseOptionsDiv.style.display = 'block';
            }
        } catch (error) {
            console.warn('Camera or pose detection setup failed:', error);
            this.poseDetectionEnabled = false;
            this.updateCameraStatus('⚠️ Camera/pose detection not available - practice will work without movement tracking');
        }
    }

    updateCameraStatus(message) {
        if (this.cameraStatusElement) {
            this.cameraStatusElement.textContent = message;
        }
    }

    startPoseDetection() {
        if (!this.poseDetectionEnabled || this.poseDetectionActive) return;
        
        this.poseDetectionActive = true;
        this.previousPose = null;
        this.baselinePose = null;
        
        // Start camera feed
        if (this.camera) {
            this.camera.start();
        }
    }

    stopPoseDetection() {
        this.poseDetectionActive = false;
        this.lastMovementDirection = null;
        this.movementCorrect = false;
        this.currentPose = null;
        this.previousPose = null;
        this.baselinePose = null;
        
        // Stop camera feed
        if (this.camera) {
            this.camera.stop();
        }
    }

    onPoseResults(results) {
        if (!this.poseDetectionActive) return;
        
        this.currentPose = results;
        
        // Draw pose visualization if enabled
        if (this.showPoseOverlay && this.poseContext && this.poseCanvas) {
            this.drawPoseOverlay(results);
        }
        
        // Analyze pose for movement direction
        if (results.poseLandmarks) {
            this.analyzePoseMovement(results.poseLandmarks);
        }
    }

    analyzePoseMovement(landmarks) {
        // Use shoulder and wrist landmarks for movement detection
        const leftShoulder = landmarks[11];  // LEFT_SHOULDER
        const rightShoulder = landmarks[12]; // RIGHT_SHOULDER
        const leftWrist = landmarks[15];     // LEFT_WRIST
        const rightWrist = landmarks[16];    // RIGHT_WRIST
        
        if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return;
        
        // Calculate shoulder center as reference point
        const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        
        // Calculate arm extensions relative to shoulder center
        const leftArmExtension = Math.abs(leftWrist.x - leftShoulder.x);
        const rightArmExtension = Math.abs(rightWrist.x - rightShoulder.x);
        
        // Check if arms are raised (Y position comparison)
        const leftArmRaised = leftWrist.y < leftShoulder.y - 0.1;
        const rightArmRaised = rightWrist.y < rightShoulder.y - 0.1;
        
        // Establish baseline on first detection
        if (!this.baselinePose) {
            this.baselinePose = {
                leftArmExtension,
                rightArmExtension,
                shoulderCenterX
            };
            return;
        }
        
        // Calculate movement relative to baseline
        const leftMovement = leftArmExtension - this.baselinePose.leftArmExtension;
        const rightMovement = rightArmExtension - this.baselinePose.rightArmExtension;
        
        // Detect significant movement with sensitivity adjustment
        const movementThreshold = this.movementSensitivity;
        
        let detectedDirection = null;
        
        // Left movement: left arm extended OR body leaning left
        if ((leftMovement > movementThreshold && leftArmRaised) || 
            (shoulderCenterX < this.baselinePose.shoulderCenterX - movementThreshold)) {
            detectedDirection = 'left';
        }
        // Right movement: right arm extended OR body leaning right  
        else if ((rightMovement > movementThreshold && rightArmRaised) || 
                 (shoulderCenterX > this.baselinePose.shoulderCenterX + movementThreshold)) {
            detectedDirection = 'right';
        }
        
        if (detectedDirection && detectedDirection !== this.lastMovementDirection) {
            this.lastMovementDirection = detectedDirection;
            this.checkMovementAlignment();
        }
    }

    drawPoseOverlay(results) {
        if (!this.poseContext || !this.poseCanvas) return;
        
        // Clear canvas
        this.poseContext.clearRect(0, 0, this.poseCanvas.width, this.poseCanvas.height);
        
        if (results.poseLandmarks) {
            // Set canvas size to match container
            const rect = this.poseCanvas.getBoundingClientRect();
            this.poseCanvas.width = rect.width;
            this.poseCanvas.height = rect.height;
            
            // Draw pose landmarks
            this.poseContext.save();
            this.poseContext.scale(this.poseCanvas.width, this.poseCanvas.height);
            
            // Draw connections
            drawConnectors(this.poseContext, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            
            // Draw landmarks
            drawLandmarks(this.poseContext, results.poseLandmarks, {
                color: '#FF0000',
                radius: 3
            });
            
            this.poseContext.restore();
        }
    }

    togglePoseOverlay() {
        if (this.poseCanvas) {
            this.poseCanvas.style.display = this.showPoseOverlay ? 'block' : 'none';
        }
    }

    async startCalibration() {
        if (!this.poseDetectionEnabled) {
            alert('Camera not available for calibration');
            return;
        }

        // Update button state
        this.calibrateButton.textContent = 'Calibrating... Stand in neutral position';
        this.calibrateButton.classList.add('calibrating');
        this.calibrateButton.disabled = true;

        // Start pose detection if not already running
        if (!this.poseDetectionActive) {
            this.startPoseDetection();
        }

        // Reset baseline
        this.baselinePose = null;

        // Wait for stable pose detection
        let calibrationData = [];
        let calibrationTime = 3000; // 3 seconds
        let startTime = Date.now();

        const calibrationInterval = setInterval(() => {
            if (this.currentPose && this.currentPose.poseLandmarks) {
                const landmarks = this.currentPose.poseLandmarks;
                const leftShoulder = landmarks[11];
                const rightShoulder = landmarks[12];
                const leftWrist = landmarks[15];
                const rightWrist = landmarks[16];

                if (leftShoulder && rightShoulder && leftWrist && rightWrist) {
                    calibrationData.push({
                        leftArmExtension: Math.abs(leftWrist.x - leftShoulder.x),
                        rightArmExtension: Math.abs(rightWrist.x - rightShoulder.x),
                        shoulderCenterX: (leftShoulder.x + rightShoulder.x) / 2
                    });
                }
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.ceil((calibrationTime - elapsed) / 1000);
            
            if (remaining > 0) {
                this.calibrateButton.textContent = `Calibrating... ${remaining}s`;
            }

            if (elapsed >= calibrationTime) {
                clearInterval(calibrationInterval);
                this.finishCalibration(calibrationData);
            }
        }, 100);
    }

    finishCalibration(calibrationData) {
        if (calibrationData.length > 10) {
            // Calculate average baseline pose
            const avgLeftArmExtension = calibrationData.reduce((sum, data) => sum + data.leftArmExtension, 0) / calibrationData.length;
            const avgRightArmExtension = calibrationData.reduce((sum, data) => sum + data.rightArmExtension, 0) / calibrationData.length;
            const avgShoulderCenterX = calibrationData.reduce((sum, data) => sum + data.shoulderCenterX, 0) / calibrationData.length;

            this.baselinePose = {
                leftArmExtension: avgLeftArmExtension,
                rightArmExtension: avgRightArmExtension,
                shoulderCenterX: avgShoulderCenterX
            };

            this.calibrateButton.textContent = 'Calibration Complete!';
            this.calibrateButton.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            
            setTimeout(() => {
                this.calibrateButton.textContent = 'Calibrate Movement';
                this.calibrateButton.classList.remove('calibrating');
                this.calibrateButton.disabled = false;
                this.calibrateButton.style.background = '';
            }, 2000);

            console.log('Calibration successful:', this.baselinePose);
        } else {
            this.calibrateButton.textContent = 'Calibration Failed - Try Again';
            this.calibrateButton.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            
            setTimeout(() => {
                this.calibrateButton.textContent = 'Calibrate Movement';
                this.calibrateButton.classList.remove('calibrating');
                this.calibrateButton.disabled = false;
                this.calibrateButton.style.background = '';
            }, 2000);
        }
    }

    checkMovementAlignment() {
        if (!this.lastDirection || !this.lastMovementDirection) return;
        
        // Check if body movement aligns with the direction being shown
        this.movementCorrect = this.lastDirection === this.lastMovementDirection;
        
        // Provide visual feedback
        this.updateMovementFeedback();
    }

    updateMovementFeedback() {
        // Add visual feedback to the direction boxes
        const leftBox = this.leftBox;
        const rightBox = this.rightBox;
        
        // Remove previous feedback classes
        leftBox.classList.remove('movement-correct', 'movement-incorrect');
        rightBox.classList.remove('movement-correct', 'movement-incorrect');
        
        if (this.lastDirection && this.lastMovementDirection) {
            if (this.movementCorrect) {
                // Correct movement - add green highlight to the active box
                if (this.lastDirection === 'left') {
                    leftBox.classList.add('movement-correct');
                } else {
                    rightBox.classList.add('movement-correct');
                }
            } else {
                // Incorrect movement - add red highlight to show misalignment
                if (this.lastDirection === 'left') {
                    leftBox.classList.add('movement-incorrect');
                } else {
                    rightBox.classList.add('movement-incorrect');
                }
            }
        }
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
