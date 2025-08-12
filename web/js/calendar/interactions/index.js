/**
 * Calendar Interactions System Index
 * Centralized export point for all interaction modules
 * 
 * This module provides centralized access to all interaction modules,
 * ensuring consistency and maintainability across the calendar system.
 * 
 * @module CalendarInteractions
 */

// Import interaction modules
import { TouchGestures } from './touch-gestures.js';

// Interaction modules
export { TouchGestures } from './touch-gestures.js';

// Legacy exports for backward compatibility
export { TouchGestures as LegacyTouchGestures } from './touch-gestures.js';

// Default export for backward compatibility
export default {
    TouchGestures,
    
    // Legacy exports
    LegacyTouchGestures: TouchGestures
};
