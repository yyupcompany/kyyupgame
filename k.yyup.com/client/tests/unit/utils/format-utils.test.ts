import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  formatFileSize, 
  formatPhone, 
  formatEmail, 
  formatUrl, 
  formatMask, 
  formatTruncate, 
  formatCapitalize, 
  formatCamelCase, 
  formatSnakeCase, 
  formatKebabCase, 
  formatPascalCase, 
  formatTitleCase, 
  formatSentenceCase, 
  formatReverse, 
  formatSort, 
  formatUnique, 
  formatGroup 
} from '@/utils/format-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Format Utils', () => {
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
  describe('formatCurrency', () => {
    it('should format currency with default settings', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format currency with custom currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00')
      expect(formatCurrency(500, 'JPY')).toBe('¥500.00')
    })

    it('should format currency with custom locale', () => {
      expect(formatCurrency(1234.56, 'USD', 'de-DE')).toBe('1.234,56 $')
      expect(formatCurrency(1000, 'EUR', 'fr-FR')).toBe('1 000,00 €')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
      expect(formatCurrency(-100)).toBe('-$100.00')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(0, 'EUR')).toBe('€0.00')
    })

    it('should handle decimal places', () => {
      expect(formatCurrency(1234.5678, 'USD', 'en-US', 2)).toBe('$1,234.57')
      expect(formatCurrency(1234.5678, 'USD', 'en-US', 0)).toBe('$1,235')
      expect(formatCurrency(1234.5678, 'USD', 'en-US', 4)).toBe('$1,234.5678')
    })

    it('should handle invalid input', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
      expect(formatCurrency(Infinity)).toBe('$Infinity')
      expect(formatCurrency(null as any)).toBe('$0.00')
      expect(formatCurrency(undefined as any)).toBe('$0.00')
    })
  })

  describe('formatNumber', () => {
    it('should format number with default settings', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should format number with custom locale', () => {
      expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56')
      expect(formatNumber(1000, 'fr-FR')).toBe('1 000')
    })

    it('should handle decimal places', () => {
      expect(formatNumber(1234.5678, 'en-US', 2)).toBe('1,234.57')
      expect(formatNumber(1234.5678, 'en-US', 0)).toBe('1,235')
      expect(formatNumber(1234.5678, 'en-US', 4)).toBe('1,234.5678')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.56)).toBe('-1,234.56')
      expect(formatNumber(-1000)).toBe('-1,000')
    })

    it('should handle large numbers', () => {
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(1234567890.123)).toBe('1,234,567,890.123')
    })

    it('should handle invalid input', () => {
      expect(formatNumber(NaN)).toBe('0')
      expect(formatNumber(Infinity)).toBe('Infinity')
      expect(formatNumber(null as any)).toBe('0')
      expect(formatNumber(undefined as any)).toBe('0')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default settings', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%')
      expect(formatPercentage(0.5)).toBe('50%')
      expect(formatPercentage(1)).toBe('100%')
      expect(formatPercentage(0)).toBe('0%')
    })

    it('should format percentage with custom decimal places', () => {
      expect(formatPercentage(0.1234, 0)).toBe('12%')
      expect(formatPercentage(0.1234, 1)).toBe('12.3%')
      expect(formatPercentage(0.1234, 3)).toBe('12.340%')
    })

    it('should handle values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150%')
      expect(formatPercentage(2)).toBe('200%')
    })

    it('should handle negative values', () => {
      expect(formatPercentage(-0.1234)).toBe('-12.34%')
      expect(formatPercentage(-0.5)).toBe('-50%')
    })

    it('should handle invalid input', () => {
      expect(formatPercentage(NaN)).toBe('0%')
      expect(formatPercentage(Infinity)).toBe('Infinity%')
      expect(formatPercentage(null as any)).toBe('0%')
      expect(formatPercentage(undefined as any)).toBe('0%')
    })
  })

  describe('formatFileSize', () => {
    it('should format file size in bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('should format file size in kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
    })

    it('should format file size in megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
      expect(formatFileSize(2097152)).toBe('2 MB')
    })

    it('should format file size in gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
      expect(formatFileSize(1610612736)).toBe('1.5 GB')
      expect(formatFileSize(2147483648)).toBe('2 GB')
    })

    it('should format file size in terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB')
      expect(formatFileSize(1649267441664)).toBe('1.5 TB')
    })

    it('should handle decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB')
      expect(formatFileSize(1536, 1)).toBe('1.5 KB')
      expect(formatFileSize(1536, 3)).toBe('1.5 KB')
    })

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should handle negative values', () => {
      expect(formatFileSize(-1024)).toBe('-1 KB')
      expect(formatFileSize(-500)).toBe('-500 B')
    })

    it('should handle invalid input', () => {
      expect(formatFileSize(NaN)).toBe('0 B')
      expect(formatFileSize(Infinity)).toBe('Infinity B')
      expect(formatFileSize(null as any)).toBe('0 B')
      expect(formatFileSize(undefined as any)).toBe('0 B')
    })
  })

  describe('formatPhone', () => {
    it('should format US phone number', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890')
      expect(formatPhone('123-456-7890')).toBe('(123) 456-7890')
      expect(formatPhone('(123) 456-7890')).toBe('(123) 456-7890')
    })

    it('should format phone number with country code', () => {
      expect(formatPhone('+11234567890')).toBe('+1 (123) 456-7890')
      expect(formatPhone('11234567890')).toBe('+1 (123) 456-7890')
    })

    it('should format international phone numbers', () => {
      expect(formatPhone('441234567890', 'GB')).toBe('+44 1234 567890')
      expect(formatPhone('33123456789', 'FR')).toBe('+33 1 23 45 67 89')
    })

    it('should handle invalid phone numbers', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('abc')).toBe('abc')
      expect(formatPhone('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatPhone(null as any)).toBe('')
      expect(formatPhone(undefined as any)).toBe('')
    })
  })

  describe('formatEmail', () => {
    it('should format email address', () => {
      expect(formatEmail('test@example.com')).toBe('test@example.com')
      expect(formatEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should mask email address', () => {
      expect(formatEmail('test@example.com', true)).toBe('t***@example.com')
      expect(formatEmail('longemailaddress@example.com', true)).toBe('l**************@example.com')
      expect(formatEmail('a@b.com', true)).toBe('a***@b.com')
    })

    it('should handle invalid email', () => {
      expect(formatEmail('invalid-email')).toBe('invalid-email')
      expect(formatEmail('@example.com')).toBe('@example.com')
      expect(formatEmail('test@')).toBe('test@')
    })

    it('should handle null/undefined input', () => {
      expect(formatEmail(null as any)).toBe('')
      expect(formatEmail(undefined as any)).toBe('')
    })
  })

  describe('formatUrl', () => {
    it('should format URL with protocol', () => {
      expect(formatUrl('https://example.com')).toBe('https://example.com')
      expect(formatUrl('http://example.com')).toBe('http://example.com')
    })

    it('should add https protocol if missing', () => {
      expect(formatUrl('example.com')).toBe('https://example.com')
      expect(formatUrl('www.example.com')).toBe('https://www.example.com')
    })

    it('should normalize URL', () => {
      expect(formatUrl('https://EXAMPLE.COM')).toBe('https://example.com')
      expect(formatUrl('https://example.com/')).toBe('https://example.com')
    })

    it('should handle invalid URL', () => {
      expect(formatUrl('not-a-url')).toBe('not-a-url')
      expect(formatUrl('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatUrl(null as any)).toBe('')
      expect(formatUrl(undefined as any)).toBe('')
    })
  })

  describe('formatMask', () => {
    it('should mask string with default mask', () => {
      expect(formatMask('1234567890')).toBe('**********')
      expect(formatMask('hello')).toBe('*****')
    })

    it('should mask string with custom mask character', () => {
      expect(formatMask('1234567890', '#')).toBe('##########')
      expect(formatMask('hello', '*')).toBe('*****')
    })

    it('should mask with visible start and end characters', () => {
      expect(formatMask('1234567890', '*', 2, 2)).toBe('12******90')
      expect(formatMask('hello', '*', 1, 1)).toBe('h***o')
    })

    it('should handle edge cases with visible characters', () => {
      expect(formatMask('123', '*', 2, 2)).toBe('123')
      expect(formatMask('12', '*', 1, 1)).toBe('12')
      expect(formatMask('1', '*', 1, 1)).toBe('1')
    })

    it('should handle empty string', () => {
      expect(formatMask('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatMask(null as any)).toBe('')
      expect(formatMask(undefined as any)).toBe('')
    })
  })

  describe('formatTruncate', () => {
    it('should truncate string to specified length', () => {
      expect(formatTruncate('Hello world', 5)).toBe('Hello...')
      expect(formatTruncate('This is a long string', 10)).toBe('This is a...')
    })

    it('should not truncate if string is shorter than limit', () => {
      expect(formatTruncate('Hello', 10)).toBe('Hello')
      expect(formatTruncate('Hi', 5)).toBe('Hi')
    })

    it('should use custom suffix', () => {
      expect(formatTruncate('Hello world', 5, '***')).toBe('Hello***')
      expect(formatTruncate('Long string', 8, ' [more]')).toBe('Long str [more]')
    })

    it('should handle empty string', () => {
      expect(formatTruncate('', 10)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatTruncate(null as any, 10)).toBe('')
      expect(formatTruncate(undefined as any, 10)).toBe('')
    })

    it('should handle invalid length', () => {
      expect(formatTruncate('Hello', 0)).toBe('...')
      expect(formatTruncate('Hello', -5)).toBe('...')
    })
  })

  describe('formatCapitalize', () => {
    it('should capitalize first letter', () => {
      expect(formatCapitalize('hello')).toBe('Hello')
      expect(formatCapitalize('hello world')).toBe('Hello world')
      expect(formatCapitalize('HELLO')).toBe('HELLO')
    })

    it('should capitalize all words', () => {
      expect(formatCapitalize('hello world', true)).toBe('Hello World')
      expect(formatCapitalize('this is a test', true)).toBe('This Is A Test')
    })

    it('should handle empty string', () => {
      expect(formatCapitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(formatCapitalize('h')).toBe('H')
      expect(formatCapitalize('H')).toBe('H')
    })

    it('should handle null/undefined input', () => {
      expect(formatCapitalize(null as any)).toBe('')
      expect(formatCapitalize(undefined as any)).toBe('')
    })

    it('should handle strings with spaces', () => {
      expect(formatCapitalize('  hello  ')).toBe('  hello  ')
      expect(formatCapitalize('  hello  world  ', true)).toBe('  Hello  World  ')
    })
  })

  describe('formatCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(formatCamelCase('hello world')).toBe('helloWorld')
      expect(formatCamelCase('Hello World')).toBe('helloWorld')
      expect(formatCamelCase('hello-world')).toBe('helloWorld')
      expect(formatCamelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle multiple spaces and separators', () => {
      expect(formatCamelCase('hello   world')).toBe('helloWorld')
      expect(formatCamelCase('hello--world')).toBe('helloWorld')
      expect(formatCamelCase('hello__world')).toBe('helloWorld')
    })

    it('should handle single word', () => {
      expect(formatCamelCase('hello')).toBe('hello')
      expect(formatCamelCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(formatCamelCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatCamelCase(null as any)).toBe('')
      expect(formatCamelCase(undefined as any)).toBe('')
    })
  })

  describe('formatSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(formatSnakeCase('hello world')).toBe('hello_world')
      expect(formatSnakeCase('Hello World')).toBe('hello_world')
      expect(formatSnakeCase('hello-world')).toBe('hello_world')
      expect(formatSnakeCase('helloWorld')).toBe('hello_world')
    })

    it('should handle multiple spaces and separators', () => {
      expect(formatSnakeCase('hello   world')).toBe('hello_world')
      expect(formatSnakeCase('hello--world')).toBe('hello_world')
      expect(formatSnakeCase('helloWorld')).toBe('hello_world')
    })

    it('should handle single word', () => {
      expect(formatSnakeCase('hello')).toBe('hello')
      expect(formatSnakeCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(formatSnakeCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatSnakeCase(null as any)).toBe('')
      expect(formatSnakeCase(undefined as any)).toBe('')
    })
  })

  describe('formatKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(formatKebabCase('hello world')).toBe('hello-world')
      expect(formatKebabCase('Hello World')).toBe('hello-world')
      expect(formatKebabCase('hello_world')).toBe('hello-world')
      expect(formatKebabCase('helloWorld')).toBe('hello-world')
    })

    it('should handle multiple spaces and separators', () => {
      expect(formatKebabCase('hello   world')).toBe('hello-world')
      expect(formatKebabCase('hello__world')).toBe('hello-world')
      expect(formatKebabCase('helloWorld')).toBe('hello-world')
    })

    it('should handle single word', () => {
      expect(formatKebabCase('hello')).toBe('hello')
      expect(formatKebabCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(formatKebabCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatKebabCase(null as any)).toBe('')
      expect(formatKebabCase(undefined as any)).toBe('')
    })
  })

  describe('formatPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(formatPascalCase('hello world')).toBe('HelloWorld')
      expect(formatPascalCase('Hello World')).toBe('HelloWorld')
      expect(formatPascalCase('hello-world')).toBe('HelloWorld')
      expect(formatPascalCase('hello_world')).toBe('HelloWorld')
    })

    it('should handle multiple spaces and separators', () => {
      expect(formatPascalCase('hello   world')).toBe('HelloWorld')
      expect(formatPascalCase('hello--world')).toBe('HelloWorld')
      expect(formatPascalCase('hello__world')).toBe('HelloWorld')
    })

    it('should handle single word', () => {
      expect(formatPascalCase('hello')).toBe('Hello')
      expect(formatPascalCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(formatPascalCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatPascalCase(null as any)).toBe('')
      expect(formatPascalCase(undefined as any)).toBe('')
    })
  })

  describe('formatTitleCase', () => {
    it('should convert to Title Case', () => {
      expect(formatTitleCase('hello world')).toBe('Hello World')
      expect(formatTitleCase('hello world test')).toBe('Hello World Test')
    })

    it('should handle mixed case', () => {
      expect(formatTitleCase('hELLO wORLD')).toBe('Hello World')
      expect(formatTitleCase('Hello World')).toBe('Hello World')
    })

    it('should handle multiple spaces', () => {
      expect(formatTitleCase('hello   world')).toBe('Hello   World')
    })

    it('should handle single word', () => {
      expect(formatTitleCase('hello')).toBe('Hello')
      expect(formatTitleCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(formatTitleCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatTitleCase(null as any)).toBe('')
      expect(formatTitleCase(undefined as any)).toBe('')
    })
  })

  describe('formatSentenceCase', () => {
    it('should convert to sentence case', () => {
      expect(formatSentenceCase('hello world')).toBe('Hello world')
      expect(formatSentenceCase('HELLO WORLD')).toBe('Hello world')
    })

    it('should handle multiple sentences', () => {
      expect(formatSentenceCase('hello. world. test.')).toBe('Hello. World. Test.')
      expect(formatSentenceCase('hello. WORLD. test.')).toBe('Hello. World. Test.')
    })

    it('should handle mixed case', () => {
      expect(formatSentenceCase('hELLO wORLD')).toBe('Hello world')
    })

    it('should handle single word', () => {
      expect(formatSentenceCase('hello')).toBe('Hello')
      expect(formatSentenceCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(formatSentenceCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(formatSentenceCase(null as any)).toBe('')
      expect(formatSentenceCase(undefined as any)).toBe('')
    })
  })

  describe('formatReverse', () => {
    it('should reverse string', () => {
      expect(formatReverse('hello')).toBe('olleh')
      expect(formatReverse('world')).toBe('dlrow')
      expect(formatReverse('12345')).toBe('54321')
    })

    it('should reverse array', () => {
      expect(formatReverse([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
      expect(formatReverse(['a', 'b', 'c'])).toEqual(['c', 'b', 'a'])
    })

    it('should handle empty string/array', () => {
      expect(formatReverse('')).toBe('')
      expect(formatReverse([])).toEqual([])
    })

    it('should handle single character/element', () => {
      expect(formatReverse('a')).toBe('a')
      expect(formatReverse([1])).toEqual([1])
    })

    it('should handle null/undefined input', () => {
      expect(formatReverse(null as any)).toBe(null)
      expect(formatReverse(undefined as any)).toBe(undefined)
    })

    it('should handle invalid input type', () => {
      expect(formatReverse(123 as any)).toBe(123)
      expect(formatReverse({} as any)).toEqual({})
    })
  })

  describe('formatSort', () => {
    it('should sort array of numbers', () => {
      expect(formatSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
      expect(formatSort([10, 5, 8, 3, 1])).toEqual([1, 3, 5, 8, 10])
    })

    it('should sort array of strings', () => {
      expect(formatSort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
      expect(formatSort(['z', 'a', 'b', 'y'])).toEqual(['a', 'b', 'y', 'z'])
    })

    it('should sort array of objects by key', () => {
      const objects = [
        { name: 'banana', value: 3 },
        { name: 'apple', value: 1 },
        { name: 'cherry', value: 2 }
      ]
      expect(formatSort(objects, 'name')).toEqual([
        { name: 'apple', value: 1 },
        { name: 'banana', value: 3 },
        { name: 'cherry', value: 2 }
      ])
      expect(formatSort(objects, 'value')).toEqual([
        { name: 'apple', value: 1 },
        { name: 'cherry', value: 2 },
        { name: 'banana', value: 3 }
      ])
    })

    it('should sort in descending order', () => {
      expect(formatSort([3, 1, 4, 1, 5], 'asc', false)).toEqual([5, 4, 3, 1, 1])
      expect(formatSort(['c', 'a', 'b'], 'asc', false)).toEqual(['c', 'b', 'a'])
    })

    it('should handle empty array', () => {
      expect(formatSort([])).toEqual([])
    })

    it('should handle single element array', () => {
      expect(formatSort([1])).toEqual([1])
      expect(formatSort(['a'])).toEqual(['a'])
    })

    it('should handle null/undefined input', () => {
      expect(formatSort(null as any)).toEqual([])
      expect(formatSort(undefined as any)).toEqual([])
    })
  })

  describe('formatUnique', () => {
    it('should remove duplicates from array', () => {
      expect(formatUnique([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5])
      expect(formatUnique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
    })

    it('should remove duplicates from array of objects by key', () => {
      const objects = [
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 1, name: 'apple' },
        { id: 3, name: 'cherry' }
      ]
      expect(formatUnique(objects, 'id')).toEqual([
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 3, name: 'cherry' }
      ])
    })

    it('should handle empty array', () => {
      expect(formatUnique([])).toEqual([])
    })

    it('should handle single element array', () => {
      expect(formatUnique([1])).toEqual([1])
      expect(formatUnique(['a'])).toEqual(['a'])
    })

    it('should handle array with all duplicates', () => {
      expect(formatUnique([1, 1, 1, 1])).toEqual([1])
      expect(formatUnique(['a', 'a', 'a'])).toEqual(['a'])
    })

    it('should handle null/undefined input', () => {
      expect(formatUnique(null as any)).toEqual([])
      expect(formatUnique(undefined as any)).toEqual([])
    })
  })

  describe('formatGroup', () => {
    it('should group array by key', () => {
      const objects = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' },
        { category: 'fruit', name: 'cherry' },
        { category: 'vegetable', name: 'broccoli' }
      ]
      const result = formatGroup(objects, 'category')
      
      expect(result).toEqual({
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
          { category: 'fruit', name: 'cherry' }
        ],
        vegetable: [
          { category: 'vegetable', name: 'carrot' },
          { category: 'vegetable', name: 'broccoli' }
        ]
      })
    })

    it('should group array by function', () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = formatGroup(numbers, (num: number) => num % 2 === 0 ? 'even' : 'odd')
      
      expect(result).toEqual({
        even: [2, 4, 6, 8, 10],
        odd: [1, 3, 5, 7, 9]
      })
    })

    it('should handle empty array', () => {
      expect(formatGroup([], 'category')).toEqual({})
    })

    it('should handle single element array', () => {
      const objects = [{ category: 'fruit', name: 'apple' }]
      const result = formatGroup(objects, 'category')
      expect(result).toEqual({
        fruit: [{ category: 'fruit', name: 'apple' }]
      })
    })

    it('should handle null/undefined input', () => {
      expect(formatGroup(null as any, 'category')).toEqual({})
      expect(formatGroup(undefined as any, 'category')).toEqual({})
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex formatting scenarios', () => {
      const rawData = [
        { name: 'john doe', amount: 1234.56, category: 'sales' },
        { name: 'jane smith', amount: 2345.67, category: 'marketing' },
        { name: 'john doe', amount: 3456.78, category: 'sales' },
        { name: 'bob johnson', amount: 4567.89, category: 'sales' }
      ]

      // Clean and format names
      const cleanedData = rawData.map(item => ({
        ...item,
        name: formatTitleCase(item.name),
        formattedAmount: formatCurrency(item.amount)
      }))

      // Remove duplicates by name
      const uniqueData = formatUnique(cleanedData, 'name')

      // Group by category
      const groupedData = formatGroup(cleanedData, 'category')

      expect(cleanedData[0].name).toBe('John Doe')
      expect(cleanedData[0].formattedAmount).toBe('$1,234.56')
      expect(uniqueData.length).toBe(3)
      expect(groupedData.sales).toHaveLength(3)
      expect(groupedData.marketing).toHaveLength(1)
    })

    it('should handle edge cases in formatting pipeline', () => {
      const testCases = [
        { input: '', expected: '' },
        { input: null as any, expected: '' },
        { input: undefined as any, expected: '' },
        { input: '  hello  world  ', expected: '  Hello  World  ' }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = formatCapitalize(input, true)
        expect(result).toBe(expected)
      })
    })

    it('should format complex data structures', () => {
      const complexData = {
        users: [
          { name: 'john doe', email: 'john@example.com', phone: '1234567890' },
          { name: 'jane smith', email: 'jane@example.com', phone: '9876543210' }
        ],
        totals: {
          revenue: 1234567.89,
          expenses: 987654.32,
          profit: 246913.57
        }
      }

      const formattedData = {
        users: complexData.users.map(user => ({
          name: formatTitleCase(user.name),
          email: formatEmail(user.email, true),
          phone: formatPhone(user.phone)
        })),
        totals: {
          revenue: formatCurrency(complexData.totals.revenue),
          expenses: formatCurrency(complexData.totals.expenses),
          profit: formatCurrency(complexData.totals.profit)
        }
      }

      expect(formattedData.users[0].name).toBe('John Doe')
      expect(formattedData.users[0].email).toBe('j***@example.com')
      expect(formattedData.users[0].phone).toBe('(123) 456-7890')
      expect(formattedData.totals.revenue).toBe('$1,234,567.89')
      expect(formattedData.totals.expenses).toBe('$987,654.32')
      expect(formattedData.totals.profit).toBe('$246,913.57')
    })
  })
})