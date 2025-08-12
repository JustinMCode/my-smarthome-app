/**
 * Calendar Navigation Components Index
 * 
 * This module provides centralized access to all navigation and header components
 * for the calendar system. These components handle date navigation, view switching,
 * calendar filtering, and provide sophisticated navigation management for all calendar views.
 * 
 * @module CalendarNavigationComponents
 */

// Core navigation components
import { DateNavigation } from './DateNavigation.js';
import { CalendarHeader } from './calendar-header.js';

export { DateNavigation, CalendarHeader };

/**
 * Calendar Navigation Manager Factory
 * Creates and configures navigation management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured navigation management components
 */
export function createNavigationManager(core, options = {}) {
    const {
        dateNavigationConfig = {},
        calendarHeaderConfig = {},
        managerConfig = {}
    } = options;

    // Create date navigation with optimized settings
    const dateNavigation = new DateNavigation(core);

    // Create calendar header with optimized settings
    const calendarHeader = new CalendarHeader(core);

    // Create navigation manager with optimized settings
    const navigationManager = new NavigationManager(core, {
        enableCaching: true,
        maxCacheSize: 100,
        enableHistory: true,
        maxHistorySize: 50,
        enableResponsive: true,
        updateDebounce: 100,
        ...managerConfig
    });

    return {
        dateNavigation,
        calendarHeader,
        navigationManager,
        
        // Convenience methods for common operations
        init: () => {
            dateNavigation.setupKeyboardListeners(true);
            calendarHeader.init();
            navigationManager.init();
        },
        
        navigate: (direction, viewType) => {
            return navigationManager.navigate(direction, viewType);
        },
        
        goToToday: () => {
            return navigationManager.goToToday();
        },
        
        switchView: (viewName) => {
            calendarHeader.switchView(viewName);
            navigationManager.updateNavigationForView(viewName);
        },
        
        updateTitle: () => {
            calendarHeader.updateTitle();
        },
        
        updateViewButtons: () => {
            calendarHeader.updateViewButtons();
        },
        
        // Navigation management
        getNavigationState: () => dateNavigation.getNavigationState(),
        createNavigationControls: (options) => dateNavigation.createNavigationControls(options),
        setupKeyboardListeners: (isActive) => dateNavigation.setupKeyboardListeners(isActive),
        
        // Navigation history
        goBack: () => navigationManager.goBack(),
        getHistory: () => navigationManager.getHistory(),
        clearHistory: () => navigationManager.clearHistory(),
        
        // Cleanup
        destroy: () => {
            dateNavigation.destroy();
            calendarHeader.destroy();
            navigationManager.destroy();
        }
    };
}

/**
 * Navigation Manager Class
 * Manages navigation operations, history, and lifecycle
 */
class NavigationManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enableCaching: true,
            maxCacheSize: 100,
            enableHistory: true,
            maxHistorySize: 50,
            enableResponsive: true,
            updateDebounce: 100,
            ...options
        };
        
        this.dateNavigation = new DateNavigation(core);
        this.calendarHeader = new CalendarHeader(core);
        this.navigationHistory = [];
        this.navigationCache = new Map();
        this.stats = {
            navigations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            historyEntries: 0
        };
        
        this.debounceTimer = null;
    }

    /**
     * Initialize the navigation manager
     */
    init() {
        this.dateNavigation.setupKeyboardListeners(true);
        this.calendarHeader.init();
        this.setupNavigationListeners();
        this.setupResponsiveHandling();
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigationListeners() {
        // Listen for navigation events
        this.core.state.on('dateChanged', (newDate) => {
            this.addToHistory(newDate);
            this.updateNavigationState();
        });
        
        // Listen for view changes
        this.core.state.on('viewChanged', (newView) => {
            this.updateNavigationForView(newView);
        });
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        if (!this.options.enableResponsive) return;
        
        window.addEventListener('resize', () => {
            this.debouncedUpdateNavigationLayout();
        });
    }

    /**
     * Navigate by direction
     * @param {number} direction - Navigation direction (-1 for previous, 1 for next)
     * @param {string} viewType - View type ('week' or 'month')
     * @returns {Date} New date after navigation
     */
    navigate(direction, viewType) {
        const newDate = this.dateNavigation.navigate(direction, viewType);
        this.addToHistory(newDate);
        this.updateNavigationState();
        this.stats.navigations++;
        return newDate;
    }

    /**
     * Go to today
     * @returns {Date} Today's date
     */
    goToToday() {
        const today = this.dateNavigation.goToToday();
        this.addToHistory(today);
        this.updateNavigationState();
        this.stats.navigations++;
        return today;
    }

    /**
     * Add date to navigation history
     * @param {Date} date - Date to add to history
     */
    addToHistory(date) {
        if (!this.options.enableHistory) return;
        
        this.navigationHistory.push({
            date: new Date(date),
            timestamp: Date.now(),
            viewType: this.core.getCurrentView()
        });
        
        // Limit history size
        if (this.navigationHistory.length > this.options.maxHistorySize) {
            this.navigationHistory.shift();
        }
        
        this.stats.historyEntries = this.navigationHistory.length;
    }

    /**
     * Go back in navigation history
     * @returns {Date|null} Previous date or null if no history
     */
    goBack() {
        if (this.navigationHistory.length > 1) {
            this.navigationHistory.pop(); // Remove current
            const previous = this.navigationHistory[this.navigationHistory.length - 1];
            this.core.setCurrentDate(previous.date);
            this.updateNavigationState();
            return previous.date;
        }
        return null;
    }

    /**
     * Get navigation history
     * @returns {Array} Navigation history
     */
    getHistory() {
        return [...this.navigationHistory];
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.navigationHistory = [];
        this.stats.historyEntries = 0;
    }

    /**
     * Update navigation state
     */
    updateNavigationState() {
        const state = this.dateNavigation.getNavigationState();
        this.core.state.trigger('navigationStateChanged', state);
    }

    /**
     * Update navigation for specific view
     * @param {string} viewType - View type
     */
    updateNavigationForView(viewType) {
        // Update navigation controls based on view type
        const navControls = this.dateNavigation.createNavigationControls({
            showToday: true,
            showPrevNext: true,
            showHome: viewType === 'month'
        });
        
        // Replace existing navigation controls
        const existingNav = document.querySelector('.calendar-nav');
        if (existingNav) {
            existingNav.replaceWith(navControls);
        }
    }

    /**
     * Get cached navigation state
     * @param {Date} date - Date for navigation state
     * @param {string} viewType - View type
     * @returns {Object} Navigation state
     */
    getCachedNavigationState(date, viewType) {
        if (!this.options.enableCaching) {
            return this.calculateNavigationState(date, viewType);
        }
        
        const cacheKey = this.generateCacheKey(date, viewType);
        
        if (this.navigationCache.has(cacheKey)) {
            const cached = this.navigationCache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                this.stats.cacheHits++;
                return cached.result;
            }
        }
        
        this.stats.cacheMisses++;
        
        const navigationState = this.calculateNavigationState(date, viewType);
        
        this.navigationCache.set(cacheKey, {
            result: navigationState,
            timestamp: Date.now()
        });
        
        // Cleanup if cache is too large
        if (this.navigationCache.size > this.options.maxCacheSize) {
            this.cleanupCache();
        }
        
        return navigationState;
    }

    /**
     * Calculate navigation state
     * @param {Date} date - Date for navigation state
     * @param {string} viewType - View type
     * @returns {Object} Navigation state
     */
    calculateNavigationState(date, viewType) {
        const today = new Date();
        const isCurrentPeriod = this.isCurrentPeriod(date, viewType);
        
        return {
            currentDate: date,
            today,
            isCurrentPeriod,
            canGoBack: true,
            canGoForward: true,
            navigationTitle: this.dateNavigation.formatNavigationTitle(date, viewType)
        };
    }

    /**
     * Check if date is in current period
     * @param {Date} date - Date to check
     * @param {string} viewType - View type
     * @returns {boolean} True if in current period
     */
    isCurrentPeriod(date, viewType) {
        const today = new Date();
        
        if (viewType === 'month') {
            return date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
        } else if (viewType === 'week') {
            const startOfWeek = this.getStartOfWeek(date);
            const todayStartOfWeek = this.getStartOfWeek(today);
            return startOfWeek.getTime() === todayStartOfWeek.getTime();
        }
        
        return false;
    }

    /**
     * Get start of week
     * @param {Date} date - Date to get start of week for
     * @returns {Date} Start of week date
     */
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    /**
     * Generate cache key
     * @param {Date} date - Date for cache key
     * @param {string} viewType - View type for cache key
     * @returns {string} Cache key
     */
    generateCacheKey(date, viewType) {
        const dateStr = date.toDateString();
        return `${viewType}_${dateStr}`;
    }

    /**
     * Check if cache is valid
     * @param {Object} cached - Cached data
     * @returns {boolean} True if cache is valid
     */
    isCacheValid(cached) {
        return Date.now() - cached.timestamp < 300000; // 5 minutes
    }

    /**
     * Cleanup cache
     */
    cleanupCache() {
        const entries = Array.from(this.navigationCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest entries
        const toRemove = Math.floor(this.navigationCache.size * 0.2); // Remove 20%
        for (let i = 0; i < toRemove; i++) {
            this.navigationCache.delete(entries[i][0]);
        }
    }

    /**
     * Debounced update navigation layout
     */
    debouncedUpdateNavigationLayout() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.updateNavigationLayout();
        }, this.options.updateDebounce);
    }

    /**
     * Update navigation layout for responsive design
     */
    updateNavigationLayout() {
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile: Compact navigation
            this.setMobileNavigationLayout();
        } else if (width < 1024) {
            // Tablet: Standard navigation
            this.setTabletNavigationLayout();
        } else {
            // Desktop: Full navigation
            this.setDesktopNavigationLayout();
        }
    }

    /**
     * Set mobile navigation layout
     */
    setMobileNavigationLayout() {
        // Hide some navigation elements on mobile
        const homeBtn = document.querySelector('.nav-home');
        if (homeBtn) {
            homeBtn.style.display = 'none';
        }
        
        // Use compact navigation controls
        const navControls = this.dateNavigation.createNavigationControls({
            showToday: true,
            showPrevNext: true,
            showHome: false,
            className: 'calendar-nav mobile'
        });
    }

    /**
     * Set tablet navigation layout
     */
    setTabletNavigationLayout() {
        // Show all navigation elements
        const homeBtn = document.querySelector('.nav-home');
        if (homeBtn) {
            homeBtn.style.display = 'block';
        }
        
        // Use standard navigation controls
        const navControls = this.dateNavigation.createNavigationControls({
            showToday: true,
            showPrevNext: true,
            showHome: true,
            className: 'calendar-nav tablet'
        });
    }

    /**
     * Set desktop navigation layout
     */
    setDesktopNavigationLayout() {
        // Show all navigation elements
        const homeBtn = document.querySelector('.nav-home');
        if (homeBtn) {
            homeBtn.style.display = 'block';
        }
        
        // Use full navigation controls
        const navControls = this.dateNavigation.createNavigationControls({
            showToday: true,
            showPrevNext: true,
            showHome: true,
            className: 'calendar-nav desktop'
        });
    }

    /**
     * Get statistics
     * @returns {Object} Navigation manager statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.navigationCache.size,
            cacheHitRate: this.stats.navigations > 0 ? 
                (this.stats.cacheHits / this.stats.navigations * 100).toFixed(2) + '%' : '0%'
        };
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.dateNavigation.destroy();
        this.calendarHeader.destroy();
        this.clearHistory();
        this.navigationCache.clear();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}

/**
 * Predefined navigation configurations for different use cases
 */
export const NavigationConfigs = {
    /**
     * Configuration for month view navigation
     */
    monthView: {
        enableKeyboardShortcuts: true,
        enableVisualFeedback: true,
        enableHistory: true,
        maxHistorySize: 50,
        enableResponsive: true,
        updateDebounce: 100
    },
    
    /**
     * Configuration for week view navigation
     */
    weekView: {
        enableKeyboardShortcuts: true,
        enableVisualFeedback: true,
        enableHistory: true,
        maxHistorySize: 50,
        enableResponsive: true,
        updateDebounce: 100
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        enableKeyboardShortcuts: false,
        enableVisualFeedback: true,
        enableHistory: false,
        maxHistorySize: 10,
        enableResponsive: true,
        updateDebounce: 200
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        enableKeyboardShortcuts: true,
        enableVisualFeedback: true,
        enableHistory: true,
        maxHistorySize: 100,
        enableResponsive: true,
        updateDebounce: 50
    }
};

/**
 * Predefined navigation strategies for different scenarios
 */
export const NavigationStrategies = {
    /**
     * Strategy for high navigation frequency
     */
    highFrequency: {
        enableCaching: true,
        maxCacheSize: 200,
        enableHistory: true,
        maxHistorySize: 100,
        enableResponsive: true,
        updateDebounce: 50
    },
    
    /**
     * Strategy for low navigation frequency
     */
    lowFrequency: {
        enableCaching: false,
        maxCacheSize: 50,
        enableHistory: false,
        maxHistorySize: 10,
        enableResponsive: true,
        updateDebounce: 200
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        enableCaching: true,
        maxCacheSize: 100,
        enableHistory: true,
        maxHistorySize: 50,
        enableResponsive: true,
        updateDebounce: 100,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        enableCaching: true,
        maxCacheSize: 50,
        enableHistory: false,
        maxHistorySize: 10,
        enableResponsive: true,
        updateDebounce: 150
    }
};

/**
 * Utility functions for navigation management
 */
export const NavigationUtils = {
    /**
     * Calculate optimal navigation configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal navigation configuration
     */
    calculateOptimalNavigationConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return {
                enableKeyboardShortcuts: false,
                enableVisualFeedback: true,
                enableHistory: false,
                maxHistorySize: 10,
                updateDebounce: 200
            };
        } else if (screenWidth < 1024) {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 50,
                updateDebounce: 100
            };
        } else if (screenWidth < 1440) {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 100,
                updateDebounce: 50
            };
        } else {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 100,
                updateDebounce: 50
            };
        }
    },
    
    /**
     * Generate navigation cache key
     * @param {Date} date - Date for cache key
     * @param {string} viewType - View type for cache key
     * @param {Object} options - Navigation options
     * @returns {string} Cache key
     */
    generateNavigationKey: (date, viewType, options = {}) => {
        const dateStr = date.toDateString();
        const optionsHash = NavigationUtils.hashString(JSON.stringify(options));
        return `nav_${viewType}_${dateStr}_${optionsHash}`;
    },
    
    /**
     * Simple string hash function
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    hashString: (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    },
    
    /**
     * Check if navigation needs update
     * @param {Object} cachedNavigation - Cached navigation data
     * @param {Object} currentState - Current navigation state
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedNavigation, currentState) => {
        if (!cachedNavigation) return true;
        
        const age = Date.now() - cachedNavigation.timestamp;
        const maxAge = 300000; // 5 minutes default
        
        return age > maxAge || 
               JSON.stringify(cachedNavigation.state) !== JSON.stringify(currentState);
    },
    
    /**
     * Calculate responsive navigation configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive navigation configuration
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        const aspectRatio = containerWidth / containerHeight;
        
        if (containerWidth < 768) {
            return {
                enableKeyboardShortcuts: false,
                enableVisualFeedback: true,
                enableHistory: false,
                maxHistorySize: 10,
                updateDebounce: 200
            };
        } else if (containerWidth < 1024) {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 50,
                updateDebounce: 100
            };
        } else if (containerWidth < 1440) {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 100,
                updateDebounce: 50
            };
        } else {
            return {
                enableKeyboardShortcuts: true,
                enableVisualFeedback: true,
                enableHistory: true,
                maxHistorySize: 100,
                updateDebounce: 50
            };
        }
    },
    
    /**
     * Validate navigation configuration
     * @param {Object} config - Navigation configuration
     * @returns {Object} Validation result
     */
    validateNavigationConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxHistorySize && config.maxHistorySize > 1000) {
            warnings.push('Large history size may impact memory usage');
        }
        
        if (config.maxCacheSize && config.maxCacheSize > 500) {
            warnings.push('Large cache size may impact memory usage');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },
    
    /**
     * Format navigation title from template
     * @param {string} template - Title template
     * @param {Object} data - Data to inject
     * @returns {string} Formatted title
     */
    formatNavigationTitle: (template, data) => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    },
    
    /**
     * Escape navigation content
     * @param {string} content - Content to escape
     * @returns {string} Escaped content
     */
    escapeNavigationContent: (content) => {
        const div = document.createElement('div');
        div.textContent = content;
        return div.innerHTML;
    }
};

/**
 * Performance monitoring utilities for navigation
 */
export const NavigationPerformanceUtils = {
    /**
     * Measure navigation performance
     * @param {Function} navigationFunction - Navigation function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureNavigationPerformance: (navigationFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = navigationFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            navigationTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for navigation operations
     * @returns {Object} Performance monitor
     */
    createNavigationPerformanceMonitor: () => {
        const metrics = {
            totalNavigations: 0,
            totalNavigationTime: 0,
            averageNavigationTime: 0,
            slowestNavigation: 0,
            fastestNavigation: Infinity,
            memoryUsage: []
        };
        
        return {
            measureNavigation: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const navigationTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalNavigations++;
                metrics.totalNavigationTime += navigationTime;
                metrics.averageNavigationTime = metrics.totalNavigationTime / metrics.totalNavigations;
                metrics.slowestNavigation = Math.max(metrics.slowestNavigation, navigationTime);
                metrics.fastestNavigation = Math.min(metrics.fastestNavigation, navigationTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    navigationTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalNavigations: 0,
                    totalNavigationTime: 0,
                    averageNavigationTime: 0,
                    slowestNavigation: 0,
                    fastestNavigation: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    DateNavigation,
    CalendarHeader,
    createNavigationManager,
    NavigationConfigs,
    NavigationStrategies,
    NavigationUtils,
    NavigationPerformanceUtils
};
