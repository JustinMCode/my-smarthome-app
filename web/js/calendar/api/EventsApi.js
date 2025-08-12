/**
 * Events API
 * Wrapper around backend endpoints for events
 */

export class EventsApi {
  /**
   * Create a new event
   * @param {Object} params
   * @param {string} params.calendarId
   * @param {Object} params.eventData - { title, start, end, description?, location?, allDay? }
   * @returns {Promise<Object>} created event
   */
  static async createEvent({ calendarId, eventData }) {
    const resp = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, eventData })
    });

    const data = await EventsApi._parseJson(resp);
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to create event');
    }
    return data?.event || data;
  }

  static async _parseJson(resp) {
    try {
      return await resp.json();
    } catch (_) {
      return null;
    }
  }
}

export default EventsApi;


