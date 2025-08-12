/**
 * Calendar Utilities System Index
 * Centralized export point for all utility modules
 * 
 * This module provides centralized access to all utility modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarUtils
 */

// Import utility modules
import * as Constants from './calendar-constants.js';
import * as DateUtils from './calendar-date-utils.js';
import * as HashUtils from './core/hash.js';

// Utility modules
export * from './calendar-constants.js';
export * from './calendar-date-utils.js';
export * from './core/hash.js';

// Named exports for better organization
export { 
    CALENDAR_CONFIG,
    EVENT_CATEGORY_COLORS,
    EVENT_CATEGORY_ICONS,
    CSS_CLASSES,
    SELECTORS,
    TEMPLATES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} from './calendar-constants.js';

export {
    isSameDay,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    getDaysInMonth,
    addDays,
    addMonths,
    isToday,
    isWeekend,
    isCurrentMonth,
    getMonthName,
    getDayName,
    formatDate,
    formatTime,
    getCalendarGridDates
} from './calendar-date-utils.js';

export {
    hashString,
    hashStringLegacy,
    hashStrings,
    hashObject,
    getHashPerformanceMetrics,
    resetHashPerformanceMetrics,
    compareHashes,
    isValidHash,
    HASH_ALGORITHMS,
    DEFAULT_ALGORITHM
} from './core/hash.js';

// Legacy exports for backward compatibility
export { CALENDAR_CONFIG as LegacyCalendarConfig } from './calendar-constants.js';
export { CSS_CLASSES as LegacyCSSClasses } from './calendar-constants.js';
export { SELECTORS as LegacySelectors } from './calendar-constants.js';
export { TEMPLATES as LegacyTemplates } from './calendar-constants.js';
export { ERROR_MESSAGES as LegacyErrorMessages } from './calendar-constants.js';
export { SUCCESS_MESSAGES as LegacySuccessMessages } from './calendar-constants.js';

// Default export for backward compatibility
export default {
    ...Constants,
    ...DateUtils,
    ...HashUtils,
    
    // Legacy exports
    LegacyCalendarConfig: Constants.CALENDAR_CONFIG,
    LegacyCSSClasses: Constants.CSS_CLASSES,
    LegacySelectors: Constants.SELECTORS,
    LegacyTemplates: Constants.TEMPLATES,
    LegacyErrorMessages: Constants.ERROR_MESSAGES,
    LegacySuccessMessages: Constants.SUCCESS_MESSAGES
};
