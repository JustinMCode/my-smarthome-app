/**
 * Health Tracker Component
 * Container component that manages water and medication tracking
 */

import { BaseComponent } from '../BaseComponent.js';
import { WaterTracker } from './WaterTracker.js';
import { MedicationTracker } from './MedicationTracker.js';
import { USER_TYPES } from '../../utils/TasksConstants.js';

/**
 * HealthTracker - Health tracking container component
 */
export class HealthTracker extends BaseComponent {
    constructor(config) {
        super({
            className: 'health-tracker',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.currentUser = config.currentUser || USER_TYPES.JUSTIN;
        this.layout = config.layout || 'vertical'; // 'vertical' or 'horizontal'
        this.showDivider = config.showDivider !== false;
        this.waterConfig = config.waterConfig || {};
        this.medicationConfig = config.medicationConfig || {};
        
        // Child components
        this.waterTracker = null;
        this.medicationTracker = null;
    }
    
    /**
     * Generate HTML for health tracker
     */
    generateHTML() {
        if (this.layout === 'horizontal') {
            return this.generateHorizontalLayout();
        } else {
            return this.generateVerticalLayout();
        }
    }
    
    /**
     * Generate horizontal layout (for header area)
     */
    generateHorizontalLayout() {
        return `
            <div class="health-tracker-horizontal ${this.shouldShowForUser() ? 'visible' : ''}" 
                 id="healthTrackerHorizontal">
                <div class="health-horizontal-content">
                    <div id="medicationContainer"></div>
                    <div id="waterContainer"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate vertical layout (for sidebar)
     */
    generateVerticalLayout() {
        return `
            <div class="water-tracker-compact ${this.shouldShowForUser() ? 'visible' : ''}" 
                 id="waterTracker">
                <div class="water-compact-header">
                    <div class="water-compact-title">Daily Health</div>
                </div>
                
                <div id="medicationContainer"></div>
                
                ${this.showDivider ? '<div class="health-divider"></div>' : ''}
                
                <div id="waterContainer"></div>
            </div>
        `;
    }
    
    /**
     * Render component and child components
     */
    render(container = null) {
        const element = super.render(container);
        
        // Only render child components if health tracking is enabled for current user
        if (this.shouldShowForUser()) {
            this.renderChildComponents();
        }
        
        return element;
    }
    
    /**
     * Render child components
     */
    renderChildComponents() {
        const medicationContainer = this.$('#medicationContainer');
        const waterContainer = this.$('#waterContainer');
        
        if (medicationContainer) {
            this.medicationTracker = new MedicationTracker({
                layout: this.layout,
                services: this.services,
                events: this.events,
                state: this.state,
                ...this.medicationConfig
            });
            
            this.medicationTracker.render(medicationContainer);
            this.addChild('medication', this.medicationTracker);
        }
        
        if (waterContainer) {
            this.waterTracker = new WaterTracker({
                layout: this.layout,
                services: this.services,
                events: this.events,
                state: this.state,
                showControls: this.layout === 'vertical', // Only show controls in vertical layout
                showProgress: this.layout === 'vertical',
                ...this.waterConfig
            });
            
            this.waterTracker.render(waterContainer);
            this.addChild('water', this.waterTracker);
        }
        
        // Setup cross-component event handling
        this.setupHealthEventHandlers();
    }
    
    /**
     * Setup event handlers for health tracking
     */
    setupHealthEventHandlers() {
        // Listen for water events
        if (this.waterTracker) {
            this.waterTracker.addEventListener('water:goal:achieved', () => {
                this.showHealthMilestone('water');
            });
            
            this.waterTracker.addEventListener('water:updated', (data) => {
                this.emit('health:water:updated', data);
                this.checkOverallProgress();
            });
        }
        
        // Listen for medication events
        if (this.medicationTracker) {
            this.medicationTracker.addEventListener('medication:all:complete', () => {
                this.showHealthMilestone('medication');
            });
            
            this.medicationTracker.addEventListener('medication:updated', (data) => {
                this.emit('health:medication:updated', data);
                this.checkOverallProgress();
            });
        }
    }
    
    /**
     * Check overall health progress and show combined achievements
     */
    checkOverallProgress() {
        const waterProgress = this.waterTracker ? this.waterTracker.getProgress() : null;
        const medicationSummary = this.medicationTracker ? this.medicationTracker.getMedicationSummary() : null;
        
        if (waterProgress && medicationSummary) {
            const bothComplete = waterProgress.goalAchieved && medicationSummary.isComplete;
            
            if (bothComplete && !this.hasShownDailyComplete) {
                this.showDailyHealthComplete();
                this.hasShownDailyComplete = true;
            }
            
            this.emit('health:progress:updated', {
                water: waterProgress,
                medication: medicationSummary,
                overallComplete: bothComplete
            });
        }
    }
    
    /**
     * Show milestone achievement
     * @param {string} type - Type of milestone ('water' or 'medication')
     */
    showHealthMilestone(type) {
        this.addClass(`${type}-milestone`);
        
        const messages = {
            water: '💧 Hydration goal achieved!',
            medication: '💊 Medications complete!'
        };
        
        this.showNotification(messages[type], 'success');
        
        setTimeout(() => {
            this.removeClass(`${type}-milestone`);
        }, 3000);
    }
    
    /**
     * Show daily health completion celebration
     */
    showDailyHealthComplete() {
        this.addClass('daily-complete');
        
        // Create celebration overlay
        const celebration = document.createElement('div');
        celebration.className = 'health-celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-title">Daily Health Goals Complete!</div>
                <div class="celebration-subtitle">Great job taking care of yourself!</div>
            </div>
        `;
        
        if (this.element) {
            this.element.appendChild(celebration);
            
            setTimeout(() => {
                celebration.remove();
                this.removeClass('daily-complete');
            }, 5000);
        }
        
        this.emit('health:daily:complete');
    }
    
    /**
     * Show notification (basic implementation)
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // This could be enhanced to use a proper notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
        this.emit('health:notification', { message, type });
    }
    
    /**
     * Check if health tracking should show for current user
     * @returns {boolean} True if should show
     */
    shouldShowForUser() {
        // Currently only Justin has health tracking
        return this.currentUser === USER_TYPES.JUSTIN;
    }
    
    /**
     * Update current user and show/hide accordingly
     * @param {string} userId - New user ID
     */
    updateCurrentUser(userId) {
        this.currentUser = userId;
        
        if (this.shouldShowForUser()) {
            this.show();
        } else {
            this.hide();
        }
        
        this.emit('health:user:switched', { user: userId, visible: this.shouldShowForUser() });
    }
    
    /**
     * Get overall health summary
     * @returns {Object} Complete health summary
     */
    getHealthSummary() {
        const waterProgress = this.waterTracker ? this.waterTracker.getProgress() : null;
        const medicationSummary = this.medicationTracker ? this.medicationTracker.getMedicationSummary() : null;
        
        return {
            user: this.currentUser,
            water: waterProgress,
            medication: medicationSummary,
            overallComplete: waterProgress?.goalAchieved && medicationSummary?.isComplete,
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * Reset daily health tracking
     */
    resetDailyTracking() {
        if (this.waterTracker) {
            this.waterTracker.updateWaterCount(0);
        }
        
        if (this.medicationTracker) {
            this.medicationTracker.resetMedicationStatus();
        }
        
        this.hasShownDailyComplete = false;
        this.emit('health:daily:reset');
    }
    
    /**
     * Enable/disable health tracking interactions
     * @param {boolean} enabled - Whether interactions should be enabled
     */
    setInteractive(enabled) {
        if (this.waterTracker) {
            this.waterTracker.setInteractive(enabled);
        }
        
        if (this.medicationTracker) {
            this.medicationTracker.setInteractive(enabled);
        }
        
        if (enabled) {
            this.removeClass('disabled');
        } else {
            this.addClass('disabled');
        }
    }
    
    /**
     * Bind to state changes
     */
    onRender() {
        super.onRender();
        
        // Subscribe to user changes
        if (this.state) {
            this.subscribeToState('currentUser', (newUser) => {
                this.updateCurrentUser(newUser);
            });
        }
    }
    
    /**
     * Clean up child components
     */
    destroy() {
        if (this.waterTracker) {
            this.waterTracker.destroy();
        }
        
        if (this.medicationTracker) {
            this.medicationTracker.destroy();
        }
        
        super.destroy();
    }
}