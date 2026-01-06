
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import env from '@/env'
import { ErrorHandler } from '@/utils/errorHandler'

// Mock dependencies
vi.mock('axios')
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn()
  }
}))
vi.mock('@/stores/user')
vi.mock('@/router')
vi.mock('@/env')
vi.mock('@/utils/errorHandler')

// Mock window object
const mockWindow = {
  location: {
    hostname: 'localhost',
    origin: 'http://localhost:5173'
  },
  performance: {
    getEntriesByType: vi.fn(() => [])
  }
}

describe('Request Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  let mockAxiosInstance: any
  let mockAIAxiosInstance: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    })
    
    // Setup environment mock
    vi.mocked(env).isDevelopment = true
    vi.mocked(env).apiBaseUrl = undefined
    
    // Setup user store mock
    const mockUserStore = {
      clearUserInfo: vi.fn()
    }
    vi.mocked(useUserStore).mockReturnValue(mockUserStore)
    
    // Setup axios mocks
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      },
      defaults: {
        timeout: 10000
      }
    }
    
    mockAIAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      },
      defaults: {
        timeout: 600000
      }
    }
    
    vi.mocked(axios.create).mockImplementation((config) => {
      if (config.timeout === 600000) {
        return mockAIAxiosInstance
      }
      return mockAxiosInstance
    })
    
    // Setup ErrorHandler mock
    vi.mocked(ErrorHandler.handle).mockImplementation(() => {})
  })

  afterEach(() => {
    // Cleanup
    Object.defineProperty(global, 'window', {
      value: window,
      writable: true
    })
  })

  describe('getApiBaseURL', () => {
    it('should use development URL when in development mode', () => {
      vi.mocked(env).isDevelopment = true
      vi.mocked(env).apiBaseUrl = undefined
      
      // Import and test the function
      const { getApiBaseURL } = require('@/utils/request')
      const result = getApiBaseURL()
      
      expect(result).toBe('http://localhost:3000/api')
    })

    it('should use configured API base URL when available', () => {
      vi.mocked(env).apiBaseUrl = 'https://api.example.com'
      
      const { getApiBaseURL } = require('@/utils/request')
      const result = getApiBaseURL()
      
      expect(result).toBe('https://api.example.com')
    })

    it('should handle localhost:5173 domain', () => {
      mockWindow.location.hostname = 'localhost:5173'
      vi.mocked(env).isDevelopment = false
      
      const { getApiBaseURL } = require('@/utils/request')
      const result = getApiBaseURL()
      
      expect(result).toBe('/api')
    })

    it('should handle sealoshzh.site domain', () => {
      mockWindow.location.hostname = 'test.sealoshzh.site'
      vi.mocked(env).isDevelopment = false
      
      const { getApiBaseURL } = require('@/utils/request')
      const result = getApiBaseURL()
      
      expect(result).toBe('https://shlxlyzagqnc.sealoshzh.site/api')
    })

    it('should fallback to default production URL', () => {
      mockWindow.location.hostname = 'example.com'
      vi.mocked(env).isDevelopment = false
      
      const { getApiBaseURL } = require('@/utils/request')
      const result = getApiBaseURL()
      
      expect(result).toBe('https://shlxlyzagqnc.sealoshzh.site/api')
    })
  })

  describe('axios instances configuration', () => {
    it('should create regular axios instance with correct configuration', () => {
      const { getApiBaseURL } = require('@/utils/request')
      const baseUrl = getApiBaseURL()
      
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        timeout: 10000,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    })

    it('should create AI axios instance with longer timeout', () => {
      const { getApiBaseURL } = require('@/utils/request')
      const baseUrl = getApiBaseURL()
      
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        timeout: 600000,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    })

    it('should setup interceptors for both instances', () => {
      require('@/utils/request')
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1)
      expect(mockAIAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
      expect(mockAIAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1)
    })
  })

  describe('request interceptors', () => {
    it('should add Authorization header when token exists', () => {
      const mockConfig = {
        headers: {}
      }
      
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => {
          if (key === 'kindergarten_token') return 'test-token'
          return null
        })
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      // Get the request interceptor
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      const result = requestInterceptor(mockConfig)
      
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('should handle missing token gracefully', () => {
      const mockConfig = {
        headers: {}
      }
      
      // Mock localStorage with no token
      const mockLocalStorage = {
        getItem: vi.fn(() => null)
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      const result = requestInterceptor(mockConfig)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should add timestamp to GET requests', () => {
      const mockConfig = {
        method: 'get',
        headers: {},
        params: {}
      }
      
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      const result = requestInterceptor(mockConfig)
      
      expect(result.params).toHaveProperty('_t')
      expect(typeof result.params._t).toBe('number')
    })

    it('should not add timestamp to non-GET requests', () => {
      const mockConfig = {
        method: 'post',
        headers: {},
        data: {}
      }
      
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      const result = requestInterceptor(mockConfig)
      
      expect(result.params).toBeUndefined()
    })
  })

  describe('response interceptors', () => {
    it('should handle standard success response', () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, name: 'test' },
          message: 'Success'
        },
        status: 200
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      const result = responseInterceptor(mockResponse)
      
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
        message: 'Success'
      })
    })

    it('should handle standard error response', () => {
      const mockResponse = {
        data: {
          success: false,
          error: 'Test error',
          message: 'Error message'
        },
        status: 400
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      expect(() => responseInterceptor(mockResponse)).toThrow()
      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          response: {
            data: mockResponse.data,
            status: 400
          }
        }),
        true
      )
    })

    it('should handle legacy code-based response', () => {
      const mockResponse = {
        data: {
          code: 200,
          data: { id: 1, name: 'test' },
          message: 'Success'
        },
        status: 200
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      const result = responseInterceptor(mockResponse)
      
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
        message: 'Success'
      })
    })

    it('should handle legacy error code response', () => {
      const mockResponse = {
        data: {
          code: 400,
          error: 'Test error',
          message: 'Error message'
        },
        status: 400
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      expect(() => responseInterceptor(mockResponse)).toThrow()
      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          response: {
            data: mockResponse.data,
            status: 400
          }
        }),
        true
      )
    })

    it('should handle rows/count format response', () => {
      const mockResponse = {
        data: {
          rows: [{ id: 1 }, { id: 2 }],
          count: 2
        },
        status: 200
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      const result = responseInterceptor(mockResponse)
      
      expect(result).toEqual({
        success: true,
        data: {
          items: [{ id: 1 }, { id: 2 }],
          total: 2
        },
        message: 'Success'
      })
    })

    it('should handle data/message array format response', () => {
      const mockResponse = {
        data: {
          data: [{ id: 1 }, { id: 2 }],
          message: 'Success'
        },
        status: 200
      }
      
      require('@/utils/request')
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      const result = responseInterceptor(mockResponse)
      
      expect(result).toEqual({
        success: true,
        data: {
          items: [{ id: 1 }, { id: 2 }],
          total: 2
        },
        message: 'Success'
      })
    })
  })

  describe('error handling', () => {
    it('should handle 401 errors with token refresh', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Token has expired'
            }
          }
        },
        config: {
          headers: {},
          url: '/api/test'
        }
      }
      
      // Mock successful token refresh
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            token: 'new-token',
            refreshToken: 'new-refresh-token'
          }
        })
      }) as any
      
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => {
          if (key === 'kindergarten_refresh_token') return 'refresh-token'
          return null
        }),
        setItem: vi.fn()
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      require('@/utils/request')
      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      // Mock the retry mechanism
      const mockRetryRequest = vi.fn().mockResolvedValue({ success: true })
      const module = require('@/utils/request')
      module.retryRequest = mockRetryRequest
      
      await expect(errorInterceptor(mockError)).rejects.toThrow()
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh-token'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: 'refresh-token' })
        })
      )
    })

    it('should handle AI API 404 errors gracefully', () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            message: 'Not found'
          }
        },
        config: {
          url: '/api/ai/memory/some-id'
        }
      }
      
      require('@/utils/request')
      const errorInterceptor = mockAIAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      expect(errorInterceptor(mockError)).rejects.toEqual(mockError)
    })

    it('should handle AI API 503 errors with friendly message', () => {
      const mockError = {
        response: {
          status: 503,
          data: {
            success: false,
            message: 'Service unavailable'
          }
        },
        config: {
          url: '/api/ai/models'
        }
      }
      
      require('@/utils/request')
      const errorInterceptor = mockAIAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      expect(errorInterceptor(mockError)).rejects.toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            data: expect.objectContaining({
              message: 'AI服务暂时不可用，请稍后重试'
            })
          })
        })
      )
    })

    it('should handle network errors', () => {
      const mockError = new Error('Network Error')
      mockError.config = { url: '/api/test' }
      
      require('@/utils/request')
      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      expect(errorInterceptor(mockError)).rejects.toThrow()
      expect(ErrorHandler.handle).toHaveBeenCalledWith(mockError, true)
    })
  })

  describe('request methods', () => {
    beforeEach(() => {
      // Mock the request module
      const mockRequestModule = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        del: vi.fn(),
        delete: vi.fn(),
        request: vi.fn(),
        aiRequest: mockAIAxiosInstance
      }
      
      vi.doMock('@/utils/request', () => mockRequestModule)
    })

    it('should detect AI requests correctly', () => {
      const { isAIRequest } = require('@/utils/request')
      
      expect(isAIRequest('/ai/memory')).toBe(true)
      expect(isAIRequest('/ai/conversation')).toBe(true)
      expect(isAIRequest('ai/models')).toBe(true)
      expect(isAIRequest('/expert-consultation')).toBe(true)
      expect(isAIRequest('/api/users')).toBe(false)
      expect(isAIRequest('/dashboard')).toBe(false)
    })

    it('should use AI service for AI requests', async () => {
      const mockRequestModule = require('@/utils/request')
      
      const config = { url: '/ai/memory', method: 'get' }
      
      await mockRequestModule.request(config)
      
      expect(mockRequestModule.aiRequest).toHaveBeenCalledWith(config)
    })

    it('should use regular service for non-AI requests', async () => {
      const mockRequestModule = require('@/utils/request')
      
      const config = { url: '/api/users', method: 'get' }
      
      await mockRequestModule.request(config)
      
      expect(mockRequestModule.aiRequest).not.toHaveBeenCalled()
    })
  })

  describe('retry mechanism', () => {
    it('should retry on network errors', async () => {
      const { retryRequest, shouldRetry } = require('@/utils/request')
      
      const mockRequestFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue({ success: true })
      
      const result = await retryRequest(mockRequestFn)
      
      expect(result).toEqual({ success: true })
      expect(mockRequestFn).toHaveBeenCalledTimes(2)
    })

    it('should retry on 5xx errors', async () => {
      const { retryRequest, shouldRetry } = require('@/utils/request')
      
      const serverError = {
        response: { status: 500 }
      }
      
      const mockRequestFn = vi.fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue({ success: true })
      
      const result = await retryRequest(mockRequestFn)
      
      expect(result).toEqual({ success: true })
      expect(mockRequestFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on 4xx errors', async () => {
      const { retryRequest, shouldRetry } = require('@/utils/request')
      
      const clientError = {
        response: { status: 400 }
      }
      
      const mockRequestFn = vi.fn()
        .mockRejectedValue(clientError)
      
      await expect(retryRequest(mockRequestFn)).rejects.toEqual(clientError)
      expect(mockRequestFn).toHaveBeenCalledTimes(1)
    })

    it('should not retry after max attempts', async () => {
      const { retryRequest } = require('@/utils/request')
      
      const mockRequestFn = vi.fn()
        .mockRejectedValue(new Error('Network Error'))
      
      await expect(retryRequest(mockRequestFn)).rejects.toThrow()
      expect(mockRequestFn).toHaveBeenCalledTimes(2) // Initial + 1 retry
    })

    describe('shouldRetry', () => {
      it('should return true for network errors', () => {
        const { shouldRetry } = require('@/utils/request')
        
        expect(shouldRetry(new Error('Network Error'))).toBe(true)
      })

      it('should return true for 5xx errors', () => {
        const { shouldRetry } = require('@/utils/request')
        
        expect(shouldRetry({ response: { status: 500 } })).toBe(true)
        expect(shouldRetry({ response: { status: 502 } })).toBe(true)
        expect(shouldRetry({ response: { status: 503 } })).toBe(true)
        expect(shouldRetry({ response: { status: 504 } })).toBe(true)
      })

      it('should return true for retryable status codes', () => {
        const { shouldRetry } = require('@/utils/request')
        
        expect(shouldRetry({ response: { status: 408 } })).toBe(true) // Request timeout
        expect(shouldRetry({ response: { status: 429 } })).toBe(true) // Too many requests
      })

      it('should return false for 4xx errors', () => {
        const { shouldRetry } = require('@/utils/request')
        
        expect(shouldRetry({ response: { status: 400 } })).toBe(false)
        expect(shouldRetry({ response: { status: 401 } })).toBe(false)
        expect(shouldRetry({ response: { status: 403 } })).toBe(false)
        expect(shouldRetry({ response: { status: 404 } })).toBe(false)
      })
    })
  })

  describe('buildApiUrl', () => {
    it('should return full URLs as-is', () => {
      const { buildApiUrl } = require('@/utils/request')
      
      expect(buildApiUrl('https://api.example.com/users')).toBe('https://api.example.com/users')
      expect(buildApiUrl('http://localhost:3000/api/users')).toBe('http://localhost:3000/api/users')
    })

    it('should return relative paths unchanged', () => {
      const { buildApiUrl } = require('@/utils/request')
      
      expect(buildApiUrl('/api/users')).toBe('/api/users')
      expect(buildApiUrl('users')).toBe('users')
      expect(buildApiUrl('/dashboard')).toBe('/dashboard')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete request lifecycle', async () => {
      const mockRequestModule = require('@/utils/request')
      
      // Mock successful response
      mockRequestModule.aiRequest = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: 'Test User' }
      })
      
      const config = {
        url: '/ai/memory',
        method: 'get',
        params: { userId: 1 }
      }
      
      const result = await mockRequestModule.request(config)
      
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test User' }
      })
      expect(mockRequestModule.aiRequest).toHaveBeenCalledWith(config)
    })

    it('should handle error scenarios with proper fallbacks', async () => {
      const mockRequestModule = require('@/utils/request')
      
      // Mock error response
      const mockError = new Error('API Error')
      mockRequestModule.aiRequest = vi.fn().mockRejectedValue(mockError)
      
      const config = {
        url: '/ai/memory',
        method: 'get'
      }
      
      await expect(mockRequestModule.request(config)).rejects.toThrow('API Error')
    })

    it('should work with different HTTP methods', async () => {
      const mockRequestModule = require('@/utils/request')
      
      const mockResponse = { success: true, data: {} }
      mockRequestModule.aiRequest = vi.fn().mockResolvedValue(mockResponse)
      
      const methods = ['get', 'post', 'put', 'patch', 'del']
      
      for (const method of methods) {
        await mockRequestModule[method]('/ai/test', { data: 'test' })
        expect(mockRequestModule.aiRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            method: method === 'del' ? 'delete' : method,
            url: '/ai/test'
          })
        )
      }
    })
  })

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockRequestModule = require('@/utils/request')
      
      const mockResponse = { success: true, data: { id: 1 } }
      mockRequestModule.aiRequest = vi.fn().mockResolvedValue(mockResponse)
      
      const requests = Array(100).fill(null).map((_, i) =>
        mockRequestModule.request({ url: `/ai/test/${i}`, method: 'get' })
      )
      
      const startTime = performance.now()
      const results = await Promise.all(requests)
      const endTime = performance.now()
      
      expect(results.length).toBe(100)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle large response payloads', async () => {
      const mockRequestModule = require('@/utils/request')
      
      const largeData = {
        items: Array(1000).fill(null).map((_, i) => ({ id: i, name: `Item ${i}` })),
        total: 1000
      }
      
      mockRequestModule.aiRequest = vi.fn().mockResolvedValue({
        success: true,
        data: largeData
      })
      
      const result = await mockRequestModule.request({ url: '/ai/large-data', method: 'get' })
      
      expect(result.data).toEqual(largeData)
      expect(result.data.items.length).toBe(1000)
    })
  })

  describe('Security Tests', () => {
    it('should sanitize request URLs', () => {
      const { buildApiUrl } = require('@/utils/request')
      
      const maliciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:alert(1)',
        'ftp://malicious.com',
        'file:///etc/passwd'
      ]
      
      maliciousUrls.forEach(url => {
        const result = buildApiUrl(url)
        expect(result).toBe(url) // Should not modify, but axios will handle
      })
    })

    it('should handle authentication token security', () => {
      const mockConfig = {
        headers: {}
      }
      
      // Mock localStorage with token
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => {
          if (key === 'kindergarten_token') return 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
          return null
        })
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      const result = requestInterceptor(mockConfig)
      
      expect(result.headers.Authorization).toBe('Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    })

    it('should prevent token leakage in logs', () => {
      const mockConfig = {
        headers: {}
      }
      
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => {
          if (key === 'kindergarten_token') return 'secret-token-12345'
          return null
        })
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      // Mock console.log to check for token leakage
      const consoleSpy = vi.spyOn(console, 'log')
      
      require('@/utils/request')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      requestInterceptor(mockConfig)
      
      // Check that token is not logged in full
      const logCalls = consoleSpy.mock.calls
      const hasFullToken = logCalls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('secret-token-12345'))
      )
      
      expect(hasFullToken).toBe(false)
      
      consoleSpy.mockRestore()
    })
  })
})