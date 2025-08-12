/**
 * Calendar View Base Class
 * Abstract base class for all calendar views
 */

import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/calendar-constants.js';

export class ViewBase {
    constructor(core, container) {
        this.core = core;
        this.container = container;
        this.isActive = false;
        this.isRendered = false;
        
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
                📅 ${this.formatDate(event.start, 'full')}
            </p>
            <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
                ⏰ ${this.formatTime(event.start)}
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
     * Format date for display
     */
    formatDate(date, format = 'short') {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        switch (format) {
            case 'full':
                return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
            case 'month-year':
                return `${months[date.getMonth()]} ${date.getFullYear()}`;
            case 'short-date':
                return `${shortMonths[date.getMonth()]} ${date.getDate()}`;
            default:
                return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }
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
