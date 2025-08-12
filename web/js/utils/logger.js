/**
 * Centralized Logging Utility
 * Provides configurable logging levels and environment-based filtering
 */

class Logger {
    constructor() {
        this.logLevel = this.getLogLevel();
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.isProduction = !this.isDevelopment;
        
        // In production, only show ERROR and WARN by default
        if (this.isProduction && this.logLevel === 'DEBUG') {
            this.logLevel = 'WARN';
        }
    }
    
    getLogLevel() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const urlLogLevel = urlParams.get('log');
        if (urlLogLevel) {
            return urlLogLevel.toUpperCase();
        }
        
        // Check localStorage
        const storedLevel = localStorage.getItem('logLevel');
        if (storedLevel) {
            return storedLevel.toUpperCase();
        }
        
        // Default based on environment
        return this.isDevelopment ? 'INFO' : 'WARN';
    }
    
    setLogLevel(level) {
        this.logLevel = level.toUpperCase();
        localStorage.setItem('logLevel', this.logLevel);
    }
    
    shouldLog(level) {
        const levels = {
            'ERROR': 0,
            'WARN': 1,
            'INFO': 2,
            'DEBUG': 3
        };
        
        return levels[level] <= levels[this.logLevel];
    }
    
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] [${level}]`;
        
        if (args.length > 0) {
            return [prefix, message, ...args];
        }
        return [prefix, message];
    }
    
    error(message, ...args) {
        if (this.shouldLog('ERROR')) {
            console.error(...this.formatMessage('ERROR', message, ...args));
        }
    }
    
    warn(message, ...args) {
        if (this.shouldLog('WARN')) {
            console.warn(...this.formatMessage('WARN', message, ...args));
        }
    }
    
    info(message, ...args) {
        if (this.shouldLog('INFO')) {
            console.log(...this.formatMessage('INFO', message, ...args));
        }
    }
    
    debug(message, ...args) {
        if (this.shouldLog('DEBUG')) {
            console.log(...this.formatMessage('DEBUG', message, ...args));
        }
    }
    
    // Convenience methods for common patterns
    init(component, message, ...args) {
        this.info(`🚀 ${component}: ${message}`, ...args);
    }
    
    ready(component, message, ...args) {
        this.info(`✅ ${component}: ${message}`, ...args);
    }
    
    loading(component, message, ...args) {
        this.info(`📅 ${component}: ${message}`, ...args);
    }
    
    event(component, message, ...args) {
        this.debug(`📅 ${component}: ${message}`, ...args);
    }
    
    filter(component, message, ...args) {
        this.debug(`📊 ${component}: ${message}`, ...args);
    }
    
    refresh(component, message, ...args) {
        this.debug(`🔄 ${component}: ${message}`, ...args);
    }
    
    destroy(component, message, ...args) {
        this.debug(`🗑️ ${component}: ${message}`, ...args);
    }
}

// Create singleton instance
export const logger = new Logger();

// Export for direct use
export default logger;
