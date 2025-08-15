/**
 * Add Task Form Component
 * Handles task creation form with validation
 */

import { BaseComponent } from '../BaseComponent.js';
import { sanitizeAndValidateTask } from '../../utils/TasksValidation.js';

/**
 * AddTaskForm - Task creation form component
 */
export class AddTaskForm extends BaseComponent {
    constructor(config) {
        super({
            className: 'add-task-panel',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.placeholder = config.placeholder || 'What needs to be done today?';
        this.buttonText = config.buttonText || 'Add Task';
    }
    
    /**
     * Generate HTML for add task form
     */
    generateHTML() {
        return `
            <div class="add-task-panel">
                <div class="input-group">
                    <input type="text" 
                           class="task-input" 
                           id="taskInput" 
                           placeholder="${this.escapeHtml(this.placeholder)}"
                           autocomplete="off">
                    <button class="add-btn" id="addTaskBtn" type="button">
                        ${this.escapeHtml(this.buttonText)}
                    </button>
                </div>
                <div class="task-input-error" id="taskInputError" style="display: none;"></div>
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const input = this.$('#taskInput');
        const button = this.$('#addTaskBtn');
        
        if (input) {
            // Enter key submission
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitTask();
                }
            });
            
            // Clear error on input
            input.addEventListener('input', () => {
                this.clearError();
            });
            
            // Focus handling
            input.addEventListener('focus', () => {
                this.addClass('focused');
            });
            
            input.addEventListener('blur', () => {
                this.removeClass('focused');
            });
        }
        
        if (button) {
            button.addEventListener('click', () => {
                this.submitTask();
            });
        }
    }
    
    /**
     * Submit new task
     */
    submitTask() {
        const input = this.$('#taskInput');
        if (!input) return;
        
        const text = input.value.trim();
        
        // Validate input
        const validation = this.validateInput(text);
        if (!validation.isValid) {
            this.showError(validation.error);
            input.focus();
            return;
        }
        
        // Create task data
        const taskData = {
            text: text,
            owner: this.getCurrentUser()
        };
        
        // Validate task data
        const taskValidation = sanitizeAndValidateTask(taskData);
        if (!taskValidation.isValid) {
            this.showError(taskValidation.errors[0] || 'Invalid task data');
            return;
        }
        
        try {
            // Add task through service
            if (this.services.task) {
                const newTask = this.services.task.addTask(taskValidation.data.text, taskValidation.data.owner);
                
                // Clear input and emit event
                input.value = '';
                this.clearError();
                this.emit('task:added', newTask);
                
                // Success feedback
                this.showSuccess();
                
            } else {
                throw new Error('Task service not available');
            }
            
        } catch (error) {
            this.showError(error.message || 'Failed to add task');
        }
    }
    
    /**
     * Validate input text
     * @param {string} text - Input text to validate
     * @returns {Object} Validation result
     */
    validateInput(text) {
        if (!text || text.length === 0) {
            return {
                isValid: false,
                error: 'Please enter a task description'
            };
        }
        
        if (text.length < 3) {
            return {
                isValid: false,
                error: 'Task description must be at least 3 characters'
            };
        }
        
        if (text.length > 500) {
            return {
                isValid: false,
                error: 'Task description is too long (max 500 characters)'
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Get current user from state
     * @returns {string} Current user ID
     */
    getCurrentUser() {
        return this.state ? this.state.get('currentUser') : 'justin';
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorElement = this.$('#taskInputError');
        const input = this.$('#taskInput');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (input) {
            input.classList.add('error');
        }
        
        this.addClass('has-error');
    }
    
    /**
     * Clear error message
     */
    clearError() {
        const errorElement = this.$('#taskInputError');
        const input = this.$('#taskInput');
        
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        
        if (input) {
            input.classList.remove('error');
        }
        
        this.removeClass('has-error');
    }
    
    /**
     * Show success feedback
     */
    showSuccess() {
        const input = this.$('#taskInput');
        const button = this.$('#addTaskBtn');
        
        // Brief success animation
        if (button) {
            const originalText = button.textContent;
            button.textContent = '✓ Added';
            button.classList.add('success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 1000);
        }
        
        // Flash input border
        if (input) {
            input.classList.add('success');
            setTimeout(() => {
                input.classList.remove('success');
            }, 300);
        }
    }
    
    /**
     * Set focus to input
     */
    focus() {
        const input = this.$('#taskInput');
        if (input) {
            input.focus();
        }
    }
    
    /**
     * Clear input value
     */
    clear() {
        const input = this.$('#taskInput');
        if (input) {
            input.value = '';
            this.clearError();
        }
    }
    
    /**
     * Set input value
     * @param {string} value - Value to set
     */
    setValue(value) {
        const input = this.$('#taskInput');
        if (input) {
            input.value = value;
        }
    }
    
    /**
     * Get current input value
     * @returns {string} Current input value
     */
    getValue() {
        const input = this.$('#taskInput');
        return input ? input.value.trim() : '';
    }
    
    /**
     * Enable/disable the form
     * @param {boolean} enabled - Whether form should be enabled
     */
    setEnabled(enabled) {
        const input = this.$('#taskInput');
        const button = this.$('#addTaskBtn');
        
        if (input) {
            input.disabled = !enabled;
        }
        
        if (button) {
            button.disabled = !enabled;
        }
        
        if (enabled) {
            this.removeClass('disabled');
        } else {
            this.addClass('disabled');
        }
    }
}