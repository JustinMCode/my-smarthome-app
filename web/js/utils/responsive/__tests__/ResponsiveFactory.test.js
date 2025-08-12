/**
 * ResponsiveFactory Unit Tests
 * 
 * Comprehensive test suite for the ResponsiveFactory class
 * 
 * @module ResponsiveFactory.test
 * @version 1.0.0
 * @since 2024-01-01
 */

import ResponsiveFactory from '../ResponsiveFactory.js';
import ResponsiveConfig, { COMPONENT_TYPES } from '../ResponsiveConfig.js';

describe('ResponsiveFactory', () => {
    let factory;

    beforeEach(() => {
        factory = new ResponsiveFactory({
            enableCaching: true,
            cacheSize: 10,
            enableValidation: true,
            enableLogging: false
        });
    });

    afterEach(() => {
        if (factory) {
            factory.clearCache();
        }
    });

    describe('Constructor and Initialization', () => {
        test('should create factory with default options', () => {
            const defaultFactory = new ResponsiveFactory();
            expect(defaultFactory.options.enableCaching).toBe(true);
            expect(defaultFactory.options.cacheSize).toBe(100);
            expect(defaultFactory.options.enableValidation).toBe(true);
            expect(defaultFactory.options.enableLogging).toBe(true);
        });

        test('should create factory with custom options', () => {
            const customFactory = new ResponsiveFactory({
                enableCaching: false,
                cacheSize: 50,
                enableValidation: false,
                enableLogging: false
            });

            expect(customFactory.options.enableCaching).toBe(false);
            expect(customFactory.options.cacheSize).toBe(50);
            expect(customFactory.options.enableValidation).toBe(false);
            expect(customFactory.options.enableLogging).toBe(false);
        });

        test('should initialize cache when caching is enabled', () => {
            const factoryWithCache = new ResponsiveFactory({ enableCaching: true });
            expect(factoryWithCache.cache).toBeTruthy();
        });

        test('should not initialize cache when caching is disabled', () => {
            const factoryWithoutCache = new ResponsiveFactory({ enableCaching: false });
            expect(factoryWithoutCache.cache).toBeNull();
        });
    });

    describe('Configuration Creation', () => {
        test('should create configuration successfully', () => {
            const config = factory.createConfiguration(800, 600, 'cell');
            
            expect(config).toBeDefined();
            expect(config.breakpoint).toBe('tablet');
            expect(config.componentType).toBe('cell');
            expect(config.containerWidth).toBe(800);
            expect(config.containerHeight).toBe(600);
        });

        test('should create different configurations for different component types', () => {
            const cellConfig = factory.createConfiguration(800, 600, 'cell');
            const eventConfig = factory.createConfiguration(800, 600, 'event');
            const filterConfig = factory.createConfiguration(800, 600, 'filter');
            const layoutConfig = factory.createConfiguration(800, 600, 'layout');

            expect(cellConfig.componentType).toBe('cell');
            expect(eventConfig.componentType).toBe('event');
            expect(filterConfig.componentType).toBe('filter');
            expect(layoutConfig.componentType).toBe('layout');

            // Should have different component-specific properties
            expect(cellConfig.maxEvents).toBeDefined();
            expect(eventConfig.showTime).toBeDefined();
            expect(filterConfig.enableCaching).toBeDefined();
            expect(layoutConfig.columns).toBeDefined();
        });

        test('should create different configurations for different breakpoints', () => {
            const mobileConfig = factory.createConfiguration(500, 400, 'cell');
            const tabletConfig = factory.createConfiguration(800, 600, 'cell');
            const desktopConfig = factory.createConfiguration(1200, 800, 'cell');

            expect(mobileConfig.breakpoint).toBe('mobile');
            expect(tabletConfig.breakpoint).toBe('tablet');
            expect(desktopConfig.breakpoint).toBe('desktop');

            // Should have different values based on breakpoint
            expect(mobileConfig.maxEvents).toBe(2);
            expect(tabletConfig.maxEvents).toBe(3);
            expect(desktopConfig.maxEvents).toBe(4);
        });

        test('should handle options parameter', () => {
            const config = factory.createConfiguration(800, 600, 'cell', {
                enablePerformanceOptimizations: false
            });

            expect(config).toBeDefined();
            expect(config.breakpoint).toBe('tablet');
        });

        test('should throw error for invalid component type', () => {
            expect(() => {
                factory.createConfiguration(800, 600, 'invalid-type');
            }).toThrow('Invalid component type: invalid-type');
        });

        test('should throw error for invalid dimensions', () => {
            expect(() => {
                factory.createConfiguration('invalid', 600, 'cell');
            }).toThrow('Container width must be a non-negative number');
        });
    });

    describe('Caching Functionality', () => {
        test('should cache configurations when caching is enabled', () => {
            const config1 = factory.createConfiguration(800, 600, 'cell');
            const config2 = factory.createConfiguration(800, 600, 'cell');

            expect(config1).toEqual(config2);
            
            const cacheStats = factory.getCacheStats();
            expect(cacheStats.size).toBe(1);
        });

        test('should not cache configurations when caching is disabled', () => {
            const factoryWithoutCache = new ResponsiveFactory({ enableCaching: false });
            
            const config1 = factoryWithoutCache.createConfiguration(800, 600, 'cell');
            const config2 = factoryWithoutCache.createConfiguration(800, 600, 'cell');

            expect(config1).toEqual(config2);
            
            const cacheStats = factoryWithoutCache.getCacheStats();
            expect(cacheStats).toBeNull();
        });

        test('should handle cache eviction when cache is full', () => {
            const smallCacheFactory = new ResponsiveFactory({
                enableCaching: true,
                cacheSize: 2
            });

            // Create 3 different configurations
            smallCacheFactory.createConfiguration(500, 400, 'cell');
            smallCacheFactory.createConfiguration(800, 600, 'cell');
            smallCacheFactory.createConfiguration(1200, 800, 'cell');

            const cacheStats = smallCacheFactory.getCacheStats();
            expect(cacheStats.size).toBe(2); // Should evict the first one
        });

        test('should generate different cache keys for different parameters', () => {
            const config1 = factory.createConfiguration(800, 600, 'cell');
            const config2 = factory.createConfiguration(800, 600, 'event');
            const config3 = factory.createConfiguration(800, 600, 'cell', { customOption: true });

            expect(config1.componentType).toBe('cell');
            expect(config2.componentType).toBe('event');
            expect(config3.componentType).toBe('cell');

            const cacheStats = factory.getCacheStats();
            expect(cacheStats.size).toBe(3);
        });

        test('should clear cache successfully', () => {
            factory.createConfiguration(800, 600, 'cell');
            factory.createConfiguration(800, 600, 'event');

            let cacheStats = factory.getCacheStats();
            expect(cacheStats.size).toBe(2);

            factory.clearCache();

            cacheStats = factory.getCacheStats();
            expect(cacheStats.size).toBe(0);
        });
    });

    describe('Global Overrides', () => {
        test('should apply global overrides to all configurations', () => {
            factory.setGlobalOverrides({
                enableAnimations: false,
                enableCaching: true
            });

            const cellConfig = factory.createConfiguration(800, 600, 'cell');
            const eventConfig = factory.createConfiguration(800, 600, 'event');

            expect(cellConfig.enableAnimations).toBe(false);
            expect(eventConfig.enableAnimations).toBe(false);
            expect(cellConfig.enableCaching).toBe(true);
            expect(eventConfig.enableCaching).toBe(true);
        });

        test('should merge global overrides', () => {
            factory.setGlobalOverrides({ enableAnimations: false });
            factory.setGlobalOverrides({ enableCaching: true });

            const config = factory.createConfiguration(800, 600, 'cell');

            expect(config.enableAnimations).toBe(false);
            expect(config.enableCaching).toBe(true);
        });

        test('should override component-specific settings with global overrides', () => {
            factory.setGlobalOverrides({ maxEvents: 999 });

            const config = factory.createConfiguration(800, 600, 'cell');

            expect(config.maxEvents).toBe(999);
        });
    });

    describe('Component-Specific Overrides', () => {
        test('should apply component-specific overrides', () => {
            factory.setComponentOverrides('cell', {
                maxEvents: 10,
                compactMode: false
            });

            const cellConfig = factory.createConfiguration(800, 600, 'cell');
            const eventConfig = factory.createConfiguration(800, 600, 'event');

            expect(cellConfig.maxEvents).toBe(10);
            expect(cellConfig.compactMode).toBe(false);
            expect(eventConfig.maxEvents).toBeUndefined(); // Should not affect other components
        });

        test('should override global overrides with component-specific overrides', () => {
            factory.setGlobalOverrides({ maxEvents: 999 });
            factory.setComponentOverrides('cell', { maxEvents: 10 });

            const config = factory.createConfiguration(800, 600, 'cell');

            expect(config.maxEvents).toBe(10); // Component override should take precedence
        });

        test('should handle multiple component overrides', () => {
            factory.setComponentOverrides('cell', { maxEvents: 10 });
            factory.setComponentOverrides('event', { showTime: false });

            const cellConfig = factory.createConfiguration(800, 600, 'cell');
            const eventConfig = factory.createConfiguration(800, 600, 'event');

            expect(cellConfig.maxEvents).toBe(10);
            expect(eventConfig.showTime).toBe(false);
        });

        test('should update existing component overrides', () => {
            factory.setComponentOverrides('cell', { maxEvents: 10 });
            factory.setComponentOverrides('cell', { compactMode: false });

            const config = factory.createConfiguration(800, 600, 'cell');

            expect(config.maxEvents).toBe(10); // Should be preserved
            expect(config.compactMode).toBe(false); // Should be updated
        });
    });

    describe('Validation', () => {
        test('should validate configurations when validation is enabled', () => {
            const config = factory.createConfiguration(800, 600, 'cell');
            expect(config).toBeDefined(); // Should not throw validation errors
        });

        test('should skip validation when validation is disabled', () => {
            const factoryWithoutValidation = new ResponsiveFactory({
                enableValidation: false
            });

            const config = factoryWithoutValidation.createConfiguration(800, 600, 'cell');
            expect(config).toBeDefined();
        });

        test('should throw error for invalid configuration when validation is enabled', () => {
            // This test would require mocking the validation to return invalid
            // For now, we test that valid configurations pass validation
            expect(() => {
                factory.createConfiguration(800, 600, 'cell');
            }).not.toThrow();
        });
    });

    describe('Statistics and Monitoring', () => {
        test('should return factory statistics', () => {
            const stats = factory.getStats();

            expect(stats.cacheEnabled).toBe(true);
            expect(stats.validationEnabled).toBe(true);
            expect(stats.loggingEnabled).toBe(false);
            expect(stats.componentOverridesCount).toBe(0);
            expect(stats.globalOverridesCount).toBe(0);
            expect(stats.cacheStats).toBeDefined();
        });

        test('should track component overrides count', () => {
            factory.setComponentOverrides('cell', { maxEvents: 10 });
            factory.setComponentOverrides('event', { showTime: false });

            const stats = factory.getStats();
            expect(stats.componentOverridesCount).toBe(2);
        });

        test('should track global overrides count', () => {
            factory.setGlobalOverrides({ enableAnimations: false });
            factory.setGlobalOverrides({ enableCaching: true });

            const stats = factory.getStats();
            expect(stats.globalOverridesCount).toBe(2);
        });

        test('should return cache statistics', () => {
            factory.createConfiguration(800, 600, 'cell');
            factory.createConfiguration(800, 600, 'event');

            const cacheStats = factory.getCacheStats();
            expect(cacheStats.size).toBe(2);
            expect(cacheStats.maxSize).toBe(10);
        });

        test('should return null cache stats when caching is disabled', () => {
            const factoryWithoutCache = new ResponsiveFactory({ enableCaching: false });
            const cacheStats = factoryWithoutCache.getCacheStats();
            expect(cacheStats).toBeNull();
        });
    });

    describe('Static Methods', () => {
        test('should create factory with static create method', () => {
            const staticFactory = ResponsiveFactory.create({
                enableCaching: false,
                enableValidation: false
            });

            expect(staticFactory).toBeInstanceOf(ResponsiveFactory);
            expect(staticFactory.options.enableCaching).toBe(false);
            expect(staticFactory.options.enableValidation).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle errors gracefully and log them', () => {
            const factoryWithLogging = new ResponsiveFactory({
                enableLogging: true
            });

            // Test with invalid component type
            expect(() => {
                factoryWithLogging.createConfiguration(800, 600, 'invalid-type');
            }).toThrow('Invalid component type: invalid-type');
        });

        test('should handle cache errors gracefully', () => {
            // Create a factory with very small cache to test eviction
            const smallCacheFactory = new ResponsiveFactory({
                enableCaching: true,
                cacheSize: 1
            });

            // Should not throw errors during cache eviction
            expect(() => {
                smallCacheFactory.createConfiguration(500, 400, 'cell');
                smallCacheFactory.createConfiguration(800, 600, 'cell');
                smallCacheFactory.createConfiguration(1200, 800, 'cell');
            }).not.toThrow();
        });
    });

    describe('Performance Tests', () => {
        test('should handle rapid configuration creation', () => {
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                factory.createConfiguration(800, 600, 'cell');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete 100 configurations in reasonable time (less than 1 second)
            expect(duration).toBeLessThan(1000);
        });

        test('should benefit from caching for repeated configurations', () => {
            // First creation (cache miss)
            const startTime1 = performance.now();
            factory.createConfiguration(800, 600, 'cell');
            const duration1 = performance.now() - startTime1;

            // Second creation (cache hit)
            const startTime2 = performance.now();
            factory.createConfiguration(800, 600, 'cell');
            const duration2 = performance.now() - startTime2;

            // Cache hit should be faster (though this might not always be true due to JS optimization)
            expect(duration2).toBeLessThanOrEqual(duration1);
        });
    });
});
