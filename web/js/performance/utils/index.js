/**
 * Performance Utilities
 * 
 * Core performance monitoring and analysis utilities.
 * 
 * @module PerformanceUtils
 * @version 1.0.0
 * @since 2024-01-01
 */

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
} from './PerformanceMonitor.js';

export { default as PerformanceMonitor } from './PerformanceMonitor.js';
