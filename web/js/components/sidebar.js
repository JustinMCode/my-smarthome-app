/**
 * Sidebar Manager
 * Manages sidebar navigation and widgets
 */

import { CONFIG, debug } from '../constants/config.js';

export class SidebarManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.weatherUpdateInterval = null;
        this.isCollapsed = false;
    }
    
    /**
     * Initialize the sidebar manager
     */
    init() {
        debug('Initializing Sidebar Manager...');
        
        this.setupEventListeners();
        this.updateWeather();
        this.startWeatherUpdates();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Clock widget click
        const clockWidget = document.querySelector('.sidebar-clock');
        if (clockWidget) {
            clockWidget.addEventListener('click', () => {
                this.dashboard.showView('calendar');
                this.dashboard.managers.calendar?.navigate('today');
            });
        }
        
        // Weather widget click
        const weatherWidget = document.querySelector('.sidebar-weather');
        if (weatherWidget) {
            weatherWidget.addEventListener('click', () => {
                this.updateWeather(true);
            });
        }
        
        // Add sidebar toggle functionality (if needed)
        this.setupSidebarToggle();
    }
    
    /**
     * Setup sidebar toggle
     */
    setupSidebarToggle() {
        // Create toggle button if it doesn't exist
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        let toggleBtn = sidebar.querySelector('.sidebar-toggle');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle';
            toggleBtn.innerHTML = '◀';
            toggleBtn.style.display = 'none'; // Hidden by default, can be enabled
            sidebar.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }
    
    /**
     * Toggle sidebar collapsed state
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = sidebar?.querySelector('.sidebar-toggle');
        
        if (sidebar) {
            this.isCollapsed = !this.isCollapsed;
            sidebar.classList.toggle('collapsed', this.isCollapsed);
            
            if (toggleBtn) {
                toggleBtn.innerHTML = this.isCollapsed ? '▶' : '◀';
            }
            
            debug(`Sidebar ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
        }
    }
    
    /**
     * Update weather display
     */
    async updateWeather(force = false) {
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherTemp = document.getElementById('weatherTemp');
        const weatherDesc = document.getElementById('weatherDesc');
        
        if (!weatherIcon || !weatherTemp || !weatherDesc) return;
        
        // Check if we have an API key
        if (CONFIG.WEATHER_API_KEY) {
            try {
                const weather = await this.fetchWeatherData();
                this.displayWeather(weather);
            } catch (error) {
                debug('Failed to fetch weather:', error);
                this.displayDefaultWeather();
            }
        } else {
            // Use mock data
            this.displayDefaultWeather();
        }
        
        if (force) {
            this.dashboard.showNotification('Weather updated!', 'info', 2000);
        }
    }
    
    /**
     * Fetch weather data from API
     */
    async fetchWeatherData() {
        if (!CONFIG.WEATHER_API_KEY) {
            throw new Error('No weather API key configured');
        }
        
        // Example using OpenWeatherMap API
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.WEATHER_CITY}&units=${CONFIG.WEATHER_UNITS}&appid=${CONFIG.WEATHER_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather API request failed');
        }
        
        const data = await response.json();
        
        return {
            temp: Math.round(data.main.temp),
            description: data.weather[0].main,
            icon: this.getWeatherEmoji(data.weather[0].id)
        };
    }
    
    /**
     * Get weather emoji based on condition code
     */
    getWeatherEmoji(code) {
        // OpenWeatherMap condition codes
        if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
        if (code >= 300 && code < 400) return '🌦️'; // Drizzle
        if (code >= 500 && code < 600) return '🌧️'; // Rain
        if (code >= 600 && code < 700) return '❄️'; // Snow
        if (code >= 700 && code < 800) return '🌫️'; // Atmosphere
        if (code === 800) return '☀️'; // Clear
        if (code > 800) return '☁️'; // Clouds
        return '🌤️'; // Default
    }
    
    /**
     * Display weather data
     */
    displayWeather(weather) {
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherTemp = document.getElementById('weatherTemp');
        const weatherDesc = document.getElementById('weatherDesc');
        
        if (weatherIcon) weatherIcon.textContent = weather.icon;
        if (weatherTemp) {
            const unit = CONFIG.WEATHER_UNITS === 'metric' ? '°C' : '°F';
            weatherTemp.textContent = `${weather.temp}${unit}`;
        }
        if (weatherDesc) weatherDesc.textContent = weather.description;
    }
    
    /**
     * Display default weather (mock data)
     */
    displayDefaultWeather() {
        const hour = new Date().getHours();
        let weather;
        
        // Simulate different weather based on time
        if (hour >= 6 && hour < 12) {
            weather = {
                icon: '🌤️',
                temp: 68,
                description: 'Partly Cloudy'
            };
        } else if (hour >= 12 && hour < 18) {
            weather = {
                icon: '☀️',
                temp: 75,
                description: 'Sunny'
            };
        } else if (hour >= 18 && hour < 22) {
            weather = {
                icon: '🌅',
                temp: 70,
                description: 'Clear'
            };
        } else {
            weather = {
                icon: '🌙',
                temp: 62,
                description: 'Clear Night'
            };
        }
        
        this.displayWeather(weather);
    }
    
    /**
     * Start weather updates
     */
    startWeatherUpdates() {
        // Update weather periodically
        this.weatherUpdateInterval = setInterval(() => {
            this.updateWeather();
        }, CONFIG.WEATHER_UPDATE_INTERVAL_MS);
    }
    
    /**
     * Update active navigation item
     */
    updateActiveNav(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.view === viewName;
            item.classList.toggle('active', isActive);
        });
    }
    
    /**
     * Add notification badge to nav item
     */
    addNotificationBadge(viewName, count) {
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (!navItem) return;
        
        // Remove existing badge
        const existingBadge = navItem.querySelector('.nav-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'nav-badge';
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: var(--accent-danger);
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            `;
            navItem.style.position = 'relative';
            navItem.appendChild(badge);
        }
    }
    
    /**
     * Show user info in sidebar
     */
    showUserInfo(userName) {
        // Check if user section exists
        let userSection = document.querySelector('.sidebar-user');
        
        if (!userSection) {
            // Create user section if it doesn't exist
            const sidebar = document.getElementById('sidebar');
            const footer = document.createElement('div');
            footer.className = 'sidebar-footer';
            
            userSection = document.createElement('div');
            userSection.className = 'sidebar-user';
            userSection.innerHTML = `
                <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${userName}</div>
                    <div class="user-status">Active</div>
                </div>
            `;
            
            footer.appendChild(userSection);
            sidebar?.appendChild(footer);
        } else {
            // Update existing user info
            const nameEl = userSection.querySelector('.user-name');
            const avatarEl = userSection.querySelector('.user-avatar');
            
            if (nameEl) nameEl.textContent = userName;
            if (avatarEl) avatarEl.textContent = userName.charAt(0).toUpperCase();
        }
    }
    
    /**
     * Highlight nav item temporarily
     */
    highlightNavItem(viewName) {
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (!navItem) return;
        
        navItem.style.animation = 'pulse 0.5s ease 2';
        
        setTimeout(() => {
            navItem.style.animation = '';
        }, 1000);
    }
    
    /**
     * Get current weather data
     */
    getCurrentWeather() {
        const weatherTemp = document.getElementById('weatherTemp');
        const weatherDesc = document.getElementById('weatherDesc');
        const weatherIcon = document.getElementById('weatherIcon');
        
        return {
            temperature: weatherTemp?.textContent || 'N/A',
            description: weatherDesc?.textContent || 'Unknown',
            icon: weatherIcon?.textContent || '🌤️'
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug('Destroying Sidebar Manager');
        
        if (this.weatherUpdateInterval) {
            clearInterval(this.weatherUpdateInterval);
        }
    }
}