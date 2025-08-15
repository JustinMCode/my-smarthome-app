/**
 * Tasks Helper Functions
 * Pure utility functions for common operations
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    // Relative dates
    if (targetDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else if (targetDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }
    
    // Absolute dates
    const defaultOptions = {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    };
    
    return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format time for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export function formatTime(date, options = {}) {
    const d = new Date(date);
    const defaultOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    return d.toLocaleTimeString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format datetime for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date, options = {}) {
    const dateStr = formatDate(date, options.date);
    const timeStr = formatTime(date, options.time);
    return `${dateStr} at ${timeStr}`;
}

/**
 * Format date for datetime-local input
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string for input
 */
export function formatDateTimeLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Calculate time ago
 * @param {Date|string} date - Date to calculate from
 * @returns {string} Time ago string
 */
export function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
        return 'just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    return obj;
}

/**
 * Check if two objects are equal (shallow comparison)
 * @param {*} a - First object
 * @param {*} b - Second object
 * @returns {boolean} True if equal
 */
export function shallowEqual(a, b) {
    if (a === b) return true;
    
    if (a == null || b == null) return false;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a !== 'object') return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
        if (!keysB.includes(key) || a[key] !== b[key]) {
            return false;
        }
    }
    
    return true;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return '';
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
export function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
export function camelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
    if (typeof text !== 'string') {
        return '';
    }
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if code is running in development mode
 * @returns {boolean} True if in development
 */
export function isDevelopment() {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
}

/**
 * Safe JSON parse that doesn't throw
 * @param {string} str - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export function safeJsonParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Safe JSON stringify that doesn't throw
 * @param {*} obj - Object to stringify
 * @param {string} defaultValue - Default value if stringifying fails
 * @returns {string} JSON string or default value
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
    try {
        return JSON.stringify(obj);
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Create a cancelable promise
 * @param {Promise} promise - Promise to make cancelable
 * @returns {Object} Object with promise and cancel function
 */
export function makeCancelable(promise) {
    let hasCanceled = false;
    
    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            value => hasCanceled ? reject(new Error('Canceled')) : resolve(value),
            error => hasCanceled ? reject(new Error('Canceled')) : reject(error)
        );
    });
    
    return {
        promise: wrappedPromise,
        cancel: () => { hasCanceled = true; }
    };
}

/**
 * Query selector with null safety
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} Found element
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Query selector all with null safety
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList} Found elements
 */
export function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Element to add listener to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {Function} Cleanup function
 */
export function addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Wait for element to appear in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @param {Element} parent - Parent element to search in
 * @returns {Promise<Element>} Promise that resolves with element
 */
export function waitForElement(selector, timeout = 5000, parent = document) {
    return new Promise((resolve, reject) => {
        const element = parent.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const element = parent.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(parent, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Get element's computed style property
 * @param {Element} element - Element to get style from
 * @param {string} property - CSS property name
 * @returns {string} Computed style value
 */
export function getComputedStyleProperty(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Check if element is visible
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is visible
 */
export function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           getComputedStyleProperty(element, 'visibility') !== 'hidden' &&
           getComputedStyleProperty(element, 'display') !== 'none';
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export function scrollToElement(target, options = {}) {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success/failure
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Name of the file
 * @param {string} type - MIME type
 */
export function downloadAsFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get URL parameters as object
 * @param {string} url - URL to parse (default: current URL)
 * @returns {Object} URL parameters
 */
export function getUrlParams(url = window.location.href) {
    const params = {};
    const urlObj = new URL(url);
    
    for (const [key, value] of urlObj.searchParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Set URL parameter without page reload
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 * @param {boolean} replaceState - Whether to replace or push state
 */
export function setUrlParam(key, value, replaceState = true) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    
    if (replaceState) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
}

/**
 * Remove URL parameter without page reload
 * @param {string} key - Parameter key to remove
 * @param {boolean} replaceState - Whether to replace or push state
 */
export function removeUrlParam(key, replaceState = true) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    
    if (replaceState) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
}

/**
 * Check if string is valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if string is valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate random color
 * @param {string} format - Color format ('hex', 'rgb', 'hsl')
 * @returns {string} Random color
 */
export function randomColor(format = 'hex') {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100) + '%';
    const l = Math.floor(Math.random() * 100) + '%';
    
    switch (format) {
        case 'hsl':
            return `hsl(${h}, ${s}, ${l})`;
        case 'rgb':
            // Convert HSL to RGB
            const hslToRgb = (h, s, l) => {
                h /= 360;
                s /= 100;
                l /= 100;
                
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
                const g = Math.round(hue2rgb(p, q, h) * 255);
                const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
                
                return `rgb(${r}, ${g}, ${b})`;
            };
            return hslToRgb(h, parseInt(s), parseInt(l));
        case 'hex':
        default:
            return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    }
}

/**
 * Simple hash function for strings
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
export function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Get consistent color for string (useful for user avatars, etc.)
 * @param {string} str - String to generate color for
 * @param {string} format - Color format
 * @returns {string} Consistent color for string
 */
export function getConsistentColor(str, format = 'hex') {
    const hash = simpleHash(str);
    const h = hash % 360;
    const s = 70; // Fixed saturation for better colors
    const l = 50; // Fixed lightness for better contrast
    
    switch (format) {
        case 'hsl':
            return `hsl(${h}, ${s}%, ${l}%)`;
        case 'hex':
        default:
            // Convert HSL to hex
            const hslToHex = (h, s, l) => {
                l /= 100;
                const a = s * Math.min(l, 1 - l) / 100;
                const f = n => {
                    const k = (n + h / 30) % 12;
                    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                    return Math.round(255 * color).toString(16).padStart(2, '0');
                };
                return `#${f(0)}${f(8)}${f(4)}`;
            };
            return hslToHex(h, s, l);
    }
}

/**
 * Create retryable function
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Function} Retryable function
 */
export function createRetryable(fn, maxRetries = 3, delay = 1000) {
    return async function(...args) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                lastError = error;
                if (i < maxRetries) {
                    await sleep(delay * Math.pow(2, i)); // Exponential backoff
                }
            }
        }
        
        throw lastError;
    };
}
