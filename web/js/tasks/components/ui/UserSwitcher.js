/**
 * User Switcher Component
 * Handles user selection interface with visual feedback
 */

import { BaseComponent } from '../BaseComponent.js';
import { VALID_USERS, USER_TYPES } from '../../utils/TasksConstants.js';
import { getUserDisplayName } from '../../types/UserTypes.js';

/**
 * UserSwitcher - User selection component
 */
export class UserSwitcher extends BaseComponent {
    constructor(config) {
        super({
            className: 'user-switcher',
            enableEvents: true,
            autoRender: false,
            ...config
        });
        
        this.currentUser = config.currentUser || USER_TYPES.JUSTIN;
        this.showLabels = config.showLabels !== false;
    }
    
    /**
     * Generate HTML for user switcher
     */
    generateHTML() {
        const users = VALID_USERS.map(userId => ({
            id: userId,
            name: getUserDisplayName(userId),
            isActive: userId === this.currentUser
        }));
        
        const userButtons = users.map(user => `
            <button class="user-btn ${user.isActive ? 'active' : ''}" 
                    data-user="${user.id}"
                    title="Switch to ${user.name}"
                    aria-pressed="${user.isActive}">
                ${this.showLabels ? this.escapeHtml(user.name) : user.name.charAt(0)}
            </button>
        `).join('');
        
        return `
            <div class="user-switcher">
                ${userButtons}
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // User button clicks
        this.addEventListener('click', (e) => {
            const userBtn = e.target.closest('.user-btn');
            if (userBtn) {
                const userId = userBtn.dataset.user;
                this.switchToUser(userId);
            }
        });
        
        // Keyboard navigation
        this.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateUsers(e.key === 'ArrowRight' ? 1 : -1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const focusedBtn = this.$('.user-btn:focus');
                if (focusedBtn) {
                    const userId = focusedBtn.dataset.user;
                    this.switchToUser(userId);
                }
            }
        });
    }
    
    /**
     * Switch to specific user
     * @param {string} userId - User ID to switch to
     */
    switchToUser(userId) {
        if (!VALID_USERS.includes(userId)) {
            console.warn(`Invalid user ID: ${userId}`);
            return;
        }
        
        if (userId === this.currentUser) {
            return; // No change needed
        }
        
        const previousUser = this.currentUser;
        this.currentUser = userId;
        
        // Update UI
        this.updateActiveButton();
        
        // Use service to switch user
        if (this.services.user) {
            this.services.user.switchUser(userId);
        }
        
        // Emit event
        this.emit('user:switched', {
            newUser: userId,
            previousUser: previousUser
        });
    }
    
    /**
     * Navigate between users with keyboard
     * @param {number} direction - Direction (1 for next, -1 for previous)
     */
    navigateUsers(direction) {
        const currentIndex = VALID_USERS.indexOf(this.currentUser);
        let nextIndex = currentIndex + direction;
        
        // Wrap around
        if (nextIndex >= VALID_USERS.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = VALID_USERS.length - 1;
        }
        
        const nextUser = VALID_USERS[nextIndex];
        this.switchToUser(nextUser);
        
        // Focus the new button
        const newButton = this.$(`[data-user="${nextUser}"]`);
        if (newButton) {
            newButton.focus();
        }
    }
    
    /**
     * Update active button visual state
     */
    updateActiveButton() {
        // Remove active class from all buttons
        this.$$('.user-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to current user button
        const activeButton = this.$(`[data-user="${this.currentUser}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
        }
    }
    
    /**
     * Set current user and update UI
     * @param {string} userId - User ID to set as current
     */
    setCurrentUser(userId) {
        if (VALID_USERS.includes(userId)) {
            this.currentUser = userId;
            this.updateActiveButton();
        }
    }
    
    /**
     * Get current user
     * @returns {string} Current user ID
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Enable/disable user switching
     * @param {boolean} enabled - Whether switching should be enabled
     */
    setEnabled(enabled) {
        this.$$('.user-btn').forEach(btn => {
            btn.disabled = !enabled;
        });
        
        if (enabled) {
            this.removeClass('disabled');
        } else {
            this.addClass('disabled');
        }
    }
    
    /**
     * Add visual feedback for user switch
     * @param {string} userId - User that was switched to
     */
    showSwitchFeedback(userId) {
        const button = this.$(`[data-user="${userId}"]`);
        if (button) {
            // Add temporary animation class
            button.classList.add('switched');
            
            setTimeout(() => {
                button.classList.remove('switched');
            }, 300);
        }
    }
    
    /**
     * Bind to state changes
     */
    onRender() {
        super.onRender();
        
        // Subscribe to current user changes
        if (this.state) {
            this.subscribeToState('currentUser', (newUser) => {
                if (newUser !== this.currentUser) {
                    this.setCurrentUser(newUser);
                    this.showSwitchFeedback(newUser);
                }
            });
        }
    }
}