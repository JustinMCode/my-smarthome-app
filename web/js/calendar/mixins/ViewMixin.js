/**
 * View Mixin
 * Provides common functionality for calendar views
 */

import { EventRenderer } from '../components/ui/events/index.js';
import { DateNavigation } from '../components/ui/navigation/index.js';
import { createDataManager, createLayoutManager } from '../utils/factory/index.js';
import { EventModal } from '../components/ui/modals/index.js';
import { addTouchFeedback, createRipple } from '../utils/touch-interactions.js';

export const ViewMixin = (BaseClass) => class extends BaseClass {
    constructor(core, container) {
        super(core, container);
        
        // Initialize synchronous components
        this.eventRenderer = new EventRenderer();
        this.dateNavigation = new DateNavigation(core);
        this.eventModal = new EventModal();
        
        // Factory-created components (initialized asynchronously)
        this.eventDataManager = null;
        this.layoutManager = null;
        this._dataManagerInitialized = false;
        this._layoutManagerInitialized = false;
        
        // Bind event handlers
        this.eventRenderer.onEventSelect = this.onEventSelect.bind(this);
    }

    /**
     * Initialize async components using factory pattern
     */
    async initializeFactoryComponents() {
        // Initialize data manager
        if (!this._dataManagerInitialized) {
            this.eventDataManager = await createDataManager(this.core, {
                enableCaching: true,
                enableLazyLoading: true,
                maxConcurrentRequests: 3
            });
            this._dataManagerInitialized = true;
        }
        
        // Initialize layout manager
        if (!this._layoutManagerInitialized) {
            this.layoutManager = await createLayoutManager(this.core, {
                layoutConfig: {
                    columns: 3,
                    maxEventsPerDay: 5,
                    compactMode: false,
                    enableGrid: true
                },
                managerConfig: {
                    enablePooling: true,
                    maxPoolSize: 50,
                    enableCaching: true
                }
            });
            this._layoutManagerInitialized = true;
        }
    }

    /**
     * Initialize shared functionality
     */
    async initShared() {
        // Initialize factory components first
        await this.initializeFactoryComponents();
        
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
        const containerHeight = this.container?.offsetHeight || window.innerHeight;
        
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            this.responsiveState = { breakpoint: 'unknown', containerWidth, containerHeight };
            return;
        }
        
        // Use the enhanced layout manager's responsive calculation
        this.responsiveState = this.layoutManager.calculateLayout([], containerWidth, containerHeight);
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
        if (!this.eventDataManager) {
            console.warn('EventDataManager not initialized. Call initShared() first.');
            return [];
        }
        return this.eventDataManager.getEventsForDate(date, options);
    }

    /**
     * Get all-day events for date
     */
    getAllDayEvents(date, options = {}) {
        if (!this.eventDataManager) {
            console.warn('EventDataManager not initialized. Call initShared() first.');
            return [];
        }
        return this.eventDataManager.getAllDayEvents(date, options);
    }

    /**
     * Get timed events for date
     */
    getTimedEvents(date, options = {}) {
        if (!this.eventDataManager) {
            console.warn('EventDataManager not initialized. Call initShared() first.');
            return [];
        }
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
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return { event, layout: 'fallback' };
        }
        
        const containerHeight = this.container?.offsetHeight || window.innerHeight;
        return this.layoutManager.calculateLayout([event], containerWidth, containerHeight);
    }

    /**
     * Layout events with overlaps
     */
    layoutEventsWithOverlaps(events, containerWidth, options = {}) {
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return events.map(event => ({ ...event, layout: 'fallback' }));
        }
        
        // Use the enhanced overlap detection and layout
        const overlaps = this.layoutManager.detectOverlaps(events);
        const containerHeight = this.container?.offsetHeight || window.innerHeight;
        const layout = this.layoutManager.calculateLayout(events, containerWidth, containerHeight);
        
        return {
            events: layout.events,
            overlaps,
            layout: layout.layout
        };
    }

    /**
     * Calculate current time position
     */
    calculateCurrentTimePosition(options = {}) {
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return { top: 0, height: 0 };
        }
        
        // Use layout manager's responsive calculation
        const containerWidth = this.container?.offsetWidth || window.innerWidth;
        const containerHeight = this.container?.offsetHeight || window.innerHeight;
        const layout = this.layoutManager.calculateLayout([], containerWidth, containerHeight);
        
        // Calculate current time position based on layout
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const totalMinutes = 24 * 60;
        const percentage = minutes / totalMinutes;
        
        return {
            top: percentage * containerHeight,
            height: 2, // 2px line height
            time: now
        };
    }



    /**
     * Arrange events in grid layout
     */
    arrangeEventsInGrid(events, columns = 3) {
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return events;
        }
        
        return this.layoutManager.arrangeInGrid(events, columns);
    }

    /**
     * Detect overlapping events
     */
    detectEventOverlaps(events) {
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return [];
        }
        
        return this.layoutManager.detectOverlaps(events);
    }

    /**
     * Update layout configuration
     */
    updateLayoutConfig(newConfig) {
        if (!this.layoutManager) {
            console.warn('LayoutManager not initialized. Call initShared() first.');
            return;
        }
        
        this.layoutManager.updateLayout(newConfig);
    }

    /**
     * Clear layout cache
     */
    clearLayoutCache() {
        if (this.layoutManager) {
            this.layoutManager.clearCache();
        }
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
            cacheStats: this.eventDataManager?.getCacheStats() || { initialized: false },
            layoutStats: this.layoutManager?.getLayoutStats() || { initialized: false },
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
        if (this.eventDataManager) {
            this.eventDataManager.destroy();
        }
        if (this.layoutManager) {
            this.layoutManager.destroy();
        }
        this.eventModal.destroy();
        
        // Call parent destroy if it exists
        if (super.destroy) {
            super.destroy();
        }
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
