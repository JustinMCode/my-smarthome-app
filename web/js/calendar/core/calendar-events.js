/**
 * Calendar Events Management
 * Handles event data, API integration, and event processing
 */

import { CALENDAR_CONFIG, EVENT_CATEGORY_COLORS, EVENT_CATEGORY_ICONS } from '../utils/calendar-constants.js';
import { isSameDay } from '../utils/calendar-date-utils.js';
import { calendarConfigService } from '../config/calendar-config-service.js';
import { logger } from '../../utils/logger.js';

export class CalendarEvents {
    constructor(state) {
        this.state = state;
        this.apiTimeout = CALENDAR_CONFIG.API.TIMEOUT;
    }
    
    /**
     * Load events from API or fallback to localStorage
     */
    async loadEvents() {
        this.state.setLoading(true);
        
        // Load calendar configuration first
        await calendarConfigService.loadCalendars();
        
        try {
            // Try API first
            const events = await this.fetchFromAPI();
            if (events) {
                this.state.setEvents(events);
                this.saveToStorage(events);
                this.state.setLoading(false);
                return events;
            }
        } catch (error) {
            console.warn('API failed, falling back to localStorage:', error);
        }
        
        // Fallback to localStorage
        const events = this.loadFromStorage();
        if (events.length === 0) {
            // Add sample events if none exist
            const sampleEvents = this.createSampleEvents();
            this.state.setEvents(sampleEvents);
            this.saveToStorage(sampleEvents);
            return sampleEvents;
        }
        
        this.state.setEvents(events);
        this.state.setLoading(false);
        return events;
    }
    
    /**
     * Fetch events from API
     */
    async fetchFromAPI() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);
        
        try {
            logger.debug('Calendar Events', `Fetching from API: ${CALENDAR_CONFIG.API.EVENTS}`);
            const response = await fetch(CALENDAR_CONFIG.API.EVENTS, {
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                logger.debug('Calendar Events', 'API response:', data);
                
                // Check if the response has the expected structure
                if (data && data.success && Array.isArray(data.events)) {
                    logger.debug('Calendar Events', `Found events array with ${data.events.length} events`);
                    return this.parseEvents(data.events);
                } else if (Array.isArray(data)) {
                    logger.debug('Calendar Events', `Response is direct array with ${data.length} events`);
                    return this.parseEvents(data);
                } else {
                    console.warn('Unexpected API response structure:', data);
                    return [];
                }
            } else {
                throw new Error(`API responded with status: ${response.status}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('API request timed out');
            }
            throw error;
        }
    }
    
    /**
     * Parse events from API response
     */
    parseEvents(data) {
        logger.debug('Calendar Events', `parseEvents called with: ${typeof data}`, data);
        
        if (!data) {
            console.warn('No data provided to parseEvents');
            return [];
        }
        
        if (!Array.isArray(data)) {
            console.warn('Data is not an array:', data);
            return [];
        }
        
        logger.debug('Calendar Events', `Parsing ${data.length} events`);
        
        return data.map(event => {
            const startDate = this.parseDate(event.start);
            const endDate = this.parseDate(event.end);
            
            // Detect all-day events based on date format or explicit flag
            const isAllDay = event.allDay || 
                           (typeof event.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.start)) ||
                           (startDate.getHours() === 0 && startDate.getMinutes() === 0 && 
                            endDate.getHours() === 0 && endDate.getMinutes() === 0);
            
            // Normalize recurrence info from various possible fields
            let recurrenceArray = [];
            if (Array.isArray(event.recurrence)) {
                recurrenceArray = event.recurrence;
            } else if (typeof event.recurrence === 'string' && event.recurrence.trim().length > 0) {
                const rule = event.recurrence.trim();
                recurrenceArray = [rule.startsWith('RRULE:') ? rule : `RRULE:${rule}`];
            } else if (typeof event.rrule === 'string' && event.rrule.trim().length > 0) {
                recurrenceArray = [`RRULE:${event.rrule.trim()}`];
            } else if (typeof event.recurrenceRule === 'string' && event.recurrenceRule.trim().length > 0) {
                recurrenceArray = [`RRULE:${event.recurrenceRule.trim()}`];
            }

            const parsedEvent = {
                id: event.id || event.uid || `event-${Date.now()}-${Math.random()}`,
                title: event.title || event.summary || 'Untitled Event',
                start: startDate,
                end: endDate,
                location: event.location || '',
                description: event.description || '',
                category: this.categorizeEvent(event),
                allDay: isAllDay,
                calendarSource: event.source || event.calendarName || 'Default Calendar',
                 color: event.calendarColor, // Use only the actual Google Calendar color
                 icon: event.icon || EVENT_CATEGORY_ICONS[this.categorizeEvent(event)],
                // Preserve Google Calendar recurrence info so UI can display it
                recurrence: recurrenceArray,
                 recurringEventId: event.recurringEventId || null
            };
            
            // Removed verbose per-event logging to reduce console noise
            return parsedEvent;
        });
    }

    /**
     * Parse date string to Date object, handling different formats
     */
    parseDate(dateString) {
        if (!dateString) {
            return new Date();
        }

        // If it's already a Date object, return it
        if (dateString instanceof Date) {
            return dateString;
        }

        // Handle date-only format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            // Create date in local timezone at midnight
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        // Handle datetime format (YYYY-MM-DDTHH:mm:ss or with timezone)
        if (dateString.includes('T')) {
            // Parse ISO datetime string
            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString);
                return new Date();
            }
            
            return date;
        }

        // Fallback to standard Date constructor
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn('Could not parse date string:', dateString);
            return new Date();
        }
        
        return date;
    }
    
    /**
     * Get color for calendar based on source
     */
    getCalendarColor(source) {
        // Use the calendar configuration service to get the actual color
        return calendarConfigService.getCalendarColor(source);
    }

    /**
     * Categorize event based on title and description
     */
    categorizeEvent(event) {
        const title = (event.title || event.summary || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const text = `${title} ${description}`;
        
        if (text.includes('work') || text.includes('meeting') || text.includes('office') || text.includes('team')) {
            return CALENDAR_CONFIG.EVENT_CATEGORIES.WORK;
        } else if (text.includes('family') || text.includes('kids') || text.includes('child') || text.includes('home')) {
            return CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY;
        } else if (text.includes('health') || text.includes('doctor') || text.includes('appointment') || text.includes('medical')) {
            return CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH;
        } else if (text.includes('party') || text.includes('social') || text.includes('dinner') || text.includes('celebration')) {
            return CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL;
        } else if (text.includes('personal') || text.includes('private') || text.includes('me time')) {
            return CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL;
        }
        
        return CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
    }
    
    /**
     * Create sample events for demonstration
     */
    createSampleEvents() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return [
            {
                id: 'sample-1',
                title: 'Team Meeting',
                start: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                end: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
                location: 'Conference Room A',
                description: 'Weekly team sync meeting',
                category: CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
                allDay: false,
                color: EVENT_CATEGORY_COLORS.work,
                icon: EVENT_CATEGORY_ICONS.work
            },
            {
                id: 'sample-2',
                title: 'Lunch with Family',
                start: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
                end: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM
                location: 'Home Kitchen',
                description: 'Family lunch time',
                category: CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
                allDay: false,
                color: EVENT_CATEGORY_COLORS.family,
                icon: EVENT_CATEGORY_ICONS.family
            },
            {
                id: 'sample-3',
                title: 'Doctor Appointment',
                start: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM
                end: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4 PM
                location: 'Medical Center',
                description: 'Annual checkup',
                category: CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
                allDay: false,
                color: EVENT_CATEGORY_COLORS.health,
                icon: EVENT_CATEGORY_ICONS.health
            },
            {
                id: 'sample-4',
                title: 'Weekend Trip',
                start: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                end: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
                location: 'Mountain Cabin',
                description: 'Weekend getaway with friends',
                category: CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
                allDay: true,
                color: EVENT_CATEGORY_COLORS.social,
                icon: EVENT_CATEGORY_ICONS.social
            },
            {
                id: 'sample-5',
                title: 'Personal Time',
                start: new Date(today.getTime() + 18 * 60 * 60 * 1000), // 6 PM
                end: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7 PM
                location: 'Home',
                description: 'Reading and relaxation',
                category: CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL,
                allDay: false,
                color: EVENT_CATEGORY_COLORS.personal,
                icon: EVENT_CATEGORY_ICONS.personal
            }
        ];
    }
    
    /**
     * Save events to localStorage
     */
    saveToStorage(events) {
        try {
            localStorage.setItem(CALENDAR_CONFIG.STORAGE.EVENTS, JSON.stringify(events));
        } catch (error) {
            console.error('Failed to save events to storage:', error);
        }
    }
    
    /**
     * Load events from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(CALENDAR_CONFIG.STORAGE.EVENTS);
            if (stored) {
                const events = JSON.parse(stored);
                return events.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }));
            }
        } catch (error) {
            console.error('Failed to load events from storage:', error);
        }
        return [];
    }
    
    /**
     * Refresh events from API
     */
    async refreshEvents() {
        try {
            // Refresh calendar configuration first
            await calendarConfigService.refresh();
            
            const events = await this.fetchFromAPI();
            if (events) {
                this.state.setEvents(events);
                this.saveToStorage(events);
                return events;
            }
        } catch (error) {
            console.error('Failed to refresh events:', error);
            throw error;
        }
    }
    
    /**
     * Add new event
     */
    addEvent(eventData) {
        const event = {
            id: `event-${Date.now()}-${Math.random()}`,
            title: eventData.title || 'Untitled Event',
            start: new Date(eventData.start),
            end: new Date(eventData.end),
            location: eventData.location || '',
            description: eventData.description || '',
            category: eventData.category || CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER,
            allDay: eventData.allDay || false,
            color: eventData.color || EVENT_CATEGORY_COLORS[eventData.category || CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER],
            icon: eventData.icon || EVENT_CATEGORY_ICONS[eventData.category || CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER]
        };
        
        this.state.addEvent(event);
        this.saveToStorage(this.state.getEvents());
        return event;
    }
    
    /**
     * Update existing event
     */
    updateEvent(eventId, updates) {
        this.state.updateEvent(eventId, updates);
        this.saveToStorage(this.state.getEvents());
    }
    
    /**
     * Delete event
     */
    deleteEvent(eventId) {
        this.state.deleteEvent(eventId);
        this.saveToStorage(this.state.getEvents());
    }
    
    /**
     * Get events for a specific date
     */
    getEventsForDate(date) {
        return this.state.getEventsForDate(date);
    }
    
    /**
     * Get events for a date range
     */
    getEventsForRange(startDate, endDate) {
        return this.state.getEvents().filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            return eventStart <= endDate && eventEnd >= startDate;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    /**
     * Get upcoming events
     */
    getUpcomingEvents(count = 5) {
        const now = new Date();
        const upcoming = this.state.getEvents()
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
        
        return upcoming.slice(0, count);
    }
    
    /**
     * Get events for today
     */
    getTodayEvents() {
        const today = new Date();
        return this.getEventsForDate(today);
    }
    
    /**
     * Get next event
     */
    getNextEvent() {
        const upcoming = this.getUpcomingEvents(1);
        return upcoming.length > 0 ? upcoming[0] : null;
    }
    
    /**
     * Search events by text
     */
    searchEvents(query) {
        const searchTerm = query.toLowerCase();
        return this.state.getEvents().filter(event => {
            return event.title.toLowerCase().includes(searchTerm) ||
                   event.description.toLowerCase().includes(searchTerm) ||
                   event.location.toLowerCase().includes(searchTerm);
        });
    }
    
    /**
     * Get events by category
     */
    getEventsByCategory(category) {
        return this.state.getEvents().filter(event => event.category === category);
    }
    
    /**
     * Get event statistics
     */
    getEventStats() {
        const events = this.state.getEvents();
        const stats = {
            total: events.length,
            byCategory: {},
            upcoming: this.getUpcomingEvents().length,
            today: this.getTodayEvents().length
        };
        
        // Count by category
        events.forEach(event => {
            stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
        });
        
        return stats;
    }
}
