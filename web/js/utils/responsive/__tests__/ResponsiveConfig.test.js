/**
 * ResponsiveConfig Unit Tests
 * 
 * Comprehensive test suite for the ResponsiveConfig class
 * 
 * @module ResponsiveConfig.test
 * @version 1.0.0
 * @since 2024-01-01
 */

import ResponsiveConfig, { COMPONENT_TYPES } from '../ResponsiveConfig.js';
import { BREAKPOINTS, BREAKPOINT_NAMES } from '../../../constants/responsive.js';

describe('ResponsiveConfig', () => {
    describe('Constructor and Initialization', () => {
        test('should create instance with valid parameters', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            expect(config).toBeInstanceOf(ResponsiveConfig);
            expect(config.containerWidth).toBe(800);
            expect(config.containerHeight).toBe(600);
            expect(config.componentType).toBe('cell');
        });

        test('should handle zero dimensions', () => {
            const config = new ResponsiveConfig(0, 0, 'cell');
            expect(config.containerWidth).toBe(0);
            expect(config.containerHeight).toBe(0);
        });

        test('should handle negative dimensions by clamping to zero', () => {
            const config = new ResponsiveConfig(-100, -200, 'cell');
            expect(config.containerWidth).toBe(0);
            expect(config.containerHeight).toBe(0);
        });

        test('should throw error for invalid component type', () => {
            expect(() => {
                new ResponsiveConfig(800, 600, 'invalid-type');
            }).toThrow('Invalid component type: invalid-type');
        });

        test('should throw error for non-numeric width', () => {
            expect(() => {
                new ResponsiveConfig('invalid', 600, 'cell');
            }).toThrow('Container width must be a non-negative number');
        });

        test('should throw error for non-numeric height', () => {
            expect(() => {
                new ResponsiveConfig(800, 'invalid', 'cell');
            }).toThrow('Container height must be a non-negative number');
        });
    });

    describe('Breakpoint Detection', () => {
        test('should detect mobile breakpoint correctly', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            expect(config.getBreakpoint()).toBe('mobile');
        });

        test('should detect tablet breakpoint correctly', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            expect(config.getBreakpoint()).toBe('tablet');
        });

        test('should detect desktop breakpoint correctly', () => {
            const config = new ResponsiveConfig(1200, 800, 'cell');
            expect(config.getBreakpoint()).toBe('desktop');
        });

        test('should detect large breakpoint correctly', () => {
            const config = new ResponsiveConfig(1600, 900, 'cell');
            expect(config.getBreakpoint()).toBe('large');
        });

        test('should handle exact breakpoint boundaries', () => {
            const mobileConfig = new ResponsiveConfig(BREAKPOINTS.MOBILE - 1, 600, 'cell');
            const tabletConfig = new ResponsiveConfig(BREAKPOINTS.MOBILE, 600, 'cell');
            
            expect(mobileConfig.getBreakpoint()).toBe('mobile');
            expect(tabletConfig.getBreakpoint()).toBe('tablet');
        });
    });

    describe('Container Size Detection', () => {
        test('should detect small container size', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            expect(config.getContainerSize()).toBe('small');
        });

        test('should detect medium container size', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            expect(config.getContainerSize()).toBe('medium');
        });

        test('should detect large container size', () => {
            const config = new ResponsiveConfig(1200, 800, 'cell');
            expect(config.getContainerSize()).toBe('large');
        });

        test('should detect xlarge container size', () => {
            const config = new ResponsiveConfig(1600, 900, 'cell');
            expect(config.getContainerSize()).toBe('xlarge');
        });
    });

    describe('Aspect Ratio Calculation', () => {
        test('should calculate aspect ratio correctly', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            expect(config.getAspectRatio()).toBe(800 / 600);
        });

        test('should handle zero height gracefully', () => {
            const config = new ResponsiveConfig(800, 0, 'cell');
            expect(config.getAspectRatio()).toBe(Infinity);
        });

        test('should handle zero width gracefully', () => {
            const config = new ResponsiveConfig(0, 600, 'cell');
            expect(config.getAspectRatio()).toBe(0);
        });
    });

    describe('Touch Interface Detection', () => {
        test('should detect touch interface for mobile', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            expect(config.isTouchInterface()).toBe(true);
        });

        test('should detect touch interface for tablet', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            expect(config.isTouchInterface()).toBe(true);
        });

        test('should not detect touch interface for desktop', () => {
            const config = new ResponsiveConfig(1200, 800, 'cell');
            expect(config.isTouchInterface()).toBe(false);
        });

        test('should not detect touch interface for large screens', () => {
            const config = new ResponsiveConfig(1600, 900, 'cell');
            expect(config.isTouchInterface()).toBe(false);
        });
    });

    describe('Configuration Generation', () => {
        test('should generate cell configuration for mobile', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            const result = config.getConfiguration();
            
            expect(result.maxEvents).toBe(2);
            expect(result.compactMode).toBe(true);
            expect(result.enableTouch).toBe(true);
            expect(result.enableRipple).toBe(true);
            expect(result.showEventCount).toBe(false);
            expect(result.breakpoint).toBe('mobile');
            expect(result.isTouchDevice).toBe(true);
        });

        test('should generate cell configuration for tablet', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            
            expect(result.maxEvents).toBe(3);
            expect(result.compactMode).toBe(false);
            expect(result.enableTouch).toBe(true);
            expect(result.enableRipple).toBe(true);
            expect(result.showEventCount).toBe(true);
            expect(result.breakpoint).toBe('tablet');
            expect(result.isTouchDevice).toBe(true);
        });

        test('should generate event configuration for desktop', () => {
            const config = new ResponsiveConfig(1200, 800, 'event');
            const result = config.getConfiguration();
            
            expect(result.showTime).toBe(true);
            expect(result.showLocation).toBe(true);
            expect(result.compact).toBe(false);
            expect(result.enableTouch).toBe(false);
            expect(result.enableRipple).toBe(false);
            expect(result.maxTitleLength).toBe(40);
            expect(result.breakpoint).toBe('desktop');
            expect(result.isTouchDevice).toBe(false);
        });

        test('should generate filter configuration for large screens', () => {
            const config = new ResponsiveConfig(1600, 900, 'filter');
            const result = config.getConfiguration();
            
            expect(result.enableCaching).toBe(true);
            expect(result.maxCacheSize).toBe(200);
            expect(result.enableAnimations).toBe(true);
            expect(result.showEventCounts).toBe(true);
            expect(result.compactMode).toBe(false);
            expect(result.maxVisibleFilters).toBe(10);
            expect(result.breakpoint).toBe('large');
        });

        test('should generate layout configuration with correct properties', () => {
            const config = new ResponsiveConfig(800, 600, 'layout');
            const result = config.getConfiguration();
            
            expect(result.breakpoint).toBe('tablet');
            expect(result.columns).toBe(2);
            expect(result.maxEventsPerDay).toBe(3);
            expect(result.compactMode).toBe(false);
            expect(result.enableGrid).toBe(true);
        });

        test('should apply configuration overrides', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const overrides = { maxEvents: 10, compactMode: false };
            const result = config.getConfiguration(overrides);
            
            expect(result.maxEvents).toBe(10);
            expect(result.compactMode).toBe(false);
            expect(result.enableTouch).toBe(true); // Original value preserved
        });

        test('should include metadata in configuration', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            
            expect(result.breakpoint).toBe('tablet');
            expect(result.containerSize).toBe('medium');
            expect(result.aspectRatio).toBe(800 / 600);
            expect(result.isTouchDevice).toBe(true);
            expect(result.containerWidth).toBe(800);
            expect(result.containerHeight).toBe(600);
            expect(result.componentType).toBe('cell');
        });
    });

    describe('Configuration Validation', () => {
        test('should validate valid configuration', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const validation = config.validateConfiguration();
            
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
            expect(validation.breakpoint).toBe('tablet');
            expect(validation.containerSize).toBe('medium');
        });

        test('should detect too small container width', () => {
            const config = new ResponsiveConfig(200, 600, 'cell');
            const validation = config.validateConfiguration();
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Container width is too small for responsive layout');
        });

        test('should detect too small container height', () => {
            const config = new ResponsiveConfig(800, 100, 'cell');
            const validation = config.validateConfiguration();
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Container height is too small for responsive layout');
        });

        test('should warn about extreme aspect ratios', () => {
            const config = new ResponsiveConfig(2000, 400, 'cell'); // 5:1 ratio
            const validation = config.validateConfiguration();
            
            expect(validation.isValid).toBe(true);
            expect(validation.warnings).toContain('Extreme aspect ratio may affect layout quality');
        });

        test('should warn about very tall containers', () => {
            const config = new ResponsiveConfig(400, 2000, 'cell'); // 1:5 ratio
            const validation = config.validateConfiguration();
            
            expect(validation.isValid).toBe(true);
            expect(validation.warnings).toContain('Extreme aspect ratio may affect layout quality');
        });
    });

    describe('Static Methods', () => {
        test('should create instance with static create method', () => {
            const config = ResponsiveConfig.create(800, 600, 'cell');
            expect(config).toBeInstanceOf(ResponsiveConfig);
            expect(config.containerWidth).toBe(800);
            expect(config.containerHeight).toBe(600);
            expect(config.componentType).toBe('cell');
        });

        test('should return all component types', () => {
            const types = ResponsiveConfig.getComponentTypes();
            expect(types).toContain('cell');
            expect(types).toContain('event');
            expect(types).toContain('filter');
            expect(types).toContain('layout');
            expect(types).toContain('navigation');
            expect(types).toContain('modal');
            expect(types).toContain('settings');
        });

        test('should return all breakpoints', () => {
            const breakpoints = ResponsiveConfig.getBreakpoints();
            expect(breakpoints).toContain('mobile');
            expect(breakpoints).toContain('tablet');
            expect(breakpoints).toContain('desktop');
            expect(breakpoints).toContain('large');
        });
    });

    describe('Performance Configuration', () => {
        test('should include performance settings in configuration', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            
            expect(result).toHaveProperty('enableAnimations');
            expect(result).toHaveProperty('enableCaching');
            expect(result).toHaveProperty('enableLazyLoading');
            expect(result).toHaveProperty('enableVirtualization');
        });

        test('should disable animations for mobile', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            const result = config.getConfiguration();
            expect(result.enableAnimations).toBe(false);
        });

        test('should enable animations for tablet and above', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            expect(result.enableAnimations).toBe(true);
        });

        test('should enable caching for tablet and above', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            expect(result.enableCaching).toBe(true);
        });

        test('should disable caching for mobile', () => {
            const config = new ResponsiveConfig(500, 400, 'cell');
            const result = config.getConfiguration();
            expect(result.enableCaching).toBe(false);
        });
    });

    describe('Touch Configuration', () => {
        test('should include touch settings in configuration', () => {
            const config = new ResponsiveConfig(800, 600, 'cell');
            const result = config.getConfiguration();
            
            expect(result).toHaveProperty('enableTouch');
            expect(result).toHaveProperty('enableRipple');
            expect(result).toHaveProperty('touchTargetSize');
            expect(result).toHaveProperty('enableSwipeGestures');
            expect(result).toHaveProperty('enablePinchZoom');
        });

        test('should set larger touch targets for touch devices', () => {
            const touchConfig = new ResponsiveConfig(500, 400, 'cell');
            const desktopConfig = new ResponsiveConfig(1200, 800, 'cell');
            
            const touchResult = touchConfig.getConfiguration();
            const desktopResult = desktopConfig.getConfiguration();
            
            expect(touchResult.touchTargetSize).toBe(44);
            expect(desktopResult.touchTargetSize).toBe(32);
        });

        test('should enable touch features for mobile and tablet', () => {
            const mobileConfig = new ResponsiveConfig(500, 400, 'cell');
            const tabletConfig = new ResponsiveConfig(800, 600, 'cell');
            
            const mobileResult = mobileConfig.getConfiguration();
            const tabletResult = tabletConfig.getConfiguration();
            
            expect(mobileResult.enableTouch).toBe(true);
            expect(mobileResult.enableRipple).toBe(true);
            expect(mobileResult.enableSwipeGestures).toBe(true);
            expect(mobileResult.enablePinchZoom).toBe(true);
            
            expect(tabletResult.enableTouch).toBe(true);
            expect(tabletResult.enableRipple).toBe(true);
            expect(tabletResult.enableSwipeGestures).toBe(true);
            expect(tabletResult.enablePinchZoom).toBe(true);
        });

        test('should disable touch features for desktop and large screens', () => {
            const desktopConfig = new ResponsiveConfig(1200, 800, 'cell');
            const largeConfig = new ResponsiveConfig(1600, 900, 'cell');
            
            const desktopResult = desktopConfig.getConfiguration();
            const largeResult = largeConfig.getConfiguration();
            
            expect(desktopResult.enableTouch).toBe(false);
            expect(desktopResult.enableRipple).toBe(false);
            expect(desktopResult.enableSwipeGestures).toBe(false);
            expect(desktopResult.enablePinchZoom).toBe(false);
            
            expect(largeResult.enableTouch).toBe(false);
            expect(largeResult.enableRipple).toBe(false);
            expect(largeResult.enableSwipeGestures).toBe(false);
            expect(largeResult.enablePinchZoom).toBe(false);
        });
    });
});
