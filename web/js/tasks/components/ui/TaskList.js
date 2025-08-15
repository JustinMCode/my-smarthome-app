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
        console.log('TaskList: Generating HTML for', this.tasks.length, 'tasks');
        
        if (this.tasks.length === 0) {
            console.log('TaskList: No tasks, showing empty state');
            return this.generateEmptyState();
        }
        
        console.log('TaskList: Generating container for task items');
        // Container for task items (will be populated by child components)
        return `<div class="task-list-container"></div>`;
    }
    
    /**
     * Generate empty state HTML
     */
    generateEmptyState() {
        console.log('TaskList: Generating empty state with message:', this.emptyMessage);
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
        console.log('TaskList: Starting render...');
        
        const element = super.render(container);
        
        if (this.tasks.length > 0) {
            console.log('TaskList: Rendering task items...');
            this.renderTaskItems();
        } else {
            console.log('TaskList: No tasks to render, showing empty state');
        }
        
        console.log('TaskList: Render complete');
        return element;
    }
    
    /**
     * Ensure task list container exists
     * @returns {HTMLElement|null} The container element or null if not found
     */
    ensureTaskListContainer() {
        let listContainer = this.$('.task-list-container');
        
        if (!listContainer) {
            console.log('TaskList: task-list-container not found, checking if we need to re-render...');
            
            // Check if we have the main element but not the container
            if (this.element) {
                // Try to create the container
                this.element.innerHTML = '<div class="task-list-container"></div>';
                listContainer = this.$('.task-list-container');
                
                if (listContainer) {
                    console.log('TaskList: Created task-list-container successfully');
                } else {
                    console.error('TaskList: Failed to create task-list-container');
                }
            } else {
                console.error('TaskList: Main element not found, cannot create container');
            }
        }
        
        return listContainer;
    }
    
    /**
     * Render individual task items
     */
    renderTaskItems() {
        console.log('TaskList: Rendering', this.tasks.length, 'task items...');
        
        const listContainer = this.ensureTaskListContainer();
        if (!listContainer) {
            console.error('TaskList: ERROR - Cannot ensure task-list-container exists');
            return;
        }
        
        console.log('TaskList: Found task-list-container, clearing existing items...');
        
        // Clear existing task components
        this.clearTaskItems();
        
        // Create and render task items
        this.tasks.forEach((task, index) => {
            console.log('TaskList: Rendering task', index + 1, ':', task);
            
            const animationDelay = this.showAnimations 
                ? index * UI_CONFIG.ANIMATION_DELAY_INCREMENT 
                : 0;
            
            try {
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
                
                console.log('TaskList: Task item', index + 1, 'rendered successfully');
            } catch (error) {
                console.error('TaskList: Error rendering task item', index + 1, ':', error);
            }
        });
        
        console.log('TaskList: All task items rendered');
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
        console.log('TaskList: Updating tasks from', this.tasks.length, 'to', (newTasks || []).length);
        this.tasks = newTasks || [];
        
        if (this.isRendered) {
            console.log('TaskList: Re-rendering with updated tasks...');
            // Don't call render() again as it regenerates HTML and loses the container
            // Instead, just update the task items
            this.updateTaskItems();
        } else {
            console.log('TaskList: Component not rendered, skipping re-render');
        }
    }
    
    /**
     * Update task items without regenerating HTML
     */
    updateTaskItems() {
        console.log('TaskList: Updating task items without regenerating HTML...');
        
        if (this.tasks.length === 0) {
            // Show empty state
            const listContainer = this.ensureTaskListContainer();
            if (listContainer) {
                listContainer.innerHTML = this.generateEmptyState();
            } else {
                // If no container exists, we need to re-render
                console.log('TaskList: No container found, re-rendering...');
                this.render();
            }
        } else {
            // Render task items in existing container
            this.renderTaskItems();
        }
    }
    
    /**
     * Add a single task
     * @param {Object} task - Task to add
     */
    addTask(task) {
        console.log('TaskList: Adding task:', task);
        this.tasks.push(task);
        
        if (this.isRendered) {
            // If we're showing empty state, re-render completely
            if (this.tasks.length === 1) {
                console.log('TaskList: First task added, re-rendering completely');
                this.render();
            } else {
                // Otherwise just add the new task item
                console.log('TaskList: Adding task to existing list');
                this.addTaskItem(task);
            }
        } else {
            console.log('TaskList: Component not rendered, task will be added on next render');
        }
    }
    
    /**
     * Add a single task item to existing list
     * @param {Object} task - Task to add
     */
    addTaskItem(task) {
        console.log('TaskList: Adding task item:', task);
        
        const listContainer = this.ensureTaskListContainer();
        if (!listContainer) {
            console.error('TaskList: ERROR - Cannot ensure task-list-container exists for adding task');
            return;
        }
        
        const animationDelay = this.showAnimations 
            ? this.taskComponents.size * UI_CONFIG.ANIMATION_DELAY_INCREMENT 
            : 0;
        
        try {
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
            
            console.log('TaskList: Task item added successfully');
        } catch (error) {
            console.error('TaskList: Error adding task item:', error);
        }
    }
    
    /**
     * Remove a task by ID
     * @param {string} taskId - Task ID to remove
     */
    removeTask(taskId) {
        console.log('TaskList: Removing task:', taskId);
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.removeTaskItem(taskId);
        
        // If no tasks left, show empty state
        if (this.tasks.length === 0 && this.isRendered) {
            console.log('TaskList: No tasks left, showing empty state');
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