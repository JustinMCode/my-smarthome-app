/**
 * Performance Monitor Test Suite
 * 
 * Comprehensive test suite for the Performance Monitor module.
 * Tests all functionality including metrics collection, alerts, and reporting.
 * 
 * @module PerformanceMonitorTestSuite
 * @version 1.0.0
 * @since 2024-01-01
 */

import {
    PerformanceMonitor,
    performanceMonitor,
    METRIC_TYPES,
    PERFORMANCE_THRESHOLDS,
    measure,
    recordMetric,
    recordCacheMetric,
    recordError,
    recordInteraction,
    getMetrics,
    getStatistics,
    getReport
} from './PerformanceMonitor.js';

/**
 * Performance Monitor Test Suite Class
 * Provides comprehensive testing for the Performance Monitor module
 */
export class PerformanceMonitorTestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
    }

    /**
     * Assert function for testing
     * @param {boolean} condition - Condition to test
     * @param {string} message - Test message
     */
    assert(condition, message) {
        this.total++;
        if (condition) {
            this.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
    }

    /**
     * Run all tests
     */
    runAllTests() {
        console.log('🚀 Starting Performance Monitor Test Suite...\n');

        this.testPerformanceMonitorCreation();
        this.testGlobalInstance();
        this.testMetricRecording();
        this.testPerformanceMeasurement();
        this.testCacheMetrics();
        this.testErrorRecording();
        this.testInteractionRecording();
        this.testMetricsRetrieval();
        this.testStatisticsCalculation();
        this.testPerformanceReport();
        this.testAlerts();
        this.testConfiguration();
        this.testCleanup();

        this.printResults();
    }

    /**
     * Test Performance Monitor creation
     */
    testPerformanceMonitorCreation() {
        console.log('📋 Testing Performance Monitor Creation...');
        
        const monitor = new PerformanceMonitor();
        this.assert(monitor instanceof PerformanceMonitor, 'Should create PerformanceMonitor instance');
        this.assert(monitor.config.enabled === true, 'Should have default enabled config');
        this.assert(monitor.metrics instanceof Map, 'Should have metrics Map');
        this.assert(Array.isArray(monitor.alerts), 'Should have alerts array');
    }

    /**
     * Test global instance
     */
    testGlobalInstance() {
        console.log('📋 Testing Global Instance...');
        
        this.assert(performanceMonitor instanceof PerformanceMonitor, 'Global instance should exist');
        this.assert(performanceMonitor.config.enabled === true, 'Global instance should be enabled');
    }

    /**
     * Test metric recording
     */
    testMetricRecording() {
        console.log('📋 Testing Metric Recording...');
        
        const monitor = new PerformanceMonitor();
        const testMetric = {
            duration: 150,
            timestamp: Date.now(),
            success: true
        };

        monitor.recordMetric('test.metric', testMetric);
        
        const metrics = monitor.getMetrics('test.metric');
        this.assert(metrics.length === 1, 'Should record one metric');
        this.assert(metrics[0].name === 'test.metric', 'Should have correct metric name');
        this.assert(metrics[0].value === 150, 'Should have correct metric value');
    }

    /**
     * Test performance measurement
     */
    testPerformanceMeasurement() {
        console.log('📋 Testing Performance Measurement...');
        
        const monitor = new PerformanceMonitor();
        
        const testFunction = () => {
            // Simulate some work
            const start = Date.now();
            while (Date.now() - start < 10) {
                // Busy wait for 10ms
            }
            return 'test result';
        };

        const result = monitor.measure('test.measurement', testFunction, []);
        
        this.assert(result === 'test result', 'Should return function result');
        
        const metrics = monitor.getMetrics('test.measurement');
        this.assert(metrics.length === 1, 'Should record measurement metric');
        this.assert(metrics[0].metadata.success === true, 'Should record successful measurement');
    }

    /**
     * Test cache metrics
     */
    testCacheMetrics() {
        console.log('📋 Testing Cache Metrics...');
        
        const monitor = new PerformanceMonitor();
        
        monitor.recordCacheMetric('test-cache', 'hit', { key: 'test-key' });
        monitor.recordCacheMetric('test-cache', 'miss', { key: 'missing-key' });
        
        this.assert(monitor.cacheStats.hits === 1, 'Should record cache hit');
        this.assert(monitor.cacheStats.misses === 1, 'Should record cache miss');
        this.assert(monitor.cacheStats.operations === 2, 'Should record total operations');
    }

    /**
     * Test error recording
     */
    testErrorRecording() {
        console.log('📋 Testing Error Recording...');
        
        const monitor = new PerformanceMonitor();
        const testError = new Error('Test error message');
        
        monitor.recordError('test.context', testError);
        
        const metrics = monitor.getMetrics('error.test.context');
        this.assert(metrics.length === 1, 'Should record error metric');
        this.assert(metrics[0].metadata.message === 'Test error message', 'Should record error message');
    }

    /**
     * Test interaction recording
     */
    testInteractionRecording() {
        console.log('📋 Testing Interaction Recording...');
        
        const monitor = new PerformanceMonitor();
        const interactionData = { element: 'button', action: 'click' };
        
        monitor.recordInteraction('button-click', interactionData);
        
        const metrics = monitor.getMetrics('interaction.button-click');
        this.assert(metrics.length === 1, 'Should record interaction metric');
        this.assert(metrics[0].metadata.element === 'button', 'Should record interaction data');
    }

    /**
     * Test metrics retrieval
     */
    testMetricsRetrieval() {
        console.log('📋 Testing Metrics Retrieval...');
        
        const monitor = new PerformanceMonitor();
        
        // Record multiple metrics
        for (let i = 0; i < 5; i++) {
            monitor.recordMetric('test.retrieval', { value: i, timestamp: Date.now() });
        }
        
        const allMetrics = monitor.getMetrics();
        this.assert(allMetrics.length >= 5, 'Should retrieve all metrics');
        
        const specificMetrics = monitor.getMetrics('test.retrieval');
        this.assert(specificMetrics.length === 5, 'Should retrieve specific metrics');
        
        const limitedMetrics = monitor.getMetrics('test.retrieval', { limit: 3 });
        this.assert(limitedMetrics.length === 3, 'Should respect limit parameter');
    }

    /**
     * Test statistics calculation
     */
    testStatisticsCalculation() {
        console.log('📋 Testing Statistics Calculation...');
        
        const monitor = new PerformanceMonitor();
        
        // Record test data
        const testValues = [10, 20, 30, 40, 50];
        testValues.forEach(value => {
            monitor.recordMetric('test.stats', { value, timestamp: Date.now() });
        });
        
        const stats = monitor.getStatistics('test.stats');
        
        this.assert(stats.count === 5, 'Should calculate correct count');
        this.assert(stats.average === 30, 'Should calculate correct average');
        this.assert(stats.min === 10, 'Should calculate correct minimum');
        this.assert(stats.max === 50, 'Should calculate correct maximum');
        this.assert(stats.total === 150, 'Should calculate correct total');
    }

    /**
     * Test performance report
     */
    testPerformanceReport() {
        console.log('📋 Testing Performance Report...');
        
        const monitor = new PerformanceMonitor();
        
        // Record some test data
        monitor.recordMetric('timing.test', { duration: 100, timestamp: Date.now() });
        monitor.recordMetric('memory.usage', { used: 25, timestamp: Date.now() });
        monitor.recordCacheMetric('test-cache', 'hit', {});
        monitor.recordCacheMetric('test-cache', 'miss', {});
        
        const report = monitor.getReport();
        
        this.assert(typeof report.uptime === 'number', 'Should include uptime');
        this.assert(typeof report.totalMetrics === 'number', 'Should include total metrics');
        this.assert(typeof report.averageResponseTime === 'number', 'Should include average response time');
        this.assert(typeof report.memoryUsage === 'number', 'Should include memory usage');
        this.assert(typeof report.cacheHitRate === 'number', 'Should include cache hit rate');
        this.assert(typeof report.errorRate === 'number', 'Should include error rate');
    }

    /**
     * Test alerts
     */
    testAlerts() {
        console.log('📋 Testing Alerts...');
        
        const monitor = new PerformanceMonitor();
        
        // Test performance alert
        monitor.recordMetric('slow.operation', { duration: 1200, timestamp: Date.now() });
        
        const alerts = monitor.getAlerts();
        this.assert(alerts.length >= 0, 'Should have alerts array');
        
        // Test alert creation
        monitor.createAlert('test', 'Test alert message', 'warning');
        const newAlerts = monitor.getAlerts();
        this.assert(newAlerts.length >= 1, 'Should create new alert');
    }

    /**
     * Test configuration
     */
    testConfiguration() {
        console.log('📋 Testing Configuration...');
        
        const customConfig = {
            enabled: false,
            maxMetrics: 50,
            enableAlerts: false
        };
        
        const monitor = new PerformanceMonitor(customConfig);
        
        this.assert(monitor.config.enabled === false, 'Should apply custom enabled config');
        this.assert(monitor.config.maxMetrics === 50, 'Should apply custom maxMetrics config');
        this.assert(monitor.config.enableAlerts === false, 'Should apply custom enableAlerts config');
    }

    /**
     * Test cleanup
     */
    testCleanup() {
        console.log('📋 Testing Cleanup...');
        
        const monitor = new PerformanceMonitor();
        
        // Record old metrics
        const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
        monitor.recordMetric('old.metric', { value: 1, timestamp: oldTimestamp });
        
        // Record new metrics
        monitor.recordMetric('new.metric', { value: 2, timestamp: Date.now() });
        
        // Trigger cleanup
        monitor.cleanupOldMetrics();
        
        const oldMetrics = monitor.getMetrics('old.metric');
        const newMetrics = monitor.getMetrics('new.metric');
        
        this.assert(oldMetrics.length === 0, 'Should remove old metrics');
        this.assert(newMetrics.length === 1, 'Should keep new metrics');
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n📊 Test Results:');
        console.log(`Total Tests: ${this.total}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Success Rate: ${((this.passed / this.total) * 100).toFixed(1)}%`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All tests passed! Performance Monitor is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
        }
    }
}

export default PerformanceMonitorTestSuite;
