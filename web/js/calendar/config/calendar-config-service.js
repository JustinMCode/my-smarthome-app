/**
 * Calendar Configuration Service
 * Dynamically loads calendar configuration from the API
 */

import { CALENDAR_CONFIG } from '../utils/basic/calendar-constants.js';

export class CalendarConfigService {
    constructor() {
        this.calendars = new Map();
        this.calendarsByName = new Map();
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load calendar configuration from API
     */
    async loadCalendars() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._fetchCalendars();
        return this.loadPromise;
    }

    /**
     * Fetch calendars from API
     */
    async _fetchCalendars() {
        try {
            const response = await fetch('/api/calendar/calendars', {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(CALENDAR_CONFIG.API.TIMEOUT)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.calendars)) {
                    this._processCalendars(data.calendars);
                    this.isLoaded = true;
                    // console.log('📅 Calendar configuration loaded:', this.calendars.size, 'calendars');
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load calendar configuration:', error);
        }

        // Fallback to default configuration
        this._loadDefaultCalendars();
        this.isLoaded = true;
        return false;
    }

    /**
     * Process calendars from API response
     */
    _processCalendars(calendars) {
        this.calendars.clear();
        this.calendarsByName.clear(); // Clear both maps
        
        calendars.forEach((calendar, index) => {
            const calendarConfig = {
                id: calendar.id,
                name: calendar.name || calendar.id,
                color: calendar.color || this._generateColor(calendar.id),
                gradient: this._generateGradient(calendar.color || this._generateColor(calendar.id)),
                description: calendar.description || '',
                enabled: calendar.selected !== false,
                visible: calendar.selected !== false,
                order: index + 1,
                accessRole: calendar.accessRole,
                primary: calendar.primary || false
            };
            
            // Store by ID in main map, by name in separate map
            this.calendars.set(calendar.id, calendarConfig);
            this.calendarsByName.set(calendar.name, calendarConfig);
        });
    }

    /**
     * Load default calendar configuration (fallback)
     */
    _loadDefaultCalendars() {
        const defaultCalendars = [
            {
                id: 'default-calendar',
                name: 'Default Calendar',
                color: '#4285f4', // Google Calendar default blue
                gradient: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                description: 'Default calendar',
                enabled: true,
                visible: true,
                order: 1
            }
        ];

        this._processCalendars(defaultCalendars);
    }

    /**
     * Generate a color based on calendar ID
     */
    _generateColor(calendarId) {
        let hash = 0;
        for (let i = 0; i < calendarId.length; i++) {
            const char = calendarId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    /**
     * Generate a gradient from a color
     */
    _generateGradient(color) {
        // Convert HSL to a darker version for gradient
        if (color.startsWith('hsl')) {
            const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                const [, h, s, l] = match;
                const darkerL = Math.max(parseInt(l) - 20, 20);
                return `linear-gradient(135deg, ${color} 0%, hsl(${h}, ${s}%, ${darkerL}%) 100%)`;
            }
        }
        
        // Fallback for hex colors
        return `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
    }

    /**
     * Get calendar by ID or name
     */
    getCalendar(calendarId) {
        // First try by ID, then by name
        return this.calendars.get(calendarId) || this.calendarsByName.get(calendarId);
    }

    /**
     * Get all calendars (unique by ID)
     */
    getAllCalendars() {
        // Return only from the main calendars map to ensure no duplicates
        return Array.from(this.calendars.values());
    }

    /**
     * Get calendar color
     */
    getCalendarColor(calendarId) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.color : '#4285f4'; // Google Calendar default blue
    }

    /**
     * Get calendar name
     */
    getCalendarName(calendarId) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.name : calendarId;
    }

    /**
     * Check if calendar is enabled
     */
    isCalendarEnabled(calendarId) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.enabled : true;
    }

    /**
     * Check if calendar is visible
     */
    isCalendarVisible(calendarId) {
        const calendar = this.getCalendar(calendarId);
        return calendar ? calendar.visible : true;
    }

    /**
     * Get enabled calendars
     */
    getEnabledCalendars() {
        return this.getAllCalendars().filter(cal => cal.enabled);
    }

    /**
     * Get visible calendars
     */
    getVisibleCalendars() {
        return this.getAllCalendars().filter(cal => cal.visible);
    }

    /**
     * Refresh calendar configuration
     */
    async refresh() {
        this.isLoaded = false;
        this.loadPromise = null;
        return this.loadCalendars();
    }

    /**
     * Check if configuration is loaded
     */
    isConfigurationLoaded() {
        return this.isLoaded;
    }
}

// Export singleton instance
export const calendarConfigService = new CalendarConfigService();
