/**
 * Calendar Header Component
 * Handles calendar navigation and view switching
 */

import { CALENDAR_CONFIG, CSS_CLASSES, SELECTORS } from '../../../utils/calendar-constants.js';
import { formatDate } from '../../../utils/calendar-date-utils.js';
import { CalendarFilter } from '../filters/index.js';
import { logger } from '../../../../utils/logger.js';
import { CreateEventModalController } from '../modals/index.js';
import { calendarConfigService } from '../../../config/calendar-config-service.js';

export class CalendarHeader {
    constructor(core) {
        this.core = core;
        this.headerElement = null;
        this.titleElement = null;
        this.navigationElement = null;
        this.viewSwitcherElement = null;
        this.calendarFilter = null;
        
        // Modal management - singleton pattern for proper state management
        this.createEventModalController = null;
        
        this.init();
    }
    
    /**
     * Initialize the header component
     */
    async init() {
        this.findElements();
        this.setupEventListeners();
        this.updateTitle();
        this.updateViewButtons();
        await this.setupCalendarFilter();
    this.setupAddEventButton();
        
        logger.init('Calendar Header', 'Initialized');
    }
    
    /**
     * Find header elements
     */
    findElements() {
        this.headerElement = document.querySelector('.calendar-header');
        this.titleElement = document.querySelector(SELECTORS.CALENDAR_TITLE);
        this.navigationElement = document.querySelector('.calendar-nav');
        this.viewSwitcherElement = document.querySelector('.view-switcher');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        this.setupNavigationListeners();
        
        // View switcher buttons
        this.setupViewSwitcherListeners();
    }
    
    /**
     * Setup navigation event listeners
     */
    setupNavigationListeners() {
        // Previous button
        const prevBtn = document.querySelector(SELECTORS.PREV_NAV);
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigate('prev');
            });
        }
        
        // Next button
        const nextBtn = document.querySelector(SELECTORS.NEXT_NAV);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigate('next');
            });
        }
        
        // Today button removed - no longer needed
    }
    
    /**
     * Setup calendar filter
     */
    async setupCalendarFilter() {
        if (!this.headerElement) {
            logger.warn('Calendar Header', 'No header element found');
            return;
        }
        
        logger.debug('Calendar Header', 'Setting up calendar filter...');
        
        // Create calendar filter component
        this.calendarFilter = new CalendarFilter(this.core);
        await this.calendarFilter.init();
        
        // Insert filter before the view switcher
        const filterElement = this.calendarFilter.getElement();
        logger.debug('Calendar Header', `Filter element created: ${!!filterElement}`);
        
        if (this.viewSwitcherElement && filterElement) {
            this.viewSwitcherElement.parentNode.insertBefore(filterElement, this.viewSwitcherElement);
            logger.debug('Calendar Header', 'Filter element inserted into DOM');
        } else {
            logger.warn('Calendar Header', `Could not insert filter element - viewSwitcherElement: ${!!this.viewSwitcherElement}, filterElement: ${!!filterElement}`);
        }
        
        // Listen for filter changes
        this.calendarFilter.notifyChange = () => {
            this.handleFilterChange();
        };
        
        // Make filter accessible through core for other components
        this.core.calendarFilter = this.calendarFilter;
    }

    /**
     * Handle calendar filter changes
     */
    handleFilterChange() {
        console.log('Calendar filter changed, triggering re-render');
        
        // Trigger calendar re-render with filtered events
        if (this.core && this.core.viewManager) {
            const currentView = this.core.viewManager.getCurrentView();
            if (currentView && currentView.render) {
                // Force a complete re-render
                currentView.render();
            }
        }
        
        // Also trigger state change for other components
        if (this.core && this.core.state && typeof this.core.state.trigger === 'function') {
            this.core.state.trigger('calendarFilterChanged');
        }
    }

    /**
     * Setup view switcher event listeners
     */
    setupViewSwitcherListeners() {
        if (!this.viewSwitcherElement) return;
        
        const viewButtons = this.viewSwitcherElement.querySelectorAll('button');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleViewButtonClick(button);
            });
        });
    }

  /**
   * Setup global "+ Add Event" button
   */
  setupAddEventButton() {
    const addBtn = document.getElementById('add-event-btn');
    if (!addBtn) return;
    
    addBtn.addEventListener('click', async () => {
      try {
        // Ensure calendars are loaded
        if (!calendarConfigService.isConfigurationLoaded()) {
          await calendarConfigService.loadCalendars();
        }

        const calendars = calendarConfigService.getAllCalendars()
          .filter(c => ['owner', 'writer'].includes(c.accessRole));

        if (calendars.length === 0) {
          this.core.showNotification('No writable calendars available', 'warning');
          return;
        }

        // Use singleton pattern to prevent modal stacking
        if (this.createEventModalController) {
          // Close existing modal if open
          this.createEventModalController.close();
        }
        
        // Create new controller instance
        this.createEventModalController = new CreateEventModalController(this.core);
        await this.createEventModalController.open();
      } catch (err) {
        console.error('Failed to open create event modal:', err);
        this.core.showNotification('Unable to open event creator', 'error');
      }
    });
  }

    
    /**
     * Handle view button click
     */
    handleViewButtonClick(button) {
        let viewName = button.dataset.calendarView;
        
        // If no data attribute, try to get from button text
        if (!viewName) {
            const btnText = button.textContent.toLowerCase().trim();
            if (Object.values(CALENDAR_CONFIG.VIEWS).includes(btnText)) {
                viewName = btnText;
            }
        }
        
        if (viewName && Object.values(CALENDAR_CONFIG.VIEWS).includes(viewName)) {
            this.switchView(viewName);
            
            // Add visual feedback
            this.addButtonFeedback(button);
        }
    }
    
    /**
     * Add visual feedback to button
     */
    addButtonFeedback(button) {
        button.style.animation = 'viewSwitch 0.3s ease';
        setTimeout(() => {
            button.style.animation = '';
        }, 300);
    }
    
    /**
     * Navigate calendar
     */
    navigate(direction) {
        this.core.navigate(direction);
        
        // Add visual feedback to navigation button
        const button = document.querySelector(
            direction === 'prev' ? SELECTORS.PREV_NAV :
            direction === 'next' ? SELECTORS.NEXT_NAV :
            null
        );
        
        if (button) {
            this.addButtonFeedback(button);
        }
    }
    
    /**
     * Switch view
     */
    switchView(viewName) {
        this.core.switchView(viewName);
    }
    
    /**
     * Update the calendar title
     */
    updateTitle() {
        if (!this.titleElement) return;
        
        const currentDate = this.core.getCurrentDate();
        const currentView = this.core.getCurrentView();
        
        let titleText = '';
        
        switch (currentView) {
            case CALENDAR_CONFIG.VIEWS.MONTH:
                titleText = formatDate(currentDate, 'month-year');
                break;
            case CALENDAR_CONFIG.VIEWS.WEEK:
                const startOfWeek = this.getStartOfWeek(currentDate);
                const endOfWeek = this.addDays(startOfWeek, 6);
                titleText = `Week: ${formatDate(startOfWeek, 'short-date')} - ${formatDate(endOfWeek, 'short-date')}`;
                break;
            case CALENDAR_CONFIG.VIEWS.AGENDA:
                titleText = formatDate(currentDate, 'full');
                break;
            default:
                titleText = formatDate(currentDate, 'month-year');
        }
        
        this.titleElement.textContent = titleText;
    }
    
    /**
     * Update view switcher buttons
     */
    updateViewButtons() {
        if (!this.viewSwitcherElement) return;
        
        const currentView = this.core.getCurrentView();
        const viewButtons = this.viewSwitcherElement.querySelectorAll('button');
        
        viewButtons.forEach(button => {
            let buttonView = button.dataset.calendarView;
            
            // If no data attribute, try to get from button text
            if (!buttonView) {
                const btnText = button.textContent.toLowerCase().trim();
                if (Object.values(CALENDAR_CONFIG.VIEWS).includes(btnText)) {
                    buttonView = btnText;
                }
            }
            
            // Update active state
            if (buttonView === currentView) {
                button.classList.add(CSS_CLASSES.ACTIVE);
            } else {
                button.classList.remove(CSS_CLASSES.ACTIVE);
            }
        });
    }
    
    /**
     * Update the header
     */
    update() {
        this.updateTitle();
        this.updateViewButtons();
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        if (this.titleElement) {
            this.titleElement.textContent = 'Loading...';
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        this.updateTitle();
    }
    
    /**
     * Get start of week
     */
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }
    
    /**
     * Add days to date
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    /**
     * Destroy the header component
     */
    destroy() {
        // Clean up modal controller
        if (this.createEventModalController) {
            this.createEventModalController.close();
            this.createEventModalController = null;
        }
        
        // Clean up calendar filter
        if (this.calendarFilter) {
            this.calendarFilter.destroy?.();
            this.calendarFilter = null;
        }
        
        console.log('📅 Calendar header destroyed');
    }
}
