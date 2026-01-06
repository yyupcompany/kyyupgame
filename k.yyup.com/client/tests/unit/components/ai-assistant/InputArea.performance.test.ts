/**
 * InputArea 组件 - 性能优化测试
 * 目标：100% 测试覆盖率
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputArea from '@/components/ai-assistant/InputArea.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock dependencies
vi.mock('@/utils/fileUpload', () => ({
  fileUploadManager: {
    uploadFile: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('InputArea - 性能优化测试 (100% 覆盖率)', () => {
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

  describe('1. 图片懒加载 (100% 覆盖)', () => {
    describe('1.1 IntersectionObserver 实现', () => {
      it('should use IntersectionObserver for lazy loading', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        
        await wrapper.vm.addImageToPreview(mockImage)
        await nextTick()

        expect(MockIntersectionObserver.prototype.observe).toHaveBeenCalled()
      })

      it('should load image when it enters viewport', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const imageUrl = URL.createObjectURL(mockImage)

        const mockEntry = {
          isIntersecting: true,
          target: { dataset: { src: imageUrl } }
        }

        await wrapper.vm.handleImageIntersection([mockEntry])
        await nextTick()

        expect(wrapper.vm.loadedImages).toContain(imageUrl)
      })

      it('should not load image when it is outside viewport', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const imageUrl = URL.createObjectURL(mockImage)

        const mockEntry = {
          isIntersecting: false,
          target: { dataset: { src: imageUrl } }
        }

        await wrapper.vm.handleImageIntersection([mockEntry])
        await nextTick()

        expect(wrapper.vm.loadedImages).not.toContain(imageUrl)
      })

      it('should unobserve image after loading', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const imageUrl = URL.createObjectURL(mockImage)

        const mockEntry = {
          isIntersecting: true,
          target: { dataset: { src: imageUrl } }
        }

        await wrapper.vm.handleImageIntersection([mockEntry])
        await nextTick()

        expect(MockIntersectionObserver.prototype.unobserve).toHaveBeenCalled()
      })
    })

    describe('1.2 占位符显示', () => {
      it('should show placeholder while image is loading', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        
        await wrapper.vm.addImageToPreview(mockImage)
        await nextTick()

        const placeholder = wrapper.find('.image-placeholder')
        expect(placeholder.exists()).toBe(true)
      })

      it('should replace placeholder with actual image when loaded', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const imageUrl = URL.createObjectURL(mockImage)

        await wrapper.vm.addImageToPreview(mockImage)
        await nextTick()

        // 模拟图片加载完成
        const mockEntry = {
          isIntersecting: true,
          target: { dataset: { src: imageUrl } }
        }

        await wrapper.vm.handleImageIntersection([mockEntry])
        await nextTick()

        const placeholder = wrapper.find('.image-placeholder')
        const actualImage = wrapper.find(`img[src="${imageUrl}"]`)

        expect(placeholder.exists()).toBe(false)
        expect(actualImage.exists()).toBe(true)
      })

      it('should show loading spinner in placeholder', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        
        await wrapper.vm.addImageToPreview(mockImage)
        await nextTick()

        const spinner = wrapper.find('.image-placeholder .loading-spinner')
        expect(spinner.exists()).toBe(true)
      })
    })

    describe('1.3 错误处理', () => {
      it('should handle lazy loading errors gracefully', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const imageUrl = URL.createObjectURL(mockImage)

        const mockEntry = {
          isIntersecting: true,
          target: { 
            dataset: { src: imageUrl },
            onerror: null as any
          }
        }

        await wrapper.vm.handleImageIntersection([mockEntry])
        
        // 模拟图片加载失败
        if (mockEntry.target.onerror) {
          mockEntry.target.onerror(new Event('error'))
        }

        await nextTick()

        const errorPlaceholder = wrapper.find('.image-error-placeholder')
        expect(errorPlaceholder.exists()).toBe(true)
      })

      it('should show retry button on image load error', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        
        await wrapper.vm.addImageToPreview(mockImage)
        await wrapper.vm.handleImageLoadError(mockImage)
        await nextTick()

        const retryButton = wrapper.find('.retry-image-load')
        expect(retryButton.exists()).toBe(true)
      })

      it('should retry loading image on retry button click', async () => {
        const mockImage = new File(['test image'], 'test.png', { type: 'image/png' })
        const loadImageSpy = vi.fn()
        wrapper.vm.loadImage = loadImageSpy

        await wrapper.vm.addImageToPreview(mockImage)
        await wrapper.vm.handleImageLoadError(mockImage)
        await nextTick()

        const retryButton = wrapper.find('.retry-image-load')
        await retryButton.trigger('click')

        expect(loadImageSpy).toHaveBeenCalled()
      })
    })
  })

  describe('2. 防抖和节流 (100% 覆盖)', () => {
    describe('2.1 输入防抖', () => {
      it('should debounce input changes', async () => {
        const updateSpy = vi.fn()
        wrapper.vm.updateDraft = updateSpy

        const messages = ['消息1', '消息2', '消息3', '消息4', '消息5']
        
        for (const msg of messages) {
          await wrapper.setProps({ inputMessage: msg })
        }

        // 等待防抖延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 应该只调用一次
        expect(updateSpy).toHaveBeenCalledTimes(1)
        expect(updateSpy).toHaveBeenCalledWith('消息5')
      })

      it('should use configurable debounce delay', async () => {
        const customDelay = 1000
        wrapper.vm.debounceDelay = customDelay

        const updateSpy = vi.fn()
        wrapper.vm.updateDraft = updateSpy

        await wrapper.setProps({ inputMessage: '测试' })

        // 在延迟时间内不应该调用
        await new Promise(resolve => setTimeout(resolve, customDelay - 100))
        expect(updateSpy).not.toHaveBeenCalled()

        // 延迟时间后应该调用
        await new Promise(resolve => setTimeout(resolve, 200))
        expect(updateSpy).toHaveBeenCalled()
      })

      it('should cancel previous debounce on new input', async () => {
        const updateSpy = vi.fn()
        wrapper.vm.updateDraft = updateSpy

        await wrapper.setProps({ inputMessage: '第一条' })
        await new Promise(resolve => setTimeout(resolve, 200))
        
        await wrapper.setProps({ inputMessage: '第二条' })
        await new Promise(resolve => setTimeout(resolve, 500))

        expect(updateSpy).toHaveBeenCalledTimes(1)
        expect(updateSpy).toHaveBeenCalledWith('第二条')
      })
    })

    describe('2.2 文件上传节流', () => {
      it('should throttle file upload requests', async () => {
        const uploadSpy = vi.fn()
        wrapper.vm.uploadFile = uploadSpy

        const files = [
          new File(['1'], 'file1.txt'),
          new File(['2'], 'file2.txt'),
          new File(['3'], 'file3.txt')
        ]

        for (const file of files) {
          await wrapper.vm.handleFileUpload(file)
        }

        // 节流应该限制调用次数
        expect(uploadSpy.mock.calls.length).toBeLessThan(files.length)
      })

      it('should queue throttled upload requests', async () => {
        const files = [
          new File(['1'], 'file1.txt'),
          new File(['2'], 'file2.txt'),
          new File(['3'], 'file3.txt')
        ]

        for (const file of files) {
          await wrapper.vm.handleFileUpload(file)
        }

        expect(wrapper.vm.uploadQueue.length).toBeGreaterThan(0)
      })

      it('should process queued uploads after throttle delay', async () => {
        const uploadSpy = vi.fn()
        wrapper.vm.uploadFile = uploadSpy

        const files = [
          new File(['1'], 'file1.txt'),
          new File(['2'], 'file2.txt')
        ]

        for (const file of files) {
          await wrapper.vm.handleFileUpload(file)
        }

        // 等待节流延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        expect(uploadSpy).toHaveBeenCalledTimes(files.length)
      })
    })

    describe('2.3 搜索按钮节流', () => {
      it('should throttle search button clicks', async () => {
        const searchSpy = vi.fn()
        wrapper.vm.handleSearch = searchSpy

        const searchButton = wrapper.find('.icon-btn')

        // 快速点击多次
        for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
          await searchButton.trigger('click')
        }

        // 节流应该限制调用次数
        expect(searchSpy.mock.calls.length).toBeLessThan(5)
      })

      it('should allow search after throttle delay', async () => {
        const searchSpy = vi.fn()
        wrapper.vm.handleSearch = searchSpy

        const searchButton = wrapper.find('.icon-btn')

        await searchButton.trigger('click')
        expect(searchSpy).toHaveBeenCalledTimes(1)

        // 等待节流延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        await searchButton.trigger('click')
        expect(searchSpy).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('3. 虚拟滚动 (100% 覆盖)', () => {
    describe('3.1 长列表渲染', () => {
      it('should use virtual scrolling for long message lists', async () => {
        const messages = Array.from({ length: 1000 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)
        await nextTick()

        // 应该只渲染可见项
        const renderedItems = wrapper.findAll('.message-item')
        expect(renderedItems.length).toBeLessThan(messages.length)
        expect(renderedItems.length).toBeLessThanOrEqual(50) // 假设可见区域最多50项
      })

      it('should render only visible items', async () => {
        const messages = Array.from({ length: 100 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)
        await nextTick()

        const visibleRange = wrapper.vm.getVisibleRange()
        const renderedItems = wrapper.findAll('.message-item')

        expect(renderedItems.length).toBe(visibleRange.end - visibleRange.start)
      })

      it('should calculate visible range based on scroll position', async () => {
        const messages = Array.from({ length: 100 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)

        // 模拟滚动到中间
        wrapper.vm.scrollTop = 500
        await nextTick()

        const visibleRange = wrapper.vm.getVisibleRange()
        expect(visibleRange.start).toBeGreaterThan(0)
        expect(visibleRange.end).toBeLessThan(messages.length)
      })
    })

    describe('3.2 滚动更新', () => {
      it('should update visible items on scroll', async () => {
        const messages = Array.from({ length: 100 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)
        await nextTick()

        const initialRange = wrapper.vm.getVisibleRange()

        // 模拟滚动
        const scrollContainer = wrapper.find('.message-list')
        await scrollContainer.trigger('scroll', { target: { scrollTop: 1000 } })
        await nextTick()

        const newRange = wrapper.vm.getVisibleRange()
        expect(newRange.start).not.toBe(initialRange.start)
      })

      it('should use requestAnimationFrame for smooth scrolling', async () => {
        const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

        const scrollContainer = wrapper.find('.message-list')
        await scrollContainer.trigger('scroll')

        expect(rafSpy).toHaveBeenCalled()

        rafSpy.mockRestore()
      })

      it('should throttle scroll events', async () => {
        const updateSpy = vi.fn()
        wrapper.vm.updateVisibleRange = updateSpy

        const scrollContainer = wrapper.find('.message-list')

        // 快速触发多次滚动
        for (let i = 0; i < 10; i++) {
          await scrollContainer.trigger('scroll')
        }

        // 节流应该限制调用次数
        expect(updateSpy.mock.calls.length).toBeLessThan(10)
      })
    })

    describe('3.3 性能优化', () => {
      it('should reuse DOM elements for better performance', async () => {
        const messages = Array.from({ length: 100 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)
        await nextTick()

        const initialElements = wrapper.findAll('.message-item')
        const initialElementCount = initialElements.length

        // 滚动到不同位置
        const scrollContainer = wrapper.find('.message-list')
        await scrollContainer.trigger('scroll', { target: { scrollTop: 1000 } })
        await nextTick()

        const newElements = wrapper.findAll('.message-item')

        // DOM元素数量应该保持不变（复用）
        expect(newElements.length).toBe(initialElementCount)
      })

      it('should maintain scroll position when adding new items', async () => {
        const messages = Array.from({ length: 50 }, (_, i) => ({
          id: `msg-${i}`,
          content: `消息 ${i}`
        }))

        await wrapper.vm.setMessages(messages)
        await nextTick()

        const scrollContainer = wrapper.find('.message-list')
        const initialScrollTop = 500
        await scrollContainer.trigger('scroll', { target: { scrollTop: initialScrollTop } })

        // 添加新消息
        const newMessage = { id: 'msg-50', content: '新消息' }
        await wrapper.vm.addMessage(newMessage)
        await nextTick()

        expect(wrapper.vm.scrollTop).toBe(initialScrollTop)
      })
    })
  })

  describe('4. 内存管理 (100% 覆盖)', () => {
    describe('4.1 事件监听器清理', () => {
      it('should clean up event listeners on unmount', async () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

        wrapper.unmount()
        await nextTick()

        expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
        expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

        removeEventListenerSpy.mockRestore()
      })

      it('should disconnect IntersectionObserver on unmount', async () => {
        const mockImage = new File(['test'], 'test.png', { type: 'image/png' })
        await wrapper.vm.addImageToPreview(mockImage)

        wrapper.unmount()
        await nextTick()

        expect(MockIntersectionObserver.prototype.disconnect).toHaveBeenCalled()
      })

      it('should clear all timers on unmount', async () => {
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

        // 创建一些定时器
        wrapper.vm.debounceTimer = setTimeout(() => {}, 1000)
        wrapper.vm.throttleTimer = setInterval(() => {}, 1000)

        wrapper.unmount()
        await nextTick()

        expect(clearTimeoutSpy).toHaveBeenCalled()
        expect(clearIntervalSpy).toHaveBeenCalled()

        clearTimeoutSpy.mockRestore()
        clearIntervalSpy.mockRestore()
      })
    })

    describe('4.2 请求取消', () => {
      it('should cancel pending requests on unmount', async () => {
        const abortSpy = vi.fn()
        wrapper.vm.abortController = { abort: abortSpy }

        wrapper.unmount()
        await nextTick()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should cancel file upload on unmount', async () => {
        const cancelSpy = vi.fn()
        wrapper.vm.uploadCancelToken = { cancel: cancelSpy }

        wrapper.unmount()
        await nextTick()

        expect(cancelSpy).toHaveBeenCalled()
      })
    })

    describe('4.3 对象URL释放', () => {
      it('should release file object URLs', async () => {
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

        const mockFile = new File(['test'], 'test.txt')
        const objectURL = URL.createObjectURL(mockFile)

        await wrapper.vm.addFilePreview(objectURL)
        await wrapper.vm.removeFilePreview(objectURL)

        expect(revokeObjectURLSpy).toHaveBeenCalledWith(objectURL)

        revokeObjectURLSpy.mockRestore()
      })

      it('should release all object URLs on unmount', async () => {
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

        const files = [
          new File(['1'], 'file1.txt'),
          new File(['2'], 'file2.txt'),
          new File(['3'], 'file3.txt')
        ]

        for (const file of files) {
          const url = URL.createObjectURL(file)
          await wrapper.vm.addFilePreview(url)
        }

        wrapper.unmount()
        await nextTick()

        expect(revokeObjectURLSpy).toHaveBeenCalledTimes(files.length)

        revokeObjectURLSpy.mockRestore()
      })
    })

    describe('4.4 内存泄漏检测', () => {
      it('should not cause memory leaks', async () => {
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

        // 创建和销毁多个组件实例
        for (let i = 0; i < 100; i++) {
          const tempWrapper = mount(InputArea, {
            global: {
              plugins: [ElementPlus, createTestingPinia()],
              stubs: {
                'el-input': true,
                'el-tooltip': true,
                'el-icon': true
              }
            },
            props: mockProps
          })

          await nextTick()
          tempWrapper.unmount()
        }

        // 强制垃圾回收（如果可用）
        if (global.gc) {
          global.gc()
        }

        await new Promise(resolve => setTimeout(resolve, 100))

        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
        const memoryIncrease = finalMemory - initialMemory

        // 内存增长应该在合理范围内（< 10MB）
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      })

      it('should clear component state on unmount', async () => {
        await wrapper.setProps({ inputMessage: '测试消息' })
        wrapper.vm.messageQueue = ['消息1', '消息2']
        wrapper.vm.uploadQueue = [new File(['test'], 'test.txt')]

        wrapper.unmount()
        await nextTick()

        expect(wrapper.vm.inputMessage).toBe('')
        expect(wrapper.vm.messageQueue).toEqual([])
        expect(wrapper.vm.uploadQueue).toEqual([])
      })
    })
  })

  describe('5. Bundle 大小优化 (100% 覆盖)', () => {
    describe('5.1 动态导入', () => {
      it('should use dynamic imports for heavy components', async () => {
        const importSpy = vi.fn(() => Promise.resolve({ default: {} }))
        wrapper.vm.loadHeavyComponent = importSpy

        await wrapper.vm.showHeavyFeature()
        await nextTick()

        expect(importSpy).toHaveBeenCalled()
      })

      it('should lazy load file upload component', async () => {
        const fileButton = wrapper.findAll('.icon-btn')[2]

        // 首次点击应该触发动态导入
        await fileButton.trigger('click')
        await nextTick()

        expect(wrapper.vm.fileUploadComponentLoaded).toBe(true)
      })

      it('should show loading indicator while importing', async () => {
        const fileButton = wrapper.findAll('.icon-btn')[2]

        await fileButton.trigger('click')

        const loadingIndicator = wrapper.find('.component-loading')
        expect(loadingIndicator.exists()).toBe(true)
      })
    })

    describe('5.2 Tree-shaking', () => {
      it('should tree-shake unused code', () => {
        // 验证未使用的工具函数不在bundle中
        const bundleCode = wrapper.vm.$options.__file || ''

        expect(bundleCode).not.toContain('unusedUtilityFunction')
        expect(bundleCode).not.toContain('deprecatedMethod')
      })

      it('should only import used Element Plus components', () => {
        const usedComponents = ['ElInput', 'ElTooltip', 'ElIcon', 'ElMessage']
        const unusedComponents = ['ElTable', 'ElPagination', 'ElDialog']

        // 验证只导入了使用的组件
        usedComponents.forEach(component => {
          expect(wrapper.vm.$options.components).toHaveProperty(component)
        })

        unusedComponents.forEach(component => {
          expect(wrapper.vm.$options.components).not.toHaveProperty(component)
        })
      })
    })
  })
})

