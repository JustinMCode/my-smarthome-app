/**
 * Event Pill Component
 * Handles event display and interactions
 */

import { EVENT_CATEGORY_COLORS } from '../../../utils/basic/calendar-constants.js';
import { formatDate, formatTime } from '../../../utils/basic/calendar-date-utils.js';
import { addTouchFeedback, createRipple } from '../../../utils/ui/touch-interactions.js';
import { EventModal } from '../modals/index.js';

export class EventPill {
    constructor(core, event, options = {}) {
        this.core = core;
        this.event = event;
        this.options = {
            showTime: true,
            showLocation: false,
            compact: false,
            clickable: true, // New option to control clickability
            ...options
        };
        
        this.element = null;
        this.eventModal = new EventModal();
        
        this.create();
    }
    
    /**
     * Create the event pill element
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = `event-pill ${this.event.category || 'default'}`;
        
        // Add non-clickable class if disabled
        if (!this.options.clickable) {
            this.element.classList.add('non-clickable');
        }
        
        // Set color
        this.setColor();
        
        // Create content
        this.createContent();
        
        // Add interactions
        this.addInteractions();
        
        return this.element;
    }
    
    /**
     * Set the pill color
     */
    setColor() {
        if (this.event.color) {
            this.element.style.backgroundColor = this.event.color;
        } else if (this.event.category && EVENT_CATEGORY_COLORS[this.event.category]) {
            this.element.style.backgroundColor = EVENT_CATEGORY_COLORS[this.event.category];
        }
    }
    
    /**
     * Create pill content
     */
    createContent() {
        if (this.options.compact) {
            this.createCompactContent();
        } else {
            this.createFullContent();
        }
    }
    
    /**
     * Create compact content
     */
    createCompactContent() {
        this.element.textContent = this.event.title;
    }
    
    /**
     * Create full content
     */
    createFullContent() {
        const content = document.createElement('div');
        content.className = 'event-pill-content';
        
        // Title
        const title = document.createElement('div');
        title.className = 'event-pill-title';
        title.textContent = this.event.title;
        content.appendChild(title);
        
        // Time (if enabled)
        if (this.options.showTime && !this.event.allDay) {
            const time = document.createElement('div');
            time.className = 'event-pill-time';
            time.textContent = formatTime(this.event.start);
            content.appendChild(time);
        }
        
        // Location (if enabled)
        if (this.options.showLocation && this.event.location) {
            const location = document.createElement('div');
            location.className = 'event-pill-location';
            location.textContent = this.event.location;
            content.appendChild(location);
        }
        
        this.element.appendChild(content);
    }
    
    /**
     * Add interactions to the pill
     */
    addInteractions() {
        // Only add click interactions if clickable is enabled
        if (this.options.clickable) {
            // Click handler
            this.element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onClick();
            });
            
            // Touch feedback
            addTouchFeedback(this.element);
            
            // Touch events for ripple effect
            this.element.addEventListener('touchstart', (e) => {
                createRipple(e, this.element);
            });
        }
    }
    
    /**
     * Handle click
     */
    onClick() {
        this.showEventDetails();
    }
    
    /**
     * Show event details
     */
    showEventDetails() {
        this.eventModal.showEventDetails(this.event);
    }
    

    

    
    /**
     * Update the pill
     */
    update(event, options = {}) {
        this.event = event;
        this.options = { ...this.options, ...options };
        
        // Update color
        this.setColor();
        
        // Update content
        this.element.innerHTML = '';
        this.createContent();
    }
    
    /**
     * Set pill options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
        this.update(this.event);
    }
    
    /**
     * Get the element
     */
    getElement() {
        return this.element;
    }
    
    /**
     * Destroy the pill
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
