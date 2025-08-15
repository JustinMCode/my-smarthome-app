/**
 * TasksPageManager - Backward Compatibility Wrapper
 * 
 * This class provides a backward-compatible interface to the new modular task system.
 * It maintains the exact same API as the original monolithic TasksPageManager
 * while internally using the modern component architecture.
 * 
 * ⚠️  NOTICE: This is a compatibility wrapper!
 * For new development, use the modular system directly:
 * - Import TasksCore from './core/TasksCore.js'
 * - Or use individual components from './components/'
 * - Or use services from './services/'
 * 
 * This wrapper will be deprecated in future versions.
 */

import { TasksCore } from './core/TasksCore.js';
import { debug } from '../constants/config.js';

/**
 * TasksPageManager - Backward compatibility wrapper
 * Provides the same API as the original monolithic class
 */
export class TasksPageManager {
    constructor() {
        this.core = new TasksCore();
        this.isInitialized = false;
        
        // Bind methods to maintain 'this' context
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.addTask = this.addTask.bind(this);
        this.toggleTask = this.toggleTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.switchUser = this.switchUser.bind(this);
        this.addWater = this.addWater.bind(this);
        this.resetWater = this.resetWater.bind(this);
        this.updateMedicationStatus = this.updateMedicationStatus.bind(this);
        this.render = this.render.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        
        debug('TasksPageManager', 'Backward compatibility wrapper initialized');
    }
    
    /**
     * Initialize the task manager
     * Maintains compatibility with original initialization flow
     */
    async init() {
        if (this.isInitialized) {
            debug('TasksPageManager', 'Already initialized');
            return;
        }
        
        try {
            debug('TasksPageManager', 'Initializing via compatibility wrapper...');
            
            // Initialize the modern core system
            await this.core.init();
            
            this.isInitialized = true;
            debug('TasksPageManager', 'Initialization complete via compatibility wrapper');
            
        } catch (error) {
            debug('TasksPageManager', 'Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Add a new task
     * @param {string} text - Task text (optional, will prompt if not provided)
     * @returns {Object} The created task
     */
    addTask(text = null) {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot add task: not initialized');
            return null;
        }
        
        return this.core.addTask(text);
    }
    
    /**
     * Toggle task completion status
     * @param {string} taskId - ID of task to toggle
     * @returns {Object} The updated task
     */
    toggleTask(taskId) {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot toggle task: not initialized');
            return null;
        }
        
        return this.core.toggleTask(taskId);
    }
    
    /**
     * Delete a task
     * @param {string} taskId - ID of task to delete
     * @returns {boolean} Success status
     */
    deleteTask(taskId) {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot delete task: not initialized');
            return false;
        }
        
        return this.core.deleteTask(taskId);
    }
    
    /**
     * Switch current user
     * @param {string} userId - User ID to switch to
     * @param {boolean} updateUI - Whether to update UI (default: true)
     */
    switchUser(userId, updateUI = true) {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot switch user: not initialized');
            return;
        }
        
        this.core.switchUser(userId, updateUI);
    }
    
    /**
     * Add a glass of water
     */
    addWater() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot add water: not initialized');
            return;
        }
        
        this.core.addWater();
    }
    
    /**
     * Reset water tracking
     */
    resetWater() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot reset water: not initialized');
            return;
        }
        
        this.core.resetWater();
    }
    
    /**
     * Update medication status from checkbox element
     * @param {HTMLElement} checkbox - Checkbox element
     */
    updateMedicationStatus(checkbox) {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot update medication: not initialized');
            return;
        }
        
        this.core.updateMedicationStatus(checkbox);
    }
    
    /**
     * Render the interface
     */
    render() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot render: not initialized');
            return;
        }
        
        this.core.render();
    }
    
    /**
     * Show the tasks interface
     */
    show() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot show: not initialized');
            return;
        }
        
        this.core.show();
    }
    
    /**
     * Hide the tasks interface
     */
    hide() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot hide: not initialized');
            return;
        }
        
        this.core.hide();
    }
    
    /**
     * Get current state (for debugging/external access)
     * @returns {Object} Current state
     */
    getState() {
        if (!this.isInitialized) {
            return null;
        }
        
        return this.core.getState();
    }
    
    /**
     * Get tasks array (for external access)
     * @returns {Array} Current tasks
     */
    getTasks() {
        if (!this.isInitialized) {
            return [];
        }
        
        const state = this.core.getState();
        return state ? state.tasks : [];
    }
    
    /**
     * Get current user (for external access)
     * @returns {string} Current user ID
     */
    getCurrentUser() {
        if (!this.isInitialized) {
            return 'justin';
        }
        
        const state = this.core.getState();
        return state ? state.currentUser : 'justin';
    }
    
    /**
     * Get water count (for external access)
     * @returns {number} Current water glasses count
     */
    getWaterCount() {
        if (!this.isInitialized) {
            return 0;
        }
        
        const state = this.core.getState();
        return state ? state.waterGlasses : 0;
    }
    
    /**
     * Get medication status (for external access)
     * @returns {Object} Current medication status
     */
    getMedicationStatus() {
        if (!this.isInitialized) {
            return { morning: false };
        }
        
        const state = this.core.getState();
        return state ? state.medicationStatus : { morning: false };
    }
    
    /**
     * Save data to storage
     */
    async saveData() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot save: not initialized');
            return;
        }
        
        await this.core.saveData();
    }
    
    /**
     * Load data from storage
     */
    async loadData() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot load: not initialized');
            return;
        }
        
        await this.core.loadData();
    }
    
    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        if (!this.isInitialized) {
            return { error: 'TasksPageManager not initialized' };
        }
        
        return this.core.getDebugInfo();
    }
    
    /**
     * Force refresh the tasks display
     */
    forceRefresh() {
        if (!this.isInitialized) {
            debug('TasksPageManager', 'Cannot force refresh: not initialized');
            return;
        }
        
        this.core.forceRefresh();
    }
    
    /**
     * Validate the current state
     * @returns {Object} Validation results
     */
    validateState() {
        if (!this.isInitialized) {
            return { error: 'TasksPageManager not initialized' };
        }
        
        return {
            stateValidation: this.core.state.validateState(),
            currentState: this.core.state.get(),
            subscriberInfo: this.core.state.getSubscriberInfo()
        };
    }
    
    /**
     * Check if the manager is initialized
     * @returns {boolean} Initialization status
     */
    get initialized() {
        return this.isInitialized;
    }
    
    /**
     * Get access to the modern core (for migration purposes)
     * @returns {TasksCore} The underlying TasksCore instance
     */
    getCore() {
        return this.core;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (!this.isInitialized) {
            return;
        }
        
        debug('TasksPageManager', 'Destroying compatibility wrapper...');
        
        if (this.core) {
            this.core.destroy();
            this.core = null;
        }
        
        this.isInitialized = false;
        
        debug('TasksPageManager', 'Compatibility wrapper destroyed');
    }
    
    // Legacy method aliases for maximum compatibility
    
    /**
     * Legacy alias for addTask
     * @deprecated Use addTask() instead
     */
    createTask(text) {
        console.warn('createTask() is deprecated, use addTask() instead');
        return this.addTask(text);
    }
    
    /**
     * Legacy alias for toggleTask
     * @deprecated Use toggleTask() instead
     */
    completeTask(taskId) {
        console.warn('completeTask() is deprecated, use toggleTask() instead');
        return this.toggleTask(taskId);
    }
    
    /**
     * Legacy alias for deleteTask
     * @deprecated Use deleteTask() instead
     */
    removeTask(taskId) {
        console.warn('removeTask() is deprecated, use deleteTask() instead');
        return this.deleteTask(taskId);
    }
    
    /**
     * Legacy alias for getCurrentUser
     * @deprecated Use getCurrentUser() instead
     */
    getUser() {
        console.warn('getUser() is deprecated, use getCurrentUser() instead');
        return this.getCurrentUser();
    }
    
    /**
     * Legacy alias for switchUser
     * @deprecated Use switchUser() instead
     */
    setUser(userId) {
        console.warn('setUser() is deprecated, use switchUser() instead');
        return this.switchUser(userId);
    }
}

// Export for backward compatibility
export default TasksPageManager;
