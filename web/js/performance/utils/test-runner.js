/**
 * Performance Monitor Test Runner
 * 
 * Executes the comprehensive test suite for the Performance Monitor module.
 * 
 * @module PerformanceTestRunner
 * @version 1.0.0
 * @since 2024-01-01
 */

import PerformanceMonitorTestSuite from './performance.test.js';

/**
 * Run the performance monitor test suite
 */
function runPerformanceTests() {
    console.log('🧪 Performance Monitor Test Runner');
    console.log('=====================================\n');
    
    const testSuite = new PerformanceMonitorTestSuite();
    testSuite.runAllTests();
}

// Run tests if this module is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.runPerformanceTests = runPerformanceTests;
} else {
    // Node.js environment
    runPerformanceTests();
}

export { runPerformanceTests };
export default runPerformanceTests;
