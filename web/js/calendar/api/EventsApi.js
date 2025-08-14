/**
 * Events API
 * Wrapper around backend endpoints for events
 */

import { _parseJson } from './utils.js';

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

    const data = await _parseJson(resp);
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to create event');
    }
    return data?.event || data;
  }

  /**
   * @deprecated Use shared utility from utils.js instead
   * This method is maintained for backward compatibility but delegates to the shared utility
   */
  static async _parseJson(resp) {
    return _parseJson(resp);
  }
}

export default EventsApi;


