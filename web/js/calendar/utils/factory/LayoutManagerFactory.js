/**
 * Layout Manager Factory
 * 
 * Specialized factory for creating layout management components.
 * Extends the base ManagerFactory with layout-specific functionality.
 * 
 * @module LayoutManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Layout Manager Factory Class
 * 
 * Creates and configures layout management components with optimized settings.
 * Provides standardized layout management patterns and grid strategies.
 */
export class LayoutManagerFactory extends ManagerFactory {
    /**
     * Create a new layout manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('layout', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual layout manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Layout manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { layoutConfig = {}, managerConfig = {} } = config;

        // Create layout components with optimized settings
        const gridLayoutEngine = this._createGridLayoutEngine(layoutConfig);
        const overlapDetector = this._createOverlapDetector(layoutConfig);
        const responsiveLayout = this._createResponsiveLayout(layoutConfig);

        return {
            gridLayoutEngine,
            overlapDetector,
            responsiveLayout,
            
            // Convenience methods for common operations
            calculateLayout: (events, containerWidth, containerHeight) => {
                return responsiveLayout.calculateLayout(events, containerWidth, containerHeight);
            },
            
            detectOverlaps: (events) => {
                return overlapDetector.detectOverlaps(events);
            },
            
            arrangeInGrid: (events, columns) => {
                return gridLayoutEngine.arrangeInGrid(events, columns);
            },
            
            // Layout management
            updateLayout: (newConfig) => responsiveLayout.updateConfig(newConfig),
            clearCache: () => {
                gridLayoutEngine.clearCache();
                overlapDetector.clearCache();
                responsiveLayout.clearCache();
            },
            getLayoutStats: () => ({
                grid: gridLayoutEngine.getStats(),
                overlap: overlapDetector.getStats(),
                responsive: responsiveLayout.getStats()
            }),
            
            // Cleanup
            destroy: () => {
                gridLayoutEngine.destroy();
                overlapDetector.destroy();
                responsiveLayout.destroy();
            }
        };
    }

    /**
     * Get default configuration for layout manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            layoutConfig: {
                columns: 3,
                maxEventsPerDay: 5,
                compactMode: false,
                enableGrid: true
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 50,
                enableCaching: true
            }
        };
    }

    /**
     * Create grid layout engine instance
     * @param {Object} layoutConfig - Layout configuration
     * @returns {Object} Grid layout engine instance
     * @private
     */
    _createGridLayoutEngine(layoutConfig) {
        const layoutCache = new Map();
        const stats = {
            calculations: 0,
            cached: 0,
            gridArrangements: 0
        };

        return {
            arrangeInGrid: (events, columns = layoutConfig.columns) => {
                if (!events || events.length === 0) {
                    return [];
                }

                // Check cache
                const cacheKey = `grid-${events.length}-${columns}`;
                if (layoutCache.has(cacheKey)) {
                    const cached = layoutCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                        stats.cached++;
                        return cached.result;
                    }
                    layoutCache.delete(cacheKey);
                }

                // Calculate grid layout
                const rows = Math.ceil(events.length / columns);
                const grid = [];
                
                for (let row = 0; row < rows; row++) {
                    const rowEvents = [];
                    for (let col = 0; col < columns; col++) {
                        const index = row * columns + col;
                        if (index < events.length) {
                            rowEvents.push({
                                ...events[index],
                                gridPosition: { row, col },
                                gridIndex: index
                            });
                        }
                    }
                    grid.push(rowEvents);
                }

                stats.gridArrangements++;
                stats.calculations++;

                // Cache result
                layoutCache.set(cacheKey, {
                    result: grid,
                    timestamp: Date.now()
                });

                return grid;
            },

            calculateOptimalColumns: (containerWidth, containerHeight) => {
                const aspectRatio = containerWidth / containerHeight;
                
                if (aspectRatio > 2) {
                    return Math.min(6, Math.floor(containerWidth / 200));
                } else if (aspectRatio > 1.5) {
                    return Math.min(4, Math.floor(containerWidth / 250));
                } else {
                    return Math.min(3, Math.floor(containerWidth / 300));
                }
            },

            clearCache: () => {
                layoutCache.clear();
            },

            getStats: () => ({
                ...stats,
                cacheSize: layoutCache.size
            }),

            destroy: () => {
                layoutCache.clear();
            }
        };
    }

    /**
     * Create overlap detector instance
     * @param {Object} layoutConfig - Layout configuration
     * @returns {Object} Overlap detector instance
     * @private
     */
    _createOverlapDetector(layoutConfig) {
        const overlapCache = new Map();
        const stats = {
            detections: 0,
            overlaps: 0,
            cached: 0
        };

        return {
            detectOverlaps: (events) => {
                if (!events || events.length === 0) {
                    return [];
                }

                // Check cache
                const cacheKey = `overlap-${events.length}`;
                if (overlapCache.has(cacheKey)) {
                    const cached = overlapCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < 30000) { // 30 second cache
                        stats.cached++;
                        return cached.result;
                    }
                    overlapCache.delete(cacheKey);
                }

                const overlaps = [];
                
                for (let i = 0; i < events.length; i++) {
                    for (let j = i + 1; j < events.length; j++) {
                        const event1 = events[i];
                        const event2 = events[j];
                        
                        if (this._eventsOverlap(event1, event2)) {
                            overlaps.push({
                                event1: event1.id,
                                event2: event2.id,
                                overlapType: this._getOverlapType(event1, event2)
                            });
                        }
                    }
                }

                stats.detections++;
                stats.overlaps += overlaps.length;

                // Cache result
                overlapCache.set(cacheKey, {
                    result: overlaps,
                    timestamp: Date.now()
                });

                return overlaps;
            },

            _eventsOverlap: (event1, event2) => {
                const start1 = new Date(event1.start);
                const end1 = new Date(event1.end || event1.start);
                const start2 = new Date(event2.start);
                const end2 = new Date(event2.end || event2.start);

                return start1 < end2 && start2 < end1;
            },

            _getOverlapType: (event1, event2) => {
                const start1 = new Date(event1.start);
                const end1 = new Date(event1.end || event1.start);
                const start2 = new Date(event2.start);
                const end2 = new Date(event2.end || event2.start);

                if (start1.getTime() === start2.getTime() && end1.getTime() === end2.getTime()) {
                    return 'exact';
                } else if (start1 < start2 && end1 > end2) {
                    return 'contains';
                } else if (start2 < start1 && end2 > end1) {
                    return 'contained';
                } else {
                    return 'partial';
                }
            },

            clearCache: () => {
                overlapCache.clear();
            },

            getStats: () => ({
                ...stats,
                cacheSize: overlapCache.size
            }),

            destroy: () => {
                overlapCache.clear();
            }
        };
    }

    /**
     * Create responsive layout instance
     * @param {Object} layoutConfig - Layout configuration
     * @returns {Object} Responsive layout instance
     * @private
     */
    _createResponsiveLayout(layoutConfig) {
        const layoutCache = new Map();
        const config = { ...layoutConfig };
        const stats = {
            calculations: 0,
            cached: 0,
            responsive: 0
        };

        return {
            calculateLayout: (events, containerWidth, containerHeight) => {
                if (!events || events.length === 0) {
                    return { events: [], layout: 'empty' };
                }

                // Check cache
                const cacheKey = `responsive-${events.length}-${containerWidth}-${containerHeight}`;
                if (layoutCache.has(cacheKey)) {
                    const cached = layoutCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                        stats.cached++;
                        return cached.result;
                    }
                    layoutCache.delete(cacheKey);
                }

                // Determine layout based on container size
                let layoutType = 'grid';
                let columns = config.columns;
                let maxEvents = config.maxEventsPerDay;

                if (containerWidth < 600) {
                    layoutType = 'list';
                    columns = 1;
                    maxEvents = 3;
                } else if (containerWidth < 900) {
                    layoutType = 'grid';
                    columns = 2;
                    maxEvents = 4;
                } else if (containerWidth < 1200) {
                    layoutType = 'grid';
                    columns = 3;
                    maxEvents = 5;
                } else {
                    layoutType = 'grid';
                    columns = 4;
                    maxEvents = 7;
                }

                // Limit events if needed
                const limitedEvents = events.slice(0, maxEvents);

                const result = {
                    events: limitedEvents,
                    layout: layoutType,
                    columns,
                    maxEvents,
                    containerWidth,
                    containerHeight,
                    totalEvents: events.length,
                    limitedEvents: limitedEvents.length
                };

                stats.calculations++;
                stats.responsive++;

                // Cache result
                layoutCache.set(cacheKey, {
                    result,
                    timestamp: Date.now()
                });

                return result;
            },

            updateConfig: (newConfig) => {
                Object.assign(config, newConfig);
            },

            clearCache: () => {
                layoutCache.clear();
            },

            getStats: () => ({
                ...stats,
                cacheSize: layoutCache.size,
                config
            }),

            destroy: () => {
                layoutCache.clear();
            }
        };
    }

    /**
     * Create layout manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {LayoutManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new LayoutManagerFactory(options);
    }
}

// Export only the named export
