/**
 * Tasks Manager
 * Modern task management with glassmorphism design
 */

import { CONFIG, debug } from '../constants/config.js';

export class TasksManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.taskModal = null;
    }
    
    /**
     * Initialize the tasks manager
     */
    init() {
        debug('Initializing Tasks Manager...');
        
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add task button
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.showTaskModal();
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Task list interactions
        this.setupTaskListListeners();
    }
    
    /**
     * Setup task list event listeners
     */
    setupTaskListListeners() {
        const taskList = document.getElementById('main-task-list');
        if (!taskList) return;
        
        // Use event delegation for dynamic task items
        taskList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item-main');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.taskId;
            
            // Handle checkbox click
            if (e.target.closest('.task-checkbox-main')) {
                e.stopPropagation();
                this.toggleTask(taskId);
                return;
            }
            
            // Handle edit button
            if (e.target.closest('.task-action-btn.edit')) {
                e.stopPropagation();
                this.editTask(taskId);
                return;
            }
            
            // Handle delete button
            if (e.target.closest('.task-action-btn.delete')) {
                e.stopPropagation();
                this.deleteTask(taskId);
                return;
            }
            
            // Handle task item click (for editing)
            this.editTask(taskId);
        });
    }
    
    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('skylight-tasks');
            this.tasks = savedTasks ? JSON.parse(savedTasks) : this.getDefaultTasks();
        } catch (error) {
            debug('Error loading tasks:', error);
            this.tasks = this.getDefaultTasks();
        }
    }
    
    /**
     * Get default tasks
     */
    getDefaultTasks() {
        return [
            {
                id: '1',
                text: 'Review dashboard metrics',
                description: 'Check performance and user engagement data',
                completed: false,
                priority: 'medium',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                text: 'Update team calendar',
                description: 'Sync upcoming meetings and events',
                completed: true,
                priority: 'high',
                dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                text: 'Prepare weekly report',
                description: 'Compile data and create presentation',
                completed: false,
                priority: 'high',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('skylight-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            debug('Error saving tasks:', error);
        }
    }
    
    /**
     * Render tasks based on current filter
     */
    renderTasks() {
        const taskList = document.getElementById('main-task-list');
        if (!taskList) return;
        
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => this.getTaskHTML(task)).join('');
    }
    
    /**
     * Get filtered tasks
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    /**
     * Get task HTML
     */
    getTaskHTML(task) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = !task.completed && dueDate < new Date();
        const isToday = dueDate.toDateString() === new Date().toDateString();
        
        return `
            <div class="task-item-main ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox-main"></div>
                <div class="task-content">
                    <div class="task-text-main">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <div class="task-date">
                            <span>📅</span>
                            <span>${this.formatDate(dueDate)}</span>
                        </div>
                        <div class="task-priority ${task.priority}">${task.priority}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" title="Edit task">
                        <span>✏️</span>
                    </button>
                    <button class="task-action-btn delete" title="Delete task">
                        <span>🗑️</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get empty state HTML
     */
    getEmptyStateHTML() {
        const messages = {
            all: 'No tasks yet. Create your first task to get started!',
            pending: 'No pending tasks. Great job!',
            completed: 'No completed tasks yet.'
        };
        
        return `
            <div class="task-list-empty">
                <div class="task-list-empty-icon">📋</div>
                <h3>${this.currentFilter === 'all' ? 'No Tasks' : this.currentFilter === 'pending' ? 'No Pending Tasks' : 'No Completed Tasks'}</h3>
                <p>${messages[this.currentFilter]}</p>
            </div>
        `;
    }
    
    /**
     * Set filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }
    
    /**
     * Toggle task completion
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        this.saveTasks();
        this.renderTasks();
        
        // Add completion animation
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.animation = 'softPulse 0.3s ease';
            setTimeout(() => {
                taskElement.style.animation = '';
            }, 300);
        }
    }
    
    /**
     * Add new task
     */
    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            text: taskData.text,
            description: taskData.description || '',
            completed: false,
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        
        // Show notification
        if (this.dashboard.showNotification) {
            this.dashboard.showNotification('Task added successfully', 'success', 2000);
        }
    }
    
    /**
     * Edit task
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        this.showTaskModal(task);
    }
    
    /**
     * Update task
     */
    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            text: taskData.text,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || this.tasks[taskIndex].dueDate,
            updatedAt: new Date().toISOString()
        };
        
        this.saveTasks();
        this.renderTasks();
        
        // Show notification
        if (this.dashboard.showNotification) {
            this.dashboard.showNotification('Task updated successfully', 'success', 2000);
        }
    }
    
    /**
     * Delete task
     */
    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        // Add removal animation
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transition = 'all 0.3s ease';
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                this.tasks.splice(taskIndex, 1);
                this.saveTasks();
                this.renderTasks();
                
                // Show notification
                if (this.dashboard.showNotification) {
                    this.dashboard.showNotification('Task deleted successfully', 'info', 2000);
                }
            }, 300);
        } else {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();
        }
    }
    
    /**
     * Show task modal
     */
    showTaskModal(task = null) {
        const isEditing = !!task;
        const modalHTML = `
            <div class="task-modal ${isEditing ? 'editing' : ''}" id="task-modal">
                <div class="task-modal-content">
                    <div class="task-modal-header">
                        <h3 class="task-modal-title">${isEditing ? 'Edit Task' : 'Add New Task'}</h3>
                        <button class="task-modal-close" id="task-modal-close">✕</button>
                    </div>
                    <form class="task-form" id="task-form">
                        <div class="form-group">
                            <label class="form-label" for="task-text">Task Title *</label>
                            <input type="text" id="task-text" class="form-input" value="${task ? this.escapeHtml(task.text) : ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="task-description">Description</label>
                            <textarea id="task-description" class="form-textarea" placeholder="Add details about this task...">${task ? this.escapeHtml(task.description) : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="task-priority">Priority</label>
                            <select id="task-priority" class="form-select">
                                <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${!task || task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${task && task.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="task-due-date">Due Date</label>
                            <input type="datetime-local" id="task-due-date" class="form-input" value="${task ? this.formatDateTimeLocal(task.dueDate) : this.formatDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000))}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="task-modal-cancel">Cancel</button>
                            <button type="submit" class="btn-primary">${isEditing ? 'Update Task' : 'Add Task'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('task-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal event listeners
        this.setupModalEventListeners(isEditing, task);
        
        // Show modal
        setTimeout(() => {
            const modal = document.getElementById('task-modal');
            if (modal) {
                modal.classList.add('active');
            }
        }, 10);
    }
    
    /**
     * Setup modal event listeners
     */
    setupModalEventListeners(isEditing, task) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const closeBtn = document.getElementById('task-modal-close');
        const cancelBtn = document.getElementById('task-modal-cancel');
        
        // Close modal
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                this.editingTaskId = null;
            }, 300);
        };
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        // Click outside modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = {
                    text: document.getElementById('task-text').value.trim(),
                    description: document.getElementById('task-description').value.trim(),
                    priority: document.getElementById('task-priority').value,
                    dueDate: document.getElementById('task-due-date').value
                };
                
                if (!formData.text) {
                    alert('Please enter a task title');
                    return;
                }
                
                if (isEditing && this.editingTaskId) {
                    this.updateTask(this.editingTaskId, formData);
                } else {
                    this.addTask(formData);
                }
                
                closeModal();
            });
        }
    }
    
    /**
     * Format date for display
     */
    formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (taskDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }
    
    /**
     * Format date for datetime-local input
     */
    formatDateTimeLocal(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get task statistics
     */
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(task => 
            !task.completed && new Date(task.dueDate) < new Date()
        ).length;
        
        return { total, completed, pending, overdue };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug('Destroying Tasks Manager');
        
        // Remove modal if open
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.remove();
        }
    }
}
