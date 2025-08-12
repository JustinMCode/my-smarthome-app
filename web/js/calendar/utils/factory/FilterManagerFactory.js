/**
 * Filter Manager Factory
 * 
 * Specialized factory for creating filter management components.
 * Extends the base ManagerFactory with filter-specific functionality.
 * 
 * @module FilterManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Filter Manager Factory Class
 * 
 * Creates and configures filter management components with optimized settings.
 * Provides standardized filter management patterns and caching strategies.
 */
export class FilterManagerFactory extends ManagerFactory {
    /**
     * Create a new filter manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('filter', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual filter manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Filter manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { filterConfig = {}, managerConfig = {} } = config;

        // Create filter manager with optimized settings
        const filterManager = this._createFilterManager(core, managerConfig);

        // Create calendar filter with optimized settings
        const calendarFilter = this._createCalendarFilter(filterConfig);

        return {
            calendarFilter,
            filterManager,
            
            // Convenience methods for common operations
            addFilter: (name, filterFunction) => filterManager.addFilter(name, filterFunction),
            removeFilter: (name) => filterManager.removeFilter(name),
            getFilter: (name) => filterManager.getFilter(name),
            getAllFilters: () => filterManager.getAllFilters(),
            
            // Filter operations
            applyFilters: (events) => filterManager.applyFilters(events),
            clearFilters: () => filterManager.clearFilters(),
            getFilterStats: () => filterManager.getStats(),
            
            // Cache management
            clearCache: () => filterManager.clearCache(),
            getCacheStats: () => filterManager.getCacheStats(),
            
            // Cleanup
            destroy: () => {
                filterManager.destroy();
                calendarFilter.destroy();
            }
        };
    }

    /**
     * Get default configuration for filter manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            filterConfig: {
                enableCaching: true,
                maxCacheSize: 100,
                enableAnimations: true,
                showEventCounts: true
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 50,
                enableCaching: true
            }
        };
    }

    /**
     * Create filter manager instance
     * @param {Object} core - Core instance
     * @param {Object} managerConfig - Manager configuration
     * @returns {Object} Filter manager instance
     * @private
     */
    _createFilterManager(core, managerConfig) {
        const filters = new Map();
        const filterCache = new Map();
        const stats = {
            created: 0,
            applied: 0,
            cached: 0,
            cleared: 0
        };

        return {
            addFilter: (name, filterFunction) => {
                if (typeof filterFunction !== 'function') {
                    throw new Error('Filter function must be a function');
                }
                
                filters.set(name, filterFunction);
                stats.created++;
                
                // Clear cache when filters change
                if (managerConfig.enableCaching) {
                    filterCache.clear();
                }
            },

            removeFilter: (name) => {
                const removed = filters.delete(name);
                if (removed && managerConfig.enableCaching) {
                    filterCache.clear();
                }
                return removed;
            },

            getFilter: (name) => {
                return filters.get(name);
            },

            getAllFilters: () => {
                return Array.from(filters.entries()).map(([name, fn]) => ({ name, function: fn }));
            },

            applyFilters: (events) => {
                if (!events || events.length === 0) {
                    return events;
                }

                // Check cache first
                if (managerConfig.enableCaching) {
                    const cacheKey = this._generateFilterCacheKey(events);
                    const cached = filterCache.get(cacheKey);
                    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
                        stats.cached++;
                        return cached.result;
                    }
                }

                // Apply all filters
                let filteredEvents = [...events];
                
                for (const [name, filterFunction] of filters) {
                    try {
                        filteredEvents = filterFunction(filteredEvents);
                        if (!Array.isArray(filteredEvents)) {
                            console.warn(`Filter ${name} did not return an array`);
                            filteredEvents = events; // Fallback to original
                        }
                    } catch (error) {
                        console.error(`Error applying filter ${name}:`, error);
                        filteredEvents = events; // Fallback to original
                    }
                }

                stats.applied++;

                // Cache result
                if (managerConfig.enableCaching) {
                    const cacheKey = this._generateFilterCacheKey(events);
                    filterCache.set(cacheKey, {
                        result: filteredEvents,
                        timestamp: Date.now()
                    });
                }

                return filteredEvents;
            },

            clearFilters: () => {
                const count = filters.size;
                filters.clear();
                if (managerConfig.enableCaching) {
                    filterCache.clear();
                }
                stats.cleared++;
                return count;
            },

            clearCache: () => {
                const cacheSize = filterCache.size;
                filterCache.clear();
                return cacheSize;
            },

            getCacheStats: () => ({
                size: filterCache.size,
                hits: stats.cached,
                misses: stats.applied
            }),

            getStats: () => ({
                ...stats,
                totalFilters: filters.size,
                cacheSize: filterCache.size
            }),

            destroy: () => {
                filters.clear();
                filterCache.clear();
            },

            _generateFilterCacheKey: (events) => {
                // Simple cache key based on event count and first few event IDs
                const eventIds = events.slice(0, 5).map(e => e.id || e.title).join(',');
                return `${events.length}-${eventIds}`;
            }
        };
    }

    /**
     * Create calendar filter instance
     * @param {Object} filterConfig - Filter configuration
     * @returns {Object} Calendar filter instance
     * @private
     */
    _createCalendarFilter(filterConfig) {
        return {
            config: { ...filterConfig },
            
            // Predefined filter functions
            byCategory: (category) => (events) => {
                return events.filter(event => event.category === category);
            },

            byDateRange: (startDate, endDate) => (events) => {
                return events.filter(event => {
                    const eventStart = new Date(event.start);
                    return eventStart >= startDate && eventStart <= endDate;
                });
            },

            byTimeRange: (startTime, endTime) => (events) => {
                return events.filter(event => {
                    const eventStart = new Date(event.start);
                    const eventTime = eventStart.getHours() * 60 + eventStart.getMinutes();
                    return eventTime >= startTime && eventTime <= endTime;
                });
            },

            byAllDay: (allDay) => (events) => {
                return events.filter(event => event.allDay === allDay);
            },

            byLocation: (location) => (events) => {
                return events.filter(event => 
                    event.location && event.location.toLowerCase().includes(location.toLowerCase())
                );
            },

            byTitle: (searchTerm) => (events) => {
                return events.filter(event => 
                    event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
            },

            // Utility methods
            getEventCounts: (events) => {
                if (!filterConfig.showEventCounts) return null;
                
                return events.reduce((counts, event) => {
                    const category = event.category || 'other';
                    counts[category] = (counts[category] || 0) + 1;
                    return counts;
                }, {});
            },

            destroy: () => {
                // Cleanup if needed
            }
        };
    }

    /**
     * Create filter manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {FilterManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new FilterManagerFactory(options);
    }
}

// Export only the named export
