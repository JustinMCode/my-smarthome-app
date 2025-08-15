/**
 * Sidebar Manager - Light Open Glassmorphism
 * Minimal, flowing design with subtle interactions
 * 
 * Expected HTML structure:
 * <div id="sidebar" class="sidebar">
 *   <div class="sidebar-clock">
 *     <div class="sidebar-time">12:00</div>
 *     <div class="sidebar-date">MON, JAN 1</div>
 *   </div>
 *   <div class="sidebar-weather">
 *     <div class="weather-info">
 *       <div id="weatherTemp" class="weather-temp">72°</div>
 *       <div id="weatherDesc" class="weather-desc">SUNNY</div>
 *     </div>
 *   </div>
 *   <div class="sidebar-tasks">...</div>
 *   <nav class="nav-menu">
 *     <div class="nav-item" data-view="dashboard">
 *       <span class="nav-icon">📊</span>
 *       <span>Dashboard</span>
 *     </div>
 *     ...
 *   </nav>
 * </div>
 */

import { CONFIG, debug } from '../constants/config.js';

export class SidebarManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.clockUpdateInterval = null;
        this.isCollapsed = false;
        this.currentTheme = 'day';
    }
    
    /**
     * Initialize the sidebar manager
     */
    init() {
        debug('Initializing Light Open Glassmorphism Sidebar...');
        
        this.setupEventListeners();
        this.initTaskSection();
        this.updateClock();
        this.startUpdates();
        this.applyLightTheme();
        this.initMinimalEffects();
    }
    
    /**
     * Initialize task section
     */
    initTaskSection() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Check if tasks section already exists
        if (document.querySelector('.sidebar-tasks')) return;
        
        // Create tasks section
        const tasksSection = document.createElement('div');
        tasksSection.className = 'sidebar-tasks';
        tasksSection.innerHTML = `
            <div class="tasks-header">Tasks</div>
            <div class="task-list">
                <div class="task-item" data-task-id="1">
                    <div class="task-checkbox"></div>
                    <span class="task-text">Review dashboard metrics</span>
                </div>
                <div class="task-item" data-task-id="2">
                    <div class="task-checkbox"></div>
                    <span class="task-text">Update team calendar</span>
                </div>
                <div class="task-item" data-task-id="3">
                    <div class="task-checkbox"></div>
                    <span class="task-text">Prepare weekly report</span>
                </div>
            </div>
        `;
        
        // Insert after weather, before nav menu
        const weatherWidget = document.querySelector('.sidebar-weather');
        const navMenu = document.querySelector('.nav-menu');
        
        if (weatherWidget && navMenu) {
            weatherWidget.parentNode.insertBefore(tasksSection, navMenu);
        } else if (navMenu) {
            navMenu.parentNode.insertBefore(tasksSection, navMenu);
        } else {
            sidebar.appendChild(tasksSection);
        }
        
        // Add task interactions
        this.setupTaskInteractions();
    }
    
    /**
     * Setup task interactions
     */
    setupTaskInteractions() {
        document.querySelectorAll('.task-item').forEach(task => {
            task.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask(task);
            });
        });
    }
    
    /**
     * Toggle task completion
     */
    toggleTask(taskElement) {
        taskElement.classList.toggle('completed');
        
        // Add completion animation
        const checkbox = taskElement.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.style.animation = 'softPulse 0.3s ease';
            setTimeout(() => {
                checkbox.style.animation = '';
            }, 300);
        }
        
        // Update task count if needed
        this.updateTaskCount();
    }
    
    /**
     * Update task count
     */
    updateTaskCount() {
        const totalTasks = document.querySelectorAll('.task-item').length;
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        const remainingTasks = totalTasks - completedTasks;
        
        // You can add a task counter badge here if needed
        debug(`Tasks: ${completedTasks}/${totalTasks} completed`);
        
        // Optional: Add notification badge to a nav item
        if (remainingTasks > 0) {
            this.addNotificationBadge('tasks', remainingTasks);
        } else {
            this.addNotificationBadge('tasks', 0);
        }
    }
    
    /**
     * Add new task
     */
    addTask(taskText) {
        const taskList = document.querySelector('.task-list');
        if (!taskList) return;
        
        const taskId = Date.now();
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.dataset.taskId = taskId;
        taskItem.innerHTML = `
            <div class="task-checkbox"></div>
            <span class="task-text">${taskText}</span>
        `;
        
        // Add with animation
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-10px)';
        taskList.appendChild(taskItem);
        
        // Setup interaction
        taskItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTask(taskItem);
        });
        
        // Animate in
        setTimeout(() => {
            taskItem.style.transition = 'all 0.3s ease';
            taskItem.style.opacity = '1';
            taskItem.style.transform = 'translateX(0)';
        }, 10);
        
        this.updateTaskCount();
    }
    
    /**
     * Setup event listeners with minimal interactions
     */
    setupEventListeners() {
        // Clock widget - simple interaction
        const clockWidget = document.querySelector('.sidebar-clock');
        if (clockWidget) {
            clockWidget.addEventListener('click', () => {
                this.createSoftPulse(clockWidget);
                this.dashboard.showView('calendar');
                this.dashboard.managers.calendar?.navigate('today');
            });
        }
        

        
        // Navigation items - flowing interactions
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.createMinimalRipple(e, item);
                const view = item.dataset.view;
                if (view && this.dashboard.showView) {
                    this.dashboard.showView(view);
                }
            });
            
            // Add subtle color shift on hover
            item.addEventListener('mouseenter', () => {
                this.addSoftGlow(item);
            });
            
            item.addEventListener('mouseleave', () => {
                this.removeSoftGlow(item);
            });
        });
        
        // Setup sidebar toggle
        this.setupSidebarToggle();
        
        // Start light theme transitions
        this.startThemeTransitions();
    }
    
    /**
     * Create soft pulse effect
     */
    createSoftPulse(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'softPulse 0.4s ease';
        }, 10);
    }
    
    /**
     * Create minimal ripple effect
     */
    createMinimalRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(139, 92, 246, 0.15), 
                transparent
            );
            top: ${y - 10}px;
            left: ${x - 10}px;
            pointer-events: none;
            transform: scale(0);
            animation: minimalRipple 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    /**
     * Add soft glow on hover
     */
    addSoftGlow(element) {
        const icon = element.querySelector('.nav-icon');
        if (icon) {
            icon.style.transition = 'color 0.3s ease';
            icon.style.color = '#8b5cf6';
        }
    }
    
    /**
     * Remove soft glow
     */
    removeSoftGlow(element) {
        const icon = element.querySelector('.nav-icon');
        if (icon) {
            icon.style.color = '';
        }
    }
    
    /**
     * Initialize minimal visual effects
     */
    initMinimalEffects() {
        // Add CSS for minimal animations
        if (!document.getElementById('light-glass-effects')) {
            const style = document.createElement('style');
            style.id = 'light-glass-effects';
            style.textContent = `
                @keyframes minimalRipple {
                    to {
                        transform: scale(5);
                        opacity: 0;
                    }
                }
                
                @keyframes softPulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.03);
                        opacity: 0.9;
                    }
                }
                
                @keyframes gentleShimmer {
                    0% { 
                        background-position: -100% center;
                    }
                    100% { 
                        background-position: 200% center;
                    }
                }
                
                .loading-light {
                    position: relative;
                    overflow: hidden;
                }
                
                .loading-light::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 30%,
                        rgba(139, 92, 246, 0.05) 50%,
                        transparent 70%
                    );
                    background-size: 200% 100%;
                    animation: gentleShimmer 1.2s ease;
                }
                
                @keyframes subtleFade {
                    from { opacity: 0.5; }
                    to { opacity: 1; }
                }
                
                .fade-transition {
                    animation: subtleFade 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Setup sidebar toggle - minimal style
     */
    setupSidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        let toggleBtn = sidebar.querySelector('.sidebar-toggle');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle';
            toggleBtn.innerHTML = '◂';
            sidebar.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }
    
    /**
     * Toggle sidebar with smooth transition
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = sidebar?.querySelector('.sidebar-toggle');
        
        if (sidebar) {
            this.isCollapsed = !this.isCollapsed;
            
            sidebar.style.transition = 'width 0.3s ease';
            sidebar.classList.toggle('collapsed', this.isCollapsed);
            
            if (toggleBtn) {
                toggleBtn.innerHTML = this.isCollapsed ? '▸' : '◂';
            }
            
            debug(`Sidebar ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
        }
    }
    
    /**
     * Update clock display - clean and minimal
     */
    updateClock() {
        const timeElement = document.querySelector('.sidebar-time');
        const dateElement = document.querySelector('.sidebar-date');
        
        if (!timeElement || !dateElement) return;
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        const timeString = `${displayHours}:${minutes}`;
        
        // Smooth time update
        if (timeElement.textContent !== timeString) {
            timeElement.classList.add('fade-transition');
            timeElement.textContent = timeString;
            
            // Add small AM/PM indicator
            if (!timeElement.querySelector('.time-period')) {
                const period = document.createElement('span');
                period.className = 'time-period';
                period.style.cssText = 'font-size: 14px; margin-left: 4px; opacity: 0.6;';
                period.textContent = ampm;
                timeElement.appendChild(period);
            } else {
                timeElement.querySelector('.time-period').textContent = ampm;
            }
        }
        
        // Update date
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        if (dateElement.textContent !== dateString) {
            dateElement.textContent = dateString;
        }
    }
    

    
    /**
     * Apply light theme based on time
     */
    applyLightTheme() {
        const hour = new Date().getHours();
        let theme;
        
        if (hour >= 5 && hour < 9) theme = 'morning';
        else if (hour >= 9 && hour < 17) theme = 'day';
        else if (hour >= 17 && hour < 21) theme = 'evening';
        else theme = 'night';
        
        if (theme !== this.currentTheme) {
            this.currentTheme = theme;
            
            const container = document.querySelector('.dashboard-container');
            if (container) {
                // Remove all theme classes
                container.classList.remove('theme-morning', 'theme-day', 'theme-evening', 'theme-night');
                // Add new theme
                container.classList.add(`theme-${theme}`);
            }
            
            debug(`Applied light theme: ${theme}`);
        }
    }
    
    /**
     * Start theme transitions
     */
    startThemeTransitions() {
        // Check theme every 5 minutes
        setInterval(() => {
            this.applyLightTheme();
        }, 300000);
    }
    
    /**
     * Start all update intervals
     */
    startUpdates() {
        // Update clock every second
        this.clockUpdateInterval = setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    /**
     * Update active navigation - minimal style
     */
    updateActiveNav(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.view === viewName;
            
            if (isActive && !item.classList.contains('active')) {
                // Subtle activation
                item.style.animation = 'softPulse 0.3s ease';
                setTimeout(() => {
                    item.style.animation = '';
                }, 300);
            }
            
            item.classList.toggle('active', isActive);
        });
    }
    
    /**
     * Add notification badge - floating style
     */
    addNotificationBadge(viewName, count) {
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (!navItem) return;
        
        // Remove existing badge
        const existingBadge = navItem.querySelector('.nav-badge');
        if (existingBadge) {
            existingBadge.style.opacity = '0';
            existingBadge.style.transform = 'scale(0.5)';
            setTimeout(() => existingBadge.remove(), 200);
        }
        
        if (count > 0) {
            setTimeout(() => {
                const badge = document.createElement('span');
                badge.className = 'nav-badge';
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.opacity = '0';
                badge.style.transform = 'scale(0.5)';
                navItem.appendChild(badge);
                
                // Smooth entrance
                setTimeout(() => {
                    badge.style.transition = 'all 0.2s ease';
                    badge.style.opacity = '1';
                    badge.style.transform = 'scale(1)';
                }, 10);
            }, existingBadge ? 220 : 0);
        }
    }
    
    /**
     * Highlight nav item temporarily
     */
    highlightNavItem(viewName) {
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (!navItem) return;
        
        navItem.classList.add('loading-light');
        setTimeout(() => {
            navItem.classList.remove('loading-light');
        }, 1200);
    }
    
    /**
     * Show user info
     */
    showUserInfo(userName) {
        let userSection = document.querySelector('.sidebar-user');
        
        if (!userSection) {
            const sidebar = document.getElementById('sidebar');
            const footer = document.querySelector('.sidebar-footer') || 
                          document.createElement('div');
            footer.className = 'sidebar-footer';
            
            userSection = document.createElement('div');
            userSection.className = 'sidebar-user';
            userSection.innerHTML = `
                <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${userName}</div>
                    <div class="user-status">Active</div>
                </div>
            `;
            
            footer.appendChild(userSection);
            sidebar?.appendChild(footer);
        } else {
            const nameEl = userSection.querySelector('.user-name');
            const avatarEl = userSection.querySelector('.user-avatar');
            
            if (nameEl) nameEl.textContent = userName;
            if (avatarEl) avatarEl.textContent = userName.charAt(0).toUpperCase();
        }
    }
    
    /**
     * Get tasks
     */
    getTasks() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(task => {
            tasks.push({
                id: task.dataset.taskId,
                text: task.querySelector('.task-text').textContent,
                completed: task.classList.contains('completed')
            });
        });
        return tasks;
    }
    
    /**
     * Remove task
     */
    removeTask(taskId) {
        const task = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (task) {
            task.style.transition = 'all 0.3s ease';
            task.style.opacity = '0';
            task.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                task.remove();
                this.updateTaskCount();
            }, 300);
        }
    }
    
    /**
     * Load tasks from array
     */
    loadTasks(tasks) {
        const taskList = document.querySelector('.task-list');
        if (!taskList) return;
        
        // Clear existing tasks
        taskList.innerHTML = '';
        
        // Add new tasks
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.taskId = task.id || index;
            taskItem.innerHTML = `
                <div class="task-checkbox"></div>
                <span class="task-text">${task.text}</span>
            `;
            
            // Add with staggered animation
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateX(-10px)';
            taskList.appendChild(taskItem);
            
            // Setup interaction
            taskItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask(taskItem);
            });
            
            // Animate in
            setTimeout(() => {
                taskItem.style.transition = 'all 0.3s ease';
                taskItem.style.opacity = '1';
                taskItem.style.transform = 'translateX(0)';
            }, index * 50);
        });
        
        this.updateTaskCount();
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug('Destroying Light Open Glassmorphism Sidebar');
        
        if (this.clockUpdateInterval) {
            clearInterval(this.clockUpdateInterval);
        }
    }
}