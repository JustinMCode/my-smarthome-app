/**
 * Tasks Core - Main Orchestrator
 * Central coordinator for the entire tasks module
 * Implements the main API and coordinates between all components
 */

import { TasksState } from './TasksState.js';
import { TasksEvents } from './TasksEvents.js';
import { tasksConfig } from '../config/TasksConfig.js';
import { StorageService } from '../services/StorageService.js';
import { TaskService } from '../services/TaskService.js';
import { UserService } from '../services/UserService.js';
import { HealthService } from '../services/HealthService.js';
import { StatsService } from '../services/StatsService.js';
import { TasksLayout } from '../components/layout/TasksLayout.js';
import { DEBUG_PREFIXES, EVENTS } from '../utils/TasksConstants.js';
import { debug } from '../../constants/config.js';

/**
 * TasksCore - Main orchestrator class
 * Coordinates state, events, services, and components
 */
export class TasksCore {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.config = tasksConfig;
        
        // Core systems
        this.state = new TasksState();
        this.events = new TasksEvents();
        
        // Component references (will be initialized in init())
        this.services = {};
        this.components = {};
        this.isInitialized = false;
        this.isDestroyed = false;
        
        debug(DEBUG_PREFIXES.CORE, 'TasksCore initialized');
        
        // Setup core event handlers
        this.setupCoreEventHandlers();
    }
    
    /**
     * Initialize the tasks core system
     */
    async init() {
        if (this.isInitialized) {
            debug(DEBUG_PREFIXES.CORE, 'Already initialized');
            return;
        }
        
        debug(DEBUG_PREFIXES.CORE, 'Initializing...');
        
        try {
            // Initialize services (Phase 2 - will be implemented later)
            await this.initializeServices();
            
            // Load data from storage
            await this.loadData();
            
            // Initialize components (Phase 3 - will be implemented later)
            await this.initializeComponents();
            
            // Setup UI and event listeners
            this.initializeInterface();
            this.setupEventListeners();
            
            // Initial render
            this.render();
            
            this.isInitialized = true;
            this.events.emit(EVENTS.STATE_LOADED);
            
            debug(DEBUG_PREFIXES.CORE, 'Initialization complete');
            
        } catch (error) {
            debug(DEBUG_PREFIXES.CORE, 'Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize services with proper dependency injection
     */
    async initializeServices() {
        debug(DEBUG_PREFIXES.CORE, 'Initializing services...');
        
        // Initialize services in dependency order
        this.services = {
            storage: new StorageService(this.config, this.events),
            task: new TaskService(this.state, this.events, this.config),
            user: new UserService(this.state, this.events, this.config),
            health: new HealthService(this.state, this.events, this.config),
            stats: new StatsService(this.state, this.events, this.config)
        };
        
        debug(DEBUG_PREFIXES.CORE, 'Services initialized successfully');
    }
    
    /**
     * Initialize components with the new component system
     */
    async initializeComponents() {
        debug(DEBUG_PREFIXES.CORE, 'Initializing component system...');
        
        // Create main layout component
        this.components = {
            layout: new TasksLayout({
                currentUser: this.state.get('currentUser'),
                tasks: this.state.get('tasks'),
                waterGlasses: this.state.get('waterGlasses'),
                maxWaterGlasses: this.state.get('maxWaterGlasses'),
                medicationStatus: this.state.get('medicationStatus'),
                services: this.services,
                events: this.events,
                state: this.state
            })
        };
        
        debug(DEBUG_PREFIXES.CORE, 'Component system initialized');
    }
    
    /**
     * Load data from storage
     */
    async loadData() {
        debug(DEBUG_PREFIXES.CORE, 'Loading data...');
        
        try {
            const data = await this.services.storage.loadAll();
            this.state.update(data, true); // Silent update during init
            
        } catch (error) {
            debug(DEBUG_PREFIXES.CORE, 'Error loading data, using defaults:', error);
            // State is already initialized with defaults
        }
    }
    
    /**
     * Initialize the interface using component system
     */
    initializeInterface() {
        debug(DEBUG_PREFIXES.CORE, 'Initializing interface with component system...');
        
        const tasksView = document.getElementById('tasks-view');
        if (!tasksView) {
            debug(DEBUG_PREFIXES.CORE, 'Tasks view container not found');
            return;
        }
        
        // Clear existing content
        tasksView.innerHTML = '';
        
        // Render main layout component
        if (this.components.layout) {
            this.components.layout.render(tasksView);
        }
        
        debug(DEBUG_PREFIXES.CORE, 'Interface initialized with components');
    }
    
    /**
     * Setup event listeners (now handled by components)
     */
    setupEventListeners() {
        debug(DEBUG_PREFIXES.CORE, 'Setting up core event listeners...');
        
        // The component system handles most event listeners now
        // We only need to listen for high-level events
        
        // Listen for layout events
        if (this.components.layout) {
            this.components.layout.addEventListener('layout:user:switched', (e) => {
                this.handleComponentUserSwitch(e.detail.data);
            });
            
            this.components.layout.addEventListener('layout:task:added', (e) => {
                this.handleComponentTaskAdded(e.detail.data);
            });
        }
        
        debug(DEBUG_PREFIXES.CORE, 'Core event listeners set up');
    }
    
    /**
     * Handle user switch from component
     * @param {Object} data - User switch data
     */
    handleComponentUserSwitch(data) {
        debug(DEBUG_PREFIXES.CORE, 'Handling component user switch:', data);
        // State will be updated by the service, components will react automatically
    }
    
    /**
     * Handle task added from component
     * @param {Object} task - Added task data  
     */
    handleComponentTaskAdded(task) {
        debug(DEBUG_PREFIXES.CORE, 'Handling component task added:', task);
        // State will be updated by the service, components will react automatically
    }
    
    /**
     * Setup core event handlers for state synchronization
     */
    setupCoreEventHandlers() {
        // Auto-save when state changes
        this.state.subscribe(EVENTS.STATE_CHANGED, () => {
            if (this.isInitialized) {
                this.saveData();
            }
        });
        
        // Update UI when tasks change
        this.state.subscribe('tasks', () => {
            this.render();
            this.updateStats();
        });
        
        // Update UI when user changes
        this.state.subscribe('currentUser', (newUser) => {
            this.updateUserInterface(newUser);
        });
        
        // Update health UI when water/medication changes
        this.state.subscribe('waterGlasses', () => {
            this.updateWaterTracker();
        });
        
        this.state.subscribe('medicationStatus', () => {
            this.updateMedicationTracker();
        });
    }
    
    /**
     * Render the tasks interface (now handled by components)
     */
    render() {
        if (!this.isInitialized) return;
        
        debug(DEBUG_PREFIXES.CORE, 'Refreshing component rendering...');
        
        // The component system handles rendering automatically through state changes
        // This method is kept for backward compatibility but most rendering
        // is now reactive through state subscriptions in components
        
        if (this.components.layout && this.components.layout.isRendered) {
            // Components will auto-update through state subscriptions
            debug(DEBUG_PREFIXES.CORE, 'Components auto-updating via state');
        }
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
            
            // Refresh if already initialized
            if (this.isInitialized) {
                this.render();
                this.updateStats();
            } else {
                // Initialize if not yet done
                this.init();
            }
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
    
    // Public API methods (for backward compatibility)
    
    addTask(text = null) {
        if (text === null) {
            // Called from UI button
            const input = document.getElementById('taskInput');
            if (!input) return;
            text = input.value.trim();
            if (!text) return;
            input.value = '';
        }
        
        return this.services.task.addTask(text, this.state.get('currentUser'));
    }
    
    toggleTask(taskId) {
        return this.services.task.toggleTask(taskId);
    }
    
    deleteTask(taskId) {
        return this.services.task.deleteTask(taskId);
    }
    
    switchUser(user, save = true) {
        return this.services.user.switchUser(user, save);
    }
    
    addWater() {
        return this.services.health.addWater();
    }
    
    resetWater() {
        return this.services.health.resetWater();
    }
    
    updateMedicationStatus(clickedElement = null) {
        if (clickedElement) {
            return this.services.health.updateMedicationFromElement(clickedElement);
        } else {
            return this.services.health.updateMedicationStatus();
        }
    }
    
    /**
     * Save data to storage
     */
    async saveData() {
        if (!this.isInitialized) return;
        
        try {
            await this.services.storage.saveAll(this.state.get());
            this.events.emit(EVENTS.STATE_SAVED);
        } catch (error) {
            debug(DEBUG_PREFIXES.CORE, 'Error saving data:', error);
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.isDestroyed) return;
        
        debug(DEBUG_PREFIXES.CORE, 'Destroying TasksCore');
        
        // Destroy components first
        if (this.components.layout) {
            this.components.layout.destroy();
        }
        
        // Destroy services
        Object.values(this.services).forEach(service => {
            if (service.destroy) {
                service.destroy();
            }
        });
        
        // Destroy subsystems
        if (this.state) {
            this.state.destroy();
        }
        if (this.events) {
            this.events.destroy();
        }
        
        // Clean up references
        this.services = {};
        this.components = {};
        this.isInitialized = false;
        this.isDestroyed = true;
    }
    
    // UI Helper Methods (will be moved to components in Phase 3)
    
    // Temporary UI methods (to be moved to components in Phase 3)
    
    generateHTML() {
        const currentUser = this.state.get('currentUser');
        const waterGlasses = this.state.get('waterGlasses');
        const maxWaterGlasses = this.state.get('maxWaterGlasses');
        
        // This is the same HTML generation logic from the original TasksPageManager
        // Will be moved to proper components in Phase 3
        return `
            <div class="tasks-page-container">
                <div class="container">
                    <div class="header">
                        <div class="header-left">
                            <h1 class="page-title">Task Manager</h1>
                            <div class="user-switcher">
                                <button class="user-btn ${currentUser === 'justin' ? 'active' : ''}" data-user="justin">Justin</button>
                                <button class="user-btn ${currentUser === 'brooke' ? 'active' : ''}" data-user="brooke">Brooke</button>
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
                    <div class="health-tracker-horizontal ${currentUser === 'justin' ? 'visible' : ''}" id="healthTrackerHorizontal">
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
                            <h2 class="panel-title">Active Tasks <span class="user-indicator" id="activeUserIndicator">${currentUser === 'justin' ? "Justin's" : "Brooke's"}</span></h2>
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
                        <div class="water-tracker-compact ${currentUser === 'justin' ? 'visible' : ''}" id="waterTracker">
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
                                        <span id="waterCount">${waterGlasses}</span>/8
                                    </div>
                                    <div class="water-compact-goal">glasses (64 oz)</div>
                                </div>
                                
                                <div class="water-mini-progress">
                                    <div class="water-mini-fill" id="waterProgress" style="width: ${(waterGlasses / maxWaterGlasses) * 100}%;"></div>
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
    
    renderTaskList(container, tasks, emptyMessage) {
        if (tasks.length === 0) {
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        } else {
            container.innerHTML = tasks.map((task, index) => `
                <div class="task-item" data-task-id="${task.id}" style="animation-delay: ${index * 50}ms">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-owner">${task.owner}</span>
                    <button class="delete-btn">Delete</button>
                </div>
            `).join('');
        }
    }
    
    createClickHandler() {
        return (e) => {
            // User button clicks
            const userBtn = e.target.closest('.user-btn');
            if (userBtn) {
                const user = userBtn.dataset.user;
                this.switchUser(user);
                return;
            }

            // Add task button
            if (e.target.closest('#addTaskBtn')) {
                this.addTask();
                return;
            }

            // Task checkbox
            const taskCheckbox = e.target.closest('.task-checkbox');
            if (taskCheckbox) {
                const taskItem = taskCheckbox.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.dataset.taskId;
                    this.toggleTask(taskId);
                }
                return;
            }

            // Delete task button
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const taskItem = deleteBtn.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.dataset.taskId;
                    this.deleteTask(taskId);
                }
                return;
            }

            // Medication checkboxes
            if (e.target.id === 'morningMed' || e.target.id === 'morningMedHorizontal') {
                this.updateMedicationStatus(e.target);
                return;
            }

            // Water actions
            if (e.target.closest('#addWaterBtn')) {
                this.addWater();
                return;
            }

            if (e.target.closest('#resetWaterBtn')) {
                this.resetWater();
                return;
            }

            // Individual water glass
            const miniGlass = e.target.closest('.mini-glass');
            if (miniGlass) {
                const index = Array.from(miniGlass.parentNode.children).indexOf(miniGlass);
                this.toggleGlass(index);
                return;
            }
        };
    }
    
    createKeypressHandler() {
        return (e) => {
            if (e.target.id === 'taskInput' && e.key === 'Enter') {
                this.addTask();
            }
        };
    }
    
    updateUserInterface(newUser) {
        // Update UI elements
        document.querySelectorAll('.user-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.user === newUser);
        });

        const activeUserIndicator = document.getElementById('activeUserIndicator');
        if (activeUserIndicator) {
            activeUserIndicator.textContent = newUser === 'justin' ? "Justin's" : "Brooke's";
        }

        // Show/hide health trackers
        const waterTracker = document.getElementById('waterTracker');
        const healthTrackerHorizontal = document.getElementById('healthTrackerHorizontal');
        
        if (newUser === 'justin') {
            if (healthTrackerHorizontal) {
                healthTrackerHorizontal.classList.add('visible');
            }
            if (waterTracker) {
                waterTracker.classList.remove('visible');
            }
        } else {
            if (healthTrackerHorizontal) {
                healthTrackerHorizontal.classList.remove('visible');
            }
            if (waterTracker) {
                waterTracker.classList.remove('visible');
            }
        }

        this.render();
        this.updateStats();
    }
    
    updateStats() {
        // Stats are now automatically updated by components through state subscriptions
        debug(DEBUG_PREFIXES.CORE, 'Stats update requested - handled by components');
    }
    
    initializeHealthTrackers() {
        this.initWaterGlasses('waterGlasses');
        this.initWaterGlasses('waterGlassesHorizontal');
        this.updateWaterTracker();
        this.updateMedicationTracker();
    }
    
    initWaterGlasses(containerId) {
        const waterGlassesDiv = document.getElementById(containerId);
        if (!waterGlassesDiv) return;

        const waterGlasses = this.state.get('waterGlasses');
        const maxWaterGlasses = this.state.get('maxWaterGlasses');
        
        waterGlassesDiv.innerHTML = '';

        for (let i = 0; i < maxWaterGlasses; i++) {
            const glass = document.createElement('button');
            glass.className = `mini-glass ${i < waterGlasses ? 'filled' : ''}`;
            glass.innerHTML = i < waterGlasses ? '💧' : '○';
            glass.style.animationDelay = `${i * 30}ms`;
            waterGlassesDiv.appendChild(glass);
        }
    }
    
    updateWaterTracker() {
        const waterGlasses = this.state.get('waterGlasses');
        const maxWaterGlasses = this.state.get('maxWaterGlasses');
        const percentage = (waterGlasses / maxWaterGlasses) * 100;
        
        const progressBar = document.getElementById('waterProgress');
        const waterCount = document.getElementById('waterCount');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (waterCount) {
            waterCount.textContent = waterGlasses;
        }
        
        // Update glasses display
        this.initWaterGlasses('waterGlasses');
        this.initWaterGlasses('waterGlassesHorizontal');
    }
    
    updateMedicationTracker() {
        const medicationStatus = this.state.get('medicationStatus');
        
        const morningMed = document.getElementById('morningMed');
        const morningMedHorizontal = document.getElementById('morningMedHorizontal');
        
        if (morningMed) morningMed.checked = medicationStatus.morning;
        if (morningMedHorizontal) morningMedHorizontal.checked = medicationStatus.morning;
        
        const statusText = medicationStatus.morning ? 'Complete' : 'Pending';
        const statusClass = `medication-status ${medicationStatus.morning ? 'complete' : 'pending'}`;
        
        const statusElement = document.getElementById('medStatus');
        const statusElementHorizontal = document.getElementById('medStatusHorizontal');
        
        if (statusElement) {
            statusElement.textContent = statusText;
            statusElement.className = statusClass;
        }
        if (statusElementHorizontal) {
            statusElementHorizontal.textContent = statusText;
            statusElementHorizontal.className = statusClass;
        }
    }
    
    toggleGlass(index) {
        return this.services.health.setWaterToGlass(index);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
