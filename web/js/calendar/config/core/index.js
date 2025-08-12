/**
 * Core Configuration Index
 * Centralized export point for all core configuration modules
 * 
 * This module provides centralized access to all core configuration
 * modules, ensuring consistency and maintainability across the calendar system.
 * 
 * @module CoreConfig
 */

// Core configuration modules
export * from './constants.js';
export * from './css-classes.js';
export * from './selectors.js';
export * from './templates.js';
export * from './messages.js';
// Removed reference to old calendar-config.js - now using modular structure

// Named exports for better organization
export { 
    VIEWS, 
    EVENT_CATEGORIES, 
    NAVIGATION, 
    TOUCH, 
    ANIMATIONS, 
    DISPLAY, 
    API, 
    STORAGE,
    EVENT_CATEGORY_COLORS,
    EVENT_CATEGORY_ICONS,
    CALENDAR_CONFIG as Constants
} from './constants.js';

export { 
    VIEW_CONTAINERS,
    GRID_ELEMENTS,
    DAY_CELLS,
    EVENT_ELEMENTS,
    NAVIGATION as CSS_NAVIGATION,
    STATES,
    CSS_CLASSES
} from './css-classes.js';

export { 
    CONTAINERS,
    VIEW_ELEMENTS,
    NAVIGATION as SELECTOR_NAVIGATION,
    VIEW_SWITCHER,
    HEADER,
    SELECTORS
} from './selectors.js';

export { 
    DAY_CELL,
    EVENT_PILL,
    LOADING,
    EMPTY,
    ERROR,
    NAVIGATION as TEMPLATE_NAVIGATION,
    VIEW_SWITCHER as TEMPLATE_VIEW_SWITCHER,
    CALENDAR_HEADER,
    TEMPLATES
} from './templates.js';

export { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOADING_MESSAGES,
    EMPTY_MESSAGES,
    CONFIRMATION_MESSAGES,
    INFO_MESSAGES,
    WARNING_MESSAGES
} from './messages.js';

// Removed reference to old calendar-config.js - now using modular structure

// Import all modules for default export
import * as Constants from './constants.js';
import * as CSSClasses from './css-classes.js';
import * as Selectors from './selectors.js';
import * as Templates from './templates.js';
import * as Messages from './messages.js';
// Removed reference to old calendar-config.js - now using modular structure

// Default export for backward compatibility
export default {
    ...Constants,
    ...CSSClasses,
    ...Selectors,
    ...Templates,
    ...Messages,
    // Removed CalendarConfig reference - now using modular structure
};
