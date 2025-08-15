/**
 * Storage Service - Data Persistence Layer
 * Handles all storage operations with error handling and abstraction
 * Provides a clean interface for data persistence with validation
 */

import { DEBUG_PREFIXES, ERROR_MESSAGES, EVENTS } from '../utils/TasksConstants.js';
import { validateStorageData } from '../utils/TasksValidation.js';
import { safeJsonParse, safeJsonStringify } from '../utils/TasksHelpers.js';
import { debug } from '../../constants/config.js';

/**
 * StorageService - Handles data persistence with error handling
 */
export class StorageService {
    constructor(config, events) {
        this.config = config;
        this.events = events;
        this.storage = window.localStorage;
        this.storageKeys = config.getStorageKeys();
        this.enableAutoSave = config.get('storage.enableAutoSave');
        this.saveDebounceMs = config.get('storage.saveDebounceMs');
        
        // Debounced save to prevent excessive storage writes
        this.debouncedSave = this.createDebouncedSave();
        
        debug(DEBUG_PREFIXES.STORAGE, 'StorageService initialized', {
            keys: this.storageKeys,
            autoSave: this.enableAutoSave
        });
    }
    
    /**
     * Load all data from storage
     * @returns {Promise<Object>} Combined data object
     */
    async loadAll() {
        debug(DEBUG_PREFIXES.STORAGE, 'Loading all data from storage');
        
        try {
            const data = {};
            
            // Load tasks
            data.tasks = await this.loadTasks();
            
            // Load user data
            data.currentUser = await this.loadCurrentUser();
            
            // Load health data
            const healthData = await this.loadHealthData();
            data.waterGlasses = healthData.waterGlasses;
            data.maxWaterGlasses = healthData.maxWaterGlasses;
            data.medicationStatus = healthData.medicationStatus;
            
            // Load task counter
            data.taskIdCounter = await this.loadTaskIdCounter(data.tasks);
            
            debug(DEBUG_PREFIXES.STORAGE, 'All data loaded successfully', {
                tasksCount: data.tasks.length,
                currentUser: data.currentUser,
                waterGlasses: data.waterGlasses
            });
            
            return data;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error loading data:', error);
            this.events?.emit(EVENTS.STORAGE_ERROR, { operation: 'loadAll', error });
            throw new Error(`${ERROR_MESSAGES.STORAGE_LOAD_FAILED}: ${error.message}`);
        }
    }
    
    /**
     * Save all data to storage
     * @param {Object} data - Data to save
     * @returns {Promise<boolean>} Success status
     */
    async saveAll(data) {
        debug(DEBUG_PREFIXES.STORAGE, 'Saving all data to storage');
        
        try {
            // Validate data before saving
            const validation = validateStorageData(data);
            if (!validation.isValid) {
                throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
            }
            
            // Save each data type
            await Promise.all([
                this.saveTasks(data.tasks),
                this.saveCurrentUser(data.currentUser),
                this.saveHealthData({
                    waterGlasses: data.waterGlasses,
                    maxWaterGlasses: data.maxWaterGlasses,
                    medicationStatus: data.medicationStatus
                })
            ]);
            
            debug(DEBUG_PREFIXES.STORAGE, 'All data saved successfully');
            this.events?.emit(EVENTS.STATE_SAVED, data);
            
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error saving data:', error);
            this.events?.emit(EVENTS.STORAGE_ERROR, { operation: 'saveAll', error });
            throw new Error(`${ERROR_MESSAGES.STORAGE_SAVE_FAILED}: ${error.message}`);
        }
    }
    
    /**
     * Load tasks from storage
     * @returns {Promise<Array>} Array of tasks
     */
    async loadTasks() {
        try {
            const tasksJson = this.storage.getItem(this.storageKeys.TASKS);
            
            if (!tasksJson) {
                debug(DEBUG_PREFIXES.STORAGE, 'No tasks found in storage, using defaults');
                return this.config.getDefaultState().tasks;
            }
            
            const tasks = safeJsonParse(tasksJson, []);
            
            if (!Array.isArray(tasks)) {
                debug(DEBUG_PREFIXES.STORAGE, 'Invalid tasks format, using defaults');
                return this.config.getDefaultState().tasks;
            }
            
            debug(DEBUG_PREFIXES.STORAGE, `Loaded ${tasks.length} tasks from storage`);
            return tasks;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error loading tasks:', error);
            return this.config.getDefaultState().tasks;
        }
    }
    
    /**
     * Save tasks to storage
     * @param {Array} tasks - Tasks to save
     * @returns {Promise<boolean>} Success status
     */
    async saveTasks(tasks) {
        try {
            if (!Array.isArray(tasks)) {
                throw new Error('Tasks must be an array');
            }
            
            const tasksJson = safeJsonStringify(tasks);
            this.storage.setItem(this.storageKeys.TASKS, tasksJson);
            
            debug(DEBUG_PREFIXES.STORAGE, `Saved ${tasks.length} tasks to storage`);
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error saving tasks:', error);
            throw error;
        }
    }
    
    /**
     * Load current user from storage
     * @returns {Promise<string>} Current user ID
     */
    async loadCurrentUser() {
        try {
            const user = this.storage.getItem(this.storageKeys.CURRENT_USER);
            const validUsers = ['justin', 'brooke'];
            
            if (user && validUsers.includes(user)) {
                debug(DEBUG_PREFIXES.STORAGE, `Loaded current user: ${user}`);
                return user;
            }
            
            const defaultUser = this.config.getDefaultState().currentUser;
            debug(DEBUG_PREFIXES.STORAGE, `Using default user: ${defaultUser}`);
            return defaultUser;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error loading current user:', error);
            return this.config.getDefaultState().currentUser;
        }
    }
    
    /**
     * Save current user to storage
     * @param {string} user - User ID to save
     * @returns {Promise<boolean>} Success status
     */
    async saveCurrentUser(user) {
        try {
            if (typeof user !== 'string') {
                throw new Error('User must be a string');
            }
            
            this.storage.setItem(this.storageKeys.CURRENT_USER, user);
            debug(DEBUG_PREFIXES.STORAGE, `Saved current user: ${user}`);
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error saving current user:', error);
            throw error;
        }
    }
    
    /**
     * Load health data from storage
     * @returns {Promise<Object>} Health data object
     */
    async loadHealthData() {
        try {
            const data = {};
            
            // Load water tracking
            const waterGlasses = this.storage.getItem(this.storageKeys.WATER);
            data.waterGlasses = waterGlasses ? parseInt(waterGlasses) : 0;
            data.maxWaterGlasses = this.config.get('water.MAX_GLASSES') || 8;
            
            if (isNaN(data.waterGlasses) || data.waterGlasses < 0) {
                data.waterGlasses = 0;
            }
            
            // Load medication status
            const medicationJson = this.storage.getItem(this.storageKeys.MEDICATION);
            data.medicationStatus = medicationJson 
                ? safeJsonParse(medicationJson, this.config.getDefaultState().medicationStatus)
                : this.config.getDefaultState().medicationStatus;
            
            debug(DEBUG_PREFIXES.STORAGE, 'Loaded health data:', data);
            return data;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error loading health data:', error);
            return {
                waterGlasses: 0,
                maxWaterGlasses: 8,
                medicationStatus: this.config.getDefaultState().medicationStatus
            };
        }
    }
    
    /**
     * Save health data to storage
     * @param {Object} healthData - Health data to save
     * @returns {Promise<boolean>} Success status
     */
    async saveHealthData(healthData) {
        try {
            // Save water glasses
            if (typeof healthData.waterGlasses === 'number') {
                this.storage.setItem(this.storageKeys.WATER, healthData.waterGlasses.toString());
            }
            
            // Save medication status
            if (healthData.medicationStatus) {
                const medicationJson = safeJsonStringify(healthData.medicationStatus);
                this.storage.setItem(this.storageKeys.MEDICATION, medicationJson);
            }
            
            debug(DEBUG_PREFIXES.STORAGE, 'Saved health data');
            return true;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error saving health data:', error);
            throw error;
        }
    }
    
    /**
     * Load or calculate task ID counter
     * @param {Array} tasks - Current tasks array
     * @returns {Promise<number>} Next task ID
     */
    async loadTaskIdCounter(tasks) {
        try {
            if (!Array.isArray(tasks) || tasks.length === 0) {
                return 1;
            }
            
            // Find the highest existing ID and increment
            const maxId = Math.max(...tasks.map(t => parseInt(t.id) || 0));
            return maxId + 1;
            
        } catch (error) {
            debug(DEBUG_PREFIXES.STORAGE, 'Error calculating task ID counter:', error);
            return 1;
        }
    }
    
    /**
     * Create debounced save function
     * @private
     */
    createDebouncedSave() {
        let timeoutId = null;
        
        return (data) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            timeoutId = setTimeout(() => {
                this.saveAll(data).catch(error => {
                    debug(DEBUG_PREFIXES.STORAGE, 'Debounced save error:', error);
                });
            }, this.saveDebounceMs);
        };
    }
    
    /**
     * Auto-save data with debouncing
     * @param {Object} data - Data to save
     */
    autoSave(data) {
        if (this.enableAutoSave) {
            this.debouncedSave(data);
        }
    }
    
    /**
     * Check if storage is available
     * @returns {boolean} True if storage is available
     */
    isStorageAvailable() {
        try {
            const testKey = '_test_storage_';
            this.storage.setItem(testKey, 'test');
            this.storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        debug(DEBUG_PREFIXES.STORAGE, 'Destroying StorageService');
        this.config = null;
        this.events = null;
        this.storage = null;
    }
}