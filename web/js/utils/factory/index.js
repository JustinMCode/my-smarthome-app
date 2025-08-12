/**
 * Factory System Index
 * 
 * This module provides centralized access to all factory components
 * for the calendar system. It exports the base factory and all specialized
 * factory implementations.
 * 
 * @module FactorySystem
 */

// Import base factory
import { ManagerFactory } from './ManagerFactory.js';

// Import unified factory registry
import { 
    FactoryRegistry,
    FactoryTypes,
    createDataManager,
    createCellManager,
    createEventManager,
    createFilterManager,
    createLayoutManager,
    createNavigationManager,
    createSettingsManager,
    createManagers
} from './FactoryRegistry.js';

// Import legacy factory creators (deprecated)
import {
    createDataManager as legacyCreateDataManager,
    createCellManager as legacyCreateCellManager,
    createEventManager as legacyCreateEventManager,
    createFilterManager as legacyCreateFilterManager,
    createLayoutManager as legacyCreateLayoutManager,
    createNavigationManager as legacyCreateNavigationManager,
    createSettingsManager as legacyCreateSettingsManager,
    createManagers as legacyCreateManagers
} from './factory-creators.js';

// Export base factory class
export {
    ManagerFactory
};

// Export unified factory registry (recommended)
export {
    FactoryRegistry,
    FactoryTypes
};

// Export factory creation functions (recommended - from FactoryRegistry)
export {
    createDataManager,
    createCellManager,
    createEventManager,
    createFilterManager,
    createLayoutManager,
    createNavigationManager,
    createSettingsManager,
    createManagers
};

// Export legacy functions for backward compatibility (deprecated)
export {
    legacyCreateDataManager,
    legacyCreateCellManager,
    legacyCreateEventManager,
    legacyCreateFilterManager,
    legacyCreateLayoutManager,
    legacyCreateNavigationManager,
    legacyCreateSettingsManager,
    legacyCreateManagers
};

// Legacy FactoryTypes export (use FactoryTypes from FactoryRegistry instead)
export const LegacyFactoryTypes = {
    Data: 'data',
    Cell: 'cell',
    Event: 'event',
    Filter: 'filter',
    Layout: 'layout',
    Navigation: 'navigation',
    Settings: 'settings'
};

// Export factory configurations
export const FactoryConfigs = {
    Data: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Cell: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Event: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Filter: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Layout: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Navigation: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    },
    Settings: {
        enableValidation: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true
    }
};