/**
 * Tasks Module - Main Entry Point
 * Enterprise-Grade Modular Task Management System
 * 
 * This file provides comprehensive exports for the modular task management system
 * following enterprise architectural standards and SOLID principles.
 * 
 * MIGRATION NOTICE:
 * ================
 * The original monolithic TasksPageManager has been successfully modularized!
 * 
 * Legacy API (Backward Compatible):
 * - TasksPageManager (compatibility wrapper)
 * 
 * Modern Modular API (Recommended):
 * - TasksCore (main orchestrator)
 * - Individual Components (TaskList, AddTaskForm, etc.)
 * - Services (TaskService, UserService, etc.)
 * - Utilities (validation, helpers, templates)
 * 
 * Benefits of the Modular System:
 * - 🎯 Single Responsibility Principle compliance
 * - 🔄 Reusable and composable components
 * - 🧪 Unit testable in isolation
 * - ⚡ Better performance through reactive updates
 * - 🛠️ Easier maintenance and extension
 * - 📱 Responsive and accessible by design
 * - 🎨 Consistent UI through shared base components
 */

// === CORE SYSTEM EXPORTS ===

// Main orchestrator and state management
export { TasksCore } from './core/TasksCore.js';
export { TasksState } from './core/TasksState.js';
export { TasksEvents } from './core/TasksEvents.js';

// === SERVICE LAYER EXPORTS ===

// Business logic services
export { TaskService } from './services/TaskService.js';
export { UserService } from './services/UserService.js';
export { HealthService } from './services/HealthService.js';
export { StorageService } from './services/StorageService.js';
export { StatsService } from './services/StatsService.js';

// === COMPONENT EXPORTS ===

// Base component for building custom components
export { BaseComponent } from './components/BaseComponent.js';

// UI Components
export { TaskList } from './components/ui/TaskList.js';
export { TaskItem } from './components/ui/TaskItem.js';
export { AddTaskForm } from './components/ui/AddTaskForm.js';
export { UserSwitcher } from './components/ui/UserSwitcher.js';
export { StatsHeader } from './components/ui/StatsHeader.js';

// Health Components
export { HealthTracker } from './components/health/HealthTracker.js';
export { WaterTracker } from './components/health/WaterTracker.js';
export { MedicationTracker } from './components/health/MedicationTracker.js';

// Layout Components
export { TasksLayout } from './components/layout/TasksLayout.js';
export { TasksContainer } from './components/layout/TasksContainer.js';

// === UTILITY EXPORTS ===

// Constants and configuration
export * from './utils/TasksConstants.js';

// Helper functions
export * from './utils/TasksHelpers.js';

// Validation system
export * from './utils/TasksValidation.js';

// HTML template system
export * from './utils/HtmlTemplates.js';

// === CONFIGURATION EXPORTS ===

// Configuration management
export * from './config/TasksConfig.js';

// Default data and sample content
export * from './config/DefaultData.js';

// === TYPE DEFINITION EXPORTS ===

// Task-related types and utilities
export * from './types/TaskTypes.js';

// User-related types and utilities
export * from './types/UserTypes.js';

// Health-related types and utilities
export * from './types/HealthTypes.js';

// === BULK EXPORTS FOR CONVENIENCE ===

// Export everything from module index files
export * from './core/index.js';
export * from './components/index.js';
export * from './services/index.js';
export * from './utils/index.js';
export * from './config/index.js';
export * from './types/index.js';

// === BACKWARD COMPATIBILITY ===

// Import the compatibility wrapper
export { TasksPageManager } from './TasksPageManager.js';

// Export as default for maximum compatibility
export { TasksPageManager as default } from './TasksPageManager.js';

// === MODERN API FACTORY FUNCTIONS ===

/**
 * Create a new TasksCore instance with optional configuration
 * @param {Object} config - Configuration options
 * @returns {Promise<TasksCore>} Configured TasksCore instance
 */
export async function createTasksCore(config = {}) {
    const { TasksCore } = await import('./core/TasksCore.js');
    return new TasksCore(config);
}

/**
 * Create a complete task management layout
 * @param {Object} config - Layout configuration
 * @returns {TasksLayout} Configured TasksLayout component
 */
export async function createTasksLayout(config = {}) {
    const { TasksLayout } = await import('./components/layout/TasksLayout.js');
    return new TasksLayout(config);
}

/**
 * Create a task list component
 * @param {Object} config - TaskList configuration
 * @returns {TaskList} Configured TaskList component
 */
export async function createTaskList(config = {}) {
    const { TaskList } = await import('./components/ui/TaskList.js');
    return new TaskList(config);
}

/**
 * Create a health tracker component
 * @param {Object} config - HealthTracker configuration
 * @returns {HealthTracker} Configured HealthTracker component
 */
export async function createHealthTracker(config = {}) {
    const { HealthTracker } = await import('./components/health/HealthTracker.js');
    return new HealthTracker(config);
}

// === VALIDATION AND UTILITY FACTORIES ===

/**
 * Create a validator for task data
 * @param {Object} options - Validation options
 * @returns {Function} Task validator function
 */
export async function createTaskValidator(options = {}) {
    const { sanitizeAndValidateTask } = await import('./utils/TasksValidation.js');
    return (taskData) => sanitizeAndValidateTask(taskData, options);
}

/**
 * Create an HTML template renderer
 * @param {Object} options - Template options
 * @returns {Object} Template renderer with methods
 */
export async function createTemplateRenderer(options = {}) {
    const { HtmlTemplates, TemplateCache } = await import('./utils/HtmlTemplates.js');
    const cache = new TemplateCache();
    
    return {
        render: (templateName, data) => {
            const cacheKey = `${templateName}-${JSON.stringify(data)}`;
            return cache.get(cacheKey, () => HtmlTemplates[templateName](data));
        },
        clearCache: () => cache.clear(),
        getCacheSize: () => cache.size()
    };
}

// === MIGRATION HELPERS ===

/**
 * Migrate from legacy TasksPageManager to modern system
 * @param {TasksPageManager} legacyManager - Legacy manager instance
 * @returns {TasksCore} Modern core instance
 */
export function migrateLegacyManager(legacyManager) {
    if (!legacyManager || !legacyManager.getCore) {
        throw new Error('Invalid legacy manager provided');
    }
    
    const core = legacyManager.getCore();
    
    console.info(`
🚀 MIGRATION COMPLETE!

Your TasksPageManager has been successfully migrated to the modern modular system.

Benefits you now have:
✅ Component-based architecture
✅ Better performance through reactive updates
✅ Enhanced error handling and validation
✅ Improved accessibility and responsiveness
✅ Easier testing and maintenance

Next steps:
1. Replace TasksPageManager imports with TasksCore
2. Use individual components for specific needs
3. Leverage the service layer for business logic
4. Take advantage of the utility functions

Example modern usage:
import { TasksCore, TaskList, AddTaskForm } from './tasks/index.js';

const core = new TasksCore();
await core.init();
    `);
    
    return core;
}

/**
 * Check if current system is using legacy or modern API
 * @returns {Object} System information
 */
export function getSystemInfo() {
    const hasLegacy = typeof window !== 'undefined' && 
                     window.tasksPageManager instanceof TasksPageManager;
    
    return {
        isLegacy: hasLegacy,
        isModern: !hasLegacy,
        version: '2.0.0',
        architecture: 'modular',
        features: [
            'Component Architecture',
            'Service Layer',
            'State Management',
            'Event System',
            'Validation System',
            'Template System',
            'Backward Compatibility'
        ],
        migrationSupport: true,
        documentation: {
            components: '/docs/components.md',
            services: '/docs/services.md',
            migration: '/docs/migration.md'
        }
    };
}

// === DEVELOPMENT UTILITIES ===

/**
 * Enable debug mode for the entire tasks system
 * @param {boolean} enabled - Whether to enable debug mode
 */
export function setDebugMode(enabled = true) {
    if (typeof window !== 'undefined') {
        window.TASKS_DEBUG = enabled;
        console.info(`Tasks debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

/**
 * Get performance metrics for the tasks system
 * @returns {Object} Performance information
 */
export function getPerformanceMetrics() {
    if (typeof window === 'undefined') return {};
    
    const metrics = {};
    
    // Component count
    metrics.componentCount = document.querySelectorAll('[data-component-type]').length;
    
    // Memory usage (if available)
    if (window.performance && window.performance.memory) {
        metrics.memoryUsage = {
            used: window.performance.memory.usedJSHeapSize,
            total: window.performance.memory.totalJSHeapSize,
            limit: window.performance.memory.jsHeapSizeLimit
        };
    }
    
    // Tasks system specific metrics
    const tasksView = document.getElementById('tasks-view');
    if (tasksView) {
        metrics.domNodes = tasksView.querySelectorAll('*').length;
        metrics.eventListeners = tasksView.querySelectorAll('[data-component-id]').length;
    }
    
    return metrics;
}

// === MODULE INFORMATION ===

/**
 * Module metadata and information
 */
export const MODULE_INFO = {
    name: 'Tasks Module',
    version: '2.0.0',
    architecture: 'Modular Component System',
    author: 'Smart Fridge Dashboard Team',
    created: new Date().toISOString(),
    features: {
        core: 'TasksCore orchestrator with state management',
        components: 'Reusable UI components with BaseComponent inheritance',
        services: 'Business logic services with dependency injection',
        utilities: 'Comprehensive helpers, validation, and templates',
        compatibility: 'Full backward compatibility with legacy API',
        performance: 'Reactive updates and optimized rendering',
        accessibility: 'ARIA labels and keyboard navigation',
        testing: 'Unit testable components and services'
    },
    dependencies: {
        internal: ['constants/config.js'],
        external: []
    },
    exports: {
        core: ['TasksCore', 'TasksState', 'TasksEvents'],
        services: ['TaskService', 'UserService', 'HealthService', 'StorageService', 'StatsService'],
        components: ['BaseComponent', 'TaskList', 'TaskItem', 'AddTaskForm', 'UserSwitcher', 'StatsHeader', 'HealthTracker', 'WaterTracker', 'MedicationTracker', 'TasksLayout', 'TasksContainer'],
        utilities: ['validation', 'helpers', 'templates', 'constants'],
        legacy: ['TasksPageManager (compatibility wrapper)']
    },
    migration: {
        fromVersion: '1.0.0 (monolithic)',
        toVersion: '2.0.0 (modular)',
        status: 'complete',
        backwardCompatible: true,
        deprecationWarnings: true,
        migrationHelper: 'migrateLegacyManager()'
    }
};

// Log module initialization in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.info(`
🎯 Tasks Module v${MODULE_INFO.version} Loaded

Architecture: ${MODULE_INFO.architecture}
Components Available: ${MODULE_INFO.exports.components.length}
Services Available: ${MODULE_INFO.exports.services.length}
Backward Compatible: ${MODULE_INFO.migration.backwardCompatible}

For help: console.log(getSystemInfo())
    `);
}