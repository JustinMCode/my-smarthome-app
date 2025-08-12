/**
 * Calendar Routes
 * API endpoints for calendar operations
 */

import express from 'express';

export function createCalendarRoutes(calendarService, refreshCallback) {
  const router = express.Router();

  // Get all calendars
  router.get('/calendars', (req, res) => {
    try {
      const calendars = calendarService.getAllCalendars();
      res.json({ 
        success: true, 
        calendars: calendars,
        count: calendars.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to get calendars' 
      });
    }
  });

  // Get specific calendar
  router.get('/calendars/:calendarId', (req, res) => {
    try {
      const { calendarId } = req.params;
      const calendar = calendarService.getCalendar(calendarId);
      
      if (!calendar) {
        return res.status(404).json({
          error: 'Calendar not found'
        });
      }
      
      res.json({
        success: true,
        calendar: calendar
      });
    } catch (error) {
      res.status(500).json({
        error: error.message || 'Failed to get calendar'
      });
    }
  });

  // Create a new calendar (owned by service account)
  router.post('/calendars/create', async (req, res) => {
    try {
      const { name, description, color, foregroundColor, timeZone, location } = req.body;

      if (!name) {
        return res.status(400).json({ 
          error: 'Calendar name is required' 
        });
      }

      const calendarData = {
        name,
        description: description || '',
        color: color || '#4285f4',
        foregroundColor: foregroundColor || '#000000',
        timeZone: timeZone || 'America/Chicago',
        location: location || ''
      };

      const newCalendar = await calendarService.createNewCalendar(calendarData);
      await refreshCallback();

      res.json({ 
        success: true, 
        calendar: newCalendar,
        message: 'Calendar created successfully' 
      });

    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to create calendar' 
      });
    }
  });

  // Delete a calendar (only if owned by service account)
  router.delete('/calendars/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;

      await calendarService.deleteCalendar(calendarId);
      await refreshCallback();

      res.json({ 
        success: true, 
        message: 'Calendar deleted successfully' 
      });

    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to delete calendar' 
      });
    }
  });

  // Update calendar appearance
  router.patch('/calendars/:calendarId', async (req, res) => {
    try {
      const { calendarId } = req.params;
      const { color, foregroundColor } = req.body;
      
      if (!calendarService.calendar) {
        return res.status(503).json({
          error: 'Google Calendar API not available'
        });
      }
      
      // Update in Google Calendar list
      const result = await calendarService.calendar.calendarList.patch({
        calendarId: calendarId,
        resource: {
          backgroundColor: color,
          foregroundColor: foregroundColor
        }
      });
      
      // Update local cache
      const calendar = calendarService.getCalendar(calendarId);
      if (calendar) {
        calendar.color = color || calendar.color;
        calendar.foregroundColor = foregroundColor || calendar.foregroundColor;
      }
      
      res.json({
        success: true,
        message: 'Calendar appearance updated',
        calendar: result.data
      });
      
    } catch (error) {
      res.status(500).json({
        error: error.message || 'Failed to update calendar'
      });
    }
  });

  // Reload calendars from Google
  router.post('/calendars/reload', async (req, res) => {
    try {
      await calendarService.setupCalendars();
      const calendars = calendarService.getAllCalendars();
      
      res.json({
        success: true,
        message: `Reloaded ${calendars.length} calendars`,
        calendars: calendars
      });
    } catch (error) {
      res.status(500).json({
        error: error.message || 'Failed to reload calendars'
      });
    }
  });

  // Get all events
  router.get('/events', async (req, res) => {
    try {
      const events = await calendarService.fetchAllEvents();
      res.json({ 
        success: true, 
        events: events,
        count: events.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to fetch events' 
      });
    }
  });

  // Create new event
  router.post('/events', async (req, res) => {
    try {
      const { calendarId, eventData } = req.body;

      if (!calendarId || !eventData) {
        return res.status(400).json({ 
          error: 'Missing required fields: calendarId and eventData' 
        });
      }

      if (!eventData.title || !eventData.start || !eventData.end) {
        return res.status(400).json({ 
          error: 'Missing required event fields: title, start, end' 
        });
      }

      const event = await calendarService.createEvent(calendarId, eventData);
      await refreshCallback();

      res.json({ 
        success: true, 
        event: event,
        message: 'Event created successfully' 
      });

    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to create event' 
      });
    }
  });

  // Update existing event
  router.put('/events/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId, updates } = req.body;

      if (!calendarId || !updates) {
        return res.status(400).json({ 
          error: 'Missing required fields: calendarId and updates' 
        });
      }

      const event = await calendarService.updateEvent(calendarId, eventId, updates);
      await refreshCallback();

      res.json({ 
        success: true, 
        event: event,
        message: 'Event updated successfully' 
      });

    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to update event' 
      });
    }
  });

  // Delete event
  router.delete('/events/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId } = req.body;

      if (!calendarId) {
        return res.status(400).json({ 
          error: 'Missing required field: calendarId' 
        });
      }

      await calendarService.deleteEvent(calendarId, eventId);
      await refreshCallback();

      res.json({ 
        success: true, 
        message: 'Event deleted successfully' 
      });

    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to delete event' 
      });
    }
  });

  // Manual refresh endpoint
  router.post('/refresh', async (req, res) => {
    try {
      await refreshCallback();
      res.json({ 
        success: true, 
        message: 'Manual refresh completed' 
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to refresh' 
      });
    }
  });

  // Get service account email
  router.get('/service-account', (req, res) => {
    try {
      const serviceAccountEmail = calendarService.getServiceAccountEmail();
      
      if (!serviceAccountEmail) {
        return res.status(404).json({
          error: 'Service account not configured'
        });
      }
      
      res.json({
        success: true,
        email: serviceAccountEmail
      });
    } catch (error) {
      res.status(500).json({
        error: error.message || 'Failed to get service account email'
      });
    }
  });

  return router;
}