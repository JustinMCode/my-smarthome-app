/**
 * Calendar Month View - Refactored
 * Enhanced month view using modular components
 */

import { ViewBase } from './view-base.js';
import { ViewMixin } from '../mixins/ViewMixin.js';
import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/calendar-constants.js';
import { 
    getCalendarGridDates, 
    isToday, 
    isWeekend, 
    isCurrentMonth,
    isSameDay
} from '../utils/calendar-date-utils.js';
import { addTouchFeedback, createRipple } from '../utils/touch-interactions.js';
import { calendarConfigService } from '../config/calendar-config-service.js';
import { logger } from '../../utils/logger.js';

// Apply the ViewMixin to create an enhanced base class
const EnhancedViewBase = ViewMixin(ViewBase);

export class MonthViewRefactored extends EnhancedViewBase {
    constructor(core, container) {
        super(core, container);
        this.gridContainer = null;
        this.weekdayHeaders = null;
    }

    /**
     * Initialize the month view
     */
    async init() {
        this.gridContainer = this.container.querySelector('.month-grid') || 
                           this.container.querySelector('#month-grid');
        
        if (!this.gridContainer) {
            console.warn('Month grid container not found');
            return;
        }
        
        this.weekdayHeaders = this.container.querySelector('.weekday-headers');
        
        // Initialize shared functionality
        await this.initShared();
        
        logger.init('Month View', 'Initialized');
    }
    

    
    /**
     * Render the month view
     */
    render() {
        logger.debug('Month View', 'Render called');
        
        if (!this.gridContainer) {
            logger.warn('Month View', 'Grid container not available');
            return;
        }
        
        // Only show loading if we're not already rendered and the core is loading
        if (!this.isRendered && this.core.state.get('isLoading')) {
            logger.debug('Month View', 'Calendar is loading, showing loading state');
            this.showLoading();
            return;
        }
        
        const currentDate = this.core.getCurrentDate();
        const selectedDate = this.core.getSelectedDate();
        
        logger.debug('Month View', 'Rendering month view:', {
            currentDate,
            selectedDate,
            gridContainer: !!this.gridContainer
        });
        
        // Render weekday headers if not already present
        this.renderWeekdayHeaders();
        
        // Render month grid
        this.renderMonthGrid(currentDate, selectedDate);
        
        this.isRendered = true;
        logger.debug('Month View', 'Render complete');
    }
    
    /**
     * Render weekday headers
     */
    renderWeekdayHeaders() {
        if (this.weekdayHeaders && this.weekdayHeaders.children.length === 0) {
            const weekdays = CALENDAR_CONFIG.DISPLAY.WEEKDAYS;
            weekdays.forEach(day => {
                const header = document.createElement('div');
                header.className = 'weekday-header';
                header.textContent = day;
                this.weekdayHeaders.appendChild(header);
            });
        }
    }
    
    /**
     * Render the month grid
     */
    renderMonthGrid(currentDate, selectedDate) {
        // Clear existing content
        this.gridContainer.innerHTML = '';
        
        // Get calendar grid dates
        const gridDates = getCalendarGridDates(currentDate);
        
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Create day cells
        gridDates.forEach(({ date, isOtherMonth }) => {
            const dayCell = this.createDayCell(date, isOtherMonth, selectedDate);
            fragment.appendChild(dayCell);
        });
        
        // Append all cells at once
        this.gridContainer.appendChild(fragment);
    }
    
    /**
     * Create a day cell
     */
    createDayCell(date, isOtherMonth, selectedDate) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        // Add state classes
        if (isOtherMonth) cell.classList.add(CSS_CLASSES.OTHER_MONTH);
        if (isToday(date)) cell.classList.add(CSS_CLASSES.TODAY);
        if (isSameDay(date, selectedDate)) cell.classList.add(CSS_CLASSES.SELECTED);
        if (isWeekend(date)) cell.classList.add(CSS_CLASSES.WEEKEND);
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = CSS_CLASSES.DAY_NUMBER;
        dayNumber.textContent = date.getDate();
        cell.appendChild(dayNumber);
        
        // Events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = CSS_CLASSES.DAY_EVENTS;
        
        // Get events for this date using original method for proper calendar filtering
        let events = this.core.getEventsForDate(date);
        
        // Apply calendar filter if available
        if (this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }
        
        // Show only 1 event, then "+ X events" for additional events
        const maxDisplay = 1;
        
        // Add only the first event pill
        if (events.length > 0) {
            const eventEl = this.createEventPill(events[0], {
                showTime: true,
                showBullet: true,
                maxWidth: '100%',
                className: 'event-pill'
            });
            eventsContainer.appendChild(eventEl);
        }
        
        // Add "more events" indicator if there are additional events
        if (events.length > 1) {
            const moreEl = document.createElement('div');
            moreEl.className = CSS_CLASSES.MORE_EVENTS;
            moreEl.textContent = `+${events.length - 1} events`;
            
            // Add click handler to trigger day cell click
            moreEl.addEventListener('click', (e) => {
                e.stopPropagation();
                // Trigger the day cell click to show all events
                this.onDateSelect(date);
            });
            
            eventsContainer.appendChild(moreEl);
        }
        
        cell.appendChild(eventsContainer);
        
        // Add click handler
        this.addDayCellInteraction(cell, date);
        
        return cell;
    }
    

    
    /**
     * Add interaction to day cell
     */
    addDayCellInteraction(cell, date) {
        // Click handler
        cell.addEventListener('click', () => {
            // Visual feedback
            cell.style.animation = 'cellSelect 0.3s ease';
            setTimeout(() => {
                cell.style.animation = '';
            }, 300);
            
            this.onDateSelect(date);
        });
        
        // Touch feedback using shared component
                    addTouchFeedback(cell);
        
        // Touch events for ripple effect
        cell.addEventListener('touchstart', (e) => {
            createRipple(e, cell);
        });
    }
    
    /**
     * Handle date selection
     */
    onDateSelect(date) {
        // Don't call super.onDateSelect() to avoid switching to agenda view
        // Just update the selected date in state
        this.core.state.setSelectedDate(date);
        
        // Update selected date visual state
        this.updateSelectedDate(date);
        
        // Show events popup for the selected date using shared component
        let events = this.core.getEventsForDate(date);
        
        // Apply calendar filter if available (consistent with event display)
        if (this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }
        
        this.showDayEventsPopup(date, events);
    }
    
    /**
     * Update selected date visual state
     * Always keep the board on the current day (today) instead of the clicked day
     */
    updateSelectedDate(selectedDate) {
        // Remove previous selection
        const previousSelected = this.gridContainer.querySelector('.selected');
        if (previousSelected) {
            previousSelected.classList.remove(CSS_CLASSES.SELECTED);
        }
        
        // Always add selection to today's date, not the clicked date
        const currentDate = this.core.getCurrentDate();
        const today = new Date(); // Get actual today's date
        const gridDates = getCalendarGridDates(currentDate);
        
        gridDates.forEach(({ date, isOtherMonth }, index) => {
            if (isToday(date)) { // Use isToday instead of comparing with selectedDate
                const cell = this.gridContainer.children[index];
                if (cell) {
                    cell.classList.add(CSS_CLASSES.SELECTED);
                }
            }
        });
    }
    
    /**
     * Get view name
     */
    getName() {
        return CALENDAR_CONFIG.VIEWS.MONTH;
    }
}
