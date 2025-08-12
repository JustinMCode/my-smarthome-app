# Factory System

A comprehensive factory pattern implementation for manager creation with standardized configuration, validation, caching, and performance monitoring.

## Overview

The Factory System provides a unified approach to creating and managing various calendar components through a centralized factory infrastructure. It eliminates code duplication across 7 identical factory patterns while providing enhanced features like configuration validation, performance monitoring, and dependency injection.

## Architecture

### Core Components

1. **ManagerFactory** - Base abstract factory class providing common functionality
2. **FactoryRegistry** - Central registry for factory instances with caching and DI
3. **FactoryConfig** - Configuration templates, validation schemas, and presets
4. **Factory Index** - Main entry point with backward compatibility functions

### Supported Manager Types

- `data` - Data management components
- `cell` - Cell management components  
- `event` - Event management components
- `filter` - Filter management components
- `layout` - Layout management components
- `navigation` - Navigation management components
- `settings` - Settings management components

## Quick Start

### Basic Usage

```javascript
import { createDataManager, createEventManager } from '../../utils/factory/index.js';

// Create managers using the factory system
const dataManager = createDataManager(core, {
    cacheConfig: { timeout: 300000, maxSize: 500 },
    dataManagerConfig: { enableLazyLoading: true }
});

const eventManager = createEventManager(core, {
    rendererConfig: { showTime: true, compact: false },
    managerConfig: { enablePooling: true }
});
```

### Advanced Usage with Registry

```javascript
import { FactoryRegistry, FactoryUtils } from '../../utils/factory/index.js';

// Get registry instance
const registry = FactoryRegistry.getInstance();

// Create manager with environment preset
const manager = registry.createManager('data', core, options, 'production');

// Use utilities for configuration management
const config = FactoryUtils.mergeConfig('data', userConfig, 'mobile');
const validation = FactoryUtils.validateConfig('data', config);
```

## Configuration System

### Default Configurations

Each manager type has predefined default configurations:

```javascript
import { DEFAULT_CONFIGS } from '../../utils/factory/index.js';

// Get default config for data manager
const dataDefaults = DEFAULT_CONFIGS.data;
// {
//   cacheConfig: { timeout: 300000, maxSize: 1000, enableCompression: true },
//   dataManagerConfig: { cacheTimeout: 300000, enableLazyLoading: true, maxConcurrentRequests: 3 }
// }
```

### Environment Presets

Performance optimization presets for different environments:

```javascript
import { PERFORMANCE_PRESETS } from '../../utils/factory/index.js';

// Production preset
const productionPreset = PERFORMANCE_PRESETS.production;
// { enableCaching: true, enablePooling: true, enablePerformanceMonitoring: false, logLevel: 'warn' }

// Mobile preset
const mobilePreset = PERFORMANCE_PRESETS.mobile;
// { enableCaching: true, enablePooling: false, maxSize: 50, enablePerformanceOptimizations: true }
```

### Configuration Validation

```javascript
import { ConfigValidator } from '../../utils/factory/index.js';

const config = {
    cacheConfig: { timeout: 1000, maxSize: 500 },
    dataManagerConfig: { enableLazyLoading: true }
};

const validation = ConfigValidator.validate('data', config);
// {
//   isValid: true,
//   errors: [],
//   warnings: []
// }
```

## Performance Monitoring

### Factory Statistics

```javascript
import { getFactoryStats } from '../../utils/factory/index.js';

const stats = getFactoryStats();
// {
//   created: 15,
//   cached: 8,
//   errors: 0,
//   performance: { averageCreationTime: 12.5, totalCreationTime: 187.5 },
//   cacheSize: 8,
//   registeredFactories: 7,
//   registeredDependencies: 0
// }
```

### Performance Optimization

```javascript
import { FactoryRegistry } from '../../utils/factory/index.js';

const registry = FactoryRegistry.getInstance({
    enablePerformanceMonitoring: true,
    enableCaching: true,
    maxCacheSize: 200,
    cacheTimeout: 600000 // 10 minutes
});
```

## Dependency Injection

### Registering Dependencies

```javascript
import { FactoryRegistry } from '../../utils/factory/index.js';

const registry = FactoryRegistry.getInstance();

// Register singleton dependency
registry.registerDependency('logger', new Logger(), { singleton: true });

// Register factory function
registry.registerDependency('cache', () => new Cache(), { singleton: false });
```

### Using Dependencies

```javascript
const registry = FactoryRegistry.getInstance();
const logger = registry.getDependency('logger');
const cache = registry.getDependency('cache');
```

## Migration Guide

### From Legacy Factory Functions

**Before:**
```javascript
import { createDataManager } from '../components/data/index.js';

const dataManager = createDataManager(core, {
    cacheConfig: { timeout: 300000 },
    dataManagerConfig: { enableLazyLoading: true }
});
```

**After:**
```javascript
import { createDataManager } from '../../utils/factory/index.js';

const dataManager = createDataManager(core, {
    cacheConfig: { timeout: 300000 },
    dataManagerConfig: { enableLazyLoading: true }
});
```

### Benefits of Migration

1. **Standardized Configuration** - All managers use the same configuration patterns
2. **Validation** - Automatic configuration validation with detailed error messages
3. **Performance Monitoring** - Built-in performance tracking and optimization
4. **Caching** - Intelligent caching with automatic cleanup
5. **Error Recovery** - Graceful fallback mechanisms
6. **Dependency Injection** - Centralized dependency management

## API Reference

### ManagerFactory

Base factory class providing common functionality.

#### Methods

- `createManager(core, options)` - Create manager instance
- `getStats()` - Get factory statistics
- `validateConfiguration()` - Validate factory configuration
- `resetStats()` - Reset factory statistics

#### Static Methods

- `create(managerType, options)` - Create factory instance
- `getSupportedTypes()` - Get supported manager types

### FactoryRegistry

Central registry for factory instances.

#### Methods

- `registerFactory(managerType, factory, options)` - Register factory
- `getFactory(managerType, options)` - Get factory instance
- `createManager(managerType, core, options, environment)` - Create manager
- `registerDependency(name, dependency, options)` - Register dependency
- `getDependency(name)` - Get dependency
- `clearCache()` - Clear cached managers
- `getStats()` - Get registry statistics

#### Static Methods

- `create(options)` - Create registry instance
- `getInstance(options)` - Get singleton registry instance

### FactoryConfig

Configuration management system.

#### Classes

- `ConfigValidator` - Configuration validation
- `ConfigMerger` - Configuration merging

#### Functions

- `getDefaultConfig(managerType)` - Get default configuration
- `getConfigSchema(managerType)` - Get configuration schema
- `getPerformancePreset(environment)` - Get performance preset

## Testing

### Unit Testing

```javascript
import { ManagerFactory, FactoryRegistry } from '../../utils/factory/index.js';

describe('ManagerFactory', () => {
    test('should create manager with valid configuration', () => {
        const factory = ManagerFactory.create('data');
        const manager = factory.createManager(mockCore, {});
        expect(manager).toBeDefined();
    });
});
```

### Integration Testing

```javascript
import { FactoryRegistry } from '../../utils/factory/index.js';

describe('FactoryRegistry', () => {
    test('should create and cache managers', () => {
        const registry = FactoryRegistry.create({ enableCaching: true });
        const manager1 = registry.createManager('data', mockCore, {});
        const manager2 = registry.createManager('data', mockCore, {});
        expect(manager1).toBe(manager2); // Same cached instance
    });
});
```

## Performance Considerations

### Caching Strategy

- **Manager Instances** - Cached based on core, options, and environment
- **Factory Instances** - Singleton pattern for reuse
- **Dependencies** - Configurable singleton vs factory pattern

### Memory Management

- **Automatic Cleanup** - Expired cache entries removed automatically
- **Pool Management** - Object pooling for frequently created instances
- **Reference Tracking** - Proper cleanup of manager instances

### Optimization Tips

1. **Use Environment Presets** - Leverage pre-configured performance settings
2. **Enable Caching** - Cache managers for repeated use
3. **Monitor Statistics** - Track performance metrics for optimization
4. **Validate Configurations** - Catch configuration errors early

## Error Handling

### Validation Errors

```javascript
try {
    const manager = createDataManager(core, { cacheTimeout: 'invalid' });
} catch (error) {
    console.error('Configuration validation failed:', error.message);
}
```

### Fallback Mechanisms

```javascript
const factory = ManagerFactory.create('data', { enableErrorRecovery: true });
const manager = factory.createManager(core, invalidConfig);
// Returns fallback manager instead of throwing error
```

## Best Practices

1. **Use Environment Presets** - Choose appropriate performance settings
2. **Validate Configurations** - Always validate user-provided configurations
3. **Monitor Performance** - Track creation times and cache hit rates
4. **Clean Up Resources** - Call destroy() methods when done with managers
5. **Use Dependency Injection** - Register shared dependencies in the registry
6. **Leverage Caching** - Enable caching for frequently used managers

## Troubleshooting

### Common Issues

1. **Configuration Validation Failures**
   - Check configuration schemas in `FactoryConfig.js`
   - Ensure all required properties are provided
   - Validate property types and ranges

2. **Performance Issues**
   - Monitor factory statistics
   - Adjust cache settings
   - Use appropriate environment presets

3. **Memory Leaks**
   - Ensure proper cleanup of manager instances
   - Monitor cache size and cleanup frequency
   - Check for circular references

### Debug Mode

```javascript
import { FactoryRegistry } from '../../utils/factory/index.js';

const registry = FactoryRegistry.create({
    logLevel: 'debug',
    enablePerformanceMonitoring: true
});
```

## Future Enhancements

1. **TypeScript Support** - Full type definitions and interfaces
2. **Plugin System** - Extensible factory system with plugins
3. **Advanced Caching** - Multi-level caching with persistence
4. **Metrics Dashboard** - Real-time performance monitoring
5. **Configuration UI** - Visual configuration builder
6. **Testing Framework** - Comprehensive testing utilities

## Contributing

When contributing to the factory system:

1. Follow the existing code patterns and architecture
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow performance best practices
6. Add validation for new configuration options
