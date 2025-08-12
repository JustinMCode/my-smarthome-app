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
import { EventDataManager } from './EventDataManager.js';
import { CacheFactory, KeyGenerators } from '../../utils/core/cache/index.js';

export { EventDataManager };

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
    const eventCache = CacheFactory.createEventCache({
        timeout: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,          // Max 1000 entries
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
            let events = eventCache.getEvents(date, options);
            
            if (!events) {
                events = eventDataManager.getEventsForDate(date, options);
                eventCache.cacheEvents(date, options, events);
            }
            
            return events;
        },
        
        getEventsForWeek: (startOfWeek, options) => {
            const weekOptions = { type: 'week', ...options };
            let events = eventCache.getEvents(startOfWeek, weekOptions);
            
            if (!events) {
                events = eventDataManager.getEventsForWeek(startOfWeek, options);
                eventCache.cacheEvents(startOfWeek, weekOptions, events);
            }
            
            return events;
        },
        
        getEventsForMonth: (year, month, options) => {
            const monthDate = new Date(year, month, 1);
            const monthOptions = { type: 'month', ...options };
            let events = eventCache.getEvents(monthDate, monthOptions);
            
            if (!events) {
                events = eventDataManager.getEventsForMonth(year, month, options);
                eventCache.cacheEvents(monthDate, monthOptions, events);
            }
            
            return events;
        },
        
        // Cache management
        clearCache: () => eventCache.clear(),
        getCacheStats: () => eventCache.getEventStats(),
        
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
 * @deprecated Use CACHE_PRESETS from cache system instead
 */
export const CacheConfigs = {
    /**
     * Configuration for high-performance month view
     */
    monthView: {
        timeout: 10 * 60 * 1000, // 10 minutes
        maxSize: 500,            // Smaller cache for month view
        evictionPolicy: 'lru'
    },
    
    /**
     * Configuration for responsive week view
     */
    weekView: {
        timeout: 5 * 60 * 1000,  // 5 minutes
        maxSize: 200,            // Larger cache for week view
        evictionPolicy: 'lru'
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        timeout: 3 * 60 * 1000,  // 3 minutes
        maxSize: 100,            // Smaller cache for memory constraints
        evictionPolicy: 'lru'
    },
    
    /**
     * Configuration for desktop with high memory
     */
    desktop: {
        timeout: 15 * 60 * 1000, // 15 minutes
        maxSize: 2000,           // Large cache for desktop
        evictionPolicy: 'lru'
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
     * @deprecated Use KeyGenerators.event from cache system instead
     */
    generateCacheKey: (date, options = {}) => {
        return KeyGenerators.event(date, options);
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
    EventDataManager,
    createDataManager,
    Filters,
    CacheConfigs,
    Utils
};
