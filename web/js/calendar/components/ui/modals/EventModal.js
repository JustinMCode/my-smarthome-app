/**
 * Event Modal Component - Light Glassmorphism Design
 * Minimal, flowing glass morphism style for event popups
 */

import { formatDate, formatTime } from '../../../utils/basic/calendar-date-utils.js';

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
        this.initGlassmorphismStyles();
    }

    /**
     * Initialize glassmorphism styles
     */
    initGlassmorphismStyles() {
        if (!document.getElementById('modal-glassmorphism-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-glassmorphism-styles';
            style.textContent = `
                @keyframes modalFadeIn {
                    from { 
                        opacity: 0;
                        backdrop-filter: blur(0px);
                    }
                    to { 
                        opacity: 1;
                        backdrop-filter: blur(12px);
                    }
                }
                
                @keyframes modalSlideUp {
                    from { 
                        opacity: 0;
                        transform: translate(-50%, -45%) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes shimmerEffect {
                    0% { background-position: -100% center; }
                    100% { background-position: 200% center; }
                }
                
                .modal-glassmorphism {
                    background: rgba(255, 255, 255, 0.25) !important;
                    backdrop-filter: blur(20px) saturate(150%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(150%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.08),
                        inset 0 0 20px rgba(255, 255, 255, 0.5) !important;
                }
                
                .modal-overlay-glass {
                    background: linear-gradient(135deg, 
                        rgba(227, 232, 255, 0.4) 0%, 
                        rgba(240, 230, 255, 0.4) 25%, 
                        rgba(230, 242, 255, 0.4) 50%, 
                        rgba(227, 232, 255, 0.4) 100%) !important;
                    background-size: 400% 400%;
                    animation: softGradientFlow 25s ease infinite, modalFadeIn 0.3s ease !important;
                }
                
                @keyframes softGradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .event-item-glass {
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .event-item-glass:hover {
                    background: rgba(139, 92, 246, 0.04);
                    transform: translateX(2px);
                }
                
                .event-item-glass::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 2px;
                    height: 0;
                    background: linear-gradient(180deg, transparent, #8b5cf6, transparent);
                    transition: height 0.2s ease;
                }
                
                .event-item-glass:hover::before {
                    height: 60%;
                }
                
                .modal-close-btn {
                    transition: all 0.2s ease !important;
                }
                
                .modal-close-btn:hover {
                    background: rgba(139, 92, 246, 0.08) !important;
                    color: #8b5cf6 !important;
                    transform: rotate(90deg);
                }
                
                .modal-action-btn {
                    transition: all 0.2s ease !important;
                    position: relative;
                    overflow: hidden;
                }
                
                .modal-action-btn::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.4s ease, height 0.4s ease;
                }
                
                .modal-action-btn:hover::before {
                    width: 100%;
                    height: 100%;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Show event details modal
     */
    showEventDetails(event, options = {}) {
        const modalOptions = { ...this.defaultOptions, ...options };
        
        const content = this.createEventDetailsContent(event);
        return this.showModal(content, {
            ...modalOptions,
            title: null, // Don't show title in header since it's in content
            className: 'event-details-modal modal-glassmorphism'
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
            className: 'day-events-modal modal-glassmorphism',
            width: '600px'
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
            title: 'New Event',
            className: 'quick-add-modal modal-glassmorphism'
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
        
        return { modal, overlay };
    }

    /**
     * Create overlay element with glassmorphism
     */
    createOverlay(options) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay modal-overlay-glass';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: ${options.zIndex};
        `;
        
        return overlay;
    }

    /**
     * Create modal element with glassmorphism
     */
    createModal(content, options) {
        const modal = document.createElement('div');
        modal.className = `modal ${options.className || ''}`;
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(20px) saturate(150%);
            -webkit-backdrop-filter: blur(20px) saturate(150%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.08),
                inset 0 0 20px rgba(255, 255, 255, 0.5);
            z-index: ${options.zIndex + 1};
            width: ${options.width || '420px'} !important;
            min-width: ${options.width || '420px'} !important;
            max-width: 95vw !important;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            box-sizing: border-box !important;
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
            padding: 0;
            width: 100%;
            min-width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;
        contentContainer.innerHTML = content;
        modal.appendChild(contentContainer);
        
        return modal;
    }

    /**
     * Create modal header with glassmorphism
     */
    createModalHeader(title) {
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 28px 32px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            width: 100%;
            box-sizing: border-box;
        `;
        
        // Add subtle bottom border
        const borderGradient = document.createElement('div');
        borderGradient.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 10%;
            right: 10%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
        `;
        header.appendChild(borderGradient);
        
        const titleEl = document.createElement('h2');
        titleEl.style.cssText = `
            font-size: 24px;
            font-weight: 400;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
            letter-spacing: -0.4px;
            line-height: 1.2;
        `;
        titleEl.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(100, 116, 139, 0.7);
            transition: all 0.2s ease;
        `;
        closeBtn.title = 'Close';
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        
        return header;
    }

    /**
     * Create event details content with glassmorphism
     */
    createEventDetailsContent(event) {
        const datetime = this.formatEventDateTime(event);
        const color = event.color || '#8b5cf6';
        
        return `
            <div style="padding: 28px; position: relative;">
                <!-- Close button -->
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: transparent;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(100, 116, 139, 0.7);
                    transition: all 0.2s ease;
                    z-index: 10;
                " title="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                
                <div style="
                    font-size: 18px;
                    color: rgba(30, 41, 59, 0.95);
                    margin-bottom: 20px;
                    font-weight: 400;
                    position: relative;
                    padding-left: 16px;
                    padding-right: 40px;
                ">
                    <div style="
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 3px;
                        height: 24px;
                        background: linear-gradient(180deg, ${color}dd, ${color}66);
                        border-radius: 2px;
                    "></div>
                    ${event.title}
                </div>
                
                <div style="
                    font-size: 14px;
                    color: rgba(100, 116, 139, 0.8);
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                    ${datetime.fullString}
                </div>
                
                ${event.location ? `
                    <div style="
                        font-size: 14px;
                        color: rgba(100, 116, 139, 0.8);
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        ${event.location}
                    </div>
                ` : ''}
                
                ${event.description ? `
                    <div style="
                        font-size: 14px;
                        color: rgba(51, 65, 85, 0.8);
                        margin-top: 20px;
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        line-height: 22px;
                        white-space: pre-wrap;
                    ">${event.description}</div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create day events content with glassmorphism
     */
    createDayEventsContent(date, events) {
        console.log('createDayEventsContent called with:', {
            date: date,
            eventsCount: events.length,
            events: events
        });
        
        if (events.length === 0) {
            return `
                <div style="
                    padding: 80px 40px;
                    text-align: center;
                    color: rgba(100, 116, 139, 0.7);
                ">
                    <div style="
                        width: 120px;
                        height: 120px;
                        margin: 0 auto 32px;
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.08));
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="url(#gradient)">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.4" />
                                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.4" />
                                </linearGradient>
                            </defs>
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                    </div>
                    <div style="
                        font-size: 16px; 
                        line-height: 1.4; 
                        opacity: 0.8;
                        font-weight: 400;
                        letter-spacing: -0.1px;
                    ">No events scheduled</div>
                </div>
            `;
        }

        const eventsHtml = events.map((event, index) => {
            console.log(`Processing event ${index + 1}/${events.length}:`, event.title);
            
            const datetime = this.formatEventDateTime(event);
            const recurrence = this.formatRecurrence(event);
            const color = event.color || '#8b5cf6';

            // Debug: Log recurrence information
            console.log('Event:', event.title, 'Recurrence data:', {
                hasRecurrence: !!event.recurrence,
                recurrenceType: typeof event.recurrence,
                recurrenceValue: event.recurrence,
                formattedRecurrence: recurrence
            });

            const dateTimeLine = `${datetime.date}${datetime.time ? ', ' + datetime.time : ''}`;

            return `
                <div class="event-item event-item-glass" style="
                    position: relative;
                    padding: 20px 28px 20px 24px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    flex: 1;
                    background: rgba(255, 255, 255, 0.1);
                    ${index < events.length - 1 ? 'border-bottom: 1px solid rgba(139, 92, 246, 0.08);' : ''}
                ">
                    <div style="
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 4px;
                        background: linear-gradient(180deg, ${color}, ${color}66);
                        border-radius: 0 2px 2px 0;
                    "></div>
                    <div style="
                        font-size: 16px;
                        color: rgba(30, 41, 59, 0.95);
                        margin-bottom: 8px;
                        font-weight: 500;
                        text-align: left;
                        line-height: 1.3;
                        letter-spacing: -0.1px;
                    ">${event.title || 'Event'}</div>
                    <div style="
                        color: rgba(100, 116, 139, 0.75);
                        font-size: 14px;
                        line-height: 1.4;
                        text-align: left;
                    ">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            <span style="font-weight: 400;">${dateTimeLine}</span>
                        </div>
                        ${recurrence ? `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                                </svg>
                                <span style="font-weight: 400;">${recurrence}</span>
                            </div>
                        ` : ''}
                        ${event.location ? `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span style="font-weight: 400;">${event.location}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${event.description ? `
                        <div style="
                            margin-top: 12px;
                            padding: 12px 16px;
                            background: rgba(255, 255, 255, 0.08);
                            border-radius: 8px;
                            border-left: 3px solid ${color}40;
                            font-size: 13px;
                            line-height: 1.4;
                            color: rgba(51, 65, 85, 0.8);
                            white-space: pre-wrap;
                        ">${event.description}</div>
                    ` : ''}
                </div>
            `;
        }).join('');

        return eventsHtml;
    }

    /**
     * Create quick add content with glassmorphism
     */
    createQuickAddContent(startTime, endTime) {
        const message = endTime 
            ? `${formatTime(startTime)} - ${formatTime(endTime)}`
            : `Starting at ${formatTime(startTime)}`;
            
        return `
            <div style="padding: 28px;">
                <div style="
                    font-size: 14px;
                    color: rgba(100, 116, 139, 0.7);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    font-size: 11px;
                ">Schedule</div>
                
                <div style="
                    font-size: 16px;
                    color: rgba(30, 41, 59, 0.9);
                    margin-bottom: 24px;
                    font-weight: 400;
                ">${message}</div>
                
                <input type="text" placeholder="Event title" style="
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    border-radius: 10px;
                    font-size: 14px;
                    color: rgba(30, 41, 59, 0.9);
                    outline: none;
                    transition: all 0.2s ease;
                    margin-bottom: 20px;
                " onfocus="this.style.borderColor='rgba(139, 92, 246, 0.4)'; this.style.background='rgba(255, 255, 255, 0.25)'" 
                   onblur="this.style.borderColor='rgba(139, 92, 246, 0.15)'; this.style.background='rgba(255, 255, 255, 0.15)'">
                
                <div style="
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                ">
                    <button class="modal-action-btn btn-secondary" style="
                        padding: 10px 20px;
                        border: 1px solid rgba(139, 92, 246, 0.2);
                        background: transparent;
                        border-radius: 10px;
                        cursor: pointer;
                        color: rgba(51, 65, 85, 0.8);
                        font-size: 14px;
                        font-weight: 400;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='rgba(139, 92, 246, 0.05)'"
                       onmouseout="this.style.background='transparent'">Cancel</button>
                    <button class="modal-action-btn btn-primary" style="
                        padding: 10px 24px;
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                        position: relative;
                        overflow: hidden;
                    ">Create Event</button>
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
        const closeBtn = modal.querySelector('.modal-close-btn');
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
        
        // Add ripple effect to action buttons
        modal.querySelectorAll('.modal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                    transform: scale(0);
                    animation: rippleEffect 0.6s ease-out;
                `;
                
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    /**
     * Close modal with animation
     */
    closeModal(modal, overlay) {
        // Add closing animation
        if (modal) {
            modal.style.animation = 'modalSlideUp 0.2s ease reverse';
        }
        if (overlay) {
            overlay.style.animation = 'modalFadeIn 0.2s ease reverse';
        }
        
        // Remove after animation
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.activeModals.delete(modal);
        }, 200);
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modalsToClose = Array.from(this.activeModals);
        
        modalsToClose.forEach(modal => {
            let overlay = null;
            if (modal.previousElementSibling && modal.previousElementSibling.classList.contains('modal-overlay')) {
                overlay = modal.previousElementSibling;
            } else {
                overlay = document.querySelector('.modal-overlay');
            }
            this.closeModal(modal, overlay);
        });
        
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
        
        if (event.allDay) {
            return {
                date: dateStr,
                time: null,
                fullString: dateStr
            };
        }
        
        const startTime = formatTime(startDate);
        const endTime = endDate ? formatTime(endDate) : null;
        const timeStr = endTime ? `${startTime} – ${endTime}` : startTime;
        
        return {
            date: dateStr,
            time: timeStr,
            fullString: `${dateStr} • ${timeStr}`
        };
    }

    /**
     * Format recurrence information
     */
    formatRecurrence(event) {
        console.log('formatRecurrence called with event:', event.title, 'recurrence:', event.recurrence);
        console.log('Full event object for debugging:', event);
        
        // Check for different recurrence formats
        if (event.recurringEventId) {
            console.log('Found recurringEventId:', event.recurringEventId);
        }
        
        // Check for Google Calendar specific recurrence properties
        if (event.recurrence) {
            console.log('Recurrence property exists:', event.recurrence);
        }
        
        // Check for other possible recurrence indicators
        const recurrenceKeys = Object.keys(event).filter(key => key.toLowerCase().includes('recur'));
        if (recurrenceKeys.length > 0) {
            console.log('Found recurrence-related keys:', recurrenceKeys);
        }
        
        // Check for other common recurrence properties
        const possibleRecurrenceProps = ['recurrenceRule', 'rrule', 'recurrencePattern', 'frequency'];
        for (const prop of possibleRecurrenceProps) {
            if (event[prop]) {
                console.log(`Found ${prop}:`, event[prop]);
            }
        }
        
        // Check for Google Calendar specific recurrence metadata
        if (event.extendedProperties && event.extendedProperties.private) {
            const privateProps = event.extendedProperties.private;
            console.log('Extended properties (private):', privateProps);
            
            // Check for recurrence info in extended properties
            if (privateProps.recurrenceRule) {
                console.log('Found recurrenceRule in extended properties:', privateProps.recurrenceRule);
                return this.parseRRULE(privateProps.recurrenceRule);
            }
        }
        
        if (event.extendedProperties && event.extendedProperties.shared) {
            const sharedProps = event.extendedProperties.shared;
            console.log('Extended properties (shared):', sharedProps);
            
            // Check for recurrence info in shared properties
            if (sharedProps.recurrenceRule) {
                console.log('Found recurrenceRule in shared properties:', sharedProps.recurrenceRule);
                return this.parseRRULE(sharedProps.recurrenceRule);
            }
        }
        
        // Check if this is a recurring event (has recurringEventId)
        if (event.recurringEventId) {
            console.log('Event is recurring (has recurringEventId)');
            
            // Try to determine recurrence pattern from the event start time
            const startDate = new Date(event.start);
            const dayOfWeek = startDate.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayOfWeek];
            
            // Check if this is an all-day event (likely daily or weekly)
            if (event.allDay) {
                // For all-day events, check if it's the same day of week
                // This is often a weekly pattern
                return `Weekly on ${dayName}`;
            } else {
                // For timed events, check the time pattern
                const startTime = startDate.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // If it's a specific time, it's likely weekly
                return `Weekly on ${dayName} at ${startTime}`;
            }
        }
        
        // Check for RRULE in recurrence array
        if (!event.recurrence || !Array.isArray(event.recurrence) || event.recurrence.length === 0) {
            console.log('No recurrence data found');
            return null;
        }

        const rrule = event.recurrence.find(rule => rule.startsWith('RRULE:'));
        if (!rrule) {
            console.log('No RRULE found in recurrence data');
            return null;
        }

        const rruleStr = rrule.substring(6);
        const parts = rruleStr.split(';');
        const params = {};
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = value;
            }
        });

        console.log('Parsed recurrence params:', params);

        if (params.FREQ === 'WEEKLY') {
            if (params.BYDAY) {
                const days = params.BYDAY.split(',');
                const dayNames = days.map(day => {
                    const dayMap = {
                        'SU': 'Sun',
                        'MO': 'Mon', 
                        'TU': 'Tue',
                        'WE': 'Wed',
                        'TH': 'Thu',
                        'FR': 'Fri',
                        'SA': 'Sat'
                    };
                    return dayMap[day] || day;
                });
                
                if (dayNames.length === 1) {
                    return `Weekly on ${dayNames[0]}`;
                } else {
                    return `Weekly on ${dayNames.join(', ')}`;
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
     * Parse RRULE and return human-readable recurrence pattern
     */
    parseRRULE(rrule) {
        if (!rrule || !rrule.startsWith('RRULE:')) {
            return null;
        }

        const rruleStr = rrule.substring(6);
        const parts = rruleStr.split(';');
        const params = {};
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = value;
            }
        });

        console.log('Parsed RRULE params:', params);

        if (params.FREQ === 'WEEKLY') {
            if (params.BYDAY) {
                const days = params.BYDAY.split(',');
                const dayNames = days.map(day => {
                    const dayMap = {
                        'SU': 'Sun',
                        'MO': 'Mon', 
                        'TU': 'Tue',
                        'WE': 'Wed',
                        'TH': 'Thu',
                        'FR': 'Fri',
                        'SA': 'Sat'
                    };
                    return dayMap[day] || day;
                });
                
                if (dayNames.length === 1) {
                    return `Weekly on ${dayNames[0]}`;
                } else {
                    return `Weekly on ${dayNames.join(', ')}`;
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

        return 'Recurring Event';
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