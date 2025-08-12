/**
 * Calendar Factory System Index
 * 
 * Main entry point for calendar-specific factory modules. Provides convenient access
 * to all calendar factory classes and utilities.
 * 
 * @module CalendarFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

// Import base factory and registry
import { ManagerFactory, FactoryRegistry, FactoryTypes } from '../../../utils/factory/index.js';

// Import calendar-specific factory classes
import { DataManagerFactory } from './DataManagerFactory.js';
import { CellManagerFactory } from './CellManagerFactory.js';
import { EventManagerFactory } from './EventManagerFactory.js';
import { FilterManagerFactory } from './FilterManagerFactory.js';
import { LayoutManagerFactory } from './LayoutManagerFactory.js';
import { NavigationManagerFactory } from './NavigationManagerFactory.js';
import { SettingsManagerFactory } from './SettingsManagerFactory.js';

// Export base factory and unified registry
export {
    ManagerFactory,
    FactoryRegistry,
    FactoryTypes
};

// Export all calendar-specific factory classes
export {
    DataManagerFactory,
    CellManagerFactory,
    EventManagerFactory,
    FilterManagerFactory,
    LayoutManagerFactory,
    NavigationManagerFactory,
    SettingsManagerFactory
};

/**
 * Create a data manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured data management components
 */
export async function createDataManager(core, options = {}) {
    const factory = DataManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a cell manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured cell management components
 */
export async function createCellManager(core, options = {}) {
    const factory = CellManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create an event manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured event management components
 */
export async function createEventManager(core, options = {}) {
    const factory = EventManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a filter manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured filter management components
 */
export async function createFilterManager(core, options = {}) {
    const factory = FilterManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a layout manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured layout management components
 */
export async function createLayoutManager(core, options = {}) {
    const factory = LayoutManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a navigation manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured navigation management components
 */
export async function createNavigationManager(core, options = {}) {
    const factory = NavigationManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a settings manager using the calendar factory system
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured settings management components
 */
export async function createSettingsManager(core, options = {}) {
    const factory = SettingsManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Calendar factory utilities
 */
export const CalendarFactoryUtils = {
    /**
     * Create all calendar managers at once
     * @param {Object} core - Calendar core instance
     * @param {Object} options - Configuration options for all managers
     * @returns {Object} Object containing all manager instances
     */
    createAllManagers: (core, options = {}) => {
        return {
            dataManager: createDataManager(core, options.data || {}),
            cellManager: createCellManager(core, options.cell || {}),
            eventManager: createEventManager(core, options.event || {}),
            filterManager: createFilterManager(core, options.filter || {}),
            layoutManager: createLayoutManager(core, options.layout || {}),
            navigationManager: createNavigationManager(core, options.navigation || {}),
            settingsManager: createSettingsManager(core, options.settings || {})
        };
    },

    /**
     * Get all supported calendar manager types
     * @returns {Array} Array of supported manager types
     */
    getSupportedTypes: () => {
        return ['data', 'cell', 'event', 'filter', 'layout', 'navigation', 'settings'];
    },

    /**
     * Validate calendar manager configuration
     * @param {string} managerType - Type of manager
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result
     */
    validateConfig: (managerType, config) => {
        const factoryMap = {
            data: DataManagerFactory,
            cell: CellManagerFactory,
            event: EventManagerFactory,
            filter: FilterManagerFactory,
            layout: LayoutManagerFactory,
            navigation: NavigationManagerFactory,
            settings: SettingsManagerFactory
        };

        const FactoryClass = factoryMap[managerType];
        if (!FactoryClass) {
            return {
                isValid: false,
                errors: [`Unsupported manager type: ${managerType}`]
            };
        }

        const factory = FactoryClass.create();
        return factory.validateConfiguration();
    },

    /**
     * Get default configuration for calendar manager type
     * @param {string} managerType - Type of manager
     * @returns {Object} Default configuration
     */
    getDefaultConfig: (managerType) => {
        const factoryMap = {
            data: DataManagerFactory,
            cell: CellManagerFactory,
            event: EventManagerFactory,
            filter: FilterManagerFactory,
            layout: LayoutManagerFactory,
            navigation: NavigationManagerFactory,
            settings: SettingsManagerFactory
        };

        const FactoryClass = factoryMap[managerType];
        if (!FactoryClass) {
            throw new Error(`Unsupported manager type: ${managerType}`);
        }

        const factory = FactoryClass.create();
        return factory._getDefaultConfig();
    }
};

// Default export for backward compatibility
export default {
    // Factory classes
    DataManagerFactory,
    CellManagerFactory,
    EventManagerFactory,
    FilterManagerFactory,
    LayoutManagerFactory,
    NavigationManagerFactory,
    SettingsManagerFactory,
    
    // Factory functions
    createDataManager,
    createCellManager,
    createEventManager,
    createFilterManager,
    createLayoutManager,
    createNavigationManager,
    createSettingsManager,
    
    // Utilities
    CalendarFactoryUtils
};
