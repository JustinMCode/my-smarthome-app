import { END_TYPE, DEFAULT_VALUES } from './RecurrenceTypes.js';
import { TouchDateTimePicker } from '../../pickers/TouchDateTimePicker.js';

/**
 * Component to handle recurrence end condition selection and configuration
 */
export class RecurrenceEndCondition {
  /**
   * @param {Object} config
   * @param {Date} config.startDate - Event start date
   * @param {function} config.onChange - Callback when end condition changes
   */
  constructor({ startDate, onChange }) {
    this.startDate = startDate;
    this.onChange = onChange;
    this.endType = DEFAULT_VALUES.END_TYPE;
    this.endOccurrences = DEFAULT_VALUES.OCCURRENCES;
    this.endDate = this._getDefaultEndDate();
  }

  /**
   * Render the end condition section
   * @returns {HTMLElement}
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'recurring-end-section';
    wrapper.innerHTML = this._template();

    this._attachHandlers(wrapper);
    return wrapper;
  }

  /**
   * Get the current end condition configuration
   * @returns {Object}
   */
  getEndCondition() {
    return {
      endType: this.endType,
      endOccurrences: this.endType === END_TYPE.AFTER ? this.endOccurrences : undefined,
      endDate: this.endType === END_TYPE.ON ? this.endDate : undefined
    };
  }

  /**
   * Template for end condition section
   * @private
   * @returns {string}
   */
  _template() {
    return `
      <label>End</label>
      <div class="end-options">
        <div class="end-option">
          <input type="radio" id="end-never" name="end-type" value="${END_TYPE.NEVER}" ${this.endType === END_TYPE.NEVER ? 'checked' : ''}>
          <label for="end-never">Never</label>
        </div>
        <div class="end-option">
          <input type="radio" id="end-after" name="end-type" value="${END_TYPE.AFTER}" ${this.endType === END_TYPE.AFTER ? 'checked' : ''}>
          <label for="end-after">After</label>
          <input type="number" id="end-occurrences" min="1" max="999" value="${this.endOccurrences}" 
                 style="display: ${this.endType === END_TYPE.AFTER ? 'inline-block' : 'none'}">
          <span id="occurrences-text" style="display: ${this.endType === END_TYPE.AFTER ? 'inline' : 'none'}">occurrences</span>
        </div>
        <div class="end-option">
          <input type="radio" id="end-on" name="end-type" value="${END_TYPE.ON}" ${this.endType === END_TYPE.ON ? 'checked' : ''}>
          <label for="end-on">On</label>
          <button type="button" id="end-date-btn" class="datetime-picker-btn" 
                  style="display: ${this.endType === END_TYPE.ON ? 'inline-block' : 'none'}">
            <div class="datetime-display">
              <div class="date-part">${this._formatDisplayDate(this.endDate)}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </button>
          <input type="hidden" id="end-date" value="${this.endDate.toISOString().split('T')[0]}" 
                 style="display: ${this.endType === END_TYPE.ON ? 'inline-block' : 'none'}">
        </div>
      </div>
    `;
  }

  /**
   * Attach event handlers
   * @private
   * @param {HTMLElement} wrapper
   */
  _attachHandlers(wrapper) {
    // Handle end type changes
    const endTypeRadios = wrapper.querySelectorAll('input[name="end-type"]');
    endTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this._updateEndType(wrapper, e.target.value);
      });
    });

    // Handle end occurrences changes
    const endOccurrences = wrapper.querySelector('#end-occurrences');
    if (endOccurrences) {
      endOccurrences.addEventListener('change', (e) => {
        this.endOccurrences = parseInt(e.target.value, 10);
        this._notifyChange();
      });
    }

    // Handle end date picker
    const endDateBtn = wrapper.querySelector('#end-date-btn');
    if (endDateBtn) {
      endDateBtn.addEventListener('click', () => {
        this._showEndDatePicker(wrapper);
      });
    }
  }

  /**
   * Update end type and visibility of related inputs
   * @private
   * @param {HTMLElement} wrapper
   * @param {string} endType
   */
  _updateEndType(wrapper, endType) {
    this.endType = endType;

    const endOccurrences = wrapper.querySelector('#end-occurrences');
    const occurrencesText = wrapper.querySelector('#occurrences-text');
    const endDate = wrapper.querySelector('#end-date');
    const endDateBtn = wrapper.querySelector('#end-date-btn');

    [endOccurrences, occurrencesText, endDate, endDateBtn].forEach(el => {
      if (el) el.style.display = 'none';
    });

    switch (endType) {
      case END_TYPE.AFTER:
        if (endOccurrences) endOccurrences.style.display = 'inline-block';
        if (occurrencesText) occurrencesText.style.display = 'inline';
        break;
      case END_TYPE.ON:
        if (endDateBtn) endDateBtn.style.display = 'inline-block';
        if (endDate) endDate.style.display = 'inline-block';
        break;
    }

    this._notifyChange();
  }

  /**
   * Show date picker for end date selection
   * @private
   * @param {HTMLElement} wrapper
   */
  _showEndDatePicker(wrapper) {
    const endDateBtn = wrapper.querySelector('#end-date-btn');
    const endDateInput = wrapper.querySelector('#end-date');
    
    const picker = new TouchDateTimePicker({
      initialDate: this.endDate,
      mode: 'date',
      minDate: this.startDate
    });

    picker.show((selectedDate) => {
      this.endDate = selectedDate;
      
      if (endDateInput) {
        endDateInput.value = selectedDate.toISOString().split('T')[0];
      }
      
      if (endDateBtn) {
        const datePart = endDateBtn.querySelector('.date-part');
        if (datePart) {
          datePart.textContent = this._formatDisplayDate(selectedDate);
        }
      }

      this._notifyChange();
    });
  }

  /**
   * Format date for display
   * @private
   * @param {Date} date
   * @returns {string}
   */
  _formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Get default end date (1 year from start)
   * @private
   * @returns {Date}
   */
  _getDefaultEndDate() {
    const defaultEndDate = new Date(this.startDate);
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
    return defaultEndDate;
  }

  /**
   * Notify parent of changes
   * @private
   */
  _notifyChange() {
    if (this.onChange) {
      this.onChange(this.getEndCondition());
    }
  }
}
