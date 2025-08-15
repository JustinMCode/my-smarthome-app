import { FREQUENCY, MONTHLY_TYPE, YEARLY_TYPE, DEFAULT_VALUES, WEEKDAYS } from './RecurrenceTypes.js';
import { RecurrenceEndCondition } from './RecurrenceEndCondition.js';
import { RecurrenceRuleGenerator } from './RecurrenceRuleGenerator.js';

/**
 * Component to handle recurrence configuration for events
 * Styled with glassmorphism design system
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
   * Render the recurrence picker with glassmorphism styling
   * @returns {HTMLElement}
   */
  render() {
    try {
      const wrapper = document.createElement('div');
      wrapper.className = 'glass-recurring-section';
      wrapper.innerHTML = this._template();

      this._attachHandlers(wrapper);

      return wrapper;
    } catch (error) {
      console.error('RecurrencePickerComponent: Error rendering:', error);
      // Return a fallback element
      const fallback = document.createElement('div');
      fallback.className = 'glass-recurring-section';
      fallback.innerHTML = `
        <div class="glass-recurring-header">
          <label class="glass-checkbox-container">
            <input type="checkbox" id="event-recurring" disabled class="glass-checkbox-input">
            <span class="glass-checkmark"></span>
            <span class="glass-checkbox-label">Recurring events unavailable</span>
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
   * Template for recurrence picker with glassmorphism styling
   * @private
   * @returns {string}
   */
  _template() {
    return `
      <div class="glass-recurring-header">
        <label class="glass-checkbox-container">
          <input type="checkbox" id="event-recurring" class="glass-checkbox-input">
          <span class="glass-checkmark"></span>
          <span class="glass-checkbox-label">Make this a recurring event</span>
        </label>
      </div>
      
      <div id="recurring-options" class="glass-recurring-details" style="display: none;">
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
        <div class="glass-recurring-config">
          <div class="glass-recurring-frequency-section">
            <label class="glass-section-label">Repeat</label>
            <div class="glass-frequency-selector">
              <select id="recurring-frequency" class="glass-recurring-select">
                <option value="${FREQUENCY.DAILY}">Daily</option>
                <option value="${FREQUENCY.WEEKLY}" selected>Weekly</option>
                <option value="${FREQUENCY.MONTHLY}">Monthly</option>
                <option value="${FREQUENCY.YEARLY}">Yearly</option>
              </select>
              
              <div class="glass-frequency-details">
                <div id="weekly-details" class="glass-frequency-option-details">
                  <label class="glass-option-heading">Repeat on:</label>
                  <div class="glass-day-selector">
                    ${this._generateDayButtons()}
                  </div>
                </div>
                
                <div id="monthly-details" class="glass-frequency-option-details" style="display: none;">
                  <label class="glass-option-heading">Repeat on:</label>
                  <div class="glass-option-item glass-monthly-option">
                    <input type="radio" id="monthly-same-day" name="monthly-type" 
                           value="${MONTHLY_TYPE.SAME_DAY}" class="glass-radio" checked>
                    <label for="monthly-same-day" class="glass-option-label">Same day of month</label>
                  </div>
                  <div class="glass-option-item glass-monthly-option">
                    <input type="radio" id="monthly-same-weekday" name="monthly-type" 
                           value="${MONTHLY_TYPE.SAME_WEEKDAY}" class="glass-radio">
                    <label for="monthly-same-weekday" class="glass-option-label">Same day of week</label>
                  </div>
                </div>
                
                <div id="yearly-details" class="glass-frequency-option-details" style="display: none;">
                  <label class="glass-option-heading">Repeat on:</label>
                  <div class="glass-option-item glass-yearly-option">
                    <input type="radio" id="yearly-same-date" name="yearly-type" 
                           value="${YEARLY_TYPE.SAME_DATE}" class="glass-radio" checked>
                    <label for="yearly-same-date" class="glass-option-label">Same date every year</label>
                  </div>
                  <div class="glass-option-item glass-yearly-option">
                    <input type="radio" id="yearly-same-weekday" name="yearly-type" 
                           value="${YEARLY_TYPE.SAME_WEEKDAY}" class="glass-radio">
                    <label for="yearly-same-weekday" class="glass-option-label">Same day of week</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div id="end-condition-container"></div>
        </div>
      `;
      
      // Re-attach handlers for the newly created elements
      this._attachRecurringOptionsHandlers(recurringOptions.closest('.glass-recurring-section'));
    }
  }

  /**
   * Generate day selector buttons HTML with glassmorphism styling
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
      `<button type="button" class="glass-day-btn" data-day="${day.code}">${day.label}</button>`
    ).join('');
  }

  /**
   * Attach event handlers with animations
   * @private
   * @param {HTMLElement} wrapper
   */
  _attachHandlers(wrapper) {
    const recurringCheckbox = wrapper.querySelector('#event-recurring');
    const recurringOptions = wrapper.querySelector('#recurring-options');

    // Toggle recurring options visibility with animation
    if (recurringCheckbox) {
      recurringCheckbox.addEventListener('change', (e) => {
        
        // Update internal state
        this.isRecurring = e.target.checked;
        
        if (e.target.checked) {
          // Add pulse animation to checkbox
          const checkmark = e.target.nextElementSibling;
          checkmark.classList.add('glass-check-pulse');
          setTimeout(() => {
            checkmark.classList.remove('glass-check-pulse');
          }, 300);
          
          this._populateRecurringOptions(recurringOptions);
          recurringOptions.style.display = 'block';
          recurringOptions.classList.add('glass-expand-in');
          this._initializeDefaults(wrapper);
        } else {
          recurringOptions.classList.add('glass-collapse-out');
          setTimeout(() => {
            recurringOptions.style.display = 'none';
            recurringOptions.classList.remove('glass-collapse-out');
          }, 300);
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

    // Handle frequency changes with smooth transitions
    if (frequencySelect) {
      frequencySelect.addEventListener('change', (e) => {
        this.frequency = e.target.value;
        
        // Add change animation
        frequencySelect.classList.add('glass-select-changed');
        setTimeout(() => {
          frequencySelect.classList.remove('glass-select-changed');
        }, 300);
        
        this._updateFrequencyDetails(wrapper);
        this._notifyChange();
      });
      
      // Add focus effects
      frequencySelect.addEventListener('focus', () => {
        frequencySelect.classList.add('glass-select-focused');
      });
      
      frequencySelect.addEventListener('blur', () => {
        frequencySelect.classList.remove('glass-select-focused');
      });
    }

    // Handle day selection for weekly recurrence with animations
    const dayButtons = wrapper.querySelectorAll('.glass-day-btn');
    dayButtons.forEach(button => {
      button.addEventListener('click', () => {
        const day = button.dataset.day;
        
        if (button.classList.contains('glass-day-selected')) {
          button.classList.remove('glass-day-selected');
          button.classList.add('glass-day-deselect');
          this.selectedDays.delete(day);
          setTimeout(() => {
            button.classList.remove('glass-day-deselect');
          }, 300);
        } else {
          button.classList.add('glass-day-selected');
          button.classList.add('glass-day-select-pulse');
          this.selectedDays.add(day);
          setTimeout(() => {
            button.classList.remove('glass-day-select-pulse');
          }, 300);
        }
        this._notifyChange();
      });
      
      // Add hover effects
      button.addEventListener('mouseenter', () => {
        button.classList.add('glass-day-hover');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('glass-day-hover');
      });
    });

    // Handle monthly type changes with animations
    const monthlyTypeRadios = wrapper.querySelectorAll('input[name="monthly-type"]');
    monthlyTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.monthlyType = e.target.value;
        
        // Add active class to parent
        const parent = e.target.closest('.glass-option-item');
        parent.classList.add('glass-option-active');
        
        // Remove from others
        monthlyTypeRadios.forEach(r => {
          if (r !== e.target) {
            r.closest('.glass-option-item').classList.remove('glass-option-active');
          }
        });
        
        this._notifyChange();
      });
    });

    // Handle yearly type changes with animations
    const yearlyTypeRadios = wrapper.querySelectorAll('input[name="yearly-type"]');
    yearlyTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.yearlyType = e.target.value;
        
        // Add active class to parent
        const parent = e.target.closest('.glass-option-item');
        parent.classList.add('glass-option-active');
        
        // Remove from others
        yearlyTypeRadios.forEach(r => {
          if (r !== e.target) {
            r.closest('.glass-option-item').classList.remove('glass-option-active');
          }
        });
        
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
   * Initialize default values with animations
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
      dayButton.classList.add('glass-day-selected');
      dayButton.classList.add('glass-day-init');
      this.selectedDays.add(currentDayCode);
      setTimeout(() => {
        dayButton.classList.remove('glass-day-init');
      }, 300);
    }
    
    // Initialize end condition
    if (!this.endCondition) {
      this.endCondition = new RecurrenceEndCondition({
        startDate: this.startDate,
        onChange: () => this._notifyChange()
      });
    }
    
    // Update frequency details to show the correct options
    this._updateFrequencyDetails(wrapper);
  }

  /**
   * Update frequency details visibility with animations
   * @private
   * @param {HTMLElement} wrapper
   */
  _updateFrequencyDetails(wrapper) {
    const weeklyDetails = wrapper.querySelector('#weekly-details');
    const monthlyDetails = wrapper.querySelector('#monthly-details');
    const yearlyDetails = wrapper.querySelector('#yearly-details');

    // Hide all with fade out
    [weeklyDetails, monthlyDetails, yearlyDetails].forEach(el => {
      if (el && el.style.display !== 'none') {
        el.classList.add('glass-fade-out');
        setTimeout(() => {
          el.style.display = 'none';
          el.classList.remove('glass-fade-out');
        }, 200);
      }
    });

    // Show relevant detail with fade in
    setTimeout(() => {
      let detailToShow = null;
      switch (this.frequency) {
        case FREQUENCY.WEEKLY:
          detailToShow = weeklyDetails;
          break;
        case FREQUENCY.MONTHLY:
          detailToShow = monthlyDetails;
          break;
        case FREQUENCY.YEARLY:
          detailToShow = yearlyDetails;
          break;
      }
      
      if (detailToShow) {
        detailToShow.style.display = 'block';
        detailToShow.classList.add('glass-fade-in');
        setTimeout(() => {
          detailToShow.classList.remove('glass-fade-in');
        }, 300);
      }
    }, 250);
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