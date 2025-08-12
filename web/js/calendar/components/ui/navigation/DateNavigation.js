/**
 * Date Navigation Component
 * Centralized navigation logic for calendar views
 */

import { addDays, addMonths } from '../../../utils/calendar-date-utils.js';

export class DateNavigation {
    constructor(core) {
        this.core = core;
        this.keyboardShortcuts = new Map();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        this.keyboardShortcuts.set('prev', { key: 'ArrowLeft', ctrl: true });
        this.keyboardShortcuts.set('next', { key: 'ArrowRight', ctrl: true });
        this.keyboardShortcuts.set('today', { key: 't', ctrl: true });
        this.keyboardShortcuts.set('home', { key: 'Home', ctrl: true });
    }

    /**
     * Create navigation controls
     */
    createNavigationControls(options = {}) {
        const {
            showToday = true,
            showPrevNext = true,
            showHome = false,
            className = 'calendar-nav',
            prevText = '←',
            nextText = '→',
            todayText = 'Today',
            homeText = 'Home'
        } = options;

        const nav = document.createElement('div');
        nav.className = className;

        if (showPrevNext) {
            const prevBtn = this.createNavButton(prevText, 'Previous', () => this.navigate(-1));
            nav.appendChild(prevBtn);
        }

        if (showToday) {
            const todayBtn = this.createNavButton(todayText, 'Go to today', () => this.goToToday());
            todayBtn.classList.add('nav-today');
            nav.appendChild(todayBtn);
        }

        if (showHome) {
            const homeBtn = this.createNavButton(homeText, 'Go to current month', () => this.goToCurrentMonth());
            nav.appendChild(homeBtn);
        }

        if (showPrevNext) {
            const nextBtn = this.createNavButton(nextText, 'Next', () => this.navigate(1));
            nav.appendChild(nextBtn);
        }

        return nav;
    }

    /**
     * Create navigation button
     */
    createNavButton(text, title, onClick) {
        const button = document.createElement('button');
        button.className = 'nav-btn';
        button.textContent = text;
        button.title = title;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Navigate by direction (for week view)
     */
    navigateWeek(direction) {
        const currentDate = this.core.getCurrentDate();
        const newDate = addDays(currentDate, direction * 7);
        this.core.setCurrentDate(newDate);
        return newDate;
    }

    /**
     * Navigate by direction (for month view)
     */
    navigateMonth(direction) {
        const currentDate = this.core.getCurrentDate();
        const newDate = addMonths(currentDate, direction);
        this.core.setCurrentDate(newDate);
        return newDate;
    }

    /**
     * Navigate by direction (generic)
     */
    navigate(direction, viewType = 'week') {
        if (viewType === 'month') {
            return this.navigateMonth(direction);
        } else {
            return this.navigateWeek(direction);
        }
    }

    /**
     * Go to today
     */
    goToToday() {
        const today = new Date();
        this.core.setCurrentDate(today);
        this.core.setSelectedDate(today);
        return today;
    }

    /**
     * Go to current month
     */
    goToCurrentMonth() {
        const today = new Date();
        this.core.setCurrentDate(today);
        return today;
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListeners(isActive = true) {
        if (isActive) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        } else {
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(e) {
        // Check if any input element is focused
        if (this.isInputFocused()) {
            return;
        }

        for (const [action, shortcut] of this.keyboardShortcuts) {
            if (this.matchesShortcut(e, shortcut)) {
                e.preventDefault();
                this.executeAction(action);
                break;
            }
        }
    }

    /**
     * Check if any input element is focused
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    /**
     * Check if event matches shortcut
     */
    matchesShortcut(event, shortcut) {
        return event.key === shortcut.key && 
               (shortcut.ctrl ? event.ctrlKey : !event.ctrlKey) &&
               (shortcut.shift ? event.shiftKey : !event.shiftKey) &&
               (shortcut.alt ? event.altKey : !event.altKey);
    }

    /**
     * Execute navigation action
     */
    executeAction(action) {
        switch (action) {
            case 'prev':
                this.navigate(-1);
                break;
            case 'next':
                this.navigate(1);
                break;
            case 'today':
                this.goToToday();
                break;
            case 'home':
                this.goToCurrentMonth();
                break;
        }
    }

    /**
     * Format navigation title
     */
    formatNavigationTitle(date, viewType = 'week') {
        if (viewType === 'month') {
            return this.formatMonthTitle(date);
        } else {
            return this.formatWeekTitle(date);
        }
    }

    /**
     * Format month title
     */
    formatMonthTitle(date) {
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    }

    /**
     * Format week title
     */
    formatWeekTitle(date) {
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    }

    /**
     * Format date range
     */
    formatDateRange(startDate, endDate) {
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${startStr} - ${endStr}`;
    }

    /**
     * Get navigation state
     */
    getNavigationState() {
        const currentDate = this.core.getCurrentDate();
        const selectedDate = this.core.getSelectedDate();
        const today = new Date();

        return {
            currentDate,
            selectedDate,
            today,
            isCurrentPeriod: this.isCurrentPeriod(currentDate),
            canGoBack: true,
            canGoForward: true
        };
    }

    /**
     * Check if current period is today's period
     */
    isCurrentPeriod(date) {
        const today = new Date();
        return date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
}
