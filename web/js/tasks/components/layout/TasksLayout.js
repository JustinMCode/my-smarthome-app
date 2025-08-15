/**
 * Tasks Layout Component
 * Main layout orchestrator for the entire tasks interface
 */

import { BaseComponent } from '../BaseComponent.js';
import { AddTaskForm } from '../ui/AddTaskForm.js';
import { UserSwitcher } from '../ui/UserSwitcher.js';
import { StatsHeader } from '../ui/StatsHeader.js';
import { HealthTracker } from '../health/HealthTracker.js';
import { TasksContainer } from './TasksContainer.js';

/**
 * TasksLayout - Main layout orchestrator component
 */
export class TasksLayout extends BaseComponent {
    constructor(config) {
        super({
            className: 'tasks-page-container',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.currentUser = config.currentUser || 'justin';
        this.tasks = config.tasks || [];
        this.waterGlasses = config.waterGlasses || 0;
        this.maxWaterGlasses = config.maxWaterGlasses || 8;
        this.medicationStatus = config.medicationStatus || { morning: false };
        
        // Component references
        this.addTaskForm = null;
        this.userSwitcher = null;
        this.statsHeader = null;
        this.healthTracker = null;
        this.tasksContainer = null;
    }
    
    /**
     * Generate HTML for tasks layout
     */
    generateHTML() {
        return `
            <div class="tasks-page-container">
                <div class="container">
                    <div class="header">
                        <div class="header-left">
                            <h1 class="page-title">Task Manager</h1>
                            <div id="userSwitcherContainer"></div>
                        </div>
                        <div id="statsHeaderContainer"></div>
                    </div>

                    <div id="addTaskFormContainer"></div>

                    <div id="healthTrackerContainer"></div>

                    <div id="tasksContainerWrapper"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render component and all child components
     */
    render(container = null) {
        console.log('TasksLayout: Starting render...');
        
        const element = super.render(container);
        
        console.log('TasksLayout: Base component rendered, rendering child components...');
        this.renderChildComponents();
        
        console.log('TasksLayout: Render complete');
        return element;
    }
    
    /**
     * Render all child components
     */
    renderChildComponents() {
        console.log('TasksLayout: Rendering child components...');
        
        this.renderUserSwitcher();
        this.renderStatsHeader();
        this.renderAddTaskForm();
        this.renderHealthTracker();
        this.renderTasksContainer();
        
        console.log('TasksLayout: Setting up component event handlers...');
        this.setupComponentEventHandlers();
        
        console.log('TasksLayout: All child components rendered');
    }
    
    /**
     * Render user switcher component
     */
    renderUserSwitcher() {
        console.log('TasksLayout: Rendering user switcher...');
        const container = this.$('#userSwitcherContainer');
        if (container) {
            try {
                this.userSwitcher = new UserSwitcher({
                    currentUser: this.currentUser,
                    services: this.services,
                    events: this.events,
                    state: this.state
                });
                
                this.userSwitcher.render(container);
                this.addChild('userSwitcher', this.userSwitcher);
                console.log('TasksLayout: User switcher rendered successfully');
            } catch (error) {
                console.error('TasksLayout: Error rendering user switcher:', error);
                container.innerHTML = '<div class="error">User switcher unavailable</div>';
            }
        } else {
            console.error('TasksLayout: ERROR - userSwitcherContainer not found');
        }
    }
    
    /**
     * Render stats header component
     */
    renderStatsHeader() {
        console.log('TasksLayout: Rendering stats header...');
        const container = this.$('#statsHeaderContainer');
        if (container) {
            try {
                const stats = this.calculateCurrentStats();
                
                this.statsHeader = new StatsHeader({
                    stats,
                    services: this.services,
                    events: this.events,
                    state: this.state
                });
                
                this.statsHeader.render(container);
                this.addChild('statsHeader', this.statsHeader);
                console.log('TasksLayout: Stats header rendered successfully');
            } catch (error) {
                console.error('TasksLayout: Error rendering stats header:', error);
                container.innerHTML = '<div class="error">Stats unavailable</div>';
            }
        } else {
            console.error('TasksLayout: ERROR - statsHeaderContainer not found');
        }
    }
    
    /**
     * Render add task form component
     */
    renderAddTaskForm() {
        console.log('TasksLayout: Rendering add task form...');
        const container = this.$('#addTaskFormContainer');
        if (container) {
            try {
                this.addTaskForm = new AddTaskForm({
                    services: this.services,
                    events: this.events,
                    state: this.state
                });
                
                this.addTaskForm.render(container);
                this.addChild('addTaskForm', this.addTaskForm);
                console.log('TasksLayout: Add task form rendered successfully');
            } catch (error) {
                console.error('TasksLayout: Error rendering add task form:', error);
                container.innerHTML = '<div class="error">Add task form unavailable</div>';
            }
        } else {
            console.error('TasksLayout: ERROR - addTaskFormContainer not found');
        }
    }
    
    /**
     * Render health tracker component
     */
    renderHealthTracker() {
        console.log('TasksLayout: Rendering health tracker...');
        const container = this.$('#healthTrackerContainer');
        if (container) {
            try {
                this.healthTracker = new HealthTracker({
                    currentUser: this.currentUser,
                    layout: 'horizontal',
                    services: this.services,
                    events: this.events,
                    state: this.state,
                    waterConfig: {
                        currentGlasses: this.waterGlasses,
                        maxGlasses: this.maxWaterGlasses
                    },
                    medicationConfig: {
                        medicationStatus: this.medicationStatus
                    }
                });
                
                this.healthTracker.render(container);
                this.addChild('healthTracker', this.healthTracker);
                console.log('TasksLayout: Health tracker rendered successfully');
            } catch (error) {
                console.error('TasksLayout: Error rendering health tracker:', error);
                container.innerHTML = '<div class="error">Health tracker unavailable</div>';
            }
        } else {
            console.error('TasksLayout: ERROR - healthTrackerContainer not found');
        }
    }
    
    /**
     * Render tasks container component
     */
    renderTasksContainer() {
        console.log('TasksLayout: Rendering tasks container...');
        const container = this.$('#tasksContainerWrapper');
        if (container) {
            try {
                console.log('TasksLayout: Tasks data:', this.tasks);
                
                this.tasksContainer = new TasksContainer({
                    currentUser: this.currentUser,
                    tasks: this.tasks,
                    services: this.services,
                    events: this.events,
                    state: this.state
                });
                
                this.tasksContainer.render(container);
                this.addChild('tasksContainer', this.tasksContainer);
                console.log('TasksLayout: Tasks container rendered successfully');
            } catch (error) {
                console.error('TasksLayout: Error rendering tasks container:', error);
                container.innerHTML = '<div class="error">Tasks container unavailable</div>';
            }
        } else {
            console.error('TasksLayout: ERROR - tasksContainerWrapper not found');
        }
    }
    
    /**
     * Setup event handlers between components
     */
    setupComponentEventHandlers() {
        // User switcher events
        if (this.userSwitcher) {
            this.userSwitcher.addEventListener('user:switched', (data) => {
                this.handleUserSwitch(data.detail.data);
            });
        }
        
        // Add task form events
        if (this.addTaskForm) {
            this.addTaskForm.addEventListener('task:added', (data) => {
                this.handleTaskAdded(data.detail.data);
            });
        }
        
        // Tasks container events
        if (this.tasksContainer) {
            this.tasksContainer.addEventListener('task:toggled', () => {
                this.updateStats();
            });
            
            this.tasksContainer.addEventListener('task:deleted', () => {
                this.updateStats();
            });
        }
        
        // Health tracker events
        if (this.healthTracker) {
            this.healthTracker.addEventListener('health:daily:complete', () => {
                this.showHealthCelebration();
            });
        }
    }
    
    /**
     * Handle user switch
     * @param {Object} data - User switch data
     */
    handleUserSwitch(data) {
        this.currentUser = data.newUser;
        
        // Update stats
        this.updateStats();
        
        // Emit global event
        this.emit('layout:user:switched', data);
    }
    
    /**
     * Handle task added
     * @param {Object} task - New task data
     */
    handleTaskAdded(task) {
        // Update stats
        this.updateStats();
        
        // Show success feedback
        this.showTaskAddedFeedback();
        
        // Emit global event
        this.emit('layout:task:added', task);
    }
    
    /**
     * Update statistics across components
     */
    updateStats() {
        if (this.statsHeader && this.services.stats) {
            const stats = this.services.stats.calculateCurrentUserStats();
            this.statsHeader.updateStats(stats);
        }
    }
    
    /**
     * Calculate current statistics
     * @returns {Object} Current statistics
     */
    calculateCurrentStats() {
        if (this.services.stats) {
            return this.services.stats.calculateCurrentUserStats();
        }
        
        // Fallback calculation
        const justinTasks = this.tasks.filter(t => t.owner === 'justin');
        const brookeTasks = this.tasks.filter(t => t.owner === 'brooke');
        
        return {
            totalActive: this.tasks.filter(t => !t.completed).length,
            justinCount: justinTasks.filter(t => !t.completed).length,
            brookeCount: brookeTasks.filter(t => !t.completed).length,
            completedCount: this.tasks.filter(t => t.completed).length
        };
    }
    
    /**
     * Show task added feedback
     */
    showTaskAddedFeedback() {
        // Brief animation on add task form
        if (this.addTaskForm) {
            this.addTaskForm.addClass('task-added');
            setTimeout(() => {
                this.addTaskForm.removeClass('task-added');
            }, 1000);
        }
        
        // Pulse relevant stats
        if (this.statsHeader) {
            this.statsHeader.pulseStats('total');
            this.statsHeader.pulseStats(this.currentUser);
        }
    }
    
    /**
     * Show health celebration
     */
    showHealthCelebration() {
        this.addClass('health-celebration');
        
        setTimeout(() => {
            this.removeClass('health-celebration');
        }, 3000);
        
        // Emit global event
        this.emit('layout:health:celebration');
    }
    
    /**
     * Update layout data
     * @param {Object} data - New data
     */
    updateData(data) {
        if (data.tasks !== undefined) {
            this.tasks = data.tasks;
        }
        
        if (data.currentUser !== undefined) {
            this.currentUser = data.currentUser;
        }
        
        if (data.waterGlasses !== undefined) {
            this.waterGlasses = data.waterGlasses;
        }
        
        if (data.maxWaterGlasses !== undefined) {
            this.maxWaterGlasses = data.maxWaterGlasses;
        }
        
        if (data.medicationStatus !== undefined) {
            this.medicationStatus = data.medicationStatus;
        }
        
        // Update components as needed
        this.updateStats();
    }
    
    /**
     * Focus task input
     */
    focusTaskInput() {
        if (this.addTaskForm) {
            this.addTaskForm.focus();
        }
    }
    
    /**
     * Show/hide health tracker based on user
     * @param {string} userId - User ID
     */
    updateHealthTrackerVisibility(userId) {
        if (this.healthTracker) {
            this.healthTracker.updateCurrentUser(userId);
        }
    }
    
    /**
     * Set loading state for entire layout
     * @param {boolean} loading - Whether layout is loading
     */
    setLoading(loading) {
        if (loading) {
            this.addClass('loading');
        } else {
            this.removeClass('loading');
        }
        
        // Propagate to child components
        if (this.tasksContainer) {
            this.tasksContainer.setLoading(loading);
        }
    }
    
    /**
     * Enable/disable all interactions
     * @param {boolean} enabled - Whether interactions should be enabled
     */
    setInteractive(enabled) {
        if (this.addTaskForm) {
            this.addTaskForm.setEnabled(enabled);
        }
        
        if (this.userSwitcher) {
            this.userSwitcher.setEnabled(enabled);
        }
        
        if (this.healthTracker) {
            this.healthTracker.setInteractive(enabled);
        }
        
        if (enabled) {
            this.removeClass('disabled');
        } else {
            this.addClass('disabled');
        }
    }
    
    /**
     * Get layout summary for debugging
     * @returns {Object} Layout summary
     */
    getLayoutSummary() {
        return {
            currentUser: this.currentUser,
            taskCount: this.tasks.length,
            components: {
                addTaskForm: !!this.addTaskForm,
                userSwitcher: !!this.userSwitcher,
                statsHeader: !!this.statsHeader,
                healthTracker: !!this.healthTracker,
                tasksContainer: !!this.tasksContainer
            },
            isRendered: this.isRendered,
            isDestroyed: this.isDestroyed
        };
    }
    
    /**
     * Bind to state changes
     */
    onRender() {
        super.onRender();
        
        // Subscribe to state changes for automatic updates
        if (this.state) {
            this.subscribeToState('tasks', (tasks) => {
                this.updateData({ tasks });
            });
            
            this.subscribeToState('currentUser', (user) => {
                this.updateData({ currentUser: user });
                this.updateHealthTrackerVisibility(user);
            });
            
            this.subscribeToState('waterGlasses', (glasses) => {
                this.updateData({ waterGlasses: glasses });
            });
            
            this.subscribeToState('medicationStatus', (status) => {
                this.updateData({ medicationStatus: status });
            });
        }
    }
    
    /**
     * Clean up all child components
     */
    destroy() {
        // Child components will be destroyed by BaseComponent
        super.destroy();
    }
}