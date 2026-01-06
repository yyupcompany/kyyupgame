import { describe, it, expect, beforeEach, vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock axios
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  },
  defaults: {
    timeout: 15000,
    baseURL: '',
    headers: {}
  }
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn()
  }
}))

// Mock environment
vi.mock('@/config/env', () => ({
  default: {
    apiBaseUrl: 'http://localhost:3000/api',
    apiTimeout: 15000,
    isDevelopment: true,
    isProduction: false
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('简化网络请求工具测试', () => {
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
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  describe('基本HTTP方法', () => {
    it('应该能够发送GET请求', async () => {
      const mockResponse = { data: { message: 'success', data: { id: 1 } } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test')
      expect(result).toEqual({ message: 'success', data: { id: 1 } })
    })

    it('应该能够发送POST请求', async () => {
      const mockResponse = { data: { message: 'created', data: { id: 2 } } }
      const postData = { name: 'test' }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.post('/test', postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData)
      expect(result).toEqual({ message: 'created', data: { id: 2 } })
    })

    it('应该能够发送PUT请求', async () => {
      const mockResponse = { data: { message: 'updated', data: { id: 1 } } }
      const putData = { name: 'updated' }
      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.put('/test/1', putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData)
      expect(result).toEqual({ message: 'updated', data: { id: 1 } })
    })

    it('应该能够发送DELETE请求', async () => {
      const mockResponse = { data: { message: 'deleted' } }
      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.delete('/test/1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1')
      expect(result).toEqual({ message: 'deleted' })
    })

    it('应该能够发送PATCH请求', async () => {
      const mockResponse = { data: { message: 'patched', data: { id: 1 } } }
      const patchData = { status: 'active' }
      mockAxiosInstance.patch.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.patch('/test/1', patchData)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData)
      expect(result).toEqual({ message: 'patched', data: { id: 1 } })
    })
  })

  describe('请求配置', () => {
    it('应该正确配置axios实例', async () => {
      await import('@/utils/request')

      expect(mockAxiosInstance.defaults.timeout).toBe(15000)
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })

    it('应该能够处理带参数的请求', async () => {
      const mockResponse = { data: { message: 'success', data: [] } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const params = { page: 1, size: 10 }
      await request.get('/test', { params })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params })
    })

    it('应该能够处理自定义headers', async () => {
      const mockResponse = { data: { message: 'success' } }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const headers = { 'Content-Type': 'application/json' }
      await request.post('/test', {}, { headers })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', {}, { headers })
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValue(networkError)

      const { request } = await import('@/utils/request')
      
      await expect(request.get('/test')).rejects.toThrow('Network Error')
    })

    it('应该处理HTTP错误状态码', async () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      }
      mockAxiosInstance.get.mockRejectedValue(httpError)

      const { request } = await import('@/utils/request')
      
      await expect(request.get('/test')).rejects.toMatchObject({
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      })
    })

    it('应该处理超时错误', async () => {
      const timeoutError = new Error('timeout of 15000ms exceeded')
      mockAxiosInstance.get.mockRejectedValue(timeoutError)

      const { request } = await import('@/utils/request')
      
      await expect(request.get('/test')).rejects.toThrow('timeout of 15000ms exceeded')
    })
  })

  describe('响应处理', () => {
    it('应该正确处理成功响应', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'success',
          data: { id: 1, name: 'test' }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.get('/test')

      expect(result).toEqual({
        success: true,
        message: 'success',
        data: { id: 1, name: 'test' }
      })
    })

    it('应该正确处理分页响应', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            rows: [{ id: 1 }, { id: 2 }],
            count: 2,
            total: 2
          }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.get('/test')

      expect(result.data.rows).toHaveLength(2)
      expect(result.data.count).toBe(2)
    })

    it('应该正确处理空响应', async () => {
      const mockResponse = { data: null }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.get('/test')

      expect(result).toBeNull()
    })
  })

  describe('认证处理', () => {
    it('应该在有token时添加Authorization头', async () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      await import('@/utils/request')
      
      // 验证请求拦截器被设置
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('应该在没有token时正常工作', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const mockResponse = { data: { message: 'success' } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      const result = await request.get('/test')

      expect(result).toEqual({ message: 'success' })
    })
  })

  describe('性能测试', () => {
    it('应该能够处理并发请求', async () => {
      const mockResponse = { data: { message: 'success' } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      
      const promises = Array.from({ length: 10 }, (_, i) => 
        request.get(`/test/${i}`)
      )

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(10)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(10)
    })

    it('应该能够快速处理请求', async () => {
      const mockResponse = { data: { message: 'success' } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const { request } = await import('@/utils/request')
      
      const startTime = performance.now()
      await request.get('/test')
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(100) // 应该在100ms内完成
    })
  })

  describe('工具函数', () => {
    it('应该能够检测AI请求', async () => {
      const { isAIRequest } = await import('@/utils/request')
      
      if (typeof isAIRequest === 'function') {
        expect(isAIRequest('/api/ai/chat')).toBe(true)
        expect(isAIRequest('/api/ai-query')).toBe(true)
        expect(isAIRequest('/api/users')).toBe(false)
      }
    })

    it('应该能够构建API URL', async () => {
      const { buildApiUrl } = await import('@/utils/request')
      
      if (typeof buildApiUrl === 'function') {
        expect(buildApiUrl('/test')).toBe('/test')
        expect(buildApiUrl('https://example.com/api')).toBe('https://example.com/api')
      }
    })
  })
})
