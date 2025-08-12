/**
 * Calendar State Management
 * Centralized state management for the calendar system
 */

import { CALENDAR_CONFIG } from '../utils/calendar-constants.js';

export class CalendarState {
    constructor() {
        this.state = {
            // Current view and date
            currentView: CALENDAR_CONFIG.VIEWS.MONTH,
            currentDate: new Date(),
            selectedDate: new Date(),
            
            // Events data
            events: [],
            isLoading: false,
            lastUpdated: null,
            
            // UI state
            isNavigating: false,
            isAnimating: false,
            
            // Touch state
            touchStartX: 0,
            touchStartY: 0,
            lastTap: 0,
            
            // Settings
            settings: {
                use24Hour: false,
                showWeekends: true,
                showOtherMonthDays: true,
                maxEventsPerDay: CALENDAR_CONFIG.DISPLAY.MAX_EVENTS_PER_DAY
            }
        };
        
        this.listeners = new Map();
        this.nextListenerId = 1;
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} callback - Callback function
     * @returns {number} - Listener ID for unsubscribing
     */
    subscribe(callback) {
        const id = this.nextListenerId++;
        this.listeners.set(id, callback);
        return id;
    }
    
    /**
     * Unsubscribe from state changes
     * @param {number} id - Listener ID
     */
    unsubscribe(id) {
        this.listeners.delete(id);
    }
    
    /**
     * Notify all listeners of state change
     * @param {string} key - State key that changed
     * @param {any} value - New value
     */
    notify(key, value) {
        this.listeners.forEach(callback => {
            try {
                callback(key, value, this.state);
            } catch (error) {
                console.error('Calendar state listener error:', error);
            }
        });
    }
    
    /**
     * Update state and notify listeners
     * @param {Object} updates - State updates
     */
    update(updates) {
        const changedKeys = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            if (this.state[key] !== value) {
                this.state[key] = value;
                changedKeys.push(key);
            }
        });
        
        // Notify listeners of changes
        changedKeys.forEach(key => {
            this.notify(key, this.state[key]);
        });
    }
    
    /**
     * Get current state
     * @returns {Object} - Current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Get specific state value
     * @param {string} key - State key
     * @returns {any} - State value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Set specific state value
     * @param {string} key - State key
     * @param {any} value - New value
     */
    set(key, value) {
        this.update({ [key]: value });
    }
    
    // View management
    setView(view) {
        if (!Object.values(CALENDAR_CONFIG.VIEWS).includes(view)) {
            console.warn(`Invalid view: ${view}`);
            return;
        }
        this.set('currentView', view);
    }
    
    getView() {
        return this.state.currentView;
    }
    
    // Date management
    setCurrentDate(date) {
        this.set('currentDate', new Date(date));
    }
    
    getCurrentDate() {
        return this.state.currentDate;
    }
    
    setSelectedDate(date) {
        this.set('selectedDate', new Date(date));
    }
    
    getSelectedDate() {
        return this.state.selectedDate;
    }
    
    // Navigation
    navigate(direction) {
        if (this.state.isNavigating) return;
        
        this.set('isNavigating', true);
        
        let newDate = new Date(this.state.currentDate);
        
        switch (direction) {
            case CALENDAR_CONFIG.NAVIGATION.PREV:
                if (this.state.currentView === CALENDAR_CONFIG.VIEWS.MONTH) {
                    newDate.setMonth(newDate.getMonth() - 1);
                } else if (this.state.currentView === CALENDAR_CONFIG.VIEWS.WEEK) {
                    newDate.setDate(newDate.getDate() - 7);
                } else {
                    newDate.setDate(newDate.getDate() - 1);
                }
                break;
                
            case CALENDAR_CONFIG.NAVIGATION.NEXT:
                if (this.state.currentView === CALENDAR_CONFIG.VIEWS.MONTH) {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else if (this.state.currentView === CALENDAR_CONFIG.VIEWS.WEEK) {
                    newDate.setDate(newDate.getDate() + 7);
                } else {
                    newDate.setDate(newDate.getDate() + 1);
                }
                break;
                
            case CALENDAR_CONFIG.NAVIGATION.TODAY:
                newDate = new Date();
                this.setSelectedDate(new Date());
                break;
        }
        
        this.setCurrentDate(newDate);
        
        // Reset navigation flag after a short delay
        setTimeout(() => {
            this.set('isNavigating', false);
        }, 100);
    }
    
    // Events management
    setEvents(events) {
        this.set('events', events);
        this.set('lastUpdated', new Date());
    }
    
    getEvents() {
        return this.state.events;
    }
    
    addEvent(event) {
        const events = [...this.state.events, event];
        this.setEvents(events);
    }
    
    updateEvent(eventId, updates) {
        const events = this.state.events.map(event => 
            event.id === eventId ? { ...event, ...updates } : event
        );
        this.setEvents(events);
    }
    
    deleteEvent(eventId) {
        const events = this.state.events.filter(event => event.id !== eventId);
        this.setEvents(events);
    }
    
    getEventsForDate(date) {
        return this.state.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            // For all-day events, the end date is exclusive (next day)
            // For timed events, the end date is inclusive
            const adjustedEventEnd = event.allDay ? 
                new Date(eventEnd.getTime() - 24 * 60 * 60 * 1000) : // Subtract one day for all-day events
                eventEnd;
            
            // Check if the given date falls within the event's date range
            const givenDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const eventEndDate = new Date(adjustedEventEnd.getFullYear(), adjustedEventEnd.getMonth(), adjustedEventEnd.getDate());
            
            return givenDate >= eventStartDate && givenDate <= eventEndDate;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    // Loading state
    setLoading(loading) {
        this.set('isLoading', loading);
    }
    
    isLoading() {
        return this.state.isLoading;
    }
    
    // Settings management
    updateSettings(settings) {
        this.update({
            settings: { ...this.state.settings, ...settings }
        });
    }
    
    getSettings() {
        return { ...this.state.settings };
    }
    
    // Touch state
    setTouchStart(x, y) {
        this.set('touchStartX', x);
        this.set('touchStartY', y);
    }
    
    getTouchStart() {
        return {
            x: this.state.touchStartX,
            y: this.state.touchStartY
        };
    }
    
    setLastTap(time) {
        this.set('lastTap', time);
    }
    
    getLastTap() {
        return this.state.lastTap;
    }
    
    // Animation state
    setAnimating(animating) {
        this.set('isAnimating', animating);
    }
    
    isAnimating() {
        return this.state.isAnimating;
    }
    
    // Persistence
    saveToStorage() {
        try {
            const dataToSave = {
                currentView: this.state.currentView,
                currentDate: this.state.currentDate.toISOString(),
                selectedDate: this.state.selectedDate.toISOString(),
                settings: this.state.settings,
                events: this.state.events
            };
            
            localStorage.setItem(CALENDAR_CONFIG.STORAGE.VIEW_STATE, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save calendar state:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(CALENDAR_CONFIG.STORAGE.VIEW_STATE);
            if (saved) {
                const data = JSON.parse(saved);
                
                this.update({
                    currentView: data.currentView || CALENDAR_CONFIG.VIEWS.MONTH,
                    currentDate: new Date(data.currentDate),
                    selectedDate: new Date(data.selectedDate),
                    settings: { ...this.state.settings, ...data.settings },
                    events: data.events || []
                });
            }
        } catch (error) {
            console.error('Failed to load calendar state:', error);
        }
    }
    
    // Reset state
    reset() {
        this.update({
            currentView: CALENDAR_CONFIG.VIEWS.MONTH,
            currentDate: new Date(),
            selectedDate: new Date(),
            events: [],
            isLoading: false,
            isNavigating: false,
            isAnimating: false,
            touchStartX: 0,
            touchStartY: 0,
            lastTap: 0
        });
    }
}
