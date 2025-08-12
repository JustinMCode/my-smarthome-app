/**
 * Calendar Constants
 * Core application constants and configuration values
 * 
 * This module provides centralized access to all application constants,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarConstants
 */

/**
 * View type constants
 * @readonly
 * @enum {string}
 */
export const VIEWS = {
    /** Month view */
    MONTH: 'month',
    /** Week view */
    WEEK: 'week',
    /** Agenda view */
    AGENDA: 'agenda'
};

/**
 * Event category constants
 * @readonly
 * @enum {string}
 */
export const EVENT_CATEGORIES = {
    /** Work-related events */
    WORK: 'work',
    /** Family events */
    FAMILY: 'family',
    /** Health-related events */
    HEALTH: 'health',
    /** Social events */
    SOCIAL: 'social',
    /** Personal events */
    PERSONAL: 'personal',
    /** Other events */
    OTHER: 'other'
};

/**
 * Navigation direction constants
 * @readonly
 * @enum {string}
 */
export const NAVIGATION = {
    /** Previous period */
    PREV: 'prev',
    /** Next period */
    NEXT: 'next',
    /** Go to today */
    TODAY: 'today'
};

/**
 * Touch gesture configuration
 * @readonly
 * @type {Object}
 */
export const TOUCH = {
    /** Minimum swipe distance in pixels */
    MIN_SWIPE_DISTANCE: 50,
    /** Maximum swipe time in milliseconds */
    MAX_SWIPE_TIME: 300,
    /** Double tap time in milliseconds */
    DOUBLE_TAP_TIME: 300
};

/**
 * Animation duration constants
 * @readonly
 * @type {Object}
 */
export const ANIMATIONS = {
    /** Fast animation duration in milliseconds */
    FAST: 150,
    /** Normal animation duration in milliseconds */
    NORMAL: 300,
    /** Slow animation duration in milliseconds */
    SLOW: 500
};

/**
 * Display configuration
 * @readonly
 * @type {Object}
 */
export const DISPLAY = {
    /** Maximum events to show per day */
    MAX_EVENTS_PER_DAY: 3,
    /** Maximum events to show for today */
    MAX_EVENTS_TODAY: 2,
    /** Full weekday names */
    WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    /** Short weekday names */
    WEEKDAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

/**
 * API configuration
 * @readonly
 * @type {Object}
 */
export const API = {
    /** Events API endpoint */
    EVENTS: '/api/calendar/events',
    /** Request timeout in milliseconds */
    TIMEOUT: 5000
};

/**
 * Storage key constants
 * @readonly
 * @type {Object}
 */
export const STORAGE = {
    /** Calendar events storage key */
    EVENTS: 'calendar_events',
    /** Calendar settings storage key */
    SETTINGS: 'calendar_settings',
    /** View state storage key */
    VIEW_STATE: 'calendar_view_state'
};

/**
 * Event category colors
 * @readonly
 * @type {Object}
 */
export const EVENT_CATEGORY_COLORS = {
    /** Work events color */
    work: '#3B82F6',
    /** Family events color */
    family: '#10B981',
    /** Health events color */
    health: '#EF4444',
    /** Social events color */
    social: '#F59E0B',
    /** Personal events color */
    personal: '#8B5CF6',
    /** Other events color */
    other: '#6B7280'
};

/**
 * Event category icons
 * @readonly
 * @type {Object}
 */
export const EVENT_CATEGORY_ICONS = {
    /** Work events icon */
    work: '💼',
    /** Family events icon */
    family: '👨‍👩‍👧‍👦',
    /** Health events icon */
    health: '🏥',
    /** Social events icon */
    social: '🎉',
    /** Personal events icon */
    personal: '🎯',
    /** Other events icon */
    other: '📅'
};

/**
 * Legacy CALENDAR_CONFIG object for backward compatibility
 * @deprecated Use individual constants instead
 * @readonly
 * @type {Object}
 */
export const CALENDAR_CONFIG = {
    VIEWS,
    EVENT_CATEGORIES,
    NAVIGATION,
    TOUCH,
    ANIMATIONS,
    DISPLAY,
    API,
    STORAGE
};

// Default export for backward compatibility
export default {
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
    CALENDAR_CONFIG
};
