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
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn()
      }
    }
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn()
  },
  ElNotification: {
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock router
vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

// 模拟仪表板组件
const DashboardComponent = {
  template: `
    <div>
      <div v-if="loading" class="loading">加载中...</div>

      <div v-if="serverError" class="server-error">
        <h3 class="error-title">服务器错误</h3>
        <p class="error-message">{{ serverError.message }}</p>
        <p class="error-code">错误代码: {{ serverError.code }}</p>
        <p v-if="serverError.requestId" class="request-id">请求ID: {{ serverError.requestId }}</p>
        <button class="retry-button" @click="retry">重试</button>
        <button class="report-button" @click="reportError">报告问题</button>
      </div>

      <div v-if="maintenanceMode" class="maintenance-message">
        <h3>系统维护中</h3>
        <p>{{ maintenanceMessage }}</p>
        <div v-if="retryCountdown" class="retry-countdown">
          将在 {{ retryCountdown }} 秒后重试
        </div>
      </div>

      <div v-if="rateLimit" class="rate-limit-message">
        <h3>请求过于频繁</h3>
        <p>{{ rateLimit.message }}</p>
        <div v-if="rateLimit.retryAfter" class="retry-timer">
          请在 {{ rateLimit.retryAfter }} 秒后重试
        </div>
      </div>

      <div v-if="showData && !error" class="dashboard-content">
        <h2>仪表板数据</h2>
        <div class="stats">
          <div class="stat-item">
            <span class="label">用户总数:</span>
            <span class="value">{{ stats.userCount }}</span>
          </div>
          <div class="stat-item">
            <span class="label">活跃班级:</span>
            <span class="value">{{ stats.activeClasses }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      serverError: null,
      maintenanceMode: false,
      maintenanceMessage: '',
      retryCountdown: 0,
      rateLimit: null,
      showData: false,
      stats: {
        userCount: 0,
        activeClasses: 0
      }
    }
  },
  methods: {
    async loadDashboard() {
      this.loading = true
      this.serverError = null
      this.maintenanceMode = false
      this.rateLimit = null

      try {
        const response = await service.get('/dashboard/stats')
        this.stats = response.data.data || {}
        this.showData = true
      } catch (error) {
        this.handleServerError(error)
      } finally {
        this.loading = false
      }
    },
    handleServerError(error) {
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 500:
            this.serverError = {
              code: 'INTERNAL_SERVER_ERROR',
              message: data?.message || '服务器内部错误',
              requestId: data?.request_id
            }
            break

          case 502:
            this.serverError = {
              code: 'BAD_GATEWAY',
              message: '网关错误',
              requestId: data?.request_id
            }
            break

          case 503:
            this.maintenanceMode = true
            this.maintenanceMessage = data?.message || '服务暂时不可用，请稍后重试'
            if (data?.retry_after) {
              this.startRetryCountdown(data.retry_after)
            }
            break

          case 504:
            this.serverError = {
              code: 'GATEWAY_TIMEOUT',
              message: '网关超时',
              requestId: data?.request_id
            }
            break

          case 429:
            this.rateLimit = {
              message: data?.message || '请求过于频繁',
              retryAfter: data?.retry_after || 60
            }
            this.startRetryTimer()
            break

          default:
            this.serverError = {
              code: `HTTP_${status}`,
              message: data?.message || '未知服务器错误'
            }
        }
      } else {
        this.serverError = {
          code: 'NETWORK_ERROR',
          message: '网络连接失败'
        }
      }
    },
    startRetryCountdown(seconds) {
      this.retryCountdown = seconds
      const countdown = setInterval(() => {
        this.retryCountdown--
        if (this.retryCountdown <= 0) {
          clearInterval(countdown)
          this.retry()
        }
      }, 1000)
    },
    startRetryTimer() {
      if (this.rateLimit?.retryAfter) {
        setTimeout(() => {
          this.rateLimit = null
          this.loadDashboard()
        }, this.rateLimit.retryAfter * 1000)
      }
    },
    retry() {
      this.loadDashboard()
    },
    reportError() {
      // 模拟错误报告功能
      console.log('Error reported:', this.serverError)
    }
  },
  mounted() {
    this.loadDashboard()
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Real Server Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    startConsoleMonitoring()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    expectNoConsoleErrors()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('HTTP 5xx Server Errors', () => {
    it('should handle 500 internal server error correctly', async () => {
      const mockError = {
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
          url: '/dashboard/stats',
          headers: {}
        }
      }

      service.get.mockRejectedValue(mockError)

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.server-error').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toBe('服务器错误')
      expect(wrapper.find('.error-message').text()).toBe('服务器内部错误')
      expect(wrapper.find('.error-code').text()).toContain('INTERNAL_SERVER_ERROR')
      expect(wrapper.find('.request-id').text()).toContain('req_12345')
      expect(wrapper.find('.retry-button').exists()).toBe(true)
      expect(wrapper.find('.report-button').exists()).toBe(true)

      // 验证错误数据结构
      const serverError = wrapper.vm.serverError
      expect(serverError.code).toBe('INTERNAL_SERVER_ERROR')
      expect(serverError.message).toBe('服务器内部错误')
      expect(serverError.requestId).toBe('req_12345')
    })

    it('should handle 502 bad gateway error', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 502,
          statusText: 'Bad Gateway',
          data: {
            success: false,
            error: 'BAD_GATEWAY',
            message: '上游服务器错误'
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.server-error').exists()).toBe(true)
      expect(wrapper.find('.error-code').text()).toContain('BAD_GATEWAY')
      expect(wrapper.find('.error-message').text()).toContain('网关错误')
    })

    it('should handle 503 service unavailable with retry after', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 503,
          statusText: 'Service Unavailable',
          data: {
            success: false,
            error: 'SERVICE_UNAVAILABLE',
            message: '系统维护中，预计10分钟后恢复',
            retry_after: 600
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.maintenance-message').exists()).toBe(true)
      expect(wrapper.find('.maintenance-message h3').text()).toBe('系统维护中')
      expect(wrapper.find('.maintenance-message p').text()).toContain('系统维护中')
      expect(wrapper.vm.retryCountdown).toBe(600)
      expect(wrapper.find('.retry-countdown').exists()).toBe(true)
    })

    it('should handle 504 gateway timeout', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 504,
          statusText: 'Gateway Timeout',
          data: {
            success: false,
            error: 'GATEWAY_TIMEOUT',
            message: '网关请求超时',
            request_id: 'gw_timeout_123'
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.server-error').exists()).toBe(true)
      expect(wrapper.find('.error-code').text()).toContain('GATEWAY_TIMEOUT')
      expect(wrapper.find('.error-message').text()).toContain('网关超时')
      expect(wrapper.find('.request-id').text()).toContain('gw_timeout_123')
    })

    it('should handle missing error data gracefully', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: null // 缺少错误数据
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.server-error').exists()).toBe(true)
      expect(wrapper.vm.serverError.code).toBe('INTERNAL_SERVER_ERROR')
      expect(typeof wrapper.vm.serverError.message).toBe('string')
    })
  })

  describe('HTTP 429 Rate Limiting', () => {
    it('should handle rate limiting with retry after header', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: '请求过于频繁，请稍后重试',
            retry_after: 120
          },
          headers: {
            'retry-after': '120',
            'x-ratelimit-remaining': '0',
            'x-ratelimit-limit': '100'
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.rate-limit-message').exists()).toBe(true)
      expect(wrapper.find('.rate-limit-message h3').text()).toBe('请求过于频繁')
      expect(wrapper.find('.retry-timer').text()).toContain('120')
      expect(wrapper.vm.rateLimit.retryAfter).toBe(120)

      // 验证重试定时器已启动
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn()
      wrapper.vm.startRetryTimer()
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        120000
      )
      global.setTimeout = originalSetTimeout
    })

    it('should handle rate limiting without retry after', async () => {
      service.get.mockRejectedValue({
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'API调用次数超限'
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.rate-limit-message').exists()).toBe(true)
      expect(wrapper.vm.rateLimit.message).toContain('API调用次数超限')
      expect(wrapper.vm.rateLimit.retryAfter).toBe(60) // 默认值
    })
  })

  describe('Error Recovery Mechanisms', () => {
    it('should retry successfully after transient server error', async () => {
      let callCount = 0
      service.get.mockImplementation(async () => {
        callCount++
        if (callCount === 1) {
          throw {
            response: {
              status: 503,
              data: {
                success: false,
                error: 'SERVICE_UNAVAILABLE',
                message: '服务暂时不可用'
              }
            }
          }
        }
        return {
          data: {
            success: true,
            data: {
              userCount: 150,
              activeClasses: 12
            }
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 第一次调用失败，显示维护信息
      expect(wrapper.vm.maintenanceMode).toBe(true)

      // 点击重试按钮
      await wrapper.find('.retry-button').trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(callCount).toBe(2)
      expect(wrapper.vm.maintenanceMode).toBe(false)
      expect(wrapper.vm.showData).toBe(true)
      expect(wrapper.vm.stats.userCount).toBe(150)
      expect(wrapper.vm.stats.activeClasses).toBe(12)
    })

    it('should implement automatic retry countdown for maintenance', async () => {
      vi.useFakeTimers()

      service.get.mockRejectedValue({
        response: {
          status: 503,
          data: {
            success: false,
            error: 'SERVICE_UNAVAILABLE',
            message: '维护中',
            retry_after: 3
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      expect(wrapper.vm.retryCountdown).toBe(3)

      // 模拟倒计时
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(wrapper.vm.retryCountdown).toBe(2)

      vi.advanceTimersByTime(2000)
      await nextTick()
      expect(wrapper.vm.retryCountdown).toBe(0)

      // 等待重试执行
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(service.get).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('Server Error Data Validation', () => {
    it('should validate complete server error response structure', async () => {
      const errorResponse = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            success: false,
            error: 'DATABASE_ERROR',
            message: '数据库连接失败',
            details: {
              query: 'SELECT * FROM users',
              error_code: 'CONN_LOST'
            },
            timestamp: '2023-11-25T10:30:00.000Z',
            request_id: 'req_db_12345',
            stack_trace: 'Error: Database connection lost'
          },
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req_db_12345',
            'x-server-time': '2023-11-25T10:30:00.000Z'
          }
        }
      }

      service.get.mockRejectedValue(errorResponse)

      try {
        await service.get('/users')
        fail('Should have thrown error')
      } catch (error) {
        // 验证基本响应结构
        expect(error.response).toBeDefined()
        expect(error.response.status).toBe(500)
        expect(error.response.data).toBeDefined()

        // 严格验证错误数据结构
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

        // 验证可选字段
        expect(error.response.data.details).toBeDefined()
        expect(typeof error.response.data.details).toBe('object')

        // 验证请求ID格式
        expect(error.response.data.request_id).toMatch(/^req_[a-zA-Z0-9_]+$/)

        // 验证时间戳格式
        expect(error.response.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      }
    })

    it('should handle malformed server error responses', async () => {
      const malformedResponses = [
        {
          name: 'HTML error page',
          response: {
            status: 500,
            data: '<!DOCTYPE html><html><body><h1>500 Server Error</h1></body></html>',
            headers: { 'content-type': 'text/html' }
          }
        },
        {
          name: 'Plain text error',
          response: {
            status: 500,
            data: 'Internal Server Error',
            headers: { 'content-type': 'text/plain' }
          }
        },
        {
          name: 'Empty response',
          response: {
            status: 500,
            data: '',
            headers: { 'content-length': '0' }
          }
        },
        {
          name: 'Invalid JSON',
          response: {
            status: 500,
            data: '{"invalid": json}',
            headers: { 'content-type': 'application/json' }
          }
        }
      ]

      for (const scenario of malformedResponses) {
        service.get.mockRejectedValue(scenario)

        const wrapper = mount(DashboardComponent)

        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // 应该能够处理各种格式的错误响应
        expect(wrapper.vm.serverError).toBeDefined()
        expect(typeof wrapper.vm.serverError.code).toBe('string')
        expect(typeof wrapper.vm.serverError.message).toBe('string')

        // 不应该有控制台错误
        expectNoConsoleErrors()
      }
    })
  })

  describe('Error Reporting and Analytics', () => {
    it('should collect error analytics for reporting', async () => {
      const errorSpy = vi.spyOn(console, 'log')

      service.get.mockRejectedValue({
        response: {
          status: 500,
          data: {
            success: false,
            error: 'DATABASE_ERROR',
            message: '数据库连接失败',
            request_id: 'req_db_67890'
          }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 点击报告错误按钮
      await wrapper.find('.report-button').trigger('click')

      expect(errorSpy).toHaveBeenCalledWith(
        'Error reported:',
        expect.objectContaining({
          code: 'DATABASE_ERROR',
          message: '数据库连接失败',
          requestId: 'req_db_67890'
        })
      )

      errorSpy.mockRestore()
    })

    it('should include user agent and environment in error reports', async () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Test Browser) Test/1.0'
      })

      service.get.mockRejectedValue({
        response: {
          status: 500,
          data: { success: false, error: 'UNKNOWN_ERROR', message: '未知错误' }
        }
      })

      const wrapper = mount(DashboardComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorData = wrapper.vm.serverError
      expect(errorData).toBeDefined()
      expect(errorData.userAgent).toBe('Mozilla/5.0 (Test Browser) Test/1.0')

      // 恢复原始user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: originalUserAgent
      })
    })
  })
})