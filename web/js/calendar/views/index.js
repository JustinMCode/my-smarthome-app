/**
 * Calendar Views System Index
 * Centralized export point for all view modules
 * 
 * This module provides centralized access to all view modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarViews
 */

// Import view modules
import { ViewBase } from './view-base.js';
import { ViewManager } from './view-manager.js';
import { MonthViewRefactored as MonthView } from './month-view.js';
import { WeekViewRefactored as WeekView } from './week-view.js';
import { AgendaView } from './agenda-view.js';

// View modules
export { ViewBase } from './view-base.js';
export { ViewManager } from './view-manager.js';
export { MonthViewRefactored as MonthView } from './month-view.js';
export { WeekViewRefactored as WeekView } from './week-view.js';
export { AgendaView } from './agenda-view.js';

// Legacy exports for backward compatibility
export { ViewBase as LegacyViewBase } from './view-base.js';
export { ViewManager as LegacyViewManager } from './view-manager.js';
export { MonthViewRefactored as LegacyMonthView } from './month-view.js';
export { WeekViewRefactored as LegacyWeekView } from './week-view.js';
export { AgendaView as LegacyAgendaView } from './agenda-view.js';

// Default export for backward compatibility
export default {
    ViewBase,
    ViewManager,
    MonthView,
    WeekView,
    AgendaView,
    
    // Legacy exports
    LegacyViewBase: ViewBase,
    LegacyViewManager: ViewManager,
    LegacyMonthView: MonthView,
    LegacyWeekView: WeekView,
    LegacyAgendaView: AgendaView
};
