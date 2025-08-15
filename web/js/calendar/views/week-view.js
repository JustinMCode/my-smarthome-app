/**
 * Calendar Week View - Touchscreen Optimized
 * Enhanced week view for 15-inch touchscreen displays
 */

import { ViewBase } from './view-base.js';
import { ViewMixin } from '../mixins/ViewMixin.js';
import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/basic/calendar-constants.js';
import { 
    getStartOfWeek, 
    addDays, 
    isToday, 
    isWeekend,
    isSameDay
} from '../utils/basic/calendar-date-utils.js';
import { addTouchFeedback, createRipple } from '../utils/ui/touch-interactions.js';
import { calendarConfigService } from '../config/calendar-config-service.js';

// Apply the ViewMixin to create an enhanced base class
const EnhancedViewBase = ViewMixin(ViewBase);

export class WeekViewRefactored extends EnhancedViewBase {
    constructor(core, container) {
        super(core, container);
        this.gridContainer = null;
        this.currentTimeInterval = null;
        this.touchStartData = null;
        this.scrollContainer = null;
        this.hourHeight = 80; // Optimized for touch
        this.startHour = 0;
        this.endHour = 24;
        this.columnWidth = 0;
        this.alignmentTimeout = null;
        this.resizeObserver = null;
    }
    
    /**
     * Initialize the week view
     */
    async init() {
        this.gridContainer = this.container.querySelector('.week-grid') || 
                           this.container.querySelector('#week-grid');
        
        if (!this.gridContainer) {
            console.warn('Week grid container not found');
            return;
        }
        
        // Initialize shared functionality
        await this.initShared();
        
        // Set up touch event handlers
        this.setupTouchHandlers();
        
        // Set up resize observer for dynamic alignment
        this.setupResizeObserver();
        
        console.log('📅 Week view initialized (Touchscreen optimized)');
    }
    
    /**
     * Render the week view
     */
    render() {
        if (!this.gridContainer) {
            console.warn('Week grid container not available');
            return;
        }
        
        const currentDate = this.core.getCurrentDate();
        const selectedDate = this.core.getSelectedDate();
        
        // Clear and rebuild
        this.gridContainer.innerHTML = '';
        this.gridContainer.className = 'week-view-touchscreen';
        
        // Create main structure
        this.createWeekStructure(currentDate, selectedDate);
        
        // Ensure grid alignment after render
        this.ensureGridAlignment();
        
        // Start time indicator
        this.startCurrentTimeUpdater();
        
        // Scroll to current time on initial render
        if (!this.isRendered) {
            this.scrollToCurrentTime();
        }
        
        this.isRendered = true;
    }
    
    /**
     * Create week structure optimized for touch
     */
    createWeekStructure(currentDate, selectedDate) {
        // Main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'week-main-container';
        
        // Fixed header
        const fixedHeader = this.createFixedHeader(currentDate);
        mainContainer.appendChild(fixedHeader);
        
        // Scrollable content area
        const scrollArea = document.createElement('div');
        scrollArea.className = 'week-scroll-area';
        this.scrollContainer = scrollArea;
        
        // Time grid
        const timeGrid = this.createTimeGrid(currentDate, selectedDate);
        scrollArea.appendChild(timeGrid);
        
        mainContainer.appendChild(scrollArea);
        this.gridContainer.appendChild(mainContainer);
    }
    
    /**
     * Create fixed header with day headers only
     */
    createFixedHeader(currentDate) {
        const header = document.createElement('div');
        header.className = 'week-fixed-header';
        
        // Day headers
        const dayHeaders = this.createDayHeaders(currentDate);
        
        header.appendChild(dayHeaders);
        
        return header;
    }
    

    
    /**
     * Create day headers with all-day events area
     */
    createDayHeaders(currentDate) {
        const container = document.createElement('div');
        container.className = 'week-days-header';
        
        // Time column header
        const timeColHeader = document.createElement('div');
        timeColHeader.className = 'time-col-header';
        container.appendChild(timeColHeader);
        
        const startOfWeek = getStartOfWeek(currentDate);
        
        // Day columns
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(startOfWeek, i);
            const dayCol = document.createElement('div');
            dayCol.className = 'day-header-col';
            
            if (isToday(dayDate)) {
                dayCol.classList.add('today');
            }
            if (isWeekend(dayDate)) {
                dayCol.classList.add('weekend');
            }
            
            // Day header info
            const dayInfo = document.createElement('div');
            dayInfo.className = 'day-header-info';
            
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = CALENDAR_CONFIG.DISPLAY.WEEKDAYS_SHORT[dayDate.getDay()];
            
            const dayNum = document.createElement('div');
            dayNum.className = 'day-num';
            dayNum.textContent = dayDate.getDate();
            
            dayInfo.appendChild(dayName);
            dayInfo.appendChild(dayNum);
            
            // All-day events container
            const allDayContainer = document.createElement('div');
            allDayContainer.className = 'all-day-container';
            
            // Get and render all-day events
            this.renderAllDayEvents(dayDate, allDayContainer);
            
            dayCol.appendChild(dayInfo);
            dayCol.appendChild(allDayContainer);
            
            // Touch handler for day selection
            dayCol.addEventListener('click', (e) => {
                if (e.target.closest('.all-day-event')) return;
                this.core.setSelectedDate(dayDate);
                this.render();
            });
            
            container.appendChild(dayCol);
        }
        
        return container;
    }
    
    /**
     * Render all-day events
     */
    renderAllDayEvents(date, container) {
        let events = this.core.getEventsForDate(date);
        
        if (this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }
        
        const allDayEvents = events.filter(e => e.allDay === true);
        
        // Clear existing events
        container.innerHTML = '';
        
        allDayEvents.slice(0, 2).forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'all-day-event';
            eventEl.textContent = event.title;
            
            const color = this.getEventColor(event);
            eventEl.style.backgroundColor = color;
            
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onEventSelect(event);
            });
            
            container.appendChild(eventEl);
        });
        
        if (allDayEvents.length > 2) {
            const moreEl = document.createElement('div');
            moreEl.className = 'all-day-more';
            moreEl.textContent = `+${allDayEvents.length - 2} more`;
            container.appendChild(moreEl);
        }
        
        // Trigger alignment update after all-day events change
        this.scheduleGridAlignment();
    }
    
    /**
     * Create time grid
     */
    createTimeGrid(currentDate, selectedDate) {
        const grid = document.createElement('div');
        grid.className = 'week-time-grid';
        
        // Time labels column
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-labels-column';
        
        for (let hour = this.startHour; hour < this.endHour; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.style.height = `${this.hourHeight}px`;
            timeLabel.textContent = this.formatHour(hour);
            timeColumn.appendChild(timeLabel);
        }
        
        grid.appendChild(timeColumn);
        
        // Create individual day columns that align with header
        const startOfWeek = getStartOfWeek(currentDate);
        
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(startOfWeek, i);
            const dayColumn = this.createDayColumn(dayDate, selectedDate);
            grid.appendChild(dayColumn);
        }
        
        // Current time indicator (now positioned absolutely across all day columns)
        const currentTimeIndicator = this.createCurrentTimeIndicator();
        grid.appendChild(currentTimeIndicator);
        
        return grid;
    }
    
    /**
     * Create day column with time slots and events
     */
    createDayColumn(date, selectedDate) {
        const column = document.createElement('div');
        column.className = 'day-column';
        column.dataset.date = date.toISOString().split('T')[0];
        
        if (isToday(date)) column.classList.add('today');
        if (isWeekend(date)) column.classList.add('weekend');
        if (isSameDay(date, selectedDate)) column.classList.add('selected');
        
        // Create hour slots
        for (let hour = this.startHour; hour < this.endHour; hour++) {
            const slot = document.createElement('div');
            slot.className = 'hour-slot';
            slot.style.height = `${this.hourHeight}px`;
            slot.dataset.hour = hour;
            
            // Event creation disabled - no click handler
            
            column.appendChild(slot);
        }
        
        // Add events
        this.renderDayEvents(date, column);
        
        return column;
    }
    
    /**
     * Render events for a day
     */
    renderDayEvents(date, column) {
        let events = this.core.getEventsForDate(date);
        
        if (this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }
        
        const timedEvents = events.filter(e => !e.allDay);
        
        timedEvents.forEach(event => {
            const eventEl = this.createEventElement(event);
            column.appendChild(eventEl);
        });
    }
    
    /**
     * Create event element
     */
    createEventElement(event) {
        const eventEl = document.createElement('div');
        eventEl.className = 'week-event';
        
        const startDate = new Date(event.start);
        const endDate = new Date(event.end || event.start);
        
        // Calculate position
        const startHour = startDate.getHours() + startDate.getMinutes() / 60;
        const endHour = endDate.getHours() + endDate.getMinutes() / 60;
        const duration = Math.max(0.5, endHour - startHour); // Minimum 30 min height
        
        const top = (startHour - this.startHour) * this.hourHeight;
        const height = duration * this.hourHeight;
        
        eventEl.style.top = `${top}px`;
        eventEl.style.height = `${height}px`;
        
        // Event content
        const timeText = document.createElement('div');
        timeText.className = 'event-time';
        timeText.textContent = this.formatEventTime(event);
        
        const titleText = document.createElement('div');
        titleText.className = 'event-title';
        titleText.textContent = event.title;
        
        eventEl.appendChild(timeText);
        eventEl.appendChild(titleText);
        
        // Apply color
        const color = this.getEventColor(event);
        eventEl.style.backgroundColor = color;
        eventEl.style.borderLeftColor = color;
        
        // Touch handler
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEventSelect(event);
        });
        
        return eventEl;
    }
    
    /**
     * Create current time indicator
     */
    createCurrentTimeIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'current-time-line';
        
        const dot = document.createElement('div');
        dot.className = 'current-time-dot';
        indicator.appendChild(dot);
        
        return indicator;
    }
    
    /**
     * Update current time indicator
     */
    updateCurrentTimeIndicator() {
        const indicator = this.container.querySelector('.current-time-line');
        if (!indicator) return;
        
        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;
        
        if (currentHour < this.startHour || currentHour > this.endHour) {
            indicator.style.display = 'none';
            return;
        }
        
        const top = (currentHour - this.startHour) * this.hourHeight;
        indicator.style.top = `${top}px`;
        indicator.style.display = 'block';
        
        // Check if today is in current week
        const currentDate = this.core.getCurrentDate();
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = addDays(startOfWeek, 6);
        
        if (now < startOfWeek || now > endOfWeek) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Scroll to current time
     */
    scrollToCurrentTime() {
        if (!this.scrollContainer) return;
        
        const now = new Date();
        const currentHour = Math.max(0, now.getHours() - 1); // Show 1 hour before
        const scrollTop = (currentHour - this.startHour) * this.hourHeight;
        
        setTimeout(() => {
            this.scrollContainer.scrollTop = Math.max(0, scrollTop);
        }, 100);
    }
    

    
    /**
     * Setup touch handlers
     */
    setupTouchHandlers() {
        if (!this.gridContainer) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        this.gridContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        this.gridContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - touchStartTime;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Horizontal swipe detection
            if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && touchDuration < 500) {
                if (deltaX > 0) {
                    this.navigatePrevious();
                } else {
                    this.navigateNext();
                }
            }
        }, { passive: true });
    }
    
    /**
     * Navigation methods
     */
    navigatePrevious() {
        const currentDate = this.core.getCurrentDate();
        const prevWeek = addDays(currentDate, -7);
        this.core.setCurrentDate(prevWeek);
        this.render();
    }
    
    navigateNext() {
        const currentDate = this.core.getCurrentDate();
        const nextWeek = addDays(currentDate, 7);
        this.core.setCurrentDate(nextWeek);
        this.render();
    }
    
    navigateToday() {
        this.core.setCurrentDate(new Date());
        this.render();
        this.scrollToCurrentTime();
    }
    
    /**
     * Format helpers
     */
    formatWeekTitle(date) {
        const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const weekNum = this.getWeekNumber(date);
        return `${month} - Week ${weekNum}`;
    }
    
    formatWeekRange(date) {
        const start = getStartOfWeek(date);
        const end = addDays(start, 6);
        
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `${startStr} - ${endStr}`;
    }
    
    formatHour(hour) {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    }
    
    formatEventTime(event) {
        const start = new Date(event.start);
        return start.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }
    
    /**
     * Get week number
     */
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    /**
     * Ensure grid alignment between header and time grid
     */
    ensureGridAlignment() {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            const headerGrid = this.container.querySelector('.week-days-header');
            const timeGrid = this.container.querySelector('.week-time-grid');
            
            if (!headerGrid || !timeGrid) return;
            
            // Temporarily remove transitions to prevent visual glitches
            headerGrid.style.transition = 'none';
            timeGrid.style.transition = 'none';
            
            // Force recalculation of grid layout
            headerGrid.style.display = 'none';
            headerGrid.offsetHeight; // Force reflow
            headerGrid.style.display = 'grid';
            
            timeGrid.style.display = 'none';
            timeGrid.offsetHeight; // Force reflow
            timeGrid.style.display = 'grid';

            // Compensate header width for scrollbar so columns line up
            this.updateHeaderScrollbarCompensation();
            // Normalize all-day row heights so each column matches tallest
            this.normalizeAllDayRowHeights();
            
            // Restore transitions after a frame
            requestAnimationFrame(() => {
                headerGrid.style.transition = '';
                timeGrid.style.transition = '';
                
                // Verify alignment and log if there are issues
                this.validateColumnAlignment();
            });
        });
    }

    /**
     * Measure and apply scrollbar compensation to header width
     */
    updateHeaderScrollbarCompensation() {
        const headerGrid = this.container.querySelector('.week-days-header');
        if (!headerGrid || !this.scrollContainer) return;
        const scrollbarWidth = Math.max(0, this.scrollContainer.offsetWidth - this.scrollContainer.clientWidth);
        if (scrollbarWidth > 0) {
            headerGrid.style.width = `calc(100% - ${scrollbarWidth}px)`;
        } else {
            headerGrid.style.width = '';
        }
    }

    /**
     * Ensure all-day containers share the same height (max across days)
     */
    normalizeAllDayRowHeights() {
        const allDayContainers = Array.from(this.container.querySelectorAll('.week-days-header .all-day-container'));
        if (!allDayContainers.length) return;
        // Reset any previous explicit heights to measure natural heights
        allDayContainers.forEach(el => {
            el.style.height = '';
        });
        const maxHeight = allDayContainers.reduce((max, el) => Math.max(max, el.scrollHeight), 0);
        if (maxHeight > 0) {
            allDayContainers.forEach(el => {
                el.style.height = `${maxHeight}px`;
            });
        }
    }
    
    /**
     * Validate column alignment (for debugging)
     */
    validateColumnAlignment() {
        const headerCols = this.container.querySelectorAll('.day-header-col');
        const dayCols = this.container.querySelectorAll('.day-column');
        
        if (headerCols.length !== dayCols.length) {
            console.warn('Column count mismatch:', headerCols.length, 'vs', dayCols.length);
            return;
        }
        
        // Check if columns are properly aligned
        for (let i = 0; i < headerCols.length; i++) {
            const headerRect = headerCols[i].getBoundingClientRect();
            const dayRect = dayCols[i].getBoundingClientRect();
            
            const widthDiff = Math.abs(headerRect.width - dayRect.width);
            const leftDiff = Math.abs(headerRect.left - dayRect.left);
            
            if (widthDiff > 1 || leftDiff > 1) {
                console.warn(`Column ${i} alignment issue:`, {
                    headerWidth: headerRect.width,
                    dayWidth: dayRect.width,
                    headerLeft: headerRect.left,
                    dayLeft: dayRect.left
                });
            }
        }
    }
    
    /**
     * Schedule grid alignment update (debounced)
     */
    scheduleGridAlignment() {
        if (this.alignmentTimeout) {
            clearTimeout(this.alignmentTimeout);
        }
        
        this.alignmentTimeout = setTimeout(() => {
            this.ensureGridAlignment();
            this.alignmentTimeout = null;
        }, 50);
    }
    
    /**
     * Handle window resize to maintain alignment
     */
    handleResize() {
        this.scheduleGridAlignment();
    }
    
    /**
     * Setup resize observer for dynamic alignment
     */
    setupResizeObserver() {
        if (!window.ResizeObserver || !this.container) return;
        
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === this.container) {
                    this.scheduleGridAlignment();
                    break;
                }
            }
        });
        
        this.resizeObserver.observe(this.container);
    }
    
    /**
     * Get event color
     */
    getEventColor(event) {
        if (event.color) {
            return event.color;
        }
        
        const calendarSource = event.calendarSource;
        if (calendarSource) {
            try {
                return calendarConfigService.getCalendarColor(calendarSource);
            } catch (error) {
                console.warn('Calendar configuration not available for:', calendarSource);
            }
        }
        
        return '#4285f4';
    }
    
    /**
     * Start/stop time updater
     */
    startCurrentTimeUpdater() {
        this.stopCurrentTimeUpdater();
        
        this.updateCurrentTimeIndicator();
        
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTimeIndicator();
        }, 60000); // Update every minute
    }
    
    stopCurrentTimeUpdater() {
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
            this.currentTimeInterval = null;
        }
    }
    
    /**
     * Lifecycle methods
     */
    onShow() {
        super.onShow();
        this.startCurrentTimeUpdater();
        this.scrollToCurrentTime();
    }
    
    onHide() {
        super.onHide();
        this.stopCurrentTimeUpdater();
    }
    
    destroy() {
        this.stopCurrentTimeUpdater();
        
        // Clean up alignment timeout
        if (this.alignmentTimeout) {
            clearTimeout(this.alignmentTimeout);
            this.alignmentTimeout = null;
        }
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        super.destroy();
    }
    
    getName() {
        return CALENDAR_CONFIG.VIEWS.WEEK;
    }
}