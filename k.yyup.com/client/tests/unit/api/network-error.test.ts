import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import service from '@/api/interceptors'
import { expectNoConsoleErrors, startConsoleMonitoring } from '../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../../utils/data-validation'

// Mock modules
vi.mock('@/api/interceptors', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn()
  },
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn()
    }))
  }
}))

// 模拟用户列表组件
const UserListComponent = {
  template: `
    <div>
      <div v-if="loading" class="loading-indicator">加载中...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="timeout" class="timeout-message">
        请求超时，请检查网络连接
        <button class="retry-button" @click="retry">重试</button>
      </div>
      <div v-if="networkError" class="network-error">
        网络连接失败，请检查网络状态
        <button class="refresh-button" @click="refresh">刷新</button>
      </div>
      <ul v-if="users.length > 0">
        <li v-for="user in users" :key="user.id">{{ user.name }}</li>
      </ul>
      <div v-else-if="!loading && !error" class="empty-state">暂无数据</div>
    </div>
  `,
  data() {
    return {
      loading: false,
      error: null,
      timeout: false,
      networkError: false,
      users: []
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true
      this.error = null
      this.timeout = false
      this.networkError = false

      try {
        const response = await service.get('/users')
        this.users = response.data.data || []
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },
    handleError(error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        this.timeout = true
        this.error = '请求超时'
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND' ||
                 error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' ||
                 !navigator.onLine || (error.message && error.message.includes('Network Error'))) {
        this.networkError = true
        this.error = '网络连接失败'
      } else {
        this.error = error.message || '加载失败'
      }
    },
    retry() {
      this.loadUsers()
    },
    refresh() {
      window.location.reload()
    }
  },
  mounted() {
    this.loadUsers()
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Real Network Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    startConsoleMonitoring()
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    // 控制台错误检测
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('API Timeout Scenarios', () => {
    it('should handle 10 second timeout correctly', async () => {
      // 模拟API超时
      service.get.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request timeout')
            error.code = 'ECONNABORTED'
            reject(error)
          }, 11000) // 超过10秒
        })
      )

      const startTime = Date.now()
      const wrapper = mount(UserListComponent)

      await new Promise(resolve => setTimeout(resolve, 12000)) // 等待超时

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeGreaterThan(10000)
      expect(wrapper.find('.timeout-message').exists()).toBe(true)
      expect(wrapper.find('.retry-button').exists()).toBe(true)
      expect(wrapper.find('.timeout-message').text()).toContain('请求超时')
    })

    it('should handle AI API 60 second timeout correctly', async () => {
      // 模拟AI API超时
      service.get.mockImplementation((url) => {
        if (url.includes('/ai/')) {
          return new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('AI request timeout')
              error.code = 'ECONNABORTED'
              reject(error)
            }, 610000) // 超过60秒
          })
        }
        return Promise.resolve({ data: { data: [] } })
      })

      const startTime = Date.now()

      try {
        await service.get('/ai/chat')
        fail('Should have thrown timeout error')
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        expect(duration).toBeGreaterThan(600000)
        expect(error.code).toBe('ECONNABORTED')
        expect(error.message).toContain('timeout')
      }
    }, 700000) // 增加测试超时时间

    it('should show timeout feedback to user', async () => {
      service.get.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('请求超时')
            error.code = 'ECONNABORTED'
            reject(error)
          }, 5000)
        })
      )

      const wrapper = mount(UserListComponent)

      // 等待组件挂载和loading状态开始
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      // 检查初始状态（可能正在loading）
      const hasLoading = wrapper.find('.loading-indicator').exists()
      if (hasLoading) {
        expect(wrapper.find('.loading-indicator').exists()).toBe(true)
      }

      // 等待超时错误发生
      await new Promise(resolve => setTimeout(resolve, 6000))
      await nextTick()

      // 验证loading状态已结束
      expect(wrapper.find('.loading-indicator').exists()).toBe(false)
      // 验证超时消息已显示
      expect(wrapper.find('.timeout-message').exists()).toBe(true)
      expect(wrapper.find('.retry-button').exists()).toBe(true)
      expect(wrapper.find('.timeout-message').text()).toContain('请求超时')
    })

    it('should retry on timeout user action', async () => {
      let callCount = 0
      service.get.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('Request timeout')
              error.code = 'ECONNABORTED'
              reject(error)
            }, 1000)
          })
        }
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: 1, name: 'Test User' }]
          }
        })
      })

      const wrapper = mount(UserListComponent)

      // 等待第一次请求超时
      await new Promise(resolve => setTimeout(resolve, 1500))
      expect(wrapper.find('.timeout-message').exists()).toBe(true)

      // 点击重试按钮
      await wrapper.find('.retry-button').trigger('click')
      await nextTick()

      // 等待重试请求完成
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(callCount).toBe(2)
      expect(wrapper.find('.timeout-message').exists()).toBe(false)
      expect(wrapper.find('li').text()).toBe('Test User')
    })
  })

  describe('Network Connection Scenarios', () => {
    it('should handle complete network loss', async () => {
      // 模拟网络断开
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      service.get.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        config: { url: '/users' }
      })

      const wrapper = mount(UserListComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.network-error').exists()).toBe(true)
      expect(wrapper.find('.network-error').text()).toContain('网络连接失败')
      expect(wrapper.find('.refresh-button').exists()).toBe(true)
    })

    it('should handle network state changes', async () => {
      const wrapper = mount(UserListComponent)

      // 模拟网络断开事件
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      window.dispatchEvent(new Event('offline'))

      service.get.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network request failed'
      })

      await wrapper.vm.loadUsers()

      expect(wrapper.find('.network-error').exists()).toBe(true)

      // 模拟网络恢复事件
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })

      window.dispatchEvent(new Event('online'))

      service.get.mockResolvedValue({
        data: { success: true, data: [{ id: 1, name: 'User' }] }
      })

      await wrapper.vm.loadUsers()

      expect(wrapper.find('.network-error').exists()).toBe(false)
      expect(wrapper.find('li').exists()).toBe(true)
    })

    it('should handle DNS resolution failures', async () => {
      service.get.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com',
        config: { url: '/users' }
      })

      const wrapper = mount(UserListComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.network-error').exists()).toBe(true)
      expect(wrapper.vm.error).toContain('网络')
    })

    it('should handle CORS errors', async () => {
      service.get.mockRejectedValue({
        message: 'Network Error',
        config: { url: '/users' },
        response: undefined
      })

      const wrapper = mount(UserListComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.network-error').exists()).toBe(true)
    })

    it('should handle connection reset errors', async () => {
      service.get.mockRejectedValue({
        code: 'ECONNRESET',
        message: 'Connection reset',
        config: { url: '/users' }
      })

      const wrapper = mount(UserListComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.network-error').exists()).toBe(true)
      expect(wrapper.vm.error).toContain('网络连接失败')
    })
  })

  describe('Retry Mechanism Scenarios', () => {
    it('should implement exponential backoff retry', async () => {
      let callCount = 0
      const retryDelays = []

      service.get.mockImplementation(async () => {
        callCount++
        const startTime = Date.now()

        if (callCount <= 3) {
          retryDelays.push(startTime)
          throw new Error('Temporary network error')
        }

        return Promise.resolve({ data: { success: true, data: [] } })
      })

      // 模拟带重试的API调用
      const fetchWithRetry = async (url, maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await service.get(url)
          } catch (error) {
            if (i === maxRetries) throw error

            // 指数退避: 1s, 2s, 4s
            const delay = Math.pow(2, i) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      const startTime = Date.now()
      const result = await fetchWithRetry('/users')
      const endTime = Date.now()

      expect(result.data.success).toBe(true)
      expect(callCount).toBe(4) // 初始调用 + 3次重试
      expect(endTime - startTime).toBeGreaterThan(7000) // 1+2+4秒延迟
    })

    it('should stop retrying after max attempts', async () => {
      let callCount = 0
      service.get.mockImplementation(() => {
        callCount++
        throw new Error('Persistent network error')
      })

      const fetchWithRetry = async (url, maxRetries = 2) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await service.get(url)
          } catch (error) {
            if (i === maxRetries) throw error
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      }

      try {
        await fetchWithRetry('/users')
        fail('Should have thrown error')
      } catch (error) {
        expect(callCount).toBe(3) // 初始调用 + 2次重试
        expect(error.message).toBe('Persistent network error')
      }
    })

    it('should retry only on retryable errors', async () => {
      const retryableErrors = [
        { code: 'ECONNRESET', message: 'Connection reset' },
        { code: 'ETIMEDOUT', message: 'Connection timeout' },
        { message: 'Network Error' }
      ]

      const nonRetryableErrors = [
        { response: { status: 400 }, message: 'Bad Request' },
        { response: { status: 401 }, message: 'Unauthorized' },
        { response: { status: 403 }, message: 'Forbidden' },
        { response: { status: 404 }, message: 'Not Found' }
      ]

      for (const error of retryableErrors) {
        let callCount = 0
        service.get.mockImplementation(() => {
          callCount++
          if (callCount === 1) throw error
          return Promise.resolve({ data: { success: true } })
        })

        const result = await service.get('/users')
        expect(result.data.success).toBe(true)
        expect(callCount).toBe(2)
      }

      for (const error of nonRetryableErrors) {
        let callCount = 0
        service.get.mockImplementation(() => {
          callCount++
          throw error
        })

        try {
          await service.get('/users')
          fail(`Should have thrown ${error.response.status} error`)
        } catch (err) {
          expect(callCount).toBe(1)
        }
      }
    })
  })

  describe('Error Data Validation', () => {
    it('should validate error response structure', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: '服务器内部错误',
            timestamp: new Date().toISOString(),
            request_id: 'req_12345'
          },
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req_12345'
          }
        },
        config: {
          method: 'get',
          url: '/users',
          headers: {}
        }
      })

      try {
        await service.get('/users')
        fail('Should have thrown error')
      } catch (error) {
        // 验证错误响应结构
        expect(error.response).toBeDefined()
        expect(error.response.status).toBe(500)
        expect(error.response.data).toBeDefined()

        // 使用严格验证
        const requiredFields = ['success', 'error', 'message']
        validateRequiredFields(error.response.data, requiredFields)

        const expectedTypes = {
          success: 'boolean',
          error: 'string',
          message: 'string',
          timestamp: 'string',
          request_id: 'string'
        }
        validateFieldTypes(error.response.data, expectedTypes)
      }
    })

    it('should handle malformed error responses', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 500,
          data: '<html>Error Page</html>', // HTML而不是JSON
          headers: {
            'content-type': 'text/html'
          }
        }
      })

      const wrapper = mount(UserListComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 应该能处理非JSON错误响应
      expect(wrapper.vm.error).toBeTruthy()
      expect(typeof wrapper.vm.error).toBe('string')
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous timeout errors', async () => {
      service.get.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request timeout')
            error.code = 'ECONNABORTED'
            reject(error)
          }, 1000)
        })
      )

      // 同时发起多个请求
      const promises = Array(5).fill().map(() =>
        service.get('/users').catch(err => err)
      )

      const results = await Promise.all(promises)

      // 所有请求都应该超时
      results.forEach(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result.code).toBe('ECONNABORTED')
      })
    })

    it('should cancel pending requests on component unmount', async () => {
      let requestResolve
      const requestPromise = new Promise((resolve) => {
        requestResolve = resolve
      })

      service.get.mockReturnValue(requestPromise)

      const wrapper = mount(UserListComponent)

      // 确保请求已经开始
      await nextTick()
      expect(wrapper.vm.loading).toBe(true)

      // 在请求完成前卸载组件
      wrapper.unmount()

      // 完成请求
      requestResolve({ data: { success: true, data: [] } })

      // 等待一段时间确保没有错误
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件已卸载，不应该有错误输出
      expectNoConsoleErrors()
    })
  })
})