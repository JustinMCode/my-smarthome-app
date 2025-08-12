import { FREQUENCY, MONTHLY_TYPE, YEARLY_TYPE, END_TYPE } from './RecurrenceTypes.js';

/**
 * Utility class to generate RRULE strings for recurring events
 */
export class RecurrenceRuleGenerator {
  /**
   * Generate RRULE string based on recurrence configuration
   * @param {Object} config - Recurrence configuration
   * @param {string} config.frequency - Frequency type (daily, weekly, monthly, yearly)
   * @param {Date} config.startDate - Event start date
   * @param {string[]} [config.selectedDays] - Selected days for weekly recurrence
   * @param {string} [config.monthlyType] - Monthly recurrence type
   * @param {string} [config.yearlyType] - Yearly recurrence type
   * @param {string} config.endType - End condition type
   * @param {number} [config.endOccurrences] - Number of occurrences for AFTER end type
   * @param {string} [config.endDate] - End date for ON end type
   * @returns {string} RRULE string
   */
  static generateRRule(config) {
    const {
      frequency,
      startDate,
      selectedDays,
      monthlyType,
      yearlyType,
      endType,
      endOccurrences,
      endDate
    } = config;

    let rrule = `FREQ=${frequency.toUpperCase()}`;

    // Add frequency-specific rules
    switch (frequency) {
      case FREQUENCY.WEEKLY:
        if (selectedDays?.length > 0) {
          rrule += `;BYDAY=${selectedDays.join(',')}`;
        }
        break;

      case FREQUENCY.MONTHLY:
        if (monthlyType === MONTHLY_TYPE.SAME_DAY) {
          rrule += `;BYMONTHDAY=${startDate.getDate()}`;
        } else if (monthlyType === MONTHLY_TYPE.SAME_WEEKDAY) {
          rrule += `;BYDAY=${this._getWeekdayOccurrence(startDate)}`;
        }
        break;

      case FREQUENCY.YEARLY:
        if (yearlyType === YEARLY_TYPE.SAME_DATE) {
          rrule += `;BYMONTHDAY=${startDate.getDate()}`;
          rrule += `;BYMONTH=${startDate.getMonth() + 1}`;
        } else if (yearlyType === YEARLY_TYPE.SAME_WEEKDAY) {
          rrule += `;BYDAY=${this._getWeekdayOccurrence(startDate)}`;
          rrule += `;BYMONTH=${startDate.getMonth() + 1}`;
        }
        break;
    }

    // Add end condition
    switch (endType) {
      case END_TYPE.AFTER:
        if (endOccurrences) {
          rrule += `;COUNT=${endOccurrences}`;
        }
        break;
      case END_TYPE.ON:
        if (endDate) {
          rrule += `;UNTIL=${endDate}`;
        }
        break;
    }

    return rrule;
  }

  /**
   * Get the weekday occurrence string for monthly/yearly recurrence
   * @private
   * @param {Date} date - Reference date
   * @returns {string} Weekday occurrence string (e.g., "1MO" for first Monday)
   */
  static _getWeekdayOccurrence(date) {
    const weekday = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getDay()];
    const occurrence = Math.ceil(date.getDate() / 7);
    return `${occurrence}${weekday}`;
  }
}
