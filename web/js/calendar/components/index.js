/**
 * Calendar Components Index
 * Centralized export point for all calendar components
 * 
 * This file provides a clean API for importing calendar components
 * and maintains backward compatibility during the refactoring process.
 */

// UI Components - Modals
export { BaseModal, EventModal, createModalManager, ModalConfigs, ModalStrategies, ModalUtils, ModalPerformanceUtils } from './ui/modals/index.js';

// UI Components - Navigation
export { DateNavigation, CalendarHeader, createNavigationManager, NavigationConfigs, NavigationStrategies, NavigationUtils, NavigationPerformanceUtils } from './ui/navigation/index.js';

// UI Components - Filters
export { CalendarFilter, createFilterManager, FilterConfigs, FilterStrategies, FilterUtils, FilterPerformanceUtils } from './ui/filters/index.js';

// UI Components - Cells
export { DayCell, createCellManager, CellConfigs, CellStrategies, CellUtils, CellPerformanceUtils } from './ui/cells/index.js';

// UI Components - Events
export { EventPill, EventRenderer, createEventManager, EventConfigs, EventStrategies, EventUtils, EventPerformanceUtils } from './ui/events/index.js';

// UI Components - Settings
export { CalendarSettings, createSettingsManager, SettingsConfigs, SettingsStrategies, SettingsUtils, SettingsPerformanceUtils } from './ui/settings/index.js';

// Layout Components
export { GridLayoutEngine, OverlapDetector, ResponsiveLayout, createLayoutManager, LayoutConfigs, LayoutStrategies, LayoutUtils, PerformanceUtils } from './layout/index.js';

// Data Components
export { EventDataManager, EventCache, createDataManager, Filters, CacheConfigs, Utils } from './data/index.js';

// Legacy exports for backward compatibility
// These will be removed once refactoring is complete
export { EventModal as LegacyEventModal } from './ui/modals/index.js';
export { DateNavigation as LegacyDateNavigation } from './ui/navigation/index.js';
export { EventDataManager as LegacyEventDataManager } from './data/index.js';
export { EventRenderer as LegacyEventRenderer } from './ui/events/index.js';
export { GridLayoutEngine as LegacyGridLayoutEngine } from './layout/index.js';
export { CalendarFilter as LegacyCalendarFilter } from './ui/filters/index.js';
export { CalendarHeader as LegacyCalendarHeader } from './ui/navigation/index.js';
export { CalendarSettings as LegacyCalendarSettings } from './ui/settings/index.js';
export { DayCell as LegacyDayCell } from './ui/cells/index.js';
export { EventPill as LegacyEventPill } from './ui/events/index.js';
