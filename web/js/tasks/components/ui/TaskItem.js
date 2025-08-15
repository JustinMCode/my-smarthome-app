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
        
        if (!task || !task.id || !task.text) {
            console.error('TaskItem: Invalid task data:', task);
            return '<div class="task-item error">Invalid task data</div>';
        }
        
        const completedClass = task.completed ? 'completed' : '';
        
        console.log('TaskItem: Generating HTML for task:', task);
        
        const html = `
            <div class="task-item ${completedClass}" 
                 data-task-id="${this.escapeHtml(task.id)}" 
                 style="animation-delay: ${this.animationDelay}ms">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="task-owner">${this.escapeHtml(task.owner || 'unknown')}</span>
                <button class="delete-btn" title="Delete task">Delete</button>
            </div>
        `;
        
        console.log('TaskItem: Generated HTML:', html);
        return html;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('TaskItem: Setting up event listeners for task:', this.task.id);
        
        try {
            // Check if the element is actually in the DOM
            if (this.element) {
                console.log('TaskItem: Element exists in DOM:', this.element);
                console.log('TaskItem: Element visibility:', {
                    display: window.getComputedStyle(this.element).display,
                    opacity: window.getComputedStyle(this.element).opacity,
                    visibility: window.getComputedStyle(this.element).visibility,
                    position: window.getComputedStyle(this.element).position,
                    zIndex: window.getComputedStyle(this.element).zIndex
                });
            } else {
                console.error('TaskItem: Element not found');
            }
            
            // Checkbox toggle
            const checkbox = this.$('.task-checkbox');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('TaskItem: Checkbox clicked for task:', this.task.id);
                    this.toggleTask();
                });
            } else {
                console.error('TaskItem: ERROR - checkbox not found');
            }
            
            // Delete button
            const deleteBtn = this.$('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('TaskItem: Delete button clicked for task:', this.task.id);
                    this.deleteTask();
                });
            } else {
                console.error('TaskItem: ERROR - delete button not found');
            }
            
            // Task item click (for future edit functionality)
            this.addEventListener('click', () => {
                console.log('TaskItem: Task item clicked:', this.task.id);
                this.emit('task:selected', this.task);
            });
            
            console.log('TaskItem: Event listeners set up successfully');
        } catch (error) {
            console.error('TaskItem: Error setting up event listeners:', error);
        }
    }
    
    /**
     * Toggle task completion
     */
    toggleTask() {
        console.log('TaskItem: Toggling task:', this.task.id);
        
        try {
            if (this.services.task) {
                this.services.task.toggleTask(this.task.id);
            } else {
                console.warn('TaskItem: Task service not available');
            }
            this.emit('task:toggled', this.task);
        } catch (error) {
            console.error('TaskItem: Error toggling task:', error);
        }
    }
    
    /**
     * Delete task
     */
    deleteTask() {
        console.log('TaskItem: Deleting task:', this.task.id);
        
        try {
            if (this.services.task) {
                this.services.task.deleteTask(this.task.id);
            } else {
                console.warn('TaskItem: Task service not available');
            }
            this.emit('task:deleted', this.task);
        } catch (error) {
            console.error('TaskItem: Error deleting task:', error);
        }
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