/**
 * Calendar Core Orchestrator
 * Main coordinator for all calendar functionality
 */

import { CalendarState } from './calendar-state.js';
import { CalendarEvents } from './calendar-events.js';
import { CALENDAR_CONFIG } from '../utils/basic/calendar-constants.js';
import { ViewManager } from '../views/view-manager.js';
import { CalendarHeader } from '../components/ui/navigation/index.js';
import { TouchGestures } from '../interactions/touch-gestures.js';
import { logger } from '../../utils/logger.js';

export class CalendarCore {
    constructor(dashboard) {
        this.dashboard = dashboard;
        
        // Initialize core components
        this.state = new CalendarState();
        this.events = new CalendarEvents(this.state);
        
        // Component references
        this.viewManager = null;
        this.header = null;
        this.touchGestures = null;
        
        // Auto-refresh interval
        this.refreshInterval = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the calendar core
     */
    async init() {
        logger.init('Calendar Core', 'Initializing...');
        
        // Setup state change listeners FIRST
        this.setupStateListeners();
        
        // Load saved state
        this.state.loadFromStorage();
        
        // Force initial view to be month view
        this.state.setView(CALENDAR_CONFIG.VIEWS.MONTH);
        
        // Load events
        logger.loading('Calendar Core', 'Loading calendar events...');
        const loadedEvents = await this.events.loadEvents();
        logger.loading('Calendar Core', `Events loaded: ${loadedEvents.length}`);
        
        // Initialize view manager
        this.viewManager = new ViewManager(this);
        this.viewManager.init();
        
        // Force render the current view after initialization
        if (this.viewManager) {
            logger.debug('Calendar Core', 'Forcing initial render after view manager initialization');
            const currentView = this.getCurrentView();
            logger.debug('Calendar Core', `Current view: ${currentView}`);
            this.viewManager.switchView(currentView);
        }
        
        // Initialize header component
        this.header = new CalendarHeader(this);
        await this.header.init();
        
        // Initialize touch gestures
        this.touchGestures = new TouchGestures(this);
        
        logger.debug('Calendar Core', 'Components initialized:', {
            viewManager: !!this.viewManager,
            header: !!this.header,
            touchGestures: !!this.touchGestures
        });
        
        // Setup auto-refresh
        this.setupAutoRefresh();
        
        logger.ready('Calendar Core', 'Initialized');
    }
    
    /**
     * Setup auto-refresh for events
     */
    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Set up new interval (every 5 minutes)
        this.refreshInterval = setInterval(async () => {
            try {
                await this.events.refreshEvents();
                logger.refresh('Calendar Core', 'Events refreshed');
            } catch (error) {
                logger.warn('Calendar Core', 'Failed to auto-refresh events:', error);
            }
        }, 300000); // 5 minutes
    }
    
    /**
     * Setup state change listeners
     */
    setupStateListeners() {
        // Listen for view changes
        this.state.subscribe((key, value) => {
            if (key === 'currentView') {
                this.handleViewChange(value);
            } else if (key === 'currentDate') {
                this.handleDateChange(value);
            } else if (key === 'events') {
                this.handleEventsChange(value);
            } else if (key === 'isLoading') {
                logger.debug('Calendar Core', `Loading state changed: ${value}`);
                if (value === false) {
                    // Trigger re-render when loading completes
                    if (this.viewManager) {
                        logger.debug('Calendar Core', 'Loading completed, triggering re-render');
                        this.viewManager.render();
                    } else {
                        logger.warn('Calendar Core', 'View manager not available for re-render');
                    }
                }
            }
        });
    }
    
    /**
     * Handle view changes
     */
    handleViewChange(newView) {
        logger.debug('Calendar Core', `View changed to: ${newView}`);
        
        // Update UI components
        if (this.viewManager) {
            this.viewManager.switchView(newView);
        }
        
        if (this.header) {
            this.header.update();
        }
        
        // Save state
        this.state.saveToStorage();
    }
    
    /**
     * Handle date changes
     */
    handleDateChange(newDate) {
        logger.debug('Calendar Core', `Date changed to: ${newDate.toDateString()}`);
        
        // Update UI components
        if (this.viewManager) {
            this.viewManager.update();
        }
        
        if (this.header) {
            this.header.update();
        }
        
        // Save state
        this.state.saveToStorage();
    }
    
    /**
     * Handle events changes
     */
    handleEventsChange(newEvents) {
        logger.debug('Calendar Core', `Events updated: ${newEvents.length} events`);
        
        // Update UI components
        if (this.viewManager) {
            this.viewManager.update();
        }
        
        if (this.header) {
            this.header.update();
        }
        
        // Update dashboard if available
        if (this.dashboard && this.dashboard.updateNextEvent) {
            this.dashboard.updateNextEvent();
        }
    }
    
    /**
     * Get view manager
     */
    getViewManager() {
        return this.viewManager;
    }
    
    /**
     * Get header component
     */
    getHeader() {
        return this.header;
    }
    
    /**
     * Get touch gestures
     */
    getTouchGestures() {
        return this.touchGestures;
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.state.getState();
    }
    
    /**
     * Get current view
     */
    getCurrentView() {
        return this.state.getView();
    }
    
    /**
     * Get current date
     */
    getCurrentDate() {
        return this.state.getCurrentDate();
    }
    
    /**
     * Get selected date
     */
    getSelectedDate() {
        return this.state.getSelectedDate();
    }
    
    /**
     * Get events
     */
    getEvents() {
        return this.state.getEvents();
    }
    
    /**
     * Get events for a specific date
     */
    getEventsForDate(date) {
        return this.events.getEventsForDate(date);
    }
    
    /**
     * Get upcoming events
     * @param {number} count - Number of events to return
     * @returns {Array} Array of upcoming events
     */
    getUpcomingEvents(count = 5) {
        try {
            if (!this.events) {
                console.warn('⚠️ Calendar events not initialized');
                return [];
            }
            
            const events = this.events.getUpcomingEvents(count);
            console.log(`📅 Retrieved ${events.length} upcoming events`);
            return events;
        } catch (error) {
            console.error('❌ Error getting upcoming events:', error);
            return [];
        }
    }
    
    /**
     * Get next event
     * @returns {Object|null} Next event or null if none found
     */
    getNextEvent() {
        try {
            if (!this.events) {
                console.warn('⚠️ Calendar events not initialized');
                return null;
            }
            
            const nextEvent = this.events.getNextEvent();
            if (nextEvent) {
                console.log(`📅 Next event: ${nextEvent.title}`);
            }
            return nextEvent;
        } catch (error) {
            console.error('❌ Error getting next event:', error);
            return null;
        }
    }
    
    /**
     * Get today's events
     * @returns {Array} Array of today's events
     */
    getTodayEvents() {
        try {
            if (!this.events) {
                console.warn('⚠️ Calendar events not initialized');
                return [];
            }
            
            const events = this.events.getTodayEvents();
            console.log(`📅 Retrieved ${events.length} events for today`);
            return events;
        } catch (error) {
            console.error('❌ Error getting today\'s events:', error);
            return [];
        }
    }
    
    /**
     * Add new event
     */
    addEvent(eventData) {
        const event = this.events.addEvent(eventData);
        console.log('✅ Event added:', event.title);
        return event;
    }
    
    /**
     * Update existing event
     */
    updateEvent(eventId, updates) {
        this.events.updateEvent(eventId, updates);
        console.log('✅ Event updated:', eventId);
    }
    
    /**
     * Delete event
     */
    deleteEvent(eventId) {
        this.events.deleteEvent(eventId);
        console.log('✅ Event deleted:', eventId);
    }
    
    /**
     * Search events
     */
    searchEvents(query) {
        return this.events.searchEvents(query);
    }
    
    /**
     * Get event statistics
     */
    getEventStats() {
        return this.events.getEventStats();
    }
    
    /**
     * Navigate calendar
     */
    navigate(direction) {
        this.state.navigate(direction);
    }
    
    /**
     * Switch view
     */
    switchView(view) {
        this.state.setView(view);
    }
    
    /**
     * Select date
     */
    selectDate(date) {
        this.state.setSelectedDate(date);
        
        // Auto-switch to agenda view when selecting a date from month view
        if (this.state.getView() === CALENDAR_CONFIG.VIEWS.MONTH) {
            this.state.setView(CALENDAR_CONFIG.VIEWS.AGENDA);
        }
    }
    
    /**
     * Go to today
     */
    goToToday() {
        this.state.navigate(CALENDAR_CONFIG.NAVIGATION.TODAY);
    }
    
    /**
     * Refresh events
     */
    async refreshEvents() {
        try {
            await this.events.refreshEvents();
            console.log('✅ Events refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh events:', error);
            throw error;
        }
    }
    
    /**
     * Get settings
     */
    getSettings() {
        return this.state.getSettings();
    }
    
    /**
     * Update settings
     */
    updateSettings(settings) {
        this.state.updateSettings(settings);
        this.state.saveToStorage();
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (this.dashboard && this.dashboard.showNotification) {
            this.dashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    /**
     * Destroy calendar core
     */
    destroy() {
        // Clear intervals
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        
        // Save state
        this.state.saveToStorage();
        
        // Clear references
        this.viewManager = null;
        this.header = null;
        this.touchGestures = null;
        
        console.log('🗑️ Calendar Core destroyed');
    }
    
    /**
     * Reset calendar to default state
     */
    reset() {
        this.state.reset();
        this.events.loadFromStorage();
        console.log('🔄 Calendar reset to default state');
    }
}
