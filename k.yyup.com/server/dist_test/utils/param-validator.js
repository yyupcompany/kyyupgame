"use strict";
/**
 * Parameter validation utilities for consistent data type handling
 */
exports.__esModule = true;
exports.parseBoolean = exports.standardizeDate = exports.parseDate = exports.parsePageSize = exports.parsePage = exports.parseId = void 0;
/**
 * Safely parse ID parameter to integer
 * @param id - ID parameter from request
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer ID
 */
function parseId(id, defaultValue) {
    if (defaultValue === void 0) { defaultValue = 0; }
    if (!id)
        return defaultValue;
    var parsed = parseInt(id, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
exports.parseId = parseId;
/**
 * Parse page parameter for pagination
 * @param page - Page parameter from request query
 * @param defaultValue - Default page value
 * @returns Parsed page number
 */
function parsePage(page, defaultValue) {
    if (defaultValue === void 0) { defaultValue = 1; }
    if (!page)
        return defaultValue;
    var parsed = parseInt(page, 10);
    return isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
}
exports.parsePage = parsePage;
/**
 * Parse page size parameter for pagination
 * @param pageSize - Page size parameter from request query
 * @param defaultValue - Default page size value
 * @param maxSize - Maximum allowed page size
 * @returns Parsed page size
 */
function parsePageSize(pageSize, defaultValue, maxSize) {
    if (defaultValue === void 0) { defaultValue = 10; }
    if (maxSize === void 0) { maxSize = 100; }
    if (!pageSize)
        return defaultValue;
    var parsed = parseInt(pageSize, 10);
    if (isNaN(parsed) || parsed < 1)
        return defaultValue;
    return Math.min(parsed, maxSize);
}
exports.parsePageSize = parsePageSize;
/**
 * Parse date parameter to Date object
 * @param dateStr - Date string from request
 * @param defaultValue - Default date value
 * @returns Parsed Date object
 */
function parseDate(dateStr, defaultValue) {
    if (!dateStr)
        return defaultValue;
    var parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? defaultValue : parsed;
}
exports.parseDate = parseDate;
/**
 * Standardize date to ISO string format
 * @param date - Date object or string
 * @returns ISO string or null
 */
function standardizeDate(date) {
    if (!date)
        return null;
    var dateObj = typeof date === 'string' ? new Date(date) : date;
    return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
}
exports.standardizeDate = standardizeDate;
/**
 * Parse boolean parameter
 * @param value - Boolean parameter from request
 * @param defaultValue - Default boolean value
 * @returns Parsed boolean
 */
function parseBoolean(value, defaultValue) {
    if (defaultValue === void 0) { defaultValue = false; }
    if (!value)
        return defaultValue;
    var lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
}
exports.parseBoolean = parseBoolean;
