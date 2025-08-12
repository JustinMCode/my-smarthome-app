/**
 * Hash Utilities Module
 * 
 * Provides centralized hash functions for the calendar system with enterprise-grade features:
 * - Multiple hash algorithms (djb2, fnv1a, simple)
 * - Input validation and error handling
 * - Performance optimization
 * - Comprehensive JSDoc documentation
 * - Memory-efficient implementations
 * 
 * @module HashUtils
 * @version 1.0.0
 * @since 2024-01-01
 */

import { performanceMonitor } from '../../../performance/utils/PerformanceMonitor.js';

/**
 * Hash algorithm types supported by this module
 * @enum {string}
 */
export const HASH_ALGORITHMS = {
    /** DJB2 hash algorithm - fast and good distribution */
    DJB2: 'djb2',
    /** FNV-1a hash algorithm - excellent distribution */
    FNV1A: 'fnv1a',
    /** Simple hash algorithm - legacy compatibility */
    SIMPLE: 'simple'
};

/**
 * Default hash algorithm for backward compatibility
 * @type {string}
 */
export const DEFAULT_ALGORITHM = HASH_ALGORITHMS.SIMPLE;

/**
 * Performance monitoring data
 * @type {Object}
 */
const performanceMetrics = {
    totalCalls: 0,
    algorithmUsage: {},
    averageExecutionTime: 0,
    totalExecutionTime: 0
};

/**
 * Validates input string for hashing
 * @param {*} input - Input to validate
 * @param {string} functionName - Name of calling function for error messages
 * @throws {TypeError} If input is not a string or is null/undefined
 * @private
 */
function validateInput(input, functionName = 'hashString') {
    if (input === null || input === undefined) {
        throw new TypeError(`${functionName}: Input cannot be null or undefined`);
    }
    
    if (typeof input !== 'string') {
        throw new TypeError(`${functionName}: Input must be a string, received ${typeof input}`);
    }
    
    if (input.length === 0) {
        throw new TypeError(`${functionName}: Input cannot be an empty string`);
    }
}

/**
 * Measures execution time of a function
 * @param {Function} fn - Function to measure
 * @param {Array} args - Arguments to pass to function
 * @returns {Object} Object containing result and execution time
 * @private
 */
function measureExecutionTime(fn, args) {
    const startTime = performance.now();
    const result = fn(...args);
    const executionTime = performance.now() - startTime;
    
    return { result, executionTime };
}

/**
 * Updates performance metrics
 * @param {string} algorithm - Algorithm used
 * @param {number} executionTime - Execution time in milliseconds
 * @private
 */
function updateMetrics(algorithm, executionTime) {
    performanceMetrics.totalCalls++;
    performanceMetrics.totalExecutionTime += executionTime;
    performanceMetrics.averageExecutionTime = performanceMetrics.totalExecutionTime / performanceMetrics.totalCalls;
    
    if (!performanceMetrics.algorithmUsage[algorithm]) {
        performanceMetrics.algorithmUsage[algorithm] = 0;
    }
    performanceMetrics.algorithmUsage[algorithm]++;
}

/**
 * DJB2 hash algorithm implementation
 * Fast hash function with good distribution properties
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash value in base36
 * @private
 */
function djb2Hash(str) {
    let hash = 5381;
    const len = str.length;
    
    for (let i = 0; i < len; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * FNV-1a hash algorithm implementation
 * Excellent distribution and collision resistance
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash value in base36
 * @private
 */
function fnv1aHash(str) {
    let hash = 0x811c9dc5; // FNV offset basis
    const prime = 0x01000193; // FNV prime
    
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * prime) >>> 0; // Convert to 32-bit unsigned integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * Simple hash algorithm implementation (legacy compatibility)
 * Original implementation used throughout the calendar system
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash value in base36
 * @private
 */
function simpleHash(str) {
    let hash = 0;
    const len = str.length;
    
    for (let i = 0; i < len; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * Main hash function with algorithm selection and performance monitoring
 * 
 * @param {string} str - String to hash
 * @param {Object} options - Hash options
 * @param {string} [options.algorithm=DEFAULT_ALGORITHM] - Hash algorithm to use
 * @param {boolean} [options.measurePerformance=false] - Whether to measure performance
 * @returns {string|Object} Hash value or object with hash and performance data
 * 
 * @example
 * // Basic usage with default algorithm
 * const hash = hashString('hello world');
 * 
 * // Using specific algorithm
 * const hash = hashString('hello world', { algorithm: 'djb2' });
 * 
 * // With performance measurement
 * const result = hashString('hello world', { measurePerformance: true });
 * console.log(result.hash); // Hash value
 * console.log(result.executionTime); // Execution time in ms
 * 
 * @throws {TypeError} If input is invalid
 * @throws {Error} If algorithm is not supported
 */
export function hashString(str, options = {}) {
    const {
        algorithm = DEFAULT_ALGORITHM,
        measurePerformance = false
    } = options;
    
    // Validate input
    validateInput(str, 'hashString');
    
    // Validate algorithm
    if (!Object.values(HASH_ALGORITHMS).includes(algorithm)) {
        throw new Error(`hashString: Unsupported algorithm '${algorithm}'. Supported algorithms: ${Object.values(HASH_ALGORITHMS).join(', ')}`);
    }
    
    // Select hash function
    let hashFunction;
    switch (algorithm) {
        case HASH_ALGORITHMS.DJB2:
            hashFunction = djb2Hash;
            break;
        case HASH_ALGORITHMS.FNV1A:
            hashFunction = fnv1aHash;
            break;
        case HASH_ALGORITHMS.SIMPLE:
            hashFunction = simpleHash;
            break;
        default:
            throw new Error(`hashString: Algorithm '${algorithm}' not implemented`);
    }
    
    // Execute hash function with performance monitoring
    const result = performanceMonitor.measure(`hash.${algorithm}`, hashFunction, [str], {
        algorithm,
        inputLength: str.length
    });
    
    if (measurePerformance) {
        return {
            hash: result,
            algorithm,
            executionTime: performanceMonitor.getStatistics(`hash.${algorithm}`).average,
            timestamp: Date.now()
        };
    } else {
        return result;
    }
}

/**
 * Legacy hash function for backward compatibility
 * Uses the simple algorithm (original implementation)
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash value in base36
 * 
 * @example
 * const hash = hashStringLegacy('hello world');
 * 
 * @deprecated Use hashString() instead for new code
 */
export function hashStringLegacy(str) {
    console.warn('hashStringLegacy: This function is deprecated. Use hashString() instead.');
    return hashString(str, { algorithm: HASH_ALGORITHMS.SIMPLE });
}

/**
 * Batch hash multiple strings efficiently
 * 
 * @param {Array<string>} strings - Array of strings to hash
 * @param {Object} options - Hash options
 * @param {string} [options.algorithm=DEFAULT_ALGORITHM] - Hash algorithm to use
 * @param {boolean} [options.measurePerformance=false] - Whether to measure performance
 * @returns {Array<string>|Object} Array of hash values or object with results and performance data
 * 
 * @example
 * // Basic batch hashing
 * const hashes = hashStrings(['hello', 'world', 'test']);
 * 
 * // With performance measurement
 * const result = hashStrings(['hello', 'world', 'test'], { measurePerformance: true });
 * console.log(result.hashes); // Array of hash values
 * console.log(result.totalTime); // Total execution time
 * 
 * @throws {TypeError} If input is invalid
 */
export function hashStrings(strings, options = {}) {
    const {
        algorithm = DEFAULT_ALGORITHM,
        measurePerformance = false
    } = options;
    
    // Validate input
    if (!Array.isArray(strings)) {
        throw new TypeError('hashStrings: Input must be an array of strings');
    }
    
    if (strings.length === 0) {
        throw new TypeError('hashStrings: Input array cannot be empty');
    }
    
    // Validate each string
    strings.forEach((str, index) => {
        try {
            validateInput(str, `hashStrings[${index}]`);
        } catch (error) {
            throw new TypeError(`hashStrings: Invalid string at index ${index}: ${error.message}`);
        }
    });
    
    if (measurePerformance) {
        const startTime = performance.now();
        const hashes = strings.map(str => hashString(str, { algorithm }));
        const totalTime = performance.now() - startTime;
        
        return {
            hashes,
            algorithm,
            totalTime,
            averageTime: totalTime / strings.length,
            count: strings.length,
            timestamp: Date.now()
        };
    } else {
        return strings.map(str => hashString(str, { algorithm }));
    }
}

/**
 * Generate a hash for an object by stringifying it
 * 
 * @param {Object} obj - Object to hash
 * @param {Object} options - Hash options
 * @param {string} [options.algorithm=DEFAULT_ALGORITHM] - Hash algorithm to use
 * @param {boolean} [options.measurePerformance=false] - Whether to measure performance
 * @returns {string|Object} Hash value or object with hash and performance data
 * 
 * @example
 * const obj = { name: 'John', age: 30, city: 'New York' };
 * const hash = hashObject(obj);
 * 
 * @throws {TypeError} If input is invalid
 */
export function hashObject(obj, options = {}) {
    if (obj === null || obj === undefined) {
        throw new TypeError('hashObject: Input cannot be null or undefined');
    }
    
    try {
        const jsonString = JSON.stringify(obj);
        return hashString(jsonString, options);
    } catch (error) {
        throw new TypeError(`hashObject: Failed to stringify object: ${error.message}`);
    }
}

/**
 * Get performance metrics for hash operations
 * 
 * @returns {Object} Performance metrics
 * 
 * @example
 * const metrics = getHashPerformanceMetrics();
 * console.log(metrics.totalCalls); // Total number of hash operations
 * console.log(metrics.averageExecutionTime); // Average execution time
 * console.log(metrics.algorithmUsage); // Usage by algorithm
 */
export function getHashPerformanceMetrics() {
    return {
        ...performanceMetrics,
        timestamp: Date.now()
    };
}

/**
 * Reset performance metrics
 * 
 * @example
 * resetHashPerformanceMetrics();
 */
export function resetHashPerformanceMetrics() {
    performanceMetrics.totalCalls = 0;
    performanceMetrics.algorithmUsage = {};
    performanceMetrics.averageExecutionTime = 0;
    performanceMetrics.totalExecutionTime = 0;
}

/**
 * Compare two hash values for equality
 * 
 * @param {string} hash1 - First hash value
 * @param {string} hash2 - Second hash value
 * @returns {boolean} True if hashes are equal
 * 
 * @example
 * const isEqual = compareHashes(hash1, hash2);
 */
export function compareHashes(hash1, hash2) {
    if (typeof hash1 !== 'string' || typeof hash2 !== 'string') {
        return false;
    }
    
    return hash1 === hash2;
}

/**
 * Validate if a string is a valid hash (base36 format)
 * 
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if hash is valid
 * 
 * @example
 * const isValid = isValidHash('abc123');
 */
export function isValidHash(hash) {
    if (typeof hash !== 'string' || hash.length === 0) {
        return false;
    }
    
    // Check if string contains only base36 characters (0-9, a-z)
    return /^[0-9a-z]+$/i.test(hash);
}

// Default export for convenience
export default {
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
};
