/**
 * Responsive Configuration Factory
 * 
 * Factory pattern implementation for creating and managing responsive configurations.
 * Provides advanced features like caching, validation, and component-specific overrides.
 * 
 * @module ResponsiveFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import ResponsiveConfig, { COMPONENT_TYPES } from './ResponsiveConfig.js';
import { logger } from '../logger.js';

/**
 * Configuration cache for performance optimization
 */
class ConfigurationCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessOrder = [];
    }

    /**
     * Generate cache key for configuration
     * @param {number} width - Container width
     * @param {number} height - Container height
     * @param {string} componentType - Component type
     * @param {Object} options - Configuration options
     * @returns {string} Cache key
     */
    generateKey(width, height, componentType, options = {}) {
        const optionsHash = JSON.stringify(options);
        return `${width}x${height}-${componentType}-${optionsHash}`;
    }

    /**
     * Get configuration from cache
     * @param {string} key - Cache key
     * @returns {Object|null} Cached configuration or null
     */
    get(key) {
        if (this.cache.has(key)) {
            // Update access order
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            this.accessOrder.push(key);
            return this.cache.get(key);
        }
        return null;
    }

    /**
     * Store configuration in cache
     * @param {string} key - Cache key
     * @param {Object} config - Configuration object
     */
    set(key, config) {
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.accessOrder.shift();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, config);
        this.accessOrder.push(key);
    }

    /**
     * Clear the cache
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Calculate cache hit rate (placeholder for future implementation)
     * @returns {number} Hit rate percentage
     */
    calculateHitRate() {
        // This would require tracking hits/misses
        return 0;
    }
}

/**
 * Configuration validator for ensuring configuration quality
 */
class ConfigurationValidator {
    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @param {string} componentType - Component type
     * @returns {Object} Validation result
     */
    static validate(config, componentType) {
        const errors = [];
        const warnings = [];

        // Basic structure validation
        if (!config || typeof config !== 'object') {
            errors.push('Configuration must be a valid object');
            return { isValid: false, errors, warnings };
        }

        // Component-specific validation
        switch (componentType) {
            case COMPONENT_TYPES.CELL:
                this._validateCellConfig(config, errors, warnings);
                break;
            case COMPONENT_TYPES.EVENT:
                this._validateEventConfig(config, errors, warnings);
                break;
            case COMPONENT_TYPES.FILTER:
                this._validateFilterConfig(config, errors, warnings);
                break;
            case COMPONENT_TYPES.LAYOUT:
                this._validateLayoutConfig(config, errors, warnings);
                break;
            default:
                warnings.push(`No specific validation rules for component type: ${componentType}`);
        }

        // Performance validation
        this._validatePerformanceConfig(config, errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate cell-specific configuration
     * @private
     */
    static _validateCellConfig(config, errors, warnings) {
        if (typeof config.maxEvents !== 'number' || config.maxEvents < 1) {
            errors.push('maxEvents must be a positive number');
        }

        if (config.maxEvents > 10) {
            warnings.push('High maxEvents value may impact performance');
        }

        if (typeof config.compactMode !== 'boolean') {
            errors.push('compactMode must be a boolean value');
        }
    }

    /**
     * Validate event-specific configuration
     * @private
     */
    static _validateEventConfig(config, errors, warnings) {
        if (typeof config.maxTitleLength !== 'number' || config.maxTitleLength < 1) {
            errors.push('maxTitleLength must be a positive number');
        }

        if (config.maxTitleLength > 100) {
            warnings.push('Very long title length may affect layout');
        }

        if (typeof config.showTime !== 'boolean') {
            errors.push('showTime must be a boolean value');
        }
    }

    /**
     * Validate filter-specific configuration
     * @private
     */
    static _validateFilterConfig(config, errors, warnings) {
        if (typeof config.maxCacheSize !== 'number' || config.maxCacheSize < 1) {
            errors.push('maxCacheSize must be a positive number');
        }

        if (config.maxCacheSize > 1000) {
            warnings.push('Large cache size may impact memory usage');
        }

        if (typeof config.maxVisibleFilters !== 'number' || config.maxVisibleFilters < 1) {
            errors.push('maxVisibleFilters must be a positive number');
        }
    }

    /**
     * Validate layout-specific configuration
     * @private
     */
    static _validateLayoutConfig(config, errors, warnings) {
        if (typeof config.columns !== 'number' || config.columns < 1) {
            errors.push('columns must be a positive number');
        }

        if (config.columns > 6) {
            warnings.push('High column count may affect readability');
        }

        if (typeof config.maxEventsPerDay !== 'number' || config.maxEventsPerDay < 1) {
            errors.push('maxEventsPerDay must be a positive number');
        }
    }

    /**
     * Validate performance-related configuration
     * @private
     */
    static _validatePerformanceConfig(config, errors, warnings) {
        if (typeof config.enableAnimations !== 'boolean') {
            errors.push('enableAnimations must be a boolean value');
        }

        if (typeof config.enableCaching !== 'boolean') {
            errors.push('enableCaching must be a boolean value');
        }

        if (config.enableVirtualization && !config.enableCaching) {
            warnings.push('Virtualization without caching may impact performance');
        }
    }
}

/**
 * Responsive Configuration Factory
 * 
 * Provides factory methods for creating responsive configurations with
 * advanced features like caching, validation, and component-specific overrides.
 */
export class ResponsiveFactory {
    constructor(options = {}) {
        this.options = {
            enableCaching: true,
            cacheSize: 100,
            enableValidation: true,
            enableLogging: true,
            ...options
        };

        this.cache = this.options.enableCaching ? 
            new ConfigurationCache(this.options.cacheSize) : null;
        
        this.componentOverrides = new Map();
        this.globalOverrides = {};
        
        this._initializeLogging();
    }

    /**
     * Initialize logging for the factory
     * @private
     */
    _initializeLogging() {
        if (this.options.enableLogging) {
            this.logger = logger.createLogger('ResponsiveFactory');
        }
    }

    /**
     * Create a responsive configuration
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @param {string} componentType - Component type
     * @param {Object} options - Additional options
     * @returns {Object} Responsive configuration
     */
    createConfiguration(containerWidth, containerHeight, componentType, options = {}) {
        try {
            // Check cache first
            if (this.cache) {
                const cacheKey = this.cache.generateKey(containerWidth, containerHeight, componentType, options);
                const cachedConfig = this.cache.get(cacheKey);
                if (cachedConfig) {
                    this._log('Cache hit for configuration', { componentType, cacheKey });
                    return cachedConfig;
                }
            }

            // Create new configuration
            const responsiveConfig = new ResponsiveConfig(containerWidth, containerHeight, componentType, options);
            let config = responsiveConfig.getConfiguration();

            // Apply global overrides
            config = this._applyGlobalOverrides(config);

            // Apply component-specific overrides
            config = this._applyComponentOverrides(config, componentType);

            // Validate configuration
            if (this.options.enableValidation) {
                const validation = ConfigurationValidator.validate(config, componentType);
                if (!validation.isValid) {
                    this._log('Configuration validation failed', { errors: validation.errors });
                    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
                }
                if (validation.warnings.length > 0) {
                    this._log('Configuration warnings', { warnings: validation.warnings });
                }
            }

            // Cache the configuration
            if (this.cache) {
                const cacheKey = this.cache.generateKey(containerWidth, containerHeight, componentType, options);
                this.cache.set(cacheKey, config);
            }

            this._log('Configuration created successfully', { componentType, breakpoint: config.breakpoint });
            return config;

        } catch (error) {
            this._log('Error creating configuration', { error: error.message, componentType });
            throw error;
        }
    }

    /**
     * Apply global overrides to configuration
     * @private
     */
    _applyGlobalOverrides(config) {
        return { ...config, ...this.globalOverrides };
    }

    /**
     * Apply component-specific overrides to configuration
     * @private
     */
    _applyComponentOverrides(config, componentType) {
        const componentOverride = this.componentOverrides.get(componentType);
        if (componentOverride) {
            return { ...config, ...componentOverride };
        }
        return config;
    }

    /**
     * Set global configuration overrides
     * @param {Object} overrides - Global overrides to apply to all configurations
     */
    setGlobalOverrides(overrides) {
        this.globalOverrides = { ...this.globalOverrides, ...overrides };
        this._log('Global overrides updated', { overrides });
    }

    /**
     * Set component-specific configuration overrides
     * @param {string} componentType - Component type
     * @param {Object} overrides - Component-specific overrides
     */
    setComponentOverrides(componentType, overrides) {
        this.componentOverrides.set(componentType, { ...overrides });
        this._log('Component overrides updated', { componentType, overrides });
    }

    /**
     * Clear configuration cache
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
            this._log('Configuration cache cleared');
        }
    }

    /**
     * Get cache statistics
     * @returns {Object|null} Cache statistics or null if caching is disabled
     */
    getCacheStats() {
        return this.cache ? this.cache.getStats() : null;
    }

    /**
     * Get factory statistics
     * @returns {Object} Factory statistics
     */
    getStats() {
        return {
            cacheEnabled: this.options.enableCaching,
            validationEnabled: this.options.enableValidation,
            loggingEnabled: this.options.enableLogging,
            componentOverridesCount: this.componentOverrides.size,
            globalOverridesCount: Object.keys(this.globalOverrides).length,
            cacheStats: this.getCacheStats()
        };
    }

    /**
     * Log message if logging is enabled
     * @private
     */
    _log(message, data = {}) {
        if (this.logger) {
            this.logger.info(message, data);
        }
    }

    /**
     * Create a factory instance with static method
     * @param {Object} options - Factory options
     * @returns {ResponsiveFactory} New factory instance
     */
    static create(options = {}) {
        return new ResponsiveFactory(options);
    }
}

export default ResponsiveFactory;
