/**
 * InputArea 组件 - 错误处理增强测试
 * 目标：100% 测试覆盖率
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputArea from '@/components/ai-assistant/InputArea.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mock dependencies
vi.mock('@/utils/fileUpload', () => ({
  fileUploadManager: {
    uploadFile: vi.fn()
  }
}))

// Mock error tracking service
const mockErrorTracker = {
  captureException: vi.fn(),
  captureMessage: vi.fn()
}

vi.mock('@/utils/errorTracking', () => ({
  errorTracker: mockErrorTracker
}))

// 控制台错误检测变量
let consoleSpy: any

describe('InputArea - 错误处理增强测试 (100% 覆盖率)', () => {
  let wrapper: any

  const mockProps = {
    inputMessage: '',
    sending: false,
    webSearch: false,
    autoExecute: false,
    isRegistered: true,
    canAutoExecute: true,
    isListening: false,
    isSpeaking: false,
    speechStatus: 'idle',
    hasLastMessage: true
  }

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(InputArea, {
      global: {
        plugins: [ElementPlus, createTestingPinia()],
        stubs: {
          'el-input': true,
          'el-tooltip': true,
          'el-icon': true,
          'el-message': true
        }
      },
      props: mockProps
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('1. 网络错误 (100% 覆盖)', () => {
    describe('1.1 超时错误', () => {
      it('should handle network timeout errors', async () => {
        const timeoutError = new Error('Network timeout')
        timeoutError.name = 'TimeoutError'

        await wrapper.vm.handleSendMessage()
        await wrapper.vm.onError(timeoutError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('网络超时')
      })

      it('should show timeout duration in error message', async () => {
        const timeoutError = new Error('Timeout after 30s')
        timeoutError.name = 'TimeoutError'

        await wrapper.vm.onError(timeoutError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toMatch(/30.*秒/)
      })

      it('should suggest checking network connection', async () => {
        const timeoutError = new Error('Network timeout')
        timeoutError.name = 'TimeoutError'

        await wrapper.vm.onError(timeoutError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('检查网络连接')
      })
    })

    describe('1.2 自动重试', () => {
      it('should retry failed requests automatically', async () => {
        const sendSpy = vi.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({ success: true })

        wrapper.vm.sendMessage = sendSpy

        await wrapper.vm.handleSendMessage()
        await nextTick()

        // 等待重试
        await new Promise(resolve => setTimeout(resolve, 1500))

        expect(sendSpy).toHaveBeenCalledTimes(2)
      })

      it('should use exponential backoff for retries', async () => {
        const sendSpy = vi.fn().mockRejectedValue(new Error('Network error'))
        wrapper.vm.sendMessage = sendSpy

        const retryDelays: number[] = []
        const originalSetTimeout = global.setTimeout
        global.setTimeout = vi.fn((callback, delay) => {
          retryDelays.push(delay as number)
          return originalSetTimeout(callback, delay)
        }) as any

        await wrapper.vm.handleSendMessage()
        await new Promise(resolve => setTimeout(resolve, 10000))

        // 验证指数退避：1s, 2s, 4s, 8s
        expect(retryDelays[0]).toBe(1000)
        expect(retryDelays[1]).toBe(2000)
        expect(retryDelays[2]).toBe(4000)

        global.setTimeout = originalSetTimeout
      })

      it('should limit maximum retry attempts', async () => {
        const sendSpy = vi.fn().mockRejectedValue(new Error('Network error'))
        wrapper.vm.sendMessage = sendSpy

        await wrapper.vm.handleSendMessage()
        await new Promise(resolve => setTimeout(resolve, 30000))

        // 最多重试3次
        expect(sendSpy.mock.calls.length).toBeLessThanOrEqual(4) // 1次初始 + 3次重试
      })

      it('should stop retrying on success', async () => {
        const sendSpy = vi.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({ success: true })

        wrapper.vm.sendMessage = sendSpy

        await wrapper.vm.handleSendMessage()
        await new Promise(resolve => setTimeout(resolve, 3000))

        expect(sendSpy).toHaveBeenCalledTimes(2)
      })
    })

    describe('1.3 用户友好错误消息', () => {
      it('should show user-friendly error messages', async () => {
        const errors = [
          { error: new Error('ECONNREFUSED'), expected: '无法连接到服务器' },
          { error: new Error('ETIMEDOUT'), expected: '连接超时' },
          { error: new Error('ENOTFOUND'), expected: '找不到服务器' },
          { error: new Error('Network Error'), expected: '网络错误' }
        ]

        for (const { error, expected } of errors) {
          await wrapper.vm.onError(error)
          await nextTick()

          const errorMessage = wrapper.find('.error-message')
          expect(errorMessage.text()).toContain(expected)
        }
      })

      it('should translate technical errors to user language', async () => {
        const technicalError = new Error('ERR_CONNECTION_REFUSED')
        
        await wrapper.vm.onError(technicalError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).not.toContain('ERR_CONNECTION_REFUSED')
        expect(errorMessage.text()).toContain('连接被拒绝')
      })

      it('should provide actionable suggestions', async () => {
        const networkError = new Error('Network Error')
        
        await wrapper.vm.onError(networkError)
        await nextTick()

        const suggestions = wrapper.find('.error-suggestions')
        expect(suggestions.exists()).toBe(true)
        expect(suggestions.text()).toMatch(/重试|检查|刷新/)
      })
    })

    describe('1.4 错误日志记录', () => {
      it('should log errors to error tracking service', async () => {
        const error = new Error('Test error')
        
        await wrapper.vm.onError(error)
        await nextTick()

        expect(mockErrorTracker.captureException).toHaveBeenCalledWith(error, expect.any(Object))
      })

      it('should include context in error logs', async () => {
        const error = new Error('Test error')
        
        await wrapper.vm.onError(error)
        await nextTick()

        expect(mockErrorTracker.captureException).toHaveBeenCalledWith(
          error,
          expect.objectContaining({
            tags: expect.any(Object),
            extra: expect.any(Object)
          })
        )
      })

      it('should log user actions before error', async () => {
        await wrapper.setProps({ inputMessage: '测试消息' })
        await wrapper.vm.$emit('send')
        
        const error = new Error('Send failed')
        await wrapper.vm.onError(error)

        expect(mockErrorTracker.captureException).toHaveBeenCalledWith(
          error,
          expect.objectContaining({
            extra: expect.objectContaining({
              lastAction: 'send'
            })
          })
        )
      })
    })
  })

  describe('2. 文件上传错误 (100% 覆盖)', () => {
    describe('2.1 文件类型错误', () => {
      it('should handle unsupported file type error', async () => {
        const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
        
        await wrapper.vm.handleFileUpload(unsupportedFile)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('不支持的文件类型')
      })

      it('should list supported file types in error', async () => {
        const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
        
        await wrapper.vm.handleFileUpload(unsupportedFile)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toMatch(/支持.*txt.*pdf.*doc/)
      })

      it('should prevent upload of unsupported files', async () => {
        const uploadSpy = vi.fn()
        wrapper.vm.uploadFile = uploadSpy

        const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
        
        await wrapper.vm.handleFileUpload(unsupportedFile)
        await nextTick()

        expect(uploadSpy).not.toHaveBeenCalled()
      })
    })

    describe('2.2 文件大小错误', () => {
      it('should handle file size exceeded error', async () => {
        const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.txt') // 100MB
        Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 })
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('文件大小超过限制')
      })

      it('should show maximum file size in error', async () => {
        const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.txt')
        Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 })
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toMatch(/最大.*10.*MB/)
      })

      it('should suggest compressing large files', async () => {
        const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.txt')
        Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 })
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const suggestions = wrapper.find('.error-suggestions')
        expect(suggestions.text()).toContain('压缩')
      })
    })

    describe('2.3 损坏文件错误', () => {
      it('should handle corrupted file error', async () => {
        const corruptedFile = new File(['corrupted data'], 'corrupted.txt')
        
        const readSpy = vi.fn().mockRejectedValue(new Error('File read error'))
        wrapper.vm.readFile = readSpy

        await wrapper.vm.handleFileUpload(corruptedFile)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('文件损坏')
      })

      it('should suggest re-uploading corrupted files', async () => {
        const corruptedFile = new File(['corrupted data'], 'corrupted.txt')
        
        const readSpy = vi.fn().mockRejectedValue(new Error('File read error'))
        wrapper.vm.readFile = readSpy

        await wrapper.vm.handleFileUpload(corruptedFile)
        await nextTick()

        const suggestions = wrapper.find('.error-suggestions')
        expect(suggestions.text()).toContain('重新上传')
      })
    })

    describe('2.4 配额超限错误', () => {
      it('should handle upload quota exceeded error', async () => {
        const quotaError = new Error('Quota exceeded')
        quotaError.name = 'QuotaExceededError'

        await wrapper.vm.onUploadError(quotaError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toContain('存储空间不足')
      })

      it('should show current usage in quota error', async () => {
        const quotaError = new Error('Quota exceeded')
        quotaError.name = 'QuotaExceededError'

        wrapper.vm.storageUsage = { used: 950, total: 1000 }

        await wrapper.vm.onUploadError(quotaError)
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.text()).toMatch(/950.*1000/)
      })

      it('should suggest cleaning up old files', async () => {
        const quotaError = new Error('Quota exceeded')
        quotaError.name = 'QuotaExceededError'

        await wrapper.vm.onUploadError(quotaError)
        await nextTick()

        const suggestions = wrapper.find('.error-suggestions')
        expect(suggestions.text()).toContain('清理旧文件')
      })
    })
  })

  describe('3. 验证错误 (100% 覆盖)', () => {
    describe('3.1 输入验证', () => {
      it('should validate input before sending', async () => {
        await wrapper.setProps({ inputMessage: '' })

        await wrapper.vm.$emit('send')
        await nextTick()

        const errorMessage = wrapper.find('.validation-error')
        expect(errorMessage.text()).toContain('请输入消息')
      })

      it('should validate message length', async () => {
        const longMessage = 'x'.repeat(10000)
        await wrapper.setProps({ inputMessage: longMessage })

        await wrapper.vm.$emit('send')
        await nextTick()

        const errorMessage = wrapper.find('.validation-error')
        expect(errorMessage.text()).toContain('消息过长')
      })

      it('should validate special characters', async () => {
        const invalidMessage = '<script>alert("xss")</script>'
        await wrapper.setProps({ inputMessage: invalidMessage })

        await wrapper.vm.$emit('send')
        await nextTick()

        const errorMessage = wrapper.find('.validation-error')
        expect(errorMessage.text()).toContain('包含非法字符')
      })

      it('should sanitize input before sending', async () => {
        const unsafeMessage = '<script>alert("xss")</script>安全内容'
        await wrapper.setProps({ inputMessage: unsafeMessage })

        const sanitizeSpy = vi.fn().mockReturnValue('安全内容')
        wrapper.vm.sanitizeInput = sanitizeSpy

        await wrapper.vm.$emit('send')
        await nextTick()

        expect(sanitizeSpy).toHaveBeenCalledWith(unsafeMessage)
      })
    })

    describe('3.2 内联验证错误', () => {
      it('should show inline validation errors', async () => {
        await wrapper.setProps({ inputMessage: '' })

        const inputElement = wrapper.find('.el-input')
        await inputElement.trigger('blur')
        await nextTick()

        const inlineError = wrapper.find('.inline-error')
        expect(inlineError.exists()).toBe(true)
      })

      it('should clear inline errors on valid input', async () => {
        await wrapper.setProps({ inputMessage: '' })

        const inputElement = wrapper.find('.el-input')
        await inputElement.trigger('blur')
        await nextTick()

        expect(wrapper.find('.inline-error').exists()).toBe(true)

        await wrapper.setProps({ inputMessage: '有效消息' })
        await inputElement.trigger('input')
        await nextTick()

        expect(wrapper.find('.inline-error').exists()).toBe(false)
      })

      it('should highlight invalid input field', async () => {
        await wrapper.setProps({ inputMessage: '' })

        await wrapper.vm.$emit('send')
        await nextTick()

        const inputElement = wrapper.find('.el-input')
        expect(inputElement.classes()).toContain('is-error')
      })
    })

    describe('3.3 阻止无效提交', () => {
      it('should prevent submission with validation errors', async () => {
        const sendSpy = vi.fn()
        wrapper.vm.sendMessage = sendSpy

        await wrapper.setProps({ inputMessage: '' })
        await wrapper.vm.$emit('send')
        await nextTick()

        expect(sendSpy).not.toHaveBeenCalled()
      })

      it('should disable send button with validation errors', async () => {
        await wrapper.setProps({ inputMessage: '' })
        await nextTick()

        const sendButton = wrapper.find('.send-button')
        expect(sendButton.attributes('disabled')).toBeDefined()
      })

      it('should show validation summary', async () => {
        await wrapper.setProps({ inputMessage: '' })
        await wrapper.vm.$emit('send')
        await nextTick()

        const validationSummary = wrapper.find('.validation-summary')
        expect(validationSummary.exists()).toBe(true)
        expect(validationSummary.text()).toContain('1 个错误')
      })
    })
  })

  describe('4. 错误恢复 (100% 覆盖)', () => {
    describe('4.1 重试按钮', () => {
      it('should provide retry button for failed operations', async () => {
        const error = new Error('Operation failed')

        await wrapper.vm.onError(error)
        await nextTick()

        const retryButton = wrapper.find('.retry-button')
        expect(retryButton.exists()).toBe(true)
      })

      it('should retry operation on retry button click', async () => {
        const retrySpy = vi.fn()
        wrapper.vm.retryLastOperation = retrySpy

        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        const retryButton = wrapper.find('.retry-button')
        await retryButton.trigger('click')

        expect(retrySpy).toHaveBeenCalled()
      })

      it('should show loading state during retry', async () => {
        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        const retryButton = wrapper.find('.retry-button')
        await retryButton.trigger('click')
        await nextTick()

        expect(retryButton.classes()).toContain('is-loading')
      })

      it('should disable retry button during retry', async () => {
        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        const retryButton = wrapper.find('.retry-button')
        await retryButton.trigger('click')
        await nextTick()

        expect(retryButton.attributes('disabled')).toBeDefined()
      })
    })

    describe('4.2 状态恢复', () => {
      it('should restore previous state after error', async () => {
        const previousMessage = '之前的消息'
        await wrapper.setProps({ inputMessage: previousMessage })

        const previousState = wrapper.vm.saveState()

        await wrapper.setProps({ inputMessage: '新消息' })

        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        wrapper.vm.restoreState(previousState)
        await nextTick()

        expect(wrapper.props('inputMessage')).toBe(previousMessage)
      })

      it('should restore file uploads after error', async () => {
        const file = new File(['test'], 'test.txt')
        await wrapper.vm.addFilePreview(file)

        const previousState = wrapper.vm.saveState()

        await wrapper.vm.clearFiles()

        const error = new Error('Upload failed')
        await wrapper.vm.onError(error)
        await nextTick()

        wrapper.vm.restoreState(previousState)
        await nextTick()

        expect(wrapper.vm.files).toContainEqual(expect.objectContaining({ name: 'test.txt' }))
      })

      it('should restore scroll position after error', async () => {
        const scrollContainer = wrapper.find('.message-list')
        const previousScrollTop = 500

        await scrollContainer.trigger('scroll', { target: { scrollTop: previousScrollTop } })

        const previousState = wrapper.vm.saveState()

        await scrollContainer.trigger('scroll', { target: { scrollTop: 0 } })

        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        wrapper.vm.restoreState(previousState)
        await nextTick()

        expect(wrapper.vm.scrollTop).toBe(previousScrollTop)
      })
    })

    describe('4.3 错误状态清除', () => {
      it('should clear error state after successful retry', async () => {
        const error = new Error('Operation failed')
        await wrapper.vm.onError(error)
        await nextTick()

        expect(wrapper.vm.hasError).toBe(true)

        await wrapper.vm.retryLastOperation()
        await wrapper.vm.onSuccess()
        await nextTick()

        expect(wrapper.vm.hasError).toBe(false)
        expect(wrapper.find('.error-message').exists()).toBe(false)
      })

      it('should clear error on user input', async () => {
        const error = new Error('Validation error')
        await wrapper.vm.onError(error)
        await nextTick()

        expect(wrapper.find('.error-message').exists()).toBe(true)

        await wrapper.setProps({ inputMessage: '新输入' })
        await nextTick()

        expect(wrapper.find('.error-message').exists()).toBe(false)
      })

      it('should clear error after timeout', async () => {
        const error = new Error('Temporary error')
        await wrapper.vm.onError(error, { autoClear: true, timeout: 3000 })
        await nextTick()

        expect(wrapper.find('.error-message').exists()).toBe(true)

        await new Promise(resolve => setTimeout(resolve, 3500))

        expect(wrapper.find('.error-message').exists()).toBe(false)
      })
    })

    describe('4.4 错误边界', () => {
      it('should catch component errors', async () => {
        const errorHandler = vi.fn()
        wrapper.vm.$options.errorCaptured = errorHandler

        const childError = new Error('Child component error')
        wrapper.vm.$emit('error', childError)
        await nextTick()

        expect(errorHandler).toHaveBeenCalledWith(childError, expect.any(Object), expect.any(String))
      })

      it('should show fallback UI on critical error', async () => {
        const criticalError = new Error('Critical error')
        criticalError.name = 'CriticalError'

        await wrapper.vm.onError(criticalError)
        await nextTick()

        const fallbackUI = wrapper.find('.error-fallback')
        expect(fallbackUI.exists()).toBe(true)
      })

      it('should allow recovery from error boundary', async () => {
        const criticalError = new Error('Critical error')
        await wrapper.vm.onError(criticalError)
        await nextTick()

        const recoverButton = wrapper.find('.recover-button')
        await recoverButton.trigger('click')
        await nextTick()

        expect(wrapper.find('.error-fallback').exists()).toBe(false)
        expect(wrapper.find('.input-area-content').exists()).toBe(true)
      })
    })
  })
})

