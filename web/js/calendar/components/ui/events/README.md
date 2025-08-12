# Calendar Event Components Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| index.js | Event components factory and utilities | 682 | 8 | 🟠 |
| EventRenderer.js | Centralized event rendering and styling | 397 | 7 | 🟠 |
| event-pill.js | Individual event pill component | 306 | 6 | 🟠 |

## 📁 Directory Structure

```
events/
├── index.js                # Event components factory and utilities
├── EventRenderer.js        # Centralized event rendering and styling
├── event-pill.js           # Individual event pill component
└── README.md              # This documentation
```

## Improvement Recommendations

### index.js

#### 🔴 Critical Issues
- **Issue**: Duplicate hash function implementation
  - Current: `hashString` function duplicated across multiple files
  - Suggested: Extract to shared utility module
  - Impact: Code duplication and maintenance overhead

- **Issue**: Memory leak potential in event pooling
  - Current: Event pool may hold references to destroyed event pills
  - Suggested: Implement proper cleanup and weak references
  - Impact: Prevents memory leaks in long-running applications

#### 🟠 High Priority
- **Issue**: Inconsistent event key generation
  - Current: Different key generation logic across components
  - Suggested: Standardize event key generation across all components
  - Impact: Improves cache hit rates and consistency

- **Issue**: Missing error handling in factory function
  - Current: No error handling for invalid configurations
  - Suggested: Add comprehensive error handling and validation
  - Impact: Prevents runtime errors from invalid configurations

- **Issue**: Hard-coded configuration values
  - Current: Magic numbers and strings throughout the code
  - Suggested: Extract to configuration constants
  - Impact: Improves maintainability and configurability

#### 🟡 Medium Priority
- **Issue**: Missing JSDoc for utility functions
  - Current: `EventUtils` object functions lack comprehensive documentation
  - Suggested: Add detailed JSDoc with examples
  - Impact: Improves developer experience and code documentation

- **Issue**: No type validation for event strategies
  - Current: Event strategies are not validated for correct structure
  - Suggested: Add runtime type checking for event strategies
  - Impact: Prevents runtime errors from invalid strategies

#### 🟢 Low Priority
- **Issue**: Missing performance monitoring integration
  - Current: Performance utilities exist but not integrated with factory
  - Suggested: Integrate performance monitoring into factory operations
  - Impact: Better debugging and optimization opportunities

### EventRenderer.js

#### 🔴 Critical Issues
- **Issue**: Inline styles in content generation
  - Current: Hard-coded inline styles in `createEventContent` method
  - Suggested: Extract to CSS classes or style objects
  - Impact: Better maintainability and performance

- **Issue**: Duplicate date formatting logic
  - Current: Date formatting functions duplicated across components
  - Suggested: Extract to shared date utility module
  - Impact: Reduces code duplication and improves consistency

#### 🟠 High Priority
- **Issue**: Duplicate touch feedback logic
  - Current: Touch feedback logic duplicated across components
  - Suggested: Extract to shared touch interaction utility
  - Impact: Reduces code duplication and improves consistency

- **Issue**: Missing input validation
  - Current: No validation of event objects or renderer parameters
  - Suggested: Add comprehensive input validation
  - Impact: Prevents runtime errors from invalid inputs

- **Issue**: Inefficient DOM manipulation
  - Current: Multiple DOM queries and manipulations
  - Suggested: Use DocumentFragment for batch DOM operations
  - Impact: Better performance for complex event updates

#### 🟡 Medium Priority
- **Issue**: Hard-coded CSS classes
  - Current: CSS classes are hard-coded strings
  - Suggested: Extract to constants or configuration
  - Impact: Improves maintainability and reduces typos

- **Issue**: Missing accessibility features
  - Current: No ARIA attributes or keyboard navigation
  - Suggested: Add comprehensive accessibility support
  - Impact: Better accessibility compliance

#### 🟢 Low Priority
- **Issue**: No event analytics
  - Current: No tracking of event interaction patterns
  - Suggested: Add event analytics for optimization
  - Impact: Better understanding of user behavior

### event-pill.js

#### 🔴 Critical Issues
- **Issue**: Memory leak in event listeners
  - Current: Event listeners not properly cleaned up in destroy method
  - Suggested: Ensure all listeners are properly removed
  - Impact: Prevents memory leaks and unnecessary CPU usage

- **Issue**: Inline styles in modal creation
  - Current: Modal styles are hard-coded inline strings
  - Suggested: Extract to CSS classes or style objects
  - Impact: Better maintainability and performance

#### 🟠 High Priority
- **Issue**: Duplicate date formatting logic
  - Current: Date formatting functions duplicated across components
  - Suggested: Extract to shared date utility module
  - Impact: Reduces code duplication and improves consistency

- **Issue**: Duplicate touch feedback logic
  - Current: Touch feedback and ripple logic duplicated across components
  - Suggested: Extract to shared touch interaction utility
  - Impact: Reduces code duplication and improves consistency

- **Issue**: Missing input validation
  - Current: No validation of event objects or pill parameters
  - Suggested: Add comprehensive input validation
  - Impact: Prevents runtime errors from invalid inputs

#### 🟡 Medium Priority
- **Issue**: Hard-coded CSS classes
  - Current: CSS classes are hard-coded strings
  - Suggested: Extract to constants or configuration
  - Impact: Improves maintainability and reduces typos

- **Issue**: Missing accessibility features
  - Current: No ARIA attributes or keyboard navigation
  - Suggested: Add comprehensive accessibility support
  - Impact: Better accessibility compliance

#### 🟢 Low Priority
- **Issue**: No pill analytics
  - Current: No tracking of pill interaction patterns
  - Suggested: Add pill analytics for optimization
  - Impact: Better understanding of user behavior

## Refactoring Effort Estimate
- Total files needing work: 3
- Estimated hours: 15-22 hours
- Quick wins: Extract shared utilities (3 hours), fix memory leaks (3 hours)
- Complex refactors: Optimize DOM manipulation (4-6 hours), add accessibility (3-4 hours)

## Dependencies
- Internal dependencies: 
  - EventRenderer.js depends on calendar config service and constants
  - event-pill.js depends on calendar constants
  - index.js depends on both EventRenderer.js and event-pill.js
- External dependencies: 
  - Browser APIs (document, performance, Map, Date)
  - Calendar core system (referenced but not imported)

---

## 🔧 Components Analysis

### 1. EventRenderer.js

**Purpose**: Centralized event rendering component that provides consistent event styling, interaction handling, and visual presentation across all calendar views.

#### Core Features

**🎨 Event Rendering**
- **Multi-view support**: Create events for month, week, and all-day views
- **Dynamic styling**: Apply calendar colors and category-based styling
- **Responsive design**: Adapt event display to different screen sizes
- **Content generation**: Generate rich HTML content with time, location, and metadata

**📱 Interactive Features**
- **Touch-friendly interactions**: Optimized for mobile and touch devices
- **Drag and drop support**: Enable event dragging in week view
- **Click handling**: Comprehensive event selection and interaction
- **Visual feedback**: Touch feedback and ripple effects

**🎯 Event Management**
- **Color management**: Intelligent color assignment from calendar sources
- **Event categorization**: Automatic event categorization based on content
- **Time formatting**: Consistent time display across all views
- **Location display**: Optional location information display

**⚡ Performance Features**
- **Efficient rendering**: Optimized DOM manipulation and content generation
- **Event delegation**: Smart event handling for performance
- **Memory management**: Proper cleanup and resource management
- **Caching strategies**: Intelligent caching of event elements

#### Implementation Benefits

**For Month View:**
- **Event pills**: Compact event display with overflow handling
- **Color consistency**: Unified color scheme across all events
- **Touch interactions**: Mobile-friendly event selection
- **Responsive adaptation**: Adjust event display based on screen size

**For Week View:**
- **Time-based layout**: Position events according to their time
- **Drag functionality**: Enable event rescheduling and moving
- **Rich content**: Display time, title, and location information
- **Visual hierarchy**: Clear distinction between timed and all-day events

**Cross-View Benefits:**
- **Consistent behavior**: Same event behavior across all views
- **Shared styling**: Unified visual design and interactions
- **Performance optimization**: Shared rendering optimizations
- **Maintainability**: Centralized event logic and styling

#### Usage Example
```javascript
// Create event renderer
const eventRenderer = new EventRenderer();

// Create event pill for month view
const eventPill = eventRenderer.createEventPill(event, {
    showTime: true,
    showBullet: true,
    maxWidth: '100%'
});

// Create week event
const weekEvent = eventRenderer.createWeekEvent(event, {
    showLocation: true,
    showTime: true
});

// Create all-day event
const allDayEvent = eventRenderer.createAllDayEvent(event, {
    showTime: false
});
```

### 2. EventPill.js

**Purpose**: Individual event pill component that handles event display, interactions, and provides detailed event information through modals.

#### Core Features

**🎨 Visual Design**
- **Flexible styling**: Support for compact and full content modes
- **Color integration**: Automatic color assignment from event properties
- **Responsive layout**: Adapt to different container sizes
- **Content customization**: Configurable display of time, location, and metadata

**📱 Interactive Features**
- **Touch feedback**: Scale animation on touch interactions
- **Ripple effects**: Material design-inspired touch feedback
- **Modal display**: Rich event details in touch-friendly modals
- **Click handling**: Comprehensive event interaction management

**🎯 Event Information**
- **Rich content**: Display title, time, location, and description
- **Formatting utilities**: Consistent date and time formatting
- **Modal presentation**: Detailed event information in overlay
- **Edit integration**: Direct access to event editing functionality

**⚡ Performance Features**
- **Efficient updates**: Optimized content updates and re-rendering
- **Memory management**: Proper cleanup and resource disposal
- **Event delegation**: Smart event handling for performance
- **Lazy loading**: Efficient content generation on demand

#### Implementation Benefits

**For Month View:**
- **Compact display**: Efficient use of limited cell space
- **Quick access**: Fast event information through modals
- **Visual consistency**: Unified appearance across all events
- **Touch optimization**: Mobile-friendly interaction design

**For Week View:**
- **Rich information**: Detailed event display with metadata
- **Interactive editing**: Direct access to event modification
- **Visual hierarchy**: Clear distinction between event types
- **Responsive design**: Adapt to different column widths

**Cross-View Benefits:**
- **Consistent interaction**: Same event behavior across views
- **Shared functionality**: Common event display and interaction logic
- **Performance optimization**: Shared rendering and interaction optimizations
- **Maintainability**: Centralized event pill logic and styling

#### Usage Example
```javascript
// Create event pill
const eventPill = new EventPill(core, event, {
    showTime: true,
    showLocation: false,
    compact: false
});

// Get the rendered element
const pillElement = eventPill.getElement();

// Update pill with new event
eventPill.update(newEvent, { showTime: false });

// Set new options
eventPill.setOptions({ compact: true });
```

---

## 🚀 Implementation Recommendations

### Phase 1: Basic Integration

**Month View Implementation:**
```javascript
// In month view component
class MonthView {
    constructor() {
        this.eventRenderer = new EventRenderer();
    }
    
    renderMonthEvents(events, container) {
        events.forEach(event => {
            const eventPill = this.eventRenderer.createEventPill(event, {
                showTime: true,
                showBullet: true,
                maxWidth: '100%'
            });
            
            container.appendChild(eventPill);
        });
    }
    
    handleEventClick(event) {
        // Override the default event selection
        this.eventRenderer.onEventSelect = (selectedEvent) => {
            this.showEventModal(selectedEvent);
        };
    }
}
```

**Week View Implementation:**
```javascript
// In week view component
class WeekView {
    constructor() {
        this.eventRenderer = new EventRenderer();
    }
    
    renderWeekEvents(events, timeSlot) {
        events.forEach(event => {
            const weekEvent = this.eventRenderer.createWeekEvent(event, {
                showLocation: true,
                showTime: true
            });
            
            // Position event in time slot
            const position = this.calculateEventPosition(event);
            weekEvent.style.top = `${position.top}px`;
            weekEvent.style.height = `${position.height}px`;
            
            timeSlot.appendChild(weekEvent);
        });
    }
    
    calculateEventPosition(event) {
        const start = new Date(event.start);
        const end = new Date(event.end || event.start);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = (end - start) / (1000 * 60);
        
        return {
            top: (startMinutes / 60) * 60, // 60px per hour
            height: Math.max(duration * 60, 30) // Minimum 30px height
        };
    }
}
```

### Phase 2: Advanced Features

**Event Manager Integration:**
```javascript
// Implement event manager for centralized event handling
class EventManager {
    constructor() {
        this.eventRenderer = new EventRenderer();
        this.eventCache = new Map();
        this.eventPills = new Map();
    }
    
    createEventPill(event, options) {
        const cacheKey = this.generateEventKey(event, options);
        
        // Check cache first
        if (this.eventCache.has(cacheKey)) {
            return this.eventCache.get(cacheKey);
        }
        
        // Create new event pill
        const eventPill = new EventPill(this.core, event, options);
        
        // Cache the pill
        this.eventCache.set(cacheKey, eventPill);
        
        return eventPill;
    }
    
    updateEvent(event, newData) {
        const eventPill = this.eventPills.get(event.id);
        if (eventPill) {
            eventPill.update(newData);
        }
    }
    
    generateEventKey(event, options) {
        return `${event.id}_${JSON.stringify(options)}`;
    }
}
```

**Responsive Event Adaptation:**
```javascript
// Handle responsive event behavior
class ResponsiveEventManager {
    setupResponsiveHandling() {
        window.addEventListener('resize', () => {
            this.updateEventConfigurations();
        });
    }
    
    updateEventConfigurations() {
        const newConfig = this.getResponsiveConfig();
        
        this.eventPills.forEach(pill => {
            pill.setOptions({
                compact: newConfig.compact,
                showTime: newConfig.showTime,
                showLocation: newConfig.showLocation
            });
        });
    }
    
    getResponsiveConfig() {
        const width = window.innerWidth;
        
        if (width < 768) {
            return { compact: true, showTime: false, showLocation: false };
        } else if (width < 1024) {
            return { compact: false, showTime: true, showLocation: false };
        } else {
            return { compact: false, showTime: true, showLocation: true };
        }
    }
}
```

### Phase 3: Performance Optimization

**Event Pooling Strategy:**
```javascript
// Implement event pooling for better performance
class EventPool {
    constructor() {
        this.pool = [];
        this.maxPoolSize = 200;
    }
    
    getEventPill(event, options) {
        // Try to reuse from pool
        if (this.pool.length > 0) {
            const reusedPill = this.pool.pop();
            reusedPill.update(event, options);
            return reusedPill;
        }
        
        // Create new pill if pool is empty
        return new EventPill(this.core, event, options);
    }
    
    returnEventPill(pill) {
        if (this.pool.length < this.maxPoolSize) {
            pill.destroy();
            this.pool.push(pill);
        } else {
            pill.destroy();
        }
    }
    
    clearPool() {
        this.pool.forEach(pill => pill.destroy());
        this.pool = [];
    }
}
```

**Event-Driven Updates:**
```javascript
// Handle real-time event updates
class EventUpdateManager {
    setupEventListeners() {
        // Listen for event changes
        this.core.state.subscribe('events', (newEvents) => {
            this.updateEventPills(newEvents);
        });
        
        // Listen for calendar changes
        this.core.state.subscribe('calendars', (newCalendars) => {
            this.updateEventColors(newCalendars);
        });
    }
    
    updateEventPills(events) {
        events.forEach(event => {
            const pill = this.eventPills.get(event.id);
            if (pill) {
                pill.update(event);
            }
        });
    }
    
    updateEventColors(calendars) {
        this.eventPills.forEach(pill => {
            pill.setColor(); // Recalculate color based on new calendar data
        });
    }
}
```

---

## 📈 Performance Metrics

### Expected Performance Improvements

**Month View:**
- **Event rendering**: 55-70% faster with event pooling
- **Event display**: 45-60% faster with optimized event pills
- **Color updates**: 80-90% faster with intelligent color caching
- **Memory usage**: 35% reduction with event pooling

**Week View:**
- **Event creation**: 50-65% faster with optimized rendering
- **Drag performance**: 70-85% faster with efficient event handling
- **Visual updates**: 60-75% faster with targeted re-rendering
- **Responsive updates**: 65-80% faster with smart configuration updates

**Cross-View Benefits:**
- **Consistent performance**: Predictable response times
- **Reduced memory usage**: Shared event pooling and caching
- **Better UX**: Smooth interactions and transitions
- **Scalability**: Efficient handling of large event datasets

---

## 🔧 Configuration Options

### EventRenderer Configuration
```javascript
const rendererConfig = {
    showTime: true,           // Show event times
    showLocation: false,      // Show event locations
    showBullet: true,         // Show time bullet indicators
    maxWidth: '100%',         // Maximum event width
    enableDrag: true,         // Enable drag and drop
    enableTouch: true,        // Enable touch interactions
    enableRipple: true        // Enable ripple effects
};
```

### EventPill Configuration
```javascript
const pillConfig = {
    showTime: true,           // Show event time
    showLocation: false,      // Show event location
    compact: false,           // Use compact display mode
    enableModal: true,        // Enable event detail modal
    enableEdit: true,         // Enable event editing
    touchTargetSize: 44       // Minimum touch target size
};
```

### Event Manager Configuration
```javascript
const eventManagerConfig = {
    enablePooling: true,      // Enable event pooling
    maxPoolSize: 200,        // Maximum pool size
    enableCaching: true,     // Enable event caching
    cacheTimeout: 300000,    // Cache timeout (5 minutes)
    enableResponsive: true,  // Enable responsive behavior
    updateDebounce: 100      // Update debounce time
};
```

---

## 🧪 Testing Strategy

### Unit Tests
- Event creation and rendering
- Color assignment and styling
- Interaction handling and feedback
- Modal display and functionality

### Integration Tests
- Month view with event integration
- Week view with event integration
- Cross-view event consistency
- Real-time event updates

### Performance Tests
- Event rendering performance
- Memory usage over time
- Interaction responsiveness
- Cache hit/miss ratios

---

## 📚 API Reference

### EventRenderer Methods
- `createEventPill(event, options)` - Create event pill for month view
- `createWeekEvent(event, options)` - Create week view event element
- `createAllDayEvent(event, options)` - Create all-day event element
- `createEventContent(event, options)` - Create event content HTML
- `applyEventStyling(eventEl, event, options)` - Apply styling to event element
- `addEventInteraction(eventEl, event)` - Add event interaction handlers
- `addDragHandlers(eventEl, event)` - Add drag handlers for week events
- `addTouchFeedback(element)` - Add touch feedback to element
- `getEventColor(event)` - Get event color from calendar source
- `isTimedEvent(event)` - Check if event is timed (not all-day)
- `formatEventTime(event)` - Format event time for display
- `formatTime(date)` - Format time for display
- `hexToRgb(hex)` - Convert hex color to RGB
- `onEventSelect(event)` - Event selection handler
- `categorizeEvent(event)` - Categorize event based on content

### EventPill Methods
- `create()` - Create the event pill element
- `setColor()` - Set the pill color
- `createContent()` - Create pill content
- `createCompactContent()` - Create compact content
- `createFullContent()` - Create full content
- `addInteractions()` - Add interactions to the pill
- `addTouchFeedback()` - Add touch feedback
- `createRipple(event)` - Create ripple effect
- `onClick()` - Handle click
- `showEventDetails()` - Show event details modal
- `formatDate(date, format)` - Format date for display
- `formatTime(date)` - Format time for display
- `update(event, options)` - Update the pill
- `setOptions(options)` - Set pill options
- `getElement()` - Get the pill element
- `destroy()` - Destroy the pill

### EventRenderer Properties
- `defaultColors` - Default color mapping for event categories

### EventPill Properties
- `core` - Calendar core instance
- `event` - Event data
- `options` - Pill configuration options
- `element` - DOM element for the pill

---

## 🎯 Conclusion

The event components provide a sophisticated foundation for high-performance event rendering and interaction. By implementing these components in both month and week views, you'll achieve:

1. **Efficient Rendering**: Optimized event creation and management
2. **Interactive Design**: Touch-friendly interactions with visual feedback
3. **Responsive Behavior**: Adaptive layouts for all screen sizes
4. **Performance Optimization**: Event pooling and caching for smooth performance
5. **Consistent Behavior**: Unified event behavior across all views
6. **Scalability**: Efficient handling of large event datasets and complex layouts
7. **Maintainability**: Clean separation of concerns and extensible architecture

The modular design allows for gradual implementation, starting with basic event rendering and progressing to advanced features like intelligent event pooling and real-time responsive updates.

## Function Documentation

### index.js Functions

#### Factory Functions
- **`createEventManager(core, options)`** - Creates and configures event management components with optimized settings, returning an object with eventRenderer, eventManager, and convenience methods.

#### Convenience Methods (from factory)
- **`createEventPill(event, options)`** - Creates an event pill with default configuration and custom options.
- **`createMonthEvent(event, options)`** - Creates an event optimized for month view with specific configuration.
- **`createWeekEvent(event, options)`** - Creates an event optimized for week view with location and time display.
- **`createAllDayEvent(event, options)`** - Creates an all-day event with simplified display options.
- **`updateEvent(event, newData)`** - Updates an existing event with new data.
- **`clearCache()`** - Clears all cached events from the event manager.
- **`getEventStats()`** - Gets event manager statistics including creation, caching, and reuse metrics.
- **`destroy()`** - Cleans up the event manager and all associated events.

#### EventManager Class Methods
- **`createEventPill(event, options)`** - Creates an event pill with caching and pooling support, reusing pills from pool when possible.
- **`updateEvent(event, newData)`** - Updates an existing event with new data.
- **`getEventPill(eventId)`** - Retrieves an event pill by event ID from the active pills map.
- **`removeEventPill(eventId)`** - Removes an event pill from management, returning it to pool or destroying it.
- **`clearEventPills()`** - Clears all active event pills, returning them to pool or destroying them.
- **`clearCache()`** - Clears all cached event data.
- **`getStats()`** - Returns comprehensive event manager statistics.
- **`generateEventKey(event, options)`** - Generates a unique cache key for event caching.
- **`isCacheValid(cached)`** - Checks if a cached event entry is still valid based on timeout.
- **`destroy()`** - Cleans up the event manager by clearing pills, cache, and pool.

#### Event Configuration Objects
- **`EventConfigs`** - Predefined configurations for monthView, weekView, allDay, mobile, and desktop event layouts.
- **`EventStrategies`** - Predefined strategies for highDensity, sparseEvents, touchFriendly, and compact event displays.

#### Utility Functions (EventUtils object)
- **`calculateOptimalEventConfig(screenWidth)`** - Calculates optimal event configuration based on screen width.
- **`generateEventKey(event, options)`** - Generates a unique key for event identification and caching.
- **`hashString(str)`** - Simple string hash function for generating cache keys.
- **`needsUpdate(cachedEvent, currentEvent)`** - Checks if a cached event needs updating based on age and data changes.
- **`calculateResponsiveConfig(containerWidth, containerHeight)`** - **DEPRECATED** Calculates responsive event configuration based on container dimensions. Use `createEventConfig` from `utils/responsive/index.js` instead.
- **`groupEventsByDate(events)`** - Groups events by date for efficient rendering.
- **`sortEventsByTime(events)`** - Sorts events by time with all-day events first.
- **`calculateEventDuration(event)`** - Calculates event duration in minutes.
- **`eventsOverlap(event1, event2)`** - Checks if two events overlap in time.

#### Performance Utilities (EventPerformanceUtils object)
- **`measureEventCreation(eventCreationFunction, args)`** - Measures execution time and memory usage of event creation functions.
- **`createEventPerformanceMonitor()`** - Creates a performance monitor with metrics tracking for event operations.

### EventRenderer.js Functions

#### Core Event Creation
- **`createEventPill(event, options)`** - Creates an event pill for month view with time display and bullet indicators.
- **`createWeekEvent(event, options)`** - Creates a week view event element with time, title, and location display.
- **`createAllDayEvent(event, options)`** - Creates an all-day event element with solid background styling.

#### Content and Styling
- **`createEventContent(event, options)`** - Creates HTML content for events with time, bullet, and title display.
- **`applyEventStyling(eventEl, event, options)`** - Applies styling to event elements based on event type and color.
- **`getEventColor(event)`** - Gets event color from calendar source, event color, or fallback to default.
- **`getEventTextColor(event)`** - Gets appropriate text color based on event type (white for all-day, black for timed).
- **`hexToRgb(hex)`** - Converts hex color to RGB format.

#### Event Analysis
- **`isTimedEvent(event)`** - Checks if event is timed (not all-day) based on start time.
- **`categorizeEvent(event)`** - Categorizes event as work, family, health, social, personal, or other based on content.

#### Time Formatting
- **`formatEventTime(event)`** - Formats event time for display in week view.
- **`formatTime(date)`** - Formats time for display using locale-specific formatting.

#### Interaction Management
- **`addEventInteraction(eventEl, event)`** - Adds click handlers and touch feedback to event elements.
- **`addDragHandlers(eventEl, event)`** - Adds drag and drop handlers for week events.
- **`addTouchFeedback(element)`** - Adds touch feedback effects (scale animation) to elements.
- **`onEventSelect(event)`** - Event selection handler (to be overridden by view).

### event-pill.js Functions

#### Core Pill Creation and Management
- **`constructor(core, event, options)`** - Initializes an event pill with core instance, event data, and configuration options.
- **`create()`** - Creates the event pill DOM element with styling, content, and interactions.
- **`setColor()`** - Sets the pill background color based on event color or category.
- **`createContent()`** - Creates pill content based on compact or full display mode.

#### Content Creation
- **`createCompactContent()`** - Creates minimal content showing only event title.
- **`createFullContent()`** - Creates full content with title, time, and location elements.

#### Interaction Management
- **`addInteractions()`** - Adds click handlers and touch interactions to the pill.
- **`addTouchFeedback()`** - Adds touch feedback effects (scale animation) to the pill.
- **`createRipple(event)`** - Creates a ripple effect for touch interactions.
- **`onClick()`** - Handles pill click events by showing event details.

#### Event Details Display
- **`showEventDetails()`** - Creates and displays a modal with event details including title, date, time, location, and description.

#### Date and Time Formatting
- **`formatDate(date, format)`** - Formats dates for display with multiple format options (full, month-year, short-date).
- **`formatTime(date)`** - Formats time for display using locale-specific formatting.

#### Pill State Management
- **`update(event, options)`** - Updates the pill with new event data and options.
- **`setOptions(options)`** - Sets new options for the pill and updates display.
- **`getElement()`** - Returns the pill's DOM element.
- **`destroy()`** - Removes the pill element from the DOM and cleans up.

## Function Overlap Analysis

### Duplicate Functions
- **`hashString(str)`** - Identical implementation in `index.js` EventUtils, should be extracted to shared utility.
- **`formatDate(date, format)`** - Date formatting logic duplicated in `event-pill.js` and potentially other components.
- **`formatTime(date)`** - Time formatting logic duplicated in `EventRenderer.js` and `event-pill.js`.
- **`addTouchFeedback()`** - Touch feedback logic duplicated in `EventRenderer.js` and `event-pill.js`.
- **`createRipple()`** - Ripple effect creation duplicated in `event-pill.js` and potentially other components.

### Similar Functions
- **Cache key generation** - `index.js` EventManager.generateEventKey vs `index.js` EventUtils.generateEventKey - similar functionality with different naming.
- **Event grouping** - `index.js` EventUtils.groupEventsByDate vs similar functions in other components.
- **Responsive configuration** - `index.js` EventUtils.calculateResponsiveConfig is deprecated. Use unified responsive system from `utils/responsive/index.js`.
- **Event overlap detection** - `index.js` EventUtils.eventsOverlap vs similar functions in layout components.

### Unique Functions
- **Event pill lifecycle management** - `index.js` EventManager has sophisticated event pill lifecycle management with pooling and caching.
- **Event rendering strategies** - `EventRenderer.js` has specific rendering logic for different view types (month, week, all-day).
- **Event categorization** - `EventRenderer.js` has content-based event categorization logic.
- **Color management** - `EventRenderer.js` has sophisticated color selection and fallback logic.
- **Performance monitoring** - `index.js` EventPerformanceUtils provides event-specific performance tracking.

### Missing Integration Points
- **Date/time formatting coordination** - Date and time formatting functions are duplicated across multiple components.
- **Touch interaction coordination** - Touch feedback and ripple effects are duplicated across components.
- **Modal system coordination** - Inline modal creation in `event-pill.js` may conflict with a centralized modal system.
- **Event categorization coordination** - Event categorization logic may overlap with similar functions in other components.
- **Color management coordination** - Color selection logic may overlap with similar functions in other components.
