/**
 * InputArea 组件 - 加载状态优化测试
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

// 控制台错误检测变量
let consoleSpy: any

describe('InputArea - 加载状态优化测试 (100% 覆盖率)', () => {
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

  describe('1. 骨架屏加载 (100% 覆盖)', () => {
    describe('1.1 组件初始化', () => {
      it('should show skeleton loader while component is initializing', async () => {
        const loadingWrapper = mount(InputArea, {
          global: {
            plugins: [ElementPlus, createTestingPinia()],
            stubs: {
              'el-input': true,
              'el-tooltip': true,
              'el-icon': true
            }
          },
          props: { ...mockProps, loading: true }
        })

        const skeleton = loadingWrapper.find('.skeleton-loader')
        expect(skeleton.exists()).toBe(true)

        loadingWrapper.unmount()
      })

      it('should replace skeleton with actual content when loaded', async () => {
        await wrapper.setProps({ loading: false })
        await nextTick()

        const skeleton = wrapper.find('.skeleton-loader')
        const actualContent = wrapper.find('.input-area-content')

        expect(skeleton.exists()).toBe(false)
        expect(actualContent.exists()).toBe(true)
      })

      it('should show skeleton for input area', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        const inputSkeleton = wrapper.find('.skeleton-input')
        expect(inputSkeleton.exists()).toBe(true)
      })

      it('should show skeleton for button group', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        const buttonSkeleton = wrapper.find('.skeleton-buttons')
        expect(buttonSkeleton.exists()).toBe(true)
      })

      it('should animate skeleton with shimmer effect', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        const skeleton = wrapper.find('.skeleton-loader')
        expect(skeleton.classes()).toContain('shimmer')
      })
    })

    describe('1.2 文件上传预览', () => {
      it('should show skeleton for file upload preview', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
        
        await wrapper.vm.handleFileUpload(mockFile)
        await nextTick()

        const fileSkeleton = wrapper.find('.file-preview-skeleton')
        expect(fileSkeleton.exists()).toBe(true)
      })

      it('should replace skeleton with file preview when loaded', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
        
        await wrapper.vm.handleFileUpload(mockFile)
        await nextTick()

        // 模拟文件加载完成
        await wrapper.vm.onFileLoaded(mockFile)
        await nextTick()

        const fileSkeleton = wrapper.find('.file-preview-skeleton')
        const filePreview = wrapper.find('.file-preview')

        expect(fileSkeleton.exists()).toBe(false)
        expect(filePreview.exists()).toBe(true)
      })

      it('should show skeleton for image preview', async () => {
        const mockImage = new File(['test'], 'test.png', { type: 'image/png' })
        
        await wrapper.vm.handleFileUpload(mockImage)
        await nextTick()

        const imageSkeleton = wrapper.find('.image-preview-skeleton')
        expect(imageSkeleton.exists()).toBe(true)
      })
    })

    describe('1.3 骨架屏样式', () => {
      it('should match component layout in skeleton', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        const skeleton = wrapper.find('.skeleton-loader')
        const skeletonHeight = skeleton.element.clientHeight

        await wrapper.setProps({ loading: false })
        await nextTick()

        const actualContent = wrapper.find('.input-area-content')
        const actualHeight = actualContent.element.clientHeight

        // 骨架屏高度应该与实际内容接近
        expect(Math.abs(skeletonHeight - actualHeight)).toBeLessThan(20)
      })

      it('should use appropriate skeleton colors', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        const skeleton = wrapper.find('.skeleton-loader')
        const computedStyle = window.getComputedStyle(skeleton.element)

        expect(computedStyle.backgroundColor).toBeTruthy()
      })
    })
  })

  describe('2. 渐进式加载 (100% 覆盖)', () => {
    describe('2.1 关键内容优先', () => {
      it('should load critical content first', async () => {
        const loadOrder: string[] = []

        wrapper.vm.onComponentLoaded = (name: string) => {
          loadOrder.push(name)
        }

        await wrapper.vm.initializeComponent()
        await nextTick()

        // 输入框应该最先加载
        expect(loadOrder[0]).toBe('input')
        // 发送按钮应该第二加载
        expect(loadOrder[1]).toBe('send-button')
      })

      it('should lazy load non-critical features', async () => {
        await wrapper.vm.initializeComponent()
        await nextTick()

        // 非关键功能应该延迟加载
        expect(wrapper.vm.voiceInputLoaded).toBe(false)
        expect(wrapper.vm.fileUploadLoaded).toBe(false)
      })

      it('should load features on demand', async () => {
        const fileButton = wrapper.findAll('.icon-btn')[2]
        
        expect(wrapper.vm.fileUploadLoaded).toBe(false)

        await fileButton.trigger('click')
        await nextTick()

        expect(wrapper.vm.fileUploadLoaded).toBe(true)
      })
    })

    describe('2.2 加载进度', () => {
      it('should show loading progress indicator', async () => {
        await wrapper.setProps({ loading: true, loadingProgress: 50 })
        await nextTick()

        const progressBar = wrapper.find('.loading-progress')
        expect(progressBar.exists()).toBe(true)
        expect(progressBar.attributes('style')).toContain('width: 50%')
      })

      it('should update progress as components load', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        let progress = wrapper.find('.loading-progress')
        expect(progress.attributes('style')).toContain('width: 0%')

        await wrapper.vm.onComponentLoaded('input')
        await nextTick()

        progress = wrapper.find('.loading-progress')
        expect(progress.attributes('style')).toContain('width: 33%')

        await wrapper.vm.onComponentLoaded('send-button')
        await nextTick()

        progress = wrapper.find('.loading-progress')
        expect(progress.attributes('style')).toContain('width: 66%')
      })

      it('should complete progress when all components loaded', async () => {
        await wrapper.setProps({ loading: true })
        await nextTick()

        await wrapper.vm.onAllComponentsLoaded()
        await nextTick()

        const progress = wrapper.find('.loading-progress')
        expect(progress.attributes('style')).toContain('width: 100%')
      })
    })

    describe('2.3 加载优先级', () => {
      it('should prioritize visible content', async () => {
        const loadSpy = vi.fn()
        wrapper.vm.loadComponent = loadSpy

        await wrapper.vm.initializeComponent()
        await nextTick()

        // 可见内容应该优先加载
        expect(loadSpy).toHaveBeenNthCalledWith(1, 'input', { priority: 'high' })
        expect(loadSpy).toHaveBeenNthCalledWith(2, 'send-button', { priority: 'high' })
      })

      it('should defer loading of below-fold content', async () => {
        const loadSpy = vi.fn()
        wrapper.vm.loadComponent = loadSpy

        await wrapper.vm.initializeComponent()
        await nextTick()

        // 折叠下方的内容应该延迟加载
        expect(loadSpy).toHaveBeenCalledWith('voice-input', { priority: 'low', defer: true })
      })
    })
  })

  describe('3. 加载反馈 (100% 覆盖)', () => {
    describe('3.1 文件上传加载', () => {
      it('should show spinner when uploading file', async () => {
        const mockFile = new File(['test'], 'test.txt')
        
        await wrapper.vm.handleFileUpload(mockFile)
        await nextTick()

        const spinner = wrapper.find('.upload-spinner')
        expect(spinner.exists()).toBe(true)
      })

      it('should show progress bar for large file uploads', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt') // 10MB
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const progressBar = wrapper.find('.upload-progress-bar')
        expect(progressBar.exists()).toBe(true)
      })

      it('should update progress bar during upload', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt')
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        // 模拟上传进度
        await wrapper.vm.onUploadProgress({ loaded: 5 * 1024 * 1024, total: 10 * 1024 * 1024 })
        await nextTick()

        const progressBar = wrapper.find('.upload-progress-bar')
        expect(progressBar.attributes('style')).toContain('width: 50%')
      })

      it('should show upload speed and remaining time', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt')
        
        await wrapper.vm.handleFileUpload(largeFile)
        await wrapper.vm.onUploadProgress({ loaded: 5 * 1024 * 1024, total: 10 * 1024 * 1024 })
        await nextTick()

        const uploadInfo = wrapper.find('.upload-info')
        expect(uploadInfo.text()).toMatch(/速度|剩余时间/)
      })
    })

    describe('3.2 加载文本提示', () => {
      it('should show loading text with estimated time', async () => {
        await wrapper.setProps({ loading: true, estimatedTime: 3 })
        await nextTick()

        const loadingText = wrapper.find('.loading-text')
        expect(loadingText.text()).toContain('预计 3 秒')
      })

      it('should update estimated time as loading progresses', async () => {
        await wrapper.setProps({ loading: true, estimatedTime: 5 })
        await nextTick()

        let loadingText = wrapper.find('.loading-text')
        expect(loadingText.text()).toContain('5 秒')

        await wrapper.setProps({ estimatedTime: 2 })
        await nextTick()

        loadingText = wrapper.find('.loading-text')
        expect(loadingText.text()).toContain('2 秒')
      })

      it('should show different messages for different loading stages', async () => {
        await wrapper.setProps({ loading: true, loadingStage: 'initializing' })
        await nextTick()

        let loadingText = wrapper.find('.loading-text')
        expect(loadingText.text()).toContain('初始化')

        await wrapper.setProps({ loadingStage: 'loading-components' })
        await nextTick()

        loadingText = wrapper.find('.loading-text')
        expect(loadingText.text()).toContain('加载组件')
      })
    })

    describe('3.3 取消长时间操作', () => {
      it('should allow canceling long-running operations', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt')
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const cancelButton = wrapper.find('.cancel-upload')
        expect(cancelButton.exists()).toBe(true)
      })

      it('should cancel upload on cancel button click', async () => {
        const cancelSpy = vi.fn()
        wrapper.vm.cancelUpload = cancelSpy

        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt')
        
        await wrapper.vm.handleFileUpload(largeFile)
        await nextTick()

        const cancelButton = wrapper.find('.cancel-upload')
        await cancelButton.trigger('click')

        expect(cancelSpy).toHaveBeenCalled()
      })

      it('should clean up after canceling operation', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt')
        
        await wrapper.vm.handleFileUpload(largeFile)
        await wrapper.vm.cancelUpload()
        await nextTick()

        expect(wrapper.vm.uploading).toBe(false)
        expect(wrapper.find('.upload-spinner').exists()).toBe(false)
      })
    })
  })

  describe('4. 乐观UI更新 (100% 覆盖)', () => {
    describe('4.1 乐观更新显示', () => {
      it('should show optimistic update before server response', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })

        // 发送消息
        await wrapper.vm.$emit('send')
        await nextTick()

        // 应该立即显示消息（乐观更新）
        const messageList = wrapper.vm.messages
        expect(messageList).toContainEqual(
          expect.objectContaining({
            content: message,
            status: 'sending'
          })
        )
      })

      it('should mark optimistic update with pending status', async () => {
        const message = '待发送消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const lastMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
        expect(lastMessage.status).toBe('sending')
        expect(lastMessage.optimistic).toBe(true)
      })

      it('should show loading indicator on optimistic message', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const messageElement = wrapper.findAll('.message-item').at(-1)
        const loadingIndicator = messageElement?.find('.message-loading')

        expect(loadingIndicator?.exists()).toBe(true)
      })
    })

    describe('4.2 错误回滚', () => {
      it('should rollback optimistic update on error', async () => {
        const message = '失败消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const initialMessageCount = wrapper.vm.messages.length

        // 模拟发送失败
        await wrapper.vm.onSendError(new Error('发送失败'))
        await nextTick()

        // 消息应该被移除
        expect(wrapper.vm.messages.length).toBe(initialMessageCount - 1)
      })

      it('should show error message after rollback', async () => {
        const message = '失败消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        await wrapper.vm.onSendError(new Error('发送失败'))
        await nextTick()

        const errorMessage = wrapper.find('.error-message')
        expect(errorMessage.exists()).toBe(true)
        expect(errorMessage.text()).toContain('发送失败')
      })

      it('should restore input after rollback', async () => {
        const message = '失败消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        // 输入应该被清空
        expect(wrapper.props('inputMessage')).toBe('')

        await wrapper.vm.onSendError(new Error('发送失败'))
        await nextTick()

        // 输入应该被恢复
        expect(wrapper.vm.restoredMessage).toBe(message)
      })

      it('should allow retry after rollback', async () => {
        const message = '失败消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        await wrapper.vm.onSendError(new Error('发送失败'))
        await nextTick()

        const retryButton = wrapper.find('.retry-send')
        expect(retryButton.exists()).toBe(true)
      })
    })

    describe('4.3 服务器响应合并', () => {
      it('should merge optimistic update with server response', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const optimisticMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
        const tempId = optimisticMessage.id

        // 模拟服务器响应
        const serverResponse = {
          id: 'server-123',
          content: message,
          timestamp: Date.now(),
          status: 'sent'
        }

        await wrapper.vm.onSendSuccess(serverResponse, tempId)
        await nextTick()

        const updatedMessage = wrapper.vm.messages.find((m: any) => m.id === 'server-123')
        expect(updatedMessage).toBeDefined()
        expect(updatedMessage.status).toBe('sent')
        expect(updatedMessage.optimistic).toBe(false)
      })

      it('should remove loading indicator after merge', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const tempId = wrapper.vm.messages[wrapper.vm.messages.length - 1].id

        await wrapper.vm.onSendSuccess({ id: 'server-123', content: message }, tempId)
        await nextTick()

        const messageElement = wrapper.findAll('.message-item').at(-1)
        const loadingIndicator = messageElement?.find('.message-loading')

        expect(loadingIndicator?.exists()).toBe(false)
      })

      it('should preserve optimistic updates during merge', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const optimisticMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
        const tempId = optimisticMessage.id

        // 用户在等待响应时添加了本地数据
        optimisticMessage.localData = { edited: true }

        await wrapper.vm.onSendSuccess({ id: 'server-123', content: message }, tempId)
        await nextTick()

        const mergedMessage = wrapper.vm.messages.find((m: any) => m.id === 'server-123')
        expect(mergedMessage.localData).toEqual({ edited: true })
      })
    })

    describe('4.4 乐观更新动画', () => {
      it('should animate optimistic message appearance', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const messageElement = wrapper.findAll('.message-item').at(-1)
        expect(messageElement?.classes()).toContain('fade-in')
      })

      it('should animate message status change', async () => {
        const message = '测试消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        const tempId = wrapper.vm.messages[wrapper.vm.messages.length - 1].id

        await wrapper.vm.onSendSuccess({ id: 'server-123', content: message }, tempId)
        await nextTick()

        const messageElement = wrapper.findAll('.message-item').at(-1)
        expect(messageElement?.classes()).toContain('status-change')
      })

      it('should animate rollback', async () => {
        const message = '失败消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        await wrapper.vm.onSendError(new Error('发送失败'))
        await nextTick()

        const messageElement = wrapper.findAll('.message-item').at(-1)
        expect(messageElement?.classes()).toContain('fade-out')
      })
    })
  })
})

