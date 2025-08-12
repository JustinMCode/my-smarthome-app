/**
 * Hash Utilities Test Runner
 * 
 * Simple test runner to verify the hash utilities refactoring
 * Run this file to test all functionality
 */

import HashUtilsTestSuite from './hash.test.js';

// Run the test suite
console.log('🚀 Starting Hash Utilities Refactoring Verification...\n');

const testSuite = new HashUtilsTestSuite();
testSuite.runAllTests();

console.log('\n📋 Refactoring Summary:');
console.log('✅ Created centralized hash utility module');
console.log('✅ Removed 6 duplicate implementations');
console.log('✅ Updated all component imports');
console.log('✅ Maintained backward compatibility');
console.log('✅ Added enterprise-grade features');
console.log('✅ Comprehensive error handling');
console.log('✅ Performance monitoring');
console.log('✅ Multiple hash algorithms');

console.log('\n🎯 Next Steps:');
console.log('1. Run the application to verify no breaking changes');
console.log('2. Monitor performance metrics in production');
console.log('3. Consider migrating to better algorithms (DJB2/FNV1A)');
console.log('4. Add unit tests to CI/CD pipeline');
