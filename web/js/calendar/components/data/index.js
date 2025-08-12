/**
 * Calendar Data Components Index
 * 
 * This module provides centralized access to all data management components
 * for the calendar system. These components handle event data operations,
 * caching, filtering, and provide a unified interface for all calendar views.
 * 
 * @module CalendarDataComponents
 */

// Core data management components
import { EventCache } from './EventCache.js';
import { EventDataManager } from './EventDataManager.js';

export { EventCache, EventDataManager };

/**
 * Calendar Data Manager Factory
 * Creates and configures data management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured data management components
 */
export function createDataManager(core, options = {}) {
    const {
        cacheConfig = {},
        dataManagerConfig = {}
    } = options;

    // Create cache with optimized settings
    const eventCache = new EventCache({
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxCacheSize: 1000,        // Max 1000 entries
        enableCompression: true,   // Enable compression for memory efficiency
        ...cacheConfig
    });

    // Create data manager with cache integration
    const eventDataManager = new EventDataManager(core);
    
    // Configure data manager settings
    if (dataManagerConfig.cacheTimeout) {
        eventDataManager.setCacheTimeout(dataManagerConfig.cacheTimeout);
    }

    return {
        eventCache,
        eventDataManager,
        
        // Convenience methods for common operations
        getEventsForDate: (date, options) => {
            const cacheKey = eventCache.generateKey(date, options);
            let events = eventCache.get(cacheKey);
            
            if (!events) {
                events = eventDataManager.getEventsForDate(date, options);
                eventCache.set(cacheKey, events);
            }
            
            return events;
        },
        
        getEventsForWeek: (startOfWeek, options) => {
            const cacheKey = eventCache.generateKey(startOfWeek, { type: 'week', ...options });
            let events = eventCache.get(cacheKey);
            
            if (!events) {
                events = eventDataManager.getEventsForWeek(startOfWeek, options);
                eventCache.set(cacheKey, events);
            }
            
            return events;
        },
        
        getEventsForMonth: (year, month, options) => {
            const cacheKey = eventCache.generateKey(new Date(year, month, 1), { type: 'month', ...options });
            let events = eventCache.get(cacheKey);
            
            if (!events) {
                events = eventDataManager.getEventsForMonth(year, month, options);
                eventCache.set(cacheKey, events);
            }
            
            return events;
        },
        
        // Cache management
        clearCache: () => eventCache.clear(),
        getCacheStats: () => eventCache.getStats(),
        
        // Data manager operations
        findOverlappingEvents: (events) => eventDataManager.findOverlappingEvents(events),
        getEventStats: (events) => eventDataManager.getEventStats(events),
        categorizeEvent: (event) => eventDataManager.categorizeEvent(event),
        
        // Filter management
        addFilter: (name, filterFunction) => eventDataManager.addFilter(name, filterFunction),
        removeFilter: (name) => eventDataManager.removeFilter(name),
        
        // Cleanup
        destroy: () => {
            eventCache.destroy();
            eventDataManager.destroy();
        }
    };
}

/**
 * Predefined filter functions for common use cases
 */
export const Filters = {
    /**
     * Filter events by category
     * @param {string} category - Category to filter by
     * @returns {Function} Filter function
     */
    byCategory: (category) => (event) => {
        const eventCategory = event.category || 'other';
        return eventCategory === category;
    },
    
    /**
     * Filter events by calendar source
     * @param {string} calendarSource - Calendar source to filter by
     * @returns {Function} Filter function
     */
    byCalendar: (calendarSource) => (event) => {
        const eventSource = event.calendarSource || 'default';
        return eventSource === calendarSource;
    },
    
    /**
     * Filter all-day events only
     * @returns {Function} Filter function
     */
    allDayOnly: () => (event) => event.allDay === true,
    
    /**
     * Filter timed events only
     * @returns {Function} Filter function
     */
    timedOnly: () => (event) => event.allDay !== true,
    
    /**
     * Filter events by time range
     * @param {Date} startTime - Start time
     * @param {Date} endTime - End time
     * @returns {Function} Filter function
     */
    byTimeRange: (startTime, endTime) => (event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end || event.start);
        
        return eventStart >= startTime && eventEnd <= endTime;
    },
    
    /**
     * Filter events by search query
     * @param {string} query - Search query
     * @returns {Function} Filter function
     */
    bySearch: (query) => (event) => {
        const searchText = query.toLowerCase();
        const title = (event.title || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const location = (event.location || '').toLowerCase();
        
        return title.includes(searchText) || 
               description.includes(searchText) || 
               location.includes(searchText);
    }
};

/**
 * Predefined cache configurations for different use cases
 */
export const CacheConfigs = {
    /**
     * Configuration for high-performance month view
     */
    monthView: {
        defaultTTL: 10 * 60 * 1000, // 10 minutes
        maxCacheSize: 500,          // Smaller cache for month view
        enableCompression: true,    // Enable compression
        cleanupInterval: 300000     // Cleanup every 5 minutes
    },
    
    /**
     * Configuration for responsive week view
     */
    weekView: {
        defaultTTL: 5 * 60 * 1000,  // 5 minutes
        maxCacheSize: 200,          // Larger cache for week view
        enableCompression: false,   // Disable compression for faster access
        cleanupInterval: 60000      // Cleanup every minute
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        defaultTTL: 3 * 60 * 1000,  // 3 minutes
        maxCacheSize: 100,          // Smaller cache for memory constraints
        enableCompression: true,    // Enable compression
        cleanupInterval: 120000     // Cleanup every 2 minutes
    },
    
    /**
     * Configuration for desktop with high memory
     */
    desktop: {
        defaultTTL: 15 * 60 * 1000, // 15 minutes
        maxCacheSize: 2000,         // Large cache for desktop
        enableCompression: false,   // Disable compression
        cleanupInterval: 600000     // Cleanup every 10 minutes
    }
};

/**
 * Utility functions for data management
 */
export const Utils = {
    /**
     * Generate a unique cache key for date-based queries
     * @param {Date} date - Date for the query
     * @param {Object} options - Query options
     * @returns {string} Cache key
     */
    generateCacheKey: (date, options = {}) => {
        const dateStr = date.toISOString().split('T')[0];
        const optionsStr = JSON.stringify(options);
        return `events_${dateStr}_${Utils.hashString(optionsStr)}`;
    },
    
    /**
     * Simple string hash function
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    hashString: (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    },
    
    /**
     * Get affected dates for an event (for cache invalidation)
     * @param {Object} event - Event object
     * @returns {Array} Array of affected dates
     */
    getAffectedDates: (event) => {
        const dates = [];
        const start = new Date(event.start);
        const end = new Date(event.end || event.start);
        const current = new Date(start);
        
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    },
    
    /**
     * Check if two date ranges overlap
     * @param {Date} start1 - Start of first range
     * @param {Date} end1 - End of first range
     * @param {Date} start2 - Start of second range
     * @param {Date} end2 - End of second range
     * @returns {boolean} True if ranges overlap
     */
    dateRangesOverlap: (start1, end1, start2, end2) => {
        return start1 < end2 && start2 < end1;
    }
};

// Default export for convenience
export default {
    EventCache,
    EventDataManager,
    createDataManager,
    Filters,
    CacheConfigs,
    Utils
};
