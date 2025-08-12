/**
 * Calendar Core System Index
 * Centralized export point for all core modules
 * 
 * This module provides centralized access to all core modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarCore
 */

// Core modules
export { CalendarCore } from './calendar-core.js';
export { CalendarState } from './calendar-state.js';
export { CalendarEvents } from './calendar-events.js';

// Legacy exports for backward compatibility
export { CalendarCore as LegacyCalendarCore } from './calendar-core.js';
export { CalendarState as LegacyCalendarState } from './calendar-state.js';
export { CalendarEvents as LegacyCalendarEvents } from './calendar-events.js';

// Import all modules for default export
import { CalendarCore } from './calendar-core.js';
import { CalendarState } from './calendar-state.js';
import { CalendarEvents } from './calendar-events.js';

// Default export for backward compatibility
export default {
    CalendarCore,
    CalendarState,
    CalendarEvents,
    
    // Legacy exports
    LegacyCalendarCore: CalendarCore,
    LegacyCalendarState: CalendarState,
    LegacyCalendarEvents: CalendarEvents
};
