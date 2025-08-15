/**
 * Task Item Component
 * Renders individual task items with actions and state management
 */

import { BaseComponent } from '../BaseComponent.js';
import { EVENTS } from '../../utils/TasksConstants.js';

/**
 * TaskItem - Individual task component
 */
export class TaskItem extends BaseComponent {
    constructor(config) {
        super({
            className: 'task-item',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.task = config.task || {};
        this.animationDelay = config.animationDelay || 0;
    }
    
    /**
     * Generate HTML for task item
     */
    generateHTML() {
        const task = this.task;
        const completedClass = task.completed ? 'completed' : '';
        
        return `
            <div class="task-item ${completedClass}" 
                 data-task-id="${task.id}" 
                 style="animation-delay: ${this.animationDelay}ms">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="task-owner">${task.owner}</span>
                <button class="delete-btn" title="Delete task">Delete</button>
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Checkbox toggle
        const checkbox = this.$('.task-checkbox');
        if (checkbox) {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask();
            });
        }
        
        // Delete button
        const deleteBtn = this.$('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask();
            });
        }
        
        // Task item click (for future edit functionality)
        this.addEventListener('click', () => {
            this.emit('task:selected', this.task);
        });
    }
    
    /**
     * Toggle task completion
     */
    toggleTask() {
        if (this.services.task) {
            this.services.task.toggleTask(this.task.id);
        }
        this.emit('task:toggled', this.task);
    }
    
    /**
     * Delete task
     */
    deleteTask() {
        if (this.services.task) {
            this.services.task.deleteTask(this.task.id);
        }
        this.emit('task:deleted', this.task);
    }
    
    /**
     * Update task data and re-render
     * @param {Object} newTask - Updated task data
     */
    updateTask(newTask) {
        this.task = newTask;
        if (this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Set animation delay
     * @param {number} delay - Delay in milliseconds
     */
    setAnimationDelay(delay) {
        this.animationDelay = delay;
        if (this.element) {
            this.element.style.animationDelay = `${delay}ms`;
        }
    }
    
    /**
     * Mark task as completed with animation
     */
    markCompleted() {
        this.addClass('completed');
        
        // Add completion animation
        this.element.style.animation = 'softPulse 0.3s ease';
        setTimeout(() => {
            if (this.element) {
                this.element.style.animation = '';
            }
        }, 300);
    }
    
    /**
     * Mark task as active (not completed)
     */
    markActive() {
        this.removeClass('completed');
    }
}