/**
 * Event Manager Factory
 * 
 * Specialized factory for creating event management components.
 * Extends the base ManagerFactory with event-specific functionality.
 * 
 * @module EventManagerFactory
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ManagerFactory } from '../../../utils/factory/ManagerFactory.js';

/**
 * Event Manager Factory Class
 * 
 * Creates and configures event management components with optimized settings.
 * Provides standardized event management patterns and rendering strategies.
 */
export class EventManagerFactory extends ManagerFactory {
    /**
     * Create a new event manager factory instance
     * @param {Object} options - Factory configuration options
     */
    constructor(options = {}) {
        super('event', {
            enableValidation: true,
            enablePerformanceMonitoring: true,
            enableMemoryManagement: true,
            ...options
        });
    }

    /**
     * Create the actual event manager instance
     * @param {Object} core - Core instance
     * @param {Object} config - Validated configuration
     * @returns {Object} Event manager instance
     * @protected
     */
    async _createManagerInstance(core, config) {
        const { rendererConfig = {}, pillConfig = {}, managerConfig = {} } = config;

        // Create event renderer with optimized settings
        const eventRenderer = await this._createEventRenderer(rendererConfig);
        console.log('EventRenderer created:', !!eventRenderer, 'createMonthEvent available:', !!eventRenderer?.createMonthEvent);

        // Create event manager with optimized settings
        const eventManager = this._createEventManager(core, managerConfig);

        return {
            eventRenderer,
            eventManager,
            
            // Convenience methods for common operations
            createEventPill: (event, options) => {
                return eventManager.createEventPill(event, {
                    showTime: true,
                    showLocation: false,
                    compact: false,
                    ...pillConfig,
                    ...options
                });
            },
            
            createMonthEvent: (event, options) => {
                console.log('createMonthEvent called with:', event, options);
                console.log('eventRenderer available:', !!eventRenderer);
                return eventRenderer.createEventPill(event, {
                    showTime: true,
                    showBullet: true,
                    maxWidth: '100%',
                    ...rendererConfig,
                    ...options
                });
            },
            
            createWeekEvent: (event, options) => {
                return eventRenderer.createWeekEvent(event, {
                    showLocation: true,
                    showTime: true,
                    ...rendererConfig,
                    ...options
                });
            },
            
            createAllDayEvent: (event, options) => {
                return eventRenderer.createAllDayEvent(event, {
                    showTime: false,
                    ...rendererConfig,
                    ...options
                });
            },
            
            // Event management
            updateEvent: (event, newData) => eventManager.updateEvent(event, newData),
            clearCache: () => eventManager.clearCache(),
            getEventStats: () => eventManager.getStats(),
            
            // Cleanup
            destroy: () => eventManager.destroy()
        };
    }

    /**
     * Get default configuration for event manager
     * @returns {Object} Default configuration
     * @protected
     */
    _getDefaultConfig() {
        return {
            rendererConfig: {
                showTime: true,
                showLocation: false,
                compact: false,
                maxTitleLength: 30
            },
            pillConfig: {
                showTime: true,
                showLocation: false,
                compact: false,
                enableTouch: true
            },
            managerConfig: {
                enablePooling: true,
                maxPoolSize: 200,
                enableCaching: true
            }
        };
    }

    /**
     * Format time for event display
     * @param {Date|string} start - Start time
     * @param {Date|string} end - End time
     * @returns {string} Formatted time string
     * @private
     */
    _formatTime(start, end) {
        if (!start) return null;
        
        const startTime = new Date(start).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (!end) return startTime;
        
        const endTime = new Date(end).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `${startTime} - ${endTime}`;
    }

    /**
     * Create event renderer instance
     * @param {Object} rendererConfig - Renderer configuration
     * @returns {Object} Event renderer instance
     * @private
     */
    async _createEventRenderer(rendererConfig) {
        // Import EventRenderer dynamically to avoid circular dependencies
        let EventRenderer;
        try {
            console.log('Attempting to import EventRenderer...');
            const module = await import('../../components/ui/events/EventRenderer.js');
            EventRenderer = module.EventRenderer;
            console.log('EventRenderer imported successfully:', !!EventRenderer);
        } catch (error) {
            console.error('Failed to import EventRenderer:', error);
            // Fallback to basic DOM creation
            return this._createBasicEventRenderer(rendererConfig);
        }
        
        const renderer = new EventRenderer();
        
        return {
            createEventPill: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                return renderer.createEventPill(event, config);
            },

            createWeekEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                return renderer.createWeekEvent(event, config);
            },

            createAllDayEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                return renderer.createAllDayEvent(event, config);
            },

            createMonthEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                return renderer.createEventPill(event, config);
            }
        };
    }

    /**
     * Create basic event renderer as fallback
     * @param {Object} rendererConfig - Renderer configuration
     * @returns {Object} Basic event renderer instance
     * @private
     */
    _createBasicEventRenderer(rendererConfig) {
        const formatTime = this._formatTime.bind(this);
        
        return {
            createEventPill: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                
                const eventEl = document.createElement('div');
                eventEl.className = config.className || 'event-pill';
                eventEl.innerHTML = `
                    <div class="event-title">${event.title || 'Untitled'}</div>
                    ${config.showTime && event.start ? `<div class="event-time">${formatTime(event.start, event.end)}</div>` : ''}
                `;
                
                return eventEl;
            },

            createWeekEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                
                const eventEl = document.createElement('div');
                eventEl.className = 'week-event';
                eventEl.innerHTML = `
                    <div class="event-title">${event.title || 'Untitled'}</div>
                    ${config.showTime && event.start ? `<div class="event-time">${formatTime(event.start, event.end)}</div>` : ''}
                `;
                
                return eventEl;
            },

            createAllDayEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                
                const eventEl = document.createElement('div');
                eventEl.className = 'allday-event';
                eventEl.innerHTML = `
                    <div class="event-title">${event.title || 'Untitled'}</div>
                `;
                
                return eventEl;
            },

            createMonthEvent: (event, options = {}) => {
                const config = { ...rendererConfig, ...options };
                return this.createEventPill(event, config);
            }
        };
    }

    /**
     * Create event manager instance
     * @param {Object} core - Core instance
     * @param {Object} managerConfig - Manager configuration
     * @returns {Object} Event manager instance
     * @private
     */
    _createEventManager(core, managerConfig) {
        const eventPills = new Map();
        const eventCache = new Map();
        const eventPool = [];
        const stats = {
            created: 0,
            cached: 0,
            reused: 0,
            destroyed: 0
        };

        return {
            createEventPill: (event, options = {}) => {
                const eventId = event.id || `event-${Date.now()}`;
                
                // Check cache first
                if (managerConfig.enableCaching && eventCache.has(eventId)) {
                    const cached = eventCache.get(eventId);
                    if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
                        stats.cached++;
                        return { ...cached.pill, ...options };
                    }
                    eventCache.delete(eventId);
                }

                // Check pool for reusable pill
                if (managerConfig.enablePooling && eventPool.length > 0) {
                    const pooledPill = eventPool.pop();
                    stats.reused++;
                    const updatedPill = { ...pooledPill, event, ...options };
                    eventPills.set(eventId, updatedPill);
                    return updatedPill;
                }

                // Create new event pill
                const newPill = {
                    id: eventId,
                    event,
                    showTime: true,
                    showLocation: false,
                    compact: false,
                    enableTouch: true,
                    ...options
                };

                stats.created++;
                eventPills.set(eventId, newPill);

                // Cache the pill
                if (managerConfig.enableCaching) {
                    eventCache.set(eventId, {
                        pill: newPill,
                        timestamp: Date.now()
                    });
                }

                return newPill;
            },

            updateEvent: (event, newData) => {
                const eventId = event.id || `event-${Date.now()}`;
                const existingPill = eventPills.get(eventId);
                
                if (existingPill) {
                    const updatedPill = { ...existingPill, ...newData };
                    eventPills.set(eventId, updatedPill);
                    
                    // Update cache
                    if (managerConfig.enableCaching && eventCache.has(eventId)) {
                        eventCache.set(eventId, {
                            pill: updatedPill,
                            timestamp: Date.now()
                        });
                    }
                    
                    return updatedPill;
                }
                
                return null;
            },

            clearCache: () => {
                eventCache.clear();
            },

            getStats: () => ({
                ...stats,
                totalPills: eventPills.size,
                poolSize: eventPool.length,
                cacheSize: eventCache.size
            }),

            destroy: () => {
                eventPills.clear();
                eventCache.clear();
                eventPool.length = 0;
            }
        };
    }

    /**
     * Create event manager factory instance with static method
     * @param {Object} options - Factory options
     * @returns {EventManagerFactory} Factory instance
     */
    static create(options = {}) {
        return new EventManagerFactory(options);
    }
}

// Export only the named export
