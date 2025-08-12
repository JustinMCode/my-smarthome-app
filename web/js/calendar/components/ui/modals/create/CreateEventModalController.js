import { BaseModal } from '../../modals/BaseModal.js';
import { calendarConfigService } from '../../../../config/calendar-config-service.js';
import { EventsApi } from '../../../../api/EventsApi.js';
import { CalendarsApi } from '../../../../api/CalendarsApi.js';
import { EventFormView } from './modes/EventFormView.js';
import { CalendarFormView } from './modes/CalendarFormView.js';
import { ImportFormView } from './modes/ImportFormView.js';

/**
 * CreateEventModalController
 * Orchestrates the create modal with multiple modes (event, calendar, import)
 */
export class CreateEventModalController {
  constructor(core) {
    this.core = core;
    this.modal = new BaseModal({ width: '720px' });
    this.mode = 'event';
    this.calendars = [];
    this.isOpen = false;
    this.modalEl = null;
    this.overlayEl = null;
    this.contentArea = null;
  }

  async open() {
    // Prevent multiple instances
    if (this.isOpen) {
      console.warn('CreateEventModalController: Modal is already open');
      return;
    }

    try {
      // Ensure calendars loaded (use config service for cached view)
      if (!calendarConfigService.isConfigurationLoaded()) {
        await calendarConfigService.loadCalendars();
      }
      this.calendars = calendarConfigService
        .getAllCalendars()
        .filter(c => ['owner', 'writer'].includes(c.accessRole));

      if (this.calendars.length === 0) {
        this.core.showNotification('No writable calendars available', 'warning');
        return;
      }

      const container = document.createElement('div');
      container.className = 'create-modal-container';
      container.appendChild(this._renderHeader());
      this.contentArea = document.createElement('div');
      this.contentArea.className = 'create-modal-content';
      container.appendChild(this.contentArea);

      const { modal, overlay } = this.modal.showModal(container, { className: 'create-event-modal' });
      this.modalEl = modal;
      this.overlayEl = overlay;
      this.isOpen = true;

      // Add cleanup handler when modal is closed
      this._setupCloseHandler();
      
      this._switchTo(this.mode);
    } catch (error) {
      console.error('CreateEventModalController: Error opening modal', error);
      this.isOpen = false;
      throw error;
    }
  }

  close() {
    if (!this.isOpen) {
      return;
    }
    
    try {
      this.modal.close(this.modalEl, this.overlayEl);
      this._cleanup();
    } catch (error) {
      console.error('CreateEventModalController: Error closing modal', error);
      this._cleanup(); // Ensure cleanup happens even if close fails
    }
  }

  /**
   * Setup close handler to manage state
   */
  _setupCloseHandler() {
    if (this.overlayEl) {
      // Listen for backdrop clicks
      this.overlayEl.addEventListener('click', (e) => {
        if (e.target === this.overlayEl) {
          this.close();
        }
      });
    }

    // Listen for escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Clean up modal state
   */
  _cleanup() {
    this.isOpen = false;
    this.modalEl = null;
    this.overlayEl = null;
    this.contentArea = null;
    this.mode = 'event'; // Reset to default mode
  }

  _renderHeader() {
    const header = document.createElement('div');
    header.className = 'create-modal-header';
    const mk = (mode, label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mode-btn';
      btn.textContent = label;
      btn.dataset.mode = mode;
      if (this.mode === mode) btn.classList.add('active');
      btn.addEventListener('click', () => this._switchTo(mode));
      return btn;
    };
    header.appendChild(mk('event', 'Add Event'));
    header.appendChild(mk('calendar', 'Add Calendar'));
    header.appendChild(mk('import', 'Import Calendar'));
    return header;
  }

  _switchTo(mode) {
    if (!this.isOpen || !this.modalEl || !this.contentArea) {
      console.warn('CreateEventModalController: Cannot switch mode - modal not properly initialized');
      return;
    }

    this.mode = mode;
    
    // Update header active state
    const headerButtons = this.modalEl.querySelectorAll('.create-modal-header .mode-btn');
    headerButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Clear previous content completely to avoid UI artifacts
    this.contentArea.innerHTML = '';
    
    // Render view (compute element first, then replace children)
    let el = null;
    try {
      if (mode === 'event') {
        const view = new EventFormView({ calendars: this.calendars });
        el = view.render();
        el.addEventListener('submitEvent', async (e) => {
          const submitBtn = el.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.textContent : '';
          
          try {
            // Show loading state
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = 'Creating...';
            }
            
            await EventsApi.createEvent(e.detail);
            await this.core.refreshEvents();
            
            // Force view re-render to show new event
            if (this.core.viewManager && this.core.viewManager.getCurrentView()) {
              this.core.viewManager.getCurrentView().render();
            }
            
            this.core.showNotification('Event created', 'success');
            this.close();
          } catch (err) {
            console.error(err);
            this.core.showNotification(err.message || 'Failed to create event', 'error');
          } finally {
            // Reset button state
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          }
        });
        el.addEventListener('formError', (e) => {
          this.core.showNotification(e.detail.message, 'warning');
        });
        el.addEventListener('cancel', () => this.close());
      } else if (mode === 'calendar') {
        const view = new CalendarFormView();
        el = view.render();
        el.addEventListener('submitCalendar', async (e) => {
          try {
            await CalendarsApi.createCalendar(e.detail);
            await calendarConfigService.refresh();
            this.core.showNotification('Calendar added', 'success');
            this.close();
          } catch (err) {
            console.error(err);
            this.core.showNotification(err.message || 'Failed to add calendar', 'error');
          }
        });
        el.addEventListener('cancel', () => this.close());
      } else if (mode === 'import') {
        const view = new ImportFormView({ calendars: this.calendars });
        el = view.render();
        el.addEventListener('submitImport', (e) => {
          console.log('Import request', e.detail);
          this.core.showNotification('Import flow not yet implemented', 'info');
          this.close();
        });
        el.addEventListener('cancel', () => this.close());
      }

      if (el) {
        this.contentArea.appendChild(el);
      }
    } catch (error) {
      console.error('CreateEventModalController: Error switching mode', error);
      this.core.showNotification('Error loading form', 'error');
    }
  }
}

export default CreateEventModalController;


