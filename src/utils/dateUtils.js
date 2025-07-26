/**
 * Utility functions for date parsing and formatting
 * Consolidates date handling logic used across the application
 */

/**
 * Parse date string as local date (not UTC)
 * Handles various date formats including timestamps, ISO strings, and YYYY-MM-DD
 * @param {string|Date|number} dateValue - The date value to parse
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseDateAsLocal = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    const timestamp = dateValue < 1e10 ? dateValue * 1000 : dateValue;
    const date = new Date(timestamp);
    
    // If this timestamp represents midnight UTC, convert it to local midnight
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcSeconds = date.getUTCSeconds();
    
    if (utcHours === 0 && utcMinutes === 0 && utcSeconds === 0) {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      return new Date(year, month, day);
    }
    
    return date;
  }
  
  // If it's a string
  if (typeof dateValue === 'string') {
    // Handle timestamp strings (e.g., "1750723200000")
    if (/^\d+$/.test(dateValue)) {
      const timestamp = parseInt(dateValue, 10);
      const date = new Date(timestamp);
      
      // If this timestamp represents midnight UTC, convert it to local midnight
      const utcHours = date.getUTCHours();
      const utcMinutes = date.getUTCMinutes();
      const utcSeconds = date.getUTCSeconds();
      
      if (utcHours === 0 && utcMinutes === 0 && utcSeconds === 0) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        return new Date(year, month, day);
      }
      
      return date;
    }
    
    // If it's a YYYY-MM-DD string, parse it as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      // Create date in local timezone (month is 0-indexed)
      return new Date(year, month - 1, day);
    }
    
    // Try parsing as ISO string but treat as local
    if (dateValue.includes('T')) {
      const date = new Date(dateValue);
      // If it's a valid date, adjust for timezone offset
      if (!isNaN(date.getTime())) {
        const offset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
        return new Date(date.getTime() + offset);
      }
    }
    
    // Fallback to regular Date parsing
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Handle arrays (take first element)
  if (Array.isArray(dateValue) && dateValue.length > 0) {
    return parseDateAsLocal(dateValue[0]);
  }
  
  return null;
};

/**
 * Format date as YYYY-MM-DD string in local timezone
 * @param {Date} date - The date to format
 * @returns {string|null} - Formatted date string or null if invalid
 */
export const formatDateAsLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Normalize date value for consistent handling
 * @param {any} dateValue - The date value to normalize
 * @returns {Date|null} - Normalized date or null if invalid
 */
export const normalizeDate = (dateValue) => {
  const parsed = parseDateAsLocal(dateValue);
  return parsed && !isNaN(parsed.getTime()) ? parsed : null;
}; 