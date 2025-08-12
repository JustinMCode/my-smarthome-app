/**
 * Responsive Breakpoint Constants
 * 
 * Centralized breakpoint definitions for consistent responsive behavior
 * across all components in the application.
 * 
 * @module ResponsiveConstants
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Standard breakpoint values in pixels
 */
export const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440,
    LARGE: 1920
};

/**
 * Breakpoint names for semantic usage
 */
export const BREAKPOINT_NAMES = {
    MOBILE: 'mobile',
    TABLET: 'tablet', 
    DESKTOP: 'desktop',
    LARGE: 'large'
};

/**
 * Aspect ratio thresholds for responsive behavior
 */
export const ASPECT_RATIOS = {
    PORTRAIT: 0.75,    // Height > Width
    SQUARE: 1.0,       // Height = Width
    LANDSCAPE: 1.33,   // Width > Height
    WIDE: 1.77         // 16:9 ratio
};

/**
 * Container size categories
 */
export const CONTAINER_SIZES = {
    SMALL: 'small',    // < 768px
    MEDIUM: 'medium',  // 768px - 1024px
    LARGE: 'large',    // 1024px - 1440px
    XLARGE: 'xlarge'   // > 1440px
};

/**
 * Touch device detection thresholds
 */
export const TOUCH_THRESHOLDS = {
    MIN_TOUCH_SIZE: 44,    // Minimum touch target size in pixels
    MAX_TOUCH_SIZE: 60,    // Maximum touch target size in pixels
    TOUCH_MARGIN: 8        // Touch margin for better UX
};

/**
 * Performance thresholds for responsive optimizations
 */
export const PERFORMANCE_THRESHOLDS = {
    ANIMATION_DISABLE: 768,    // Disable animations below this width
    CACHE_ENABLE: 1024,       // Enable caching above this width
    LAZY_LOAD_DISABLE: 1440   // Disable lazy loading above this width
};

/**
 * Get breakpoint name based on container width
 * @param {number} width - Container width in pixels
 * @returns {string} Breakpoint name
 */
export function getBreakpointName(width) {
    if (width < BREAKPOINTS.MOBILE) {
        return BREAKPOINT_NAMES.MOBILE;
    } else if (width < BREAKPOINTS.TABLET) {
        return BREAKPOINT_NAMES.TABLET;
    } else if (width < BREAKPOINTS.DESKTOP) {
        return BREAKPOINT_NAMES.DESKTOP;
    } else {
        return BREAKPOINT_NAMES.LARGE;
    }
}

/**
 * Get container size category based on width
 * @param {number} width - Container width in pixels
 * @returns {string} Container size category
 */
export function getContainerSize(width) {
    if (width < BREAKPOINTS.MOBILE) {
        return CONTAINER_SIZES.SMALL;
    } else if (width < BREAKPOINTS.TABLET) {
        return CONTAINER_SIZES.MEDIUM;
    } else if (width < BREAKPOINTS.DESKTOP) {
        return CONTAINER_SIZES.LARGE;
    } else {
        return CONTAINER_SIZES.XLARGE;
    }
}

/**
 * Check if device should use touch-optimized interface
 * @param {number} width - Container width in pixels
 * @returns {boolean} True if touch-optimized interface should be used
 */
export function shouldUseTouchInterface(width) {
    return width < BREAKPOINTS.TABLET;
}

/**
 * Check if animations should be enabled
 * @param {number} width - Container width in pixels
 * @returns {boolean} True if animations should be enabled
 */
export function shouldEnableAnimations(width) {
    return width >= PERFORMANCE_THRESHOLDS.ANIMATION_DISABLE;
}

/**
 * Check if caching should be enabled
 * @param {number} width - Container width in pixels
 * @returns {boolean} True if caching should be enabled
 */
export function shouldEnableCaching(width) {
    return width >= PERFORMANCE_THRESHOLDS.CACHE_ENABLE;
}

export default {
    BREAKPOINTS,
    BREAKPOINT_NAMES,
    ASPECT_RATIOS,
    CONTAINER_SIZES,
    TOUCH_THRESHOLDS,
    PERFORMANCE_THRESHOLDS,
    getBreakpointName,
    getContainerSize,
    shouldUseTouchInterface,
    shouldEnableAnimations,
    shouldEnableCaching
};
