/**
 * Touch-Optimized Date/Time Picker for 15-inch Touch Screens
 * Designed for easy touch interaction with large buttons and intuitive UI
 */

export class TouchDateTimePicker {
  constructor(options = {}) {
    this.options = {
      initialDate: options.initialDate || new Date(),
      mode: options.mode || 'datetime', // 'date', 'time', 'datetime'
      format24h: options.format24h || false,
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      showSeconds: options.showSeconds || false,
      touchTargetSize: options.touchTargetSize || 48, // Minimum 44px for touch
      ...options
    };
    
    this.currentDate = new Date(this.options.initialDate);
    this.isOpen = false;
    this.container = null;
    this.callback = null;
  }

  /**
   * Show the picker
   * @param {Function} callback - Called when date/time is selected
   */
  show(callback) {
    this.callback = callback;
    this.isOpen = true;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Hide the picker
   */
  hide() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isOpen = false;
    this.container = null;
  }

  /**
   * Render the picker
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'touch-datetime-picker';
    this.container.innerHTML = this.createPickerHTML();
    
    // Add to body
    document.body.appendChild(this.container);
    
    // Add show animation
    requestAnimationFrame(() => {
      this.container.classList.add('show');
    });
  }

  /**
   * Create the picker HTML
   */
  createPickerHTML() {
    return `
      <div class="picker-overlay">
        <div class="picker-modal">
          <div class="picker-header">
            <h3>Select Date & Time</h3>
            <button class="picker-close" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div class="picker-content">
            ${this.options.mode !== 'time' ? this.createDatePicker() : ''}
            ${this.options.mode !== 'date' ? this.createTimePicker() : ''}
          </div>
          
          <div class="picker-actions">
            <button class="picker-btn picker-btn-secondary">Cancel</button>
            <button class="picker-btn picker-btn-primary">Confirm</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create date picker section
   */
  createDatePicker() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentMonth = this.currentDate.getMonth();
    const currentYear = this.currentDate.getFullYear();
    const currentDay = this.currentDate.getDate();
    
    return `
      <div class="date-picker-section">
        <div class="date-header">
          <div class="month-year-selector">
            <button class="nav-btn prev-month" data-action="prev-month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <div class="month-year-display">
              <span class="month-name">${months[currentMonth]}</span>
              <span class="year-name">${currentYear}</span>
            </div>
            <button class="nav-btn next-month" data-action="next-month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="calendar-grid">
          <div class="weekday-headers">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
          </div>
          <div class="calendar-days">
            ${this.createCalendarDays()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create calendar days grid
   */
  createCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    const selectedDay = this.currentDate.getDate();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let daysHTML = '';
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = currentDay.toDateString() === today.toDateString();
      const isSelected = isCurrentMonth && currentDay.getDate() === selectedDay;
      const isPast = currentDay < today.setHours(0, 0, 0, 0);
      
      let classes = 'calendar-day';
      if (!isCurrentMonth) classes += ' other-month';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      if (isPast) classes += ' past';
      
      daysHTML += `
        <button class="${classes}" 
                data-date="${currentDay.getFullYear()}-${(currentDay.getMonth() + 1).toString().padStart(2, '0')}-${currentDay.getDate().toString().padStart(2, '0')}"
                ${!isCurrentMonth || isPast ? 'disabled' : ''}>
          ${currentDay.getDate()}
        </button>
      `;
    }
    
    return daysHTML;
  }

  /**
   * Create time picker section
   */
  createTimePicker() {
    const hours = this.currentDate.getHours();
    const minutes = this.currentDate.getMinutes();
    const is24h = this.options.format24h;
    
    return `
      <div class="time-picker-section">
        <div class="time-display">
          <div class="time-component">
            <label>Hour</label>
            <div class="time-selector">
              <button class="time-btn time-up" data-component="hour" data-action="up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
              </button>
              <div class="time-value clickable" data-component="hour" data-action="edit">
                ${is24h ? hours.toString().padStart(2, '0') : ((hours % 12) || 12).toString().padStart(2, '0')}
              </div>
              <button class="time-btn time-down" data-component="hour" data-action="down">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="time-separator">:</div>
          
          <div class="time-component">
            <label>Minute</label>
            <div class="time-selector">
              <button class="time-btn time-up" data-component="minute" data-action="up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
              </button>
              <div class="time-value clickable" data-component="minute" data-action="edit">
                ${minutes.toString().padStart(2, '0')}
              </div>
              <button class="time-btn time-down" data-component="minute" data-action="down">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>
          
          ${!is24h ? `
            <div class="time-component">
              <label>Period</label>
              <div class="ampm-selector">
                <button class="ampm-btn ${hours < 12 ? 'active' : ''}" data-period="am">AM</button>
                <button class="ampm-btn ${hours >= 12 ? 'active' : ''}" data-period="pm">PM</button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.container) return;

    // Close button
    this.container.querySelector('.picker-close').addEventListener('click', () => this.hide());
    
    // Cancel button
    this.container.querySelector('.picker-btn-secondary').addEventListener('click', () => this.hide());
    
    // Confirm button
    this.container.querySelector('.picker-btn-primary').addEventListener('click', () => {
      if (this.callback) {
        this.callback(new Date(this.currentDate));
      }
      this.hide();
    });

    // Overlay click
    this.container.querySelector('.picker-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hide();
      }
    });

    // Date picker events
    if (this.options.mode !== 'time') {
      this.attachDatePickerEvents();
    }

    // Time picker events
    if (this.options.mode !== 'date') {
      this.attachTimePickerEvents();
    }
  }

  /**
   * Attach date picker specific events
   */
  attachDatePickerEvents() {
    // Month navigation
    this.container.querySelector('.prev-month').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.updateDatePicker();
    });

    this.container.querySelector('.next-month').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.updateDatePicker();
    });

    // Day selection
    this.container.querySelectorAll('.calendar-day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dateStr = e.target.dataset.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        this.currentDate.setFullYear(year, month - 1, day);
        this.updateDatePicker();
      });
    });
  }

  /**
   * Attach time picker specific events
   */
  attachTimePickerEvents() {
    // Time adjustment buttons
    this.container.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const component = e.currentTarget.dataset.component;
        const action = e.currentTarget.dataset.action;
        this.adjustTime(component, action);
      });
    });

    // Clickable time values
    this.container.querySelectorAll('.time-value.clickable').forEach(value => {
      value.addEventListener('click', (e) => {
        const component = e.currentTarget.dataset.component;
        const action = e.currentTarget.dataset.action;
        this.editTime(component, action);
      });
    });

    // AM/PM buttons
    this.container.querySelectorAll('.ampm-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.currentTarget.dataset.period;
        this.setPeriod(period);
      });
    });
  }

  /**
   * Update date picker display
   */
  updateDatePicker() {
    const calendarDays = this.container.querySelector('.calendar-days');
    const monthName = this.container.querySelector('.month-name');
    const yearName = this.container.querySelector('.year-name');
    
    calendarDays.innerHTML = this.createCalendarDays();
    monthName.textContent = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
      .toLocaleDateString('en-US', { month: 'long' });
    yearName.textContent = this.currentDate.getFullYear();
    
    // Re-attach day selection events
    this.container.querySelectorAll('.calendar-day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dateStr = e.target.dataset.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        this.currentDate.setFullYear(year, month - 1, day);
        this.updateDatePicker();
      });
    });
  }

  /**
   * Adjust time component
   */
  adjustTime(component, action) {
    const increment = action === 'up' ? 1 : -1;
    
    if (component === 'hour') {
      let newHour = this.currentDate.getHours() + increment;
      if (newHour < 0) newHour = 23;
      if (newHour > 23) newHour = 0;
      this.currentDate.setHours(newHour);
    } else if (component === 'minute') {
      let newMinute = this.currentDate.getMinutes() + increment;
      if (newMinute < 0) newMinute = 60 + newMinute;
      if (newMinute >= 60) newMinute = newMinute % 60;
      this.currentDate.setMinutes(newMinute);
    }
    
    this.updateTimePicker();
  }

  /**
   * Edit time component
   */
  editTime(component, action) {
    if (component === 'hour') {
      let newHour = this.currentDate.getHours() + 1;
      if (newHour > 23) newHour = 0;
      this.currentDate.setHours(newHour);
    } else if (component === 'minute') {
      let newMinute = this.currentDate.getMinutes() + 1;
      if (newMinute >= 60) newMinute = 0;
      this.currentDate.setMinutes(newMinute);
    }
    
    this.updateTimePicker();
  }

  /**
   * Set AM/PM period
   */
  setPeriod(period) {
    const currentHours = this.currentDate.getHours();
    let newHours = currentHours;
    
    if (period === 'am') {
      // Convert to AM (0-11 range)
      if (currentHours >= 12) {
        newHours = currentHours - 12;
      }
    } else if (period === 'pm') {
      // Convert to PM (12-23 range)
      if (currentHours < 12) {
        newHours = currentHours + 12;
      }
    }
    
    this.currentDate.setHours(newHours);
    
    // Update AM/PM button visual states
    this.container.querySelectorAll('.ampm-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.period === period);
    });
    
    this.updateTimePicker();
  }

  /**
   * Update time picker display
   */
  updateTimePicker() {
    const hours = this.currentDate.getHours();
    const minutes = this.currentDate.getMinutes();
    const is24h = this.options.format24h;
    
    // Update hour display - target only the time value div, not buttons
    const hourElement = this.container.querySelector('.time-value[data-component="hour"]');
    if (hourElement) {
      const newHourText = is24h ? hours.toString().padStart(2, '0') : ((hours % 12) || 12).toString().padStart(2, '0');
      hourElement.textContent = newHourText;
      console.log('Updated hour display to:', newHourText);
    } else {
      console.warn('Hour element not found');
    }
    
    // Update minute display - target only the time value div, not buttons
    const minuteElement = this.container.querySelector('.time-value[data-component="minute"]');
    if (minuteElement) {
      const newMinuteText = minutes.toString().padStart(2, '0');
      minuteElement.textContent = newMinuteText;
      console.log('Updated minute display to:', newMinuteText);
    } else {
      console.warn('Minute element not found');
    }
    
    // Don't auto-update AM/PM buttons - let user maintain their selection
    // The AM/PM buttons will only change when user explicitly clicks them
  }

  /**
   * Get current selected date/time
   */
  getValue() {
    return new Date(this.currentDate);
  }

  /**
   * Set the picker value
   */
  setValue(date) {
    this.currentDate = new Date(date);
    if (this.isOpen) {
      this.updateDatePicker();
      this.updateTimePicker();
    }
  }
}

export default TouchDateTimePicker;
