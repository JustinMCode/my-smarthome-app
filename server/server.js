import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { CalendarService } from './services/calendar-service.js';
import { createCalendarRoutes } from './routes/calendar-routes.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const CONFIG_PATH = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use('/', express.static(path.join(__dirname, '../web')));

// Initialize calendar service
const calendarService = new CalendarService(config);

// Event cache
let cache = { events: [], etag: '' };

// Refresh function to fetch all events
async function refresh() {
  try {
    const events = await calendarService.fetchAllEvents();
    const etag = JSON.stringify(events.map(e => [e.id, e.start, e.end]));
    
    if (etag !== cache.etag) {
      cache = { events, etag };
      broadcast(JSON.stringify({ type: 'events', payload: events }));
    }
  } catch (error) {
    console.error('Refresh failed:', error.message);
  }
}

// Initial load
refresh();

// Auto-refresh every 5 minutes (instead of webhooks)
const REFRESH_INTERVAL = (config.refreshMinutes || 5) * 60 * 1000;
setInterval(refresh, REFRESH_INTERVAL);
    // console.log(`📅 Auto-refresh enabled: every ${REFRESH_INTERVAL / 60000} minutes`);

// Basic REST endpoint for events
app.get('/api/events', (req, res) => {
  res.json(cache.events);
});

// SSE stream for instant updates to connected clients
const clients = new Set();

function broadcast(msg) {
  for (const res of clients) {
    res.write(`data: ${msg}\n\n`);
  }
}

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately
  res.write(`data: ${JSON.stringify({ type: 'events', payload: cache.events })}\n\n`);
  
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

// Calendar API routes
app.use('/api/calendar', createCalendarRoutes(calendarService, refresh));

// Start server
app.listen(config.port, () => {
  // console.log(`✅ Calendar server running on port ${config.port}`);
// console.log(`📍 Frontend: http://localhost:${config.port}`);
// console.log(`📍 API: http://localhost:${config.port}/api`);
});