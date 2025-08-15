/**
 * Tasks Constants
 * Central location for all constants, enums, and magic numbers
 */

// Storage Keys
export const STORAGE_KEYS = {
    TASKS: 'skylight-tasks-v2',
    WATER: 'skylight-water',
    MEDICATION: 'skylight-medication',
    CURRENT_USER: 'skylight-current-user'
};

// User Types
export const USER_TYPES = {
    JUSTIN: 'justin',
    BROOKE: 'brooke'
};

// Valid Users List
export const VALID_USERS = [USER_TYPES.JUSTIN, USER_TYPES.BROOKE];

// Default User
export const DEFAULT_USER = USER_TYPES.JUSTIN;

// Water Tracking
export const WATER_CONFIG = {
    MAX_GLASSES: 8,
    DEFAULT_GLASSES: 0,
    TARGET_OUNCES: 64,
    OUNCES_PER_GLASS: 8
};

// Medication Configuration
export const MEDICATION_CONFIG = {
    TIMES: {
        MORNING: 'morning'
    },
    STATUS: {
        PENDING: 'pending',
        COMPLETE: 'complete'
    }
};

// Task Priority Levels
export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// Task Status
export const TASK_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

// UI Constants
export const UI_CONFIG = {
    ANIMATION_DELAY_INCREMENT: 50, // ms per item for staggered animations
    EMPTY_STATE_MESSAGES: {
        NO_ACTIVE_TASKS: 'No active tasks. Time to relax!',
        NO_COMPLETED_TASKS: 'No completed tasks yet.'
    }
};

// Health Status Classes
export const HEALTH_CLASSES = {
    PENDING: 'pending',
    COMPLETE: 'complete'
};

// Event Names for Component Communication
export const EVENTS = {
    // Task Events
    TASK_ADDED: 'task:added',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    TASK_TOGGLED: 'task:toggled',
    
    // User Events
    USER_SWITCHED: 'user:switched',
    
    // Health Events
    WATER_ADDED: 'health:water:added',
    WATER_REMOVED: 'health:water:removed',
    WATER_RESET: 'health:water:reset',
    WATER_GLASS_TOGGLED: 'health:water:glass:toggled',
    WATER_GOAL_ACHIEVED: 'health:water:goal:achieved',
    MEDICATION_UPDATED: 'health:medication:updated',
    MEDICATION_COMPLETE: 'health:medication:complete',
    HEALTH_DAILY_RESET: 'health:daily:reset',
    
    // UI Events
    STATS_UPDATED: 'ui:stats:updated',
    RENDER_REQUESTED: 'ui:render:requested',
    
    // State Events
    STATE_CHANGED: 'state:changed',
    STATE_LOADED: 'state:loaded',
    STATE_SAVED: 'state:saved',
    
    // Storage Events
    STORAGE_ERROR: 'storage:error',
    STORAGE_CLEARED: 'storage:cleared',
    
    // Bulk Operations
    TASKS_BULK_UPDATED: 'tasks:bulk:updated'
};

// Error Messages
export const ERROR_MESSAGES = {
    STORAGE_LOAD_FAILED: 'Failed to load data from storage',
    STORAGE_SAVE_FAILED: 'Failed to save data to storage',
    INVALID_USER: 'Invalid user specified',
    TASK_NOT_FOUND: 'Task not found',
    INVALID_TASK_DATA: 'Invalid task data provided'
};

// Debug Prefixes
export const DEBUG_PREFIXES = {
    CORE: 'TasksCore',
    STATE: 'TasksState',
    EVENTS: 'TasksEvents',
    STORAGE: 'StorageService',
    TASKS: 'TaskService',
    USER: 'UserService',
    HEALTH: 'HealthService',
    STATS: 'StatsService'
};
