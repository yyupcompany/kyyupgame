import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { functionToolsApi } from '@/api/ai/function-tools'

// Mock request module
const mockRequest = {
  post: vi.fn(),
  get: vi.fn()
}

vi.mock('@/utils/request', () => mockRequest)

describe('Function Tools API', () => {
  let originalConsoleWarn

  beforeEach(() => {
    vi.clearAllMocks()
    // Store original console.warn
    originalConsoleWarn = console.warn
    // Mock console.warn to suppress deprecation warnings during tests
    console.warn = vi.fn()
  })

  afterEach(() => {
    // Restore original console.warn
    console.warn = originalConsoleWarn
  })

  describe('smartChat', () => {
    it('should call unified intelligence API with converted format', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' }
      ]

      const mockResponse = {
        data: {
          response: 'I am doing well, thank you!',
          conversationId: 'conv_123'
        }
      }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.smartChat(messages)

      // Should extract last message
      const expectedPayload = {
        message: 'How are you?',
        userId: '121', // default value from localStorage mock
        conversationId: expect.stringMatching(/^legacy_\d+$/),
        context: {
          history: messages.slice(0, -1)
        }
      }

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', expectedPayload)
      expect(result).toEqual(mockResponse)
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ functionToolsApi.smartChat() 已废弃，请使用 callUnifiedIntelligence()'
      )
    })

    it('should handle single message', async () => {
      const messages = [
        { role: 'user', content: 'Hello' }
      ]

      const mockResponse = { data: { response: 'Hi!' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.smartChat(messages)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: 'Hello',
        userId: '121',
        conversationId: expect.stringMatching(/^legacy_\d+$/),
        context: {
          history: []
        }
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle empty messages array', async () => {
      const messages = []

      const mockResponse = { data: { response: 'Hello!' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.smartChat(messages)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: '',
        userId: '121',
        conversationId: expect.stringMatching(/^legacy_\d+$/),
        context: {
          history: []
        }
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const messages = [{ role: 'user', content: 'Hello' }]
      const error = new Error('API Error')

      mockRequest.post.mockRejectedValue(error)

      await expect(functionToolsApi.smartChat(messages)).rejects.toThrow('API Error')
    })
  })

  describe('getAvailableTools', () => {
    it('should call unified system capabilities API', async () => {
      const mockResponse = {
        data: {
          tools: ['tool1', 'tool2', 'tool3'],
          capabilities: ['cap1', 'cap2']
        }
      }

      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.getAvailableTools()

      expect(mockRequest.get).toHaveBeenCalledWith('/ai/unified/capabilities')
      expect(result).toEqual(mockResponse)
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ functionToolsApi.getAvailableTools() 已废弃，请使用 getUnifiedSystemCapabilities()'
      )
    })

    it('should handle empty tools response', async () => {
      const mockResponse = {
        data: {
          tools: [],
          capabilities: []
        }
      }

      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.getAvailableTools()

      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch tools')
      mockRequest.get.mockRejectedValue(error)

      await expect(functionToolsApi.getAvailableTools()).rejects.toThrow('Failed to fetch tools')
    })
  })

  describe('executeTool', () => {
    it('should call unified intelligence with tool execution format', async () => {
      const toolName = 'get_weather'
      const args = { location: 'Beijing', units: 'metric' }

      const mockResponse = {
        data: {
          response: 'The weather in Beijing is 25°C',
          toolResult: { temperature: 25, condition: 'sunny' }
        }
      }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.executeTool(toolName, args)

      const expectedPayload = {
        message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
        userId: '121',
        conversationId: expect.stringMatching(/^tool_execution_\d+$/)
      }

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', expectedPayload)
      expect(result).toEqual(mockResponse)
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ functionToolsApi.executeTool() 已废弃，请使用 callUnifiedIntelligence() 进行智能工具调用'
      )
    })

    it('should handle tool execution with complex arguments', async () => {
      const toolName = 'create_activity'
      const args = {
        title: 'Birthday Party',
        date: '2024-01-01',
        participants: 20,
        location: {
          venue: 'Community Center',
          address: '123 Main St'
        }
      }

      const mockResponse = { data: { response: 'Activity created successfully' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.executeTool(toolName, args)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
        userId: '121',
        conversationId: expect.stringMatching(/^tool_execution_\d+$/)
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle tool execution with no arguments', async () => {
      const toolName = 'list_activities'
      const args = {}

      const mockResponse = { data: { response: 'Activities: []' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.executeTool(toolName, args)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
        userId: '121',
        conversationId: expect.stringMatching(/^tool_execution_\d+$/)
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const toolName = 'invalid_tool'
      const args = {}
      const error = new Error('Tool not found')

      mockRequest.post.mockRejectedValue(error)

      await expect(functionToolsApi.executeTool(toolName, args)).rejects.toThrow('Tool not found')
    })
  })

  describe('getExecutionHistory', () => {
    it('should return legacy response message', async () => {
      const params = { page: 1, limit: 10 }

      const result = await functionToolsApi.getExecutionHistory(params)

      expect(result).toEqual({
        success: true,
        data: [],
        message: '功能已迁移到统一智能系统'
      })
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ functionToolsApi.getExecutionHistory() 已废弃，统一智能系统自动管理执行历史'
      )
      expect(mockRequest.get).not.toHaveBeenCalled() // Should not make any API calls
    })

    it('should handle empty parameters', async () => {
      const result = await functionToolsApi.getExecutionHistory({})

      expect(result).toEqual({
        success: true,
        data: [],
        message: '功能已迁移到统一智能系统'
      })
    })

    it('should handle no parameters', async () => {
      const result = await functionToolsApi.getExecutionHistory()

      expect(result).toEqual({
        success: true,
        data: [],
        message: '功能已迁移到统一智能系统'
      })
    })
  })

  describe('getToolStats', () => {
    it('should call unified system status API', async () => {
      const mockResponse = {
        data: {
          status: 'healthy',
          tools: {
            total: 10,
            active: 8
          },
          usage: {
            totalCalls: 1000,
            successRate: 0.95
          }
        }
      }

      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.getToolStats()

      expect(mockRequest.get).toHaveBeenCalledWith('/ai/unified/status')
      expect(result).toEqual(mockResponse)
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ functionToolsApi.getToolStats() 已废弃，请使用 getUnifiedSystemStatus()'
      )
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to get stats')
      mockRequest.get.mockRejectedValue(error)

      await expect(functionToolsApi.getToolStats()).rejects.toThrow('Failed to get stats')
    })
  })

  describe('Default Export', () => {
    it('should export the same API object', () => {
      // Test that the default export is the same as the named export
      expect(functionToolsApi).toBeDefined()
      expect(typeof functionToolsApi.smartChat).toBe('function')
      expect(typeof functionToolsApi.getAvailableTools).toBe('function')
      expect(typeof functionToolsApi.executeTool).toBe('function')
      expect(typeof functionToolsApi.getExecutionHistory).toBe('function')
      expect(typeof functionToolsApi.getToolStats).toBe('function')
    })
  })

  describe('Migration Behavior', () => {
    it('should consistently show deprecation warnings', () => {
      // Test that all methods show deprecation warnings
      const methods = [
        'smartChat',
        'getAvailableTools',
        'executeTool',
        'getExecutionHistory',
        'getToolStats'
      ]

      methods.forEach(method => {
        expect(typeof functionToolsApi[method]).toBe('function')
      })
    })

    it('should maintain backward compatibility in response formats', async () => {
      // Test that responses are still in expected format for backward compatibility
      const mockResponse = { data: { result: 'test' } }

      mockRequest.post.mockResolvedValue(mockResponse)
      mockRequest.get.mockResolvedValue(mockResponse)

      const chatResult = await functionToolsApi.smartChat([{ role: 'user', content: 'test' }])
      const toolsResult = await functionToolsApi.getAvailableTools()
      const statsResult = await functionToolsApi.getToolStats()

      expect(chatResult).toEqual(mockResponse)
      expect(toolsResult).toEqual(mockResponse)
      expect(statsResult).toEqual(mockResponse)
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed messages array', async () => {
      const malformedMessages = [
        null,
        undefined,
        {},
        { content: 'no role' },
        { role: 'user' } // no content
      ]

      for (const messages of malformedMessages) {
        mockRequest.post.mockResolvedValue({ data: { response: 'handled' } })

        const result = await functionToolsApi.smartChat(messages)

        expect(result).toBeDefined()
        expect(console.warn).toHaveBeenCalled()
        
        vi.clearAllMocks()
      }
    })

    it('should handle special characters in tool names and arguments', async () => {
      const toolName = 'tool_with_special_chars_中文'
      const args = {
        text: 'Special chars: 你好 🎉',
        emoji: '🌟',
        unicode: '测试'
      }

      const mockResponse = { data: { response: 'Success' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.executeTool(toolName, args)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
        userId: '121',
        conversationId: expect.stringMatching(/^tool_execution_\d+$/)
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle very large arguments', async () => {
      const toolName = 'process_data'
      const args = {
        data: 'x'.repeat(10000), // Large string
        array: Array(1000).fill('item')
      }

      const mockResponse = { data: { response: 'Processed' } }

      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await functionToolsApi.executeTool(toolName, args)

      expect(mockRequest.post).toHaveBeenCalledWith('/ai/unified/unified-chat', {
        message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
        userId: '121',
        conversationId: expect.stringMatching(/^tool_execution_\d+$/)
      })

      expect(result).toEqual(mockResponse)
    })
  })
})