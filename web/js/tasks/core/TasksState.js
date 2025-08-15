/**
 * Tasks State Management
 * Centralized state management using observer pattern
 * Provides reactive state updates throughout the application
 */

import { DEBUG_PREFIXES, EVENTS } from '../utils/TasksConstants.js';
import { getDefaultState } from '../config/DefaultData.js';
import { debug } from '../../constants/config.js';

/**
 * TasksState - Centralized state management
 * Implements observer pattern for reactive state updates
 */
export class TasksState {
    constructor() {
        this.state = getDefaultState();
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        
        debug(DEBUG_PREFIXES.STATE, 'State manager initialized');
    }
    
    /**
     * Get a state value
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        if (key === undefined) {
            return { ...this.state };
        }
        return this.state[key];
    }
    
    /**
     * Set a state value and notify subscribers
     * @param {string} key - State key
     * @param {*} value - New value
     * @param {boolean} silent - Skip notifications if true
     */
    set(key, value, silent = false) {
        const oldValue = this.state[key];
        
        // Don't update if value hasn't changed
        if (oldValue === value) {
            debug(DEBUG_PREFIXES.STATE, `State unchanged: ${key}`, value);
            return;
        }
        
        // Save to history
        this.saveToHistory(key, oldValue, value);
        
        // Update state
        this.state[key] = value;
        
        if (!silent) {
            debug(DEBUG_PREFIXES.STATE, `State updated: ${key}`, { oldValue, newValue: value });
            
            // Notify specific subscribers
            this.notifySubscribers(key, value, oldValue);
            
            // Notify global state change subscribers
            this.notifySubscribers(EVENTS.STATE_CHANGED, { key, value, oldValue });
        } else {
            debug(DEBUG_PREFIXES.STATE, `State updated silently: ${key}`, { oldValue, newValue: value });
        }
    }
    
    /**
     * Update multiple state values at once
     * @param {Object} updates - Object containing key-value pairs to update
     * @param {boolean} silent - Skip notifications if true
     */
    update(updates, silent = false) {
        debug(DEBUG_PREFIXES.STATE, 'Batch state update:', updates);
        
        const changes = [];
        
        for (const [key, value] of Object.entries(updates)) {
            const oldValue = this.state[key];
            if (oldValue !== value) {
                this.saveToHistory(key, oldValue, value);
                this.state[key] = value;
                changes.push({ key, value, oldValue });
            }
        }
        
        if (!silent && changes.length > 0) {
            debug(DEBUG_PREFIXES.STATE, 'Batch state changes:', changes);
            
            // Notify subscribers for each change
            changes.forEach(({ key, value, oldValue }) => {
                this.notifySubscribers(key, value, oldValue);
            });
            
            // Notify global batch change
            this.notifySubscribers(EVENTS.STATE_CHANGED, { changes });
        } else if (changes.length === 0) {
            debug(DEBUG_PREFIXES.STATE, 'No state changes in batch update');
        }
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch, or event name
     * @param {Function} callback - Callback function (value, oldValue) => {}
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        
        this.subscribers.get(key).add(callback);
        
        debug(DEBUG_PREFIXES.STATE, `Subscribed to: ${key}`);
        
        // Return unsubscribe function
        return () => this.unsubscribe(key, callback);
    }
    
    /**
     * Unsubscribe from state changes
     * @param {string} key - State key or event name
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(key, callback) {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.subscribers.delete(key);
            }
            debug(DEBUG_PREFIXES.STATE, `Unsubscribed from: ${key}`);
        }
    }
    
    /**
     * Notify subscribers of state changes
     * @private
     */
    notifySubscribers(key, value, oldValue) {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            debug(DEBUG_PREFIXES.STATE, `Notifying ${subscribers.size} subscribers for: ${key}`);
            
            subscribers.forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    debug(DEBUG_PREFIXES.STATE, `Error in subscriber callback for ${key}:`, error);
                }
            });
        } else {
            debug(DEBUG_PREFIXES.STATE, `No subscribers for: ${key}`);
        }
    }
    
    /**
     * Reset state to default values
     * @param {boolean} silent - Skip notifications if true
     */
    reset(silent = false) {
        debug(DEBUG_PREFIXES.STATE, 'Resetting state to defaults');
        
        const oldState = { ...this.state };
        this.state = getDefaultState();
        
        if (!silent) {
            // Notify all current subscribers
            for (const key of Object.keys(this.state)) {
                this.notifySubscribers(key, this.state[key], oldState[key]);
            }
            
            this.notifySubscribers(EVENTS.STATE_CHANGED, { 
                type: 'reset', 
                oldState, 
                newState: this.state 
            });
        }
        
        // Clear history
        this.history = [];
        debug(DEBUG_PREFIXES.STATE, 'State reset complete');
    }
    
    /**
     * Get state history
     * @param {number} limit - Maximum number of history entries to return
     * @returns {Array} State history
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }
    
    /**
     * Save state change to history
     * @private
     */
    saveToHistory(key, oldValue, newValue) {
        this.history.push({
            timestamp: new Date().toISOString(),
            key,
            oldValue,
            newValue
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * Create a computed value that updates when dependencies change
     * @param {Function} computeFn - Function that computes the value
     * @param {Array<string>} dependencies - State keys to watch
     * @returns {Object} Computed value object with getValue() and destroy()
     */
    computed(computeFn, dependencies) {
        let currentValue = computeFn(this.state);
        let isActive = true;
        
        const unsubscribers = dependencies.map(dep => 
            this.subscribe(dep, () => {
                if (isActive) {
                    const newValue = computeFn(this.state);
                    if (newValue !== currentValue) {
                        currentValue = newValue;
                    }
                }
            })
        );
        
        return {
            getValue: () => currentValue,
            destroy: () => {
                isActive = false;
                unsubscribers.forEach(unsub => unsub());
            }
        };
    }
    
    /**
     * Create a derived state that automatically updates
     * @param {string} derivedKey - Key for the derived state
     * @param {Function} deriveFn - Function to derive the value
     * @param {Array<string>} dependencies - State keys to watch
     * @returns {Function} Unsubscribe function
     */
    derive(derivedKey, deriveFn, dependencies) {
        const updateDerived = () => {
            const newValue = deriveFn(this.state);
            this.set(derivedKey, newValue, false);
        };
        
        // Initial calculation
        updateDerived();
        
        // Subscribe to dependencies
        const unsubscribers = dependencies.map(dep => 
            this.subscribe(dep, updateDerived)
        );
        
        return () => unsubscribers.forEach(unsub => unsub());
    }
    
    /**
     * Get state snapshot for debugging
     */
    getSnapshot() {
        return {
            state: { ...this.state },
            subscribers: Array.from(this.subscribers.keys()),
            historySize: this.history.length,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Get all subscribers for debugging
     * @returns {Object} Subscriber information
     */
    getSubscriberInfo() {
        const info = {};
        for (const [key, subscribers] of this.subscribers.entries()) {
            info[key] = subscribers.size;
        }
        return info;
    }
    
    /**
     * Validate state structure
     * @returns {boolean} Whether state is valid
     */
    validateState() {
        const requiredKeys = ['tasks', 'currentUser', 'waterGlasses', 'maxWaterGlasses', 'medicationStatus'];
        const missingKeys = requiredKeys.filter(key => !(key in this.state));
        
        if (missingKeys.length > 0) {
            debug(DEBUG_PREFIXES.STATE, 'State validation failed - missing keys:', missingKeys);
            return false;
        }
        
        if (!Array.isArray(this.state.tasks)) {
            debug(DEBUG_PREFIXES.STATE, 'State validation failed - tasks is not an array');
            return false;
        }
        
        debug(DEBUG_PREFIXES.STATE, 'State validation passed');
        return true;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.STATE, 'Destroying state manager');
        this.subscribers.clear();
        this.history = [];
        this.state = {};
    }
}
