/**
 * Calendar Filter Components Index
 * 
 * This module provides centralized access to all filtering and visibility management components
 * for the calendar system. These components handle calendar filtering, event visibility control,
 * and provide sophisticated filter management for all calendar views.
 * 
 * @module CalendarFilterComponents
 */

// Core filter components
import { CalendarFilter } from './calendar-filter.js';
import { hashString } from '../../../utils/core/hash.js';
import { CacheFactory } from '../../../utils/core/cache/index.js';

export { CalendarFilter };

/**
 * Calendar Filter Manager Factory
 * Creates and configures filter management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured filter management components
 */
export function createFilterManager(core, options = {}) {
    const {
        filterConfig = {},
        managerConfig = {}
    } = options;

    // Create calendar filter with optimized settings
    const calendarFilter = new CalendarFilter(core);

    // Create filter manager with optimized settings
    const filterManager = new FilterManager(core, {
        enableCaching: true,
        enableResponsive: true,
        updateDebounce: 100,
        ...managerConfig
    });

    return {
        calendarFilter,
        filterManager,
        
        // Convenience methods for common operations
        init: () => {
            calendarFilter.init();
            filterManager.init();
        },
        
        getFilteredEvents: (events) => {
            return filterManager.getFilteredEvents(events);
        },
        
        isCalendarVisible: (calendarId) => {
            return calendarFilter.isCalendarVisible(calendarId);
        },
        
        getVisibleCalendars: () => {
            return calendarFilter.getVisibleCalendars();
        },
        
        toggleCalendar: (calendarId, isVisible) => {
            calendarFilter.toggleCalendar(calendarId, isVisible);
        },
        
        showAllCalendars: () => {
            calendarFilter.showAllCalendars();
        },
        
        hideAllCalendars: () => {
            calendarFilter.hideAllCalendars();
        },
        
        // Filter management
        updateEventCounts: () => calendarFilter.updateEventCounts(),
        refresh: () => calendarFilter.refresh(),
        clearCache: () => filterManager.clearCache(),
        getFilterStats: () => filterManager.getStats(),
        
        // Cleanup
        destroy: () => {
            calendarFilter.destroy();
            filterManager.destroy();
        }
    };
}

/**
 * Filter Manager Class
 * Manages filter operations, caching, and lifecycle
 */
class FilterManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enableCaching: true,
            enableResponsive: true,
            updateDebounce: 100,
            ...options
        };
        
        this.filterCache = CacheFactory.createCache('filters');
        this.activeFilters = new Map();
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalFilters: 0,
            averageFilterTime: 0
        };
        
        this.debounceTimer = null;
    }

    /**
     * Initialize the filter manager
     */
    init() {
        this.setupEventListeners();
        this.setupResponsiveHandling();
    }

    /**
     * Setup event listeners for filter changes
     */
    setupEventListeners() {
        // Listen for calendar filter changes
        this.core.state.on('calendarFilterChanged', () => {
            this.updateActiveFilters();
            this.clearCache();
            this.notifyViews();
        });
        
        // Listen for event changes
        this.core.state.on('eventsChanged', () => {
            this.debouncedUpdateEventCounts();
        });
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        if (!this.options.enableResponsive) return;
        
        window.addEventListener('resize', () => {
            this.debouncedUpdateFilterLayout();
        });
    }

    /**
     * Get filtered events with caching
     * @param {Array} events - Array of events to filter
     * @returns {Array} Filtered events
     */
    getFilteredEvents(events) {
        const startTime = performance.now();
        
        // Check cache first
        if (this.options.enableCaching) {
            const cached = this.filterCache.get(events, {
                keyOptions: { strategy: 'hash' }
            });
            if (cached) {
                this.stats.cacheHits++;
                return cached;
            }
        }
        
        this.stats.cacheMisses++;
        
        // Apply filters
        const filteredEvents = this.applyFilters(events);
        
        // Cache the result
        if (this.options.enableCaching) {
            this.filterCache.set(events, filteredEvents, {
                keyOptions: { strategy: 'hash' }
            });
        }
        
        // Update stats
        const filterTime = performance.now() - startTime;
        this.stats.totalFilters++;
        this.stats.averageFilterTime = 
            (this.stats.averageFilterTime * (this.stats.totalFilters - 1) + filterTime) / this.stats.totalFilters;
        
        return filteredEvents;
    }

    /**
     * Apply filters to events
     * @param {Array} events - Array of events
     * @returns {Array} Filtered events
     */
    applyFilters(events) {
        let filteredEvents = events;
        
        // Apply calendar filter
        const visibleCalendars = this.activeFilters.get('calendars');
        if (visibleCalendars && visibleCalendars.length > 0) {
            filteredEvents = filteredEvents.filter(event => {
                const calendarId = event.calendarSource || 'calendar-0';
                return visibleCalendars.includes(calendarId);
            });
        }
        
        // Apply additional filters here as needed
        // - Date range filters
        // - Category filters
        // - Search filters
        // - etc.
        
        return filteredEvents;
    }

    /**
     * Update active filters
     */
    updateActiveFilters() {
        // This would be called when calendar filter changes
        // The actual calendar filter state would be retrieved from the calendar filter component
        console.log('🔄 Updating active filters');
    }

    /**
     * Clear filter cache
     */
    clearCache() {
        this.filterCache.clear();
        console.log('🗑️ Filter cache cleared');
    }

    /**
     * Notify views of filter changes
     */
    notifyViews() {
        this.core.state.trigger('filtersChanged', {
            activeFilters: this.activeFilters,
            filterStats: this.getStats()
        });
    }

    /**
     * Cleanup cache by removing oldest entries
     */
    cleanupCache() {
        this.filterCache.clearExpired();
    }

    /**
     * Debounced update event counts
     */
    debouncedUpdateEventCounts() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.core.state.trigger('eventCountsUpdated');
        }, this.options.updateDebounce);
    }

    /**
     * Debounced update filter layout
     */
    debouncedUpdateFilterLayout() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.updateFilterLayout();
        }, this.options.updateDebounce);
    }

    /**
     * Update filter layout for responsive design
     */
    updateFilterLayout() {
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile: Compact layout
            this.core.state.trigger('filterLayoutChanged', { layout: 'compact' });
        } else if (width < 1024) {
            // Tablet: Standard layout
            this.core.state.trigger('filterLayoutChanged', { layout: 'standard' });
        } else {
            // Desktop: Full layout
            this.core.state.trigger('filterLayoutChanged', { layout: 'full' });
        }
    }

    /**
     * Get statistics
     * @returns {Object} Filter manager statistics
     */
    getStats() {
        const cacheStats = this.filterCache.getStats();
        return {
            ...this.stats,
            cacheSize: cacheStats.size,
            cacheHitRate: cacheStats.hitRate + '%'
        };
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.filterCache.destroy();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}

/**
 * Predefined filter configurations for different use cases
 */
export const FilterConfigs = {
    /**
     * Configuration for month view filters
     */
    monthView: {
        enableCaching: true,
        cacheTimeout: 300000,
        enableAnimations: true,
        enableKeyboardNav: true,
        showEventCounts: true,
        compactMode: false,
        autoSave: true,
        defaultVisible: true
    },
    
    /**
     * Configuration for week view filters
     */
    weekView: {
        enableCaching: true,
        cacheTimeout: 300000,
        enableAnimations: true,
        enableKeyboardNav: true,
        showEventCounts: true,
        compactMode: false,
        autoSave: true,
        defaultVisible: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        enableCaching: true,
        cacheTimeout: 300000,
        enableAnimations: false,
        enableKeyboardNav: false,
        showEventCounts: false,
        compactMode: true,
        autoSave: true,
        defaultVisible: true
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        enableCaching: true,
        cacheTimeout: 300000,
        enableAnimations: true,
        enableKeyboardNav: true,
        showEventCounts: true,
        compactMode: false,
        autoSave: true,
        defaultVisible: true
    }
};

/**
 * Predefined filter strategies for different scenarios
 */
export const FilterStrategies = {
    /**
     * Strategy for high event density
     */
    highDensity: {
        enableCaching: true,
        maxCacheSize: 200,
        enableBulkOperations: true,
        showEventCounts: true,
        enableQuickFilters: true
    },
    
    /**
     * Strategy for sparse events
     */
    sparseEvents: {
        enableCaching: false,
        maxCacheSize: 50,
        enableBulkOperations: false,
        showEventCounts: false,
        enableQuickFilters: false
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        enableCaching: true,
        maxCacheSize: 100,
        enableBulkOperations: true,
        showEventCounts: true,
        enableQuickFilters: true,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        enableCaching: true,
        maxCacheSize: 50,
        enableBulkOperations: false,
        showEventCounts: false,
        enableQuickFilters: false,
        compactMode: true
    }
};

/**
 * Utility functions for filter management
 */
export const FilterUtils = {
    /**
     * Calculate optimal filter configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal filter configuration
     */
    calculateOptimalFilterConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return {
                enableCaching: true,
                maxCacheSize: 50,
                enableAnimations: false,
                showEventCounts: false,
                compactMode: true
            };
        } else if (screenWidth < 1024) {
            return {
                enableCaching: true,
                maxCacheSize: 100,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        } else if (screenWidth < 1440) {
            return {
                enableCaching: true,
                maxCacheSize: 150,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        } else {
            return {
                enableCaching: true,
                maxCacheSize: 200,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        }
    },
    
    /**
     * Generate filter cache key
     * @param {Array} events - Array of events
     * @param {Object} filterConfig - Filter configuration
     * @returns {string} Cache key
     */
    generateFilterKey: (events, filterConfig = {}) => {
        const eventIds = events.map(e => e.id || e.title).sort().join(',');
        const configHash = hashString(JSON.stringify(filterConfig));
        return `filter_${eventIds}_${configHash}`;
    },
    
    /**
     * Check if filter needs update
     * @param {Object} cachedFilter - Cached filter data
     * @param {Object} currentConfig - Current filter configuration
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedFilter, currentConfig) => {
        if (!cachedFilter) return true;
        
        const age = Date.now() - cachedFilter.timestamp;
        const maxAge = currentConfig.cacheTimeout || 300000; // 5 minutes default
        
        return age > maxAge || 
               JSON.stringify(cachedFilter.config) !== JSON.stringify(currentConfig);
    },
    
    /**
     * Calculate responsive filter configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive filter configuration
     * @deprecated Use createFilterConfig from utils/responsive/index.js instead
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        console.warn('FilterUtils.calculateResponsiveConfig is deprecated. Use createFilterConfig from utils/responsive/index.js instead.');
        
        // Import the new responsive system
        const { createFilterConfig } = require('../../../utils/responsive/index.js');
        return createFilterConfig(containerWidth, containerHeight);
    },
    
    /**
     * Group events by calendar for efficient filtering
     * @param {Array} events - Array of events
     * @returns {Map} Events grouped by calendar
     */
    groupEventsByCalendar: (events) => {
        const grouped = new Map();
        
        events.forEach(event => {
            const calendarId = event.calendarSource || 'calendar-0';
            
            if (!grouped.has(calendarId)) {
                grouped.set(calendarId, []);
            }
            grouped.get(calendarId).push(event);
        });
        
        return grouped;
    },
    
    /**
     * Count events per calendar
     * @param {Array} events - Array of events
     * @returns {Object} Event counts per calendar
     */
    countEventsByCalendar: (events) => {
        const counts = {};
        
        events.forEach(event => {
            const calendarId = event.calendarSource || 'calendar-0';
            counts[calendarId] = (counts[calendarId] || 0) + 1;
        });
        
        return counts;
    },
    
    /**
     * Validate filter configuration
     * @param {Object} config - Filter configuration
     * @returns {Object} Validation result
     */
    validateFilterConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxCacheSize && config.maxCacheSize > 1000) {
            warnings.push('Large cache size may impact memory usage');
        }
        
        if (config.cacheTimeout && config.cacheTimeout > 3600000) {
            warnings.push('Long cache timeout may show stale data');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};

/**
 * Performance monitoring utilities for filters
 */
export const FilterPerformanceUtils = {
    /**
     * Measure filter performance
     * @param {Function} filterFunction - Filter function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureFilterPerformance: (filterFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = filterFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            filterTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for filter operations
     * @returns {Object} Performance monitor
     */
    createFilterPerformanceMonitor: () => {
        const metrics = {
            totalFilters: 0,
            totalFilterTime: 0,
            averageFilterTime: 0,
            slowestFilter: 0,
            fastestFilter: Infinity,
            memoryUsage: []
        };
        
        return {
            measureFilter: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const filterTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalFilters++;
                metrics.totalFilterTime += filterTime;
                metrics.averageFilterTime = metrics.totalFilterTime / metrics.totalFilters;
                metrics.slowestFilter = Math.max(metrics.slowestFilter, filterTime);
                metrics.fastestFilter = Math.min(metrics.fastestFilter, filterTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    filterTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalFilters: 0,
                    totalFilterTime: 0,
                    averageFilterTime: 0,
                    slowestFilter: 0,
                    fastestFilter: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    CalendarFilter,
    createFilterManager,
    FilterConfigs,
    FilterStrategies,
    FilterUtils,
    FilterPerformanceUtils
};
