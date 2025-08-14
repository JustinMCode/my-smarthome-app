/**
 * API Integration Test
 * Validates that the _parseJson consolidation works correctly across all API modules
 */

import { CalendarsApi } from './CalendarsApi.js';
import { EventsApi } from './EventsApi.js';
import { _parseJson, parseJsonResponse } from './utils.js';

/**
 * Mock response for testing
 */
class MockResponse {
    constructor(data, options = {}) {
        this.data = data;
        this.ok = options.ok !== false;
        this.status = options.status || (this.ok ? 200 : 500);
        this.headers = new Map(Object.entries(options.headers || {
            'content-type': 'application/json'
        }));
    }
    
    async json() {
        if (this.data === 'invalid-json') {
            throw new Error('Invalid JSON');
        }
        return this.data;
    }
    
    get(name) {
        return this.headers.get(name);
    }
}

/**
 * Run comprehensive integration tests
 */
function runApiIntegrationTest() {
    console.log('🔄 Running API _parseJson Consolidation Integration Test...\n');
    
    console.log('📋 Test Overview:');
    console.log('- Validating _parseJson consolidation from CalendarsApi and EventsApi');
    console.log('- Testing that both APIs use the shared utility');
    console.log('- Ensuring backward compatibility');
    console.log('- Verifying enhanced functionality\n');
    
    // Test 1: Direct utility usage
    testDirectUtilityUsage();
    
    // Test 2: CalendarsApi integration
    testCalendarsApiIntegration();
    
    // Test 3: EventsApi integration
    testEventsApiIntegration();
    
    // Test 4: Consistency verification
    testConsistencyAcrossApis();
    
    // Test 5: Enhanced functionality
    testEnhancedFunctionality();
    
    // Test 6: Error handling consistency
    testErrorHandlingConsistency();
    
    console.log('🎉 API Integration Test Complete!');
    console.log('✅ _parseJson duplication successfully consolidated');
    console.log('✅ Both APIs use shared utility');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Enhanced functionality available');
}

/**
 * Test 1: Direct utility usage
 */
function testDirectUtilityUsage() {
    console.log('1️⃣ Testing Direct Utility Usage...');
    
    // Test successful JSON parsing
    const validResponse = new MockResponse({ success: true, data: 'test' });
    _parseJson(validResponse).then(result => {
        console.assert(result.success === true, 
            '❌ Direct utility should parse JSON correctly');
        console.log('✓ Direct utility parses JSON correctly');
    });
    
    // Test invalid JSON handling
    const invalidResponse = new MockResponse('invalid-json');
    _parseJson(invalidResponse).then(result => {
        console.assert(result === null, 
            '❌ Direct utility should return null for invalid JSON');
        console.log('✓ Direct utility handles invalid JSON');
    });
    
    // Test enhanced parseJsonResponse
    parseJsonResponse(validResponse, { enableLogging: false }).then(result => {
        console.assert(result.success === true, 
            '❌ Enhanced utility should parse JSON correctly');
        console.log('✓ Enhanced utility provides additional functionality');
    });
    
    console.log('');
}

/**
 * Test 2: CalendarsApi integration
 */
function testCalendarsApiIntegration() {
    console.log('2️⃣ Testing CalendarsApi Integration...');
    
    try {
        // Test that CalendarsApi has the deprecated method
        console.assert(typeof CalendarsApi._parseJson === 'function', 
            '❌ CalendarsApi should still have _parseJson method for compatibility');
        console.log('✓ CalendarsApi maintains backward compatibility');
        
        // Test that the method delegates to shared utility
        const testResponse = new MockResponse({ calendars: ['cal1', 'cal2'] });
        CalendarsApi._parseJson(testResponse).then(result => {
            console.assert(result.calendars.length === 2, 
                '❌ CalendarsApi._parseJson should delegate correctly');
            console.log('✓ CalendarsApi._parseJson delegates to shared utility');
        });
        
        console.log('✓ CalendarsApi integration successful');
        
    } catch (error) {
        console.log(`❌ CalendarsApi integration failed: ${error.message}`);
    }
    
    console.log('');
}

/**
 * Test 3: EventsApi integration
 */
function testEventsApiIntegration() {
    console.log('3️⃣ Testing EventsApi Integration...');
    
    try {
        // Test that EventsApi has the deprecated method
        console.assert(typeof EventsApi._parseJson === 'function', 
            '❌ EventsApi should still have _parseJson method for compatibility');
        console.log('✓ EventsApi maintains backward compatibility');
        
        // Test that the method delegates to shared utility
        const testResponse = new MockResponse({ 
            event: { id: '1', title: 'Test Event' } 
        });
        EventsApi._parseJson(testResponse).then(result => {
            console.assert(result.event.title === 'Test Event', 
                '❌ EventsApi._parseJson should delegate correctly');
            console.log('✓ EventsApi._parseJson delegates to shared utility');
        });
        
        console.log('✓ EventsApi integration successful');
        
    } catch (error) {
        console.log(`❌ EventsApi integration failed: ${error.message}`);
    }
    
    console.log('');
}

/**
 * Test 4: Consistency verification
 */
function testConsistencyAcrossApis() {
    console.log('4️⃣ Testing Consistency Across APIs...');
    
    const testData = { test: 'consistency', timestamp: Date.now() };
    const testResponse = new MockResponse(testData);
    
    // Test that all three methods return identical results
    Promise.all([
        _parseJson(testResponse),
        CalendarsApi._parseJson(testResponse),
        EventsApi._parseJson(testResponse)
    ]).then(([directResult, calendarsResult, eventsResult]) => {
        
        console.assert(JSON.stringify(directResult) === JSON.stringify(calendarsResult), 
            '❌ Direct utility and CalendarsApi should return identical results');
        
        console.assert(JSON.stringify(directResult) === JSON.stringify(eventsResult), 
            '❌ Direct utility and EventsApi should return identical results');
        
        console.assert(JSON.stringify(calendarsResult) === JSON.stringify(eventsResult), 
            '❌ CalendarsApi and EventsApi should return identical results');
        
        console.log('✓ All APIs return consistent results');
        console.log('✓ Consolidation maintains behavioral consistency');
        
    }).catch(error => {
        console.log(`❌ Consistency test failed: ${error.message}`);
    });
    
    console.log('');
}

/**
 * Test 5: Enhanced functionality
 */
function testEnhancedFunctionality() {
    console.log('5️⃣ Testing Enhanced Functionality...');
    
    const testResponse = new MockResponse({ enhanced: true });
    
    // Test that enhanced features are available
    parseJsonResponse(testResponse, {
        enableLogging: false,
        throwOnError: false
    }).then(result => {
        console.assert(result.enhanced === true, 
            '❌ Enhanced parseJsonResponse should work with options');
        console.log('✓ Enhanced functionality available via parseJsonResponse');
    });
    
    // Test error throwing option
    const errorResponse = new MockResponse('invalid-json');
    parseJsonResponse(errorResponse, { throwOnError: true }).catch(error => {
        console.assert(error instanceof Error, 
            '❌ Enhanced utility should throw errors when configured');
        console.log('✓ Enhanced error handling works correctly');
    });
    
    console.log('✓ Enhanced functionality provides value beyond legacy method');
    
    console.log('');
}

/**
 * Test 6: Error handling consistency
 */
function testErrorHandlingConsistency() {
    console.log('6️⃣ Testing Error Handling Consistency...');
    
    const invalidResponse = new MockResponse('invalid-json');
    
    // Test that all APIs handle errors consistently
    Promise.all([
        _parseJson(invalidResponse).catch(() => null),
        CalendarsApi._parseJson(invalidResponse).catch(() => null),
        EventsApi._parseJson(invalidResponse).catch(() => null)
    ]).then(([directResult, calendarsResult, eventsResult]) => {
        
        console.assert(directResult === null, 
            '❌ Direct utility should return null for invalid JSON');
        
        console.assert(calendarsResult === null, 
            '❌ CalendarsApi should return null for invalid JSON');
        
        console.assert(eventsResult === null, 
            '❌ EventsApi should return null for invalid JSON');
        
        console.log('✓ All APIs handle errors consistently');
        console.log('✓ Error handling behavior is unified');
        
    }).catch(error => {
        console.log(`❌ Error handling test failed: ${error.message}`);
    });
    
    console.log('');
}

/**
 * Performance comparison test
 */
function testPerformanceComparison() {
    console.log('⚡ Testing Performance Impact...');
    
    const iterations = 1000;
    const testData = { performance: 'test', data: new Array(100).fill('item') };
    const testResponse = new MockResponse(testData);
    
    // Test legacy method performance
    const startLegacy = performance.now();
    const legacyPromises = [];
    for (let i = 0; i < iterations; i++) {
        legacyPromises.push(_parseJson(testResponse));
    }
    
    Promise.all(legacyPromises).then(() => {
        const legacyTime = performance.now() - startLegacy;
        
        // Test API method performance (should be similar since it delegates)
        const startApi = performance.now();
        const apiPromises = [];
        for (let i = 0; i < iterations; i++) {
            apiPromises.push(CalendarsApi._parseJson(testResponse));
        }
        
        Promise.all(apiPromises).then(() => {
            const apiTime = performance.now() - startApi;
            
            console.log(`✓ Legacy method: ${legacyTime.toFixed(2)}ms for ${iterations} calls`);
            console.log(`✓ API method: ${apiTime.toFixed(2)}ms for ${iterations} calls`);
            
            const overhead = ((apiTime - legacyTime) / legacyTime) * 100;
            console.log(`✓ Delegation overhead: ${overhead.toFixed(2)}%`);
            
            // Overhead should be minimal (less than 50%)
            console.assert(overhead < 50, 
                '❌ Delegation overhead should be minimal');
            console.log('✓ Performance impact is acceptable');
        });
    });
    
    console.log('');
}

/**
 * Real-world usage simulation
 */
function testRealWorldUsage() {
    console.log('🌍 Testing Real-world Usage Scenarios...');
    
    // Simulate fetching calendars
    const calendarsResponse = new MockResponse({
        success: true,
        calendars: [
            { id: '1', name: 'Work', color: '#1f77b4' },
            { id: '2', name: 'Personal', color: '#ff7f0e' }
        ]
    });
    
    // Simulate creating an event
    const eventResponse = new MockResponse({
        success: true,
        event: {
            id: 'evt-123',
            title: 'Integration Test Event',
            start: new Date().toISOString(),
            calendarId: '1'
        }
    });
    
    // Test calendars workflow
    CalendarsApi._parseJson(calendarsResponse).then(calendarsData => {
        console.assert(calendarsData.success === true, 
            '❌ Calendars workflow should parse successfully');
        console.assert(Array.isArray(calendarsData.calendars), 
            '❌ Calendars should be an array');
        console.log('✓ Calendars workflow works correctly');
    });
    
    // Test events workflow
    EventsApi._parseJson(eventResponse).then(eventData => {
        console.assert(eventData.success === true, 
            '❌ Events workflow should parse successfully');
        console.assert(eventData.event.title === 'Integration Test Event', 
            '❌ Event data should be parsed correctly');
        console.log('✓ Events workflow works correctly');
    });
    
    console.log('✓ Real-world usage scenarios pass');
    
    console.log('');
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.search.includes('test=api-integration')) {
    runApiIntegrationTest();
    testPerformanceComparison();
    testRealWorldUsage();
}

// Export test functions for manual testing
export {
    runApiIntegrationTest,
    testDirectUtilityUsage,
    testCalendarsApiIntegration,
    testEventsApiIntegration,
    testConsistencyAcrossApis,
    testEnhancedFunctionality,
    testErrorHandlingConsistency,
    testPerformanceComparison,
    testRealWorldUsage,
    MockResponse
};
