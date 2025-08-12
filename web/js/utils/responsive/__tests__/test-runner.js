/**
 * Responsive System Test Runner
 * 
 * Comprehensive test runner for the responsive configuration system
 * 
 * @module ResponsiveTestRunner
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
    getStats
} from '../index.js';

/**
 * Test Results Summary
 */
class TestResults {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.skippedTests = 0;
        this.errors = [];
        this.warnings = [];
        this.performanceMetrics = {};
        this.startTime = Date.now();
    }

    addResult(testName, passed, error = null, warning = null) {
        this.totalTests++;
        
        if (passed) {
            this.passedTests++;
        } else {
            this.failedTests++;
            if (error) {
                this.errors.push({ test: testName, error: error.message || error });
            }
        }
        
        if (warning) {
            this.warnings.push({ test: testName, warning });
        }
    }

    addPerformanceMetric(name, value) {
        this.performanceMetrics[name] = value;
    }

    getSummary() {
        const duration = Date.now() - this.startTime;
        const successRate = (this.passedTests / this.totalTests * 100).toFixed(2);
        
        return {
            totalTests: this.totalTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            skippedTests: this.skippedTests,
            successRate: `${successRate}%`,
            duration: `${duration}ms`,
            errors: this.errors,
            warnings: this.warnings,
            performanceMetrics: this.performanceMetrics
        };
    }
}

/**
 * Responsive System Test Runner
 */
class ResponsiveTestRunner {
    constructor() {
        this.results = new TestResults();
        this.factory = null;
    }

    /**
     * Run all responsive system tests
     */
    async runAllTests() {
        console.log('🚀 Starting Responsive System Test Suite...\n');
        
        try {
            await this.runBasicFunctionalityTests();
            await this.runConfigurationTests();
            await this.runPerformanceTests();
            await this.runIntegrationTests();
            await this.runEdgeCaseTests();
            await this.runComparisonTests();
            
            this.printResults();
            
        } catch (error) {
            console.error('❌ Test runner failed:', error);
            this.results.addResult('TestRunner', false, error);
        }
    }

    /**
     * Test basic functionality
     */
    async runBasicFunctionalityTests() {
        console.log('📋 Running Basic Functionality Tests...');
        
        // Test factory initialization
        try {
            this.factory = initializeResponsiveFactory({
                enableCaching: true,
                enableValidation: true,
                enableLogging: false
            });
            this.results.addResult('Factory Initialization', true);
        } catch (error) {
            this.results.addResult('Factory Initialization', false, error);
        }

        // Test basic configuration creation
        try {
            const config = createCellConfig(800, 600);
            if (config && config.componentType === 'cell' && config.breakpoint === 'tablet') {
                this.results.addResult('Basic Configuration Creation', true);
            } else {
                this.results.addResult('Basic Configuration Creation', false, 'Invalid configuration returned');
            }
        } catch (error) {
            this.results.addResult('Basic Configuration Creation', false, error);
        }

        // Test all component types
        const componentTypes = ['cell', 'event', 'filter', 'layout'];
        for (const type of componentTypes) {
            try {
                const config = createResponsiveConfig(800, 600, type);
                if (config && config.componentType === type) {
                    this.results.addResult(`${type} Configuration`, true);
                } else {
                    this.results.addResult(`${type} Configuration`, false, 'Invalid component type');
                }
            } catch (error) {
                this.results.addResult(`${type} Configuration`, false, error);
            }
        }
    }

    /**
     * Test configuration generation
     */
    async runConfigurationTests() {
        console.log('⚙️  Running Configuration Tests...');
        
        // Test breakpoint detection
        const breakpointTests = [
            { width: 500, height: 400, expected: 'mobile' },
            { width: 800, height: 600, expected: 'tablet' },
            { width: 1200, height: 800, expected: 'desktop' },
            { width: 1600, height: 900, expected: 'large' }
        ];

        for (const test of breakpointTests) {
            try {
                const config = createCellConfig(test.width, test.height);
                if (config.breakpoint === test.expected) {
                    this.results.addResult(`Breakpoint Detection (${test.expected})`, true);
                } else {
                    this.results.addResult(`Breakpoint Detection (${test.expected})`, false, 
                        `Expected ${test.expected}, got ${config.breakpoint}`);
                }
            } catch (error) {
                this.results.addResult(`Breakpoint Detection (${test.expected})`, false, error);
            }
        }

        // Test configuration overrides
        try {
            setGlobalOverrides({ enableAnimations: false });
            const config = createCellConfig(800, 600);
            if (config.enableAnimations === false) {
                this.results.addResult('Global Overrides', true);
            } else {
                this.results.addResult('Global Overrides', false, 'Override not applied');
            }
        } catch (error) {
            this.results.addResult('Global Overrides', false, error);
        }

        // Test component-specific overrides
        try {
            setComponentOverrides('cell', { maxEvents: 10 });
            const config = createCellConfig(800, 600);
            if (config.maxEvents === 10) {
                this.results.addResult('Component Overrides', true);
            } else {
                this.results.addResult('Component Overrides', false, 'Component override not applied');
            }
        } catch (error) {
            this.results.addResult('Component Overrides', false, error);
        }
    }

    /**
     * Test performance characteristics
     */
    async runPerformanceTests() {
        console.log('⚡ Running Performance Tests...');
        
        // Test configuration generation speed
        const startTime = performance.now();
        for (let i = 0; i < 1000; i++) {
            createCellConfig(800, 600);
        }
        const duration = performance.now() - startTime;
        
        this.results.addPerformanceMetric('configGenerationSpeed', duration);
        
        if (duration < 100) {
            this.results.addResult('Configuration Generation Speed', true);
        } else {
            this.results.addResult('Configuration Generation Speed', false, 
                `Too slow: ${duration.toFixed(2)}ms for 1000 configs`);
        }

        // Test caching performance
        try {
            const cacheStartTime = performance.now();
            for (let i = 0; i < 100; i++) {
                createCellConfig(800, 600); // Should use cache
            }
            const cacheDuration = performance.now() - cacheStartTime;
            
            this.results.addPerformanceMetric('cachePerformance', cacheDuration);
            
            if (cacheDuration < duration / 10) {
                this.results.addResult('Caching Performance', true);
            } else {
                this.results.addResult('Caching Performance', false, 
                    `Cache not providing significant benefit: ${cacheDuration.toFixed(2)}ms`);
            }
        } catch (error) {
            this.results.addResult('Caching Performance', false, error);
        }

        // Test memory usage (if available)
        if (performance.memory) {
            const initialMemory = performance.memory.usedJSHeapSize;
            
            const configs = [];
            for (let i = 0; i < 1000; i++) {
                configs.push(createResponsiveConfig(800 + i, 600, 'cell'));
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = finalMemory - initialMemory;
            
            this.results.addPerformanceMetric('memoryUsage', memoryIncrease);
            
            if (memoryIncrease < 5 * 1024 * 1024) { // Less than 5MB
                this.results.addResult('Memory Usage', true);
            } else {
                this.results.addResult('Memory Usage', false, 
                    `High memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            }
            
            // Clear references
            configs.length = 0;
        } else {
            this.results.addResult('Memory Usage', true, null, 'Memory API not available');
        }
    }

    /**
     * Test integration scenarios
     */
    async runIntegrationTests() {
        console.log('🔗 Running Integration Tests...');
        
        // Test real-world scenarios
        const scenarios = [
            { name: 'Mobile Portrait', width: 375, height: 667 },
            { name: 'Tablet Portrait', width: 768, height: 1024 },
            { name: 'Desktop', width: 1366, height: 768 },
            { name: 'Large Desktop', width: 1920, height: 1080 }
        ];

        for (const scenario of scenarios) {
            try {
                const cellConfig = createCellConfig(scenario.width, scenario.height);
                const eventConfig = createEventConfig(scenario.width, scenario.height);
                const filterConfig = createFilterConfig(scenario.width, scenario.height);
                const layoutConfig = createLayoutConfig(scenario.width, scenario.height);

                if (cellConfig && eventConfig && filterConfig && layoutConfig) {
                    this.results.addResult(`Integration Test (${scenario.name})`, true);
                } else {
                    this.results.addResult(`Integration Test (${scenario.name})`, false, 'Missing configurations');
                }
            } catch (error) {
                this.results.addResult(`Integration Test (${scenario.name})`, false, error);
            }
        }

        // Test factory statistics
        try {
            const stats = getStats();
            if (stats && stats.cacheEnabled && stats.validationEnabled) {
                this.results.addResult('Factory Statistics', true);
            } else {
                this.results.addResult('Factory Statistics', false, 'Invalid statistics');
            }
        } catch (error) {
            this.results.addResult('Factory Statistics', false, error);
        }
    }

    /**
     * Test edge cases
     */
    async runEdgeCaseTests() {
        console.log('🔍 Running Edge Case Tests...');
        
        // Test extreme dimensions
        try {
            const tinyConfig = createResponsiveConfig(1, 1, 'cell');
            const hugeConfig = createResponsiveConfig(10000, 10000, 'cell');
            
            if (tinyConfig && hugeConfig) {
                this.results.addResult('Extreme Dimensions', true);
            } else {
                this.results.addResult('Extreme Dimensions', false, 'Failed to handle extreme dimensions');
            }
        } catch (error) {
            this.results.addResult('Extreme Dimensions', false, error);
        }

        // Test zero dimensions
        try {
            const zeroConfig = createResponsiveConfig(0, 0, 'cell');
            if (zeroConfig) {
                this.results.addResult('Zero Dimensions', true);
            } else {
                this.results.addResult('Zero Dimensions', false, 'Failed to handle zero dimensions');
            }
        } catch (error) {
            this.results.addResult('Zero Dimensions', false, error);
        }

        // Test invalid inputs
        try {
            createResponsiveConfig('invalid', 600, 'cell');
            this.results.addResult('Invalid Input Handling', false, 'Should have thrown error');
        } catch (error) {
            this.results.addResult('Invalid Input Handling', true);
        }

        try {
            createResponsiveConfig(800, 600, 'invalid-type');
            this.results.addResult('Invalid Component Type', false, 'Should have thrown error');
        } catch (error) {
            this.results.addResult('Invalid Component Type', true);
        }
    }

    /**
     * Test comparison with old implementations
     */
    async runComparisonTests() {
        console.log('📊 Running Comparison Tests...');
        
        // Mock old implementations for comparison
        const mockOldCellUtils = {
            calculateResponsiveConfig: (width, height) => {
                if (width < 768) return { maxEvents: 2, compactMode: true, enableTouch: true, enableRipple: true };
                else if (width < 1024) return { maxEvents: 3, compactMode: false, enableTouch: true, enableRipple: true };
                else if (width < 1440) return { maxEvents: 4, compactMode: false, enableTouch: false, enableRipple: false };
                else return { maxEvents: 5, compactMode: false, enableTouch: false, enableRipple: false };
            }
        };

        const testCases = [
            { width: 500, height: 400 },
            { width: 800, height: 600 },
            { width: 1200, height: 800 },
            { width: 1600, height: 900 }
        ];

        for (const testCase of testCases) {
            try {
                const newConfig = createCellConfig(testCase.width, testCase.height);
                const oldConfig = mockOldCellUtils.calculateResponsiveConfig(testCase.width, testCase.height);

                if (newConfig.maxEvents === oldConfig.maxEvents &&
                    newConfig.compactMode === oldConfig.compactMode &&
                    newConfig.enableTouch === oldConfig.enableTouch &&
                    newConfig.enableRipple === oldConfig.enableRipple) {
                    this.results.addResult(`Compatibility Test (${testCase.width}x${testCase.height})`, true);
                } else {
                    this.results.addResult(`Compatibility Test (${testCase.width}x${testCase.height})`, false, 
                        'Results do not match old implementation');
                }
            } catch (error) {
                this.results.addResult(`Compatibility Test (${testCase.width}x${testCase.height})`, false, error);
            }
        }
    }

    /**
     * Print test results
     */
    printResults() {
        const summary = this.results.getSummary();
        
        console.log('\n📈 Test Results Summary');
        console.log('=' .repeat(50));
        console.log(`Total Tests: ${summary.totalTests}`);
        console.log(`Passed: ${summary.passedTests} ✅`);
        console.log(`Failed: ${summary.failedTests} ❌`);
        console.log(`Skipped: ${summary.skippedTests} ⏭️`);
        console.log(`Success Rate: ${summary.successRate}`);
        console.log(`Duration: ${summary.duration}`);
        
        if (Object.keys(summary.performanceMetrics).length > 0) {
            console.log('\n⚡ Performance Metrics:');
            for (const [name, value] of Object.entries(summary.performanceMetrics)) {
                console.log(`  ${name}: ${typeof value === 'number' ? value.toFixed(2) + 'ms' : value}`);
            }
        }
        
        if (summary.errors.length > 0) {
            console.log('\n❌ Errors:');
            summary.errors.forEach(error => {
                console.log(`  ${error.test}: ${error.error}`);
            });
        }
        
        if (summary.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            summary.warnings.forEach(warning => {
                console.log(`  ${warning.test}: ${warning.warning}`);
            });
        }
        
        console.log('\n' + '=' .repeat(50));
        
        if (summary.failedTests === 0) {
            console.log('🎉 All tests passed! Responsive system is ready for production.');
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
        }
    }
}

/**
 * Run the test suite
 */
export async function runResponsiveTests() {
    const runner = new ResponsiveTestRunner();
    await runner.runAllTests();
    return runner.results.getSummary();
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    runResponsiveTests().then(summary => {
        process.exit(summary.failedTests === 0 ? 0 : 1);
    }).catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

export default ResponsiveTestRunner;
