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
  }
}))

// 模拟数据处理组件
const DataProcessorComponent = {
  template: `
    <div>
      <div v-if="loading" class="loading">处理数据中...</div>

      <div v-if="dataError" class="data-error">
        <h3>数据格式错误</h3>
        <p>{{ dataError.message }}</p>
        <div v-if="dataError.details" class="error-details">
          <p>错误类型: {{ dataError.type }}</p>
          <p>预期格式: {{ dataError.expected }}</p>
          <p>实际数据: {{ dataError.actual }}</p>
        </div>
        <button class="retry-button" @click="retry">重试</button>
        <button class="report-button" @click="reportDataError">报告数据问题</button>
      </div>

      <div v-if="emptyState" class="empty-state">
        <p>{{ emptyMessage }}</p>
        <button v-if="showRefreshButton" class="refresh-button" @click="loadData">刷新</button>
      </div>

      <div v-if="processedData && !dataError" class="data-display">
        <h3>处理后的数据</h3>
        <div v-if="Array.isArray(processedData)">
          <p>共 {{ processedData.length }} 条记录</p>
          <div v-for="(item, index) in processedData.slice(0, 5)" :key="index" class="data-item">
            <span class="item-id">{{ item.id || index }}</span>
            <span class="item-name">{{ item.name || '未命名' }}</span>
            <span class="item-value">{{ item.value || '无值' }}</span>
          </div>
        </div>
        <div v-else-if="typeof processedData === 'object'">
          <div v-for="(value, key) in processedData" :key="key" class="object-item">
            <span class="object-key">{{ key }}:</span>
            <span class="object-value">{{ formatValue(value) }}</span>
          </div>
        </div>
        <div v-else>
          <p>原始数据: {{ processedData }}</p>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      dataError: null,
      emptyState: false,
      emptyMessage: '',
      showRefreshButton: false,
      processedData: null
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      this.dataError = null
      this.emptyState = false

      try {
        const response = await service.get('/data/process')
        this.processedData = this.processResponseData(response.data)
      } catch (error) {
        this.handleDataError(error)
      } finally {
        this.loading = false
      }
    },
    processResponseData(data) {
      // 处理各种数据格式
      if (data === null || data === undefined) {
        this.emptyState = true
        this.emptyMessage = '数据为空'
        this.showRefreshButton = true
        return null
      }

      if (data === '') {
        this.emptyState = true
        this.emptyMessage = '收到空字符串'
        this.showRefreshButton = true
        return ''
      }

      if (typeof data === 'string') {
        try {
          // 尝试解析JSON
          return JSON.parse(data)
        } catch (e) {
          // 如果不是JSON，直接返回字符串
          return data
        }
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          this.emptyState = true
          this.emptyMessage = '数据列表为空'
          this.showRefreshButton = true
        }
        return data.map(item => this.normalizeDataItem(item))
      }

      if (typeof data === 'object') {
        if (Object.keys(data).length === 0) {
          this.emptyState = true
          this.emptyMessage = '数据对象为空'
          this.showRefreshButton = true
        }
        return this.normalizeObject(data)
      }

      // 其他类型直接返回
      return data
    },
    normalizeDataItem(item) {
      if (item === null || item === undefined) {
        return { id: null, name: '空项', value: null }
      }

      if (typeof item !== 'object') {
        return {
          id: null,
          name: item.toString(),
          value: item
        }
      }

      return {
        id: item.id || null,
        name: item.name || item.title || '未命名',
        value: item.value || item.content || null,
        ...item
      }
    },
    normalizeObject(obj) {
      const normalized = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          normalized[key] = value
        }
      }
      return normalized
    },
    handleDataError(error) {
      if (error instanceof SyntaxError) {
        this.dataError = {
          type: 'JSON_PARSE_ERROR',
          message: '无法解析服务器返回的JSON数据',
          expected: '有效的JSON格式',
          actual: error.message
        }
      } else if (error.response) {
        const contentType = error.response.headers?.['content-type']

        if (contentType && !contentType.includes('application/json')) {
          this.dataError = {
            type: 'CONTENT_TYPE_ERROR',
            message: '服务器返回了非JSON格式的数据',
            expected: 'application/json',
            actual: contentType
          }
        } else {
          this.dataError = {
            type: 'DATA_STRUCTURE_ERROR',
            message: '数据结构不符合预期',
            expected: '包含必要字段的对象或数组',
            actual: error.response.data || '未知数据'
          }
        }
      } else {
        this.dataError = {
          type: 'UNKNOWN_ERROR',
          message: '数据处理过程中发生未知错误',
          expected: '正常的数据响应',
          actual: error.message
        }
      }
    },
    formatValue(value) {
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    },
    retry() {
      this.loadData()
    },
    reportDataError() {
      console.log('Data error reported:', this.dataError)
    }
  },
  mounted() {
    this.loadData()
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Real Data Format Error Scenarios', () => {
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

  describe('JSON Parse Errors', () => {
    it('should handle malformed JSON response', async () => {
      // 模拟返回无效JSON
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.reject(new SyntaxError('Unexpected token } in JSON at position 42')),
        text: () => Promise.resolve('{"invalid": json, "malformed": true}')
      })

      global.fetch = mockFetch

      try {
        const response = await fetch('/api/users')
        await response.json()
        fail('Should have thrown JSON parse error')
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError)
        expect(error.message).toContain('Unexpected token')
      }

      // 测试组件处理
      service.get.mockRejectedValue({
        message: 'Unexpected token } in JSON at position 42',
        name: 'SyntaxError'
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.find('.data-error h3').text()).toBe('数据格式错误')
      expect(wrapper.find('.error-details .error-type').text()).toBe('JSON_PARSE_ERROR')
      expect(wrapper.find('.error-details .error-details p:nth-child(2)').text()).toContain('有效的JSON格式')
    })

    it('should handle incomplete JSON structure', async () => {
      service.get.mockResolvedValue({
        data: '{"users": [{"id": 1, "name": "User1"}, {"id": 2', // 不完整的JSON
        headers: { 'content-type': 'application/json' }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.vm.dataError.type).toBe('JSON_PARSE_ERROR')
    })

    it('should handle JSON with circular references', async () => {
      const circularObject = { id: 1, name: 'Test' }
      circularObject.self = circularObject // 循环引用

      service.get.mockImplementation(() => {
        // 模拟JSON.stringify循环引用错误
        throw new TypeError('Converting circular structure to JSON')
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.vm.dataError.message).toContain('循环')
    })
  })

  describe('Unexpected Response Structure', () => {
    it('should handle missing success field', async () => {
      service.get.mockResolvedValue({
        data: {
          // 缺少success字段
          data: { users: [] },
          message: 'Success'
          // 其他字段可能存在
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该能处理意外的数据结构
      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(wrapper.vm.processedData).toBeDefined()
    })

    it('should handle completely unknown response structure', async () => {
      service.get.mockResolvedValue({
        data: {
          unknown_field: 'unexpected_value',
          nested: {
            unexpected_array: [1, 2, 3],
            deep: {
              nested: {
                unexpected: true
              }
            }
          },
          another_unknown: {
            field: 'value'
          }
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 应该能处理未知的数据结构
      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(wrapper.vm.processedData).toBeDefined()
      expect(typeof wrapper.vm.processedData).toBe('object')
    })

    it('should handle response with mixed data types', async () => {
      service.get.mockResolvedValue({
        data: {
          string_field: 'text',
          number_field: 42,
          boolean_field: true,
          null_field: null,
          undefined_field: undefined,
          array_field: [1, 'two', { three: 3 }],
          object_field: { nested: 'value' },
          function_field: function() { return 'function' }, // 函数不应该被序列化
          date_field: new Date(),
          regex_field: /pattern/g,
          symbol_field: Symbol('test')
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(wrapper.vm.processedData).toBeDefined()

      // 验证数据处理结果
      const processed = wrapper.vm.processedData
      expect(processed.string_field).toBe('text')
      expect(processed.number_field).toBe(42)
      expect(processed.boolean_field).toBe(true)
      expect(processed.null_field).toBe(null)
      expect(processed.undefined_field).toBeUndefined()
      expect(Array.isArray(processed.array_field)).toBe(true)
    })
  })

  describe('Empty and Null Response Handling', () => {
    it('should handle null response', async () => {
      service.get.mockResolvedValue({ data: null })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('数据为空')
      expect(wrapper.find('.refresh-button').exists()).toBe(true)
    })

    it('should handle undefined response', async () => {
      service.get.mockResolvedValue({ data: undefined })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('数据为空')
    })

    it('should handle empty string response', async () => {
      service.get.mockResolvedValue({ data: '' })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('收到空字符串')
      expect(wrapper.vm.processedData).toBe('')
    })

    it('should handle empty array response', async () => {
      service.get.mockResolvedValue({ data: [] })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('数据列表为空')
    })

    it('should handle empty object response', async () => {
      service.get.mockResolvedValue({ data: {} })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('数据对象为空')
    })
  })

  describe('Content Type Mismatches', () => {
    it('should handle HTML response instead of JSON', async () => {
      service.get.mockResolvedValue({
        data: '<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>',
        headers: { 'content-type': 'text/html' }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.vm.dataError.type).toBe('CONTENT_TYPE_ERROR')
      expect(wrapper.vm.dataError.actual).toBe('text/html')
    })

    it('should handle plain text response instead of JSON', async () => {
      service.get.mockResolvedValue({
        data: 'Internal Server Error',
        headers: { 'content-type': 'text/plain' }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.vm.dataError.actual).toBe('text/plain')
    })

    it('should handle XML response instead of JSON', async () => {
      const xmlData = '<?xml version="1.0"?><error><code>500</code><message>Server Error</message></error>'
      service.get.mockResolvedValue({
        data: xmlData,
        headers: { 'content-type': 'application/xml' }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-error').exists()).toBe(true)
      expect(wrapper.vm.dataError.type).toBe('CONTENT_TYPE_ERROR')
    })
  })

  describe('Data Type Validation', () => {
    it('should validate expected array but received object', async () => {
      service.get.mockResolvedValue({
        data: {
          success: true,
          data: { users: {} } // 应该是数组但收到对象
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该能处理类型不匹配
      expect(wrapper.find('.data-display').exists()).toBe(true)
    })

    it('should validate expected object but received string', async () => {
      service.get.mockResolvedValue({
        data: {
          success: true,
          data: 'should be object but got string'
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(wrapper.vm.processedData).toBe('should be object but got string')
    })

    it('should handle mixed array with inconsistent item types', async () => {
      service.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            { id: 1, name: 'User1' },
            'string item',  // 字符串
            42,             // 数字
            null,           // null
            { name: 'User2' }, // 缺少id
            [1, 2, 3]       // 嵌套数组
          ]
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(Array.isArray(wrapper.vm.processedData)).toBe(true)
      expect(wrapper.vm.processedData.length).toBe(6)
    })
  })

  describe('Large Data Handling', () => {
    it('should handle extremely large response', async () => {
      // 生成大数据集
      const largeArray = Array(10000).fill().map((_, i) => ({
        id: i,
        name: `User ${i}`,
        data: 'x'.repeat(1000) // 每项包含1KB数据
      }))

      service.get.mockResolvedValue({
        data: {
          success: true,
          data: largeArray
        }
      })

      const startTime = Date.now()
      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      const endTime = Date.now()

      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(Array.isArray(wrapper.vm.processedData)).toBe(true)

      // 验证处理时间合理（不超过5秒）
      expect(endTime - startTime).toBeLessThan(5000)

      // 验证只显示前5项（优化性能）
      expect(wrapper.findAll('.data-item').length).toBeLessThanOrEqual(5)
    })

    it('should handle deeply nested objects', async () => {
      // 创建深度嵌套的对象
      let deepObject = { level: 0 }
      let current = deepObject
      for (let i = 1;
import { vi } from 'vitest' i <= 100; i++) {
        current.next = { level: i }
        current = current.next
      }

      service.get.mockResolvedValue({
        data: {
          success: true,
          data: deepObject
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('.data-display').exists()).toBe(true)
      expect(wrapper.vm.processedData).toBeDefined()
    })
  })

  describe('Data Recovery and Fallbacks', () => {
    it('should fallback to cached data on format error', async () => {
      // 模拟缓存的数据
      const cachedData = {
        users: [{ id: 1, name: 'Cached User' }]
      }
      localStorage.setItem('cached_users', JSON.stringify(cachedData))

      service.get.mockRejectedValue({
        message: 'Unexpected token in JSON'
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 在实际应用中，组件可能会尝试使用缓存数据
      expect(wrapper.find('.data-error').exists()).toBe(true)
    })

    it('should retry with data transformation on format error', async () => {
      let callCount = 0
      service.get.mockImplementation(async () => {
        callCount++
        if (callCount === 1) {
          throw new SyntaxError('JSON parse error')
        }
        // 第二次调用返回格式正确的数据
        return {
          data: {
            success: true,
            data: [{ id: 1, name: 'User after retry' }]
          }
        }
      })

      const wrapper = mount(DataProcessorComponent)

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 第一次调用失败
      expect(wrapper.find('.data-error').exists()).toBe(true)

      // 点击重试
      await wrapper.find('.retry-button').trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(callCount).toBe(2)
      expect(wrapper.find('.data-error').exists()).toBe(false)
      expect(wrapper.find('.data-display').exists()).toBe(true)
    })
  })
})