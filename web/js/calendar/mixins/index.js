/**
 * Calendar Mixins System Index
 * Centralized export point for all mixin modules
 * 
 * This module provides centralized access to all mixin modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarMixins
 */

// Import mixin modules
import { ViewMixin } from './ViewMixin.js';

// Mixin modules
export { ViewMixin } from './ViewMixin.js';

// Legacy exports for backward compatibility
export { ViewMixin as LegacyViewMixin } from './ViewMixin.js';

// Default export for backward compatibility
export default {
    ViewMixin,
    
    // Legacy exports
    LegacyViewMixin: ViewMixin
};
