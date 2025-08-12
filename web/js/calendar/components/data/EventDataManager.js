/**
 * Event Data Manager Component
 * Centralized event data handling and filtering for calendar views
 */

export class EventDataManager {
    constructor(core) {
        this.core = core;
        this.filters = new Map();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
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

        const cacheKey = this.getCacheKey(date, options);
        
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.events;
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
            this.cache.set(cacheKey, {
                events,
                timestamp: Date.now()
            });
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
     */
    categorizeEvent(event) {
        const title = (event.title || event.summary || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const text = `${title} ${description}`;
        
        if (text.includes('work') || text.includes('meeting') || text.includes('office') || text.includes('team')) {
            return 'work';
        } else if (text.includes('family') || text.includes('kids') || text.includes('child') || text.includes('home')) {
            return 'family';
        } else if (text.includes('health') || text.includes('doctor') || text.includes('appointment') || text.includes('medical')) {
            return 'health';
        } else if (text.includes('party') || text.includes('social') || text.includes('dinner') || text.includes('celebration')) {
            return 'social';
        } else if (text.includes('personal') || text.includes('private') || text.includes('me time')) {
            return 'personal';
        }
        
        return 'other';
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
     * Get cache key for date and options
     */
    getCacheKey(date, options) {
        const dateStr = date.toDateString();
        const optionsStr = JSON.stringify(options);
        return `${dateStr}-${optionsStr}`;
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
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        this.clearExpiredCache();
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }

    /**
     * Set cache timeout
     */
    setCacheTimeout(timeout) {
        this.cacheTimeout = timeout;
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.clearCache();
        this.filters.clear();
    }
}
