/**
 * Tasks Container Component
 * Main content container with responsive behavior
 */

import { BaseComponent } from '../BaseComponent.js';
import { TaskList } from '../ui/TaskList.js';

/**
 * TasksContainer - Main content container component
 */
export class TasksContainer extends BaseComponent {
    constructor(config) {
        super({
            className: 'content',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.currentUser = config.currentUser || 'justin';
        this.tasks = config.tasks || [];
        
        // Child components
        this.activeTasksList = null;
        this.completedTasksList = null;
    }
    
    /**
     * Generate HTML for tasks container
     */
    generateHTML() {
        const userIndicator = this.currentUser === 'justin' ? "Justin's" : "Brooke's";
        
        return `
            <div class="content" id="mainContent">
                <div class="task-panel">
                    <h2 class="panel-title">
                        Active Tasks 
                        <span class="user-indicator" id="activeUserIndicator">${userIndicator}</span>
                    </h2>
                    <div id="activeTasksContainer"></div>
                </div>

                <div class="task-panel">
                    <h2 class="panel-title">Completed Today</h2>
                    <div id="completedTasksContainer"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render component and task lists
     */
    render(container = null) {
        console.log('TasksContainer: Starting render...');
        console.log('TasksContainer: Current user:', this.currentUser);
        console.log('TasksContainer: Total tasks:', this.tasks.length);
        
        const element = super.render(container);
        
        console.log('TasksContainer: Base component rendered, rendering task lists...');
        this.renderTaskLists();
        
        console.log('TasksContainer: Render complete');
        return element;
    }
    
    /**
     * Render task lists
     */
    renderTaskLists() {
        console.log('TasksContainer: Rendering task lists...');
        
        const activeContainer = this.$('#activeTasksContainer');
        const completedContainer = this.$('#completedTasksContainer');
        
        console.log('TasksContainer: Active container found:', !!activeContainer);
        console.log('TasksContainer: Completed container found:', !!completedContainer);
        
        if (activeContainer) {
            const activeTasks = this.getActiveTasks();
            console.log('TasksContainer: Active tasks for user:', activeTasks);
            
            this.activeTasksList = new TaskList({
                tasks: activeTasks,
                emptyMessage: 'No active tasks. Time to relax!',
                services: this.services,
                events: this.events,
                state: this.state
            });
            
            this.activeTasksList.render(activeContainer);
            this.addChild('activeTasks', this.activeTasksList);
            
            // Listen for task list events
            this.activeTasksList.addEventListener('task:toggled', () => {
                this.emit('task:toggled');
                this.updateTaskLists();
            });
            
            this.activeTasksList.addEventListener('task:deleted', () => {
                this.emit('task:deleted');
                this.updateTaskLists();
            });
            
            console.log('TasksContainer: Active tasks list rendered successfully');
        }
        
        if (completedContainer) {
            const completedTasks = this.getCompletedTasks();
            console.log('TasksContainer: Completed tasks for user:', completedTasks);
            
            this.completedTasksList = new TaskList({
                tasks: completedTasks,
                emptyMessage: 'No completed tasks yet.',
                services: this.services,
                events: this.events,
                state: this.state
            });
            
            this.completedTasksList.render(completedContainer);
            this.addChild('completedTasks', this.completedTasksList);
            
            // Listen for task list events
            this.completedTasksList.addEventListener('task:toggled', () => {
                this.emit('task:toggled');
                this.updateTaskLists();
            });
            
            this.completedTasksList.addEventListener('task:deleted', () => {
                this.emit('task:deleted');
                this.updateTaskLists();
            });
            
            console.log('TasksContainer: Completed tasks list rendered successfully');
        }
    }
    
    /**
     * Get active tasks for current user
     * @returns {Array} Active tasks
     */
    getActiveTasks() {
        if (!this.tasks || !Array.isArray(this.tasks)) {
            console.warn('TasksContainer: Tasks is not an array:', this.tasks);
            return [];
        }
        
        const activeTasks = this.tasks.filter(task => {
            const isOwnerMatch = task.owner === this.currentUser;
            const isNotCompleted = !task.completed;
            return isOwnerMatch && isNotCompleted;
        });
        
        console.log('TasksContainer: Filtered active tasks:', activeTasks);
        return activeTasks;
    }
    
    /**
     * Get completed tasks for current user
     * @returns {Array} Completed tasks
     */
    getCompletedTasks() {
        if (!this.tasks || !Array.isArray(this.tasks)) {
            console.warn('TasksContainer: Tasks is not an array:', this.tasks);
            return [];
        }
        
        const completedTasks = this.tasks.filter(task => {
            const isOwnerMatch = task.owner === this.currentUser;
            const isCompleted = task.completed;
            return isOwnerMatch && isCompleted;
        });
        
        console.log('TasksContainer: Filtered completed tasks:', completedTasks);
        return completedTasks;
    }
    
    /**
     * Update tasks data and refresh lists
     * @param {Array} newTasks - Updated tasks array
     */
    updateTasks(newTasks) {
        console.log('TasksContainer: Updating tasks:', newTasks);
        this.tasks = newTasks || [];
        this.updateTaskLists();
    }
    
    /**
     * Update task lists with current data
     */
    updateTaskLists() {
        console.log('TasksContainer: Updating task lists...');
        
        if (this.activeTasksList) {
            const activeTasks = this.getActiveTasks();
            console.log('TasksContainer: Updating active tasks list with:', activeTasks);
            this.activeTasksList.updateTasks(activeTasks);
        } else {
            console.warn('TasksContainer: Active tasks list not available');
        }
        
        if (this.completedTasksList) {
            const completedTasks = this.getCompletedTasks();
            console.log('TasksContainer: Updating completed tasks list with:', completedTasks);
            this.completedTasksList.updateTasks(completedTasks);
        } else {
            console.warn('TasksContainer: Completed tasks list not available');
        }
    }
    
    /**
     * Update current user and refresh interface
     * @param {string} newUser - New current user
     */
    updateCurrentUser(newUser) {
        console.log('TasksContainer: Updating current user from', this.currentUser, 'to', newUser);
        this.currentUser = newUser;
        
        // Update user indicator
        const userIndicator = this.$('#activeUserIndicator');
        if (userIndicator) {
            userIndicator.textContent = newUser === 'justin' ? "Justin's" : "Brooke's";
        }
        
        // Update task lists for new user
        this.updateTaskLists();
        
        this.emit('user:switched', { user: newUser });
    }
    
    /**
     * Add new task to appropriate list
     * @param {Object} task - New task to add
     */
    addTask(task) {
        this.tasks.push(task);
        
        if (task.owner === this.currentUser) {
            if (task.completed) {
                this.completedTasksList?.addTask(task);
            } else {
                this.activeTasksList?.addTask(task);
            }
        }
        
        this.emit('task:added', task);
    }
    
    /**
     * Remove task from lists
     * @param {string} taskId - ID of task to remove
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        
        this.activeTasksList?.removeTask(taskId);
        this.completedTasksList?.removeTask(taskId);
        
        this.emit('task:removed', { taskId });
    }
    
    /**
     * Update specific task in lists
     * @param {string} taskId - ID of task to update
     * @param {Object} updatedTask - Updated task data
     */
    updateTask(taskId, updatedTask) {
        // Update in tasks array
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = updatedTask;
        }
        
        // Move task between lists if completion status changed
        const wasCompleted = this.activeTasksList?.taskComponents.has(taskId);
        const isCompleted = updatedTask.completed;
        
        if (wasCompleted && isCompleted) {
            // Moved from active to completed
            this.activeTasksList?.removeTask(taskId);
            if (updatedTask.owner === this.currentUser) {
                this.completedTasksList?.addTask(updatedTask);
            }
        } else if (!wasCompleted && !isCompleted) {
            // Moved from completed to active
            this.completedTasksList?.removeTask(taskId);
            if (updatedTask.owner === this.currentUser) {
                this.activeTasksList?.addTask(updatedTask);
            }
        } else {
            // Update in existing list
            this.activeTasksList?.updateTask(taskId, updatedTask);
            this.completedTasksList?.updateTask(taskId, updatedTask);
        }
        
        this.emit('task:updated', { taskId, task: updatedTask });
    }
    
    /**
     * Get task counts for current user
     * @returns {Object} Task count information
     */
    getTaskCounts() {
        const activeTasks = this.getActiveTasks();
        const completedTasks = this.getCompletedTasks();
        
        return {
            active: activeTasks.length,
            completed: completedTasks.length,
            total: activeTasks.length + completedTasks.length
        };
    }
    
    /**
     * Filter tasks by criteria
     * @param {Function} filterFn - Filter function
     */
    filterTasks(filterFn) {
        this.activeTasksList?.filterTasks(filterFn);
        this.completedTasksList?.filterTasks(filterFn);
    }
    
    /**
     * Show all tasks (clear filters)
     */
    showAllTasks() {
        this.activeTasksList?.showAllTasks();
        this.completedTasksList?.showAllTasks();
    }
    
    /**
     * Focus on task input (if available in parent)
     */
    focusTaskInput() {
        // Emit event for parent to handle
        this.emit('focus:task:input');
    }
    
    /**
     * Show/hide completed tasks section
     * @param {boolean} show - Whether to show completed tasks
     */
    toggleCompletedTasks(show) {
        const completedPanel = this.$('.task-panel:last-child');
        if (completedPanel) {
            if (show) {
                completedPanel.style.display = '';
            } else {
                completedPanel.style.display = 'none';
            }
        }
    }
    
    /**
     * Set loading state
     * @param {boolean} loading - Whether container is loading
     */
    setLoading(loading) {
        if (loading) {
            this.addClass('loading');
        } else {
            this.removeClass('loading');
        }
    }
    
    /**
     * Bind to state changes
     */
    onRender() {
        super.onRender();
        
        // Subscribe to state changes
        if (this.state) {
            this.subscribeToState('tasks', (newTasks) => {
                this.updateTasks(newTasks);
            });
            
            this.subscribeToState('currentUser', (newUser) => {
                this.updateCurrentUser(newUser);
            });
        }
    }
    
    /**
     * Clean up child components
     */
    destroy() {
        if (this.activeTasksList) {
            this.activeTasksList.destroy();
        }
        
        if (this.completedTasksList) {
            this.completedTasksList.destroy();
        }
        
        super.destroy();
    }
}