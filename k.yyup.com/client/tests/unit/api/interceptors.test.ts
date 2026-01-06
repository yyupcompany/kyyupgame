import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import service from '@/api/interceptors'

// Mock external dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

vi.mock('../config/environment', () => ({
  environmentConfig: {
    apiBaseUrl: 'https://api.example.com',
    apiTimeout: 10000
  }
}))

describe('API Interceptors', () => {
  let mockLocalStorage: Storage

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    } as Storage
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Axios Instance Configuration', () => {
    it('should create axios instance with correct configuration', () => {
      expect(service.defaults.baseURL).toBe('https://api.example.com')
      expect(service.defaults.timeout).toBe(10000)
    })

    it('should update global axios defaults', () => {
      expect(axios.defaults.baseURL).toBe('https://api.example.com')
      expect(axios.defaults.timeout).toBe(10000)
    })
  })

  describe('Request Interceptor', () => {
    let mockConfig: InternalAxiosRequestConfig

    beforeEach(() => {
      mockConfig = {
        url: '/api/test',
        method: 'GET',
        headers: {} as any
      }
    })

    it('should add Authorization header with kindergarten_token', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'test-token-123'
        return null
      })

      const result = await service.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBe('Bearer test-token-123')
      expect(console.log).toHaveBeenCalledWith(
        '✅ 设置认证头:',
        '/api/test',
        'token:',
        'test-token-123...'
      )
    })

    it('should add Authorization header with token', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token-456'
        return null
      })

      const result = await service.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBe('Bearer test-token-456')
    })

    it('should add Authorization header with auth_token', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'test-token-789'
        return null
      })

      const result = await service.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBe('Bearer test-token-789')
    })

    it('should prioritize kindergarten_token over other tokens', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        switch (key) {
          case 'kindergarten_token': return 'kindergarten-token'
          case 'token': return 'regular-token'
          case 'auth_token': return 'auth-token'
          default: return null
        }
      })

      const result = await service.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBe('Bearer kindergarten-token')
    })

    it('should handle missing token gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const result = await service.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBeUndefined()
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ 没有找到认证token，请求可能会失败:',
        '/api/test'
      )
    })

    it('should handle headers object initialization', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      
      const configWithoutHeaders: InternalAxiosRequestConfig = {
        url: '/api/test',
        method: 'GET'
      }

      const result = await service.interceptors.request.handlers[0].fulfilled(configWithoutHeaders)

      expect(result?.headers).toBeDefined()
      expect(result?.headers?.Authorization).toBe('Bearer test-token')
    })

    it('should handle request interceptor error', async () => {
      const error = new Error('Request interceptor error')
      
      await expect(
        service.interceptors.request.handlers[0].rejected(error as any)
      ).rejects.toThrow('Request interceptor error')
      
      expect(console.error).toHaveBeenCalledWith('请求错误:', error)
    })
  })

  describe('Response Interceptor', () => {
    let mockSuccessResponse: AxiosResponse
    let mockErrorResponse: AxiosError

    beforeEach(() => {
      mockSuccessResponse = {
        data: { success: true, data: 'test' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockErrorResponse = {
        response: {
          data: { message: 'Error message' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError
    })

    it('should pass through successful responses', async () => {
      const result = await service.interceptors.response.handlers[0].fulfilled(mockSuccessResponse)
      expect(result).toBe(mockSuccessResponse)
    })

    it('should handle 400 Bad Request error', async () => {
      mockErrorResponse.response!.status = 400
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('请求参数错误')
    })

    it('should handle 401 Unauthorized error', async () => {
      mockErrorResponse.response!.status = 401
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('should handle 403 Forbidden error', async () => {
      mockErrorResponse.response!.status = 403
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('没有权限访问该资源')
    })

    it('should handle 404 Not Found error', async () => {
      mockErrorResponse.response!.status = 404
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在')
    })

    it('should handle 500 Internal Server Error', async () => {
      mockErrorResponse.response!.status = 500
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误')
    })

    it('should handle unknown status codes', async () => {
      mockErrorResponse.response!.status = 418
      mockErrorResponse.message = 'I\'m a teapot'
      
      await expect(
        service.interceptors.response.handlers[0].rejected(mockErrorResponse)
      ).rejects.toThrow(mockErrorResponse)

      expect(ElMessage.error).toHaveBeenCalledWith('请求失败: I\'m a teapot')
    })

    it('should handle network errors (no response)', async () => {
      const networkError: AxiosError = {
        request: {},
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        service.interceptors.response.handlers[0].rejected(networkError)
      ).rejects.toThrow(networkError)

      expect(ElMessage.error).toHaveBeenCalledWith('服务器无响应，请检查网络连接')
    })

    it('should handle request configuration errors', async () => {
      const configError: AxiosError = {
        message: 'Request configuration error',
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        service.interceptors.response.handlers[0].rejected(configError)
      ).rejects.toThrow(configError)

      expect(ElMessage.error).toHaveBeenCalledWith('请求错误: Request configuration error')
    })
  })

  describe('Global Axios Interceptors', () => {
    let mockConfig: InternalAxiosRequestConfig

    beforeEach(() => {
      mockConfig = {
        url: '/api/global-test',
        method: 'POST',
        headers: {} as any
      }
    })

    it('should add Authorization header to global axios requests', async () => {
      mockLocalStorage.getItem.mockReturnValue('global-token')

      const result = await axios.interceptors.request.handlers[0].fulfilled(mockConfig)

      expect(result?.headers?.Authorization).toBe('Bearer global-token')
      expect(console.log).toHaveBeenCalledWith(
        '✅ 全局拦截器设置认证头:',
        '/api/global-test',
        'token:',
        'global-token...'
      )
    })

    it('should handle 401 error in global response interceptor', async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        axios.interceptors.response.handlers[0].rejected(error)
      ).rejects.toThrow(error)

      expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('should handle 403 error in global response interceptor', async () => {
      const error: AxiosError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        axios.interceptors.response.handlers[0].rejected(error)
      ).rejects.toThrow(error)

      expect(ElMessage.error).toHaveBeenCalledWith('没有权限访问该资源')
    })

    it('should pass through other errors in global response interceptor', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: { message: 'Server Error' },
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        axios.interceptors.response.handlers[0].rejected(error)
      ).rejects.toThrow(error)

      // Should not show message for 500 errors in global interceptor
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty token string', async () => {
      mockLocalStorage.getItem.mockReturnValue('')

      const config: InternalAxiosRequestConfig = {
        url: '/api/test',
        method: 'GET',
        headers: {} as any
      }

      const result = await service.interceptors.request.handlers[0].fulfilled(config)

      expect(result?.headers?.Authorization).toBe('Bearer ')
      expect(console.log).toHaveBeenCalledWith(
        '✅ 设置认证头:',
        '/api/test',
        'token:',
        '...'
      )
    })

    it('should handle very long token string', async () => {
      const longToken = 'a'.repeat(1000)
      mockLocalStorage.getItem.mockReturnValue(longToken)

      const config: InternalAxiosRequestConfig = {
        url: '/api/test',
        method: 'GET',
        headers: {} as any
      }

      const result = await service.interceptors.request.handlers[0].fulfilled(config)

      expect(result?.headers?.Authorization).toBe(`Bearer ${longToken}`)
      expect(console.log).toHaveBeenCalledWith(
        '✅ 设置认证头:',
        '/api/test',
        'token:',
        'aaa...'
      )
    })

    it('should handle response without error message', async () => {
      const error: AxiosError = {
        response: {
          status: 400,
          data: {},
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        service.interceptors.response.handlers[0].rejected(error)
      ).rejects.toThrow(error)

      expect(ElMessage.error).toHaveBeenCalledWith('请求参数错误')
    })

    it('should handle error response with string data', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: 'Internal Server Error',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      await expect(
        service.interceptors.response.handlers[0].rejected(error)
      ).rejects.toThrow(error)

      expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误')
    })
  })

  describe('Integration Tests', () => {
    it('should work with actual axios request', async () => {
      // Mock a successful response
      const mockResponse = { data: { success: true, result: 'test' } }
      vi.spyOn(axios, 'request').mockResolvedValue(mockResponse)

      mockLocalStorage.getItem.mockReturnValue('test-token')

      const response = await service.get('/api/test')

      expect(response).toEqual(mockResponse)
      expect(axios.request).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    })

    it('should handle authentication flow for 401 errors', async () => {
      // Mock a 401 response
      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      vi.spyOn(axios, 'request').mockRejectedValue(error)
      mockLocalStorage.getItem.mockReturnValue('expired-token')

      await expect(service.get('/api/protected')).rejects.toThrow(error)

      // Verify authentication cleanup
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(router.push).toHaveBeenCalledWith('/login')
      expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录')
    })
  })

  describe('Security Considerations', () => {
    it('should not log sensitive token information in full', async () => {
      const sensitiveToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      mockLocalStorage.getItem.mockReturnValue(sensitiveToken)

      const config: InternalAxiosRequestConfig = {
        url: '/api/test',
        method: 'GET',
        headers: {} as any
      }

      await service.interceptors.request.handlers[0].fulfilled(config)

      // Verify that only the first 20 characters are logged
      expect(console.log).toHaveBeenCalledWith(
        '✅ 设置认证头:',
        '/api/test',
        'token:',
        'eyJhbGciOiJIUzI1NiIsIn...'
      )

      // But the full token is still set in the header
      expect(config.headers?.Authorization).toBe(`Bearer ${sensitiveToken}`)
    })

    it('should handle multiple token removal calls safely', async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError

      // Simulate multiple 401 errors
      await service.interceptors.response.handlers[0].rejected(error)
      await service.interceptors.response.handlers[0].rejected(error)

      // Verify that removeItem was called for each error
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(6) // 3 tokens × 2 errors
    })
  })
})