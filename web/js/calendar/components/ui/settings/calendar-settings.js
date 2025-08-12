/**
 * Calendar Settings Component
 * Allows users to manage calendars (add, edit, delete, colors, etc.)
 */

import { calendarManager } from '../../../config/index.js';

export class CalendarSettings {
    constructor() {
        this.element = null;
        this.isOpen = false;
    }

    /**
     * Initialize the settings component
     */
    init() {
        this.createSettingsUI();
        this.bindEvents();
    }

    /**
     * Create the settings UI
     */
    createSettingsUI() {
        this.element = document.createElement('div');
        this.element.className = 'calendar-settings';
        this.element.innerHTML = `
            <div class="settings-button" id="calendar-settings-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Settings</span>
            </div>
            <div class="settings-modal" id="calendar-settings-modal">
                <div class="settings-content">
                    <div class="settings-header">
                        <h3>Calendar Settings</h3>
                        <button class="close-btn" id="close-settings">×</button>
                    </div>
                    <div class="settings-body">
                        <div class="calendar-list-section">
                            <div class="section-header">
                                <h4>My Calendars</h4>
                                <button class="btn-add" id="add-calendar-btn">+ Add Calendar</button>
                            </div>
                            <div class="calendar-list" id="settings-calendar-list">
                                ${this.renderCalendarList()}
                            </div>
                        </div>
                        <div class="add-calendar-section" id="add-calendar-section" style="display: none;">
                            <h4>Add New Calendar</h4>
                            <form id="add-calendar-form">
                                <div class="form-group">
                                    <label for="calendar-name">Calendar Name</label>
                                    <input type="text" id="calendar-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="calendar-color">Color</label>
                                    <div class="color-picker" id="color-picker">
                                        ${this.renderColorPicker()}
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="calendar-description">Description (optional)</label>
                                    <textarea id="calendar-description" rows="2"></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-cancel" id="cancel-add">Cancel</button>
                                    <button type="submit" class="btn-save">Save Calendar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the calendar list for settings
     */
    renderCalendarList() {
        const calendars = calendarManager.getAllCalendars();
        return calendars.map(calendar => `
            <div class="calendar-item" data-calendar-id="${calendar.id}">
                <div class="calendar-info">
                    <div class="calendar-indicator" style="background: ${calendar.color}"></div>
                    <div class="calendar-details">
                        <div class="calendar-name">${calendar.name}</div>
                        <div class="calendar-description">${calendar.description || 'No description'}</div>
                    </div>
                </div>
                <div class="calendar-actions">
                    <button class="btn-edit" data-calendar-id="${calendar.id}">Edit</button>
                    <button class="btn-delete" data-calendar-id="${calendar.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render color picker
     */
    renderColorPicker() {
        return calendarManager.config.colorPalette.map(color => `
            <div class="color-option" style="background: ${color}" data-color="${color}"></div>
        `).join('');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Settings button
        const settingsBtn = this.element.querySelector('#calendar-settings-btn');
        settingsBtn.addEventListener('click', () => this.openSettings());

        // Close button
        const closeBtn = this.element.querySelector('#close-settings');
        closeBtn.addEventListener('click', () => this.closeSettings());

        // Add calendar button
        const addBtn = this.element.querySelector('#add-calendar-btn');
        addBtn.addEventListener('click', () => this.showAddCalendarForm());

        // Cancel add button
        const cancelBtn = this.element.querySelector('#cancel-add');
        cancelBtn.addEventListener('click', () => this.hideAddCalendarForm());

        // Add calendar form
        const form = this.element.querySelector('#add-calendar-form');
        form.addEventListener('submit', (e) => this.handleAddCalendar(e));

        // Color picker
        const colorOptions = this.element.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => this.selectColor(option));
        });

        // Edit and delete buttons
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit')) {
                this.editCalendar(e.target.dataset.calendarId);
            } else if (e.target.classList.contains('btn-delete')) {
                this.deleteCalendar(e.target.dataset.calendarId);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeSettings();
            }
        });
    }

    /**
     * Open settings modal
     */
    openSettings() {
        this.isOpen = true;
        this.element.querySelector('.settings-modal').style.display = 'flex';
        this.refreshCalendarList();
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        this.isOpen = false;
        this.element.querySelector('.settings-modal').style.display = 'none';
        this.hideAddCalendarForm();
    }

    /**
     * Show add calendar form
     */
    showAddCalendarForm() {
        this.element.querySelector('.calendar-list-section').style.display = 'none';
        this.element.querySelector('.add-calendar-section').style.display = 'block';
        this.element.querySelector('#calendar-name').focus();
    }

    /**
     * Hide add calendar form
     */
    hideAddCalendarForm() {
        this.element.querySelector('.calendar-list-section').style.display = 'block';
        this.element.querySelector('.add-calendar-section').style.display = 'none';
        this.element.querySelector('#add-calendar-form').reset();
    }

    /**
     * Handle add calendar form submission
     */
    handleAddCalendar(e) {
        e.preventDefault();
        
        const name = this.element.querySelector('#calendar-name').value.trim();
        const description = this.element.querySelector('#calendar-description').value.trim();
        const selectedColor = this.element.querySelector('.color-option.selected')?.dataset.color;
        
        if (!name) {
            alert('Please enter a calendar name');
            return;
        }
        
        if (!selectedColor) {
            alert('Please select a color');
            return;
        }
        
        const newCalendar = calendarManager.addCalendar(name, selectedColor, description);
        
        if (newCalendar) {
            this.hideAddCalendarForm();
            this.refreshCalendarList();
            this.notifyChange();
        }
    }

    /**
     * Select color in color picker
     */
    selectColor(option) {
        this.element.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    }

    /**
     * Edit calendar
     */
    editCalendar(calendarId) {
        const calendar = calendarManager.getCalendar(calendarId);
        if (calendar) {
            // For now, just show an alert with edit info
            // You can implement a full edit form later
            alert(`Edit calendar: ${calendar.name}\nThis feature will be implemented in the next version.`);
        }
    }

    /**
     * Delete calendar
     */
    deleteCalendar(calendarId) {
        const calendar = calendarManager.getCalendar(calendarId);
        if (calendar && confirm(`Are you sure you want to delete "${calendar.name}"?`)) {
            calendarManager.deleteCalendar(calendarId);
            this.refreshCalendarList();
            this.notifyChange();
        }
    }

    /**
     * Refresh calendar list
     */
    refreshCalendarList() {
        const list = this.element.querySelector('#settings-calendar-list');
        list.innerHTML = this.renderCalendarList();
    }

    /**
     * Notify that calendars have changed
     */
    notifyChange() {
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('calendarConfigChanged', {
            detail: { calendars: calendarManager.getAllCalendars() }
        }));
    }

    /**
     * Get the settings element
     */
    getElement() {
        return this.element;
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
