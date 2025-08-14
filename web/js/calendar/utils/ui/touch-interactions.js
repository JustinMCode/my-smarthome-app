/**
 * Touch Interactions Utility
 * Centralized touch feedback and interaction utilities for calendar components
 * Consolidates duplicate implementations from across the codebase
 */

import { CALENDAR_CONFIG } from '../basic/calendar-constants.js';

/**
 * Default configuration for touch interactions
 */
const DEFAULT_CONFIG = {
    scale: 0.95,
    duration: 100,
    rippleDuration: 600,
    rippleClass: 'ripple',
    touchFeedbackClass: 'touch-feedback'
};

/**
 * Store active touch feedback elements for cleanup
 */
const activeTouchElements = new WeakMap();

/**
 * Add touch feedback to an element
 * Provides visual feedback on touch interactions
 * 
 * @param {HTMLElement} element - The element to add touch feedback to
 * @param {Object} options - Configuration options
 * @param {number} options.scale - Scale factor for touch feedback (default: 0.95)
 * @param {number} options.duration - Animation duration in ms (default: 100)
 * @param {string} options.className - CSS class to add during feedback (default: 'touch-feedback')
 * @returns {Function} Cleanup function to remove touch feedback
 */
export function addTouchFeedback(element, options = {}) {
    if (!element || !(element instanceof HTMLElement)) {
        console.warn('addTouchFeedback: Invalid element provided');
        return () => {};
    }

    const config = { ...DEFAULT_CONFIG, ...options };
    
    // Check if element already has touch feedback
    if (activeTouchElements.has(element)) {
        console.warn('addTouchFeedback: Element already has touch feedback');
        return activeTouchElements.get(element);
    }

    const touchStartHandler = () => {
        element.style.transform = `scale(${config.scale})`;
        element.style.transition = `transform ${config.duration}ms ease`;
        
        if (config.className) {
            element.classList.add(config.className);
        }
    };

    const touchEndHandler = () => {
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
            
            if (config.className) {
                element.classList.remove(config.className);
            }
        }, config.duration);
    };

    // Add event listeners
    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchend', touchEndHandler, { passive: true });
    element.addEventListener('touchcancel', touchEndHandler, { passive: true });

    // Create cleanup function
    const cleanup = () => {
        element.removeEventListener('touchstart', touchStartHandler);
        element.removeEventListener('touchend', touchEndHandler);
        element.removeEventListener('touchcancel', touchEndHandler);
        
        // Reset styles
        element.style.transform = '';
        element.style.transition = '';
        
        if (config.className) {
            element.classList.remove(config.className);
        }
        
        activeTouchElements.delete(element);
    };

    // Store cleanup function
    activeTouchElements.set(element, cleanup);

    return cleanup;
}

/**
 * Create a ripple effect on an element
 * Creates a material design-style ripple animation
 * 
 * @param {TouchEvent|MouseEvent} event - The touch/mouse event
 * @param {HTMLElement} element - The element to create ripple on
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Ripple animation duration in ms (default: 600)
 * @param {string} options.className - CSS class for ripple element (default: 'ripple')
 * @param {string} options.color - Ripple color (default: 'rgba(255, 255, 255, 0.3)')
 * @returns {HTMLElement} The created ripple element
 */
export function createRipple(event, element, options = {}) {
    if (!element || !(element instanceof HTMLElement)) {
        console.warn('createRipple: Invalid element provided');
        return null;
    }

    if (!event) {
        console.warn('createRipple: No event provided');
        return null;
    }

    const config = { ...DEFAULT_CONFIG, ...options };

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = config.rippleClass;
    
    // Get element dimensions and position
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    // Calculate ripple position
    let x, y;
    if (event.touches && event.touches[0]) {
        // Touch event
        x = event.touches[0].clientX - rect.left - size / 2;
        y = event.touches[0].clientY - rect.top - size / 2;
    } else if (event.clientX !== undefined) {
        // Mouse event
        x = event.clientX - rect.left - size / 2;
        y = event.clientY - rect.top - size / 2;
    } else {
        // Fallback to center
        x = rect.width / 2 - size / 2;
        y = rect.height / 2 - size / 2;
    }

    // Apply styles
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: ${config.color || 'rgba(255, 255, 255, 0.3)'};
        border-radius: 50%;
        transform: scale(0);
        animation: ripple ${config.rippleDuration}ms ease-out;
        pointer-events: none;
        z-index: 1;
    `;

    // Ensure element has proper positioning
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';

    // Add ripple to element
    element.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, config.rippleDuration);

    return ripple;
}

/**
 * Remove touch feedback from an element
 * Cleans up event listeners and styles
 * 
 * @param {HTMLElement} element - The element to remove touch feedback from
 */
export function removeTouchFeedback(element) {
    if (!element) return;

    const cleanup = activeTouchElements.get(element);
    if (cleanup) {
        cleanup();
    }
}

/**
 * Check if the current device supports touch
 * 
 * @returns {boolean} True if device supports touch
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
}

/**
 * Add both touch feedback and ripple to an element
 * Convenience function that combines both effects
 * 
 * @param {HTMLElement} element - The element to add effects to
 * @param {Object} options - Configuration options
 * @returns {Function} Cleanup function
 */
export function addTouchEffects(element, options = {}) {
    const touchCleanup = addTouchFeedback(element, options);
    
    const clickHandler = (event) => {
        createRipple(event, element, options);
    };

    element.addEventListener('click', clickHandler);
    element.addEventListener('touchstart', clickHandler, { passive: true });

    return () => {
        touchCleanup();
        element.removeEventListener('click', clickHandler);
        element.removeEventListener('touchstart', clickHandler);
    };
}

/**
 * Initialize touch interactions for the calendar
 * Sets up global touch configuration and CSS animations
 */
export function initTouchInteractions() {
    // Add CSS animations if not already present
    if (!document.getElementById('touch-interactions-styles')) {
        const style = document.createElement('style');
        style.id = 'touch-interactions-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .touch-feedback {
                transition: transform 0.1s ease;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Update global touch configuration
    if (CALENDAR_CONFIG.TOUCH) {
        CALENDAR_CONFIG.TOUCH.ENABLED = isTouchDevice();
    }
}

/**
 * Clean up all touch interactions
 * Removes all active touch feedback and cleans up global resources
 */
export function cleanupTouchInteractions() {
    // Clean up all active touch elements
    for (const [element, cleanup] of activeTouchElements) {
        cleanup();
    }
    
    // Remove global styles
    const style = document.getElementById('touch-interactions-styles');
    if (style) {
        style.remove();
    }
}

/**
 * Get touch interaction statistics
 * Useful for debugging and monitoring
 * 
 * @returns {Object} Statistics about active touch interactions
 */
export function getTouchStats() {
    return {
        activeElements: activeTouchElements.size,
        isTouchDevice: isTouchDevice(),
        hasGlobalStyles: !!document.getElementById('touch-interactions-styles')
    };
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
    initTouchInteractions();
}
