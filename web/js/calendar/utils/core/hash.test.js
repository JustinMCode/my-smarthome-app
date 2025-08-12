/**
 * Hash Utilities Test Suite
 * 
 * Comprehensive tests for the centralized hash utility module
 * Verifies all functionality works correctly after refactoring
 */

import { 
    hashString, 
    hashStringLegacy, 
    hashStrings, 
    hashObject,
    getHashPerformanceMetrics,
    resetHashPerformanceMetrics,
    compareHashes,
    isValidHash,
    HASH_ALGORITHMS,
    DEFAULT_ALGORITHM
} from './hash.js';

/**
 * Test suite for hash utilities
 */
export class HashUtilsTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Run all tests
     */
    runAllTests() {
        console.log('🧪 Starting Hash Utilities Test Suite...\n');
        
        this.testBasicHashFunction();
        this.testAlgorithmSelection();
        this.testPerformanceMeasurement();
        this.testBatchHashing();
        this.testObjectHashing();
        this.testLegacyCompatibility();
        this.testErrorHandling();
        this.testUtilityFunctions();
        this.testPerformanceMetrics();
        
        this.printResults();
    }

    /**
     * Test basic hash function functionality
     */
    testBasicHashFunction() {
        console.log('📋 Testing basic hash function...');
        
        try {
            // Test basic string hashing
            const hash1 = hashString('hello world');
            const hash2 = hashString('hello world');
            
            this.assert(hash1 === hash2, 'Same input should produce same hash');
            this.assert(typeof hash1 === 'string', 'Hash should be a string');
            this.assert(hash1.length > 0, 'Hash should not be empty');
            
            // Test different inputs produce different hashes
            const hash3 = hashString('different string');
            this.assert(hash1 !== hash3, 'Different inputs should produce different hashes');
            
            console.log('✅ Basic hash function tests passed\n');
        } catch (error) {
            this.handleError('Basic hash function', error);
        }
    }

    /**
     * Test algorithm selection
     */
    testAlgorithmSelection() {
        console.log('📋 Testing algorithm selection...');
        
        try {
            const testString = 'test string for algorithm comparison';
            
            // Test all algorithms
            const simpleHash = hashString(testString, { algorithm: HASH_ALGORITHMS.SIMPLE });
            const djb2Hash = hashString(testString, { algorithm: HASH_ALGORITHMS.DJB2 });
            const fnv1aHash = hashString(testString, { algorithm: HASH_ALGORITHMS.FNV1A });
            
            // All should be valid hashes
            this.assert(isValidHash(simpleHash), 'Simple hash should be valid');
            this.assert(isValidHash(djb2Hash), 'DJB2 hash should be valid');
            this.assert(isValidHash(fnv1aHash), 'FNV1A hash should be valid');
            
            // Different algorithms should produce different results
            this.assert(simpleHash !== djb2Hash, 'Different algorithms should produce different hashes');
            this.assert(djb2Hash !== fnv1aHash, 'Different algorithms should produce different hashes');
            
            // Test default algorithm
            const defaultHash = hashString(testString);
            this.assert(defaultHash === simpleHash, 'Default algorithm should be simple');
            
            console.log('✅ Algorithm selection tests passed\n');
        } catch (error) {
            this.handleError('Algorithm selection', error);
        }
    }

    /**
     * Test performance measurement
     */
    testPerformanceMeasurement() {
        console.log('📋 Testing performance measurement...');
        
        try {
            const result = hashString('test string', { measurePerformance: true });
            
            this.assert(typeof result === 'object', 'Performance measurement should return object');
            this.assert(typeof result.hash === 'string', 'Result should contain hash');
            this.assert(typeof result.executionTime === 'number', 'Result should contain execution time');
            this.assert(typeof result.algorithm === 'string', 'Result should contain algorithm');
            this.assert(typeof result.timestamp === 'number', 'Result should contain timestamp');
            this.assert(result.executionTime >= 0, 'Execution time should be non-negative');
            
            console.log('✅ Performance measurement tests passed\n');
        } catch (error) {
            this.handleError('Performance measurement', error);
        }
    }

    /**
     * Test batch hashing
     */
    testBatchHashing() {
        console.log('📋 Testing batch hashing...');
        
        try {
            const strings = ['hello', 'world', 'test', 'batch'];
            
            // Test basic batch hashing
            const hashes = hashStrings(strings);
            this.assert(Array.isArray(hashes), 'Batch hashing should return array');
            this.assert(hashes.length === strings.length, 'Should return hash for each string');
            
            // Test batch hashing with performance measurement
            const result = hashStrings(strings, { measurePerformance: true });
            this.assert(typeof result === 'object', 'Batch performance should return object');
            this.assert(Array.isArray(result.hashes), 'Should contain hashes array');
            this.assert(typeof result.totalTime === 'number', 'Should contain total time');
            this.assert(typeof result.averageTime === 'number', 'Should contain average time');
            this.assert(result.count === strings.length, 'Should contain correct count');
            
            console.log('✅ Batch hashing tests passed\n');
        } catch (error) {
            this.handleError('Batch hashing', error);
        }
    }

    /**
     * Test object hashing
     */
    testObjectHashing() {
        console.log('📋 Testing object hashing...');
        
        try {
            const obj1 = { name: 'John', age: 30, city: 'New York' };
            const obj2 = { name: 'John', age: 30, city: 'New York' };
            const obj3 = { name: 'Jane', age: 25, city: 'Los Angeles' };
            
            // Test object hashing
            const hash1 = hashObject(obj1);
            const hash2 = hashObject(obj2);
            const hash3 = hashObject(obj3);
            
            this.assert(hash1 === hash2, 'Identical objects should produce same hash');
            this.assert(hash1 !== hash3, 'Different objects should produce different hashes');
            this.assert(isValidHash(hash1), 'Object hash should be valid');
            
            console.log('✅ Object hashing tests passed\n');
        } catch (error) {
            this.handleError('Object hashing', error);
        }
    }

    /**
     * Test legacy compatibility
     */
    testLegacyCompatibility() {
        console.log('📋 Testing legacy compatibility...');
        
        try {
            const testString = 'legacy compatibility test';
            
            // Test legacy function
            const legacyHash = hashStringLegacy(testString);
            const currentHash = hashString(testString, { algorithm: HASH_ALGORITHMS.SIMPLE });
            
            this.assert(legacyHash === currentHash, 'Legacy function should match current simple algorithm');
            this.assert(isValidHash(legacyHash), 'Legacy hash should be valid');
            
            console.log('✅ Legacy compatibility tests passed\n');
        } catch (error) {
            this.handleError('Legacy compatibility', error);
        }
    }

    /**
     * Test error handling
     */
    testErrorHandling() {
        console.log('📋 Testing error handling...');
        
        try {
            // Test null input
            try {
                hashString(null);
                this.assert(false, 'Should throw error for null input');
            } catch (error) {
                this.assert(error instanceof TypeError, 'Should throw TypeError for null input');
            }
            
            // Test undefined input
            try {
                hashString(undefined);
                this.assert(false, 'Should throw error for undefined input');
            } catch (error) {
                this.assert(error instanceof TypeError, 'Should throw TypeError for undefined input');
            }
            
            // Test non-string input
            try {
                hashString(123);
                this.assert(false, 'Should throw error for non-string input');
            } catch (error) {
                this.assert(error instanceof TypeError, 'Should throw TypeError for non-string input');
            }
            
            // Test empty string
            try {
                hashString('');
                this.assert(false, 'Should throw error for empty string');
            } catch (error) {
                this.assert(error instanceof TypeError, 'Should throw TypeError for empty string');
            }
            
            // Test invalid algorithm
            try {
                hashString('test', { algorithm: 'invalid' });
                this.assert(false, 'Should throw error for invalid algorithm');
            } catch (error) {
                this.assert(error instanceof Error, 'Should throw Error for invalid algorithm');
            }
            
            console.log('✅ Error handling tests passed\n');
        } catch (error) {
            this.handleError('Error handling', error);
        }
    }

    /**
     * Test utility functions
     */
    testUtilityFunctions() {
        console.log('📋 Testing utility functions...');
        
        try {
            // Test hash comparison
            const hash1 = hashString('test1');
            const hash2 = hashString('test2');
            const hash3 = hashString('test1');
            
            this.assert(compareHashes(hash1, hash1), 'Same hashes should be equal');
            this.assert(!compareHashes(hash1, hash2), 'Different hashes should not be equal');
            this.assert(compareHashes(hash1, hash3), 'Identical input hashes should be equal');
            this.assert(!compareHashes(hash1, 'invalid'), 'Invalid hash should not be equal');
            
            // Test hash validation
            this.assert(isValidHash('abc123'), 'Valid hash should pass validation');
            this.assert(isValidHash('123456'), 'Valid hash should pass validation');
            this.assert(!isValidHash(''), 'Empty string should fail validation');
            this.assert(!isValidHash('abc-123'), 'Invalid characters should fail validation');
            this.assert(!isValidHash('abc 123'), 'Spaces should fail validation');
            this.assert(!isValidHash(123), 'Non-string should fail validation');
            
            console.log('✅ Utility function tests passed\n');
        } catch (error) {
            this.handleError('Utility functions', error);
        }
    }

    /**
     * Test performance metrics
     */
    testPerformanceMetrics() {
        console.log('📋 Testing performance metrics...');
        
        try {
            // Reset metrics
            resetHashPerformanceMetrics();
            
            // Perform some hash operations
            hashString('test1');
            hashString('test2', { algorithm: HASH_ALGORITHMS.DJB2 });
            hashString('test3', { algorithm: HASH_ALGORITHMS.FNV1A });
            
            // Get metrics
            const metrics = getHashPerformanceMetrics();
            
            this.assert(typeof metrics === 'object', 'Metrics should be an object');
            this.assert(metrics.totalCalls === 3, 'Should count total calls correctly');
            this.assert(typeof metrics.averageExecutionTime === 'number', 'Should have average execution time');
            this.assert(typeof metrics.algorithmUsage === 'object', 'Should have algorithm usage data');
            this.assert(metrics.algorithmUsage.simple === 1, 'Should count simple algorithm usage');
            this.assert(metrics.algorithmUsage.djb2 === 1, 'Should count DJB2 algorithm usage');
            this.assert(metrics.algorithmUsage.fnv1a === 1, 'Should count FNV1A algorithm usage');
            
            console.log('✅ Performance metrics tests passed\n');
        } catch (error) {
            this.handleError('Performance metrics', error);
        }
    }

    /**
     * Assert function for tests
     */
    assert(condition, message) {
        if (condition) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
            this.testResults.errors.push(`❌ ${message}`);
        }
    }

    /**
     * Handle test errors
     */
    handleError(testName, error) {
        this.testResults.failed++;
        this.testResults.errors.push(`❌ ${testName}: ${error.message}`);
        console.log(`❌ ${testName} test failed: ${error.message}\n`);
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
        
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.testResults.errors.forEach(error => console.log(error));
        }
        
        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed! Hash utilities refactoring is successful.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
        }
    }
}

// Export test suite for use
export default HashUtilsTestSuite;
