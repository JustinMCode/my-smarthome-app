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
        console.log('WaterTracker: Setting up event listeners, health service available:', !!this.services?.health);
        
        // Individual glass clicks
        this.addEventListener('click', (e) => {
            const glassBtn = e.target.closest('.mini-glass');
            if (glassBtn) {
                const index = parseInt(glassBtn.dataset.glassIndex);
                console.log('WaterTracker: Glass clicked:', { 
                    index, 
                    displayNumber: index + 1,
                    currentGlasses: this.currentGlasses,
                    maxGlasses: this.maxGlasses
                });
                this.toggleGlass(index);
            }
        });
        
        // Control buttons (if enabled)
        if (this.showControls) {
            const addBtn = this.$('#addWaterBtn');
            const resetBtn = this.$('#resetWaterBtn');
            
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    console.log('WaterTracker: Add water button clicked');
                    this.addWater();
                });
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    console.log('WaterTracker: Reset water button clicked');
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
        console.log('WaterTracker: toggleGlass called with index:', index);
        
        // Calculate the target water count based on the clicked glass
        let targetWater;
        if (index < this.currentGlasses) {
            // Clicking on a filled glass - remove it and all glasses after it
            targetWater = index;
        } else {
            // Clicking on an empty glass - fill up to that glass (inclusive)
            // Index 0 = 1 glass, Index 1 = 2 glasses, etc.
            targetWater = index + 1;
        }
        
        console.log('WaterTracker: Calculated targetWater:', targetWater, 'from index:', index);
        
        // Always update locally first for immediate feedback
        this.updateWaterCount(targetWater);
        
        // Then sync with the health service if available
        if (this.services?.health?.setWaterToGlass) {
            console.log('WaterTracker: Syncing with health service, passing index:', index);
            try {
                // Pass the clicked glass index directly
                // The service will interpret this as "fill up to and including this glass"
                // Clicking glass 0 = fill to glass 0 = 1 glass total
                // Clicking glass 1 = fill to glass 1 = 2 glasses total
                this.services.health.setWaterToGlass(index);
            } catch (error) {
                console.error('WaterTracker: Error calling health service:', error);
            }
        }
        
        this.emit('water:glass:toggled', { index, targetWater, currentGlasses: this.currentGlasses });
    }
    
    /**
     * Add a glass of water
     */
    addWater() {
        const newCount = Math.min(this.currentGlasses + 1, this.maxGlasses);
        console.log('WaterTracker: addWater - current:', this.currentGlasses, 'new:', newCount);
        
        // Update locally first for immediate feedback
        this.updateWaterCount(newCount);
        
        // Then sync with health service if available
        if (this.services?.health) {
            try {
                if (this.services.health.addWater) {
                    this.services.health.addWater();
                } else if (this.services.health.setWaterToGlass) {
                    // Pass the index of the last glass to fill
                    // For 1 glass, pass index 0
                    // For 2 glasses, pass index 1
                    const lastGlassIndex = newCount > 0 ? newCount - 1 : 0;
                    console.log('WaterTracker: Using setWaterToGlass with index:', lastGlassIndex);
                    this.services.health.setWaterToGlass(lastGlassIndex);
                }
            } catch (error) {
                console.error('WaterTracker: Error calling health service:', error);
            }
        }
        
        this.emit('water:added', { currentGlasses: this.currentGlasses });
    }
    
    /**
     * Reset water count
     */
    resetWater() {
        if (confirm('Reset water tracking for today?')) {
            // Update locally first for immediate feedback
            this.updateWaterCount(0);
            
            // Then sync with health service if available
            if (this.services?.health) {
                try {
                    if (this.services.health.resetWater) {
                        this.services.health.resetWater();
                    } else if (this.services.health.setWaterToGlass) {
                        // Pass -1 or a special value to indicate no glasses filled
                        console.log('WaterTracker: Resetting via setWaterToGlass with -1');
                        this.services.health.setWaterToGlass(-1);
                    }
                } catch (error) {
                    console.error('WaterTracker: Error calling health service:', error);
                }
            }
            
            this.emit('water:reset');
        }
    }
    
    /**
     * Update water count
     * @param {number} glasses - New glass count
     */
    updateWaterCount(glasses) {
        console.log('WaterTracker: updateWaterCount called with:', glasses, 'current:', this.currentGlasses);
        
        if (glasses !== this.currentGlasses) {
            const oldCount = this.currentGlasses;
            this.currentGlasses = Math.max(0, Math.min(glasses, this.maxGlasses));
            
            console.log('WaterTracker: Updated currentGlasses from', oldCount, 'to', this.currentGlasses);
            
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
        console.log('WaterTracker: updateGlassDisplay called, currentGlasses:', this.currentGlasses);
        
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
                console.log('WaterTracker: State subscription received waterGlasses:', glasses);
                this.updateWaterCount(glasses);
            });
            
            this.subscribeToState('maxWaterGlasses', (maxGlasses) => {
                console.log('WaterTracker: State subscription received maxWaterGlasses:', maxGlasses);
                this.setMaxGlasses(maxGlasses);
            });
        }
    }
}