/**
 * Task List Component
 * Renders and manages collections of tasks with filtering and sorting
 */

import { BaseComponent } from '../BaseComponent.js';
import { TaskItem } from './TaskItem.js';
import { UI_CONFIG } from '../../utils/TasksConstants.js';

/**
 * TaskList - Task collection component
 */
export class TaskList extends BaseComponent {
    constructor(config) {
        super({
            className: 'task-list',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.tasks = config.tasks || [];
        this.emptyMessage = config.emptyMessage || 'No tasks available';
        this.showAnimations = config.showAnimations !== false;
        this.taskComponents = new Map();
    }
    
    /**
     * Generate HTML for task list
     */
    generateHTML() {
        if (this.tasks.length === 0) {
            return this.generateEmptyState();
        }
        
        // Container for task items (will be populated by child components)
        return `<div class="task-list-container"></div>`;
    }
    
    /**
     * Generate empty state HTML
     */
    generateEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-message">${this.escapeHtml(this.emptyMessage)}</div>
            </div>
        `;
    }
    
    /**
     * Render component and task items
     */
    render(container = null) {
        const element = super.render(container);
        
        if (this.tasks.length > 0) {
            this.renderTaskItems();
        }
        
        return element;
    }
    
    /**
     * Render individual task items
     */
    renderTaskItems() {
        const listContainer = this.$('.task-list-container');
        if (!listContainer) return;
        
        // Clear existing task components
        this.clearTaskItems();
        
        // Create and render task items
        this.tasks.forEach((task, index) => {
            const animationDelay = this.showAnimations 
                ? index * UI_CONFIG.ANIMATION_DELAY_INCREMENT 
                : 0;
            
            const taskItem = new TaskItem({
                task,
                animationDelay,
                services: this.services,
                events: this.events
            });
            
            // Render task item
            taskItem.render(listContainer);
            
            // Store reference
            this.taskComponents.set(task.id, taskItem);
            
            // Listen for task events
            taskItem.addEventListener('task:toggled', () => {
                this.emit('task:toggled', task);
            });
            
            taskItem.addEventListener('task:deleted', () => {
                this.emit('task:deleted', task);
                this.removeTaskItem(task.id);
            });
            
            taskItem.addEventListener('task:selected', () => {
                this.emit('task:selected', task);
            });
        });
    }
    
    /**
     * Clear all task items
     */
    clearTaskItems() {
        this.taskComponents.forEach(taskItem => {
            taskItem.destroy();
        });
        this.taskComponents.clear();
        
        const listContainer = this.$('.task-list-container');
        if (listContainer) {
            listContainer.innerHTML = '';
        }
    }
    
    /**
     * Update tasks and re-render
     * @param {Array} newTasks - Updated tasks array
     */
    updateTasks(newTasks) {
        this.tasks = newTasks || [];
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Add a single task
     * @param {Object} task - Task to add
     */
    addTask(task) {
        this.tasks.push(task);
        
        if (this.isRendered) {
            // If we're showing empty state, re-render completely
            if (this.tasks.length === 1) {
                this.render();
            } else {
                // Otherwise just add the new task item
                this.addTaskItem(task);
            }
        }
    }
    
    /**
     * Add a single task item to existing list
     * @param {Object} task - Task to add
     */
    addTaskItem(task) {
        const listContainer = this.$('.task-list-container');
        if (!listContainer) return;
        
        const animationDelay = this.showAnimations 
            ? this.taskComponents.size * UI_CONFIG.ANIMATION_DELAY_INCREMENT 
            : 0;
        
        const taskItem = new TaskItem({
            task,
            animationDelay,
            services: this.services,
            events: this.events
        });
        
        taskItem.render(listContainer);
        this.taskComponents.set(task.id, taskItem);
        
        // Setup event listeners
        taskItem.addEventListener('task:toggled', () => {
            this.emit('task:toggled', task);
        });
        
        taskItem.addEventListener('task:deleted', () => {
            this.emit('task:deleted', task);
            this.removeTaskItem(task.id);
        });
    }
    
    /**
     * Remove a task by ID
     * @param {string} taskId - Task ID to remove
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.removeTaskItem(taskId);
        
        // If no tasks left, show empty state
        if (this.tasks.length === 0 && this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Remove task item component
     * @param {string} taskId - Task ID to remove
     */
    removeTaskItem(taskId) {
        const taskItem = this.taskComponents.get(taskId);
        if (taskItem) {
            // Animate removal
            if (taskItem.element) {
                taskItem.element.style.transition = 'all 0.3s ease';
                taskItem.element.style.opacity = '0';
                taskItem.element.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    taskItem.destroy();
                    this.taskComponents.delete(taskId);
                }, 300);
            } else {
                taskItem.destroy();
                this.taskComponents.delete(taskId);
            }
        }
    }
    
    /**
     * Update a specific task
     * @param {string} taskId - Task ID to update
     * @param {Object} updatedTask - Updated task data
     */
    updateTask(taskId, updatedTask) {
        // Update in tasks array
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = updatedTask;
        }
        
        // Update task component
        const taskItem = this.taskComponents.get(taskId);
        if (taskItem) {
            taskItem.updateTask(updatedTask);
        }
    }
    
    /**
     * Filter tasks by criteria
     * @param {Function} filterFn - Filter function
     */
    filterTasks(filterFn) {
        const filteredTasks = this.tasks.filter(filterFn);
        
        // Hide/show task items based on filter
        this.taskComponents.forEach((taskItem, taskId) => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task && filteredTasks.includes(task)) {
                taskItem.show();
            } else {
                taskItem.hide();
            }
        });
    }
    
    /**
     * Show all tasks
     */
    showAllTasks() {
        this.taskComponents.forEach(taskItem => {
            taskItem.show();
        });
    }
    
    /**
     * Get task count
     * @returns {number} Number of tasks
     */
    getTaskCount() {
        return this.tasks.length;
    }
    
    /**
     * Get completed task count
     * @returns {number} Number of completed tasks
     */
    getCompletedCount() {
        return this.tasks.filter(t => t.completed).length;
    }
    
    /**
     * Get active task count
     * @returns {number} Number of active tasks
     */
    getActiveCount() {
        return this.tasks.filter(t => !t.completed).length;
    }
    
    /**
     * Cleanup when destroying
     */
    destroy() {
        this.clearTaskItems();
        super.destroy();
    }
}