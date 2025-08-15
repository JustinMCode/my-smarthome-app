# Calendar Interactions Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| index.js | Centralized export point for interaction modules | 27 | 3 | 🟡 |
| touch-gestures.js | Touch gesture handling and navigation | 328 | 15 | 🔴 |

## Improvement Recommendations

### index.js

#### 🟡 Medium Priority
- **Issue**: Redundant legacy exports creating maintenance overhead
  - Current: Both direct and legacy exports for backward compatibility
  - Suggested: Remove legacy exports, use semantic versioning for breaking changes
  - Impact: Reduces bundle size and maintenance complexity

- **Issue**: Missing JSDoc documentation for exports
  - Current: No documentation for exported interaction modules
  - Suggested: Add comprehensive JSDoc comments for all exports
  - Impact: Better developer experience and API documentation

- **Issue**: Default export includes all interactions
  - Current: Default export includes all interaction modules
  - Suggested: Remove default export, use named imports only
  - Impact: Better tree-shaking and bundle optimization

### touch-gestures.js

#### 🔴 Critical Issues
- **Issue**: Large monolithic interaction file (328 lines) with multiple responsibilities
  - Current: Single file handling touch gestures, navigation, feedback, settings, and ripple effects
  - Suggested: Split into focused modules by responsibility
  - Impact: Better maintainability, testability, and separation of concerns

- **Issue**: Inline CSS styles in JavaScript
  - Current: CSS styles embedded in showSwipeFeedback() method
  - Suggested: Use CSS classes and external stylesheets
  - Impact: Better separation of concerns and maintainability

- **Issue**: Missing error handling for event listener cleanup
  - Current: Event listeners removed in destroy() but not properly bound
  - Suggested: Use proper event listener binding and cleanup
  - Impact: Prevents memory leaks and runtime errors

#### 🟠 High Priority
- **Issue**: Console logging in production code
  - Current: Multiple console.log and console.warn statements
  - Suggested: Use proper logging service with levels
  - Impact: Better debugging and production monitoring

- **Issue**: Missing input validation for method parameters
  - Current: No validation for direction, settings, or element parameters
  - Suggested: Add comprehensive input validation with meaningful errors
  - Impact: Better error handling and debugging

- **Issue**: Hardcoded touch configuration values
  - Current: Touch settings modified directly in updateSettings()
  - Suggested: Use immutable configuration or configuration service
  - Impact: Better configuration management and consistency

- **Issue**: Missing accessibility features
  - Current: No ARIA attributes or keyboard navigation support
  - Suggested: Add comprehensive accessibility support
  - Impact: Better accessibility compliance

#### 🟡 Medium Priority
- **Issue**: Inconsistent method naming conventions
  - Current: Mix of camelCase and descriptive naming
  - Suggested: Standardize on consistent naming convention
  - Impact: Better code consistency and readability

- **Issue**: Missing JSDoc for some methods
  - Current: Inconsistent JSDoc coverage
  - Suggested: Add comprehensive JSDoc for all methods
  - Impact: Better API documentation

- **Issue**: No throttling for touch events
  - Current: Touch events processed without throttling
  - Suggested: Add throttling for performance optimization
  - Impact: Better performance during rapid touch interactions

- **Issue**: Hardcoded animation durations
  - Current: setTimeout durations hardcoded (500ms, 600ms)
  - Suggested: Use configuration constants for animation timing
  - Impact: Better maintainability and consistency

#### 🟢 Low Priority
- **Issue**: Missing internationalization support
  - Current: Hardcoded English text in notifications
  - Suggested: Add i18n support for all text content
  - Impact: Better internationalization support

- **Issue**: No performance monitoring
  - Current: No tracking of gesture performance or statistics
  - Suggested: Add performance monitoring and metrics
  - Impact: Better performance optimization

## Refactoring Effort Estimate
- Total files needing work: 2
- Estimated hours: 25-35 hours
- Quick wins: index.js (remove legacy exports), extract feedback and ripple components
- Complex refactors: touch-gestures.js (complete modularization and accessibility)

## Dependencies
- Internal dependencies: 
  - CALENDAR_CONFIG, SELECTORS from '../utils/calendar-constants.js'
  - Core calendar system for navigation and state management
- External dependencies: 
  - DOM APIs (document, window)
  - Touch Events API
  - No external libraries detected

## Reusable Functions/Components

### Gesture Detector Utility
```javascript
// Description: Gesture detection and recognition
// Found in: touch-gestures.js (gesture detection logic)
// Can be used for: Gesture recognition across all interaction types
// Dependencies: Touch Events API

class GestureDetector {
    constructor(options = {}) {
        this.minSwipeDistance = options.minSwipeDistance || 50;
        this.maxSwipeTime = options.maxSwipeTime || 300;
        this.doubleTapTime = options.doubleTapTime || 300;
    }
    
    detectSwipe(startX, startY, endX, endY, startTime, endTime) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const timeDiff = endTime - startTime;
        
        if (timeDiff < this.maxSwipeTime || Math.abs(diffX) > this.minSwipeDistance * 2) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.minSwipeDistance) {
                return diffX > 0 ? 'swipe-left' : 'swipe-right';
            }
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.minSwipeDistance) {
                return diffY > 0 ? 'swipe-up' : 'swipe-down';
            }
        }
        return null;
    }
    
    detectDoubleTap(lastTap, currentTime) {
        const tapLength = currentTime - lastTap;
        return tapLength < this.doubleTapTime && tapLength > 0;
    }
}
```

### Touch Feedback Component
```javascript
// Description: Touch feedback and visual effects
// Found in: touch-gestures.js (showSwipeFeedback, addTouchFeedback, createRipple)
// Can be used for: Touch feedback across all interactive elements
// Dependencies: DOM APIs

class TouchFeedback {
    static showSwipeFeedback(direction, options = {}) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback swipe-${direction}`;
        feedback.textContent = direction === 'next' ? '→' : '←';
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), options.duration || 500);
    }
    
    static addTouchFeedback(element, options = {}) {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.style.transform = '';
            }, options.duration || 100);
        });
    }
    
    static createRipple(event, element, options = {}) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.touches[0].clientX - rect.left - size / 2;
        const y = event.touches[0].clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), options.duration || 600);
    }
}
```

### Event Manager Utility
```javascript
// Description: Event listener management
// Found in: touch-gestures.js (event listener setup and cleanup)
// Can be used for: Event management across all interaction types
// Dependencies: DOM APIs

class EventManager {
    constructor() {
        this.listeners = new Map();
    }
    
    add(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.listeners.set(`${element.id}-${event}`, { element, event, handler });
    }
    
    remove(element, event) {
        const key = `${element.id}-${event}`;
        const listener = this.listeners.get(key);
        if (listener) {
            element.removeEventListener(event, listener.handler);
            this.listeners.delete(key);
        }
    }
    
    removeAll() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners.clear();
    }
}
```

## Common Patterns Identified

### Pattern: Touch Event Handling
Files using this: touch-gestures.js
Current implementation count: 4 times
Suggested abstraction: Create TouchEventHandler utility

### Pattern: Visual Feedback
Files using this: touch-gestures.js
Current implementation count: 3 times
Suggested abstraction: Extract to TouchFeedback component

### Pattern: Configuration Management
Files using this: touch-gestures.js
Current implementation count: 3 times
Suggested abstraction: Create InteractionConfig service

### Pattern: Event Listener Management
Files using this: touch-gestures.js
Current implementation count: 6 times
Suggested abstraction: Create EventManager utility

## Duplicate Code Found

### Functionality: Touch event handling logic
Locations: touch-gestures.js (handleTouchStart, handleTouchMove, handleTouchEnd)
Lines saved if consolidated: 40
Suggested solution: Extract to TouchEventHandler utility

### Functionality: Visual feedback creation
Locations: touch-gestures.js (showSwipeFeedback, addTouchFeedback, createRipple)
Lines saved if consolidated: 35
Suggested solution: Extract to TouchFeedback component

### Functionality: Event listener setup
Locations: touch-gestures.js (setupEventListeners, destroy)
Lines saved if consolidated: 20
Suggested solution: Create EventManager utility

## Utility Functions to Extract

```javascript
// Touch event handler utility
class TouchEventHandler {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.gestureDetector = new GestureDetector(options);
        this.eventManager = new EventManager();
    }
    
    setup() {
        this.eventManager.add(this.container, 'touchstart', this.handleTouchStart.bind(this));
        this.eventManager.add(this.container, 'touchmove', this.handleTouchMove.bind(this));
        this.eventManager.add(this.container, 'touchend', this.handleTouchEnd.bind(this));
    }
    
    handleTouchStart(e) {
        // Touch start logic
    }
    
    handleTouchMove(e) {
        // Touch move logic
    }
    
    handleTouchEnd(e) {
        // Touch end logic
    }
    
    destroy() {
        this.eventManager.removeAll();
    }
}

// Interaction configuration service
class InteractionConfig {
    constructor() {
        this.config = {
            touch: {
                minSwipeDistance: 50,
                maxSwipeTime: 300,
                doubleTapTime: 300
            },
            feedback: {
                swipeDuration: 500,
                touchDuration: 100,
                rippleDuration: 600
            }
        };
    }
    
    get(key) {
        return key.split('.').reduce((obj, k) => obj[k], this.config);
    }
    
    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const obj = keys.reduce((o, k) => o[k], this.config);
        obj[lastKey] = value;
    }
}

// Notification service
class NotificationService {
    static show(message, type = 'info', options = {}) {
        // Notification display logic
    }
    
    static hide(id) {
        // Notification hide logic
    }
}
```

## Performance Optimization Opportunities

### 1. Event Throttling
- **Issue**: Touch events processed without throttling
- **Impact**: Performance degradation during rapid touch interactions
- **Solution**: Implement throttling for touch events

### 2. Event Delegation
- **Issue**: Individual event listeners for each element
- **Impact**: Memory usage and performance degradation
- **Solution**: Use event delegation for similar interactions

### 3. Animation Optimization
- **Issue**: CSS animations and timeouts not optimized
- **Impact**: Performance overhead during animations
- **Solution**: Use CSS transforms and requestAnimationFrame

### 4. Memory Management
- **Issue**: Event listeners not properly cleaned up
- **Impact**: Memory leaks over time
- **Solution**: Implement proper cleanup and memory management

## Security Considerations

### 1. Touch Event Validation
- **Issue**: Touch events not validated for malicious input
- **Impact**: Potential touch event injection attacks
- **Solution**: Add comprehensive touch event validation

### 2. DOM Manipulation Security
- **Issue**: Direct DOM manipulation without sanitization
- **Impact**: Potential XSS vulnerabilities
- **Solution**: Sanitize DOM operations and use safe methods

### 3. Event Handler Security
- **Issue**: Event handlers without validation
- **Impact**: Potential event injection attacks
- **Solution**: Add event validation and sanitization

## Testing Strategy

### 1. Unit Tests
- Test gesture detection and recognition
- Test touch event handling
- Test visual feedback components
- Test configuration management

### 2. Integration Tests
- Test interaction system initialization
- Test cross-module interaction
- Test accessibility integration
- Test performance monitoring

### 3. Performance Tests
- Test touch event responsiveness
- Test animation performance
- Test memory usage optimization
- Test event handling efficiency

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create utility classes (GestureDetector, TouchFeedback, EventManager)
2. Extract common patterns to shared utilities
3. Add comprehensive error handling

### Phase 2: Modularization (Week 2)
1. Split touch-gestures.js into focused modules
2. Implement proper separation of concerns
3. Add comprehensive documentation

### Phase 3: Optimization (Week 3)
1. Implement event throttling and delegation
2. Optimize animations and performance
3. Add performance monitoring

### Phase 4: Accessibility (Week 4)
1. Add comprehensive accessibility support
2. Implement keyboard navigation
3. Add ARIA attributes and screen reader support

## Code Quality Metrics

### Current State
- **Cyclomatic Complexity**: Medium (3-5 per method)
- **Code Duplication**: High (25-30% duplication)
- **Test Coverage**: Unknown (no tests detected)
- **Documentation Coverage**: Medium (70-80% JSDoc coverage)

### Target State
- **Cyclomatic Complexity**: Low (1-3 per method)
- **Code Duplication**: Low (<5% duplication)
- **Test Coverage**: High (90%+ test coverage)
- **Documentation Coverage**: High (100% JSDoc coverage)

## Best Practices Implementation

### 1. Event Handling
- Use event delegation for similar interactions
- Implement proper event cleanup
- Add event throttling and debouncing
- Use passive event listeners where appropriate

### 2. Performance
- Optimize animations with CSS transforms
- Implement lazy loading for interaction components
- Use requestAnimationFrame for smooth animations
- Add performance monitoring and metrics

### 3. Accessibility
- Add comprehensive keyboard navigation
- Implement ARIA attributes and roles
- Add screen reader support
- Ensure focus management

### 4. Error Handling
- Add comprehensive error handling for all operations
- Implement fallback mechanisms
- Use meaningful error messages
- Add error recovery strategies

## Conclusion

The calendar interactions system provides a solid foundation for touch interactions but requires significant refactoring to meet enterprise standards. The main areas for improvement are:

1. **Modularization**: Split monolithic touch-gestures.js into focused modules
2. **Performance**: Add event throttling, delegation, and animation optimization
3. **Accessibility**: Add comprehensive accessibility support and keyboard navigation
4. **Error Handling**: Implement comprehensive error handling and validation
5. **Testing**: Add comprehensive test coverage

The recommended refactoring will transform this into a production-grade, enterprise-standard interactions system that is maintainable, performant, and accessible. The modular design will enable better testing, performance optimization, and maintenance of user interactions across the calendar system.

## Function Documentation

This section documents all functions across the interactions folder to help identify potential reimplementations and ensure code reuse.

### index.js Functions
- **No functions** - This file only contains exports and re-exports for interaction modules

### touch-gestures.js Functions

#### Constructor and Initialization Functions
- **constructor(core)** - Initializes TouchGestures with core reference, sets up touch state variables (touchStartX, touchStartY, touchStartTime, isSwiping, lastTap), and calls init
- **init()** - Main initialization method that finds container and sets up event listeners
- **findContainer()** - Finds the calendar container using SELECTORS.CALENDAR_CONTAINER and logs warning if not found

#### Event Listener Management Functions
- **setupEventListeners()** - Sets up touch event listeners (touchstart, touchmove, touchend) with passive option and double tap detection
- **destroy()** - Destroys touch gestures by removing event listeners from container

#### Touch Event Handling Functions
- **handleTouchStart(e)** - Handles touch start event by recording initial touch position and time, skips if already navigating
- **handleTouchMove(e)** - Handles touch move event by calculating touch differences and detecting horizontal swipe gestures
- **handleTouchEnd(e)** - Handles touch end event by calculating swipe distance and time, triggers navigation or view switching based on gesture
- **handleDoubleTap(e)** - Handles double tap detection by checking time between taps and triggering "go to today" navigation

#### Navigation Functions
- **navigate(direction)** - Delegates navigation to core calendar system
- **cycleView(direction)** - Cycles through available views (month, week) in specified direction and shows notification

#### Visual Feedback Functions
- **showSwipeFeedback(direction)** - Creates and displays swipe feedback animation with arrow icon positioned on left/right side of screen
- **addTouchFeedback(element)** - Adds touch feedback to element by scaling it down on touchstart and restoring on touchend
- **createRipple(event, element)** - Creates ripple effect on touch events by adding a span element with calculated position and removing it after 600ms

#### Utility Functions
- **showNotification(message, type)** - Shows notification using core dashboard or falls back to console logging
- **enable()** - Enables touch gestures by setting container touchAction to 'pan-y'
- **disable()** - Disables touch gestures by setting container touchAction to 'none'
- **updateSettings(settings)** - Updates touch configuration settings (minSwipeDistance, maxSwipeTime, doubleTapTime)
- **getTouchStats()** - Returns touch statistics including swipe state, touch positions, last tap time, and container status

## Potential Reimplementations Identified

### Touch Event Handling Functions
- **touch-gestures.js: handleTouchStart()** - Handles touch start events
- **touch-gestures.js: handleTouchMove()** - Handles touch move events
- **touch-gestures.js: handleTouchEnd()** - Handles touch end events
- **touch-gestures.js: handleDoubleTap()** - Handles double tap detection

**Recommendation**: Create TouchEventHandler utility class

### Visual Feedback Functions
- **touch-gestures.js: showSwipeFeedback()** - Shows swipe feedback animation
- **touch-gestures.js: addTouchFeedback()** - Adds touch feedback to elements
- **touch-gestures.js: createRipple()** - Creates ripple effect

**Recommendation**: Create TouchFeedback utility class

### Event Listener Management Functions
- **touch-gestures.js: setupEventListeners()** - Sets up event listeners
- **touch-gestures.js: destroy()** - Removes event listeners

**Recommendation**: Create EventManager utility class

### Navigation Functions
- **touch-gestures.js: navigate()** - Delegates navigation to core
- **touch-gestures.js: cycleView()** - Cycles through views

**Recommendation**: Create NavigationHandler utility class

### Configuration Management Functions
- **touch-gestures.js: updateSettings()** - Updates touch settings
- **touch-gestures.js: getTouchStats()** - Gets touch statistics

**Recommendation**: Create InteractionConfig utility class

## Functions with Similar Purposes

### Touch Event Processing Functions
- **touch-gestures.js: handleTouchStart()** - Processes touch start
- **touch-gestures.js: handleTouchMove()** - Processes touch move
- **touch-gestures.js: handleTouchEnd()** - Processes touch end

### Visual Feedback Functions
- **touch-gestures.js: showSwipeFeedback()** - Shows swipe feedback
- **touch-gestures.js: addTouchFeedback()** - Adds touch feedback
- **touch-gestures.js: createRipple()** - Creates ripple effect

### Navigation Functions
- **touch-gestures.js: navigate()** - Navigates calendar
- **touch-gestures.js: cycleView()** - Cycles through views

### State Management Functions
- **touch-gestures.js: enable()** - Enables touch gestures
- **touch-gestures.js: disable()** - Disables touch gestures

### Utility Functions
- **touch-gestures.js: showNotification()** - Shows notifications
- **touch-gestures.js: getTouchStats()** - Gets touch statistics

## Utility Functions to Extract

### TouchEventHandler Class
```javascript
class TouchEventHandler {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            minSwipeDistance: 50,
            maxSwipeTime: 300,
            doubleTapTime: 300,
            ...options
        };
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isSwiping = false;
        this.lastTap = 0;
        this.eventManager = new EventManager();
    }
    
    setup() {
        this.eventManager.add(this.container, 'touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.eventManager.add(this.container, 'touchmove', this.handleTouchMove.bind(this), { passive: true });
        this.eventManager.add(this.container, 'touchend', this.handleTouchEnd.bind(this), { passive: true });
        this.eventManager.add(this.container, 'touchend', this.handleDoubleTap.bind(this));
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.isSwiping = false;
    }
    
    handleTouchMove(e) {
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = this.touchStartX - touchCurrentX;
        const diffY = this.touchStartY - touchCurrentY;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            this.isSwiping = true;
        }
    }
    
    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;
        const timeDiff = touchEndTime - this.touchStartTime;
        
        const gesture = this.detectGesture(diffX, diffY, timeDiff);
        if (gesture) {
            this.onGesture(gesture);
        }
        
        this.resetTouchState();
    }
    
    handleDoubleTap(e) {
        const currentTime = Date.now();
        const tapLength = currentTime - this.lastTap;
        
        if (tapLength < this.options.doubleTapTime && tapLength > 0 && !this.isSwiping) {
            e.preventDefault();
            this.onDoubleTap();
        }
        
        this.lastTap = this.isSwiping ? 0 : currentTime;
    }
    
    detectGesture(diffX, diffY, timeDiff) {
        const { minSwipeDistance, maxSwipeTime } = this.options;
        
        if (timeDiff < maxSwipeTime || Math.abs(diffX) > minSwipeDistance * 2) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                return diffX > 0 ? 'swipe-left' : 'swipe-right';
            }
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
                return diffY > 0 ? 'swipe-up' : 'swipe-down';
            }
        }
        return null;
    }
    
    onGesture(gesture) {
        // Override in subclasses
    }
    
    onDoubleTap() {
        // Override in subclasses
    }
    
    resetTouchState() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isSwiping = false;
    }
    
    destroy() {
        this.eventManager.removeAll();
    }
}
```

### TouchFeedback Class
```javascript
class TouchFeedback {
    static showSwipeFeedback(direction, options = {}) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback swipe-${direction}`;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            ${direction === 'next' ? 'right: 20px' : 'left: 20px'};
            transform: translateY(-50%);
            font-size: 48px;
            color: var(--accent-primary);
            animation: swipeFeedback 0.5s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        feedback.textContent = direction === 'next' ? '→' : '←';
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), options.duration || 500);
    }
    
    static addTouchFeedback(element, options = {}) {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.style.transform = '';
            }, options.duration || 100);
        });
    }
    
    static createRipple(event, element, options = {}) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.touches[0].clientX - rect.left - size / 2;
        const y = event.touches[0].clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), options.duration || 600);
    }
}
```

### EventManager Class
```javascript
class EventManager {
    constructor() {
        this.listeners = new Map();
    }
    
    add(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        const key = `${element.id || 'anonymous'}-${event}`;
        this.listeners.set(key, { element, event, handler, options });
    }
    
    remove(element, event) {
        const key = `${element.id || 'anonymous'}-${event}`;
        const listener = this.listeners.get(key);
        if (listener) {
            element.removeEventListener(event, listener.handler, listener.options);
            this.listeners.delete(key);
        }
    }
    
    removeAll() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners.clear();
    }
    
    getListenerCount() {
        return this.listeners.size;
    }
}
```

### NavigationHandler Class
```javascript
class NavigationHandler {
    constructor(core) {
        this.core = core;
        this.views = Object.values(CALENDAR_CONFIG.VIEWS);
    }
    
    navigate(direction) {
        this.core.navigate(direction);
    }
    
    cycleView(direction) {
        const currentView = this.core.getCurrentView();
        const currentIndex = this.views.indexOf(currentView);
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % this.views.length;
        } else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = this.views.length - 1;
        }
        
        this.core.switchView(this.views[newIndex]);
        return this.views[newIndex];
    }
    
    goToToday() {
        this.core.navigate('today');
    }
}
```

### InteractionConfig Class
```javascript
class InteractionConfig {
    constructor() {
        this.config = {
            touch: {
                minSwipeDistance: 50,
                maxSwipeTime: 300,
                doubleTapTime: 300
            },
            feedback: {
                swipeDuration: 500,
                touchDuration: 100,
                rippleDuration: 600
            },
            accessibility: {
                enableKeyboard: true,
                enableScreenReader: true,
                enableHighContrast: false
            }
        };
    }
    
    get(key) {
        return key.split('.').reduce((obj, k) => obj[k], this.config);
    }
    
    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const obj = keys.reduce((o, k) => o[k], this.config);
        obj[lastKey] = value;
    }
    
    updateSettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
    
    getTouchStats() {
        return {
            config: this.config.touch,
            feedback: this.config.feedback,
            accessibility: this.config.accessibility
        };
    }
}
```

### NotificationService Class
```javascript
class NotificationService {
    static show(message, type = 'info', options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: var(--accent-primary);
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: notificationIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'notificationOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, options.duration || 3000);
    }
    
    static hide(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.remove();
        }
    }
}
```

## Enhanced TouchGestures Implementation

```javascript
export class TouchGestures {
    constructor(core) {
        this.core = core;
        this.container = null;
        this.touchHandler = null;
        this.navigationHandler = null;
        this.config = new InteractionConfig();
        
        this.init();
    }
    
    init() {
        this.findContainer();
        this.setupHandlers();
        this.setupEventListeners();
    }
    
    findContainer() {
        this.container = document.querySelector(SELECTORS.CALENDAR_CONTAINER);
        if (!this.container) {
            console.warn('Calendar container not found for touch gestures');
        }
    }
    
    setupHandlers() {
        this.navigationHandler = new NavigationHandler(this.core);
        this.touchHandler = new TouchEventHandler(this.container, this.config.get('touch'));
        
        this.touchHandler.onGesture = (gesture) => {
            this.handleGesture(gesture);
        };
        
        this.touchHandler.onDoubleTap = () => {
            this.handleDoubleTap();
        };
    }
    
    setupEventListeners() {
        if (this.touchHandler) {
            this.touchHandler.setup();
        }
    }
    
    handleGesture(gesture) {
        switch (gesture) {
            case 'swipe-left':
                this.navigationHandler.navigate('next');
                TouchFeedback.showSwipeFeedback('next', { duration: this.config.get('feedback.swipeDuration') });
                break;
            case 'swipe-right':
                this.navigationHandler.navigate('prev');
                TouchFeedback.showSwipeFeedback('prev', { duration: this.config.get('feedback.swipeDuration') });
                break;
            case 'swipe-up':
                const newView = this.navigationHandler.cycleView('next');
                NotificationService.show(`Switched to ${newView} view`, 'info');
                break;
            case 'swipe-down':
                const prevView = this.navigationHandler.cycleView('prev');
                NotificationService.show(`Switched to ${prevView} view`, 'info');
                break;
        }
    }
    
    handleDoubleTap() {
        this.navigationHandler.goToToday();
        NotificationService.show('Jumped to Today', 'success');
    }
    
    addTouchFeedback(element) {
        TouchFeedback.addTouchFeedback(element, { duration: this.config.get('feedback.touchDuration') });
    }
    
    createRipple(event, element) {
        TouchFeedback.createRipple(event, element, { duration: this.config.get('feedback.rippleDuration') });
    }
    
    enable() {
        if (this.container) {
            this.container.style.touchAction = 'pan-y';
        }
    }
    
    disable() {
        if (this.container) {
            this.container.style.touchAction = 'none';
        }
    }
    
    updateSettings(settings) {
        this.config.updateSettings(settings);
    }
    
    getTouchStats() {
        return {
            ...this.touchHandler.getTouchStats(),
            config: this.config.getTouchStats(),
            listenerCount: this.touchHandler.eventManager.getListenerCount()
        };
    }
    
    destroy() {
        if (this.touchHandler) {
            this.touchHandler.destroy();
        }
    }
}
```

This documentation helps identify opportunities for code consolidation and prevents duplicate implementations across the calendar interactions system. The modular approach enables better testing, performance optimization, and maintenance of user interactions.
