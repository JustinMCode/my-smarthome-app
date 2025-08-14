/**
 * API Utilities Test Suite
 * Comprehensive tests for the API utilities module
 */

import {
    parseJsonResponse,
    validateApiResponse,
    makeApiRequest,
    apiRequestWithParsing,
    clearApiCache,
    getApiCacheStats,
    abortAllRequests,
    createApiError,
    extractApiData,
    _parseJson,
    DEFAULT_API_CONFIG
} from './utils.js';

/**
 * Mock fetch for testing
 */
class MockResponse {
    constructor(data, options = {}) {
        this.data = data;
        this.ok = options.ok !== false;
        this.status = options.status || (this.ok ? 200 : 500);
        this.url = options.url || 'http://test.com/api/test';
        this.headers = new Map(Object.entries(options.headers || {
            'content-type': 'application/json'
        }));
    }
    
    async json() {
        if (typeof this.data === 'string' && this.data === 'invalid-json') {
            throw new Error('Invalid JSON');
        }
        return this.data;
    }
    
    get(name) {
        return this.headers.get(name);
    }
}

/**
 * Test helper to create mock fetch
 */
function createMockFetch(response) {
    return jest.fn().mockResolvedValue(response);
}

/**
 * Run all API utilities tests
 */
function runApiUtilsTests() {
    console.log('🧪 Starting API Utilities Tests...\n');
    
    // Test Suite 1: parseJsonResponse
    testParseJsonResponse();
    
    // Test Suite 2: validateApiResponse
    testValidateApiResponse();
    
    // Test Suite 3: Legacy _parseJson
    testLegacyParseJson();
    
    // Test Suite 4: Error handling
    testErrorHandling();
    
    // Test Suite 5: Caching
    testCaching();
    
    // Test Suite 6: Integration
    testIntegration();
    
    console.log('✅ All API Utilities Tests Complete!\n');
}

/**
 * Test Suite 1: parseJsonResponse
 */
function testParseJsonResponse() {
    console.log('📋 Testing parseJsonResponse...');
    
    // Test successful JSON parsing
    const validResponse = new MockResponse({ success: true, data: 'test' });
    parseJsonResponse(validResponse).then(result => {
        console.assert(result.success === true, 
            '❌ Valid JSON should parse correctly');
        console.log('✓ Valid JSON parsed correctly');
    });
    
    // Test invalid JSON
    const invalidResponse = new MockResponse('invalid-json');
    parseJsonResponse(invalidResponse).then(result => {
        console.assert(result === null, 
            '❌ Invalid JSON should return null');
        console.log('✓ Invalid JSON handled gracefully');
    });
    
    // Test non-JSON content type
    const nonJsonResponse = new MockResponse({ data: 'test' }, {
        headers: { 'content-type': 'text/html' }
    });
    parseJsonResponse(nonJsonResponse).then(result => {
        console.assert(result === null, 
            '❌ Non-JSON content should return null');
        console.log('✓ Non-JSON content handled gracefully');
    });
    
    // Test with throwOnError option
    parseJsonResponse(invalidResponse, { throwOnError: true }).catch(error => {
        console.assert(error instanceof Error, 
            '❌ Should throw error when throwOnError is true');
        console.log('✓ throwOnError option works correctly');
    });
    
    console.log('');
}

/**
 * Test Suite 2: validateApiResponse
 */
function testValidateApiResponse() {
    console.log('🔍 Testing validateApiResponse...');
    
    // Test successful response
    const successResponse = new MockResponse({}, { ok: true, status: 200 });
    const successData = { success: true, data: 'test' };
    const isValid = validateApiResponse(successResponse, successData);
    console.assert(isValid === true, 
        '❌ Valid response should be validated as true');
    console.log('✓ Valid response validated correctly');
    
    // Test HTTP error response
    const errorResponse = new MockResponse({}, { ok: false, status: 404 });
    const isInvalid = validateApiResponse(errorResponse, {});
    console.assert(isInvalid === false, 
        '❌ HTTP error should be validated as false');
    console.log('✓ HTTP error validated correctly');
    
    // Test API-level error
    const apiErrorData = { success: false, error: 'API Error' };
    const isApiInvalid = validateApiResponse(successResponse, apiErrorData);
    console.assert(isApiInvalid === false, 
        '❌ API error should be validated as false');
    console.log('✓ API error validated correctly');
    
    console.log('');
}

/**
 * Test Suite 3: Legacy _parseJson
 */
function testLegacyParseJson() {
    console.log('🔄 Testing legacy _parseJson...');
    
    // Test successful parsing
    const validResponse = new MockResponse({ test: 'data' });
    _parseJson(validResponse).then(result => {
        console.assert(result.test === 'data', 
            '❌ Legacy _parseJson should parse valid JSON');
        console.log('✓ Legacy _parseJson works with valid JSON');
    });
    
    // Test invalid JSON
    const invalidResponse = new MockResponse('invalid-json');
    _parseJson(invalidResponse).then(result => {
        console.assert(result === null, 
            '❌ Legacy _parseJson should return null for invalid JSON');
        console.log('✓ Legacy _parseJson handles invalid JSON');
    });
    
    console.log('');
}

/**
 * Test Suite 4: Error handling
 */
function testErrorHandling() {
    console.log('🚨 Testing error handling...');
    
    // Test createApiError
    const error = createApiError('Test error', 400, { data: 'test' });
    console.assert(error instanceof Error, 
        '❌ createApiError should return Error instance');
    console.assert(error.status === 400, 
        '❌ createApiError should set status');
    console.assert(error.isApiError === true, 
        '❌ createApiError should mark as API error');
    console.log('✓ createApiError works correctly');
    
    // Test extractApiData with valid response
    const validResponse = new MockResponse({}, { ok: true });
    const validData = { calendars: ['cal1', 'cal2'], success: true };
    const extracted = extractApiData(validResponse, validData, 'calendars');
    console.assert(Array.isArray(extracted), 
        '❌ extractApiData should extract specified key');
    console.assert(extracted.length === 2, 
        '❌ extractApiData should return correct data');
    console.log('✓ extractApiData extracts data correctly');
    
    // Test extractApiData with invalid response
    const invalidResponse = new MockResponse({}, { ok: false, status: 400 });
    const invalidData = { success: false, error: 'Bad request' };
    try {
        extractApiData(invalidResponse, invalidData);
        console.log('❌ extractApiData should throw error for invalid response');
    } catch (error) {
        console.assert(error.isApiError === true, 
            '❌ extractApiData should throw API error');
        console.log('✓ extractApiData throws error for invalid response');
    }
    
    console.log('');
}

/**
 * Test Suite 5: Caching
 */
function testCaching() {
    console.log('💾 Testing caching functionality...');
    
    // Clear cache first
    clearApiCache();
    let stats = getApiCacheStats();
    console.assert(stats.total === 0, 
        '❌ Cache should be empty after clear');
    console.log('✓ Cache clearing works');
    
    // Test cache statistics
    console.assert(typeof stats.total === 'number', 
        '❌ Cache stats should include total');
    console.assert(typeof stats.active === 'number', 
        '❌ Cache stats should include active count');
    console.assert(typeof stats.expired === 'number', 
        '❌ Cache stats should include expired count');
    console.log('✓ Cache statistics work correctly');
    
    console.log('');
}

/**
 * Test Suite 6: Integration
 */
function testIntegration() {
    console.log('🔗 Testing integration scenarios...');
    
    // Test complete workflow simulation
    const testWorkflow = async () => {
        try {
            // Simulate API configuration
            const config = {
                ...DEFAULT_API_CONFIG,
                enableLogging: false,
                timeout: 1000
            };
            
            console.log('✓ Configuration setup works');
            
            // Test cache operations
            clearApiCache();
            const stats = getApiCacheStats();
            console.assert(stats.total === 0, 
                '❌ Integration: Cache should be cleared');
            
            console.log('✓ Integration: Cache operations work');
            
            // Test error scenarios
            const error = createApiError('Integration test error', 500);
            console.assert(error.message === 'Integration test error', 
                '❌ Integration: Error creation failed');
            
            console.log('✓ Integration: Error handling works');
            
        } catch (error) {
            console.log(`❌ Integration test failed: ${error.message}`);
        }
    };
    
    testWorkflow();
    
    console.log('');
}

/**
 * Test real-world usage patterns
 */
function testRealWorldUsage() {
    console.log('🌍 Testing real-world usage patterns...');
    
    // Test CalendarsApi-like usage
    const testCalendarsApiPattern = async () => {
        const mockResponse = new MockResponse({
            success: true,
            calendars: [
                { id: '1', name: 'Work' },
                { id: '2', name: 'Personal' }
            ]
        });
        
        try {
            const data = await parseJsonResponse(mockResponse);
            const isValid = validateApiResponse(mockResponse, data);
            
            if (isValid) {
                const calendars = extractApiData(mockResponse, data, 'calendars');
                console.assert(Array.isArray(calendars), 
                    '❌ CalendarsApi pattern should extract calendars array');
                console.log('✓ CalendarsApi usage pattern works');
            }
        } catch (error) {
            console.log(`❌ CalendarsApi pattern failed: ${error.message}`);
        }
    };
    
    // Test EventsApi-like usage
    const testEventsApiPattern = async () => {
        const mockResponse = new MockResponse({
            success: true,
            event: {
                id: 'evt1',
                title: 'Test Event',
                start: new Date().toISOString()
            }
        });
        
        try {
            const data = await parseJsonResponse(mockResponse);
            const isValid = validateApiResponse(mockResponse, data);
            
            if (isValid) {
                const event = extractApiData(mockResponse, data, 'event');
                console.assert(event.title === 'Test Event', 
                    '❌ EventsApi pattern should extract event object');
                console.log('✓ EventsApi usage pattern works');
            }
        } catch (error) {
            console.log(`❌ EventsApi pattern failed: ${error.message}`);
        }
    };
    
    testCalendarsApiPattern();
    testEventsApiPattern();
    
    console.log('');
}

/**
 * Performance testing
 */
function testPerformance() {
    console.log('⚡ Testing performance...');
    
    const iterations = 1000;
    const testData = { success: true, data: 'performance test' };
    const mockResponse = new MockResponse(testData);
    
    // Test parseJsonResponse performance
    const startTime = performance.now();
    
    const promises = [];
    for (let i = 0; i < iterations; i++) {
        promises.push(parseJsonResponse(mockResponse));
    }
    
    Promise.all(promises).then(() => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`✓ ${iterations} parseJsonResponse calls: ${totalTime.toFixed(2)}ms total`);
        console.log(`✓ Average time per call: ${avgTime.toFixed(4)}ms`);
        
        // Performance should be reasonable (less than 1ms per call on average)
        console.assert(avgTime < 1, 
            '❌ Performance: parseJsonResponse should be fast');
        console.log('✓ Performance is within acceptable limits');
    });
    
    console.log('');
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.search.includes('test=api-utils')) {
    runApiUtilsTests();
    testRealWorldUsage();
    testPerformance();
}

// Export test functions for manual testing
export {
    runApiUtilsTests,
    testParseJsonResponse,
    testValidateApiResponse,
    testLegacyParseJson,
    testErrorHandling,
    testCaching,
    testIntegration,
    testRealWorldUsage,
    testPerformance,
    MockResponse,
    createMockFetch
};
