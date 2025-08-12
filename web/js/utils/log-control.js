/**
 * Log Control Utility
 * Allows dynamic control of logging levels through browser console
 */

import { logger } from './logger.js';

// Expose logging controls to global scope for easy access
window.LogControl = {
    /**
     * Set logging level
     * @param {string} level - 'ERROR', 'WARN', 'INFO', 'DEBUG'
     */
    setLevel: (level) => {
        logger.setLogLevel(level);
        console.log(`📊 Log level set to: ${level}`);
        console.log(`📊 Current level: ${logger.logLevel}`);
    },
    
    /**
     * Get current logging level
     */
    getLevel: () => {
        console.log(`📊 Current log level: ${logger.logLevel}`);
        return logger.logLevel;
    },
    
    /**
     * Show available log levels
     */
    help: () => {
        console.log(`
📊 Log Control Commands:
• LogControl.setLevel('ERROR') - Only show errors
• LogControl.setLevel('WARN') - Show warnings and errors
• LogControl.setLevel('INFO') - Show info, warnings, and errors (default)
• LogControl.setLevel('DEBUG') - Show all logs
• LogControl.getLevel() - Show current level
• LogControl.help() - Show this help
        `);
    },
    
    /**
     * Quick presets
     */
    quiet: () => LogControl.setLevel('ERROR'),
    normal: () => LogControl.setLevel('INFO'),
    verbose: () => LogControl.setLevel('DEBUG')
};

// Auto-show help on first load
if (!localStorage.getItem('logControlHelpShown')) {
    setTimeout(() => {
        console.log('📊 Log Control available! Type LogControl.help() for options');
        localStorage.setItem('logControlHelpShown', 'true');
    }, 2000);
}

export default window.LogControl;
