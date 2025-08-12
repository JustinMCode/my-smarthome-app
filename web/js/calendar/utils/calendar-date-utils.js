/**
 * Calendar Date Utilities
 * Centralized date manipulation and formatting functions
 */

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Get start of week for a given date
 * @param {Date} date - Input date
 * @returns {Date} - Start of week (Sunday)
 */
export function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

/**
 * Get end of week for a given date
 * @param {Date} date - Input date
 * @returns {Date} - End of week (Saturday)
 */
export function getEndOfWeek(date) {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
}

/**
 * Get start of month for a given date
 * @param {Date} date - Input date
 * @returns {Date} - Start of month
 */
export function getStartOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month for a given date
 * @param {Date} date - Input date
 * @returns {Date} - End of month
 */
export function getEndOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get days in month
 * @param {Date} date - Input date
 * @returns {number} - Number of days in month
 */
export function getDaysInMonth(date) {
    return getEndOfMonth(date).getDate();
}

/**
 * Add days to a date
 * @param {Date} date - Input date
 * @param {number} days - Days to add
 * @returns {Date} - New date
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Add months to a date
 * @param {Date} date - Input date
 * @param {number} months - Months to add
 * @returns {Date} - New date
 */
export function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

/**
 * Check if date is today
 * @param {Date} date - Input date
 * @returns {boolean} - True if today
 */
export function isToday(date) {
    return isSameDay(date, new Date());
}

/**
 * Check if date is weekend
 * @param {Date} date - Input date
 * @returns {boolean} - True if weekend
 */
export function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

/**
 * Check if date is in current month
 * @param {Date} date - Date to check
 * @param {Date} currentDate - Current month reference
 * @returns {boolean} - True if in current month
 */
export function isCurrentMonth(date, currentDate) {
    return date.getFullYear() === currentDate.getFullYear() &&
           date.getMonth() === currentDate.getMonth();
}

/**
 * Get month name
 * @param {Date} date - Input date
 * @param {boolean} short - Short format
 * @returns {string} - Month name
 */
export function getMonthName(date, short = false) {
    const months = short ? 
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
}

/**
 * Get day name
 * @param {Date} date - Input date
 * @param {boolean} short - Short format
 * @returns {string} - Day name
 */
export function getDayName(date, short = false) {
    const days = short ? 
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] :
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

/**
 * Format date for display
 * @param {Date} date - Input date
 * @param {string} format - Format type
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'short') {
    switch (format) {
        case 'full':
            return `${getDayName(date)} ${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
        case 'month-year':
            return `${getMonthName(date)} ${date.getFullYear()}`;
        case 'short-date':
            return `${getMonthName(date, true)} ${date.getDate()}`;
        case 'day-month':
            return `${date.getDate()} ${getMonthName(date, true)}`;
        default:
            return `${getMonthName(date, true)} ${date.getDate()}, ${date.getFullYear()}`;
    }
}

/**
 * Format time for display
 * @param {Date} date - Input date
 * @param {boolean} use24Hour - Use 24-hour format
 * @returns {string} - Formatted time string
 */
export function formatTime(date, use24Hour = false) {
    if (use24Hour) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    } else {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
}

/**
 * Get calendar grid dates for a month
 * @param {Date} date - Month to get grid for
 * @returns {Array} - Array of dates for calendar grid
 */
export function getCalendarGridDates(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const dates = [];
    
    // Previous month days
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevLastDay - i);
        dates.push({ date, isOtherMonth: true });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        dates.push({ date, isOtherMonth: false });
    }
    
    // Next month days - Always use 6 weeks (42 cells) for consistency
    const totalCells = startDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        dates.push({ date, isOtherMonth: true });
    }
    
    return dates;
}
