/**
 * Smart Fridge Dashboard - Main Application
 * Touch-optimized dashboard for 15-inch display
 */

import { CONFIG } from './constants/config.js';
import { TouchCalendarManager } from './calendar/index.js';
import { loadFromStorage, saveToStorage } from './utils/utils.js';
import { formatTime, formatDate } from './calendar/utils/calendar-date-utils.js';
import { logger } from './utils/logger.js';
import { createPerformanceDashboard } from './performance/components/PerformanceDashboard.js';

export class FridgeDashboard {
    constructor() {
        this.state = {
            isIdle: true,
            currentView: 'calendar',
            idleTimeout: null,
            messageInterval: null,
            clockInterval: null,
            currentMessageIndex: 0,
            lastInteraction: Date.now(),
            settings: this.loadSettings()
        };
        
        this.managers = {
            calendar: null
        };
        
        // Performance monitoring
        this.performanceDashboard = null;
        
        // Touch gesture tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTap = 0;
    }
    
    /**
     * Initialize the dashboard
     */
        async init() {
        logger.init('Dashboard', 'Initializing...');
     
        // Initialize components
        this.initializeManagers();
        this.setupEventListeners();
        this.setupTouchGestures();
        this.startClock();
        this.startIdleTimer();
        this.startMessageRotation();
        
        // Load initial data
        await this.loadWeather();
        
        // Show idle screen by default
        this.showIdleScreen();
        
        logger.ready('Dashboard', 'Ready!');
    }
    
    /**
     * Initialize component managers
     */
    initializeManagers() {
        // Initialize calendar with touch optimizations
        this.managers.calendar = new TouchCalendarManager(this);
        this.managers.calendar.init();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Idle screen click - wake up
        const idleScreen = document.getElementById('idle');
        if (idleScreen) {
            idleScreen.addEventListener('click', () => {
                this.dismissIdle();
            });
        }
        
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
        
        // Return to idle button
        const returnToIdle = document.getElementById('return-to-idle');
        if (returnToIdle) {
            returnToIdle.addEventListener('click', () => {
                this.showIdleScreen();
            });
        }
        
        // Track user activity
        ['click', 'touchstart', 'touchend', 'keypress'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.handleUserActivity();
            }, { passive: true });
        });
        
        // Settings listeners
        this.setupSettingsListeners();
        
        // Add event button handled by calendar header module now
    }
    
    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        const app = document.getElementById('app');
        
        // Track touch start
        app.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        // Handle touch end for swipe detection
        app.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = this.touchStartX - touchEndX;
            const diffY = this.touchStartY - touchEndY;
            
            // Minimum swipe distance
            const minSwipe = 50;
            
            // Detect horizontal swipe (when not idle)
            if (!this.state.isIdle && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipe) {
                if (this.state.currentView === 'calendar') {
                    // Let calendar handle its own swipes
                    return;
                }
                
                // Could implement view switching with swipes
            }
            
            this.touchStartX = 0;
            this.touchStartY = 0;
        }, { passive: true });
        
        // Double tap detection
        app.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const tapLength = currentTime - this.lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                if (this.state.isIdle) {
                    this.dismissIdle();
                }
            }
            
            this.lastTap = currentTime;
        });
    }
    
    /**
     * Setup settings listeners
     */
    setupSettingsListeners() {
        // Idle timeout setting
        const idleTimeoutSetting = document.getElementById('idle-timeout-setting');
        if (idleTimeoutSetting) {
            idleTimeoutSetting.value = this.state.settings.idleTimeout || 60000;
            idleTimeoutSetting.addEventListener('change', (e) => {
                this.state.settings.idleTimeout = parseInt(e.target.value);
                this.saveSettings();
                this.resetIdleTimer();
            });
        }
        
        // Temperature unit setting
        const tempUnitSetting = document.getElementById('temp-unit-setting');
        if (tempUnitSetting) {
            tempUnitSetting.value = this.state.settings.tempUnit || 'F';
            tempUnitSetting.addEventListener('change', (e) => {
                this.state.settings.tempUnit = e.target.value;
                this.saveSettings();
                this.loadWeather();
            });
        }
        
        // 24-hour time setting
        const hourSetting = document.getElementById('24hour-setting');
        if (hourSetting) {
            hourSetting.checked = this.state.settings.use24Hour || false;
            hourSetting.addEventListener('change', (e) => {
                this.state.settings.use24Hour = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Location setting
        const locationSetting = document.getElementById('location-setting');
        if (locationSetting) {
            locationSetting.value = this.state.settings.location || CONFIG.WEATHER_CITY;
            locationSetting.addEventListener('change', (e) => {
                this.state.settings.location = e.target.value;
                this.saveSettings();
                this.loadWeather();
            });
        }
    }
    
    /**
     * Start clock updates
     */
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = formatTime(now, this.state.settings.use24Hour);
            const dateString = formatDate(now, 'full');
            const shortDateString = formatDate(now, 'short');
            
            // Update idle screen
            const largeClock = document.getElementById('large-clock');
            const largeDate = document.getElementById('large-date');
            if (largeClock) largeClock.textContent = timeString;
            if (largeDate) largeDate.textContent = dateString;
            
            // Update sidebar
            const sidebarTime = document.getElementById('sidebar-time');
            const sidebarDate = document.getElementById('sidebar-date');
            if (sidebarTime) sidebarTime.textContent = timeString;
            if (sidebarDate) sidebarDate.textContent = shortDateString;
        };
        
        updateClock();
        this.state.clockInterval = setInterval(updateClock, 1000);
    }
    
    /**
     * Start idle timer
     */
    startIdleTimer() {
        this.resetIdleTimer();
    }
    
    /**
     * Reset idle timer
     */
    resetIdleTimer() {
        if (this.state.idleTimeout) {
            clearTimeout(this.state.idleTimeout);
        }
        
        const timeout = this.state.settings.idleTimeout || CONFIG.IDLE_TIMEOUT_MS;
        
        this.state.idleTimeout = setTimeout(() => {
            if (!this.state.isIdle) {
                this.showIdleScreen();
            }
        }, timeout);
    }
    
    /**
     * Handle user activity
     */
    handleUserActivity() {
        this.state.lastInteraction = Date.now();
        
        if (!this.state.isIdle) {
            this.resetIdleTimer();
        }
    }
    
    /**
     * Start message rotation on idle screen
     */
    startMessageRotation() {
        const messages = CONFIG.FUN_MESSAGES;
        
        const updateMessage = () => {
            const messageEl = document.getElementById('fun-message');
            if (messageEl) {
                // Fade out
                messageEl.style.opacity = '0';
                
                setTimeout(() => {
                    messageEl.textContent = messages[this.state.currentMessageIndex];
                    this.state.currentMessageIndex = (this.state.currentMessageIndex + 1) % messages.length;
                    // Fade in
                    messageEl.style.opacity = '1';
                }, 300);
            }
        };
        
        updateMessage();
        this.state.messageInterval = setInterval(updateMessage, CONFIG.MESSAGE_ROTATION_INTERVAL_MS);
    }
    
    /**
     * Load weather data
     */
    async loadWeather() {
        try {
            // Try to fetch real weather if API key is configured
            if (CONFIG.WEATHER_API_KEY) {
                const city = this.state.settings.location || CONFIG.WEATHER_CITY;
                const units = this.state.settings.tempUnit === 'C' ? 'metric' : 'imperial';
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${CONFIG.WEATHER_API_KEY}`;
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    this.updateWeatherDisplay({
                        temp: Math.round(data.main.temp),
                        desc: data.weather[0].main,
                        icon: this.getWeatherEmoji(data.weather[0].id),
                        location: data.name
                    });
                    return;
                }
            }
        } catch (error) {
            logger.debug('Weather', 'Using mock weather data');
        }
        
        // Use mock data as fallback
        this.updateWeatherDisplay({
            temp: 72,
            desc: 'Sunny',
            icon: '☀️',
            location: this.state.settings.location || CONFIG.WEATHER_CITY
        });
    }
    
    /**
     * Update weather display
     */
    updateWeatherDisplay(weather) {
        const unit = this.state.settings.tempUnit === 'C' ? '°C' : '°F';
        
        // Update idle screen weather
        const weatherIcon = document.getElementById('weather-icon');
        const temperature = document.getElementById('temperature');
        const weatherDesc = document.getElementById('weather-desc');
        const location = document.getElementById('location');
        
        if (weatherIcon) weatherIcon.textContent = weather.icon;
        if (temperature) temperature.textContent = `${weather.temp}${unit}`;
        if (weatherDesc) weatherDesc.textContent = weather.desc;
        if (location) location.textContent = weather.location;
        
        // Update sidebar weather
        const sidebarIcon = document.getElementById('sidebar-weather-icon');
        const sidebarTemp = document.getElementById('sidebar-weather-temp');
        const sidebarDesc = document.getElementById('sidebar-weather-desc');
        
        if (sidebarIcon) sidebarIcon.textContent = weather.icon;
        if (sidebarTemp) sidebarTemp.textContent = `${weather.temp}${unit}`;
        if (sidebarDesc) sidebarDesc.textContent = weather.desc;
    }
    
    /**
     * Get weather emoji from condition code
     */
    getWeatherEmoji(code) {
        if (code >= 200 && code < 300) return '⛈️';
        if (code >= 300 && code < 400) return '🌦️';
        if (code >= 500 && code < 600) return '🌧️';
        if (code >= 600 && code < 700) return '❄️';
        if (code >= 700 && code < 800) return '🌫️';
        if (code === 800) return '☀️';
        if (code > 800) return '☁️';
        return '🌤️';
    }
    
    /**
     * Close all open modals and popups
     */
    closeAllModals() {
        console.log('🔧 Closing all modals...');
        
        // Close calendar modals if available
        if (this.managers.calendar && this.managers.calendar.core) {
            if (this.managers.calendar.core.eventModal) {
                console.log('🔧 Closing calendar modals...');
                this.managers.calendar.core.eventModal.closeAllModals();
            }
        }
        
        // Close any other modals that might be open
        const modalSelectors = [
            '.modal',
            '.modal-overlay', 
            '.day-events-modal',
            '.event-details-modal',
            '.quick-add-modal'
        ];
        
        modalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`🔧 Found ${elements.length} elements with selector: ${selector}`);
            elements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                    console.log(`🔧 Removed element: ${element.className}`);
                }
            });
        });
        
        console.log('🔧 Modal closing complete');
    }

    /**
     * Show idle screen
     */
    showIdleScreen() {
        // Close all open modals/popups before showing idle screen
        this.closeAllModals();
        
        const idleScreen = document.getElementById('idle');
        const dashboard = document.getElementById('dashboard');
        
        if (idleScreen) {
            idleScreen.classList.add('active');
            idleScreen.style.display = 'block';
        }
        
        if (dashboard) {
            dashboard.style.display = 'none';
        }
        
        this.state.isIdle = true;
        
        // Update next event
        this.updateNextEvent();
    }
    
    /**
     * Dismiss idle screen
     */
    dismissIdle() {
        const idleScreen = document.getElementById('idle');
        const dashboard = document.getElementById('dashboard');
        
        if (idleScreen) {
            idleScreen.classList.remove('active');
            idleScreen.style.display = 'none';
        }
        
        if (dashboard) {
            dashboard.style.display = 'flex';
        }
        
        this.state.isIdle = false;
        this.resetIdleTimer();
    }
    
    /**
     * Update the upcoming events display on the idle screen
     * Shows the next 3 upcoming events with proper formatting
     */
    updateNextEvent() {
        try {
            const event1El = document.getElementById('event-1');
            const event2El = document.getElementById('event-2');
            const event3El = document.getElementById('event-3');
            
            // Validate DOM elements exist
            if (!event1El || !event2El || !event3El) {
                console.warn('⚠️ Event display elements not found in DOM');
                return;
            }
            
            // Clear all event elements first
            [event1El, event2El, event3El].forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            
            // Check if calendar manager is available
            if (!this.managers.calendar) {
                event1El.textContent = 'Calendar loading...';
                event1El.style.display = 'block';
                return;
            }
            
            // Get upcoming events (next 10 events to have buffer)
            const upcomingEvents = this.managers.calendar.getUpcomingEvents(10);
            
            if (!upcomingEvents || !Array.isArray(upcomingEvents)) {
                console.warn('⚠️ Invalid upcoming events data received');
                event1El.textContent = 'No upcoming events';
                event1El.style.display = 'block';
                return;
            }
            
            if (upcomingEvents.length === 0) {
                // Show "no events" message
                event1El.textContent = 'No upcoming events';
                event1El.style.display = 'block';
                return;
            }
            
            // Show up to 3 events
            const eventsToShow = upcomingEvents.slice(0, 3);
            
            eventsToShow.forEach((event, index) => {
                const eventEl = [event1El, event2El, event3El][index];
                if (!eventEl || !event) return;
                
                try {
                    // Validate event has required properties
                    if (!event.title || !event.start) {
                        console.warn('⚠️ Event missing required properties:', event);
                        return;
                    }
                    
                    // Ensure start is a Date object
                    const startDate = event.start instanceof Date ? event.start : new Date(event.start);
                    
                    // Format time and date
                    const time = formatTime(startDate, this.state.settings?.use24Hour || false);
                    const date = formatDate(startDate, 'short-date');
                    const isToday = this.isToday(startDate);
                    const isTomorrow = this.isTomorrow(startDate);
                    
                    // Determine date text
                    let dateText = '';
                    if (isToday) {
                        dateText = 'Today';
                    } else if (isTomorrow) {
                        dateText = 'Tomorrow';
                    } else {
                        dateText = date;
                    }
                    
                    // Set event display text
                    eventEl.textContent = `${event.title} • ${dateText} at ${time}`;
                    eventEl.style.display = 'block';
                    
                } catch (eventError) {
                    console.error('❌ Error formatting event:', eventError, event);
                    // Skip this event if there's an error
                }
            });
            
            logger.event('Dashboard', `Updated upcoming events display: ${eventsToShow.length} events shown`);
            
        } catch (error) {
            console.error('❌ Error updating upcoming events:', error);
            
            // Fallback: show error message
            const event1El = document.getElementById('event-1');
            if (event1El) {
                event1El.textContent = 'Calendar temporarily unavailable';
                event1El.style.display = 'block';
            }
        }
    }
    
    /**
     * Check if date is today
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is today
     */
    isToday(date) {
        if (!date || !(date instanceof Date)) {
            return false;
        }
        
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    /**
     * Check if date is tomorrow
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is tomorrow
     */
    isTomorrow(date) {
        if (!date || !(date instanceof Date)) {
            return false;
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.getDate() === tomorrow.getDate() &&
               date.getMonth() === tomorrow.getMonth() &&
               date.getFullYear() === tomorrow.getFullYear();
    }
    
    /**
     * Switch view
     */
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });
        
        // Hide all views
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const viewEl = document.getElementById(`${viewName}-view`);
        if (viewEl) {
            viewEl.classList.add('active');
        }
        
        this.state.currentView = viewName;
        this.resetIdleTimer();
        
        // Special handling for calendar
        if (viewName === 'calendar' && this.managers.calendar) {
            this.managers.calendar.render();
        }
        
        // Special handling for performance view - initialize performance dashboard
        if (viewName === 'performance') {
            this.initializePerformanceDashboard();
        }
    }
    
    /**
     * Initialize performance dashboard
     */
    initializePerformanceDashboard() {
        const container = document.getElementById('performance-dashboard-container');
        if (container && !this.performanceDashboard) {
            try {
                this.performanceDashboard = createPerformanceDashboard(container, {
                    updateInterval: 3000, // Update every 3 seconds
                    showAlerts: true,
                    showMetrics: true,
                    showMemory: true
                });
                
                // Show the dashboard
                this.performanceDashboard.show();
                
                console.log('🔍 Performance dashboard initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize performance dashboard:', error);
            }
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : 
                         type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 20px 32px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    /**
     * Load settings from storage
     */
    loadSettings() {
        const saved = loadFromStorage('SETTINGS');
        return {
            ...CONFIG.DEFAULT_SETTINGS,
            ...saved
        };
    }
    
    /**
     * Save settings to storage
     */
    saveSettings() {
        saveToStorage('SETTINGS', this.state.settings);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.state.clockInterval) clearInterval(this.state.clockInterval);
        if (this.state.messageInterval) clearInterval(this.state.messageInterval);
        if (this.state.idleTimeout) clearTimeout(this.state.idleTimeout);
        
        if (this.managers.calendar) {
            this.managers.calendar.destroy();
        }
        
        if (this.performanceDashboard) {
            this.performanceDashboard.destroy();
        }
    }
}

// Add required animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for use
export default FridgeDashboard;