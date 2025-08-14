import { FREQUENCY, MONTHLY_TYPE, YEARLY_TYPE, DEFAULT_VALUES, WEEKDAYS } from './RecurrenceTypes.js';
import { RecurrenceEndCondition } from './RecurrenceEndCondition.js';
import { RecurrenceRuleGenerator } from './RecurrenceRuleGenerator.js';

/**
 * Component to handle recurrence configuration for events
 */
export class RecurrencePickerComponent {
  /**
   * @param {Object} config
   * @param {Date} config.startDate - Event start date
   * @param {function} config.onChange - Callback when recurrence config changes
   */
  constructor({ startDate, onChange }) {
    this.startDate = startDate;
    this.onChange = onChange;
    this.frequency = DEFAULT_VALUES.FREQUENCY;
    this.selectedDays = new Set();
    this.monthlyType = MONTHLY_TYPE.SAME_DAY;
    this.yearlyType = YEARLY_TYPE.SAME_DATE;
    this.endCondition = null;
    this.isRecurring = false; // Track checkbox state internally
  }

  /**
   * Render the recurrence picker
   * @returns {HTMLElement}
   */
  render() {
    try {
      const wrapper = document.createElement('div');
      wrapper.className = 'recurring-section';
      wrapper.innerHTML = this._template();

      this._attachHandlers(wrapper);

      return wrapper;
    } catch (error) {
      console.error('RecurrencePickerComponent: Error rendering:', error);
      // Return a fallback element
      const fallback = document.createElement('div');
      fallback.className = 'recurring-section';
      fallback.innerHTML = `
        <div class="recurring-header">
          <label class="checkbox-container">
            <input type="checkbox" id="event-recurring" disabled>
            <span class="checkmark"></span>
            <span class="checkbox-label">Recurring events unavailable</span>
          </label>
        </div>
      `;
      return fallback;
    }
  }

  /**
   * Get the current recurrence configuration
   * @returns {Object}
   */
  getRecurrenceConfig() {    
    // Double-check with DOM state for debugging
    const recurringCheckbox = document.querySelector('#event-recurring');
    const domChecked = recurringCheckbox ? recurringCheckbox.checked : false;

    // Use internal state as primary source of truth
    if (!this.isRecurring) {
      console.log('RecurrencePickerComponent: Not recurring (internal state), returning empty config');
      return {};
    }
    
    const endCondition = this.endCondition?.getEndCondition() || {};
    
    const rrule = this._generateRRule();
    
    const config = {
      frequency: this.frequency,
      selectedDays: Array.from(this.selectedDays),
      monthlyType: this.monthlyType,
      yearlyType: this.yearlyType,
      ...endCondition,
      rrule: rrule
    }; 
    return config;
  }

  /**
   * Template for recurrence picker
   * @private
   * @returns {string}
   */
  _template() {
    return `
      <div class="recurring-header">
        <label class="checkbox-container">
          <input type="checkbox" id="event-recurring">
          <span class="checkmark"></span>
          <span class="checkbox-label">Make this a recurring event</span>
        </label>
      </div>
      
      <div id="recurring-options" class="recurring-details" style="display: none;">
        <!-- Options will be populated when checkbox is checked -->
      </div>
    `;
  }

  /**
   * Populate recurring options content when checkbox is checked
   * @private
   * @param {HTMLElement} recurringOptions
   */
  _populateRecurringOptions(recurringOptions) {
    if (recurringOptions.children.length === 0) {
      recurringOptions.innerHTML = `
        <div class="recurring-config">
          <div class="recurring-frequency-section">
            <label>Repeat</label>
            <div class="frequency-selector">
              <select id="recurring-frequency" class="recurring-select">
                <option value="${FREQUENCY.DAILY}">Daily</option>
                <option value="${FREQUENCY.WEEKLY}" selected>Weekly</option>
                <option value="${FREQUENCY.MONTHLY}">Monthly</option>
                <option value="${FREQUENCY.YEARLY}">Yearly</option>
              </select>
              
              <div class="frequency-details">
                <div id="weekly-details" class="frequency-option-details">
                  <label>Repeat on:</label>
                  <div class="day-selector">
                    ${this._generateDayButtons()}
                  </div>
                </div>
                
                <div id="monthly-details" class="frequency-option-details" style="display: none;">
                  <label>Repeat on:</label>
                  <div class="monthly-option">
                    <input type="radio" id="monthly-same-day" name="monthly-type" 
                           value="${MONTHLY_TYPE.SAME_DAY}" checked>
                    <label for="monthly-same-day">Same day of month</label>
                  </div>
                  <div class="monthly-option">
                    <input type="radio" id="monthly-same-weekday" name="monthly-type" 
                           value="${MONTHLY_TYPE.SAME_WEEKDAY}">
                    <label for="monthly-same-weekday">Same day of week</label>
                  </div>
                </div>
                
                <div id="yearly-details" class="frequency-option-details" style="display: none;">
                  <label>Repeat on:</label>
                  <div class="yearly-option">
                    <input type="radio" id="yearly-same-date" name="yearly-type" 
                           value="${YEARLY_TYPE.SAME_DATE}" checked>
                    <label for="yearly-same-date">Same date</label>
                  </div>
                  <div class="yearly-option">
                    <input type="radio" id="yearly-same-weekday" name="yearly-type" 
                           value="${YEARLY_TYPE.SAME_WEEKDAY}">
                    <label for="yearly-same-weekday">Same day of week</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div id="end-condition-container"></div>
        </div>
      `;
      
      // Re-attach handlers for the newly created elements
      this._attachRecurringOptionsHandlers(recurringOptions.closest('.recurring-section'));
    }
  }

  /**
   * Generate day selector buttons HTML
   * @private
   * @returns {string}
   */
  _generateDayButtons() {
    const days = [
      { code: WEEKDAYS.MONDAY, label: 'Mon' },
      { code: WEEKDAYS.TUESDAY, label: 'Tue' },
      { code: WEEKDAYS.WEDNESDAY, label: 'Wed' },
      { code: WEEKDAYS.THURSDAY, label: 'Thu' },
      { code: WEEKDAYS.FRIDAY, label: 'Fri' },
      { code: WEEKDAYS.SATURDAY, label: 'Sat' },
      { code: WEEKDAYS.SUNDAY, label: 'Sun' }
    ];

    return days.map(day => 
      `<button type="button" class="day-btn" data-day="${day.code}">${day.label}</button>`
    ).join('');
  }

  /**
   * Attach event handlers
   * @private
   * @param {HTMLElement} wrapper
   */
  _attachHandlers(wrapper) {
    const recurringCheckbox = wrapper.querySelector('#event-recurring');
    const recurringOptions = wrapper.querySelector('#recurring-options');

    // Toggle recurring options visibility
    if (recurringCheckbox) {
      recurringCheckbox.addEventListener('change', (e) => {
        
        // Update internal state
        this.isRecurring = e.target.checked;
        
        if (e.target.checked) {
          this._populateRecurringOptions(recurringOptions);
          recurringOptions.style.display = 'block';
          this._initializeDefaults(wrapper);
        } else {
          recurringOptions.style.display = 'none';
        }
        this._notifyChange();
      });
    }
  }

  /**
   * Attach handlers for recurring options (called after content is populated)
   * @private
   * @param {HTMLElement} wrapper
   */
  _attachRecurringOptionsHandlers(wrapper) {
    const frequencySelect = wrapper.querySelector('#recurring-frequency');

    // Handle frequency changes
    if (frequencySelect) {
      frequencySelect.addEventListener('change', (e) => {
        this.frequency = e.target.value;
        this._updateFrequencyDetails(wrapper);
        this._notifyChange();
      });
    }

    // Handle day selection for weekly recurrence
    const dayButtons = wrapper.querySelectorAll('.day-btn');
    dayButtons.forEach(button => {
      button.addEventListener('click', () => {
        const day = button.dataset.day;
        button.classList.toggle('selected');
        if (button.classList.contains('selected')) {
          this.selectedDays.add(day);
        } else {
          this.selectedDays.delete(day);
        }
        this._notifyChange();
      });
    });

    // Handle monthly type changes
    const monthlyTypeRadios = wrapper.querySelectorAll('input[name="monthly-type"]');
    monthlyTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.monthlyType = e.target.value;
        this._notifyChange();
      });
    });

    // Handle yearly type changes
    const yearlyTypeRadios = wrapper.querySelectorAll('input[name="yearly-type"]');
    yearlyTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.yearlyType = e.target.value;
        this._notifyChange();
      });
    });

    // Initialize end condition component
    const endConditionContainer = wrapper.querySelector('#end-condition-container');
    if (endConditionContainer) {
      this.endCondition = new RecurrenceEndCondition({
        startDate: this.startDate,
        onChange: () => this._notifyChange()
      });
      endConditionContainer.appendChild(this.endCondition.render());
    }
  }

  /**
   * Initialize default values
   * @private
   * @param {HTMLElement} wrapper
   */
  _initializeDefaults(wrapper) {    
    // Set the frequency dropdown to the default value
    const frequencySelect = wrapper.querySelector('#recurring-frequency');
    if (frequencySelect) {
      frequencySelect.value = this.frequency;
    }
    
    // Set current day of week as selected for weekly recurrence
    const currentDay = this.startDate.getDay();
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const currentDayCode = dayMap[currentDay];
        
    const dayButton = wrapper.querySelector(`[data-day="${currentDayCode}"]`);
    if (dayButton) {
      dayButton.classList.add('selected');
      this.selectedDays.add(currentDayCode);
    }
    
    // Initialize end condition
    if (!this.endCondition) {
      this.endCondition = new RecurrenceEndCondition();
    }
    
    // Update frequency details to show the correct options
    this._updateFrequencyDetails(wrapper);
  }

  /**
   * Update frequency details visibility
   * @private
   * @param {HTMLElement} wrapper
   */
  _updateFrequencyDetails(wrapper) {
    const weeklyDetails = wrapper.querySelector('#weekly-details');
    const monthlyDetails = wrapper.querySelector('#monthly-details');
    const yearlyDetails = wrapper.querySelector('#yearly-details');

    [weeklyDetails, monthlyDetails, yearlyDetails].forEach(el => {
      if (el) el.style.display = 'none';
    });

    switch (this.frequency) {
      case FREQUENCY.WEEKLY:
        if (weeklyDetails) weeklyDetails.style.display = 'block';
        break;
      case FREQUENCY.MONTHLY:
        if (monthlyDetails) monthlyDetails.style.display = 'block';
        break;
      case FREQUENCY.YEARLY:
        if (yearlyDetails) yearlyDetails.style.display = 'block';
        break;
    }
  }

  /**
   * Generate RRULE string
   * @private
   * @returns {string}
   */
  _generateRRule() {
    // Only generate RRULE if recurring is enabled
    if (!this.isRecurring) {
      console.log('RecurrencePickerComponent: Not recurring, returning empty RRULE');
      return '';
    }
    
    // Get end condition
    const endCondition = this.endCondition?.getEndCondition() || {};    
    const config = {
      frequency: this.frequency,
      startDate: this.startDate,
      selectedDays: Array.from(this.selectedDays),
      monthlyType: this.monthlyType,
      yearlyType: this.yearlyType,
      ...endCondition
    };    
    const rrule = RecurrenceRuleGenerator.generateRRule(config);
    
    return rrule;
  }

  /**
   * Notify parent of changes
   * @private
   */
  _notifyChange() {
    if (this.onChange) {
      const config = this.getRecurrenceConfig();
      this.onChange(config);
    }
  }
}
