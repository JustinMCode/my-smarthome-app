/**
 * Task Service - Business Logic Layer
 * Handles task CRUD operations, validation, and business rules
 */

import { DEBUG_PREFIXES, EVENTS } from '../utils/TasksConstants.js';
import { validateTask, createTask } from '../types/TaskTypes.js';
import { sanitizeAndValidateTask } from '../utils/TasksValidation.js';
import { debug } from '../../constants/config.js';

/**
 * TaskService - Handles task business logic
 */
export class TaskService {
    constructor(state, events, config) {
        this.state = state;
        this.events = events;
        this.config = config;
        
        debug(DEBUG_PREFIXES.TASKS, 'TaskService initialized');
    }
    
    /**
     * Add a new task
     * @param {string|Object} taskInput - Task text or task object
     * @param {string} owner - Task owner (optional if taskInput is object)
     * @returns {Object} Created task
     */
    addTask(taskInput, owner = null) {
        debug(DEBUG_PREFIXES.TASKS, 'Adding new task:', { taskInput, owner });
        
        try {
            let taskData;
            
            if (typeof taskInput === 'string') {
                taskData = {
                    text: taskInput,
                    owner: owner || this.state.get('currentUser')
                };
            } else if (typeof taskInput === 'object') {
                taskData = { ...taskInput };
                if (!taskData.owner && owner) {
                    taskData.owner = owner;
                }
            } else {
                throw new Error('Invalid task input type');
            }
            
            // Validate and sanitize input
            const validation = sanitizeAndValidateTask(taskData);
            if (!validation.isValid) {
                throw new Error(`Invalid task data: ${validation.errors.join(', ')}`);
            }
            
            // Create task with proper ID and defaults
            const task = this.createTaskFromData(validation.data);
            
            // Add to state
            const currentTasks = this.state.get('tasks');
            const updatedTasks = [...currentTasks, task];
            
            this.state.update({
                tasks: updatedTasks,
                taskIdCounter: this.state.get('taskIdCounter') + 1
            });
            
            // Emit events
            this.events.emit(EVENTS.TASK_ADDED, task);
            
            debug(DEBUG_PREFIXES.TASKS, 'Task added successfully:', task);
            return task;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.TASKS, 'Error adding task:', error);
            throw error;
        }
    }
    
    /**
     * Toggle task completion status
     * @param {string} taskId - Task ID to toggle
     * @returns {Object} Updated task
     */
    toggleTask(taskId) {
        debug(DEBUG_PREFIXES.TASKS, 'Toggling task completion:', taskId);
        
        try {
            const tasks = this.state.get('tasks');
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            
            const currentTask = tasks[taskIndex];
            const newCompletedStatus = !currentTask.completed;
            
            const updatedTask = {
                ...currentTask,
                completed: newCompletedStatus,
                completedAt: newCompletedStatus ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            };
            
            // Update in state
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex] = updatedTask;
            this.state.set('tasks', updatedTasks);
            
            // Emit events
            this.events.emit(EVENTS.TASK_TOGGLED, { task: updatedTask, oldTask: currentTask });
            
            debug(DEBUG_PREFIXES.TASKS, 'Task toggled successfully:', {
                taskId,
                completed: newCompletedStatus
            });
            
            return updatedTask;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.TASKS, 'Error toggling task:', error);
            throw error;
        }
    }
    
    /**
     * Delete a task
     * @param {string} taskId - Task ID to delete
     * @returns {boolean} Success status
     */
    deleteTask(taskId) {
        debug(DEBUG_PREFIXES.TASKS, 'Deleting task:', taskId);
        
        try {
            const tasks = this.state.get('tasks');
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            
            const deletedTask = tasks[taskIndex];
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            
            this.state.set('tasks', updatedTasks);
            
            // Emit events
            this.events.emit(EVENTS.TASK_DELETED, { taskId, task: deletedTask });
            
            debug(DEBUG_PREFIXES.TASKS, 'Task deleted successfully:', taskId);
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.TASKS, 'Error deleting task:', error);
            throw error;
        }
    }
    
    /**
     * Get tasks for a specific user
     * @param {string} userId - User ID
     * @param {Object} options - Filtering options
     * @returns {Array} Array of user's tasks
     */
    getUserTasks(userId, options = {}) {
        const allTasks = this.state.get('tasks');
        let userTasks = allTasks.filter(task => task.owner === userId);
        
        // Apply filters
        if (options.completed !== undefined) {
            userTasks = userTasks.filter(task => task.completed === options.completed);
        }
        
        return userTasks;
    }
    
    /**
     * Get active tasks for current user
     * @returns {Array} Array of active tasks
     */
    getActiveTasks() {
        const currentUser = this.state.get('currentUser');
        return this.getUserTasks(currentUser, { completed: false });
    }
    
    /**
     * Get completed tasks for current user
     * @returns {Array} Array of completed tasks
     */
    getCompletedTasks() {
        const currentUser = this.state.get('currentUser');
        return this.getUserTasks(currentUser, { completed: true });
    }
    
    /**
     * Create task from validated data
     * @private
     */
    createTaskFromData(data) {
        const taskIdCounter = this.state.get('taskIdCounter') || 1;
        
        return {
            id: taskIdCounter.toString(),
            text: data.text,
            owner: data.owner,
            completed: data.completed || false,
            timestamp: new Date().toISOString(),
            priority: data.priority || 'medium',
            description: data.description || ''
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.TASKS, 'Destroying TaskService');
        this.state = null;
        this.events = null;
        this.config = null;
    }
}
