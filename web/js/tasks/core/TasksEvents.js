/**
 * Tasks Event System
 * Custom event system for component communication
 * Provides type-safe event handling with data validation
 */

import { DEBUG_PREFIXES, EVENTS } from '../utils/TasksConstants.js';
import { debug } from '../../constants/config.js';

/**
 * TasksEvents - Custom event system
 * Manages event subscription, emission, and validation
 */
export class TasksEvents {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.isDestroyed = false;
        
        debug(DEBUG_PREFIXES.EVENTS, 'Event system initialized');
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Event handler function
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback, options = {}) {
        if (this.isDestroyed) {
            debug(DEBUG_PREFIXES.EVENTS, 'Cannot subscribe to destroyed event system');
            return () => {};
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Event callback must be a function');
        }
        
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        
        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null,
            id: this.generateListenerId()
        };
        
        this.listeners.get(eventName).add(listener);
        
        debug(DEBUG_PREFIXES.EVENTS, `Subscribed to event: ${eventName}`, { 
            once: listener.once, 
            priority: listener.priority 
        });
        
        // Return unsubscribe function
        return () => this.off(eventName, listener);
    }
    
    /**
     * Subscribe to an event only once
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Event handler function
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Object|Function} listenerOrCallback - Listener object or callback function
     */
    off(eventName, listenerOrCallback) {
        if (this.isDestroyed) return;
        
        const listeners = this.listeners.get(eventName);
        if (!listeners) return;
        
        if (typeof listenerOrCallback === 'function') {
            // Remove by callback function
            for (const listener of listeners) {
                if (listener.callback === listenerOrCallback) {
                    listeners.delete(listener);
                    break;
                }
            }
        } else {
            // Remove specific listener object
            listeners.delete(listenerOrCallback);
        }
        
        if (listeners.size === 0) {
            this.listeners.delete(eventName);
        }
        
        debug(DEBUG_PREFIXES.EVENTS, `Unsubscribed from event: ${eventName}`);
    }
    
    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Name of the event
     * @param {*} data - Event data
     * @param {Object} options - Emission options
     */
    emit(eventName, data = null, options = {}) {
        if (this.isDestroyed) return false;
        
        const listeners = this.listeners.get(eventName);
        if (!listeners || listeners.size === 0) {
            debug(DEBUG_PREFIXES.EVENTS, `No listeners for event: ${eventName}`);
            return false;
        }
        
        // Record event in history
        this.recordEvent(eventName, data);
        
        // Sort listeners by priority (higher priority first)
        const sortedListeners = Array.from(listeners).sort((a, b) => b.priority - a.priority);
        
        debug(DEBUG_PREFIXES.EVENTS, `Emitting event: ${eventName}`, { 
            data, 
            listeners: sortedListeners.length 
        });
        
        let eventHandled = false;
        const toRemove = [];
        
        for (const listener of sortedListeners) {
            try {
                // Call the listener with proper context
                const result = listener.context 
                    ? listener.callback.call(listener.context, data, eventName)
                    : listener.callback(data, eventName);
                
                eventHandled = true;
                
                // If listener returns false, stop propagation
                if (result === false && !options.ignorePropagation) {
                    debug(DEBUG_PREFIXES.EVENTS, `Event propagation stopped by listener: ${eventName}`);
                    break;
                }
                
                // Remove one-time listeners
                if (listener.once) {
                    toRemove.push(listener);
                }
                
            } catch (error) {
                debug(DEBUG_PREFIXES.EVENTS, `Error in event listener for ${eventName}:`, error);
                
                // Remove faulty listeners unless in development
                if (process.env.NODE_ENV !== 'development') {
                    toRemove.push(listener);
                }
            }
        }
        
        // Clean up one-time and faulty listeners
        toRemove.forEach(listener => listeners.delete(listener));
        
        return eventHandled;
    }
    
    /**
     * Emit an event asynchronously
     * @param {string} eventName - Name of the event
     * @param {*} data - Event data
     * @param {Object} options - Emission options
     * @returns {Promise<boolean>} True if event was handled
     */
    async emitAsync(eventName, data = null, options = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.emit(eventName, data, options);
                resolve(result);
            }, 0);
        });
    }
    
    /**
     * Check if there are listeners for an event
     * @param {string} eventName - Name of the event
     * @returns {boolean} True if there are listeners
     */
    hasListeners(eventName) {
        const listeners = this.listeners.get(eventName);
        return listeners && listeners.size > 0;
    }
    
    /**
     * Get listener count for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    getListenerCount(eventName) {
        const listeners = this.listeners.get(eventName);
        return listeners ? listeners.size : 0;
    }
    
    /**
     * Get all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }
    
    /**
     * Create a promise that resolves when an event is emitted
     * @param {string} eventName - Name of the event to wait for
     * @param {number} timeout - Timeout in milliseconds (optional)
     * @returns {Promise} Promise that resolves with event data
     */
    waitFor(eventName, timeout = null) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            
            const unsubscribe = this.once(eventName, (data) => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(data);
            });
            
            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`Timeout waiting for event: ${eventName}`));
                }, timeout);
            }
        });
    }
    
    /**
     * Create event namespace for scoped events
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced event methods
     */
    namespace(namespace) {
        const addNamespace = (eventName) => `${namespace}:${eventName}`;
        
        return {
            on: (eventName, callback, options) => this.on(addNamespace(eventName), callback, options),
            once: (eventName, callback, options) => this.once(addNamespace(eventName), callback, options),
            off: (eventName, callback) => this.off(addNamespace(eventName), callback),
            emit: (eventName, data, options) => this.emit(addNamespace(eventName), data, options),
            emitAsync: (eventName, data, options) => this.emitAsync(addNamespace(eventName), data, options),
            hasListeners: (eventName) => this.hasListeners(addNamespace(eventName)),
            getListenerCount: (eventName) => this.getListenerCount(addNamespace(eventName))
        };
    }
    
    /**
     * Remove all listeners for an event or all events
     * @param {string} eventName - Event name (optional, removes all if not provided)
     */
    removeAllListeners(eventName = null) {
        if (eventName) {
            this.listeners.delete(eventName);
            debug(DEBUG_PREFIXES.EVENTS, `Removed all listeners for: ${eventName}`);
        } else {
            this.listeners.clear();
            debug(DEBUG_PREFIXES.EVENTS, 'Removed all event listeners');
        }
    }
    
    /**
     * Get event history
     * @param {number} limit - Maximum number of events to return
     * @returns {Array} Event history
     */
    getEventHistory(limit = 20) {
        return this.eventHistory.slice(-limit);
    }
    
    /**
     * Record event in history
     * @private
     */
    recordEvent(eventName, data) {
        this.eventHistory.push({
            timestamp: new Date().toISOString(),
            eventName,
            data: this.sanitizeForHistory(data)
        });
        
        // Limit history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * Sanitize data for history (remove functions, large objects, etc.)
     * @private
     */
    sanitizeForHistory(data) {
        if (data === null || typeof data !== 'object') {
            return data;
        }
        
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            return '[Complex Object]';
        }
    }
    
    /**
     * Generate unique listener ID
     * @private
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        const listenerCounts = {};
        for (const [eventName, listeners] of this.listeners) {
            listenerCounts[eventName] = listeners.size;
        }
        
        return {
            totalEvents: this.listeners.size,
            listenerCounts,
            historySize: this.eventHistory.length,
            isDestroyed: this.isDestroyed
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.EVENTS, 'Destroying event system');
        
        this.isDestroyed = true;
        this.listeners.clear();
        this.eventHistory = [];
    }
}
