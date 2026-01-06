import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { formatDate, parseDate, getRelativeTime, addDays, addMonths, addYears, isWeekend, isToday, isYesterday, isTomorrow, getWeekNumber, getQuarter, getDaysInMonth, isValidDate, getDateRange, getAge, getWeekdayName, getMonthName } from '@/utils/date-utils'

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-15T12:00:00.000Z')
const originalDateNow = Date.now

// 控制台错误检测变量
let consoleSpy: any

describe('Date Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    Date.now = vi.fn(() => mockDate.getTime())
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    Date.now = originalDateNow
    vi.useRealTimers()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = formatDate(date)
      expect(result).toBe('2024-01-15')
    })

    it('should format date with custom format', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = formatDate(date, 'MM/DD/YYYY')
      expect(result).toBe('01/15/2024')
    })

    it('should format date with time', () => {
      const date = new Date('2024-01-15T14:30:45.000Z')
      const result = formatDate(date, 'YYYY-MM-DD HH:mm:ss')
      expect(result).toBe('2024-01-15 14:30:45')
    })

    it('should handle invalid date gracefully', () => {
      const result = formatDate(new Date('invalid'))
      expect(result).toBe('Invalid Date')
    })

    it('should handle null/undefined input', () => {
      expect(formatDate(null as any)).toBe('Invalid Date')
      expect(formatDate(undefined as any)).toBe('Invalid Date')
    })

    it('should format with locale-specific patterns', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = formatDate(date, 'dddd, MMMM Do YYYY')
      expect(['Monday, January 15th 2024', 'Monday, January 15th 2024']).toContain(result)
    })
  })

  describe('parseDate', () => {
    it('should parse ISO string', () => {
      const result = parseDate('2024-01-15T12:00:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should parse date string with format', () => {
      const result = parseDate('01/15/2024', 'MM/DD/YYYY')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should handle invalid date string', () => {
      const result = parseDate('invalid date')
      expect(result).toBeInstanceOf(Date)
      expect(isNaN(result.getTime())).toBe(true)
    })

    it('should handle null/undefined input', () => {
      expect(parseDate(null as any)).toBeInstanceOf(Date)
      expect(parseDate(undefined as any)).toBeInstanceOf(Date)
    })
  })

  describe('getRelativeTime', () => {
    it('should return "just now" for current time', () => {
      const date = new Date()
      const result = getRelativeTime(date)
      expect(result).toBe('just now')
    })

    it('should return "X seconds ago" for past seconds', () => {
      const date = new Date(Date.now() - 30 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('30 seconds ago')
    })

    it('should return "X minutes ago" for past minutes', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('5 minutes ago')
    })

    it('should return "X hours ago" for past hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('3 hours ago')
    })

    it('should return "X days ago" for past days', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('2 days ago')
    })

    it('should return "in X seconds" for future seconds', () => {
      const date = new Date(Date.now() + 30 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('in 30 seconds')
    })

    it('should return "in X minutes" for future minutes', () => {
      const date = new Date(Date.now() + 5 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toBe('in 5 minutes')
    })

    it('should return formatted date for distant past', () => {
      const date = new Date('2020-01-01T12:00:00.000Z')
      const result = getRelativeTime(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should return formatted date for distant future', () => {
      const date = new Date('2025-01-01T12:00:00.000Z')
      const result = getRelativeTime(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, 5)
      expect(result.getDate()).toBe(20)
    })

    it('should add negative days (subtract)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, -3)
      expect(result.getDate()).toBe(12)
    })

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-31T12:00:00.000Z')
      const result = addDays(date, 1)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(1)
    })

    it('should handle year boundaries', () => {
      const date = new Date('2023-12-31T12:00:00.000Z')
      const result = addDays(date, 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })

    it('should return new date instance (not mutate original)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, 5)
      expect(result).not.toBe(date)
      expect(date.getDate()).toBe(15)
    })
  })

  describe('addMonths', () => {
    it('should add positive months', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addMonths(date, 2)
      expect(result.getMonth()).toBe(2)
    })

    it('should add negative months (subtract)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addMonths(date, -2)
      expect(result.getMonth()).toBe(10) // November 2023
      expect(result.getFullYear()).toBe(2023)
    })

    it('should handle year boundaries', () => {
      const date = new Date('2023-12-15T12:00:00.000Z')
      const result = addMonths(date, 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
    })

    it('should handle month end dates', () => {
      const date = new Date('2024-01-31T12:00:00.000Z')
      const result = addMonths(date, 1)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(29) // February 2024 (leap year)
    })

    it('should return new date instance (not mutate original)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addMonths(date, 2)
      expect(result).not.toBe(date)
      expect(date.getMonth()).toBe(0)
    })
  })

  describe('addYears', () => {
    it('should add positive years', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addYears(date, 3)
      expect(result.getFullYear()).toBe(2027)
    })

    it('should add negative years (subtract)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addYears(date, -2)
      expect(result.getFullYear()).toBe(2022)
    })

    it('should handle leap years', () => {
      const date = new Date('2024-02-29T12:00:00.000Z')
      const result = addYears(date, 1)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28) // February 2025 (not leap year)
    })

    it('should return new date instance (not mutate original)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addYears(date, 3)
      expect(result).not.toBe(date)
      expect(date.getFullYear()).toBe(2024)
    })
  })

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const date = new Date('2024-01-13T12:00:00.000Z') // Saturday
      expect(isWeekend(date)).toBe(true)
    })

    it('should return true for Sunday', () => {
      const date = new Date('2024-01-14T12:00:00.000Z') // Sunday
      expect(isWeekend(date)).toBe(true)
    })

    it('should return false for weekdays', () => {
      const monday = new Date('2024-01-15T12:00:00.000Z')
      const tuesday = new Date('2024-01-16T12:00:00.000Z')
      const wednesday = new Date('2024-01-17T12:00:00.000Z')
      const thursday = new Date('2024-01-18T12:00:00.000Z')
      const friday = new Date('2024-01-19T12:00:00.000Z')

      expect(isWeekend(monday)).toBe(false)
      expect(isWeekend(tuesday)).toBe(false)
      expect(isWeekend(wednesday)).toBe(false)
      expect(isWeekend(thursday)).toBe(false)
      expect(isWeekend(friday)).toBe(false)
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(isWeekend(date)).toBe(false)
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      const date = new Date(mockDate)
      expect(isToday(date)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const date = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isToday(date)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const date = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      expect(isToday(date)).toBe(false)
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(isToday(date)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const date = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isYesterday(date)).toBe(true)
    })

    it('should return false for today', () => {
      const date = new Date(mockDate)
      expect(isYesterday(date)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const date = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      expect(isYesterday(date)).toBe(false)
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(isYesterday(date)).toBe(false)
    })
  })

  describe('isTomorrow', () => {
    it('should return true for tomorrow', () => {
      const date = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      expect(isTomorrow(date)).toBe(true)
    })

    it('should return false for today', () => {
      const date = new Date(mockDate)
      expect(isTomorrow(date)).toBe(false)
    })

    it('should return false for yesterday', () => {
      const date = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isTomorrow(date)).toBe(false)
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(isTomorrow(date)).toBe(false)
    })
  })

  describe('getWeekNumber', () => {
    it('should return correct week number for start of year', () => {
      const date = new Date('2024-01-01T12:00:00.000Z')
      expect(getWeekNumber(date)).toBe(1)
    })

    it('should return correct week number for mid-year', () => {
      const date = new Date('2024-07-15T12:00:00.000Z')
      expect(getWeekNumber(date)).toBe(29)
    })

    it('should return correct week number for end of year', () => {
      const date = new Date('2024-12-31T12:00:00.000Z')
      expect(getWeekNumber(date)).toBe(1) // Week 1 of next year
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(getWeekNumber(date)).toBe(0)
    })
  })

  describe('getQuarter', () => {
    it('should return 1 for January-March', () => {
      expect(getQuarter(new Date('2024-01-15T12:00:00.000Z'))).toBe(1)
      expect(getQuarter(new Date('2024-02-15T12:00:00.000Z'))).toBe(1)
      expect(getQuarter(new Date('2024-03-15T12:00:00.000Z'))).toBe(1)
    })

    it('should return 2 for April-June', () => {
      expect(getQuarter(new Date('2024-04-15T12:00:00.000Z'))).toBe(2)
      expect(getQuarter(new Date('2024-05-15T12:00:00.000Z'))).toBe(2)
      expect(getQuarter(new Date('2024-06-15T12:00:00.000Z'))).toBe(2)
    })

    it('should return 3 for July-September', () => {
      expect(getQuarter(new Date('2024-07-15T12:00:00.000Z'))).toBe(3)
      expect(getQuarter(new Date('2024-08-15T12:00:00.000Z'))).toBe(3)
      expect(getQuarter(new Date('2024-09-15T12:00:00.000Z'))).toBe(3)
    })

    it('should return 4 for October-December', () => {
      expect(getQuarter(new Date('2024-10-15T12:00:00.000Z'))).toBe(4)
      expect(getQuarter(new Date('2024-11-15T12:00:00.000Z'))).toBe(4)
      expect(getQuarter(new Date('2024-12-15T12:00:00.000Z'))).toBe(4)
    })

    it('should handle invalid date', () => {
      const date = new Date('invalid')
      expect(getQuarter(date)).toBe(0)
    })
  })

  describe('getDaysInMonth', () => {
    it('should return 31 for months with 31 days', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31) // January
      expect(getDaysInMonth(2024, 2)).toBe(31) // March
      expect(getDaysInMonth(2024, 6)).toBe(31) // July
      expect(getDaysInMonth(2024, 11)).toBe(31) // December
    })

    it('should return 30 for months with 30 days', () => {
      expect(getDaysInMonth(2024, 3)).toBe(30) // April
      expect(getDaysInMonth(2024, 5)).toBe(30) // June
      expect(getDaysInMonth(2024, 8)).toBe(30) // September
      expect(getDaysInMonth(2024, 10)).toBe(30) // November
    })

    it('should return 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29) // February 2024 (leap year)
    })

    it('should return 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28) // February 2023 (not leap year)
    })

    it('should handle invalid month', () => {
      expect(getDaysInMonth(2024, -1)).toBe(0)
      expect(getDaysInMonth(2024, 12)).toBe(0)
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(isValidDate(new Date('2024-01-15T12:00:00.000Z'))).toBe(true)
      expect(isValidDate(new Date())).toBe(true)
    })

    it('should return false for invalid date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate(new Date('2024-02-30T12:00:00.000Z'))).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(isValidDate(null as any)).toBe(false)
      expect(isValidDate(undefined as any)).toBe(false)
    })

    it('should return false for non-date objects', () => {
      expect(isValidDate('2024-01-15' as any)).toBe(false)
      expect(isValidDate(12345 as any)).toBe(false)
      expect(isValidDate({} as any)).toBe(false)
    })
  })

  describe('getDateRange', () => {
    it('should return correct date range for last 7 days', () => {
      const range = getDateRange('last7days')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
      expect(range.end.getTime() - range.start.getTime()).toBe(6 * 24 * 60 * 60 * 1000)
    })

    it('should return correct date range for last 30 days', () => {
      const range = getDateRange('last30days')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
      expect(range.end.getTime() - range.start.getTime()).toBe(29 * 24 * 60 * 60 * 1000)
    })

    it('should return correct date range for this month', () => {
      const range = getDateRange('thisMonth')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
      expect(range.start.getDate()).toBe(1)
    })

    it('should return correct date range for last month', () => {
      const range = getDateRange('lastMonth')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
      expect(range.start.getDate()).toBe(1)
    })

    it('should return correct date range for this year', () => {
      const range = getDateRange('thisYear')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
      expect(range.start.getMonth()).toBe(0)
      expect(range.start.getDate()).toBe(1)
    })

    it('should return correct date range for custom range', () => {
      const start = new Date('2024-01-01T12:00:00.000Z')
      const end = new Date('2024-01-31T12:00:00.000Z')
      const range = getDateRange('custom', start, end)
      expect(range.start).toEqual(start)
      expect(range.end).toEqual(end)
    })

    it('should handle invalid range type', () => {
      const range = getDateRange('invalid' as any)
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
    })
  })

  describe('getAge', () => {
    it('should return correct age for birth date', () => {
      const birthDate = new Date('1990-01-15T12:00:00.000Z')
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(34)
    })

    it('should return correct age when birthday has not occurred yet this year', () => {
      const birthDate = new Date('1990-02-15T12:00:00.000Z')
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(33)
    })

    it('should return correct age when birthday has occurred this year', () => {
      const birthDate = new Date('1990-01-10T12:00:00.000Z')
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(34)
    })

    it('should handle leap year birthday', () => {
      const birthDate = new Date('2000-02-29T12:00:00.000Z')
      const currentDate = new Date('2024-02-29T12:00:00.000Z')
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(24)
    })

    it('should handle invalid dates', () => {
      const birthDate = new Date('invalid')
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(0)
    })

    it('should use current date when no current date provided', () => {
      const birthDate = new Date('1990-01-15T12:00:00.000Z')
      const age = getAge(birthDate)
      expect(age).toBeGreaterThan(30)
    })
  })

  describe('getWeekdayName', () => {
    it('should return correct weekday names', () => {
      expect(getWeekdayName(0)).toBe('Sunday')
      expect(getWeekdayName(1)).toBe('Monday')
      expect(getWeekdayName(2)).toBe('Tuesday')
      expect(getWeekdayName(3)).toBe('Wednesday')
      expect(getWeekdayName(4)).toBe('Thursday')
      expect(getWeekdayName(5)).toBe('Friday')
      expect(getWeekdayName(6)).toBe('Saturday')
    })

    it('should return empty string for invalid day', () => {
      expect(getWeekdayName(-1)).toBe('')
      expect(getWeekdayName(7)).toBe('')
      expect(getWeekdayName(10)).toBe('')
    })

    it('should handle short format', () => {
      expect(getWeekdayName(0, 'short')).toBe('Sun')
      expect(getWeekdayName(1, 'short')).toBe('Mon')
      expect(getWeekdayName(2, 'short')).toBe('Tue')
      expect(getWeekdayName(3, 'short')).toBe('Wed')
      expect(getWeekdayName(4, 'short')).toBe('Thu')
      expect(getWeekdayName(5, 'short')).toBe('Fri')
      expect(getWeekdayName(6, 'short')).toBe('Sat')
    })
  })

  describe('getMonthName', () => {
    it('should return correct month names', () => {
      expect(getMonthName(0)).toBe('January')
      expect(getMonthName(1)).toBe('February')
      expect(getMonthName(2)).toBe('March')
      expect(getMonthName(3)).toBe('April')
      expect(getMonthName(4)).toBe('May')
      expect(getMonthName(5)).toBe('June')
      expect(getMonthName(6)).toBe('July')
      expect(getMonthName(7)).toBe('August')
      expect(getMonthName(8)).toBe('September')
      expect(getMonthName(9)).toBe('October')
      expect(getMonthName(10)).toBe('November')
      expect(getMonthName(11)).toBe('December')
    })

    it('should return empty string for invalid month', () => {
      expect(getMonthName(-1)).toBe('')
      expect(getMonthName(12)).toBe('')
      expect(getMonthName(15)).toBe('')
    })

    it('should handle short format', () => {
      expect(getMonthName(0, 'short')).toBe('Jan')
      expect(getMonthName(1, 'short')).toBe('Feb')
      expect(getMonthName(2, 'short')).toBe('Mar')
      expect(getMonthName(3, 'short')).toBe('Apr')
      expect(getMonthName(4, 'short')).toBe('May')
      expect(getMonthName(5, 'short')).toBe('Jun')
      expect(getMonthName(6, 'short')).toBe('Jul')
      expect(getMonthName(7, 'short')).toBe('Aug')
      expect(getMonthName(8, 'short')).toBe('Sep')
      expect(getMonthName(9, 'short')).toBe('Oct')
      expect(getMonthName(10, 'short')).toBe('Nov')
      expect(getMonthName(11, 'short')).toBe('Dec')
    })
  })

  describe('Integration Tests', () => {
    it('should work together for date calculations', () => {
      const startDate = new Date('2024-01-01T12:00:00.000Z')
      const endDate = addDays(addMonths(startDate, 1), 15)
      
      expect(formatDate(startDate, 'YYYY-MM-DD')).toBe('2024-01-01')
      expect(formatDate(endDate, 'YYYY-MM-DD')).toBe('2024-02-16')
      expect(getRelativeTime(startDate)).toMatch(/\d{4}-\d{2}-\d{2}/)
      
      const range = getDateRange('custom', startDate, endDate)
      expect(range.start).toEqual(startDate)
      expect(range.end).toEqual(endDate)
    })

    it('should handle complex date scenarios', () => {
      const birthDate = new Date('1990-02-29T12:00:00.000Z')
      const currentDate = new Date('2024-02-29T12:00:00.000Z')
      
      const age = getAge(birthDate, currentDate)
      expect(age).toBe(34)
      
      const isWeekendDay = isWeekend(currentDate)
      expect(typeof isWeekendDay).toBe('boolean')
      
      const quarter = getQuarter(currentDate)
      expect(quarter).toBe(1)
      
      const weekNumber = getWeekNumber(currentDate)
      expect(weekNumber).toBeGreaterThan(0)
    })

    it('should handle timezone differences correctly', () => {
      const date1 = new Date('2024-01-15T00:00:00.000Z')
      const date2 = new Date('2024-01-15T23:59:59.999Z')
      
      expect(isToday(date1)).toBe(true)
      expect(isToday(date2)).toBe(true)
      expect(formatDate(date1, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date2, 'YYYY-MM-DD')).toBe('2024-01-15')
    })
  })
})