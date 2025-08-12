/**
 * Cell Manager Factory
 * 
 * Specialized factory for creating cell management components.
 * Extends the base ManagerFactory with cell-specific functionality.
 * 
 * @module CellManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Cell Manager Factory Class
 * 
 * Creates and configures cell management components with optimized settings.
 * Provides standardized cell management patterns and pooling strategies.
 */
export class CellManagerFactory extends ManagerFactory {
    /**
     * Create a new cell manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('cell', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual cell manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Cell manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { cellConfig = {}, managerConfig = {} } = config;

        // Create cell manager with optimized settings
        const cellManager = this._createCellManager(core, managerConfig);

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
     * Get default configuration for cell manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            cellConfig: {
                maxEvents: 3,
                compactMode: false,
                enableTouch: true,
                enableRipple: true
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 100,
                enableCaching: true
            }
        };
    }

    /**
     * Create cell manager instance
     * @param {Object} core - Core instance
     * @param {Object} managerConfig - Manager configuration
     * @returns {Object} Cell manager instance
     * @private
     */
    _createCellManager(core, managerConfig) {
        const cells = new Map();
        const cellCache = new Map();
        const cellPool = [];
        const stats = {
            created: 0,
            cached: 0,
            reused: 0,
            destroyed: 0
        };

        return {
            createCell: (date, options = {}) => {
                const dateKey = date.toISOString().split('T')[0];
                
                // Check cache first
                if (managerConfig.enableCaching && cellCache.has(dateKey)) {
                    const cached = cellCache.get(dateKey);
                    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                        stats.cached++;
                        return { ...cached.cell, ...options };
                    }
                    cellCache.delete(dateKey);
                }

                // Check pool for reusable cell
                if (managerConfig.enablePooling && cellPool.length > 0) {
                    const pooledCell = cellPool.pop();
                    stats.reused++;
                    const updatedCell = { ...pooledCell, ...options, date };
                    cells.set(dateKey, updatedCell);
                    return updatedCell;
                }

                // Create new cell
                const newCell = {
                    id: `cell-${dateKey}`,
                    date,
                    events: [],
                    isOtherMonth: false,
                    isSelected: false,
                    maxEvents: 3,
                    compactMode: false,
                    enableTouch: true,
                    enableRipple: true,
                    ...options
                };

                stats.created++;
                cells.set(dateKey, newCell);

                // Cache the cell
                if (managerConfig.enableCaching) {
                    cellCache.set(dateKey, {
                        cell: newCell,
                        timestamp: Date.now()
                    });
                }

                return newCell;
            },

            updateCell: (date, newOptions) => {
                const dateKey = date.toISOString().split('T')[0];
                const existingCell = cells.get(dateKey);
                
                if (existingCell) {
                    const updatedCell = { ...existingCell, ...newOptions };
                    cells.set(dateKey, updatedCell);
                    
                    // Update cache
                    if (managerConfig.enableCaching && cellCache.has(dateKey)) {
                        cellCache.set(dateKey, {
                            cell: updatedCell,
                            timestamp: Date.now()
                        });
                    }
                    
                    return updatedCell;
                }
                
                return null;
            },

            clearCache: () => {
                cellCache.clear();
            },

            getStats: () => ({
                ...stats,
                totalCells: cells.size,
                poolSize: cellPool.length,
                cacheSize: cellCache.size
            }),

            destroy: () => {
                cells.clear();
                cellCache.clear();
                cellPool.length = 0;
            }
        };
    }

    /**
     * Create cell manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {CellManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new CellManagerFactory(options);
    }
}

// Export only the named export
