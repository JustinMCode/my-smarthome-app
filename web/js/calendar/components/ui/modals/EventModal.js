/**
 * Event Modal Component
 * Centralized modal/popup creation for event details and day events
 */

import { formatDate } from '../../../utils/calendar-date-utils.js';

export class EventModal {
    constructor() {
        this.activeModals = new Set();
        this.defaultOptions = {
            backdrop: true,
            closeOnEscape: true,
            closeOnBackdrop: true,
            animation: true,
            zIndex: 1000
        };
    }

    /**
     * Show event details modal
     */
    showEventDetails(event, options = {}) {
        const modalOptions = { ...this.defaultOptions, ...options };
        
        const content = this.createEventDetailsContent(event);
        return this.showModal(content, {
            ...modalOptions,
            title: event.title,
            className: 'event-details-modal'
        });
    }

    /**
     * Show day events popup
     */
    showDayEventsPopup(date, events, options = {}) {
        const modalOptions = { ...this.defaultOptions, ...options };
        
        const content = this.createDayEventsContent(date, events);
        return this.showModal(content, {
            ...modalOptions,
            title: this.formatDateForPopupHeader(date),
            className: 'day-events-modal',
            width: '448px'
        });
    }

    /**
     * Show quick add event dialog
     */
    showQuickAddDialog(startTime, endTime = null, options = {}) {
        const modalOptions = { ...this.defaultOptions, ...options };
        
        const content = this.createQuickAddContent(startTime, endTime);
        return this.showModal(content, {
            ...modalOptions,
            title: 'Add Event',
            className: 'quick-add-modal'
        });
    }

    /**
     * Show generic modal
     */
    showModal(content, options = {}) {
        const modalOptions = { ...this.defaultOptions, ...options };
        
        // Create overlay
        const overlay = this.createOverlay(modalOptions);
        
        // Create modal
        const modal = this.createModal(content, modalOptions);
        
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // Add to active modals
        this.activeModals.add(modal);
        
        // Setup event listeners
        this.setupModalEventListeners(modal, overlay, modalOptions);
        
        // Add animations
        if (modalOptions.animation) {
            this.addModalAnimations(modal, overlay);
        }
        
        return { modal, overlay };
    }

    /**
     * Create overlay element
     */
    createOverlay(options) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: ${options.zIndex};
            animation: fadeIn 0.2s ease;
        `;
        
        return overlay;
    }

    /**
     * Create modal element
     */
    createModal(content, options) {
        const modal = document.createElement('div');
        modal.className = `modal ${options.className || ''}`;
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
            z-index: ${options.zIndex + 1};
            width: ${options.width || '400px'};
            max-width: 90vw;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease;
        `;
        
        // Add header if title is provided
        if (options.title) {
            const header = this.createModalHeader(options.title);
            modal.appendChild(header);
        }
        
        // Add content
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            overflow-y: auto;
            flex: 1;
            overscroll-behavior: contain;
        `;
        contentContainer.innerHTML = content;
        modal.appendChild(contentContainer);
        
        return modal;
    }

    /**
     * Create modal header
     */
    createModalHeader(title) {
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 24px 24px 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        const titleEl = document.createElement('h2');
        titleEl.style.cssText = `
            font-size: 22px;
            font-weight: 400;
            color: #3c4043;
            margin: 0;
            font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        titleEl.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;
        closeBtn.style.cssText = `
            background: none;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5f6368;
            transition: background 0.2s;
        `;
        closeBtn.title = 'Close';
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        
        return header;
    }

    /**
     * Create event details content
     */
    createEventDetailsContent(event) {
        const datetime = this.formatEventDateTime(event);
        const color = event.color || '#3B82F6';
        
        return `
            <div style="padding: 24px;">
                <div style="
                    font-size: 18px;
                    color: #3c4043;
                    margin-bottom: 16px;
                    font-weight: 500;
                ">${event.title}</div>
                
                <div style="
                    font-size: 14px;
                    color: #70757a;
                    margin-bottom: 8px;
                ">${datetime.fullString}</div>
                
                ${event.location ? `
                    <div style="
                        font-size: 14px;
                        color: #70757a;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#70757a">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        ${event.location}
                    </div>
                ` : ''}
                
                ${event.description ? `
                    <div style="
                        font-size: 14px;
                        color: #70757a;
                        margin-top: 16px;
                        line-height: 20px;
                        white-space: pre-wrap;
                    ">${event.description}</div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create day events content
     */
    createDayEventsContent(date, events) {
        if (events.length === 0) {
            return `
                <div style="
                    padding: 48px 24px;
                    text-align: center;
                    color: #80868b;
                ">
                    <div style="
                        width: 120px;
                        height: 120px;
                        margin: 0 auto 24px;
                        background: #f8f9fa;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="#dadce0">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                    </div>
                    <div style="font-size: 14px; line-height: 20px;">No events</div>
                </div>
            `;
        }

        const eventsHtml = events.map(event => {
            const datetime = this.formatEventDateTime(event);
            const recurrence = this.formatRecurrence(event);
            const color = event.color || '#3B82F6';

            const dateTimeLine = `${datetime.date}${datetime.time ? ', ' + datetime.time : ''}`;

            return `
                <div class="event-item" style="
                    position: relative;
                    padding: 16px 24px;
                    border-bottom: 1px solid #e0e0e0;
                    cursor: default;
                ">
                    ${event.allDay ? `
                        <div style="
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            width: 4px;
                            background: ${color};
                            border-radius: 0 4px 4px 0;
                        "></div>
                    ` : ''}
                    <div style="
                        font-size: 16px;
                        color: #3c4043;
                        margin-bottom: 4px;
                        font-weight: 600;
                        text-align: left;
                    ">${event.title || 'Event'}</div>
                    <ul style="
                        margin: 0;
                        padding: 0;
                        list-style-position: inside;
                        color: #70757a;
                        font-size: 14px;
                        line-height: 18px;
                        text-align: left;
                    ">
                        <li style="margin: 0; padding: 0; text-indent: -6px; padding-left: 6px;">${dateTimeLine}</li>
                        ${recurrence ? `<li style=\"margin: 0; padding: 0; text-indent: -6px; padding-left: 6px;\">${recurrence}</li>` : ''}
                    </ul>
                </div>
            `;
        }).join('');

        return eventsHtml;
    }

    /**
     * Create quick add content
     */
    createQuickAddContent(startTime, endTime) {
        const message = endTime 
            ? `Create event: ${this.formatTime(startTime)} - ${this.formatTime(endTime)}`
            : `Create event at ${this.formatTime(startTime)}`;
            
        return `
            <div style="padding: 24px;">
                <div style="
                    font-size: 16px;
                    color: #3c4043;
                    margin-bottom: 16px;
                ">${message}</div>
                
                <div style="
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                ">
                    <button class="btn-secondary" style="
                        padding: 8px 16px;
                        border: 1px solid #dadce0;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button class="btn-primary" style="
                        padding: 8px 16px;
                        background: #1a73e8;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Create</button>
                </div>
            </div>
        `;
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners(modal, overlay, options) {
        const closeModal = () => this.closeModal(modal, overlay);
        
        // Close button
        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Backdrop click
        if (options.closeOnBackdrop) {
            overlay.addEventListener('click', closeModal);
        }
        
        // Escape key
        if (options.closeOnEscape) {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }
        
        // Prevent modal click from closing
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Add modal animations
     */
    addModalAnimations(modal, overlay) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translate(-50%, -45%);
                }
                to { 
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Remove style when modal closes
        modal.addEventListener('remove', () => {
            style.remove();
        });
    }

    /**
     * Close modal
     */
    closeModal(modal, overlay) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        this.activeModals.delete(modal);
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        // Create a copy of the set to avoid modification during iteration
        const modalsToClose = Array.from(this.activeModals);
        
        modalsToClose.forEach(modal => {
            // Find the overlay that's closest to this modal
            let overlay = null;
            if (modal.previousElementSibling && modal.previousElementSibling.classList.contains('modal-overlay')) {
                overlay = modal.previousElementSibling;
            } else {
                // Fallback: find any overlay
                overlay = document.querySelector('.modal-overlay');
            }
            this.closeModal(modal, overlay);
        });
        
        // Also close any remaining modals that might not be in activeModals
        const remainingModals = document.querySelectorAll('.modal, .modal-overlay');
        remainingModals.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }

    /**
     * Format event date and time
     */
    formatEventDateTime(event) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : null;
        
        const dayName = days[startDate.getDay()];
        const monthName = months[startDate.getMonth()];
        const dayNum = startDate.getDate();
        
        const dateStr = `${dayName}, ${monthName} ${dayNum}`;
        
        // For all-day events, don't show time
        if (event.allDay) {
            return {
                date: dateStr,
                time: null,
                fullString: dateStr
            };
        }
        
        // For timed events, show the time
        const startTime = this.formatTime(startDate);
        const endTime = endDate ? this.formatTime(endDate) : null;
        const timeStr = endTime ? `${startTime} – ${endTime}` : startTime;
        
        return {
            date: dateStr,
            time: timeStr,
            fullString: `${dateStr} ⋅ ${timeStr}`
        };
    }

    /**
     * Format recurrence information
     */
    formatRecurrence(event) {
        if (!event.recurrence || !Array.isArray(event.recurrence) || event.recurrence.length === 0) {
            return null;
        }

        const rrule = event.recurrence.find(rule => rule.startsWith('RRULE:'));
        if (!rrule) {
            return null;
        }

        // Parse RRULE
        const rruleStr = rrule.substring(6); // Remove 'RRULE:' prefix
        const parts = rruleStr.split(';');
        const params = {};
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = value;
            }
        });

        // Handle different recurrence types
        if (params.FREQ === 'WEEKLY') {
            if (params.BYDAY) {
                const days = params.BYDAY.split(',');
                const dayNames = days.map(day => {
                    const dayMap = {
                        'SU': 'Sunday',
                        'MO': 'Monday', 
                        'TU': 'Tuesday',
                        'WE': 'Wednesday',
                        'TH': 'Thursday',
                        'FR': 'Friday',
                        'SA': 'Saturday'
                    };
                    return dayMap[day] || day;
                });
                
                if (dayNames.length === 1) {
                    return `Weekly on ${dayNames[0]}`;
                } else {
                    return `Weekly on ${dayNames.slice(0, -1).join(', ')} and ${dayNames[dayNames.length - 1]}`;
                }
            } else {
                return 'Weekly';
            }
        } else if (params.FREQ === 'DAILY') {
            return 'Daily';
        } else if (params.FREQ === 'MONTHLY') {
            return 'Monthly';
        } else if (params.FREQ === 'YEARLY') {
            return 'Yearly';
        }

        return null;
    }

    /**
     * Format date for popup header
     */
    formatDateForPopupHeader(date) {
        const currentYear = new Date().getFullYear();
        const year = date.getFullYear();
        
        if (year === currentYear) {
            return formatDate(date, 'long');
        } else {
            return formatDate(date, 'full');
        }
    }

    /**
     * Format time for display
     */
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    /**
     * Get active modals count
     */
    getActiveModalsCount() {
        return this.activeModals.size;
    }

    /**
     * Destroy the modal manager
     */
    destroy() {
        this.closeAllModals();
        this.activeModals.clear();
    }
}

export default EventModal;


