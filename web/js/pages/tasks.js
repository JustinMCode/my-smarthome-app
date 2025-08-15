/**
 * Tasks Page Manager - Production Task Management Interface
 * Implements a comprehensive task management system with user switching,
 * health tracking, and modern glassmorphism design
 */

import { CONFIG, debug } from '../constants/config.js';
import { loadFromStorage, saveToStorage } from '../utils/utils.js';

export class TasksPageManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.currentUser = 'justin';
        this.tasks = [];
        this.taskIdCounter = 0;
        this.waterGlasses = 0;
        this.maxWaterGlasses = 8;
        this.medicationStatus = {
            morning: false
        };
        
        // Storage keys
        this.STORAGE_KEYS = {
            TASKS: 'skylight-tasks-v2',
            WATER: 'skylight-water',
            MEDICATION: 'skylight-medication',
            CURRENT_USER: 'skylight-current-user'
        };
    }

    /**
     * Initialize the tasks page
     */
    init() {
        debug('Initializing Tasks Page Manager...');
        this.loadData();
        this.setupEventListeners();
        this.initializeInterface();
        this.renderTasks();
        this.updateStats();
    }

    /**
     * Load data from storage
     */
    loadData() {
        // Load tasks
        try {
            const savedTasks = loadFromStorage(this.STORAGE_KEYS.TASKS);
            if (Array.isArray(savedTasks)) {
                this.tasks = savedTasks;
            } else {
                debug('No valid tasks found in storage, using defaults');
                this.tasks = this.getDefaultTasks();
            }
        } catch (error) {
            debug('Error loading tasks:', error);
            this.tasks = this.getDefaultTasks();
        }

        // Load water tracking
        try {
            const savedWater = loadFromStorage(this.STORAGE_KEYS.WATER);
            this.waterGlasses = (typeof savedWater === 'number' && savedWater >= 0) ? savedWater : 0;
        } catch (error) {
            debug('Error loading water data:', error);
            this.waterGlasses = 0;
        }

        // Load medication status
        try {
            const savedMedication = loadFromStorage(this.STORAGE_KEYS.MEDICATION);
            if (savedMedication && typeof savedMedication === 'object') {
                this.medicationStatus = {
                    morning: !!savedMedication.morning
                };
            } else {
                this.medicationStatus = { morning: false };
            }
        } catch (error) {
            debug('Error loading medication data:', error);
            this.medicationStatus = { morning: false };
        }

        // Load current user
        try {
            const savedUser = loadFromStorage(this.STORAGE_KEYS.CURRENT_USER);
            this.currentUser = (savedUser === 'justin' || savedUser === 'brooke') ? savedUser : 'justin';
        } catch (error) {
            debug('Error loading user data:', error);
            this.currentUser = 'justin';
        }

        // Update task ID counter
        if (Array.isArray(this.tasks) && this.tasks.length > 0) {
            this.taskIdCounter = Math.max(...this.tasks.map(t => parseInt(t.id) || 0)) + 1;
        }
    }

    /**
     * Save data to storage
     */
    saveData() {
        try {
            saveToStorage(this.STORAGE_KEYS.TASKS, this.tasks);
            saveToStorage(this.STORAGE_KEYS.WATER, this.waterGlasses);
            saveToStorage(this.STORAGE_KEYS.MEDICATION, this.medicationStatus);
            saveToStorage(this.STORAGE_KEYS.CURRENT_USER, this.currentUser);
        } catch (error) {
            debug('Error saving data:', error);
        }
    }

    /**
     * Get default sample tasks
     */
    getDefaultTasks() {
        return [
            {
                id: '1',
                text: 'Review weekly calendar',
                owner: 'justin',
                completed: false,
                timestamp: new Date().toISOString()
            },
            {
                id: '2', 
                text: 'Grocery shopping for dinner',
                owner: 'brooke',
                completed: false,
                timestamp: new Date().toISOString()
            },
            {
                id: '3',
                text: 'Call plumber about kitchen sink',
                owner: 'justin',
                completed: false,
                timestamp: new Date().toISOString()
            },
            {
                id: '4',
                text: 'Yoga class at 6pm',
                owner: 'brooke',
                completed: false,
                timestamp: new Date().toISOString()
            },
            {
                id: '5',
                text: 'Prep lunch for tomorrow',
                owner: 'justin',
                completed: false,
                timestamp: new Date().toISOString()
            }
        ];
    }

    /**
     * Initialize the interface by injecting the HTML structure
     */
    initializeInterface() {
        const tasksView = document.getElementById('tasks-view');
        if (!tasksView) {
            debug('Tasks view container not found');
            return;
        }

        // CSS is now loaded via external file in index.html

        // Clear existing content and inject our custom HTML
        tasksView.innerHTML = this.getTasksHTML();
        
        // Initialize water tracker
        this.initWaterTracker();
        
        // Update medication status
        this.updateMedicationStatus();
        
        // Set active user
        this.switchUser(this.currentUser, false);
    }



    /**
     * Get the complete tasks HTML structure
     */
    getTasksHTML() {
        return `
            <div class="tasks-page-container">
                <div class="container">
                    <div class="header">
                        <div class="header-left">
                            <h1 class="page-title">Task Manager</h1>
                            <div class="user-switcher">
                                <button class="user-btn ${this.currentUser === 'justin' ? 'active' : ''}" data-user="justin">Justin</button>
                                <button class="user-btn ${this.currentUser === 'brooke' ? 'active' : ''}" data-user="brooke">Brooke</button>
                            </div>
                        </div>
                        <div class="header-stats">
                            <div class="stat-item-header">
                                <div class="stat-value-header" id="totalTasksHeader">0</div>
                                <div class="stat-label-header">Total</div>
                            </div>
                            <div class="stat-item-header">
                                <div class="stat-value-header" id="justinTasksHeader">0</div>
                                <div class="stat-label-header">Justin</div>
                            </div>
                            <div class="stat-item-header">
                                <div class="stat-value-header" id="brookeTasksHeader">0</div>
                                <div class="stat-label-header">Brooke</div>
                            </div>
                            <div class="stat-item-header">
                                <div class="stat-value-header" id="completedCountHeader">0</div>
                                <div class="stat-label-header">Done</div>
                            </div>
                        </div>
                    </div>

                    <div class="add-task-panel">
                        <div class="input-group">
                            <input type="text" class="task-input" id="taskInput" placeholder="What needs to be done today?">
                            <button class="add-btn" id="addTaskBtn">Add Task</button>
                        </div>
                    </div>

                    <!-- Health Tracker Horizontal - Justin Only -->
                    <div class="health-tracker-horizontal ${this.currentUser === 'justin' ? 'visible' : ''}" id="healthTrackerHorizontal">
                        <div class="health-horizontal-content">
                            <!-- Medication Section -->
                            <div class="health-section">
                                <div class="health-section-title">
                                    <span>💊</span>
                                    <span>Medication</span>
                                    <span class="medication-status pending" id="medStatusHorizontal">Pending</span>
                                </div>
                                <div class="medication-items">
                                    <label class="med-item">
                                        <input type="checkbox" class="med-checkbox" id="morningMedHorizontal">
                                        <span class="med-time">Morning</span>
                                        <span class="med-icon">🌅</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Water Section -->
                            <div class="health-section">
                                <div class="health-section-title">
                                    <span>💧</span>
                                    <span>Hydration</span>
                                </div>
                                <div class="water-glasses-horizontal" id="waterGlassesHorizontal">
                                    <!-- Will be populated by JavaScript -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="content" id="mainContent">
                        <div class="task-panel">
                            <h2 class="panel-title">Active Tasks <span class="user-indicator" id="activeUserIndicator">${this.currentUser === 'justin' ? "Justin's" : "Brooke's"}</span></h2>
                            <div class="task-list" id="activeTasks">
                                <div class="empty-state">No active tasks. Time to relax!</div>
                            </div>
                        </div>

                        <div class="task-panel">
                            <h2 class="panel-title">Completed Today</h2>
                            <div class="task-list" id="completedTasks">
                                <div class="empty-state">No completed tasks yet.</div>
                            </div>
                        </div>

                        <!-- Health Tracker - Justin Only -->
                        <div class="water-tracker-compact ${this.currentUser === 'justin' ? 'visible' : ''}" id="waterTracker">
                            <div class="water-compact-header">
                                <div class="water-compact-title">Daily Health</div>
                            </div>

                            <!-- Medication Section -->
                            <div class="medication-section">
                                <div class="medication-header">
                                    <span class="medication-label">💊 Medication</span>
                                    <span class="medication-status pending" id="medStatus">Pending</span>
                                </div>
                                <div class="medication-items">
                                    <label class="med-item">
                                        <input type="checkbox" class="med-checkbox" id="morningMed">
                                        <span class="med-time">Morning</span>
                                        <span class="med-icon">🌅</span>
                                    </label>
                                </div>
                            </div>

                            <div class="health-divider"></div>

                            <!-- Water Section -->
                            <div class="water-section">
                                <div class="water-inner-header">
                                    <div class="water-compact-subtitle">💧 Hydration</div>
                                    <div class="water-compact-count">
                                        <span id="waterCount">${this.waterGlasses}</span>/8
                                    </div>
                                    <div class="water-compact-goal">glasses (64 oz)</div>
                                </div>
                                
                                <div class="water-mini-progress">
                                    <div class="water-mini-fill" id="waterProgress" style="width: ${(this.waterGlasses / this.maxWaterGlasses) * 100}%;"></div>
                                </div>

                                <div class="water-compact-glasses" id="waterGlasses">
                                    <!-- Will be populated by JavaScript -->
                                </div>

                                <div class="water-compact-actions">
                                    <button class="water-compact-btn" id="addWaterBtn">+ Add</button>
                                    <button class="water-compact-btn" id="resetWaterBtn">Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        `;
    }



    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // User switching
        document.addEventListener('click', (e) => {
            const userBtn = e.target.closest('.user-btn');
            if (userBtn) {
                const user = userBtn.dataset.user;
                this.switchUser(user);
            }

            // Add task button
            if (e.target.closest('#addTaskBtn')) {
                this.addTask();
            }

            // Task checkbox
            const taskCheckbox = e.target.closest('.task-checkbox');
            if (taskCheckbox) {
                const taskItem = taskCheckbox.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.dataset.taskId;
                    this.toggleTask(taskId);
                }
            }

            // Delete task button
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const taskItem = deleteBtn.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.dataset.taskId;
                    this.deleteTask(taskId);
                }
            }

            // Medication checkboxes (both vertical and horizontal, morning only)
            if (e.target.id === 'morningMed' || e.target.id === 'morningMedHorizontal') {
                this.updateMedicationStatus();
            }

            // Water actions (vertical only, no buttons in horizontal)
            if (e.target.closest('#addWaterBtn')) {
                this.addWater();
            }

            if (e.target.closest('#resetWaterBtn')) {
                this.resetWater();
            }

            // Individual water glass
            const miniGlass = e.target.closest('.mini-glass');
            if (miniGlass) {
                const index = Array.from(miniGlass.parentNode.children).indexOf(miniGlass);
                this.toggleGlass(index);
            }
        });

        // Enter key support for task input
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'taskInput' && e.key === 'Enter') {
                this.addTask();
            }
        });
    }

    /**
     * Switch user
     */
    switchUser(user, save = true) {
        this.currentUser = user;
        
        // Update UI
        document.querySelectorAll('.user-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.user === user);
        });

        const activeUserIndicator = document.getElementById('activeUserIndicator');
        if (activeUserIndicator) {
            activeUserIndicator.textContent = user === 'justin' ? "Justin's" : "Brooke's";
        }

        // Show/hide health trackers
        const waterTracker = document.getElementById('waterTracker');
        const healthTrackerHorizontal = document.getElementById('healthTrackerHorizontal');
        const mainContent = document.getElementById('mainContent');
        
        if (user === 'justin') {
            // Show horizontal health tracker for Justin
            if (healthTrackerHorizontal) {
                healthTrackerHorizontal.classList.add('visible');
            }
            // Hide vertical water tracker (we're using horizontal now)
            if (waterTracker) {
                waterTracker.classList.remove('visible');
            }
            // Remove the with-water class since we're not using the sidebar layout
            if (mainContent) {
                mainContent.classList.remove('with-water');
            }
        } else {
            // Hide health trackers for Brooke
            if (healthTrackerHorizontal) {
                healthTrackerHorizontal.classList.remove('visible');
            }
            if (waterTracker) {
                waterTracker.classList.remove('visible');
            }
            if (mainContent) {
                mainContent.classList.remove('with-water');
            }
        }

        this.renderTasks();
        this.updateStats();
        
        if (save) {
            this.saveData();
        }
    }

    /**
     * Add new task
     */
    addTask() {
        const input = document.getElementById('taskInput');
        if (!input) return;

        const text = input.value.trim();
        if (text === '') return;

        const task = {
            id: this.taskIdCounter++,
            text: text,
            owner: this.currentUser,
            completed: false,
            timestamp: new Date().toISOString()
        };

        this.tasks.push(task);
        input.value = '';
        this.renderTasks();
        this.updateStats();
        this.saveData();
    }

    /**
     * Toggle task completion
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
            this.updateStats();
            this.saveData();
        }
    }

    /**
     * Delete task
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id != taskId);
        this.renderTasks();
        this.updateStats();
        this.saveData();
    }

    /**
     * Render tasks
     */
    renderTasks() {
        const activeTasks = document.getElementById('activeTasks');
        const completedTasks = document.getElementById('completedTasks');
        
        if (!activeTasks || !completedTasks) return;

        const userTasks = this.tasks.filter(t => t.owner === this.currentUser);
        const active = userTasks.filter(t => !t.completed);
        const completed = userTasks.filter(t => t.completed);

        // Render active tasks
        if (active.length === 0) {
            activeTasks.innerHTML = '<div class="empty-state">No active tasks. Time to relax!</div>';
        } else {
            activeTasks.innerHTML = active.map((task, index) => `
                <div class="task-item" data-task-id="${task.id}" style="animation-delay: ${index * 50}ms">
                    <input type="checkbox" class="task-checkbox" 
                           ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-owner">${task.owner}</span>
                    <button class="delete-btn">Delete</button>
                </div>
            `).join('');
        }

        // Render completed tasks
        if (completed.length === 0) {
            completedTasks.innerHTML = '<div class="empty-state">No completed tasks yet.</div>';
        } else {
            completedTasks.innerHTML = completed.map((task, index) => `
                <div class="task-item completed" data-task-id="${task.id}" style="animation-delay: ${index * 50}ms">
                    <input type="checkbox" class="task-checkbox" 
                           ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-owner">${task.owner}</span>
                    <button class="delete-btn">Delete</button>
                </div>
            `).join('');
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        const justinCount = this.tasks.filter(t => t.owner === 'justin' && !t.completed).length;
        const brookeCount = this.tasks.filter(t => t.owner === 'brooke' && !t.completed).length;
        const completedCount = this.tasks.filter(t => t.completed).length;
        const totalActive = this.tasks.filter(t => !t.completed).length;

        // Update header stats
        const totalTasksHeaderEl = document.getElementById('totalTasksHeader');
        const justinTasksHeaderEl = document.getElementById('justinTasksHeader');
        const brookeTasksHeaderEl = document.getElementById('brookeTasksHeader');
        const completedCountHeaderEl = document.getElementById('completedCountHeader');

        if (totalTasksHeaderEl) totalTasksHeaderEl.textContent = totalActive;
        if (justinTasksHeaderEl) justinTasksHeaderEl.textContent = justinCount;
        if (brookeTasksHeaderEl) brookeTasksHeaderEl.textContent = brookeCount;
        if (completedCountHeaderEl) completedCountHeaderEl.textContent = completedCount;

        // Update old stats (if they exist for backward compatibility)
        const totalTasksEl = document.getElementById('totalTasks');
        const justinTasksEl = document.getElementById('justinTasks');
        const brookeTasksEl = document.getElementById('brookeTasks');
        const completedCountEl = document.getElementById('completedCount');

        if (totalTasksEl) totalTasksEl.textContent = totalActive;
        if (justinTasksEl) justinTasksEl.textContent = justinCount;
        if (brookeTasksEl) brookeTasksEl.textContent = brookeCount;
        if (completedCountEl) completedCountEl.textContent = completedCount;
    }

    /**
     * Initialize water tracker
     */
    initWaterTracker() {
        // Initialize both vertical and horizontal water trackers
        this.initWaterGlasses('waterGlasses');
        this.initWaterGlasses('waterGlassesHorizontal');
        this.updateWaterProgress();
    }

    /**
     * Initialize water glasses for a specific container
     */
    initWaterGlasses(containerId) {
        const waterGlassesDiv = document.getElementById(containerId);
        if (!waterGlassesDiv) return;

        waterGlassesDiv.innerHTML = '';

        for (let i = 0; i < this.maxWaterGlasses; i++) {
            const glass = document.createElement('button');
            glass.className = `mini-glass ${i < this.waterGlasses ? 'filled' : ''}`;
            glass.innerHTML = i < this.waterGlasses ? '💧' : '○';
            glass.style.animationDelay = `${i * 30}ms`;
            waterGlassesDiv.appendChild(glass);
        }
    }

    /**
     * Toggle individual glass
     */
    toggleGlass(index) {
        if (index === this.waterGlasses - 1 && this.waterGlasses > 0) {
            this.waterGlasses = index;
        } else if (index === this.waterGlasses) {
            this.waterGlasses = index + 1;
        } else if (index < this.waterGlasses) {
            this.waterGlasses = index + 1;
        } else {
            this.waterGlasses = index + 1;
        }
        this.initWaterTracker();
        this.saveData();
    }

    /**
     * Add water
     */
    addWater() {
        if (this.waterGlasses < this.maxWaterGlasses) {
            this.waterGlasses++;
            this.initWaterTracker();
            this.saveData();
        }
    }

    /**
     * Reset water
     */
    resetWater() {
        this.waterGlasses = 0;
        this.initWaterTracker();
        this.saveData();
    }

    /**
     * Update water progress
     */
    updateWaterProgress() {
        const percentage = (this.waterGlasses / this.maxWaterGlasses) * 100;
        
        // Update vertical water tracker (if it exists)
        const progressBar = document.getElementById('waterProgress');
        const waterCount = document.getElementById('waterCount');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (waterCount) {
            waterCount.textContent = this.waterGlasses;
        }

        // Note: Horizontal water tracker no longer has progress bar or counter
    }

    /**
     * Update medication status
     */
    updateMedicationStatus() {
        // Get elements from both vertical and horizontal layouts (morning only)
        const morningMed = document.getElementById('morningMed');
        const morningMedHorizontal = document.getElementById('morningMedHorizontal');
        const statusElement = document.getElementById('medStatus');
        const statusElementHorizontal = document.getElementById('medStatusHorizontal');

        // Update checkboxes from state
        if (morningMed) morningMed.checked = this.medicationStatus.morning;
        if (morningMedHorizontal) morningMedHorizontal.checked = this.medicationStatus.morning;

        // Update state from checkboxes (check both layouts)
        if (morningMed || morningMedHorizontal) {
            this.medicationStatus.morning = (morningMed && morningMed.checked) || (morningMedHorizontal && morningMedHorizontal.checked);
        }

        // Update status displays - only morning medication now
        const statusText = this.medicationStatus.morning ? 'Complete' : 'Pending';
        const statusClass = statusText === 'Complete' ? 'medication-status complete' : 'medication-status pending';

        if (statusElement) {
            statusElement.textContent = statusText;
            statusElement.className = statusClass;
        }
        if (statusElementHorizontal) {
            statusElementHorizontal.textContent = statusText;
            statusElementHorizontal.className = statusClass;
        }

        // Sync checkboxes between layouts
        if (morningMed && morningMedHorizontal) {
            morningMed.checked = morningMedHorizontal.checked = this.medicationStatus.morning;
        }

        this.saveData();
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
     * Show the tasks view
     */
    show() {
        const tasksView = document.getElementById('tasks-view');
        if (tasksView) {
            // Hide all other views
            document.querySelectorAll('.view-container').forEach(view => {
                view.classList.remove('active');
            });
            
            // Show tasks view
            tasksView.classList.add('active');
            
            // Refresh the interface
            this.initializeInterface();
            this.renderTasks();
            this.updateStats();
        }
    }

    /**
     * Hide the tasks view
     */
    hide() {
        const tasksView = document.getElementById('tasks-view');
        if (tasksView) {
            tasksView.classList.remove('active');
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        debug('Destroying Tasks Page Manager');
        // Clean up any intervals or listeners if needed
    }
}
