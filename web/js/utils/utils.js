/**
 * Utility Functions
 * Common helper functions for the Smart Fridge Dashboard
 */

import { CONFIG, getStorageKey } from '../constants/config.js';

/**
 * Date and Time Formatting
 */

export function formatTime(date, use24Hour = false, includeSeconds = false) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (use24Hour) {
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return includeSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
    } else {
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')}`;
        const fullTime = includeSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
        return `${fullTime} ${ampm}`;
    }
}

export function formatDate(date, format = 'full') {
    const options = {
        'full': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        'long': { weekday: 'long', month: 'long', day: 'numeric' },
        'short': { weekday: 'short', month: 'short', day: 'numeric' },
        'short-date': { month: 'short', day: 'numeric' },
        'month-year': { month: 'long', year: 'numeric' },
        'weekday': { weekday: 'long' },
        'weekday-short': { weekday: 'short' },
        'date-only': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'iso': { year: 'numeric', month: '2-digit', day: '2-digit' }
    };
    
    if (format === 'iso') {
        return date.toISOString().split('T')[0];
    }
    
    return date.toLocaleDateString('en-US', options[format] || options['full']);
}

export function formatRelativeTime(date) {
    const now = new Date();
    const diff = date - now;
    const absDiff = Math.abs(diff);
    
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const past = diff < 0;
    
    if (seconds < 60) {
        return 'just now';
    } else if (minutes < 60) {
        const unit = minutes === 1 ? 'minute' : 'minutes';
        return past ? `${minutes} ${unit} ago` : `in ${minutes} ${unit}`;
    } else if (hours < 24) {
        const unit = hours === 1 ? 'hour' : 'hours';
        return past ? `${hours} ${unit} ago` : `in ${hours} ${unit}`;
    } else if (days < 7) {
        const unit = days === 1 ? 'day' : 'days';
        return past ? `${days} ${unit} ago` : `in ${days} ${unit}`;
    } else {
        return formatDate(date, 'short-date');
    }
}

export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
}

/**
 * Storage Functions
 */

export function loadFromStorage(key) {
    try {
        const storageKey = getStorageKey(key);
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Failed to load ${key} from storage:`, error);
        return null;
    }
}

export function saveToStorage(key, data) {
    try {
        const storageKey = getStorageKey(key);
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Failed to save ${key} to storage:`, error);
        return false;
    }
}

export function removeFromStorage(key) {
    try {
        const storageKey = getStorageKey(key);
        localStorage.removeItem(storageKey);
        return true;
    } catch (error) {
        console.error(`Failed to remove ${key} from storage:`, error);
        return false;
    }
}

export function clearAllStorage() {
    try {
        const prefix = CONFIG.STORAGE_PREFIX;
        const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
        keys.forEach(key => localStorage.removeItem(key));
        return true;
    } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
    }
}

/**
 * DOM Utilities
 */

export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on')) {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    });
    
    return element;
}

export function querySelector(selector, parent = document) {
    return parent.querySelector(selector);
}

export function querySelectorAll(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

export function addClass(element, ...classes) {
    element.classList.add(...classes);
}

export function removeClass(element, ...classes) {
    element.classList.remove(...classes);
}

export function toggleClass(element, className, force) {
    element.classList.toggle(className, force);
}

export function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * Event Utilities
 */

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function once(func) {
    let called = false;
    let result;
    return function(...args) {
        if (!called) {
            called = true;
            result = func.apply(this, args);
        }
        return result;
    };
}

/**
 * Array and Object Utilities
 */

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function sortBy(array, property, ascending = true) {
    return array.sort((a, b) => {
        const aVal = typeof property === 'function' ? property(a) : a[property];
        const bVal = typeof property === 'function' ? property(b) : b[property];
        
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

export function groupBy(array, property) {
    return array.reduce((groups, item) => {
        const key = typeof property === 'function' ? property(item) : item[property];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

export function unique(array, property) {
    if (property) {
        const seen = new Set();
        return array.filter(item => {
            const key = typeof property === 'function' ? property(item) : item[property];
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    return [...new Set(array)];
}

/**
 * String Utilities
 */

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, length = 50, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

export function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Number Utilities
 */

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function roundTo(num, decimals) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Async Utilities
 */

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry(func, attempts = 3, delay = 1000) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await func();
        } catch (error) {
            if (i === attempts - 1) throw error;
            await sleep(delay);
        }
    }
}

/**
 * Validation Utilities
 */

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

/**
 * Device Utilities
 */

export function isTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
}

export function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

export function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

/**
 * Color Utilities
 */

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function lightenColor(color, percent) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const factor = percent / 100;
    const r = Math.round(rgb.r + (255 - rgb.r) * factor);
    const g = Math.round(rgb.g + (255 - rgb.g) * factor);
    const b = Math.round(rgb.b + (255 - rgb.b) * factor);
    
    return rgbToHex(r, g, b);
}

/**
 * Export all utilities
 */
export default {
    // Date/Time
    formatTime,
    formatDate,
    formatRelativeTime,
    formatDuration,
    
    // Storage
    loadFromStorage,
    saveToStorage,
    removeFromStorage,
    clearAllStorage,
    
    // DOM
    createElement,
    querySelector,
    querySelectorAll,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    
    // Events
    debounce,
    throttle,
    once,
    
    // Objects/Arrays
    deepClone,
    deepMerge,
    sortBy,
    groupBy,
    unique,
    
    // Strings
    capitalize,
    truncate,
    slugify,
    
    // Numbers
    clamp,
    randomInt,
    randomFloat,
    roundTo,
    
    // Async
    sleep,
    retry,
    
    // Validation
    isValidEmail,
    isValidUrl,
    isValidDate,
    
    // Device
    isTouchDevice,
    isPortrait,
    getDeviceType,
    
    // Colors
    hexToRgb,
    rgbToHex,
    lightenColor
};