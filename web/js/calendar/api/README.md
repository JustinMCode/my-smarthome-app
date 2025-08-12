# Calendar API Analysis

## File Inventory
| File | Purpose | Lines | Issues Count | Priority |
|------|---------|-------|--------------|----------|
| CalendarsApi.js | Backend API wrapper for calendar CRUD operations | 48 | 6 | 🟠 |
| EventsApi.js | Backend API wrapper for event operations | 40 | 5 | 🟠 |

## Improvement Recommendations

### CalendarsApi.js

#### 🔴 Critical Issues
- **Issue**: Inconsistent error handling with silent failures
  - Current: `_parseJson` returns `null` on JSON parse errors, potentially masking real issues
  - Suggested: Throw specific error types for different failure scenarios
  - Impact: Prevents debugging of malformed JSON responses

#### 🟠 High Priority
- **Issue**: Duplicate `_parseJson` method across both API classes
  - Current: Identical implementation in both `CalendarsApi` and `EventsApi`
  - Suggested: Extract to shared utility class or base API class
  - Impact: Reduces code duplication and improves maintainability

- **Issue**: Missing input validation for API parameters
  - Current: No validation of `payload` object in `createCalendar`
  - Suggested: Add parameter validation with clear error messages
  - Impact: Prevents invalid data from reaching backend

- **Issue**: Inconsistent return value handling
  - Current: `return data?.calendar || data;` - unclear fallback logic
  - Suggested: Standardize return value structure across all methods
  - Impact: Improves API consistency and reduces bugs

#### 🟡 Medium Priority
- **Issue**: Missing JSDoc for `_parseJson` method
  - Current: Private method lacks documentation
  - Suggested: Add comprehensive JSDoc with parameter and return types
  - Impact: Improves code documentation and IDE support

- **Issue**: No request timeout handling
  - Current: Fetch requests can hang indefinitely
  - Suggested: Add timeout configuration and AbortController support
  - Impact: Improves user experience and prevents hanging requests

#### 🟢 Low Priority
- **Issue**: Missing HTTP status code handling
  - Current: Only checks `resp.ok` and `data?.success`
  - Suggested: Add specific handling for different HTTP status codes
  - Impact: Better error messages for different failure scenarios

### EventsApi.js

#### 🔴 Critical Issues
- **Issue**: Limited functionality - only supports event creation
  - Current: Missing read, update, delete operations for events
  - Suggested: Add comprehensive CRUD operations
  - Impact: Incomplete API functionality

#### 🟠 High Priority
- **Issue**: Duplicate `_parseJson` method (same as CalendarsApi)
  - Current: Identical implementation to CalendarsApi
  - Suggested: Extract to shared utility
  - Impact: Code duplication and maintenance overhead

- **Issue**: Missing input validation for event data
  - Current: No validation of `eventData` object structure
  - Suggested: Add comprehensive validation for required fields
  - Impact: Prevents invalid event creation

#### 🟡 Medium Priority
- **Issue**: Inconsistent parameter structure
  - Current: Uses object destructuring `{ calendarId, eventData }`
  - Suggested: Standardize parameter patterns across all API methods
  - Impact: Improves API consistency

- **Issue**: Missing JSDoc for `_parseJson` method
  - Current: Private method lacks documentation
  - Suggested: Add comprehensive JSDoc
  - Impact: Improves code documentation

#### 🟢 Low Priority
- **Issue**: No request timeout handling
  - Current: Fetch requests can hang indefinitely
  - Suggested: Add timeout configuration
  - Impact: Better user experience

## Refactoring Effort Estimate
- Total files needing work: 2
- Estimated hours: 8-12 hours
- Quick wins: Extract `_parseJson` to shared utility (1 hour)
- Complex refactors: Create base API class with common functionality (4-6 hours)

## Dependencies
- Internal dependencies: Both files are independent API wrappers
- External dependencies: 
  - `fetch` API (browser standard)
  - JSON parsing (browser standard)

## Architecture Recommendations

### 1. Create Base API Class
```javascript
// BaseApi.js
export class BaseApi {
  static async _parseJson(resp) {
    try {
      return await resp.json();
    } catch (error) {
      throw new Error(`JSON parse error: ${error.message}`);
    }
  }

  static async _handleResponse(resp, data) {
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.error || `HTTP ${resp.status}: ${resp.statusText}`);
    }
    return data;
  }

  static async _makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

### 2. Standardize Error Handling
```javascript
// Error types
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
```

### 3. Add Input Validation
```javascript
// Validation utilities
export const validateCalendarPayload = (payload) => {
  if (!payload.name || typeof payload.name !== 'string') {
    throw new Error('Calendar name is required and must be a string');
  }
  // Add more validation rules
};
```

## Function Documentation

### CalendarsApi.js Functions

#### `listCalendars()`
Fetches all calendars from the backend API endpoint `/api/calendar/calendars` and returns an array of calendar objects. This method reads directly from the backend and is different from cached calendar configurations.

#### `createCalendar(payload)`
Creates a new calendar by sending a POST request to `/api/calendar/calendars/create` with calendar data including name, description, color, timezone, and location properties. Returns the created calendar object.

#### `_parseJson(resp)` (private)
Internal utility method that safely parses JSON responses from fetch requests, returning null on parse errors to prevent crashes.

### EventsApi.js Functions

#### `createEvent({ calendarId, eventData })`
Creates a new event in a specific calendar by sending a POST request to `/api/calendar/events` with the calendar ID and event data including title, start/end times, description, location, and allDay flag. Returns the created event object.

#### `_parseJson(resp)` (private)
Internal utility method identical to CalendarsApi's implementation that safely parses JSON responses from fetch requests, returning null on parse errors.

## Function Overlap Analysis

**Duplicate Functions:**
- `_parseJson(resp)` - Identical implementation in both files, should be extracted to a shared utility

**Unique Functions:**
- `listCalendars()` - Only in CalendarsApi
- `createCalendar(payload)` - Only in CalendarsApi  
- `createEvent({ calendarId, eventData })` - Only in EventsApi

**Missing CRUD Operations:**
- EventsApi lacks read, update, and delete operations for events
- CalendarsApi lacks update and delete operations for calendars
