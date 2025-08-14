/**
 * Event Renderer Component
 * Centralized event rendering and styling for all calendar views
 */

import { calendarConfigService } from '../../../config/calendar-config-service.js';
import { CALENDAR_CONFIG } from '../../../utils/basic/calendar-constants.js';
import { formatTime } from '../../../utils/basic/calendar-date-utils.js';
import { addTouchFeedback, createRipple } from '../../../utils/ui/touch-interactions.js';
import { categorizeEvent } from '../../../utils/events/event-categorization.js';

export class EventRenderer {
    constructor() {
        this.defaultColors = {
            work: '#3B82F6',
            family: '#10B981',
            health: '#EF4444',
            social: '#F59E0B',
            personal: '#8B5CF6',
            other: '#6B7280'
        };
    }

    /**
     * Create event pill for month view
     */
    createEventPill(event, options = {}) {
        const {
            showTime = true,
            showBullet = true,
            maxWidth = '100%',
            className = 'event-pill'
        } = options;

        const eventEl = document.createElement('div');
        eventEl.className = className;
        
        // Get event color
        const color = this.getEventColor(event);
        const isTimedEvent = this.isTimedEvent(event);
        
        // Create content structure
        const content = this.createEventContent(event, { showTime, showBullet, isTimedEvent });
        eventEl.innerHTML = content;
        
        // Apply styling
        this.applyEventStyling(eventEl, event, { color, isTimedEvent, maxWidth });
        
        // Add interaction handlers
        this.addEventInteraction(eventEl, event);
        
        return eventEl;
    }

    /**
     * Create week view event element
     */
    createWeekEvent(event, options = {}) {
        const {
            showLocation = true,
            showTime = true,
            className = 'week-event'
        } = options;

        const eventEl = document.createElement('div');
        eventEl.className = `${className} ${event.category || 'default'}`;
        eventEl.draggable = true;
        
        // Create time element
        if (showTime) {
            const timeEl = document.createElement('div');
            timeEl.className = 'week-event-time';
            timeEl.textContent = this.formatEventTime(event);
            eventEl.appendChild(timeEl);
        }
        
        // Create title element
        const titleEl = document.createElement('div');
        titleEl.className = 'week-event-title';
        titleEl.textContent = event.title;
        eventEl.appendChild(titleEl);
        
        // Create location element
        if (showLocation && event.location) {
            const locationEl = document.createElement('div');
            locationEl.className = 'week-event-location';
            locationEl.innerHTML = `📍 ${event.location}`;
            eventEl.appendChild(locationEl);
        }
        
        // Apply calendar color
        const color = this.getEventColor(event);
        if (color) {
            eventEl.style.background = `linear-gradient(135deg, ${color}ee 0%, ${color}cc 100%)`;
        }
        
        // Add interaction handlers
        this.addEventInteraction(eventEl, event);
        this.addDragHandlers(eventEl, event);
        
        return eventEl;
    }

    /**
     * Create all-day event element
     */
    createAllDayEvent(event, options = {}) {
        const {
            className = 'all-day-event',
            showTime = false
        } = options;

        const eventEl = document.createElement('div');
        eventEl.className = className;
        
        // Create content
        const content = this.createEventContent(event, { showTime, showBullet: false });
        eventEl.innerHTML = content;
        
        // Apply styling
        const color = this.getEventColor(event);
        if (color) {
            // For all-day events, use filled background with calendar color and white text
            eventEl.style.background = color;
            eventEl.style.color = 'white';
            eventEl.style.fontWeight = '600';
            eventEl.style.boxShadow = `0 2px 4px ${color}40`; // Add subtle shadow with color
        }
        
        // Add interaction handlers
        this.addEventInteraction(eventEl, event);
        
        return eventEl;
    }

    /**
     * Create event content HTML
     */
    createEventContent(event, options = {}) {
        const { showTime = true, showBullet = true, isTimedEvent = false } = options;
        
        const startTime = event.start ? formatTime(new Date(event.start)) : null;
        const hasTime = startTime && startTime !== '12:00 AM' && !event.allDay;
        
        if (isTimedEvent || hasTime) {
            const color = this.getEventColor(event);
            return `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    width: 100% !important;
                    overflow: hidden !important;
                ">
                    ${showBullet ? `
                        <div style="
                            width: 4px !important;
                            height: 4px !important;
                            border-radius: 50% !important;
                            background: ${color} !important;
                            flex-shrink: 0 !important;
                        "></div>
                    ` : ''}
                    ${showTime ? `
                        <span style="
                            font-size: 1em !important; 
                            opacity: 0.8 !important; 
                            flex-shrink: 0 !important;
                        ">${startTime}</span>
                    ` : ''}
                    <span style="
                        white-space: nowrap !important;
                        overflow: hidden !important;
                        flex: 1 !important;
                        font-size: 1em !important;
                    ">${event.title}</span>
                </div>
            `;
        } else {
            return `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    width: 100% !important;
                    overflow: hidden !important;
                ">
                    <span style="
                        white-space: nowrap !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        flex: 1 !important;
                        font-size: 1em !important;
                    ">${event.title}</span>
                </div>
            `;
        }
    }

    /**
     * Apply styling to event element
     */
    applyEventStyling(eventEl, event, options = {}) {
        const { color, isTimedEvent, maxWidth } = options;
        
        eventEl.style.maxWidth = maxWidth;
        
        if (isTimedEvent) {
            // Timed events: transparent background, colored text
            eventEl.style.backgroundColor = 'transparent';
            eventEl.style.border = 'none';
            eventEl.style.color = this.getEventTextColor(event);
        } else {
            // All-day events: solid background with white text
            eventEl.style.backgroundColor = color;
            eventEl.style.color = this.getEventTextColor(event);
            eventEl.style.border = 'none';
            eventEl.style.borderRadius = '4px';
            eventEl.style.fontWeight = '600';
            eventEl.style.boxShadow = `0 2px 4px ${color}40`; // Add subtle shadow with color
        }
    }

    /**
     * Add event interaction handlers
     */
    addEventInteraction(eventEl, event) {
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEventSelect(event);
        });
        
        // Add touch feedback
        addTouchFeedback(eventEl);
    }

    /**
     * Add drag handlers for week events
     */
    addDragHandlers(eventEl, event) {
        eventEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(event));
            eventEl.classList.add('dragging');
        });
        
        eventEl.addEventListener('dragend', () => {
            eventEl.classList.remove('dragging');
        });
    }



    /**
     * Get event color from calendar source
     */
    getEventColor(event) {
        let color;
        
        // Priority 1: Use the actual Google Calendar color from the event
        if (event.calendarColor) {
            color = event.calendarColor;
        }
        // Priority 2: Use event.color if available
        else if (event.color) {
            color = event.color;
        }
        // Priority 3: Fallback to calendar configuration service
        else if (event.calendarSource) {
            try {
                color = calendarConfigService.getCalendarColor(event.calendarSource);
            } catch (error) {
                console.warn('Calendar configuration not available for:', event.calendarSource);
            }
        }
        // Priority 4: Final fallback to Google Calendar default blue
        else {
            color = '#4285f4';
        }
        
        // Debug logging for color selection (optional, only in development)
        // Uncomment the following lines if you need to debug color selection:
        /*
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.debug('Event color selected:', {
                eventTitle: event.title,
                calendarColor: event.calendarColor,
                eventColor: event.color,
                calendarSource: event.calendarSource,
                selectedColor: color,
                allDay: event.allDay
            });
        }
        */
        
        return color;
    }

    /**
     * Get event text color (foreground color)
     */
    getEventTextColor(event) {
        // For all-day events, always use white text on colored background
        if (event.allDay) {
            return 'white';
        }
        
        // For timed events, use black text (bullet point will be colored)
        return 'black';
    }

    /**
     * Check if event is timed (not all-day)
     */
    isTimedEvent(event) {
        if (event.allDay) return false;
        
        const startTime = event.start ? formatTime(new Date(event.start)) : null;
        return startTime && startTime !== '12:00 AM';
    }

    /**
     * Format event time for display
     */
    formatEventTime(event) {
        const start = new Date(event.start);
        return start.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }



    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 }; // Default blue
    }

    /**
     * Event selection handler (to be overridden by view)
     */
    onEventSelect(event) {
        // This should be overridden by the view that uses this renderer
        console.log('Event selected:', event);
    }

    /**
     * Categorize event based on content
     * @deprecated Use the centralized categorizeEvent utility directly
     * @param {Object} event - Event to categorize
     * @returns {string} Event category
     */
    categorizeEvent(event) {
        // Delegate to the centralized utility
        return categorizeEvent(event);
    }
}
