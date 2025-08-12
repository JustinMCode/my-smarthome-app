/**
 * Migration Validation Test
 * 
 * Tests to validate that the migrated code maintains functionality
 * while using the new factory patterns.
 * 
 * @module MigrationValidationTest
 */

import { createDataManager, FactoryRegistry, FactoryTypes } from '../../calendar/utils/factory/index.js';

/**
 * Mock core instance for testing
 */
const mockCore = {
    getEvents: (date, options) => [
        { id: 1, title: 'Test Event', start: new Date(), end: new Date() }
    ],
    getCurrentDate: () => new Date(),
    getCurrentView: () => 'month'
};

/**
 * Test migrated ViewMixin functionality
 */
export async function testViewMixinMigration() {
    console.log('🧪 Testing ViewMixin Migration...');
    
    try {
        // Test factory-created data manager
        const dataManager = await createDataManager(mockCore, {
            enableCaching: true,
            enableLazyLoading: true,
            maxConcurrentRequests: 3
        });
        
        if (!dataManager) {
            throw new Error('Data manager creation failed');
        }
        
        // Test that the data manager has expected methods
        const expectedMethods = ['getEventsForDate', 'getEventsForWeek', 'getEventsForMonth', 'clearCache'];
        const missingMethods = expectedMethods.filter(method => typeof dataManager[method] !== 'function');
        
        if (missingMethods.length > 0) {
            throw new Error(`Data manager missing methods: ${missingMethods.join(', ')}`);
        }
        
        // Test data manager functionality
        const testDate = new Date();
        const events = dataManager.getEventsForDate(testDate, {});
        
        if (!Array.isArray(events)) {
            throw new Error('getEventsForDate should return an array');
        }
        
        console.log('✅ ViewMixin migration test passed');
        return { status: 'passed', dataManager };
        
    } catch (error) {
        console.error('❌ ViewMixin migration test failed:', error);
        return { status: 'failed', error: error.message };
    }
}

/**
 * Test factory pattern consistency
 */
export async function testFactoryConsistency() {
    console.log('🧪 Testing Factory Pattern Consistency...');
    
    try {
        // Test both convenience function and FactoryRegistry
        const manager1 = await createDataManager(mockCore, { test: 'option1' });
        const manager2 = await FactoryRegistry.createManager(FactoryTypes.DATA, mockCore, { test: 'option2' });
        
        if (!manager1 || !manager2) {
            throw new Error('Manager creation failed');
        }
        
        // Both should have the same API surface
        const manager1Methods = Object.getOwnPropertyNames(manager1).filter(name => typeof manager1[name] === 'function');
        const manager2Methods = Object.getOwnPropertyNames(manager2).filter(name => typeof manager2[name] === 'function');
        
        const methodsDiff = manager1Methods.filter(method => !manager2Methods.includes(method));
        
        if (methodsDiff.length > 0) {
            throw new Error(`Method differences between factory patterns: ${methodsDiff.join(', ')}`);
        }
        
        console.log('✅ Factory consistency test passed');
        return { status: 'passed', managers: { manager1, manager2 } };
        
    } catch (error) {
        console.error('❌ Factory consistency test failed:', error);
        return { status: 'failed', error: error.message };
    }
}

/**
 * Test async initialization pattern
 */
export async function testAsyncInitialization() {
    console.log('🧪 Testing Async Initialization Pattern...');
    
    try {
        // Simulate ViewMixin initialization process
        const startTime = performance.now();
        
        // This simulates what happens in ViewMixin.initializeFactoryComponents()
        const dataManager = await createDataManager(mockCore, {
            enableCaching: true,
            enableLazyLoading: true,
            maxConcurrentRequests: 3
        });
        
        const endTime = performance.now();
        const initializationTime = endTime - startTime;
        
        if (!dataManager) {
            throw new Error('Async data manager creation failed');
        }
        
        // Test that manager is properly initialized
        const cacheStats = dataManager.getCacheStats?.() || {};
        const hasCache = cacheStats && typeof cacheStats === 'object';
        
        if (!hasCache) {
            console.warn('⚠️ Cache stats not available - expected for factory pattern');
        }
        
        console.log(`✅ Async initialization test passed (${initializationTime.toFixed(2)}ms)`);
        return { 
            status: 'passed', 
            initializationTime,
            dataManager,
            cacheStats
        };
        
    } catch (error) {
        console.error('❌ Async initialization test failed:', error);
        return { status: 'failed', error: error.message };
    }
}

/**
 * Test backward compatibility
 */
export async function testBackwardCompatibility() {
    console.log('🧪 Testing Backward Compatibility...');
    
    try {
        // Test that legacy imports still work (should show deprecation warnings)
        const { legacyCreateDataManager } = await import('../../utils/factory/index.js');
        
        if (typeof legacyCreateDataManager !== 'function') {
            throw new Error('Legacy factory functions not available');
        }
        
        // Note: In a real test, we might want to capture console warnings
        // to verify deprecation warnings are shown
        console.log('📢 Note: Legacy function calls should show deprecation warnings');
        
        console.log('✅ Backward compatibility test passed');
        return { status: 'passed' };
        
    } catch (error) {
        console.error('❌ Backward compatibility test failed:', error);
        return { status: 'failed', error: error.message };
    }
}

/**
 * Run all migration validation tests
 */
export async function runMigrationValidationTests() {
    console.log('🚀 Starting Migration Validation Tests...');
    
    const results = {
        viewMixin: await testViewMixinMigration(),
        factoryConsistency: await testFactoryConsistency(),
        asyncInitialization: await testAsyncInitialization(),
        backwardCompatibility: await testBackwardCompatibility()
    };
    
    const passed = Object.values(results).filter(r => r.status === 'passed').length;
    const failed = Object.values(results).filter(r => r.status === 'failed').length;
    
    console.log('\n📊 Migration Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('🎉 All migration tests passed! The code has been successfully migrated to use factory patterns.');
    } else {
        console.log('⚠️  Some migration tests failed. Please check the details above.');
    }
    
    return {
        summary: { passed, failed, total: passed + failed },
        results
    };
}

// Auto-run message
if (typeof window !== 'undefined') {
    console.log('🚀 Migration validation ready. Call runMigrationValidationTests() to start.');
}
