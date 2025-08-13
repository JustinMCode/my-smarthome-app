/**
 * Day Cell Component
 * Handles individual day cell rendering and interactions
 */

import { CSS_CLASSES, EVENT_CATEGORY_COLORS } from '../../../utils/calendar-constants.js';
import { isToday, isWeekend, formatDate, formatTime } from '../../../utils/calendar-date-utils.js';

export class DayCell {
    constructor(core, date, options = {}) {
        this.core = core;
        this.date = date;
        this.options = {
            isOtherMonth: false,
            isSelected: false,
            maxEvents: 3,
            ...options
        };
        
        this.element = null;
        this.dayNumberElement = null;
        this.eventsContainer = null;
        
        this.create();
    }
    
    /**
     * Create the day cell element
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = CSS_CLASSES.DAY_CELL;
        
        // Add state classes
        this.addStateClasses();
        
        // Create day number
        this.createDayNumber();
        
        // Create events container
        this.createEventsContainer();
        
        // Add events
        this.addEvents();
        
        // Add interactions
        this.addInteractions();
        
        return this.element;
    }
    
    /**
     * Add state classes to the cell
     */
    addStateClasses() {
        if (this.options.isOtherMonth) {
            this.element.classList.add(CSS_CLASSES.OTHER_MONTH);
        }
        
        if (isToday(this.date)) {
            this.element.classList.add(CSS_CLASSES.TODAY);
        }
        
        if (this.options.isSelected) {
            this.element.classList.add(CSS_CLASSES.SELECTED);
        }
        
        if (isWeekend(this.date)) {
            this.element.classList.add(CSS_CLASSES.WEEKEND);
        }
    }
    
    /**
     * Create day number element
     */
    createDayNumber() {
        this.dayNumberElement = document.createElement('div');
        this.dayNumberElement.className = CSS_CLASSES.DAY_NUMBER;
        this.dayNumberElement.textContent = this.date.getDate();
        this.element.appendChild(this.dayNumberElement);
    }
    
    /**
     * Create events container
     */
    createEventsContainer() {
        this.eventsContainer = document.createElement('div');
        this.eventsContainer.className = CSS_CLASSES.DAY_EVENTS;
        this.element.appendChild(this.eventsContainer);
    }
    
    /**
     * Add events to the cell
     */
    addEvents() {
        const events = this.core.getEventsForDate(this.date);
        const maxDisplay = isToday(this.date) ? 2 : this.options.maxEvents;
        
        // Add event pills
        events.slice(0, maxDisplay).forEach(event => {
            const eventPill = this.createEventPill(event);
            this.eventsContainer.appendChild(eventPill);
        });
        
        // Add "more events" indicator
        if (events.length > maxDisplay) {
            const moreEl = this.createMoreEventsIndicator(events.length - maxDisplay);
            this.eventsContainer.appendChild(moreEl);
        }
    }
    
    /**
     * Create an event pill
     */
    createEventPill(event) {
        const pill = document.createElement('div');
        pill.className = `event-pill ${event.category || 'default'}`;
        pill.textContent = event.title;
        
        // Set color if available
        if (event.color) {
            pill.style.backgroundColor = event.color;
        } else if (event.category && EVENT_CATEGORY_COLORS[event.category]) {
            pill.style.backgroundColor = EVENT_CATEGORY_COLORS[event.category];
        }
        
        // Add click handler
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEventClick(event);
        });
        
        // Add touch feedback
        this.addTouchFeedback(pill);
        
        return pill;
    }
    
    /**
     * Create "more events" indicator
     */
    createMoreEventsIndicator(count) {
        const moreEl = document.createElement('div');
        moreEl.className = CSS_CLASSES.MORE_EVENTS;
        moreEl.textContent = `+${count}`;
        return moreEl;
    }
    
    /**
     * Add interactions to the cell
     */
    addInteractions() {
        // Click handler
        this.element.addEventListener('click', () => {
            this.onCellClick();
        });
        
        // Touch feedback
        this.addTouchFeedback(this.element);
        
        // Touch events for ripple effect
        this.element.addEventListener('touchstart', (e) => {
            this.createRipple(e, this.element);
        });
    }
    
    /**
     * Add touch feedback to element
     */
    addTouchFeedback(element) {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.style.transform = '';
            }, 100);
        });
    }
    
    /**
     * Create ripple effect
     */
    createRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.touches[0].clientX - rect.left - size / 2;
        const y = event.touches[0].clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    /**
     * Handle cell click
     */
    onCellClick() {
        // Visual feedback
        this.element.style.animation = 'cellSelect 0.3s ease';
        setTimeout(() => {
            this.element.style.animation = '';
        }, 300);
        
        // Select the date
        this.core.selectDate(this.date);
    }
    
    /**
     * Handle event click
     */
    onEventClick(event) {
        this.showEventDetails(event);
    }
    
    /**
     * Show event details
     */
    showEventDetails(event) {
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
            <h2 style="font-size: 24px; margin-bottom: 16px;">${event.title}</h2>
            <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
                📅 ${formatDate(event.start, 'full')}
            </p>
            <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
                ⏰ ${formatTime(event.start)}
            </p>
            ${event.location ? `<p style="font-size: 18px; color: var(--text-secondary);">📍 ${event.location}</p>` : ''}
            ${event.description ? `<p style="font-size: 16px; color: var(--text-muted); margin-top: 16px;">${event.description}</p>` : ''}
            <button onclick="this.parentElement.remove()" style="
                margin-top: 24px;
                padding: 12px 24px;
                background: var(--accent-primary);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">Close</button>
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
     * Update the cell
     */
    update(options = {}) {
        this.options = { ...this.options, ...options };
        
        // Update state classes
        this.element.className = CSS_CLASSES.DAY_CELL;
        this.addStateClasses();
        
        // Update day number
        this.dayNumberElement.textContent = this.date.getDate();
        
        // Update events
        this.eventsContainer.innerHTML = '';
        this.addEvents();
    }
    
    /**
     * Set selected state
     */
    setSelected(selected) {
        this.options.isSelected = selected;
        
        if (selected) {
            this.element.classList.add(CSS_CLASSES.SELECTED);
        } else {
            this.element.classList.remove(CSS_CLASSES.SELECTED);
        }
    }
    
    /**
     * Get the element
     */
    getElement() {
        return this.element;
    }
    
    /**
     * Destroy the cell
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
