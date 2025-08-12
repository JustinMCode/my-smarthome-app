/**
 * Factory Configuration System
 * 
 * Centralized configuration templates and validation schemas for all manager types.
 * Provides standardized configuration patterns and validation rules.
 * 
 * @module FactoryConfig
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Configuration validation schemas for each manager type
 */
export const CONFIG_SCHEMAS = {
    data: {
        cacheConfig: {
            type: 'object',
            properties: {
                timeout: { type: 'number', minimum: 1000 },
                maxSize: { type: 'number', minimum: 10, maximum: 10000 },
                enableCompression: { type: 'boolean' }
            }
        },
        dataManagerConfig: {
            type: 'object',
            properties: {
                cacheTimeout: { type: 'number', minimum: 1000 },
                enableLazyLoading: { type: 'boolean' },
                maxConcurrentRequests: { type: 'number', minimum: 1, maximum: 10 }
            }
        }
    },
    
    cell: {
        cellConfig: {
            type: 'object',
            properties: {
                maxEvents: { type: 'number', minimum: 1, maximum: 10 },
                compactMode: { type: 'boolean' },
                enableTouch: { type: 'boolean' },
                enableRipple: { type: 'boolean' }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    },
    
    event: {
        rendererConfig: {
            type: 'object',
            properties: {
                showTime: { type: 'boolean' },
                showLocation: { type: 'boolean' },
                compact: { type: 'boolean' },
                maxTitleLength: { type: 'number', minimum: 10, maximum: 100 }
            }
        },
        pillConfig: {
            type: 'object',
            properties: {
                showTime: { type: 'boolean' },
                showLocation: { type: 'boolean' },
                compact: { type: 'boolean' },
                enableTouch: { type: 'boolean' }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    },
    
    filter: {
        filterConfig: {
            type: 'object',
            properties: {
                enableCaching: { type: 'boolean' },
                maxCacheSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableAnimations: { type: 'boolean' },
                showEventCounts: { type: 'boolean' }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    },
    
    layout: {
        layoutConfig: {
            type: 'object',
            properties: {
                columns: { type: 'number', minimum: 1, maximum: 6 },
                maxEventsPerDay: { type: 'number', minimum: 1, maximum: 20 },
                compactMode: { type: 'boolean' },
                enableGrid: { type: 'boolean' }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    },
    
    navigation: {
        navigationConfig: {
            type: 'object',
            properties: {
                enableKeyboard: { type: 'boolean' },
                enableTouch: { type: 'boolean' },
                enableAnimations: { type: 'boolean' },
                enableHistory: { type: 'boolean' }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    },
    
    settings: {
        settingsConfig: {
            type: 'object',
            properties: {
                enablePersistence: { type: 'boolean' },
                enableValidation: { type: 'boolean' },
                enableAutoSave: { type: 'boolean' },
                saveInterval: { type: 'number', minimum: 1000, maximum: 60000 }
            }
        },
        managerConfig: {
            type: 'object',
            properties: {
                enablePooling: { type: 'boolean' },
                maxPoolSize: { type: 'number', minimum: 10, maximum: 1000 },
                enableCaching: { type: 'boolean' }
            }
        }
    }
};

/**
 * Default configuration templates for each manager type
 */
export const DEFAULT_CONFIGS = {
    data: {
        cacheConfig: {
            timeout: 5 * 60 * 1000, // 5 minutes
            maxSize: 1000,
            enableCompression: true
        },
        dataManagerConfig: {
            cacheTimeout: 5 * 60 * 1000,
            enableLazyLoading: true,
            maxConcurrentRequests: 3
        }
    },
    
    cell: {
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
    },
    
    event: {
        rendererConfig: {
            showTime: true,
            showLocation: false,
            compact: false,
            maxTitleLength: 30
        },
        pillConfig: {
            showTime: true,
            showLocation: false,
            compact: false,
            enableTouch: true
        },
        managerConfig: {
            enablePooling: true,
            maxPoolSize: 200,
            enableCaching: true
        }
    },
    
    filter: {
        filterConfig: {
            enableCaching: true,
            maxCacheSize: 100,
            enableAnimations: true,
            showEventCounts: true
        },
        managerConfig: {
            enablePooling: true,
            maxPoolSize: 50,
            enableCaching: true
        }
    },
    
    layout: {
        layoutConfig: {
            columns: 3,
            maxEventsPerDay: 5,
            compactMode: false,
            enableGrid: true
        },
        managerConfig: {
            enablePooling: true,
            maxPoolSize: 50,
            enableCaching: true
        }
    },
    
    navigation: {
        navigationConfig: {
            enableKeyboard: true,
            enableTouch: true,
            enableAnimations: true,
            enableHistory: true
        },
        managerConfig: {
            enablePooling: true,
            maxPoolSize: 50,
            enableCaching: true
        }
    },
    
    settings: {
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
    }
};

/**
 * Performance optimization presets for different environments
 */
export const PERFORMANCE_PRESETS = {
    development: {
        enableCaching: false,
        enablePooling: false,
        enablePerformanceMonitoring: true,
        logLevel: 'debug'
    },
    
    production: {
        enableCaching: true,
        enablePooling: true,
        enablePerformanceMonitoring: false,
        logLevel: 'warn'
    },
    
    testing: {
        enableCaching: false,
        enablePooling: false,
        enablePerformanceMonitoring: true,
        logLevel: 'error'
    },
    
    mobile: {
        enableCaching: true,
        enablePooling: false,
        maxSize: 50,
        enablePerformanceOptimizations: true
    },
    
    desktop: {
        enableCaching: true,
        enablePooling: true,
        maxSize: 200,
        enablePerformanceOptimizations: true
    }
};

/**
 * Configuration validation class
 */
export class ConfigValidator {
    /**
     * Validate configuration against schema
     * @param {string} managerType - Type of manager
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result
     */
    static validate(managerType, config) {
        const schema = CONFIG_SCHEMAS[managerType];
        if (!schema) {
            return {
                isValid: false,
                errors: [`No schema found for manager type: ${managerType}`],
                warnings: []
            };
        }
        
        const errors = [];
        const warnings = [];
        
        // Validate each configuration section
        for (const [sectionName, sectionConfig] of Object.entries(config)) {
            const sectionSchema = schema[sectionName];
            if (sectionSchema) {
                const sectionValidation = this._validateSection(sectionConfig, sectionSchema);
                errors.push(...sectionValidation.errors.map(err => `${sectionName}: ${err}`));
                warnings.push(...sectionValidation.warnings.map(warn => `${sectionName}: ${warn}`));
            } else {
                warnings.push(`Unknown configuration section: ${sectionName}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * Validate a configuration section
     * @param {Object} config - Section configuration
     * @param {Object} schema - Section schema
     * @returns {Object} Validation result
     * @private
     */
    static _validateSection(config, schema) {
        const errors = [];
        const warnings = [];
        
        if (schema.type === 'object' && schema.properties) {
            for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
                if (config.hasOwnProperty(propertyName)) {
                    const value = config[propertyName];
                    const validation = this._validateProperty(value, propertySchema);
                    
                    if (!validation.isValid) {
                        errors.push(`${propertyName}: ${validation.error}`);
                    }
                }
            }
        }
        
        return { errors, warnings };
    }
    
    /**
     * Validate a property value
     * @param {*} value - Property value
     * @param {Object} schema - Property schema
     * @returns {Object} Validation result
     * @private
     */
    static _validateProperty(value, schema) {
        // Type validation
        if (schema.type && typeof value !== schema.type) {
            return {
                isValid: false,
                error: `Expected ${schema.type}, got ${typeof value}`
            };
        }
        
        // Number range validation
        if (schema.type === 'number') {
            if (schema.minimum !== undefined && value < schema.minimum) {
                return {
                    isValid: false,
                    error: `Value must be >= ${schema.minimum}`
                };
            }
            
            if (schema.maximum !== undefined && value > schema.maximum) {
                return {
                    isValid: false,
                    error: `Value must be <= ${schema.maximum}`
                };
            }
        }
        
        return { isValid: true };
    }
}

/**
 * Configuration merger class
 */
export class ConfigMerger {
    /**
     * Merge configuration with defaults
     * @param {string} managerType - Type of manager
     * @param {Object} userConfig - User provided configuration
     * @param {string} environment - Environment preset to apply
     * @returns {Object} Merged configuration
     */
    static merge(managerType, userConfig = {}, environment = 'production') {
        const defaultConfig = DEFAULT_CONFIGS[managerType] || {};
        const performancePreset = PERFORMANCE_PRESETS[environment] || PERFORMANCE_PRESETS.production;
        
        // Deep merge configurations
        const merged = this._deepMerge(defaultConfig, userConfig);
        
        // Apply performance preset
        for (const [sectionName, sectionConfig] of Object.entries(merged)) {
            merged[sectionName] = { ...sectionConfig, ...performancePreset };
        }
        
        return merged;
    }
    
    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     * @private
     */
    static _deepMerge(target, source) {
        const result = { ...target };
        
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this._deepMerge(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
}

/**
 * Get default configuration for manager type
 * @param {string} managerType - Type of manager
 * @returns {Object} Default configuration
 */
export function getDefaultConfig(managerType) {
    return DEFAULT_CONFIGS[managerType] || {};
}

/**
 * Get configuration schema for manager type
 * @param {string} managerType - Type of manager
 * @returns {Object} Configuration schema
 */
export function getConfigSchema(managerType) {
    return CONFIG_SCHEMAS[managerType] || {};
}

/**
 * Get performance preset for environment
 * @param {string} environment - Environment name
 * @returns {Object} Performance preset
 */
export function getPerformancePreset(environment) {
    return PERFORMANCE_PRESETS[environment] || PERFORMANCE_PRESETS.production;
}

export default {
    CONFIG_SCHEMAS,
    DEFAULT_CONFIGS,
    PERFORMANCE_PRESETS,
    ConfigValidator,
    ConfigMerger,
    getDefaultConfig,
    getConfigSchema,
    getPerformancePreset
};
