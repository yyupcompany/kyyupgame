import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StreamingChat from '@/components/demo/StreamingChat.vue'

// Mock the Expert and ExpertResponse types
vi.mock('@/services/expert-team.service', () => ({
  Expert: vi.fn(),
  ExpertResponse: vi.fn()
}))

describe('StreamingChat', () => {
  let wrapper: any
  let mockExperts: any[]
  let mockOnUserRequest: any

  beforeEach(() => {
    mockExperts = [
      {
        id: 1,
        name: '张教授',
        role: '教育心理学专家',
        avatar: '👨‍🏫',
        specialties: ['儿童心理', '行为分析']
      },
      {
        id: 2,
        name: '李老师',
        role: '教学管理专家',
        avatar: '👩‍🏫',
        specialties: ['课程设计', '班级管理']
      }
    ]

    mockOnUserRequest = vi.fn().mockResolvedValue()

    wrapper = mount(StreamingChat, {
      props: {
        currentScenario: '学生行为分析',
        experts: mockExperts,
        onUserRequest: mockOnUserRequest
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the streaming chat correctly', () => {
      expect(wrapper.find('.streaming-chat').exists()).toBe(true)
    })

    it('displays chat header with scenario', () => {
      const header = wrapper.find('.chat-header')
      expect(header.exists()).toBe(true)
      expect(header.find('h3').text()).toBe('🤖 AI专家团队工作台')
      
      const scenarioBadge = header.find('.scenario-badge')
      expect(scenarioBadge.text()).toBe('学生行为分析')
    })

    it('shows chat messages container', () => {
      expect(wrapper.find('.chat-messages').exists()).toBe(true)
    })

    it('displays chat input section', () => {
      expect(wrapper.find('.chat-input').exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('shows initial system message on mount', () => {
      const messages = wrapper.findAll('.message')
      expect(messages.length).toBe(1)
      expect(messages[0].classes()).toContain('system')
      expect(messages[0].text()).toContain('学生行为分析专家团队已就位')
    })
  })

  describe('Component State', () => {
    it('initializes with correct default state', () => {
      expect(wrapper.vm.messages).toHaveLength(1) // Initial system message
      expect(wrapper.vm.userInput).toBe('')
      expect(wrapper.vm.isProcessing).toBe(false)
      expect(wrapper.vm.isTyping).toBe(false)
      expect(wrapper.vm.typingExpert).toBe(null)
    })

    it('has correct props', () => {
      expect(wrapper.vm.currentScenario).toBe('学生行为分析')
      expect(wrapper.vm.experts).toEqual(mockExperts)
      expect(wrapper.vm.onUserRequest).toBe(mockOnUserRequest)
    })
  })

  describe('Message Handling', () => {
    it('adds system message correctly', () => {
      const initialMessageCount = wrapper.vm.messages.length
      
      wrapper.vm.addSystemMessage('测试系统消息')
      
      expect(wrapper.vm.messages).toHaveLength(initialMessageCount + 1)
      const newMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(newMessage.type).toBe('system')
      expect(newMessage.expertName).toBe('系统')
      expect(newMessage.avatar).toBe('🤖')
      expect(newMessage.content).toBe('测试系统消息')
    })

    it('adds expert message correctly', () => {
      const mockResponse = {
        message: '专家回复内容',
        score: 8,
        suggestions: ['建议1', '建议2'],
        timestamp: Date.now()
      }
      
      const initialMessageCount = wrapper.vm.messages.length
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      expect(wrapper.vm.messages).toHaveLength(initialMessageCount + 1)
      const newMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(newMessage.type).toBe('expert')
      expect(newMessage.expertName).toBe('张教授')
      expect(newMessage.avatar).toBe('👨‍🏫')
      expect(newMessage.content).toBe('专家回复内容')
      expect(newMessage.score).toBe(8)
      expect(newMessage.suggestions).toEqual(['建议1', '建议2'])
    })

    it('streams text correctly', async () => {
      const expert = mockExperts[0]
      const text = '流式文本内容'
      const delay = 10 // Shorter delay for testing
      
      const initialMessageCount = wrapper.vm.messages.length
      
      await wrapper.vm.streamText(expert, text, delay)
      
      expect(wrapper.vm.messages).toHaveLength(initialMessageCount + 1)
      const streamedMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(streamedMessage.type).toBe('expert')
      expect(streamedMessage.expertName).toBe('张教授')
      expect(streamedMessage.content).toBe(text)
    })

    it('shows typing indicator correctly', () => {
      wrapper.vm.showTyping(mockExperts[0])
      
      expect(wrapper.vm.isTyping).toBe(true)
      expect(wrapper.vm.typingExpert).toEqual(mockExperts[0])
    })

    it('hides typing indicator correctly', () => {
      wrapper.vm.showTyping(mockExperts[0])
      wrapper.vm.hideTyping()
      
      expect(wrapper.vm.isTyping).toBe(false)
      expect(wrapper.vm.typingExpert).toBe(null)
    })
  })

  describe('User Input Handling', () => {
    it('sends message successfully', async () => {
      const testMessage = '测试用户消息'
      
      wrapper.vm.userInput = testMessage
      await wrapper.vm.sendMessage()
      
      expect(mockOnUserRequest).toHaveBeenCalledWith(testMessage)
      expect(wrapper.vm.userInput).toBe('')
      expect(wrapper.vm.isProcessing).toBe(false)
      
      // Check if user message was added
      const userMessages = wrapper.vm.messages.filter(m => m.type === 'user')
      expect(userMessages.length).toBe(1)
      expect(userMessages[0].content).toBe(testMessage)
    })

    it('does not send empty message', async () => {
      wrapper.vm.userInput = '   '
      await wrapper.vm.sendMessage()
      
      expect(mockOnUserRequest).not.toHaveBeenCalled()
      expect(wrapper.vm.messages.filter(m => m.type === 'user').length).toBe(0)
    })

    it('does not send message while processing', async () => {
      wrapper.vm.isProcessing = true
      wrapper.vm.userInput = '测试消息'
      
      await wrapper.vm.sendMessage()
      
      expect(mockOnUserRequest).not.toHaveBeenCalled()
    })

    it('handles user request error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockOnUserRequest.mockRejectedValue(new Error('Request failed'))
      
      wrapper.vm.userInput = '测试消息'
      await wrapper.vm.sendMessage()
      
      expect(consoleSpy).toHaveBeenCalledWith('处理用户请求失败:', expect.any(Error))
      
      // Check if error message was added
      const systemMessages = wrapper.vm.messages.filter(m => m.type === 'system')
      expect(systemMessages.some(m => m.content.includes('处理请求时发生错误'))).toBe(true)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Message Display', () => {
    it('displays user message with correct styling', async () => {
      wrapper.vm.userInput = '用户测试消息'
      await wrapper.vm.sendMessage()
      
      const userMessage = wrapper.findAll('.message.user')[0]
      expect(userMessage.exists()).toBe(true)
      
      const messageContent = userMessage.find('.message-content')
      expect(messageContent.classes()).toContain('user')
    })

    it('displays expert message with correct styling', () => {
      const mockResponse = {
        message: '专家回复',
        score: 7,
        suggestions: ['建议'],
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      expect(expertMessage.exists()).toBe(true)
      
      const messageContent = expertMessage.find('.message-content')
      expect(messageContent.classes()).toContain('expert')
    })

    it('displays system message with correct styling', () => {
      wrapper.vm.addSystemMessage('系统通知')
      
      const systemMessage = wrapper.findAll('.message.system')[0]
      expect(systemMessage.exists()).toBe(true)
      
      const messageContent = systemMessage.find('.message-content')
      expect(messageContent.classes()).toContain('system')
    })

    it('shows score display for expert messages', () => {
      const mockResponse = {
        message: '带评分的回复',
        score: 9,
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      const scoreDisplay = expertMessage.find('.score-display')
      expect(scoreDisplay.exists()).toBe(true)
      
      const stars = scoreDisplay.findAll('.star')
      expect(stars.length).toBe(10)
      
      const activeStars = stars.filter(star => star.classes().includes('active'))
      expect(activeStars.length).toBe(9)
      
      const scoreText = scoreDisplay.find('.score-text')
      expect(scoreText.text()).toBe('9/10')
    })

    it('shows suggestions for expert messages', () => {
      const mockResponse = {
        message: '带建议的回复',
        suggestions: ['建议1', '建议2', '建议3'],
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      const suggestions = expertMessage.find('.suggestions')
      expect(suggestions.exists()).toBe(true)
      
      const suggestionItems = suggestions.findAll('li')
      expect(suggestionItems.length).toBe(3)
      expect(suggestionItems[0].text()).toBe('建议1')
      expect(suggestionItems[1].text()).toBe('建议2')
      expect(suggestionItems[2].text()).toBe('建议3')
    })

    it('shows typing indicator when expert is typing', () => {
      wrapper.vm.showTyping(mockExperts[0])
      
      const typingIndicator = wrapper.find('.typing-indicator')
      expect(typingIndicator.exists()).toBe(true)
      
      expect(typingIndicator.find('.expert-avatar').text()).toBe('👨‍🏫')
      expect(typingIndicator.find('.expert-name').text()).toBe('张教授')
      
      const typingDots = typingIndicator.find('.typing-dots')
      expect(typingDots.findAll('span').length).toBe(3)
    })
  })

  describe('Time Formatting', () => {
    it('formats timestamp correctly', () => {
      const timestamp = new Date('2024-01-15T14:30:45').getTime()
      const formattedTime = wrapper.vm.formatTime(timestamp)
      
      expect(formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      expect(formattedTime).toContain('14')
      expect(formattedTime).toContain('30')
      expect(formattedTime).toContain('45')
    })

    it('handles different timestamps', () => {
      const timestamps = [
        new Date('2024-01-15T09:05:30').getTime(),
        new Date('2024-01-15T23:59:59').getTime(),
        new Date('2024-01-15T00:00:01').getTime()
      ]
      
      timestamps.forEach(timestamp => {
        const formattedTime = wrapper.vm.formatTime(timestamp)
        expect(formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      })
    })
  })

  describe('Scroll Behavior', () => {
    it('scrolls to bottom when new message is added', async () => {
      const mockContainer = {
        scrollTop: 0,
        scrollHeight: 100
      }
      
      wrapper.vm.messagesContainer = mockContainer
      
      await wrapper.vm.addSystemMessage('新消息')
      
      expect(mockContainer.scrollTop).toBe(mockContainer.scrollHeight)
    })

    it('handles missing messages container gracefully', async () => {
      wrapper.vm.messagesContainer = undefined
      
      await wrapper.vm.addSystemMessage('新消息')
      
      // Should not throw error
      expect(wrapper.vm.messages).toHaveLength(2) // Initial + new message
    })
  })

  describe('Input Validation', () => {
    it('disables input when processing', async () => {
      wrapper.vm.isProcessing = true
      await nextTick()
      
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.text()).toBe('发送')
    })

    it('shows processing text in button when processing', async () => {
      wrapper.vm.isProcessing = true
      await nextTick()
      
      const button = wrapper.find('button')
      expect(button.text()).toBe('处理中...')
    })

    it('disables send button when input is empty', async () => {
      wrapper.vm.userInput = ''
      await nextTick()
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('enables send button when input has content', async () => {
      wrapper.vm.userInput = '测试内容'
      await nextTick()
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('trims whitespace from input', async () => {
      wrapper.vm.userInput = '  测试消息  '
      await wrapper.vm.sendMessage()
      
      const userMessages = wrapper.vm.messages.filter(m => m.type === 'user')
      expect(userMessages[0].content).toBe('测试消息')
    })
  })

  describe('Exposed Methods', () => {
    it('exposes required methods', () => {
      const exposed = wrapper.vm
      
      expect(exposed.addSystemMessage).toBeDefined()
      expect(exposed.addExpertMessage).toBeDefined()
      expect(exposed.streamText).toBeDefined()
      expect(exposed.showTyping).toBeDefined()
      expect(exposed.hideTyping).toBeDefined()
    })

    it('methods are callable and functional', () => {
      expect(() => wrapper.vm.addSystemMessage('test')).not.toThrow()
      expect(() => wrapper.vm.showTyping(mockExperts[0])).not.toThrow()
      expect(() => wrapper.vm.hideTyping()).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty experts array', () => {
      const wrapperWithEmptyExperts = mount(StreamingChat, {
        props: {
          currentScenario: '测试场景',
          experts: [],
          onUserRequest: mockOnUserRequest
        }
      })
      
      expect(wrapperWithEmptyExperts.vm.experts).toEqual([])
      expect(wrapperWithEmptyExperts.find('.chat-header').exists()).toBe(true)
      
      wrapperWithEmptyExperts.unmount()
    })

    it('handles undefined onUserRequest', () => {
      const wrapperWithoutCallback = mount(StreamingChat, {
        props: {
          currentScenario: '测试场景',
          experts: mockExperts
        }
      })
      
      wrapperWithoutCallback.vm.userInput = '测试消息'
      
      // Should not throw error
      expect(() => wrapperWithoutCallback.vm.sendMessage()).not.toThrow()
      
      wrapperWithoutCallback.unmount()
    })

    it('handles expert response without score and suggestions', () => {
      const mockResponse = {
        message: '简单回复',
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      expect(expertMessage.find('.score-display').exists()).toBe(false)
      expect(expertMessage.find('.suggestions').exists()).toBe(false)
    })

    it('handles expert response with empty suggestions array', () => {
      const mockResponse = {
        message: '无建议回复',
        score: 5,
        suggestions: [],
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      expect(expertMessage.find('.score-display').exists()).toBe(true)
      expect(expertMessage.find('.suggestions').exists()).toBe(false)
    })

    it('handles streaming empty text', async () => {
      const expert = mockExperts[0]
      const initialMessageCount = wrapper.vm.messages.length
      
      await wrapper.vm.streamText(expert, '', 10)
      
      expect(wrapper.vm.messages).toHaveLength(initialMessageCount + 1)
      const streamedMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(streamedMessage.content).toBe('')
    })

    it('handles message with HTML content', () => {
      const mockResponse = {
        message: '<strong>加粗文本</strong>和<em>斜体文本</em>',
        timestamp: Date.now()
      }
      
      wrapper.vm.addExpertMessage(mockExperts[0], mockResponse)
      
      const expertMessage = wrapper.findAll('.message.expert')[0]
      const messageText = expertMessage.find('.message-text')
      expect(messageText.html()).toContain('<strong>加粗文本</strong>')
      expect(messageText.html()).toContain('<em>斜体文本</em>')
    })
  })

  describe('Component Lifecycle', () => {
    it('adds initial system message on mount', () => {
      expect(wrapper.vm.messages).toHaveLength(1)
      expect(wrapper.vm.messages[0].type).toBe('system')
      expect(wrapper.vm.messages[0].content).toContain('学生行为分析专家团队已就位')
    })

    it('uses currentScenario in initial message', () => {
      const wrapperWithDifferentScenario = mount(StreamingChat, {
        props: {
          currentScenario: '课程设计',
          experts: mockExperts,
          onUserRequest: mockOnUserRequest
        }
      })
      
      expect(wrapperWithDifferentScenario.vm.messages[0].content).toContain('课程设计专家团队已就位')
      
      wrapperWithDifferentScenario.unmount()
    })
  })

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to elements', () => {
      expect(wrapper.find('.streaming-chat').exists()).toBe(true)
      expect(wrapper.find('.chat-header').exists()).toBe(true)
      expect(wrapper.find('.chat-messages').exists()).toBe(true)
      expect(wrapper.find('.chat-input').exists()).toBe(true)
    })

    it('applies message type classes correctly', () => {
      wrapper.vm.addSystemMessage('系统消息')
      wrapper.vm.addExpertMessage(mockExperts[0], {
        message: '专家消息',
        timestamp: Date.now()
      })
      
      const messages = wrapper.findAll('.message')
      expect(messages[1].classes()).toContain('system')
      expect(messages[2].classes()).toContain('expert')
    })

    it('applies scenario badge styling', () => {
      const scenarioBadge = wrapper.find('.scenario-badge')
      expect(scenarioBadge.exists()).toBe(true)
    })
  })
})