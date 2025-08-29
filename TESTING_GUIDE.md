# Testing Guide - Table Tennis Reaction App Features

## Quick Testing Setup

### Local Testing Environment
```bash
# Clone and setup
git clone <repository-url>
cd table-tennis-reaction-app

# Test original app
git checkout master
python3 -m http.server 8080
# Visit: http://localhost:8080

# Test countdown feature
git checkout feature/issue-1-countdown-timer
python3 -m http.server 8080
# Visit: http://localhost:8080

# Test camera feature (requires HTTPS for full testing)
git checkout feature/issue-2-camera-movement
python3 -m http.server 8080
# Visit: http://localhost:8080
```

### HTTPS Setup for Camera Testing
```bash
# For full camera testing, use HTTPS
# Option 1: Use ngrok
npx ngrok http 8080

# Option 2: Use local HTTPS server
npx http-server -S -C cert.pem -K key.pem
```

## Feature Testing Checklists

### Issue #1: 3-Second Countdown Testing

#### Basic Functionality
- [ ] **Countdown Display**
  - Click "Start" button
  - Verify countdown shows large red numbers: "3" → "2" → "1" → "GO!"
  - Each number displays for exactly 1 second
  - "GO!" displays for 0.5 seconds before practice starts

- [ ] **Audio Feedback**
  - Each countdown number plays a 600Hz beep (200ms duration)
  - "GO!" plays a 1000Hz beep (300ms duration)
  - Audio doesn't interfere with practice session sounds

- [ ] **Visual Design**
  - Countdown numbers are large (4rem) and red colored
  - Pulsing animation plays with each number
  - Smooth transition from countdown to practice
  - No visual glitches or layout shifts

#### Interaction Testing
- [ ] **Stop During Countdown**
  - Start countdown
  - Click "Stop" during countdown (test at 3, 2, 1)
  - Verify countdown stops immediately
  - Verify practice doesn't start
  - Verify UI returns to ready state

- [ ] **Keyboard Shortcuts**
  - Test spacebar to start countdown
  - Test spacebar to stop during countdown
  - Test escape key functionality during countdown

#### Edge Cases
- [ ] **Rapid Clicking**
  - Click start multiple times rapidly
  - Verify only one countdown starts
  - No duplicate intervals or audio

- [ ] **Browser Tab Switching**
  - Start countdown
  - Switch browser tabs
  - Return to tab
  - Verify countdown continues or handles properly

### Issue #2: Camera Movement Detection Testing

#### Camera Setup Testing
- [ ] **Permission Grant**
  - Fresh browser/incognito mode
  - Visit app
  - Grant camera permission when requested
  - Verify "✅ Camera ready for body movement tracking" message
  - Verify no console errors

- [ ] **Permission Denial**
  - Fresh browser/incognito mode
  - Visit app
  - Deny camera permission
  - Verify "⚠️ Camera not available" message
  - Verify app still functions normally
  - Verify no console errors or crashes

#### Motion Detection Testing
- [ ] **Left Movement Detection**
  - Allow camera permissions
  - Start practice session
  - When "L" box highlights, move body/arm to the left
  - Verify green border appears on L box
  - Test multiple times for consistency

- [ ] **Right Movement Detection**
  - When "R" box highlights, move body/arm to the right
  - Verify green border appears on R box
  - Test multiple times for consistency

- [ ] **Incorrect Movement Detection**
  - When "L" box highlights, move body/arm to the right
  - Verify red border appears on L box
  - When "R" box highlights, move body/arm to the left
  - Verify red border appears on R box

#### Advanced Motion Testing
- [ ] **Movement Sensitivity**
  - Test small movements (should not trigger)
  - Test large movements (should trigger reliably)
  - Test quick vs slow movements
  - Verify threshold feels natural

- [ ] **Multiple People**
  - Test with multiple people in camera view
  - Verify detection still works reasonably
  - Document any issues for future improvement

- [ ] **Lighting Conditions**
  - Test in bright light
  - Test in dim light
  - Test with changing lighting
  - Note performance differences

#### Camera Integration Testing
- [ ] **Practice Flow Integration**
  - Motion detection starts when practice starts
  - Motion detection stops when practice stops
  - No motion feedback when practice is paused
  - Camera status persists through multiple sessions

- [ ] **Performance Testing**
  - Monitor CPU usage during motion detection
  - Verify smooth practice timing (1-1.5s intervals maintained)
  - No noticeable lag in direction calls
  - Frame rate remains stable

## Browser Compatibility Testing

### Desktop Browsers
- [ ] **Chrome (Latest)**
  - All features work
  - Camera permission handling
  - Audio playback
  - Performance smooth

- [ ] **Firefox (Latest)**
  - All features work
  - Camera permission handling
  - Audio playback
  - Performance smooth

- [ ] **Safari (Latest)**
  - All features work (requires HTTPS for camera)
  - Camera permission handling
  - Audio playback
  - Performance smooth

- [ ] **Edge (Latest)**
  - All features work
  - Camera permission handling
  - Audio playbook
  - Performance smooth

### Mobile Testing
- [ ] **iOS Safari**
  - Touch interactions work
  - Camera access (requires HTTPS)
  - Audio playback (may require user interaction)
  - Responsive design maintained

- [ ] **Android Chrome**
  - Touch interactions work
  - Camera access
  - Audio playback
  - Responsive design maintained

## Integration Testing

### Both Features Together
- [ ] **Sequential Testing**
  - Start practice with countdown
  - Verify camera starts after countdown completes
  - Test motion detection during practice
  - Verify both audio systems don't conflict

- [ ] **Camera + Countdown**
  - Countdown works with camera enabled
  - Countdown works with camera disabled
  - Motion detection properly starts after countdown
  - No timing conflicts between features

## Performance Testing

### Metrics to Monitor
- [ ] **Memory Usage**
  - Baseline: Original app memory usage
  - With countdown: Should be minimal increase
  - With camera: Monitor video stream memory
  - Extended use: Check for memory leaks

- [ ] **CPU Usage**
  - Motion detection impact
  - Frame processing efficiency
  - Smooth 60fps on target devices

- [ ] **Battery Impact (Mobile)**
  - Camera usage impact
  - Extended session testing
  - Background tab behavior

## Error Scenarios Testing

### Network Issues
- [ ] **Slow Connection**
  - App loads properly
  - Features work offline after load
  - No network dependencies for core features

### Hardware Issues
- [ ] **No Camera**
  - Test on device without camera
  - Verify graceful fallback
  - Appropriate error messages

- [ ] **Camera in Use**
  - Test when camera used by another app
  - Verify error handling
  - Recovery when camera becomes available

### User Errors
- [ ] **Rapid Interactions**
  - Fast clicking/tapping
  - Multiple simultaneous actions
  - UI state consistency

## Accessibility Testing

### Visual Accessibility
- [ ] **Color Contrast**
  - Countdown colors readable
  - Movement feedback colors distinguishable
  - Works for colorblind users

- [ ] **Text Size**
  - Countdown numbers clearly visible
  - Status messages readable
  - Mobile screen compatibility

### Audio Accessibility
- [ ] **Hearing Impaired**
  - Visual feedback sufficient without audio
  - Clear visual indicators for all states
  - No audio-only information

## Automated Testing Suggestions

### Unit Tests to Add
```javascript
// Countdown feature tests
describe('Countdown Feature', () => {
  test('countdown displays correct sequence', () => {});
  test('countdown stops on user action', () => {});
  test('practice starts after countdown', () => {});
});

// Camera feature tests  
describe('Camera Feature', () => {
  test('handles camera permission denial', () => {});
  test('detects left/right movement', () => {});
  test('provides correct visual feedback', () => {});
});
```

### Integration Tests
```javascript
describe('Feature Integration', () => {
  test('camera starts after countdown', () => {});
  test('both features work with original app', () => {});
  test('graceful degradation when features unavailable', () => {});
});
```

## Test Reporting Template

### Test Execution Report
```
Date: ___________
Tester: __________
Browser: _________
OS: _____________

Feature 1 - Countdown:
✅ Basic functionality: PASS/FAIL
✅ Audio feedback: PASS/FAIL  
✅ Visual design: PASS/FAIL
✅ Interactions: PASS/FAIL

Feature 2 - Camera:
✅ Permission handling: PASS/FAIL
✅ Motion detection: PASS/FAIL
✅ Visual feedback: PASS/FAIL
✅ Performance: PASS/FAIL

Integration:
✅ Both features together: PASS/FAIL
✅ Backward compatibility: PASS/FAIL

Issues Found:
1. ________________
2. ________________

Overall Status: READY/NEEDS_WORK
```

This comprehensive testing guide ensures both features are thoroughly validated before production deployment.