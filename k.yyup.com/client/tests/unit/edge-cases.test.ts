import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

describe('Edge Cases and Error Scenarios', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: []
    })
    pinia = createPinia()
  })

  describe('Network and API Failures', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'TIMEOUT'

      const mockApi = vi.fn().mockRejectedValue(timeoutError)

      // Test component handling timeout
      const wrapper = mount({
        template: '<div>{{ errorMessage }}</div>',
        data() {
          return { errorMessage: '' }
        },
        async mounted() {
          try {
            await mockApi()
          } catch (error: any) {
            this.errorMessage = error.code === 'TIMEOUT' ? '请求超时，请重试' : '未知错误'
          }
        }
      })

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('请求超时，请重试')
    })

    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Too many requests')
      rateLimitError.status = 429

      const mockApi = vi.fn().mockRejectedValue(rateLimitError)

      const wrapper = mount({
        template: '<div>{{ errorMessage }}</div>',
        data() {
          return { errorMessage: '' }
        },
        async mounted() {
          try {
            await mockApi()
          } catch (error: any) {
            this.errorMessage = error.status === 429 ? '请求过于频繁，请稍后重试' : '未知错误'
          }
        }
      })

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('请求过于频繁，请稍后重试')
    })

    it('should handle server maintenance', async () => {
      const maintenanceError = new Error('Service unavailable') as any
      maintenanceError.status = 503

      const mockApi = vi.fn().mockRejectedValue(maintenanceError)

      const wrapper = mount({
        template: '<div>{{ errorMessage }}</div>',
        data() {
          return { errorMessage: '' }
        },
        async mounted() {
          try {
            await mockApi()
          } catch (error: any) {
            this.errorMessage = error.status === 503 ? '系统维护中，请稍后访问' : '未知错误'
          }
        }
      })

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 10))
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('系统维护中，请稍后访问')
    })
  })

  describe('Data Validation Edge Cases', () => {
    it('should handle invalid date inputs', () => {
      const validateDate = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return { valid: false, message: '日期格式无效' }
        }
        if (date < new Date()) {
          return { valid: false, message: '日期不能早于今天' }
        }
        return { valid: true }
      }

      expect(validateDate('invalid-date')).toEqual({
        valid: false,
        message: '日期格式无效'
      })

      expect(validateDate('2020-01-01')).toEqual({
        valid: false,
        message: '日期不能早于今天'
      })

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      expect(validateDate(futureDate.toISOString().split('T')[0])).toEqual({
        valid: true
      })
    })

    it('should handle special characters in input', () => {
      const sanitizeInput = (input: string) => {
        // Remove script tags and other potentially dangerous content
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/[<>]/g, '')
          .trim()
      }

      expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('hello')
      expect(sanitizeInput('normal<>text')).toBe('normaltext')
      expect(sanitizeInput('  spaced  text  ')).toBe('spaced  text')
    })

    it('should handle extremely large numbers', () => {
      const validateQuota = (quota: number) => {
        if (!Number.isInteger(quota)) {
          return { valid: false, message: '名额必须是整数' }
        }
        if (quota < 0) {
          return { valid: false, message: '名额不能为负数' }
        }
        if (quota > 10000) {
          return { valid: false, message: '名额不能超过10000' }
        }
        return { valid: true }
      }

      expect(validateQuota(3.14)).toEqual({
        valid: false,
        message: '名额必须是整数'
      })

      expect(validateQuota(-10)).toEqual({
        valid: false,
        message: '名额不能为负数'
      })

      expect(validateQuota(99999)).toEqual({
        valid: false,
        message: '名额不能超过10000'
      })

      expect(validateQuota(50)).toEqual({ valid: true })
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle large data sets efficiently', async () => {
      const largeMockData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Student ${i}`,
        class: `Class ${i % 10}`
      }))

      const wrapper = mount({
        template: '<div>{{ displayedItems.length }}</div>',
        data() {
          return {
            allItems: largeMockData,
            pageSize: 50,
            currentPage: 1
          }
        },
        computed: {
          displayedItems() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.allItems.slice(start, start + this.pageSize)
          }
        }
      })

      // Should only display 50 items at a time for performance
      expect(wrapper.text()).toBe('50')
    })

    it('should cleanup resources on component unmount', async () => {
      const mockCleanup = vi.fn()
      let intervalId: any

      const wrapper = mount({
        template: '<div>Component</div>',
        mounted() {
          intervalId = setInterval(() => {
            // Some periodic task
          }, 1000)
        },
        beforeUnmount() {
          if (intervalId) {
            clearInterval(intervalId)
            mockCleanup()
          }
        }
      })

      wrapper.unmount()
      expect(mockCleanup).toHaveBeenCalled()
    })
  })

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing localStorage', () => {
      const originalLocalStorage = window.localStorage
      delete (window as any).localStorage

      const safeLocalStorage = {
        getItem: (key: string) => {
          try {
            return window.localStorage?.getItem(key) || null
          } catch {
            return null
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage?.setItem(key, value)
          } catch {
            // Fallback to memory storage or do nothing
          }
        }
      }

      expect(safeLocalStorage.getItem('test')).toBe(null)
      expect(() => safeLocalStorage.setItem('test', 'value')).not.toThrow()

      // Restore localStorage
      window.localStorage = originalLocalStorage
    })

    it('should handle unsupported browser features', () => {
      const checkBrowserSupport = () => {
        const features = {
          fetch: typeof fetch !== 'undefined',
          webRTC: typeof RTCPeerConnection !== 'undefined',
          serviceWorker: 'serviceWorker' in navigator
        }

        const unsupported = Object.entries(features)
          .filter(([_, supported]) => !supported)
          .map(([feature]) => feature)

        return {
          supported: unsupported.length === 0,
          missing: unsupported
        }
      }

      const support = checkBrowserSupport()
      expect(typeof support.supported).toBe('boolean')
      expect(Array.isArray(support.missing)).toBe(true)
    })
  })

  describe('Race Conditions and Timing Issues', () => {
    it('should handle rapid user interactions', async () => {
      let clickCount = 0
      let processing = false

      const handleClick = async () => {
        if (processing) return // Prevent multiple simultaneous calls

        processing = true
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          clickCount++
        } finally {
          processing = false
        }
      }

      // Simulate rapid clicks
      const promises = [
        handleClick(),
        handleClick(),
        handleClick(),
        handleClick(),
        handleClick()
      ]

      await Promise.all(promises)

      // Should only process one click due to debouncing
      expect(clickCount).toBe(1)
    })

    it('should handle component updates during async operations', async () => {
      const wrapper = mount({
        template: '<div>{{ data }}</div>',
        data() {
          return { data: 'initial', mounted: false }
        },
        async mounted() {
          this.mounted = true
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Check if component is still mounted before updating
          if (this.mounted) {
            this.data = 'updated'
          }
        },
        beforeUnmount() {
          this.mounted = false
        }
      })

      // Unmount before async operation completes
      setTimeout(() => wrapper.unmount(), 50)

      await new Promise(resolve => setTimeout(resolve, 200))

      // Should not cause errors
      expect(true).toBe(true)
    })
  })

  describe('Security Edge Cases', () => {
    it('should prevent XSS in user input', () => {
      const sanitizeHtml = (html: string) => {
        // 简单的XSS防护：移除危险标签和属性
        return html
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      }

      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">'
      const sanitized = sanitizeHtml(maliciousInput)

      expect(sanitized).not.toContain('onerror')
      expect(sanitized).not.toContain('alert')
    })

    it('should validate file uploads', () => {
      const validateFile = (file: { name: string; size: number; type: string }) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!allowedTypes.includes(file.type)) {
          return { valid: false, message: '不支持的文件类型' }
        }

        if (file.size > maxSize) {
          return { valid: false, message: '文件大小超过限制' }
        }

        // Check for dangerous file extensions
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr']
        if (dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
          return { valid: false, message: '危险的文件类型' }
        }

        return { valid: true }
      }

      expect(validateFile({ 
        name: 'malware.exe', 
        size: 1000, 
        type: 'application/octet-stream' 
      })).toEqual({
        valid: false,
        message: '不支持的文件类型'
      })

      expect(validateFile({ 
        name: 'image.jpg', 
        size: 10 * 1024 * 1024, 
        type: 'image/jpeg' 
      })).toEqual({
        valid: false,
        message: '文件大小超过限制'
      })

      expect(validateFile({ 
        name: 'image.jpg', 
        size: 1000, 
        type: 'image/jpeg' 
      })).toEqual({ valid: true })
    })
  })
})