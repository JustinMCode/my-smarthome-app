/**
 * Water Tracker Component
 * Handles water intake tracking with visual progress and interaction
 */

import { BaseComponent } from '../BaseComponent.js';
import { WATER_CONFIG } from '../../utils/TasksConstants.js';

/**
 * WaterTracker - Water intake tracking component
 */
export class WaterTracker extends BaseComponent {
    constructor(config) {
        super({
            className: 'water-section',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.currentGlasses = config.currentGlasses || 0;
        this.maxGlasses = config.maxGlasses || WATER_CONFIG.MAX_GLASSES;
        this.layout = config.layout || 'vertical'; // 'vertical' or 'horizontal'
        this.showControls = config.showControls !== false;
        this.showProgress = config.showProgress !== false;
    }
    
    /**
     * Generate HTML for water tracker
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
            <div class="health-section">
                <div class="health-section-title">
                    <span>💧</span>
                    <span>Hydration</span>
                </div>
                <div class="water-glasses-horizontal" id="waterGlassesHorizontal">
                    ${this.generateWaterGlasses()}
                </div>
            </div>
        `;
    }
    
    /**
     * Generate vertical layout (for sidebar)
     */
    generateVerticalLayout() {
        const percentage = Math.round((this.currentGlasses / this.maxGlasses) * 100);
        
        return `
            <div class="water-section">
                <div class="water-inner-header">
                    <div class="water-compact-subtitle">💧 Hydration</div>
                    <div class="water-compact-count">
                        <span id="waterCount">${this.currentGlasses}</span>/${this.maxGlasses}
                    </div>
                    <div class="water-compact-goal">glasses (${WATER_CONFIG.TARGET_OUNCES} oz)</div>
                </div>
                
                ${this.showProgress ? `
                <div class="water-mini-progress">
                    <div class="water-mini-fill" id="waterProgress" style="width: ${percentage}%;"></div>
                </div>
                ` : ''}

                <div class="water-compact-glasses" id="waterGlasses">
                    ${this.generateWaterGlasses()}
                </div>

                ${this.showControls ? `
                <div class="water-compact-actions">
                    <button class="water-compact-btn" id="addWaterBtn">+ Add</button>
                    <button class="water-compact-btn" id="resetWaterBtn">Reset</button>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Generate water glass elements
     */
    generateWaterGlasses() {
        let glassesHTML = '';
        
        for (let i = 0; i < this.maxGlasses; i++) {
            const isFilled = i < this.currentGlasses;
            const glassClass = `mini-glass ${isFilled ? 'filled' : ''}`;
            const glassContent = isFilled ? '💧' : '○';
            const animationDelay = i * 30;
            
            glassesHTML += `
                <button class="${glassClass}" 
                        data-glass-index="${i}"
                        style="animation-delay: ${animationDelay}ms"
                        title="${isFilled ? 'Remove glass' : 'Add glass'}"
                        aria-label="Glass ${i + 1} of ${this.maxGlasses}">
                    ${glassContent}
                </button>
            `;
        }
        
        return glassesHTML;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Individual glass clicks
        this.addEventListener('click', (e) => {
            const glassBtn = e.target.closest('.mini-glass');
            if (glassBtn) {
                const index = parseInt(glassBtn.dataset.glassIndex);
                this.toggleGlass(index);
            }
        });
        
        // Control buttons (if enabled)
        if (this.showControls) {
            const addBtn = this.$('#addWaterBtn');
            const resetBtn = this.$('#resetWaterBtn');
            
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.addWater();
                });
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetWater();
                });
            }
        }
    }
    
    /**
     * Toggle glass at specific index
     * @param {number} index - Glass index (0-based)
     */
    toggleGlass(index) {
        if (this.services.health) {
            this.services.health.setWaterToGlass(index);
        }
        
        this.emit('water:glass:toggled', { index, currentGlasses: this.currentGlasses });
    }
    
    /**
     * Add a glass of water
     */
    addWater() {
        if (this.services.health) {
            this.services.health.addWater();
        }
        
        this.emit('water:added', { currentGlasses: this.currentGlasses });
    }
    
    /**
     * Reset water count
     */
    resetWater() {
        if (confirm('Reset water tracking for today?')) {
            if (this.services.health) {
                this.services.health.resetWater();
            }
            
            this.emit('water:reset');
        }
    }
    
    /**
     * Update water count
     * @param {number} glasses - New glass count
     */
    updateWaterCount(glasses) {
        if (glasses !== this.currentGlasses) {
            const oldCount = this.currentGlasses;
            this.currentGlasses = Math.max(0, Math.min(glasses, this.maxGlasses));
            
            // Update UI
            this.updateGlassDisplay();
            this.updateProgress();
            this.updateCounter();
            
            // Show achievement feedback
            if (this.currentGlasses >= this.maxGlasses && oldCount < this.maxGlasses) {
                this.showGoalAchieved();
            }
            
            this.emit('water:updated', { 
                current: this.currentGlasses, 
                previous: oldCount,
                goalAchieved: this.currentGlasses >= this.maxGlasses
            });
        }
    }
    
    /**
     * Update glass visual display
     */
    updateGlassDisplay() {
        this.$$('.mini-glass').forEach((glass, index) => {
            const isFilled = index < this.currentGlasses;
            
            glass.classList.toggle('filled', isFilled);
            glass.innerHTML = isFilled ? '💧' : '○';
            glass.title = isFilled ? 'Remove glass' : 'Add glass';
        });
    }
    
    /**
     * Update progress bar
     */
    updateProgress() {
        if (!this.showProgress) return;
        
        const progressBar = this.$('#waterProgress');
        if (progressBar) {
            const percentage = Math.round((this.currentGlasses / this.maxGlasses) * 100);
            progressBar.style.width = `${percentage}%`;
            
            // Add visual feedback for progress changes
            progressBar.classList.add('updating');
            setTimeout(() => {
                progressBar.classList.remove('updating');
            }, 300);
        }
    }
    
    /**
     * Update counter display
     */
    updateCounter() {
        const counterElement = this.$('#waterCount');
        if (counterElement) {
            counterElement.textContent = this.currentGlasses;
            
            // Add brief animation
            counterElement.classList.add('updated');
            setTimeout(() => {
                counterElement.classList.remove('updated');
            }, 300);
        }
    }
    
    /**
     * Show goal achieved animation
     */
    showGoalAchieved() {
        this.addClass('goal-achieved');
        
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.className = 'water-celebration';
        celebration.innerHTML = '🎉 Daily goal achieved! 🎉';
        
        if (this.element) {
            this.element.appendChild(celebration);
            
            setTimeout(() => {
                celebration.remove();
                this.removeClass('goal-achieved');
            }, 3000);
        }
        
        this.emit('water:goal:achieved', { glasses: this.currentGlasses });
    }
    
    /**
     * Get current progress information
     * @returns {Object} Progress information
     */
    getProgress() {
        return {
            current: this.currentGlasses,
            target: this.maxGlasses,
            percentage: Math.round((this.currentGlasses / this.maxGlasses) * 100),
            remaining: Math.max(0, this.maxGlasses - this.currentGlasses),
            goalAchieved: this.currentGlasses >= this.maxGlasses,
            totalOunces: this.currentGlasses * WATER_CONFIG.OUNCES_PER_GLASS
        };
    }
    
    /**
     * Set maximum glasses
     * @param {number} max - Maximum number of glasses
     */
    setMaxGlasses(max) {
        this.maxGlasses = Math.max(1, max);
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    /**
     * Enable/disable interactions
     * @param {boolean} enabled - Whether interactions should be enabled
     */
    setInteractive(enabled) {
        this.$$('.mini-glass, .water-compact-btn').forEach(element => {
            element.disabled = !enabled;
        });
        
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
        
        // Subscribe to water state changes
        if (this.state) {
            this.subscribeToState('waterGlasses', (glasses) => {
                this.updateWaterCount(glasses);
            });
            
            this.subscribeToState('maxWaterGlasses', (maxGlasses) => {
                this.setMaxGlasses(maxGlasses);
            });
        }
    }
}