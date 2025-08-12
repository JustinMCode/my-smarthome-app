/**
 * Performance Module
 * 
 * Enterprise-grade performance monitoring and dashboard system.
 * Provides comprehensive performance tracking, metrics collection, and visualization.
 * 
 * @module Performance
 * @version 1.0.0
 * @since 2024-01-01
 */

// Export components
export { PerformanceDashboard, createPerformanceDashboard } from './components/PerformanceDashboard.js';

// Export utilities
export {
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
} from './utils/PerformanceMonitor.js';

// Default exports
export { default as PerformanceDashboard } from './components/PerformanceDashboard.js';
export { default as PerformanceMonitor } from './utils/PerformanceMonitor.js';
