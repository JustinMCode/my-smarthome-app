/**
 * Filter Components Index
 * 
 * This module provides centralized access to all filter-related components
 * for the calendar system. These components handle event filtering,
 * search functionality, and provide sophisticated filter management for all calendar views.
 * 
 * @module FilterComponents
 */

// Core filter components
import { CalendarFilter } from './calendar-filter.js';

// Export core components
export { CalendarFilter };

/**
 * Filter Component Factory
 * Creates and configures filter components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured filter components
 */
export function createFilterComponents(core, options = {}) {
    const {
        filterConfig = {},
        componentConfig = {}
    } = options;

    // Create filter components with optimized settings
    const calendarFilter = new CalendarFilter({
        enableCaching: true,
        maxCacheSize: 100,
        enableAnimations: true,
        showEventCounts: true,
        ...filterConfig
    });

    return {
        calendarFilter,
        
        // Convenience methods for common operations
        addFilter: (name, filterFunction) => calendarFilter.addFilter(name, filterFunction),
        removeFilter: (name) => calendarFilter.removeFilter(name),
        getFilter: (name) => calendarFilter.getFilter(name),
        getAllFilters: () => calendarFilter.getAllFilters(),
        
        // Filter operations
        applyFilters: (events) => calendarFilter.applyFilters(events),
        clearFilters: () => calendarFilter.clearFilters(),
        
        // Predefined filters
        byCategory: (category) => calendarFilter.byCategory(category),
        byDateRange: (startDate, endDate) => calendarFilter.byDateRange(startDate, endDate),
        byTimeRange: (startTime, endTime) => calendarFilter.byTimeRange(startTime, endTime),
        byAllDay: (allDay) => calendarFilter.byAllDay(allDay),
        byLocation: (location) => calendarFilter.byLocation(location),
        byTitle: (searchTerm) => calendarFilter.byTitle(searchTerm),
        
        // Component management
        updateConfig: (newConfig) => {
            calendarFilter.updateConfig(newConfig);
        },
        
        clearCache: () => calendarFilter.clearCache(),
        
        getStats: () => ({
            filter: calendarFilter.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            calendarFilter.destroy();
        }
    };
}

/**
 * Predefined filter component configurations for different use cases
 */
export const FilterConfigs = {
    /**
     * Configuration for default filters
     */
    defaults: {
        enableCaching: true,
        maxCacheSize: 100,
        enableAnimations: true,
        showEventCounts: true,
        cacheTimeout: 300000 // 5 minutes
    },
    
    /**
     * Configuration for high-performance mode
     */
    highPerformance: {
        enableCaching: true,
        maxCacheSize: 200,
        enableAnimations: false,
        showEventCounts: false,
        cacheTimeout: 600000 // 10 minutes
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        enableCaching: true,
        maxCacheSize: 50,
        enableAnimations: false,
        showEventCounts: true,
        cacheTimeout: 300000, // 5 minutes
        touchTargetSize: 44
    }
};

/**
 * Filter component utilities
 */
export const FilterUtils = {
    /**
     * Create date range filter
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Function} Filter function
     */
    createDateRangeFilter: (startDate, endDate) => {
        return (events) => {
            return events.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart >= startDate && eventStart <= endDate;
            });
        };
    },
    
    /**
     * Create category filter
     * @param {string} category - Category to filter by
     * @returns {Function} Filter function
     */
    createCategoryFilter: (category) => {
        return (events) => {
            return events.filter(event => event.category === category);
        };
    },
    
    /**
     * Create search filter
     * @param {string} searchTerm - Search term
     * @returns {Function} Filter function
     */
    createSearchFilter: (searchTerm) => {
        const term = searchTerm.toLowerCase();
        return (events) => {
            return events.filter(event => {
                const title = (event.title || '').toLowerCase();
                const description = (event.description || '').toLowerCase();
                const location = (event.location || '').toLowerCase();
                return title.includes(term) || 
                       description.includes(term) || 
                       location.includes(term);
            });
        };
    },
    
    /**
     * Calculate optimal filter configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal filter configuration
     */
    calculateOptimalFilterConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return FilterConfigs.mobile;
        } else if (screenWidth < 1024) {
            return {
                ...FilterConfigs.defaults,
                maxCacheSize: 150
            };
        } else {
            return FilterConfigs.defaults;
        }
    },
    
    /**
     * Validate filter configuration
     * @param {Object} config - Filter configuration
     * @returns {Object} Validation result
     */
    validateFilterConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxCacheSize && config.maxCacheSize > 500) {
            warnings.push('Large cache size may impact memory usage');
        }
        
        if (config.cacheTimeout && config.cacheTimeout > 3600000) { // 1 hour
            warnings.push('Long cache timeout may lead to stale data');
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
    CalendarFilter,
    createFilterComponents,
    FilterConfigs,
    FilterUtils
};