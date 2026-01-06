import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChatContainer from '@/components/ai/ChatContainer.vue'
import { createPinia } from 'pinia'
import { AI_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'

// Mock dependencies
vi.mock('@/utils/request')
vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    MESSAGE: {
      LIST: '/api/messages',
      SAVE: '/api/messages/save',
      SEND: '/api/messages/send'
    },
    FILE: {
      UPLOAD: '/api/files/upload'
    }
  }
}))

// Mock sub-components
vi.mock('@/components/ai/MessageList.vue', () => ({
  name: 'MessageList',
  template: '<div class="message-list-mock"><slot /></div>',
  methods: {
    scrollToBottom: vi.fn()
  }
}))

vi.mock('@/components/ai/MessageInput.vue', () => ({
  name: 'MessageInput',
  template: '<div class="message-input-mock"><slot /></div>',
  props: ['disabled'],
  emits: ['send', 'upload-image', 'voice-input']
}))

vi.mock('@/components/ai/ChatSettings.vue', () => ({
  name: 'ChatSettings',
  template: '<div class="chat-settings-mock">Settings</div>',
  props: ['modelConfig'],
  emits: ['close', 'settings-changed']
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ChatContainer.vue', () => {
  let wrapper: any
  let pinia: any

  const mockMessages = [
    {
      id: '1',
      role: 'user',
      content: '用户消息',
      timestamp: '2023-01-01T00:00:00Z',
      status: 'sent'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'AI回复',
      timestamp: '2023-01-01T00:00:01Z',
      status: 'received'
    }
  ]

  const mockMessageListResponse = {
    data: {
      items: mockMessages
    }
  }

  const mockSendMessageResponse = {
    data: {
      content: 'AI的新回复',
      components: [
        {
          type: 'chart',
          data: { labels: ['A', 'B'], values: [1, 2] }
        }
      ]
    }
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup Pinia
    pinia = createPinia()

    // Mock API responses
    vi.mocked(request.get).mockResolvedValue(mockMessageListResponse)
    vi.mocked(request.post).mockResolvedValue(mockSendMessageResponse)

    // Mount component
    wrapper = mount(ChatContainer, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-dialog': true
        },
        components: {
          MessageList: require('@/components/ai/MessageList.vue').default,
          MessageInput: require('@/components/ai/MessageInput.vue').default,
          ChatSettings: require('@/components/ai/ChatSettings.vue').default
        }
      },
      props: {
        conversationId: 'test-conversation',
        title: 'AI助手',
        subtitle: '智能对话'
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    wrapper.unmount()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.find('.chat-container').exists()).toBe(true)
      expect(wrapper.find('.chat-header').exists()).toBe(true)
      expect(wrapper.find('.chat-title h2').text()).toBe('AI助手')
      expect(wrapper.find('.chat-subtitle').text()).toBe('智能对话')
    })

    it('should display custom title and subtitle', async () => {
      await wrapper.setProps({
        title: '自定义标题',
        subtitle: '自定义副标题'
      })
      
      expect(wrapper.find('.chat-title h2').text()).toBe('自定义标题')
      expect(wrapper.find('.chat-subtitle').text()).toBe('自定义副标题')
    })

    it('should generate conversation ID if not provided', () => {
      const wrapperWithoutId = mount(ChatContainer, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-icon': true,
            'el-button': true,
            'el-dialog': true
          },
          components: {
            MessageList: require('@/components/ai/MessageList.vue').default,
            MessageInput: require('@/components/ai/MessageInput.vue').default,
            ChatSettings: require('@/components/ai/ChatSettings.vue').default
          }
        }
      })
      
      expect(wrapperWithoutId.vm.conversationId).toMatch(/^conv_\d+$/)
      wrapperWithoutId.unmount()
    })

    it('should display chat actions', () => {
      expect(wrapper.find('.chat-actions').exists()).toBe(true)
      expect(wrapper.findAll('.chat-actions .el-button').length).toBe(2)
    })

    it('should display message list and input containers', () => {
      expect(wrapper.find('.message-list-mock').exists()).toBe(true)
      expect(wrapper.find('.message-input-container').exists()).toBe(true)
    })

    it('should not show settings panel by default', () => {
      expect(wrapper.find('.chat-settings-mock').exists()).toBe(false)
    })
  })

  describe('Message Loading', () => {
    it('should load messages on mount', async () => {
      expect(wrapper.vm.loading).toBe(true)
      
      await nextTick()
      
      expect(request.get).toHaveBeenCalledWith(AI_ENDPOINTS.MESSAGE.LIST, {
        params: { conversationId: 'test-conversation' }
      })
      expect(wrapper.vm.messages).toEqual(mockMessages)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle message loading error', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('加载失败'))
      
      await nextTick()
      
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.messages).toEqual([])
    })

    it('should reload messages when conversation ID changes', async () => {
      await nextTick()
      
      // Reset mock
      vi.mocked(request.get).mockClear()
      
      await wrapper.setProps({ conversationId: 'new-conversation' })
      
      expect(request.get).toHaveBeenCalledWith(AI_ENDPOINTS.MESSAGE.LIST, {
        params: { conversationId: 'new-conversation' }
      })
    })

    it('should show loading state during message loading', async () => {
      // Simulate loading state
      wrapper.vm.loading = true
      await nextTick()
      
      expect(wrapper.find('.message-list-mock').exists()).toBe(true)
    })
  })

  describe('Message Sending', () => {
    it('should send message correctly', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      expect(wrapper.vm.messages).toHaveLength(3) // 2 existing + 1 new user message
      expect(wrapper.vm.messages[2]).toEqual(
        expect.objectContaining({
          role: 'user',
          content: testMessage,
          status: 'sent'
        })
      )
    })

    it('should not send empty message', async () => {
      await nextTick()
      
      await wrapper.vm.handleSendMessage('')
      
      expect(request.post).not.toHaveBeenCalled()
      expect(wrapper.vm.messages).toHaveLength(2) // Only existing messages
    })

    it('should save user message to API', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      expect(request.post).toHaveBeenCalledWith(AI_ENDPOINTS.MESSAGE.SAVE, {
        conversationId: 'test-conversation',
        message: expect.objectContaining({
          role: 'user',
          content: testMessage
        })
      })
    })

    it('should send message to AI API', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      expect(request.post).toHaveBeenCalledWith(AI_ENDPOINTS.MESSAGE.SEND, {
        conversationId: 'test-conversation',
        content: testMessage,
        modelId: 1
      })
    })

    it('should add AI response to messages', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      expect(wrapper.vm.messages).toHaveLength(4) // 2 existing + 1 user + 1 AI
      expect(wrapper.vm.messages[3]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'AI的新回复',
          status: 'received',
          components: [
            {
              type: 'chart',
              data: { labels: ['A', 'B'], values: [1, 2] }
            }
          ]
        })
      )
    })

    it('should save AI response to API', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      // Should be called twice: once for user message, once for AI response
      expect(request.post).toHaveBeenCalledTimes(2)
      
      const secondCall = vi.mocked(request.post).mock.calls[1]
      expect(secondCall[0]).toBe(AI_ENDPOINTS.MESSAGE.SAVE)
      expect(secondCall[1].message.role).toBe('assistant')
    })

    it('should disable input during sending', async () => {
      await nextTick()
      
      const testMessage = '测试消息'
      
      // Start sending
      wrapper.vm.handleSendMessage(testMessage)
      
      expect(wrapper.vm.inputDisabled).toBe(true)
      expect(wrapper.vm.loading).toBe(true)
      
      // Wait for async operation to complete
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.vm.inputDisabled).toBe(false)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should scroll to bottom after message is sent', async () => {
      await nextTick()
      
      const scrollToBottomSpy = vi.fn()
      wrapper.vm.messageList = {
        scrollToBottom: scrollToBottomSpy
      }
      
      const testMessage = '测试消息'
      await wrapper.vm.handleSendMessage(testMessage)
      
      expect(scrollToBottomSpy).toHaveBeenCalled()
    })
  })

  describe('Image Upload', () => {
    it('should handle image upload correctly', async () => {
      await nextTick()
      
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      await wrapper.vm.handleUploadImage(mockFile)
      
      expect(wrapper.vm.messages).toHaveLength(3) // 2 existing + 1 new user message with image
      expect(wrapper.vm.messages[2]).toEqual(
        expect.objectContaining({
          role: 'user',
          content: '',
          status: 'sent',
          attachments: [
            {
              type: 'image',
              url: expect.stringContaining('blob:'),
              name: 'test.png'
            }
          ]
        })
      )
    })

    it('should upload image to API', async () => {
      await nextTick()
      
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      await wrapper.vm.handleUploadImage(mockFile)
      
      expect(request.post).toHaveBeenCalledWith(AI_ENDPOINTS.FILE.UPLOAD, expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should disable input during image upload', async () => {
      await nextTick()
      
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      wrapper.vm.handleUploadImage(mockFile)
      
      expect(wrapper.vm.inputDisabled).toBe(true)
      expect(wrapper.vm.loading).toBe(true)
    })

    it('should handle image upload error', async () => {
      vi.mocked(request.post).mockRejectedValue(new Error('上传失败'))
      
      await nextTick()
      
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      await wrapper.vm.handleUploadImage(mockFile)
      
      expect(wrapper.vm.messages).toHaveLength(3) // 2 existing + 1 error message
      expect(wrapper.vm.messages[2]).toEqual(
        expect.objectContaining({
          role: 'system',
          content: '图片处理失败，请重试。',
          status: 'error'
        })
      )
    })

    it('should re-enable input after image upload error', async () => {
      vi.mocked(request.post).mockRejectedValue(new Error('上传失败'))
      
      await nextTick()
      
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      await wrapper.vm.handleUploadImage(mockFile)
      
      expect(wrapper.vm.inputDisabled).toBe(false)
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Voice Input', () => {
    let mockStore: any

    beforeEach(() => {
      mockStore = {
        chat: {
          transcribeAudio: vi.fn()
        }
      }
      
      // Mock global store
      global.store = mockStore
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should handle voice input correctly', async () => {
      await nextTick()
      
      const mockBlob = new Blob(['test audio'], { type: 'audio/webm' })
      const mockResponse = { text: '语音转文字结果' }
      
      mockStore.chat.transcribeAudio.mockResolvedValue(mockResponse)
      
      await wrapper.vm.handleVoiceInput(mockBlob)
      
      expect(wrapper.vm.loading).toBe(true)
      expect(mockStore.chat.transcribeAudio).toHaveBeenCalled()
    })

    it('should send transcribed text as message', async () => {
      await nextTick()
      
      const mockBlob = new Blob(['test audio'], { type: 'audio/webm' })
      const mockResponse = { text: '语音转文字结果' }
      
      mockStore.chat.transcribeAudio.mockResolvedValue(mockResponse)
      
      await wrapper.vm.handleVoiceInput(mockBlob)
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.vm.messages).toHaveLength(3) // 2 existing + 1 new message
      expect(wrapper.vm.messages[2]).toEqual(
        expect.objectContaining({
          role: 'user',
          content: '语音转文字结果'
        })
      )
    })

    it('should handle voice input error', async () => {
      await nextTick()
      
      const mockBlob = new Blob(['test audio'], { type: 'audio/webm' })
      
      mockStore.chat.transcribeAudio.mockRejectedValue(new Error('语音识别失败'))
      
      await wrapper.vm.handleVoiceInput(mockBlob)
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Message Actions', () => {
    it('should retry failed message', async () => {
      await nextTick()
      
      // Add a failed message
      const failedMessage = {
        id: '3',
        role: 'system',
        content: '消息发送失败',
        timestamp: '2023-01-01T00:00:02Z',
        status: 'error'
      }
      wrapper.vm.messages.push(failedMessage)
      
      const userMessage = {
        id: '2',
        role: 'user',
        content: '用户消息',
        timestamp: '2023-01-01T00:00:01Z',
        status: 'sent'
      }
      wrapper.vm.messages.push(userMessage)
      
      await wrapper.vm.handleRetry('3')
      
      expect(wrapper.vm.messages).toHaveLength(2) // Failed message removed
      expect(request.post).toHaveBeenCalledWith(AI_ENDPOINTS.MESSAGE.SEND, expect.objectContaining({
        content: '用户消息'
      }))
    })

    it('should not retry if no previous user message found', async () => {
      await nextTick()
      
      const failedMessage = {
        id: '3',
        role: 'system',
        content: '消息发送失败',
        timestamp: '2023-01-01T00:00:02Z',
        status: 'error'
      }
      wrapper.vm.messages.push(failedMessage)
      
      await wrapper.vm.handleRetry('3')
      
      expect(request.post).not.toHaveBeenCalled()
    })

    it('should clear chat correctly', async () => {
      await nextTick()
      
      vi.mocked(request.get).mockResolvedValue({ data: { items: [] } })
      
      await wrapper.vm.clearChat()
      
      expect(wrapper.vm.messages).toEqual([])
    })

    it('should handle clear chat error', async () => {
      await nextTick()
      
      vi.mocked(request.get).mockRejectedValue(new Error('清空失败'))
      
      await wrapper.vm.clearChat()
      
      expect(wrapper.vm.messages).toEqual(mockMessages) // Should remain unchanged
    })
  })

  describe('Settings Panel', () => {
    it('should toggle settings panel', async () => {
      expect(wrapper.vm.showSettings).toBe(false)
      
      await wrapper.vm.toggleSettings()
      
      expect(wrapper.vm.showSettings).toBe(true)
      expect(wrapper.find('.chat-settings-mock').exists()).toBe(true)
    })

    it('should close settings panel when toggle is called again', async () => {
      wrapper.vm.showSettings = true
      
      await wrapper.vm.toggleSettings()
      
      expect(wrapper.vm.showSettings).toBe(false)
    })

    it('should handle settings changed', async () => {
      const newConfig = {
        modelId: 2,
        modelName: '新模型',
        contextWindow: 8192,
        maxTokens: 4096
      }
      
      await wrapper.vm.handleSettingsChanged(newConfig)
      
      expect(wrapper.vm.modelConfig).toEqual(newConfig)
      expect(wrapper.vm.showSettings).toBe(false)
    })
  })

  describe('Message List Integration', () => {
    it('should pass messages to MessageList component', async () => {
      await nextTick()
      
      const messageList = wrapper.findComponent({ name: 'MessageList' })
      expect(messageList.props('messages')).toEqual(mockMessages)
      expect(messageList.props('loading')).toBe(false)
    })

    it('should pass loading state to MessageList component', () => {
      wrapper.vm.loading = true
      
      const messageList = wrapper.findComponent({ name: 'MessageList' })
      expect(messageList.props('loading')).toBe(true)
    })

    it('should handle retry event from MessageList', async () => {
      await nextTick()
      
      const messageList = wrapper.findComponent({ name: 'MessageList' })
      const handleRetrySpy = vi.spyOn(wrapper.vm, 'handleRetry')
      
      await messageList.vm.$emit('retry', 'test-message-id')
      
      expect(handleRetrySpy).toHaveBeenCalledWith('test-message-id')
    })
  })

  describe('Message Input Integration', () => {
    it('should pass disabled state to MessageInput component', () => {
      wrapper.vm.inputDisabled = true
      
      const messageInput = wrapper.findComponent({ name: 'MessageInput' })
      expect(messageInput.props('disabled')).toBe(true)
    })

    it('should handle send event from MessageInput', async () => {
      const messageInput = wrapper.findComponent({ name: 'MessageInput' })
      const handleSendMessageSpy = vi.spyOn(wrapper.vm, 'handleSendMessage')
      
      await messageInput.vm.$emit('send', '测试消息')
      
      expect(handleSendMessageSpy).toHaveBeenCalledWith('测试消息')
    })

    it('should handle upload-image event from MessageInput', async () => {
      const messageInput = wrapper.findComponent({ name: 'MessageInput' })
      const handleUploadImageSpy = vi.spyOn(wrapper.vm, 'handleUploadImage')
      
      const mockFile = new File(['test'], 'test.png')
      await messageInput.vm.$emit('upload-image', mockFile)
      
      expect(handleUploadImageSpy).toHaveBeenCalledWith(mockFile)
    })

    it('should handle voice-input event from MessageInput', async () => {
      const messageInput = wrapper.findComponent({ name: 'MessageInput' })
      const handleVoiceInputSpy = vi.spyOn(wrapper.vm, 'handleVoiceInput')
      
      const mockBlob = new Blob(['test'], { type: 'audio/webm' })
      await messageInput.vm.$emit('voice-input', mockBlob)
      
      expect(handleVoiceInputSpy).toHaveBeenCalledWith(mockBlob)
    })
  })

  describe('Chat Settings Integration', () => {
    it('should pass model config to ChatSettings component', () => {
      wrapper.vm.showSettings = true
      
      const chatSettings = wrapper.findComponent({ name: 'ChatSettings' })
      expect(chatSettings.props('modelConfig')).toEqual(wrapper.vm.modelConfig)
    })

    it('should handle close event from ChatSettings', async () => {
      wrapper.vm.showSettings = true
      
      const chatSettings = wrapper.findComponent({ name: 'ChatSettings' })
      await chatSettings.vm.$emit('close')
      
      expect(wrapper.vm.showSettings).toBe(false)
    })

    it('should handle settings-changed event from ChatSettings', async () => {
      wrapper.vm.showSettings = true
      
      const chatSettings = wrapper.findComponent({ name: 'ChatSettings' })
      const newConfig = {
        modelId: 2,
        modelName: '新模型',
        contextWindow: 8192,
        maxTokens: 4096
      }
      
      await chatSettings.vm.$emit('settings-changed', newConfig)
      
      expect(wrapper.vm.modelConfig).toEqual(newConfig)
      expect(wrapper.vm.showSettings).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const chatContainer = wrapper.find('.chat-container')
      expect(chatContainer.attributes('role')).toBeUndefined()
      
      const buttons = wrapper.findAll('.chat-actions button')
      buttons.forEach(button => {
        expect(button.attributes('type')).toBe('text')
      })
    })

    it('should handle keyboard navigation', async () => {
      const clearButton = wrapper.find('.chat-actions button:first-child')
      await clearButton.trigger('keydown.enter')
      
      expect(wrapper.vm.messages).toEqual([])
    })

    it('should provide proper feedback for actions', async () => {
      await wrapper.vm.clearChat()
      
      // Should not throw errors
      expect(wrapper.vm.messages).toEqual([])
    })
  })

  describe('Performance', () => {
    it('should handle large number of messages efficiently', async () => {
      const largeMessageList = Array(100).fill(null).map((_, index) => ({
        id: index.toString(),
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `消息 ${index}`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      }))
      
      vi.mocked(request.get).mockResolvedValue({ data: { items: largeMessageList } })
      
      await wrapper.setProps({ conversationId: 'large-conversation' })
      await nextTick()
      
      expect(wrapper.vm.messages.length).toBe(100)
    })

    it('should cleanup event listeners properly', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })

    it('should handle rapid message sending', async () => {
      await nextTick()
      
      // Simulate rapid sending
      wrapper.vm.handleSendMessage('消息1')
      wrapper.vm.handleSendMessage('消息2')
      
      // Should handle gracefully
      expect(wrapper.vm.inputDisabled).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle message sending error', async () => {
      vi.mocked(request.post).mockRejectedValueOnce(new Error('发送失败'))
      
      await nextTick()
      
      await wrapper.vm.handleSendMessage('测试消息')
      
      expect(wrapper.vm.messages).toHaveLength(4) // 2 existing + 1 user + 1 error
      expect(wrapper.vm.messages[3]).toEqual(
        expect.objectContaining({
          role: 'system',
          content: '消息发送失败，请重试。',
          status: 'error'
        })
      )
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('网络错误'))
      
      await nextTick()
      
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.messages).toEqual([])
    })

    it('should handle API response errors', async () => {
      vi.mocked(request.post).mockRejectedValue({ response: { status: 500 } })
      
      await nextTick()
      
      await wrapper.vm.handleSendMessage('测试消息')
      
      expect(wrapper.vm.messages).toHaveLength(4) // 2 existing + 1 user + 1 error
    })

    it('should handle invalid message data', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: { items: 'invalid' } })
      
      await nextTick()
      
      expect(wrapper.vm.messages).toEqual([])
    })
  })
})