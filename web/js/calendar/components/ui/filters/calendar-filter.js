/**
 * Calendar Filter Component - Enhanced
 * Allows users to toggle visibility of different calendars with improved UX
 */

import { calendarConfigService } from '../../../config/calendar-config-service.js';
import { logger } from '../../../../utils/logger.js';

export class CalendarFilter {
    constructor(core) {
        this.core = core;
        this.visibleCalendars = new Set();
        this.calendarNames = {};
        this.eventCounts = {};
        
        this.element = null;
        this.dropdown = null;
        this.button = null;
        this.isOpen = false;
        this.isAnimating = false;
    }

    /**
     * Initialize the filter component
     */
    async init() {
        // Load calendar configuration first
        await calendarConfigService.loadCalendars();
        
        // Discover available calendars first
        this.discoverCalendars();
        
        // Create and setup UI
        this.createFilterUI();
        this.loadSettings();
        this.bindEvents();
        
        // Initial event count update
        this.updateEventCounts();
        
        // Listen for calendar configuration changes
        window.addEventListener('calendarConfigChanged', () => {
            this.refresh();
        });
        
        logger.init('Calendar Filter', `Initialized with ${this.visibleCalendars.size} calendars`);
    }

    /**
     * Discover available calendars from configuration and events
     */
    discoverCalendars() {
        if (!this.core) {
            logger.warn('Calendar Filter', 'No core available for calendar discovery');
            return;
        }
        
        // Get all available calendars from configuration service
        const allCalendars = calendarConfigService.getAllCalendars();
        logger.debug('Calendar Filter', `Found ${allCalendars.length} calendars from configuration`);
        
        // Get events for counting
        const events = this.core.getEvents();
        logger.debug('Calendar Filter', `Found ${events.length} events for event counting`);
        
        // Clear existing data
        this.calendarNames = {};
        this.visibleCalendars.clear();
        this.eventCounts = {};
        
        // Process all calendars from configuration and count events
        const calendarData = [];
        allCalendars.forEach(calendar => {
            const source = calendar.name; // Use calendar name as source to match events
            const calendarId = calendar.id; // Keep ID for reference
            const calendarName = calendar.name;
            const calendarColor = calendar.color;
            
            // Count events per calendar
            const eventCount = events.filter(e => 
                e.calendarSource === source
            ).length;
            
            calendarData.push({
                source,
                calendarId,
                calendarName,
                calendarColor,
                eventCount
            });
            
            logger.debug('Calendar Filter', `Added calendar ${source} (ID: ${calendarId}) with name ${calendarName} and ${eventCount} events`);
        });
        
        // Sort calendars by event count (most to least)
        calendarData.sort((a, b) => b.eventCount - a.eventCount);
        
        // Store sorted calendars
        calendarData.forEach(calendar => {
            this.calendarNames[calendar.source] = calendar.calendarName;
            this.visibleCalendars.add(calendar.source); // Default to visible
            this.eventCounts[calendar.source] = calendar.eventCount;
        });
        
        logger.debug('Calendar Filter', `Total calendars discovered: ${this.visibleCalendars.size}`);
    }

    /**
     * Get color for calendar (gradient or solid)
     */
    getCalendarColor(source, solid = false) {
        return calendarConfigService.getCalendarColor(source);
    }

    /**
     * Create the filter UI
     */
    createFilterUI() {
        this.element = document.createElement('div');
        this.element.className = 'calendar-filter';
        
        // Create button
        const buttonHtml = `
            <div class="filter-button" id="calendar-filter-btn">
                <span>Calendars</span>
                <span class="calendar-count pulse">${this.visibleCalendars.size}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-arrow">
                    <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
            </div>
        `;
        
        // Create dropdown
        const dropdownHtml = `
            <div class="filter-dropdown" id="calendar-filter-dropdown">
                <div class="filter-header">
                    <h3>My Calendars</h3>
                    <div class="filter-actions">
                        <button class="btn-text" id="show-all-calendars">Show All</button>
                        <button class="btn-text" id="hide-all-calendars">Hide All</button>
                    </div>
                </div>
                <div class="calendar-list" id="calendar-list">
                    ${this.renderCalendarList()}
                </div>
                <div class="filter-footer">
                    <span class="calendar-summary">
                        <strong>${this.visibleCalendars.size}</strong> calendars • 
                        <strong>${this.getTotalEventCount()}</strong> total events
                    </span>
                </div>
            </div>
        `;
        
        this.element.innerHTML = buttonHtml + dropdownHtml;
        
        // Store references
        this.button = this.element.querySelector('#calendar-filter-btn');
        this.dropdown = this.element.querySelector('#calendar-filter-dropdown');
    }

    /**
     * Render the list of calendars
     */
    renderCalendarList() {
        // Create sorted array of calendar entries
        const sortedCalendars = Object.entries(this.calendarNames)
            .map(([id, name]) => ({
                id,
                name,
                eventCount: this.eventCounts[id] || 0
            }))
            .sort((a, b) => b.eventCount - a.eventCount); // Sort by event count (most to least)
        
        return sortedCalendars.map(({id, name, eventCount}) => {
            const isVisible = this.visibleCalendars.has(id);
            const color = calendarConfigService.getCalendarColor(id); // Get solid color, not gradient
            
            return `
                <div class="calendar-item" data-calendar-id="${id}">
                    <label class="calendar-toggle ${isVisible ? 'checked' : ''}">
                        <input type="checkbox" ${isVisible ? 'checked' : ''} data-calendar-id="${id}">
                        <div class="checkbox-wrapper">
                            <div class="checkmark"></div>
                        </div>
                        <div class="calendar-indicator ${eventCount > 0 ? 'pulse' : ''}" 
                             style="background: ${color}"></div>
                        <div class="calendar-info">
                            <span class="calendar-name">${name}</span>
                            <span class="event-count">
                                <span class="event-count-badge">${eventCount} event${eventCount !== 1 ? 's' : ''}</span>
                            </span>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    /**
     * Get total event count for visible calendars
     */
    getTotalEventCount() {
        return Array.from(this.visibleCalendars).reduce((total, calendarId) => {
            return total + (this.eventCounts[calendarId] || 0);
        }, 0);
    }

    /**
     * Update event counts for all calendars
     */
    updateEventCounts() {
        if (!this.core) return;
        
        const events = this.core.getEvents();
        
        // Reset counts for all known calendars
        Object.keys(this.calendarNames).forEach(source => {
            this.eventCounts[source] = 0;
        });
        
        // Count events
        events.forEach(event => {
            const source = event.calendarSource || 'calendar-0';
            if (this.eventCounts.hasOwnProperty(source)) {
                this.eventCounts[source]++;
            }
        });
        
        // Update UI if rendered
        this.updateEventCountsUI();
    }

    /**
     * Update event count display in UI
     */
    updateEventCountsUI() {
        if (!this.element) return;
        
        // Update individual calendar counts
        Object.entries(this.eventCounts).forEach(([id, count]) => {
            const item = this.element.querySelector(`.calendar-item[data-calendar-id="${id}"] .event-count-badge`);
            if (item) {
                item.textContent = `${count} event${count !== 1 ? 's' : ''}`;
            }
        });
        
        // Update footer
        const summary = this.element.querySelector('.calendar-summary');
        if (summary) {
            summary.innerHTML = `
                <strong>${this.visibleCalendars.size}</strong> calendars • 
                <strong>${this.getTotalEventCount()}</strong> total events
            `;
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Show/Hide all buttons
        const showAllBtn = this.element.querySelector('#show-all-calendars');
        const hideAllBtn = this.element.querySelector('#hide-all-calendars');
        
        showAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.animateButton(showAllBtn);
            this.showAllCalendars();
        });
        
        hideAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.animateButton(hideAllBtn);
            this.hideAllCalendars();
        });

        // Individual calendar toggles
        const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleCalendar(e.target.dataset.calendarId, e.target.checked);
                this.updateToggleState(checkbox);
            });
        });

        // Note: Click-outside detection is now handled by addGlobalClickHandler() when dropdown opens

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                console.log('Escape key pressed, closing dropdown...');
                this.closeDropdown();
            }
        });
    }

    /**
     * Toggle dropdown visibility with animation
     */
    toggleDropdown() {
        if (this.isAnimating) return;
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.openDropdown();
        } else {
            this.closeDropdown();
        }
    }

    /**
     * Open dropdown with animation
     */
    openDropdown() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isOpen = true;
        
        this.element.classList.add('open');
        this.dropdown.classList.add('show');
        
        // Add global click handler when dropdown opens
        this.addGlobalClickHandler();
        
        // Re-render list to trigger animations
        const list = this.element.querySelector('#calendar-list');
        const currentHTML = list.innerHTML;
        list.innerHTML = '';
        requestAnimationFrame(() => {
            list.innerHTML = currentHTML;
            this.rebindCheckboxes();
        });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    /**
     * Close dropdown with animation
     */
    closeDropdown() {
        console.log('closeDropdown called, isOpen:', this.isOpen);
        if (!this.isOpen) return;
        
        this.isAnimating = true;
        this.isOpen = false;
        
        this.element.classList.remove('open');
        this.dropdown.classList.remove('show');
        
        // Remove global click handler when dropdown closes
        this.removeGlobalClickHandler();
        
        console.log('Dropdown closed, classes removed');
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    /**
     * Rebind checkbox events after re-rendering
     */
    rebindCheckboxes() {
        const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            // Remove old listeners by cloning
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
            
            // Add new listener
            newCheckbox.addEventListener('change', (e) => {
                this.toggleCalendar(e.target.dataset.calendarId, e.target.checked);
                this.updateToggleState(newCheckbox);
            });
            
            // Set correct state
            const calendarId = newCheckbox.dataset.calendarId;
            newCheckbox.checked = this.visibleCalendars.has(calendarId);
            this.updateToggleState(newCheckbox);
        });
    }

    /**
     * Animate button press
     */
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Update toggle visual state
     */
    updateToggleState(checkbox) {
        const toggle = checkbox.closest('.calendar-toggle');
        if (!toggle) return;
        
        if (checkbox.checked) {
            toggle.classList.add('checked');
        } else {
            toggle.classList.remove('checked');
        }
    }

    /**
     * Show all calendars
     */
    showAllCalendars() {
        Object.keys(this.calendarNames).forEach(id => {
            this.visibleCalendars.add(id);
        });
        this.updateUI();
        this.saveSettings();
        this.notifyChange();
    }

    /**
     * Hide all calendars
     */
    hideAllCalendars() {
        this.visibleCalendars.clear();
        this.updateUI();
        this.saveSettings();
        this.notifyChange();
    }

    /**
     * Toggle individual calendar
     */
    toggleCalendar(calendarId, isVisible) {
        console.log('🔄 Toggling calendar:', calendarId, 'to:', isVisible);
        
        if (isVisible) {
            this.visibleCalendars.add(calendarId);
        } else {
            this.visibleCalendars.delete(calendarId);
        }
        
        this.updateCalendarCount();
        this.updateEventCountsUI();
        this.saveSettings();
        this.notifyChange();
    }

    /**
     * Update calendar count badge with animation
     */
    updateCalendarCount() {
        const countBadge = this.button.querySelector('.calendar-count');
        if (!countBadge) return;
        
        const count = this.visibleCalendars.size;
        
        // Animate count change
        countBadge.style.transform = 'scale(1.3)';
        countBadge.textContent = count;
        
        setTimeout(() => {
            countBadge.style.transform = '';
        }, 200);
        
        // Add pulse effect if all calendars are hidden
        if (count === 0) {
            countBadge.classList.add('pulse');
        } else {
            countBadge.classList.remove('pulse');
        }
    }

    /**
     * Update the UI to reflect current state
     */
    updateUI() {
        const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const calendarId = checkbox.dataset.calendarId;
            checkbox.checked = this.visibleCalendars.has(calendarId);
            this.updateToggleState(checkbox);
        });
        
        this.updateCalendarCount();
        this.updateEventCountsUI();
    }

    /**
     * Check if a calendar is visible
     */
    isCalendarVisible(calendarId) {
        return this.visibleCalendars.has(calendarId);
    }

    /**
     * Get visible calendars
     */
    getVisibleCalendars() {
        return Array.from(this.visibleCalendars);
    }

    /**
     * Filter events based on visible calendars
     */
    filterEvents(events) {
        if (this.visibleCalendars.size === 0) {
            console.log('⚠️ No calendars visible, returning empty array');
            return [];
        }
        
        const filtered = events.filter(event => {
            const calendarId = event.calendarSource || 'calendar-0';
            return this.visibleCalendars.has(calendarId);
        });
        
        // Removed verbose filtering logs to reduce console noise
        return filtered;
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const settings = {
                visibleCalendars: Array.from(this.visibleCalendars),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('calendarFilter', JSON.stringify(settings));
            logger.debug('Calendar Filter', 'Settings saved');
        } catch (e) {
            console.warn('Failed to save calendar filter settings:', e);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('calendarFilter');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // Only apply saved settings if we have the same calendars
                const savedCalendars = new Set(settings.visibleCalendars || []);
                const availableCalendars = new Set(Object.keys(this.calendarNames));
                
                // Check if saved calendars are still valid
                const validSavedCalendars = Array.from(savedCalendars).filter(id => 
                    availableCalendars.has(id)
                );
                
                if (validSavedCalendars.length > 0) {
                    this.visibleCalendars = new Set(validSavedCalendars);
                    logger.debug('Calendar Filter', 'Settings loaded');
                } else {
                    // If no valid saved calendars, default to showing all available calendars
                    this.visibleCalendars = new Set(Object.keys(this.calendarNames));
                    logger.debug('Calendar Filter', 'No valid saved settings, showing all calendars');
                }
            } else {
                // No saved settings, default to showing all available calendars
                this.visibleCalendars = new Set(Object.keys(this.calendarNames));
                logger.debug('Calendar Filter', 'No saved settings, showing all calendars');
            }
        } catch (e) {
            console.warn('Failed to load calendar filter settings:', e);
            // On error, default to showing all available calendars
            this.visibleCalendars = new Set(Object.keys(this.calendarNames));
        }
    }

    /**
     * Notify that filter has changed
     */
    notifyChange() {
        // Trigger a re-render of the calendar
        if (this.core && this.core.state) {
            this.core.state.trigger('calendarFilterChanged');
        }
        
        // Also trigger a direct re-render if view manager is available
        if (this.core && this.core.viewManager) {
            const currentView = this.core.viewManager.getCurrentView();
            if (currentView && currentView.render) {
                logger.debug('Calendar Filter', 'Triggering calendar re-render due to filter change');
                currentView.render();
            }
        }
        
        // Update event counts after change
        setTimeout(() => {
            this.updateEventCounts();
        }, 100);
    }

    /**
     * Get the filter element
     */
    getElement() {
        return this.element;
    }

    /**
     * Refresh the component
     */
    refresh() {
        this.discoverCalendars();
        this.updateUI();
        logger.refresh('Calendar Filter', 'Refreshed');
    }

    /**
     * Reset to default state (all calendars selected)
     * Called after idle/restart scenarios
     */
    resetToDefault() {
        // Ensure all available calendars are selected
        this.visibleCalendars = new Set(Object.keys(this.calendarNames));
        this.updateUI();
        this.saveSettings();
        logger.debug('Calendar Filter', 'Reset to default state - all calendars selected');
    }

    /**
     * Add global click handler for closing dropdown
     */
    addGlobalClickHandler() {
        this.globalClickHandler = (e) => {
            if (!this.element.contains(e.target)) {
                console.log('Global click outside detected, closing dropdown');
                this.closeDropdown();
            }
        };
        
        // Use a small delay to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', this.globalClickHandler);
        }, 10);
    }

    /**
     * Remove global click handler
     */
    removeGlobalClickHandler() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler);
            this.globalClickHandler = null;
        }
    }

    /**
     * Destroy the component
     */
    destroy() {
        // Remove global click handler
        this.removeGlobalClickHandler();
        
        // Remove event listeners
        if (this.button) {
            this.button.removeEventListener('click', this.toggleDropdown);
        }
        
        // Remove element from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        console.log('🗑️ Calendar filter destroyed');
    }
}