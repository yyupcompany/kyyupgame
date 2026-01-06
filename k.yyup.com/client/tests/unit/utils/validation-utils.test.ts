import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  isRequired, 
  isEmail, 
  isPhone, 
  isUrl, 
  isNumber, 
  isInteger, 
  isFloat, 
  isString, 
  isArray, 
  isObject, 
  isFunction, 
  isBoolean, 
  isDate, 
  isRegExp, 
  isNull, 
  isUndefined, 
  isEmpty, 
  isNotEmpty, 
  isLength, 
  isMinLength, 
  isMaxLength, 
  isMin, 
  isMax, 
  isRange, 
  isPattern, 
  isAlpha, 
  isAlphanumeric, 
  isNumeric, 
  isHexadecimal, 
  isBase64, 
  isJSON, 
  isUUID, 
  isCreditCard, 
  isISBN, 
  isPostalCode, 
  isTaxID, 
  isPassword, 
  isStrongPassword, 
  isUsername, 
  isDomain, 
  isIP, 
  isIPv4, 
  isIPv6, 
  isMACAddress, 
  isMimeType, 
  isLatitude, 
  isLongitude, 
  isColor, 
  isHexColor, 
  isRGBColor, 
  isHSLColor, 
  validate, 
  validateSchema 
} from '@/utils/validation-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Validation Utils', () => {
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
  describe('isRequired', () => {
    it('should return true for non-empty values', () => {
      expect(isRequired('hello')).toBe(true)
      expect(isRequired(0)).toBe(true)
      expect(isRequired(false)).toBe(true)
      expect(isRequired([])).toBe(true)
      expect(isRequired({})).toBe(true)
    })

    it('should return false for empty values', () => {
      expect(isRequired('')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
    })

    it('should handle whitespace-only strings', () => {
      expect(isRequired('   ')).toBe(false)
      expect(isRequired('\t\n\r')).toBe(false)
    })
  })

  describe('isEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('user.name@domain.co.uk')).toBe(true)
      expect(isEmail('user+tag@example.org')).toBe(true)
      expect(isEmail('user_name@example.com')).toBe(true)
      expect(isEmail('123user@example.com')).toBe(true)
    })

    it('should return false for invalid email addresses', () => {
      expect(isEmail('invalid-email')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
      expect(isEmail('user@')).toBe(false)
      expect(isEmail('user@.com')).toBe(false)
      expect(isEmail('user..name@example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isEmail('')).toBe(false)
      expect(isEmail(null)).toBe(false)
      expect(isEmail(undefined)).toBe(false)
      expect(isEmail(123 as any)).toBe(false)
    })
  })

  describe('isPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(isPhone('1234567890')).toBe(true)
      expect(isPhone('(123) 456-7890')).toBe(true)
      expect(isPhone('123-456-7890')).toBe(true)
      expect(isPhone('+1 123 456 7890')).toBe(true)
    })

    it('should return false for invalid phone numbers', () => {
      expect(isPhone('123')).toBe(false)
      expect(isPhone('abc')).toBe(false)
      expect(isPhone('12345678901234567890')).toBe(false)
    })

    it('should handle different country formats', () => {
      expect(isPhone('441234567890', 'GB')).toBe(true)
      expect(isPhone('33123456789', 'FR')).toBe(true)
    })

    it('should handle edge cases', () => {
      expect(isPhone('')).toBe(false)
      expect(isPhone(null)).toBe(false)
      expect(isPhone(undefined)).toBe(false)
      expect(isPhone(123 as any)).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isUrl('https://example.com')).toBe(true)
      expect(isUrl('http://example.com')).toBe(true)
      expect(isUrl('https://www.example.com')).toBe(true)
      expect(isUrl('https://example.com/path')).toBe(true)
      expect(isUrl('https://example.com?query=value')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(isUrl('example.com')).toBe(false)
      expect(isUrl('www.example.com')).toBe(false)
      expect(isUrl('ftp://example.com')).toBe(false)
      expect(isUrl('javascript:alert(1)')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isUrl('')).toBe(false)
      expect(isUrl(null)).toBe(false)
      expect(isUrl(undefined)).toBe(false)
      expect(isUrl(123 as any)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-123)).toBe(true)
      expect(isNumber(123.45)).toBe(true)
      expect(isNumber(Infinity)).toBe(true)
      expect(isNumber(-Infinity)).toBe(true)
    })

    it('should return false for non-numbers', () => {
      expect(isNumber('123')).toBe(false)
      expect(isNumber('abc')).toBe(false)
      expect(isNumber(true)).toBe(false)
      expect(isNumber(false)).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber({})).toBe(false)
      expect(isNumber([])).toBe(false)
    })

    it('should handle NaN', () => {
      expect(isNumber(NaN)).toBe(false)
    })
  })

  describe('isInteger', () => {
    it('should return true for integers', () => {
      expect(isInteger(123)).toBe(true)
      expect(isInteger(0)).toBe(true)
      expect(isInteger(-123)).toBe(true)
      expect(isInteger(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(isInteger(Number.MIN_SAFE_INTEGER)).toBe(true)
    })

    it('should return false for non-integers', () => {
      expect(isInteger(123.45)).toBe(false)
      expect(isInteger(0.1)).toBe(false)
      expect(isInteger(-123.45)).toBe(false)
      expect(isInteger(Infinity)).toBe(false)
      expect(isInteger(-Infinity)).toBe(false)
    })

    it('should handle non-numbers', () => {
      expect(isInteger('123')).toBe(false)
      expect(isInteger('abc')).toBe(false)
      expect(isInteger(null)).toBe(false)
      expect(isInteger(undefined)).toBe(false)
    })
  })

  describe('isFloat', () => {
    it('should return true for floating point numbers', () => {
      expect(isFloat(123.45)).toBe(true)
      expect(isFloat(0.1)).toBe(true)
      expect(isFloat(-123.45)).toBe(true)
      expect(isFloat(123.0)).toBe(true)
    })

    it('should return false for non-floating point numbers', () => {
      expect(isFloat(123)).toBe(false)
      expect(isFloat(0)).toBe(false)
      expect(isFloat(-123)).toBe(false)
      expect(isFloat(Infinity)).toBe(false)
      expect(isFloat(-Infinity)).toBe(false)
    })

    it('should handle non-numbers', () => {
      expect(isFloat('123.45')).toBe(false)
      expect(isFloat('abc')).toBe(false)
      expect(isFloat(null)).toBe(false)
      expect(isFloat(undefined)).toBe(false)
    })
  })

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
      expect(isString('123')).toBe(true)
      expect(isString('true')).toBe(true)
    })

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(true)).toBe(false)
      expect(isString(false)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
      expect(isString([])).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray(['a', 'b', 'c'])).toBe(true)
      expect(isArray([{}])).toBe(true)
    })

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('')).toBe(false)
      expect(isArray(123)).toBe(false)
      expect(isArray(true)).toBe(false)
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject(new Object())).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isObject([])).toBe(false)
      expect(isObject('')).toBe(false)
      expect(isObject(123)).toBe(false)
      expect(isObject(true)).toBe(false)
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function() {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
      expect(isFunction(function*() {})).toBe(true)
      expect(isFunction(class {})).toBe(true)
    })

    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction('')).toBe(false)
      expect(isFunction(123)).toBe(false)
      expect(isFunction(true)).toBe(false)
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })

    it('should return false for non-booleans', () => {
      expect(isBoolean('true')).toBe(false)
      expect(isBoolean('false')).toBe(false)
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean(null)).toBe(false)
      expect(isBoolean(undefined)).toBe(false)
      expect(isBoolean({})).toBe(false)
    })
  })

  describe('isDate', () => {
    it('should return true for valid dates', () => {
      expect(isDate(new Date())).toBe(true)
      expect(isDate(new Date('2024-01-15'))).toBe(true)
      expect(isDate(new Date(0))).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isDate(new Date('invalid'))).toBe(false)
    })

    it('should return false for non-dates', () => {
      expect(isDate('2024-01-15')).toBe(false)
      expect(isDate(1705296000000)).toBe(false)
      expect(isDate(null)).toBe(false)
      expect(isDate(undefined)).toBe(false)
    })
  })

  describe('isRegExp', () => {
    it('should return true for regular expressions', () => {
      expect(isRegExp(/abc/)).toBe(true)
      expect(isRegExp(new RegExp('abc'))).toBe(true)
      expect(isRegExp(/abc/g)).toBe(true)
    })

    it('should return false for non-regular expressions', () => {
      expect(isRegExp('/abc/')).toBe(false)
      expect(isRegExp('')).toBe(false)
      expect(isRegExp(123)).toBe(false)
      expect(isRegExp(null)).toBe(false)
      expect(isRegExp(undefined)).toBe(false)
    })
  })

  describe('isNull', () => {
    it('should return true for null', () => {
      expect(isNull(null)).toBe(true)
    })

    it('should return false for non-null values', () => {
      expect(isNull(undefined)).toBe(false)
      expect(isNull('')).toBe(false)
      expect(isNull(0)).toBe(false)
      expect(isNull(false)).toBe(false)
      expect(isNull({})).toBe(false)
      expect(isNull([])).toBe(false)
    })
  })

  describe('isUndefined', () => {
    it('should return true for undefined', () => {
      expect(isUndefined(undefined)).toBe(true)
    })

    it('should return false for non-undefined values', () => {
      expect(isUndefined(null)).toBe(false)
      expect(isUndefined('')).toBe(false)
      expect(isUndefined(0)).toBe(false)
      expect(isUndefined(false)).toBe(false)
      expect(isUndefined({})).toBe(false)
      expect(isUndefined([])).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })

    it('should handle whitespace strings', () => {
      expect(isEmpty('   ')).toBe(false)
      expect(isEmpty('\t\n\r')).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    it('should return true for non-empty values', () => {
      expect(isNotEmpty('hello')).toBe(true)
      expect(isNotEmpty([1, 2, 3])).toBe(true)
      expect(isNotEmpty({ a: 1 })).toBe(true)
      expect(isNotEmpty(0)).toBe(true)
      expect(isNotEmpty(false)).toBe(true)
    })

    it('should return false for empty values', () => {
      expect(isNotEmpty('')).toBe(false)
      expect(isNotEmpty([])).toBe(false)
      expect(isNotEmpty({})).toBe(false)
      expect(isNotEmpty(null)).toBe(false)
      expect(isNotEmpty(undefined)).toBe(false)
    })
  })

  describe('isLength', () => {
    it('should return true for strings with exact length', () => {
      expect(isLength('hello', 5)).toBe(true)
      expect(isLength('', 0)).toBe(true)
      expect(isLength('12345', 5)).toBe(true)
    })

    it('should return true for arrays with exact length', () => {
      expect(isLength([1, 2, 3], 3)).toBe(true)
      expect(isLength([], 0)).toBe(true)
    })

    it('should return false for wrong lengths', () => {
      expect(isLength('hello', 3)).toBe(false)
      expect(isLength('hello', 10)).toBe(false)
      expect(isLength([1, 2, 3], 2)).toBe(false)
      expect(isLength([1, 2, 3], 4)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isLength('', 0)).toBe(true)
      expect(isLength([], 0)).toBe(true)
      expect(isLength(null as any, 0)).toBe(false)
      expect(isLength(undefined as any, 0)).toBe(false)
    })
  })

  describe('isMinLength', () => {
    it('should return true for strings with minimum length', () => {
      expect(isMinLength('hello', 3)).toBe(true)
      expect(isMinLength('hello', 5)).toBe(true)
      expect(isMinLength('', 0)).toBe(true)
    })

    it('should return false for strings below minimum length', () => {
      expect(isMinLength('hello', 10)).toBe(false)
      expect(isMinLength('hi', 3)).toBe(false)
    })

    it('should return true for arrays with minimum length', () => {
      expect(isMinLength([1, 2, 3], 2)).toBe(true)
      expect(isMinLength([1, 2, 3], 3)).toBe(true)
    })

    it('should return false for arrays below minimum length', () => {
      expect(isMinLength([1, 2, 3], 4)).toBe(false)
      expect(isMinLength([], 1)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isMinLength('', 0)).toBe(true)
      expect(isMinLength([], 0)).toBe(true)
      expect(isMinLength(null as any, 0)).toBe(false)
      expect(isMinLength(undefined as any, 0)).toBe(false)
    })
  })

  describe('isMaxLength', () => {
    it('should return true for strings with maximum length', () => {
      expect(isMaxLength('hello', 10)).toBe(true)
      expect(isMaxLength('hello', 5)).toBe(true)
      expect(isMaxLength('', 0)).toBe(true)
    })

    it('should return false for strings above maximum length', () => {
      expect(isMaxLength('hello', 3)).toBe(false)
      expect(isMaxLength('hello world', 5)).toBe(false)
    })

    it('should return true for arrays with maximum length', () => {
      expect(isMaxLength([1, 2, 3], 5)).toBe(true)
      expect(isMaxLength([1, 2, 3], 3)).toBe(true)
    })

    it('should return false for arrays above maximum length', () => {
      expect(isMaxLength([1, 2, 3], 2)).toBe(false)
      expect(isMaxLength([1, 2, 3, 4], 3)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isMaxLength('', 0)).toBe(true)
      expect(isMaxLength([], 0)).toBe(true)
      expect(isMaxLength(null as any, 0)).toBe(false)
      expect(isMaxLength(undefined as any, 0)).toBe(false)
    })
  })

  describe('isMin', () => {
    it('should return true for numbers above minimum', () => {
      expect(isMin(10, 5)).toBe(true)
      expect(isMin(5, 5)).toBe(true)
      expect(isMin(0, -5)).toBe(true)
    })

    it('should return false for numbers below minimum', () => {
      expect(isMin(3, 5)).toBe(false)
      expect(isMin(-10, 0)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isMin(Infinity, 0)).toBe(true)
      expect(isMin(-Infinity, 0)).toBe(false)
      expect(isMin(NaN, 0)).toBe(false)
    })
  })

  describe('isMax', () => {
    it('should return true for numbers below maximum', () => {
      expect(isMax(3, 5)).toBe(true)
      expect(isMax(5, 5)).toBe(true)
      expect(isMax(-5, 0)).toBe(true)
    })

    it('should return false for numbers above maximum', () => {
      expect(isMax(10, 5)).toBe(false)
      expect(isMax(0, -5)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isMax(-Infinity, 0)).toBe(true)
      expect(isMax(Infinity, 0)).toBe(false)
      expect(isMax(NaN, 0)).toBe(false)
    })
  })

  describe('isRange', () => {
    it('should return true for numbers within range', () => {
      expect(isRange(5, 0, 10)).toBe(true)
      expect(isRange(0, 0, 10)).toBe(true)
      expect(isRange(10, 0, 10)).toBe(true)
    })

    it('should return false for numbers outside range', () => {
      expect(isRange(-1, 0, 10)).toBe(false)
      expect(isRange(11, 0, 10)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isRange(5, 10, 0)).toBe(false) // Invalid range
      expect(isRange(NaN, 0, 10)).toBe(false)
    })
  })

  describe('isPattern', () => {
    it('should return true for strings matching pattern', () => {
      expect(isPattern('abc123', /^[a-z0-9]+$/)).toBe(true)
      expect(isPattern('test@example.com', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBe(true)
      expect(isPattern('123-456-7890', /^\d{3}-\d{3}-\d{4}$/)).toBe(true)
    })

    it('should return false for strings not matching pattern', () => {
      expect(isPattern('abc', /^\d+$/)).toBe(false)
      expect(isPattern('invalid-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isPattern('', /^$/)).toBe(true)
      expect(isPattern('', /.+/)).toBe(false)
      expect(isPattern(null as any, /.*/)).toBe(false)
      expect(isPattern(undefined as any, /.*/)).toBe(false)
    })
  })

  describe('isAlpha', () => {
    it('should return true for alphabetic strings', () => {
      expect(isAlpha('hello')).toBe(true)
      expect(isAlpha('Hello')).toBe(true)
      expect(isAlpha('HELLO')).toBe(true)
      expect(isAlpha('a')).toBe(true)
      expect(isAlpha('Z')).toBe(true)
    })

    it('should return false for non-alphabetic strings', () => {
      expect(isAlpha('hello123')).toBe(false)
      expect(isAlpha('hello world')).toBe(false)
      expect(isAlpha('hello!')).toBe(false)
      expect(isAlpha('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isAlpha('   ')).toBe(false)
      expect(isAlpha(null as any)).toBe(false)
      expect(isAlpha(undefined as any)).toBe(false)
    })
  })

  describe('isAlphanumeric', () => {
    it('should return true for alphanumeric strings', () => {
      expect(isAlphanumeric('hello123')).toBe(true)
      expect(isAlphanumeric('Hello123')).toBe(true)
      expect(isAlphanumeric('HELLO123')).toBe(true)
      expect(isAlphanumeric('123')).toBe(true)
      expect(isAlphanumeric('hello')).toBe(true)
    })

    it('should return false for non-alphanumeric strings', () => {
      expect(isAlphanumeric('hello world')).toBe(false)
      expect(isAlphanumeric('hello!')).toBe(false)
      expect(isAlphanumeric('hello@123')).toBe(false)
      expect(isAlphanumeric('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isAlphanumeric('   ')).toBe(false)
      expect(isAlphanumeric(null as any)).toBe(false)
      expect(isAlphanumeric(undefined as any)).toBe(false)
    })
  })

  describe('isNumeric', () => {
    it('should return true for numeric strings', () => {
      expect(isNumeric('123')).toBe(true)
      expect(isNumeric('123.45')).toBe(true)
      expect(isNumeric('-123')).toBe(true)
      expect(isNumeric('-123.45')).toBe(true)
      expect(isNumeric('0')).toBe(true)
    })

    it('should return false for non-numeric strings', () => {
      expect(isNumeric('hello')).toBe(false)
      expect(isNumeric('123abc')).toBe(false)
      expect(isNumeric('12.34.56')).toBe(false)
      expect(isNumeric('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isNumeric('   ')).toBe(false)
      expect(isNumeric(null as any)).toBe(false)
      expect(isNumeric(undefined as any)).toBe(false)
    })
  })

  describe('isHexadecimal', () => {
    it('should return true for hexadecimal strings', () => {
      expect(isHexadecimal('1a2b3c')).toBe(true)
      expect(isHexadecimal('1A2B3C')).toBe(true)
      expect(isHexadecimal('123456')).toBe(true)
      expect(isHexadecimal('abcdef')).toBe(true)
      expect(isHexadecimal('ABCDEF')).toBe(true)
    })

    it('should return false for non-hexadecimal strings', () => {
      expect(isHexadecimal('1g2h3i')).toBe(false)
      expect(isHexadecimal('hello')).toBe(false)
      expect(isHexadecimal('123xyz')).toBe(false)
      expect(isHexadecimal('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isHexadecimal('   ')).toBe(false)
      expect(isHexadecimal(null as any)).toBe(false)
      expect(isHexadecimal(undefined as any)).toBe(false)
    })
  })

  describe('isBase64', () => {
    it('should return true for base64 strings', () => {
      expect(isBase64('aGVsbG8gd29ybGQ=')).toBe(true)
      expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true)
      expect(isBase64('MTIzNDU2Nzg5MA==')).toBe(true)
    })

    it('should return false for non-base64 strings', () => {
      expect(isBase64('hello')).toBe(false)
      expect(isBase64('hello world')).toBe(false)
      expect(isBase64('123')).toBe(false)
      expect(isBase64('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isBase64('   ')).toBe(false)
      expect(isBase64(null as any)).toBe(false)
      expect(isBase64(undefined as any)).toBe(false)
    })
  })

  describe('isJSON', () => {
    it('should return true for valid JSON strings', () => {
      expect(isJSON('{"name": "John", "age": 30}')).toBe(true)
      expect(isJSON('["apple", "banana", "cherry"]')).toBe(true)
      expect(isJSON('123')).toBe(true)
      expect(isJSON('"hello"')).toBe(true)
      expect(isJSON('true')).toBe(true)
      expect(isJSON('null')).toBe(true)
    })

    it('should return false for invalid JSON strings', () => {
      expect(isJSON('{name: "John", age: 30}')).toBe(false)
      expect(isJSON('["apple", "banana"')).toBe(false)
      expect(isJSON('hello')).toBe(false)
      expect(isJSON('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isJSON('   ')).toBe(false)
      expect(isJSON(null as any)).toBe(false)
      expect(isJSON(undefined as any)).toBe(false)
    })
  })

  describe('isUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
      expect(isUUID('00000000-0000-0000-0000-000000000000')).toBe(true)
    })

    it('should return false for invalid UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false) // Too short
      expect(isUUID('123e4567-e89b-12d3-a456-4266141740000')).toBe(false) // Too long
      expect(isUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false) // Invalid character
      expect(isUUID('hello')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isUUID('')).toBe(false)
      expect(isUUID(null as any)).toBe(false)
      expect(isUUID(undefined as any)).toBe(false)
    })
  })

  describe('isCreditCard', () => {
    it('should return true for valid credit card numbers', () => {
      expect(isCreditCard('4532015112830366')).toBe(true) // Visa
      expect(isCreditCard('5555555555554444')).toBe(true) // Mastercard
      expect(isCreditCard('371449635398431')).toBe(true) // American Express
    })

    it('should return false for invalid credit card numbers', () => {
      expect(isCreditCard('1234567890123456')).toBe(false)
      expect(isCreditCard('4532015112830367')).toBe(false) // Invalid checksum
      expect(isCreditCard('hello')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isCreditCard('')).toBe(false)
      expect(isCreditCard(null as any)).toBe(false)
      expect(isCreditCard(undefined as any)).toBe(false)
    })
  })

  describe('isISBN', () => {
    it('should return true for valid ISBN-10', () => {
      expect(isISBN('0306406152')).toBe(true)
      expect(isISBN('0-306-40615-2')).toBe(true)
    })

    it('should return true for valid ISBN-13', () => {
      expect(isISBN('9780306406157')).toBe(true)
      expect(isISBN('978-0-306-40615-7')).toBe(true)
    })

    it('should return false for invalid ISBNs', () => {
      expect(isISBN('0306406153')).toBe(false) // Invalid checksum
      expect(isISBN('9780306406158')).toBe(false) // Invalid checksum
      expect(isISBN('hello')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isISBN('')).toBe(false)
      expect(isISBN(null as any)).toBe(false)
      expect(isISBN(undefined as any)).toBe(false)
    })
  })

  describe('isPostalCode', () => {
    it('should return true for valid US postal codes', () => {
      expect(isPostalCode('12345')).toBe(true)
      expect(isPostalCode('12345-6789')).toBe(true)
    })

    it('should return true for valid Canadian postal codes', () => {
      expect(isPostalCode('A1A 1A1', 'CA')).toBe(true)
      expect(isPostalCode('K1A 0B1', 'CA')).toBe(true)
    })

    it('should return true for valid UK postal codes', () => {
      expect(isPostalCode('SW1A 1AA', 'GB')).toBe(true)
      expect(isPostalCode('M1 1AA', 'GB')).toBe(true)
    })

    it('should return false for invalid postal codes', () => {
      expect(isPostalCode('1234')).toBe(false)
      expect(isPostalCode('123456')).toBe(false)
      expect(isPostalCode('hello')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isPostalCode('')).toBe(false)
      expect(isPostalCode(null as any)).toBe(false)
      expect(isPostalCode(undefined as any)).toBe(false)
    })
  })

  describe('isTaxID', () => {
    it('should return true for valid US SSN', () => {
      expect(isTaxID('123-45-6789', 'US')).toBe(true)
      expect(isTaxID('123456789', 'US')).toBe(true)
    })

    it('should return true for valid EU VAT numbers', () => {
      expect(isTaxID('DE123456789', 'EU')).toBe(true)
      expect(isTaxID('GB123456789', 'EU')).toBe(true)
    })

    it('should return false for invalid tax IDs', () => {
      expect(isTaxID('123-45-678', 'US')).toBe(false) // Too short
      expect(isTaxID('123-45-67890', 'US')).toBe(false) // Too long
      expect(isTaxID('hello', 'US')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isTaxID('', 'US')).toBe(false)
      expect(isTaxID(null as any, 'US')).toBe(false)
      expect(isTaxID(undefined as any, 'US')).toBe(false)
    })
  })

  describe('isPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isPassword('password123')).toBe(true)
      expect(isPassword('Password123')).toBe(true)
      expect(isPassword('P@ssw0rd')).toBe(true)
    })

    it('should return false for invalid passwords', () => {
      expect(isPassword('123')).toBe(false) // Too short
      expect(isPassword('password')).toBe(false) // No numbers
      expect(isPassword('12345678')).toBe(false) // No letters
    })

    it('should handle edge cases', () => {
      expect(isPassword('')).toBe(false)
      expect(isPassword(null as any)).toBe(false)
      expect(isPassword(undefined as any)).toBe(false)
    })
  })

  describe('isStrongPassword', () => {
    it('should return true for strong passwords', () => {
      expect(isStrongPassword('P@ssw0rd!')).toBe(true)
      expect(isStrongPassword('Str0ngP@ss')).toBe(true)
      expect(isStrongPassword('C0mpl3xP@ssw0rd')).toBe(true)
    })

    it('should return false for weak passwords', () => {
      expect(isStrongPassword('password')).toBe(false) // No uppercase, numbers, or special chars
      expect(isStrongPassword('Password')).toBe(false) // No numbers or special chars
      expect(isStrongPassword('Password123')).toBe(false) // No special chars
      expect(isStrongPassword('P@ss')).toBe(false) // Too short
    })

    it('should handle edge cases', () => {
      expect(isStrongPassword('')).toBe(false)
      expect(isStrongPassword(null as any)).toBe(false)
      expect(isStrongPassword(undefined as any)).toBe(false)
    })
  })

  describe('isUsername', () => {
    it('should return true for valid usernames', () => {
      expect(isUsername('john_doe')).toBe(true)
      expect(isUsername('john123')).toBe(true)
      expect(isUsername('john.doe')).toBe(true)
      expect(isUsername('johndoe')).toBe(true)
    })

    it('should return false for invalid usernames', () => {
      expect(isUsername('john doe')).toBe(false) // Contains space
      expect(isUsername('john@doe')).toBe(false) // Contains @
      expect(isUsername('')).toBe(false) // Empty
      expect(isUsername('ab')).toBe(false) // Too short
    })

    it('should handle edge cases', () => {
      expect(isUsername('   ')).toBe(false)
      expect(isUsername(null as any)).toBe(false)
      expect(isUsername(undefined as any)).toBe(false)
    })
  })

  describe('isDomain', () => {
    it('should return true for valid domains', () => {
      expect(isDomain('example.com')).toBe(true)
      expect(isDomain('www.example.com')).toBe(true)
      expect(isDomain('sub.domain.example.com')).toBe(true)
      expect(isDomain('example.co.uk')).toBe(true)
    })

    it('should return false for invalid domains', () => {
      expect(isDomain('example')).toBe(false) // No TLD
      expect(isDomain('example.')).toBe(false) // Ends with dot
      expect(isDomain('.example.com')).toBe(false) // Starts with dot
      expect(isDomain('example..com')).toBe(false) // Double dot
    })

    it('should handle edge cases', () => {
      expect(isDomain('')).toBe(false)
      expect(isDomain(null as any)).toBe(false)
      expect(isDomain(undefined as any)).toBe(false)
    })
  })

  describe('isIP', () => {
    it('should return true for valid IP addresses', () => {
      expect(isIP('192.168.1.1')).toBe(true)
      expect(isIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    })

    it('should return false for invalid IP addresses', () => {
      expect(isIP('192.168.1')).toBe(false)
      expect(isIP('192.168.1.1.1')).toBe(false)
      expect(isIP('2001:0db8:85a3:0000:0000:8a2e:0370')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isIP('')).toBe(false)
      expect(isIP(null as any)).toBe(false)
      expect(isIP(undefined as any)).toBe(false)
    })
  })

  describe('isIPv4', () => {
    it('should return true for valid IPv4 addresses', () => {
      expect(isIPv4('192.168.1.1')).toBe(true)
      expect(isIPv4('0.0.0.0')).toBe(true)
      expect(isIPv4('255.255.255.255')).toBe(true)
      expect(isIPv4('127.0.0.1')).toBe(true)
    })

    it('should return false for invalid IPv4 addresses', () => {
      expect(isIPv4('192.168.1')).toBe(false)
      expect(isIPv4('192.168.1.1.1')).toBe(false)
      expect(isIPv4('256.168.1.1')).toBe(false)
      expect(isIPv4('192.168.1.256')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isIPv4('')).toBe(false)
      expect(isIPv4(null as any)).toBe(false)
      expect(isIPv4(undefined as any)).toBe(false)
    })
  })

  describe('isIPv6', () => {
    it('should return true for valid IPv6 addresses', () => {
      expect(isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
      expect(isIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true)
      expect(isIPv6('::1')).toBe(true)
      expect(isIPv6('::')).toBe(true)
    })

    it('should return false for invalid IPv6 addresses', () => {
      expect(isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370')).toBe(false)
      expect(isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334:1234')).toBe(false)
      expect(isIPv6('192.168.1.1')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isIPv6('')).toBe(false)
      expect(isIPv6(null as any)).toBe(false)
      expect(isIPv6(undefined as any)).toBe(false)
    })
  })

  describe('isMACAddress', () => {
    it('should return true for valid MAC addresses', () => {
      expect(isMACAddress('00:1A:2B:3C:4D:5E')).toBe(true)
      expect(isMACAddress('00-1A-2B-3C-4D-5E')).toBe(true)
      expect(isMACAddress('001A.2B3C.4D5E')).toBe(true)
    })

    it('should return false for invalid MAC addresses', () => {
      expect(isMACAddress('00:1A:2B:3C:4D')).toBe(false) // Too short
      expect(isMACAddress('00:1A:2B:3C:4D:5E:6F')).toBe(false) // Too long
      expect(isMACAddress('GG:HH:II:JJ:KK:LL')).toBe(false) // Invalid characters
    })

    it('should handle edge cases', () => {
      expect(isMACAddress('')).toBe(false)
      expect(isMACAddress(null as any)).toBe(false)
      expect(isMACAddress(undefined as any)).toBe(false)
    })
  })

  describe('isMimeType', () => {
    it('should return true for valid MIME types', () => {
      expect(isMimeType('text/plain')).toBe(true)
      expect(isMimeType('application/json')).toBe(true)
      expect(isMimeType('image/jpeg')).toBe(true)
      expect(isMimeType('video/mp4')).toBe(true)
    })

    it('should return false for invalid MIME types', () => {
      expect(isMimeType('text')).toBe(false) // Missing subtype
      expect(isMimeType('/plain')).toBe(false) // Missing type
      expect(isMimeType('text/')).toBe(false) // Missing subtype
      expect(isMimeType('text/plain/extra')).toBe(false) // Too many parts
    })

    it('should handle edge cases', () => {
      expect(isMimeType('')).toBe(false)
      expect(isMimeType(null as any)).toBe(false)
      expect(isMimeType(undefined as any)).toBe(false)
    })
  })

  describe('isLatitude', () => {
    it('should return true for valid latitude values', () => {
      expect(isLatitude(0)).toBe(true)
      expect(isLatitude(90)).toBe(true)
      expect(isLatitude(-90)).toBe(true)
      expect(isLatitude(45.5)).toBe(true)
      expect(isLatitude(-45.5)).toBe(true)
    })

    it('should return false for invalid latitude values', () => {
      expect(isLatitude(91)).toBe(false)
      expect(isLatitude(-91)).toBe(false)
      expect(isLatitude(180)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isLatitude('45.5' as any)).toBe(false)
      expect(isLatitude(null as any)).toBe(false)
      expect(isLatitude(undefined as any)).toBe(false)
    })
  })

  describe('isLongitude', () => {
    it('should return true for valid longitude values', () => {
      expect(isLongitude(0)).toBe(true)
      expect(isLongitude(180)).toBe(true)
      expect(isLongitude(-180)).toBe(true)
      expect(isLongitude(90.5)).toBe(true)
      expect(isLongitude(-90.5)).toBe(true)
    })

    it('should return false for invalid longitude values', () => {
      expect(isLongitude(181)).toBe(false)
      expect(isLongitude(-181)).toBe(false)
      expect(isLongitude(360)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isLongitude('90.5' as any)).toBe(false)
      expect(isLongitude(null as any)).toBe(false)
      expect(isLongitude(undefined as any)).toBe(false)
    })
  })

  describe('isColor', () => {
    it('should return true for valid colors', () => {
      expect(isColor('#FF0000')).toBe(true)
      expect(isColor('rgb(255, 0, 0)')).toBe(true)
      expect(isColor('rgba(255, 0, 0, 0.5)')).toBe(true)
      expect(isColor('hsl(0, 100%, 50%)')).toBe(true)
      expect(isColor('hsla(0, 100%, 50%, 0.5)')).toBe(true)
      expect(isColor('red')).toBe(true)
    })

    it('should return false for invalid colors', () => {
      expect(isColor('#FF000')).toBe(false) // Too short
      expect(isColor('#FF00000')).toBe(false) // Too long
      expect(isColor('rgb(255, 0)')).toBe(false) // Missing component
      expect(isColor('rgb(255, 0, 0, 0.5)')).toBe(false) // Too many components
    })

    it('should handle edge cases', () => {
      expect(isColor('')).toBe(false)
      expect(isColor(null as any)).toBe(false)
      expect(isColor(undefined as any)).toBe(false)
    })
  })

  describe('isHexColor', () => {
    it('should return true for valid hex colors', () => {
      expect(isHexColor('#FF0000')).toBe(true)
      expect(isHexColor('#ff0000')).toBe(true)
      expect(isHexColor('#F00')).toBe(true)
      expect(isHexColor('#f00')).toBe(true)
    })

    it('should return false for invalid hex colors', () => {
      expect(isHexColor('#FF000')).toBe(false) // Too short
      expect(isHexColor('#FF00000')).toBe(false) // Too long
      expect(isHexColor('FF0000')).toBe(false) // Missing #
      expect(isHexColor('#GG0000')).toBe(false) // Invalid character
    })

    it('should handle edge cases', () => {
      expect(isHexColor('')).toBe(false)
      expect(isHexColor(null as any)).toBe(false)
      expect(isHexColor(undefined as any)).toBe(false)
    })
  })

  describe('isRGBColor', () => {
    it('should return true for valid RGB colors', () => {
      expect(isRGBColor('rgb(255, 0, 0)')).toBe(true)
      expect(isRGBColor('rgb(0, 255, 0)')).toBe(true)
      expect(isRGBColor('rgb(0, 0, 255)')).toBe(true)
      expect(isRGBColor('rgb(255, 255, 255)')).toBe(true)
      expect(isRGBColor('rgb(0, 0, 0)')).toBe(true)
    })

    it('should return false for invalid RGB colors', () => {
      expect(isRGBColor('rgb(255, 0)')).toBe(false) // Missing component
      expect(isRGBColor('rgb(255, 0, 0, 0.5)')).toBe(false) // Too many components
      expect(isRGBColor('rgb(256, 0, 0)')).toBe(false) // Invalid value
      expect(isRGBColor('rgb(255, 0, 0')).toBe(false) // Missing closing parenthesis
    })

    it('should handle edge cases', () => {
      expect(isRGBColor('')).toBe(false)
      expect(isRGBColor(null as any)).toBe(false)
      expect(isRGBColor(undefined as any)).toBe(false)
    })
  })

  describe('isHSLColor', () => {
    it('should return true for valid HSL colors', () => {
      expect(isHSLColor('hsl(0, 100%, 50%)')).toBe(true)
      expect(isHSLColor('hsl(120, 100%, 50%)')).toBe(true)
      expect(isHSLColor('hsl(240, 100%, 50%)')).toBe(true)
      expect(isHSLColor('hsl(0, 0%, 100%)')).toBe(true)
      expect(isHSLColor('hsl(0, 100%, 0%)')).toBe(true)
    })

    it('should return false for invalid HSL colors', () => {
      expect(isHSLColor('hsl(0, 100%)')).toBe(false) // Missing component
      expect(isHSLColor('hsl(0, 100%, 50%, 0.5)')).toBe(false) // Too many components
      expect(isHSLColor('hsl(361, 100%, 50%)')).toBe(false) // Invalid hue
      expect(isHSLColor('hsl(0, 101%, 50%)')).toBe(false) // Invalid saturation
    })

    it('should handle edge cases', () => {
      expect(isHSLColor('')).toBe(false)
      expect(isHSLColor(null as any)).toBe(false)
      expect(isHSLColor(undefined as any)).toBe(false)
    })
  })

  describe('validate', () => {
    it('should validate data against rules', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        password: 'Password123'
      }

      const rules = {
        name: [isRequired, isMinLength(2)],
        email: [isRequired, isEmail],
        age: [isRequired, isInteger, isMin(18)],
        password: [isRequired, isMinLength(8)]
      }

      const result = validate(data, rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return errors for invalid data', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: 15,
        password: 'short'
      }

      const rules = {
        name: [isRequired, isMinLength(2)],
        email: [isRequired, isEmail],
        age: [isRequired, isInteger, isMin(18)],
        password: [isRequired, isMinLength(8)]
      }

      const result = validate(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
      expect(result.errors.email).toBeDefined()
      expect(result.errors.age).toBeDefined()
      expect(result.errors.password).toBeDefined()
    })

    it('should handle missing fields', () => {
      const data = {
        name: 'John Doe'
      }

      const rules = {
        name: [isRequired],
        email: [isRequired, isEmail]
      }

      const result = validate(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toBeDefined()
    })

    it('should handle custom error messages', () => {
      const data = {
        email: 'invalid-email'
      }

      const rules = {
        email: [
          { validator: isRequired, message: 'Email is required' },
          { validator: isEmail, message: 'Please enter a valid email' }
        ]
      }

      const result = validate(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toContain('Please enter a valid email')
    })
  })

  describe('validateSchema', () => {
    it('should validate data against schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18 },
          password: { type: 'string', minLength: 8 }
        },
        required: ['name', 'email', 'age', 'password']
      }

      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        password: 'Password123'
      }

      const result = validateSchema(data, schema)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return errors for invalid data', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18 },
          password: { type: 'string', minLength: 8 }
        },
        required: ['name', 'email', 'age', 'password']
      }

      const data = {
        name: '',
        email: 'invalid-email',
        age: 15,
        password: 'short'
      }

      const result = validateSchema(data, schema)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
      expect(result.errors.email).toBeDefined()
      expect(result.errors.age).toBeDefined()
      expect(result.errors.password).toBeDefined()
    })

    it('should handle complex nested schemas', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2 },
              contact: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', pattern: '^\d{3}-\d{3}-\d{4}$' }
                },
                required: ['email', 'phone']
              }
            },
            required: ['name', 'contact']
          }
        },
        required: ['user']
      }

      const data = {
        user: {
          name: 'John Doe',
          contact: {
            email: 'john@example.com',
            phone: '123-456-7890'
          }
        }
      }

      const result = validateSchema(data, schema)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex validation scenarios', () => {
      const formData = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          password: 'Password123',
          phone: '123-456-7890'
        },
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'US'
        },
        preferences: {
          newsletter: true,
          notifications: ['email', 'sms']
        }
      }

      const validationRules = {
        'user.name': [isRequired, isMinLength(2)],
        'user.email': [isRequired, isEmail],
        'user.age': [isRequired, isInteger, isMin(18), isMax(120)],
        'user.password': [isRequired, isMinLength(8), isStrongPassword],
        'user.phone': [isRequired, isPhone],
        'address.street': [isRequired],
        'address.city': [isRequired],
        'address.state': [isRequired, isLength(2)],
        'address.zip': [isRequired, isPostalCode],
        'address.country': [isRequired, isLength(2)],
        'preferences.newsletter': [isBoolean],
        'preferences.notifications': [isArray, isMinLength(1)]
      }

      const result = validate(formData, validationRules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should handle complex validation with custom rules', () => {
      const customValidator = (value: any) => {
        return typeof value === 'string' && value.includes('@')
      }

      const data = {
        username: 'john_doe',
        email: 'john@example.com',
        customField: 'test@example.com'
      }

      const rules = {
        username: [isRequired, isUsername],
        email: [isRequired, isEmail],
        customField: [isRequired, customValidator]
      }

      const result = validate(data, rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should validate complex nested objects with schemas', () => {
      const complexSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
                profile: {
                  type: 'object',
                  properties: {
                    age: { type: 'integer', minimum: 0, maximum: 120 },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                        zip: { type: 'string', pattern: '^\d{5}$' }
                      },
                      required: ['street', 'city']
                    }
                  },
                  required: ['age']
                }
              },
              required: ['id', 'name', 'email']
            }
          }
        },
        required: ['users']
      }

      const data = {
        users: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john@example.com',
            profile: {
              age: 30,
              address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345'
              }
            }
          }
        ]
      }

      const result = validateSchema(data, complexSchema)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })
})