import { TouchDateTimePicker } from '../../../pickers/TouchDateTimePicker.js';
import { RecurrencePickerComponent } from '../../../pickers/recurrence/RecurrencePickerComponent.js';

/**
 * EventFormView - Optimized for 15" touch screen
 * Renders the event creation form with touch-friendly UI
 */
export class EventFormView {
  constructor({ calendars }) {
    this.calendars = calendars || [];
    this.startDate = new Date();
    this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    this.recurrenceConfig = null;
    this.recurrencePicker = null;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'event-form-view-touch';
    
    // Add styles
    this._injectStyles();
    
    wrapper.innerHTML = this._template();

    const form = wrapper.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      try {
        const title = wrapper.querySelector('#event-title').value.trim();
        const calendarId = wrapper.querySelector('#event-calendar').value;
        const startLocal = wrapper.querySelector('#event-start').value;
        const endLocal = wrapper.querySelector('#event-end').value;
        const description = wrapper.querySelector('#event-description').value.trim();
        const location = wrapper.querySelector('#event-location').value.trim();
        
        const recurringData = this.recurrenceConfig;
        const isRecurring = recurringData && recurringData.frequency && recurringData.frequency !== '';

        // Validation
        if (!title) {
          this._showError(wrapper, 'Event title is required');
          return;
        }
        
        if (!calendarId) {
          this._showError(wrapper, 'Please select a calendar');
          return;
        }
        
        if (!startLocal || !endLocal) {
          this._showError(wrapper, 'Start and end times are required');
          return;
        }

        const startDate = new Date(startLocal);
        const endDate = new Date(endLocal);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          this._showError(wrapper, 'Invalid date format');
          return;
        }
        
        if (endDate <= startDate) {
          this._showError(wrapper, 'End time must be after start time');
          return;
        }

        const toIso = (val) => new Date(val).toISOString();
        const payload = {
          calendarId,
          eventData: {
            title,
            start: toIso(startLocal),
            end: toIso(endLocal),
            description: description || undefined,
            location: location || undefined,
            recurring: isRecurring ? recurringData : undefined
          }
        };
        
        wrapper.dispatchEvent(new CustomEvent('submitEvent', { bubbles: true, detail: payload }));
      } catch (error) {
        console.error('EventFormView: Form submission error', error);
        this._showError(wrapper, 'Error processing form data');
      }
    });

    wrapper.querySelector('.cancel-btn')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    this.attachDateTimePickerHandlers(wrapper);
    this.initializeRecurrencePicker(wrapper);
    this._attachInputEnhancements(wrapper);

    return wrapper;
  }

  _template() {
    const calendarOptions = this.calendars.length > 0 
      ? this.calendars.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
      : '<option value="">No calendars available</option>';

    return `
      <form class="touch-event-form">
        <div class="form-body">
          <!-- Event Name -->
          <div class="input-section">
            <label class="section-label" for="event-title">Event Name *</label>
            <input 
              id="event-title" 
              type="text" 
              required 
              placeholder="Enter event name"
              class="input-primary"
              autocomplete="off"
              maxlength="50"
            />
            <div class="input-helper">Give your event a descriptive name</div>
          </div>

          <!-- Calendar Selection -->
          <div class="form-section">
            <div class="select-group">
              <svg class="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <select id="event-calendar" required class="calendar-select">
                <option value="" disabled selected>Select calendar</option>
                ${calendarOptions}
              </select>
            </div>
          </div>

          <!-- Date & Time Section -->
          <div class="form-section datetime-section">
            <div class="datetime-row">
              <button type="button" id="event-start-btn" class="datetime-btn">
                <div class="datetime-label">Starts</div>
                <div class="datetime-value">
                  <span class="date-display">${this.formatDisplayDate(this.startDate)}</span>
                  <span class="time-display">${this.formatDisplayTime(this.startDate)}</span>
                </div>
              </button>
              <input type="hidden" id="event-start" value="${this.formatInputValue(this.startDate)}" required />
            </div>
            
            <div class="datetime-row">
              <button type="button" id="event-end-btn" class="datetime-btn">
                <div class="datetime-label">Ends</div>
                <div class="datetime-value">
                  <span class="date-display">${this.formatDisplayDate(this.endDate)}</span>
                  <span class="time-display">${this.formatDisplayTime(this.endDate)}</span>
                </div>
              </button>
              <input type="hidden" id="event-end" value="${this.formatInputValue(this.endDate)}" required />
            </div>
          </div>

          <!-- Location -->
          <div class="input-section">
            <label class="section-label" for="event-location">Location</label>
            <input 
              id="event-location" 
              type="text" 
              placeholder="Add a location for this event (optional)"
              class="input-primary"
              autocomplete="off"
              maxlength="100"
            />
            <div class="input-helper">Optional: Add where this event will take place</div>
          </div>

          <!-- Description -->
          <div class="input-section">
            <label class="section-label" for="event-description">Description</label>
            <textarea 
              id="event-description" 
              rows="3"
              placeholder="Add a description for this event (optional)"
              class="textarea-touch"
              maxlength="200"
            ></textarea>
            <div class="input-helper">Optional: Add notes about this event</div>
          </div>

          <!-- Recurrence Section -->
          <div class="form-section recurrence-section">
            <div id="recurrence-picker-container"></div>
          </div>

          <!-- Error Message -->
          <div class="error-message" id="error-message"></div>
        </div>

        <!-- Action Buttons -->
        <div class="form-footer">
          <button type="button" class="btn cancel-btn">Cancel</button>
          <button type="submit" class="btn primary-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Create Event
          </button>
        </div>
      </form>
    `;
  }

  _injectStyles() {
    if (document.getElementById('event-form-touch-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'event-form-touch-styles';
    style.textContent = `
      .event-form-view-touch {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        color: #1a1a1a;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        max-width: 800px;
        margin: 0 auto;
      }

      .touch-event-form {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .form-body {
        flex: 1;
        padding: 28px;
        background: #fafafa;
      }

      .form-section {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      }

      .primary-section {
        background: white;
        border: 2px solid #667eea;
      }

      /* Input Sections (Calendar Name style) */
      .input-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        border: 1px solid #e1e4e8;
      }

      .section-label {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .input-helper {
        margin-top: 8px;
        font-size: 14px;
        color: #6c757d;
        font-style: italic;
      }

      /* Primary Input (Calendar Name style) */
      .input-primary {
        width: 100%;
        height: 70px;
        font-size: 22px;
        padding: 0 20px;
        border: 3px solid #e1e4e8;
        border-radius: 12px;
        background: #ffffff;
        color: #2c3e50;
        transition: all 0.2s;
        font-weight: 500;
      }

      .input-primary:focus {
        outline: none;
        border-color: #667eea;
        background: #f8f9ff;
      }

      .input-primary::placeholder {
        color: #adb5bd;
        font-weight: 400;
      }

      /* Textarea */
      .textarea-touch {
        width: 100%;
        min-height: 120px;
        font-size: 18px;
        padding: 16px 20px;
        border: 2px solid #e1e4e8;
        border-radius: 12px;
        background: #ffffff;
        color: #2c3e50;
        resize: vertical;
        font-family: inherit;
        transition: all 0.2s;
      }

      .textarea-touch:focus {
        outline: none;
        border-color: #667eea;
        background: #f8f9ff;
      }

      .textarea-touch::placeholder {
        color: #adb5bd;
      }

      .input-group {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-group.with-icon {
        gap: 12px;
      }

      .field-icon {
        color: #667eea;
        flex-shrink: 0;
      }

      .textarea-icon {
        align-self: flex-start;
        margin-top: 14px;
      }

      .title-input {
        width: 100%;
        font-size: 20px;
        padding: 14px 0;
        border: none;
        background: transparent;
        font-weight: 500;
        outline: none;
      }

      

      .floating-label {
        position: absolute;
        top: -8px;
        left: 0;
        font-size: 12px;
        color: #667eea;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .select-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .calendar-select {
        flex: 1;
        padding: 14px 16px;
        font-size: 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 52px;
      }

      .calendar-select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .datetime-section {
        padding: 0;
        background: transparent;
      }

      .datetime-row {
        margin-bottom: 12px;
      }

      .datetime-btn {
        width: 100%;
        padding: 16px 20px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 72px;
      }

      .datetime-btn:hover {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .datetime-btn:active {
        transform: scale(0.98);
      }

      .datetime-label {
        font-size: 14px;
        color: #666;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .datetime-value {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .date-display {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .time-display {
        font-size: 14px;
        color: #667eea;
        font-weight: 500;
      }

      .location-input,
      .description-input {
        flex: 1;
        padding: 14px 16px;
        font-size: 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        transition: all 0.3s ease;
        font-family: inherit;
      }

      .location-input:focus,
      .description-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .description-input {
        resize: vertical;
        min-height: 100px;
      }

      .recurrence-section {
        background: #f8f9ff;
        border: 2px dashed #667eea;
      }

      .error-message {
        display: none;
        padding: 12px 16px;
        background: #fee;
        color: #c00;
        border-radius: 8px;
        margin-top: 16px;
        font-size: 14px;
        font-weight: 500;
      }

      .error-message.show {
        display: block;
        animation: shake 0.5s ease;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }

      .form-footer {
        display: flex;
        gap: 16px;
        padding: 24px 28px;
        background: white;
        border-top: 1px solid #e0e0e0;
      }

      .btn {
        flex: 1;
        padding: 16px 24px;
        font-size: 16px;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 56px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      .cancel-btn:hover {
        background: #e0e0e0;
      }

      .cancel-btn:active {
        transform: scale(0.98);
      }

      .primary-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .primary-btn:hover {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        transform: translateY(-2px);
      }

      .primary-btn:active {
        transform: scale(0.98);
      }



      /* Responsive adjustments for 15" touch screen */
      @media (max-width: 1366px) {
        .event-form-view-touch {
          max-width: 100%;
          border-radius: 0;
        }

        .input-section {
          padding: 20px;
          margin-bottom: 20px;
        }

        .input-primary {
          height: 60px;
          font-size: 20px;
        }

        .textarea-touch {
          min-height: 100px;
          font-size: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  _showError(wrapper, message) {
    const errorEl = wrapper.querySelector('#error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
      setTimeout(() => {
        errorEl.classList.remove('show');
      }, 5000);
    }
    wrapper.dispatchEvent(new CustomEvent('formError', { 
      bubbles: true, 
      detail: { message } 
    }));
  }

  _attachInputEnhancements(wrapper) {
    // Add floating label effects
    const inputs = wrapper.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement?.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement?.classList.remove('focused');
        }
      });
    });
  }

  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDisplayTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatInputValue(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  attachDateTimePickerHandlers(wrapper) {
    const startBtn = wrapper.querySelector('#event-start-btn');
    const endBtn = wrapper.querySelector('#event-end-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.showDateTimePicker('start', wrapper);
      });
    }

    if (endBtn) {
      endBtn.addEventListener('click', () => {
        this.showDateTimePicker('end', wrapper);
      });
    }
  }

  showDateTimePicker(type, wrapper) {
    const currentDate = type === 'start' ? this.startDate : this.endDate;
    
    const picker = new TouchDateTimePicker({
      initialDate: currentDate,
      mode: 'datetime',
      format24h: false,
      minDate: new Date()
    });

    picker.show((selectedDate) => {
      if (type === 'start') {
        this.startDate = selectedDate;
        if (this.endDate <= this.startDate) {
          this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000);
          this.updateDateTimeDisplay('end', wrapper);
        }
        this.updateDateTimeDisplay('start', wrapper);
      } else {
        if (selectedDate <= this.startDate) {
          selectedDate = new Date(this.startDate.getTime() + 60 * 60 * 1000);
        }
        this.endDate = selectedDate;
        this.updateDateTimeDisplay('end', wrapper);
      }
    });
  }

  updateDateTimeDisplay(type, wrapper) {
    const date = type === 'start' ? this.startDate : this.endDate;
    const btn = wrapper.querySelector(`#event-${type}-btn`);
    const hiddenInput = wrapper.querySelector(`#event-${type}`);

    if (btn) {
      const dateDisplay = btn.querySelector('.date-display');
      const timeDisplay = btn.querySelector('.time-display');
      
      if (dateDisplay) dateDisplay.textContent = this.formatDisplayDate(date);
      if (timeDisplay) timeDisplay.textContent = this.formatDisplayTime(date);
    }

    if (hiddenInput) {
      hiddenInput.value = this.formatInputValue(date);
    }
  }

  initializeRecurrencePicker(wrapper) {
    try {
      const recurrencePickerContainer = wrapper.querySelector('#recurrence-picker-container');
      if (!recurrencePickerContainer) {
        console.warn('EventFormView: Recurrence picker container not found');
        return;
      }

      this.recurrencePicker = new RecurrencePickerComponent({
        startDate: this.startDate,
        onChange: (config) => {
          this.recurrenceConfig = config;
        }
      });

      const recurrenceElement = this.recurrencePicker.render();
      if (recurrenceElement) {
        recurrencePickerContainer.appendChild(recurrenceElement);
        

      }
    } catch (error) {
      console.error('EventFormView: Error initializing recurrence picker:', error);
      const recurrencePickerContainer = wrapper.querySelector('#recurrence-picker-container');
      if (recurrencePickerContainer) {
        recurrencePickerContainer.innerHTML = `
          <div class="recurring-section">
            <div class="recurring-header">
              <label class="checkbox-container">
                <input type="checkbox" id="event-recurring" disabled>
                <span class="checkmark"></span>
                <span class="checkbox-label">Recurring events unavailable</span>
              </label>
            </div>
          </div>
        `;
      }
    }
  }
}

export default EventFormView;