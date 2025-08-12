/**
 * Responsive Layout Component
 * Handles responsive design and breakpoint management for calendar components
 * 
 * Provides functionality for:
 * - Breakpoint detection and management
 * - Responsive layout calculations
 * - Mobile/desktop view switching
 * - Touch-friendly interactions
 */
export class ResponsiveLayout {
    constructor(options = {}) {
        this.options = {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200,
                large: 1440
            },
            defaultView: 'desktop',
            enableTouch: true,
            ...options
        };
        
        this.currentBreakpoint = null;
        this.isTouchDevice = this.detectTouchDevice();
        this.resizeObserver = null;
        this.listeners = new Set();
        
        this.init();
    }

    /**
     * Initialize responsive layout
     */
    init() {
        this.updateBreakpoint();
        this.setupResizeObserver();
        this.setupEventListeners();
    }

    /**
     * Detect if device supports touch
     * @returns {boolean} True if touch device
     */
    detectTouchDevice() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }

    /**
     * Setup resize observer for breakpoint changes
     */
    setupResizeObserver() {
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateBreakpoint();
            });
            
            this.resizeObserver.observe(document.body);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.updateBreakpoint();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateBreakpoint();
            }, 100);
        });
    }

    /**
     * Update current breakpoint based on window width
     */
    updateBreakpoint() {
        const width = window.innerWidth;
        const oldBreakpoint = this.currentBreakpoint;
        
        if (width < this.options.breakpoints.mobile) {
            this.currentBreakpoint = 'mobile';
        } else if (width < this.options.breakpoints.tablet) {
            this.currentBreakpoint = 'tablet';
        } else if (width < this.options.breakpoints.desktop) {
            this.currentBreakpoint = 'desktop';
        } else {
            this.currentBreakpoint = 'large';
        }
        
        // Notify listeners if breakpoint changed
        if (oldBreakpoint !== this.currentBreakpoint) {
            this.notifyBreakpointChange(oldBreakpoint, this.currentBreakpoint);
        }
    }

    /**
     * Get current breakpoint
     * @returns {string} Current breakpoint
     */
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }

    /**
     * Check if current breakpoint matches given breakpoint
     * @param {string} breakpoint - Breakpoint to check
     * @returns {boolean} True if current breakpoint matches
     */
    isBreakpoint(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }

    /**
     * Check if current breakpoint is mobile or smaller
     * @returns {boolean} True if mobile or smaller
     */
    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }

    /**
     * Check if current breakpoint is tablet or smaller
     * @returns {boolean} True if tablet or smaller
     */
    isTabletOrSmaller() {
        return ['mobile', 'tablet'].includes(this.currentBreakpoint);
    }

    /**
     * Check if current breakpoint is desktop or larger
     * @returns {boolean} True if desktop or larger
     */
    isDesktopOrLarger() {
        return ['desktop', 'large'].includes(this.currentBreakpoint);
    }

    /**
     * Get responsive layout options for current breakpoint
     * @returns {Object} Layout options
     */
    getLayoutOptions() {
        const options = {
            mobile: {
                columns: 1,
                eventHeight: 24,
                slotHeight: 60,
                showTimeLabels: true,
                compactMode: true,
                touchFriendly: true
            },
            tablet: {
                columns: 2,
                eventHeight: 28,
                slotHeight: 65,
                showTimeLabels: true,
                compactMode: false,
                touchFriendly: true
            },
            desktop: {
                columns: 3,
                eventHeight: 32,
                slotHeight: 72,
                showTimeLabels: true,
                compactMode: false,
                touchFriendly: false
            },
            large: {
                columns: 4,
                eventHeight: 36,
                slotHeight: 80,
                showTimeLabels: true,
                compactMode: false,
                touchFriendly: false
            }
        };
        
        return options[this.currentBreakpoint] || options.desktop;
    }

    /**
     * Calculate responsive grid layout
     * @param {number} containerWidth - Container width
     * @param {Object} options - Layout options
     * @returns {Object} Grid layout configuration
     */
    calculateGridLayout(containerWidth, options = {}) {
        const layoutOptions = { ...this.getLayoutOptions(), ...options };
        
        const gridConfig = {
            columns: Math.min(layoutOptions.columns, Math.floor(containerWidth / 300)),
            columnWidth: containerWidth / Math.min(layoutOptions.columns, Math.floor(containerWidth / 300)),
            eventHeight: layoutOptions.eventHeight,
            slotHeight: layoutOptions.slotHeight,
            showTimeLabels: layoutOptions.showTimeLabels,
            compactMode: layoutOptions.compactMode,
            touchFriendly: layoutOptions.touchFriendly
        };
        
        return gridConfig;
    }

    /**
     * Calculate responsive event layout
     * @param {Object} event - Event object
     * @param {Object} gridConfig - Grid configuration
     * @returns {Object} Event layout properties
     */
    calculateEventLayout(event, gridConfig) {
        const layout = {
            width: gridConfig.columnWidth - 4,
            height: gridConfig.eventHeight,
            fontSize: gridConfig.compactMode ? '12px' : '14px',
            padding: gridConfig.compactMode ? '2px 4px' : '4px 8px',
            borderRadius: gridConfig.touchFriendly ? '6px' : '4px'
        };
        
        return layout;
    }

    /**
     * Get responsive navigation options
     * @returns {Object} Navigation options
     */
    getNavigationOptions() {
        const options = {
            mobile: {
                showMonthYear: true,
                showWeekNumbers: false,
                compactButtons: true,
                touchFriendly: true
            },
            tablet: {
                showMonthYear: true,
                showWeekNumbers: false,
                compactButtons: false,
                touchFriendly: true
            },
            desktop: {
                showMonthYear: true,
                showWeekNumbers: true,
                compactButtons: false,
                touchFriendly: false
            },
            large: {
                showMonthYear: true,
                showWeekNumbers: true,
                compactButtons: false,
                touchFriendly: false
            }
        };
        
        return options[this.currentBreakpoint] || options.desktop;
    }

    /**
     * Get responsive modal options
     * @returns {Object} Modal options
     */
    getModalOptions() {
        const options = {
            mobile: {
                fullscreen: true,
                closeOnBackdrop: true,
                showCloseButton: true,
                touchFriendly: true
            },
            tablet: {
                fullscreen: false,
                closeOnBackdrop: true,
                showCloseButton: true,
                touchFriendly: true
            },
            desktop: {
                fullscreen: false,
                closeOnBackdrop: true,
                showCloseButton: false,
                touchFriendly: false
            },
            large: {
                fullscreen: false,
                closeOnBackdrop: true,
                showCloseButton: false,
                touchFriendly: false
            }
        };
        
        return options[this.currentBreakpoint] || options.desktop;
    }

    /**
     * Add breakpoint change listener
     * @param {Function} listener - Listener function
     */
    addBreakpointListener(listener) {
        this.listeners.add(listener);
    }

    /**
     * Remove breakpoint change listener
     * @param {Function} listener - Listener function
     */
    removeBreakpointListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * Notify listeners of breakpoint change
     * @param {string} oldBreakpoint - Previous breakpoint
     * @param {string} newBreakpoint - New breakpoint
     */
    notifyBreakpointChange(oldBreakpoint, newBreakpoint) {
        this.listeners.forEach(listener => {
            try {
                listener(oldBreakpoint, newBreakpoint);
            } catch (error) {
                console.error('Error in breakpoint listener:', error);
            }
        });
    }

    /**
     * Update responsive layout options
     * @param {Object} newOptions - New options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.updateBreakpoint();
    }

    /**
     * Get responsive layout statistics
     * @returns {Object} Layout statistics
     */
    getStats() {
        return {
            currentBreakpoint: this.currentBreakpoint,
            isTouchDevice: this.isTouchDevice,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            listenersCount: this.listeners.size
        };
    }

    /**
     * Destroy responsive layout instance
     */
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        this.listeners.clear();
        
        window.removeEventListener('resize', this.updateBreakpoint);
        window.removeEventListener('orientationchange', this.updateBreakpoint);
    }
}
