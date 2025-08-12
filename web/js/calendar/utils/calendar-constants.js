/**
 * Calendar Constants
 * Centralized constants and configuration for the calendar system
 */

export const CALENDAR_CONFIG = {
    // View types
    VIEWS: {
        MONTH: 'month',
        WEEK: 'week',
        AGENDA: 'agenda'
    },
    
    // Event categories
    EVENT_CATEGORIES: {
        WORK: 'work',
        FAMILY: 'family',
        HEALTH: 'health',
        SOCIAL: 'social',
        PERSONAL: 'personal',
        OTHER: 'other'
    },
    
    // Navigation directions
    NAVIGATION: {
        PREV: 'prev',
        NEXT: 'next',
        TODAY: 'today'
    },
    
    // Touch gesture settings
    TOUCH: {
        MIN_SWIPE_DISTANCE: 50,
        MAX_SWIPE_TIME: 300,
        DOUBLE_TAP_TIME: 300
    },
    
    // Animation durations
    ANIMATIONS: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    },
    
    // Display settings
    DISPLAY: {
        MAX_EVENTS_PER_DAY: 3,
        MAX_EVENTS_TODAY: 2,
        WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        WEEKDAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    
    // API endpoints
    API: {
        EVENTS: '/api/calendar/events',
        TIMEOUT: 5000
    },
    
    // Storage keys
    STORAGE: {
        EVENTS: 'calendar_events',
        SETTINGS: 'calendar_settings',
        VIEW_STATE: 'calendar_view_state'
    }
};

export const EVENT_CATEGORY_COLORS = {
    work: '#3B82F6',      // Blue
    family: '#10B981',    // Green
    health: '#EF4444',    // Red
    social: '#F59E0B',    // Amber
    personal: '#8B5CF6',  // Purple
    other: '#6B7280'      // Gray
};

export const EVENT_CATEGORY_ICONS = {
    work: '💼',
    family: '👨‍👩‍👧‍👦',
    health: '🏥',
    social: '🎉',
    personal: '🎯',
    other: '📅'
};

export const CSS_CLASSES = {
    // View containers
    MONTH_VIEW: 'month-view-container',
    WEEK_VIEW: 'week-view-container',
    AGENDA_VIEW: 'agenda-container',
    
    // Grid elements
    MONTH_GRID: 'month-grid',
    WEEK_GRID: 'week-grid',
    AGENDA_LIST: 'agenda-list',
    
    // Day cells
    DAY_CELL: 'day-cell',
    DAY_NUMBER: 'day-number',
    DAY_EVENTS: 'day-events',
    
    // Event elements
    EVENT_PILL: 'event-pill',
    MORE_EVENTS: 'more-events',
    
    // Navigation
    VIEW_SWITCHER: 'view-switcher',
    CALENDAR_HEADER: 'calendar-header',
    
    // States
    ACTIVE: 'active',
    TODAY: 'today',
    SELECTED: 'selected',
    OTHER_MONTH: 'other-month',
    WEEKEND: 'weekend'
};

export const SELECTORS = {
    // Main containers
    CALENDAR_CONTAINER: '.calendar-container',
    MAIN_CONTENT: '#main-content',
    
    // View elements
    MONTH_GRID: '#month-grid',
    WEEK_GRID: '#week-grid',
    AGENDA_LIST: '#agenda-list',
    
    // Navigation
    PREV_NAV: '.prev-nav, #prev-month, #prev-week',
    NEXT_NAV: '.next-nav, #next-month, #next-week',
    TODAY_BTN: '.today-btn, #today-btn',
    
    // View switcher
    VIEW_BUTTONS: '.view-switcher button, [data-calendar-view]',
    
    // Header
    CALENDAR_TITLE: '#calendar-title, .calendar-header h2'
};

export const TEMPLATES = {
    // Day cell template
    DAY_CELL: `
        <div class="day-cell">
            <div class="day-number"></div>
            <div class="day-events"></div>
        </div>
    `,
    
    // Event pill template
    EVENT_PILL: `
        <div class="event-pill">
            <span class="event-title"></span>
        </div>
    `,
    
    // Loading template
    LOADING: `
        <div class="calendar-loading">
            <div class="spinner"></div>
            <div class="loading-text">Loading events...</div>
        </div>
    `,
    
    // Empty state template
    EMPTY: `
        <div class="calendar-empty">
            <div class="empty-icon">📅</div>
            <div class="empty-title">No events</div>
            <div class="empty-text">No events scheduled for this period</div>
        </div>
    `
};

export const ERROR_MESSAGES = {
    INVALID_VIEW: 'Invalid calendar view specified',
    LOAD_FAILED: 'Failed to load calendar events',
    SAVE_FAILED: 'Failed to save calendar event',
    NETWORK_ERROR: 'Network error occurred',
    INVALID_DATE: 'Invalid date provided'
};

export const SUCCESS_MESSAGES = {
    EVENT_SAVED: 'Event saved successfully',
    EVENT_DELETED: 'Event deleted successfully',
    VIEW_CHANGED: 'View changed successfully'
};
