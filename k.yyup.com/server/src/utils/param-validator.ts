/**
 * Parameter validation utilities for consistent data type handling
 */

/**
 * Safely parse ID parameter to integer
 * @param id - ID parameter from request
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer ID
 */
export function parseId(id: string | undefined, defaultValue: number = 0): number {
  if (!id) return defaultValue;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse page parameter for pagination
 * @param page - Page parameter from request query
 * @param defaultValue - Default page value
 * @returns Parsed page number
 */
export function parsePage(page: string | undefined, defaultValue: number = 1): number {
  if (!page) return defaultValue;
  const parsed = parseInt(page, 10);
  return isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
}

/**
 * Parse page size parameter for pagination
 * @param pageSize - Page size parameter from request query
 * @param defaultValue - Default page size value
 * @param maxSize - Maximum allowed page size
 * @returns Parsed page size
 */
export function parsePageSize(pageSize: string | undefined, defaultValue: number = 10, maxSize: number = 100): number {
  if (!pageSize) return defaultValue;
  const parsed = parseInt(pageSize, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, maxSize);
}

/**
 * Parse date parameter to Date object
 * @param dateStr - Date string from request
 * @param defaultValue - Default date value
 * @returns Parsed Date object
 */
export function parseDate(dateStr: string | undefined, defaultValue?: Date): Date | undefined {
  if (!dateStr) return defaultValue;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? defaultValue : parsed;
}

/**
 * Standardize date to ISO string format
 * @param date - Date object or string
 * @returns ISO string or null
 */
export function standardizeDate(date: Date | string | undefined): string | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
}

/**
 * Parse boolean parameter
 * @param value - Boolean parameter from request
 * @param defaultValue - Default boolean value
 * @returns Parsed boolean
 */
export function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
}