/**
 * Calendar Modal Components Index
 * 
 * This module provides centralized access to all modal and popup components
 * for the calendar system. These components handle event details, day events,
 * quick add dialogs, and provide sophisticated modal management for all calendar views.
 * 
 * @module CalendarModalComponents
 */

// Core modal components
import { BaseModal } from './BaseModal.js';
import { EventModal } from './EventModal.js';
import { CreateEventModalController } from './create/CreateEventModalController.js';

// Import centralized hash utility
import { hashString } from '../../utils/core/hash.js';

export { BaseModal, EventModal, CreateEventModalController };

/**
 * Calendar Modal Manager Factory
 * Creates and configures modal management components with optimal settings
 * 
 * @param {Object} core - Calendar core instance
 * @param {Object} options - Configuration options
 * @returns {Object} Configured modal management components
 */
export function createModalManager(core, options = {}) {
    const {
        baseModalConfig = {},
        eventModalConfig = {},
        managerConfig = {}
    } = options;

    // Create event modal with optimized settings
    const eventModal = new EventModal();

    // Create modal manager with optimized settings
    const modalManager = new ModalManager(core, {
        enablePooling: true,
        maxPoolSize: 10,
        enableStacking: true,
        maxStackSize: 5,
        enableResponsive: true,
        updateDebounce: 100,
        ...managerConfig
    });

    return {
        eventModal,
        modalManager,
        
        // Convenience methods for common operations
        showEventDetails: (event, options) => {
            return modalManager.showEventDetails(event, {
                width: '500px',
                closeOnBackdrop: true,
                ...eventModalConfig,
                ...options
            });
        },
        
        showDayEvents: (date, events, options) => {
            return modalManager.showDayEvents(date, events, {
                width: '448px',
                closeOnBackdrop: true,
                ...eventModalConfig,
                ...options
            });
        },
        
        showQuickAdd: (startTime, endTime, options) => {
            return eventModal.showQuickAddDialog(startTime, endTime, {
                width: '400px',
                closeOnBackdrop: true,
                ...eventModalConfig,
                ...options
            });
        },
        
        showCustomModal: (content, options) => {
            return modalManager.showCustomModal(content, {
                width: 'auto',
                height: 'auto',
                ...baseModalConfig,
                ...options
            });
        },
        
        // Modal management
        closeModal: (modalId) => modalManager.closeModal(modalId),
        closeAllModals: () => modalManager.closeAllModals(),
        getActiveModals: () => modalManager.getActiveModals(),
        getModalStats: () => modalManager.getStats(),
        
        // Cleanup
        destroy: () => {
            eventModal.destroy();
            modalManager.destroy();
        }
    };
}

/**
 * Modal Manager Class
 * Manages modal operations, stacking, and lifecycle
 */
class ModalManager {
    constructor(core, options = {}) {
        this.core = core;
        this.options = {
            enablePooling: true,
            maxPoolSize: 10,
            enableStacking: true,
            maxStackSize: 5,
            enableResponsive: true,
            updateDebounce: 100,
            ...options
        };
        
        this.eventModal = new EventModal();
        this.activeModals = new Map();
        this.modalStack = [];
        this.modalPool = [];
        this.stats = {
            created: 0,
            reused: 0,
            destroyed: 0,
            stacked: 0
        };
        
        this.debounceTimer = null;
    }

    /**
     * Show event details modal
     * @param {Object} event - Event data
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    showEventDetails(event, options = {}) {
        const modalId = `event-${event.id || Date.now()}`;
        
        // Check if modal already exists
        if (this.activeModals.has(modalId)) {
            this.bringToFront(modalId);
            return this.activeModals.get(modalId);
        }
        
        // Create new modal
        const modal = this.eventModal.showEventDetails(event, {
            zIndex: this.getNextZIndex(),
            ...options
        });
        
        // Store modal reference
        this.activeModals.set(modalId, modal);
        this.modalStack.push(modalId);
        this.stats.created++;
        
        return modal;
    }

    /**
     * Show day events modal
     * @param {Date} date - Date for events
     * @param {Array} events - Array of events
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    showDayEvents(date, events, options = {}) {
        const modalId = `day-${date.toDateString()}`;
        
        // Check if modal already exists
        if (this.activeModals.has(modalId)) {
            this.bringToFront(modalId);
            return this.activeModals.get(modalId);
        }
        
        // Create new modal
        const modal = this.eventModal.showDayEventsPopup(date, events, {
            zIndex: this.getNextZIndex(),
            ...options
        });
        
        // Store modal reference
        this.activeModals.set(modalId, modal);
        this.modalStack.push(modalId);
        this.stats.created++;
        
        return modal;
    }

    /**
     * Show custom modal
     * @param {HTMLElement|string} content - Modal content
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    showCustomModal(content, options = {}) {
        const modalId = `custom-${Date.now()}`;
        
        // Create custom modal using BaseModal
        const customModal = new CustomModal();
        const modal = customModal.show({
            zIndex: this.getNextZIndex(),
            ...options
        });
        
        // Store modal reference
        this.activeModals.set(modalId, modal);
        this.modalStack.push(modalId);
        this.stats.created++;
        
        return modal;
    }

    /**
     * Bring modal to front
     * @param {string} modalId - Modal ID
     */
    bringToFront(modalId) {
        const modal = this.activeModals.get(modalId);
        if (modal) {
            modal.modal.style.zIndex = this.getNextZIndex();
            this.stats.stacked++;
        }
    }

    /**
     * Get next z-index for modal stacking
     * @returns {number} Next z-index value
     */
    getNextZIndex() {
        return 1000 + this.modalStack.length;
    }

    /**
     * Close specific modal
     * @param {string} modalId - Modal ID
     */
    closeModal(modalId) {
        const modal = this.activeModals.get(modalId);
        if (modal) {
            this.eventModal.closeModal(modal.modal, modal.overlay);
            this.activeModals.delete(modalId);
            this.modalStack = this.modalStack.filter(id => id !== modalId);
            this.stats.destroyed++;
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        this.activeModals.forEach((modal, modalId) => {
            this.closeModal(modalId);
        });
    }

    /**
     * Get active modals
     * @returns {Map} Active modals map
     */
    getActiveModals() {
        return new Map(this.activeModals);
    }

    /**
     * Get statistics
     * @returns {Object} Modal manager statistics
     */
    getStats() {
        return {
            ...this.stats,
            activeModals: this.activeModals.size,
            modalStack: this.modalStack.length,
            poolSize: this.modalPool.length
        };
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.closeAllModals();
        this.eventModal.destroy();
        this.modalPool.forEach(modal => modal.destroy());
        this.modalPool = [];
    }
}

/**
 * Custom Modal Class
 * Extends BaseModal for custom content
 */
class CustomModal extends BaseModal {
    constructor(content = null) {
        super();
        this.content = content;
    }

    /**
     * Create modal content
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal content element
     */
    createContent(options) {
        if (this.content) {
            if (typeof this.content === 'string') {
                const div = document.createElement('div');
                div.innerHTML = this.content;
                return div;
            } else if (this.content instanceof HTMLElement) {
                return this.content;
            }
        }
        
        const div = document.createElement('div');
        div.innerHTML = '<p>Custom modal content</p>';
        return div;
    }
}

/**
 * Predefined modal configurations for different use cases
 */
export const ModalConfigs = {
    /**
     * Configuration for event details modals
     */
    eventDetails: {
        backdrop: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        animation: true,
        zIndex: 1000,
        width: '500px',
        height: 'auto'
    },
    
    /**
     * Configuration for day events modals
     */
    dayEvents: {
        backdrop: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        animation: true,
        zIndex: 1000,
        width: '448px',
        height: 'auto'
    },
    
    /**
     * Configuration for quick add modals
     */
    quickAdd: {
        backdrop: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        animation: true,
        zIndex: 1000,
        width: '400px',
        height: 'auto'
    },
    
    /**
     * Configuration for mobile devices
     */
    mobile: {
        backdrop: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        animation: false,
        zIndex: 1000,
        width: '95vw',
        height: 'auto'
    },
    
    /**
     * Configuration for desktop with high resolution
     */
    desktop: {
        backdrop: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        animation: true,
        zIndex: 1000,
        width: '500px',
        height: 'auto'
    }
};

/**
 * Predefined modal strategies for different scenarios
 */
export const ModalStrategies = {
    /**
     * Strategy for high modal frequency
     */
    highFrequency: {
        enablePooling: true,
        maxPoolSize: 20,
        enableStacking: true,
        maxStackSize: 10,
        enableResponsive: true,
        updateDebounce: 50
    },
    
    /**
     * Strategy for low modal frequency
     */
    lowFrequency: {
        enablePooling: false,
        maxPoolSize: 5,
        enableStacking: false,
        maxStackSize: 1,
        enableResponsive: true,
        updateDebounce: 200
    },
    
    /**
     * Strategy for touch-friendly interactions
     */
    touchFriendly: {
        enablePooling: true,
        maxPoolSize: 10,
        enableStacking: true,
        maxStackSize: 3,
        enableResponsive: true,
        updateDebounce: 100,
        touchTargetSize: 44
    },
    
    /**
     * Strategy for compact display
     */
    compact: {
        enablePooling: true,
        maxPoolSize: 5,
        enableStacking: false,
        maxStackSize: 1,
        enableResponsive: true,
        updateDebounce: 150
    }
};

/**
 * Utility functions for modal management
 */
export const ModalUtils = {
    /**
     * Calculate optimal modal configuration for screen size
     * @param {number} screenWidth - Screen width
     * @returns {Object} Optimal modal configuration
     */
    calculateOptimalModalConfig: (screenWidth) => {
        if (screenWidth < 768) {
            return {
                width: '95vw',
                maxWidth: 'none',
                height: 'auto',
                maxHeight: '90vh',
                animation: false
            };
        } else if (screenWidth < 1024) {
            return {
                width: '80vw',
                maxWidth: '600px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        } else if (screenWidth < 1440) {
            return {
                width: '500px',
                maxWidth: '500px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        } else {
            return {
                width: '500px',
                maxWidth: '500px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        }
    },
    
    /**
     * Generate modal cache key
     * @param {string} modalType - Type of modal
     * @param {Object} content - Modal content
     * @param {Object} options - Modal options
     * @returns {string} Cache key
     */
    generateModalKey: (modalType, content, options = {}) => {
        const contentHash = hashString(JSON.stringify(content));
        const optionsHash = hashString(JSON.stringify(options));
        return `modal_${modalType}_${contentHash}_${optionsHash}`;
    },
    
    /**
     * Check if modal needs update
     * @param {Object} cachedModal - Cached modal data
     * @param {Object} currentContent - Current modal content
     * @returns {boolean} True if update is needed
     */
    needsUpdate: (cachedModal, currentContent) => {
        if (!cachedModal) return true;
        
        const age = Date.now() - cachedModal.timestamp;
        const maxAge = 300000; // 5 minutes default
        
        return age > maxAge || 
               JSON.stringify(cachedModal.content) !== JSON.stringify(currentContent);
    },
    
    /**
     * Calculate responsive modal configuration
     * @param {number} containerWidth - Container width
     * @param {number} containerHeight - Container height
     * @returns {Object} Responsive modal configuration
     */
    calculateResponsiveConfig: (containerWidth, containerHeight) => {
        const aspectRatio = containerWidth / containerHeight;
        
        if (containerWidth < 768) {
            return {
                width: '95vw',
                maxWidth: 'none',
                height: 'auto',
                maxHeight: '90vh',
                animation: false
            };
        } else if (containerWidth < 1024) {
            return {
                width: '80vw',
                maxWidth: '600px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        } else if (containerWidth < 1440) {
            return {
                width: '500px',
                maxWidth: '500px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        } else {
            return {
                width: '500px',
                maxWidth: '500px',
                height: 'auto',
                maxHeight: '80vh',
                animation: true
            };
        }
    },
    
    /**
     * Validate modal configuration
     * @param {Object} config - Modal configuration
     * @returns {Object} Validation result
     */
    validateModalConfig: (config) => {
        const errors = [];
        const warnings = [];
        
        if (config.maxStackSize && config.maxStackSize > 20) {
            warnings.push('Large stack size may impact performance');
        }
        
        if (config.maxPoolSize && config.maxPoolSize > 50) {
            warnings.push('Large pool size may impact memory usage');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },
    
    /**
     * Create modal content from template
     * @param {string} template - HTML template
     * @param {Object} data - Data to inject
     * @returns {string} Rendered content
     */
    createContentFromTemplate: (template, data) => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    },
    
    /**
     * Escape HTML content
     * @param {string} content - Content to escape
     * @returns {string} Escaped content
     */
    escapeHtml: (content) => {
        const div = document.createElement('div');
        div.textContent = content;
        return div.innerHTML;
    }
};

/**
 * Performance monitoring utilities for modals
 */
export const ModalPerformanceUtils = {
    /**
     * Measure modal creation performance
     * @param {Function} modalCreationFunction - Modal creation function
     * @param {Array} args - Arguments for the function
     * @returns {Object} Performance metrics
     */
    measureModalCreation: (modalCreationFunction, args) => {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const result = modalCreationFunction(...args);
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        return {
            result,
            creationTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            timestamp: Date.now()
        };
    },
    
    /**
     * Create performance monitor for modal operations
     * @returns {Object} Performance monitor
     */
    createModalPerformanceMonitor: () => {
        const metrics = {
            totalCreations: 0,
            totalCreationTime: 0,
            averageCreationTime: 0,
            slowestCreation: 0,
            fastestCreation: Infinity,
            memoryUsage: []
        };
        
        return {
            measureCreation: (operationName, operation) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = operation();
                
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const creationTime = endTime - startTime;
                const memoryUsage = endMemory - startMemory;
                
                // Update metrics
                metrics.totalCreations++;
                metrics.totalCreationTime += creationTime;
                metrics.averageCreationTime = metrics.totalCreationTime / metrics.totalCreations;
                metrics.slowestCreation = Math.max(metrics.slowestCreation, creationTime);
                metrics.fastestCreation = Math.min(metrics.fastestCreation, creationTime);
                metrics.memoryUsage.push(memoryUsage);
                
                return {
                    result,
                    creationTime,
                    memoryUsage,
                    operationName,
                    timestamp: Date.now()
                };
            },
            
            getMetrics: () => ({ ...metrics }),
            
            reset: () => {
                Object.assign(metrics, {
                    totalCreations: 0,
                    totalCreationTime: 0,
                    averageCreationTime: 0,
                    slowestCreation: 0,
                    fastestCreation: Infinity,
                    memoryUsage: []
                });
            }
        };
    }
};

// Default export for convenience
export default {
    BaseModal,
    EventModal,
    createModalManager,
    ModalConfigs,
    ModalStrategies,
    ModalUtils,
    ModalPerformanceUtils
};
