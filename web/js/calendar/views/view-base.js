/**
 * Calendar View Base Class
 * Abstract base class for all calendar views
 */

import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/basic/calendar-constants.js';
import { formatDate, formatTime } from '../utils/basic/calendar-date-utils.js';
import { addTouchFeedback, createRipple } from '../utils/ui/touch-interactions.js';
import { EventModal } from '../components/ui/modals/index.js';

export class ViewBase {
    constructor(core, container) {
        this.core = core;
        this.container = container;
        this.isActive = false;
        this.isRendered = false;
        this.eventModal = new EventModal();
        
        // Bind methods
        this.render = this.render.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    
    /**
     * Initialize the view
     * Override in subclasses
     */
    init() {
        // Subclasses should implement
        throw new Error('init() method must be implemented by subclass');
    }
    
    /**
     * Render the view content
     * Override in subclasses
     */
    render() {
        // Subclasses should implement
        throw new Error('render() method must be implemented by subclass');
    }
    
    /**
     * Show the view
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.container.classList.add(CSS_CLASSES.ACTIVE);
        }
        this.isActive = true;
        this.onShow();
    }
    
    /**
     * Hide the view
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.container.classList.remove(CSS_CLASSES.ACTIVE);
        }
        this.isActive = false;
        this.onHide();
    }
    
    /**
     * Called when view is shown
     * Override in subclasses
     */
    onShow() {
        // Subclasses can override
    }
    
    /**
     * Called when view is hidden
     * Override in subclasses
     */
    onHide() {
        // Subclasses can override
    }
    
    /**
     * Update the view with new data
     * Override in subclasses
     */
    update() {
        if (this.isActive && this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Handle date selection
     * Override in subclasses
     */
    onDateSelect(date) {
        this.core.selectDate(date);
    }
    
    /**
     * Handle event selection
     * Override in subclasses
     */
    onEventSelect(event) {
        this.showEventDetails(event);
    }
    
    /**
     * Show event details
     */
    showEventDetails(event) {
        this.eventModal.showEventDetails(event);
    }
    

    

    
    /**
     * Create loading state
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="calendar-loading">
                    <div class="spinner"></div>
                    <div class="loading-text">Loading events...</div>
                </div>
            `;
        }
    }
    
    /**
     * Show empty state
     */
    showEmpty(message = 'No events scheduled for this period') {
        if (this.container) {
            this.container.innerHTML = `
                <div class="calendar-empty">
                    <div class="empty-icon">📅</div>
                    <div class="empty-title">No events</div>
                    <div class="empty-text">${message}</div>
                </div>
            `;
        }
    }
    

    

    
    /**
     * Destroy the view
     */
    destroy() {
        this.hide();
        this.isRendered = false;
        this.onDestroy();
    }
    
    /**
     * Called when view is destroyed
     * Override in subclasses
     */
    onDestroy() {
        // Subclasses can override
    }
    
    /**
     * Get view name
     * Override in subclasses
     */
    getName() {
        return 'base';
    }
    
    /**
     * Check if view is active
     */
    isViewActive() {
        return this.isActive;
    }
    
    /**
     * Check if view is rendered
     */
    isViewRendered() {
        return this.isRendered;
    }
}
