# Responsive Configuration Module

## Overview

The Responsive Configuration Module provides a unified, centralized system for managing responsive behavior across all components in the application. This module eliminates code duplication and provides consistent responsive behavior with advanced features like caching, validation, and component-specific overrides.

## Architecture

### Core Components

1. **ResponsiveConfig** - Main configuration class for generating responsive settings
2. **ResponsiveFactory** - Factory pattern implementation with caching and validation
3. **Constants** - Centralized breakpoint definitions and utility functions
4. **Index** - Unified API for easy integration

### File Structure

```
web/js/utils/responsive/
├── ResponsiveConfig.js      # Core configuration class
├── ResponsiveFactory.js     # Factory with caching & validation
├── index.js                 # Unified API exports
└── README.md               # This documentation

web/js/constants/
└── responsive.js           # Breakpoint constants & utilities
```

## Features

### ✅ Centralized Breakpoint Management
- Single source of truth for all breakpoints
- Consistent responsive behavior across components
- Easy to modify breakpoints globally

### ✅ Component-Specific Templates
- Pre-defined configurations for each component type
- Optimized settings for different screen sizes
- Extensible template system

### ✅ Performance Optimizations
- LRU caching for configuration objects
- Configurable cache size and behavior
- Performance monitoring and statistics

### ✅ Validation & Error Handling
- Comprehensive configuration validation
- Component-specific validation rules
- Detailed error reporting and warnings

### ✅ Advanced Features
- Global and component-specific overrides
- Aspect ratio calculations
- Touch device detection
- Performance threshold management

## Quick Start

### Basic Usage

```javascript
import { createResponsiveConfig } from './utils/responsive/index.js';

// Create a responsive configuration for a cell component
const config = createResponsiveConfig(800, 600, 'cell');

console.log(config);
// Output:
// {
//   maxEvents: 3,
//   compactMode: false,
//   enableTouch: true,
//   enableRipple: true,
//   showEventCount: true,
//   breakpoint: 'tablet',
//   containerSize: 'medium',
//   aspectRatio: 1.33,
//   isTouchDevice: true,
//   // ... more properties
// }
```

### Advanced Usage with Factory

```javascript
import { initializeResponsiveFactory, createResponsiveConfig } from './utils/responsive/index.js';

// Initialize the global factory with custom options
initializeResponsiveFactory({
    enableCaching: true,
    cacheSize: 200,
    enableValidation: true,
    enableLogging: true
});

// Set global overrides
setGlobalOverrides({
    enableAnimations: false,
    enableCaching: true
});

// Set component-specific overrides
setComponentOverrides('cell', {
    maxEvents: 10,
    compactMode: false
});

// Create configurations (will use factory with caching)
const cellConfig = createResponsiveConfig(1024, 768, 'cell');
const eventConfig = createResponsiveConfig(1024, 768, 'event');
```

## API Reference

### Core Functions

#### `createResponsiveConfig(width, height, componentType, options)`
Creates a responsive configuration for the specified component type.

**Parameters:**
- `width` (number) - Container width in pixels
- `height` (number) - Container height in pixels  
- `componentType` (string) - Component type ('cell', 'event', 'filter', 'layout')
- `options` (object) - Additional configuration options

**Returns:** Configuration object

#### `createCellConfig(width, height, options)`
Convenience function for creating cell configurations.

#### `createEventConfig(width, height, options)`
Convenience function for creating event configurations.

#### `createFilterConfig(width, height, options)`
Convenience function for creating filter configurations.

#### `createLayoutConfig(width, height, options)`
Convenience function for creating layout configurations.

### Factory Management

#### `initializeResponsiveFactory(options)`
Initialize the global responsive factory.

**Options:**
- `enableCaching` (boolean) - Enable configuration caching (default: true)
- `cacheSize` (number) - Maximum cache size (default: 100)
- `enableValidation` (boolean) - Enable configuration validation (default: true)
- `enableLogging` (boolean) - Enable logging (default: true)

#### `setGlobalOverrides(overrides)`
Set global configuration overrides applied to all components.

#### `setComponentOverrides(componentType, overrides)`
Set component-specific configuration overrides.

#### `clearCache()`
Clear the configuration cache.

#### `getStats()`
Get responsive system statistics.

### Constants

#### Breakpoints
```javascript
BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440,
    LARGE: 1920
}
```

#### Component Types
```javascript
COMPONENT_TYPES = {
    CELL: 'cell',
    EVENT: 'event',
    FILTER: 'filter',
    LAYOUT: 'layout',
    NAVIGATION: 'navigation',
    MODAL: 'modal',
    SETTINGS: 'settings'
}
```

## Configuration Templates

### Cell Component
```javascript
{
    maxEvents: 3,           // Maximum events to display
    compactMode: false,     // Use compact layout
    enableTouch: true,      // Enable touch interactions
    enableRipple: true,     // Enable ripple effects
    showEventCount: true    // Show event count badge
}
```

### Event Component
```javascript
{
    showTime: true,         // Show event time
    showLocation: false,    // Show event location
    compact: false,         // Use compact layout
    enableTouch: true,      // Enable touch interactions
    enableRipple: true,     // Enable ripple effects
    maxTitleLength: 30      // Maximum title length
}
```

### Filter Component
```javascript
{
    enableCaching: true,    // Enable result caching
    maxCacheSize: 100,      // Maximum cache size
    enableAnimations: true, // Enable animations
    showEventCounts: true,  // Show event counts
    compactMode: false,     // Use compact layout
    maxVisibleFilters: 5    // Maximum visible filters
}
```

### Layout Component
```javascript
{
    breakpoint: 'tablet',   // Current breakpoint
    columns: 2,             // Number of columns
    maxEventsPerDay: 3,     // Maximum events per day
    compactMode: false,     // Use compact layout
    enableGrid: true        // Enable grid layout
}
```

## Migration Guide

### From Old Implementation

**Before:**
```javascript
// CellUtils.calculateResponsiveConfig
const config = CellUtils.calculateResponsiveConfig(800, 600);

// EventUtils.calculateResponsiveConfig  
const config = EventUtils.calculateResponsiveConfig(800, 600);

// FilterUtils.calculateResponsiveConfig
const config = FilterUtils.calculateResponsiveConfig(800, 600);

// LayoutUtils.calculateResponsiveBreakpoints
const config = LayoutUtils.calculateResponsiveBreakpoints(800, 600);
```

**After:**
```javascript
import { createCellConfig, createEventConfig, createFilterConfig, createLayoutConfig } from './utils/responsive/index.js';

const cellConfig = createCellConfig(800, 600);
const eventConfig = createEventConfig(800, 600);
const filterConfig = createFilterConfig(800, 600);
const layoutConfig = createLayoutConfig(800, 600);
```

### Legacy Compatibility

The module provides legacy compatibility functions that will work with existing code but show deprecation warnings:

```javascript
import { calculateResponsiveConfig, calculateResponsiveBreakpoints } from './utils/responsive/index.js';

// These will work but show deprecation warnings
const config = calculateResponsiveConfig(800, 600, 'cell');
const breakpoints = calculateResponsiveBreakpoints(800, 600);
```

## Performance Benefits

### Caching
- LRU cache for configuration objects
- Configurable cache size
- Automatic cache eviction
- Cache hit statistics

### Validation
- Pre-validation of configurations
- Early error detection
- Performance impact warnings
- Component-specific validation rules

### Memory Optimization
- Shared configuration templates
- Efficient object creation
- Minimal memory footprint
- Garbage collection friendly

## Testing

### Unit Tests
```javascript
// Test breakpoint detection
const config = createResponsiveConfig(500, 400, 'cell');
expect(config.breakpoint).toBe('mobile');

// Test component-specific configuration
const eventConfig = createEventConfig(1200, 800, 'event');
expect(eventConfig.showTime).toBe(true);
expect(eventConfig.showLocation).toBe(true);
```

### Integration Tests
```javascript
// Test factory initialization
initializeResponsiveFactory({ enableCaching: true });
const stats = getStats();
expect(stats.cacheEnabled).toBe(true);

// Test override system
setGlobalOverrides({ enableAnimations: false });
const config = createResponsiveConfig(800, 600, 'cell');
expect(config.enableAnimations).toBe(false);
```

## Best Practices

### 1. Initialize Factory Early
Initialize the responsive factory early in your application lifecycle:

```javascript
// In your main app initialization
import { initializeResponsiveFactory } from './utils/responsive/index.js';

initializeResponsiveFactory({
    enableCaching: true,
    enableValidation: true
});
```

### 2. Use Component-Specific Functions
Use the convenience functions for better readability:

```javascript
// Good
const cellConfig = createCellConfig(800, 600);

// Less readable
const cellConfig = createResponsiveConfig(800, 600, 'cell');
```

### 3. Set Overrides Strategically
Use overrides for application-wide or component-specific customizations:

```javascript
// Global overrides for all components
setGlobalOverrides({
    enableAnimations: false,
    enableCaching: true
});

// Component-specific overrides
setComponentOverrides('cell', {
    maxEvents: 10
});
```

### 4. Monitor Performance
Regularly check system statistics:

```javascript
const stats = getStats();
console.log('Cache hit rate:', stats.cacheStats.hitRate);
console.log('Cache size:', stats.cacheStats.size);
```

## Troubleshooting

### Common Issues

**Configuration validation fails:**
- Check that component type is valid
- Verify container dimensions are positive numbers
- Review validation error messages

**Cache not working:**
- Ensure factory is initialized with `enableCaching: true`
- Check cache size limits
- Verify cache key generation

**Performance issues:**
- Monitor cache statistics
- Adjust cache size if needed
- Consider disabling validation in production

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
initializeResponsiveFactory({
    enableLogging: true,
    enableValidation: true
});
```

## Future Enhancements

### Planned Features
- TypeScript support
- Advanced caching strategies
- Performance profiling
- Configuration presets
- Dynamic breakpoint adjustment
- Accessibility considerations

### Extension Points
- Custom component types
- Custom validation rules
- Custom caching strategies
- Custom performance metrics

## Contributing

When contributing to the responsive configuration module:

1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Maintain backward compatibility
5. Consider performance implications

## License

This module is part of the Skylight Pi project and follows the same licensing terms.
