/**
 * Default Data Configuration
 * Provides default tasks and initial state data
 */

import { USER_TYPES } from '../utils/TasksConstants.js';

/**
 * Get default sample tasks for new installations
 */
export function getDefaultTasks() {
    return [
        {
            id: '1',
            text: 'Review weekly calendar',
            owner: USER_TYPES.JUSTIN,
            completed: false,
            timestamp: new Date().toISOString()
        },
        {
            id: '2', 
            text: 'Grocery shopping for dinner',
            owner: USER_TYPES.BROOKE,
            completed: false,
            timestamp: new Date().toISOString()
        },
        {
            id: '3',
            text: 'Call plumber about kitchen sink',
            owner: USER_TYPES.JUSTIN,
            completed: false,
            timestamp: new Date().toISOString()
        },
        {
            id: '4',
            text: 'Yoga class at 6pm',
            owner: USER_TYPES.BROOKE,
            completed: false,
            timestamp: new Date().toISOString()
        },
        {
            id: '5',
            text: 'Prep lunch for tomorrow',
            owner: USER_TYPES.JUSTIN,
            completed: false,
            timestamp: new Date().toISOString()
        }
    ];
}

/**
 * Get default medication status
 */
export function getDefaultMedicationStatus() {
    return {
        morning: false
    };
}

/**
 * Get default water tracking state
 */
export function getDefaultWaterState() {
    return {
        glasses: 0,
        maxGlasses: 8
    };
}

/**
 * Get default user state
 */
export function getDefaultUserState() {
    return {
        currentUser: USER_TYPES.JUSTIN,
        users: [USER_TYPES.JUSTIN, USER_TYPES.BROOKE]
    };
}

/**
 * Get complete default application state
 */
export function getDefaultState() {
    return {
        tasks: getDefaultTasks(),
        currentUser: USER_TYPES.JUSTIN,
        waterGlasses: 0,
        maxWaterGlasses: 8,
        medicationStatus: getDefaultMedicationStatus(),
        taskIdCounter: 6, // Next ID after default tasks
        isInitialized: false
    };
}
