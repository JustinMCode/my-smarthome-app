/**
 * Idle Manager - Enhanced Version for 15" Display
 * Manages idle screen functionality with modern visual effects
 */

import { CONFIG, getCurrentTheme, debug } from '../constants/config.js';

export class IdleManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.idleTimeout = null;
        this.clockInterval = null;
        this.currentMessageIndex = 0;
        this.isPaused = false;
        this.lastInteraction = Date.now();
        this.particles = [];
    }
    
    /**
     * Initialize the idle manager
     */
    init() {
        debug('Initializing Enhanced Idle Manager...');
        
        this.setupEventListeners();
        this.startIdleTimer();
        this.startClockUpdate();
        this.applyTheme();
        this.createParticles();
    }
    
    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        // Idle screen click handler - try both possible IDs
        let idleScreen = document.getElementById('idleScreen');
        if (!idleScreen) idleScreen = document.getElementById('idle');
        
        if (idleScreen) {
            idleScreen.addEventListener('click', () => {
                this.handleIdleScreenClick();
            });
            
            // Prevent accidental double-taps
            idleScreen.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        }
        
        // Track user interactions
        const interactionEvents = [
            'click',
            'touchstart',
            'touchend',
            'mousemove',
            'keydown',
            'scroll',
            'wheel'
        ];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                // Don't track interactions on the idle screen itself
                if (!e.target.closest('.idle-screen, .idle-page')) {
                    this.handleUserInteraction();
                }
            }, { passive: true });
        });
    }
    
    /**
     * Handle user interaction
     */
    handleUserInteraction() {
        this.lastInteraction = Date.now();
        
        if (!this.dashboard.state.isIdle && !this.isPaused) {
            this.resetTimer();
        }
    }
    
    /**
     * Handle idle screen click
     */
    handleIdleScreenClick() {
        debug('Idle screen clicked - waking up');
        // Let the dashboard handle the transition
        if (this.dashboard.dismissIdle) {
            this.dashboard.dismissIdle();
        } else {
            this.hideIdleScreen();
            this.dashboard.setIdleMode(false);
        }
        this.resetTimer();
    }
    
    /**
     * Start the idle timer
     */
    startIdleTimer() {
        this.resetTimer();
    }
    
    /**
     * Reset the idle timer
     */
    resetTimer() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        if (!this.isPaused) {
            const timeout = this.dashboard.state.settings?.idleTimeout || CONFIG.IDLE_TIMEOUT_MS;
            
            this.idleTimeout = setTimeout(() => {
                if (!this.dashboard.state.isIdle && !this.isPaused) {
                    debug('Idle timeout reached - showing idle screen');
                    this.showIdleScreen();
                    this.dashboard.setIdleMode(true);
                }
            }, timeout);
        }
    }
    
    /**
     * Show the idle screen with animations
     */
    showIdleScreen() {
        // Close all open modals/popups before showing idle screen
        if (this.dashboard && this.dashboard.closeAllModals) {
            this.dashboard.closeAllModals();
        }
        
        // Try both possible IDs for compatibility
        let idleScreen = document.getElementById('idleScreen');
        if (!idleScreen) idleScreen = document.getElementById('idle');
        
        if (idleScreen) {
            // Apply current theme
            this.applyTheme();
            
            // Update time and events before showing
            this.updateTimeDisplay();
            this.updateEvents();
            
            // Add active class with animation
            idleScreen.classList.add('transitioning');
            setTimeout(() => {
                idleScreen.classList.add('active');
                idleScreen.classList.remove('transitioning');
            }, 10);
            
            // Start continuous updates
            this.startClockUpdate();
        }
    }
    
    /**
     * Hide the idle screen
     */
    hideIdleScreen() {
        // Try both possible IDs for compatibility
        let idleScreen = document.getElementById('idleScreen');
        if (!idleScreen) idleScreen = document.getElementById('idle');
        
        if (idleScreen) {
            idleScreen.classList.remove('active');
            
            // Stop clock updates when hidden
            if (this.clockInterval) {
                clearInterval(this.clockInterval);
                this.clockInterval = null;
            }
        }
    }
    
    /**
     * Start clock updates
     */
    startClockUpdate() {
        // Clear any existing interval
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        
        // Update immediately
        this.updateTimeDisplay();
        
        // Update every second
        this.clockInterval = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }
    
    /**
     * Update time display
     */
    updateTimeDisplay() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        // Update clock
        const clockElement = document.querySelector('.large-clock');
        if (clockElement) {
            clockElement.textContent = timeString;
            clockElement.setAttribute('data-time', timeString);
        }
        
        // Update date
        const dateElement = document.querySelector('.large-date');
        if (dateElement) {
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }
    
    /**
     * Update events display
     */
    updateEvents() {
        // Try to get events from dashboard
        const events = this.dashboard.getUpcomingEvents ? 
            this.dashboard.getUpcomingEvents() : [];
        
        const eventsContainer = document.querySelector('.upcoming-events');
        if (eventsContainer) {
            // Clear existing events
            eventsContainer.innerHTML = '';
            
            // Add up to 3 events
            const eventsToShow = events.slice(0, 3);
            eventsToShow.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.textContent = event.title;
                eventsContainer.appendChild(eventElement);
            });
            
            // Hide section if no events
            const eventSection = document.querySelector('.next-event-section');
            if (eventSection) {
                eventSection.style.display = eventsToShow.length > 0 ? 'flex' : 'none';
            }
        }
        
        // Legacy support for single event
        const nextEventElement = document.querySelector('.next-event');
        if (nextEventElement && events.length > 0) {
            nextEventElement.textContent = events[0].title;
        }
    }
    
    /**
     * Create animated particles
     */
    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) {
            // Create particles container if it doesn't exist
            const idleScreen = document.getElementById('idleScreen') || 
                              document.getElementById('idle');
            if (idleScreen) {
                const container = document.createElement('div');
                container.className = 'particles';
                
                // Create 9 particles with staggered animations
                for (let i = 0; i < 9; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = `${10 + (i * 10)}%`;
                    particle.style.animationDelay = `${i * 2}s`;
                    container.appendChild(particle);
                }
                
                // Insert particles as first child
                idleScreen.insertBefore(container, idleScreen.firstChild);
            }
        }
    }
    
    /**
     * Apply theme based on time of day
     */
    applyTheme() {
        // Try both possible IDs for compatibility
        let idleScreen = document.getElementById('idleScreen');
        if (!idleScreen) idleScreen = document.getElementById('idle');
        
        if (idleScreen) {
            // Remove all theme classes
            const themes = ['theme-morning', 'theme-day', 'theme-evening', 'theme-night'];
            themes.forEach(theme => {
                idleScreen.classList.remove(theme);
            });
            
            // Apply current theme
            const currentTheme = this.getTimeBasedTheme();
            idleScreen.classList.add(currentTheme);
            
            debug(`Applied idle theme: ${currentTheme}`);
        }
    }
    
    /**
     * Get theme based on current time
     */
    getTimeBasedTheme() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 9) {
            return 'theme-morning';
        } else if (hour >= 9 && hour < 17) {
            return 'theme-day';
        } else if (hour >= 17 && hour < 21) {
            return 'theme-evening';
        } else {
            return 'theme-night';
        }
    }
    
    /**
     * Pause idle timer (when app is in background)
     */
    pause() {
        debug('Pausing idle timer');
        this.isPaused = true;
        
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }
    
    /**
     * Resume idle timer
     */
    resume() {
        debug('Resuming idle timer');
        this.isPaused = false;
        
        // Check if we should go idle immediately
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        const timeout = this.dashboard.state.settings?.idleTimeout || CONFIG.IDLE_TIMEOUT_MS;
        
        if (timeSinceInteraction >= timeout && !this.dashboard.state.isIdle) {
            this.showIdleScreen();
            this.dashboard.setIdleMode(true);
        } else {
            this.resetTimer();
        }
        
        // Resume clock if idle
        if (this.dashboard.state.isIdle) {
            this.startClockUpdate();
        }
    }
    
    /**
     * Get remaining time until idle
     */
    getRemainingTime() {
        const timeSinceInteraction = Date.now() - this.lastInteraction;
        const timeout = this.dashboard.state.settings?.idleTimeout || CONFIG.IDLE_TIMEOUT_MS;
        
        return Math.max(0, timeout - timeSinceInteraction);
    }
    
    /**
     * Force idle mode
     */
    forceIdle() {
        debug('Forcing idle mode');
        
        if (!this.dashboard.state.isIdle) {
            this.showIdleScreen();
            this.dashboard.setIdleMode(true);
        }
    }
    
    /**
     * Force active mode
     */
    forceActive() {
        debug('Forcing active mode');
        
        if (this.dashboard.state.isIdle) {
            this.hideIdleScreen();
            this.dashboard.setIdleMode(false);
            this.resetTimer();
        }
    }
    
    /**
     * Update settings
     */
    updateSettings(settings) {
        if (settings.idleTimeout !== undefined) {
            this.resetTimer();
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug('Destroying Idle Manager');
        
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}