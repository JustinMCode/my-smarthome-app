/**
 * Settings Components Index
 * 
 * This module provides centralized access to all settings-related components
 * for the calendar system. These components handle settings management,
 * preferences, and provide sophisticated settings management for all calendar views.
 * 
 * @module SettingsComponents
 */

// Core settings components
import { CalendarSettings } from './calendar-settings.js';

// Export core components
export { CalendarSettings };

/**
 * Settings Component Factory
 * Creates and configures settings components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured settings components
 */
export function createSettingsComponents(core, options = {}) {
    const {
        settingsConfig = {},
        componentConfig = {}
    } = options;

    // Create settings components with optimized settings
    const calendarSettings = new CalendarSettings({
        enablePersistence: true,
        enableValidation: true,
        enableAutoSave: true,
        ...settingsConfig
    });

    return {
        calendarSettings,
        
        // Convenience methods for common operations
        getSetting: (key) => calendarSettings.getSetting(key),
        setSetting: (key, value) => calendarSettings.setSetting(key, value),
        hasSetting: (key) => calendarSettings.hasSetting(key),
        removeSetting: (key) => calendarSettings.removeSetting(key),
        
        // Settings management
        getAllSettings: () => calendarSettings.getAllSettings(),
        updateSettings: (newSettings) => calendarSettings.updateSettings(newSettings),
        resetSettings: () => calendarSettings.resetSettings(),
        exportSettings: () => calendarSettings.exportSettings(),
        importSettings: (settingsData) => calendarSettings.importSettings(settingsData),
        
        // Persistence
        saveSettings: () => calendarSettings.saveSettings(),
        loadSettings: () => calendarSettings.loadSettings(),
        clearSettings: () => calendarSettings.clearSettings(),
        
        // Settings validation
        validateSettings: (settings) => calendarSettings.validateSettings(settings),
        getSettingsSchema: () => calendarSettings.getSchema(),
        
        // Component management
        updateConfig: (newConfig) => {
            calendarSettings.updateConfig(newConfig);
        },
        
        getStats: () => ({
            settings: calendarSettings.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            calendarSettings.destroy();
        }
    };
}

/**
 * Predefined settings component configurations for different use cases
 */
export const SettingsConfigs = {
    /**
     * Configuration for default settings
     */
    defaults: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStart: 0, // Sunday
        showWeekNumbers: false,
        enableAnimations: true,
        enableNotifications: true,
        maxEventsPerDay: 5,
        compactMode: false,
        enableTouch: true,
        enableKeyboard: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStart: 0,
        showWeekNumbers: false,
        enableAnimations: false,
        enableNotifications: true,
        maxEventsPerDay: 3,
        compactMode: true,
        enableTouch: true,
        enableKeyboard: false
    },
    
    /**
     * Configuration for accessibility
     */
    accessibility: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStart: 0,
        showWeekNumbers: true,
        enableAnimations: false,
        enableNotifications: true,
        maxEventsPerDay: 5,
        compactMode: false,
        enableTouch: true,
        enableKeyboard: true,
        highContrast: true,
        largeText: true
    }
};

/**
 * Settings component utilities
 */
export const SettingsUtils = {
    /**
     * Get supported languages
     * @returns {Array} Array of supported language codes
     */
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de'],
    
    /**
     * Get supported themes
     * @returns {Array} Array of supported theme names
     */
    getSupportedThemes: () => ['light', 'dark', 'auto'],
    
    /**
     * Get supported date formats
     * @returns {Array} Array of supported date formats
     */
    getSupportedDateFormats: () => ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    
    /**
     * Calculate optimal settings configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal settings configuration
     */
    calculateOptimalSettingsConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return SettingsConfigs.mobile;
        } else {
            return SettingsConfigs.defaults;
        }
    },
    
    /**
     * Validate settings configuration
     * @param {Object} config - Settings configuration
     * @returns {Object} Validation result
     */
    validateSettingsConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        // Validate theme
        if (config.theme && !SettingsUtils.getSupportedThemes().includes(config.theme)) {
            errors.push('Invalid theme value');
        }
        
        // Validate language
        if (config.language && !SettingsUtils.getSupportedLanguages().includes(config.language)) {
            errors.push('Invalid language value');
        }
        
        // Validate date format
        if (config.dateFormat && !SettingsUtils.getSupportedDateFormats().includes(config.dateFormat)) {
            errors.push('Invalid date format');
        }
        
        // Validate time format
        if (config.timeFormat && !['12h', '24h'].includes(config.timeFormat)) {
            errors.push('Invalid time format');
        }
        
        // Validate week start
        if (config.weekStart !== undefined && (config.weekStart < 0 || config.weekStart > 6)) {
            errors.push('Invalid week start value');
        }
        
        // Validate max events per day
        if (config.maxEventsPerDay !== undefined && (config.maxEventsPerDay < 1 || config.maxEventsPerDay > 20)) {
            errors.push('Invalid max events per day value');
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
    CalendarSettings,
    createSettingsComponents,
    SettingsConfigs,
    SettingsUtils
};