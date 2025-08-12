/**
 * Calendar Configuration System Index
 * Centralized export point for all configuration modules
 * 
 * This module provides centralized access to all configuration modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarConfig
 */

// Import all modules
import * as CoreConfig from './core/index.js';
import * as Managers from './managers/index.js';

// Core configuration modules
export * from './core/index.js';

// Configuration managers
export * from './managers/index.js';

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
} from './core/constants.js';

export { 
    VIEW_CONTAINERS,
    GRID_ELEMENTS,
    DAY_CELLS,
    EVENT_ELEMENTS,
    NAVIGATION as CSS_NAVIGATION,
    STATES,
    CSS_CLASSES
} from './core/css-classes.js';

export { 
    CONTAINERS,
    VIEW_ELEMENTS,
    NAVIGATION as SELECTOR_NAVIGATION,
    VIEW_SWITCHER,
    HEADER,
    SELECTORS
} from './core/selectors.js';

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
} from './core/templates.js';

export { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOADING_MESSAGES,
    EMPTY_MESSAGES,
    CONFIRMATION_MESSAGES,
    INFO_MESSAGES,
    WARNING_MESSAGES
} from './core/messages.js';

// Removed reference to old calendar-config.js - now using modular structure

export { 
    CalendarManager, 
    calendarManager 
} from './managers/calendar-manager.js';

// Legacy exports for backward compatibility
export { CALENDAR_CONFIG as LegacyCalendarConfig } from './core/constants.js';
export { CSS_CLASSES as LegacyCSSClasses } from './core/css-classes.js';
export { SELECTORS as LegacySelectors } from './core/selectors.js';
export { TEMPLATES as LegacyTemplates } from './core/templates.js';
export { ERROR_MESSAGES as LegacyErrorMessages } from './core/messages.js';
export { SUCCESS_MESSAGES as LegacySuccessMessages } from './core/messages.js';
export { calendarManager as LegacyCalendarManager } from './managers/calendar-manager.js';

// Default export for backward compatibility
export default {
    ...CoreConfig,
    ...Managers,
    
    // Legacy exports
    LegacyCalendarConfig: CoreConfig.CALENDAR_CONFIG,
    LegacyCSSClasses: CoreConfig.CSS_CLASSES,
    LegacySelectors: CoreConfig.SELECTORS,
    LegacyTemplates: CoreConfig.TEMPLATES,
    LegacyErrorMessages: CoreConfig.ERROR_MESSAGES,
    LegacySuccessMessages: CoreConfig.SUCCESS_MESSAGES,
    LegacyCalendarManager: Managers.calendarManager
};
