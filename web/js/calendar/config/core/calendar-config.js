/**
 * Calendar Configuration
 * Calendar-specific configuration and settings
 * 
 * This module provides centralized access to calendar-specific configuration,
 * including calendar definitions, color palettes, and default settings.
 * 
 * @module CalendarConfig
 */

/**
 * Default calendar configuration
 * @readonly
 * @type {Object}
 */
export const CALENDARS = {
    'calendar-0': {
        id: 'calendar-0',
        name: 'Oxford American Internship',
        color: '#3B82F6',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        description: 'Internship events and deadlines',
        enabled: true,
        visible: true,
        order: 1
    },
    'calendar-1': {
        id: 'calendar-1',
        name: 'Graduate School',
        color: '#EF4444',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        description: 'Graduate school applications and deadlines',
        enabled: true,
        visible: true,
        order: 2
    },
    'calendar-2': {
        id: 'calendar-2',
        name: 'Arkana',
        color: '#10B981',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        description: 'Arkana project events',
        enabled: true,
        visible: true,
        order: 3
    }
};

/**
 * Color palette for new calendars
 * @readonly
 * @type {Array<string>}
 */
export const COLOR_PALETTE = [
    '#667eea', // Blue
    '#f093fb', // Pink
    '#4facfe', // Cyan
    '#43e97b', // Green
    '#fa709a', // Rose
    '#ffecd2', // Orange
    '#a8edea', // Mint
    '#ff9a9e', // Coral
    '#fecfef', // Light Pink
    '#fad0c4', // Peach
    '#ffd1ff', // Lavender
    '#a1c4fd', // Light Blue
    '#d299c2', // Mauve
    '#f093fb', // Magenta
    '#4facfe', // Sky Blue
    '#43e97b', // Emerald
    '#fa709a', // Salmon
    '#ffecd2', // Cream
    '#a8edea', // Aqua
    '#ff9a9e'  // Salmon Pink
];

/**
 * Default calendar settings
 * @readonly
 * @type {Object}
 */
export const DEFAULTS = {
    /** Default calendar ID */
    defaultCalendar: 'calendar-0',
    /** Auto-discover calendars */
    autoDiscover: true,
    /** Show event counts */
    showEventCounts: true,
    /** Allow custom colors */
    allowCustomColors: true,
    /** Maximum number of calendars */
    maxCalendars: 20
};

/**
 * Calendar configuration schema
 * @readonly
 * @type {Object}
 */
export const SCHEMA = {
    /** Calendar object schema */
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
    /** Defaults object schema */
    defaults: {
        defaultCalendar: { type: 'string', required: true },
        autoDiscover: { type: 'boolean', default: true },
        showEventCounts: { type: 'boolean', default: true },
        allowCustomColors: { type: 'boolean', default: true },
        maxCalendars: { type: 'number', default: 20 }
    }
};

/**
 * Legacy CALENDAR_CONFIG object for backward compatibility
 * @deprecated Use individual configuration objects instead
 * @readonly
 * @type {Object}
 */
export const CALENDAR_CONFIG = {
    calendars: CALENDARS,
    colorPalette: COLOR_PALETTE,
    defaults: DEFAULTS
};

// Default export for backward compatibility
export default {
    CALENDARS,
    COLOR_PALETTE,
    DEFAULTS,
    SCHEMA,
    CALENDAR_CONFIG
};
