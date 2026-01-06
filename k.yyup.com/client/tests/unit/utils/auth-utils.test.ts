
vi.mock('../../../src/utils/auth-utils', () => ({
  default: {},
  // 常用工具函数Mock
  getDeviceInfo: vi.fn(() => ({ type: 'pc', os: 'windows' })),
  getDeviceType: vi.fn(() => 'pc'),
  isAuthenticated: vi.fn(() => true),
  getToken: vi.fn(() => 'mock-token'),
  getUserInfo: vi.fn(() => ({ id: 1, name: 'Test User' }))
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as authUtils from '../../../src/utils/auth-utils'

// Mock localStorage
const mockLocalStorage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}

// Mock sessionStorage
const mockSessionStorage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}

// Mock crypto
const mockCrypto = {
  subtle: {
    digest: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
    generateKey: vi.fn(),
    importKey: vi.fn(),
    exportKey: vi.fn()
  },
  getRandomValues: vi.fn()
}

// Mock btoa and atob
const mockBtoa = vi.fn()
const mockAtob = vi.fn()

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
    vi.stubGlobal('localStorage', mockLocalStorage)
    vi.stubGlobal('sessionStorage', mockSessionStorage)
    vi.stubGlobal('crypto', mockCrypto)
    vi.stubGlobal('btoa', mockBtoa)
    vi.stubGlobal('atob', mockAtob)
    vi.stubGlobal('window', {
      location: {
        href: 'https://example.com',
        origin: 'https://example.com',
        pathname: '/dashboard',
        search: '?param=value',
        hash: '#section'
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset all mock functions
    Object.values(mockLocalStorage).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockSessionStorage).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockCrypto).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    mockBtoa.mockReset()
    mockAtob.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Token Management', () => {
    describe('setToken', () => {
      it('should set token in localStorage', () => {
        const token = 'jwt-token-123'
        
        authUtils.setToken(token)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', token)
      })

      it('should set token with custom key', () => {
        const token = 'jwt-token-123'
        const key = 'custom_token_key'
        
        authUtils.setToken(token, key)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, token)
      })

      it('should set token in sessionStorage', () => {
        const token = 'jwt-token-123'
        
        authUtils.setToken(token, 'auth_token', 'sessionStorage')
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_token', token)
      })
    })

    describe('getToken', () => {
      it('should get token from localStorage', () => {
        const token = 'jwt-token-123'
        mockLocalStorage.getItem.mockReturnValue(token)
        
        const result = authUtils.getToken()
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token')
        expect(result).toBe(token)
      })

      it('should get token with custom key', () => {
        const token = 'jwt-token-123'
        const key = 'custom_token_key'
        mockLocalStorage.getItem.mockReturnValue(token)
        
        const result = authUtils.getToken(key)
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key)
        expect(result).toBe(token)
      })

      it('should get token from sessionStorage', () => {
        const token = 'jwt-token-123'
        mockSessionStorage.getItem.mockReturnValue(token)
        
        const result = authUtils.getToken('auth_token', 'sessionStorage')
        
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('auth_token')
        expect(result).toBe(token)
      })

      it('should return null if token not found', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.getToken()
        
        expect(result).toBeNull()
      })
    })

    describe('removeToken', () => {
      it('should remove token from localStorage', () => {
        authUtils.removeToken()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      })

      it('should remove token with custom key', () => {
        const key = 'custom_token_key'
        
        authUtils.removeToken(key)
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
      })

      it('should remove token from sessionStorage', () => {
        authUtils.removeToken('auth_token', 'sessionStorage')
        
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token')
      })
    })

    describe('hasToken', () => {
      it('should return true if token exists', () => {
        mockLocalStorage.getItem.mockReturnValue('jwt-token-123')
        
        const result = authUtils.hasToken()
        
        expect(result).toBe(true)
      })

      it('should return false if token does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.hasToken()
        
        expect(result).toBe(false)
      })

      it('should return false if token is empty string', () => {
        mockLocalStorage.getItem.mockReturnValue('')
        
        const result = authUtils.hasToken()
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Token Parsing', () => {
    describe('parseToken', () => {
      it('should parse JWT token', () => {
        const token = 'header.payload.signature'
        const payload = { sub: '123', name: 'John Doe', exp: Math.floor(Date.now() / 1000) + 3600 }
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.parseToken(token)
        
        expect(result).toEqual(payload)
      })

      it('should return null for invalid token', () => {
        const token = 'invalid-token'
        
        mockBtoa.mockImplementation(() => {
          throw new Error('Invalid token')
        })
        
        const result = authUtils.parseToken(token)
        
        expect(result).toBeNull()
      })

      it('should handle malformed JWT token', () => {
        const token = 'invalid.format'
        
        const result = authUtils.parseToken(token)
        
        expect(result).toBeNull()
      })
    })

    describe('isTokenExpired', () => {
      it('should return true for expired token', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) - 3600 } // Expired 1 hour ago
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.isTokenExpired(token)
        
        expect(result).toBe(true)
      })

      it('should return false for valid token', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) + 3600 } // Expires in 1 hour
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.isTokenExpired(token)
        
        expect(result).toBe(false)
      })

      it('should return true if token has no expiry', () => {
        const token = 'header.payload.signature'
        const payload = { sub: '123' } // No exp claim
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.isTokenExpired(token)
        
        expect(result).toBe(true)
      })

      it('should handle invalid token', () => {
        const token = 'invalid-token'
        
        mockBtoa.mockImplementation(() => {
          throw new Error('Invalid token')
        })
        
        const result = authUtils.isTokenExpired(token)
        
        expect(result).toBe(true)
      })
    })

    describe('getTokenPayload', () => {
      it('should get token payload', () => {
        const token = 'header.payload.signature'
        const payload = { sub: '123', name: 'John Doe' }
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.getTokenPayload(token)
        
        expect(result).toEqual(payload)
      })

      it('should return null for invalid token', () => {
        const token = 'invalid-token'
        
        mockBtoa.mockImplementation(() => {
          throw new Error('Invalid token')
        })
        
        const result = authUtils.getTokenPayload(token)
        
        expect(result).toBeNull()
      })
    })

    describe('getTokenExpiry', () => {
      it('should get token expiry time', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.getTokenExpiry(token)
        
        expect(result).toBe(payload.exp)
      })

      it('should return null if token has no expiry', () => {
        const token = 'header.payload.signature'
        const payload = { sub: '123' }
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.getTokenExpiry(token)
        
        expect(result).toBeNull()
      })
    })

    describe('getTimeUntilExpiry', () => {
      it('should get time until token expiry', () => {
        const token = 'header.payload.signature'
        const exp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        
        mockBtoa.mockReturnValue(JSON.stringify({ exp }))
        
        const result = authUtils.getTimeUntilExpiry(token)
        
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThanOrEqual(3600 * 1000)
      })

      it('should return 0 for expired token', () => {
        const token = 'header.payload.signature'
        const exp = Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
        
        mockBtoa.mockReturnValue(JSON.stringify({ exp }))
        
        const result = authUtils.getTimeUntilExpiry(token)
        
        expect(result).toBe(0)
      })
    })
  })

  describe('User Management', () => {
    describe('setUser', () => {
      it('should set user data in localStorage', () => {
        const user = { id: '123', name: 'John Doe', email: 'john@example.com' }
        
        authUtils.setUser(user)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(user))
      })

      it('should set user with custom key', () => {
        const user = { id: '123', name: 'John Doe' }
        const key = 'custom_user_key'
        
        authUtils.setUser(user, key)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(user))
      })
    })

    describe('getUser', () => {
      it('should get user data from localStorage', () => {
        const user = { id: '123', name: 'John Doe', email: 'john@example.com' }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.getUser()
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_user')
        expect(result).toEqual(user)
      })

      it('should get user with custom key', () => {
        const user = { id: '123', name: 'John Doe' }
        const key = 'custom_user_key'
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.getUser(key)
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key)
        expect(result).toEqual(user)
      })

      it('should return null if user not found', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.getUser()
        
        expect(result).toBeNull()
      })

      it('should handle invalid JSON', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json')
        
        const result = authUtils.getUser()
        
        expect(result).toBeNull()
      })
    })

    describe('removeUser', () => {
      it('should remove user data from localStorage', () => {
        authUtils.removeUser()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user')
      })

      it('should remove user with custom key', () => {
        const key = 'custom_user_key'
        
        authUtils.removeUser(key)
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
      })
    })

    describe('hasUser', () => {
      it('should return true if user exists', () => {
        const user = { id: '123', name: 'John Doe' }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasUser()
        
        expect(result).toBe(true)
      })

      it('should return false if user does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.hasUser()
        
        expect(result).toBe(false)
      })
    })

    describe('updateUser', () => {
      it('should update user data', () => {
        const existingUser = { id: '123', name: 'John Doe', email: 'john@example.com' }
        const updates = { name: 'Jane Doe', age: 30 }
        
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingUser))
        
        authUtils.updateUser(updates)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({
          id: '123',
          name: 'Jane Doe',
          email: 'john@example.com',
          age: 30
        }))
      })

      it('should not update if user does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        authUtils.updateUser({ name: 'Jane Doe' })
        
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      })
    })
  })

  describe('Authentication State', () => {
    describe('isAuthenticated', () => {
      it('should return true if token exists and is not expired', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }
        
        mockLocalStorage.getItem.mockReturnValue(token)
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.isAuthenticated()
        
        expect(result).toBe(true)
      })

      it('should return false if token does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.isAuthenticated()
        
        expect(result).toBe(false)
      })

      it('should return false if token is expired', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) - 3600 }
        
        mockLocalStorage.getItem.mockReturnValue(token)
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.isAuthenticated()
        
        expect(result).toBe(false)
      })
    })

    describe('getAuthState', () => {
      it('should get complete authentication state', () => {
        const token = 'header.payload.signature'
        const user = { id: '123', name: 'John Doe' }
        const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }
        
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'auth_token') return token
          if (key === 'auth_user') return JSON.stringify(user)
          return null
        })
        
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.getAuthState()
        
        expect(result).toEqual({
          isAuthenticated: true,
          token: token,
          user: user,
          tokenExpiry: payload.exp,
          timeUntilExpiry: expect.any(Number)
        })
      })

      it('should handle unauthenticated state', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.getAuthState()
        
        expect(result).toEqual({
          isAuthenticated: false,
          token: null,
          user: null,
          tokenExpiry: null,
          timeUntilExpiry: 0
        })
      })
    })

    describe('clearAuth', () => {
      it('should clear all authentication data', () => {
        authUtils.clearAuth()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user')
      })

      it('should clear with custom keys', () => {
        const tokenKey = 'custom_token'
        const userKey = 'custom_user'
        
        authUtils.clearAuth(tokenKey, userKey)
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(tokenKey)
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(userKey)
      })
    })
  })

  describe('Password Utilities', () => {
    describe('hashPassword', () => {
      it('should hash password using SHA-256', async () => {
        const password = 'password123'
        const hashBuffer = new Uint8Array(32)
        
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await authUtils.hashPassword(password)
        
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array))
        expect(result).toBeDefined()
      })

      it('should handle hashing error', async () => {
        const password = 'password123'
        
        mockCrypto.subtle.digest.mockRejectedValue(new Error('Hashing failed'))
        
        await expect(authUtils.hashPassword(password)).rejects.toThrow('Hashing failed')
      })
    })

    describe('generateSalt', () => {
      it('should generate random salt', () => {
        const randomBytes = new Uint8Array(16)
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = authUtils.generateSalt()
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBeDefined()
      })

      it('should generate salt with custom length', () => {
        const randomBytes = new Uint8Array(32)
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = authUtils.generateSalt(32)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBeDefined()
      })
    })

    describe('hashPasswordWithSalt', () => {
      it('should hash password with salt', async () => {
        const password = 'password123'
        const salt = 'random-salt'
        const hashBuffer = new Uint8Array(32)
        
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await authUtils.hashPasswordWithSalt(password, salt)
        
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array))
        expect(result).toBeDefined()
      })
    })

    describe('verifyPassword', () => {
      it('should verify password against hash', async () => {
        const password = 'password123'
        const hash = 'stored-hash'
        const hashBuffer = new Uint8Array(32)
        
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await authUtils.verifyPassword(password, hash)
        
        expect(result).toBeDefined()
      })
    })
  })

  describe('Session Management', () => {
    describe('startSession', () => {
      it('should start new session with token and user', () => {
        const token = 'jwt-token-123'
        const user = { id: '123', name: 'John Doe' }
        
        authUtils.startSession(token, user)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', token)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(user))
      })
    })

    describe('endSession', () => {
      it('should end current session', () => {
        authUtils.endSession()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user')
      })
    })

    describe('refreshSession', () => {
      it('should refresh session with new token', () => {
        const newToken = 'new-jwt-token-123'
        
        authUtils.refreshSession(newToken)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', newToken)
      })
    })

    describe('getSessionDuration', () => {
      it('should get session duration', () => {
        const token = 'header.payload.signature'
        const payload = { exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) }
        
        mockLocalStorage.getItem.mockReturnValue(token)
        mockBtoa.mockReturnValue(JSON.stringify(payload))
        
        const result = authUtils.getSessionDuration()
        
        expect(result).toBe(3600 * 1000) // 1 hour in milliseconds
      })

      it('should return 0 if no session', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.getSessionDuration()
        
        expect(result).toBe(0)
      })
    })
  })

  describe('Permission Management', () => {
    describe('hasPermission', () => {
      it('should return true if user has permission', () => {
        const user = { id: '123', permissions: ['read', 'write'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasPermission('read')
        
        expect(result).toBe(true)
      })

      it('should return false if user does not have permission', () => {
        const user = { id: '123', permissions: ['read'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasPermission('write')
        
        expect(result).toBe(false)
      })

      it('should return false if no user', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = authUtils.hasPermission('read')
        
        expect(result).toBe(false)
      })
    })

    describe('hasAnyPermission', () => {
      it('should return true if user has any of the specified permissions', () => {
        const user = { id: '123', permissions: ['read', 'write'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAnyPermission(['read', 'delete'])
        
        expect(result).toBe(true)
      })

      it('should return false if user has none of the specified permissions', () => {
        const user = { id: '123', permissions: ['read'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAnyPermission(['write', 'delete'])
        
        expect(result).toBe(false)
      })
    })

    describe('hasAllPermissions', () => {
      it('should return true if user has all specified permissions', () => {
        const user = { id: '123', permissions: ['read', 'write', 'delete'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAllPermissions(['read', 'write'])
        
        expect(result).toBe(true)
      })

      it('should return false if user does not have all specified permissions', () => {
        const user = { id: '123', permissions: ['read', 'write'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAllPermissions(['read', 'write', 'delete'])
        
        expect(result).toBe(false)
      })
    })

    describe('getPermissions', () => {
      it('should get user permissions', () => {
        const user = { id: '123', permissions: ['read', 'write'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.getPermissions()
        
        expect(result).toEqual(['read', 'write'])
      })

      it('should return empty array if no user or permissions', () => {
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: '123' }))
        
        const result = authUtils.getPermissions()
        
        expect(result).toEqual([])
      })
    })

    describe('addPermission', () => {
      it('should add permission to user', () => {
        const user = { id: '123', permissions: ['read'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        authUtils.addPermission('write')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({
          id: '123',
          permissions: ['read', 'write']
        }))
      })

      it('should not add duplicate permission', () => {
        const user = { id: '123', permissions: ['read'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        authUtils.addPermission('read')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({
          id: '123',
          permissions: ['read']
        }))
      })
    })

    describe('removePermission', () => {
      it('should remove permission from user', () => {
        const user = { id: '123', permissions: ['read', 'write'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        authUtils.removePermission('write')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({
          id: '123',
          permissions: ['read']
        }))
      })
    })
  })

  describe('Role Management', () => {
    describe('hasRole', () => {
      it('should return true if user has role', () => {
        const user = { id: '123', roles: ['admin', 'user'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasRole('admin')
        
        expect(result).toBe(true)
      })

      it('should return false if user does not have role', () => {
        const user = { id: '123', roles: ['user'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasRole('admin')
        
        expect(result).toBe(false)
      })
    })

    describe('hasAnyRole', () => {
      it('should return true if user has any of the specified roles', () => {
        const user = { id: '123', roles: ['admin', 'user'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAnyRole(['admin', 'superadmin'])
        
        expect(result).toBe(true)
      })

      it('should return false if user has none of the specified roles', () => {
        const user = { id: '123', roles: ['user'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.hasAnyRole(['admin', 'superadmin'])
        
        expect(result).toBe(false)
      })
    })

    describe('getRoles', () => {
      it('should get user roles', () => {
        const user = { id: '123', roles: ['admin', 'user'] }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user))
        
        const result = authUtils.getRoles()
        
        expect(result).toEqual(['admin', 'user'])
      })

      it('should return empty array if no user or roles', () => {
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: '123' }))
        
        const result = authUtils.getRoles()
        
        expect(result).toEqual([])
      })
    })
  })

  describe('Redirection', () => {
    describe('login', () => {
      it('should redirect to login page', () => {
        authUtils.login('/login')
        
        expect(window.location.href).toBe('/login')
      })

      it('should use default login path if not provided', () => {
        authUtils.login()
        
        expect(window.location.href).toBe('/login')
      })
    })

    describe('logout', () => {
      it('should clear auth and redirect to login', () => {
        authUtils.logout('/login')
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user')
        expect(window.location.href).toBe('/login')
      })
    })

    describe('redirectToLogin', () => {
      it('should redirect to login with return URL', () => {
        authUtils.redirectToLogin('/dashboard')
        
        expect(window.location.href).toContain('/login')
        expect(window.location.href).toContain('returnUrl')
      })
    })
  })
})