/**
 * Responsive Configuration Manager
 * 
 * Centralized responsive configuration management for all components.
 * Provides standardized responsive behavior and configuration generation.
 * 
 * @module ResponsiveConfig
 * @version 1.0.0
 * @since 2024-01-01
 */

import { 
    BREAKPOINTS, 
    BREAKPOINT_NAMES, 
    ASPECT_RATIOS,
    getBreakpointName,
    getContainerSize,
    shouldUseTouchInterface,
    shouldEnableAnimations,
    shouldEnableCaching
} from '../../constants/responsive.js';

/**
 * Component type definitions for configuration templates
 */
export const COMPONENT_TYPES = {
    CELL: 'cell',
    EVENT: 'event',
    FILTER: 'filter',
    LAYOUT: 'layout',
    NAVIGATION: 'navigation',
    MODAL: 'modal',
    SETTINGS: 'settings'
};

/**
 * Default configuration templates for each component type
 */
const DEFAULT_CONFIGS = {
    [COMPONENT_TYPES.CELL]: {
        mobile: {
            maxEvents: 2,
            compactMode: true,
            enableTouch: true,
            enableRipple: true,
            showEventCount: false
        },
        tablet: {
            maxEvents: 3,
            compactMode: false,
            enableTouch: true,
            enableRipple: true,
            showEventCount: true
        },
        desktop: {
            maxEvents: 4,
            compactMode: false,
            enableTouch: false,
            enableRipple: false,
            showEventCount: true
        },
        large: {
            maxEvents: 5,
            compactMode: false,
            enableTouch: false,
            enableRipple: false,
            showEventCount: true
        }
    },
    [COMPONENT_TYPES.EVENT]: {
        mobile: {
            showTime: false,
            showLocation: false,
            compact: true,
            enableTouch: true,
            enableRipple: true,
            maxTitleLength: 20
        },
        tablet: {
            showTime: true,
            showLocation: false,
            compact: false,
            enableTouch: true,
            enableRipple: true,
            maxTitleLength: 30
        },
        desktop: {
            showTime: true,
            showLocation: true,
            compact: false,
            enableTouch: false,
            enableRipple: false,
            maxTitleLength: 40
        },
        large: {
            showTime: true,
            showLocation: true,
            compact: false,
            enableTouch: false,
            enableRipple: false,
            maxTitleLength: 50
        }
    },
    [COMPONENT_TYPES.FILTER]: {
        mobile: {
            enableCaching: true,
            maxCacheSize: 50,
            enableAnimations: false,
            showEventCounts: false,
            compactMode: true,
            maxVisibleFilters: 3
        },
        tablet: {
            enableCaching: true,
            maxCacheSize: 100,
            enableAnimations: true,
            showEventCounts: true,
            compactMode: false,
            maxVisibleFilters: 5
        },
        desktop: {
            enableCaching: true,
            maxCacheSize: 150,
            enableAnimations: true,
            showEventCounts: true,
            compactMode: false,
            maxVisibleFilters: 7
        },
        large: {
            enableCaching: true,
            maxCacheSize: 200,
            enableAnimations: true,
            showEventCounts: true,
            compactMode: false,
            maxVisibleFilters: 10
        }
    },
    [COMPONENT_TYPES.LAYOUT]: {
        mobile: {
            breakpoint: 'mobile',
            columns: 1,
            maxEventsPerDay: 2,
            compactMode: true,
            enableGrid: false
        },
        tablet: {
            breakpoint: 'tablet',
            columns: 2,
            maxEventsPerDay: 3,
            compactMode: false,
            enableGrid: true
        },
        desktop: {
            breakpoint: 'desktop',
            columns: 3,
            maxEventsPerDay: 5,
            compactMode: false,
            enableGrid: true
        },
        large: {
            breakpoint: 'large',
            columns: 4,
            maxEventsPerDay: 7,
            compactMode: false,
            enableGrid: true
        }
    }
};

/**
 * Responsive Configuration Class
 * 
 * Manages responsive configuration for components based on container dimensions
 * and component type. Provides standardized responsive behavior across the application.
 */
export class ResponsiveConfig {
    /**
     * Create a new responsive configuration instance
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @param {string} componentType - Type of component (from COMPONENT_TYPES)
     * @param {Object} options - Additional configuration options
     */
    constructor(containerWidth, containerHeight, componentType, options = {}) {
        this.containerWidth = Math.max(0, containerWidth || 0);
        this.containerHeight = Math.max(0, containerHeight || 0);
        this.componentType = componentType;
        this.options = {
            enablePerformanceOptimizations: true,
            enableTouchDetection: true,
            enableAspectRatioCalculation: true,
            ...options
        };
        
        this._validateInputs();
        this._calculateMetrics();
    }

    /**
     * Validate input parameters
     * @private
     */
    _validateInputs() {
        if (typeof this.containerWidth !== 'number' || this.containerWidth < 0) {
            throw new Error('Container width must be a non-negative number');
        }
        
        if (typeof this.containerHeight !== 'number' || this.containerHeight < 0) {
            throw new Error('Container height must be a non-negative number');
        }
        
        if (!Object.values(COMPONENT_TYPES).includes(this.componentType)) {
            throw new Error(`Invalid component type: ${this.componentType}`);
        }
    }

    /**
     * Calculate responsive metrics
     * @private
     */
    _calculateMetrics() {
        this.breakpoint = getBreakpointName(this.containerWidth);
        this.containerSize = getContainerSize(this.containerWidth);
        this.aspectRatio = this.containerWidth / this.containerHeight;
        this.isTouchDevice = this.options.enableTouchDetection ? 
            shouldUseTouchInterface(this.containerWidth) : false;
        this.shouldEnableAnimations = this.options.enablePerformanceOptimizations ?
            shouldEnableAnimations(this.containerWidth) : true;
        this.shouldEnableCaching = this.options.enablePerformanceOptimizations ?
            shouldEnableCaching(this.containerWidth) : true;
    }

    /**
     * Get the current breakpoint name
     * @returns {string} Breakpoint name (mobile, tablet, desktop, large)
     */
    getBreakpoint() {
        return this.breakpoint;
    }

    /**
     * Get the container size category
     * @returns {string} Container size category (small, medium, large, xlarge)
     */
    getContainerSize() {
        return this.containerSize;
    }

    /**
     * Get the aspect ratio of the container
     * @returns {number} Aspect ratio (width / height)
     */
    getAspectRatio() {
        return this.aspectRatio;
    }

    /**
     * Check if touch interface should be used
     * @returns {boolean} True if touch interface should be used
     */
    isTouchInterface() {
        return this.isTouchDevice;
    }

    /**
     * Get the complete responsive configuration for the component
     * @param {Object} overrides - Optional configuration overrides
     * @returns {Object} Complete responsive configuration
     */
    getConfiguration(overrides = {}) {
        const baseConfig = this._getBaseConfiguration();
        const performanceConfig = this._getPerformanceConfiguration();
        const touchConfig = this._getTouchConfiguration();
        
        return {
            ...baseConfig,
            ...performanceConfig,
            ...touchConfig,
            ...overrides,
            // Metadata
            breakpoint: this.breakpoint,
            containerSize: this.containerSize,
            aspectRatio: this.aspectRatio,
            isTouchDevice: this.isTouchDevice,
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            componentType: this.componentType
        };
    }

    /**
     * Get base configuration for the component type and breakpoint
     * @private
     * @returns {Object} Base configuration
     */
    _getBaseConfiguration() {
        const componentConfig = DEFAULT_CONFIGS[this.componentType];
        if (!componentConfig) {
            throw new Error(`No configuration template found for component type: ${this.componentType}`);
        }
        
        const breakpointConfig = componentConfig[this.breakpoint];
        if (!breakpointConfig) {
            throw new Error(`No configuration found for breakpoint: ${this.breakpoint}`);
        }
        
        return { ...breakpointConfig };
    }

    /**
     * Get performance-related configuration
     * @private
     * @returns {Object} Performance configuration
     */
    _getPerformanceConfiguration() {
        return {
            enableAnimations: this.shouldEnableAnimations,
            enableCaching: this.shouldEnableCaching,
            enableLazyLoading: this.containerWidth < BREAKPOINTS.DESKTOP,
            enableVirtualization: this.containerWidth < BREAKPOINTS.TABLET
        };
    }

    /**
     * Get touch-related configuration
     * @private
     * @returns {Object} Touch configuration
     */
    _getTouchConfiguration() {
        return {
            enableTouch: this.isTouchDevice,
            enableRipple: this.isTouchDevice,
            touchTargetSize: this.isTouchDevice ? 44 : 32,
            enableSwipeGestures: this.isTouchDevice,
            enablePinchZoom: this.isTouchDevice
        };
    }

    /**
     * Validate the current configuration
     * @returns {Object} Validation result with errors and warnings
     */
    validateConfiguration() {
        const errors = [];
        const warnings = [];
        
        // Check for minimum container size
        if (this.containerWidth < 320) {
            errors.push('Container width is too small for responsive layout');
        }
        
        if (this.containerHeight < 240) {
            errors.push('Container height is too small for responsive layout');
        }
        
        // Check for extreme aspect ratios
        if (this.aspectRatio < 0.5 || this.aspectRatio > 3.0) {
            warnings.push('Extreme aspect ratio may affect layout quality');
        }
        
        // Check for missing configuration template
        if (!DEFAULT_CONFIGS[this.componentType]) {
            errors.push(`No configuration template found for component type: ${this.componentType}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            breakpoint: this.breakpoint,
            containerSize: this.containerSize
        };
    }

    /**
     * Create a responsive configuration instance with static method
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @param {string} componentType - Type of component
     * @param {Object} options - Additional options
     * @returns {ResponsiveConfig} New responsive configuration instance
     */
    static create(containerWidth, containerHeight, componentType, options = {}) {
        return new ResponsiveConfig(containerWidth, containerHeight, componentType, options);
    }

    /**
     * Get all available component types
     * @returns {Array} Array of available component types
     */
    static getComponentTypes() {
        return Object.values(COMPONENT_TYPES);
    }

    /**
     * Get all available breakpoints
     * @returns {Array} Array of available breakpoints
     */
    static getBreakpoints() {
        return Object.values(BREAKPOINT_NAMES);
    }
}

export default ResponsiveConfig;
