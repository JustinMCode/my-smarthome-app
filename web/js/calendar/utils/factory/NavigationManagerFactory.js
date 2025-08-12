/**
 * Navigation Manager Factory
 * 
 * Specialized factory for creating navigation management components.
 * Extends the base ManagerFactory with navigation-specific functionality.
 * 
 * @module NavigationManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Navigation Manager Factory Class
 * 
 * Creates and configures navigation management components with optimized settings.
 * Provides standardized navigation patterns and history management.
 */
export class NavigationManagerFactory extends ManagerFactory {
    /**
     * Create a new navigation manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('navigation', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual navigation manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Navigation manager instance
     * @protected
     */
    _createManagerInstance(core, config) {
        const { navigationConfig = {}, managerConfig = {} } = config;

        // Create navigation components with optimized settings
        const navigationManager = this._createNavigationManager(core, navigationConfig);
        const dateNavigation = this._createDateNavigation(core, navigationConfig);

        return {
            navigationManager,
            dateNavigation,
            
            // Convenience methods for common operations
            navigateToDate: (date) => navigationManager.navigateToDate(date),
            navigateToMonth: (year, month) => navigationManager.navigateToMonth(year, month),
            navigateToWeek: (startOfWeek) => navigationManager.navigateToWeek(startOfWeek),
            
            // Navigation history
            goBack: () => navigationManager.goBack(),
            goForward: () => navigationManager.goForward(),
            canGoBack: () => navigationManager.canGoBack(),
            canGoForward: () => navigationManager.canGoForward(),
            
            // Navigation state
            getCurrentDate: () => navigationManager.getCurrentDate(),
            getCurrentView: () => navigationManager.getCurrentView(),
            getNavigationHistory: () => navigationManager.getHistory(),
            
            // Navigation management
            updateNavigation: (newConfig) => navigationManager.updateConfig(newConfig),
            clearHistory: () => navigationManager.clearHistory(),
            getNavigationStats: () => navigationManager.getStats(),
            
            // Cleanup
            destroy: () => {
                navigationManager.destroy();
                dateNavigation.destroy();
            }
        };
    }

    /**
     * Get default configuration for navigation manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            navigationConfig: {
                enableKeyboard: true,
                enableTouch: true,
                enableAnimations: true,
                enableHistory: true
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 50,
                enableCaching: true
            }
        };
    }

    /**
     * Create navigation manager instance
     * @param {Object} core - Core instance
     * @param {Object} navigationConfig - Navigation configuration
     * @returns {Object} Navigation manager instance
     * @private
     */
    _createNavigationManager(core, navigationConfig) {
        const history = [];
        let currentIndex = -1;
        const config = { ...navigationConfig };
        const stats = {
            navigations: 0,
            back: 0,
            forward: 0,
            historySize: 0
        };

        return {
            navigateToDate: (date) => {
                const navigation = {
                    type: 'date',
                    date: new Date(date),
                    timestamp: Date.now()
                };

                this._addToHistory(navigation);
                stats.navigations++;
                
                return navigation;
            },

            navigateToMonth: (year, month) => {
                const navigation = {
                    type: 'month',
                    year,
                    month,
                    date: new Date(year, month, 1),
                    timestamp: Date.now()
                };

                this._addToHistory(navigation);
                stats.navigations++;
                
                return navigation;
            },

            navigateToWeek: (startOfWeek) => {
                const navigation = {
                    type: 'week',
                    startOfWeek: new Date(startOfWeek),
                    date: new Date(startOfWeek),
                    timestamp: Date.now()
                };

                this._addToHistory(navigation);
                stats.navigations++;
                
                return navigation;
            },

            goBack: () => {
                if (this.canGoBack()) {
                    currentIndex--;
                    stats.back++;
                    return history[currentIndex];
                }
                return null;
            },

            goForward: () => {
                if (this.canGoForward()) {
                    currentIndex++;
                    stats.forward++;
                    return history[currentIndex];
                }
                return null;
            },

            canGoBack: () => {
                return currentIndex > 0;
            },

            canGoForward: () => {
                return currentIndex < history.length - 1;
            },

            getCurrentDate: () => {
                if (currentIndex >= 0 && currentIndex < history.length) {
                    return history[currentIndex].date;
                }
                return new Date();
            },

            getCurrentView: () => {
                if (currentIndex >= 0 && currentIndex < history.length) {
                    return history[currentIndex].type;
                }
                return 'month';
            },

            getHistory: () => {
                return [...history];
            },

            updateConfig: (newConfig) => {
                Object.assign(config, newConfig);
            },

            clearHistory: () => {
                const historySize = history.length;
                history.length = 0;
                currentIndex = -1;
                stats.historySize = 0;
                return historySize;
            },

            getStats: () => ({
                ...stats,
                historySize: history.length,
                currentIndex,
                config
            }),

            destroy: () => {
                history.length = 0;
                currentIndex = -1;
            },

            _addToHistory: (navigation) => {
                // Remove forward history when navigating to new location
                if (currentIndex < history.length - 1) {
                    history.splice(currentIndex + 1);
                }

                // Add new navigation
                history.push(navigation);
                currentIndex = history.length - 1;

                // Limit history size
                if (config.enableHistory && history.length > 50) {
                    history.shift();
                    currentIndex--;
                }

                stats.historySize = history.length;
            }
        };
    }

    /**
     * Create date navigation instance
     * @param {Object} core - Core instance
     * @param {Object} navigationConfig - Navigation configuration
     * @returns {Object} Date navigation instance
     * @private
     */
    _createDateNavigation(core, navigationConfig) {
        return {
            config: { ...navigationConfig },
            
            // Date navigation utilities
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

            getNextDay: (currentDate) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + 1);
                return date;
            },

            getPreviousDay: (currentDate) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - 1);
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
            },

            getStartOfMonth: (date) => {
                return new Date(date.getFullYear(), date.getMonth(), 1);
            },

            getEndOfMonth: (date) => {
                return new Date(date.getFullYear(), date.getMonth() + 1, 0);
            },

            // Keyboard navigation
            handleKeyboardNavigation: (event, currentDate) => {
                if (!this.config.enableKeyboard) return null;

                switch (event.key) {
                    case 'ArrowLeft':
                        return this.getPreviousDay(currentDate);
                    case 'ArrowRight':
                        return this.getNextDay(currentDate);
                    case 'ArrowUp':
                        return this.getPreviousWeek(currentDate);
                    case 'ArrowDown':
                        return this.getNextWeek(currentDate);
                    case 'PageUp':
                        return this.getPreviousMonth(currentDate);
                    case 'PageDown':
                        return this.getNextMonth(currentDate);
                    case 'Home':
                        return this.getStartOfMonth(currentDate);
                    case 'End':
                        return this.getEndOfMonth(currentDate);
                    default:
                        return null;
                }
            },

            destroy: () => {
                // Cleanup if needed
            }
        };
    }

    /**
     * Create navigation manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {NavigationManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new NavigationManagerFactory(options);
    }
}

// Export only the named export
