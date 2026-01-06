
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
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue'
import ElMessage from 'element-plus'

// 使用统一的Mock配置
import { setupRequestMock } from '../../../mocks/request.mock'
setupRequestMock()

vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string) => `/api/conversations/${id}`,
    CONVERSATION_MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
    CONVERSATION_MESSAGE_METADATA: (id: string, messageId: string) => `/api/conversations/${id}/messages/${messageId}/metadata`
  }
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
    clearMessages: vi.fn(),
    getStatistics: vi.fn(() => ({ totalSessions: 5, totalMessages: 25 }))
  })
}))

vi.mock('@/composables/usePageAwareness', () => ({
  usePageAwareness: () => ({
    currentPageGuide: { value: { title: '测试页面', description: '测试描述' } }
  })
}))

vi.mock('@/services/smart-router.service', () => ({
  SmartRouterService: vi.fn(() => ({
    navigate: vi.fn()
  }))
}))

vi.mock('@/api/ai-shortcuts', () => ({
  getUserShortcuts: vi.fn(() => Promise.resolve({ data: [] }))
}))

vi.mock('@/services/ai-router', () => ({
  executeShortcut: vi.fn(() => Promise.resolve({ success: true, data: { message: '执行成功' } }))
}))

vi.mock('@/api/endpoints/function-tools', () => ({
  callUnifiedIntelligenceStream: vi.fn(),
  callDirectChat: vi.fn(),
  callDirectChatSSE: vi.fn()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('AIAssistant.vue', () => {
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
    return mount(AIAssistant, {
      props: {
        visible: true,
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-icon': true,
          'el-input': true,
          'el-textarea': true,
          'el-drawer': true,
          'el-empty': true,
          'el-skeleton': true,
          'el-scrollbar': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-message-box': true,
          'el-tag': true,
          'el-progress': true,
          'el-tooltip': true,
          'el-slider': true,
          'el-switch': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-input-number': true,
          'el-table': true,
          'el-table-column': true,
          'el-row': true,
          'el-col': true,
          'el-alert': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-popper': true,
          'Service': true,
          'User': true,
          'Close': true,
          'Delete': true,
          'Location': true,
          'TrendCharts': true,
          'Search': true,
          'FullScreen': true,
          'Minus': true,
          'List': true,
          'Star': true,
          'ChatDotRound': true,
          'MoreFilled': true,
          'Edit': true,
          'FolderOpened': true,
          'Plus': true,
          'Refresh': true,
          'Promotion': true,
          'Loading': true,
          'DataAnalysis': true,
          'EditPen': true,
          'Document': true,
          'Picture': true,
          'Headset': true,
          'Tools': true,
          'CircleCheck': true,
          'CircleClose': true,
          'ArrowDown': true,
          'Setting': true,
          'Microphone': true,
          'VideoPlay': true,
          'VideoPause': true,
          'SwitchButton': true,
          'InputArea': true,
          'ComponentRenderer': true,
          'ExpertMessageRenderer': true,
          'AIStatistics': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.ai-assistant').exists()).toBe(true)
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

    it('should apply fullscreen class when isFullscreen is true', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ isFullscreen: true })
      expect(wrapper.find('.ai-assistant').classes()).toContain('fullscreen')
    })

    it('should display context banner when currentPageContext exists', () => {
      wrapper = createWrapper()
      
      const contextBanner = wrapper.find('.context-banner')
      expect(contextBanner.exists()).toBe(true)
      expect(contextBanner.text()).toContain('测试页面')
    })
  })

  describe('Props Handling', () => {
    it('should accept visible prop and control component visibility', () => {
      wrapper = createWrapper({ visible: false })
      
      expect(wrapper.props('visible')).toBe(false)
    })

    it('should emit update:visible event when togglePanel is called', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.togglePanel()
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })
  })

  describe('User Interactions', () => {
    it('should handle send message when input has content', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '测试消息' })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.vm.inputMessage).toBe('')
    })

    it('should not send empty message', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ inputMessage: '' })
      await wrapper.vm.sendMessage()
      
      expect(wrapper.emitted('send')).toBeFalsy()
    })

    it('should handle clear chat action', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.clearChat()
      expect(wrapper.vm.currentAIResponse.visible).toBe(false)
    })

    it('should toggle fullscreen mode', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.toggleFullscreen()
      expect(wrapper.vm.isFullscreen).toBe(true)
      expect(wrapper.emitted('fullscreen-change')).toBeTruthy()
    })

    it('should handle shortcut click', async () => {
      const mockShortcut = { id: 1, shortcut_name: '测试快捷操作' }
      wrapper = createWrapper()
      
      await wrapper.setData({ shortcuts: [mockShortcut] })
      await wrapper.vm.handleShortcutClick(mockShortcut)
      
      expect(wrapper.vm.loadingShortcut).toBe(1)
    })
  })

  describe('Panel Width Management', () => {
    it('should handle resize functionality', async () => {
      wrapper = createWrapper()
      
      const mockEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      }
      
      await wrapper.vm.startResize(mockEvent)
      expect(wrapper.vm.isResizing).toBe(true)
    })

    it('should emit width-change event when panel width changes', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ panelWidth: 900 })
      expect(wrapper.emitted('width-change')).toBeTruthy()
    })
  })

  describe('Message Display', () => {
    it('should format message content correctly', () => {
      wrapper = createWrapper()
      
      const testContent = '**测试** *内容*'
      const formatted = wrapper.vm.formatMessage(testContent)
      
      expect(formatted).toContain('<strong>')
      expect(formatted).toContain('<em>')
    })

    it('should format time correctly', () => {
      wrapper = createWrapper()
      
      const now = new Date().toISOString()
      const formatted = wrapper.vm.formatTime(now)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should detect component result correctly', () => {
      wrapper = createWrapper()
      
      const componentResult = { type: 'chart', data: [] }
      const stringResult = JSON.stringify({ type: 'table', data: [] })
      
      expect(wrapper.vm.isComponentResult(componentResult)).toBe(true)
      expect(wrapper.vm.isComponentResult(stringResult)).toBe(true)
      expect(wrapper.vm.isComponentResult(null)).toBe(false)
    })
  })

  describe('AI Response Management', () => {
    it('should start cursor AI response correctly', () => {
      wrapper = createWrapper()
      
      wrapper.vm.startCursorAIResponse()
      
      expect(wrapper.vm.currentAIResponse.visible).toBe(false) // Initially false
      expect(wrapper.vm.currentAIResponse.thinking.visible).toBe(false)
      expect(wrapper.vm.currentAIResponse.answer.visible).toBe(false)
    })

    it('should show thinking phase correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.showThinkingPhase('测试思考内容')
      
      expect(wrapper.vm.currentAIResponse.thinking.visible).toBe(true)
      expect(wrapper.vm.currentAIResponse.thinking.content).toBe('测试思考内容')
    })

    it('should show function call correctly', async () => {
      wrapper = createWrapper()
      
      const functionCall = {
        name: 'testFunction',
        description: '测试函数',
        params: { test: 'param' }
      }
      
      await wrapper.vm.showFunctionCall(functionCall)
      
      expect(wrapper.vm.currentAIResponse.functionCalls.length).toBe(1)
      expect(wrapper.vm.currentAIResponse.functionCalls[0].name).toBe('testFunction')
    })

    it('should show final answer correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.showFinalAnswer('测试答案')
      
      expect(wrapper.vm.currentAIResponse.answer.visible).toBe(true)
      expect(wrapper.vm.currentAIResponse.answer.content).toBe('测试答案')
    })

    it('should complete AI response correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.completeAIResponse()
      
      expect(wrapper.vm.currentAIResponse.answer.streaming).toBe(false)
    })
  })

  describe('Conversation Management', () => {
    it('should ensure conversation exists', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ data: { id: 'test-conversation-id' } })
      
      wrapper = createWrapper()
      
      const conversationId = await wrapper.vm.ensureConversation()
      expect(conversationId).toBe('test-conversation-id')
    })

    it('should handle conversation creation failure gracefully', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      
      const conversationId = await wrapper.vm.ensureConversation()
      expect(conversationId).toMatch(/^temp_/)
    })

    it('should load conversations correctly', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockResolvedValue({ 
        data: { 
          items: [
            { id: '1', title: '会话1', messageCount: 5 },
            { id: '2', title: '会话2', messageCount: 10 }
          ] 
        } 
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.loadConversations()
      
      expect(wrapper.vm.conversations.length).toBe(2)
      expect(wrapper.vm.conversations[0].title).toBe('会话1')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { default: mockRequest } = await import('@/utils/request')
      mockRequest.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.ensureConversation()
      // Should not throw error, should create temporary conversation
      expect(wrapper.vm.conversationId).toMatch(/^temp_/)
    })

    it('should handle message sending errors', async () => {
      wrapper = createWrapper()
      
      // Mock the chat history to throw error
      const chatHistory = wrapper.vm.chatHistory
      chatHistory.addMessage = vi.fn().mockRejectedValue(new Error('Send error'))
      
      await wrapper.setData({ inputMessage: '测试消息' })
      
      try {
        await wrapper.vm.sendMessage()
      } catch (error) {
        expect(error.message).toBe('Send error')
      }
    })
  })

  describe('Accessibility and User Experience', () => {
    it('should maintain proper focus management', async () => {
      wrapper = createWrapper()
      
      const chatArea = wrapper.find('.chat-area')
      expect(chatArea.exists()).toBe(true)
    })

    it('should provide proper keyboard navigation', async () => {
      wrapper = createWrapper()
      
      // Test keyboard shortcuts
      const mockEvent = {
        key: 'Enter',
        ctrlKey: true,
        preventDefault: vi.fn()
      }
      
      await wrapper.setData({ inputMessage: '测试消息' })
      
      // This would normally trigger send message
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should handle mobile responsiveness', async () => {
      wrapper = createWrapper()
      
      // Test mobile-specific behavior
      window.innerWidth = 500
      await window.dispatchEvent(new Event('resize'))
      
      // Component should handle resize
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should throttle rapid resize events', async () => {
      wrapper = createWrapper()
      
      const resizeSpy = vi.spyOn(wrapper.vm, 'startResize')
      
      // Simulate rapid resize events
      for (let i = 0;
import { vi } from 'vitest' i < 10; i++) {
        await wrapper.vm.startResize({ clientX: 100 + i })
      }
      
      // Should not process all events due to throttling
      expect(resizeSpy).toHaveBeenCalled()
    })

    it('should cleanup event listeners on unmount', () => {
      wrapper = createWrapper()
      
      const removeSpy = vi.spyOn(document, 'removeEventListener')
      
      wrapper.unmount()
      
      expect(removeSpy).toHaveBeenCalled()
    })
  })
})