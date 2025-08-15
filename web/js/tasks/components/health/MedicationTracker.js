/**
 * Medication Tracker Component
 * Handles medication status tracking with visual feedback
 */

import { BaseComponent } from '../BaseComponent.js';
import { MEDICATION_CONFIG } from '../../utils/TasksConstants.js';

/**
 * MedicationTracker - Medication status tracking component
 */
export class MedicationTracker extends BaseComponent {
    constructor(config) {
        super({
            className: 'medication-section',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.medicationStatus = config.medicationStatus || { morning: false };
        this.layout = config.layout || 'vertical'; // 'vertical' or 'horizontal'
        this.showStatus = config.showStatus !== false;
    }
    
    /**
     * Generate HTML for medication tracker
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
        const statusText = this.getStatusText();
        const statusClass = this.getStatusClass();
        
        return `
            <div class="health-section">
                <div class="health-section-title">
                    <span>💊</span>
                    <span>Medication</span>
                    ${this.showStatus ? `<span class="medication-status ${statusClass}" id="medStatusHorizontal">${statusText}</span>` : ''}
                </div>
                <div class="medication-items">
                    <label class="med-item">
                        <input type="checkbox" 
                               class="med-checkbox" 
                               id="morningMedHorizontal"
                               ${this.medicationStatus.morning ? 'checked' : ''}>
                        <span class="med-time">Morning</span>
                        <span class="med-icon">🌅</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate vertical layout (for sidebar)
     */
    generateVerticalLayout() {
        const statusText = this.getStatusText();
        const statusClass = this.getStatusClass();
        
        return `
            <div class="medication-section">
                <div class="medication-header">
                    <span class="medication-label">💊 Medication</span>
                    ${this.showStatus ? `<span class="medication-status ${statusClass}" id="medStatus">${statusText}</span>` : ''}
                </div>
                <div class="medication-items">
                    <label class="med-item">
                        <input type="checkbox" 
                               class="med-checkbox" 
                               id="morningMed"
                               ${this.medicationStatus.morning ? 'checked' : ''}>
                        <span class="med-time">Morning</span>
                        <span class="med-icon">🌅</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Medication checkbox changes
        this.addEventListener('change', (e) => {
            const checkbox = e.target.closest('.med-checkbox');
            if (checkbox) {
                this.updateMedicationStatus(checkbox);
            }
        });
        
        // Prevent label clicks from triggering twice
        this.addEventListener('click', (e) => {
            const medItem = e.target.closest('.med-item');
            if (medItem && !e.target.matches('.med-checkbox')) {
                e.preventDefault();
                const checkbox = medItem.querySelector('.med-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.updateMedicationStatus(checkbox);
                }
            }
        });
    }
    
    /**
     * Update medication status from checkbox
     * @param {HTMLElement} checkbox - Checkbox element
     */
    updateMedicationStatus(checkbox) {
        const medicationType = this.getMedicationTypeFromCheckbox(checkbox);
        const isChecked = checkbox.checked;
        
        // Update local state
        this.medicationStatus[medicationType] = isChecked;
        
        // Update through service
        if (this.services.health) {
            this.services.health.updateMedicationFromElement(checkbox);
        }
        
        // Update status display
        this.updateStatusDisplay();
        
        // Show feedback
        this.showMedicationFeedback(medicationType, isChecked);
        
        this.emit('medication:updated', { 
            type: medicationType, 
            taken: isChecked,
            status: this.medicationStatus
        });
    }
    
    /**
     * Get medication type from checkbox element
     * @param {HTMLElement} checkbox - Checkbox element
     * @returns {string} Medication type
     */
    getMedicationTypeFromCheckbox(checkbox) {
        if (checkbox.id === 'morningMed' || checkbox.id === 'morningMedHorizontal') {
            return 'morning';
        }
        return 'morning'; // Default
    }
    
    /**
     * Update status display
     */
    updateStatusDisplay() {
        const statusText = this.getStatusText();
        const statusClass = this.getStatusClass();
        
        // Update both vertical and horizontal status elements
        const statusElements = [
            this.$('#medStatus'),
            this.$('#medStatusHorizontal')
        ].filter(Boolean);
        
        statusElements.forEach(element => {
            element.textContent = statusText;
            element.className = `medication-status ${statusClass}`;
        });
    }
    
    /**
     * Get status text based on current medication status
     * @returns {string} Status text
     */
    getStatusText() {
        return this.medicationStatus.morning 
            ? MEDICATION_CONFIG.STATUS.COMPLETE 
            : MEDICATION_CONFIG.STATUS.PENDING;
    }
    
    /**
     * Get status CSS class
     * @returns {string} CSS class name
     */
    getStatusClass() {
        return this.medicationStatus.morning ? 'complete' : 'pending';
    }
    
    /**
     * Show medication feedback animation
     * @param {string} medicationType - Type of medication
     * @param {boolean} taken - Whether medication was taken
     */
    showMedicationFeedback(medicationType, taken) {
        const checkbox = this.getMedicationCheckbox(medicationType);
        if (checkbox) {
            // Add visual feedback
            const feedbackClass = taken ? 'med-taken' : 'med-skipped';
            checkbox.classList.add(feedbackClass);
            
            setTimeout(() => {
                checkbox.classList.remove(feedbackClass);
            }, 500);
        }
        
        // Show completion celebration if all medications are taken
        if (this.isAllMedicationComplete()) {
            this.showCompletionCelebration();
        }
    }
    
    /**
     * Get medication checkbox element
     * @param {string} medicationType - Type of medication
     * @returns {HTMLElement} Checkbox element
     */
    getMedicationCheckbox(medicationType) {
        if (medicationType === 'morning') {
            return this.$('#morningMed') || this.$('#morningMedHorizontal');
        }
        return null;
    }
    
    /**
     * Check if all medications are complete
     * @returns {boolean} True if all medications are taken
     */
    isAllMedicationComplete() {
        // Currently only morning medication, expand as needed
        return this.medicationStatus.morning;
    }
    
    /**
     * Show completion celebration
     */
    showCompletionCelebration() {
        this.addClass('all-complete');
        
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.className = 'medication-celebration';
        celebration.innerHTML = '✅ All medications taken!';
        
        if (this.element) {
            this.element.appendChild(celebration);
            
            setTimeout(() => {
                celebration.remove();
                this.removeClass('all-complete');
            }, 3000);
        }
        
        this.emit('medication:all:complete', this.medicationStatus);
    }
    
    /**
     * Update medication status
     * @param {Object} newStatus - New medication status
     */
    updateMedicationStatus(newStatus) {
        this.medicationStatus = { ...this.medicationStatus, ...newStatus };
        
        // Update checkboxes
        Object.entries(this.medicationStatus).forEach(([type, taken]) => {
            const checkbox = this.getMedicationCheckbox(type);
            if (checkbox) {
                checkbox.checked = taken;
            }
        });
        
        // Update status display
        this.updateStatusDisplay();
        
        this.emit('medication:status:updated', this.medicationStatus);
    }
    
    /**
     * Reset all medication status
     */
    resetMedicationStatus() {
        const resetStatus = { morning: false };
        this.updateMedicationStatus(resetStatus);
        
        this.emit('medication:reset');
    }
    
    /**
     * Get completion percentage
     * @returns {number} Completion percentage (0-100)
     */
    getCompletionPercentage() {
        const totalMeds = Object.keys(this.medicationStatus).length;
        const takenMeds = Object.values(this.medicationStatus).filter(Boolean).length;
        
        return totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
    }
    
    /**
     * Get medication summary
     * @returns {Object} Medication summary
     */
    getMedicationSummary() {
        return {
            status: this.medicationStatus,
            completionPercentage: this.getCompletionPercentage(),
            isComplete: this.isAllMedicationComplete(),
            statusText: this.getStatusText(),
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * Enable/disable medication interactions
     * @param {boolean} enabled - Whether interactions should be enabled
     */
    setInteractive(enabled) {
        this.$$('.med-checkbox').forEach(checkbox => {
            checkbox.disabled = !enabled;
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
        
        // Subscribe to medication status changes
        if (this.state) {
            this.subscribeToState('medicationStatus', (status) => {
                this.updateMedicationStatus(status);
            });
        }
    }
}