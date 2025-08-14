/**
 * Touch Gestures Interaction Layer
 * Handles touch and swipe interactions for the calendar
 */

import { CALENDAR_CONFIG, SELECTORS } from '../utils/basic/calendar-constants.js';
import { addTouchFeedback, createRipple } from '../utils/ui/touch-interactions.js';

export class TouchGestures {
    constructor(core) {
        this.core = core;
        this.container = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isSwiping = false;
        this.lastTap = 0;
        
        this.init();
    }
    
    /**
     * Initialize touch gestures
     */
    init() {
        this.findContainer();
        this.setupEventListeners();
        
        console.log('📅 Touch gestures initialized');
    }
    
    /**
     * Find the calendar container
     */
    findContainer() {
        this.container = document.querySelector(SELECTORS.CALENDAR_CONTAINER);
        
        if (!this.container) {
            console.warn('Calendar container not found for touch gestures');
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.container) return;
        
        // Touch start
        this.container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        // Touch move
        this.container.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: true });
        
        // Touch end
        this.container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
        
        // Double tap detection
        this.container.addEventListener('touchend', (e) => {
            this.handleDoubleTap(e);
        });
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        // Don't start swipe if already navigating
        if (this.core.state.get('isNavigating')) return;
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.isSwiping = false;
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY || this.core.state.get('isNavigating')) return;
        
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = this.touchStartX - touchCurrentX;
        const diffY = this.touchStartY - touchCurrentY;
        
        // Detect if this is a horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            this.isSwiping = true;
        }
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchStartY || this.core.state.get('isNavigating')) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;
        const timeDiff = touchEndTime - this.touchStartTime;
        
        // Minimum swipe distance and maximum time for swipe
        const minSwipeDistance = CALENDAR_CONFIG.TOUCH.MIN_SWIPE_DISTANCE;
        const maxSwipeTime = CALENDAR_CONFIG.TOUCH.MAX_SWIPE_TIME;
        
        // Only process if it was a quick swipe
        if (timeDiff < maxSwipeTime || Math.abs(diffX) > minSwipeDistance * 2) {
            // Horizontal swipe (for navigation)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Swipe left - next
                    this.navigate('next');
                    this.showSwipeFeedback('next');
                } else {
                    // Swipe right - previous
                    this.navigate('prev');
                    this.showSwipeFeedback('prev');
                }
            }
            
            // Vertical swipe (for view switching)
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    // Swipe up - switch view
                    this.cycleView('next');
                } else {
                    // Swipe down - switch view
                    this.cycleView('prev');
                }
            }
        }
        
        // Reset
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isSwiping = false;
    }
    
    /**
     * Handle double tap
     */
    handleDoubleTap(e) {
        const currentTime = Date.now();
        const tapLength = currentTime - this.lastTap;
        
        if (tapLength < CALENDAR_CONFIG.TOUCH.DOUBLE_TAP_TIME && tapLength > 0 && !this.isSwiping) {
            e.preventDefault();
            this.navigate('today');
            this.showNotification('Jumped to Today', 'success');
        }
        
        this.lastTap = this.isSwiping ? 0 : currentTime;
    }
    
    /**
     * Navigate calendar
     */
    navigate(direction) {
        this.core.navigate(direction);
    }
    
    /**
     * Cycle through views
     */
    cycleView(direction) {
        const views = Object.values(CALENDAR_CONFIG.VIEWS);
        const currentView = this.core.getCurrentView();
        const currentIndex = views.indexOf(currentView);
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % views.length;
        } else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = views.length - 1;
        }
        
        this.core.switchView(views[newIndex]);
        this.showNotification(`Switched to ${views[newIndex]} view`, 'info');
    }
    
    /**
     * Show swipe feedback animation
     */
    showSwipeFeedback(direction) {
        const feedback = document.createElement('div');
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
        setTimeout(() => feedback.remove(), 500);
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (this.core.dashboard && this.core.dashboard.showNotification) {
            this.core.dashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    

    

    
    /**
     * Enable touch gestures
     */
    enable() {
        if (this.container) {
            this.container.style.touchAction = 'pan-y';
        }
    }
    
    /**
     * Disable touch gestures
     */
    disable() {
        if (this.container) {
            this.container.style.touchAction = 'none';
        }
    }
    
    /**
     * Update touch settings
     */
    updateSettings(settings) {
        // Update touch configuration if needed
        if (settings.minSwipeDistance) {
            CALENDAR_CONFIG.TOUCH.MIN_SWIPE_DISTANCE = settings.minSwipeDistance;
        }
        
        if (settings.maxSwipeTime) {
            CALENDAR_CONFIG.TOUCH.MAX_SWIPE_TIME = settings.maxSwipeTime;
        }
        
        if (settings.doubleTapTime) {
            CALENDAR_CONFIG.TOUCH.DOUBLE_TAP_TIME = settings.doubleTapTime;
        }
    }
    
    /**
     * Get touch statistics
     */
    getTouchStats() {
        return {
            isSwiping: this.isSwiping,
            touchStartX: this.touchStartX,
            touchStartY: this.touchStartY,
            lastTap: this.lastTap,
            container: !!this.container
        };
    }
    
    /**
     * Destroy touch gestures
     */
    destroy() {
        if (this.container) {
            // Remove event listeners
            this.container.removeEventListener('touchstart', this.handleTouchStart);
            this.container.removeEventListener('touchmove', this.handleTouchMove);
            this.container.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        console.log('📅 Touch gestures destroyed');
    }
}
