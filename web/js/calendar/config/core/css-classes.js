/**
 * CSS Classes Configuration
 * Centralized CSS class definitions for the calendar system
 * 
 * This module provides centralized access to all CSS class names,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CSSClasses
 */

/**
 * View container CSS classes
 * @readonly
 * @type {Object}
 */
export const VIEW_CONTAINERS = {
    /** Month view container */
    MONTH_VIEW: 'month-view-container',
    /** Week view container */
    WEEK_VIEW: 'week-view-container',
    /** Agenda view container */
    AGENDA_VIEW: 'agenda-container'
};

/**
 * Grid element CSS classes
 * @readonly
 * @type {Object}
 */
export const GRID_ELEMENTS = {
    /** Month grid */
    MONTH_GRID: 'month-grid',
    /** Week grid */
    WEEK_GRID: 'week-grid',
    /** Agenda list */
    AGENDA_LIST: 'agenda-list'
};

/**
 * Day cell CSS classes
 * @readonly
 * @type {Object}
 */
export const DAY_CELLS = {
    /** Day cell container */
    DAY_CELL: 'day-cell',
    /** Day number */
    DAY_NUMBER: 'day-number',
    /** Day events container */
    DAY_EVENTS: 'day-events'
};

/**
 * Event element CSS classes
 * @readonly
 * @type {Object}
 */
export const EVENT_ELEMENTS = {
    /** Event pill */
    EVENT_PILL: 'event-pill',
    /** More events indicator */
    MORE_EVENTS: 'more-events'
};

/**
 * Navigation CSS classes
 * @readonly
 * @type {Object}
 */
export const NAVIGATION = {
    /** View switcher */
    VIEW_SWITCHER: 'view-switcher',
    /** Calendar header */
    CALENDAR_HEADER: 'calendar-header'
};

/**
 * State CSS classes
 * @readonly
 * @type {Object}
 */
export const STATES = {
    /** Active state */
    ACTIVE: 'active',
    /** Today state */
    TODAY: 'today',
    /** Selected state */
    SELECTED: 'selected',
    /** Other month state */
    OTHER_MONTH: 'other-month',
    /** Weekend state */
    WEEKEND: 'weekend'
};

/**
 * Legacy CSS_CLASSES object for backward compatibility
 * @deprecated Use individual class groups instead
 * @readonly
 * @type {Object}
 */
export const CSS_CLASSES = {
    // View containers
    MONTH_VIEW: VIEW_CONTAINERS.MONTH_VIEW,
    WEEK_VIEW: VIEW_CONTAINERS.WEEK_VIEW,
    AGENDA_VIEW: VIEW_CONTAINERS.AGENDA_VIEW,
    
    // Grid elements
    MONTH_GRID: GRID_ELEMENTS.MONTH_GRID,
    WEEK_GRID: GRID_ELEMENTS.WEEK_GRID,
    AGENDA_LIST: GRID_ELEMENTS.AGENDA_LIST,
    
    // Day cells
    DAY_CELL: DAY_CELLS.DAY_CELL,
    DAY_NUMBER: DAY_CELLS.DAY_NUMBER,
    DAY_EVENTS: DAY_CELLS.DAY_EVENTS,
    
    // Event elements
    EVENT_PILL: EVENT_ELEMENTS.EVENT_PILL,
    MORE_EVENTS: EVENT_ELEMENTS.MORE_EVENTS,
    
    // Navigation
    VIEW_SWITCHER: NAVIGATION.VIEW_SWITCHER,
    CALENDAR_HEADER: NAVIGATION.CALENDAR_HEADER,
    
    // States
    ACTIVE: STATES.ACTIVE,
    TODAY: STATES.TODAY,
    SELECTED: STATES.SELECTED,
    OTHER_MONTH: STATES.OTHER_MONTH,
    WEEKEND: STATES.WEEKEND
};

// Default export for backward compatibility
export default {
    VIEW_CONTAINERS,
    GRID_ELEMENTS,
    DAY_CELLS,
    EVENT_ELEMENTS,
    NAVIGATION,
    STATES,
    CSS_CLASSES
};
