/**
 * Calendar Layout Components Index
 * 
 * This module provides centralized access to all layout management components
 * for the calendar system. These components handle positioning, overlap detection,
 * responsive design, and provide sophisticated layout algorithms for all calendar views.
 * 
 * @module CalendarLayoutComponents
 */

// Core layout management components
import { GridLayoutEngine } from './GridLayoutEngine.js';
import { OverlapDetector } from './OverlapDetector.js';
import { ResponsiveLayout } from './ResponsiveLayout.js';

export { GridLayoutEngine, OverlapDetector, ResponsiveLayout };

/**
 * Calendar Layout Manager Factory
 * Creates and configures layout management components with optimal settings
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Configured layout management components
 */
export function createLayoutManager(options = {}) {
    const {
        gridConfig = {},
        overlapConfig = {},
        responsiveConfig = {}
    } = options;

    // Create grid layout engine with optimized settings
    const gridLayoutEngine = new GridLayoutEngine({
        slotHeight: 72,
        startHour: 6,
        endHour: 22,
        overlapThreshold: 0.1,
        ...gridConfig
    });

    // Create overlap detector with advanced settings
    const overlapDetector = new OverlapDetector({
        overlapThreshold: 0.1,
        timePrecision: 60000,
        ...overlapConfig
    });

    // Create responsive layout manager
    const responsiveLayout = new ResponsiveLayout({
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200,
            large: 1440
        },
        enableTouch: true,
        ...responsiveConfig
    });

    return {
        gridLayoutEngine,
        overlapDetector,
        responsiveLayout,
        
        // Convenience methods for common operations
        calculateEventLayout: (event, containerWidth, options) => {
            return gridLayoutEngine.calculateEventLayout(event, containerWidth, options);
        },
        
        handleOverlappingEvents: (events, containerWidth, options) => {
            const overlappingGroups = overlapDetector.groupOverlappingEvents(events);
            return gridLayoutEngine.layoutEventsWithOverlaps(events, containerWidth, options);
        },
        
        getResponsiveOptions: () => {
            return responsiveLayout.getLayoutOptions();
        },
        
        calculateMonthLayout: (currentDate, options) => {
            return gridLayoutEngine.calculateMonthGridLayout(currentDate, options);
        },
        
        calculateWeekLayout: (containerWidth, options) => {
            return responsiveLayout.calculateGridLayout(containerWidth, options);
        },
        
        optimizeEventPositions: (events, containerWidth, options) => {
            return overlapDetector.optimizeEventPositions(events, {
                containerWidth,
                maxColumns: 4,
                ...options
            });
        },
        
        // Layout management
        clearLayoutCache: () => gridLayoutEngine.clearLayoutCache(),
        getLayoutStats: () => gridLayoutEngine.getLayoutStats(),
        
        // Overlap management
        detectConflicts: (events) => overlapDetector.detectTimeConflicts(events),
        getOverlapMetrics: (events) => overlapDetector.calculateOverlapMetrics(events),
        
        // Responsive management
        getCurrentBreakpoint: () => responsiveLayout.getCurrentBreakpoint(),
        addBreakpointListener: (listener) => responsiveLayout.addBreakpointListener(listener),
        removeBreakpointListener: (listener) => responsiveLayout.removeBreakpointListener(listener),
        
        // Cleanup
        destroy: () => {
            gridLayoutEngine.destroy();
            responsiveLayout.destroy();
        }
    };
}

/**
 * Predefined layout configurations for different use cases
 */
export const LayoutConfigs = {
    /**
     * Configuration for high-performance month view
     */
    monthView: {
        gridConfig: {
            slotHeight: 60,
            startHour: 0,
            endHour: 24,
            overlapThreshold: 0.05
        },
        overlapConfig: {
            overlapThreshold: 0.05,
            timePrecision: 300000 // 5 minutes
        },
        responsiveConfig: {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200
            }
        }
    },
    
    /**
     * Configuration for responsive week view
     */
    weekView: {
        gridConfig: {
            slotHeight: 72,
            startHour: 6,
            endHour: 22,
            overlapThreshold: 0.1
        },
        overlapConfig: {
            overlapThreshold: 0.1,
            timePrecision: 60000 // 1 minute
        },
        responsiveConfig: {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200,
                large: 1440
            }
        }
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        gridConfig: {
            slotHeight: 60,
            startHour: 6,
            endHour: 22,
            overlapThreshold: 0.15
        },
        overlapConfig: {
            overlapThreshold: 0.15,
            timePrecision: 300000 // 5 minutes
        },
        responsiveConfig: {
            breakpoints: {
                mobile: 480,
                tablet: 768,
                desktop: 1024
            },
            enableTouch: true
        }
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        gridConfig: {
            slotHeight: 80,
            startHour: 5,
            endHour: 23,
            overlapThreshold: 0.05
        },
        overlapConfig: {
            overlapThreshold: 0.05,
            timePrecision: 60000 // 1 minute
        },
        responsiveConfig: {
            breakpoints: {
                mobile: 1024,
                tablet: 1200,
                desktop: 1440,
                large: 1920
            },
            enableTouch: false
        }
    }
};

/**
 * Predefined layout strategies for different scenarios
 */
export const LayoutStrategies = {
    /**
     * Strategy for handling many overlapping events
     */
    highOverlap: {
        maxColumns: 6,
        minEventWidth: 15,
        enableStacking: true,
        showOverflowIndicator: true
    },
    
    /**
     * Strategy for sparse event layouts
     */
    sparseEvents: {
        maxColumns: 1,
        minEventWidth: 80,
        enableStacking: false,
        showOverflowIndicator: false
    },
    
    /**
     * Strategy for touch-friendly layouts
     */
    touchFriendly: {
        maxColumns: 2,
        minEventWidth: 40,
        enableStacking: true,
        showOverflowIndicator: true,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact layouts
     */
    compact: {
        maxColumns: 4,
        minEventWidth: 20,
        enableStacking: true,
        showOverflowIndicator: true,
        compactMode: true
    }
};

/**
 * Utility functions for layout management
 */
export const LayoutUtils = {
    /**
     * Calculate optimal time range for display
     * @param {Array} events - Array of events
     * @returns {Object} Optimal start and end hours
     */
    calculateOptimalTimeRange: (events) => {
        if (!events || events.length === 0) {
            return { startHour: 6, endHour: 22 };
        }
        
        let earliestHour = 23;
        let latestHour = 0;
        
        events.forEach(event => {
            const start = new Date(event.start);
            const end = new Date(event.end || event.start);
            
            earliestHour = Math.min(earliestHour, start.getHours());
            latestHour = Math.max(latestHour, end.getHours());
        });
        
        return {
            startHour: Math.max(0, earliestHour - 1),
            endHour: Math.min(23, latestHour + 1)
        };
    },
    
    /**
     * Calculate optimal slot height based on container height
     * @param {number} containerHeight - Container height in pixels
     * @param {number} timeRange - Time range in hours
     * @returns {number} Optimal slot height
     */
    calculateOptimalSlotHeight: (containerHeight, timeRange) => {
        const minSlotHeight = 30;
        const maxSlotHeight = 120;
        const optimalHeight = containerHeight / timeRange;
        
        return Math.max(minSlotHeight, Math.min(maxSlotHeight, optimalHeight));
    },
    
    /**
     * Generate layout cache key
     * @param {string} viewType - Type of view (month, week, etc.)
     * @param {Date} date - Date for the layout
     * @param {Object} options - Layout options
     * @returns {string} Cache key
     */
    generateLayoutKey: (viewType, date, options = {}) => {
        const dateStr = date.toISOString().split('T')[0];
        const optionsStr = JSON.stringify(options);
        return `layout_${viewType}_${dateStr}_${LayoutUtils.hashString(optionsStr)}`;
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
     * Check if layout needs recalculation
     * @param {Object} cachedLayout - Cached layout data
     * @param {Object} currentOptions - Current layout options
     * @returns {boolean} True if recalculation is needed
     */
    needsRecalculation: (cachedLayout, currentOptions) => {
        if (!cachedLayout) return true;
        
        const age = Date.now() - cachedLayout.timestamp;
        const maxAge = currentOptions.cacheTimeout || 60000; // 1 minute default
        
        return age > maxAge || 
               cachedLayout.options !== JSON.stringify(currentOptions);
    },
    
    /**
     * Calculate responsive breakpoints based on container size
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive breakpoint configuration
     */
    calculateResponsiveBreakpoints: (containerWidth, containerHeight) => {
        const aspectRatio = containerWidth / containerHeight;
        
        if (containerWidth < 768) {
            return {
                breakpoint: 'mobile',
                columns: 1,
                maxEventsPerDay: 2,
                compactMode: true
            };
        } else if (containerWidth < 1024) {
            return {
                breakpoint: 'tablet',
                columns: 2,
                maxEventsPerDay: 3,
                compactMode: false
            };
        } else if (containerWidth < 1440) {
            return {
                breakpoint: 'desktop',
                columns: 3,
                maxEventsPerDay: 5,
                compactMode: false
            };
        } else {
            return {
                breakpoint: 'large',
                columns: 4,
                maxEventsPerDay: 7,
                compactMode: false
            };
        }
    }
};

/**
 * Performance monitoring utilities
 */
export const PerformanceUtils = {
    /**
     * Measure layout calculation performance
     * @param {Function} layoutFunction - Layout calculation function
     * @param {Array} args - Arguments for the layout function
     * @returns {Object} Performance metrics
     */
    measureLayoutPerformance: (layoutFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = layoutFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            executionTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for layout operations
     * @returns {Object} Performance monitor
     */
    createPerformanceMonitor: () => {
        const metrics = {
            totalOperations: 0,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
            slowestOperation: 0,
            fastestOperation: Infinity,
            memoryUsage: []
        };
        
        return {
            measure: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const executionTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalOperations++;
                metrics.totalExecutionTime += executionTime;
                metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalOperations;
                metrics.slowestOperation = Math.max(metrics.slowestOperation, executionTime);
                metrics.fastestOperation = Math.min(metrics.fastestOperation, executionTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    executionTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalOperations: 0,
                    totalExecutionTime: 0,
                    averageExecutionTime: 0,
                    slowestOperation: 0,
                    fastestOperation: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    GridLayoutEngine,
    OverlapDetector,
    ResponsiveLayout,
    createLayoutManager,
    LayoutConfigs,
    LayoutStrategies,
    LayoutUtils,
    PerformanceUtils
};
