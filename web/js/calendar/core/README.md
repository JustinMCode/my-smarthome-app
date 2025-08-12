# Calendar Core System Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| calendar-core.js | Main calendar orchestrator | 458 | 15 | 🔴 |
| calendar-events.js | Event management and API integration | 481 | 12 | 🟠 |
| calendar-state.js | State management and persistence | 345 | 8 | 🟡 |
| index.js | Core system exports | 37 | 2 | 🟢 |

## Improvement Recommendations

### calendar-core.js

#### 🔴 Critical Issues
- **Issue**: No error handling for component initialization failures
  - Current: `this.viewManager = new ViewManager(this); this.viewManager.init();`
  - Suggested: Implement try-catch blocks and fallback mechanisms
  - Impact: Application crashes if any component fails to initialize

- **Issue**: Synchronous component initialization blocking main thread
  - Current: Sequential component initialization in `init()` method
  - Suggested: Implement async initialization with proper error handling
  - Impact: Poor user experience during loading

- **Issue**: No cleanup for failed initialization
  - Current: No rollback mechanism if initialization fails
  - Suggested: Implement proper cleanup and resource disposal
  - Impact: Memory leaks and inconsistent state

#### 🟠 High Priority
- **Issue**: Tight coupling between components
  - Current: Direct component instantiation and method calls
  - Suggested: Implement dependency injection and event-driven communication
  - Impact: Difficult to test and maintain

- **Issue**: No performance monitoring
  - Current: No metrics collection for initialization or operations
  - Suggested: Implement performance monitoring and metrics collection
  - Impact: No visibility into performance issues

- **Issue**: Hardcoded refresh interval
  - Current: `setInterval(async () => { ... }, 300000); // 5 minutes`
  - Suggested: Make interval configurable and implement adaptive refresh
  - Impact: Poor performance and inflexible configuration

#### 🟡 Medium Priority
- **Issue**: Console logging instead of proper logging system
  - Current: `console.log('✅ Event added:', event.title);`
  - Suggested: Use structured logging with levels and context
  - Impact: Poor debugging and monitoring capabilities

- **Issue**: No component lifecycle management
  - Current: Direct component creation without lifecycle hooks
  - Suggested: Implement proper component lifecycle management
  - Impact: Resource leaks and inconsistent state

#### 🟢 Low Priority
- **Issue**: No versioning information
  - Current: No API versioning or compatibility checks
  - Suggested: Implement semantic versioning and compatibility layers
  - Impact: Difficult to manage breaking changes

### calendar-events.js

#### 🔴 Critical Issues
- **Issue**: No validation of API response data
  - Current: `if (data && data.success && Array.isArray(data.events))`
  - Suggested: Implement comprehensive data validation and sanitization
  - Impact: Runtime errors and data corruption

- **Issue**: Synchronous localStorage operations
  - Current: Direct localStorage access without error handling
  - Suggested: Implement async storage with proper error handling
  - Impact: Blocking operations and potential data loss

#### 🟠 High Priority
- **Issue**: Complex date parsing without proper error handling
  - Current: Multiple date format handling in `parseDate()` method
  - Suggested: Use a robust date parsing library with validation
  - Impact: Invalid dates and runtime errors

- **Issue**: No caching mechanism for API responses
  - Current: Fetches from API every time
  - Suggested: Implement intelligent caching with cache invalidation
  - Impact: Unnecessary API calls and slower performance

- **Issue**: Hardcoded API endpoint
  - Current: `CALENDAR_CONFIG.API.EVENTS`
  - Suggested: Make endpoint configurable via environment
  - Impact: Difficult to deploy in different environments

#### 🟡 Medium Priority
- **Issue**: Basic event categorization algorithm
  - Current: Simple string matching in `categorizeEvent()` method
  - Suggested: Implement more sophisticated categorization with ML/AI
  - Impact: Poor categorization accuracy

- **Issue**: No event deduplication
  - Current: No handling of duplicate events
  - Suggested: Implement event deduplication logic
  - Impact: Duplicate events in calendar

#### 🟢 Low Priority
- **Issue**: No event conflict detection
  - Current: No validation of event time conflicts
  - Suggested: Implement event conflict detection and resolution
  - Impact: Overlapping events not handled

### calendar-state.js

#### 🟠 High Priority
- **Issue**: No state validation
  - Current: Direct state updates without validation
  - Suggested: Implement state validation and type checking
  - Impact: Invalid state can break the application

- **Issue**: Synchronous localStorage operations
  - Current: Direct localStorage access in `saveToStorage()` and `loadFromStorage()`
  - Suggested: Implement async storage with proper error handling
  - Impact: Blocking operations and potential data loss

#### 🟡 Medium Priority
- **Issue**: No state change batching
  - Current: Immediate notification on every state change
  - Suggested: Implement state change batching for performance
  - Impact: Performance issues with rapid state changes

- **Issue**: No state history or undo/redo
  - Current: No state history tracking
  - Suggested: Implement state history for undo/redo functionality
  - Impact: No way to revert state changes

#### 🟢 Low Priority
- **Issue**: No state persistence validation
  - Current: No validation of persisted state data
  - Suggested: Implement state persistence validation
  - Impact: Corrupted state data can break the application

### index.js

#### 🟡 Medium Priority
- **Issue**: Excessive legacy exports
  - Current: Multiple legacy export patterns
  - Suggested: Clean up legacy exports and standardize on new pattern
  - Impact: Confusing API and maintenance burden

#### 🟢 Low Priority
- **Issue**: No type definitions
  - Current: No TypeScript or JSDoc type definitions
  - Suggested: Add comprehensive type definitions
  - Impact: Poor developer experience

## Refactoring Effort Estimate
- Total files needing work: 4
- Estimated hours: 60-80
- Quick wins: Add error handling to calendar-core.js, implement async storage in calendar-events.js
- Complex refactors: Complete dependency injection system, event-driven architecture

## Dependencies
- Internal dependencies: All core modules depend on each other through tight coupling
- External dependencies: fetch API, localStorage, console API, logger utility

## Reusable Functions/Components

### Component Lifecycle Manager
```javascript
// Description: Manages component lifecycle and initialization
// Found in: calendar-core.js
// Can be used for: Any component system needing lifecycle management
// Dependencies: Event emitter system

class ComponentLifecycleManager {
    constructor() {
        this.components = new Map();
        this.initializationOrder = [];
        this.isInitialized = false;
    }
    
    registerComponent(name, component, dependencies = []) {
        this.components.set(name, {
            component,
            dependencies,
            isInitialized: false,
            error: null
        });
        this.initializationOrder.push(name);
    }
    
    async initializeAll() {
        const initPromises = [];
        
        for (const [name, config] of this.components) {
            if (this.canInitialize(name, config)) {
                initPromises.push(this.initializeComponent(name, config));
            }
        }
        
        await Promise.all(initPromises);
        this.isInitialized = true;
    }
    
    async initializeComponent(name, config) {
        try {
            if (typeof config.component.init === 'function') {
                await config.component.init();
            }
            config.isInitialized = true;
        } catch (error) {
            config.error = error;
            throw new Error(`Failed to initialize ${name}: ${error.message}`);
        }
    }
    
    canInitialize(name, config) {
        return config.dependencies.every(dep => 
            this.components.get(dep)?.isInitialized
        );
    }
    
    cleanup() {
        for (const [name, config] of this.components) {
            if (config.component.destroy && typeof config.component.destroy === 'function') {
                config.component.destroy();
            }
        }
        this.components.clear();
        this.isInitialized = false;
    }
}
```

### Event Processing Pipeline
```javascript
// Description: Processes and validates events from various sources
// Found in: calendar-events.js
// Can be used for: Any system needing event processing and validation
// Dependencies: Date parsing utilities, validation schemas

class EventProcessingPipeline {
    constructor() {
        this.processors = [];
        this.validators = [];
    }
    
    addProcessor(processor) {
        this.processors.push(processor);
    }
    
    addValidator(validator) {
        this.validators.push(validator);
    }
    
    async processEvents(rawEvents) {
        let processedEvents = rawEvents;
        
        // Apply processors
        for (const processor of this.processors) {
            processedEvents = await processor.process(processedEvents);
        }
        
        // Apply validators
        for (const validator of this.validators) {
            const validationResult = await validator.validate(processedEvents);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }
        }
        
        return processedEvents;
    }
}

class EventDateProcessor {
    async process(events) {
        return events.map(event => ({
            ...event,
            start: this.parseDate(event.start),
            end: this.parseDate(event.end)
        }));
    }
    
    parseDate(dateString) {
        // Robust date parsing implementation
    }
}

class EventValidationProcessor {
    async validate(events) {
        const errors = [];
        
        for (const event of events) {
            if (!event.title || !event.start || !event.end) {
                errors.push(`Event ${event.id} missing required fields`);
            }
            
            if (new Date(event.start) >= new Date(event.end)) {
                errors.push(`Event ${event.id} has invalid date range`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

### State Management System
```javascript
// Description: Advanced state management with validation and persistence
// Found in: calendar-state.js
// Can be used for: Any application needing robust state management
// Dependencies: Validation schemas, storage utilities

class AdvancedStateManager {
    constructor(initialState = {}, options = {}) {
        this.state = { ...initialState };
        this.history = [];
        this.maxHistorySize = options.maxHistorySize || 50;
        this.validators = new Map();
        this.subscribers = new Map();
        this.isBatching = false;
        this.batchedUpdates = [];
    }
    
    addValidator(key, validator) {
        this.validators.set(key, validator);
    }
    
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        
        return () => {
            this.subscribers.get(key).delete(callback);
        };
    }
    
    set(key, value) {
        // Validate if validator exists
        if (this.validators.has(key)) {
            const validationResult = this.validators.get(key)(value);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed for ${key}: ${validationResult.error}`);
            }
        }
        
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Add to history
        this.addToHistory(key, oldValue, value);
        
        // Notify subscribers
        this.notifySubscribers(key, value, oldValue);
    }
    
    addToHistory(key, oldValue, newValue) {
        this.history.push({
            key,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    
    undo() {
        if (this.history.length === 0) return false;
        
        const lastChange = this.history.pop();
        this.state[lastChange.key] = lastChange.oldValue;
        this.notifySubscribers(lastChange.key, lastChange.oldValue, lastChange.newValue);
        return true;
    }
    
    batch(updates) {
        this.isBatching = true;
        this.batchedUpdates = [];
        
        try {
            for (const [key, value] of Object.entries(updates)) {
                this.set(key, value);
            }
        } finally {
            this.isBatching = false;
            this.processBatchedUpdates();
        }
    }
    
    processBatchedUpdates() {
        if (this.batchedUpdates.length > 0) {
            // Process all batched updates at once
            this.batchedUpdates.forEach(({ key, value, oldValue }) => {
                this.notifySubscribers(key, value, oldValue);
            });
            this.batchedUpdates = [];
        }
    }
    
    notifySubscribers(key, newValue, oldValue) {
        if (this.isBatching) {
            this.batchedUpdates.push({ key, value: newValue, oldValue });
            return;
        }
        
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, this.state);
                } catch (error) {
                    console.error('State subscriber error:', error);
                }
            });
        }
    }
}
```

## Common Patterns Identified

### Pattern: Component Initialization
Files using this: calendar-core.js
Current implementation count: 1 time
Suggested abstraction: ComponentLifecycleManager class

### Pattern: Event Processing Pipeline
Files using this: calendar-events.js
Current implementation count: 1 time
Suggested abstraction: EventProcessingPipeline class

### Pattern: State Subscription System
Files using this: calendar-state.js
Current implementation count: 1 time
Suggested abstraction: AdvancedStateManager class

## Duplicate Code Found

### Functionality: Date parsing and validation
Locations: calendar-events.js (lines 120-180)
Lines saved if consolidated: 60
Suggested solution: Extract to DateUtils class

### Functionality: Storage operations
Locations: calendar-events.js (lines 350-380), calendar-state.js (lines 280-320)
Lines saved if consolidated: 40
Suggested solution: Extract to StorageManager class

### Functionality: Error handling and logging
Locations: calendar-core.js (multiple methods), calendar-events.js (multiple methods)
Lines saved if consolidated: 30
Suggested solution: Extract to ErrorHandler class

## Utility Functions to Extract

```javascript
// Performance monitoring utility
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    
    startTimer(name) {
        this.startTimes.set(name, performance.now());
    }
    
    endTimer(name) {
        const startTime = this.startTimes.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.metrics.set(name, duration);
            this.startTimes.delete(name);
            return duration;
        }
        return 0;
    }
    
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
}

// Dependency injection container
class DependencyContainer {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }
    
    register(name, factory, options = {}) {
        this.services.set(name, { factory, singleton: options.singleton || false });
    }
    
    resolve(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }
        
        if (service.singleton) {
            if (!this.singletons.has(name)) {
                this.singletons.set(name, service.factory());
            }
            return this.singletons.get(name);
        }
        
        return service.factory();
    }
}

// Event bus for loose coupling
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => {
            this.listeners.get(event).delete(callback);
        };
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Event bus error:', error);
                }
            });
        }
    }
}
```

## Architecture Recommendations

### 1. Implement Dependency Injection
- Create a dependency injection container
- Decouple components from direct instantiation
- Improve testability and maintainability

### 2. Add Event-Driven Architecture
- Implement an event bus for component communication
- Replace direct method calls with events
- Improve loose coupling and extensibility

### 3. Implement Component Lifecycle Management
- Add proper component lifecycle hooks
- Implement initialization order management
- Add cleanup and resource disposal

### 4. Add Performance Monitoring
- Implement performance metrics collection
- Add performance monitoring for critical operations
- Provide performance insights and optimization opportunities

### 5. Implement Robust Error Handling
- Create centralized error handling system
- Add error recovery mechanisms
- Implement proper error reporting and logging

## Performance Optimizations

### 1. Lazy Loading
- Implement lazy loading for core modules
- Load only required functionality on demand
- Reduce initial bundle size and loading time

### 2. State Batching
- Implement state change batching
- Reduce unnecessary re-renders
- Improve performance with rapid state changes

### 3. Caching Strategy
- Implement intelligent caching for API responses
- Add cache invalidation strategies
- Improve response times and reduce API calls

### 4. Memory Management
- Implement proper cleanup and resource disposal
- Add memory leak detection
- Optimize memory usage patterns

## Security Considerations

### 1. Input Validation
- Add comprehensive input validation for all data
- Sanitize user inputs to prevent injection attacks
- Validate API responses and state data

### 2. Error Information Disclosure
- Implement proper error handling without exposing sensitive information
- Add error logging without exposing internal details
- Implement secure error reporting

### 3. Data Persistence Security
- Implement secure storage for sensitive data
- Add encryption for sensitive state information
- Implement proper access controls

## Testing Strategy

### 1. Unit Tests
- Test all utility functions and classes
- Test state management and validation
- Test event processing and categorization

### 2. Integration Tests
- Test component interaction and communication
- Test state synchronization and persistence
- Test event flow and processing

### 3. Performance Tests
- Test core loading and initialization performance
- Test state management efficiency
- Test memory usage and cleanup

## Conclusion

The calendar core system shows good organization but needs significant improvements in error handling, performance, and architecture. The main priorities should be:

1. **Critical**: Fix error handling and component initialization
2. **High**: Implement dependency injection and event-driven architecture
3. **Medium**: Add performance monitoring and state batching
4. **Low**: Optimize memory usage and add comprehensive testing

The system has excellent potential for reuse with proper extraction of utility functions and implementation of the recommended architectural improvements.

## Function Documentation

This section documents all functions across the core folder to help identify potential reimplementations and ensure code reuse.

### index.js Functions
- **No functions** - This file only contains exports and re-exports for core modules

### calendar-core.js Functions

#### Constructor and Initialization Functions
- **constructor(dashboard)** - Initializes CalendarCore with dashboard reference, creates CalendarState and CalendarEvents instances, sets up component references and refresh interval
- **init()** - Main async initialization method that sets up state listeners, loads saved state, forces month view, loads events, initializes view manager, header, and touch gestures, sets up auto-refresh
- **setupAutoRefresh()** - Sets up auto-refresh interval (5 minutes) to refresh events from API, clears existing interval before setting new one

#### State Management Functions
- **setupStateListeners()** - Sets up state change listeners for view changes, date changes, events changes, and loading state changes
- **handleViewChange(newView)** - Handles view changes by updating UI components (view manager and header) and saving state
- **handleDateChange(newDate)** - Handles date changes by updating UI components and saving state
- **handleEventsChange(newEvents)** - Handles events changes by updating UI components and dashboard next event

#### Getter Functions
- **getViewManager()** - Returns the view manager instance
- **getHeader()** - Returns the header component instance
- **getTouchGestures()** - Returns the touch gestures instance
- **getState()** - Returns current state from CalendarState
- **getCurrentView()** - Returns current view from state
- **getCurrentDate()** - Returns current date from state
- **getSelectedDate()** - Returns selected date from state
- **getEvents()** - Returns all events from state

#### Event Management Functions
- **getEventsForDate(date)** - Gets events for specific date using CalendarEvents
- **getUpcomingEvents(count)** - Gets upcoming events with error handling and logging
- **getNextEvent()** - Gets next event with error handling and logging
- **getTodayEvents()** - Gets today's events with error handling and logging
- **addEvent(eventData)** - Adds new event using CalendarEvents and logs success
- **updateEvent(eventId, updates)** - Updates existing event using CalendarEvents and logs success
- **deleteEvent(eventId)** - Deletes event using CalendarEvents and logs success
- **searchEvents(query)** - Searches events using CalendarEvents
- **getEventStats()** - Gets event statistics using CalendarEvents

#### Navigation Functions
- **navigate(direction)** - Navigates calendar using state management
- **switchView(view)** - Switches view using state management
- **selectDate(date)** - Selects date using state management and auto-switches to agenda view from month view
- **goToToday()** - Goes to today using state navigation

#### Utility Functions
- **refreshEvents()** - Refreshes events from API with error handling and logging
- **getSettings()** - Gets settings from state
- **updateSettings(settings)** - Updates settings in state and saves to storage
- **showNotification(message, type)** - Shows notification using dashboard or falls back to console logging
- **destroy()** - Destroys calendar core by clearing intervals, saving state, and clearing references
- **reset()** - Resets calendar to default state and reloads from storage

### calendar-state.js Functions

#### Constructor and Initialization Functions
- **constructor()** - Initializes CalendarState with default state object including view, dates, events, UI state, touch state, and settings

#### Subscription Management Functions
- **subscribe(callback)** - Subscribes to state changes and returns listener ID for unsubscribing
- **unsubscribe(id)** - Unsubscribes from state changes using listener ID
- **notify(key, value)** - Notifies all listeners of state change with error handling

#### State Management Functions
- **update(updates)** - Updates state with multiple changes and notifies listeners of changed keys
- **getState()** - Returns copy of current state
- **get(key)** - Gets specific state value by key
- **set(key, value)** - Sets specific state value and triggers update

#### View Management Functions
- **setView(view)** - Sets current view with validation against valid views
- **getView()** - Returns current view

#### Date Management Functions
- **setCurrentDate(date)** - Sets current date by creating new Date object
- **getCurrentDate()** - Returns current date
- **setSelectedDate(date)** - Sets selected date by creating new Date object
- **getSelectedDate()** - Returns selected date

#### Navigation Functions
- **navigate(direction)** - Navigates calendar based on direction and current view (month/week/agenda), sets navigation flag with timeout

#### Event Management Functions
- **setEvents(events)** - Sets events and updates last updated timestamp
- **getEvents()** - Returns all events
- **addEvent(event)** - Adds event to events array
- **updateEvent(eventId, updates)** - Updates event by ID with new data
- **deleteEvent(eventId)** - Deletes event by ID
- **getEventsForDate(date)** - Gets events for specific date with proper date range handling for all-day vs timed events

#### Loading State Functions
- **setLoading(loading)** - Sets loading state
- **isLoading()** - Returns loading state

#### Settings Management Functions
- **updateSettings(settings)** - Updates settings by merging with existing settings
- **getSettings()** - Returns copy of current settings

#### Touch State Functions
- **setTouchStart(x, y)** - Sets touch start coordinates
- **getTouchStart()** - Returns touch start coordinates as object
- **setLastTap(time)** - Sets last tap timestamp
- **getLastTap()** - Returns last tap timestamp

#### Animation State Functions
- **setAnimating(animating)** - Sets animation state
- **isAnimating()** - Returns animation state

#### Persistence Functions
- **saveToStorage()** - Saves state to localStorage with error handling
- **loadFromStorage()** - Loads state from localStorage with error handling and default fallbacks
- **reset()** - Resets state to default values

### calendar-events.js Functions

#### Constructor and Initialization Functions
- **constructor(state)** - Initializes CalendarEvents with state reference and API timeout

#### Event Loading Functions
- **loadEvents()** - Loads events from API or falls back to localStorage, loads calendar configuration first
- **fetchFromAPI()** - Fetches events from API with timeout and abort controller, handles different response structures
- **parseEvents(data)** - Parses events from API response with comprehensive field mapping and recurrence handling
- **parseDate(dateString)** - Parses date string to Date object handling different formats (date-only, datetime, ISO)

#### Event Processing Functions
- **getCalendarColor(source)** - Gets calendar color using calendar configuration service
- **categorizeEvent(event)** - Categorizes event based on title and description using keyword matching
- **createSampleEvents()** - Creates sample events for demonstration with various categories and times

#### Storage Functions
- **saveToStorage(events)** - Saves events to localStorage with error handling
- **loadFromStorage()** - Loads events from localStorage with date parsing and error handling

#### Event Management Functions
- **refreshEvents()** - Refreshes events from API with calendar configuration refresh
- **addEvent(eventData)** - Adds new event with generated ID and default values
- **updateEvent(eventId, updates)** - Updates existing event and saves to storage
- **deleteEvent(eventId)** - Deletes event and saves to storage
- **getEventsForDate(date)** - Gets events for specific date using state
- **getEventsForRange(startDate, endDate)** - Gets events for date range with proper date comparison

#### Event Query Functions
- **getUpcomingEvents(count)** - Gets upcoming events filtered by current time and sorted by start time
- **getTodayEvents()** - Gets events for today using getEventsForDate
- **getNextEvent()** - Gets next event using getUpcomingEvents with count 1
- **searchEvents(query)** - Searches events by title, description, and location using case-insensitive matching
- **getEventsByCategory(category)** - Gets events filtered by category
- **getEventStats()** - Gets event statistics including total count, category breakdown, upcoming and today counts

## Potential Reimplementations Identified

### Event Management Functions
- **calendar-core.js: getEventsForDate()** - Gets events for date
- **calendar-events.js: getEventsForDate()** - Gets events for date using state
- **calendar-state.js: getEventsForDate()** - Gets events for date with date range logic

**Recommendation**: Create EventQueryService utility class

### Date Management Functions
- **calendar-events.js: parseDate()** - Parses date strings
- **calendar-state.js: setCurrentDate()** - Sets current date
- **calendar-state.js: setSelectedDate()** - Sets selected date

**Recommendation**: Create DateManager utility class

### Storage Functions
- **calendar-events.js: saveToStorage()** - Saves events to storage
- **calendar-events.js: loadFromStorage()** - Loads events from storage
- **calendar-state.js: saveToStorage()** - Saves state to storage
- **calendar-state.js: loadFromStorage()** - Loads state from storage

**Recommendation**: Create StorageManager utility class

### Navigation Functions
- **calendar-core.js: navigate()** - Navigates calendar
- **calendar-core.js: switchView()** - Switches view
- **calendar-core.js: selectDate()** - Selects date
- **calendar-state.js: navigate()** - Navigates with view logic

**Recommendation**: Create NavigationService utility class

### Event Processing Functions
- **calendar-events.js: parseEvents()** - Parses API events
- **calendar-events.js: categorizeEvent()** - Categorizes events
- **calendar-events.js: getCalendarColor()** - Gets calendar color

**Recommendation**: Create EventProcessor utility class

### State Management Functions
- **calendar-state.js: subscribe()** - Subscribes to state changes
- **calendar-state.js: notify()** - Notifies listeners
- **calendar-state.js: update()** - Updates state
- **calendar-core.js: setupStateListeners()** - Sets up state listeners

**Recommendation**: Create StateManager utility class

## Functions with Similar Purposes

### Event Query Functions
- **calendar-core.js: getEventsForDate()** - Gets events for date
- **calendar-events.js: getEventsForDate()** - Gets events for date using state
- **calendar-events.js: getEventsForRange()** - Gets events for date range
- **calendar-events.js: getTodayEvents()** - Gets today's events

### Event CRUD Functions
- **calendar-core.js: addEvent()** - Adds event
- **calendar-core.js: updateEvent()** - Updates event
- **calendar-core.js: deleteEvent()** - Deletes event
- **calendar-events.js: addEvent()** - Adds event with defaults
- **calendar-events.js: updateEvent()** - Updates event and saves
- **calendar-events.js: deleteEvent()** - Deletes event and saves

### Navigation Functions
- **calendar-core.js: navigate()** - Navigates calendar
- **calendar-core.js: switchView()** - Switches view
- **calendar-core.js: selectDate()** - Selects date
- **calendar-state.js: navigate()** - Navigates with view logic

### State Management Functions
- **calendar-state.js: get()** - Gets state value
- **calendar-state.js: set()** - Sets state value
- **calendar-state.js: update()** - Updates multiple state values
- **calendar-core.js: getCurrentView()** - Gets current view
- **calendar-core.js: getCurrentDate()** - Gets current date

### Storage Functions
- **calendar-events.js: saveToStorage()** - Saves events
- **calendar-events.js: loadFromStorage()** - Loads events
- **calendar-state.js: saveToStorage()** - Saves state
- **calendar-state.js: loadFromStorage()** - Loads state

## Utility Functions to Extract

### EventQueryService Class
```javascript
class EventQueryService {
    constructor(events = []) {
        this.events = events;
    }
    
    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            const adjustedEventEnd = event.allDay ? 
                new Date(eventEnd.getTime() - 24 * 60 * 60 * 1000) : 
                eventEnd;
            
            const givenDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const eventEndDate = new Date(adjustedEventEnd.getFullYear(), adjustedEventEnd.getMonth(), adjustedEventEnd.getDate());
            
            return givenDate >= eventStartDate && givenDate <= eventEndDate;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    getEventsForRange(startDate, endDate) {
        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            return eventStart <= endDate && eventEnd >= startDate;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    getUpcomingEvents(count = 5) {
        const now = new Date();
        const upcoming = this.events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
        
        return upcoming.slice(0, count);
    }
    
    getTodayEvents() {
        const today = new Date();
        return this.getEventsForDate(today);
    }
    
    getNextEvent() {
        const upcoming = this.getUpcomingEvents(1);
        return upcoming.length > 0 ? upcoming[0] : null;
    }
    
    searchEvents(query) {
        const searchTerm = query.toLowerCase();
        return this.events.filter(event => {
            return event.title.toLowerCase().includes(searchTerm) ||
                   event.description.toLowerCase().includes(searchTerm) ||
                   event.location.toLowerCase().includes(searchTerm);
        });
    }
    
    getEventsByCategory(category) {
        return this.events.filter(event => event.category === category);
    }
    
    getEventStats() {
        const stats = {
            total: this.events.length,
            byCategory: {},
            upcoming: this.getUpcomingEvents().length,
            today: this.getTodayEvents().length
        };
        
        this.events.forEach(event => {
            stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
        });
        
        return stats;
    }
}
```

### DateManager Class
```javascript
class DateManager {
    static parseDate(dateString) {
        if (!dateString) {
            return new Date();
        }

        if (dateString instanceof Date) {
            return dateString;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        if (dateString.includes('T')) {
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString);
                return new Date();
            }
            
            return date;
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn('Could not parse date string:', dateString);
            return new Date();
        }
        
        return date;
    }
    
    static createDate(year, month, day, hour = 0, minute = 0, second = 0) {
        return new Date(year, month - 1, day, hour, minute, second, 0);
    }
    
    static isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    static isToday(date) {
        return this.isSameDay(date, new Date());
    }
    
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    static addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
}
```

### StorageManager Class
```javascript
class StorageManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }
    
    async save(data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(this.storageKey, serializedData);
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', error);
            return false;
        }
    }
    
    async load(defaultValue = null) {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
            return defaultValue;
        } catch (error) {
            console.error('Failed to load from storage:', error);
            return defaultValue;
        }
    }
    
    async remove() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to remove from storage:', error);
            return false;
        }
    }
    
    async clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    async exists() {
        return localStorage.getItem(this.storageKey) !== null;
    }
}
```

### NavigationService Class
```javascript
class NavigationService {
    constructor(state) {
        this.state = state;
    }
    
    navigate(direction) {
        if (this.state.get('isNavigating')) return;
        
        this.state.set('isNavigating', true);
        
        let newDate = new Date(this.state.getCurrentDate());
        
        switch (direction) {
            case 'prev':
                if (this.state.getView() === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                } else if (this.state.getView() === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                } else {
                    newDate.setDate(newDate.getDate() - 1);
                }
                break;
                
            case 'next':
                if (this.state.getView() === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else if (this.state.getView() === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                } else {
                    newDate.setDate(newDate.getDate() + 1);
                }
                break;
                
            case 'today':
                newDate = new Date();
                this.state.setSelectedDate(new Date());
                break;
        }
        
        this.state.setCurrentDate(newDate);
        
        setTimeout(() => {
            this.state.set('isNavigating', false);
        }, 100);
    }
    
    switchView(view) {
        this.state.setView(view);
    }
    
    selectDate(date) {
        this.state.setSelectedDate(date);
        
        if (this.state.getView() === 'month') {
            this.state.setView('agenda');
        }
    }
    
    goToToday() {
        this.navigate('today');
    }
}
```

### EventProcessor Class
```javascript
class EventProcessor {
    constructor() {
        this.categories = {
            work: ['work', 'meeting', 'office', 'team'],
            family: ['family', 'kids', 'child', 'home'],
            health: ['health', 'doctor', 'appointment', 'medical'],
            social: ['party', 'social', 'dinner', 'celebration'],
            personal: ['personal', 'private', 'me time']
        };
    }
    
    parseEvents(data) {
        if (!data || !Array.isArray(data)) {
            return [];
        }
        
        return data.map(event => {
            const startDate = DateManager.parseDate(event.start);
            const endDate = DateManager.parseDate(event.end);
            
            const isAllDay = event.allDay || 
                           (typeof event.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.start)) ||
                           (startDate.getHours() === 0 && startDate.getMinutes() === 0 && 
                            endDate.getHours() === 0 && endDate.getMinutes() === 0);
            
            let recurrenceArray = [];
            if (Array.isArray(event.recurrence)) {
                recurrenceArray = event.recurrence;
            } else if (typeof event.recurrence === 'string' && event.recurrence.trim().length > 0) {
                const rule = event.recurrence.trim();
                recurrenceArray = [rule.startsWith('RRULE:') ? rule : `RRULE:${rule}`];
            }

            return {
                id: event.id || event.uid || `event-${Date.now()}-${Math.random()}`,
                title: event.title || event.summary || 'Untitled Event',
                start: startDate,
                end: endDate,
                location: event.location || '',
                description: event.description || '',
                category: this.categorizeEvent(event),
                allDay: isAllDay,
                calendarSource: event.source || event.calendarName || 'Default Calendar',
                color: event.calendarColor,
                icon: event.icon,
                recurrence: recurrenceArray,
                recurringEventId: event.recurringEventId || null
            };
        });
    }
    
    categorizeEvent(event) {
        const title = (event.title || event.summary || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const text = `${title} ${description}`;
        
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'other';
    }
    
    createEvent(eventData) {
        return {
            id: `event-${Date.now()}-${Math.random()}`,
            title: eventData.title || 'Untitled Event',
            start: new Date(eventData.start),
            end: new Date(eventData.end),
            location: eventData.location || '',
            description: eventData.description || '',
            category: eventData.category || 'other',
            allDay: eventData.allDay || false,
            color: eventData.color,
            icon: eventData.icon
        };
    }
}
```

### StateManager Class
```javascript
class StateManager {
    constructor(initialState = {}) {
        this.state = { ...initialState };
        this.listeners = new Map();
        this.nextListenerId = 1;
    }
    
    subscribe(callback) {
        const id = this.nextListenerId++;
        this.listeners.set(id, callback);
        return id;
    }
    
    unsubscribe(id) {
        this.listeners.delete(id);
    }
    
    notify(key, value) {
        this.listeners.forEach(callback => {
            try {
                callback(key, value, this.state);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }
    
    update(updates) {
        const changedKeys = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            if (this.state[key] !== value) {
                this.state[key] = value;
                changedKeys.push(key);
            }
        });
        
        changedKeys.forEach(key => {
            this.notify(key, this.state[key]);
        });
    }
    
    getState() {
        return { ...this.state };
    }
    
    get(key) {
        return this.state[key];
    }
    
    set(key, value) {
        this.update({ [key]: value });
    }
    
    reset() {
        this.state = {};
        this.notify('reset', null);
    }
}
```

This documentation helps identify opportunities for code consolidation and prevents duplicate implementations across the calendar core system. The modular approach enables better testing, performance optimization, and maintenance of core functionality.
