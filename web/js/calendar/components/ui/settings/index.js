/**
 * Calendar Settings Components Index
 * 
 * This module provides centralized access to all settings and configuration management components
 * for the calendar system. These components handle calendar management, user preferences,
 * configuration settings, and provide sophisticated settings management for all calendar views.
 * 
 * @module CalendarSettingsComponents
 */

// Core settings components
import { CalendarSettings } from './calendar-settings.js';
import { CacheFactory } from '../../../utils/core/cache/index.js';

export { CalendarSettings };

/**
 * Calendar Settings Manager Factory
 * Creates and configures settings management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured settings management components
 */
export function createSettingsManager(core, options = {}) {
    const {
        calendarSettingsConfig = {},
        managerConfig = {}
    } = options;

    // Create calendar settings with optimized settings
    const calendarSettings = new CalendarSettings();

    // Create settings manager with optimized settings
    const settingsManager = new SettingsManager(core, {
        enableCaching: true,
        enableAutoSave: true,
        autoSaveDelay: 1000,
        enableValidation: true,
        enableResponsive: true,
        updateDebounce: 100,
        ...managerConfig
    });

    return {
        calendarSettings,
        settingsManager,
        
        // Convenience methods for common operations
        init: () => {
            calendarSettings.init();
            settingsManager.init();
        },
        
        openSettings: () => {
            calendarSettings.openSettings();
        },
        
        closeSettings: () => {
            calendarSettings.closeSettings();
        },
        
        refreshCalendarList: () => {
            calendarSettings.refreshCalendarList();
        },
        
        // Settings management
        getSettings: (key) => settingsManager.getSettings(key),
        setSettings: (key, value) => settingsManager.setSettings(key, value),
        getUserPreferences: () => settingsManager.getUserPreferences(),
        setUserPreferences: (preferences) => settingsManager.setUserPreferences(preferences),
        
        // Calendar management
        addCalendar: (name, color, description) => {
            const calendar = calendarSettings.handleAddCalendar({ 
                preventDefault: () => {},
                target: { 
                    querySelector: (selector) => {
                        if (selector === '#calendar-name') return { value: name };
                        if (selector === '#calendar-description') return { value: description };
                        return null;
                    }
                }
            });
            return calendar;
        },
        
        deleteCalendar: (calendarId) => {
            return calendarSettings.deleteCalendar(calendarId);
        },
        
        // Cleanup
        destroy: () => {
            calendarSettings.destroy();
            settingsManager.destroy();
        }
    };
}

/**
 * Settings Manager Class
 * Manages settings operations, caching, and lifecycle
 */
class SettingsManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enableCaching: true,
            enableAutoSave: true,
            autoSaveDelay: 1000,
            enableValidation: true,
            enableResponsive: true,
            updateDebounce: 100,
            ...options
        };
        
        this.userPreferences = new Map();
        this.settingsCache = CacheFactory.createCache('settings');
        this.stats = {
            settingsLoaded: 0,
            settingsSaved: 0,
            cacheHits: 0,
            cacheMisses: 0,
            autoSaves: 0
        };
        
        this.autoSaveTimer = null;
        this.debounceTimer = null;
    }

    /**
     * Initialize the settings manager
     */
    init() {
        this.loadUserPreferences();
        this.setupSettingsListeners();
        this.setupResponsiveHandling();
    }

    /**
     * Setup settings event listeners
     */
    setupSettingsListeners() {
        // Listen for calendar configuration changes
        window.addEventListener('calendarConfigChanged', (event) => {
            this.handleCalendarConfigChange(event.detail);
        });
        
        // Listen for user preference changes
        window.addEventListener('userPreferenceChanged', (event) => {
            this.handleUserPreferenceChange(event.detail);
        });
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        if (!this.options.enableResponsive) return;
        
        window.addEventListener('resize', () => {
            this.debouncedUpdateSettingsLayout();
        });
    }

    /**
     * Get settings with caching
     * @param {string} key - Settings key
     * @returns {any} Settings value
     */
    getSettings(key) {
        if (!this.options.enableCaching) {
            return this.loadSettings(key);
        }
        
        const cached = this.settingsCache.get(key, {
            keyOptions: { strategy: 'simple' }
        });
        
        if (cached) {
            this.stats.cacheHits++;
            return cached;
        }
        
        this.stats.cacheMisses++;
        
        const settings = this.loadSettings(key);
        
        this.settingsCache.set(key, settings, {
            keyOptions: { strategy: 'simple' }
        });
        
        return settings;
    }

    /**
     * Set settings with auto-save
     * @param {string} key - Settings key
     * @param {any} value - Settings value
     */
    setSettings(key, value) {
        // Update cache immediately
        if (this.options.enableCaching) {
            const cacheKey = this.generateCacheKey(key);
            this.settingsCache.set(cacheKey, {
                result: value,
                timestamp: Date.now()
            });
        }
        
        // Auto-save if enabled
        if (this.options.enableAutoSave) {
            this.scheduleAutoSave(key, value);
        } else {
            this.saveSettings(key, value);
        }
    }

    /**
     * Load settings from storage
     * @param {string} key - Settings key
     * @returns {any} Settings value
     */
    loadSettings(key) {
        try {
            const saved = localStorage.getItem(key);
            const value = saved ? JSON.parse(saved) : null;
            this.stats.settingsLoaded++;
            return value;
        } catch (e) {
            console.warn(`Failed to load settings for key: ${key}`, e);
            return null;
        }
    }

    /**
     * Save settings to storage
     * @param {string} key - Settings key
     * @param {any} value - Settings value
     */
    saveSettings(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            this.stats.settingsSaved++;
        } catch (e) {
            console.warn(`Failed to save settings for key: ${key}`, e);
        }
    }

    /**
     * Schedule auto-save
     * @param {string} key - Settings key
     * @param {any} value - Settings value
     */
    scheduleAutoSave(key, value) {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveSettings(key, value);
            this.stats.autoSaves++;
        }, this.options.autoSaveDelay);
    }

    /**
     * Handle calendar configuration change
     * @param {Object} detail - Configuration change details
     */
    handleCalendarConfigChange(detail) {
        // Update calendar configuration
        this.updateCalendarConfiguration(detail.calendars);
        
        // Notify views of configuration change
        this.notifyViews('calendarConfigChanged', detail);
        
        // Save configuration to storage
        this.saveCalendarConfiguration(detail.calendars);
    }

    /**
     * Handle user preference change
     * @param {Object} detail - Preference change details
     */
    handleUserPreferenceChange(detail) {
        // Update user preferences
        this.userPreferences.set(detail.key, detail.value);
        
        // Notify views of preference change
        this.notifyViews('userPreferenceChanged', detail);
        
        // Save preferences to storage
        this.saveUserPreferences();
    }

    /**
     * Update calendar configuration
     * @param {Array} calendars - Calendar configuration
     */
    updateCalendarConfiguration(calendars) {
        // Update calendar manager with new configuration
        if (this.core && this.core.calendarManager) {
            this.core.calendarManager.updateCalendars(calendars);
        }
        
        // Update settings cache
        this.settingsCache.set('calendars', {
            data: calendars,
            timestamp: Date.now()
        });
    }

    /**
     * Notify views of settings change
     * @param {string} eventType - Event type
     * @param {Object} detail - Event details
     */
    notifyViews(eventType, detail) {
        // Notify all views of settings change
        window.dispatchEvent(new CustomEvent(eventType, { detail }));
    }

    /**
     * Save calendar configuration
     * @param {Array} calendars - Calendar configuration
     */
    saveCalendarConfiguration(calendars) {
        this.saveSettings('calendarConfiguration', calendars);
    }

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getUserPreferences() {
        return Object.fromEntries(this.userPreferences);
    }

    /**
     * Set user preferences
     * @param {Object} preferences - User preferences
     */
    setUserPreferences(preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
            this.userPreferences.set(key, value);
        });
        
        this.saveUserPreferences();
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('userPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.entries(preferences).forEach(([key, value]) => {
                    this.userPreferences.set(key, value);
                });
            }
        } catch (e) {
            console.warn('Failed to load user preferences:', e);
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences() {
        try {
            const preferences = Object.fromEntries(this.userPreferences);
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
        } catch (e) {
            console.warn('Failed to save user preferences:', e);
        }
    }

    /**
     * Cleanup cache
     */
    cleanupCache() {
        this.settingsCache.clearExpired();
    }

    /**
     * Debounced update settings layout
     */
    debouncedUpdateSettingsLayout() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.updateSettingsLayout();
        }, this.options.updateDebounce);
    }

    /**
     * Update settings layout for responsive design
     */
    updateSettingsLayout() {
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile: Compact settings layout
            this.setMobileSettingsLayout();
        } else if (width < 1024) {
            // Tablet: Standard settings layout
            this.setTabletSettingsLayout();
        } else {
            // Desktop: Full settings layout
            this.setDesktopSettingsLayout();
        }
    }

    /**
     * Set mobile settings layout
     */
    setMobileSettingsLayout() {
        // Use compact settings layout for mobile
        const settingsModal = document.querySelector('.settings-modal');
        if (settingsModal) {
            settingsModal.classList.add('mobile');
            settingsModal.classList.remove('tablet', 'desktop');
        }
    }

    /**
     * Set tablet settings layout
     */
    setTabletSettingsLayout() {
        // Use standard settings layout for tablet
        const settingsModal = document.querySelector('.settings-modal');
        if (settingsModal) {
            settingsModal.classList.add('tablet');
            settingsModal.classList.remove('mobile', 'desktop');
        }
    }

    /**
     * Set desktop settings layout
     */
    setDesktopSettingsLayout() {
        // Use full settings layout for desktop
        const settingsModal = document.querySelector('.settings-modal');
        if (settingsModal) {
            settingsModal.classList.add('desktop');
            settingsModal.classList.remove('mobile', 'tablet');
        }
    }

    /**
     * Get statistics
     * @returns {Object} Settings manager statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.settingsCache.size,
            cacheHitRate: (this.stats.cacheHits + this.stats.cacheMisses) > 0 ? 
                (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) * 100).toFixed(2) + '%' : '0%'
        };
    }

    /**
     * Destroy the manager
     */
    destroy() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.userPreferences.clear();
        this.settingsCache.clear();
    }
}

/**
 * Predefined settings configurations for different use cases
 */
export const SettingsConfigs = {
    /**
     * Configuration for month view settings
     */
    monthView: {
        enableCaching: true,
        cacheTimeout: 600000,
        enableValidation: true,
        enableAutoSave: true,
        maxCalendars: 50,
        enableColorPicker: true,
        enableDescriptions: true,
        enableResponsive: true
    },
    
    /**
     * Configuration for week view settings
     */
    weekView: {
        enableCaching: true,
        cacheTimeout: 600000,
        enableValidation: true,
        enableAutoSave: true,
        maxCalendars: 50,
        enableColorPicker: true,
        enableDescriptions: true,
        enableResponsive: true
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        enableCaching: true,
        cacheTimeout: 600000,
        enableValidation: true,
        enableAutoSave: false,
        maxCalendars: 20,
        enableColorPicker: true,
        enableDescriptions: false,
        enableResponsive: true
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        enableCaching: true,
        cacheTimeout: 600000,
        enableValidation: true,
        enableAutoSave: true,
        maxCalendars: 100,
        enableColorPicker: true,
        enableDescriptions: true,
        enableResponsive: true
    }
};

/**
 * Predefined settings strategies for different scenarios
 */
export const SettingsStrategies = {
    /**
     * Strategy for high settings frequency
     */
    highFrequency: {
        enableCaching: true,
        maxCacheSize: 100,
        enableAutoSave: true,
        autoSaveDelay: 500,
        enableValidation: true,
        enableResponsive: true,
        updateDebounce: 50
    },
    
    /**
     * Strategy for low settings frequency
     */
    lowFrequency: {
        enableCaching: false,
        maxCacheSize: 20,
        enableAutoSave: false,
        autoSaveDelay: 2000,
        enableValidation: true,
        enableResponsive: true,
        updateDebounce: 200
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        enableCaching: true,
        maxCacheSize: 50,
        enableAutoSave: true,
        autoSaveDelay: 1000,
        enableValidation: true,
        enableResponsive: true,
        updateDebounce: 100,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        enableCaching: true,
        maxCacheSize: 30,
        enableAutoSave: false,
        autoSaveDelay: 1500,
        enableValidation: true,
        enableResponsive: true,
        updateDebounce: 150
    }
};

/**
 * Utility functions for settings management
 */
export const SettingsUtils = {
    /**
     * Calculate optimal settings configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal settings configuration
     */
    calculateOptimalSettingsConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: false,
                maxCalendars: 20,
                enableColorPicker: true,
                enableDescriptions: false,
                enableResponsive: true
            };
        } else if (screenWidth < 1024) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 50,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
        } else if (screenWidth < 1440) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 75,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
        } else {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 100,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
        }
    },
    
    /**
     * Generate settings cache key
     * @param {string} key - Settings key
     * @param {Object} options - Settings options
     * @returns {string} Cache key
     */
    generateSettingsKey: (key, options = {}) => {
        const optionsHash = SettingsUtils.hashString(JSON.stringify(options));
        return `settings_${key}_${optionsHash}`;
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
     * Check if settings need update
     * @param {Object} cachedSettings - Cached settings data
     * @param {Object} currentSettings - Current settings data
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedSettings, currentSettings) => {
        if (!cachedSettings) return true;
        
        const age = Date.now() - cachedSettings.timestamp;
        const maxAge = 600000; // 10 minutes default
        
        return age > maxAge || 
               JSON.stringify(cachedSettings.data) !== JSON.stringify(currentSettings);
    },
    
    /**
     * Calculate responsive settings configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive settings configuration
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        const aspectRatio = containerWidth / containerHeight;
        
        if (containerWidth < 768) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: false,
                maxCalendars: 20,
                enableColorPicker: true,
                enableDescriptions: false,
                enableResponsive: true
            };
        } else if (containerWidth < 1024) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 50,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
        } else if (containerWidth < 1440) {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 75,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
        } else {
            return {
                enableCaching: true,
                cacheTimeout: 600000,
                enableValidation: true,
                enableAutoSave: true,
                maxCalendars: 100,
                enableColorPicker: true,
                enableDescriptions: true,
                enableResponsive: true
            };
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
        
        if (config.maxCalendars && config.maxCalendars > 1000) {
            warnings.push('Large calendar count may impact performance');
        }
        
        if (config.cacheTimeout && config.cacheTimeout > 3600000) {
            warnings.push('Long cache timeout may show stale data');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },
    
    /**
     * Create settings from template
     * @param {string} template - Settings template
     * @param {Object} data - Data to inject
     * @returns {string} Rendered settings
     */
    createSettingsFromTemplate: (template, data) => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    },
    
    /**
     * Escape settings content
     * @param {string} content - Content to escape
     * @returns {string} Escaped content
     */
    escapeSettingsContent: (content) => {
        const div = document.createElement('div');
        div.textContent = content;
        return div.innerHTML;
    }
};

/**
 * Performance monitoring utilities for settings
 */
export const SettingsPerformanceUtils = {
    /**
     * Measure settings performance
     * @param {Function} settingsFunction - Settings function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureSettingsPerformance: (settingsFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = settingsFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            settingsTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for settings operations
     * @returns {Object} Performance monitor
     */
    createSettingsPerformanceMonitor: () => {
        const metrics = {
            totalSettings: 0,
            totalSettingsTime: 0,
            averageSettingsTime: 0,
            slowestSettings: 0,
            fastestSettings: Infinity,
            memoryUsage: []
        };
        
        return {
            measureSettings: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const settingsTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalSettings++;
                metrics.totalSettingsTime += settingsTime;
                metrics.averageSettingsTime = metrics.totalSettingsTime / metrics.totalSettings;
                metrics.slowestSettings = Math.max(metrics.slowestSettings, settingsTime);
                metrics.fastestSettings = Math.min(metrics.fastestSettings, settingsTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    settingsTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalSettings: 0,
                    totalSettingsTime: 0,
                    averageSettingsTime: 0,
                    slowestSettings: 0,
                    fastestSettings: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    CalendarSettings,
    createSettingsManager,
    SettingsConfigs,
    SettingsStrategies,
    SettingsUtils,
    SettingsPerformanceUtils
};
