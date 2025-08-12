/**
 * Unified Factory Registry
 * 
 * Provides centralized, type-safe manager creation with standardized patterns.
 * This registry serves as the single source of truth for all factory operations
 * and ensures consistent behavior across the application.
 * 
 * @module FactoryRegistry
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from './ManagerFactory.js';
import { DataManagerFactory } from '../../calendar/utils/factory/DataManagerFactory.js';
import { CellManagerFactory } from '../../calendar/utils/factory/CellManagerFactory.js';
import { EventManagerFactory } from '../../calendar/utils/factory/EventManagerFactory.js';
import { FilterManagerFactory } from '../../calendar/utils/factory/FilterManagerFactory.js';
import { LayoutManagerFactory } from '../../calendar/utils/factory/LayoutManagerFactory.js';
import { NavigationManagerFactory } from '../../calendar/utils/factory/NavigationManagerFactory.js';
import { SettingsManagerFactory } from '../../calendar/utils/factory/SettingsManagerFactory.js';

/**
 * Registry of all available factory types
 */
export const FactoryTypes = {
    DATA: 'data',
    CELL: 'cell',
    EVENT: 'event',
    FILTER: 'filter',
    LAYOUT: 'layout',
    NAVIGATION: 'navigation',
    SETTINGS: 'settings'
};

/**
 * Unified Factory Registry Class
 * 
 * Centralizes all factory creation logic and provides consistent API surface.
 * Implements factory pattern with type safety and standardized configuration.
 */
export class FactoryRegistry {
    /**
     * Factory class mapping
     * @private
     */
    static _factoryMap = {
        [FactoryTypes.DATA]: DataManagerFactory,
        [FactoryTypes.CELL]: CellManagerFactory,
        [FactoryTypes.EVENT]: EventManagerFactory,
        [FactoryTypes.FILTER]: FilterManagerFactory,
        [FactoryTypes.LAYOUT]: LayoutManagerFactory,
        [FactoryTypes.NAVIGATION]: NavigationManagerFactory,
        [FactoryTypes.SETTINGS]: SettingsManagerFactory
    };

    /**
     * Registry statistics
     * @private
     */
    static _stats = {
        created: 0,
        errors: 0,
        byType: {},
        performance: {
            totalTime: 0,
            averageTime: 0
        }
    };

    /**
     * Create a manager of the specified type
     * 
     * @param {string} type - Manager type (use FactoryTypes constants)
     * @param {Object} core - Calendar core instance
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>} Created manager instance
     * @throws {Error} If manager type is not supported
     */
    static async createManager(type, core, options = {}) {
        const startTime = performance.now();
        
        try {
            // Validate manager type
            if (!type || typeof type !== 'string') {
                throw new Error('Manager type must be a non-empty string');
            }

            const FactoryClass = this._factoryMap[type];
            if (!FactoryClass) {
                const supportedTypes = Object.values(FactoryTypes).join(', ');
                throw new Error(`Unsupported manager type: "${type}". Supported types: ${supportedTypes}`);
            }

            // Create factory instance
            const factory = FactoryClass.create();
            
            // Create manager
            const manager = await factory.createManager(core, options);
            
            // Update statistics
            const creationTime = performance.now() - startTime;
            this._updateStats(type, creationTime, true);
            
            return manager;
            
        } catch (error) {
            const creationTime = performance.now() - startTime;
            this._updateStats(type, creationTime, false);
            throw error;
        }
    }

    /**
     * Create multiple managers in parallel
     * 
     * @param {Object} specs - Object with manager specifications
     * @param {Object} core - Calendar core instance
     * @returns {Promise<Object>} Object containing all created managers
     * 
     * @example
     * const managers = await FactoryRegistry.createManagers({
     *   data: { enableCaching: true },
     *   event: { rendererConfig: { showTime: true } },
     *   layout: { columns: 3 }
     * }, core);
     */
    static async createManagers(specs, core) {
        if (!specs || typeof specs !== 'object') {
            throw new Error('Manager specifications must be an object');
        }

        const managerPromises = Object.entries(specs).map(([type, options]) => 
            this.createManager(type, core, options || {})
                .then(manager => [type, manager])
                .catch(error => [type, { error }])
        );

        const results = await Promise.all(managerPromises);
        
        // Convert array back to object
        const managers = {};
        const errors = {};
        
        results.forEach(([type, result]) => {
            if (result.error) {
                errors[type] = result.error;
            } else {
                managers[type] = result;
            }
        });

        // Throw if any creation failed
        if (Object.keys(errors).length > 0) {
            const errorDetails = Object.entries(errors)
                .map(([type, error]) => `${type}: ${error.message}`)
                .join(', ');
            throw new Error(`Failed to create managers: ${errorDetails}`);
        }

        return managers;
    }

    /**
     * Get all supported manager types
     * 
     * @returns {Array<string>} Array of supported manager types
     */
    static getSupportedTypes() {
        return Object.values(FactoryTypes);
    }

    /**
     * Check if a manager type is supported
     * 
     * @param {string} type - Manager type to check
     * @returns {boolean} True if type is supported
     */
    static isTypeSupported(type) {
        return type in this._factoryMap;
    }

    /**
     * Get factory class for a manager type
     * 
     * @param {string} type - Manager type
     * @returns {Class} Factory class or null if not found
     */
    static getFactoryClass(type) {
        return this._factoryMap[type] || null;
    }

    /**
     * Get registry statistics
     * 
     * @returns {Object} Registry statistics
     */
    static getStats() {
        return {
            ...this._stats,
            supportedTypes: this.getSupportedTypes(),
            registeredFactories: Object.keys(this._factoryMap).length
        };
    }

    /**
     * Reset registry statistics
     */
    static resetStats() {
        this._stats = {
            created: 0,
            errors: 0,
            byType: {},
            performance: {
                totalTime: 0,
                averageTime: 0
            }
        };
    }

    /**
     * Validate manager configuration
     * 
     * @param {string} type - Manager type
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result
     */
    static validateConfig(type, config) {
        if (!this.isTypeSupported(type)) {
            return {
                isValid: false,
                errors: [`Unsupported manager type: ${type}`],
                warnings: []
            };
        }

        const FactoryClass = this._factoryMap[type];
        const factory = FactoryClass.create();
        
        try {
            // Create a temporary instance to validate configuration
            factory._validateAndMergeConfig(config, factory._getDefaultConfig());
            
            return {
                isValid: true,
                errors: [],
                warnings: []
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message],
                warnings: []
            };
        }
    }

    /**
     * Get default configuration for a manager type
     * 
     * @param {string} type - Manager type
     * @returns {Object} Default configuration
     */
    static getDefaultConfig(type) {
        if (!this.isTypeSupported(type)) {
            throw new Error(`Unsupported manager type: ${type}`);
        }

        const FactoryClass = this._factoryMap[type];
        const factory = FactoryClass.create();
        return factory._getDefaultConfig();
    }

    /**
     * Update registry statistics
     * 
     * @param {string} type - Manager type
     * @param {number} creationTime - Time taken to create manager
     * @param {boolean} success - Whether creation was successful
     * @private
     */
    static _updateStats(type, creationTime, success) {
        if (success) {
            this._stats.created++;
            this._stats.performance.totalTime += creationTime;
            this._stats.performance.averageTime = 
                this._stats.performance.totalTime / this._stats.created;
        } else {
            this._stats.errors++;
        }

        // Update per-type statistics
        if (!this._stats.byType[type]) {
            this._stats.byType[type] = { created: 0, errors: 0, totalTime: 0 };
        }

        if (success) {
            this._stats.byType[type].created++;
            this._stats.byType[type].totalTime += creationTime;
        } else {
            this._stats.byType[type].errors++;
        }
    }
}

/**
 * Convenience factory creation functions
 * These functions provide backward compatibility and simpler API surface
 */

/**
 * Create data manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Data manager instance
 */
export async function createDataManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.DATA, core, options);
}

/**
 * Create cell manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Cell manager instance
 */
export async function createCellManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.CELL, core, options);
}

/**
 * Create event manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Event manager instance
 */
export async function createEventManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.EVENT, core, options);
}

/**
 * Create filter manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Filter manager instance
 */
export async function createFilterManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.FILTER, core, options);
}

/**
 * Create layout manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Layout manager instance
 */
export async function createLayoutManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.LAYOUT, core, options);
}

/**
 * Create navigation manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Navigation manager instance
 */
export async function createNavigationManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.NAVIGATION, core, options);
}

/**
 * Create settings manager
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Settings manager instance
 */
export async function createSettingsManager(core, options = {}) {
    return FactoryRegistry.createManager(FactoryTypes.SETTINGS, core, options);
}

/**
 * Create all managers with optimal settings
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options for all managers
 * @returns {Promise<Object>} All configured managers
 */
export async function createManagers(core, options = {}) {
    return FactoryRegistry.createManagers(options, core);
}

// Export default for backward compatibility
export default FactoryRegistry;