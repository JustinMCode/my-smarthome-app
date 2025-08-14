/**
 * Event Categorization Utility Tests
 * Comprehensive test suite for the event categorization system
 */

import { 
    categorizeEvent, 
    normalizeCategory,
    getAvailableCategories,
    addCustomRule,
    addCategoryAlias,
    clearCategorizationCache,
    getCategorizationStats,
    EVENT_CATEGORY_RULES,
    EVENT_CATEGORY_ALIASES,
    DEFAULT_CATEGORIZATION_OPTIONS
} from '../events/event-categorization.js';

import { CALENDAR_CONFIG } from '../basic/calendar-constants.js';

/**
 * Test helper to create mock events
 */
function createMockEvent(options = {}) {
    return {
        id: 'test-event',
        title: options.title || 'Test Event',
        description: options.description || '',
        location: options.location || '',
        start: options.start || new Date(),
        end: options.end || new Date(),
        allDay: options.allDay || false,
        ...options
    };
}

/**
 * Test helper to run all categorization tests
 */
function runCategorizationTests() {
    console.log('🧪 Starting Event Categorization Tests...\n');
    
    // Test Suite 1: Basic Categorization
    testBasicCategorization();
    
    // Test Suite 2: Keyword Matching
    testKeywordMatching();
    
    // Test Suite 3: Alias Resolution
    testAliasResolution();
    
    // Test Suite 4: Time-based Heuristics
    testTimeHeuristics();
    
    // Test Suite 5: Edge Cases
    testEdgeCases();
    
    // Test Suite 6: Configuration
    testConfiguration();
    
    // Test Suite 7: Performance
    testPerformance();
    
    console.log('✅ All Event Categorization Tests Complete!\n');
}

/**
 * Test Suite 1: Basic Categorization
 */
function testBasicCategorization() {
    console.log('📋 Testing Basic Categorization...');
    
    const testCases = [
        {
            name: 'Work meeting',
            event: createMockEvent({ title: 'Team Meeting' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.WORK
        },
        {
            name: 'Family dinner',
            event: createMockEvent({ title: 'Dinner with family' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY
        },
        {
            name: 'Doctor appointment',
            event: createMockEvent({ title: 'Doctor appointment' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH
        },
        {
            name: 'Party invitation',
            event: createMockEvent({ title: 'Birthday party' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL
        },
        {
            name: 'Personal time',
            event: createMockEvent({ title: 'Me time - reading' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL
        },
        {
            name: 'Unknown event',
            event: createMockEvent({ title: 'Random event' }),
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER
        }
    ];
    
    testCases.forEach(({ name, event, expected }) => {
        const result = categorizeEvent(event);
        console.assert(result === expected, 
            `❌ ${name}: Expected ${expected}, got ${result}`);
        console.log(`✓ ${name}: ${result}`);
    });
    
    console.log('');
}

/**
 * Test Suite 2: Keyword Matching
 */
function testKeywordMatching() {
    console.log('🔍 Testing Keyword Matching...');
    
    const workKeywords = ['meeting', 'office', 'team', 'project', 'client', 'business'];
    const healthKeywords = ['gym', 'workout', 'doctor', 'medical', 'fitness'];
    const socialKeywords = ['party', 'dinner', 'celebration', 'friends'];
    
    // Test work keywords
    workKeywords.forEach(keyword => {
        const event = createMockEvent({ title: `Important ${keyword} today` });
        const result = categorizeEvent(event);
        console.assert(result === CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
            `❌ Work keyword "${keyword}": Expected work, got ${result}`);
        console.log(`✓ Work keyword "${keyword}": ${result}`);
    });
    
    // Test health keywords
    healthKeywords.forEach(keyword => {
        const event = createMockEvent({ title: `${keyword} session` });
        const result = categorizeEvent(event);
        console.assert(result === CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
            `❌ Health keyword "${keyword}": Expected health, got ${result}`);
        console.log(`✓ Health keyword "${keyword}": ${result}`);
    });
    
    // Test description matching
    const descriptionEvent = createMockEvent({
        title: 'Event',
        description: 'This is a work meeting with the project team'
    });
    const descResult = categorizeEvent(descriptionEvent);
    console.assert(descResult === CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
        `❌ Description matching: Expected work, got ${descResult}`);
    console.log(`✓ Description matching: ${descResult}`);
    
    console.log('');
}

/**
 * Test Suite 3: Alias Resolution
 */
function testAliasResolution() {
    console.log('🔄 Testing Alias Resolution...');
    
    const aliasTests = [
        { text: 'gym session', expected: CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH },
        { text: 'coffee with friends', expected: CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL },
        { text: 'meet with client', expected: CALENDAR_CONFIG.EVENT_CATEGORIES.WORK },
        { text: 'dr appointment', expected: CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH }
    ];
    
    aliasTests.forEach(({ text, expected }) => {
        const event = createMockEvent({ title: text });
        const result = categorizeEvent(event);
        console.assert(result === expected,
            `❌ Alias "${text}": Expected ${expected}, got ${result}`);
        console.log(`✓ Alias "${text}": ${result}`);
    });
    
    console.log('');
}

/**
 * Test Suite 4: Time-based Heuristics
 */
function testTimeHeuristics() {
    console.log('⏰ Testing Time-based Heuristics...');
    
    // Business hours work event
    const workTime = new Date();
    workTime.setHours(10, 0, 0, 0); // 10 AM
    const businessHoursEvent = createMockEvent({
        title: 'Important meeting',
        start: workTime
    });
    
    const workResult = categorizeEvent(businessHoursEvent, { enableTimeHeuristics: true });
    console.log(`✓ Business hours meeting: ${workResult}`);
    
    // Evening social event
    const eveningTime = new Date();
    eveningTime.setHours(19, 0, 0, 0); // 7 PM
    const socialEvent = createMockEvent({
        title: 'Get together',
        start: eveningTime
    });
    
    const socialResult = categorizeEvent(socialEvent, { enableTimeHeuristics: true });
    console.log(`✓ Evening social event: ${socialResult}`);
    
    // Test without time heuristics
    const noTimeResult = categorizeEvent(businessHoursEvent, { enableTimeHeuristics: false });
    console.log(`✓ No time heuristics: ${noTimeResult}`);
    
    console.log('');
}

/**
 * Test Suite 5: Edge Cases
 */
function testEdgeCases() {
    console.log('🚨 Testing Edge Cases...');
    
    // Null/undefined event
    try {
        const nullResult = categorizeEvent(null);
        console.assert(nullResult === CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER,
            `❌ Null event: Expected other, got ${nullResult}`);
        console.log(`✓ Null event handled: ${nullResult}`);
    } catch (error) {
        console.log(`❌ Null event threw error: ${error.message}`);
    }
    
    // Empty event
    const emptyEvent = createMockEvent({ title: '', description: '', location: '' });
    const emptyResult = categorizeEvent(emptyEvent);
    console.assert(emptyResult === CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER,
        `❌ Empty event: Expected other, got ${emptyResult}`);
    console.log(`✓ Empty event: ${emptyResult}`);
    
    // Mixed category keywords
    const mixedEvent = createMockEvent({
        title: 'Work meeting about family health'
    });
    const mixedResult = categorizeEvent(mixedEvent);
    console.log(`✓ Mixed keywords: ${mixedResult}`);
    
    // Very long text
    const longText = 'work '.repeat(100) + 'meeting';
    const longEvent = createMockEvent({ title: longText });
    const longResult = categorizeEvent(longEvent);
    console.assert(longResult === CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
        `❌ Long text: Expected work, got ${longResult}`);
    console.log(`✓ Long text handled: ${longResult}`);
    
    console.log('');
}

/**
 * Test Suite 6: Configuration
 */
function testConfiguration() {
    console.log('⚙️ Testing Configuration...');
    
    // Test normalizeCategory
    const normalizeTests = [
        { input: 'WORK', expected: 'work' },
        { input: 'Work', expected: 'work' },
        { input: 'invalid', expected: 'other' },
        { input: '', expected: 'other' },
        { input: null, expected: 'other' }
    ];
    
    normalizeTests.forEach(({ input, expected }) => {
        const result = normalizeCategory(input);
        console.assert(result === expected,
            `❌ Normalize "${input}": Expected ${expected}, got ${result}`);
        console.log(`✓ Normalize "${input}": ${result}`);
    });
    
    // Test getAvailableCategories
    const categories = getAvailableCategories();
    console.assert(Array.isArray(categories) && categories.length > 0,
        '❌ getAvailableCategories should return non-empty array');
    console.log(`✓ Available categories: ${categories.join(', ')}`);
    
    // Test custom rules
    try {
        addCustomRule('work', {
            keywords: ['custom-work-keyword'],
            patterns: [/custom-pattern/i]
        });
        
        const customEvent = createMockEvent({ title: 'custom-work-keyword event' });
        const customResult = categorizeEvent(customEvent);
        console.assert(customResult === CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
            `❌ Custom rule: Expected work, got ${customResult}`);
        console.log(`✓ Custom rule added: ${customResult}`);
    } catch (error) {
        console.log(`❌ Custom rule error: ${error.message}`);
    }
    
    // Test cache clearing
    clearCategorizationCache();
    const stats = getCategorizationStats();
    console.assert(stats.cacheSize === 0,
        `❌ Cache clear: Expected 0, got ${stats.cacheSize}`);
    console.log(`✓ Cache cleared: ${stats.cacheSize} entries`);
    
    console.log('');
}

/**
 * Test Suite 7: Performance
 */
function testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const iterations = 1000;
    const testEvent = createMockEvent({
        title: 'Team meeting about project status',
        description: 'Weekly sync meeting with the development team'
    });
    
    // Test without cache
    clearCategorizationCache();
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        categorizeEvent(testEvent, { cacheResults: false });
    }
    
    const noCacheTime = performance.now() - startTime;
    
    // Test with cache
    clearCategorizationCache();
    const cacheStartTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        categorizeEvent(testEvent, { cacheResults: true });
    }
    
    const cacheTime = performance.now() - cacheStartTime;
    
    console.log(`✓ ${iterations} categorizations without cache: ${noCacheTime.toFixed(2)}ms`);
    console.log(`✓ ${iterations} categorizations with cache: ${cacheTime.toFixed(2)}ms`);
    console.log(`✓ Cache performance improvement: ${((noCacheTime - cacheTime) / noCacheTime * 100).toFixed(1)}%`);
    
    // Test cache stats
    const finalStats = getCategorizationStats();
    console.log(`✓ Final cache size: ${finalStats.cacheSize}`);
    console.log(`✓ Total rules: ${finalStats.totalRules}`);
    console.log(`✓ Total aliases: ${finalStats.totalAliases}`);
    
    console.log('');
}

/**
 * Test debug mode functionality
 */
function testDebugMode() {
    console.log('🐛 Testing Debug Mode...');
    
    const debugEvent = createMockEvent({
        title: 'Team meeting',
        description: 'Weekly project sync'
    });
    
    // Capture console output
    const originalLog = console.log;
    let debugOutput = '';
    console.log = (message) => {
        debugOutput += message;
    };
    
    categorizeEvent(debugEvent, { debugMode: true });
    
    // Restore console.log
    console.log = originalLog;
    
    console.assert(debugOutput.includes('Event Categorization Debug'),
        '❌ Debug mode should produce debug output');
    console.log('✓ Debug mode produces detailed output');
    
    console.log('');
}

/**
 * Integration test with real-world events
 */
function testRealWorldEvents() {
    console.log('🌍 Testing Real-world Events...');
    
    const realEvents = [
        {
            title: 'Daily Standup - Engineering Team',
            description: 'Sprint planning and progress review',
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.WORK
        },
        {
            title: 'Lunch with Mom',
            location: 'Downtown Restaurant',
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY
        },
        {
            title: 'Yoga Class',
            description: 'Weekly wellness session',
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH
        },
        {
            title: 'Wine Tasting Event',
            description: 'Social gathering with friends',
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL
        },
        {
            title: 'Journal Writing',
            description: 'Personal reflection time',
            expected: CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL
        }
    ];
    
    realEvents.forEach(({ title, description = '', location = '', expected }) => {
        const event = createMockEvent({ title, description, location });
        const result = categorizeEvent(event);
        console.assert(result === expected,
            `❌ Real event "${title}": Expected ${expected}, got ${result}`);
        console.log(`✓ Real event "${title}": ${result}`);
    });
    
    console.log('');
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.search.includes('test=categorization')) {
    runCategorizationTests();
    testDebugMode();
    testRealWorldEvents();
}

// Export test functions for manual testing
export {
    runCategorizationTests,
    testBasicCategorization,
    testKeywordMatching,
    testAliasResolution,
    testTimeHeuristics,
    testEdgeCases,
    testConfiguration,
    testPerformance,
    testDebugMode,
    testRealWorldEvents,
    createMockEvent
};
