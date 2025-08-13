/**
 * Event Pill Component
 * Handles event display and interactions
 */

import { EVENT_CATEGORY_COLORS } from '../../../utils/calendar-constants.js';
import { formatDate } from '../../../utils/calendar-date-utils.js';

export class EventPill {
    constructor(core, event, options = {}) {
        this.core = core;
        this.event = event;
        this.options = {
            showTime: true,
            showLocation: false,
            compact: false,
            ...options
        };
        
        this.element = null;
        
        this.create();
    }
    
    /**
     * Create the event pill element
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = `event-pill ${this.event.category || 'default'}`;
        
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
            time.textContent = this.formatTime(this.event.start);
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
        // Click handler
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onClick();
        });
        
        // Touch feedback
        this.addTouchFeedback();
        
        // Touch events for ripple effect
        this.element.addEventListener('touchstart', (e) => {
            this.createRipple(e);
        });
    }
    
    /**
     * Add touch feedback
     */
    addTouchFeedback() {
        this.element.addEventListener('touchstart', () => {
            this.element.style.transform = 'scale(0.95)';
        });
        
        this.element.addEventListener('touchend', () => {
            setTimeout(() => {
                this.element.style.transform = '';
            }, 100);
        });
    }
    
    /**
     * Create ripple effect
     */
    createRipple(event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = this.element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.touches[0].clientX - rect.left - size / 2;
        const y = event.touches[0].clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.element.style.position = 'relative';
        this.element.style.overflow = 'hidden';
        this.element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
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
        // Create a touch-friendly modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 32px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            min-width: 400px;
            animation: modalIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <h2 style="font-size: 24px; margin-bottom: 16px;">${this.event.title}</h2>
            <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
                📅 ${this.formatDate(this.event.start, 'full')}
            </p>
            <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
                ⏰ ${this.event.allDay ? 'All Day' : this.formatTime(this.event.start)}
            </p>
            ${this.event.location ? `<p style="font-size: 18px; color: var(--text-secondary);">📍 ${this.event.location}</p>` : ''}
            ${this.event.description ? `<p style="font-size: 16px; color: var(--text-muted); margin-top: 16px;">${this.event.description}</p>` : ''}
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    padding: 12px 24px;
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                ">Close</button>
                <button onclick="this.parentElement.parentElement.remove(); this.editEvent()" style="
                    padding: 12px 24px;
                    background: var(--accent-secondary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                ">Edit</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        setTimeout(() => {
            document.addEventListener('click', function closeModal(e) {
                if (!modal.contains(e.target)) {
                    modal.remove();
                    document.removeEventListener('click', closeModal);
                }
            });
        }, 100);
    }
    

    
    /**
     * Format time for display
     */
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
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
