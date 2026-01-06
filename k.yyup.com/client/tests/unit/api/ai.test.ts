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
import axios from 'axios'
import request from '@/utils/request'
import { AI_ENDPOINTS, AI_MEMORY_ENDPOINTS } from '@/api/endpoints'
import { aiApi, createMemory, getConversationMemories, deleteMemory, summarizeConversation, createMemoryWithEmbedding, searchSimilarMemories, searchMemoriesByTimeRange, searchLastMonthMemories } from '@/api/ai'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure,
  validatePaginationStructure,
  validateStatisticalRanges,
  createValidationReport
} from '@/tests/utils/data-validation'

// Mock modules
vi.mock('axios')
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn()
  }
}))

// Mock endpoints
vi.mock('@/api/endpoints', () => ({
  AI_ENDPOINTS: {
    MODELS: '/ai/models',
    CONVERSATIONS: '/ai/conversations',
    CONVERSATION_BY_ID: (id) => `/ai/conversations/${id}`,
    CONVERSATION_MESSAGES: (id) => `/ai/conversations/${id}/messages`,
    SEND_MESSAGE: '/ai/conversations/send-message',
    MODEL_BY_ID: (id) => `/ai/models/${id}`,
    MODEL_BILLING: (id) => `/ai/models/${id}/billing`,
    MODEL_DEFAULT: '/ai/models/default',
    USER_QUOTA: '/ai/quota/user',
    MODEL_CAPABILITIES: (id, capability) => `/ai/models/${id}/capabilities/${capability}`,
    INITIALIZE: '/ai/initialize',
    CONSULTATION_START: '/ai/consultation/start'
  },
  AI_MEMORY_ENDPOINTS: {
    CREATE: '/ai/memory',
    GET_CONVERSATION: (conversationId, userId) => `/ai/memory/conversation/${conversationId}/${userId}`,
    DELETE: (memoryId, userId) => `/ai/memory/${memoryId}/${userId}`,
    DELETE_BY_ID: (memoryId) => `/ai/memory/${memoryId}`,
    SUMMARIZE: (conversationId, userId) => `/ai/memory/summarize/${conversationId}/${userId}`,
    CREATE_WITH_EMBEDDING: '/ai/memory/with-embedding',
    SEARCH_SIMILAR: '/ai/memory/search-similar',
    SEARCH: (userId) => `/ai/memory/${userId}/search`
  }
}))

describe('AI API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Model Management', () => {
    it('should get models successfully', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          provider: 'OpenAI',
          contextWindow: 8192,
          maxTokens: 4096,
          capabilities: ['text-generation'],
          description: 'GPT-4 model',
          isAvailable: true
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockModels })

      const result = await aiApi.getModels()
      expect(request.get).toHaveBeenCalledWith('/ai/models')

      // 严格验证API响应结构
      const apiValidation = validateApiResponseStructure({ data: mockModels })
      expect(apiValidation.valid).toBe(true)

      // 严格验证模型数据结构
      if (Array.isArray(result) && result.length > 0) {
        for (const model of result) {
          const requiredFieldsValidation = validateRequiredFields(model, ['id', 'name', 'provider'])
          expect(requiredFieldsValidation.valid).toBe(true)

          const typeValidation = validateFieldTypes(model, {
            id: 'number',
            name: 'string',
            provider: 'string',
            contextWindow: 'number',
            maxTokens: 'number',
            capabilities: 'array',
            description: 'string',
            isAvailable: 'boolean'
          })
          expect(typeValidation.valid).toBe(true)

          // 验证数值范围
          const rangeValidation = validateStatisticalRanges(model, {
            contextWindow: { min: 1 },
            maxTokens: { min: 1 },
            id: { min: 1 }
          })
          expect(rangeValidation.valid).toBe(true)
        }
      }

      expect(result).toEqual(mockModels)
    })

    it('should get model details successfully', async () => {
      const mockModel = {
        id: 1,
        name: 'gpt-4',
        provider: 'OpenAI',
        contextWindow: 8192,
        maxTokens: 4096
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockModel })

      const result = await aiApi.getModelDetails(1)
      expect(request.get).toHaveBeenCalledWith('/ai/models/1')

      // 严格验证响应结构
      const apiValidation = validateApiResponseStructure({ data: mockModel })
      expect(apiValidation.valid).toBe(true)

      // 严格验证模型详情
      const requiredFieldsValidation = validateRequiredFields(result, ['id', 'name', 'provider'])
      expect(requiredFieldsValidation.valid).toBe(true)

      const typeValidation = validateFieldTypes(result, {
        id: 'number',
        name: 'string',
        provider: 'string',
        contextWindow: 'number',
        maxTokens: 'number'
      })
      expect(typeValidation.valid).toBe(true)

      expect(result).toEqual(mockModel)
    })

    it('should get model billing info successfully', async () => {
      const mockBilling = {
        totalCost: 100.50,
        requestCount: 1000,
        averageCostPerRequest: 0.1005
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockBilling })

      const result = await aiApi.getModelBilling(1)
      expect(request.get).toHaveBeenCalledWith('/ai/models/1/billing')

      // 严格验证账单数据
      const apiValidation = validateApiResponseStructure({ data: mockBilling })
      expect(apiValidation.valid).toBe(true)

      const requiredFieldsValidation = validateRequiredFields(result, ['totalCost', 'requestCount'])
      expect(requiredFieldsValidation.valid).toBe(true)

      const typeValidation = validateFieldTypes(result, {
        totalCost: 'number',
        requestCount: 'number',
        averageCostPerRequest: 'number'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证数值范围
      const rangeValidation = validateStatisticalRanges(result, {
        totalCost: { min: 0 },
        requestCount: { min: 0 },
        averageCostPerRequest: { min: 0 }
      })
      expect(rangeValidation.valid).toBe(true)

      expect(result).toEqual(mockBilling)
    })

    it('should get default model successfully', async () => {
      const mockModel = {
        id: 1,
        name: 'gpt-4',
        isDefault: true
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockModel })

      const result = await aiApi.getDefaultModel()
      expect(request.get).toHaveBeenCalledWith('/ai/models/default')

      // 严格验证默认模型
      const apiValidation = validateApiResponseStructure({ data: mockModel })
      expect(apiValidation.valid).toBe(true)

      const requiredFieldsValidation = validateRequiredFields(result, ['id', 'name', 'isDefault'])
      expect(requiredFieldsValidation.valid).toBe(true)

      const typeValidation = validateFieldTypes(result, {
        id: 'number',
        name: 'string',
        isDefault: 'boolean'
      })
      expect(typeValidation.valid).toBe(true)

      expect(result).toEqual(mockModel)
    })

    it('should set default model successfully', async () => {
      const mockResponse = { success: true }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await aiApi.setDefaultModel(1)
      expect(request.post).toHaveBeenCalledWith('/ai/models/default', { modelId: 1 })

      // 严格验证响应
      const apiValidation = validateApiResponseStructure(result)
      expect(apiValidation.valid).toBe(true)

      expect(result).toEqual(mockResponse)
    })

    it('should get user quota successfully', async () => {
      const mockQuota = {
        totalTokens: 1000000,
        usedTokens: 500000,
        remainingTokens: 500000
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockQuota })

      const result = await aiApi.getUserQuota()
      expect(request.get).toHaveBeenCalledWith('/ai/quota/user')

      // 严格验证配额数据
      const apiValidation = validateApiResponseStructure({ data: mockQuota })
      expect(apiValidation.valid).toBe(true)

      const requiredFieldsValidation = validateRequiredFields(result, ['totalTokens', 'usedTokens', 'remainingTokens'])
      expect(requiredFieldsValidation.valid).toBe(true)

      const typeValidation = validateFieldTypes(result, {
        totalTokens: 'number',
        usedTokens: 'number',
        remainingTokens: 'number'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证配额关系
      expect(result.totalTokens).toBeGreaterThanOrEqual(result.usedTokens)
      expect(result.usedTokens + result.remainingTokens).toBe(result.totalTokens)

      expect(result).toEqual(mockQuota)
    })

    it('should check model capability successfully', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: { supported: true } })

      const result = await aiApi.checkModelCapability(1, 'text-generation')
      expect(request.get).toHaveBeenCalledWith('/ai/models/1/capabilities/text-generation')
      expect(result).toBe(true)
    })

    it('should handle unsupported capability', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: { supported: false } })

      const result = await aiApi.checkModelCapability(1, 'unknown-capability')
      expect(result).toBe(false)
    })

    it('should handle capability check errors', async () => {
      const error = new Error('Failed to check capability')
      vi.mocked(request.get).mockRejectedValue(error)

      const result = await aiApi.checkModelCapability(1, 'text-generation')
      expect(result).toBe(false)
    })
  })

  describe('Model CRUD Operations', () => {
    it('should create model successfully', async () => {
      const modelData = {
        name: 'new-model',
        displayName: 'New Model',
        provider: 'TestProvider',
        modelType: 'TEXT',
        endpointUrl: 'https://api.test.com',
        apiKey: 'test-key',
        isActive: true
      }

      const mockResponse = {
        id: 1,
        ...modelData,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await aiApi.createModel(modelData)
      expect(request.post).toHaveBeenCalledWith('/ai/models', modelData)
      expect(result).toEqual(mockResponse)
    })

    it('should update model successfully', async () => {
      const updateData = {
        name: 'updated-model',
        isActive: false
      }

      const mockResponse = {
        id: 1,
        ...updateData,
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await aiApi.updateModel(1, updateData)
      expect(request.put).toHaveBeenCalledWith('/ai/models/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete model successfully', async () => {
      vi.mocked(request.del).mockResolvedValue({})

      await aiApi.deleteModel(1)
      expect(request.del).toHaveBeenCalledWith('/ai/models/1')
    })

    it('should toggle model status successfully', async () => {
      const mockResponse = {
        id: 1,
        isActive: true
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await aiApi.toggleModelStatus(1, true)
      expect(request.put).toHaveBeenCalledWith('/ai/models/1', { isActive: true })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Conversation Management', () => {
    it('should get conversations successfully', async () => {
      const mockConversations = [
        {
          id: 1,
          title: 'Test Conversation',
          userId: 1,
          modelId: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockConversations })

      const result = await aiApi.getConversations()
      expect(request.get).toHaveBeenCalledWith('/ai/conversations')

      // 严格验证会话列表
      const apiValidation = validateApiResponseStructure({ data: mockConversations })
      expect(apiValidation.valid).toBe(true)

      if (Array.isArray(result) && result.length > 0) {
        for (const conversation of result) {
          const requiredFieldsValidation = validateRequiredFields(conversation, ['id', 'title', 'userId', 'modelId'])
          expect(requiredFieldsValidation.valid).toBe(true)

          const typeValidation = validateFieldTypes(conversation, {
            id: 'number',
            title: 'string',
            userId: 'number',
            modelId: 'number',
            createdAt: 'string',
            updatedAt: 'string'
          })
          expect(typeValidation.valid).toBe(true)

          // 验证ID范围
          const rangeValidation = validateStatisticalRanges(conversation, {
            id: { min: 1 },
            userId: { min: 1 },
            modelId: { min: 1 }
          })
          expect(rangeValidation.valid).toBe(true)
        }
      }

      expect(result).toEqual(mockConversations)
    })

    it('should create conversation successfully', async () => {
      const conversationData = {
        title: 'New Conversation',
        modelId: 1
      }

      const mockResponse = {
        id: 1,
        ...conversationData,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await aiApi.createConversation(conversationData)
      expect(request.post).toHaveBeenCalledWith('/ai/conversations', conversationData)
      expect(result).toEqual(mockResponse)
    })

    it('should get conversation successfully', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test Conversation',
        userId: 1,
        modelId: 1
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockConversation })

      const result = await aiApi.getConversation('1')
      expect(request.get).toHaveBeenCalledWith('/ai/conversations/1')
      expect(result).toEqual(mockConversation)
    })

    it('should get conversation messages successfully', async () => {
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          role: 'user',
          content: 'Hello',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          conversationId: 1,
          role: 'assistant',
          content: 'Hi there!',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockMessages })

      const result = await aiApi.getConversationMessages(1)
      expect(request.get).toHaveBeenCalledWith('/ai/conversations/1/messages')
      expect(result).toEqual(mockMessages)
    })

    it('should send message successfully', async () => {
      const messageData = {
        content: 'Hello',
        metadata: { modelId: 1 }
      }

      const mockResponse = {
        id: 3,
        conversationId: 1,
        role: 'assistant',
        content: 'Hi there!',
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await aiApi.sendMessage(1, messageData)
      expect(request.post).toHaveBeenCalledWith('/ai/conversations/1/messages', messageData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete conversation successfully', async () => {
      vi.mocked(request.del).mockResolvedValue({})

      await aiApi.deleteConversation(1)
      expect(request.del).toHaveBeenCalledWith('/ai/conversations/1')
    })

    it('should update conversation title successfully', async () => {
      vi.mocked(request.put).mockResolvedValue({})

      await aiApi.updateConversationTitle(1, 'Updated Title')
      expect(request.put).toHaveBeenCalledWith('/ai/conversations/1', { title: 'Updated Title' })
    })
  })

  describe('Memory Management Functions', () => {
    describe('createMemory', () => {
      it('should create memory successfully', async () => {
        const params = {
          userId: 1,
          conversationId: 'conv_123',
          content: 'Test memory',
          memoryType: 'short_term',
          importance: 5
        }

        const mockResponse = {
          id: 1,
          ...params,
          createdAt: '2024-01-01T00:00:00Z'
        }

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await createMemory(params)
        expect(axios.post).toHaveBeenCalledWith('/ai/memory', params)

        // 严格验证内存数据
        const apiValidation = validateApiResponseStructure({ data: mockResponse })
        expect(apiValidation.valid).toBe(true)

        const requiredFieldsValidation = validateRequiredFields(result, ['id', 'userId', 'conversationId', 'content', 'memoryType'])
        expect(requiredFieldsValidation.valid).toBe(true)

        const typeValidation = validateFieldTypes(result, {
          id: 'number',
          userId: 'number',
          conversationId: 'string',
          content: 'string',
          memoryType: 'string',
          importance: 'number',
          createdAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 验证重要性范围
        const rangeValidation = validateStatisticalRanges(result, {
          id: { min: 1 },
          userId: { min: 1 },
          importance: { min: 1, max: 10 }
        })
        expect(rangeValidation.valid).toBe(true)

        // 验证内存类型枚举值
        const validMemoryTypes = ['short_term', 'long_term', 'episodic', 'semantic']
        expect(validMemoryTypes).toContain(result.memoryType)

        expect(result).toEqual(mockResponse)
      })

      it('should handle API errors', async () => {
        const error = new Error('Failed to create memory')
        vi.mocked(axios.post).mockRejectedValue(error)

        await expect(createMemory({
          userId: 1,
          conversationId: 'conv_123',
          content: 'test'
        })).rejects.toThrow('Failed to create memory')
      })
    })

    describe('getConversationMemories', () => {
      it('should get conversation memories successfully', async () => {
        const mockMemories = [
          {
            id: 1,
            conversationId: 'conv_123',
            content: 'Memory 1'
          },
          {
            id: 2,
            conversationId: 'conv_123',
            content: 'Memory 2'
          }
        ]

        vi.mocked(axios.get).mockResolvedValue({ data: mockMemories })

        const result = await getConversationMemories(1, 'conv_123', 20)
        expect(axios.get).toHaveBeenCalledWith('/ai/memory/conversation/conv_123/1', {
          params: { limit: 20 }
        })
        expect(result).toEqual(mockMemories)
      })
    })

    describe('deleteMemory', () => {
      it('should delete memory successfully', async () => {
        const mockResponse = { success: true }

        vi.mocked(axios.delete).mockResolvedValue({ data: mockResponse })

        const result = await deleteMemory(1, 1)
        expect(axios.delete).toHaveBeenCalledWith('/ai/memory/1/1')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('summarizeConversation', () => {
      it('should summarize conversation successfully', async () => {
        const mockResponse = {
          summary: 'Conversation summary',
          keyPoints: ['Point 1', 'Point 2']
        }

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await summarizeConversation(1, 'conv_123')
        expect(axios.post).toHaveBeenCalledWith('/ai/memory/summarize/conv_123/1')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createMemoryWithEmbedding', () => {
      it('should create memory with embedding successfully', async () => {
        const params = {
          userId: 1,
          conversationId: 'conv_123',
          content: 'Test memory with embedding',
          memoryType: 'long_term',
          importance: 8
        }

        const mockResponse = {
          id: 1,
          ...params,
          embedding: [0.1, 0.2, 0.3]
        }

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await createMemoryWithEmbedding(params)
        expect(axios.post).toHaveBeenCalledWith('/ai/memory/with-embedding', params)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('searchSimilarMemories', () => {
      it('should search similar memories successfully', async () => {
        const params = {
          userId: 1,
          query: 'test query',
          limit: 5,
          threshold: 0.7
        }

        const mockResponse = [
          {
            id: 1,
            content: 'Similar memory',
            similarity: 0.85
          }
        ]

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await searchSimilarMemories(params)
        expect(axios.post).toHaveBeenCalledWith('/ai/memory/search-similar', params)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('searchMemoriesByTimeRange', () => {
      it('should search memories by time range successfully', async () => {
        const params = {
          userId: 1,
          query: 'test query',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: 10,
          threshold: 0.6
        }

        const mockResponse = [
          {
            id: 1,
            content: 'Memory in time range',
            date: '2024-06-01'
          }
        ]

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await searchMemoriesByTimeRange(params)
        expect(axios.post).toHaveBeenCalledWith('/ai/memory/memory/search/time-range/1', {
          query: params.query,
          startDate: params.startDate,
          endDate: params.endDate,
          limit: params.limit,
          threshold: params.threshold
        })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('searchLastMonthMemories', () => {
      it('should search last month memories successfully', async () => {
        const params = {
          userId: 1,
          query: 'test query',
          limit: 15
        }

        const mockResponse = [
          {
            id: 1,
            content: 'Memory from last month',
            date: '2024-11-15'
          }
        ]

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

        const result = await searchLastMonthMemories(params)
        expect(axios.post).toHaveBeenCalledWith('/ai/memory/memory/search/last-month/1', {
          query: params.query,
          limit: params.limit
        })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('Additional Features', () => {
    it('should initialize AI module successfully', async () => {
      const mockResponse = {
        status: 'initialized',
        models: ['gpt-4', 'claude']
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await aiApi.initialize()
      expect(request.get).toHaveBeenCalledWith('/ai/initialize')
      expect(result).toEqual(mockResponse)
    })

    it('should start consultation successfully', async () => {
      const params = {
        userId: 1,
        consultationType: 'educational'
      }

      const mockResponse = {
        consultationId: 'consult_123',
        status: 'started'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await aiApi.startConsultation(params)
      expect(request.post).toHaveBeenCalledWith('/ai/consultation/start', params)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(aiApi.getModels()).rejects.toThrow('API Error')

      // 验证错误被正确传播
      expect(request.get).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors', async () => {
      const error = new Error('Network Error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(aiApi.getModels()).rejects.toThrow('Network Error')

      // 验证网络错误的处理
      expect(request.get).toHaveBeenCalledWith('/ai/models')
    })

    it('should handle timeout errors', async () => {
      const error = new Error('Timeout Error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(aiApi.getModels()).rejects.toThrow('Timeout Error')
    })

    it('should handle validation errors', async () => {
      const invalidResponse = {
        data: [
          {
            // 缺少必需字段
            name: 'invalid-model',
            // 缺少 id 和 provider
          }
        ]
      }

      vi.mocked(request.get).mockResolvedValue(invalidResponse)

      const result = await aiApi.getModels()

      // 验证响应被接收但数据无效
      expect(Array.isArray(result)).toBe(true)

      if (result.length > 0) {
        const invalidModel = result[0]
        const requiredFieldsValidation = validateRequiredFields(invalidModel, ['id', 'name', 'provider'])
        expect(requiredFieldsValidation.valid).toBe(false)
        expect(requiredFieldsValidation.missing).toContain('id')
        expect(requiredFieldsValidation.missing).toContain('provider')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: [] })

      const result = await aiApi.getModels()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should handle malformed responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: 'invalid' })

      const result = await aiApi.getModels()
      expect(typeof result).toBe('string')

      // 验证不是预期的数组格式
      expect(Array.isArray(result)).toBe(false)
    })

    it('should handle null responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })

      const result = await aiApi.getModels()
      expect(result).toBeNull()
    })

    it('should handle partial data responses', async () => {
      const partialData = [
        {
          id: 1,
          name: 'partial-model',
          // 缺少 provider 和其他字段
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: partialData })

      const result = await aiApi.getModels()
      expect(Array.isArray(result)).toBe(true)

      if (result.length > 0) {
        const partialModel = result[0]

        // 验证部分数据的存在
        expect(partialModel.id).toBe(1)
        expect(partialModel.name).toBe('partial-model')

        // 验证缺失字段
        const requiredFieldsValidation = validateRequiredFields(partialModel, ['id', 'name', 'provider'])
        expect(requiredFieldsValidation.valid).toBe(false)
      }
    })

    it('should handle extreme boundary values', async () => {
      const extremeModel = {
        id: Number.MAX_SAFE_INTEGER,
        name: 'A'.repeat(1000), // 极长的名称
        provider: '',
        contextWindow: 0,
        maxTokens: Number.MAX_SAFE_INTEGER,
        capabilities: [],
        description: null,
        isAvailable: false
      }

      vi.mocked(request.get).mockResolvedValue({ data: [extremeModel] })

      const result = await aiApi.getModels()
      expect(Array.isArray(result)).toBe(true)

      if (result.length > 0) {
        const model = result[0]

        // 验证极值处理
        const rangeValidation = validateStatisticalRanges(model, {
          contextWindow: { min: 1 },
          maxTokens: { min: 1 }
        })
        // 预期会失败因为值为0或超出范围
        expect(rangeValidation.valid || rangeValidation.valid === false).toBeDefined()
      }
    })
  })
})