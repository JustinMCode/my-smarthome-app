import { TouchDateTimePicker } from '../../../pickers/TouchDateTimePicker.js';
import { RecurrencePickerComponent } from '../../../pickers/recurrence/RecurrencePickerComponent.js';

/**
 * EventFormView
 * Renders the event creation form and emits a custom event on submit
 */
export class EventFormView {
  constructor({ calendars }) {
    this.calendars = calendars || [];
    this.startDate = new Date();
    this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    this.recurrenceConfig = null;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'event-form-view';
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
        // Get recurrence configuration from the picker component
        const recurringData = this.recurrenceConfig;

        // Enhanced validation
        if (!title) {
          wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Event title is required' } }));
          return;
        }
        
        if (!calendarId) {
          wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Please select a calendar' } }));
          return;
        }
        
        if (!startLocal || !endLocal) {
          wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Start and end times are required' } }));
          return;
        }

        // Validate dates
        const startDate = new Date(startLocal);
        const endDate = new Date(endLocal);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Invalid date format' } }));
          return;
        }
        
        if (endDate <= startDate) {
          wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'End time must be after start time' } }));
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
        wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Error processing form data' } }));
      }
    });

    wrapper.querySelector('.cancel-btn')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    // Attach date/time picker handlers
    this.attachDateTimePickerHandlers(wrapper);
    
    // Initialize recurrence picker
    const recurrencePickerContainer = wrapper.querySelector('#recurrence-picker-container');
    if (recurrencePickerContainer) {
      const recurrencePicker = new RecurrencePickerComponent({
        startDate: this.startDate,
        onChange: (config) => {
          this.recurrenceConfig = config;
        }
      });
      recurrencePickerContainer.appendChild(recurrencePicker.render());
    }

    return wrapper;
  }

  _template() {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const calendarOptions = this.calendars.length > 0 
      ? this.calendars.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
      : '<option value="">No calendars available</option>';

    return `
      <form class="event-form">
        <div class="row two-col">
          <div class="field">
            <label>Title</label>
            <input id="event-title" type="text" required placeholder="Event title" />
          </div>
          <div class="field">
            <label>Calendar</label>
            <select id="event-calendar" required>${calendarOptions}</select>
          </div>
        </div>
        <div class="row two-col">
          <div class="field">
            <label>Start Date & Time</label>
            <button type="button" id="event-start-btn" class="datetime-picker-btn">
              <div class="datetime-display">
                <div class="date-part">${this.formatDisplayDate(this.startDate)}</div>
                <div class="time-part">${this.formatDisplayTime(this.startDate)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </button>
            <input type="hidden" id="event-start" value="${this.formatInputValue(this.startDate)}" required />
          </div>
          <div class="field">
            <label>End Date & Time</label>
            <button type="button" id="event-end-btn" class="datetime-picker-btn">
              <div class="datetime-display">
                <div class="date-part">${this.formatDisplayDate(this.endDate)}</div>
                <div class="time-part">${this.formatDisplayTime(this.endDate)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </button>
            <input type="hidden" id="event-end" value="${this.formatInputValue(this.endDate)}" required />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Description (optional)</label>
            <textarea id="event-description" rows="3"></textarea>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Location (optional)</label>
            <input id="event-location" type="text" placeholder="Add location" />
          </div>
        </div>
        
        <div class="row">
          <div class="field">
            <div id="recurrence-picker-container"></div>
          </div>
        </div>
        
        <div class="actions">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="submit" class="primary">Create Event</button>
        </div>
      </form>
    `;
  }

  /**
   * Format date for display (user-friendly)
   */
  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Format time for display (user-friendly)
   */
  formatDisplayTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  /**
   * Format date for input value (ISO format)
   */
  formatInputValue(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  /**
   * Attach date/time picker event handlers
   */
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

  /**
   * Show date/time picker
   */
  showDateTimePicker(type, wrapper) {
    const currentDate = type === 'start' ? this.startDate : this.endDate;
    
    const picker = new TouchDateTimePicker({
      initialDate: currentDate,
      mode: 'datetime',
      format24h: false,
      minDate: new Date() // Prevent past dates
    });

    picker.show((selectedDate) => {
      if (type === 'start') {
        this.startDate = selectedDate;
        // Auto-adjust end time to be 1 hour after start if end is before start
        if (this.endDate <= this.startDate) {
          this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000);
          this.updateDateTimeDisplay('end', wrapper);
        }
        this.updateDateTimeDisplay('start', wrapper);
      } else {
        // Ensure end time is after start time
        if (selectedDate <= this.startDate) {
          selectedDate = new Date(this.startDate.getTime() + 60 * 60 * 1000);
        }
        this.endDate = selectedDate;
        this.updateDateTimeDisplay('end', wrapper);
      }
    });
  }

  /**
   * Update date/time display after selection
   */
  updateDateTimeDisplay(type, wrapper) {
    const date = type === 'start' ? this.startDate : this.endDate;
    const btn = wrapper.querySelector(`#event-${type}-btn`);
    const hiddenInput = wrapper.querySelector(`#event-${type}`);

    if (btn) {
      const datePart = btn.querySelector('.date-part');
      const timePart = btn.querySelector('.time-part');
      
      if (datePart) datePart.textContent = this.formatDisplayDate(date);
      if (timePart) timePart.textContent = this.formatDisplayTime(date);
    }

    if (hiddenInput) {
      hiddenInput.value = this.formatInputValue(date);
    }
  }


}

export default EventFormView;


