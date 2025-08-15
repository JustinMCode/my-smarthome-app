/**
 * Base Component Class
 * Provides common functionality for all UI components
 * Implements component lifecycle, event handling, and rendering patterns
 */

import { DEBUG_PREFIXES } from '../utils/TasksConstants.js';
import { generateId, escapeHtml } from '../utils/TasksHelpers.js';
import { debug } from '../../constants/config.js';

/**
 * BaseComponent - Abstract base class for all UI components
 */
export class BaseComponent {
    constructor(config = {}) {
        this.id = config.id || generateId('component');
        this.state = config.state || null;
        this.events = config.events || null;
        this.services = config.services || {};
        this.element = null;
        this.isRendered = false;
        this.isDestroyed = false;
        this.children = new Map();
        this.eventListeners = new Map();
        
        // Component-specific configuration
        this.config = {
            className: config.className || '',
            attributes: config.attributes || {},
            autoRender: config.autoRender !== false,
            enableEvents: config.enableEvents !== false,
            ...config
        };
        
        debug(DEBUG_PREFIXES.CORE, `${this.constructor.name} initialized:`, this.id);
        
        // Auto-render if enabled
        if (this.config.autoRender) {
            this.render();
        }
    }
    
    /**
     * Render the component
     * @param {HTMLElement} container - Container to render into (optional)
     * @returns {HTMLElement} The rendered element
     */
    render(container = null) {
        if (this.isDestroyed) {
            debug(DEBUG_PREFIXES.CORE, `Cannot render destroyed component: ${this.constructor.name}`);
            return null;
        }
        
        try {
            // Generate HTML content
            const html = this.generateHTML();
            
            // Create or update element
            if (!this.element) {
                this.element = this.createElement(html);
            } else {
                this.updateElement(html);
            }
            
            // Add to container if provided
            if (container && container.appendChild) {
                container.appendChild(this.element);
            }
            
            // Setup event listeners
            if (this.config.enableEvents) {
                this.setupEventListeners();
            }
            
            // Render child components
            this.renderChildren();
            
            // Post-render hook
            this.onRender();
            
            this.isRendered = true;
            
            debug(DEBUG_PREFIXES.CORE, `${this.constructor.name} rendered successfully`);
            return this.element;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.CORE, `Error rendering ${this.constructor.name}:`, error);
            throw error;
        }
    }
    
    /**
     * Generate HTML content (to be implemented by subclasses)
     * @returns {string} HTML string
     */
    generateHTML() {
        return `<div class="base-component">Base Component</div>`;
    }
    
    /**
     * Create DOM element from HTML
     * @private
     */
    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const element = template.content.firstChild;
        
        // Add component ID and classes
        if (element) {
            element.setAttribute('data-component-id', this.id);
            element.setAttribute('data-component-type', this.constructor.name);
            
            if (this.config.className) {
                element.classList.add(...this.config.className.split(' '));
            }
            
            // Add custom attributes
            Object.entries(this.config.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        return element;
    }
    
    /**
     * Update existing element with new HTML
     * @private
     */
    updateElement(html) {
        if (!this.element) return;
        
        const newElement = this.createElement(html);
        if (newElement) {
            this.element.innerHTML = newElement.innerHTML;
        }
    }
    
    /**
     * Setup event listeners (to be implemented by subclasses)
     */
    setupEventListeners() {
        // Override in subclasses
    }
    
    /**
     * Render child components
     * @private
     */
    renderChildren() {
        this.children.forEach(child => {
            if (child.render && !child.isDestroyed) {
                child.render();
            }
        });
    }
    
    /**
     * Post-render hook (to be implemented by subclasses)
     */
    onRender() {
        // Override in subclasses for post-render logic
    }
    
    /**
     * Add a child component
     * @param {string} key - Unique key for the child
     * @param {BaseComponent} component - Child component instance
     */
    addChild(key, component) {
        this.children.set(key, component);
        
        if (this.isRendered) {
            component.render();
        }
    }
    
    /**
     * Remove a child component
     * @param {string} key - Key of the child to remove
     */
    removeChild(key) {
        const child = this.children.get(key);
        if (child) {
            child.destroy();
            this.children.delete(key);
        }
    }
    
    /**
     * Get a child component
     * @param {string} key - Key of the child
     * @returns {BaseComponent} Child component
     */
    getChild(key) {
        return this.children.get(key);
    }
    
    /**
     * Add event listener to the component element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(event, handler, options = {}) {
        if (!this.element) return;
        
        const wrappedHandler = (e) => {
            if (!this.isDestroyed) {
                handler.call(this, e);
            }
        };
        
        this.element.addEventListener(event, wrappedHandler, options);
        
        // Store for cleanup
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push({ handler: wrappedHandler, options });
    }
    
    /**
     * Emit custom event from component
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    emit(eventName, data = null) {
        if (this.events && this.events.emit) {
            this.events.emit(eventName, { component: this.id, data });
        }
        
        // Also emit DOM event
        if (this.element) {
            const customEvent = new CustomEvent(eventName, {
                detail: { component: this.id, data },
                bubbles: true
            });
            this.element.dispatchEvent(customEvent);
        }
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeToState(key, callback) {
        if (!this.state || !this.state.subscribe) return () => {};
        
        return this.state.subscribe(key, callback);
    }
    
    /**
     * Update component when state changes
     * @param {Array} stateKeys - State keys to watch
     */
    bindToState(stateKeys = []) {
        const unsubscribers = stateKeys.map(key => 
            this.subscribeToState(key, () => {
                if (this.isRendered && !this.isDestroyed) {
                    this.render();
                }
            })
        );
        
        // Store unsubscribers for cleanup
        this.stateUnsubscribers = unsubscribers;
    }
    
    /**
     * Get element by selector within component
     * @param {string} selector - CSS selector
     * @returns {HTMLElement} Found element
     */
    $(selector) {
        return this.element ? this.element.querySelector(selector) : null;
    }
    
    /**
     * Get all elements by selector within component
     * @param {string} selector - CSS selector
     * @returns {NodeList} Found elements
     */
    $$(selector) {
        return this.element ? this.element.querySelectorAll(selector) : [];
    }
    
    /**
     * Show the component
     */
    show() {
        if (this.element) {
            this.element.style.display = '';
            this.element.classList.remove('hidden');
        }
    }
    
    /**
     * Hide the component
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.element.classList.add('hidden');
        }
    }
    
    /**
     * Toggle component visibility
     */
    toggle() {
        if (this.element) {
            const isHidden = this.element.style.display === 'none' || 
                           this.element.classList.contains('hidden');
            isHidden ? this.show() : this.hide();
        }
    }
    
    /**
     * Add CSS class to component element
     * @param {string} className - Class name to add
     */
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        }
    }
    
    /**
     * Remove CSS class from component element
     * @param {string} className - Class name to remove
     */
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
        }
    }
    
    /**
     * Toggle CSS class on component element
     * @param {string} className - Class name to toggle
     */
    toggleClass(className) {
        if (this.element) {
            this.element.classList.toggle(className);
        }
    }
    
    /**
     * Set attribute on component element
     * @param {string} name - Attribute name
     * @param {string} value - Attribute value
     */
    setAttribute(name, value) {
        if (this.element) {
            this.element.setAttribute(name, value);
        }
    }
    
    /**
     * Get attribute from component element
     * @param {string} name - Attribute name
     * @returns {string} Attribute value
     */
    getAttribute(name) {
        return this.element ? this.element.getAttribute(name) : null;
    }
    
    /**
     * Clean up resources and destroy component
     */
    destroy() {
        if (this.isDestroyed) return;
        
        debug(DEBUG_PREFIXES.CORE, `Destroying component: ${this.constructor.name}`);
        
        // Destroy child components
        this.children.forEach(child => {
            if (child.destroy) {
                child.destroy();
            }
        });
        this.children.clear();
        
        // Remove event listeners
        if (this.element) {
            this.eventListeners.forEach((listeners, event) => {
                listeners.forEach(({ handler, options }) => {
                    this.element.removeEventListener(event, handler, options);
                });
            });
        }
        this.eventListeners.clear();
        
        // Unsubscribe from state
        if (this.stateUnsubscribers) {
            this.stateUnsubscribers.forEach(unsub => unsub());
            this.stateUnsubscribers = null;
        }
        
        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up references
        this.element = null;
        this.state = null;
        this.events = null;
        this.services = {};
        this.isDestroyed = true;
        this.isRendered = false;
    }
    
    /**
     * Get component debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            id: this.id,
            type: this.constructor.name,
            isRendered: this.isRendered,
            isDestroyed: this.isDestroyed,
            childrenCount: this.children.size,
            hasElement: !!this.element,
            eventListeners: Array.from(this.eventListeners.keys())
        };
    }
    
    /**
     * Escape HTML for safe rendering
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        return escapeHtml(text);
    }
}
