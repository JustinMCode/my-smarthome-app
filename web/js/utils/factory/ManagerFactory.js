/**
 * Base Manager Factory Class
 * 
 * Provides common factory functionality for all manager types.
 * Implements standardized patterns for manager creation, configuration,
 * and lifecycle management.
 * 
 * @module ManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

// Simple logger for testing (replace with actual logger in production)
const logger = {
    info: (message) => console.log(`[INFO] ${message}`),
    warn: (message) => console.warn(`[WARN] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`),
    debug: (message) => console.debug(`[DEBUG] ${message}`)
};

/**
 * Base Manager Factory Class
 * 
 * Abstract base class providing common factory functionality for all manager types.
 * Implements standardized patterns for manager creation, configuration validation,
 * performance monitoring, and lifecycle management.
 */
export class ManagerFactory {
    /**
     * Create a new manager factory instance
     * @param {string} managerType - Type of manager (data, cell, event, etc.)
     * @param {Object} options - Factory configuration options
     */
    constructor(managerType, options = {}) {
        this.managerType = managerType;
        this.options = {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            enableErrorRecovery: true,
            logLevel: 'info',
            ...options
        };
        
        this.logger = logger;
        this.loggerName = `ManagerFactory:${managerType}`;
        
        this.stats = {
            created: 0,
            errors: 0,
            performance: {
                averageCreationTime: 0,
                totalCreationTime: 0
            }
        };
        
        this._validateManagerType();
    }

    /**
     * Validate manager type
     * @private
     */
    _validateManagerType() {
        const validTypes = [
            'data', 'cell', 'event', 'filter', 
            'layout', 'navigation', 'settings'
        ];
        
        if (!validTypes.includes(this.managerType)) {
            throw new Error(`Invalid manager type: ${this.managerType}. Valid types: ${validTypes.join(', ')}`);
        }
    }

    /**
     * Validate core parameter
     * @param {Object} core - Core instance
     * @private
     */
    _validateCore(core) {
        if (!core) {
            throw new Error(`${this.managerType} manager requires a core instance`);
        }
        
        if (typeof core !== 'object') {
            throw new Error(`Core must be an object, received: ${typeof core}`);
        }
        
        // Validate core has required methods
        const requiredMethods = ['getEvents', 'getCurrentDate', 'getCurrentView'];
        for (const method of requiredMethods) {
            if (typeof core[method] !== 'function') {
                this.logger.warn(`${this.loggerName}: Core missing required method: ${method}`);
            }
        }
    }

    /**
     * Validate and merge configuration options
     * @param {Object} options - User provided options
     * @param {Object} defaults - Default configuration
     * @returns {Object} Merged and validated configuration
     * @private
     */
    _validateAndMergeConfig(options = {}, defaults = {}) {
        const mergedConfig = { ...defaults, ...options };
        
        if (this.options.enableValidation) {
            this._validateConfiguration(mergedConfig);
        }
        
        return mergedConfig;
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @private
     */
    _validateConfiguration(config) {
        // Validate common configuration properties
        if (config.cacheTimeout && typeof config.cacheTimeout !== 'number') {
            throw new Error('cacheTimeout must be a number');
        }
        
        if (config.maxSize && typeof config.maxSize !== 'number') {
            throw new Error('maxSize must be a number');
        }
        
        if (config.enableCaching && typeof config.enableCaching !== 'boolean') {
            throw new Error('enableCaching must be a boolean');
        }
        
        if (config.enablePooling && typeof config.enablePooling !== 'boolean') {
            throw new Error('enablePooling must be a boolean');
        }
    }

    /**
     * Create manager with performance monitoring
     * @param {Object} core - Core instance
     * @param {Object} options - Configuration options
     * @returns {Object} Created manager instance
     */
    async createManager(core, options = {}) {
        const startTime = performance.now();
        
        try {
            this._validateCore(core);
            
            const config = this._validateAndMergeConfig(options, this._getDefaultConfig());
            
            const manager = await this._createManagerInstance(core, config);
            
            const creationTime = performance.now() - startTime;
            this._updatePerformanceStats(creationTime);
            
            this.stats.created++;
            this.logger.info(`${this.loggerName}: Created ${this.managerType} manager in ${creationTime.toFixed(2)}ms`);
            
            return this._wrapManagerWithConvenienceMethods(manager, config);
            
        } catch (error) {
            this.stats.errors++;
            this.logger.error(`${this.loggerName}: Failed to create ${this.managerType} manager:`, error);
            
            if (this.options.enableErrorRecovery) {
                return this._createFallbackManager(core, options);
            }
            
            throw error;
        }
    }

    /**
     * Create the actual manager instance (to be implemented by subclasses)
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        throw new Error('_createManagerInstance must be implemented by subclass');
    }

    /**
     * Get default configuration for this manager type
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            enableCaching: true,
            enablePooling: true,
            maxSize: 100,
            cacheTimeout: 5 * 60 * 1000, // 5 minutes
            enablePerformanceOptimizations: true
        };
    }

    /**
     * Wrap manager with convenience methods
     * @param {Object} manager - Manager instance
     * @param {Object} config - Configuration used
     * @returns {Object} Manager with convenience methods
     * @private
     */
    _wrapManagerWithConvenienceMethods(manager, config) {
        const wrapped = {
            ...manager,
            
            // Common convenience methods
            clearCache: () => {
                if (manager.clearCache) {
                    return manager.clearCache();
                }
                this.logger.warn(`${this.loggerName}: clearCache method not available on manager`);
            },
            
            getStats: () => {
                if (manager.getStats) {
                    return manager.getStats();
                }
                return this.stats;
            },
            
            destroy: () => {
                if (manager.destroy) {
                    return manager.destroy();
                }
                this.logger.warn(`${this.loggerName}: destroy method not available on manager`);
            },
            
            // Configuration access
            getConfig: () => ({ ...config }),
            
            // Performance monitoring
            getPerformanceStats: () => this.stats.performance,
            
            // Manager metadata
            getManagerType: () => this.managerType,
            getFactoryStats: () => ({ ...this.stats })
        };
        
        return wrapped;
    }

    /**
     * Create fallback manager when primary creation fails
     * @param {Object} core - Core instance
     * @param {Object} options - Original options
     * @returns {Object} Fallback manager
     * @private
     */
    _createFallbackManager(core, options) {
        this.logger.warn(`${this.loggerName}: Creating fallback ${this.managerType} manager`);
        
        // Create minimal fallback manager
        return {
            core,
            isFallback: true,
            clearCache: () => {},
            getStats: () => ({ isFallback: true }),
            destroy: () => {},
            getConfig: () => ({ isFallback: true }),
            getManagerType: () => this.managerType
        };
    }

    /**
     * Update performance statistics
     * @param {number} creationTime - Time taken to create manager
     * @private
     */
    _updatePerformanceStats(creationTime) {
        if (!this.options.enablePerformanceMonitoring) return;
        
        this.stats.performance.totalCreationTime += creationTime;
        this.stats.performance.averageCreationTime = 
            this.stats.performance.totalCreationTime / this.stats.created;
    }

    /**
     * Get factory statistics
     * @returns {Object} Factory statistics
     */
    getStats() {
        return {
            managerType: this.managerType,
            ...this.stats,
            options: { ...this.options }
        };
    }

    /**
     * Reset factory statistics
     */
    resetStats() {
        this.stats = {
            created: 0,
            errors: 0,
            performance: {
                averageCreationTime: 0,
                totalCreationTime: 0
            }
        };
    }

    /**
     * Validate factory configuration
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const errors = [];
        const warnings = [];
        
        if (!this.managerType) {
            errors.push('Manager type is required');
        }
        
        if (this.stats.errors > 0) {
            warnings.push(`${this.stats.errors} creation errors detected`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            stats: this.getStats()
        };
    }

    /**
     * Create factory instance with static method
     * @param {string} managerType - Type of manager
     * @param {Object} options - Factory options
     * @returns {ManagerFactory} Factory instance
     */
    static create(managerType, options = {}) {
        return new ManagerFactory(managerType, options);
    }

    /**
     * Get all supported manager types
     * @returns {Array} Array of supported manager types
     */
    static getSupportedTypes() {
        return ['data', 'cell', 'event', 'filter', 'layout', 'navigation', 'settings'];
    }
}

// Only use named exports
