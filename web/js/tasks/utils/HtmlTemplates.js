/**
 * HTML Templates
 * Centralized template management for consistent HTML generation
 */

import { escapeHtml, generateId } from './TasksHelpers.js';
import { WATER_CONFIG, MEDICATION_CONFIG } from './TasksConstants.js';

/**
 * Template generator for common HTML patterns
 */
export class HtmlTemplates {
    
    /**
     * Generate task item template
     * @param {Object} task - Task data
     * @param {number} animationDelay - Animation delay in ms
     * @returns {string} HTML string
     */
    static taskItem(task, animationDelay = 0) {
        const completedClass = task.completed ? 'completed' : '';
        
        return `
            <div class="task-item ${completedClass}" 
                 data-task-id="${task.id}" 
                 style="animation-delay: ${animationDelay}ms">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-owner">${escapeHtml(task.owner)}</span>
                <button class="delete-btn" title="Delete task">Delete</button>
            </div>
        `;
    }
    
    /**
     * Generate empty state template
     * @param {string} message - Empty state message
     * @param {string} icon - Icon for empty state
     * @returns {string} HTML string
     */
    static emptyState(message, icon = '📋') {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-message">${escapeHtml(message)}</div>
            </div>
        `;
    }
    
    /**
     * Generate loading state template
     * @param {string} message - Loading message
     * @returns {string} HTML string
     */
    static loadingState(message = 'Loading...') {
        return `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-message">${escapeHtml(message)}</div>
            </div>
        `;
    }
    
    /**
     * Generate error state template
     * @param {string} message - Error message
     * @param {string} action - Optional action button text
     * @returns {string} HTML string
     */
    static errorState(message, action = null) {
        const actionButton = action ? 
            `<button class="error-action-btn">${escapeHtml(action)}</button>` : '';
        
        return `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${escapeHtml(message)}</div>
                ${actionButton}
            </div>
        `;
    }
    
    /**
     * Generate user button template
     * @param {Object} user - User data
     * @param {boolean} isActive - Whether user is active
     * @param {boolean} showLabel - Whether to show full label
     * @returns {string} HTML string
     */
    static userButton(user, isActive = false, showLabel = true) {
        const activeClass = isActive ? 'active' : '';
        const label = showLabel ? escapeHtml(user.name) : user.name.charAt(0);
        
        return `
            <button class="user-btn ${activeClass}" 
                    data-user="${user.id}"
                    title="Switch to ${escapeHtml(user.name)}"
                    aria-pressed="${isActive}">
                ${label}
            </button>
        `;
    }
    
    /**
     * Generate stat item template
     * @param {string} id - Element ID
     * @param {number} value - Stat value
     * @param {string} label - Stat label
     * @returns {string} HTML string
     */
    static statItem(id, value, label) {
        return `
            <div class="stat-item-header">
                <div class="stat-value-header" id="${id}">${value}</div>
                <div class="stat-label-header">${escapeHtml(label)}</div>
            </div>
        `;
    }
    
    /**
     * Generate water glass template
     * @param {number} index - Glass index
     * @param {boolean} isFilled - Whether glass is filled
     * @param {number} maxGlasses - Maximum glasses
     * @param {number} animationDelay - Animation delay
     * @returns {string} HTML string
     */
    static waterGlass(index, isFilled, maxGlasses, animationDelay = 0) {
        const glassClass = `mini-glass ${isFilled ? 'filled' : ''}`;
        const glassContent = isFilled ? '💧' : '○';
        const title = isFilled ? 'Remove glass' : 'Add glass';
        
        return `
            <button class="${glassClass}" 
                    data-glass-index="${index}"
                    style="animation-delay: ${animationDelay}ms"
                    title="${title}"
                    aria-label="Glass ${index + 1} of ${maxGlasses}">
                ${glassContent}
            </button>
        `;
    }
    
    /**
     * Generate medication item template
     * @param {string} id - Checkbox ID
     * @param {string} type - Medication type
     * @param {boolean} checked - Whether checked
     * @param {string} icon - Medication icon
     * @param {string} time - Time of day
     * @returns {string} HTML string
     */
    static medicationItem(id, type, checked, icon, time) {
        return `
            <label class="med-item">
                <input type="checkbox" 
                       class="med-checkbox" 
                       id="${id}"
                       ${checked ? 'checked' : ''}>
                <span class="med-time">${escapeHtml(time)}</span>
                <span class="med-icon">${icon}</span>
            </label>
        `;
    }
    
    /**
     * Generate notification template
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {boolean} dismissible - Whether notification can be dismissed
     * @returns {string} HTML string
     */
    static notification(message, type = 'info', dismissible = true) {
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const dismissButton = dismissible ? 
            '<button class="notification-dismiss" aria-label="Dismiss">×</button>' : '';
        
        return `
            <div class="notification notification-${type}" role="alert">
                <div class="notification-content">
                    <span class="notification-icon">${icons[type] || icons.info}</span>
                    <span class="notification-message">${escapeHtml(message)}</span>
                </div>
                ${dismissButton}
            </div>
        `;
    }
    
    /**
     * Generate progress bar template
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} id - Element ID
     * @param {string} className - CSS class name
     * @param {boolean} showText - Whether to show percentage text
     * @returns {string} HTML string
     */
    static progressBar(percentage, id = '', className = 'progress-bar', showText = false) {
        const idAttr = id ? `id="${id}"` : '';
        const textDisplay = showText ? `<span class="progress-text">${percentage}%</span>` : '';
        
        return `
            <div class="${className}" ${idAttr}>
                <div class="progress-fill" style="width: ${percentage}%;"></div>
                ${textDisplay}
            </div>
        `;
    }
    
    /**
     * Generate input group template
     * @param {Object} config - Input configuration
     * @returns {string} HTML string
     */
    static inputGroup(config) {
        const {
            id = generateId('input'),
            type = 'text',
            placeholder = '',
            value = '',
            buttonText = 'Submit',
            buttonId = generateId('button'),
            className = 'input-group',
            required = false,
            maxLength = null
        } = config;
        
        const requiredAttr = required ? 'required' : '';
        const maxLengthAttr = maxLength ? `maxlength="${maxLength}"` : '';
        
        return `
            <div class="${className}">
                <input type="${type}" 
                       id="${id}"
                       placeholder="${escapeHtml(placeholder)}"
                       value="${escapeHtml(value)}"
                       autocomplete="off"
                       ${requiredAttr}
                       ${maxLengthAttr}>
                <button id="${buttonId}" type="button">
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }
    
    /**
     * Generate form error template
     * @param {string} message - Error message
     * @param {string} id - Element ID
     * @returns {string} HTML string
     */
    static formError(message, id = generateId('error')) {
        return `
            <div class="form-error" id="${id}" style="display: none;">
                ${escapeHtml(message)}
            </div>
        `;
    }
    
    /**
     * Generate modal template
     * @param {Object} config - Modal configuration
     * @returns {string} HTML string
     */
    static modal(config) {
        const {
            id = generateId('modal'),
            title = '',
            content = '',
            showCloseButton = true,
            className = 'modal'
        } = config;
        
        const closeButton = showCloseButton ? 
            '<button class="modal-close" aria-label="Close">×</button>' : '';
        
        return `
            <div class="${className}" id="${id}" role="dialog" aria-modal="true">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${escapeHtml(title)}</h2>
                        ${closeButton}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate tooltip template
     * @param {string} content - Tooltip content
     * @param {string} position - Tooltip position (top, bottom, left, right)
     * @returns {string} HTML string
     */
    static tooltip(content, position = 'top') {
        return `
            <div class="tooltip tooltip-${position}" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-content">${escapeHtml(content)}</div>
            </div>
        `;
    }
    
    /**
     * Generate card template
     * @param {Object} config - Card configuration
     * @returns {string} HTML string
     */
    static card(config) {
        const {
            title = '',
            content = '',
            footer = '',
            className = 'card',
            id = ''
        } = config;
        
        const idAttr = id ? `id="${id}"` : '';
        const titleSection = title ? `<div class="card-header"><h3 class="card-title">${escapeHtml(title)}</h3></div>` : '';
        const footerSection = footer ? `<div class="card-footer">${footer}</div>` : '';
        
        return `
            <div class="${className}" ${idAttr}>
                ${titleSection}
                <div class="card-body">
                    ${content}
                </div>
                ${footerSection}
            </div>
        `;
    }
    
    /**
     * Generate breadcrumb template
     * @param {Array} items - Breadcrumb items [{text, href, active}]
     * @returns {string} HTML string
     */
    static breadcrumb(items) {
        const breadcrumbItems = items.map((item, index) => {
            const isLast = index === items.length - 1;
            const activeClass = item.active || isLast ? 'active' : '';
            
            if (item.href && !item.active && !isLast) {
                return `<li class="breadcrumb-item ${activeClass}"><a href="${item.href}">${escapeHtml(item.text)}</a></li>`;
            } else {
                return `<li class="breadcrumb-item ${activeClass}">${escapeHtml(item.text)}</li>`;
            }
        }).join('');
        
        return `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    ${breadcrumbItems}
                </ol>
            </nav>
        `;
    }
    
    /**
     * Generate pagination template
     * @param {Object} config - Pagination configuration
     * @returns {string} HTML string
     */
    static pagination(config) {
        const {
            currentPage = 1,
            totalPages = 1,
            maxVisible = 5,
            showFirstLast = true,
            showPrevNext = true
        } = config;
        
        const pages = [];
        
        if (showFirstLast && currentPage > 1) {
            pages.push('<li class="page-item"><a class="page-link" href="#" data-page="1">First</a></li>');
        }
        
        if (showPrevNext && currentPage > 1) {
            pages.push(`<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`);
        }
        
        // Calculate visible page range
        const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            pages.push(`<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
        }
        
        if (showPrevNext && currentPage < totalPages) {
            pages.push(`<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`);
        }
        
        if (showFirstLast && currentPage < totalPages) {
            pages.push(`<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">Last</a></li>`);
        }
        
        return `
            <nav aria-label="pagination">
                <ul class="pagination">
                    ${pages.join('')}
                </ul>
            </nav>
        `;
    }
}

/**
 * Template cache for performance optimization
 */
export class TemplateCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
    
    /**
     * Get template from cache or generate
     * @param {string} key - Cache key
     * @param {Function} generator - Template generator function
     * @returns {string} HTML string
     */
    get(key, generator) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const template = generator();
        this.set(key, template);
        return template;
    }
    
    /**
     * Set template in cache
     * @param {string} key - Cache key
     * @param {string} template - HTML template
     */
    set(key, template) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, template);
    }
    
    /**
     * Clear template cache
     */
    clear() {
        this.cache.clear();
    }
    
    /**
     * Get cache size
     * @returns {number} Cache size
     */
    size() {
        return this.cache.size;
    }
}

// Global template cache instance
export const templateCache = new TemplateCache();