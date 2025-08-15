/**
 * DOM Selectors Configuration
 * Centralized DOM selector definitions for the calendar system
 * 
 * This module provides centralized access to all DOM selectors,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module Selectors
 */

/**
 * Main container selectors
 * @readonly
 * @type {Object}
 */
export const CONTAINERS = {
    /** Main calendar container */
    CALENDAR_CONTAINER: '.calendar-container',
    /** Main content area */
    MAIN_CONTENT: '#main-content'
};

/**
 * View element selectors
 * @readonly
 * @type {Object}
 */
export const VIEW_ELEMENTS = {
    /** Month grid */
    MONTH_GRID: '#month-grid',
    /** Week grid */
    WEEK_GRID: '#week-grid'
};

/**
 * Navigation selectors
 * @readonly
 * @type {Object}
 */
export const NAVIGATION = {
    /** Previous navigation button */
    PREV_NAV: '.prev-nav, #prev-month, #prev-week',
    /** Next navigation button */
    NEXT_NAV: '.next-nav, #next-month, #next-week',
    /** Today button */
    TODAY_BTN: '.today-btn, #today-btn'
};

/**
 * View switcher selectors
 * @readonly
 * @type {Object}
 */
export const VIEW_SWITCHER = {
    /** View switcher buttons */
    VIEW_BUTTONS: '.view-switcher button, [data-calendar-view]'
};

/**
 * Header selectors
 * @readonly
 * @type {Object}
 */
export const HEADER = {
    /** Calendar title */
    CALENDAR_TITLE: '#calendar-title, .calendar-header h2'
};

/**
 * Legacy SELECTORS object for backward compatibility
 * @deprecated Use individual selector groups instead
 * @readonly
 * @type {Object}
 */
export const SELECTORS = {
    // Main containers
    CALENDAR_CONTAINER: CONTAINERS.CALENDAR_CONTAINER,
    MAIN_CONTENT: CONTAINERS.MAIN_CONTENT,
    
    // View elements
    MONTH_GRID: VIEW_ELEMENTS.MONTH_GRID,
    WEEK_GRID: VIEW_ELEMENTS.WEEK_GRID,
    
    // Navigation
    PREV_NAV: NAVIGATION.PREV_NAV,
    NEXT_NAV: NAVIGATION.NEXT_NAV,
    TODAY_BTN: NAVIGATION.TODAY_BTN,
    
    // View switcher
    VIEW_BUTTONS: VIEW_SWITCHER.VIEW_BUTTONS,
    
    // Header
    CALENDAR_TITLE: HEADER.CALENDAR_TITLE
};

// Default export for backward compatibility
export default {
    CONTAINERS,
    VIEW_ELEMENTS,
    NAVIGATION,
    VIEW_SWITCHER,
    HEADER,
    SELECTORS
};
