/**
 * Health Type Definitions
 * Type definitions and validation for health tracking data structures
 */

import { WATER_CONFIG, MEDICATION_CONFIG } from '../utils/TasksConstants.js';

/**
 * Water tracking data structure
 */
export const WaterTrackingType = {
    glasses: 'number',      // Current number of glasses consumed
    maxGlasses: 'number',   // Maximum glasses per day
    targetOunces: 'number', // Target ounces per day
    ouncesPerGlass: 'number', // Ounces per glass
    lastReset: 'string'     // ISO date string of last reset
};

/**
 * Medication status data structure
 */
export const MedicationStatusType = {
    morning: 'boolean',     // Morning medication taken
    // Future: evening, afternoon, etc.
    lastUpdated: 'string'   // ISO date string of last update
};

/**
 * Health summary data structure
 */
export const HealthSummaryType = {
    water: 'object',        // WaterTrackingType
    medication: 'object',   // MedicationStatusType
    date: 'string',         // ISO date string for this summary
    userId: 'string'        // User this summary belongs to
};

/**
 * Validate water tracking data
 * @param {Object} waterData - Water tracking data to validate
 * @returns {Object} Validation result
 */
export function validateWaterTracking(waterData) {
    const errors = [];
    const warnings = [];
    
    if (!waterData || typeof waterData !== 'object') {
        errors.push('Water tracking data must be an object');
        return { isValid: false, errors, warnings };
    }
    
    if (typeof waterData.glasses !== 'number' || waterData.glasses < 0) {
        errors.push('Glasses count must be a non-negative number');
    } else if (waterData.glasses > 20) {
        warnings.push('Very high water consumption (>20 glasses)');
    }
    
    if (typeof waterData.maxGlasses !== 'number' || waterData.maxGlasses <= 0) {
        errors.push('Max glasses must be a positive number');
    }
    
    if (waterData.glasses > waterData.maxGlasses) {
        warnings.push('Current glasses exceed maximum target');
    }
    
    if (waterData.targetOunces !== undefined) {
        if (typeof waterData.targetOunces !== 'number' || waterData.targetOunces <= 0) {
            errors.push('Target ounces must be a positive number');
        }
    }
    
    if (waterData.ouncesPerGlass !== undefined) {
        if (typeof waterData.ouncesPerGlass !== 'number' || waterData.ouncesPerGlass <= 0) {
            errors.push('Ounces per glass must be a positive number');
        }
    }
    
    if (waterData.lastReset !== undefined) {
        if (typeof waterData.lastReset !== 'string' || isNaN(Date.parse(waterData.lastReset))) {
            errors.push('Last reset must be a valid ISO date string');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate medication status data
 * @param {Object} medicationData - Medication status data to validate
 * @returns {Object} Validation result
 */
export function validateMedicationStatus(medicationData) {
    const errors = [];
    const warnings = [];
    
    if (!medicationData || typeof medicationData !== 'object') {
        errors.push('Medication status data must be an object');
        return { isValid: false, errors, warnings };
    }
    
    if (typeof medicationData.morning !== 'boolean') {
        errors.push('Morning medication status must be a boolean');
    }
    
    if (medicationData.lastUpdated !== undefined) {
        if (typeof medicationData.lastUpdated !== 'string' || isNaN(Date.parse(medicationData.lastUpdated))) {
            errors.push('Last updated must be a valid ISO date string');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Create default water tracking data
 * @param {Object} customData - Custom data to merge with defaults
 * @returns {Object} Complete water tracking object
 */
export function createWaterTracking(customData = {}) {
    const waterData = {
        glasses: customData.glasses ?? WATER_CONFIG.DEFAULT_GLASSES,
        maxGlasses: customData.maxGlasses ?? WATER_CONFIG.MAX_GLASSES,
        targetOunces: customData.targetOunces ?? WATER_CONFIG.TARGET_OUNCES,
        ouncesPerGlass: customData.ouncesPerGlass ?? WATER_CONFIG.OUNCES_PER_GLASS,
        lastReset: customData.lastReset ?? new Date().toISOString()
    };
    
    const validation = validateWaterTracking(waterData);
    if (!validation.isValid) {
        throw new Error(`Invalid water tracking data: ${validation.errors.join(', ')}`);
    }
    
    return waterData;
}

/**
 * Create default medication status
 * @param {Object} customData - Custom data to merge with defaults
 * @returns {Object} Complete medication status object
 */
export function createMedicationStatus(customData = {}) {
    const medicationData = {
        morning: customData.morning ?? false,
        lastUpdated: customData.lastUpdated ?? new Date().toISOString()
    };
    
    const validation = validateMedicationStatus(medicationData);
    if (!validation.isValid) {
        throw new Error(`Invalid medication status data: ${validation.errors.join(', ')}`);
    }
    
    return medicationData;
}

/**
 * Calculate water intake percentage
 * @param {Object} waterData - Water tracking data
 * @returns {number} Percentage of daily goal achieved (0-100)
 */
export function getWaterIntakePercentage(waterData) {
    if (!waterData || waterData.maxGlasses <= 0) {
        return 0;
    }
    
    return Math.min((waterData.glasses / waterData.maxGlasses) * 100, 100);
}

/**
 * Calculate total ounces consumed
 * @param {Object} waterData - Water tracking data
 * @returns {number} Total ounces consumed
 */
export function getTotalOuncesConsumed(waterData) {
    if (!waterData) {
        return 0;
    }
    
    return waterData.glasses * (waterData.ouncesPerGlass || WATER_CONFIG.OUNCES_PER_GLASS);
}

/**
 * Check if water goal is achieved
 * @param {Object} waterData - Water tracking data
 * @returns {boolean} True if goal is achieved
 */
export function isWaterGoalAchieved(waterData) {
    return waterData && waterData.glasses >= waterData.maxGlasses;
}

/**
 * Check if medication is fully taken
 * @param {Object} medicationData - Medication status data
 * @returns {boolean} True if all medications are taken
 */
export function isMedicationComplete(medicationData) {
    if (!medicationData) {
        return false;
    }
    
    // Currently only checking morning medication
    // Future: check all medication times
    return medicationData.morning;
}

/**
 * Get medication completion percentage
 * @param {Object} medicationData - Medication status data
 * @returns {number} Percentage of medications taken (0-100)
 */
export function getMedicationCompletionPercentage(medicationData) {
    if (!medicationData) {
        return 0;
    }
    
    // Currently only one medication time (morning)
    // Future: calculate based on all medication times
    return medicationData.morning ? 100 : 0;
}

/**
 * Check if health data needs daily reset
 * @param {Object} healthData - Health data object
 * @returns {boolean} True if reset is needed
 */
export function needsDailyReset(healthData) {
    if (!healthData || !healthData.water || !healthData.water.lastReset) {
        return true;
    }
    
    const lastReset = new Date(healthData.water.lastReset);
    const today = new Date();
    
    // Check if last reset was on a different day
    return lastReset.toDateString() !== today.toDateString();
}

/**
 * Create health summary for a day
 * @param {string} userId - User ID
 * @param {Object} waterData - Water tracking data
 * @param {Object} medicationData - Medication status data
 * @returns {Object} Health summary object
 */
export function createHealthSummary(userId, waterData, medicationData) {
    return {
        userId,
        date: new Date().toISOString(),
        water: {
            ...waterData,
            percentage: getWaterIntakePercentage(waterData),
            totalOunces: getTotalOuncesConsumed(waterData),
            goalAchieved: isWaterGoalAchieved(waterData)
        },
        medication: {
            ...medicationData,
            percentage: getMedicationCompletionPercentage(medicationData),
            complete: isMedicationComplete(medicationData)
        }
    };
}

/**
 * Get health status summary text
 * @param {Object} healthSummary - Health summary object
 * @returns {string} Status text
 */
export function getHealthStatusText(healthSummary) {
    const waterComplete = healthSummary.water.goalAchieved;
    const medicationComplete = healthSummary.medication.complete;
    
    if (waterComplete && medicationComplete) {
        return 'All health goals achieved! 🎉';
    } else if (waterComplete) {
        return 'Water goal achieved! Remember medication.';
    } else if (medicationComplete) {
        return 'Medication complete! Keep drinking water.';
    } else {
        return 'Stay healthy! Track water and medication.';
    }
}
