/**
 * Calendars API
 * Wrapper around backend endpoints for calendars
 */

import { _parseJson } from './utils.js';

export class CalendarsApi {
  /**
   * List calendars (reads from backend; prefer calendarConfigService for cached view)
   */
  static async listCalendars() {
    const resp = await fetch('/api/calendar/calendars');
    const data = await _parseJson(resp);
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to fetch calendars');
    }
    return data?.calendars || [];
  }

  /**
   * Create a new calendar
   * @param {{ name: string, description?: string, color?: string, foregroundColor?: string, timeZone?: string, location?: string }} payload
   */
  static async createCalendar(payload) {
    const resp = await fetch('/api/calendar/calendars/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await _parseJson(resp);
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to create calendar');
    }
    return data?.calendar || data;
  }

  /**
   * @deprecated Use shared utility from utils.js instead
   * This method is maintained for backward compatibility but delegates to the shared utility
   */
  static async _parseJson(resp) {
    return _parseJson(resp);
  }
}

export default CalendarsApi;


