/**
 * Configuration Managers Index
 * Centralized export point for all configuration managers
 * 
 * This module provides centralized access to all configuration managers,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module ConfigManagers
 */

// Configuration managers
export { CalendarManager, calendarManager } from './calendar-manager.js';

// Default export for backward compatibility
import { CalendarManager, calendarManager } from './calendar-manager.js';
export default {
    CalendarManager,
    calendarManager
};
