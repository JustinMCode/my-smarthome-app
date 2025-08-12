/**
 * Calendar Week View - Refactored
 * Enhanced week view using modular components
 */

import { ViewBase } from './view-base.js';
import { ViewMixin } from '../mixins/ViewMixin.js';
import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/calendar-constants.js';
import { 
    getStartOfWeek, 
    addDays, 
    isToday, 
    isWeekend,
    isSameDay
} from '../utils/calendar-date-utils.js';
import { calendarConfigService } from '../config/calendar-config-service.js';

// Apply the ViewMixin to create an enhanced base class
const EnhancedViewBase = ViewMixin(ViewBase);

export class WeekViewRefactored extends EnhancedViewBase {
    constructor(core, container) {
        super(core, container);
        this.gridContainer = null;
        this.currentTimeInterval = null;
        this.dragState = null;
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
        
        console.log('📅 Week view initialized');
    }
    
    /**
     * Render the week view
     */
    render() {
        if (!this.gridContainer) {
            console.warn('Week grid container not available');
            return;
        }
        
        // Only show loading if we're not already rendered and the core is loading
        if (!this.isRendered && this.core.state.get('isLoading')) {
            this.showLoading();
            return;
        }
        
        const currentDate = this.core.getCurrentDate();
        const selectedDate = this.core.getSelectedDate();
        
        // Clear and rebuild
        this.gridContainer.innerHTML = '';
        
        // Create main structure
        this.createWeekStructure(currentDate, selectedDate);
        
        // Update current time indicator
        this.updateCurrentTimeIndicator();
        
        this.isRendered = true;
    }
    
    /**
     * Create week structure
     */
    createWeekStructure(currentDate, selectedDate) {
        const wrapper = document.createElement('div');
        wrapper.className = 'week-grid-wrapper';
        
        // Header section
        const headerSection = this.createHeaderSection(currentDate);
        this.gridContainer.appendChild(headerSection);
        
        // Grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'week-grid-container';
        
        // Day headers
        const dayHeaders = this.createDayHeaders(currentDate);
        gridContainer.appendChild(dayHeaders);
        
        // All day section
        const allDaySection = this.createAllDaySection(currentDate);
        gridContainer.appendChild(allDaySection);
        
        // Time grid
        const timeGrid = this.createTimeGrid(currentDate, selectedDate);
        gridContainer.appendChild(timeGrid);
        
        // Current time indicator
        const currentTimeIndicator = this.createCurrentTimeIndicator();
        timeGrid.appendChild(currentTimeIndicator);
        
        wrapper.appendChild(gridContainer);
        this.gridContainer.appendChild(wrapper);
    }
    
    /**
     * Create header section
     */
    createHeaderSection(currentDate) {
        const header = document.createElement('div');
        header.className = 'week-header-section';
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'week-title-container';
        
        const title = document.createElement('h2');
        title.className = 'week-title';
        title.textContent = this.formatNavigationTitle(currentDate, 'week');
        
        const dateRange = document.createElement('div');
        dateRange.className = 'week-date-range';
        dateRange.textContent = this.formatWeekRange(currentDate);
        
        titleContainer.appendChild(title);
        titleContainer.appendChild(dateRange);
        
        // Navigation using shared component
        const nav = this.createNavigationControls({
            className: 'week-nav',
            prevText: '←',
            nextText: '→',
            todayText: 'Today'
        });
        
        header.appendChild(titleContainer);
        header.appendChild(nav);
        
        return header;
    }
    
    /**
     * Create day headers
     */
    createDayHeaders(currentDate) {
        const container = document.createElement('div');
        container.className = 'week-day-headers';
        
        // Empty cell for time column
        const timeHeader = document.createElement('div');
        timeHeader.className = 'week-day-header time-header';
        container.appendChild(timeHeader);
        
        const startOfWeek = getStartOfWeek(currentDate);
        
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(startOfWeek, i);
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-day-header';
            
            if (isToday(dayDate)) {
                dayHeader.classList.add('today');
            }
            if (isWeekend(dayDate)) {
                dayHeader.classList.add('weekend');
            }
            
            const dayName = document.createElement('div');
            dayName.className = 'week-day-name';
            dayName.textContent = CALENDAR_CONFIG.DISPLAY.WEEKDAYS_SHORT[dayDate.getDay()];
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'week-day-number';
            dayNumber.textContent = dayDate.getDate();
            
            dayHeader.appendChild(dayName);
            dayHeader.appendChild(dayNumber);
            
            // Add click handler
            dayHeader.addEventListener('click', () => {
                this.core.setSelectedDate(dayDate);
            });
            
            container.appendChild(dayHeader);
        }
        
        return container;
    }
    
    /**
     * Create all-day events section
     */
    createAllDaySection(currentDate) {
        const section = document.createElement('div');
        section.className = 'all-day-section';
        
        const label = document.createElement('div');
        label.className = 'all-day-label';
        label.textContent = 'All Day';
        section.appendChild(label);
        
        const startOfWeek = getStartOfWeek(currentDate);
        
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(startOfWeek, i);
            const cell = document.createElement('div');
            cell.className = 'all-day-cell';
            
            if (isToday(dayDate)) {
                cell.classList.add('today');
            }
            if (isWeekend(dayDate)) {
                cell.classList.add('weekend');
            }
            
            // Get all-day events using original method for proper calendar filtering
            let allDayEvents = this.core.getEventsForDate(dayDate);
            
            // Apply calendar filter if available
            if (this.core.calendarFilter) {
                allDayEvents = this.core.calendarFilter.filterEvents(allDayEvents);
            }
            
            allDayEvents = allDayEvents.filter(event => event.allDay === true);
            allDayEvents.forEach(event => {
                const eventEl = this.createAllDayEvent(event);
                cell.appendChild(eventEl);
            });
            
            // Add drop zone for all-day events
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.classList.add('drag-over');
            });
            
            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drag-over');
            });
            
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');
                // Handle drop logic
            });
            
            section.appendChild(cell);
        }
        
        return section;
    }
    
    /**
     * Create time grid
     */
    createTimeGrid(currentDate, selectedDate) {
        const grid = document.createElement('div');
        grid.className = 'week-time-grid';
        
        const startOfWeek = getStartOfWeek(currentDate);
        const startHour = 6;
        const endHour = 22;
        
        // Create time column
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        
        for (let hour = startHour; hour < endHour; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = this.formatHour(hour);
            timeColumn.appendChild(timeLabel);
        }
        
        grid.appendChild(timeColumn);
        
        // Create day columns
        for (let day = 0; day < 7; day++) {
            const dayDate = addDays(startOfWeek, day);
            const dayColumn = this.createDayColumn(dayDate, selectedDate, startHour, endHour);
            grid.appendChild(dayColumn);
        }
        
        return grid;
    }
    
    /**
     * Create day column
     */
    createDayColumn(dayDate, selectedDate, startHour, endHour) {
        const wrapper = document.createElement('div');
        wrapper.className = 'day-column-wrapper';
        
        if (isToday(dayDate)) wrapper.classList.add('today');
        if (isWeekend(dayDate)) wrapper.classList.add('weekend');
        
        // Create time slots
        for (let hour = startHour; hour < endHour; hour++) {
            const slot = this.createTimeSlot(dayDate, hour);
            wrapper.appendChild(slot);
        }
        
        // Add events using original layout logic for proper calendar filtering
        let events = this.core.getEventsForDate(dayDate);
        
        // Apply calendar filter if available
        if (this.core.calendarFilter) {
            events = this.core.calendarFilter.filterEvents(events);
        }
        
        events = events.filter(event => !event.allDay);
        const eventElements = this.layoutDayEvents(events, wrapper, startHour, endHour);
        eventElements.forEach(el => wrapper.appendChild(el));
        
        return wrapper;
    }
    
    /**
     * Layout events for a day with overlap handling
     */
    layoutDayEvents(events, container, startHour, endHour) {
        const elements = [];
        const slotHeight = 72; // Match CSS variable
        
        // Sort events by start time
        events.sort((a, b) => new Date(a.start) - new Date(b.start));
        
        // Group overlapping events
        const groups = [];
        events.forEach(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end || event.start);
            
            let added = false;
            for (const group of groups) {
                const groupEnd = Math.max(...group.map(e => new Date(e.end || e.start).getTime()));
                if (eventStart.getTime() < groupEnd) {
                    group.push(event);
                    added = true;
                    break;
                }
            }
            
            if (!added) {
                groups.push([event]);
            }
        });
        
        // Create elements for each group
        groups.forEach((group, groupIndex) => {
            group.forEach((event, index) => {
                const eventEl = this.createWeekEvent(event);
                
                // Calculate position
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end || event.start);
                const startMinutes = (eventStart.getHours() - startHour) * 60 + eventStart.getMinutes();
                const endMinutes = (eventEnd.getHours() - startHour) * 60 + eventEnd.getMinutes();
                const duration = Math.max(30, endMinutes - startMinutes); // Minimum 30 minutes height
                
                const top = (startMinutes / 60) * slotHeight;
                const height = (duration / 60) * slotHeight;
                
                eventEl.style.top = `${top}px`;
                eventEl.style.height = `${height}px`;
                
                // Handle overlaps
                if (group.length > 1) {
                    const width = 100 / group.length;
                    eventEl.style.width = `calc(${width}% - 6px)`;
                    eventEl.style.left = `${width * index}%`;
                    eventEl.classList.add(`overlap-${Math.min(index + 1, 3)}`);
                }
                
                elements.push(eventEl);
            });
        });
        
        return elements;
    }
    
    /**
     * Create week event element (original implementation for proper calendar colors)
     */
    createWeekEvent(event) {
        const eventEl = document.createElement('div');
        eventEl.className = `week-event ${event.category || 'default'}`;
        eventEl.draggable = true;
        
        const timeEl = document.createElement('div');
        timeEl.className = 'week-event-time';
        timeEl.textContent = this.formatEventTime(event);
        
        const titleEl = document.createElement('div');
        titleEl.className = 'week-event-title';
        titleEl.textContent = event.title;
        
        if (event.location) {
            const locationEl = document.createElement('div');
            locationEl.className = 'week-event-location';
            locationEl.innerHTML = `📍 ${event.location}`;
            eventEl.appendChild(locationEl);
        }
        
        eventEl.appendChild(timeEl);
        eventEl.appendChild(titleEl);
        
        // Apply calendar color
        const color = this.getEventColor(event);
        if (color) {
            // For timed events, use the actual Google Calendar color
            eventEl.style.background = color;
            eventEl.style.border = `1px solid ${color}`;
        }
        
        // Event handlers
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEventSelect(event);
        });
        
        eventEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(event));
            eventEl.classList.add('dragging');
        });
        
        eventEl.addEventListener('dragend', () => {
            eventEl.classList.remove('dragging');
        });
        
        // Add touch feedback
        this.addTouchFeedback(eventEl);
        
        return eventEl;
    }
    
    /**
     * Create all-day event element (original implementation for proper calendar colors)
     */
    createAllDayEvent(event) {
        const eventEl = document.createElement('div');
        eventEl.className = 'all-day-event';
        
        // Check if this is a multi-day event
        const isMultiDay = this.isMultiDayEvent(event);
        eventEl.textContent = event.title;
        
        const color = this.getEventColor(event);
        if (color) {
            // For all-day events, use filled background with actual Google Calendar color and white text
            eventEl.style.background = color;
            eventEl.style.border = 'none';
            eventEl.style.color = 'white';
            eventEl.style.fontWeight = '600';
            eventEl.style.boxShadow = `0 2px 4px ${color}40`; // Add subtle shadow with color
        }
        
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEventSelect(event);
        });
        
        this.addTouchFeedback(eventEl);
        
        return eventEl;
    }
    
    /**
     * Get event color for styling
     */
    getEventColor(event) {
        // Use the actual Google Calendar color if available
        if (event.color) {
            return event.color;
        }
        
        // Fallback to calendar configuration service
        const calendarSource = event.calendarSource;
        if (calendarSource) {
            try {
                return calendarConfigService.getCalendarColor(calendarSource);
            } catch (error) {
                console.warn('Calendar configuration not available for:', calendarSource);
            }
        }
        
        // Final fallback to Google Calendar default blue
        return '#4285f4';
    }

    /**
     * Check if an event spans multiple days
     */
    isMultiDayEvent(event) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        
        // For all-day events, check if they span more than one day
        if (event.allDay) {
            const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const diffTime = endDate.getTime() - startDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 1;
        }
        
        // For timed events, check if they span across midnight
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return startDate.getTime() !== endDate.getTime();
    }
    
    /**
     * Format event time for display
     */
    formatEventTime(event) {
        const start = new Date(event.start);
        return start.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }
    
    /**
     * Create time slot
     */
    createTimeSlot(dayDate, hour) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.dataset.date = dayDate.toISOString();
        slot.dataset.hour = hour;
        
        // Add interaction
        slot.addEventListener('click', (e) => {
            if (e.target === slot) {
                this.handleTimeSlotClick(dayDate, hour);
            }
        });
        
        // Drag to create event
        slot.addEventListener('mousedown', (e) => {
            if (e.target === slot) {
                this.startDragCreate(e, dayDate, hour);
            }
        });
        
        return slot;
    }
    
    /**
     * Create current time indicator
     */
    createCurrentTimeIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'current-time-indicator';
        
        const timeText = document.createElement('div');
        timeText.className = 'current-time-text';
        indicator.appendChild(timeText);
        
        return indicator;
    }
    
    /**
     * Handle time slot click
     */
    handleTimeSlotClick(date, hour) {
        const eventTime = new Date(date);
        eventTime.setHours(hour, 0, 0, 0);
        
        this.onDateSelect(eventTime);
        this.showQuickAddDialog(eventTime);
    }
    
    /**
     * Start drag to create event
     */
    startDragCreate(e, date, hour) {
        this.dragState = {
            startDate: date,
            startHour: hour,
            startY: e.clientY
        };
        
        const indicator = document.createElement('div');
        indicator.className = 'event-creation-indicator';
        indicator.style.top = `${(hour - 6) * 72}px`;
        indicator.style.height = '72px';
        e.target.parentElement.appendChild(indicator);
        
        const handleMouseMove = (e) => {
            const dragIndicator = this.gridLayoutEngine.calculateDragIndicator(
                this.dragState.startY, 
                e.clientY, 
                this.dragState.startHour
            );
            indicator.style.height = `${dragIndicator.height}px`;
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            indicator.remove();
            
            // Create event with calculated duration
            const dragIndicator = this.gridLayoutEngine.calculateDragIndicator(
                this.dragState.startY, 
                e.clientY, 
                this.dragState.startHour
            );
            
            const startTime = new Date(this.dragState.startDate);
            startTime.setHours(this.dragState.startHour, 0, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + dragIndicator.hours);
            
            this.showQuickAddDialog(startTime, endTime);
            
            this.dragState = null;
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    /**
     * Update current time indicator position
     */
    updateCurrentTimeIndicator() {
        const indicator = this.container.querySelector('.current-time-indicator');
        if (!indicator) return;
        
        const position = this.calculateCurrentTimePosition();
        
        if (!position.visible) {
            indicator.style.display = 'none';
            return;
        }
        
        indicator.style.display = 'block';
        indicator.style.top = `${position.top}px`;
        
        // Update time text
        const timeText = indicator.querySelector('.current-time-text');
        if (timeText) {
            timeText.textContent = position.time;
        }
    }
    
    /**
     * Start current time indicator updater
     */
    startCurrentTimeUpdater() {
        // Clear existing interval
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
        }
        
        // Update every minute
        this.currentTimeInterval = setInterval(() => {
            if (this.isActive) {
                this.updateCurrentTimeIndicator();
            }
        }, 60000);
        
        // Initial update
        this.updateCurrentTimeIndicator();
    }
    
    /**
     * Format week range
     */
    formatWeekRange(date) {
        const start = getStartOfWeek(date);
        const end = addDays(start, 6);
        
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `${startStr} - ${endStr}`;
    }
    
    /**
     * Format hour for display
     */
    formatHour(hour) {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    }
    
    /**
     * Called when view is shown
     */
    onShow() {
        super.onShow();
        this.startCurrentTimeUpdater();
    }
    
    /**
     * Called when view is hidden
     */
    onHide() {
        super.onHide();
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
            this.currentTimeInterval = null;
        }
    }
    
    /**
     * Clean up
     */
    destroy() {
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
        }
        super.destroy();
    }
    
    /**
     * Get view name
     */
    getName() {
        return CALENDAR_CONFIG.VIEWS.WEEK;
    }
}
