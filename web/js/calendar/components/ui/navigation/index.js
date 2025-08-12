/**
 * Navigation Components Index
 * 
 * This module provides centralized access to all navigation-related components
 * for the calendar system. These components handle date navigation, view switching,
 * and provide sophisticated navigation management for all calendar views.
 * 
 * @module NavigationComponents
 */

// Core navigation components
import { DateNavigation } from './DateNavigation.js';
import { CalendarHeader } from './calendar-header.js';

// Export core components
export { DateNavigation, CalendarHeader };

/**
 * Navigation Component Factory
 * Creates and configures navigation components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured navigation components
 */
export function createNavigationComponents(core, options = {}) {
    const {
        navigationConfig = {},
        headerConfig = {},
        componentConfig = {}
    } = options;

    // Create navigation components with optimized settings
    const dateNavigation = new DateNavigation({
        enableKeyboard: true,
        enableTouch: true,
        enableAnimations: true,
        ...navigationConfig
    });

    const calendarHeader = new CalendarHeader({
        showTitle: true,
        showNavigation: true,
        showViewSwitcher: true,
        ...headerConfig
    });

    return {
        dateNavigation,
        calendarHeader,
        
        // Convenience methods for common operations
        navigateToDate: (date) => {
            return dateNavigation.navigateToDate(date);
        },
        
        navigateToMonth: (year, month) => {
            return dateNavigation.navigateToMonth(year, month);
        },
        
        navigateToWeek: (startOfWeek) => {
            return dateNavigation.navigateToWeek(startOfWeek);
        },
        
        // Navigation history
        goBack: () => dateNavigation.goBack(),
        goForward: () => dateNavigation.goForward(),
        canGoBack: () => dateNavigation.canGoBack(),
        canGoForward: () => dateNavigation.canGoForward(),
        
        // Navigation state
        getCurrentDate: () => dateNavigation.getCurrentDate(),
        getCurrentView: () => dateNavigation.getCurrentView(),
        getNavigationHistory: () => dateNavigation.getHistory(),
        
        // Component management
        updateConfig: (newConfig) => {
            dateNavigation.updateConfig(newConfig);
            calendarHeader.updateConfig(newConfig);
        },
        
        clearHistory: () => dateNavigation.clearHistory(),
        
        getStats: () => ({
            navigation: dateNavigation.getStats(),
            header: calendarHeader.getStats()
        }),
        
        // Cleanup
        destroy: () => {
            dateNavigation.destroy();
            calendarHeader.destroy();
        }
    };
}

/**
 * Predefined navigation component configurations for different use cases
 */
export const NavigationConfigs = {
    /**
     * Configuration for desktop view
     */
    desktop: {
        enableKeyboard: true,
        enableTouch: false,
        enableAnimations: true,
        showTitle: true,
        showNavigation: true,
        showViewSwitcher: true
    },
    
    /**
     * Configuration for mobile view
     */
    mobile: {
        enableKeyboard: false,
        enableTouch: true,
        enableAnimations: true,
        showTitle: true,
        showNavigation: true,
        showViewSwitcher: false,
        touchTargetSize: 44
    },
    
    /**
     * Configuration for compact view
     */
    compact: {
        enableKeyboard: true,
        enableTouch: true,
        enableAnimations: false,
        showTitle: true,
        showNavigation: true,
        showViewSwitcher: false
    },
    
    /**
     * Configuration for accessibility
     */
    accessibility: {
        enableKeyboard: true,
        enableTouch: false,
        enableAnimations: false,
        showTitle: true,
        showNavigation: true,
        showViewSwitcher: true,
        enableScreenReader: true
    }
};

/**
 * Navigation component utilities
 */
export const NavigationUtils = {
    /**
     * Format date for navigation display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatNavigationDate: (date) => {
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long' 
        });
    },
    
    /**
     * Calculate optimal navigation configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal navigation configuration
     */
    calculateOptimalNavConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return NavigationConfigs.mobile;
        } else if (screenWidth < 1024) {
            return NavigationConfigs.compact;
        } else {
            return NavigationConfigs.desktop;
        }
    },
    
    /**
     * Get date navigation utilities
     */
    dateUtils: {
        getNextMonth: (currentDate) => {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() + 1);
            return date;
        },

        getPreviousMonth: (currentDate) => {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - 1);
            return date;
        },

        getNextWeek: (currentDate) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + 7);
            return date;
        },

        getPreviousWeek: (currentDate) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - 7);
            return date;
        },

        getStartOfWeek: (date) => {
            const startOfWeek = new Date(date);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day;
            startOfWeek.setDate(diff);
            return startOfWeek;
        },

        getEndOfWeek: (date) => {
            const endOfWeek = new Date(date);
            const day = endOfWeek.getDay();
            const diff = 6 - day;
            endOfWeek.setDate(endOfWeek.getDate() + diff);
            return endOfWeek;
        }
    },
    
    /**
     * Validate navigation configuration
     * @param {Object} config - Navigation configuration
     * @returns {Object} Validation result
     */
    validateNavConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.touchTargetSize && config.touchTargetSize < 44) {
            warnings.push('Touch target size may be too small for mobile devices');
        }
        
        if (config.enableKeyboard && !config.enableScreenReader) {
            warnings.push('Keyboard navigation enabled but screen reader support is disabled');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};

// Default export for convenience
export default {
    DateNavigation,
    CalendarHeader,
    createNavigationComponents,
    NavigationConfigs,
    NavigationUtils
};