/**
 * Constants for recurrence types and configurations
 */

export const FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

export const MONTHLY_TYPE = {
  SAME_DAY: 'same-day',
  SAME_WEEKDAY: 'same-weekday'
};

export const YEARLY_TYPE = {
  SAME_DATE: 'same-date',
  SAME_WEEKDAY: 'same-weekday'
};

export const END_TYPE = {
  NEVER: 'never',
  AFTER: 'after',
  ON: 'on'
};

export const WEEKDAYS = {
  MONDAY: 'MO',
  TUESDAY: 'TU',
  WEDNESDAY: 'WE',
  THURSDAY: 'TH',
  FRIDAY: 'FR',
  SATURDAY: 'SA',
  SUNDAY: 'SU'
};

export const DEFAULT_VALUES = {
  OCCURRENCES: 10,
  FREQUENCY: FREQUENCY.WEEKLY,
  END_TYPE: END_TYPE.NEVER
};
