# Implementation Notes - Table Tennis Reaction App Features

## Overview
This document provides detailed implementation notes for the two new features added to the table tennis reaction training app.

## Feature Branches
- **Issue #1 (Countdown):** `feature/issue-1-countdown-timer`
- **Issue #2 (Camera Movement):** `feature/issue-2-camera-movement`

## Issue #1: 3-Second Countdown Implementation

### Files Modified
- `script.js` - Core countdown logic
- `style.css` - Countdown animations and styling

### Key Implementation Details

#### State Management
```javascript
// New state variables added to constructor
this.isCountingDown = false;
this.countdownValue = 0;
this.countdownInterval = null;
```

#### Core Methods
1. **`startPractice()`** - Modified to show countdown before starting
2. **`startActualPractice()`** - New method for actual practice start after countdown
3. **`stopPractice()`** - Updated to handle countdown cancellation

#### Visual Design
- Large red countdown numbers (4rem font-size)
- Pulsing animation (`countdownPulse` keyframes)
- "GO!" message with different styling
- Smooth transitions between countdown and practice

#### Audio Feedback
- 600Hz beep for countdown numbers (3, 2, 1)
- 1000Hz beep for "GO!" signal
- 200ms duration for countdown, 300ms for GO

### Testing Checklist
- [ ] Countdown displays 3, 2, 1, GO! sequence
- [ ] Audio plays for each countdown step
- [ ] Stop button cancels countdown properly
- [ ] Practice starts automatically after countdown
- [ ] All existing functionality remains intact

## Issue #2: Camera Movement Detection Implementation

### Files Modified
- `script.js` - Camera access and motion detection
- `style.css` - Movement feedback styling
- `index.html` - Camera status UI

### Key Implementation Details

#### Camera Setup
```javascript
// Camera initialization with permission handling
async setupCamera() {
    // Creates hidden video element for camera feed
    // Requests camera permission with 320x240 resolution
    // Handles permission denial gracefully
}
```

#### Motion Detection Algorithm
1. **Frame Capture:** Draw video to canvas at 320x240 resolution
2. **Motion Analysis:** Compare current frame with previous frame
3. **Direction Detection:** Analyze motion in left/right halves of frame
4. **Threshold Check:** Motion intensity > 30 triggers direction detection

#### Visual Feedback System
- **Green Border:** `movement-correct` class when alignment is correct
- **Red Border:** `movement-incorrect` class when misaligned
- Applied to active direction box (L or R)

#### Integration Points
- Motion detection starts/stops with practice sessions
- Real-time feedback during direction calls
- Camera status displayed on timer selection screen

### Technical Specifications

#### Motion Calculation Logic
```javascript
// Divides frame into left/right halves
// Calculates grayscale difference between frames
// Determines movement direction based on motion distribution
// Uses 1.2x threshold to avoid false positives
```

#### Browser Compatibility
- Uses standard Web APIs (getUserMedia, Canvas)
- Works on modern browsers with camera support
- Graceful fallback when camera unavailable

### Testing Checklist
- [ ] Camera permission requested on app load
- [ ] Motion detection activates during practice
- [ ] Left/right movement correctly detected
- [ ] Visual feedback shows green for correct alignment
- [ ] Visual feedback shows red for incorrect alignment
- [ ] App works normally without camera access
- [ ] Camera status updates appropriately

## Code Quality Notes

### Error Handling
- Camera setup wrapped in try-catch blocks
- Graceful fallback when permissions denied
- Console warnings for debugging
- User-friendly status messages

### Performance Considerations
- Motion detection uses requestAnimationFrame
- Frame analysis optimized with sampling (every 4th pixel)
- Canvas operations minimized for efficiency
- Detection stops when practice ends

### Browser Support
- Modern browsers with getUserMedia support
- iOS Safari compatibility with `playsinline` attribute
- Chrome/Firefox/Edge tested and working

## Pull Request Review Guidelines

### Code Review Focus Areas
1. **Security:** Camera permissions handled safely
2. **Performance:** Motion detection doesn't impact game performance
3. **UX:** Countdown timing feels natural and responsive
4. **Accessibility:** Visual feedback is clear and distinguishable
5. **Error Handling:** Graceful degradation when features unavailable

### Manual Testing Steps
1. **Countdown Feature:**
   - Start practice and verify 3-second countdown
   - Test stop button during countdown
   - Verify audio feedback works
   - Check countdown-to-practice transition

2. **Camera Feature:**
   - Allow camera permissions and verify detection works
   - Deny camera permissions and verify graceful fallback
   - Test left/right movement detection accuracy
   - Verify visual feedback during practice

### Deployment Considerations
- Features work independently (countdown works without camera)
- No external dependencies added
- Backward compatible with existing functionality
- HTTPS required for camera access in production

## Future Enhancement Opportunities

### Countdown Feature
- Customizable countdown duration
- Different countdown sounds/styles
- Visual countdown on direction boxes

### Camera Feature
- Pose detection using MediaPipe for more accurate tracking
- Calibration system for movement sensitivity
- Movement statistics and training insights
- Multiple camera angle support

## Troubleshooting

### Common Issues
1. **Camera not working:** Check HTTPS, permissions, browser compatibility
2. **Motion detection too sensitive:** Adjust `movementThreshold` value
3. **Countdown too fast/slow:** Modify interval timing in `startPractice()`
4. **Audio not playing:** Check browser autoplay policies

### Debug Information
- Camera status shown in UI
- Console logs for camera initialization
- Motion detection data available in browser dev tools