/**
 * Responsive Configuration Module - Main Entry Point
 * 
 * Unified API for responsive configuration management across the application.
 * Provides centralized responsive behavior, caching, and validation.
 * 
 * @module ResponsiveUtils
 * @version 1.0.0
 * @since 2024-01-01
 */

// Core responsive configuration
export { default as ResponsiveConfig, COMPONENT_TYPES } from './ResponsiveConfig.js';

// Responsive factory for advanced features
export { default as ResponsiveFactory } from './ResponsiveFactory.js';

// Responsive constants and utilities
export * from '../../constants/responsive.js';

/**
 * Global responsive factory instance for application-wide use
 */
let globalFactory = null;

/**
 * Initialize the global responsive factory
 * @param {Object} options - Factory options
 * @returns {ResponsiveFactory} Global factory instance
 */
export function initializeResponsiveFactory(options = {}) {
    if (!globalFactory) {
        globalFactory = ResponsiveFactory.create(options);
    }
    return globalFactory;
}

/**
 * Get the global responsive factory instance
 * @returns {ResponsiveFactory|null} Global factory instance or null if not initialized
 */
export function getResponsiveFactory() {
    return globalFactory;
}

/**
 * Create a responsive configuration using the global factory
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {string} componentType - Component type
 * @param {Object} options - Additional options
 * @returns {Object} Responsive configuration
 */
export function createResponsiveConfig(containerWidth, containerHeight, componentType, options = {}) {
    if (!globalFactory) {
        // Fallback to direct ResponsiveConfig if factory not initialized
        const ResponsiveConfig = require('./ResponsiveConfig.js').default;
        const config = new ResponsiveConfig(containerWidth, containerHeight, componentType, options);
        return config.getConfiguration();
    }
    
    return globalFactory.createConfiguration(containerWidth, containerHeight, componentType, options);
}

/**
 * Convenience function for creating cell configurations
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {Object} options - Additional options
 * @returns {Object} Cell responsive configuration
 */
export function createCellConfig(containerWidth, containerHeight, options = {}) {
    return createResponsiveConfig(containerWidth, containerHeight, 'cell', options);
}

/**
 * Convenience function for creating event configurations
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {Object} options - Additional options
 * @returns {Object} Event responsive configuration
 */
export function createEventConfig(containerWidth, containerHeight, options = {}) {
    return createResponsiveConfig(containerWidth, containerHeight, 'event', options);
}

/**
 * Convenience function for creating filter configurations
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {Object} options - Additional options
 * @returns {Object} Filter responsive configuration
 */
export function createFilterConfig(containerWidth, containerHeight, options = {}) {
    return createResponsiveConfig(containerWidth, containerHeight, 'filter', options);
}

/**
 * Convenience function for creating layout configurations
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {Object} options - Additional options
 * @returns {Object} Layout responsive configuration
 */
export function createLayoutConfig(containerWidth, containerHeight, options = {}) {
    return createResponsiveConfig(containerWidth, containerHeight, 'layout', options);
}

/**
 * Set global configuration overrides
 * @param {Object} overrides - Global overrides to apply to all configurations
 */
export function setGlobalOverrides(overrides) {
    if (globalFactory) {
        globalFactory.setGlobalOverrides(overrides);
    }
}

/**
 * Set component-specific configuration overrides
 * @param {string} componentType - Component type
 * @param {Object} overrides - Component-specific overrides
 */
export function setComponentOverrides(componentType, overrides) {
    if (globalFactory) {
        globalFactory.setComponentOverrides(componentType, overrides);
    }
}

/**
 * Clear the configuration cache
 */
export function clearCache() {
    if (globalFactory) {
        globalFactory.clearCache();
    }
}

/**
 * Get responsive system statistics
 * @returns {Object} System statistics
 */
export function getStats() {
    if (globalFactory) {
        return globalFactory.getStats();
    }
    return {
        factoryInitialized: false,
        message: 'Responsive factory not initialized'
    };
}

/**
 * Legacy compatibility function for existing code
 * @deprecated Use createResponsiveConfig instead
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {string} componentType - Component type
 * @returns {Object} Responsive configuration
 */
export function calculateResponsiveConfig(containerWidth, containerHeight, componentType) {
    console.warn('calculateResponsiveConfig is deprecated. Use createResponsiveConfig instead.');
    return createResponsiveConfig(containerWidth, containerHeight, componentType);
}

/**
 * Legacy compatibility function for existing code
 * @deprecated Use createLayoutConfig instead
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @returns {Object} Layout responsive configuration
 */
export function calculateResponsiveBreakpoints(containerWidth, containerHeight) {
    console.warn('calculateResponsiveBreakpoints is deprecated. Use createLayoutConfig instead.');
    return createLayoutConfig(containerWidth, containerHeight);
}

// Default export for backward compatibility
export default {
    ResponsiveConfig: require('./ResponsiveConfig.js').default,
    ResponsiveFactory: require('./ResponsiveFactory.js').default,
    createResponsiveConfig,
    createCellConfig,
    createEventConfig,
    createFilterConfig,
    createLayoutConfig,
    setGlobalOverrides,
    setComponentOverrides,
    clearCache,
    getStats,
    initializeResponsiveFactory,
    getResponsiveFactory,
    // Legacy exports
    calculateResponsiveConfig,
    calculateResponsiveBreakpoints
};
