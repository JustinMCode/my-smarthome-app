/**
 * Performance Monitor Module
 * 
 * Enterprise-grade performance monitoring system for the application.
 * Provides comprehensive performance tracking, metrics collection, and optimization insights.
 * 
 * @module PerformanceMonitor
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Performance metric types
 * @enum {string}
 */
export const METRIC_TYPES = {
    /** Execution time measurements */
    TIMING: 'timing',
    /** Memory usage measurements */
    MEMORY: 'memory',
    /** Cache hit/miss ratios */
    CACHE: 'cache',
    /** Error rates and types */
    ERROR: 'error',
    /** User interaction metrics */
    INTERACTION: 'interaction',
    /** Resource loading metrics */
    RESOURCE: 'resource'
};

/**
 * Performance thresholds for alerts
 * @enum {number}
 */
export const PERFORMANCE_THRESHOLDS = {
    /** Critical performance threshold (ms) */
    CRITICAL: 1000,
    /** Warning performance threshold (ms) */
    WARNING: 500,
    /** Optimal performance threshold (ms) */
    OPTIMAL: 100,
    /** Memory usage threshold (MB) */
    MEMORY_WARNING: 50,
    /** Cache miss rate threshold (%) */
    CACHE_MISS_WARNING: 20
};

/**
 * Performance monitoring configuration
 * @type {Object}
 */
const DEFAULT_CONFIG = {
    /** Enable performance monitoring */
    enabled: true,
    /** Sample rate for metrics (0-1) */
    sampleRate: 1.0,
    /** Maximum number of metrics to store */
    maxMetrics: 10000,
    /** Metrics retention period (ms) */
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    /** Enable real-time alerts */
    enableAlerts: true,
    /** Performance thresholds */
    thresholds: PERFORMANCE_THRESHOLDS,
    /** Enable memory monitoring */
    enableMemoryMonitoring: true,
    /** Enable cache monitoring */
    enableCacheMonitoring: true,
    /** Enable error tracking */
    enableErrorTracking: true
};

/**
 * Performance Monitor Class
 * Provides comprehensive performance monitoring capabilities
 */
export class PerformanceMonitor {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.metrics = new Map();
        this.alerts = [];
        this.startTime = Date.now();
        this.isInitialized = false;
        
        // Initialize monitoring
        this.initialize();
    }

    /**
     * Initialize the performance monitor
     * @private
     */
    initialize() {
        if (this.isInitialized) return;

        try {
            // Set up memory monitoring
            if (this.config.enableMemoryMonitoring) {
                this.setupMemoryMonitoring();
            }

            // Set up cache monitoring
            if (this.config.enableCacheMonitoring) {
                this.setupCacheMonitoring();
            }

            // Set up error tracking
            if (this.config.enableErrorTracking) {
                this.setupErrorTracking();
            }

            // Set up periodic cleanup
            this.setupCleanup();

            this.isInitialized = true;
            console.log('Performance Monitor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Performance Monitor:', error);
        }
    }

    /**
     * Set up memory monitoring
     * @private
     */
    setupMemoryMonitoring() {
        // Only set up memory monitoring in browser environment with performance.memory
        if (typeof window === 'undefined' || typeof performance === 'undefined' || !performance.memory) {
            return;
        }

        setInterval(() => {
            const memoryInfo = performance.memory;
            this.recordMetric('memory.usage', {
                used: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
                total: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
                limit: memoryInfo.jsHeapSizeLimit / 1024 / 1024 // MB
            });
        }, 5000); // Every 5 seconds
    }

    /**
     * Set up cache monitoring
     * @private
     */
    setupCacheMonitoring() {
        // Monitor cache operations
        this.cacheStats = {
            hits: 0,
            misses: 0,
            operations: 0
        };
    }

    /**
     * Set up error tracking
     * @private
     */
    setupErrorTracking() {
        // Only set up error tracking in browser environment
        if (typeof window === 'undefined') {
            return;
        }

        // Track unhandled errors
        window.addEventListener('error', (event) => {
            this.recordError('unhandled', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('unhandled-promise', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    /**
     * Set up periodic cleanup of old metrics
     * @private
     */
    setupCleanup() {
        setInterval(() => {
            this.cleanupOldMetrics();
        }, 60000); // Every minute
    }

    /**
     * Clean up old metrics based on retention period
     * @private
     */
    cleanupOldMetrics() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        
        for (const [name, metrics] of this.metrics) {
            const filteredMetrics = metrics.filter(metric => metric.timestamp > cutoffTime);
            
            if (filteredMetrics.length === 0) {
                this.metrics.delete(name);
            } else {
                this.metrics.set(name, filteredMetrics);
            }
        }

        // Clean up old alerts
        this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
    }

    /**
     * Measure execution time of a function
     * @param {string} name - Metric name
     * @param {Function} fn - Function to measure
     * @param {Array} args - Function arguments
     * @param {Object} options - Measurement options
     * @returns {*} Function result
     */
    measure(name, fn, args = [], options = {}) {
        if (!this.config.enabled) {
            return fn.apply(null, args);
        }

        const startTime = performance.now();
        let result;
        let error;

        try {
            result = fn.apply(null, args);
        } catch (err) {
            error = err;
            throw err;
        } finally {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.recordMetric(name, {
                duration,
                timestamp: Date.now(),
                success: !error,
                error: error ? error.message : null
            });

            // Check for performance alerts
            if (this.config.enableAlerts) {
                this.checkPerformanceAlert(name, duration);
            }
        }

        return result;
    }

    /**
     * Record a performance metric
     * @param {string} name - Metric name
     * @param {Object} data - Metric data
     */
    recordMetric(name, data) {
        if (!this.config.enabled) return;

        try {
            const metric = {
                name,
                value: data.duration || data.value || 0,
                timestamp: data.timestamp || Date.now(),
                metadata: data
            };

            if (!this.metrics.has(name)) {
                this.metrics.set(name, []);
            }

            const metrics = this.metrics.get(name);
            metrics.push(metric);

            // Limit the number of metrics per name
            if (metrics.length > this.config.maxMetrics) {
                metrics.shift();
            }

            // Check for memory alerts
            if (name === 'memory.usage' && data.used) {
                this.checkMemoryAlert(data.used);
            }
        } catch (error) {
            console.warn('Failed to record metric:', error);
        }
    }

    /**
     * Record cache operation metric
     * @param {string} cacheName - Cache name
     * @param {string} operation - Operation type (hit/miss/set)
     * @param {Object} data - Additional data
     */
    recordCacheMetric(cacheName, operation, data = {}) {
        if (!this.config.enabled) return;

        this.cacheStats.operations++;
        
        if (operation === 'hit') {
            this.cacheStats.hits++;
        } else if (operation === 'miss') {
            this.cacheStats.misses++;
        }

        this.recordMetric(`cache.${cacheName}.${operation}`, {
            ...data,
            cacheStats: { ...this.cacheStats }
        });
    }

    /**
     * Record an error
     * @param {string} context - Error context
     * @param {Error|Object} error - Error object or data
     */
    recordError(context, error) {
        if (!this.config.enabled) return;

        try {
            const errorData = {
                context,
                message: error.message || error.reason || 'Unknown error',
                timestamp: Date.now(),
                stack: error.stack,
                metadata: error
            };

            this.recordMetric(`error.${context}`, errorData);

            // Create alert for critical errors
            if (this.config.enableAlerts) {
                this.createAlert('error', `Error in ${context}: ${errorData.message}`, 'critical');
            }
        } catch (err) {
            console.warn('Failed to record error:', err);
        }
    }

    /**
     * Record user interaction
     * @param {string} interaction - Interaction type
     * @param {Object} data - Interaction data
     */
    recordInteraction(interaction, data = {}) {
        if (!this.config.enabled) return;

        this.recordMetric(`interaction.${interaction}`, {
            ...data,
            timestamp: Date.now()
        });
    }

    /**
     * Get metrics by name
     * @param {string} name - Metric name (optional)
     * @param {Object} options - Query options
     * @returns {Array} Array of metrics
     */
    getMetrics(name = null, options = {}) {
        const { limit, since } = options;
        let metrics = [];

        if (name) {
            metrics = this.metrics.get(name) || [];
        } else {
            // Get all metrics
            for (const metricList of this.metrics.values()) {
                metrics.push(...metricList);
            }
        }

        // Filter by timestamp if specified
        if (since) {
            metrics = metrics.filter(metric => metric.timestamp >= since);
        }

        // Sort by timestamp (newest first)
        metrics.sort((a, b) => b.timestamp - a.timestamp);

        // Apply limit
        if (limit) {
            metrics = metrics.slice(0, limit);
        }

        return metrics;
    }

    /**
     * Get statistics for a metric
     * @param {string} name - Metric name
     * @param {Object} options - Query options
     * @returns {Object} Statistics object
     */
    getStatistics(name, options = {}) {
        const metrics = this.getMetrics(name, options);
        
        if (metrics.length === 0) {
            return {
                count: 0,
                average: 0,
                min: 0,
                max: 0,
                total: 0
            };
        }

        const values = metrics.map(m => m.value).filter(v => typeof v === 'number');
        
        if (values.length === 0) {
            return {
                count: metrics.length,
                average: 0,
                min: 0,
                max: 0,
                total: 0
            };
        }

        const total = values.reduce((sum, val) => sum + val, 0);
        const average = total / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            count: values.length,
            average,
            min,
            max,
            total
        };
    }

    /**
     * Get performance report
     * @returns {Object} Performance report
     */
    getReport() {
        const now = Date.now();
        const uptime = now - this.startTime;

        // Calculate overall statistics
        const allMetrics = this.getMetrics();
        const timingMetrics = allMetrics.filter(m => m.name.includes('timing') || m.name.includes('duration'));
        const memoryMetrics = this.getMetrics('memory.usage');
        const errorMetrics = allMetrics.filter(m => m.name.startsWith('error'));

        // Calculate cache hit rate
        const cacheHits = this.cacheStats.hits;
        const cacheMisses = this.cacheStats.misses;
        const cacheHitRate = (cacheHits + cacheMisses) > 0 ? 
            (cacheHits / (cacheHits + cacheMisses)) * 100 : 0;

        // Calculate error rate
        const totalOperations = allMetrics.length;
        const errorRate = totalOperations > 0 ? 
            (errorMetrics.length / totalOperations) * 100 : 0;

        return {
            uptime,
            totalMetrics: allMetrics.length,
            averageResponseTime: timingMetrics.length > 0 ? 
                timingMetrics.reduce((sum, m) => sum + m.value, 0) / timingMetrics.length : 0,
            memoryUsage: memoryMetrics.length > 0 ? 
                memoryMetrics[memoryMetrics.length - 1].metadata.used : 0,
            cacheHitRate,
            errorRate,
            activeAlerts: this.alerts.filter(a => a.active).length,
            lastUpdated: now
        };
    }

    /**
     * Get active alerts
     * @returns {Array} Array of active alerts
     */
    getAlerts() {
        return this.alerts.filter(alert => alert.active);
    }

    /**
     * Create a new alert
     * @param {string} type - Alert type
     * @param {string} message - Alert message
     * @param {string} level - Alert level (warning/critical)
     * @param {Object} metadata - Additional metadata
     */
    createAlert(type, message, level = 'warning', metadata = {}) {
        const alert = {
            id: Date.now() + Math.random(),
            type,
            message,
            level,
            timestamp: Date.now(),
            active: true,
            metadata
        };

        this.alerts.push(alert);

        // Limit the number of alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }

        // Log alert
        console.warn(`Performance Alert [${level.toUpperCase()}]: ${message}`);
    }

    /**
     * Check for performance alerts
     * @param {string} name - Metric name
     * @param {number} duration - Execution duration
     * @private
     */
    checkPerformanceAlert(name, duration) {
        const thresholds = this.config.thresholds;

        if (duration >= thresholds.CRITICAL) {
            this.createAlert('performance', 
                `Critical performance issue: ${name} took ${duration.toFixed(2)}ms`, 
                'critical', 
                { metric: name, duration }
            );
        } else if (duration >= thresholds.WARNING) {
            this.createAlert('performance', 
                `Performance warning: ${name} took ${duration.toFixed(2)}ms`, 
                'warning', 
                { metric: name, duration }
            );
        }
    }

    /**
     * Check for memory alerts
     * @param {number} memoryUsage - Memory usage in MB
     * @private
     */
    checkMemoryAlert(memoryUsage) {
        if (memoryUsage >= this.config.thresholds.MEMORY_WARNING) {
            this.createAlert('memory', 
                `High memory usage: ${memoryUsage.toFixed(1)}MB`, 
                'warning', 
                { memoryUsage }
            );
        }
    }

    /**
     * Reset all metrics and alerts
     */
    reset() {
        this.metrics.clear();
        this.alerts = [];
        this.cacheStats = { hits: 0, misses: 0, operations: 0 };
        this.startTime = Date.now();
    }

    /**
     * Enable or disable monitoring
     * @param {boolean} enabled - Whether to enable monitoring
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const measure = (name, fn, args, options) => 
    performanceMonitor.measure(name, fn, args, options);

export const recordMetric = (name, data) => 
    performanceMonitor.recordMetric(name, data);

export const recordCacheMetric = (cacheName, operation, data) => 
    performanceMonitor.recordCacheMetric(cacheName, operation, data);

export const recordError = (context, error) => 
    performanceMonitor.recordError(context, error);

export const recordInteraction = (interaction, data) => 
    performanceMonitor.recordInteraction(interaction, data);

export const getMetrics = (name, options) => 
    performanceMonitor.getMetrics(name, options);

export const getStatistics = (name, options) => 
    performanceMonitor.getStatistics(name, options);

export const getReport = () => 
    performanceMonitor.getReport();

export default performanceMonitor;
