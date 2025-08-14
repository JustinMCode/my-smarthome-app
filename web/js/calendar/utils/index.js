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
import * as Constants from './basic/calendar-constants.js';
import * as DateUtils from './basic/calendar-date-utils.js';
import * as HashUtils from './core/hash.js';
import * as FactoryUtils from './factory/index.js';
import * as TouchUtils from './ui/touch-interactions.js';
import * as CategorizationUtils from './events/event-categorization.js';

// Utility modules
export * from './basic/calendar-constants.js';
export * from './basic/calendar-date-utils.js';
export * from './core/hash.js';
export * from './factory/index.js';
export * from './ui/touch-interactions.js';
export * from './events/event-categorization.js';

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
} from './basic/calendar-constants.js';

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
} from './basic/calendar-date-utils.js';

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

export {
    addTouchFeedback,
    createRipple,
    removeTouchFeedback,
    isTouchDevice,
    addTouchEffects,
    initTouchInteractions,
    cleanupTouchInteractions,
    getTouchStats
} from './ui/touch-interactions.js';

export {
    categorizeEvent,
    normalizeCategory,
    getAvailableCategories,
    addCustomRule,
    addCategoryAlias,
    clearCategorizationCache,
    getCategorizationStats,
    EVENT_CATEGORY_RULES,
    EVENT_CATEGORY_ALIASES,
    DEFAULT_CATEGORIZATION_OPTIONS
} from './events/event-categorization.js';



// Legacy exports for backward compatibility
export { CALENDAR_CONFIG as LegacyCalendarConfig } from './basic/calendar-constants.js';
export { CSS_CLASSES as LegacyCSSClasses } from './basic/calendar-constants.js';
export { SELECTORS as LegacySelectors } from './basic/calendar-constants.js';
export { TEMPLATES as LegacyTemplates } from './basic/calendar-constants.js';
export { ERROR_MESSAGES as LegacyErrorMessages } from './basic/calendar-constants.js';
export { SUCCESS_MESSAGES as LegacySuccessMessages } from './basic/calendar-constants.js';

// Default export for backward compatibility
export default {
    ...Constants,
    ...DateUtils,
    ...HashUtils,
    ...FactoryUtils,
    ...TouchUtils,
    ...CategorizationUtils,
    
    // Legacy exports
    LegacyCalendarConfig: Constants.CALENDAR_CONFIG,
    LegacyCSSClasses: Constants.CSS_CLASSES,
    LegacySelectors: Constants.SELECTORS,
    LegacyTemplates: Constants.TEMPLATES,
    LegacyErrorMessages: Constants.ERROR_MESSAGES,
    LegacySuccessMessages: Constants.SUCCESS_MESSAGES
};
