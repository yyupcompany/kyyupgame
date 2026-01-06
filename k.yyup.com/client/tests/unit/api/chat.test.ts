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

describe, it, expect, vi, beforeEach } from 'vitest'
import { chatApi } from '@/api/chat'
import { post, get } from '@/utils/request'
import request from '@/utils/request'
import { AI_ENDPOINTS } from '@/api/endpoints'

// Mock request modules
vi.mock('@/utils/request', () => ({
  post: vi.fn(),
  get: vi.fn(),
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn()
  }
}))

vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string) => `/api/conversations/${id}`,
    CONVERSATION_MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/api/conversations/${id}/messages`,
    UPLOAD_IMAGE: '/api/upload-image',
    TRANSCRIBE_AUDIO: '/api/transcribe-audio'
  }
}))

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createConversation', () => {
    it('should create a new conversation with default title', async () => {
      const mockResponse = {
        data: {
          id: '1',
          title: '新对话',
          createdAt: '2023-01-01T00:00:00Z'
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.createConversation()

      expect(post).toHaveBeenCalledWith('/api/conversations', {
        title: '新对话'
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create a new conversation with custom title and model', async () => {
      const mockResponse = {
        data: {
          id: '1',
          title: 'Custom Title',
          modelId: 1,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.createConversation('Custom Title', 1)

      expect(post).toHaveBeenCalledWith('/api/conversations', {
        title: 'Custom Title',
        modelId: 1
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to create conversation')
      vi.mocked(post).mockRejectedValue(error)

      await expect(chatApi.createConversation()).rejects.toThrow('Failed to create conversation')
    })
  })

  describe('getConversation', () => {
    it('should get conversation by ID', async () => {
      const mockResponse = {
        data: {
          id: '1',
          title: 'Test Conversation',
          messages: [],
          createdAt: '2023-01-01T00:00:00Z'
        }
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getConversation('1')

      expect(get).toHaveBeenCalledWith('/api/conversations/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors when getting conversation', async () => {
      const error = new Error('Conversation not found')
      vi.mocked(get).mockRejectedValue(error)

      await expect(chatApi.getConversation('1')).rejects.toThrow('Conversation not found')
    })
  })

  describe('getMessages', () => {
    it('should get messages for conversation', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            role: 'user',
            content: 'Hello',
            createdAt: '2023-01-01T00:00:00Z',
            metadata: { components: [] }
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Hi there!',
            createdAt: '2023-01-01T00:01:00Z',
            metadata: { components: [] }
          }
        ]
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getMessages('1')

      expect(get).toHaveBeenCalledWith('/api/conversations/1/messages')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: '2023-01-01T00:00:00Z',
        status: 'received',
        components: []
      })
      expect(result[1]).toEqual({
        id: '2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: '2023-01-01T00:01:00Z',
        status: 'received',
        components: []
      })
    })

    it('should handle messages with components', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            role: 'user',
            content: 'Show me data',
            createdAt: '2023-01-01T00:00:00Z',
            metadata: {
              components: [
                { type: 'chart', data: { labels: ['A', 'B'], values: [1, 2] } }
              ]
            }
          }
        ]
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getMessages('1')

      expect(result[0].components).toEqual([
        { type: 'chart', data: { labels: ['A', 'B'], values: [1, 2] } }
      ])
    })

    it('should handle API errors when getting messages', async () => {
      const error = new Error('Failed to get messages')
      vi.mocked(get).mockRejectedValue(error)

      await expect(chatApi.getMessages('1')).rejects.toThrow('Failed to get messages')
    })
  })

  describe('sendMessage', () => {
    it('should send message to conversation', async () => {
      const mockResponse = {
        data: {
          content: 'Hello! How can I help you?',
          metadata: {
            components: [
              { type: 'text', content: 'Welcome message' }
            ]
          }
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.sendMessage('1', 'Hello', 1)

      expect(post).toHaveBeenCalledWith('/api/conversations/1/messages', {
        content: 'Hello',
        metadata: { modelId: 1 }
      })
      expect(result).toEqual({
        content: 'Hello! How can I help you?',
        components: [{ type: 'text', content: 'Welcome message' }]
      })
    })

    it('should send message without model ID', async () => {
      const mockResponse = {
        data: {
          content: 'Response without model',
          metadata: {}
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.sendMessage('1', 'Hello')

      expect(post).toHaveBeenCalledWith('/api/conversations/1/messages', {
        content: 'Hello',
        metadata: {}
      })
      expect(result).toEqual({
        content: 'Response without model',
        components: []
      })
    })

    it('should handle API errors when sending message', async () => {
      const error = new Error('Failed to send message')
      vi.mocked(post).mockRejectedValue(error)

      await expect(chatApi.sendMessage('1', 'Hello')).rejects.toThrow('Failed to send message')
    })
  })

  describe('saveMessage', () => {
    it('should save user message', async () => {
      const message = {
        id: '1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: '2023-01-01T00:00:00Z',
        status: 'sent' as const,
        components: []
      }

      vi.mocked(post).mockResolvedValue({ data: { success: true } })

      const result = await chatApi.saveMessage('1', message)

      expect(post).toHaveBeenCalledWith('/api/conversations/1/messages', {
        content: 'Hello',
        metadata: { components: [] }
      })
      expect(result).toBe(true)
    })

    it('should skip saving AI messages', async () => {
      const message = {
        id: '2',
        role: 'assistant' as const,
        content: 'Hello back',
        timestamp: '2023-01-01T00:01:00Z',
        status: 'received' as const,
        components: []
      }

      const result = await chatApi.saveMessage('1', message)

      expect(post).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle API errors when saving message', async () => {
      const message = {
        id: '1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: '2023-01-01T00:00:00Z',
        status: 'sent' as const,
        components: []
      }

      const error = new Error('Failed to save message')
      vi.mocked(post).mockRejectedValue(error)

      await expect(chatApi.saveMessage('1', message)).rejects.toThrow('Failed to save message')
    })
  })

  describe('uploadImage', () => {
    it('should upload image and return analysis', async () => {
      const formData = new FormData()
      formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')

      const mockResponse = {
        data: {
          description: 'This is a test image',
          components: [{ type: 'image-analysis', data: { objects: ['test'] } }]
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.uploadImage('1', formData, 1)

      expect(post).toHaveBeenCalledWith('/api/upload-image', formData)
      expect(result).toEqual({
        content: 'This is a test image',
        components: [{ type: 'image-analysis', data: { objects: ['test'] } }]
      })
    })

    it('should return fallback response on upload error', async () => {
      const formData = new FormData()
      formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')

      const error = new Error('Upload failed')
      vi.mocked(post).mockRejectedValue(error)

      const result = await chatApi.uploadImage('1', formData, 1)

      expect(result).toEqual({
        content: '图片上传功能暂未开放，请稍后再试。',
        components: []
      })
    })
  })

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      const formData = new FormData()
      formData.append('audio', new Blob(['test audio'], { type: 'audio/wav' }), 'test.wav')

      const mockResponse = {
        data: {
          text: 'Hello, this is a test transcription'
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.transcribeAudio(formData)

      expect(post).toHaveBeenCalledWith('/api/transcribe-audio', formData)
      expect(result).toEqual({
        text: 'Hello, this is a test transcription'
      })
    })

    it('should return fallback response on transcription error', async () => {
      const formData = new FormData()
      formData.append('audio', new Blob(['test audio'], { type: 'audio/wav' }), 'test.wav')

      const error = new Error('Transcription failed')
      vi.mocked(post).mockRejectedValue(error)

      const result = await chatApi.transcribeAudio(formData)

      expect(result).toEqual({
        text: '语音识别功能暂未开放，请使用文字输入。'
      })
    })
  })

  describe('clearConversation', () => {
    it('should clear conversation by deleting and recreating', async () => {
      const deleteMockResponse = { data: { success: true } }
      const createMockResponse = {
        data: {
          id: '2',
          title: '新对话',
          createdAt: '2023-01-01T00:00:00Z'
        }
      }

      vi.mocked(request.del).mockResolvedValue(deleteMockResponse)
      vi.mocked(post).mockResolvedValue(createMockResponse)

      const result = await chatApi.clearConversation('1')

      expect(request.del).toHaveBeenCalledWith('/api/conversations/1')
      expect(post).toHaveBeenCalledWith('/api/conversations', {
        title: '新对话'
      })
      expect(result).toEqual(createMockResponse.data)
    })

    it('should handle API errors when clearing conversation', async () => {
      const error = new Error('Failed to clear conversation')
      vi.mocked(request.del).mockRejectedValue(error)

      await expect(chatApi.clearConversation('1')).rejects.toThrow('Failed to clear conversation')
    })
  })

  describe('deleteConversation', () => {
    it('should delete conversation successfully', async () => {
      vi.mocked(request.del).mockResolvedValue({ data: { success: true } })

      const result = await chatApi.deleteConversation('1')

      expect(request.del).toHaveBeenCalledWith('/api/conversations/1')
      expect(result).toBe(true)
    })

    it('should handle API errors when deleting conversation', async () => {
      const error = new Error('Failed to delete conversation')
      vi.mocked(request.del).mockRejectedValue(error)

      await expect(chatApi.deleteConversation('1')).rejects.toThrow('Failed to delete conversation')
    })
  })

  describe('getAllConversations', () => {
    it('should get all conversations without params', async () => {
      const mockResponse = {
        data: [
          { id: '1', title: 'Conversation 1' },
          { id: '2', title: 'Conversation 2' }
        ]
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getAllConversations()

      expect(get).toHaveBeenCalledWith('/api/conversations', undefined)
      expect(result).toEqual(mockResponse.data)
    })

    it('should get all conversations with params', async () => {
      const mockResponse = {
        data: [
          { id: '1', title: 'Conversation 1' }
        ]
      }

      const params = { limit: 10, offset: 0 }
      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getAllConversations(params)

      expect(get).toHaveBeenCalledWith('/api/conversations', params)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors when getting conversations', async () => {
      const error = new Error('Failed to get conversations')
      vi.mocked(get).mockRejectedValue(error)

      await expect(chatApi.getAllConversations()).rejects.toThrow('Failed to get conversations')
    })
  })

  describe('updateConversationTitle', () => {
    it('should update conversation title successfully', async () => {
      const mockResponse = {
        data: {
          id: '1',
          title: 'Updated Title'
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await chatApi.updateConversationTitle('1', 'Updated Title')

      expect(request.put).toHaveBeenCalledWith('/api/conversations/1', { title: 'Updated Title' })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors when updating title', async () => {
      const error = new Error('Failed to update title')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(chatApi.updateConversationTitle('1', 'Updated Title')).rejects.toThrow('Failed to update title')
    })
  })

  describe('updateConversation', () => {
    it('should update conversation with partial data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          archived: true,
          pinned: false
        }
      }

      const updateData = { archived: true, pinned: false }
      vi.mocked(request.patch).mockResolvedValue(mockResponse)

      const result = await chatApi.updateConversation('1', updateData)

      expect(request.patch).toHaveBeenCalledWith('/api/conversations/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update conversation with summary', async () => {
      const mockResponse = {
        data: {
          id: '1',
          summary: 'This is a conversation summary'
        }
      }

      const updateData = { summary: 'This is a conversation summary' }
      vi.mocked(request.patch).mockResolvedValue(mockResponse)

      const result = await chatApi.updateConversation('1', updateData)

      expect(request.patch).toHaveBeenCalledWith('/api/conversations/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors when updating conversation', async () => {
      const error = new Error('Failed to update conversation')
      vi.mocked(request.patch).mockRejectedValue(error)

      await expect(chatApi.updateConversation('1', { archived: true })).rejects.toThrow('Failed to update conversation')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(get).mockRejectedValue(error)

      await expect(chatApi.getConversation('1')).rejects.toThrow('Network error')
    })

    it('should handle server errors gracefully', async () => {
      const error = new Error('Internal server error')
      vi.mocked(post).mockRejectedValue(error)

      await expect(chatApi.createConversation()).rejects.toThrow('Internal server error')
    })

    it('should handle timeout errors gracefully', async () => {
      const error = new Error('Request timeout')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(chatApi.updateConversationTitle('1', 'Test')).rejects.toThrow('Request timeout')
    })
  })

  describe('Type Safety', () => {
    it('should handle correct response types', async () => {
      const mockResponse = {
        data: {
          id: '1',
          title: 'Test Conversation',
          createdAt: '2023-01-01T00:00:00Z'
        }
      }

      vi.mocked(post).mockResolvedValue(mockResponse)

      const result = await chatApi.createConversation('Test')

      expect(result.id).toBe('1')
      expect(result.title).toBe('Test Conversation')
      expect(typeof result.createdAt).toBe('string')
    })

    it('should handle message response types', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            role: 'user',
            content: 'Test message',
            createdAt: '2023-01-01T00:00:00Z',
            metadata: { components: [] }
          }
        ]
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await chatApi.getMessages('1')

      expect(result[0].id).toBe('1')
      expect(result[0].role).toBe('user')
      expect(result[0].content).toBe('Test message')
      expect(result[0].status).toBe('received')
      expect(Array.isArray(result[0].components)).toBe(true)
    })
  })
})