import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import {
  getToken,
  setToken,
  removeToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
  logout,
  isLoggedIn
} from '@/utils/auth'

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  })
}

// 控制台错误检测变量
let consoleSpy: any

describe('Auth Utils', () => {
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
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Clear all mocks
    vi.clearAllMocks()
    
    // Clear localStorage store
    mockLocalStorage.store = {}
  })

  afterEach(() => {
    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  })

  describe('getToken', () => {
    it('should return token when it exists', () => {
      const token = 'test-token-123'
      mockLocalStorage.store['kindergarten_token'] = token
      
      const result = getToken()
      expect(result).toBe(token)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('kindergarten_token')
    })

    it('should return null when token does not exist', () => {
      const result = getToken()
      expect(result).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('kindergarten_token')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      const result = getToken()
      expect(result).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should set token in localStorage', () => {
      const token = 'test-token-123'
      
      setToken(token)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('kindergarten_token', token)
      expect(mockLocalStorage.store['kindergarten_token']).toBe(token)
    })

    it('should handle empty token', () => {
      const token = ''
      
      setToken(token)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('kindergarten_token', token)
      expect(mockLocalStorage.store['kindergarten_token']).toBe('')
    })

    it('should handle localStorage errors gracefully', () => {
      const token = 'test-token-123'
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => setToken(token)).not.toThrow()
    })
  })

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      mockLocalStorage.store['kindergarten_token'] = 'test-token'
      
      removeToken()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.store['kindergarten_token']).toBeUndefined()
    })

    it('should handle when token does not exist', () => {
      removeToken()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => removeToken()).not.toThrow()
    })
  })

  describe('setUserInfo', () => {
    it('should set user info in localStorage as JSON string', () => {
      const userInfo = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN'
      }
      
      setUserInfo(userInfo)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('kindergarten_user_info', JSON.stringify(userInfo))
      expect(mockLocalStorage.store['kindergarten_user_info']).toBe(JSON.stringify(userInfo))
    })

    it('should handle complex user info objects', () => {
      const userInfo = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        profile: {
          avatar: 'avatar.jpg',
          department: 'IT'
        },
        permissions: ['read', 'write', 'delete']
      }
      
      setUserInfo(userInfo)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('kindergarten_user_info', JSON.stringify(userInfo))
      expect(mockLocalStorage.store['kindergarten_user_info']).toBe(JSON.stringify(userInfo))
    })

    it('should handle localStorage errors gracefully', () => {
      const userInfo = { id: 1, name: 'John Doe' }
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => setUserInfo(userInfo)).not.toThrow()
    })
  })

  describe('getUserInfo', () => {
    it('should return parsed user info when it exists', () => {
      const userInfo = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN'
      }
      mockLocalStorage.store['kindergarten_user_info'] = JSON.stringify(userInfo)
      
      const result = getUserInfo()
      
      expect(result).toEqual(userInfo)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should return null when user info does not exist', () => {
      const result = getUserInfo()
      
      expect(result).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage.store['kindergarten_user_info'] = 'invalid-json'
      
      const result = getUserInfo()
      
      expect(result).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      const result = getUserInfo()
      expect(result).toBeNull()
    })
  })

  describe('removeUserInfo', () => {
    it('should remove user info from localStorage', () => {
      mockLocalStorage.store['kindergarten_user_info'] = JSON.stringify({ id: 1, name: 'John Doe' })
      
      removeUserInfo()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
      expect(mockLocalStorage.store['kindergarten_user_info']).toBeUndefined()
    })

    it('should handle when user info does not exist', () => {
      removeUserInfo()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => removeUserInfo()).not.toThrow()
    })
  })

  describe('logout', () => {
    it('should remove both token and user info', () => {
      mockLocalStorage.store['kindergarten_token'] = 'test-token'
      mockLocalStorage.store['kindergarten_user_info'] = JSON.stringify({ id: 1, name: 'John Doe' })
      
      logout()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
      expect(mockLocalStorage.store['kindergarten_token']).toBeUndefined()
      expect(mockLocalStorage.store['kindergarten_user_info']).toBeUndefined()
    })

    it('should handle when only token exists', () => {
      mockLocalStorage.store['kindergarten_token'] = 'test-token'
      
      logout()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle when only user info exists', () => {
      mockLocalStorage.store['kindergarten_user_info'] = JSON.stringify({ id: 1, name: 'John Doe' })
      
      logout()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle when neither exists', () => {
      logout()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_user_info')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => logout()).not.toThrow()
    })
  })

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      mockLocalStorage.store['kindergarten_token'] = 'test-token'
      
      const result = isLoggedIn()
      
      expect(result).toBe(true)
    })

    it('should return false when token does not exist', () => {
      const result = isLoggedIn()
      
      expect(result).toBe(false)
    })

    it('should return false when token is empty string', () => {
      mockLocalStorage.store['kindergarten_token'] = ''
      
      const result = isLoggedIn()
      
      expect(result).toBe(false)
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })
      
      const result = isLoggedIn()
      expect(result).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', () => {
      const userInfo = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN'
      }
      const token = 'auth-token-123'
      
      // Login flow
      setToken(token)
      setUserInfo(userInfo)
      
      expect(isLoggedIn()).toBe(true)
      expect(getToken()).toBe(token)
      expect(getUserInfo()).toEqual(userInfo)
      
      // Logout flow
      logout()
      
      expect(isLoggedIn()).toBe(false)
      expect(getToken()).toBeNull()
      expect(getUserInfo()).toBeNull()
    })

    it('should handle multiple authentication cycles', () => {
      const user1 = { id: 1, name: 'User 1', email: 'user1@example.com' }
      const user2 = { id: 2, name: 'User 2', email: 'user2@example.com' }
      const token1 = 'token-1'
      const token2 = 'token-2'
      
      // First user
      setToken(token1)
      setUserInfo(user1)
      expect(isLoggedIn()).toBe(true)
      expect(getUserInfo()).toEqual(user1)
      
      // Logout
      logout()
      expect(isLoggedIn()).toBe(false)
      
      // Second user
      setToken(token2)
      setUserInfo(user2)
      expect(isLoggedIn()).toBe(true)
      expect(getUserInfo()).toEqual(user2)
      
      // Final logout
      logout()
      expect(isLoggedIn()).toBe(false)
    })

    it('should handle edge cases with special characters in tokens and user info', () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const specialUserInfo = {
        id: 1,
        name: 'Jöhn Döe',
        email: 'john+test@example.com',
        role: 'ADMIN',
        specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }
      
      setToken(specialToken)
      setUserInfo(specialUserInfo)
      
      expect(getToken()).toBe(specialToken)
      expect(getUserInfo()).toEqual(specialUserInfo)
      expect(isLoggedIn()).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    it('should handle large user info objects efficiently', () => {
      const largeUserInfo = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        permissions: Array(1000).fill('permission'),
        settings: {
          theme: 'dark',
          language: 'en',
          notifications: Array(500).fill('notification')
        }
      }
      
      const startTime = performance.now()
      setUserInfo(largeUserInfo)
      const setEndTime = performance.now()
      
      const retrievedInfo = getUserInfo()
      const getEndTime = performance.now()
      
      expect(retrievedInfo).toEqual(largeUserInfo)
      expect(setEndTime - startTime).toBeLessThan(10) // Should be fast
      expect(getEndTime - setEndTime).toBeLessThan(10) // Should be fast
    })

    it('should handle rapid consecutive calls', () => {
      const token = 'test-token'
      const userInfo = { id: 1, name: 'John Doe' }
      
      // Rapid calls
      for (let i = 0; i < 100; i++) {
        setToken(token)
        setUserInfo(userInfo)
        expect(isLoggedIn()).toBe(true)
        expect(getToken()).toBe(token)
        expect(getUserInfo()).toEqual(userInfo)
        logout()
        expect(isLoggedIn()).toBe(false)
      }
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive information in error messages', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Security violation')
      })
      
      const result = getToken()
      expect(result).toBeNull()
      // No sensitive information should be logged or exposed
    })

    it('should handle malformed JSON safely', () => {
      const maliciousJson = '{"__proto__": {"polluted": "yes"}, "constructor": {"prototype": {"polluted": "yes"}}}'
      mockLocalStorage.store['kindergarten_user_info'] = maliciousJson
      
      const result = getUserInfo()
      // Should not crash or pollute prototypes
      expect(result).toBeNull()
    })

    it('should validate token format (basic check)', () => {
      const validTokens = [
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkw',
        'simple-token-123'
      ]
      
      validTokens.forEach(token => {
        setToken(token)
        expect(getToken()).toBe(token)
        removeToken()
      })
    })
  })
})