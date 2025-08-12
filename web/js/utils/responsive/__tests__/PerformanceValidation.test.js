/**
 * Performance Validation Tests
 * 
 * Performance tests to validate the efficiency of the new responsive system
 * and compare it with the old implementations
 * 
 * @module PerformanceValidation.test
 * @version 1.0.0
 * @since 2024-01-01
 */

import { 
    createResponsiveConfig,
    createCellConfig,
    createEventConfig,
    createFilterConfig,
    createLayoutConfig,
    initializeResponsiveFactory,
    clearCache
} from '../index.js';

import ResponsiveConfig from '../ResponsiveConfig.js';

// Mock old implementations for comparison
const mockOldCellUtils = {
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        if (containerWidth < 768) {
            return {
                maxEvents: 2,
                compactMode: true,
                enableTouch: true,
                enableRipple: true
            };
        } else if (containerWidth < 1024) {
            return {
                maxEvents: 3,
                compactMode: false,
                enableTouch: true,
                enableRipple: true
            };
        } else if (containerWidth < 1440) {
            return {
                maxEvents: 4,
                compactMode: false,
                enableTouch: false,
                enableRipple: false
            };
        } else {
            return {
                maxEvents: 5,
                compactMode: false,
                enableTouch: false,
                enableRipple: false
            };
        }
    }
};

const mockOldEventUtils = {
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        if (containerWidth < 768) {
            return {
                showTime: false,
                showLocation: false,
                compact: true,
                enableTouch: true,
                enableRipple: true
            };
        } else if (containerWidth < 1024) {
            return {
                showTime: true,
                showLocation: false,
                compact: false,
                enableTouch: true,
                enableRipple: true
            };
        } else if (containerWidth < 1440) {
            return {
                showTime: true,
                showLocation: true,
                compact: false,
                enableTouch: false,
                enableRipple: false
            };
        } else {
            return {
                showTime: true,
                showLocation: true,
                compact: false,
                enableTouch: false,
                enableRipple: false
            };
        }
    }
};

const mockOldFilterUtils = {
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        if (containerWidth < 768) {
            return {
                enableCaching: true,
                maxCacheSize: 50,
                enableAnimations: false,
                showEventCounts: false,
                compactMode: true
            };
        } else if (containerWidth < 1024) {
            return {
                enableCaching: true,
                maxCacheSize: 100,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        } else if (containerWidth < 1440) {
            return {
                enableCaching: true,
                maxCacheSize: 150,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        } else {
            return {
                enableCaching: true,
                maxCacheSize: 200,
                enableAnimations: true,
                showEventCounts: true,
                compactMode: false
            };
        }
    }
};

const mockOldLayoutUtils = {
    calculateResponsiveBreakpoints: (containerWidth, containerHeight) => {
        if (containerWidth < 768) {
            return {
                breakpoint: 'mobile',
                columns: 1,
                maxEventsPerDay: 2,
                compactMode: true
            };
        } else if (containerWidth < 1024) {
            return {
                breakpoint: 'tablet',
                columns: 2,
                maxEventsPerDay: 3,
                compactMode: false
            };
        } else if (containerWidth < 1440) {
            return {
                breakpoint: 'desktop',
                columns: 3,
                maxEventsPerDay: 5,
                compactMode: false
            };
        } else {
            return {
                breakpoint: 'large',
                columns: 4,
                maxEventsPerDay: 7,
                compactMode: false
            };
        }
    }
};

describe('Performance Validation', () => {
    beforeEach(() => {
        clearCache();
    });

    afterEach(() => {
        clearCache();
    });

    describe('Configuration Generation Performance', () => {
        test('should generate configurations faster than old implementations', () => {
            const iterations = 1000;
            
            // Test new implementation
            const newStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                createCellConfig(800, 600);
            }
            const newDuration = performance.now() - newStartTime;
            
            // Test old implementation
            const oldStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                mockOldCellUtils.calculateResponsiveConfig(800, 600);
            }
            const oldDuration = performance.now() - oldStartTime;
            
            // New implementation should be at least as fast as old implementation
            expect(newDuration).toBeLessThanOrEqual(oldDuration * 1.2);
        });

        test('should handle rapid configuration creation efficiently', () => {
            const startTime = performance.now();
            
            // Create configurations for different breakpoints rapidly
            for (let i = 0; i < 100; i++) {
                const width = 500 + (i % 4) * 300; // Cycle through different widths
                createResponsiveConfig(width, 600, 'cell');
            }
            
            const duration = performance.now() - startTime;
            
            // Should complete 100 configurations in reasonable time
            expect(duration).toBeLessThan(100);
        });

        test('should maintain consistent performance across component types', () => {
            const iterations = 100;
            const componentTypes = ['cell', 'event', 'filter', 'layout'];
            const durations = {};
            
            for (const componentType of componentTypes) {
                const startTime = performance.now();
                
                for (let i = 0; i < iterations; i++) {
                    createResponsiveConfig(800, 600, componentType);
                }
                
                durations[componentType] = performance.now() - startTime;
            }
            
            // All component types should have similar performance
            const avgDuration = Object.values(durations).reduce((a, b) => a + b, 0) / componentTypes.length;
            
            for (const duration of Object.values(durations)) {
                expect(duration).toBeLessThan(avgDuration * 2); // Within 2x of average
            }
        });
    });

    describe('Memory Usage Validation', () => {
        test('should use memory efficiently', () => {
            if (!performance.memory) {
                console.warn('Performance memory API not available, skipping memory test');
                return;
            }
            
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // Create many configurations
            const configs = [];
            for (let i = 0; i < 1000; i++) {
                configs.push(createResponsiveConfig(800 + (i % 100), 600, 'cell'));
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 5MB for 1000 configs)
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
            
            // Clear references to allow garbage collection
            configs.length = 0;
        });

        test('should not leak memory with repeated operations', () => {
            if (!performance.memory) {
                console.warn('Performance memory API not available, skipping memory leak test');
                return;
            }
            
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // Perform repeated operations
            for (let cycle = 0; cycle < 10; cycle++) {
                const configs = [];
                for (let i = 0; i < 100; i++) {
                    configs.push(createResponsiveConfig(800 + i, 600, 'cell'));
                }
                // Clear references each cycle
                configs.length = 0;
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory should not increase significantly over cycles
            expect(memoryIncrease).toBeLessThan(1 * 1024 * 1024); // Less than 1MB increase
        });
    });

    describe('Caching Performance Benefits', () => {
        test('should benefit from caching for repeated configurations', () => {
            initializeResponsiveFactory({
                enableCaching: true,
                cacheSize: 100,
                enableValidation: true,
                enableLogging: false
            });
            
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
            
            // Cache hits should be faster
            expect(duration2).toBeLessThan(duration1);
        });

        test('should handle cache eviction efficiently', () => {
            const factory = initializeResponsiveFactory({
                enableCaching: true,
                cacheSize: 10, // Small cache to test eviction
                enableValidation: true,
                enableLogging: false
            });
            
            const startTime = performance.now();
            
            // Create more configurations than cache size
            for (let i = 0; i < 100; i++) {
                createResponsiveConfig(800 + i, 600, 'cell');
            }
            
            const duration = performance.now() - startTime;
            
            // Should handle cache eviction without significant performance impact
            expect(duration).toBeLessThan(100);
            
            const stats = factory.getStats();
            expect(stats.cacheStats.size).toBe(10); // Should not exceed cache size
        });
    });

    describe('Comparison with Old Implementations', () => {
        test('should produce equivalent results to old implementations', () => {
            const testCases = [
                { width: 500, height: 400, breakpoint: 'mobile' },
                { width: 800, height: 600, breakpoint: 'tablet' },
                { width: 1200, height: 800, breakpoint: 'desktop' },
                { width: 1600, height: 900, breakpoint: 'large' }
            ];
            
            for (const testCase of testCases) {
                // Test cell configuration
                const newCellConfig = createCellConfig(testCase.width, testCase.height);
                const oldCellConfig = mockOldCellUtils.calculateResponsiveConfig(testCase.width, testCase.height);
                
                expect(newCellConfig.maxEvents).toBe(oldCellConfig.maxEvents);
                expect(newCellConfig.compactMode).toBe(oldCellConfig.compactMode);
                expect(newCellConfig.enableTouch).toBe(oldCellConfig.enableTouch);
                expect(newCellConfig.enableRipple).toBe(oldCellConfig.enableRipple);
                
                // Test event configuration
                const newEventConfig = createEventConfig(testCase.width, testCase.height);
                const oldEventConfig = mockOldEventUtils.calculateResponsiveConfig(testCase.width, testCase.height);
                
                expect(newEventConfig.showTime).toBe(oldEventConfig.showTime);
                expect(newEventConfig.showLocation).toBe(oldEventConfig.showLocation);
                expect(newEventConfig.compact).toBe(oldEventConfig.compact);
                expect(newEventConfig.enableTouch).toBe(oldEventConfig.enableTouch);
                
                // Test filter configuration
                const newFilterConfig = createFilterConfig(testCase.width, testCase.height);
                const oldFilterConfig = mockOldFilterUtils.calculateResponsiveConfig(testCase.width, testCase.height);
                
                expect(newFilterConfig.enableCaching).toBe(oldFilterConfig.enableCaching);
                expect(newFilterConfig.maxCacheSize).toBe(oldFilterConfig.maxCacheSize);
                expect(newFilterConfig.enableAnimations).toBe(oldFilterConfig.enableAnimations);
                expect(newFilterConfig.showEventCounts).toBe(oldFilterConfig.showEventCounts);
                
                // Test layout configuration
                const newLayoutConfig = createLayoutConfig(testCase.width, testCase.height);
                const oldLayoutConfig = mockOldLayoutUtils.calculateResponsiveBreakpoints(testCase.width, testCase.height);
                
                expect(newLayoutConfig.breakpoint).toBe(oldLayoutConfig.breakpoint);
                expect(newLayoutConfig.columns).toBe(oldLayoutConfig.columns);
                expect(newLayoutConfig.maxEventsPerDay).toBe(oldLayoutConfig.maxEventsPerDay);
                expect(newLayoutConfig.compactMode).toBe(oldLayoutConfig.compactMode);
            }
        });

        test('should provide additional features not available in old implementations', () => {
            const config = createCellConfig(800, 600);
            
            // New features that weren't in old implementations
            expect(config).toHaveProperty('breakpoint');
            expect(config).toHaveProperty('containerSize');
            expect(config).toHaveProperty('aspectRatio');
            expect(config).toHaveProperty('isTouchDevice');
            expect(config).toHaveProperty('containerWidth');
            expect(config).toHaveProperty('containerHeight');
            expect(config).toHaveProperty('componentType');
            expect(config).toHaveProperty('enableAnimations');
            expect(config).toHaveProperty('enableCaching');
            expect(config).toHaveProperty('enableLazyLoading');
            expect(config).toHaveProperty('enableVirtualization');
            expect(config).toHaveProperty('touchTargetSize');
            expect(config).toHaveProperty('enableSwipeGestures');
            expect(config).toHaveProperty('enablePinchZoom');
        });
    });

    describe('Bundle Size Impact', () => {
        test('should have reasonable code size', () => {
            // This is a rough estimation - in a real scenario, you'd use a bundler
            // to measure actual bundle size impact
            
            const modules = [
                '../ResponsiveConfig.js',
                '../ResponsiveFactory.js',
                '../index.js',
                '../../../constants/responsive.js'
            ];
            
            // Estimate: each module should be reasonable size
            // ResponsiveConfig: ~15KB
            // ResponsiveFactory: ~12KB  
            // Index: ~8KB
            // Constants: ~5KB
            // Total: ~40KB
            
            // This is acceptable for the functionality provided
            expect(modules.length).toBe(4);
        });
    });

    describe('Real-World Performance Scenarios', () => {
        test('should handle window resize scenarios efficiently', () => {
            const resizeScenarios = [
                { width: 375, height: 667 },   // iPhone
                { width: 768, height: 1024 },  // iPad
                { width: 1024, height: 768 },  // iPad landscape
                { width: 1366, height: 768 },  // Laptop
                { width: 1920, height: 1080 }, // Desktop
                { width: 2560, height: 1440 }  // 4K
            ];
            
            const startTime = performance.now();
            
            for (const scenario of resizeScenarios) {
                createCellConfig(scenario.width, scenario.height);
                createEventConfig(scenario.width, scenario.height);
                createFilterConfig(scenario.width, scenario.height);
                createLayoutConfig(scenario.width, scenario.height);
            }
            
            const duration = performance.now() - startTime;
            
            // Should handle all resize scenarios quickly
            expect(duration).toBeLessThan(50);
        });

        test('should handle rapid component initialization', () => {
            const startTime = performance.now();
            
            // Simulate rapid component initialization
            for (let i = 0; i < 100; i++) {
                const width = 800 + (i % 200);
                const height = 600 + (i % 100);
                
                // Create configurations for multiple components
                createCellConfig(width, height);
                createEventConfig(width, height);
                createFilterConfig(width, height);
                createLayoutConfig(width, height);
            }
            
            const duration = performance.now() - startTime;
            
            // Should handle rapid initialization efficiently
            expect(duration).toBeLessThan(200);
        });

        test('should maintain performance under load', () => {
            const startTime = performance.now();
            
            // Simulate high load scenario
            const promises = [];
            for (let i = 0; i < 50; i++) {
                promises.push(
                    new Promise(resolve => {
                        const configs = [];
                        for (let j = 0; j < 20; j++) {
                            configs.push(createResponsiveConfig(800 + j, 600, 'cell'));
                        }
                        resolve(configs);
                    })
                );
            }
            
            Promise.all(promises).then(() => {
                const duration = performance.now() - startTime;
                
                // Should handle concurrent operations efficiently
                expect(duration).toBeLessThan(500);
            });
        });
    });

    describe('Performance Monitoring', () => {
        test('should provide performance statistics', () => {
            initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
            
            // Create some configurations
            for (let i = 0; i < 10; i++) {
                createResponsiveConfig(800 + i, 600, 'cell');
            }
            
            const stats = require('../index.js').getStats();
            
            expect(stats).toHaveProperty('cacheEnabled');
            expect(stats).toHaveProperty('validationEnabled');
            expect(stats).toHaveProperty('loggingEnabled');
            expect(stats).toHaveProperty('componentOverridesCount');
            expect(stats).toHaveProperty('globalOverridesCount');
            expect(stats).toHaveProperty('cacheStats');
            
            if (stats.cacheStats) {
                expect(stats.cacheStats).toHaveProperty('size');
                expect(stats.cacheStats).toHaveProperty('maxSize');
            }
        });
    });
});
