/**
 * Event Data Manager Component
 * Centralized event data handling and filtering for calendar views
 */

import { CacheFactory } from '../../utils/core/cache/index.js';
import { categorizeEvent } from '../../utils/events/event-categorization.js';

export class EventDataManager {
    constructor(core) {
        this.core = core;
        this.filters = new Map();
        this.cache = CacheFactory.createEventCache();
    }

    /**
     * Get events for a specific date
     */
    getEventsForDate(date, options = {}) {
        const {
            includeAllDay = true,
            includeTimed = true,
            applyFilters = true,
            useCache = true
        } = options;

        // Check cache first
        if (useCache) {
            const cached = this.cache.getEvents(date, options);
            if (cached) {
                return cached;
            }
        }

        let events = this.core.getEventsForDate(date);

        // Apply calendar filter if available
        if (applyFilters && this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }

        // Apply custom filters
        if (applyFilters) {
            events = this.applyCustomFilters(events);
        }

        // Filter by event type
        events = events.filter(event => {
            if (event.allDay && !includeAllDay) return false;
            if (!event.allDay && !includeTimed) return false;
            return true;
        });

        // Cache the result
        if (useCache) {
            this.cache.cacheEvents(date, options, events);
        }

        return events;
    }

    /**
     * Get all-day events for a date
     */
    getAllDayEvents(date, options = {}) {
        return this.getEventsForDate(date, {
            ...options,
            includeAllDay: true,
            includeTimed: false
        });
    }

    /**
     * Get timed events for a date
     */
    getTimedEvents(date, options = {}) {
        return this.getEventsForDate(date, {
            ...options,
            includeAllDay: false,
            includeTimed: true
        });
    }

    /**
     * Get events for a date range
     */
    getEventsForDateRange(startDate, endDate, options = {}) {
        const {
            includeAllDay = true,
            includeTimed = true,
            applyFilters = true,
            sortBy = 'start'
        } = options;

        const events = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayEvents = this.getEventsForDate(currentDate, {
                includeAllDay,
                includeTimed,
                applyFilters,
                useCache: false // Don't cache for range queries
            });
            events.push(...dayEvents);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Sort events
        if (sortBy === 'start') {
            events.sort((a, b) => new Date(a.start) - new Date(b.start));
        } else if (sortBy === 'title') {
            events.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return events;
    }

    /**
     * Get events for a week
     */
    getEventsForWeek(startOfWeek, options = {}) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        return this.getEventsForDateRange(startOfWeek, endOfWeek, options);
    }

    /**
     * Get events for a month
     */
    getEventsForMonth(year, month, options = {}) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        
        return this.getEventsForDateRange(startOfMonth, endOfMonth, options);
    }

    /**
     * Add custom filter
     */
    addFilter(name, filterFunction) {
        this.filters.set(name, filterFunction);
        this.clearCache(); // Clear cache when filters change
    }

    /**
     * Remove custom filter
     */
    removeFilter(name) {
        this.filters.delete(name);
        this.clearCache();
    }

    /**
     * Apply custom filters to events
     */
    applyCustomFilters(events) {
        for (const filter of this.filters.values()) {
            events = events.filter(filter);
        }
        return events;
    }

    /**
     * Group events by date
     */
    groupEventsByDate(events) {
        const grouped = new Map();
        
        events.forEach(event => {
            const date = new Date(event.start);
            const dateKey = date.toDateString();
            
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey).push(event);
        });

        return grouped;
    }

    /**
     * Group events by category
     */
    groupEventsByCategory(events) {
        const grouped = new Map();
        
        events.forEach(event => {
            const category = this.categorizeEvent(event);
            
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category).push(event);
        });

        return grouped;
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

    /**
     * Get event statistics
     */
    getEventStats(events) {
        const stats = {
            total: events.length,
            allDay: 0,
            timed: 0,
            byCategory: new Map(),
            byCalendar: new Map()
        };

        events.forEach(event => {
            if (event.allDay) {
                stats.allDay++;
            } else {
                stats.timed++;
            }

            // Count by category
            const category = this.categorizeEvent(event);
            stats.byCategory.set(category, (stats.byCategory.get(category) || 0) + 1);

            // Count by calendar source
            const calendarSource = event.calendarSource || 'default';
            stats.byCalendar.set(calendarSource, (stats.byCalendar.get(calendarSource) || 0) + 1);
        });

        return stats;
    }

    /**
     * Find overlapping events
     */
    findOverlappingEvents(events) {
        const sorted = events.sort((a, b) => new Date(a.start) - new Date(b.start));
        const groups = [];
        let currentGroup = [];

        sorted.forEach(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end || event.start);

            // Check if event overlaps with current group
            let overlaps = false;
            for (const groupEvent of currentGroup) {
                const groupEventEnd = new Date(groupEvent.end || groupEvent.start);
                if (eventStart < groupEventEnd) {
                    overlaps = true;
                    break;
                }
            }

            if (overlaps) {
                currentGroup.push(event);
            } else {
                if (currentGroup.length > 0) {
                    groups.push([...currentGroup]);
                }
                currentGroup = [event];
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        this.cache.clearExpired();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getEventStats();
    }

    /**
     * Set cache timeout
     */
    setCacheTimeout(timeout) {
        this.cache.updateConfig({ timeout });
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.cache.destroy();
        this.filters.clear();
    }
}
