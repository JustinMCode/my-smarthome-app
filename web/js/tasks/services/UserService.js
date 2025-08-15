/**
 * User Service - User Management Logic
 * Handles user switching, validation, and user-related operations
 */

import { DEBUG_PREFIXES, EVENTS, USER_TYPES, VALID_USERS } from '../utils/TasksConstants.js';
import { isValidUser, getUserDisplayName, getNextUser, hasHealthTracking } from '../types/UserTypes.js';
import { debug } from '../../constants/config.js';

/**
 * UserService - Handles user management operations
 */
export class UserService {
    constructor(state, events, config) {
        this.state = state;
        this.events = events;
        this.config = config;
        
        debug(DEBUG_PREFIXES.USER, 'UserService initialized');
    }
    
    /**
     * Switch to a different user
     * @param {string} userId - User ID to switch to
     * @param {boolean} save - Whether to save the change (default: true)
     * @returns {boolean} Success status
     */
    switchUser(userId, save = true) {
        debug(DEBUG_PREFIXES.USER, 'Switching user:', { userId, save });
        
        try {
            // Validate user ID
            if (!isValidUser(userId)) {
                throw new Error(`Invalid user ID: ${userId}. Valid users: ${VALID_USERS.join(', ')}`);
            }
            
            const currentUser = this.state.get('currentUser');
            
            // No change needed
            if (currentUser === userId) {
                debug(DEBUG_PREFIXES.USER, 'User already active:', userId);
                return true;
            }
            
            // Update state
            this.state.set('currentUser', userId, !save);
            
            // Emit events
            this.events.emit(EVENTS.USER_SWITCHED, {
                newUser: userId,
                oldUser: currentUser,
                hasHealthTracking: hasHealthTracking(userId)
            });
            
            debug(DEBUG_PREFIXES.USER, 'User switched successfully:', {
                from: currentUser,
                to: userId
            });
            
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.USER, 'Error switching user:', error);
            throw error;
        }
    }
    
    /**
     * Get current user information
     * @returns {Object} Current user info
     */
    getCurrentUser() {
        const userId = this.state.get('currentUser');
        
        return {
            id: userId,
            name: getUserDisplayName(userId),
            hasHealthTracking: hasHealthTracking(userId),
            isValid: isValidUser(userId)
        };
    }
    
    /**
     * Get all available users
     * @returns {Array} Array of user objects
     */
    getAllUsers() {
        return VALID_USERS.map(userId => ({
            id: userId,
            name: getUserDisplayName(userId),
            hasHealthTracking: hasHealthTracking(userId),
            isActive: userId === this.state.get('currentUser')
        }));
    }
    
    /**
     * Switch to next user in sequence
     * @returns {string} New user ID
     */
    switchToNextUser() {
        const currentUser = this.state.get('currentUser');
        const nextUser = getNextUser(currentUser);
        
        this.switchUser(nextUser);
        return nextUser;
    }
    
    /**
     * Get user preferences
     * @param {string} userId - User ID (optional, defaults to current user)
     * @returns {Object} User preferences
     */
    getUserPreferences(userId = null) {
        const user = userId || this.state.get('currentUser');
        
        // Basic preferences - can be expanded later
        const preferences = {
            healthTracking: hasHealthTracking(user),
            theme: 'glassmorphism',
            notifications: true
        };
        
        return preferences;
    }
    
    /**
     * Check if user has specific permission/feature
     * @param {string} feature - Feature name
     * @param {string} userId - User ID (optional, defaults to current user)
     * @returns {boolean} True if user has the feature
     */
    userHasFeature(feature, userId = null) {
        const user = userId || this.state.get('currentUser');
        
        switch (feature) {
            case 'healthTracking':
            case 'waterTracking':
            case 'medicationTracking':
                return hasHealthTracking(user);
            
            case 'taskManagement':
                return true; // All users can manage tasks
            
            default:
                debug(DEBUG_PREFIXES.USER, `Unknown feature: ${feature}`);
                return false;
        }
    }
    
    /**
     * Get user statistics
     * @param {string} userId - User ID (optional, defaults to current user)
     * @returns {Object} User statistics
     */
    getUserStats(userId = null) {
        const user = userId || this.state.get('currentUser');
        const allTasks = this.state.get('tasks');
        const userTasks = allTasks.filter(task => task.owner === user);
        
        const stats = {
            userId: user,
            name: getUserDisplayName(user),
            tasks: {
                total: userTasks.length,
                active: userTasks.filter(t => !t.completed).length,
                completed: userTasks.filter(t => t.completed).length
            }
        };
        
        // Add health stats for users with health tracking
        if (hasHealthTracking(user)) {
            const waterGlasses = this.state.get('waterGlasses');
            const maxWaterGlasses = this.state.get('maxWaterGlasses');
            const medicationStatus = this.state.get('medicationStatus');
            
            stats.health = {
                water: {
                    current: waterGlasses,
                    target: maxWaterGlasses,
                    percentage: Math.round((waterGlasses / maxWaterGlasses) * 100)
                },
                medication: {
                    morning: medicationStatus.morning,
                    completed: medicationStatus.morning
                }
            };
        }
        
        return stats;
    }
    
    /**
     * Validate user session/state
     * @returns {Object} Validation result
     */
    validateUserSession() {
        const currentUser = this.state.get('currentUser');
        
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // Check if current user is valid
        if (!isValidUser(currentUser)) {
            validation.isValid = false;
            validation.errors.push(`Invalid current user: ${currentUser}`);
        }
        
        // Check for data consistency
        const allTasks = this.state.get('tasks');
        const invalidTasks = allTasks.filter(task => !isValidUser(task.owner));
        
        if (invalidTasks.length > 0) {
            validation.warnings.push(`${invalidTasks.length} tasks have invalid owners`);
        }
        
        return validation;
    }
    
    /**
     * Reset user to default
     * @returns {boolean} Success status
     */
    resetToDefaultUser() {
        const defaultUser = this.config.getDefaultState().currentUser;
        return this.switchUser(defaultUser);
    }
    
    /**
     * Get user activity summary
     * @param {string} userId - User ID (optional, defaults to current user)
     * @returns {Object} Activity summary
     */
    getUserActivity(userId = null) {
        const user = userId || this.state.get('currentUser');
        const allTasks = this.state.get('tasks');
        const userTasks = allTasks.filter(task => task.owner === user);
        
        // Calculate activity metrics
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayTasks = userTasks.filter(task => {
            const taskDate = new Date(task.timestamp);
            return taskDate >= today;
        });
        
        const completedToday = todayTasks.filter(task => 
            task.completed && task.completedAt && new Date(task.completedAt) >= today
        );
        
        return {
            userId: user,
            today: {
                tasksCreated: todayTasks.length,
                tasksCompleted: completedToday.length,
                completionRate: todayTasks.length > 0 
                    ? Math.round((completedToday.length / todayTasks.length) * 100)
                    : 0
            },
            overall: {
                totalTasks: userTasks.length,
                totalCompleted: userTasks.filter(t => t.completed).length,
                overallCompletionRate: userTasks.length > 0
                    ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100)
                    : 0
            }
        };
    }
    
    /**
     * Check if it's safe to switch users (no pending operations)
     * @returns {boolean} True if safe to switch
     */
    canSwitchUser() {
        // Add any business logic for when user switching should be prevented
        // For now, always allow switching
        return true;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.USER, 'Destroying UserService');
        this.state = null;
        this.events = null;
        this.config = null;
    }
}