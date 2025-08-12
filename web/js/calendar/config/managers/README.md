# Managers Config Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| calendar-manager.js | Calendar management and persistence | 321 | 16 | 🟠 |
| index.js | Centralized export interface | 20 | 3 | 🟢 |
| README.md | Documentation | 462 | 0 | 🟢 |

## Improvement Recommendations

### calendar-manager.js

#### 🔴 Critical Issues
- **Issue**: Potential memory leak in global instance
  - Current: Global `calendarManager` instance is created but never cleaned up
  - Suggested: Implement proper lifecycle management and cleanup methods
  - Impact: Memory leaks in long-running applications

- **Issue**: Missing error handling for storage operations
  - Current: Storage operations have basic try-catch but no user feedback
  - Suggested: Add comprehensive error handling with user notifications
  - Impact: Silent failures and poor user experience

#### 🟠 High Priority
- **Issue**: Hardcoded color manipulation logic
  - Current: `darkenColor()` method uses simple arithmetic without proper color validation
  - Suggested: Use proper color manipulation library or implement robust color utilities
  - Impact: Potential invalid colors and poor gradient generation

- **Issue**: Missing validation for calendar operations
  - Current: No validation of calendar data structure or required fields
  - Suggested: Add comprehensive validation for all calendar operations
  - Impact: Invalid calendar data and runtime errors

- **Issue**: Inefficient ID generation
  - Current: `generateCalendarId()` uses linear search through existing IDs
  - Suggested: Implement more efficient ID generation with UUID or timestamp-based approach
  - Impact: Performance degradation with many calendars

#### 🟡 Medium Priority
- **Issue**: Synchronous storage operations
  - Current: All storage operations are synchronous and block the main thread
  - Suggested: Implement asynchronous storage operations with proper error handling
  - Impact: UI blocking and poor user experience

- **Issue**: Missing event system
  - Current: No way to listen for calendar changes or configuration updates
  - Suggested: Implement event system for change notifications
  - Impact: Difficult to implement reactive UI updates

- **Issue**: Incomplete configuration validation
  - Current: No validation of imported configuration structure
  - Suggested: Add schema validation for configuration import/export
  - Impact: Invalid configurations can corrupt the system

- **Issue**: Hardcoded storage key
  - Current: Uses hardcoded 'calendarConfig' storage key
  - Suggested: Make storage key configurable and add namespace support
  - Impact: Potential conflicts with other applications

#### 🟢 Low Priority
- **Issue**: Missing configuration versioning
  - Current: No version tracking for configuration changes
  - Suggested: Add versioning system for configuration migration
  - Impact: Difficult to handle configuration format changes

- **Issue**: Inconsistent method naming
  - Current: Mix of camelCase and inconsistent naming patterns
  - Suggested: Standardize method naming conventions
  - Impact: Code readability and maintainability

- **Issue**: Missing documentation for complex methods
  - Current: Some methods lack proper JSDoc documentation
  - Suggested: Add comprehensive JSDoc documentation
  - Impact: Poor developer experience

### index.js

#### 🟢 Low Priority
- **Issue**: Redundant import/export pattern
  - Current: Imports and re-exports the same modules
  - Suggested: Simplify to direct re-exports
  - Impact: Code bloat and maintenance overhead

- **Issue**: Missing error handling
  - Current: No error handling for import failures
  - Suggested: Add error handling for import/export failures
  - Impact: Silent failures and debugging difficulties

## Refactoring Effort Estimate
- Total files needing work: 2
- Estimated hours: 12-18
- Quick wins: Add validation, improve error handling, implement event system
- Complex refactors: Implement async storage, add configuration versioning

## Dependencies
- Internal dependencies: ../core/calendar-config.js
- External dependencies: None

### Reusable Functions/Components

#### ConfigurationValidator
```javascript
// Description: Validates calendar configuration objects
// Found in: calendar-manager.js
// Can be used for: Any configuration validation
// Dependencies: Schema validation utilities

class ConfigurationValidator {
    constructor() {
        this.schemas = {
            calendar: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true },
                color: { type: 'string', required: true },
                gradient: { type: 'string', required: false },
                description: { type: 'string', required: false },
                enabled: { type: 'boolean', default: true },
                visible: { type: 'boolean', default: true },
                order: { type: 'number', default: 0 }
            },
            configuration: {
                calendars: { type: 'object', required: true },
                colorPalette: { type: 'array', required: true },
                defaults: { type: 'object', required: true }
            }
        };
    }
    
    validateCalendar(calendar) {
        const schema = this.schemas.calendar;
        const errors = [];
        
        Object.entries(schema).forEach(([key, rules]) => {
            const value = calendar[key];
            
            if (rules.required && value === undefined) {
                errors.push(`${key} is required`);
            }
            
            if (value !== undefined) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
                
                if (key === 'color' && !this.isValidColor(value)) {
                    errors.push(`${key} must be a valid color`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
    
    validateConfiguration(config) {
        const schema = this.schemas.configuration;
        const errors = [];
        
        Object.entries(schema).forEach(([key, rules]) => {
            const value = config[key];
            
            if (rules.required && value === undefined) {
                errors.push(`${key} is required`);
            }
            
            if (value !== undefined) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
    
    isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
}
```

#### EventManager
```javascript
// Description: Manages events and notifications for configuration changes
// Found in: calendar-manager.js
// Can be used for: Any component requiring event management
// Dependencies: Event handling utilities

class EventManager {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    
    once(event, callback) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        this.onceEvents.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
        
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        // Emit regular events
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
        
        // Emit once events and remove them
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once event callback for ${event}:`, error);
                }
            });
            this.onceEvents.delete(event);
        }
    }
    
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }
}
```

#### StorageManager
```javascript
// Description: Manages asynchronous storage operations
// Found in: calendar-manager.js
// Can be used for: Any component requiring storage management
// Dependencies: Storage utilities, error handling

class StorageManager {
    constructor(namespace = 'calendar') {
        this.namespace = namespace;
        this.storageKey = `${namespace}_config`;
    }
    
    async save(data) {
        try {
            const serialized = JSON.stringify(data);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, serialized);
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async load() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(this.storageKey);
                return data ? { success: true, data: JSON.parse(data) } : { success: false, error: 'No data found' };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async delete() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.storageKey);
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async clear() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}
```

## Common Patterns Identified

Pattern: Storage Operations
Files using this: calendar-manager.js
Current implementation count: 4 times
Suggested abstraction: StorageManager utility class

Pattern: Event Handling
Files using this: calendar-manager.js (missing)
Current implementation count: 0 times
Suggested abstraction: EventManager utility class

Pattern: Validation Logic
Files using this: calendar-manager.js (missing)
Current implementation count: 0 times
Suggested abstraction: ConfigurationValidator utility class

## Duplicate Code Found

Functionality: Storage operations
Locations: calendar-manager.js (multiple methods)
Lines saved if consolidated: 25
Suggested solution: Create StorageManager utility class

Functionality: Color manipulation
Locations: calendar-manager.js (darkenColor method)
Lines saved if consolidated: 15
Suggested solution: Use proper color manipulation library

Functionality: ID generation
Locations: calendar-manager.js (generateCalendarId method)
Lines saved if consolidated: 10
Suggested solution: Implement UUID-based ID generation

## Utility Functions to Extract

```javascript
// Color manipulation utility
class ColorUtils {
    static isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
    
    static darkenColor(hex, amount = 30) {
        if (!this.isValidColor(hex)) {
            throw new Error('Invalid color format');
        }
        
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    static lightenColor(hex, amount = 30) {
        if (!this.isValidColor(hex)) {
            throw new Error('Invalid color format');
        }
        
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    static generateGradient(color, type = 'darken') {
        const baseColor = color;
        const secondaryColor = type === 'darken' ? 
            this.darkenColor(color) : this.lightenColor(color);
        
        return `linear-gradient(135deg, ${baseColor} 0%, ${secondaryColor} 100%)`;
    }
}

// ID generation utility
class IdGenerator {
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    static generateTimestampId(prefix = 'calendar') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    static generateSequentialId(existingIds, prefix = 'calendar') {
        const existingNumbers = existingIds
            .map(id => parseInt(id.replace(prefix + '-', '')))
            .filter(num => !isNaN(num));
        
        const nextNumber = existingNumbers.length > 0 ? 
            Math.max(...existingNumbers) + 1 : 0;
        
        return `${prefix}-${nextNumber}`;
    }
}

// Configuration versioning utility
class ConfigurationVersioning {
    constructor() {
        this.currentVersion = '1.0.0';
        this.migrations = new Map();
    }
    
    addMigration(fromVersion, toVersion, migrationFn) {
        const key = `${fromVersion}-${toVersion}`;
        this.migrations.set(key, migrationFn);
    }
    
    migrateConfiguration(config, targetVersion = this.currentVersion) {
        let currentConfig = { ...config };
        let currentVersion = config.version || '1.0.0';
        
        while (currentVersion !== targetVersion) {
            const migrationKey = `${currentVersion}-${targetVersion}`;
            const migration = this.migrations.get(migrationKey);
            
            if (!migration) {
                throw new Error(`No migration found from ${currentVersion} to ${targetVersion}`);
            }
            
            currentConfig = migration(currentConfig);
            currentVersion = targetVersion;
        }
        
        return { ...currentConfig, version: targetVersion };
    }
    
    validateVersion(config) {
        const version = config.version || '1.0.0';
        return version === this.currentVersion;
    }
}
```

## Architecture Recommendations

### 1. Asynchronous Storage Management
Implement proper async storage:
```javascript
class AsyncCalendarManager {
    constructor(options = {}) {
        this.config = { 
            calendars: { ...CALENDARS },
            colorPalette: [...COLOR_PALETTE],
            defaults: { ...DEFAULTS },
            ...options
        };
        this.storageManager = new StorageManager(options.namespace);
        this.eventManager = new EventManager();
        this.validator = new ConfigurationValidator();
        this.versioning = new ConfigurationVersioning();
        this.initialized = false;
    }
    
    async initialize() {
        try {
            const result = await this.storageManager.load();
            if (result.success) {
                const migratedConfig = this.versioning.migrateConfiguration(result.data);
                const validation = this.validator.validateConfiguration(migratedConfig);
                
                if (validation.isValid) {
                    this.config = {
                        calendars: { ...CALENDARS, ...migratedConfig.calendars },
                        colorPalette: [...COLOR_PALETTE],
                        defaults: { ...DEFAULTS, ...migratedConfig.defaults },
                        ...migratedConfig
                    };
                } else {
                    console.warn('Invalid configuration loaded, using defaults:', validation.errors);
                }
            }
            
            this.initialized = true;
            this.eventManager.emit('initialized', this.config);
        } catch (error) {
            console.error('Failed to initialize calendar manager:', error);
            this.eventManager.emit('error', error);
        }
    }
    
    async saveToStorage() {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        try {
            const result = await this.storageManager.save(this.config);
            if (result.success) {
                this.eventManager.emit('saved', this.config);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to save calendar configuration:', error);
            this.eventManager.emit('error', error);
            throw error;
        }
    }
    
    async addCalendar(name, color = null, description = '') {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        const id = IdGenerator.generateTimestampId();
        const selectedColor = color || this.getNextAvailableColor();
        
        const newCalendar = {
            id,
            name,
            color: selectedColor,
            gradient: ColorUtils.generateGradient(selectedColor),
            description,
            enabled: true,
            visible: true,
            order: this.getNextOrder()
        };
        
        const validation = this.validator.validateCalendar(newCalendar);
        if (!validation.isValid) {
            throw new Error(`Invalid calendar: ${validation.errors.join(', ')}`);
        }
        
        this.config.calendars[id] = newCalendar;
        await this.saveToStorage();
        
        this.eventManager.emit('calendarAdded', newCalendar);
        return newCalendar;
    }
    
    async updateCalendar(id, updates) {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        if (!this.config.calendars[id]) {
            throw new Error(`Calendar not found: ${id}`);
        }
        
        const updatedCalendar = { ...this.config.calendars[id], ...updates };
        
        // Update gradient if color changed
        if (updates.color) {
            updatedCalendar.gradient = ColorUtils.generateGradient(updates.color);
        }
        
        const validation = this.validator.validateCalendar(updatedCalendar);
        if (!validation.isValid) {
            throw new Error(`Invalid calendar: ${validation.errors.join(', ')}`);
        }
        
        this.config.calendars[id] = updatedCalendar;
        await this.saveToStorage();
        
        this.eventManager.emit('calendarUpdated', updatedCalendar);
        return updatedCalendar;
    }
    
    async deleteCalendar(id) {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        if (!this.config.calendars[id]) {
            throw new Error(`Calendar not found: ${id}`);
        }
        
        const deletedCalendar = this.config.calendars[id];
        delete this.config.calendars[id];
        await this.saveToStorage();
        
        this.eventManager.emit('calendarDeleted', deletedCalendar);
        return true;
    }
    
    // Event handling
    on(event, callback) {
        this.eventManager.on(event, callback);
    }
    
    off(event, callback) {
        this.eventManager.off(event, callback);
    }
    
    // Cleanup
    destroy() {
        this.eventManager.clear();
        this.initialized = false;
    }
}
```

### 2. Error Handling and Validation
Implement comprehensive error handling:
```javascript
class CalendarManagerError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'CalendarManagerError';
        this.code = code;
        this.details = details;
    }
}

class CalendarManagerErrorHandler {
    static handleError(error, context = '') {
        console.error(`Calendar manager error in ${context}:`, error);
        
        // Log to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            this.logToMonitoring(error, context);
        }
        
        // Show user-friendly error message
        this.showUserError(error);
    }
    
    static showUserError(error) {
        const errorMessages = {
            'CALENDAR_NOT_FOUND': 'Calendar not found',
            'INVALID_CALENDAR': 'Invalid calendar configuration',
            'STORAGE_ERROR': 'Failed to save calendar settings',
            'VALIDATION_ERROR': 'Invalid calendar data',
            'INITIALIZATION_ERROR': 'Failed to initialize calendar manager'
        };
        
        const message = errorMessages[error.code] || error.message;
        this.showNotification(message, 'error');
    }
    
    static showNotification(message, type = 'info') {
        // Implementation for showing user notifications
        const notification = document.createElement('div');
        notification.className = `calendar-notification calendar-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}
```

### 3. Performance Optimization
Implement performance optimizations:
```javascript
class OptimizedCalendarManager {
    constructor(options = {}) {
        this.config = { ...options };
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.batchOperations = [];
        this.isBatching = false;
    }
    
    // Debounced save operation
    debouncedSave() {
        const key = 'save';
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            this.saveToStorage();
            this.debounceTimers.delete(key);
        }, 300);
        
        this.debounceTimers.set(key, timer);
    }
    
    // Batch operations
    batchOperation(operation) {
        this.batchOperations.push(operation);
        
        if (!this.isBatching) {
            this.isBatching = true;
            setTimeout(() => {
                this.executeBatchOperations();
            }, 100);
        }
    }
    
    async executeBatchOperations() {
        if (this.batchOperations.length === 0) {
            this.isBatching = false;
            return;
        }
        
        const operations = [...this.batchOperations];
        this.batchOperations = [];
        
        try {
            await Promise.all(operations.map(op => op()));
            this.saveToStorage();
        } catch (error) {
            console.error('Batch operations failed:', error);
        }
        
        this.isBatching = false;
    }
    
    // Cached calendar access
    getCalendar(id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        const calendar = this.config.calendars[id] || null;
        this.cache.set(id, calendar);
        return calendar;
    }
    
    // Clear cache when calendar is updated
    clearCache(id = null) {
        if (id) {
            this.cache.delete(id);
        } else {
            this.cache.clear();
        }
    }
}
```

## Testing Strategy

### Unit Tests
- Manager instantiation and initialization
- CRUD operations validation
- Storage operations and error handling
- Event system functionality
- Configuration validation

### Integration Tests
- Manager interaction with storage
- Event system integration
- Configuration migration
- Error handling scenarios

### Performance Tests
- Storage operation performance
- CRUD operation responsiveness
- Memory usage optimization
- Cache effectiveness

## Implementation Priority

### Phase 1 (Week 1): Critical Fixes
1. Add comprehensive error handling and validation
2. Implement event system for change notifications
3. Add proper lifecycle management
4. Fix memory leak in global instance

### Phase 2 (Week 2): Architecture Improvements
1. Implement asynchronous storage operations
2. Add configuration versioning
3. Improve color manipulation utilities
4. Add performance optimizations

### Phase 3 (Week 3): Feature Enhancement
1. Add configuration validation schemas
2. Implement batch operations
3. Add caching mechanisms
4. Improve error reporting

### Phase 4 (Week 4): Polish and Testing
1. Add comprehensive unit and integration tests
2. Implement performance monitoring
3. Add configuration migration tools
4. Create usage examples and documentation

## Function Documentation

This section documents all functions across the managers folder to help identify potential reimplementations and ensure code reuse.

### index.js Functions
- **No functions** - This file only contains exports and re-exports for manager modules

### calendar-manager.js Functions

#### Constructor and Initialization Functions
- **constructor(options)** - Initializes CalendarManager with configuration options, merges with defaults, and loads from storage
- **loadFromStorage()** - Loads configuration from localStorage with error handling and default merging
- **saveToStorage()** - Saves configuration to localStorage with error handling

#### Calendar Query Functions
- **getAllCalendars()** - Returns array of all calendars from configuration
- **getEnabledCalendars()** - Returns array of enabled calendars filtered by enabled flag
- **getVisibleCalendars()** - Returns array of visible calendars filtered by visible flag
- **getCalendar(id)** - Returns specific calendar by ID or null if not found

#### Calendar CRUD Functions
- **addCalendar(name, color, description)** - Adds new calendar with generated ID, color, gradient, and default settings
- **updateCalendar(id, updates)** - Updates existing calendar with new data and regenerates gradient if color changed
- **deleteCalendar(id)** - Deletes calendar by ID and returns success status
- **toggleCalendarVisibility(id)** - Toggles calendar visibility and returns new visibility state

#### Calendar Property Functions
- **getCalendarColor(id, useGradient)** - Returns calendar color or gradient based on useGradient parameter
- **getCalendarName(id)** - Returns calendar name or 'Unknown Calendar' if not found

#### Utility Functions
- **generateCalendarId()** - Generates unique calendar ID using linear search through existing IDs
- **getNextAvailableColor()** - Gets next available color from palette that's not already used
- **getNextOrder()** - Gets next order number by finding maximum existing order and adding 1
- **darkenColor(hex)** - Darkens hex color by 30 units using simple arithmetic color manipulation

#### Configuration Management Functions
- **resetToDefaults()** - Resets configuration to default values and saves to storage
- **exportConfig()** - Exports configuration as JSON string with formatting
- **importConfig(configString)** - Imports configuration from JSON string with error handling and default merging
- **getConfig()** - Returns copy of current configuration object
- **updateConfig(updates)** - Updates configuration with new data and saves to storage

## Potential Reimplementations Identified

### Storage Functions
- **calendar-manager.js: saveToStorage()** - Saves configuration to storage
- **calendar-manager.js: loadFromStorage()** - Loads configuration from storage

**Recommendation**: Create StorageManager utility class

### Color Manipulation Functions
- **calendar-manager.js: darkenColor()** - Darkens hex color
- **calendar-manager.js: getNextAvailableColor()** - Gets available color from palette

**Recommendation**: Create ColorUtils utility class

### ID Generation Functions
- **calendar-manager.js: generateCalendarId()** - Generates unique calendar ID
- **calendar-manager.js: getNextOrder()** - Gets next order number

**Recommendation**: Create IdGenerator utility class

### Configuration Management Functions
- **calendar-manager.js: exportConfig()** - Exports configuration
- **calendar-manager.js: importConfig()** - Imports configuration
- **calendar-manager.js: resetToDefaults()** - Resets to defaults

**Recommendation**: Create ConfigurationManager utility class

### Calendar CRUD Functions
- **calendar-manager.js: addCalendar()** - Adds calendar
- **calendar-manager.js: updateCalendar()** - Updates calendar
- **calendar-manager.js: deleteCalendar()** - Deletes calendar
- **calendar-manager.js: getCalendar()** - Gets calendar

**Recommendation**: Create CalendarCRUDManager utility class

### Calendar Query Functions
- **calendar-manager.js: getAllCalendars()** - Gets all calendars
- **calendar-manager.js: getEnabledCalendars()** - Gets enabled calendars
- **calendar-manager.js: getVisibleCalendars()** - Gets visible calendars

**Recommendation**: Create CalendarQueryManager utility class

## Functions with Similar Purposes

### Storage Operations
- **calendar-manager.js: saveToStorage()** - Saves to storage
- **calendar-manager.js: loadFromStorage()** - Loads from storage

### Calendar Retrieval Functions
- **calendar-manager.js: getAllCalendars()** - Gets all calendars
- **calendar-manager.js: getEnabledCalendars()** - Gets enabled calendars
- **calendar-manager.js: getVisibleCalendars()** - Gets visible calendars
- **calendar-manager.js: getCalendar()** - Gets specific calendar

### Calendar Property Functions
- **calendar-manager.js: getCalendarColor()** - Gets calendar color
- **calendar-manager.js: getCalendarName()** - Gets calendar name

### Configuration Functions
- **calendar-manager.js: getConfig()** - Gets configuration
- **calendar-manager.js: updateConfig()** - Updates configuration
- **calendar-manager.js: exportConfig()** - Exports configuration
- **calendar-manager.js: importConfig()** - Imports configuration

### Utility Functions
- **calendar-manager.js: generateCalendarId()** - Generates ID
- **calendar-manager.js: getNextOrder()** - Gets next order
- **calendar-manager.js: getNextAvailableColor()** - Gets next color

## Utility Functions to Extract

### StorageManager Class
```javascript
class StorageManager {
    constructor(storageKey = 'calendarConfig') {
        this.storageKey = storageKey;
    }
    
    async save(data) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async load() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem(this.storageKey);
                if (saved) {
                    return { success: true, data: JSON.parse(saved) };
                }
                return { success: false, error: 'No data found' };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async delete() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.storageKey);
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async clear() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
                return { success: true };
            }
            return { success: false, error: 'localStorage not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}
```

### ColorUtils Class
```javascript
class ColorUtils {
    static isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
    
    static darkenColor(hex, amount = 30) {
        if (!this.isValidColor(hex)) {
            throw new Error('Invalid color format');
        }
        
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    static lightenColor(hex, amount = 30) {
        if (!this.isValidColor(hex)) {
            throw new Error('Invalid color format');
        }
        
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    static generateGradient(color, type = 'darken') {
        const baseColor = color;
        const secondaryColor = type === 'darken' ? 
            this.darkenColor(color) : this.lightenColor(color);
        
        return `linear-gradient(135deg, ${baseColor} 0%, ${secondaryColor} 100%)`;
    }
    
    static getNextAvailableColor(usedColors, colorPalette) {
        const availableColor = colorPalette.find(color => !usedColors.includes(color));
        return availableColor || colorPalette[0];
    }
}
```

### IdGenerator Class
```javascript
class IdGenerator {
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    static generateTimestampId(prefix = 'calendar') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    static generateSequentialId(existingIds, prefix = 'calendar') {
        const existingNumbers = existingIds
            .map(id => parseInt(id.replace(prefix + '-', '')))
            .filter(num => !isNaN(num));
        
        const nextNumber = existingNumbers.length > 0 ? 
            Math.max(...existingNumbers) + 1 : 0;
        
        return `${prefix}-${nextNumber}`;
    }
    
    static getNextOrder(existingOrders) {
        return existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1;
    }
}
```

### ConfigurationManager Class
```javascript
class ConfigurationManager {
    constructor(defaultConfig = {}) {
        this.defaultConfig = defaultConfig;
        this.config = { ...defaultConfig };
    }
    
    getConfig() {
        return { ...this.config };
    }
    
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    
    resetToDefaults() {
        this.config = { ...this.defaultConfig };
    }
    
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    
    importConfig(configString) {
        try {
            const imported = JSON.parse(configString);
            this.config = { ...this.defaultConfig, ...imported };
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
    
    validateConfig(config) {
        // Add validation logic here
        return { isValid: true, errors: [] };
    }
}
```

### CalendarCRUDManager Class
```javascript
class CalendarCRUDManager {
    constructor(config = {}) {
        this.calendars = config.calendars || {};
        this.colorPalette = config.colorPalette || [];
        this.defaults = config.defaults || {};
    }
    
    addCalendar(name, color = null, description = '') {
        const id = IdGenerator.generateTimestampId();
        const selectedColor = color || ColorUtils.getNextAvailableColor(
            Object.values(this.calendars).map(cal => cal.color),
            this.colorPalette
        );
        
        const newCalendar = {
            id,
            name,
            color: selectedColor,
            gradient: ColorUtils.generateGradient(selectedColor),
            description,
            enabled: true,
            visible: true,
            order: IdGenerator.getNextOrder(
                Object.values(this.calendars).map(cal => cal.order)
            )
        };
        
        this.calendars[id] = newCalendar;
        return newCalendar;
    }
    
    updateCalendar(id, updates) {
        if (!this.calendars[id]) {
            return null;
        }
        
        this.calendars[id] = { ...this.calendars[id], ...updates };
        
        // Update gradient if color changed
        if (updates.color) {
            this.calendars[id].gradient = ColorUtils.generateGradient(updates.color);
        }
        
        return this.calendars[id];
    }
    
    deleteCalendar(id) {
        if (this.calendars[id]) {
            delete this.calendars[id];
            return true;
        }
        return false;
    }
    
    getCalendar(id) {
        return this.calendars[id] || null;
    }
    
    toggleCalendarVisibility(id) {
        const calendar = this.calendars[id];
        if (calendar) {
            calendar.visible = !calendar.visible;
            return calendar.visible;
        }
        return false;
    }
}
```

### CalendarQueryManager Class
```javascript
class CalendarQueryManager {
    constructor(calendars = {}) {
        this.calendars = calendars;
    }
    
    getAllCalendars() {
        return Object.values(this.calendars);
    }
    
    getEnabledCalendars() {
        return Object.values(this.calendars).filter(cal => cal.enabled);
    }
    
    getVisibleCalendars() {
        return Object.values(this.calendars).filter(cal => cal.visible);
    }
    
    getCalendar(id) {
        return this.calendars[id] || null;
    }
    
    getCalendarColor(id, useGradient = false) {
        const calendar = this.calendars[id];
        if (calendar) {
            return useGradient ? calendar.gradient : calendar.color;
        }
        return '#3B82F6'; // Default color
    }
    
    getCalendarName(id) {
        const calendar = this.calendars[id];
        return calendar ? calendar.name : 'Unknown Calendar';
    }
    
    getCalendarsByProperty(property, value) {
        return Object.values(this.calendars).filter(cal => cal[property] === value);
    }
    
    getCalendarsByMultipleProperties(properties) {
        return Object.values(this.calendars).filter(cal => {
            return Object.entries(properties).every(([key, value]) => cal[key] === value);
        });
    }
}
```

### EventManager Class
```javascript
class EventManager {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    
    once(event, callback) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        this.onceEvents.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
        
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        // Emit regular events
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
        
        // Emit once events and remove them
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once event callback for ${event}:`, error);
                }
            });
            this.onceEvents.delete(event);
        }
    }
    
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }
}
```

### ConfigurationValidator Class
```javascript
class ConfigurationValidator {
    constructor() {
        this.schemas = {
            calendar: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true },
                color: { type: 'string', required: true },
                gradient: { type: 'string', required: false },
                description: { type: 'string', required: false },
                enabled: { type: 'boolean', default: true },
                visible: { type: 'boolean', default: true },
                order: { type: 'number', default: 0 }
            },
            configuration: {
                calendars: { type: 'object', required: true },
                colorPalette: { type: 'array', required: true },
                defaults: { type: 'object', required: true }
            }
        };
    }
    
    validateCalendar(calendar) {
        const schema = this.schemas.calendar;
        const errors = [];
        
        Object.entries(schema).forEach(([key, rules]) => {
            const value = calendar[key];
            
            if (rules.required && value === undefined) {
                errors.push(`${key} is required`);
            }
            
            if (value !== undefined) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
                
                if (key === 'color' && !ColorUtils.isValidColor(value)) {
                    errors.push(`${key} must be a valid color`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
    
    validateConfiguration(config) {
        const schema = this.schemas.configuration;
        const errors = [];
        
        Object.entries(schema).forEach(([key, rules]) => {
            const value = config[key];
            
            if (rules.required && value === undefined) {
                errors.push(`${key} is required`);
            }
            
            if (value !== undefined) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
}
```

## Enhanced CalendarManager Implementation

```javascript
export class EnhancedCalendarManager {
    constructor(options = {}) {
        this.config = { 
            calendars: { ...CALENDARS },
            colorPalette: [...COLOR_PALETTE],
            defaults: { ...DEFAULTS },
            ...options
        };
        
        this.storageManager = new StorageManager(options.storageKey || 'calendarConfig');
        this.eventManager = new EventManager();
        this.validator = new ConfigurationValidator();
        this.crudManager = new CalendarCRUDManager(this.config);
        this.queryManager = new CalendarQueryManager(this.config.calendars);
        this.configManager = new ConfigurationManager(this.config);
        
        this.initialized = false;
    }
    
    async initialize() {
        try {
            const result = await this.storageManager.load();
            if (result.success) {
                const validation = this.validator.validateConfiguration(result.data);
                if (validation.isValid) {
                    this.config = {
                        calendars: { ...CALENDARS, ...result.data.calendars },
                        colorPalette: [...COLOR_PALETTE],
                        defaults: { ...DEFAULTS, ...result.data.defaults },
                        ...result.data
                    };
                    
                    // Update managers with new config
                    this.crudManager = new CalendarCRUDManager(this.config);
                    this.queryManager = new CalendarQueryManager(this.config.calendars);
                    this.configManager = new ConfigurationManager(this.config);
                } else {
                    console.warn('Invalid configuration loaded, using defaults:', validation.errors);
                }
            }
            
            this.initialized = true;
            this.eventManager.emit('initialized', this.config);
        } catch (error) {
            console.error('Failed to initialize calendar manager:', error);
            this.eventManager.emit('error', error);
        }
    }
    
    async addCalendar(name, color = null, description = '') {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        const newCalendar = this.crudManager.addCalendar(name, color, description);
        const validation = this.validator.validateCalendar(newCalendar);
        
        if (!validation.isValid) {
            throw new Error(`Invalid calendar: ${validation.errors.join(', ')}`);
        }
        
        this.config.calendars[newCalendar.id] = newCalendar;
        await this.saveToStorage();
        
        this.eventManager.emit('calendarAdded', newCalendar);
        return newCalendar;
    }
    
    async updateCalendar(id, updates) {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        const updatedCalendar = this.crudManager.updateCalendar(id, updates);
        if (!updatedCalendar) {
            throw new Error(`Calendar not found: ${id}`);
        }
        
        const validation = this.validator.validateCalendar(updatedCalendar);
        if (!validation.isValid) {
            throw new Error(`Invalid calendar: ${validation.errors.join(', ')}`);
        }
        
        this.config.calendars[id] = updatedCalendar;
        await this.saveToStorage();
        
        this.eventManager.emit('calendarUpdated', updatedCalendar);
        return updatedCalendar;
    }
    
    async deleteCalendar(id) {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        const success = this.crudManager.deleteCalendar(id);
        if (!success) {
            throw new Error(`Calendar not found: ${id}`);
        }
        
        delete this.config.calendars[id];
        await this.saveToStorage();
        
        this.eventManager.emit('calendarDeleted', { id });
        return true;
    }
    
    // Query methods
    getAllCalendars() {
        return this.queryManager.getAllCalendars();
    }
    
    getEnabledCalendars() {
        return this.queryManager.getEnabledCalendars();
    }
    
    getVisibleCalendars() {
        return this.queryManager.getVisibleCalendars();
    }
    
    getCalendar(id) {
        return this.queryManager.getCalendar(id);
    }
    
    getCalendarColor(id, useGradient = false) {
        return this.queryManager.getCalendarColor(id, useGradient);
    }
    
    getCalendarName(id) {
        return this.queryManager.getCalendarName(id);
    }
    
    toggleCalendarVisibility(id) {
        const newState = this.crudManager.toggleCalendarVisibility(id);
        if (newState !== false) {
            this.saveToStorage();
            this.eventManager.emit('calendarVisibilityToggled', { id, visible: newState });
        }
        return newState;
    }
    
    // Configuration methods
    async saveToStorage() {
        if (!this.initialized) {
            throw new Error('Calendar manager not initialized');
        }
        
        try {
            const result = await this.storageManager.save(this.config);
            if (result.success) {
                this.eventManager.emit('saved', this.config);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to save calendar configuration:', error);
            this.eventManager.emit('error', error);
            throw error;
        }
    }
    
    async resetToDefaults() {
        this.configManager.resetToDefaults();
        this.config = this.configManager.getConfig();
        await this.saveToStorage();
        this.eventManager.emit('reset', this.config);
    }
    
    exportConfig() {
        return this.configManager.exportConfig();
    }
    
    async importConfig(configString) {
        const success = this.configManager.importConfig(configString);
        if (success) {
            this.config = this.configManager.getConfig();
            await this.saveToStorage();
            this.eventManager.emit('imported', this.config);
        }
        return success;
    }
    
    getConfig() {
        return this.configManager.getConfig();
    }
    
    updateConfig(updates) {
        this.configManager.updateConfig(updates);
        this.config = this.configManager.getConfig();
        this.saveToStorage();
        this.eventManager.emit('configUpdated', this.config);
    }
    
    // Event handling
    on(event, callback) {
        this.eventManager.on(event, callback);
    }
    
    off(event, callback) {
        this.eventManager.off(event, callback);
    }
    
    // Cleanup
    destroy() {
        this.eventManager.clear();
        this.initialized = false;
    }
}

// Create global instance for backward compatibility
export const enhancedCalendarManager = new EnhancedCalendarManager();

// Default export for backward compatibility
export default EnhancedCalendarManager;
```

This documentation helps identify opportunities for code consolidation and prevents duplicate implementations across the calendar configuration managers system. The modular approach enables better testing, performance optimization, and maintenance of configuration management functionality.
