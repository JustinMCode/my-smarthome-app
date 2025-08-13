/**
 * Calendar Agenda View
 * Handles agenda view rendering and interactions
 */

import { ViewBase } from './view-base.js';
import { CALENDAR_CONFIG, CSS_CLASSES, SELECTORS } from '../utils/calendar-constants.js';
import { 
    addDays, 
    isToday, 
    isSameDay,
    formatDate
} from '../utils/calendar-date-utils.js';
import { calendarManager } from '../config/index.js';

export class AgendaView extends ViewBase {
    constructor(core, container) {
        super(core, container);
        this.agendaContainer = null;
        this.agendaList = null;
    }
    
    /**
     * Initialize the agenda view
     */
    init() {
        this.agendaContainer = this.container.querySelector('.agenda-container') || 
                             this.container.querySelector('#agenda');
        
        if (!this.agendaContainer) {
            console.warn('Agenda container not found');
            return;
        }
        
        this.agendaList = this.agendaContainer.querySelector('.agenda-list');
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('📅 Agenda view initialized');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Event interactions are handled in createAgendaItem
    }
    
    /**
     * Render the agenda view
     */
    render() {
        if (!this.agendaContainer) {
            console.warn('Agenda container not available');
            return;
        }
        
        // Only show loading if we're not already rendered and the core is loading
        if (!this.isRendered && this.core.state.get('isLoading')) {
            this.showLoading();
            return;
        }
        
        const currentDate = this.core.getCurrentDate();
        const selectedDate = this.core.getSelectedDate();
        
        // Title is updated by CalendarHeader component
        
        // Render agenda
        this.renderAgenda(currentDate, selectedDate);
        
        this.isRendered = true;
    }
    
    /**
     * Update the calendar title - handled by CalendarHeader component
     */
    updateTitle(date) {
        // Title updates are handled centrally by CalendarHeader
    }
    
    /**
     * Render the agenda
     */
    renderAgenda(currentDate, selectedDate) {
        // Clear existing content
        this.agendaContainer.innerHTML = '';
        
        // Create agenda header
        this.createAgendaHeader(currentDate);
        
        // Create agenda list
        this.createAgendaList(currentDate, selectedDate);
    }
    
    /**
     * Create agenda header
     */
    createAgendaHeader(currentDate) {
        const header = document.createElement('div');
        header.className = 'agenda-header';
        
        const dateEl = document.createElement('div');
        dateEl.className = 'agenda-date';
                    dateEl.textContent = formatDate(currentDate, 'full');
        
        const dayEl = document.createElement('div');
        dayEl.className = 'agenda-day';
                    dayEl.textContent = formatDate(currentDate, 'day-month');
        
        header.appendChild(dateEl);
        header.appendChild(dayEl);
        this.agendaContainer.appendChild(header);
    }
    
    /**
     * Create agenda list
     */
    createAgendaList(currentDate, selectedDate) {
        const list = document.createElement('div');
        list.className = 'agenda-list';
        
        // Get events for the next 7 days
        const events = this.getEventsForNextDays(currentDate, 7);
        
        if (events.length === 0) {
            this.showEmpty('No events scheduled for the next 7 days');
            return;
        }
        
        // Group events by date
        const groupedEvents = this.groupEventsByDate(events);
        
        // Create agenda items
        Object.entries(groupedEvents).forEach(([dateKey, dayEvents]) => {
            const dateGroup = this.createDateGroup(dateKey, dayEvents, selectedDate);
            list.appendChild(dateGroup);
        });
        
        this.agendaContainer.appendChild(list);
    }
    
    /**
     * Get events for next N days
     */
    getEventsForNextDays(startDate, days) {
        const events = [];
        
        for (let i = 0; i < days; i++) {
            const date = addDays(startDate, i);
            let dayEvents = this.core.getEventsForDate(date);
            // Apply calendar filter if available
            if (this.core.calendarFilter) {
                dayEvents = this.core.calendarFilter.filterEvents(dayEvents);
            }
            events.push(...dayEvents);
        }
        
        return events.sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    /**
     * Group events by date
     */
    groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const dateKey = event.start.toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        
        return grouped;
    }
    
    /**
     * Create a date group
     */
    createDateGroup(dateKey, dayEvents, selectedDate) {
        const group = document.createElement('div');
        group.className = 'agenda-date-group';
        
        // Date header
        const dateHeader = this.createDateHeader(dateKey, dayEvents.length);
        group.appendChild(dateHeader);
        
        // Agenda items
        dayEvents.forEach(event => {
            const agendaItem = this.createAgendaItem(event, selectedDate);
            group.appendChild(agendaItem);
        });
        
        return group;
    }
    
    /**
     * Create date header
     */
    createDateHeader(dateKey, eventCount) {
        const header = document.createElement('div');
        header.className = 'agenda-date-header';
        
        const date = new Date(dateKey);
        const label = document.createElement('div');
        label.className = 'agenda-date-label';
                    label.textContent = formatDate(date, 'short-date');
        
        const count = document.createElement('div');
        count.className = 'agenda-date-count';
        count.textContent = eventCount;
        
        header.appendChild(label);
        header.appendChild(count);
        
        return header;
    }
    
    /**
     * Create an agenda item
     */
    createAgendaItem(event, selectedDate) {
        const item = document.createElement('div');
        item.className = 'agenda-item';
        
        // Add state classes
        if (event.allDay) item.classList.add('all-day');
        if (new Date(event.start) < new Date()) item.classList.add('completed');
        
        // Time section
        const timeSection = this.createTimeSection(event);
        item.appendChild(timeSection);
        
        // Content section
        const contentSection = this.createContentSection(event);
        item.appendChild(contentSection);
        
        // Actions section
        const actionsSection = this.createActionsSection(event);
        item.appendChild(actionsSection);
        
        // Add click handler
        this.addAgendaItemInteraction(item, event);
        
        return item;
    }
    
    /**
     * Create time section
     */
    createTimeSection(event) {
        const timeSection = document.createElement('div');
        timeSection.className = 'agenda-time';
        
        if (event.allDay) {
            const allDay = document.createElement('div');
            allDay.className = 'agenda-time-start';
            allDay.textContent = 'All Day';
            timeSection.appendChild(allDay);
        } else {
            const startTime = document.createElement('div');
            startTime.className = 'agenda-time-start';
            startTime.textContent = formatTime(event.start);
            timeSection.appendChild(startTime);
            
            if (event.end) {
                const endTime = document.createElement('div');
                endTime.className = 'agenda-time-end';
                endTime.textContent = formatTime(event.end);
                timeSection.appendChild(endTime);
            }
        }
        
        return timeSection;
    }
    
    /**
     * Create content section
     */
    createContentSection(event) {
        const content = document.createElement('div');
        content.className = 'agenda-content';
        
        // Title
        const title = document.createElement('div');
        title.className = 'agenda-title';
        title.textContent = event.title;
        content.appendChild(title);
        
        // Location
        if (event.location) {
            const location = document.createElement('div');
            location.className = 'agenda-location';
            location.innerHTML = `
                <svg class="agenda-location-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                ${event.location}
            `;
            content.appendChild(location);
        }
        
        // Description
        if (event.description) {
            const description = document.createElement('div');
            description.className = 'agenda-description';
            description.textContent = event.description;
            content.appendChild(description);
        }
        
        // Duration
        if (!event.allDay && event.end) {
            const duration = this.calculateDuration(event.start, event.end);
            const durationEl = document.createElement('div');
            durationEl.className = 'agenda-duration';
            durationEl.textContent = duration;
            content.appendChild(durationEl);
        }
        
        return content;
    }
    
    /**
     * Create actions section
     */
    createActionsSection(event) {
        const actions = document.createElement('div');
        actions.className = 'agenda-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'agenda-action-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit event';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editEvent(event);
        });
        actions.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'agenda-action-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete event';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteEvent(event);
        });
        actions.appendChild(deleteBtn);
        
        return actions;
    }
    
    /**
     * Add interaction to agenda item
     */
    addAgendaItemInteraction(item, event) {
        item.addEventListener('click', () => {
            this.onEventSelect(event);
        });
        
        // Touch feedback
        this.addTouchFeedback(item);
        
        // Touch events for ripple effect
        item.addEventListener('touchstart', (e) => {
            this.createRipple(e, item);
        });
    }
    
    /**
     * Calculate duration between two times
     */
    calculateDuration(start, end) {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours === 0) {
            return `${diffMinutes}m`;
        } else if (diffMinutes === 0) {
            return `${diffHours}h`;
        } else {
            return `${diffHours}h ${diffMinutes}m`;
        }
    }
    
    /**
     * Edit event
     */
    editEvent(event) {
        this.core.showNotification(`Edit event: ${event.title}`, 'info');
        // TODO: Implement edit dialog
    }
    
    /**
     * Delete event
     */
    deleteEvent(event) {
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            this.core.deleteEvent(event.id);
            this.core.showNotification('Event deleted', 'success');
        }
    }
    
    /**
     * Update the view
     */
    update() {
        if (this.isActive && this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Called when view is shown
     */
    onShow() {
        this.render();
    }
    
    /**
     * Called when view is hidden
     */
    onHide() {
        // Reset rendered flag when view is hidden
        this.isRendered = false;
    }
    
    /**
     * Get view name
     */
    getName() {
        return CALENDAR_CONFIG.VIEWS.AGENDA;
    }
    
    /**
     * Handle event selection
     */
    onEventSelect(event) {
        super.onEventSelect(event);
    }
}
