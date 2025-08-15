/**
 * Task Type Definitions
 * Type definitions and validation for task-related data structures
 */

import { USER_TYPES, TASK_PRIORITY, TASK_STATUS } from '../utils/TasksConstants.js';

/**
 * Task data structure definition
 */
export const TaskType = {
    id: 'string',           // Unique identifier
    text: 'string',         // Task description
    owner: 'string',        // User who owns the task (justin|brooke)
    completed: 'boolean',   // Completion status
    timestamp: 'string',    // ISO date string when created
    priority: 'string',     // Optional: low|medium|high
    description: 'string',  // Optional: Extended description
    dueDate: 'string',     // Optional: ISO date string
    category: 'string',    // Optional: Task category
    tags: 'array'          // Optional: Array of string tags
};

/**
 * Validate task object structure
 * @param {Object} task - Task object to validate
 * @returns {Object} Validation result { isValid, errors, warnings }
 */
export function validateTask(task) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    if (!task || typeof task !== 'object') {
        errors.push('Task must be an object');
        return { isValid: false, errors, warnings };
    }
    
    if (!task.id || typeof task.id !== 'string') {
        errors.push('Task must have a valid id (string)');
    }
    
    if (!task.text || typeof task.text !== 'string') {
        errors.push('Task must have a valid text (string)');
    } else if (task.text.length > 500) {
        warnings.push('Task text is very long (>500 characters)');
    }
    
    if (!task.owner || typeof task.owner !== 'string') {
        errors.push('Task must have a valid owner (string)');
    } else if (!Object.values(USER_TYPES).includes(task.owner)) {
        errors.push(`Task owner must be one of: ${Object.values(USER_TYPES).join(', ')}`);
    }
    
    if (typeof task.completed !== 'boolean') {
        errors.push('Task completed must be a boolean');
    }
    
    if (!task.timestamp || typeof task.timestamp !== 'string') {
        errors.push('Task must have a valid timestamp (ISO string)');
    } else if (isNaN(Date.parse(task.timestamp))) {
        errors.push('Task timestamp must be a valid ISO date string');
    }
    
    // Optional fields validation
    if (task.priority !== undefined) {
        if (!Object.values(TASK_PRIORITY).includes(task.priority)) {
            errors.push(`Task priority must be one of: ${Object.values(TASK_PRIORITY).join(', ')}`);
        }
    }
    
    if (task.description !== undefined && typeof task.description !== 'string') {
        errors.push('Task description must be a string');
    }
    
    if (task.dueDate !== undefined) {
        if (typeof task.dueDate !== 'string' || isNaN(Date.parse(task.dueDate))) {
            errors.push('Task dueDate must be a valid ISO date string');
        }
    }
    
    if (task.category !== undefined && typeof task.category !== 'string') {
        errors.push('Task category must be a string');
    }
    
    if (task.tags !== undefined) {
        if (!Array.isArray(task.tags)) {
            errors.push('Task tags must be an array');
        } else if (!task.tags.every(tag => typeof tag === 'string')) {
            errors.push('All task tags must be strings');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Create a new task with default values
 * @param {Object} taskData - Task data to merge with defaults
 * @returns {Object} Complete task object
 */
export function createTask(taskData = {}) {
    const now = new Date().toISOString();
    
    const task = {
        id: taskData.id || generateTaskId(),
        text: taskData.text || '',
        owner: taskData.owner || USER_TYPES.JUSTIN,
        completed: taskData.completed || false,
        timestamp: taskData.timestamp || now,
        priority: taskData.priority || TASK_PRIORITY.MEDIUM,
        description: taskData.description || '',
        dueDate: taskData.dueDate || null,
        category: taskData.category || null,
        tags: taskData.tags || []
    };
    
    const validation = validateTask(task);
    if (!validation.isValid) {
        throw new Error(`Invalid task data: ${validation.errors.join(', ')}`);
    }
    
    return task;
}

/**
 * Generate a unique task ID
 * @returns {string} Unique task ID
 */
export function generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clone a task object safely
 * @param {Object} task - Task to clone
 * @returns {Object} Cloned task
 */
export function cloneTask(task) {
    return {
        ...task,
        tags: task.tags ? [...task.tags] : []
    };
}

/**
 * Check if task is overdue
 * @param {Object} task - Task object
 * @returns {boolean} True if task is overdue
 */
export function isTaskOverdue(task) {
    if (!task.dueDate || task.completed) {
        return false;
    }
    
    return new Date(task.dueDate) < new Date();
}

/**
 * Check if task is due today
 * @param {Object} task - Task object
 * @returns {boolean} True if task is due today
 */
export function isTaskDueToday(task) {
    if (!task.dueDate) {
        return false;
    }
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    return today.toDateString() === dueDate.toDateString();
}

/**
 * Get task status
 * @param {Object} task - Task object
 * @returns {string} Task status (completed|overdue|due-today|active)
 */
export function getTaskStatus(task) {
    if (task.completed) {
        return TASK_STATUS.COMPLETED;
    }
    
    if (isTaskOverdue(task)) {
        return 'overdue';
    }
    
    if (isTaskDueToday(task)) {
        return 'due-today';
    }
    
    return TASK_STATUS.ACTIVE;
}

/**
 * Sort tasks by priority and due date
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Sorted tasks
 */
export function sortTasks(tasks) {
    const priorityOrder = {
        [TASK_PRIORITY.HIGH]: 3,
        [TASK_PRIORITY.MEDIUM]: 2,
        [TASK_PRIORITY.LOW]: 1
    };
    
    return tasks.sort((a, b) => {
        // Completed tasks go to bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Sort by priority
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }
        
        // Sort by due date
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Sort by creation date
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
}
