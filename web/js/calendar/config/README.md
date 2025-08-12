# Calendar Configuration System Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| calendar-config-service.js | API-based calendar configuration service | 218 | 8 | 🟠 |
| index.js | Centralized configuration export | 107 | 5 | 🟡 |
| core/constants.js | Application constants and enums | 200 | 3 | 🟢 |
| core/calendar-config.js | Calendar-specific configuration | 142 | 4 | 🟡 |
| core/css-classes.js | CSS class definitions | 143 | 2 | 🟢 |
| core/selectors.js | DOM selector definitions | 108 | 2 | 🟢 |
| core/templates.js | HTML template definitions | 149 | 3 | 🟡 |
| core/messages.js | User message definitions | 169 | 2 | 🟢 |
| core/index.js | Core configuration exports | 94 | 3 | 🟡 |
| managers/calendar-manager.js | Calendar management logic | 321 | 12 | 🔴 |
| managers/index.js | Manager exports | 20 | 1 | 🟢 |

## Improvement Recommendations

### calendar-config-service.js

#### 🔴 Critical Issues
- **Issue**: No error handling for network failures
  - Current: `console.warn('Failed to load calendar configuration:', error);`
  - Suggested: Implement proper error handling with user feedback and retry logic
  - Impact: Users may not know when calendar loading fails

- **Issue**: Hardcoded API endpoint
  - Current: `'/api/calendar/calendars'`
  - Suggested: Make endpoint configurable via environment or configuration
  - Impact: Difficult to deploy in different environments

#### 🟠 High Priority
- **Issue**: Duplicate calendar storage (both by ID and name)
  - Current: `this.calendars.set(calendar.id, calendarConfig); this.calendarsByName.set(calendar.name, calendarConfig);`
  - Suggested: Use single map with composite key or implement proper indexing
  - Impact: Memory inefficiency and potential data inconsistency

- **Issue**: No validation of API response structure
  - Current: `if (data.success && Array.isArray(data.calendars))`
  - Suggested: Implement comprehensive response validation
  - Impact: Runtime errors if API response format changes

#### 🟡 Medium Priority
- **Issue**: Color generation algorithm is simplistic
  - Current: Basic hash-based color generation
  - Suggested: Implement more sophisticated color generation with contrast checking
  - Impact: Poor color choices for accessibility

- **Issue**: No caching mechanism
  - Current: Fetches from API every time
  - Suggested: Implement intelligent caching with cache invalidation
  - Impact: Unnecessary API calls and slower performance

#### 🟢 Low Priority
- **Issue**: Console logging for debugging
  - Current: `// console.log('📅 Calendar configuration loaded:', this.calendars.size, 'calendars');`
  - Suggested: Implement proper logging system
  - Impact: Debug information not available in production

### managers/calendar-manager.js

#### 🔴 Critical Issues
- **Issue**: No input validation for calendar operations
  - Current: Direct property access without validation
  - Suggested: Implement comprehensive input validation
  - Impact: Runtime errors and data corruption

- **Issue**: Synchronous localStorage operations
  - Current: Direct localStorage access without error handling
  - Suggested: Implement async storage with proper error handling
  - Impact: Blocking operations and potential data loss

- **Issue**: No data integrity checks
  - Current: No validation of calendar data structure
  - Suggested: Implement schema validation for calendar objects
  - Impact: Corrupted data can break the application

#### 🟠 High Priority
- **Issue**: Color manipulation is basic and error-prone
  - Current: Simple hex color darkening without proper color space handling
  - Suggested: Use proper color manipulation library
  - Impact: Poor color quality and potential errors

- **Issue**: No conflict resolution for calendar IDs
  - Current: Simple counter-based ID generation
  - Suggested: Implement UUID-based ID generation
  - Impact: Potential ID conflicts in distributed systems

#### 🟡 Medium Priority
- **Issue**: No event system for configuration changes
  - Current: Direct property updates
  - Suggested: Implement event emitter for configuration changes
  - Impact: Components can't react to configuration changes

- **Issue**: No undo/redo functionality
  - Current: Direct state mutations
  - Suggested: Implement command pattern for undo/redo
  - Impact: No way to revert changes

#### 🟢 Low Priority
- **Issue**: No performance monitoring
  - Current: No metrics collection
  - Suggested: Implement performance monitoring
  - Impact: No visibility into performance issues

### index.js

#### 🟠 High Priority
- **Issue**: Excessive legacy exports
  - Current: Multiple legacy export patterns
  - Suggested: Clean up legacy exports and standardize on new pattern
  - Impact: Confusing API and maintenance burden

#### 🟡 Medium Priority
- **Issue**: No type definitions
  - Current: No TypeScript or JSDoc type definitions
  - Suggested: Add comprehensive type definitions
  - Impact: Poor developer experience and potential runtime errors

#### 🟢 Low Priority
- **Issue**: No versioning information
  - Current: No API versioning
  - Suggested: Implement semantic versioning
  - Impact: Difficult to manage breaking changes

### core/constants.js

#### 🟡 Medium Priority
- **Issue**: Hardcoded values without configuration
  - Current: Static constant values
  - Suggested: Make values configurable via environment
  - Impact: Difficult to customize for different deployments

#### 🟢 Low Priority
- **Issue**: No documentation for magic numbers
  - Current: Some values lack explanation
  - Suggested: Add comprehensive documentation
  - Impact: Difficult to understand value choices

### core/calendar-config.js

#### 🟠 High Priority
- **Issue**: Hardcoded calendar definitions
  - Current: Static calendar configurations
  - Suggested: Make calendars configurable via API or environment
  - Impact: Difficult to customize for different users

#### 🟡 Medium Priority
- **Issue**: No validation schema enforcement
  - Current: Schema defined but not enforced
  - Suggested: Implement runtime schema validation
  - Impact: Invalid data can break the application

## Refactoring Effort Estimate
- Total files needing work: 11
- Estimated hours: 40-60
- Quick wins: calendar-config-service.js error handling, managers/calendar-manager.js validation
- Complex refactors: Complete API redesign, event system implementation

## Dependencies
- Internal dependencies: All core modules depend on each other through index.js
- External dependencies: fetch API, localStorage, console API

## Reusable Functions/Components

### Color Management Utilities
```javascript
// Description: Color generation and manipulation utilities
// Found in: calendar-config-service.js, managers/calendar-manager.js
// Can be used for: Any component needing color generation or manipulation
// Dependencies: None

class ColorUtils {
    static generateColor(id) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    static generateGradient(color) {
        if (color.startsWith('hsl')) {
            const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                const [, h, s, l] = match;
                const darkerL = Math.max(parseInt(l) - 20, 20);
                return `linear-gradient(135deg, ${color} 0%, hsl(${h}, ${s}%, ${darkerL}%) 100%)`;
            }
        }
        return `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
    }
    
    static darkenColor(hex) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * 30);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}
```

### Configuration Validation
```javascript
// Description: Configuration validation utilities
// Found in: managers/calendar-manager.js
// Can be used for: Any configuration object validation
// Dependencies: None

class ConfigValidator {
    static validateCalendar(calendar) {
        const required = ['id', 'name', 'color'];
        return required.every(field => calendar.hasOwnProperty(field));
    }
    
    static validateColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
               /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/.test(color);
    }
}
```

### Storage Management
```javascript
// Description: LocalStorage wrapper with error handling
// Found in: managers/calendar-manager.js
// Can be used for: Any component needing persistent storage
// Dependencies: localStorage API

class StorageManager {
    static async save(key, data) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            }
        } catch (error) {
            console.error('Storage save failed:', error);
            return false;
        }
    }
    
    static async load(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.error('Storage load failed:', error);
            return null;
        }
    }
}
```

## Common Patterns Identified

### Pattern: Legacy Export Compatibility
Files using this: index.js, core/index.js, managers/index.js
Current implementation count: 3 times
Suggested abstraction: Create a legacy compatibility layer

### Pattern: Configuration Object Merging
Files using this: calendar-config-service.js, managers/calendar-manager.js
Current implementation count: 2 times
Suggested abstraction: Create a configuration merger utility

### Pattern: Error Handling with Console Logging
Files using this: calendar-config-service.js, managers/calendar-manager.js
Current implementation count: 2 times
Suggested abstraction: Create a centralized error handling system

## Duplicate Code Found

### Functionality: Color manipulation
Locations: calendar-config-service.js (lines 95-120), managers/calendar-manager.js (lines 200-210)
Lines saved if consolidated: 25
Suggested solution: Extract to ColorUtils class

### Functionality: Configuration validation
Locations: managers/calendar-manager.js (multiple methods)
Lines saved if consolidated: 15
Suggested solution: Extract to ConfigValidator class

### Functionality: Storage operations
Locations: managers/calendar-manager.js (lines 220-250)
Lines saved if consolidated: 20
Suggested solution: Extract to StorageManager class

## Utility Functions to Extract

```javascript
// Configuration merger utility
function mergeConfig(defaults, overrides) {
    return { ...defaults, ...overrides };
}

// ID generation utility
function generateUniqueId(prefix, existingIds) {
    let counter = 0;
    let newId;
    do {
        newId = `${prefix}-${counter}`;
        counter++;
    } while (existingIds.includes(newId));
    return newId;
}

// API response validator
function validateApiResponse(response, schema) {
    // Implementation for validating API responses against schemas
}

// Event emitter for configuration changes
class ConfigEventEmitter {
    // Implementation for notifying components of configuration changes
}
```

## Architecture Recommendations

### 1. Implement Event-Driven Architecture
- Add event emitter to configuration managers
- Allow components to subscribe to configuration changes
- Improve reactivity and decoupling

### 2. Add Configuration Validation Layer
- Implement runtime schema validation
- Add type checking for all configuration objects
- Provide clear error messages for invalid configurations

### 3. Implement Caching Strategy
- Add intelligent caching for API responses
- Implement cache invalidation strategies
- Improve performance and reduce API calls

### 4. Add Configuration Migration System
- Implement versioned configuration schemas
- Add automatic migration for configuration updates
- Ensure backward compatibility

### 5. Implement Error Handling System
- Create centralized error handling
- Add proper error reporting and logging
- Implement retry mechanisms for failed operations

## Performance Optimizations

### 1. Lazy Loading
- Implement lazy loading for configuration modules
- Load only required configuration on demand
- Reduce initial bundle size

### 2. Caching
- Implement intelligent caching for frequently accessed configurations
- Add cache invalidation strategies
- Improve response times

### 3. Bundle Optimization
- Remove duplicate code through utility extraction
- Implement tree shaking for unused configurations
- Optimize import/export patterns

## Security Considerations

### 1. Input Validation
- Add comprehensive input validation for all configuration operations
- Sanitize user inputs to prevent injection attacks
- Validate configuration schemas

### 2. Storage Security
- Implement secure storage for sensitive configuration data
- Add encryption for sensitive configurations
- Implement proper access controls

### 3. API Security
- Add authentication for configuration API endpoints
- Implement rate limiting for API calls
- Add CSRF protection for configuration updates

## Testing Strategy

### 1. Unit Tests
- Test all utility functions
- Test configuration validation
- Test storage operations

### 2. Integration Tests
- Test configuration loading and saving
- Test API integration
- Test event system

### 3. Performance Tests
- Test configuration loading performance
- Test memory usage
- Test caching effectiveness

## Conclusion

The calendar configuration system shows good modular organization but needs improvements in error handling, validation, and performance. The main priorities should be:

1. **Critical**: Fix error handling and input validation
2. **High**: Implement proper caching and event system
3. **Medium**: Add comprehensive testing and documentation
4. **Low**: Optimize performance and add monitoring

The system has good potential for reuse with proper extraction of utility functions and implementation of the recommended architectural improvements.

## Function Documentation

This section documents all functions across the config folder to help identify potential reimplementations and ensure code reuse.

### index.js Functions
- **No functions** - This file only contains exports and re-exports for configuration modules

### calendar-config-service.js Functions

#### Constructor and Initialization Functions
- **constructor()** - Initializes CalendarConfigService with empty calendar maps and loading state
- **loadCalendars()** - Loads calendar configuration from API with promise caching to prevent duplicate requests
- **_fetchCalendars()** - Fetches calendars from API endpoint with timeout and fallback to default configuration
- **_loadDefaultCalendars()** - Loads default calendar configuration as fallback when API fails

#### Calendar Processing Functions
- **_processCalendars(calendars)** - Processes API response calendars and stores them in both ID and name maps
- **_generateColor(calendarId)** - Generates HSL color based on calendar ID hash for consistent color assignment
- **_generateGradient(color)** - Generates CSS gradient from color, handling both HSL and hex color formats

#### Calendar Query Functions
- **getCalendar(calendarId)** - Gets calendar by ID or name from either storage map
- **getAllCalendars()** - Returns all calendars as array from main ID-based map to avoid duplicates
- **getCalendarColor(calendarId)** - Returns calendar color or default blue if calendar not found
- **getCalendarName(calendarId)** - Returns calendar name or original ID if calendar not found
- **isCalendarEnabled(calendarId)** - Checks if calendar is enabled, defaults to true if not found
- **isCalendarVisible(calendarId)** - Checks if calendar is visible, defaults to true if not found
- **getEnabledCalendars()** - Returns array of enabled calendars filtered from all calendars
- **getVisibleCalendars()** - Returns array of visible calendars filtered from all calendars

#### State Management Functions
- **refresh()** - Resets loading state and reloads calendar configuration from API
- **isConfigurationLoaded()** - Returns boolean indicating if configuration has been loaded

## Potential Reimplementations Identified

### Color Generation Functions
- **calendar-config-service.js: _generateColor()** - Generates HSL color from ID hash
- **calendar-config-service.js: _generateGradient()** - Generates CSS gradient from color
- **managers/calendar-manager.js: darkenColor()** - Darkens hex color for gradient generation

**Recommendation**: Create ColorUtils utility class

### Calendar Query Functions
- **calendar-config-service.js: getCalendar()** - Gets calendar by ID or name
- **calendar-config-service.js: getCalendarColor()** - Gets calendar color
- **calendar-config-service.js: getCalendarName()** - Gets calendar name
- **managers/calendar-manager.js: getCalendar()** - Gets calendar by ID
- **managers/calendar-manager.js: getCalendarColor()** - Gets calendar color
- **managers/calendar-manager.js: getCalendarName()** - Gets calendar name

**Recommendation**: Create CalendarQueryManager utility class

### Calendar Filter Functions
- **calendar-config-service.js: getEnabledCalendars()** - Gets enabled calendars
- **calendar-config-service.js: getVisibleCalendars()** - Gets visible calendars
- **managers/calendar-manager.js: getEnabledCalendars()** - Gets enabled calendars
- **managers/calendar-manager.js: getVisibleCalendars()** - Gets visible calendars

**Recommendation**: Create CalendarFilterManager utility class

### Storage Functions
- **managers/calendar-manager.js: saveToStorage()** - Saves configuration to localStorage
- **managers/calendar-manager.js: loadFromStorage()** - Loads configuration from localStorage

**Recommendation**: Create StorageManager utility class

### Configuration Management Functions
- **managers/calendar-manager.js: addCalendar()** - Adds new calendar
- **managers/calendar-manager.js: updateCalendar()** - Updates existing calendar
- **managers/calendar-manager.js: deleteCalendar()** - Deletes calendar
- **managers/calendar-manager.js: toggleCalendarVisibility()** - Toggles calendar visibility

**Recommendation**: Create CalendarCRUDManager utility class

### ID Generation Functions
- **managers/calendar-manager.js: generateCalendarId()** - Generates unique calendar ID
- **managers/calendar-manager.js: getNextOrder()** - Gets next order number

**Recommendation**: Create IdGenerator utility class

## Functions with Similar Purposes

### Calendar Retrieval Functions
- **calendar-config-service.js: getCalendar()** - Gets calendar by ID or name
- **calendar-config-service.js: getAllCalendars()** - Gets all calendars
- **managers/calendar-manager.js: getCalendar()** - Gets calendar by ID
- **managers/calendar-manager.js: getAllCalendars()** - Gets all calendars

### Calendar Property Functions
- **calendar-config-service.js: getCalendarColor()** - Gets calendar color
- **calendar-config-service.js: getCalendarName()** - Gets calendar name
- **managers/calendar-manager.js: getCalendarColor()** - Gets calendar color
- **managers/calendar-manager.js: getCalendarName()** - Gets calendar name

### Calendar Status Functions
- **calendar-config-service.js: isCalendarEnabled()** - Checks if calendar is enabled
- **calendar-config-service.js: isCalendarVisible()** - Checks if calendar is visible
- **managers/calendar-manager.js: toggleCalendarVisibility()** - Toggles calendar visibility

### Calendar Filter Functions
- **calendar-config-service.js: getEnabledCalendars()** - Gets enabled calendars
- **calendar-config-service.js: getVisibleCalendars()** - Gets visible calendars
- **managers/calendar-manager.js: getEnabledCalendars()** - Gets enabled calendars
- **managers/calendar-manager.js: getVisibleCalendars()** - Gets visible calendars

### Color Management Functions
- **calendar-config-service.js: _generateColor()** - Generates color from ID
- **calendar-config-service.js: _generateGradient()** - Generates gradient from color
- **managers/calendar-manager.js: darkenColor()** - Darkens hex color
- **managers/calendar-manager.js: getNextAvailableColor()** - Gets next available color

### Configuration Management Functions
- **managers/calendar-manager.js: addCalendar()** - Adds calendar
- **managers/calendar-manager.js: updateCalendar()** - Updates calendar
- **managers/calendar-manager.js: deleteCalendar()** - Deletes calendar
- **managers/calendar-manager.js: resetToDefaults()** - Resets to defaults
- **managers/calendar-manager.js: exportConfig()** - Exports configuration
- **managers/calendar-manager.js: importConfig()** - Imports configuration

## Utility Functions to Extract

### ColorUtils Class
```javascript
class ColorUtils {
    static generateColor(id) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    static generateGradient(color) {
        if (color.startsWith('hsl')) {
            const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                const [, h, s, l] = match;
                const darkerL = Math.max(parseInt(l) - 20, 20);
                return `linear-gradient(135deg, ${color} 0%, hsl(${h}, ${s}%, ${darkerL}%) 100%)`;
            }
        }
        return `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
    }
    
    static darkenColor(hex, amount = 30) {
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
    
    static getNextAvailableColor(usedColors, colorPalette) {
        const availableColor = colorPalette.find(color => !usedColors.includes(color));
        return availableColor || colorPalette[0];
    }
    
    static isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
}
```

### CalendarQueryManager Class
```javascript
class CalendarQueryManager {
    constructor(calendars = new Map()) {
        this.calendars = calendars;
        this.calendarsByName = new Map();
        
        // Build name index
        calendars.forEach((calendar, id) => {
            this.calendarsByName.set(calendar.name, calendar);
        });
    }
    
    getCalendar(calendarId) {
        // First try by ID, then by name
        return this.calendars.get(calendarId) || this.calendarsByName.get(calendarId);
    }
    
    getAllCalendars() {
        return Array.from(this.calendars.values());
    }
    
    getCalendarColor(calendarId, defaultColor = '#4285f4') {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.color : defaultColor;
    }
    
    getCalendarName(calendarId) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.name : calendarId;
    }
    
    isCalendarEnabled(calendarId, defaultValue = true) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.enabled : defaultValue;
    }
    
    isCalendarVisible(calendarId, defaultValue = true) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.visible : defaultValue;
    }
    
    getEnabledCalendars() {
        return this.getAllCalendars().filter(cal => cal.enabled);
    }
    
    getVisibleCalendars() {
        return this.getAllCalendars().filter(cal => cal.visible);
    }
    
    getCalendarsByProperty(property, value) {
        return this.getAllCalendars().filter(cal => cal[property] === value);
    }
}
```

### CalendarFilterManager Class
```javascript
class CalendarFilterManager {
    constructor(calendars = []) {
        this.calendars = calendars;
    }
    
    getEnabledCalendars() {
        return this.calendars.filter(cal => cal.enabled);
    }
    
    getVisibleCalendars() {
        return this.calendars.filter(cal => cal.visible);
    }
    
    getCalendarsByStatus(enabled = true, visible = true) {
        return this.calendars.filter(cal => cal.enabled === enabled && cal.visible === visible);
    }
    
    getCalendarsByCategory(category) {
        return this.calendars.filter(cal => cal.category === category);
    }
    
    getCalendarsByColor(color) {
        return this.calendars.filter(cal => cal.color === color);
    }
    
    getCalendarsByAccessRole(accessRole) {
        return this.calendars.filter(cal => cal.accessRole === accessRole);
    }
    
    getPrimaryCalendars() {
        return this.calendars.filter(cal => cal.primary === true);
    }
    
    getCalendarsByOrder(minOrder = 0, maxOrder = Infinity) {
        return this.calendars.filter(cal => cal.order >= minOrder && cal.order <= maxOrder);
    }
}
```

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

### CalendarCRUDManager Class
```javascript
class CalendarCRUDManager {
    constructor(calendars = {}) {
        this.calendars = calendars;
    }
    
    addCalendar(name, color = null, description = '') {
        const id = IdGenerator.generateTimestampId();
        const selectedColor = color || ColorUtils.getNextAvailableColor(
            Object.values(this.calendars).map(cal => cal.color),
            this.getColorPalette()
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
    
    toggleCalendarVisibility(id) {
        const calendar = this.calendars[id];
        if (calendar) {
            calendar.visible = !calendar.visible;
            return calendar.visible;
        }
        return false;
    }
    
    toggleCalendarEnabled(id) {
        const calendar = this.calendars[id];
        if (calendar) {
            calendar.enabled = !calendar.enabled;
            return calendar.enabled;
        }
        return false;
    }
    
    getColorPalette() {
        return ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2', '#a8edea', '#ff9a9e', '#fecfef', '#fad0c4'];
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

### ApiService Class
```javascript
class ApiService {
    constructor(baseUrl = '/api', timeout = 5000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }
    
    async fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { 'Accept': 'application/json', ...options.headers },
            signal: AbortSignal.timeout(this.timeout),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async get(endpoint) {
        return this.fetch(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.fetch(endpoint, { method: 'DELETE' });
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
    
    validateApiResponse(response, expectedStructure) {
        const errors = [];
        
        if (!response || typeof response !== 'object') {
            errors.push('Response must be an object');
            return { isValid: false, errors };
        }
        
        Object.entries(expectedStructure).forEach(([key, rules]) => {
            const value = response[key];
            
            if (rules.required && value === undefined) {
                errors.push(`${key} is required in response`);
            }
            
            if (value !== undefined) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
                
                if (rules.array && !Array.isArray(value)) {
                    errors.push(`${key} must be an array`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
}
```

## Enhanced Calendar Configuration Service Implementation

```javascript
export class EnhancedCalendarConfigService {
    constructor(options = {}) {
        this.apiService = new ApiService(options.apiBaseUrl, options.timeout);
        this.storageManager = new StorageManager(options.storageKey);
        this.validator = new ConfigurationValidator();
        this.colorUtils = new ColorUtils();
        this.queryManager = new CalendarQueryManager();
        this.filterManager = new CalendarFilterManager();
        this.crudManager = new CalendarCRUDManager();
        
        this.calendars = new Map();
        this.isLoaded = false;
        this.loadPromise = null;
        this.cache = new Map();
        this.listeners = new Set();
    }
    
    async loadCalendars() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        this.loadPromise = this._loadCalendarsWithCache();
        return this.loadPromise;
    }
    
    async _loadCalendarsWithCache() {
        // Try cache first
        const cached = this.cache.get('calendars');
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
            this._processCalendars(cached.data);
            this.isLoaded = true;
            return true;
        }
        
        // Try API
        const result = await this.apiService.get('/calendar/calendars');
        if (result.success) {
            const validation = this.validator.validateApiResponse(result.data, {
                success: { type: 'boolean', required: true },
                calendars: { type: 'array', required: true }
            });
            
            if (validation.isValid && result.data.success) {
                this._processCalendars(result.data.calendars);
                this.cache.set('calendars', { data: result.data.calendars, timestamp: Date.now() });
                this.isLoaded = true;
                this._notifyListeners('loaded', result.data.calendars);
                return true;
            }
        }
        
        // Try storage
        const stored = await this.storageManager.load();
        if (stored.success && stored.data) {
            this._processCalendars(stored.data);
            this.isLoaded = true;
            this._notifyListeners('loadedFromStorage', stored.data);
            return true;
        }
        
        // Fallback to defaults
        this._loadDefaultCalendars();
        this.isLoaded = true;
        this._notifyListeners('loadedDefaults', this.getAllCalendars());
        return false;
    }
    
    _processCalendars(calendars) {
        this.calendars.clear();
        
        calendars.forEach((calendar, index) => {
            const calendarConfig = {
                id: calendar.id,
                name: calendar.name || calendar.id,
                color: calendar.color || this.colorUtils.generateColor(calendar.id),
                gradient: this.colorUtils.generateGradient(calendar.color || this.colorUtils.generateColor(calendar.id)),
                description: calendar.description || '',
                enabled: calendar.selected !== false,
                visible: calendar.selected !== false,
                order: index + 1,
                accessRole: calendar.accessRole,
                primary: calendar.primary || false
            };
            
            // Validate calendar
            const validation = this.validator.validateCalendar(calendarConfig);
            if (!validation.isValid) {
                console.warn(`Invalid calendar configuration for ${calendar.id}:`, validation.errors);
                return;
            }
            
            this.calendars.set(calendar.id, calendarConfig);
        });
        
        // Update managers
        this.queryManager = new CalendarQueryManager(this.calendars);
        this.filterManager = new CalendarFilterManager(this.getAllCalendars());
        this.crudManager = new CalendarCRUDManager(this.calendars);
    }
    
    _loadDefaultCalendars() {
        const defaultCalendars = [
            {
                id: 'default-calendar',
                name: 'Default Calendar',
                color: '#4285f4',
                gradient: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                description: 'Default calendar',
                enabled: true,
                visible: true,
                order: 1
            }
        ];
        
        this._processCalendars(defaultCalendars);
    }
    
    // Delegate to query manager
    getCalendar(calendarId) {
        return this.queryManager.getCalendar(calendarId);
    }
    
    getAllCalendars() {
        return this.queryManager.getAllCalendars();
    }
    
    getCalendarColor(calendarId) {
        return this.queryManager.getCalendarColor(calendarId);
    }
    
    getCalendarName(calendarId) {
        return this.queryManager.getCalendarName(calendarId);
    }
    
    isCalendarEnabled(calendarId) {
        return this.queryManager.isCalendarEnabled(calendarId);
    }
    
    isCalendarVisible(calendarId) {
        return this.queryManager.isCalendarVisible(calendarId);
    }
    
    // Delegate to filter manager
    getEnabledCalendars() {
        return this.filterManager.getEnabledCalendars();
    }
    
    getVisibleCalendars() {
        return this.filterManager.getVisibleCalendars();
    }
    
    // Delegate to CRUD manager
    addCalendar(name, color = null, description = '') {
        const newCalendar = this.crudManager.addCalendar(name, color, description);
        this._notifyListeners('calendarAdded', newCalendar);
        return newCalendar;
    }
    
    updateCalendar(id, updates) {
        const updatedCalendar = this.crudManager.updateCalendar(id, updates);
        if (updatedCalendar) {
            this._notifyListeners('calendarUpdated', updatedCalendar);
        }
        return updatedCalendar;
    }
    
    deleteCalendar(id) {
        const success = this.crudManager.deleteCalendar(id);
        if (success) {
            this._notifyListeners('calendarDeleted', { id });
        }
        return success;
    }
    
    toggleCalendarVisibility(id) {
        const newState = this.crudManager.toggleCalendarVisibility(id);
        if (newState !== false) {
            this._notifyListeners('calendarVisibilityToggled', { id, visible: newState });
        }
        return newState;
    }
    
    // Event handling
    subscribe(event, callback) {
        this.listeners.add({ event, callback });
        return () => {
            this.listeners.delete({ event, callback });
        };
    }
    
    _notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            if (listener.event === event) {
                try {
                    listener.callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            }
        });
    }
    
    // Cache management
    clearCache() {
        this.cache.clear();
    }
    
    // Refresh functionality
    async refresh() {
        this.clearCache();
        this.isLoaded = false;
        this.loadPromise = null;
        return this.loadCalendars();
    }
    
    isConfigurationLoaded() {
        return this.isLoaded;
    }
}

// Export singleton instance
export const enhancedCalendarConfigService = new EnhancedCalendarConfigService();

// Default export for backward compatibility
export default EnhancedCalendarConfigService;
```

This documentation helps identify opportunities for code consolidation and prevents duplicate implementations across the calendar configuration system. The modular approach enables better testing, performance optimization, and maintenance of configuration management functionality.
