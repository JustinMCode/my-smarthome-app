/**
 * Calendar Cell Components Index
 * 
 * This module provides centralized access to all cell rendering components
 * for the calendar system. These components handle individual day cell creation,
 * event display, interactions, and provide sophisticated cell management for all calendar views.
 * 
 * @module CalendarCellComponents
 */

// Core cell rendering components
import { DayCell } from './day-cell.js';
import { hashString } from '../../../utils/core/hash.js';
import { CacheFactory } from '../../../utils/core/cache/index.js';

export { DayCell };

/**
 * Calendar Cell Manager Factory
 * Creates and configures cell management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured cell management components
 */
export function createCellManager(core, options = {}) {
    const {
        cellConfig = {},
        managerConfig = {}
    } = options;

    // Create cell manager with optimized settings
    const cellManager = new CellManager(core, {
        enablePooling: true,
        maxPoolSize: 100,
        enableCaching: true,
        ...managerConfig
    });

    return {
        cellManager,
        
        // Convenience methods for common operations
        createCell: (date, options) => {
            return cellManager.createCell(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 3,
                ...cellConfig,
                ...options
            });
        },
        
        createMonthCell: (date, options) => {
            return cellManager.createCell(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 3,
                compactMode: false,
                ...cellConfig,
                ...options
            });
        },
        
        createWeekCell: (date, options) => {
            return cellManager.createCell(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 2,
                compactMode: true,
                ...cellConfig,
                ...options
            });
        },
        
        // Cell management
        updateCell: (date, newOptions) => cellManager.updateCell(date, newOptions),
        clearCache: () => cellManager.clearCache(),
        getCellStats: () => cellManager.getStats(),
        
        // Cleanup
        destroy: () => cellManager.destroy()
    };
}

/**
 * Cell Manager Class
 * Manages cell creation, caching, and lifecycle
 */
class CellManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enablePooling: true,
            maxPoolSize: 100,
            enableCaching: true,
            ...options
        };
        
        this.cells = new Map();
        this.cellCache = CacheFactory.createCellCache();
        this.cellPool = [];
        this.stats = {
            created: 0,
            cached: 0,
            reused: 0,
            destroyed: 0
        };
    }

    /**
     * Create a cell with caching and pooling
     * @param {Date} date - Date for the cell
     * @param {Object} options - Cell options
     * @returns {DayCell} Cell instance
     */
    createCell(date, options = {}) {
        // Check cache first
        if (this.options.enableCaching) {
            const cached = this.cellCache.getCell(date, options);
            if (cached) {
                this.stats.reused++;
                return cached.cell;
            }
        }
        
        // Try to reuse from pool
        let cell;
        if (this.options.enablePooling && this.cellPool.length > 0) {
            cell = this.cellPool.pop();
            cell.update({ ...options, date });
            this.stats.reused++;
        } else {
            cell = new DayCell(this.core, date, options);
            this.stats.created++;
        }
        
        // Cache the cell
        if (this.options.enableCaching) {
            this.cellCache.cacheCell(date, options, { cell, options });
            this.stats.cached++;
        }
        
        // Store reference
        this.cells.set(date.toDateString(), cell);
        
        return cell;
    }

    /**
     * Update an existing cell
     * @param {Date} date - Date for the cell
     * @param {Object} newOptions - New options
     */
    updateCell(date, newOptions) {
        const cell = this.cells.get(date.toDateString());
        if (cell) {
            cell.update(newOptions);
        }
    }

    /**
     * Get cell by date
     * @param {Date} date - Date for the cell
     * @returns {DayCell|null} Cell instance or null
     */
    getCell(date) {
        return this.cells.get(date.toDateString()) || null;
    }

    /**
     * Remove cell from management
     * @param {Date} date - Date for the cell
     */
    removeCell(date) {
        const cell = this.cells.get(date.toDateString());
        if (cell) {
            this.cells.delete(date.toDateString());
            
            // Return to pool or destroy
            if (this.options.enablePooling && this.cellPool.length < this.options.maxPoolSize) {
                this.cellPool.push(cell);
            } else {
                cell.destroy();
                this.stats.destroyed++;
            }
        }
    }

    /**
     * Clear all cells
     */
    clearCells() {
        this.cells.forEach(cell => {
            if (this.options.enablePooling && this.cellPool.length < this.options.maxPoolSize) {
                this.cellPool.push(cell);
            } else {
                cell.destroy();
                this.stats.destroyed++;
            }
        });
        this.cells.clear();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cellCache.clear();
    }

    /**
     * Get statistics
     * @returns {Object} Cell manager statistics
     */
    getStats() {
        const cacheStats = this.cellCache.getCellStats();
        return {
            ...this.stats,
            activeCells: this.cells.size,
            cachedCells: cacheStats.size,
            pooledCells: this.cellPool.length,
            cacheHitRate: cacheStats.hitRate
        };
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.clearCells();
        this.cellCache.destroy();
        
        // Clear pool
        this.cellPool.forEach(cell => cell.destroy());
        this.cellPool = [];
    }
}

/**
 * Predefined cell configurations for different use cases
 */
export const CellConfigs = {
    /**
     * Configuration for month view cells
     */
    monthView: {
        isOtherMonth: false,
        isSelected: false,
        maxEvents: 3,
        compactMode: false,
        showEventTimes: false,
        enableTouch: true,
        enableRipple: true
    },
    
    /**
     * Configuration for week view cells
     */
    weekView: {
        isOtherMonth: false,
        isSelected: false,
        maxEvents: 2,
        compactMode: true,
        showEventTimes: true,
        enableTouch: true,
        enableRipple: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        isOtherMonth: false,
        isSelected: false,
        maxEvents: 2,
        compactMode: true,
        showEventTimes: false,
        enableTouch: true,
        enableRipple: true
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        isOtherMonth: false,
        isSelected: false,
        maxEvents: 5,
        compactMode: false,
        showEventTimes: true,
        enableTouch: false,
        enableRipple: false
    }
};

/**
 * Predefined cell strategies for different scenarios
 */
export const CellStrategies = {
    /**
     * Strategy for high event density
     */
    highDensity: {
        maxEvents: 2,
        compactMode: true,
        showOverflowIndicator: true,
        enableScrolling: true
    },
    
    /**
     * Strategy for sparse events
     */
    sparseEvents: {
        maxEvents: 5,
        compactMode: false,
        showOverflowIndicator: false,
        enableScrolling: false
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        maxEvents: 3,
        compactMode: false,
        enableTouch: true,
        enableRipple: true,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        maxEvents: 1,
        compactMode: true,
        showEventTimes: false,
        enableOverflowIndicator: true
    }
};

/**
 * Utility functions for cell management
 */
export const CellUtils = {
    /**
     * Calculate optimal max events for screen size
     * @param {number} screenWidth - Screen width
     * @returns {number} Optimal max events
     */
    calculateOptimalMaxEvents: (screenWidth) => {
        if (screenWidth < 768) return 2;      // Mobile
        if (screenWidth < 1024) return 3;     // Tablet
        if (screenWidth < 1440) return 4;     // Desktop
        return 5;                             // Large desktop
    },
    
    /**
     * Generate cell cache key
     * @param {Date} date - Date for the cell
     * @param {Object} options - Cell options
     * @returns {string} Cache key
     */
    generateCellKey: (date, options = {}) => {
        const dateStr = date.toDateString();
        const optionsStr = JSON.stringify(options);
        return `cell_${dateStr}_${hashString(optionsStr)}`;
    },
    
    /**
     * Check if cell needs update
     * @param {Object} cachedCell - Cached cell data
     * @param {Object} currentOptions - Current cell options
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedCell, currentOptions) => {
        if (!cachedCell) return true;
        
        const age = Date.now() - cachedCell.timestamp;
        const maxAge = currentOptions.cacheTimeout || 300000; // 5 minutes default
        
        return age > maxAge || 
               cachedCell.options !== JSON.stringify(currentOptions);
    },
    
    /**
     * Calculate responsive cell configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive cell configuration
     * @deprecated Use createCellConfig from utils/responsive/index.js instead
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        console.warn('CellUtils.calculateResponsiveConfig is deprecated. Use createCellConfig from utils/responsive/index.js instead.');
        
        // Import the new responsive system
        const { createCellConfig } = require('../../../utils/responsive/index.js');
        return createCellConfig(containerWidth, containerHeight);
    },
    
    /**
     * Group events by date for efficient cell updates
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
    }
};

/**
 * Performance monitoring utilities for cells
 */
export const CellPerformanceUtils = {
    /**
     * Measure cell creation performance
     * @param {Function} cellCreationFunction - Cell creation function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureCellCreation: (cellCreationFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = cellCreationFunction(...args);
        
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
     * Create performance monitor for cell operations
     * @returns {Object} Performance monitor
     */
    createCellPerformanceMonitor: () => {
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
    DayCell,
    createCellManager,
    CellConfigs,
    CellStrategies,
    CellUtils,
    CellPerformanceUtils
};
