/**
 * Factory Creation Functions
 * 
 * @deprecated This module is deprecated in favor of FactoryRegistry and calendar-specific factory index.
 * Please use:
 * - For calendar-specific: import from '../../calendar/utils/factory/index.js'
 * - For unified API: import { FactoryRegistry } from './FactoryRegistry.js'
 * 
 * This module provides factory creation functions for all manager types.
 * These functions handle the instantiation and configuration of factory instances.
 * 
 * @module FactoryCreators
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
 * Create a data manager instance
 * @deprecated Use FactoryRegistry.createManager('data', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Data manager instance
 */
export async function createDataManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createDataManager() is deprecated. Use FactoryRegistry.createManager("data", core, options) or import from calendar/utils/factory/index.js');
    const factory = DataManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a cell manager instance
 * @deprecated Use FactoryRegistry.createManager('cell', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Cell manager instance
 */
export async function createCellManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createCellManager() is deprecated. Use FactoryRegistry.createManager("cell", core, options) or import from calendar/utils/factory/index.js');
    const factory = CellManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create an event manager instance
 * @deprecated Use FactoryRegistry.createManager('event', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Event manager instance
 */
export async function createEventManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createEventManager() is deprecated. Use FactoryRegistry.createManager("event", core, options) or import from calendar/utils/factory/index.js');
    const factory = EventManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a filter manager instance
 * @deprecated Use FactoryRegistry.createManager('filter', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Filter manager instance
 */
export async function createFilterManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createFilterManager() is deprecated. Use FactoryRegistry.createManager("filter", core, options) or import from calendar/utils/factory/index.js');
    const factory = FilterManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a layout manager instance
 * @deprecated Use FactoryRegistry.createManager('layout', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Layout manager instance
 */
export async function createLayoutManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createLayoutManager() is deprecated. Use FactoryRegistry.createManager("layout", core, options) or import from calendar/utils/factory/index.js');
    const factory = LayoutManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a navigation manager instance
 * @deprecated Use FactoryRegistry.createManager('navigation', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Navigation manager instance
 */
export async function createNavigationManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createNavigationManager() is deprecated. Use FactoryRegistry.createManager("navigation", core, options) or import from calendar/utils/factory/index.js');
    const factory = NavigationManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create a settings manager instance
 * @deprecated Use FactoryRegistry.createManager('settings', core, options) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Settings manager instance
 */
export async function createSettingsManager(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createSettingsManager() is deprecated. Use FactoryRegistry.createManager("settings", core, options) or import from calendar/utils/factory/index.js');
    const factory = SettingsManagerFactory.create();
    return await factory.createManager(core, options);
}

/**
 * Create all managers with optimal settings
 * @deprecated Use FactoryRegistry.createManagers(options, core) or import from calendar/utils/factory/index.js
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} All configured managers
 */
export async function createManagers(core, options = {}) {
    console.warn('[DEPRECATED] utils/factory/factory-creators.js createManagers() is deprecated. Use FactoryRegistry.createManagers(options, core) or import from calendar/utils/factory/index.js');
    const {
        dataConfig = {},
        cellConfig = {},
        eventConfig = {},
        filterConfig = {},
        layoutConfig = {},
        navigationConfig = {},
        settingsConfig = {}
    } = options;

    // Create all managers in parallel
    const [
        data,
        cell,
        event,
        filter,
        layout,
        navigation,
        settings
    ] = await Promise.all([
        createDataManager(core, dataConfig),
        createCellManager(core, cellConfig),
        createEventManager(core, eventConfig),
        createFilterManager(core, filterConfig),
        createLayoutManager(core, layoutConfig),
        createNavigationManager(core, navigationConfig),
        createSettingsManager(core, settingsConfig)
    ]);

    return {
        data,
        cell,
        event,
        filter,
        layout,
        navigation,
        settings
    };
}
