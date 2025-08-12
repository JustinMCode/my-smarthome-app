/**
 * Calendar Manager
 * Manages calendar operations and persistence
 * 
 * This module provides centralized calendar management functionality,
 * including CRUD operations, persistence, and configuration management.
 * 
 * @module CalendarManager
 */

import { CALENDARS, COLOR_PALETTE, DEFAULTS } from '../core/calendar-config.js';

/**
 * Calendar Manager Class
 * Handles calendar operations and persistence
 */
export class CalendarManager {
    /**
     * Create a new CalendarManager instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.config = { 
            calendars: { ...CALENDARS },
            colorPalette: [...COLOR_PALETTE],
            defaults: { ...DEFAULTS },
            ...options
        };
        this.loadFromStorage();
    }

    /**
     * Get all calendars
     * @returns {Array} Array of all calendars
     */
    getAllCalendars() {
        return Object.values(this.config.calendars);
    }

    /**
     * Get enabled calendars
     * @returns {Array} Array of enabled calendars
     */
    getEnabledCalendars() {
        return Object.values(this.config.calendars).filter(cal => cal.enabled);
    }

    /**
     * Get visible calendars
     * @returns {Array} Array of visible calendars
     */
    getVisibleCalendars() {
        return Object.values(this.config.calendars).filter(cal => cal.visible);
    }

    /**
     * Get calendar by ID
     * @param {string} id - Calendar ID
     * @returns {Object|null} Calendar object or null if not found
     */
    getCalendar(id) {
        return this.config.calendars[id] || null;
    }

    /**
     * Add new calendar
     * @param {string} name - Calendar name
     * @param {string} color - Calendar color (optional)
     * @param {string} description - Calendar description (optional)
     * @returns {Object|null} New calendar object or null if failed
     */
    addCalendar(name, color = null, description = '') {
        const id = this.generateCalendarId();
        const selectedColor = color || this.getNextAvailableColor();
        
        const newCalendar = {
            id,
            name,
            color: selectedColor,
            gradient: `linear-gradient(135deg, ${selectedColor} 0%, ${this.darkenColor(selectedColor)} 100%)`,
            description,
            enabled: true,
            visible: true,
            order: this.getNextOrder()
        };

        this.config.calendars[id] = newCalendar;
        this.saveToStorage();
        
        return newCalendar;
    }

    /**
     * Update calendar
     * @param {string} id - Calendar ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated calendar object or null if not found
     */
    updateCalendar(id, updates) {
        if (this.config.calendars[id]) {
            this.config.calendars[id] = { ...this.config.calendars[id], ...updates };
            
            // Update gradient if color changed
            if (updates.color) {
                this.config.calendars[id].gradient = `linear-gradient(135deg, ${updates.color} 0%, ${this.darkenColor(updates.color)} 100%)`;
            }
            
            this.saveToStorage();
            return this.config.calendars[id];
        }
        return null;
    }

    /**
     * Delete calendar
     * @param {string} id - Calendar ID
     * @returns {boolean} True if deleted successfully
     */
    deleteCalendar(id) {
        if (this.config.calendars[id]) {
            delete this.config.calendars[id];
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Toggle calendar visibility
     * @param {string} id - Calendar ID
     * @returns {boolean} New visibility state
     */
    toggleCalendarVisibility(id) {
        const calendar = this.config.calendars[id];
        if (calendar) {
            calendar.visible = !calendar.visible;
            this.saveToStorage();
            return calendar.visible;
        }
        return false;
    }

    /**
     * Get calendar color (solid or gradient)
     * @param {string} id - Calendar ID
     * @param {boolean} useGradient - Whether to return gradient
     * @returns {string} Calendar color or gradient
     */
    getCalendarColor(id, useGradient = false) {
        const calendar = this.config.calendars[id];
        if (calendar) {
            return useGradient ? calendar.gradient : calendar.color;
        }
        return this.config.calendars[this.config.defaults.defaultCalendar]?.color || '#3B82F6';
    }

    /**
     * Get calendar name
     * @param {string} id - Calendar ID
     * @returns {string} Calendar name
     */
    getCalendarName(id) {
        const calendar = this.config.calendars[id];
        return calendar ? calendar.name : 'Unknown Calendar';
    }

    /**
     * Generate unique calendar ID
     * @returns {string} Unique calendar ID
     */
    generateCalendarId() {
        const existingIds = Object.keys(this.config.calendars);
        let counter = 0;
        let newId;
        
        do {
            newId = `calendar-${counter}`;
            counter++;
        } while (existingIds.includes(newId));
        
        return newId;
    }

    /**
     * Get next available color from palette
     * @returns {string} Available color
     */
    getNextAvailableColor() {
        const usedColors = Object.values(this.config.calendars).map(cal => cal.color);
        const availableColor = this.config.colorPalette.find(color => !usedColors.includes(color));
        return availableColor || this.config.colorPalette[0];
    }

    /**
     * Get next order number
     * @returns {number} Next order number
     */
    getNextOrder() {
        const orders = Object.values(this.config.calendars).map(cal => cal.order);
        return orders.length > 0 ? Math.max(...orders) + 1 : 1;
    }

    /**
     * Darken color for gradient
     * @param {string} hex - Hex color
     * @returns {string} Darkened hex color
     */
    darkenColor(hex) {
        // Simple color darkening - you can implement more sophisticated color manipulation
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * 30);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * Save configuration to localStorage
     */
    saveToStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('calendarConfig', JSON.stringify(this.config));
            }
        } catch (error) {
            console.error('Failed to save calendar configuration:', error);
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadFromStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('calendarConfig');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Merge with defaults to ensure all required properties exist
                    this.config = {
                        calendars: { ...CALENDARS, ...parsed.calendars },
                        colorPalette: [...COLOR_PALETTE],
                        defaults: { ...DEFAULTS, ...parsed.defaults },
                        ...parsed
                    };
                }
            }
        } catch (error) {
            console.error('Failed to load calendar configuration:', error);
        }
    }

    /**
     * Reset to default configuration
     */
    resetToDefaults() {
        this.config = {
            calendars: { ...CALENDARS },
            colorPalette: [...COLOR_PALETTE],
            defaults: { ...DEFAULTS }
        };
        this.saveToStorage();
    }

    /**
     * Export configuration
     * @returns {string} JSON string of configuration
     */
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Import configuration
     * @param {string} configString - JSON string of configuration
     * @returns {boolean} True if imported successfully
     */
    importConfig(configString) {
        try {
            const imported = JSON.parse(configString);
            this.config = {
                calendars: { ...CALENDARS, ...imported.calendars },
                colorPalette: [...COLOR_PALETTE],
                defaults: { ...DEFAULTS, ...imported.defaults },
                ...imported
            };
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Failed to import calendar configuration:', error);
            return false;
        }
    }

    /**
     * Get configuration object
     * @returns {Object} Configuration object
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {Object} updates - Configuration updates
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.saveToStorage();
    }
}

// Create global instance for backward compatibility
export const calendarManager = new CalendarManager();

// Default export for backward compatibility
export default CalendarManager;
