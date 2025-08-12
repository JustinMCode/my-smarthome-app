/**
 * Responsive Integration Tests
 * 
 * Integration tests for the complete responsive configuration system
 * 
 * @module ResponsiveIntegration.test
 * @version 1.0.0
 * @since 2024-01-01
 */

import { 
    initializeResponsiveFactory, 
    createResponsiveConfig,
    createCellConfig,
    createEventConfig,
    createFilterConfig,
    createLayoutConfig,
    setGlobalOverrides,
    setComponentOverrides,
    clearCache,
    getStats,
    getResponsiveFactory
} from '../index.js';

import ResponsiveConfig, { COMPONENT_TYPES } from '../ResponsiveConfig.js';
import ResponsiveFactory from '../ResponsiveFactory.js';

describe('Responsive System Integration', () => {
    beforeEach(() => {
        // Clear any existing factory
        clearCache();
    });

    afterEach(() => {
        // Clean up after each test
        clearCache();
    });

    describe('Global Factory Integration', () => {
        test('should initialize global factory successfully', () => {
            const factory = initializeResponsiveFactory({
                enableCaching: true,
                cacheSize: 50,
                enableValidation: true,
                enableLogging: false
            });

            expect(factory).toBeInstanceOf(ResponsiveFactory);
            expect(factory.options.enableCaching).toBe(true);
            expect(factory.options.cacheSize).toBe(50);
        });

        test('should return existing factory on subsequent initializations', () => {
            const factory1 = initializeResponsiveFactory({ enableCaching: true });
            const factory2 = initializeResponsiveFactory({ enableCaching: false });

            expect(factory1).toBe(factory2); // Should be the same instance
            expect(factory1.options.enableCaching).toBe(true); // Should retain original settings
        });

        test('should get global factory instance', () => {
            initializeResponsiveFactory({ enableCaching: true });
            const factory = getResponsiveFactory();

            expect(factory).toBeInstanceOf(ResponsiveFactory);
            expect(factory.options.enableCaching).toBe(true);
        });

        test('should return null when factory not initialized', () => {
            const factory = getResponsiveFactory();
            expect(factory).toBeNull();
        });
    });

    describe('Convenience Functions Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should create cell configurations correctly', () => {
            const config = createCellConfig(800, 600);
            
            expect(config.componentType).toBe('cell');
            expect(config.breakpoint).toBe('tablet');
            expect(config.maxEvents).toBe(3);
            expect(config.compactMode).toBe(false);
            expect(config.enableTouch).toBe(true);
        });

        test('should create event configurations correctly', () => {
            const config = createEventConfig(1200, 800);
            
            expect(config.componentType).toBe('event');
            expect(config.breakpoint).toBe('desktop');
            expect(config.showTime).toBe(true);
            expect(config.showLocation).toBe(true);
            expect(config.compact).toBe(false);
        });

        test('should create filter configurations correctly', () => {
            const config = createFilterConfig(1600, 900);
            
            expect(config.componentType).toBe('filter');
            expect(config.breakpoint).toBe('large');
            expect(config.enableCaching).toBe(true);
            expect(config.maxCacheSize).toBe(200);
            expect(config.enableAnimations).toBe(true);
        });

        test('should create layout configurations correctly', () => {
            const config = createLayoutConfig(500, 400);
            
            expect(config.componentType).toBe('layout');
            expect(config.breakpoint).toBe('mobile');
            expect(config.columns).toBe(1);
            expect(config.maxEventsPerDay).toBe(2);
            expect(config.compactMode).toBe(true);
        });

        test('should handle options in convenience functions', () => {
            const config = createCellConfig(800, 600, { customOption: true });
            
            expect(config.componentType).toBe('cell');
            expect(config.customOption).toBe(true);
        });
    });

    describe('Global Overrides Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should apply global overrides to all configurations', () => {
            setGlobalOverrides({
                enableAnimations: false,
                enableCaching: true
            });

            const cellConfig = createCellConfig(800, 600);
            const eventConfig = createEventConfig(800, 600);
            const filterConfig = createFilterConfig(800, 600);

            expect(cellConfig.enableAnimations).toBe(false);
            expect(eventConfig.enableAnimations).toBe(false);
            expect(filterConfig.enableAnimations).toBe(false);

            expect(cellConfig.enableCaching).toBe(true);
            expect(eventConfig.enableCaching).toBe(true);
            expect(filterConfig.enableCaching).toBe(true);
        });

        test('should merge multiple global overrides', () => {
            setGlobalOverrides({ enableAnimations: false });
            setGlobalOverrides({ enableCaching: true });
            setGlobalOverrides({ customSetting: 'value' });

            const config = createCellConfig(800, 600);

            expect(config.enableAnimations).toBe(false);
            expect(config.enableCaching).toBe(true);
            expect(config.customSetting).toBe('value');
        });

        test('should override component-specific settings', () => {
            setGlobalOverrides({ maxEvents: 999 });

            const config = createCellConfig(800, 600);

            expect(config.maxEvents).toBe(999);
        });
    });

    describe('Component Overrides Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should apply component-specific overrides', () => {
            setComponentOverrides('cell', { maxEvents: 10 });
            setComponentOverrides('event', { showTime: false });

            const cellConfig = createCellConfig(800, 600);
            const eventConfig = createEventConfig(800, 600);

            expect(cellConfig.maxEvents).toBe(10);
            expect(eventConfig.showTime).toBe(false);
        });

        test('should not affect other components', () => {
            setComponentOverrides('cell', { maxEvents: 10 });

            const cellConfig = createCellConfig(800, 600);
            const eventConfig = createEventConfig(800, 600);

            expect(cellConfig.maxEvents).toBe(10);
            expect(eventConfig.maxEvents).toBeUndefined(); // Should not be affected
        });

        test('should override global overrides', () => {
            setGlobalOverrides({ maxEvents: 999 });
            setComponentOverrides('cell', { maxEvents: 10 });

            const config = createCellConfig(800, 600);

            expect(config.maxEvents).toBe(10); // Component override should take precedence
        });
    });

    describe('Caching Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                cacheSize: 10,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should cache configurations across different functions', () => {
            const config1 = createCellConfig(800, 600);
            const config2 = createResponsiveConfig(800, 600, 'cell');

            expect(config1).toEqual(config2);

            const stats = getStats();
            expect(stats.cacheStats.size).toBe(1);
        });

        test('should handle cache eviction', () => {
            // Create more configurations than cache size
            for (let i = 0; i < 15; i++) {
                createResponsiveConfig(800 + i, 600, 'cell');
            }

            const stats = getStats();
            expect(stats.cacheStats.size).toBe(10); // Should not exceed cache size
        });

        test('should clear cache successfully', () => {
            createCellConfig(800, 600);
            createEventConfig(800, 600);

            let stats = getStats();
            expect(stats.cacheStats.size).toBe(2);

            clearCache();

            stats = getStats();
            expect(stats.cacheStats.size).toBe(0);
        });
    });

    describe('Fallback Behavior', () => {
        test('should fallback to direct ResponsiveConfig when factory not initialized', () => {
            const config = createResponsiveConfig(800, 600, 'cell');

            expect(config).toBeDefined();
            expect(config.componentType).toBe('cell');
            expect(config.breakpoint).toBe('tablet');
        });

        test('should work with convenience functions when factory not initialized', () => {
            const cellConfig = createCellConfig(800, 600);
            const eventConfig = createEventConfig(800, 600);

            expect(cellConfig.componentType).toBe('cell');
            expect(eventConfig.componentType).toBe('event');
        });
    });

    describe('Statistics Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should return comprehensive statistics', () => {
            createCellConfig(800, 600);
            setGlobalOverrides({ enableAnimations: false });
            setComponentOverrides('cell', { maxEvents: 10 });

            const stats = getStats();

            expect(stats.cacheEnabled).toBe(true);
            expect(stats.validationEnabled).toBe(true);
            expect(stats.loggingEnabled).toBe(false);
            expect(stats.componentOverridesCount).toBe(1);
            expect(stats.globalOverridesCount).toBe(1);
            expect(stats.cacheStats).toBeDefined();
            expect(stats.cacheStats.size).toBe(1);
        });

        test('should track factory initialization status', () => {
            // Test when factory is not initialized
            clearCache();
            let stats = getStats();
            expect(stats.factoryInitialized).toBe(false);

            // Test when factory is initialized
            initializeResponsiveFactory({ enableCaching: true });
            stats = getStats();
            expect(stats.cacheEnabled).toBe(true);
        });
    });

    describe('Real-World Scenarios', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should handle responsive layout changes', () => {
            // Simulate window resize scenarios
            const mobileConfig = createLayoutConfig(500, 400);
            const tabletConfig = createLayoutConfig(800, 600);
            const desktopConfig = createLayoutConfig(1200, 800);
            const largeConfig = createLayoutConfig(1600, 900);

            expect(mobileConfig.columns).toBe(1);
            expect(tabletConfig.columns).toBe(2);
            expect(desktopConfig.columns).toBe(3);
            expect(largeConfig.columns).toBe(4);
        });

        test('should handle touch vs desktop interactions', () => {
            const touchConfig = createCellConfig(500, 400);
            const desktopConfig = createCellConfig(1200, 800);

            expect(touchConfig.enableTouch).toBe(true);
            expect(touchConfig.enableRipple).toBe(true);
            expect(touchConfig.touchTargetSize).toBe(44);

            expect(desktopConfig.enableTouch).toBe(false);
            expect(desktopConfig.enableRipple).toBe(false);
            expect(desktopConfig.touchTargetSize).toBe(32);
        });

        test('should handle performance optimizations', () => {
            const mobileConfig = createFilterConfig(500, 400);
            const desktopConfig = createFilterConfig(1200, 800);

            expect(mobileConfig.enableAnimations).toBe(false);
            expect(mobileConfig.enableCaching).toBe(false);

            expect(desktopConfig.enableAnimations).toBe(true);
            expect(desktopConfig.enableCaching).toBe(true);
        });

        test('should handle aspect ratio considerations', () => {
            const portraitConfig = createCellConfig(400, 800); // 1:2 ratio
            const landscapeConfig = createCellConfig(1600, 400); // 4:1 ratio
            const squareConfig = createCellConfig(800, 800); // 1:1 ratio

            expect(portraitConfig.aspectRatio).toBe(0.5);
            expect(landscapeConfig.aspectRatio).toBe(4);
            expect(squareConfig.aspectRatio).toBe(1);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle invalid component types gracefully', () => {
            expect(() => {
                createResponsiveConfig(800, 600, 'invalid-type');
            }).toThrow('Invalid component type: invalid-type');
        });

        test('should handle invalid dimensions gracefully', () => {
            expect(() => {
                createResponsiveConfig('invalid', 600, 'cell');
            }).toThrow('Container width must be a non-negative number');
        });

        test('should handle extreme values', () => {
            const tinyConfig = createResponsiveConfig(1, 1, 'cell');
            const hugeConfig = createResponsiveConfig(10000, 10000, 'cell');

            expect(tinyConfig).toBeDefined();
            expect(hugeConfig).toBeDefined();
        });
    });

    describe('Performance Integration', () => {
        beforeEach(() => {
            initializeResponsiveFactory({
                enableCaching: true,
                cacheSize: 100,
                enableValidation: true,
                enableLogging: false
            });
        });

        test('should handle rapid configuration creation efficiently', () => {
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                createResponsiveConfig(800 + i, 600, 'cell');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete 100 configurations in reasonable time
            expect(duration).toBeLessThan(1000);
        });

        test('should benefit from caching in repeated operations', () => {
            // First batch (cache misses)
            const startTime1 = performance.now();
            for (let i = 0; i < 50; i++) {
                createResponsiveConfig(800, 600, 'cell');
            }
            const duration1 = performance.now() - startTime1;

            // Second batch (cache hits)
            const startTime2 = performance.now();
            for (let i = 0; i < 50; i++) {
                createResponsiveConfig(800, 600, 'cell');
            }
            const duration2 = performance.now() - startTime2;

            // Cache hits should be faster or at least not slower
            expect(duration2).toBeLessThanOrEqual(duration1 * 1.5);
        });

        test('should handle memory efficiently', () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create many configurations
            for (let i = 0; i < 1000; i++) {
                createResponsiveConfig(800 + (i % 100), 600, 'cell');
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 10MB for 1000 configs)
            if (performance.memory) {
                expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
            }
        });
    });
});
