/**
 * Calendar Event Components Index
 * 
 * This module provides centralized access to all event rendering and display components
 * for the calendar system. These components handle event visualization, styling, interactions,
 * and provide sophisticated event management for all calendar views.
 * 
 * @module CalendarEventComponents
 */

// Core event rendering components
import { EventRenderer } from './EventRenderer.js';
import { EventPill } from './event-pill.js';
import { hashString } from '../../../utils/core/hash.js';
import { CacheFactory } from '../../../utils/core/cache/index.js';

export { EventRenderer, EventPill };

/**
 * Calendar Event Manager Factory
 * Creates and configures event management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured event management components
 */
export function createEventManager(core, options = {}) {
    const {
        rendererConfig = {},
        pillConfig = {},
        managerConfig = {}
    } = options;

    // Create event renderer with optimized settings
    const eventRenderer = new EventRenderer();

    // Create event manager with optimized settings
    const eventManager = new EventManager(core, {
        enablePooling: true,
        maxPoolSize: 200,
        enableCaching: true,
        ...managerConfig
    });

    return {
        eventRenderer,
        eventManager,
        
        // Convenience methods for common operations
        createEventPill: (event, options) => {
            return eventManager.createEventPill(event, {
                showTime: true,
                showLocation: false,
                compact: false,
                ...pillConfig,
                ...options
            });
        },
        
        createMonthEvent: (event, options) => {
            return eventRenderer.createEventPill(event, {
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
        
        // Event management
        updateEvent: (event, newData) => eventManager.updateEvent(event, newData),
        clearCache: () => eventManager.clearCache(),
        getEventStats: () => eventManager.getStats(),
        
        // Cleanup
        destroy: () => eventManager.destroy()
    };
}

/**
 * Event Manager Class
 * Manages event creation, caching, and lifecycle
 */
class EventManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enablePooling: true,
            maxPoolSize: 200,
            enableCaching: true,
            ...options
        };
        
        this.eventPills = new Map();
        this.eventCache = CacheFactory.createEventCache();
        this.eventPool = [];
        this.stats = {
            created: 0,
            cached: 0,
            reused: 0,
            destroyed: 0
        };
    }

    /**
     * Create an event pill with caching and pooling
     * @param {Object} event - Event data
     * @param {Object} options - Event pill options
     * @returns {EventPill} Event pill instance
     */
    createEventPill(event, options = {}) {
        // Check cache first
        if (this.options.enableCaching) {
            const cached = this.eventCache.getEvents(new Date(event.start), options);
            if (cached) {
                this.stats.reused++;
                return cached.pill;
            }
        }
        
        // Try to reuse from pool
        let pill;
        if (this.options.enablePooling && this.eventPool.length > 0) {
            pill = this.eventPool.pop();
            pill.update(event, options);
            this.stats.reused++;
        } else {
            pill = new EventPill(this.core, event, options);
            this.stats.created++;
        }
        
        // Cache the pill
        if (this.options.enableCaching) {
            this.eventCache.cacheEvents(new Date(event.start), options, { pill, options });
            this.stats.cached++;
        }
        
        // Store reference
        this.eventPills.set(event.id || event.title, pill);
        
        return pill;
    }

    /**
     * Update an existing event
     * @param {Object} event - Event data
     * @param {Object} newData - New event data
     */
    updateEvent(event, newData) {
        const pill = this.eventPills.get(event.id);
        if (pill) {
            pill.update(newData);
        }
    }

    /**
     * Get event pill by event ID
     * @param {string} eventId - Event ID
     * @returns {EventPill|null} Event pill instance or null
     */
    getEventPill(eventId) {
        return this.eventPills.get(eventId) || null;
    }

    /**
     * Remove event pill from management
     * @param {string} eventId - Event ID
     */
    removeEventPill(eventId) {
        const pill = this.eventPills.get(eventId);
        if (pill) {
            this.eventPills.delete(eventId);
            
            // Return to pool or destroy
            if (this.options.enablePooling && this.eventPool.length < this.options.maxPoolSize) {
                this.eventPool.push(pill);
            } else {
                pill.destroy();
                this.stats.destroyed++;
            }
        }
    }

    /**
     * Clear all event pills
     */
    clearEventPills() {
        this.eventPills.forEach(pill => {
            if (this.options.enablePooling && this.eventPool.length < this.options.maxPoolSize) {
                this.eventPool.push(pill);
            } else {
                pill.destroy();
                this.stats.destroyed++;
            }
        });
        this.eventPills.clear();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.eventCache.clear();
    }

    /**
     * Get statistics
     * @returns {Object} Event manager statistics
     */
    getStats() {
        const cacheStats = this.eventCache.getEventStats();
        return {
            ...this.stats,
            activePills: this.eventPills.size,
            cachedPills: cacheStats.size,
            pooledPills: this.eventPool.length,
            cacheHitRate: cacheStats.hitRate
        };
    }



    /**
     * Destroy the manager
     */
    destroy() {
        this.clearEventPills();
        this.eventCache.destroy();
        
        // Clear pool
        this.eventPool.forEach(pill => pill.destroy());
        this.eventPool = [];
    }
}

/**
 * Predefined event configurations for different use cases
 */
export const EventConfigs = {
    /**
     * Configuration for month view events
     */
    monthView: {
        showTime: true,
        showBullet: true,
        maxWidth: '100%',
        enableTouch: true,
        enableRipple: true,
        compact: false
    },
    
    /**
     * Configuration for week view events
     */
    weekView: {
        showLocation: true,
        showTime: true,
        enableDrag: true,
        enableTouch: true,
        enableRipple: true,
        compact: false
    },
    
    /**
     * Configuration for all-day events
     */
    allDay: {
        showTime: false,
        showLocation: false,
        enableTouch: true,
        enableRipple: true,
        compact: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        showTime: false,
        showLocation: false,
        enableTouch: true,
        enableRipple: true,
        compact: true,
        touchTargetSize: 44
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        showTime: true,
        showLocation: true,
        enableTouch: false,
        enableRipple: false,
        compact: false,
        enableDrag: true
    }
};

/**
 * Predefined event strategies for different scenarios
 */
export const EventStrategies = {
    /**
     * Strategy for high event density
     */
    highDensity: {
        compact: true,
        showTime: false,
        showLocation: false,
        enableOverflow: true,
        maxEventsPerCell: 3
    },
    
    /**
     * Strategy for sparse events
     */
    sparseEvents: {
        compact: false,
        showTime: true,
        showLocation: true,
        enableOverflow: false,
        maxEventsPerCell: 10
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        compact: false,
        showTime: true,
        showLocation: false,
        enableTouch: true,
        enableRipple: true,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        compact: true,
        showTime: false,
        showLocation: false,
        enableOverflow: true,
        maxEventsPerCell: 2
    }
};

/**
 * Utility functions for event management
 */
export const EventUtils = {
    /**
     * Calculate optimal event display for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal event configuration
     */
    calculateOptimalEventConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return {
                showTime: false,
                showLocation: false,
                compact: true,
                maxEventsPerCell: 2
            };
        } else if (screenWidth < 1024) {
            return {
                showTime: true,
                showLocation: false,
                compact: false,
                maxEventsPerCell: 3
            };
        } else if (screenWidth < 1440) {
            return {
                showTime: true,
                showLocation: true,
                compact: false,
                maxEventsPerCell: 4
            };
        } else {
            return {
                showTime: true,
                showLocation: true,
                compact: false,
                maxEventsPerCell: 5
            };
        }
    },
    
    /**
     * Generate event cache key
     * @param {Object} event - Event data
     * @param {Object} options - Event options
     * @returns {string} Cache key
     */
    generateEventKey: (event, options = {}) => {
        const eventStr = JSON.stringify(event);
        const optionsStr = JSON.stringify(options);
        return `event_${event.id || hashString(eventStr)}_${hashString(optionsStr)}`;
    },
    
    /**
     * Check if event needs update
     * @param {Object} cachedEvent - Cached event data
     * @param {Object} currentEvent - Current event data
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedEvent, currentEvent) => {
        if (!cachedEvent) return true;
        
        const age = Date.now() - cachedEvent.timestamp;
        const maxAge = 300000; // 5 minutes default
        
        return age > maxAge || 
               JSON.stringify(cachedEvent.event) !== JSON.stringify(currentEvent);
    },
    
    /**
     * Calculate responsive event configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive event configuration
     * @deprecated Use createEventConfig from utils/responsive/index.js instead
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        console.warn('EventUtils.calculateResponsiveConfig is deprecated. Use createEventConfig from utils/responsive/index.js instead.');
        
        // Import the new responsive system
        const { createEventConfig } = require('../../../utils/responsive/index.js');
        return createEventConfig(containerWidth, containerHeight);
    },
    
    /**
     * Group events by date for efficient rendering
     * @param {Array} events - Array of events
     * @returns {Map} Events grouped by date
     */
    groupEventsByDate: (events) => {
        const grouped = new Map();
        
        events.forEach(event => {
            const date = new Date(event.start);
            const dateKey = date.toDateString();
            
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey).push(event);
        });
        
        return grouped;
    },
    
    /**
     * Sort events by time for proper display order
     * @param {Array} events - Array of events
     * @returns {Array} Sorted events
     */
    sortEventsByTime: (events) => {
        return events.sort((a, b) => {
            const aStart = new Date(a.start);
            const bStart = new Date(b.start);
            
            // All-day events come first
            if (a.allDay && !b.allDay) return -1;
            if (!a.allDay && b.allDay) return 1;
            
            // Then sort by start time
            return aStart - bStart;
        });
    },
    
    /**
     * Calculate event duration in minutes
     * @param {Object} event - Event data
     * @returns {number} Duration in minutes
     */
    calculateEventDuration: (event) => {
        const start = new Date(event.start);
        const end = new Date(event.end || event.start);
        return (end - start) / (1000 * 60);
    },
    
    /**
     * Check if event overlaps with another event
     * @param {Object} event1 - First event
     * @param {Object} event2 - Second event
     * @returns {boolean} True if events overlap
     */
    eventsOverlap: (event1, event2) => {
        const start1 = new Date(event1.start);
        const end1 = new Date(event1.end || event1.start);
        const start2 = new Date(event2.start);
        const end2 = new Date(event2.end || event2.start);
        
        return start1 < end2 && start2 < end1;
    }
};

/**
 * Performance monitoring utilities for events
 */
export const EventPerformanceUtils = {
    /**
     * Measure event creation performance
     * @param {Function} eventCreationFunction - Event creation function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureEventCreation: (eventCreationFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = eventCreationFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            creationTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for event operations
     * @returns {Object} Performance monitor
     */
    createEventPerformanceMonitor: () => {
        const metrics = {
            totalCreations: 0,
            totalCreationTime: 0,
            averageCreationTime: 0,
            slowestCreation: 0,
            fastestCreation: Infinity,
            memoryUsage: []
        };
        
        return {
            measureCreation: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const creationTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalCreations++;
                metrics.totalCreationTime += creationTime;
                metrics.averageCreationTime = metrics.totalCreationTime / metrics.totalCreations;
                metrics.slowestCreation = Math.max(metrics.slowestCreation, creationTime);
                metrics.fastestCreation = Math.min(metrics.fastestCreation, creationTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    creationTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalCreations: 0,
                    totalCreationTime: 0,
                    averageCreationTime: 0,
                    slowestCreation: 0,
                    fastestCreation: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    EventRenderer,
    EventPill,
    createEventManager,
    EventConfigs,
    EventStrategies,
    EventUtils,
    EventPerformanceUtils
};
