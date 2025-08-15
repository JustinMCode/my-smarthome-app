/**
 * Tasks Validation Utilities
 * Input validation and sanitization functions
 */

import { USER_TYPES, TASK_PRIORITY } from './TasksConstants.js';

/**
 * Validation result structure
 */
export class ValidationResult {
    constructor(isValid = true, errors = [], warnings = []) {
        this.isValid = isValid;
        this.errors = errors;
        this.warnings = warnings;
    }
    
    addError(message) {
        this.errors.push(message);
        this.isValid = false;
    }
    
    addWarning(message) {
        this.warnings.push(message);
    }
    
    combine(other) {
        this.errors.push(...other.errors);
        this.warnings.push(...other.warnings);
        this.isValid = this.isValid && other.isValid;
    }
}

/**
 * Validate task text input
 * @param {string} text - Task text to validate
 * @returns {ValidationResult} Validation result
 */
export function validateTaskText(text) {
    const result = new ValidationResult();
    
    if (typeof text !== 'string') {
        result.addError('Task text must be a string');
        return result;
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
        result.addError('Task text cannot be empty');
        return result;
    }
    
    if (trimmed.length < 3) {
        result.addWarning('Task text is very short');
    }
    
    if (trimmed.length > 500) {
        result.addError('Task text is too long (max 500 characters)');
    } else if (trimmed.length > 200) {
        result.addWarning('Task text is quite long');
    }
    
    // Check for potentially problematic characters
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(text)) {
            result.addError('Task text contains potentially dangerous content');
            break;
        }
    }
    
    return result;
}

/**
 * Validate user ID
 * @param {string} userId - User ID to validate
 * @returns {ValidationResult} Validation result
 */
export function validateUserId(userId) {
    const result = new ValidationResult();
    
    if (typeof userId !== 'string') {
        result.addError('User ID must be a string');
        return result;
    }
    
    if (!Object.values(USER_TYPES).includes(userId)) {
        result.addError(`User ID must be one of: ${Object.values(USER_TYPES).join(', ')}`);
    }
    
    return result;
}

/**
 * Validate task priority
 * @param {string} priority - Priority to validate
 * @returns {ValidationResult} Validation result
 */
export function validateTaskPriority(priority) {
    const result = new ValidationResult();
    
    if (priority === undefined || priority === null) {
        return result; // Priority is optional
    }
    
    if (typeof priority !== 'string') {
        result.addError('Task priority must be a string');
        return result;
    }
    
    if (!Object.values(TASK_PRIORITY).includes(priority)) {
        result.addError(`Task priority must be one of: ${Object.values(TASK_PRIORITY).join(', ')}`);
    }
    
    return result;
}

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @param {boolean} required - Whether the date is required
 * @returns {ValidationResult} Validation result
 */
export function validateDateString(dateString, required = false) {
    const result = new ValidationResult();
    
    if (!dateString) {
        if (required) {
            result.addError('Date is required');
        }
        return result;
    }
    
    if (typeof dateString !== 'string') {
        result.addError('Date must be a string');
        return result;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        result.addError('Date must be a valid date string');
        return result;
    }
    
    // Check if date is too far in the past or future
    const now = new Date();
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const yearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (date < yearAgo) {
        result.addWarning('Date is more than a year in the past');
    } else if (date > yearFromNow) {
        result.addWarning('Date is more than a year in the future');
    }
    
    return result;
}

/**
 * Validate water glasses count
 * @param {number} glasses - Number of glasses to validate
 * @returns {ValidationResult} Validation result
 */
export function validateWaterGlasses(glasses) {
    const result = new ValidationResult();
    
    if (typeof glasses !== 'number') {
        result.addError('Water glasses must be a number');
        return result;
    }
    
    if (!Number.isInteger(glasses)) {
        result.addError('Water glasses must be a whole number');
        return result;
    }
    
    if (glasses < 0) {
        result.addError('Water glasses cannot be negative');
    }
    
    if (glasses > 20) {
        result.addWarning('Very high water consumption (>20 glasses)');
    }
    
    return result;
}

/**
 * Validate medication status
 * @param {Object} medicationStatus - Medication status to validate
 * @returns {ValidationResult} Validation result
 */
export function validateMedicationStatus(medicationStatus) {
    const result = new ValidationResult();
    
    if (!medicationStatus || typeof medicationStatus !== 'object') {
        result.addError('Medication status must be an object');
        return result;
    }
    
    if (typeof medicationStatus.morning !== 'boolean') {
        result.addError('Morning medication status must be a boolean');
    }
    
    return result;
}

/**
 * Sanitize task text
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeTaskText(text) {
    if (typeof text !== 'string') {
        return '';
    }
    
    return text
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .slice(0, 500); // Limit length
}

/**
 * Sanitize and validate task input
 * @param {Object} taskInput - Raw task input
 * @returns {Object} { isValid, data, errors, warnings }
 */
export function sanitizeAndValidateTask(taskInput) {
    const result = new ValidationResult();
    const sanitized = {};
    
    // Validate and sanitize text
    if (taskInput.text !== undefined) {
        const textResult = validateTaskText(taskInput.text);
        result.combine(textResult);
        
        if (textResult.isValid) {
            sanitized.text = sanitizeTaskText(taskInput.text);
        }
    }
    
    // Validate user
    if (taskInput.owner !== undefined) {
        const userResult = validateUserId(taskInput.owner);
        result.combine(userResult);
        
        if (userResult.isValid) {
            sanitized.owner = taskInput.owner;
        }
    }
    
    // Validate priority
    if (taskInput.priority !== undefined) {
        const priorityResult = validateTaskPriority(taskInput.priority);
        result.combine(priorityResult);
        
        if (priorityResult.isValid) {
            sanitized.priority = taskInput.priority;
        }
    }
    
    // Validate due date
    if (taskInput.dueDate !== undefined) {
        const dateResult = validateDateString(taskInput.dueDate);
        result.combine(dateResult);
        
        if (dateResult.isValid) {
            sanitized.dueDate = taskInput.dueDate;
        }
    }
    
    // Validate completed status
    if (taskInput.completed !== undefined) {
        if (typeof taskInput.completed === 'boolean') {
            sanitized.completed = taskInput.completed;
        } else {
            result.addError('Completed status must be a boolean');
        }
    }
    
    // Sanitize description
    if (taskInput.description !== undefined) {
        if (typeof taskInput.description === 'string') {
            sanitized.description = taskInput.description.trim().slice(0, 1000);
        } else {
            result.addWarning('Description must be a string, ignoring');
        }
    }
    
    return {
        isValid: result.isValid,
        data: sanitized,
        errors: result.errors,
        warnings: result.warnings
    };
}

/**
 * Validate form data from UI
 * @param {FormData|Object} formData - Form data to validate
 * @returns {Object} Validation result with sanitized data
 */
export function validateFormData(formData) {
    const result = new ValidationResult();
    const data = {};
    
    // Convert FormData to object if needed
    const input = formData instanceof FormData 
        ? Object.fromEntries(formData.entries())
        : formData;
    
    // Required fields
    const requiredFields = ['text'];
    for (const field of requiredFields) {
        if (!input[field] || typeof input[field] !== 'string' || input[field].trim() === '') {
            result.addError(`${field} is required`);
        }
    }
    
    if (result.isValid) {
        const taskResult = sanitizeAndValidateTask(input);
        result.combine(new ValidationResult(taskResult.isValid, taskResult.errors, taskResult.warnings));
        Object.assign(data, taskResult.data);
    }
    
    return {
        isValid: result.isValid,
        data,
        errors: result.errors,
        warnings: result.warnings
    };
}

/**
 * Validate bulk task operations
 * @param {Array} tasks - Array of tasks to validate
 * @returns {ValidationResult} Validation result
 */
export function validateBulkTasks(tasks) {
    const result = new ValidationResult();
    
    if (!Array.isArray(tasks)) {
        result.addError('Tasks must be an array');
        return result;
    }
    
    if (tasks.length === 0) {
        result.addWarning('No tasks to validate');
        return result;
    }
    
    if (tasks.length > 1000) {
        result.addError('Too many tasks (max 1000)');
        return result;
    }
    
    // Validate each task
    tasks.forEach((task, index) => {
        const taskResult = sanitizeAndValidateTask(task);
        if (!taskResult.isValid) {
            result.addError(`Task at index ${index}: ${taskResult.errors.join(', ')}`);
        }
        taskResult.warnings.forEach(warning => {
            result.addWarning(`Task at index ${index}: ${warning}`);
        });
    });
    
    return result;
}

/**
 * Check for duplicate tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Array of duplicate task IDs
 */
export function findDuplicateTasks(tasks) {
    const seen = new Set();
    const duplicates = [];
    
    tasks.forEach(task => {
        if (task.id) {
            if (seen.has(task.id)) {
                duplicates.push(task.id);
            } else {
                seen.add(task.id);
            }
        }
    });
    
    return duplicates;
}

/**
 * Validate storage data integrity
 * @param {Object} data - Storage data to validate
 * @returns {ValidationResult} Validation result
 */
export function validateStorageData(data) {
    const result = new ValidationResult();
    
    if (!data || typeof data !== 'object') {
        result.addError('Storage data must be an object');
        return result;
    }
    
    // Validate tasks array
    if (data.tasks) {
        const bulkResult = validateBulkTasks(data.tasks);
        result.combine(bulkResult);
        
        // Check for duplicates
        const duplicates = findDuplicateTasks(data.tasks);
        if (duplicates.length > 0) {
            result.addError(`Duplicate task IDs found: ${duplicates.join(', ')}`);
        }
    }
    
    // Validate current user
    if (data.currentUser) {
        const userResult = validateUserId(data.currentUser);
        result.combine(userResult);
    }
    
    // Validate water glasses
    if (data.waterGlasses !== undefined) {
        const waterResult = validateWaterGlasses(data.waterGlasses);
        result.combine(waterResult);
    }
    
    // Validate medication status
    if (data.medicationStatus) {
        const medResult = validateMedicationStatus(data.medicationStatus);
        result.combine(medResult);
    }
    
    return result;
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @param {boolean} required - Whether email is required
 * @returns {ValidationResult} Validation result
 */
export function validateEmail(email, required = false) {
    const result = new ValidationResult();
    
    if (!email) {
        if (required) {
            result.addError('Email is required');
        }
        return result;
    }
    
    if (typeof email !== 'string') {
        result.addError('Email must be a string');
        return result;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        result.addError('Email must be a valid email address');
    }
    
    if (email.length > 254) {
        result.addError('Email is too long (max 254 characters)');
    }
    
    return result;
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {ValidationResult} Validation result
 */
export function validateUrl(url, required = false) {
    const result = new ValidationResult();
    
    if (!url) {
        if (required) {
            result.addError('URL is required');
        }
        return result;
    }
    
    if (typeof url !== 'string') {
        result.addError('URL must be a string');
        return result;
    }
    
    try {
        new URL(url);
    } catch {
        result.addError('URL must be a valid URL');
    }
    
    return result;
}

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} required - Whether value is required
 * @returns {ValidationResult} Validation result
 */
export function validateNumericRange(value, min = -Infinity, max = Infinity, required = false) {
    const result = new ValidationResult();
    
    if (value === null || value === undefined || value === '') {
        if (required) {
            result.addError('Value is required');
        }
        return result;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
        result.addError('Value must be a valid number');
        return result;
    }
    
    if (num < min) {
        result.addError(`Value must be at least ${min}`);
    }
    
    if (num > max) {
        result.addError(`Value must be no more than ${max}`);
    }
    
    return result;
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {boolean} required - Whether string is required
 * @returns {ValidationResult} Validation result
 */
export function validateStringLength(value, minLength = 0, maxLength = Infinity, required = false) {
    const result = new ValidationResult();
    
    if (!value) {
        if (required) {
            result.addError('Value is required');
        }
        return result;
    }
    
    if (typeof value !== 'string') {
        result.addError('Value must be a string');
        return result;
    }
    
    if (value.length < minLength) {
        result.addError(`Value must be at least ${minLength} characters long`);
    }
    
    if (value.length > maxLength) {
        result.addError(`Value must be no more than ${maxLength} characters long`);
    }
    
    return result;
}

/**
 * Validate array of values
 * @param {Array} array - Array to validate
 * @param {Function} itemValidator - Validator function for each item
 * @param {Object} options - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateArray(array, itemValidator, options = {}) {
    const result = new ValidationResult();
    const opts = {
        minLength: 0,
        maxLength: Infinity,
        required: false,
        allowEmpty: true,
        ...options
    };
    
    if (!array) {
        if (opts.required) {
            result.addError('Array is required');
        }
        return result;
    }
    
    if (!Array.isArray(array)) {
        result.addError('Value must be an array');
        return result;
    }
    
    if (array.length < opts.minLength) {
        result.addError(`Array must have at least ${opts.minLength} items`);
    }
    
    if (array.length > opts.maxLength) {
        result.addError(`Array must have no more than ${opts.maxLength} items`);
    }
    
    if (array.length === 0 && !opts.allowEmpty) {
        result.addError('Array cannot be empty');
    }
    
    // Validate each item
    array.forEach((item, index) => {
        if (itemValidator) {
            const itemResult = itemValidator(item);
            if (!itemResult.isValid) {
                itemResult.errors.forEach(error => {
                    result.addError(`Item at index ${index}: ${error}`);
                });
            }
            itemResult.warnings.forEach(warning => {
                result.addWarning(`Item at index ${index}: ${warning}`);
            });
        }
    });
    
    return result;
}

/**
 * Sanitize HTML input to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html, options = {}) {
    if (typeof html !== 'string') {
        return '';
    }
    
    const opts = {
        allowedTags: [],
        allowedAttributes: [],
        stripTags: true,
        ...options
    };
    
    let sanitized = html;
    
    if (opts.stripTags) {
        // Remove all HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else {
        // Only allow specified tags and attributes
        const tagRegex = /<(\/?)([\w]+)([^>]*?)>/g;
        sanitized = sanitized.replace(tagRegex, (match, slash, tag, attributes) => {
            if (!opts.allowedTags.includes(tag.toLowerCase())) {
                return '';
            }
            
            if (opts.allowedAttributes.length > 0) {
                // Filter attributes
                const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
                const allowedAttrs = [];
                let attrMatch;
                
                while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                    const [, attrName, attrValue] = attrMatch;
                    if (opts.allowedAttributes.includes(attrName.toLowerCase())) {
                        allowedAttrs.push(`${attrName}="${attrValue}"`);
                    }
                }
                
                attributes = allowedAttrs.length > 0 ? ' ' + allowedAttrs.join(' ') : '';
            }
            
            return `<${slash}${tag}${attributes}>`;
        });
    }
    
    // Remove potentially dangerous content
    sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    return sanitized.trim();
}

/**
 * Create a composite validator
 * @param {Array} validators - Array of validator functions
 * @returns {Function} Composite validator function
 */
export function createCompositeValidator(...validators) {
    return function(value) {
        const result = new ValidationResult();
        
        for (const validator of validators) {
            const validatorResult = validator(value);
            result.combine(validatorResult);
            
            // Stop on first error if specified
            if (!validatorResult.isValid && validator.stopOnError) {
                break;
            }
        }
        
        return result;
    };
}

/**
 * Create a conditional validator
 * @param {Function} condition - Condition function
 * @param {Function} validator - Validator to apply if condition is true
 * @returns {Function} Conditional validator function
 */
export function createConditionalValidator(condition, validator) {
    return function(value, context = {}) {
        if (condition(value, context)) {
            return validator(value, context);
        }
        return new ValidationResult();
    };
}
