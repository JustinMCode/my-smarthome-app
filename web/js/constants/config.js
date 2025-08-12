/**
 * Configuration File
 * Central configuration for the fridge dashboard
 */

export const CONFIG = {
    // Timing Configuration
    IDLE_TIMEOUT_MS: 60000, // 1 minute
    CLOCK_UPDATE_INTERVAL_MS: 1000, // 1 second
    MESSAGE_ROTATION_INTERVAL_MS: 5000, // 5 seconds
    WEATHER_UPDATE_INTERVAL_MS: 600000, // 10 minutes
    
    // Idle Messages
    FUN_MESSAGES: [
        "Have a wonderful day! 🌟",
        "Don't forget to smile! 😊",
        "You're doing great! 💪",
        "Time for a water break? 💧",
        "Kitchen magic happens here! ✨",
        "Today is full of possibilities! 🌈",
        "Family is everything ❤️",
        "Cooking up something special? 🍳",
        "Stay organized, stay happy! 📋",
        "Home is where the heart is 🏠",
        "Remember to breathe deeply 🌸",
        "You've got this! 🎯",
        "Make today amazing! ⭐",
        "Happiness is homemade 🏡",
        "Create beautiful memories 📸"
    ],
    
    // Weather Configuration
    WEATHER_API_KEY: '', // Add your weather API key here
    WEATHER_CITY: 'San Francisco',
    WEATHER_UNITS: 'imperial', // 'metric' or 'imperial'
    
    // Calendar Configuration
    CALENDAR_FIRST_DAY: 0, // 0 = Sunday, 1 = Monday
    CALENDAR_DEFAULT_VIEW: 'month', // 'month' or 'week'
    WEEK_START_HOUR: 6,
    WEEK_END_HOUR: 22,
    
    // Theme Configuration
    IDLE_THEMES: {
        morning: { start: 5, end: 12, class: 'theme-morning' },
        day: { start: 12, end: 17, class: 'theme-day' },
        evening: { start: 17, end: 21, class: 'theme-evening' },
        night: { start: 21, end: 5, class: 'theme-night' }
    },
    
    // Storage Keys
    STORAGE_PREFIX: 'fridge_dashboard_',
    STORAGE_KEYS: {
        EVENTS: 'events',
        SHOPPING_LIST: 'shopping_list',
        NOTES: 'notes',
        SETTINGS: 'settings',
        REMINDERS: 'reminders',
        RECIPES: 'recipes',
        TIMERS: 'timers'
    },
    
    // Default User Settings
    DEFAULT_SETTINGS: {
        userName: 'Family',
        use24Hour: false,
        temperatureUnit: 'F',
        firstDayOfWeek: 0,
        idleTimeout: 60000,
        enableAnimations: true,
        enableSounds: false,
        theme: 'auto'
    },
    
    // Event Categories
    EVENT_CATEGORIES: {
        work: { color: '#3b82f6', icon: '💼' },
        personal: { color: '#10b981', icon: '👤' },
        family: { color: '#f59e0b', icon: '👨‍👩‍👧‍👦' },
        health: { color: '#ef4444', icon: '🏥' },
        social: { color: '#8b5cf6', icon: '🎉' },
        other: { color: '#64748b', icon: '📌' }
    },
    
    // API Endpoints (if using backend)
    API_BASE_URL: '',
    API_ENDPOINTS: {
        EVENTS: '/api/calendar/events',
        WEATHER: '/api/weather',
        RECIPES: '/api/recipes',
        SHOPPING: '/api/shopping'
    },
    
    // Debug Mode
    DEBUG: false
};

// Helper function to get storage key
export function getStorageKey(key) {
    return CONFIG.STORAGE_PREFIX + CONFIG.STORAGE_KEYS[key];
}

// Helper function to get current theme based on time
export function getCurrentTheme() {
    const hour = new Date().getHours();
    
    for (const [name, theme] of Object.entries(CONFIG.IDLE_THEMES)) {
        if (theme.start > theme.end) {
            // Handle overnight periods (e.g., night: 21-5)
            if (hour >= theme.start || hour < theme.end) {
                return theme.class;
            }
        } else {
            if (hour >= theme.start && hour < theme.end) {
                return theme.class;
            }
        }
    }
    
    return 'theme-day'; // Default theme
}

// Debug logger
export function debug(...args) {
    if (CONFIG.DEBUG) {
        console.log('[Fridge Dashboard]', ...args);
    }
}