/**
 * HTML Templates Configuration
 * Centralized HTML template definitions for the calendar system
 * 
 * This module provides centralized access to all HTML templates,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module Templates
 */

/**
 * Day cell template
 * @readonly
 * @type {string}
 */
export const DAY_CELL = `
    <div class="day-cell">
        <div class="day-number"></div>
        <div class="day-events"></div>
    </div>
`;

/**
 * Event pill template
 * @readonly
 * @type {string}
 */
export const EVENT_PILL = `
    <div class="event-pill">
        <span class="event-title"></span>
    </div>
`;

/**
 * Loading template
 * @readonly
 * @type {string}
 */
export const LOADING = `
    <div class="calendar-loading">
        <div class="spinner"></div>
        <div class="loading-text">Loading events...</div>
    </div>
`;

/**
 * Empty state template
 * @readonly
 * @type {string}
 */
export const EMPTY = `
    <div class="calendar-empty">
        <div class="empty-icon">📅</div>
        <div class="empty-title">No events</div>
        <div class="empty-text">No events scheduled for this period</div>
    </div>
`;

/**
 * Error state template
 * @readonly
 * @type {string}
 */
export const ERROR = `
    <div class="calendar-error">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Error</div>
        <div class="error-text">Failed to load calendar events</div>
        <button class="error-retry">Retry</button>
    </div>
`;

/**
 * Navigation template
 * @readonly
 * @type {string}
 */
export const NAVIGATION = `
    <div class="calendar-navigation">
        <button class="nav-btn prev-nav" title="Previous">
            <span class="nav-icon">←</span>
        </button>
        <button class="nav-btn today-btn" title="Go to today">
            <span class="nav-text">Today</span>
        </button>
        <button class="nav-btn next-nav" title="Next">
            <span class="nav-icon">→</span>
        </button>
    </div>
`;

/**
 * View switcher template
 * @readonly
 * @type {string}
 */
export const VIEW_SWITCHER = `
    <div class="view-switcher">
        <button class="view-btn" data-calendar-view="month">Month</button>
        <button class="view-btn" data-calendar-view="week">Week</button>
        <button class="view-btn" data-calendar-view="agenda">Agenda</button>
    </div>
`;

/**
 * Calendar header template
 * @readonly
 * @type {string}
 */
export const CALENDAR_HEADER = `
    <div class="calendar-header">
        <h2 class="calendar-title" id="calendar-title"></h2>
        <div class="calendar-controls">
            <div class="calendar-navigation"></div>
            <div class="view-switcher"></div>
        </div>
    </div>
`;

/**
 * Legacy TEMPLATES object for backward compatibility
 * @deprecated Use individual template constants instead
 * @readonly
 * @type {Object}
 */
export const TEMPLATES = {
    DAY_CELL,
    EVENT_PILL,
    LOADING,
    EMPTY,
    ERROR,
    NAVIGATION,
    VIEW_SWITCHER,
    CALENDAR_HEADER
};

// Default export for backward compatibility
export default {
    DAY_CELL,
    EVENT_PILL,
    LOADING,
    EMPTY,
    ERROR,
    NAVIGATION,
    VIEW_SWITCHER,
    CALENDAR_HEADER,
    TEMPLATES
};
