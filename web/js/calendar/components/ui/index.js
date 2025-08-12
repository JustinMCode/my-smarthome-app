/**
 * Calendar UI Components Index
 * 
 * This module provides centralized access to all UI components
 * for the calendar system. It exports all components, factories,
 * configurations, and utilities from the various UI modules.
 * 
 * @module CalendarUIComponents
 */

// Import all component modules
import * as Events from './events/index.js';
import * as Cells from './cells/index.js';
import * as Navigation from './navigation/index.js';
import * as Settings from './settings/index.js';
import * as Filters from './filters/index.js';
import * as Modals from './modals/index.js';

// Export individual components
export {
    // Event components
    EventRenderer,
    EventPill,
    createEventComponents,
    EventConfigs,
    EventUtils
} from './events/index.js';

export {
    // Cell components
    DayCell,
    createCellComponents,
    CellConfigs,
    CellUtils
} from './cells/index.js';

export {
    // Navigation components
    DateNavigation,
    CalendarHeader,
    createNavigationComponents,
    NavigationConfigs,
    NavigationUtils
} from './navigation/index.js';

export {
    // Settings components
    CalendarSettings,
    createSettingsComponents,
    SettingsConfigs,
    SettingsUtils
} from './settings/index.js';

export {
    // Filter components
    CalendarFilter,
    createFilterComponents,
    FilterConfigs,
    FilterUtils
} from './filters/index.js';

export {
    // Modal components
    BaseModal,
    EventModal,
    createModalManager,
    ModalConfigs,
    ModalStrategies,
    ModalUtils,
    ModalPerformanceUtils
} from './modals/index.js';

/**
 * Create all UI components with optimal settings
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} All configured UI components
 */
export function createUIComponents(core, options = {}) {
    const {
        eventConfig = {},
        cellConfig = {},
        navigationConfig = {},
        settingsConfig = {},
        filterConfig = {},
        modalConfig = {}
    } = options;

    // Create all component instances
    const events = Events.createEventComponents(core, eventConfig);
    const cells = Cells.createCellComponents(core, cellConfig);
    const navigation = Navigation.createNavigationComponents(core, navigationConfig);
    const settings = Settings.createSettingsComponents(core, settingsConfig);
    const filters = Filters.createFilterComponents(core, filterConfig);
    const modals = Modals.createModalManager(core, modalConfig);

    return {
        events,
        cells,
        navigation,
        settings,
        filters,
        modals,
        
        // Global component management
        updateConfig: (newConfig) => {
            events.updateConfig(newConfig);
            cells.updateConfig(newConfig);
            navigation.updateConfig(newConfig);
            settings.updateConfig(newConfig);
            filters.updateConfig(newConfig);
        },
        
        clearCache: () => {
            events.clearCache();
            cells.clearCache();
            filters.clearCache();
        },
        
        getStats: () => ({
            events: events.getStats(),
            cells: cells.getStats(),
            navigation: navigation.getStats(),
            settings: settings.getStats(),
            filters: filters.getStats(),
            modals: modals.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            events.destroy();
            cells.destroy();
            navigation.destroy();
            settings.destroy();
            filters.destroy();
            modals.destroy();
        }
    };
}

/**
 * UI component utilities
 */
export const UIUtils = {
    /**
     * Calculate optimal UI configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal UI configuration
     */
    calculateOptimalUIConfig: (screenWidth) => {
        return {
            events: Events.EventUtils.calculateOptimalEventConfig(screenWidth),
            cells: Cells.CellUtils.calculateOptimalCellConfig(screenWidth),
            navigation: Navigation.NavigationUtils.calculateOptimalNavConfig(screenWidth),
            settings: Settings.SettingsUtils.calculateOptimalSettingsConfig(screenWidth),
            filters: Filters.FilterUtils.calculateOptimalFilterConfig(screenWidth),
            modals: Modals.ModalUtils.calculateOptimalModalConfig(screenWidth)
        };
    },
    
    /**
     * Validate UI configuration
     * @param {Object} config - UI configuration
     * @returns {Object} Validation result
     */
    validateUIConfig: (config) => {
        const validations = {
            events: Events.EventUtils.validateEventConfig(config.events || {}),
            cells: Cells.CellUtils.validateCellConfig(config.cells || {}),
            navigation: Navigation.NavigationUtils.validateNavConfig(config.navigation || {}),
            settings: Settings.SettingsUtils.validateSettingsConfig(config.settings || {}),
            filters: Filters.FilterUtils.validateFilterConfig(config.filters || {}),
            modals: Modals.ModalUtils.validateModalConfig(config.modals || {})
        };
        
        const errors = [];
        const warnings = [];
        
        Object.entries(validations).forEach(([component, validation]) => {
            if (!validation.isValid) {
                errors.push(`${component}: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings && validation.warnings.length > 0) {
                warnings.push(`${component}: ${validation.warnings.join(', ')}`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};

// Export namespaces for convenience
export const Components = {
    Events,
    Cells,
    Navigation,
    Settings,
    Filters,
    Modals
};

// Default export for convenience
export default {
    createUIComponents,
    UIUtils,
    Components
};
