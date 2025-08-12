/**
 * Cell Components Index
 * 
 * This module provides centralized access to all cell-related components
 * for the calendar system. These components handle cell rendering, cell states,
 * and provide sophisticated cell management for all calendar views.
 * 
 * @module CellComponents
 */

// Core cell components
import { DayCell } from './day-cell.js';

// Export core components
export { DayCell };

/**
 * Cell Component Factory
 * Creates and configures cell components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured cell components
 */
export function createCellComponents(core, options = {}) {
    const {
        cellConfig = {},
        dayConfig = {},
        componentConfig = {}
    } = options;

    // Create day cell with optimized settings
    const dayCell = new DayCell({
        enableSelection: true,
        enableHighlight: true,
        enableDragDrop: true,
        maxEvents: 3,
        ...dayConfig
    });

    return {
        dayCell,
        
        // Convenience methods for common operations
        createDayCell: (date, options) => {
            return dayCell.create(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 3,
                ...cellConfig,
                ...options
            });
        },
        
        createMonthCell: (date, options) => {
            return dayCell.createMonthCell(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 3,
                compactMode: false,
                ...cellConfig,
                ...options
            });
        },
        
        createWeekCell: (date, options) => {
            return dayCell.createWeekCell(date, {
                isOtherMonth: false,
                isSelected: false,
                maxEvents: 2,
                compactMode: true,
                ...cellConfig,
                ...options
            });
        },
        
        // Component management
        updateConfig: (newConfig) => {
            dayCell.updateConfig(newConfig);
        },
        
        clearCache: () => {
            dayCell.clearCache();
        },
        
        getStats: () => ({
            dayCell: dayCell.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            dayCell.destroy();
        }
    };
}

/**
 * Predefined cell component configurations for different use cases
 */
export const CellConfigs = {
    /**
     * Configuration for month view cells
     */
    monthView: {
        maxEvents: 3,
        compactMode: false,
        enableSelection: true,
        enableHighlight: true,
        enableDragDrop: true,
        showWeekNumber: false
    },
    
    /**
     * Configuration for week view cells
     */
    weekView: {
        maxEvents: 2,
        compactMode: true,
        enableSelection: true,
        enableHighlight: true,
        enableDragDrop: true,
        showWeekNumber: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        maxEvents: 2,
        compactMode: true,
        enableSelection: true,
        enableHighlight: true,
        enableDragDrop: false,
        showWeekNumber: false,
        touchTargetSize: 44
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        maxEvents: 5,
        compactMode: false,
        enableSelection: true,
        enableHighlight: true,
        enableDragDrop: true,
        showWeekNumber: true
    }
};

/**
 * Cell component utilities
 */
export const CellUtils = {
    /**
     * Format date for cell display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatCellDate: (date) => {
        return date.getDate().toString();
    },
    
    /**
     * Calculate optimal cell configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal cell configuration
     */
    calculateOptimalCellConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return CellConfigs.mobile;
        } else if (screenWidth < 1024) {
            return {
                ...CellConfigs.monthView,
                maxEvents: 4
            };
        } else {
            return CellConfigs.desktop;
        }
    },
    
    /**
     * Calculate cell dimensions based on container
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Cell dimensions
     */
    calculateCellDimensions: (containerWidth, containerHeight) => {
        const aspectRatio = containerWidth / containerHeight;
        
        if (aspectRatio > 2) {
            return {
                width: Math.floor(containerWidth / 7),
                height: Math.floor(containerHeight / 5)
            };
        } else if (aspectRatio > 1.5) {
            return {
                width: Math.floor(containerWidth / 7),
                height: Math.floor(containerHeight / 6)
            };
        } else {
            return {
                width: Math.floor(containerWidth / 7),
                height: Math.floor(containerHeight / 6)
            };
        }
    },
    
    /**
     * Validate cell configuration
     * @param {Object} config - Cell configuration
     * @returns {Object} Validation result
     */
    validateCellConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxEvents && (config.maxEvents < 1 || config.maxEvents > 10)) {
            errors.push('maxEvents must be between 1 and 10');
        }
        
        if (config.touchTargetSize && config.touchTargetSize < 44) {
            warnings.push('Touch target size may be too small for mobile devices');
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
    DayCell,
    createCellComponents,
    CellConfigs,
    CellUtils
};