
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChatDialog from '@/components/ai-assistant/ChatDialog.vue'
import ElMessage from 'element-plus'

// Mock dependencies
vi.mock('@/api/ai-shortcuts', () => ({
  getUserShortcuts: vi.fn(() => Promise.resolve({ data: [] }))
}))

vi.mock('@/services/ai-router', () => ({
  executeShortcut: vi.fn(() => Promise.resolve({ success: true, data: { message: '执行成功' } }))
}))

vi.mock('@/api/endpoints/function-tools', () => ({
  callDirectChatSSE: vi.fn()
}))

vi.mock('@/composables/useSpeech', () => ({
  useSpeech: () => ({
    isListening: { value: false },
    isSpeaking: { value: false },
    speechStatus: { value: 'idle' },
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    stopSpeaking: vi.fn()
  })
}))

vi.mock('@/composables/useChatHistory', () => ({
  useChatHistory: () => ({
    currentMessages: { value: [] },
    addMessage: vi.fn(),
    clearMessages: vi.fn()
  })
}))

vi.mock('@/composables/usePageAwareness', () => ({
  usePageAwareness: () => ({
    currentPageGuide: { value: { title: '测试页面', description: '测试描述' } }
  })
}))

vi.mock('@/utils/fileUpload', () => ({
  fileUploadManager: {
    uploadFile: vi.fn(() => Promise.resolve({ data: { accessUrl: 'test-url', originalName: 'test-file' } }))
  }
}))

vi.mock('marked', () => ({
  marked: vi.fn((text) => `<p>${text}</p>`)
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html)
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ChatDialog.vue', () => {
  let wrapper: any
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock Element Plus message
    vi.spyOn(ElMessage, 'success').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'warning').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(ChatDialog, {
      props: {
        conversationId: 'test-conversation-id',
        panelWidth: 800,
        isFullscreen: false,
        webSearch: false,
        autoExecute: false,
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-button': true,
          'el-icon': true,
          'el-input': true,
          'el-textarea': true,
          'el-select': true,
          'el-option': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tooltip': true,
          'User': true,
          'Close': true,
          'Delete': true,
          'InfoFilled': true,
          'Location': true,
          'Microphone': true,
          'VideoPlay': true,
          'VideoPause': true,
          'TrendCharts': true,
          'Service': true,
          'Search': true,
          'DataAnalysis': true,
          'Document': true,
          'Picture': true,
          'Promotion': true,
          'Loading': true,
          'FullScreen': true,
          'Minus': true,
          'Headset': true,
          'Tools': true,
          'List': true,
          'CircleCheck': true,
          'CircleClose': true,
          'ArrowDown': true,
          'Setting': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.chat-dialog').exists()).toBe(true)
      expect(wrapper.find('.ai-header').exists()).toBe(true)
      expect(wrapper.find('.chat-area').exists()).toBe(true)
      expect(wrapper.find('.input-area').exists()).toBe(true)
    })

    it('should show welcome message when no messages exist', () => {
      wrapper = createWrapper()
      
      const welcomeMessage = wrapper.find('.message-item.assistant')
      expect(welcomeMessage.exists()).toBe(true)
      expect(welcomeMessage.text()).toContain('YY-AI智能助手')
    })

    it('should display context banner when page context exists', () => {
      wrapper = createWrapper()
      
      const contextBanner = wrapper.find('.context-banner')
      expect(contextBanner.exists()).toBe(true)
      expect(contextBanner.text()).toContain('测试页面')
    })

    it('should apply fullscreen class when isFullscreen is true', async () => {
      wrapper = createWrapper({ isFullscreen: true })
      
      expect(wrapper.find('.chat-dialog').classes()).toContain('fullscreen')
    })

    it('should show resize handle when not in fullscreen', () => {
      wrapper = createWrapper({ isFullscreen: false })
      
      expect(wrapper.find('.resize-handle').exists()).toBe(true)
    })

    it('should hide resize handle when in fullscreen', () => {
      wrapper = createWrapper({ isFullscreen: true })
      
      expect(wrapper.find('.resize-handle').exists()).toBe(false)
    })
  })

  describe('Props Handling', () => {
    it('should accept and pass conversationId prop', () => {
      wrapper = createWrapper({ conversationId: 'test-id' })
      
      expect(wrapper.props('conversationId')).toBe('test-id')
    })

    it('should accept and pass panelWidth prop', () => {
      wrapper = createWrapper({ panelWidth: 600 })
      
      expect(wrapper.props('panelWidth')).toBe(600)
    })

    it('should emit update events when props change', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.toggleFullscreen()
      expect(wrapper.emitted('update:isFullscreen')).toBeTruthy()
      expect(wrapper.emitted('fullscreen-change')).toBeTruthy()
    })

    it('should emit save-user-message when message is sent', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.emitted('save-user-message')).toBeTruthy()
    })
  })

  describe('Message Handling', () => {
    it('should format message content using marked and DOMPurify', () => {
      wrapper = createWrapper()
      
      const testContent = '**Bold** *Italic*'
      const formatted = wrapper.vm.formatMessage(testContent)
      
      expect(formatted).toContain('<p>')
      expect(formatted).toContain('<strong>')
      expect(formatted).toContain('<em>')
    })

    it('should handle markdown formatting errors gracefully', () => {
      const { marked } = require('marked')
      marked.mockImplementation(() => {
        throw new Error('Markdown error')
      })
      
      wrapper = createWrapper()
      
      const testContent = 'Test content\nNew line'
      const formatted = wrapper.vm.formatMessage(testContent)
      
      expect(formatted).toBe('Test content<br>New line')
    })

    it('should format time correctly', () => {
      wrapper = createWrapper()
      
      const now = new Date().toISOString()
      const formatted = wrapper.vm.formatTime(now)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should return "刚刚" for recent messages', () => {
      wrapper = createWrapper()
      
      const recentTime = new Date(Date.now() - 30000).toISOString() // 30 seconds ago
      const formatted = wrapper.vm.formatTime(recentTime)
      
      expect(formatted).toBe('刚刚')
    })

    it('should get status text correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusText('running')).toBe('执行中')
      expect(wrapper.vm.getStatusText('completed')).toBe('已完成')
      expect(wrapper.vm.getStatusText('failed')).toBe('失败')
      expect(wrapper.vm.getStatusText('unknown')).toBe('未知')
    })
  })

  describe('User Interactions', () => {
    it('should handle message sending with valid content', async () => {
      const { callDirectChatSSE } = await import('@/api/endpoints/function-tools')
      callDirectChatSSE.mockResolvedValue({ success: true })
      
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.vm.sending).toBe(false)
      expect(wrapper.vm.inputMessage).toBe('')
    })

    it('should not send empty messages', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '' })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.vm.sending).toBe(false)
      expect(wrapper.emitted('save-user-message')).toBeFalsy()
    })

    it('should not send messages while already sending', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息', sending: true })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.emitted('save-user-message')).toBeFalsy()
    })

    it('should handle message sending errors', async () => {
      const { callDirectChatSSE } = await import('@/api/endpoints/function-tools')
      callDirectChatSSE.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      await wrapper.vm.sendMessage()
      
      expect(ElMessage.error).toHaveBeenCalledWith('发送消息失败，请重试')
    })

    it('should clear chat correctly', () => {
      wrapper = createWrapper()
      
      wrapper.vm.clearChat()
      
      expect(wrapper.vm.currentAIResponse.visible).toBe(false)
      expect(wrapper.vm.currentAIResponse.thinking.visible).toBe(false)
      expect(wrapper.vm.currentAIResponse.answer.visible).toBe(false)
    })
  })

  describe('Shortcut Actions', () => {
    it('should handle shortcut click correctly', async () => {
      const mockShortcut = { id: 1, shortcut_name: '测试快捷操作' }
      const { executeShortcut } = await import('@/services/ai-router')
      
      wrapper = createWrapper()
      
      await wrapper.vm.handleShortcutClick(mockShortcut)
      
      expect(wrapper.vm.loadingShortcut).toBe(1)
      expect(executeShortcut).toHaveBeenCalledWith(mockShortcut)
    })

    it('should handle shortcut execution errors', async () => {
      const mockShortcut = { id: 1, shortcut_name: '测试快捷操作' }
      const { executeShortcut } = await import('@/services/ai-router')
      executeShortcut.mockRejectedValue(new Error('Shortcut failed'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.handleShortcutClick(mockShortcut)
      
      expect(ElMessage.error).toHaveBeenCalledWith('执行快捷操作失败')
    })

    it('should not execute shortcut if already loading', async () => {
      const mockShortcut = { id: 1, shortcut_name: '测试快捷操作' }
      const { executeShortcut } = await import('@/services/ai-router')
      
      wrapper = createWrapper()
      
      await wrapper.setData({ loadingShortcut: 1 })
      await wrapper.vm.handleShortcutClick(mockShortcut)
      
      expect(executeShortcut).not.toHaveBeenCalled()
    })
  })

  describe('File Upload', () => {
    it('should trigger file input click', () => {
      wrapper = createWrapper()
      
      const fileInput = { click: vi.fn() }
      wrapper.vm.fileInput = fileInput
      
      wrapper.vm.handleFileUpload()
      
      expect(fileInput.click).toHaveBeenCalled()
    })

    it('should trigger image input click', () => {
      wrapper = createWrapper()
      
      const imageInput = { click: vi.fn() }
      wrapper.vm.imageInput = imageInput
      
      wrapper.vm.handleImageUpload()
      
      expect(imageInput.click).toHaveBeenCalled()
    })

    it('should handle file selection correctly', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      }
      
      wrapper = createWrapper()
      
      await wrapper.vm.onFileSelected(mockEvent)
      
      expect(wrapper.vm.uploadingFile).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('文件上传成功')
    })

    it('should handle image selection correctly', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      }
      
      wrapper = createWrapper()
      
      await wrapper.vm.onImageSelected(mockEvent)
      
      expect(wrapper.vm.uploadingImage).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('图片上传成功')
    })

    it('should handle file upload errors', async () => {
      const { fileUploadManager } = await import('@/utils/fileUpload')
      fileUploadManager.uploadFile.mockRejectedValue(new Error('Upload failed'))
      
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      }
      
      wrapper = createWrapper()
      
      await wrapper.vm.onFileSelected(mockEvent)
      
      expect(ElMessage.error).toHaveBeenCalledWith('文件上传失败')
    })

    it('should validate file size', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
      const mockEvent = {
        target: {
          files: [largeFile],
          value: ''
        }
      }
      
      wrapper = createWrapper()
      
      await wrapper.vm.onFileSelected(mockEvent)
      
      expect(ElMessage.error).toHaveBeenCalledWith('文件大小不能超过10MB')
    })
  })

  describe('Voice Features', () => {
    it('should toggle voice input correctly', () => {
      const mockSpeech = {
        isListening: { value: false },
        startListening: vi.fn(),
        stopListening: vi.fn()
      }
      
      const { useSpeech } = require('@/composables/useSpeech')
      useSpeech.mockReturnValue(mockSpeech)
      
      wrapper = createWrapper()
      
      wrapper.vm.toggleVoiceInput()
      
      expect(mockSpeech.startListening).toHaveBeenCalled()
      
      mockSpeech.isListening.value = true
      wrapper.vm.toggleVoiceInput()
      
      expect(mockSpeech.stopListening).toHaveBeenCalled()
    })

    it('should toggle voice output correctly', () => {
      const mockSpeech = {
        isSpeaking: { value: false },
        speak: vi.fn(),
        stopSpeaking: vi.fn()
      }
      
      const { useSpeech } = require('@/composables/useSpeech')
      useSpeech.mockReturnValue(mockSpeech)
      
      wrapper = createWrapper()
      
      await wrapper.setData({ lastAIMessage: '测试消息' })
      
      wrapper.vm.toggleVoiceOutput()
      
      expect(mockSpeech.speak).toHaveBeenCalledWith('测试消息')
      
      mockSpeech.isSpeaking.value = true
      wrapper.vm.toggleVoiceOutput()
      
      expect(mockSpeech.stopSpeaking).toHaveBeenCalled()
    })

    it('should not play voice without last AI message', () => {
      const mockSpeech = {
        isSpeaking: { value: false },
        speak: vi.fn()
      }
      
      const { useSpeech } = require('@/composables/useSpeech')
      useSpeech.mockReturnValue(mockSpeech)
      
      wrapper = createWrapper()
      
      await wrapper.setData({ lastAIMessage: '' })
      
      wrapper.vm.toggleVoiceOutput()
      
      expect(mockSpeech.speak).not.toHaveBeenCalled()
    })
  })

  describe('AI Response Management', () => {
    it('should display current AI response correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        currentAIResponse: {
          visible: true,
          thinking: { visible: true, content: '思考中...' },
          functionCalls: [],
          answer: { visible: true, content: '回答内容' }
        }
      })
      
      const currentResponse = wrapper.find('.message-item.current-response')
      expect(currentResponse.exists()).toBe(true)
    })

    it('should handle thinking section collapse', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        currentAIResponse: {
          visible: true,
          thinking: { visible: true, collapsed: false, content: '思考中...' },
          functionCalls: [],
          answer: { visible: false }
        }
      })
      
      const thinkingHeader = wrapper.find('.thinking-header')
      await thinkingHeader.trigger('click')
      
      expect(wrapper.vm.currentAIResponse.thinking.collapsed).toBe(true)
    })

    it('should display function calls correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        currentAIResponse: {
          visible: true,
          thinking: { visible: false },
          functionCalls: [
            {
              name: 'testFunction',
              description: '测试函数',
              status: 'running',
              details: '执行详情'
            }
          ],
          answer: { visible: false }
        }
      })
      
      const functionCalls = wrapper.find('.function-calls-section')
      expect(functionCalls.exists()).toBe(true)
    })
  })

  describe('Resize Functionality', () => {
    it('should start resize correctly', () => {
      wrapper = createWrapper({ isFullscreen: false })
      
      const mockEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      }
      
      wrapper.vm.startResize(mockEvent)
      
      expect(wrapper.vm.isResizing).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should not start resize in fullscreen mode', () => {
      wrapper = createWrapper({ isFullscreen: true })
      
      const mockEvent = {
        clientX: 100,
        preventDefault: vi.fn()
      }
      
      wrapper.vm.startResize(mockEvent)
      
      expect(wrapper.vm.isResizing).toBe(false)
    })

    it('should handle mouse move during resize', () => {
      wrapper = createWrapper()
      
      // Setup resize state
      wrapper.vm.isResizing = true
      wrapper.vm.panelWidth = 800
      
      const mockEvent = {
        clientX: 50
      }
      
      // Simulate mouse move handler
      const handleMouseMove = vi.fn()
      document.addEventListener = vi.fn((event, handler) => {
        if (event === 'mousemove') {
          handleMouseMove.mockImplementation(handler)
        }
      })
      
      wrapper.vm.startResize({ clientX: 100, preventDefault: vi.fn() })
      handleMouseMove(mockEvent)
      
      // Should emit width change
      expect(wrapper.emitted('update:panelWidth')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper focus management', () => {
      wrapper = createWrapper()
      
      const inputArea = wrapper.find('.input-area')
      expect(inputArea.exists()).toBe(true)
    })

    it('should provide proper keyboard navigation', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      
      // Test Enter key
      const enterEvent = { key: 'Enter', ctrlKey: true }
      await wrapper.vm.sendMessage()
      
      expect(wrapper.emitted('save-user-message')).toBeTruthy()
    })

    it('should handle keyboard shortcuts correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      
      // Test Ctrl+Enter
      const textarea = wrapper.find('textarea')
      await textarea.trigger('keydown.ctrl.enter')
      
      expect(wrapper.emitted('save-user-message')).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('should handle window resize events', () => {
      wrapper = createWrapper()
      
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should maintain proper layout on different screen sizes', () => {
      wrapper = createWrapper()
      
      // Test different screen sizes
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
      
      const chatDialog = wrapper.find('.chat-dialog')
      expect(chatDialog.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })

    it('should handle rapid resize events gracefully', () => {
      wrapper = createWrapper()
      
      const startResizeSpy = vi.spyOn(wrapper.vm, 'startResize')
      
      // Simulate rapid resize events
      for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
        wrapper.vm.startResize({ clientX: 100 + i, preventDefault: vi.fn() })
      }
      
      expect(startResizeSpy).toHaveBeenCalledTimes(5)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { getUserShortcuts } = await import('@/api/ai-shortcuts')
      getUserShortcuts.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      // Should not throw error during mount
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle file upload errors gracefully', async () => {
      const { fileUploadManager } = await import('@/utils/fileUpload')
      fileUploadManager.uploadFile.mockRejectedValue(new Error('Upload failed'))
      
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockEvent = {
        target: {
          files: [mockFile],
          value: ''
        }
      }
      
      wrapper = createWrapper()
      
      await wrapper.vm.onFileSelected(mockEvent)
      
      expect(ElMessage.error).toHaveBeenCalledWith('文件上传失败')
    })

    it('should handle voice feature errors gracefully', () => {
      const mockSpeech = {
        isListening: { value: false },
        startListening: vi.fn(() => {
          throw new Error('Voice error')
        })
      }
      
      const { useSpeech } = require('@/composables/useSpeech')
      useSpeech.mockReturnValue(mockSpeech)
      
      wrapper = createWrapper()
      
      // Should not throw error
      expect(() => {
        wrapper.vm.toggleVoiceInput()
      }).not.toThrow()
    })
  })
})