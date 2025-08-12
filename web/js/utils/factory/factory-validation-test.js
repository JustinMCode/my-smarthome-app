/**
 * Factory Consolidation Validation Test
 * 
 * Tests to validate that the factory consolidation maintains functionality
 * while eliminating duplication and improving consistency.
 * 
 * @module FactoryValidationTest
 */

// Test different import patterns to ensure they work
import { FactoryRegistry, FactoryTypes, createEventManager } from '../../../calendar/utils/factory/index.js';

/**
 * Mock core instance for testing
 */
const mockCore = {
    getEvents: (date, options) => [],
    getCurrentDate: () => new Date(),
    getCurrentView: () => 'month'
};

/**
 * Test factory consolidation
 */
export async function runFactoryValidationTests() {
    console.log('🧪 Starting Factory Consolidation Validation Tests...');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    try {
        // Test 1: FactoryRegistry direct creation
        console.log('📋 Test 1: FactoryRegistry direct creation');
        const eventManager1 = await FactoryRegistry.createManager(FactoryTypes.EVENT, mockCore, {
            rendererConfig: { showTime: true }
        });
        
        if (eventManager1 && eventManager1.createMonthEvent) {
            results.passed++;
            results.tests.push({ name: 'FactoryRegistry.createManager', status: 'PASS' });
            console.log('✅ FactoryRegistry direct creation works');
        } else {
            results.failed++;
            results.tests.push({ name: 'FactoryRegistry.createManager', status: 'FAIL', error: 'Missing expected methods' });
            console.log('❌ FactoryRegistry direct creation failed');
        }
        
        // Test 2: Convenience function creation
        console.log('📋 Test 2: Convenience function creation');
        const eventManager2 = await createEventManager(mockCore, {
            rendererConfig: { showTime: true }
        });
        
        if (eventManager2 && eventManager2.createMonthEvent) {
            results.passed++;
            results.tests.push({ name: 'createEventManager convenience function', status: 'PASS' });
            console.log('✅ Convenience function creation works');
        } else {
            results.failed++;
            results.tests.push({ name: 'createEventManager convenience function', status: 'FAIL', error: 'Missing expected methods' });
            console.log('❌ Convenience function creation failed');
        }
        
        // Test 3: Multiple manager creation
        console.log('📋 Test 3: Multiple manager creation');
        const managers = await FactoryRegistry.createManagers({
            [FactoryTypes.DATA]: { enableCaching: true },
            [FactoryTypes.EVENT]: { rendererConfig: { showTime: true } },
            [FactoryTypes.CELL]: { maxEvents: 3 }
        }, mockCore);
        
        if (managers.data && managers.event && managers.cell) {
            results.passed++;
            results.tests.push({ name: 'FactoryRegistry.createManagers', status: 'PASS' });
            console.log('✅ Multiple manager creation works');
        } else {
            results.failed++;
            results.tests.push({ name: 'FactoryRegistry.createManagers', status: 'FAIL', error: 'Missing expected managers' });
            console.log('❌ Multiple manager creation failed');
        }
        
        // Test 4: Type validation
        console.log('📋 Test 4: Type validation');
        try {
            await FactoryRegistry.createManager('invalid-type', mockCore, {});
            results.failed++;
            results.tests.push({ name: 'Type validation', status: 'FAIL', error: 'Should have thrown error for invalid type' });
            console.log('❌ Type validation failed - should have thrown error');
        } catch (error) {
            if (error.message.includes('Unsupported manager type')) {
                results.passed++;
                results.tests.push({ name: 'Type validation', status: 'PASS' });
                console.log('✅ Type validation works - correctly rejected invalid type');
            } else {
                results.failed++;
                results.tests.push({ name: 'Type validation', status: 'FAIL', error: `Unexpected error: ${error.message}` });
                console.log('❌ Type validation failed - unexpected error');
            }
        }
        
        // Test 5: Configuration validation
        console.log('📋 Test 5: Configuration validation');
        const configValidation = FactoryRegistry.validateConfig(FactoryTypes.EVENT, {
            rendererConfig: { showTime: true },
            invalidOption: 'should not cause failure'
        });
        
        if (configValidation.isValid === true) {
            results.passed++;
            results.tests.push({ name: 'Configuration validation', status: 'PASS' });
            console.log('✅ Configuration validation works');
        } else {
            results.failed++;
            results.tests.push({ name: 'Configuration validation', status: 'FAIL', error: `Validation failed: ${configValidation.errors}` });
            console.log('❌ Configuration validation failed');
        }
        
        // Test 6: Statistics tracking
        console.log('📋 Test 6: Statistics tracking');
        const stats = FactoryRegistry.getStats();
        
        if (stats.created >= 3 && stats.supportedTypes.length === 7) {
            results.passed++;
            results.tests.push({ name: 'Statistics tracking', status: 'PASS' });
            console.log('✅ Statistics tracking works');
        } else {
            results.failed++;
            results.tests.push({ name: 'Statistics tracking', status: 'FAIL', error: `Stats: created=${stats.created}, types=${stats.supportedTypes.length}` });
            console.log('❌ Statistics tracking failed');
        }
        
    } catch (error) {
        results.failed++;
        results.tests.push({ name: 'Overall test execution', status: 'FAIL', error: error.message });
        console.error('❌ Test execution failed:', error);
    }
    
    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed === 0) {
        console.log('🎉 All factory consolidation tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
    
    return results;
}

/**
 * Test performance impact of consolidation
 */
export async function runPerformanceTest() {
    console.log('\n⚡ Running Performance Test...');
    
    const iterations = 10;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        await FactoryRegistry.createManager(FactoryTypes.EVENT, mockCore, {
            rendererConfig: { showTime: true }
        });
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / iterations;
    
    console.log(`📊 Performance Results:`);
    console.log(`   Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`   Average per creation: ${averageTime.toFixed(2)}ms`);
    console.log(`   Operations per second: ${(1000 / averageTime).toFixed(0)}`);
    
    if (averageTime < 10) {
        console.log('✅ Performance is excellent');
    } else if (averageTime < 50) {
        console.log('✅ Performance is good');
    } else {
        console.log('⚠️  Performance could be improved');
    }
    
    return {
        totalTime: endTime - startTime,
        averageTime,
        opsPerSecond: 1000 / averageTime
    };
}

// Auto-run tests when imported
if (typeof window !== 'undefined') {
    console.log('🚀 Factory consolidation validation ready. Call runFactoryValidationTests() to start.');
}
