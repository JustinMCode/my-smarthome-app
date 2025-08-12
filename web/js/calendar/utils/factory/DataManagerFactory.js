/**
 * Data Manager Factory
 * 
 * Specialized factory for creating data management components.
 * Extends the base ManagerFactory with data-specific functionality.
 * 
 * @module DataManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Data Manager Factory Class
 * 
 * Creates and configures data management components with optimized settings.
 * Provides standardized data management patterns and caching strategies.
 */
export class DataManagerFactory extends ManagerFactory {
    /**
     * Create a new data manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('data', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual data manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Data manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { cacheConfig = {}, dataManagerConfig = {} } = config;

        // Create cache with optimized settings
        const eventCache = this._createEventCache(cacheConfig);

        // Create data manager with cache integration
        const eventDataManager = this._createEventDataManager(core, dataManagerConfig);

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
     * Get default configuration for data manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            cacheConfig: {
                timeout: 5 * 60 * 1000, // 5 minutes
                maxSize: 1000,
                enableCompression: true
            },
            dataManagerConfig: {
                cacheTimeout: 5 * 60 * 1000,
                enableLazyLoading: true,
                maxConcurrentRequests: 3
            }
        };
    }

    /**
     * Create event cache instance
     * @param {Object} cacheConfig - Cache configuration
     * @returns {Object} Event cache instance
     * @private
     */
    _createEventCache(cacheConfig) {
        // Mock cache implementation - in real implementation, this would use CacheFactory
        const cache = new Map();
        
        return {
            getEvents: (date, options) => {
                const key = `${date.toISOString()}-${JSON.stringify(options)}`;
                const cached = cache.get(key);
                if (cached && Date.now() - cached.timestamp < cacheConfig.timeout) {
                    return cached.data;
                }
                return null;
            },
            
            cacheEvents: (date, options, events) => {
                const key = `${date.toISOString()}-${JSON.stringify(options)}`;
                cache.set(key, {
                    data: events,
                    timestamp: Date.now()
                });
            },
            
            clear: () => cache.clear(),
            
            getEventStats: () => ({
                size: cache.size,
                hits: 0,
                misses: 0
            }),
            
            destroy: () => cache.clear()
        };
    }

    /**
     * Create event data manager instance
     * @param {Object} core - Core instance
     * @param {Object} dataManagerConfig - Data manager configuration
     * @returns {Object} Event data manager instance
     * @private
     */
    _createEventDataManager(core, dataManagerConfig) {
        // Mock data manager implementation - in real implementation, this would use EventDataManager
        return {
            getEventsForDate: (date, options) => {
                return core.getEvents ? core.getEvents(date, options) : [];
            },
            
            getEventsForWeek: (startOfWeek, options) => {
                const events = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(date.getDate() + i);
                    events.push(...this.getEventsForDate(date, options));
                }
                return events;
            },
            
            getEventsForMonth: (year, month, options) => {
                const events = [];
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    events.push(...this.getEventsForDate(date, options));
                }
                return events;
            },
            
            findOverlappingEvents: (events) => {
                // Mock implementation
                return events.filter((event, index) => {
                    return events.some((otherEvent, otherIndex) => {
                        if (index === otherIndex) return false;
                        return event.start < otherEvent.end && event.end > otherEvent.start;
                    });
                });
            },
            
            getEventStats: (events) => ({
                total: events.length,
                categories: events.reduce((acc, event) => {
                    const category = event.category || 'other';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {})
            }),
            
            categorizeEvent: (event) => {
                return event.category || 'other';
            },
            
            addFilter: (name, filterFunction) => {
                this._filters = this._filters || new Map();
                this._filters.set(name, filterFunction);
            },
            
            removeFilter: (name) => {
                this._filters = this._filters || new Map();
                this._filters.delete(name);
            },
            
            destroy: () => {
                this._filters = new Map();
            }
        };
    }

    /**
     * Create data manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {DataManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new DataManagerFactory(options);
    }
}

// Export only the named export
