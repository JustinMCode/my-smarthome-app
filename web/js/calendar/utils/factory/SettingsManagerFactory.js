/**
 * Settings Manager Factory
 * 
 * Specialized factory for creating settings management components.
 * Extends the base ManagerFactory with settings-specific functionality.
 * 
 * @module SettingsManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Settings Manager Factory Class
 * 
 * Creates and configures settings management components with optimized settings.
 * Provides standardized settings management patterns and persistence strategies.
 */
export class SettingsManagerFactory extends ManagerFactory {
    /**
     * Create a new settings manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('settings', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual settings manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Settings manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { settingsConfig = {}, managerConfig = {} } = config;

        // Create settings components with optimized settings
        const settingsManager = this._createSettingsManager(core, settingsConfig);
        const calendarSettings = this._createCalendarSettings(settingsConfig);

        return {
            settingsManager,
            calendarSettings,
            
            // Convenience methods for common operations
            getSetting: (key) => settingsManager.getSetting(key),
            setSetting: (key, value) => settingsManager.setSetting(key, value),
            hasSetting: (key) => settingsManager.hasSetting(key),
            removeSetting: (key) => settingsManager.removeSetting(key),
            
            // Settings management
            getAllSettings: () => settingsManager.getAllSettings(),
            updateSettings: (newSettings) => settingsManager.updateSettings(newSettings),
            resetSettings: () => settingsManager.resetSettings(),
            exportSettings: () => settingsManager.exportSettings(),
            importSettings: (settingsData) => settingsManager.importSettings(settingsData),
            
            // Persistence
            saveSettings: () => settingsManager.saveSettings(),
            loadSettings: () => settingsManager.loadSettings(),
            clearSettings: () => settingsManager.clearSettings(),
            
            // Settings validation
            validateSettings: (settings) => settingsManager.validateSettings(settings),
            getSettingsSchema: () => settingsManager.getSchema(),
            
            // Statistics
            getSettingsStats: () => settingsManager.getStats(),
            
            // Cleanup
            destroy: () => {
                settingsManager.destroy();
                calendarSettings.destroy();
            }
        };
    }

    /**
     * Get default configuration for settings manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            settingsConfig: {
                enablePersistence: true,
                enableValidation: true,
                enableAutoSave: true,
                saveInterval: 5000 // 5 seconds
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 50,
                enableCaching: true
            }
        };
    }

    /**
     * Create settings manager instance
     * @param {Object} core - Core instance
     * @param {Object} settingsConfig - Settings configuration
     * @returns {Object} Settings manager instance
     * @private
     */
    _createSettingsManager(core, settingsConfig) {
        const settings = new Map();
        const config = { ...settingsConfig };
        const stats = {
            gets: 0,
            sets: 0,
            saves: 0,
            loads: 0,
            validations: 0
        };

        // Default settings
        const defaultSettings = {
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
        };

        // Initialize with defaults
        Object.entries(defaultSettings).forEach(([key, value]) => {
            settings.set(key, value);
        });

        // Auto-save timer
        let autoSaveTimer = null;

        if (config.enableAutoSave) {
            autoSaveTimer = setInterval(() => {
                this.saveSettings();
            }, config.saveInterval);
        }

        return {
            getSetting: (key) => {
                stats.gets++;
                return settings.get(key);
            },

            setSetting: (key, value) => {
                if (config.enableValidation) {
                    const validation = this.validateSettings({ [key]: value });
                    if (!validation.isValid) {
                        throw new Error(`Invalid setting value for ${key}: ${validation.errors.join(', ')}`);
                    }
                }

                settings.set(key, value);
                stats.sets++;

                // Auto-save if enabled
                if (config.enableAutoSave && config.enablePersistence) {
                    this.saveSettings();
                }

                return value;
            },

            hasSetting: (key) => {
                return settings.has(key);
            },

            removeSetting: (key) => {
                const removed = settings.delete(key);
                if (removed && config.enableAutoSave && config.enablePersistence) {
                    this.saveSettings();
                }
                return removed;
            },

            getAllSettings: () => {
                return Object.fromEntries(settings);
            },

            updateSettings: (newSettings) => {
                if (config.enableValidation) {
                    const validation = this.validateSettings(newSettings);
                    if (!validation.isValid) {
                        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
                    }
                }

                Object.entries(newSettings).forEach(([key, value]) => {
                    settings.set(key, value);
                });

                stats.sets++;

                if (config.enableAutoSave && config.enablePersistence) {
                    this.saveSettings();
                }

                return this.getAllSettings();
            },

            resetSettings: () => {
                settings.clear();
                Object.entries(defaultSettings).forEach(([key, value]) => {
                    settings.set(key, value);
                });

                if (config.enablePersistence) {
                    this.saveSettings();
                }

                return this.getAllSettings();
            },

            exportSettings: () => {
                return {
                    settings: this.getAllSettings(),
                    timestamp: Date.now(),
                    version: '1.0.0'
                };
            },

            importSettings: (settingsData) => {
                if (settingsData.settings) {
                    this.updateSettings(settingsData.settings);
                }
                return this.getAllSettings();
            },

            saveSettings: () => {
                if (!config.enablePersistence) return false;

                try {
                    const settingsData = this.exportSettings();
                    localStorage.setItem('calendar-settings', JSON.stringify(settingsData));
                    stats.saves++;
                    return true;
                } catch (error) {
                    console.error('Failed to save settings:', error);
                    return false;
                }
            },

            loadSettings: () => {
                if (!config.enablePersistence) return false;

                try {
                    const savedData = localStorage.getItem('calendar-settings');
                    if (savedData) {
                        const settingsData = JSON.parse(savedData);
                        this.importSettings(settingsData);
                        stats.loads++;
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to load settings:', error);
                }

                return false;
            },

            clearSettings: () => {
                if (config.enablePersistence) {
                    localStorage.removeItem('calendar-settings');
                }
                settings.clear();
                return true;
            },

            validateSettings: (settingsToValidate) => {
                stats.validations++;
                const errors = [];

                // Validate theme
                if (settingsToValidate.theme && !['light', 'dark', 'auto'].includes(settingsToValidate.theme)) {
                    errors.push('Invalid theme value');
                }

                // Validate language
                if (settingsToValidate.language && !['en', 'es', 'fr', 'de'].includes(settingsToValidate.language)) {
                    errors.push('Invalid language value');
                }

                // Validate date format
                if (settingsToValidate.dateFormat && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(settingsToValidate.dateFormat)) {
                    errors.push('Invalid date format');
                }

                // Validate time format
                if (settingsToValidate.timeFormat && !['12h', '24h'].includes(settingsToValidate.timeFormat)) {
                    errors.push('Invalid time format');
                }

                // Validate week start
                if (settingsToValidate.weekStart !== undefined && (settingsToValidate.weekStart < 0 || settingsToValidate.weekStart > 6)) {
                    errors.push('Invalid week start value');
                }

                // Validate max events per day
                if (settingsToValidate.maxEventsPerDay !== undefined && (settingsToValidate.maxEventsPerDay < 1 || settingsToValidate.maxEventsPerDay > 20)) {
                    errors.push('Invalid max events per day value');
                }

                return {
                    isValid: errors.length === 0,
                    errors
                };
            },

            getSchema: () => {
                return {
                    theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                    language: { type: 'string', enum: ['en', 'es', 'fr', 'de'] },
                    timezone: { type: 'string' },
                    dateFormat: { type: 'string', enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                    timeFormat: { type: 'string', enum: ['12h', '24h'] },
                    weekStart: { type: 'number', minimum: 0, maximum: 6 },
                    showWeekNumbers: { type: 'boolean' },
                    enableAnimations: { type: 'boolean' },
                    enableNotifications: { type: 'boolean' },
                    maxEventsPerDay: { type: 'number', minimum: 1, maximum: 20 },
                    compactMode: { type: 'boolean' },
                    enableTouch: { type: 'boolean' },
                    enableKeyboard: { type: 'boolean' }
                };
            },

            getStats: () => ({
                ...stats,
                totalSettings: settings.size,
                config
            }),

            destroy: () => {
                if (autoSaveTimer) {
                    clearInterval(autoSaveTimer);
                    autoSaveTimer = null;
                }
                settings.clear();
            }
        };
    }

    /**
     * Create calendar settings instance
     * @param {Object} settingsConfig - Settings configuration
     * @returns {Object} Calendar settings instance
     * @private
     */
    _createCalendarSettings(settingsConfig) {
        return {
            config: { ...settingsConfig },
            
            // Calendar-specific settings utilities
            getThemeSettings: () => {
                return {
                    theme: this.getSetting('theme'),
                    enableAnimations: this.getSetting('enableAnimations')
                };
            },

            getDisplaySettings: () => {
                return {
                    dateFormat: this.getSetting('dateFormat'),
                    timeFormat: this.getSetting('timeFormat'),
                    weekStart: this.getSetting('weekStart'),
                    showWeekNumbers: this.getSetting('showWeekNumbers'),
                    maxEventsPerDay: this.getSetting('maxEventsPerDay'),
                    compactMode: this.getSetting('compactMode')
                };
            },

            getInteractionSettings: () => {
                return {
                    enableTouch: this.getSetting('enableTouch'),
                    enableKeyboard: this.getSetting('enableKeyboard'),
                    enableNotifications: this.getSetting('enableNotifications')
                };
            },

            getLocalizationSettings: () => {
                return {
                    language: this.getSetting('language'),
                    timezone: this.getSetting('timezone')
                };
            },

            // Settings presets
            applyPreset: (presetName) => {
                const presets = {
                    mobile: {
                        compactMode: true,
                        maxEventsPerDay: 3,
                        enableTouch: true,
                        enableKeyboard: false
                    },
                    desktop: {
                        compactMode: false,
                        maxEventsPerDay: 7,
                        enableTouch: false,
                        enableKeyboard: true
                    },
                    accessibility: {
                        enableAnimations: false,
                        enableNotifications: true,
                        showWeekNumbers: true
                    }
                };

                const preset = presets[presetName];
                if (preset) {
                    this.updateSettings(preset);
                    return true;
                }
                return false;
            },

            destroy: () => {
                // Cleanup if needed
            }
        };
    }

    /**
     * Create settings manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {SettingsManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new SettingsManagerFactory(options);
    }
}

// Export only the named export
