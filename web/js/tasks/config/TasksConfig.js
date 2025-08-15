/**
 * Tasks Configuration Management
 * Central configuration for the tasks module
 */

import { STORAGE_KEYS, DEFAULT_USER, WATER_CONFIG } from '../utils/TasksConstants.js';
import { getDefaultState } from './DefaultData.js';

/**
 * Tasks Configuration Class
 * Manages all configuration settings for the tasks module
 */
export class TasksConfig {
    constructor() {
        this.config = {
            // Storage configuration
            storage: {
                keys: STORAGE_KEYS,
                enableAutoSave: true,
                saveDebounceMs: 500
            },
            
            // User configuration
            users: {
                default: DEFAULT_USER,
                enableSwitching: true
            },
            
            // Water tracking configuration
            water: WATER_CONFIG,
            
            // Medication configuration
            medication: {
                enableTracking: true,
                resetDaily: true
            },
            
            // UI configuration
            ui: {
                enableAnimations: true,
                animationDuration: 300,
                staggerDelay: 50,
                enableGlassmorphism: true
            },
            
            // Performance configuration
            performance: {
                enableVirtualization: false, // For future large task lists
                maxTasksBeforeVirtualization: 100,
                debounceRenderMs: 16 // ~60fps
            },
            
            // Debug configuration
            debug: {
                enabled: true,
                logLevel: 'info', // 'debug', 'info', 'warn', 'error'
                logPrefix: '[Tasks]'
            },
            
            // Default state
            defaultState: getDefaultState()
        };
    }
    
    /**
     * Get configuration value by path
     * @param {string} path - Dot notation path (e.g., 'storage.keys.TASKS')
     * @returns {*} Configuration value
     */
    get(path) {
        return this.getNestedValue(this.config, path);
    }
    
    /**
     * Set configuration value by path
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    set(path, value) {
        this.setNestedValue(this.config, path, value);
    }
    
    /**
     * Get nested object value by path
     * @private
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * Set nested object value by path
     * @private
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
        target[lastKey] = value;
    }
    
    /**
     * Get storage keys
     */
    getStorageKeys() {
        return this.config.storage.keys;
    }
    
    /**
     * Get water configuration
     */
    getWaterConfig() {
        return this.config.water;
    }
    
    /**
     * Get default state
     */
    getDefaultState() {
        return this.config.defaultState;
    }
    
    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name (e.g., 'users.enableSwitching')
     */
    isEnabled(feature) {
        return Boolean(this.get(feature));
    }
    
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
    
    /**
     * Reset to default configuration
     */
    reset() {
        this.config = {
            ...this.config,
            defaultState: getDefaultState()
        };
    }
    
    /**
     * Merge with custom configuration
     * @param {Object} customConfig - Custom configuration to merge
     */
    merge(customConfig) {
        this.config = this.deepMerge(this.config, customConfig);
    }
    
    /**
     * Deep merge objects
     * @private
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
}

// Create and export a singleton instance
export const tasksConfig = new TasksConfig();

// Export convenience functions
export const getConfig = (path) => tasksConfig.get(path);
export const setConfig = (path, value) => tasksConfig.set(path, value);
export const isFeatureEnabled = (feature) => tasksConfig.isEnabled(feature);
