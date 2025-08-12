/**
 * User Messages Configuration
 * Centralized user message definitions for the calendar system
 * 
 * This module provides centralized access to all user-facing messages,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module Messages
 */

/**
 * Error messages
 * @readonly
 * @type {Object}
 */
export const ERROR_MESSAGES = {
    /** Invalid view error */
    INVALID_VIEW: 'Invalid calendar view specified',
    /** Load failed error */
    LOAD_FAILED: 'Failed to load calendar events',
    /** Save failed error */
    SAVE_FAILED: 'Failed to save calendar event',
    /** Network error */
    NETWORK_ERROR: 'Network error occurred',
    /** Invalid date error */
    INVALID_DATE: 'Invalid date provided',
    /** Configuration error */
    CONFIG_ERROR: 'Configuration error occurred',
    /** Storage error */
    STORAGE_ERROR: 'Failed to save to storage',
    /** Validation error */
    VALIDATION_ERROR: 'Validation failed'
};

/**
 * Success messages
 * @readonly
 * @type {Object}
 */
export const SUCCESS_MESSAGES = {
    /** Event saved success */
    EVENT_SAVED: 'Event saved successfully',
    /** Event deleted success */
    EVENT_DELETED: 'Event deleted successfully',
    /** View changed success */
    VIEW_CHANGED: 'View changed successfully',
    /** Settings saved success */
    SETTINGS_SAVED: 'Settings saved successfully',
    /** Calendar added success */
    CALENDAR_ADDED: 'Calendar added successfully',
    /** Calendar updated success */
    CALENDAR_UPDATED: 'Calendar updated successfully',
    /** Calendar deleted success */
    CALENDAR_DELETED: 'Calendar deleted successfully'
};

/**
 * Loading messages
 * @readonly
 * @type {Object}
 */
export const LOADING_MESSAGES = {
    /** Loading events */
    LOADING_EVENTS: 'Loading events...',
    /** Loading calendar */
    LOADING_CALENDAR: 'Loading calendar...',
    /** Saving event */
    SAVING_EVENT: 'Saving event...',
    /** Updating settings */
    UPDATING_SETTINGS: 'Updating settings...',
    /** Syncing data */
    SYNCING_DATA: 'Syncing data...'
};

/**
 * Empty state messages
 * @readonly
 * @type {Object}
 */
export const EMPTY_MESSAGES = {
    /** No events */
    NO_EVENTS: 'No events scheduled for this period',
    /** No calendars */
    NO_CALENDARS: 'No calendars available',
    /** No results */
    NO_RESULTS: 'No results found',
    /** No settings */
    NO_SETTINGS: 'No settings available'
};

/**
 * Confirmation messages
 * @readonly
 * @type {Object}
 */
export const CONFIRMATION_MESSAGES = {
    /** Delete event confirmation */
    DELETE_EVENT: 'Are you sure you want to delete this event?',
    /** Delete calendar confirmation */
    DELETE_CALENDAR: 'Are you sure you want to delete this calendar?',
    /** Reset settings confirmation */
    RESET_SETTINGS: 'Are you sure you want to reset all settings?',
    /** Clear data confirmation */
    CLEAR_DATA: 'Are you sure you want to clear all data?'
};

/**
 * Information messages
 * @readonly
 * @type {Object}
 */
export const INFO_MESSAGES = {
    /** Event created */
    EVENT_CREATED: 'Event created successfully',
    /** Event updated */
    EVENT_UPDATED: 'Event updated successfully',
    /** Calendar created */
    CALENDAR_CREATED: 'Calendar created successfully',
    /** Calendar updated */
    CALENDAR_UPDATED: 'Calendar updated successfully',
    /** Settings updated */
    SETTINGS_UPDATED: 'Settings updated successfully'
};

/**
 * Warning messages
 * @readonly
 * @type {Object}
 */
export const WARNING_MESSAGES = {
    /** Unsaved changes */
    UNSAVED_CHANGES: 'You have unsaved changes',
    /** Network slow */
    NETWORK_SLOW: 'Network connection is slow',
    /** Storage full */
    STORAGE_FULL: 'Storage is almost full',
    /** Sync failed */
    SYNC_FAILED: 'Sync failed, retrying...'
};

/**
 * Legacy ERROR_MESSAGES object for backward compatibility
 * @deprecated Use individual message groups instead
 * @readonly
 * @type {Object}
 */
export const ERROR_MESSAGES_LEGACY = ERROR_MESSAGES;

/**
 * Legacy SUCCESS_MESSAGES object for backward compatibility
 * @deprecated Use individual message groups instead
 * @readonly
 * @type {Object}
 */
export const SUCCESS_MESSAGES_LEGACY = SUCCESS_MESSAGES;

// Default export for backward compatibility
export default {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOADING_MESSAGES,
    EMPTY_MESSAGES,
    CONFIRMATION_MESSAGES,
    INFO_MESSAGES,
    WARNING_MESSAGES,
    ERROR_MESSAGES_LEGACY,
    SUCCESS_MESSAGES_LEGACY
};
