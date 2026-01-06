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
import request from '@/utils/request'
import { AI_ENDPOINTS } from '@/api/endpoints'
import {
  getModels,
  getModelBilling,
  createModel,
  updateModel,
  deleteModel,
  setDefaultModel,
  toggleModelStatus
} from '@/api/ai-model'

// Mock request module
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
    MODEL_BY_ID: (id) => `/ai/models/${id}`,
    MODEL_BILLING: (id) => `/ai/models/${id}/billing`,
    MODEL_DEFAULT: '/ai/models/default'
  }
}))

describe('AI Model API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getModels', () => {
    it('should get models successfully', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT',
          isActive: true,
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'claude',
          displayName: 'Claude',
          provider: 'Anthropic',
          modelType: 'TEXT',
          isActive: true,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockModels })

      const result = await getModels()

      expect(request.get).toHaveBeenCalledWith('/ai/models')
      expect(result).toEqual(mockModels)
    })

    it('should handle empty models list', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: [] })

      const result = await getModels()
      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getModels()).rejects.toThrow('Failed to fetch models')
    })
  })

  describe('getModelBilling', () => {
    it('should get model billing information successfully', async () => {
      const mockBilling = {
        modelId: 1,
        totalCost: 100.50,
        requestCount: 1000,
        averageCostPerRequest: 0.1005,
        billingPeriod: '2024-01',
        details: {
          inputTokens: 50000,
          outputTokens: 30000,
          costBreakdown: [
            { type: 'input', cost: 50.00 },
            { type: 'output', cost: 50.50 }
          ]
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockBilling })

      const result = await getModelBilling(1)

      expect(request.get).toHaveBeenCalledWith('/ai/models/1/billing')
      expect(result).toEqual(mockBilling)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch billing info')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getModelBilling(1)).rejects.toThrow('Failed to fetch billing info')
    })
  })

  describe('createModel', () => {
    it('should create model successfully', async () => {
      const modelData = {
        name: 'new-model',
        displayName: 'New Model',
        provider: 'TestProvider',
        modelType: 'TEXT',
        apiVersion: 'v1',
        endpointUrl: 'https://api.test.com/v1',
        apiKey: 'test-key',
        modelParameters: {
          temperature: 0.7,
          maxTokens: 1000
        },
        isActive: true,
        isDefault: false
      }

      const mockResponse = {
        id: 3,
        ...modelData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createModel(modelData)

      expect(request.post).toHaveBeenCalledWith('/ai/models', modelData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle minimal model creation data', async () => {
      const minimalData = {
        name: 'minimal-model',
        displayName: 'Minimal Model',
        provider: 'TestProvider',
        modelType: 'TEXT',
        endpointUrl: 'https://api.test.com/v1',
        apiKey: 'test-key'
      }

      const mockResponse = {
        id: 4,
        ...minimalData,
        isActive: false,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createModel(minimalData)

      expect(request.post).toHaveBeenCalledWith('/ai/models', minimalData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to create model')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(createModel({} as any)).rejects.toThrow('Failed to create model')
    })
  })

  describe('updateModel', () => {
    it('should update model successfully', async () => {
      const updateData = {
        name: 'updated-model',
        displayName: 'Updated Model',
        isActive: true
      }

      const mockResponse = {
        id: 1,
        ...updateData,
        provider: 'OpenAI',
        modelType: 'TEXT',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await updateModel(1, updateData)

      expect(request.put).toHaveBeenCalledWith('/ai/models/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle partial updates', async () => {
      const partialUpdate = {
        displayName: 'Updated Display Name'
      }

      const mockResponse = {
        id: 1,
        displayName: 'Updated Display Name',
        name: 'original-name',
        provider: 'OpenAI'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await updateModel(1, partialUpdate)

      expect(request.put).toHaveBeenCalledWith('/ai/models/1', partialUpdate)
      expect(result.displayName).toBe('Updated Display Name')
      expect(result.name).toBe('original-name')
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to update model')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(updateModel(1, {})).rejects.toThrow('Failed to update model')
    })
  })

  describe('deleteModel', () => {
    it('should delete model successfully', async () => {
      const mockResponse = { success: true, deletedId: 1 }

      vi.mocked(request.del).mockResolvedValue({ data: mockResponse })

      const result = await deleteModel(1)

      expect(request.del).toHaveBeenCalledWith('/ai/models/1')
      expect(result).toEqual(mockResponse)
    })

    it('should handle different model IDs', async () => {
      const modelIds = [1, 2, 3, 100]

      for (const modelId of modelIds) {
        const mockResponse = { success: true, deletedId: modelId }
        vi.mocked(request.del).mockResolvedValue({ data: mockResponse })

        const result = await deleteModel(modelId)

        expect(request.del).toHaveBeenCalledWith(`/ai/models/${modelId}`)
        expect(result.deletedId).toBe(modelId)

        vi.clearAllMocks()
      }
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to delete model')
      vi.mocked(request.del).mockRejectedValue(error)

      await expect(deleteModel(1)).rejects.toThrow('Failed to delete model')
    })
  })

  describe('setDefaultModel', () => {
    it('should set default model successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Model set as default successfully',
        modelId: 1
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await setDefaultModel(1)

      expect(request.post).toHaveBeenCalledWith('/ai/models/default', { modelId: 1 })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to set default model')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(setDefaultModel(1)).rejects.toThrow('Failed to set default model')
    })
  })

  describe('toggleModelStatus', () => {
    it('should activate model successfully', async () => {
      const mockResponse = {
        id: 1,
        isActive: true,
        message: 'Model activated successfully'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await toggleModelStatus(1, true)

      expect(request.put).toHaveBeenCalledWith('/ai/models/1', { isActive: true })
      expect(result.isActive).toBe(true)
    })

    it('should deactivate model successfully', async () => {
      const mockResponse = {
        id: 1,
        isActive: false,
        message: 'Model deactivated successfully'
      }

      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })

      const result = await toggleModelStatus(1, false)

      expect(request.put).toHaveBeenCalledWith('/ai/models/1', { isActive: false })
      expect(result.isActive).toBe(false)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to toggle model status')
      vi.mocked(request.put).mockRejectedValue(error)

      await expect(toggleModelStatus(1, true)).rejects.toThrow('Failed to toggle model status')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })

      const result = await getModels()
      expect(result).toBeNull()
    })

    it('should handle malformed responses', async () => {
      const malformedData = { invalid: 'response' }
      vi.mocked(request.get).mockResolvedValue({ data: malformedData })

      const result = await getModels()
      expect(result).toEqual(malformedData)
    })

    it('should handle large model data', async () => {
      const largeModelData = {
        name: 'x'.repeat(1000),
        displayName: 'y'.repeat(1000),
        provider: 'z'.repeat(1000),
        modelType: 'TEXT',
        endpointUrl: 'https://'.repeat(100) + 'api.test.com',
        apiKey: 'key'.repeat(100)
      }

      const mockResponse = {
        id: 1,
        ...largeModelData,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createModel(largeModelData)
      expect(result.name).toBe(largeModelData.name)
    })

    it('should handle special characters in model data', async () => {
      const specialCharData = {
        name: 'model_中文_🎉',
        displayName: 'Model 中文 🌟',
        provider: 'Provider_测试',
        modelType: 'TEXT',
        endpointUrl: 'https://api.test.com/中文/path',
        apiKey: 'key_中文_🔑'
      }

      const mockResponse = {
        id: 1,
        ...specialCharData,
        createdAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })

      const result = await createModel(specialCharData)
      expect(result.name).toBe(specialCharData.name)
    })
  })

  describe('Data Validation', () => {
    it('should handle invalid model IDs', async () => {
      const invalidIds = [0, -1, 999999, 'invalid', null, undefined]

      for (const modelId of invalidIds) {
        const error = new Error('Invalid model ID')
        vi.mocked(request.del).mockRejectedValue(error)

        await expect(deleteModel(modelId as number)).rejects.toThrow('Invalid model ID')
        vi.clearAllMocks()
      }
    })

    it('should handle missing required fields in creation', async () => {
      const incompleteData = {
        name: 'test-model'
        // Missing required fields like provider, modelType, etc.
      }

      const error = new Error('Missing required fields')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(createModel(incompleteData as any)).rejects.toThrow('Missing required fields')
    })
  })

  describe('Network Issues', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      vi.mocked(request.get).mockRejectedValue(timeoutError)

      await expect(getModels()).rejects.toThrow('Request timeout')
    })

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(request.get).mockRejectedValue(networkError)

      await expect(getModels()).rejects.toThrow('Network Error')
    })

    it('should handle server errors (5xx)', async () => {
      const serverError = new Error('Internal Server Error: 500')
      vi.mocked(request.get).mockRejectedValue(serverError)

      await expect(getModels()).rejects.toThrow('Internal Server Error: 500')
    })

    it('should handle client errors (4xx)', async () => {
      const clientError = new Error('Bad Request: 400')
      vi.mocked(request.get).mockRejectedValue(clientError)

      await expect(getModels()).rejects.toThrow('Bad Request: 400')
    })
  })
})