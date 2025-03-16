import { UserSettings } from '../models';

/**
 * Format a date as a string in various formats
 */
export const formatDate = (
  date: Date | number,
  format: 'short' | 'medium' | 'long' | 'numeric' = 'medium'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'numeric':
      return dateObj.toLocaleDateString(undefined, { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit' 
      });
    case 'long':
      return dateObj.toLocaleDateString(undefined, { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'medium':
    default:
      return dateObj.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
  }
};

/**
 * Get the start of the day for a given date
 */
export const getStartOfDay = (date: Date | number): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get the end of the day for a given date
 */
export const getEndOfDay = (date: Date | number): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Get the start of the month for a given date
 */
export const getStartOfMonth = (date: Date | number, settings?: UserSettings): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const firstDayOfMonth = settings?.firstDayOfMonth || 1; // Default to 1st day of month
  
  let startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  if (firstDayOfMonth > 1) {
    // If first day is not the 1st calendar day, adjust
    if (dateObj.getDate() < firstDayOfMonth) {
      // If current date is before the firstDayOfMonth, go to previous month's firstDayOfMonth
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, firstDayOfMonth);
    } else {
      // Otherwise use this month's firstDayOfMonth
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), firstDayOfMonth);
    }
  }
  
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

/**
 * Get the end of the month for a given date
 */
export const getEndOfMonth = (date: Date | number, settings?: UserSettings): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const firstDayOfMonth = settings?.firstDayOfMonth || 1;
  
  let endDate: Date;
  if (firstDayOfMonth > 1) {
    // If firstDayOfMonth is not 1, then end date is the day before firstDayOfMonth of next month
    if (dateObj.getDate() < firstDayOfMonth) {
      // If current date is before firstDayOfMonth, end is day before firstDayOfMonth of current month
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), firstDayOfMonth - 1);
    } else {
      // Otherwise end is day before firstDayOfMonth of next month
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, firstDayOfMonth - 1);
    }
  } else {
    // Default end of month (last day of calendar month)
    endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
  }
  
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

/**
 * Get the start of the week for a given date
 */
export const getStartOfWeek = (date: Date | number, settings?: UserSettings): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const firstDayOfWeek = settings?.firstDayOfWeek || 0; // Default to Sunday (0)
  
  const day = dateObj.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  
  const startDate = new Date(dateObj);
  startDate.setDate(dateObj.getDate() - diff);
  startDate.setHours(0, 0, 0, 0);
  
  return startDate;
};

/**
 * Get the end of the week for a given date
 */
export const getEndOfWeek = (date: Date | number, settings?: UserSettings): Date => {
  const startOfWeek = getStartOfWeek(date, settings);
  const endDate = new Date(startOfWeek);
  endDate.setDate(startOfWeek.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return endDate;
};

/**
 * Get an array of days in a month
 */
export const getDaysInMonth = (date: Date | number, settings?: UserSettings): Date[] => {
  const startDate = getStartOfMonth(date, settings);
  const endDate = getEndOfMonth(date, settings);
  
  const days: Date[] = [];
  let currentDay = new Date(startDate);
  
  while (currentDay <= endDate) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  return days;
};

/**
 * Get an array of months in a year
 */
export const getMonthsInYear = (year: number): Date[] => {
  const months: Date[] = [];
  
  for (let i = 0; i < 12; i++) {
    months.push(new Date(year, i, 1));
  }
  
  return months;
};

/**
 * Format a time as a string
 */
export const formatTime = (date: Date | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit',
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date | number, date2: Date | number): boolean => {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | number): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get relative time description (e.g., "today", "yesterday", "2 days ago")
 */
export const getRelativeTimeString = (date: Date | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  if (isSameDay(dateObj, yesterday)) {
    return 'Yesterday';
  }
  
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateObj);
}; 