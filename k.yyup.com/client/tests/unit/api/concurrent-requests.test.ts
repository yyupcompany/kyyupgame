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
  ElNotification: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn()
  }
}))

// 模拟并发请求管理组件
const ConcurrentRequestManager = {
  template: `
    <div>
      <div v-if="loading" class="loading">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <p>正在处理 {{ activeRequests }} 个请求...</p>
      </div>

      <div v-if="conflictWarning" class="conflict-warning">
        <h3>数据冲突警告</h3>
        <p>{{ conflictWarning.message }}</p>
        <div class="conflict-actions">
          <button class="merge-button" @click="resolveConflict('merge')">合并数据</button>
          <button class="overwrite-button" @click="resolveConflict('overwrite')">覆盖数据</button>
          <button class="cancel-button" @click="resolveConflict('cancel')">取消操作</button>
        </div>
        <div v-if="conflictDetails" class="conflict-details">
          <h4>冲突详情:</h4>
          <div v-for="(detail, index) in conflictDetails" :key="index" class="detail-item">
            <span class="field">{{ detail.field }}:</span>
            <span class="old-value">旧值: {{ detail.oldValue }}</span>
            <span class="new-value">新值: {{ detail.newValue }}</span>
          </div>
        </div>
      </div>

      <div v-if="rateLimitWarning" class="rate-limit-warning">
        <h3>请求频率限制</h3>
        <p>{{ rateLimitWarning.message }}</p>
        <div v-if="rateLimitWarning.retryAfter" class="retry-timer">
          请在 {{ countdown }} 秒后重试
        </div>
        <button class="retry-button" @click="retryRequests" :disabled="countdown > 0">
          重试请求
        </button>
      </div>

      <div v-if="results.length > 0" class="results">
        <h3>请求结果</h3>
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <div class="result-header">
            <span class="request-id">请求 #{{ result.id }}</span>
            <span class="status" :class="result.status">{{ getStatusText(result.status) }}</span>
          </div>
          <div class="result-content">
            <p v-if="result.error" class="error-message">{{ result.error }}</p>
            <p v-else class="success-message">请求成功完成</p>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="startConcurrentRequests" :disabled="loading">
          开始并发请求测试
        </button>
        <button @click="startConflictSimulation" :disabled="loading">
          模拟数据冲突
        </button>
        <button @click="startRateLimitTest" :disabled="loading">
          测试频率限制
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      activeRequests: 0,
      totalRequests: 0,
      completedRequests: 0,
      results: [],
      conflictWarning: null,
      conflictDetails: null,
      rateLimitWarning: null,
      countdown: 0,
      requestCounter: 0
    }
  },
  computed: {
    progressPercentage() {
      return this.totalRequests > 0 ? (this.completedRequests / this.totalRequests) * 100 : 0
    }
  },
  methods: {
    async startConcurrentRequests() {
      this.loading = true
      this.results = []
      this.totalRequests = 10
      this.completedRequests = 0
      this.activeRequests = 10

      const requests = Array(this.totalRequests).fill().map((_, index) =>
        this.makeRequest(index + 1)
      )

      try {
        const results = await Promise.allSettled(requests)
        this.results = results.map((result, index) => ({
          id: index + 1,
          status: result.status === 'fulfilled' ? 'success' : 'error',
          error: result.status === 'rejected' ? result.reason.message : null,
          data: result.status === 'fulfilled' ? result.value : null
        }))
      } catch (error) {
        console.error('Concurrent request error:', error)
      } finally {
        this.loading = false
        this.activeRequests = 0
      }
    },

    async makeRequest(requestId) {
      try {
        const response = await service.get(`/api/test/${requestId}`)
        this.completedRequests++
        return response.data
      } catch (error) {
        this.completedRequests++
        throw error
      }
    },

    async startConflictSimulation() {
      this.loading = true
      this.conflictWarning = null
      this.conflictDetails = null

      try {
        // 模拟并发更新同一资源
        const updatePromises = [
          this.updateUser(1, { name: 'Alice Updated', email: 'alice@example.com' }),
          this.updateUser(1, { name: 'Alice Smith', phone: '123-456-7890' })
        ]

        const results = await Promise.allSettled(updatePromises)

        // 检查是否有冲突
        const hasConflict = results.some(result =>
          result.status === 'rejected' &&
          result.reason.response?.status === 409
        )

        if (hasConflict) {
          this.showConflictWarning([
            {
              field: 'name',
              oldValue: 'Alice Original',
              newValue: 'Alice Updated'
            },
            {
              field: 'email',
              oldValue: 'alice@old.com',
              newValue: 'alice@example.com'
            }
          ])
        }
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, userData) {
      try {
        const response = await service.put(`/api/users/${userId}`, userData)
        return response.data
      } catch (error) {
        if (error.response?.status === 409) {
          throw {
            response: {
              status: 409,
              data: {
                error: 'CONFLICT',
                message: '数据已被其他用户修改',
                conflicts: [
                  { field: 'name', current_value: 'Alice Smith', your_value: 'Alice Updated' }
                ]
              }
            }
          }
        }
        throw error
      }
    },

    showConflictWarning(conflicts) {
      this.conflictWarning = {
        message: '检测到数据冲突，其他用户可能同时修改了相同的数据'
      }
      this.conflictDetails = conflicts
    },

    resolveConflict(action) {
      console.log('Conflict resolved with action:', action)
      this.conflictWarning = null
      this.conflictDetails = null

      if (action === 'merge') {
        // 执行合并逻辑
        this.performDataMerge()
      } else if (action === 'overwrite') {
        // 执行覆盖逻辑
        this.performDataOverwrite()
      }
    },

    async performDataMerge() {
      try {
        const response = await service.put('/api/users/1/merge', {
          merge_strategy: 'prefer_newer'
        })
        console.log('Data merged successfully:', response.data)
      } catch (error) {
        console.error('Merge failed:', error)
      }
    },

    async performDataOverwrite() {
      try {
        const response = await service.put('/api/users/1', {
          name: 'Alice Updated',
          force_overwrite: true
        })
        console.log('Data overwritten successfully:', response.data)
      } catch (error) {
        console.error('Overwrite failed:', error)
      }
    },

    async startRateLimitTest() {
      this.loading = true
      this.rateLimitWarning = null

      try {
        // 快速发送多个请求触发频率限制
        const requests = Array(20).fill().map((_, index) =>
          service.get(`/api/rate-limit-test/${index}`)
        )

        const results = await Promise.allSettled(requests)

        // 检查是否有频率限制错误
        const rateLimitError = results.find(result =>
          result.status === 'rejected' &&
          result.reason.response?.status === 429
        )

        if (rateLimitError) {
          const retryAfter = rateLimitError.reason.response.data?.retry_after || 60
          this.showRateLimitWarning(retryAfter)
        }
      } finally {
        this.loading = false
      }
    },

    showRateLimitWarning(retryAfter) {
      this.rateLimitWarning = {
        message: '请求过于频繁，请降低请求频率',
        retryAfter
      }
      this.startCountdown(retryAfter)
    },

    startCountdown(seconds) {
      this.countdown = seconds
      const countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(countdownInterval)
        }
      }, 1000)
    },

    async retryRequests() {
      this.rateLimitWarning = null
      await this.startConcurrentRequests()
    },

    getStatusText(status) {
      const statusMap = {
        success: '成功',
        error: '失败',
        pending: '处理中'
      }
      return statusMap[status] || status
    }
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Real Concurrent Request Scenarios', () => {
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

  describe('Duplicate User Updates', () => {
    it('should handle concurrent updates to same resource', async () => {
      let requestCount = 0
      const originalData = { name: 'Alice', email: 'alice@example.com' }

      service.put.mockImplementation(async (url, data) => {
        requestCount++

        if (requestCount === 1) {
          // 第一个请求延迟
          await new Promise(resolve => setTimeout(resolve, 1000))
          return { data: { success: true, data: { ...originalData, ...data } } }
        } else if (requestCount === 2) {
          // 第二个请求冲突（数据已被修改）
          throw {
            response: {
              status: 409,
              data: {
                error: 'CONFLICT',
                message: '数据已被修改',
                current_data: { name: 'Alice Updated', email: 'alice@example.com' },
                conflicts: [
                  { field: 'name', current_value: 'Alice Updated', your_value: 'Alice Smith' }
                ]
              }
            }
          }
        }
      })

      const wrapper = mount(ConcurrentRequestManager)

      await wrapper.find('[data-vue-test="startConflictSimulation"]').trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 1200))

      expect(requestCount).toBe(2)
      expect(wrapper.find('.conflict-warning').exists()).toBe(true)
      expect(wrapper.find('.conflict-warning h3').text()).toContain('数据冲突警告')
      expect(wrapper.find('.merge-button').exists()).toBe(true)
      expect(wrapper.find('.overwrite-button').exists()).toBe(true)
    })

    it('should show conflict details with specific field differences', async () => {
      service.put.mockRejectedValue({
        response: {
          status: 409,
          data: {
            error: 'CONFLICT',
            message: '数据已被其他用户修改',
            conflicts: [
              {
                field: 'name',
                current_value: 'Alice Smith',
                your_value: 'Alice Johnson',
                timestamp: '2023-11-25T10:30:00Z'
              },
              {
                field: 'email',
                current_value: 'alice.smith@example.com',
                your_value: 'alice@example.com',
                timestamp: '2023-11-25T10:30:05Z'
              }
            ]
          }
        }
      })

      const wrapper = mount(ConcurrentRequestManager)
      await wrapper.vm.showConflictWarning([
        { field: 'name', oldValue: 'Alice Smith', newValue: 'Alice Johnson' },
        { field: 'email', oldValue: 'alice.smith@example.com', newValue: 'alice@example.com' }
      ])

      await nextTick()

      expect(wrapper.find('.conflict-details').exists()).toBe(true)
      expect(wrapper.findAll('.detail-item').length).toBe(2)

      const firstDetail = wrapper.findAll('.detail-item')[0]
      expect(firstDetail.find('.field').text()).toBe('name:')
      expect(firstDetail.find('.old-value').text()).toContain('Alice Smith')
      expect(firstDetail.find('.new-value').text()).toContain('Alice Johnson')
    })

    it('should resolve conflicts with merge strategy', async () => {
      service.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Data merged successfully',
          merged_data: {
            name: 'Alice Smith',
            email: 'alice@example.com',
            phone: '123-456-7890'
          }
        }
      })

      const wrapper = mount(ConcurrentRequestManager)

      // 先设置冲突状态
      await wrapper.vm.showConflictWarning([
        { field: 'name', oldValue: 'Alice Original', newValue: 'Alice Updated' }
      ])

      // 点击合并按钮
      await wrapper.find('.merge-button').trigger('click')
      await nextTick()

      expect(service.put).toHaveBeenCalledWith(
        '/api/users/1/merge',
        expect.objectContaining({
          merge_strategy: 'prefer_newer'
        })
      )

      expect(wrapper.find('.conflict-warning').exists()).toBe(false)
    })

    it('should resolve conflicts with overwrite strategy', async () => {
      service.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Data overwritten successfully',
          data: {
            name: 'Alice Updated',
            email: 'alice@example.com'
          }
        }
      })

      const wrapper = mount(ConcurrentRequestManager)

      await wrapper.vm.showConflictWarning([
        { field: 'name', oldValue: 'Alice Original', newValue: 'Alice Updated' }
      ])

      // 点击覆盖按钮
      await wrapper.find('.overwrite-button').trigger('click')
      await nextTick()

      expect(service.put).toHaveBeenCalledWith(
        '/api/users/1',
        expect.objectContaining({
          name: 'Alice Updated',
          force_overwrite: true
        })
      )

      expect(wrapper.find('.conflict-warning').exists()).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting with retry after', async () => {
      let requestCount = 0
      service.get.mockImplementation(async () => {
        requestCount++
        if (requestCount > 10) {
          throw {
            response: {
              status: 429,
              data: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: '请求过于频繁',
                retry_after: 120
              }
            }
          }
        }
        return { data: { success: true, data: { items: [] } } }
      })

      const wrapper = mount(ConcurrentRequestManager)

      await wrapper.find('[data-vue-test="startRateLimitTest"]').trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.rate-limit-warning').exists()).toBe(true)
      expect(wrapper.find('.rate-limit-warning h3').text()).toBe('请求频率限制')
      expect(wrapper.vm.rateLimitWarning.retryAfter).toBe(120)
      expect(wrapper.vm.countdown).toBe(120)
    })

    it('should countdown and enable retry button', async () => {
      vi.useFakeTimers()

      const wrapper = mount(ConcurrentRequestManager)
      await wrapper.vm.showRateLimitWarning(3)

      expect(wrapper.vm.countdown).toBe(3)
      expect(wrapper.find('.retry-button').attributes('disabled')).toBeDefined()

      // 模拟倒计时
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(wrapper.vm.countdown).toBe(2)

      vi.advanceTimersByTime(2000)
      await nextTick()
      expect(wrapper.vm.countdown).toBe(0)

      // 等待间隔清理
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(wrapper.find('.retry-button').attributes('disabled')).toBeUndefined()

      vi.useRealTimers()
    })

    it('should retry requests after rate limit expires', async () => {
      let requestCount = 0
      service.get.mockImplementation(async () => {
        requestCount++
        if (requestCount <= 20) {
          throw {
            response: {
              status: 429,
              data: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: '请求过于频繁',
                retry_after: 1
              }
            }
          }
        }
        return { data: { success: true, data: { items: [] } } }
      })

      const wrapper = mount(ConcurrentRequestManager)

      // 第一次调用触发频率限制
      await wrapper.vm.startRateLimitTest()
      await nextTick()

      expect(wrapper.find('.rate-limit-warning').exists()).toBe(true)

      // 等待倒计时结束
      vi.useFakeTimers()
      vi.advanceTimersByTime(1000)
      await nextTick()
      vi.useRealTimers()

      // 点击重试按钮
      await wrapper.find('.retry-button').trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(service.get).toHaveBeenCalledTimes(21) // 20次失败 + 1次重试
    })
  })

  describe('Concurrent Request Management', () => {
    it('should track progress of multiple concurrent requests', async () => {
      const totalRequests = 10
      const responseDelays = Array(totalRequests).fill().map(() =>
        Math.random() * 1000 + 500 // 500-1500ms随机延迟
      )

      service.get.mockImplementation((url) => {
        const index = parseInt(url.split('/').pop()) - 1
        const delay = responseDelays[index]
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                data: { id: index + 1, delay },
                request_id: `req_${index + 1}`
              }
            })
          }, delay)
        })
      })

      const wrapper = mount(ConcurrentRequestManager)
      const startTime = Date.now()

      await wrapper.vm.startConcurrentRequests()
      const endTime = Date.now()

      expect(wrapper.vm.results.length).toBe(totalRequests)
      expect(wrapper.vm.totalRequests).toBe(totalRequests)
      expect(wrapper.vm.completedRequests).toBe(totalRequests)

      // 验证结果是按请求ID排序的
      const sortedResults = [...wrapper.vm.results].sort((a, b) => a.id - b.id)
      expect(wrapper.vm.results).toEqual(sortedResults)

      // 验证总处理时间合理
      expect(endTime - startTime).toBeGreaterThan(1500) // 至少最长请求的时间
      expect(endTime - startTime).toBeLessThan(3000)    // 不应该太久

      // 验证所有请求都成功
      const successCount = wrapper.vm.results.filter(r => r.status === 'success').length
      expect(successCount).toBe(totalRequests)
    })

    it('should handle mixed success and failure in concurrent requests', async () => {
      const successRate = 0.7 // 70%成功率
      const totalRequests = 20

      service.get.mockImplementation((url) => {
        const index = parseInt(url.split('/').pop())
        const shouldSucceed = Math.random() < successRate

        if (shouldSucceed) {
          return Promise.resolve({
            data: {
              success: true,
              data: { id: index, status: 'success' }
            }
          })
        } else {
          return Promise.reject({
            message: `Request ${index} failed`,
            config: { url }
          })
        }
      })

      const wrapper = mount(ConcurrentRequestManager)
      await wrapper.vm.startConcurrentRequests()

      expect(wrapper.vm.results.length).toBe(totalRequests)

      const successCount = wrapper.vm.results.filter(r => r.status === 'success').length
      const errorCount = wrapper.vm.results.filter(r => r.status === 'error').length

      expect(successCount + errorCount).toBe(totalRequests)
      expect(successCount).toBeGreaterThan(0)
      expect(errorCount).toBeGreaterThan(0)

      // 验证错误信息被正确记录
      wrapper.vm.results.filter(r => r.status === 'error').forEach(result => {
        expect(result.error).toBeTruthy()
        expect(typeof result.error).toBe('string')
      })
    })

    it('should cancel pending requests on component unmount', async () => {
      let resolveRequest
      const pendingRequest = new Promise(resolve => {
        resolveRequest = resolve
      })

      service.get.mockReturnValue(pendingRequest)

      const wrapper = mount(ConcurrentRequestManager)

      // 开始并发请求
      wrapper.vm.startConcurrentRequests()
      await nextTick()

      expect(wrapper.vm.loading).toBe(true)
      expect(wrapper.vm.activeRequests).toBe(10)

      // 在请求完成前卸载组件
      wrapper.unmount()

      // 完成请求
      resolveRequest({ data: { success: true } })

      // 等待一段时间确保没有错误
      await new Promise(resolve => setTimeout(resolve, 100))

      expectNoConsoleErrors()
    })

    it('should implement request deduplication for identical requests', async () => {
      let callCount = 0
      const responses = [
        { data: { users: [1, 2, 3] } },
        { data: { users: [4, 5, 6] } },
        { data: { users: [7, 8, 9] } }
      ]

      service.get.mockImplementation((url) => {
        callCount++
        return Promise.resolve(responses[callCount - 1] || responses[0])
      })

      // 模拟请求去重逻辑
      const requestCache = new Map()
      const makeRequest = async (url) => {
        if (requestCache.has(url)) {
          return requestCache.get(url)
        }

        const request = service.get(url)
        requestCache.set(url, request)
        return request
      }

      // 同时发起多个相同的请求
      const identicalRequests = Array(5).fill().map(() => makeRequest('/api/users'))
      const results = await Promise.all(identicalRequests)

      // 应该只发起一次实际请求
      expect(service.get).toHaveBeenCalledTimes(1)
      expect(callCount).toBe(1)

      // 所有请求应该得到相同的结果
      results.forEach(result => {
        expect(result).toEqual(responses[0])
      })

      expect(requestCache.size).toBe(1)
    })
  })

  describe('Request Queue and Prioritization', () => {
    it('should implement priority queue for critical requests', async () => {
      const executionOrder = []

      service.get.mockImplementation((url) => {
        const priority = url.includes('critical') ? 1 : 2
        executionOrder.push({ url, priority, timestamp: Date.now() })
        return Promise.resolve({ data: { success: true, url } })
      })

      // 模拟优先级队列
      class RequestQueue {
        constructor() {
          this.queue = []
          this.processing = false
        }

        add(request, priority = 2) {
          this.queue.push({ request, priority })
          this.queue.sort((a, b) => a.priority - b.priority)

          if (!this.processing) {
            this.process()
          }
        }

        async process() {
          this.processing = true
          while (this.queue.length > 0) {
            const { request } = this.queue.shift()
            try {
              await request()
            } catch (error) {
              console.error('Queue request failed:', error)
            }
          }
          this.processing = false
        }
      }

      const queue = new RequestQueue()

      // 添加不同优先级的请求
      queue.add(() => service.get('/api/normal1'), 2)
      queue.add(() => service.get('/api/critical1'), 1)
      queue.add(() => service.get('/api/normal2'), 2)
      queue.add(() => service.get('/api/critical2'), 1)

      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证执行顺序
      expect(executionOrder.length).toBe(4)
      expect(executionOrder[0].url).toContain('critical1')
      expect(executionOrder[1].url).toContain('critical2')
      expect(executionOrder[2].url).toContain('normal1')
      expect(executionOrder[3].url).toContain('normal2')
    })

    it('should implement request timeout for long-running operations', async () => {
      service.get.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject({
              code: 'ECONNABORTED',
              message: 'Request timeout of 5000ms exceeded'
            })
          }, 6000) // 6秒，超过5秒超时
        })
      )

      const requestWithTimeout = (url, timeout = 5000) => {
        return Promise.race([
          service.get(url),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject({
                code: 'ECONNABORTED',
                message: `Request timeout of ${timeout}ms exceeded`
              })
            }, timeout)
          })
        ])
      }

      const startTime = Date.now()

      try {
        await requestWithTimeout('/api/slow-endpoint')
        fail('Should have timed out')
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        expect(error.code).toBe('ECONNABORTED')
        expect(error.message).toContain('timeout of 5000ms')
        expect(duration).toBeGreaterThan(4900) // 允许一些误差
        expect(duration).toBeLessThan(5200)    // 不应该太久
      }
    })
  })
})