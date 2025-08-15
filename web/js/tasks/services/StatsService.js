/**
 * Stats Service - Statistics and Analytics
 * Handles task statistics calculations and reporting
 */

import { DEBUG_PREFIXES, USER_TYPES } from '../utils/TasksConstants.js';
import { getUserStats } from '../types/UserTypes.js';
import { debug } from '../../constants/config.js';

/**
 * StatsService - Handles statistics and analytics
 */
export class StatsService {
    constructor(state, events, config) {
        this.state = state;
        this.events = events;
        this.config = config;
        
        debug(DEBUG_PREFIXES.STATS, 'StatsService initialized');
    }
    
    /**
     * Calculate statistics for current user view (header display)
     * @returns {Object} Current user statistics
     */
    calculateCurrentUserStats() {
        const tasks = this.state.get('tasks');
        const currentUser = this.state.get('currentUser');
        
        const justinTasks = tasks.filter(t => t.owner === USER_TYPES.JUSTIN);
        const brookeTasks = tasks.filter(t => t.owner === USER_TYPES.BROOKE);
        
        return {
            totalActive: tasks.filter(t => !t.completed).length,
            justinCount: justinTasks.filter(t => !t.completed).length,
            brookeCount: brookeTasks.filter(t => !t.completed).length,
            completedCount: tasks.filter(t => t.completed).length,
            currentUserCount: tasks.filter(t => t.owner === currentUser && !t.completed).length,
            currentUser
        };
    }
    
    /**
     * Get task statistics for a specific user
     * @param {string} userId - User ID
     * @returns {Object} User-specific statistics
     */
    getUserTaskStats(userId) {
        const tasks = this.state.get('tasks');
        return getUserStats(userId, tasks);
    }
    
    /**
     * Calculate productivity metrics
     * @param {string} userId - User ID (optional, defaults to current user)
     * @returns {Object} Productivity metrics
     */
    calculateProductivityMetrics(userId = null) {
        const user = userId || this.state.get('currentUser');
        const tasks = this.state.get('tasks');
        const userTasks = tasks.filter(t => t.owner === user);
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Tasks created today
        const createdToday = userTasks.filter(task => {
            const taskDate = new Date(task.timestamp);
            return taskDate >= today;
        });
        
        // Tasks completed today
        const completedToday = userTasks.filter(task => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate >= today;
        });
        
        return {
            userId: user,
            today: {
                created: createdToday.length,
                completed: completedToday.length,
                completionRate: createdToday.length > 0 
                    ? Math.round((completedToday.length / createdToday.length) * 100)
                    : 0
            },
            overall: {
                total: userTasks.length,
                completed: userTasks.filter(t => t.completed).length,
                pending: userTasks.filter(t => !t.completed).length,
                completionRate: userTasks.length > 0
                    ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100)
                    : 0
            }
        };
    }
    
    /**
     * Get health statistics (for users with health tracking)
     * @returns {Object} Health statistics
     */
    getHealthStats() {
        const currentUser = this.state.get('currentUser');
        
        // Only calculate for users with health tracking (currently only Justin)
        if (currentUser !== USER_TYPES.JUSTIN) {
            return null;
        }
        
        const waterGlasses = this.state.get('waterGlasses');
        const maxWaterGlasses = this.state.get('maxWaterGlasses');
        const medicationStatus = this.state.get('medicationStatus');
        
        return {
            water: {
                current: waterGlasses,
                target: maxWaterGlasses,
                percentage: Math.round((waterGlasses / maxWaterGlasses) * 100),
                goalAchieved: waterGlasses >= maxWaterGlasses
            },
            medication: {
                morning: medicationStatus.morning,
                completed: medicationStatus.morning
            }
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.STATS, 'Destroying StatsService');
        this.state = null;
        this.events = null;
        this.config = null;
    }
}
