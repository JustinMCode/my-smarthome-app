/**
 * Calendars API
 * Wrapper around backend endpoints for calendars
 */

export class CalendarsApi {
  /**
   * List calendars (reads from backend; prefer calendarConfigService for cached view)
   */
  static async listCalendars() {
    const resp = await fetch('/api/calendar/calendars');
    const data = await CalendarsApi._parseJson(resp);
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
    const data = await CalendarsApi._parseJson(resp);
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to create calendar');
    }
    return data?.calendar || data;
  }

  static async _parseJson(resp) {
    try {
      return await resp.json();
    } catch (_) {
      return null;
    }
  }
}

export default CalendarsApi;


