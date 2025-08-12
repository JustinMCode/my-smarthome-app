/**
 * View Mixin
 * Provides common functionality for calendar views
 */

import { EventRenderer } from '../components/ui/events/index.js';
import { DateNavigation } from '../components/ui/navigation/index.js';
import { EventDataManager } from '../components/data/index.js';
import { GridLayoutEngine } from '../components/layout/index.js';
import { EventModal } from '../components/ui/modals/index.js';

export const ViewMixin = (BaseClass) => class extends BaseClass {
    constructor(core, container) {
        super(core, container);
        
        // Initialize shared components
        this.eventRenderer = new EventRenderer();
        this.dateNavigation = new DateNavigation(core);
        this.eventDataManager = new EventDataManager(core);
        this.gridLayoutEngine = new GridLayoutEngine();
        this.eventModal = new EventModal();
        
        // Bind event handlers
        this.eventRenderer.onEventSelect = this.onEventSelect.bind(this);
    }

    /**
     * Initialize shared functionality
     */
    initShared() {
        // Setup keyboard navigation
        this.dateNavigation.setupKeyboardListeners(true);
        
        // Setup responsive handling
        this.setupResponsiveHandling();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        // Initial responsive calculation
        this.updateResponsiveState();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.updateResponsiveState();
        this.onResize();
    }

    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const containerWidth = this.container?.offsetWidth || window.innerWidth;
        this.responsiveState = this.gridLayoutEngine.calculateResponsiveBreakpoints(containerWidth);
    }

    /**
     * Called when view is resized
     */
    onResize() {
        // Override in subclasses
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.performanceMetrics = {
            renderTime: 0,
            eventCount: 0,
            lastRender: 0
        };
    }

    /**
     * Start performance measurement
     */
    startPerformanceMeasurement() {
        this.performanceStart = performance.now();
    }

    /**
     * End performance measurement
     */
    endPerformanceMeasurement() {
        if (this.performanceStart) {
            this.performanceMetrics.renderTime = performance.now() - this.performanceStart;
            this.performanceMetrics.lastRender = Date.now();
        }
    }

    /**
     * Get events for date with caching
     */
    getEventsForDate(date, options = {}) {
        return this.eventDataManager.getEventsForDate(date, options);
    }

    /**
     * Get all-day events for date
     */
    getAllDayEvents(date, options = {}) {
        return this.eventDataManager.getAllDayEvents(date, options);
    }

    /**
     * Get timed events for date
     */
    getTimedEvents(date, options = {}) {
        return this.eventDataManager.getTimedEvents(date, options);
    }

    /**
     * Create event pill
     */
    createEventPill(event, options = {}) {
        return this.eventRenderer.createEventPill(event, options);
    }

    /**
     * Create week event
     */
    createWeekEvent(event, options = {}) {
        return this.eventRenderer.createWeekEvent(event, options);
    }

    /**
     * Create all-day event
     */
    createAllDayEvent(event, options = {}) {
        return this.eventRenderer.createAllDayEvent(event, options);
    }

    /**
     * Show event details modal
     */
    showEventDetails(event, options = {}) {
        return this.eventModal.showEventDetails(event, options);
    }

    /**
     * Show day events popup
     */
    showDayEventsPopup(date, events, options = {}) {
        return this.eventModal.showDayEventsPopup(date, events, options);
    }

    /**
     * Show quick add dialog
     */
    showQuickAddDialog(startTime, endTime = null, options = {}) {
        return this.eventModal.showQuickAddDialog(startTime, endTime, options);
    }

    /**
     * Navigate by direction
     */
    navigate(direction, viewType = 'week') {
        const newDate = this.dateNavigation.navigate(direction, viewType);
        this.render();
        return newDate;
    }

    /**
     * Go to today
     */
    goToToday() {
        const today = this.dateNavigation.goToToday();
        this.render();
        return today;
    }

    /**
     * Create navigation controls
     */
    createNavigationControls(options = {}) {
        return this.dateNavigation.createNavigationControls(options);
    }

    /**
     * Format navigation title
     */
    formatNavigationTitle(date, viewType = 'week') {
        return this.dateNavigation.formatNavigationTitle(date, viewType);
    }

    /**
     * Calculate event layout
     */
    calculateEventLayout(event, containerWidth, options = {}) {
        return this.gridLayoutEngine.calculateEventLayout(event, containerWidth, options);
    }

    /**
     * Layout events with overlaps
     */
    layoutEventsWithOverlaps(events, containerWidth, options = {}) {
        return this.gridLayoutEngine.layoutEventsWithOverlaps(events, containerWidth, options);
    }

    /**
     * Calculate current time position
     */
    calculateCurrentTimePosition(options = {}) {
        return this.gridLayoutEngine.calculateCurrentTimePosition(options);
    }

    /**
     * Add touch feedback to element
     */
    addTouchFeedback(element) {
        this.eventRenderer.addTouchFeedback(element);
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
     * Show loading state
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
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            responsiveState: this.responsiveState,
            cacheStats: this.eventDataManager.getCacheStats(),
            layoutStats: this.gridLayoutEngine.getLayoutStats(),
            activeModals: this.eventModal.getActiveModalsCount()
        };
    }

    /**
     * Update view with new data
     */
    update() {
        if (this.isActive && this.isRendered) {
            this.startPerformanceMeasurement();
            this.render();
            this.endPerformanceMeasurement();
        }
    }

    /**
     * Called when view is shown
     */
    onShow() {
        this.dateNavigation.setupKeyboardListeners(true);
        this.render();
    }

    /**
     * Called when view is hidden
     */
    onHide() {
        this.dateNavigation.setupKeyboardListeners(false);
        this.isRendered = false;
    }

    /**
     * Destroy the view
     */
    destroy() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Destroy shared components
        this.dateNavigation.destroy();
        this.eventDataManager.destroy();
        this.gridLayoutEngine.destroy();
        this.eventModal.destroy();
        
        // Call parent destroy
        super.destroy();
    }

    /**
     * Get view statistics
     */
    getViewStats() {
        return {
            performance: this.getPerformanceMetrics(),
            navigation: this.dateNavigation.getNavigationState(),
            responsive: this.responsiveState
        };
    }
};
