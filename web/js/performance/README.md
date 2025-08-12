# Performance Module

Enterprise-grade performance monitoring and dashboard system for the application. This module provides comprehensive performance tracking, metrics collection, and visualization capabilities.

## 📁 Module Structure

```
web/js/performance/
├── components/
│   ├── PerformanceDashboard.js    # Real-time performance dashboard UI
│   └── index.js                   # Component exports
├── utils/
│   ├── PerformanceMonitor.js      # Core performance monitoring engine
│   ├── performance.test.js        # Comprehensive test suite
│   ├── test-runner.js             # Test execution utility
│   └── index.js                   # Utility exports
├── index.js                       # Main module exports
└── README.md                      # This file
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { createPerformanceDashboard, performanceMonitor } from './js/performance/index.js';

// Create dashboard
const container = document.getElementById('performance-dashboard');
const dashboard = createPerformanceDashboard(container, {
    updateInterval: 5000,
    showAlerts: true,
    showMetrics: true
});

// Show dashboard
dashboard.show();

// Record performance metrics
performanceMonitor.recordMetric('api.request', {
    duration: 150,
    endpoint: '/api/events',
    success: true
});

// Measure function execution time
const result = performanceMonitor.measure('data.processing', processData, [data]);
```

### Advanced Usage

```javascript
import { 
    PerformanceMonitor, 
    METRIC_TYPES, 
    PERFORMANCE_THRESHOLDS 
} from './js/performance/index.js';

// Create custom monitor with configuration
const customMonitor = new PerformanceMonitor({
    enabled: true,
    maxMetrics: 5000,
    enableAlerts: true,
    thresholds: {
        ...PERFORMANCE_THRESHOLDS,
        CRITICAL: 2000, // Custom critical threshold
        WARNING: 800    // Custom warning threshold
    }
});

// Record different types of metrics
customMonitor.recordMetric('memory.usage', {
    used: 45.2,
    total: 100.0,
    limit: 200.0
});

customMonitor.recordCacheMetric('events-cache', 'hit', {
    key: 'events-2024-01',
    size: 1024
});

customMonitor.recordError('api.error', new Error('Network timeout'));

customMonitor.recordInteraction('button-click', {
    element: 'save-button',
    action: 'click',
    timestamp: Date.now()
});

// Get performance statistics
const stats = customMonitor.getStatistics('api.request');
console.log(`Average response time: ${stats.average}ms`);

// Get comprehensive report
const report = customMonitor.getReport();
console.log('Performance Report:', report);
```

## 📊 Performance Dashboard

The Performance Dashboard provides a real-time interface for monitoring application performance:

### Features

- **Real-time Metrics**: Live updates of key performance indicators
- **Alert System**: Visual notifications for performance issues
- **Memory Monitoring**: Memory usage tracking and visualization
- **Cache Analytics**: Cache hit/miss rate monitoring
- **Error Tracking**: Error rate and type analysis
- **Optimization Suggestions**: AI-powered performance recommendations

### Dashboard Configuration

```javascript
const dashboard = createPerformanceDashboard(container, {
    updateInterval: 5000,        // Update frequency (ms)
    maxDataPoints: 100,          // Maximum data points to display
    enableCharts: true,          // Enable chart visualizations
    showAlerts: true,            // Show performance alerts
    showMetrics: true,           // Show detailed metrics
    showMemory: true             // Show memory usage
});
```

### Dashboard Controls

- **Minimize/Maximize**: Toggle dashboard visibility
- **Close**: Hide dashboard completely
- **Tab Navigation**: Switch between Metrics, Memory, and Optimization views

## 🔧 Performance Monitor API

### Core Methods

#### `measure(name, fn, args, options)`
Measure execution time of a function.

```javascript
const result = performanceMonitor.measure('data.processing', processData, [input], {
    timeout: 5000
});
```

#### `recordMetric(name, data)`
Record a custom performance metric.

```javascript
performanceMonitor.recordMetric('api.response.time', {
    duration: 250,
    endpoint: '/api/users',
    status: 200,
    timestamp: Date.now()
});
```

#### `recordCacheMetric(cacheName, operation, data)`
Record cache operation metrics.

```javascript
performanceMonitor.recordCacheMetric('user-cache', 'hit', {
    key: 'user-123',
    size: 2048
});
```

#### `recordError(context, error)`
Record application errors.

```javascript
try {
    // Some operation
} catch (error) {
    performanceMonitor.recordError('data.validation', error);
}
```

#### `recordInteraction(interaction, data)`
Record user interactions.

```javascript
performanceMonitor.recordInteraction('form.submit', {
    formId: 'user-form',
    fieldCount: 5,
    validationTime: 50
});
```

### Query Methods

#### `getMetrics(name, options)`
Retrieve metrics by name with optional filtering.

```javascript
const recentMetrics = performanceMonitor.getMetrics('api.request', {
    limit: 10,
    since: Date.now() - 3600000 // Last hour
});
```

#### `getStatistics(name, options)`
Get statistical analysis of metrics.

```javascript
const stats = performanceMonitor.getStatistics('api.request');
// Returns: { count, average, min, max, total }
```

#### `getReport()`
Get comprehensive performance report.

```javascript
const report = performanceMonitor.getReport();
// Returns: { uptime, totalMetrics, averageResponseTime, memoryUsage, cacheHitRate, errorRate, activeAlerts }
```

#### `getAlerts()`
Get active performance alerts.

```javascript
const alerts = performanceMonitor.getAlerts();
// Returns array of active alerts with type, message, level, timestamp
```

### Configuration

#### Performance Thresholds

```javascript
const PERFORMANCE_THRESHOLDS = {
    CRITICAL: 1000,      // Critical performance threshold (ms)
    WARNING: 500,        // Warning performance threshold (ms)
    OPTIMAL: 100,        // Optimal performance threshold (ms)
    MEMORY_WARNING: 50,  // Memory usage threshold (MB)
    CACHE_MISS_WARNING: 20 // Cache miss rate threshold (%)
};
```

#### Monitor Configuration

```javascript
const config = {
    enabled: true,                    // Enable/disable monitoring
    sampleRate: 1.0,                  // Sample rate (0-1)
    maxMetrics: 10000,                // Maximum metrics to store
    retentionPeriod: 24 * 60 * 60 * 1000, // Retention period (ms)
    enableAlerts: true,               // Enable real-time alerts
    thresholds: PERFORMANCE_THRESHOLDS, // Performance thresholds
    enableMemoryMonitoring: true,     // Enable memory monitoring
    enableCacheMonitoring: true,      // Enable cache monitoring
    enableErrorTracking: true         // Enable error tracking
};
```

## 🧪 Testing

The module includes a comprehensive test suite:

```javascript
import { runPerformanceTests } from './js/performance/utils/test-runner.js';

// Run all tests
runPerformanceTests();
```

### Test Coverage

- Performance Monitor creation and configuration
- Metric recording and retrieval
- Performance measurement
- Cache metrics
- Error recording
- Interaction tracking
- Statistics calculation
- Performance reporting
- Alert system
- Configuration management
- Data cleanup

## 🔄 Migration from Calendar Module

This module has been moved from the calendar-specific location to a standalone performance module for better reusability across the application.

### Old Import Paths (Deprecated)
```javascript
// ❌ Old paths (no longer work)
import { createPerformanceDashboard } from './calendar/components/ui/performance/PerformanceDashboard.js';
import { performanceMonitor } from './calendar/utils/core/performance/PerformanceMonitor.js';
```

### New Import Paths (Recommended)
```javascript
// ✅ New paths
import { createPerformanceDashboard, performanceMonitor } from './performance/index.js';
```

## 🏗️ Architecture

### Design Principles

1. **Modularity**: Self-contained module with clear separation of concerns
2. **Extensibility**: Easy to extend with new metric types and visualizations
3. **Performance**: Minimal overhead with efficient data structures
4. **Reliability**: Comprehensive error handling and fallbacks
5. **Testability**: Full test coverage with isolated components

### Data Flow

```
Application Code
    ↓
Performance Monitor (Metrics Collection)
    ↓
Data Storage (In-Memory Map)
    ↓
Statistics Calculation
    ↓
Dashboard Visualization
    ↓
User Interface
```

### Memory Management

- Automatic cleanup of old metrics based on retention period
- Configurable maximum metrics per type
- Efficient data structures for high-frequency operations
- Memory usage monitoring and alerts

## 🔮 Future Enhancements

- **Persistent Storage**: Database integration for long-term metrics
- **Real-time Streaming**: WebSocket integration for live updates
- **Advanced Analytics**: Machine learning for anomaly detection
- **Custom Dashboards**: Configurable dashboard layouts
- **Export Capabilities**: CSV/JSON export of performance data
- **Integration APIs**: Third-party monitoring service integration

## 📝 License

This module is part of the Skylight Pi application and follows the same licensing terms.
