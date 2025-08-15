/**
 * User Type Definitions
 * Type definitions and validation for user-related data structures
 */

import { USER_TYPES, VALID_USERS, DEFAULT_USER } from '../utils/TasksConstants.js';

/**
 * User data structure definition
 */
export const UserType = {
    id: 'string',           // User identifier (justin|brooke)
    name: 'string',         // Display name
    preferences: 'object',  // User preferences
    settings: 'object'      // User-specific settings
};

/**
 * User preferences structure
 */
export const UserPreferencesType = {
    theme: 'string',        // UI theme preference
    notifications: 'boolean', // Enable notifications
    defaultTaskPriority: 'string', // Default priority for new tasks
    healthTracking: 'boolean' // Enable health tracking features
};

/**
 * Validate user ID
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid user ID
 */
export function isValidUser(userId) {
    return typeof userId === 'string' && VALID_USERS.includes(userId);
}

/**
 * Get user display name
 * @param {string} userId - User ID
 * @returns {string} Display name
 */
export function getUserDisplayName(userId) {
    const names = {
        [USER_TYPES.JUSTIN]: 'Justin',
        [USER_TYPES.BROOKE]: 'Brooke'
    };
    
    return names[userId] || userId;
}

/**
 * Get possessive form of user name
 * @param {string} userId - User ID
 * @returns {string} Possessive name (e.g., "Justin's")
 */
export function getUserPossessiveName(userId) {
    const name = getUserDisplayName(userId);
    return `${name}'s`;
}

/**
 * Get all available users
 * @returns {Array} Array of user objects
 */
export function getAllUsers() {
    return VALID_USERS.map(userId => ({
        id: userId,
        name: getUserDisplayName(userId),
        isDefault: userId === DEFAULT_USER
    }));
}

/**
 * Get default user preferences
 * @param {string} userId - User ID
 * @returns {Object} Default preferences for user
 */
export function getDefaultUserPreferences(userId) {
    const basePreferences = {
        theme: 'glassmorphism',
        notifications: true,
        defaultTaskPriority: 'medium',
        healthTracking: false
    };
    
    // User-specific preferences
    if (userId === USER_TYPES.JUSTIN) {
        return {
            ...basePreferences,
            healthTracking: true // Justin has health tracking enabled
        };
    }
    
    return basePreferences;
}

/**
 * Validate user preferences object
 * @param {Object} preferences - Preferences to validate
 * @returns {Object} Validation result
 */
export function validateUserPreferences(preferences) {
    const errors = [];
    const warnings = [];
    
    if (!preferences || typeof preferences !== 'object') {
        errors.push('Preferences must be an object');
        return { isValid: false, errors, warnings };
    }
    
    if (preferences.theme !== undefined && typeof preferences.theme !== 'string') {
        errors.push('Theme preference must be a string');
    }
    
    if (preferences.notifications !== undefined && typeof preferences.notifications !== 'boolean') {
        errors.push('Notifications preference must be a boolean');
    }
    
    if (preferences.defaultTaskPriority !== undefined) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(preferences.defaultTaskPriority)) {
            errors.push(`Default task priority must be one of: ${validPriorities.join(', ')}`);
        }
    }
    
    if (preferences.healthTracking !== undefined && typeof preferences.healthTracking !== 'boolean') {
        errors.push('Health tracking preference must be a boolean');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Create user object with defaults
 * @param {string} userId - User ID
 * @param {Object} customPreferences - Custom preferences to merge
 * @returns {Object} Complete user object
 */
export function createUser(userId, customPreferences = {}) {
    if (!isValidUser(userId)) {
        throw new Error(`Invalid user ID: ${userId}`);
    }
    
    const defaultPreferences = getDefaultUserPreferences(userId);
    const preferences = { ...defaultPreferences, ...customPreferences };
    
    const validation = validateUserPreferences(preferences);
    if (!validation.isValid) {
        throw new Error(`Invalid user preferences: ${validation.errors.join(', ')}`);
    }
    
    return {
        id: userId,
        name: getUserDisplayName(userId),
        preferences,
        settings: {}
    };
}

/**
 * Switch to next user in sequence
 * @param {string} currentUserId - Current user ID
 * @returns {string} Next user ID
 */
export function getNextUser(currentUserId) {
    const currentIndex = VALID_USERS.indexOf(currentUserId);
    if (currentIndex === -1) {
        return DEFAULT_USER;
    }
    
    const nextIndex = (currentIndex + 1) % VALID_USERS.length;
    return VALID_USERS[nextIndex];
}

/**
 * Check if user has health tracking enabled
 * @param {string} userId - User ID
 * @returns {boolean} True if health tracking is enabled
 */
export function hasHealthTracking(userId) {
    // Currently only Justin has health tracking
    return userId === USER_TYPES.JUSTIN;
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @param {Array} tasks - Array of all tasks
 * @returns {Object} User task statistics
 */
export function getUserStats(userId, tasks) {
    const userTasks = tasks.filter(task => task.owner === userId);
    const activeTasks = userTasks.filter(task => !task.completed);
    const completedTasks = userTasks.filter(task => task.completed);
    
    return {
        total: userTasks.length,
        active: activeTasks.length,
        completed: completedTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0
    };
}
