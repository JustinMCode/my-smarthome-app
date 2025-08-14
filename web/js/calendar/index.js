/**
 * Calendar Module - Main Entry Point
 * Modular calendar system for the Smart Fridge Dashboard
 */

// Core exports
export { CalendarCore } from './core/calendar-core.js';
export { CalendarState } from './core/calendar-state.js';
export { CalendarEvents } from './core/calendar-events.js';

// View exports
export { ViewManager } from './views/view-manager.js';
export { ViewBase } from './views/view-base.js';
export { MonthViewRefactored as MonthView } from './views/month-view.js';
export { WeekViewRefactored as WeekView } from './views/week-view.js';
export { AgendaView } from './views/agenda-view.js';

// Component exports
export { CalendarHeader } from './components/ui/navigation/index.js';
export { DayCell } from './components/ui/cells/index.js';
export { EventPill } from './components/ui/events/index.js';

// Interaction exports
export { TouchGestures } from './interactions/touch-gestures.js';

// Utility exports
export * from './utils/basic/calendar-constants.js';
export * from './utils/basic/calendar-date-utils.js';

// Modular system exports
export * from './components/index.js';
export * from './config/index.js';
export * from './core/index.js';
export * from './interactions/index.js';
export * from './mixins/index.js';
export * from './utils/index.js';
export * from './views/index.js';

// Main calendar manager class (for backward compatibility)
import { CalendarCore } from './core/calendar-core.js';
import { logger } from '../utils/logger.js';

/**
 * TouchCalendarManager - Backward compatibility wrapper
 * This maintains the existing API while using the new modular system
 */
export class TouchCalendarManager {
    constructor(dashboard) {
        this.core = new CalendarCore(dashboard);
        this.dashboard = dashboard;
        
        // Expose core methods for backward compatibility
        this.currentDate = this.core.getCurrentDate();
        this.selectedDate = this.core.getSelectedDate();
        this.currentView = this.core.getCurrentView();
        this.events = this.core.getEvents();
        this.isLoading = this.core.state.get('isLoading');
        this.isNavigating = this.core.state.get('isNavigating');
        this.lastTap = this.core.state.getLastTap();
        
        // Setup state synchronization
        this.setupStateSync();
    }
    
    /**
     * Setup state synchronization for backward compatibility
     */
    setupStateSync() {
        this.core.state.subscribe((key, value) => {
            // Update instance properties for backward compatibility
            switch (key) {
                case 'currentDate':
                    this.currentDate = value;
                    break;
                case 'selectedDate':
                    this.selectedDate = value;
                    break;
                case 'currentView':
                    this.currentView = value;
                    break;
                case 'events':
                    this.events = value;
                    break;
                case 'isLoading':
                    this.isLoading = value;
                    break;
                case 'isNavigating':
                    this.isNavigating = value;
                    break;
                case 'lastTap':
                    this.lastTap = value;
                    break;
            }
        });
    }
    
    /**
     * Initialize calendar (backward compatibility)
     */
    async init() {
        // Core is already initialized in constructor
        logger.init('TouchCalendarManager', 'Initialized (using modular system)');
        
        // Verify core components are working
        logger.debug('TouchCalendarManager', 'Core status:', {
            state: !!this.core.state,
            events: !!this.core.events,
            viewManager: !!this.core.viewManager,
            header: !!this.core.header,
            touchGestures: !!this.core.touchGestures
        });
        
        // Trigger initial render
        if (this.core.viewManager) {
            this.core.viewManager.render();
        }
    }
    
    /**
     * Get events for date (backward compatibility)
     */
    getEventsForDate(date) {
        return this.core.getEventsForDate(date);
    }
    
    /**
     * Navigate calendar (backward compatibility)
     */
    navigate(direction) {
        this.core.navigate(direction);
    }
    
    /**
     * Set view (backward compatibility)
     */
    setView(view) {
        this.core.switchView(view);
    }
    
    /**
     * Select date (backward compatibility)
     */
    selectDate(date) {
        this.core.selectDate(date);
    }
    
    /**
     * Render (backward compatibility)
     */
    render() {
        if (this.core.viewManager) {
            this.core.viewManager.render();
        }
    }
    
    /**
     * Show notification (backward compatibility)
     */
    showNotification(message, type = 'info') {
        this.core.showNotification(message, type);
    }
    
    /**
     * Add event (backward compatibility)
     */
    addEvent(eventData) {
        return this.core.addEvent(eventData);
    }
    
    /**
     * Update event (backward compatibility)
     */
    updateEvent(eventId, updates) {
        this.core.updateEvent(eventId, updates);
    }
    
    /**
     * Delete event (backward compatibility)
     */
    deleteEvent(eventId) {
        this.core.deleteEvent(eventId);
    }
    
    /**
     * Get upcoming events (backward compatibility)
     */
    getUpcomingEvents(count = 5) {
        return this.core.getUpcomingEvents(count);
    }
    
    /**
     * Get next event (backward compatibility)
     */
    getNextEvent() {
        return this.core.getNextEvent();
    }
    
    /**
     * Get today's events (backward compatibility)
     */
    getTodayEvents() {
        return this.core.getTodayEvents();
    }
    
    /**
     * Get event statistics (backward compatibility)
     */
    getEventStats() {
        return this.core.getEventStats();
    }
    
    /**
     * Search events (backward compatibility)
     */
    searchEvents(query) {
        return this.core.searchEvents(query);
    }
    
    /**
     * Get events for date range (backward compatibility)
     */
    getEventsForRange(startDate, endDate) {
        return this.core.events.getEventsForRange(startDate, endDate);
    }
    
    /**
     * Refresh events (backward compatibility)
     */
    async refreshEvents() {
        return this.core.refreshEvents();
    }
    
    /**
     * Get state (backward compatibility)
     */
    getState() {
        return this.core.getState();
    }
    
    /**
     * Destroy (backward compatibility)
     */
    destroy() {
        this.core.destroy();
    }
}

// Export the backward compatibility class as the default
export default TouchCalendarManager;

// Note: CalendarManager is now exported from the config system
// Use TouchCalendarManager for backward compatibility with the main calendar API
