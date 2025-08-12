/**
 * Base Modal Component
 * Abstract base class for all modal components
 * 
 * Provides common modal functionality including:
 * - Overlay creation and management
 * - Event handling (escape, backdrop click)
 * - Animation support
 * - Lifecycle management
 * 
 * @abstract
 */
export class BaseModal {
    constructor(options = {}) {
        this.options = {
            backdrop: true,
            closeOnEscape: true,
            closeOnBackdrop: true,
            animation: true,
            zIndex: 1000,
            width: 'auto',
            height: 'auto',
            ...options
        };
        
        this.activeModals = new Set();
        this.isDestroyed = false;
    }

    /**
     * Show the modal
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance with modal and overlay elements
     */
    show(options = {}) {
        const modalOptions = { ...this.options, ...options };
        
        // Create content (to be implemented by subclasses)
        const content = this.createContent(modalOptions);
        if (!content) {
            throw new Error('Modal content must be created by subclass');
        }
        
        // Create and show modal
        return this.showModal(content, modalOptions);
    }

    /**
     * Create modal content - must be implemented by subclasses
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal content element
     * @abstract
     */
    createContent(options) {
        throw new Error('createContent() must be implemented by subclass');
    }

    /**
     * Show modal with given content
     * @param {HTMLElement} content - Modal content
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    showModal(content, options = {}) {
        const modalOptions = { ...this.options, ...options };
        
        // Prevent modal stacking - close any existing modals first
        if (modalOptions.closeExisting !== false) {
            this.closeAll();
        }
        
        // Create overlay
        const overlay = this.createOverlay(modalOptions);
        
        // Create modal
        const modal = this.createModal(content, modalOptions);
        
        // Add to DOM (nest modal inside overlay for proper centering)
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add to active modals
        this.activeModals.add(modal);
        
        // Setup event listeners
        this.setupEventListeners(modal, overlay, modalOptions);
        
        // Add animations
        if (modalOptions.animation) {
            this.addAnimations(modal, overlay);
        }
        
        return { modal, overlay };
    }

    /**
     * Create overlay element
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Overlay element
     */
    createOverlay(options) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: ${options.zIndex};
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        return overlay;
    }

    /**
     * Create modal element
     * @param {HTMLElement} content - Modal content
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    createModal(content, options) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            position: relative;
            z-index: ${options.zIndex + 1};
            width: ${options.width};
            height: ${options.height};
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        // Add content
        modal.appendChild(content);
        
        return modal;
    }

    /**
     * Setup event listeners
     * @param {HTMLElement} modal - Modal element
     * @param {HTMLElement} overlay - Overlay element
     * @param {Object} options - Modal options
     */
    setupEventListeners(modal, overlay, options) {
        const closeModal = () => this.close(modal, overlay);
        
        // Close on backdrop click
        if (options.closeOnBackdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal();
                }
            });
        }
        
        // Close on escape key
        if (options.closeOnEscape) {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }
        
        // Store close function for manual closing
        modal._closeModal = closeModal;
    }

    /**
     * Add animations
     * @param {HTMLElement} modal - Modal element
     * @param {HTMLElement} overlay - Overlay element
     */
    addAnimations(modal, overlay) {
        // Trigger animations on next frame
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
            modal.style.opacity = '1';
        });
    }

    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element
     * @param {HTMLElement} overlay - Overlay element
     */
    close(modal, overlay) {
        if (!modal || !overlay) return;
        
        // Remove from active modals
        this.activeModals.delete(modal);
        
        // Add closing animations
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        modal.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
            // Safely remove overlay
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            // Safely remove modal
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            
            // Clean up any event listeners
            this._cleanupModalEventListeners(modal);
        }, 300);
    }

    /**
     * Clean up event listeners for modal
     * @param {HTMLElement} modal - Modal element
     */
    _cleanupModalEventListeners(modal) {
        if (!modal) return;
        
        // Remove any stored event listeners
        if (modal._closeModal) {
            delete modal._closeModal;
        }
        
        // Remove any other custom properties
        Object.keys(modal).forEach(key => {
            if (key.startsWith('_')) {
                delete modal[key];
            }
        });
    }

    /**
     * Close all active modals
     */
    closeAll() {
        this.activeModals.forEach(modal => {
            if (modal._closeModal) {
                modal._closeModal();
            }
        });
        this.activeModals.clear();
    }

    /**
     * Get count of active modals
     * @returns {number} Number of active modals
     */
    getActiveCount() {
        return this.activeModals.size;
    }

    /**
     * Update modal options
     * @param {Object} newOptions - New options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Destroy modal instance
     */
    destroy() {
        this.closeAll();
        this.isDestroyed = true;
    }
}
