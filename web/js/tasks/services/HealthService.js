/**
 * Health Service - Health Tracking Logic
 * Handles water intake and medication tracking business logic
 */

import { DEBUG_PREFIXES, EVENTS, WATER_CONFIG, MEDICATION_CONFIG } from '../utils/TasksConstants.js';
import { validateWaterTracking, validateMedicationStatus, getWaterIntakePercentage, 
         isWaterGoalAchieved, isMedicationComplete } from '../types/HealthTypes.js';
import { debug } from '../../constants/config.js';

/**
 * HealthService - Handles health tracking operations
 */
export class HealthService {
    constructor(state, events, config) {
        this.state = state;
        this.events = events;
        this.config = config;
        
        this.waterConfig = config.getWaterConfig();
        
        debug(DEBUG_PREFIXES.HEALTH, 'HealthService initialized');
    }
    
    /**
     * Add a glass of water
     * @returns {boolean} Success status
     */
    addWater() {
        debug(DEBUG_PREFIXES.HEALTH, 'Adding water glass');
        
        try {
            const currentWater = this.state.get('waterGlasses');
            const maxWater = this.state.get('maxWaterGlasses');
            
            if (currentWater >= maxWater) {
                debug(DEBUG_PREFIXES.HEALTH, 'Already at maximum water goal');
                return false;
            }
            
            const newWaterCount = currentWater + 1;
            this.state.set('waterGlasses', newWaterCount);
            
            // Emit events
            this.events.emit(EVENTS.WATER_ADDED, {
                previous: currentWater,
                current: newWaterCount,
                percentage: getWaterIntakePercentage({ glasses: newWaterCount, maxGlasses: maxWater }),
                goalAchieved: newWaterCount >= maxWater
            });
            
            // Special event if goal is achieved
            if (newWaterCount >= maxWater) {
                this.events.emit(EVENTS.WATER_GOAL_ACHIEVED, {
                    glasses: newWaterCount,
                    target: maxWater
                });
            }
            
            debug(DEBUG_PREFIXES.HEALTH, 'Water added successfully:', {
                current: newWaterCount,
                max: maxWater
            });
            
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error adding water:', error);
            throw error;
        }
    }
    
    /**
     * Remove a glass of water
     * @returns {boolean} Success status
     */
    removeWater() {
        debug(DEBUG_PREFIXES.HEALTH, 'Removing water glass');
        
        try {
            const currentWater = this.state.get('waterGlasses');
            
            if (currentWater <= 0) {
                debug(DEBUG_PREFIXES.HEALTH, 'Already at minimum water count');
                return false;
            }
            
            const newWaterCount = currentWater - 1;
            this.state.set('waterGlasses', newWaterCount);
            
            // Emit events
            this.events.emit(EVENTS.WATER_REMOVED, {
                previous: currentWater,
                current: newWaterCount,
                percentage: getWaterIntakePercentage({ 
                    glasses: newWaterCount, 
                    maxGlasses: this.state.get('maxWaterGlasses') 
                })
            });
            
            debug(DEBUG_PREFIXES.HEALTH, 'Water removed successfully:', newWaterCount);
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error removing water:', error);
            throw error;
        }
    }
    
    /**
     * Set water count to specific glass index
     * @param {number} glassIndex - Glass index (0-based)
     * @returns {boolean} Success status
     */
    setWaterToGlass(glassIndex) {
        debug(DEBUG_PREFIXES.HEALTH, 'Setting water to glass index:', glassIndex);
        
        try {
            const maxWater = this.state.get('maxWaterGlasses');
            
            if (glassIndex < 0 || glassIndex >= maxWater) {
                throw new Error(`Invalid glass index: ${glassIndex}`);
            }
            
            const currentWater = this.state.get('waterGlasses');
            
            // Fix the off-by-one issue: if clicking on a filled glass, remove it
            // If clicking on an empty glass, fill up to that glass
            let targetWater;
            if (glassIndex < currentWater) {
                // Clicking on a filled glass - remove it and all glasses after it
                targetWater = glassIndex;
            } else {
                // Clicking on an empty glass - fill up to that glass
                targetWater = glassIndex + 1;
            }
            
            if (currentWater === targetWater) {
                debug(DEBUG_PREFIXES.HEALTH, 'No change needed');
                return true; // No change needed
            }
            
            this.state.set('waterGlasses', targetWater);
            
            // Emit events
            this.events.emit(EVENTS.WATER_GLASS_TOGGLED, {
                glassIndex,
                previous: currentWater,
                current: targetWater,
                percentage: getWaterIntakePercentage({ glasses: targetWater, maxGlasses: maxWater })
            });
            
            debug(DEBUG_PREFIXES.HEALTH, 'Water set to glass successfully:', {
                index: glassIndex,
                count: targetWater
            });
            
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error setting water to glass:', error);
            throw error;
        }
    }
    
    /**
     * Reset water count to zero
     * @returns {boolean} Success status
     */
    resetWater() {
        debug(DEBUG_PREFIXES.HEALTH, 'Resetting water count');
        
        try {
            const currentWater = this.state.get('waterGlasses');
            
            if (currentWater === 0) {
                debug(DEBUG_PREFIXES.HEALTH, 'Water already at zero');
                return true;
            }
            
            this.state.set('waterGlasses', 0);
            
            // Emit events
            this.events.emit(EVENTS.WATER_RESET, {
                previous: currentWater,
                current: 0
            });
            
            debug(DEBUG_PREFIXES.HEALTH, 'Water reset successfully');
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error resetting water:', error);
            throw error;
        }
    }
    
    /**
     * Update medication status
     * @param {string} medicationType - Type of medication ('morning', etc.)
     * @param {boolean} taken - Whether medication was taken
     * @returns {boolean} Success status
     */
    updateMedicationStatus(medicationType = 'morning', taken = null) {
        debug(DEBUG_PREFIXES.HEALTH, 'Updating medication status:', { medicationType, taken });
        
        try {
            const currentStatus = this.state.get('medicationStatus');
            
            if (!currentStatus || typeof currentStatus !== 'object') {
                throw new Error('Invalid medication status in state');
            }
            
            // If taken is null, toggle the current status
            const newStatus = taken !== null ? taken : !currentStatus[medicationType];
            
            const updatedStatus = {
                ...currentStatus,
                [medicationType]: newStatus,
                lastUpdated: new Date().toISOString()
            };
            
            // Validate the updated status
            const validation = validateMedicationStatus(updatedStatus);
            if (!validation.isValid) {
                throw new Error(`Invalid medication status: ${validation.errors.join(', ')}`);
            }
            
            this.state.set('medicationStatus', updatedStatus);
            
            // Emit events
            this.events.emit(EVENTS.MEDICATION_UPDATED, {
                type: medicationType,
                taken: newStatus,
                previous: currentStatus[medicationType],
                isComplete: isMedicationComplete(updatedStatus)
            });
            
            // Special event if all medications are complete
            if (isMedicationComplete(updatedStatus)) {
                this.events.emit(EVENTS.MEDICATION_COMPLETE, updatedStatus);
            }
            
            debug(DEBUG_PREFIXES.HEALTH, 'Medication status updated successfully:', {
                type: medicationType,
                status: newStatus
            });
            
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error updating medication status:', error);
            throw error;
        }
    }
    
    /**
     * Update medication from DOM element
     * @param {HTMLElement} element - Checkbox element
     * @returns {boolean} Success status
     */
    updateMedicationFromElement(element) {
        if (!element || typeof element.checked !== 'boolean') {
            throw new Error('Invalid medication element');
        }
        
        // Determine medication type from element ID
        let medicationType = 'morning';
        if (element.id === 'morningMed' || element.id === 'morningMedHorizontal') {
            medicationType = 'morning';
        }
        
        return this.updateMedicationStatus(medicationType, element.checked);
    }
    
    /**
     * Get current water status
     * @returns {Object} Water status information
     */
    getWaterStatus() {
        const waterGlasses = this.state.get('waterGlasses');
        const maxWaterGlasses = this.state.get('maxWaterGlasses');
        
        return {
            current: waterGlasses,
            target: maxWaterGlasses,
            percentage: getWaterIntakePercentage({ glasses: waterGlasses, maxGlasses: maxWaterGlasses }),
            goalAchieved: isWaterGoalAchieved({ glasses: waterGlasses, maxGlasses: maxWaterGlasses }),
            remaining: Math.max(0, maxWaterGlasses - waterGlasses),
            totalOunces: waterGlasses * WATER_CONFIG.OUNCES_PER_GLASS,
            targetOunces: maxWaterGlasses * WATER_CONFIG.OUNCES_PER_GLASS
        };
    }
    
    /**
     * Get current medication status
     * @returns {Object} Medication status information
     */
    getMedicationStatus() {
        const medicationStatus = this.state.get('medicationStatus');
        
        return {
            morning: medicationStatus.morning,
            isComplete: isMedicationComplete(medicationStatus),
            lastUpdated: medicationStatus.lastUpdated,
            completionPercentage: medicationStatus.morning ? 100 : 0,
            statusText: medicationStatus.morning ? 'Complete' : 'Pending'
        };
    }
    
    /**
     * Get health summary
     * @returns {Object} Complete health status
     */
    getHealthSummary() {
        return {
            water: this.getWaterStatus(),
            medication: this.getMedicationStatus(),
            overallComplete: this.isHealthGoalsComplete(),
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * Check if all health goals are complete
     * @returns {boolean} True if all goals are met
     */
    isHealthGoalsComplete() {
        const waterStatus = this.getWaterStatus();
        const medicationStatus = this.getMedicationStatus();
        
        return waterStatus.goalAchieved && medicationStatus.isComplete;
    }
    
    /**
     * Reset daily health tracking
     * @returns {boolean} Success status
     */
    resetDailyTracking() {
        debug(DEBUG_PREFIXES.HEALTH, 'Resetting daily health tracking');
        
        try {
            // Reset water
            this.resetWater();
            
            // Reset medication
            const defaultMedicationStatus = this.config.getDefaultState().medicationStatus;
            this.state.set('medicationStatus', {
                ...defaultMedicationStatus,
                lastUpdated: new Date().toISOString()
            });
            
            // Emit event
            this.events.emit(EVENTS.HEALTH_DAILY_RESET);
            
            debug(DEBUG_PREFIXES.HEALTH, 'Daily health tracking reset successfully');
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.HEALTH, 'Error resetting daily tracking:', error);
            throw error;
        }
    }
    
    /**
     * Check if daily reset is needed (should be called on app start)
     * @returns {boolean} True if reset was performed
     */
    checkAndPerformDailyReset() {
        // This could be enhanced to check last reset date
        // For now, we don't auto-reset to preserve user data
        return false;
    }
    
    /**
     * Validate current health data
     * @returns {Object} Validation result
     */
    validateHealthData() {
        const waterData = {
            glasses: this.state.get('waterGlasses'),
            maxGlasses: this.state.get('maxWaterGlasses')
        };
        
        const medicationData = this.state.get('medicationStatus');
        
        const waterValidation = validateWaterTracking(waterData);
        const medicationValidation = validateMedicationStatus(medicationData);
        
        return {
            isValid: waterValidation.isValid && medicationValidation.isValid,
            water: waterValidation,
            medication: medicationValidation
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.HEALTH, 'Destroying HealthService');
        this.state = null;
        this.events = null;
        this.config = null;
    }
}