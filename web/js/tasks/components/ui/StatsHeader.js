/**
 * Stats Header Component
 * Displays task statistics in header with real-time updates
 */

import { BaseComponent } from '../BaseComponent.js';

/**
 * StatsHeader - Statistics display component
 */
export class StatsHeader extends BaseComponent {
    constructor(config) {
        super({
            className: 'header-stats',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.stats = config.stats || {
            totalActive: 0,
            justinCount: 0,
            brookeCount: 0,
            completedCount: 0
        };
        
        this.showAnimations = config.showAnimations !== false;
    }
    
    /**
     * Generate HTML for stats header
     */
    generateHTML() {
        return `
            <div class="header-stats">
                <div class="stat-item-header">
                    <div class="stat-value-header" id="totalTasksHeader">${this.stats.totalActive}</div>
                    <div class="stat-label-header">Total</div>
                </div>
                <div class="stat-item-header">
                    <div class="stat-value-header" id="justinTasksHeader">${this.stats.justinCount}</div>
                    <div class="stat-label-header">Justin</div>
                </div>
                <div class="stat-item-header">
                    <div class="stat-value-header" id="brookeTasksHeader">${this.stats.brookeCount}</div>
                    <div class="stat-label-header">Brooke</div>
                </div>
                <div class="stat-item-header">
                    <div class="stat-value-header" id="completedCountHeader">${this.stats.completedCount}</div>
                    <div class="stat-label-header">Done</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update statistics
     * @param {Object} newStats - New statistics object
     */
    updateStats(newStats) {
        const prevStats = { ...this.stats };
        this.stats = { ...this.stats, ...newStats };
        
        // Update individual stat values with animation
        this.updateStatValue('totalTasksHeader', this.stats.totalActive, prevStats.totalActive);
        this.updateStatValue('justinTasksHeader', this.stats.justinCount, prevStats.justinCount);
        this.updateStatValue('brookeTasksHeader', this.stats.brookeCount, prevStats.brookeCount);
        this.updateStatValue('completedCountHeader', this.stats.completedCount, prevStats.completedCount);
        
        // Emit event for external listeners
        this.emit('stats:updated', this.stats);
    }
    
    /**
     * Update individual stat value with animation
     * @param {string} elementId - Element ID to update
     * @param {number} newValue - New value
     * @param {number} oldValue - Previous value
     */
    updateStatValue(elementId, newValue, oldValue) {
        const element = this.$(`#${elementId}`);
        if (!element) return;
        
        // Update value
        element.textContent = newValue;
        
        // Add animation if value changed and animations are enabled
        if (this.showAnimations && newValue !== oldValue) {
            this.animateValueChange(element, newValue > oldValue);
        }
    }
    
    /**
     * Animate value change
     * @param {HTMLElement} element - Element to animate
     * @param {boolean} isIncrease - Whether the value increased
     */
    animateValueChange(element, isIncrease) {
        // Remove any existing animation classes
        element.classList.remove('stat-increase', 'stat-decrease', 'stat-pulse');
        
        // Add appropriate animation class
        const animationClass = isIncrease ? 'stat-increase' : 'stat-decrease';
        element.classList.add(animationClass);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 300);
    }
    
    /**
     * Pulse a specific stat for attention
     * @param {string} statType - Type of stat ('total', 'justin', 'brooke', 'completed')
     */
    pulseStats(statType) {
        const elementMap = {
            total: 'totalTasksHeader',
            justin: 'justinTasksHeader',
            brooke: 'brookeTasksHeader',
            completed: 'completedCountHeader'
        };
        
        const elementId = elementMap[statType];
        if (elementId) {
            const element = this.$(`#${elementId}`);
            if (element) {
                element.classList.add('stat-pulse');
                setTimeout(() => {
                    element.classList.remove('stat-pulse');
                }, 600);
            }
        }
    }
    
    /**
     * Highlight stats based on achievements
     */
    highlightAchievements() {
        // Highlight if all tasks are completed
        if (this.stats.totalActive === 0 && this.stats.completedCount > 0) {
            this.pulseStats('completed');
        }
        
        // Highlight if one user has significantly more tasks
        const totalUserTasks = this.stats.justinCount + this.stats.brookeCount;
        if (totalUserTasks > 0) {
            const justinRatio = this.stats.justinCount / totalUserTasks;
            const brookeRatio = this.stats.brookeCount / totalUserTasks;
            
            if (justinRatio > 0.7) {
                this.pulseStats('justin');
            } else if (brookeRatio > 0.7) {
                this.pulseStats('brooke');
            }
        }
    }
    
    /**
     * Get completion percentage
     * @returns {number} Completion percentage (0-100)
     */
    getCompletionPercentage() {
        const total = this.stats.totalActive + this.stats.completedCount;
        return total > 0 ? Math.round((this.stats.completedCount / total) * 100) : 0;
    }
    
    /**
     * Get productivity summary
     * @returns {Object} Productivity summary
     */
    getProductivitySummary() {
        const total = this.stats.totalActive + this.stats.completedCount;
        const completionRate = this.getCompletionPercentage();
        
        return {
            totalTasks: total,
            activeTasks: this.stats.totalActive,
            completedTasks: this.stats.completedCount,
            completionRate,
            justinTasks: this.stats.justinCount,
            brookeTasks: this.stats.brookeCount,
            isAllComplete: this.stats.totalActive === 0 && this.stats.completedCount > 0,
            isBalanced: Math.abs(this.stats.justinCount - this.stats.brookeCount) <= 1
        };
    }
    
    /**
     * Reset all stats to zero
     */
    resetStats() {
        this.updateStats({
            totalActive: 0,
            justinCount: 0,
            brookeCount: 0,
            completedCount: 0
        });
    }
    
    /**
     * Bind to state changes for automatic updates
     */
    onRender() {
        super.onRender();
        
        // Subscribe to task changes for automatic updates
        if (this.state) {
            this.subscribeToState('tasks', () => {
                this.refreshStats();
            });
            
            this.subscribeToState('currentUser', () => {
                this.refreshStats();
            });
        }
    }
    
    /**
     * Refresh stats from service
     */
    refreshStats() {
        if (this.services.stats) {
            const newStats = this.services.stats.calculateCurrentUserStats();
            this.updateStats(newStats);
        }
    }
    
    /**
     * Set whether animations are enabled
     * @param {boolean} enabled - Whether animations should be enabled
     */
    setAnimationsEnabled(enabled) {
        this.showAnimations = enabled;
        
        if (enabled) {
            this.removeClass('no-animations');
        } else {
            this.addClass('no-animations');
        }
    }
}