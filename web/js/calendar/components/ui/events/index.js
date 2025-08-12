/**
 * Event Components Index
 * 
 * This module provides centralized access to all event-related components
 * for the calendar system. These components handle event rendering, event pills,
 * and provide sophisticated event management for all calendar views.
 * 
 * @module EventComponents
 */

// Core event components
import { EventRenderer } from './EventRenderer.js';
import { EventPill } from './event-pill.js';

// Export core components
export { EventRenderer, EventPill };

/**
 * Event Component Factory
 * Creates and configures event components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured event components
 */
export function createEventComponents(core, options = {}) {
    const {
        rendererConfig = {},
        pillConfig = {},
        componentConfig = {}
    } = options;

    // Create event renderer with optimized settings
    const eventRenderer = new EventRenderer({
        enableCaching: true,
        maxCacheSize: 100,
        enableAnimations: true,
        ...rendererConfig
    });

    // Create event pill with optimized settings
    const eventPill = new EventPill({
        showTime: true,
        showLocation: false,
        compact: false,
        enableTouch: true,
        ...pillConfig
    });

    return {
        eventRenderer,
        eventPill,
        
        // Convenience methods for common operations
        createEventPill: (event, options) => {
            return eventPill.create(event, {
                showTime: true,
                showLocation: false,
                compact: false,
                ...pillConfig,
                ...options
            });
        },
        
        createMonthEvent: (event, options) => {
            return eventRenderer.createMonthEvent(event, {
                showTime: true,
                showBullet: true,
                maxWidth: '100%',
                ...rendererConfig,
                ...options
            });
        },
        
        createWeekEvent: (event, options) => {
            return eventRenderer.createWeekEvent(event, {
                showLocation: true,
                showTime: true,
                ...rendererConfig,
                ...options
            });
        },
        
        createAllDayEvent: (event, options) => {
            return eventRenderer.createAllDayEvent(event, {
                showTime: false,
                ...rendererConfig,
                ...options
            });
        },
        
        // Component management
        updateConfig: (newConfig) => {
            eventRenderer.updateConfig(newConfig);
            eventPill.updateConfig(newConfig);
        },
        
        clearCache: () => {
            eventRenderer.clearCache();
            eventPill.clearCache();
        },
        
        getStats: () => ({
            renderer: eventRenderer.getStats(),
            pill: eventPill.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            eventRenderer.destroy();
            eventPill.destroy();
        }
    };
}

/**
 * Predefined event component configurations for different use cases
 */
export const EventConfigs = {
    /**
     * Configuration for month view events
     */
    monthView: {
        showTime: true,
        showBullet: true,
        maxWidth: '100%',
        compact: true,
        enableTouch: true
    },
    
    /**
     * Configuration for week view events
     */
    weekView: {
        showTime: true,
        showLocation: true,
        maxWidth: '100%',
        compact: false,
        enableTouch: true
    },
    
    /**
     * Configuration for all-day events
     */
    allDay: {
        showTime: false,
        showLocation: true,
        maxWidth: '100%',
        compact: false,
        enableTouch: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        showTime: true,
        showLocation: false,
        maxWidth: '95vw',
        compact: true,
        enableTouch: true,
        touchTargetSize: 44
    }
};

/**
 * Event component utilities
 */
export const EventUtils = {
    /**
     * Format event time for display
     * @param {Date|string} start - Start time
     * @param {Date|string} end - End time
     * @returns {string} Formatted time string
     */
    formatEventTime: (start, end) => {
        if (!start) return '';
        
        const startTime = new Date(start).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (!end) return startTime;
        
        const endTime = new Date(end).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `${startTime} - ${endTime}`;
    },
    
    /**
     * Calculate optimal event configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal event configuration
     */
    calculateOptimalEventConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return EventConfigs.mobile;
        } else if (screenWidth < 1024) {
            return {
                ...EventConfigs.monthView,
                maxWidth: '80vw'
            };
        } else {
            return EventConfigs.monthView;
        }
    },
    
    /**
     * Validate event configuration
     * @param {Object} config - Event configuration
     * @returns {Object} Validation result
     */
    validateEventConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxWidth && typeof config.maxWidth !== 'string') {
            errors.push('maxWidth must be a string value');
        }
        
        if (config.touchTargetSize && config.touchTargetSize < 44) {
            warnings.push('Touch target size may be too small for mobile devices');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};

// Default export for convenience
export default {
    EventRenderer,
    EventPill,
    createEventComponents,
    EventConfigs,
    EventUtils
};