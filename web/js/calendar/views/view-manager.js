/**
 * Calendar View Manager
 * Manages view switching and lifecycle for all calendar views
 */

import { CALENDAR_CONFIG, CSS_CLASSES } from '../utils/calendar-constants.js';
import { MonthViewRefactored as MonthView } from './month-view.js';
import { WeekViewRefactored as WeekView } from './week-view.js';
import { AgendaView } from './agenda-view.js';

export class ViewManager {
    constructor(core) {
        this.core = core;
        this.views = new Map();
        this.currentView = null;
        this.containers = new Map();
        this.isActive = false;
    }
    
    /**
     * Initialize view containers
     */
    initializeContainers() {
        // Find view containers
        const monthContainer = document.querySelector('#month') || 
                             document.querySelector('.month-view-container');
        const weekContainer = document.querySelector('#week') || 
                            document.querySelector('.week-view-container');
        const agendaContainer = document.querySelector('#agenda') || 
                              document.querySelector('.agenda-container');
        
        // Store containers
        this.containers.set(CALENDAR_CONFIG.VIEWS.MONTH, monthContainer);
        this.containers.set(CALENDAR_CONFIG.VIEWS.WEEK, weekContainer);
        this.containers.set(CALENDAR_CONFIG.VIEWS.AGENDA, agendaContainer);
        
        console.log('📅 View containers initialized:', {
            month: !!monthContainer,
            week: !!weekContainer,
            agenda: !!agendaContainer
        });
    }
    
    /**
     * Initialize views
     */
    initializeViews() {
        // Create view instances
        const monthContainer = this.containers.get(CALENDAR_CONFIG.VIEWS.MONTH);
        const weekContainer = this.containers.get(CALENDAR_CONFIG.VIEWS.WEEK);
        const agendaContainer = this.containers.get(CALENDAR_CONFIG.VIEWS.AGENDA);
        
        if (monthContainer) {
            const monthView = new MonthView(this.core, monthContainer);
            monthView.init();
            this.views.set(CALENDAR_CONFIG.VIEWS.MONTH, monthView);
        }
        
        if (weekContainer) {
            const weekView = new WeekView(this.core, weekContainer);
            weekView.init();
            this.views.set(CALENDAR_CONFIG.VIEWS.WEEK, weekView);
        }
        
        if (agendaContainer) {
            const agendaView = new AgendaView(this.core, agendaContainer);
            agendaView.init();
            this.views.set(CALENDAR_CONFIG.VIEWS.AGENDA, agendaView);
        }
        
        console.log('📅 Views initialized:', Array.from(this.views.keys()));
    }
    
    /**
     * Switch to a specific view
     */
    switchView(viewName) {
        if (!this.views.has(viewName)) {
            console.warn(`View "${viewName}" not found`);
            return;
        }
        
        // Hide current view
        if (this.currentView) {
            this.currentView.hide();
        }
        
        // Show new view (this will trigger onShow() which calls render())
        const newView = this.views.get(viewName);
        newView.show();
        this.currentView = newView;
        
        // Update view buttons
        this.updateViewButtons(viewName);
        
        // Update tab visibility
        this.updateTabVisibility(viewName);
        
        console.log(`📅 Switched to ${viewName} view`);
    }
    
    /**
     * Update view buttons
     */
    updateViewButtons(activeView) {
        // First, remove active class from all buttons (both 'active' and CSS_CLASSES.ACTIVE)
        const allButtons = document.querySelectorAll('.view-switcher button, [data-calendar-view]');
        
        allButtons.forEach(btn => {
            btn.classList.remove('active', CSS_CLASSES.ACTIVE);
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Then, add active class only to the correct button
        const activeButton = document.querySelector(`[data-calendar-view="${activeView}"]`);
        if (activeButton) {
            activeButton.classList.add(CSS_CLASSES.ACTIVE);
            activeButton.setAttribute('aria-selected', 'true');
        }
        
        // Add visual feedback for button state changes
        this.addButtonStateFeedback(activeView);
    }
    
    /**
     * Add visual feedback for button state changes
     */
    addButtonStateFeedback(activeView) {
        const activeBtn = document.querySelector(`[data-calendar-view="${activeView}"]`);
        if (activeBtn) {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'button-ripple';
            activeBtn.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    }
    
    /**
     * Update tab visibility
     */
    updateTabVisibility(activeView) {
        // Hide all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active', CSS_CLASSES.ACTIVE);
        });
        
        // Show active tab
        const activeTab = document.getElementById(activeView);
        if (activeTab) {
            activeTab.style.display = 'block';
            activeTab.classList.add(CSS_CLASSES.ACTIVE);
        }
    }
    
    /**
     * Get current view
     */
    getCurrentView() {
        return this.currentView;
    }
    
    /**
     * Get view by name
     */
    getView(viewName) {
        return this.views.get(viewName);
    }
    
    /**
     * Get all views
     */
    getAllViews() {
        return Array.from(this.views.values());
    }
    
    /**
     * Render current view
     */
    render() {
        console.log('📅 View manager render called, current view:', this.currentView ? this.currentView.getName() : 'none');
        console.log('📅 View manager state:', {
            hasCurrentView: !!this.currentView,
            currentViewName: this.currentView ? this.currentView.getName() : 'none',
            isActive: this.currentView ? this.currentView.isViewActive() : false,
            isRendered: this.currentView ? this.currentView.isViewRendered() : false
        });
        
        if (this.currentView) {
            this.currentView.render();
        } else {
            console.warn('📅 No current view to render');
        }
    }
    
    /**
     * Update current view
     */
    update() {
        if (this.currentView) {
            this.currentView.update();
        }
    }
    
    /**
     * Update all views
     */
    updateAllViews() {
        this.views.forEach(view => {
            view.update();
        });
    }
    
    /**
     * Show loading state in current view
     */
    showLoading() {
        if (this.currentView) {
            this.currentView.showLoading();
        }
    }
    
    /**
     * Show empty state in current view
     */
    showEmpty(message) {
        if (this.currentView) {
            this.currentView.showEmpty(message);
        }
    }
    
    /**
     * Handle view button clicks
     */
    handleViewButtonClick(viewName) {
        if (this.views.has(viewName)) {
            this.switchView(viewName);
            return true;
        }
        return false;
    }
    
    /**
     * Setup view button event listeners
     */
    setupViewButtonListeners() {
        // Listen for view button clicks
        document.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('[data-calendar-view]');
            
            if (viewBtn && viewBtn.dataset.calendarView) {
                const viewName = viewBtn.dataset.calendarView;
                
                if (this.views.has(viewName)) {
                    this.handleViewButtonClick(viewName);
                    
                    // Add visual feedback
                    viewBtn.style.animation = 'viewSwitch 0.3s ease';
                    setTimeout(() => {
                        viewBtn.style.animation = '';
                    }, 300);
                }
            }
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            // Ctrl + number shortcuts for view switching
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                const viewMap = {
                    '1': 'month',
                    '2': 'week', 
                    '3': 'agenda'
                };
                
                const viewName = viewMap[e.key];
                if (viewName && this.views.has(viewName)) {
                    e.preventDefault();
                    this.switchView(viewName);
                    this.showKeyboardShortcutFeedback(viewName);
                }
            }
            
            // Arrow key navigation for view switcher
            if (e.target.closest('.view-switcher')) {
                const buttons = Array.from(document.querySelectorAll('.view-switcher button'));
                const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
                
                if (currentIndex !== -1) {
                    let nextIndex = currentIndex;
                    
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        nextIndex = 0;
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        nextIndex = buttons.length - 1;
                    }
                    
                    if (nextIndex !== currentIndex) {
                        buttons[nextIndex].focus();
                    }
                }
            }
        });
        
        // Handle focus management
        document.querySelectorAll('.view-switcher button').forEach(btn => {
            btn.addEventListener('focus', () => {
                btn.classList.add('focused');
            });
            
            btn.addEventListener('blur', () => {
                btn.classList.remove('focused');
            });
        });
    }
    
    /**
     * Show keyboard shortcut feedback
     */
    showKeyboardShortcutFeedback(viewName) {
        const btn = document.querySelector(`[data-calendar-view="${viewName}"]`);
        if (btn) {
            btn.classList.add('keyboard-shortcut');
            setTimeout(() => {
                btn.classList.remove('keyboard-shortcut');
            }, 300);
        }
    }
    
    /**
     * Initialize view manager
     */
    init() {
        // Initialize view containers
        this.initializeContainers();
        
        // Initialize views
        this.initializeViews();
        
        // Setup event listeners
        this.setupViewButtonListeners();
        
        // Use a small timeout to ensure DOM is ready
        setTimeout(() => {
            // Clear any existing active states from HTML
            this.clearAllButtonStates();
            
            // Set initial view
            const initialView = this.core.getCurrentView();
            if (this.views.has(initialView)) {
                this.switchView(initialView);
            } else {
                // Default to month view
                this.switchView(CALENDAR_CONFIG.VIEWS.MONTH);
            }
        }, 10);
        
        // Set active state
        this.isActive = true;
        
        console.log('📅 View manager initialized');
    }
    
    /**
     * Clear all button states to ensure clean initialization
     */
    clearAllButtonStates() {
        // Remove all active classes from buttons
        document.querySelectorAll('.view-switcher button, [data-calendar-view]').forEach(btn => {
            btn.classList.remove('active', CSS_CLASSES.ACTIVE);
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Remove all active classes from tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active', CSS_CLASSES.ACTIVE);
            tab.style.display = 'none';
        });
    }
    
    /**
     * Destroy view manager
     */
    destroy() {
        // Destroy all views
        this.views.forEach(view => {
            view.destroy();
        });
        
        // Clear references
        this.views.clear();
        this.containers.clear();
        this.currentView = null;
        this.isActive = false;
        
        console.log('📅 View manager destroyed');
    }
    
    /**
     * Get view statistics
     */
    getViewStats() {
        const stats = {
            totalViews: this.views.size,
            availableViews: Array.from(this.views.keys()),
            currentView: this.currentView ? this.currentView.getName() : null,
            containers: Array.from(this.containers.keys())
        };
        
        return stats;
    }
}
