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
import { get } from '@/utils/request'
import {
  AI_MODEL_ENDPOINTS,
  getAIModels,
  getDefaultAIModel,
  getAIModelStats,
  getAvailableProviders,
  getProviderModels,
  getDefaultAIConfig,
  getModelsByType,
  getFirstAvailableTextModel,
  getModelCapabilities,
  checkModelCapability,
  getProviderOptions,
  getModelOptions,
  initializeAIConfig
} from '@/api/ai-model-config'

// Mock request module
vi.mock('@/utils/request', () => ({
  get: vi.fn()
}))

describe('AI Model Config API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAIModels', () => {
    it('should get AI models successfully', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT',
          status: 'active',
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
          status: 'active',
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockModels })

      const result = await getAIModels()

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.MODELS)
      expect(result).toEqual(mockModels)
    })

    it('should handle empty models list', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getAIModels()
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getAIModels()
      expect(result).toEqual([])
    })
  })

  describe('getDefaultAIModel', () => {
    it('should get default AI model successfully', async () => {
      const mockModel = {
        id: 1,
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'OpenAI',
        modelType: 'TEXT',
        status: 'active',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      vi.mocked(get).mockResolvedValue({ data: mockModel })

      const result = await getDefaultAIModel()

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.MODELS_DEFAULT)
      expect(result).toEqual(mockModel)
    })

    it('should handle no default model', async () => {
      vi.mocked(get).mockResolvedValue({ data: null })

      const result = await getDefaultAIModel()
      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch default model')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getDefaultAIModel()
      expect(result).toBeNull()
    })
  })

  describe('getAIModelStats', () => {
    it('should get AI model statistics successfully', async () => {
      const mockStats = {
        totalModels: 10,
        activeModels: 8,
        byType: {
          TEXT: 6,
          IMAGE: 2,
          SPEECH: 2
        },
        byProvider: {
          OpenAI: 5,
          Anthropic: 3,
          Google: 2
        }
      }

      vi.mocked(get).mockResolvedValue({ data: mockStats })

      const result = await getAIModelStats()

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.MODELS_STATS)
      expect(result).toEqual(mockStats)
    })

    it('should handle empty statistics', async () => {
      const emptyStats = {
        totalModels: 0,
        activeModels: 0,
        byType: {},
        byProvider: {}
      }

      vi.mocked(get).mockResolvedValue({ data: emptyStats })

      const result = await getAIModelStats()
      expect(result).toEqual(emptyStats)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch model stats')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getAIModelStats()
      expect(result).toEqual({
        totalModels: 0,
        activeModels: 0,
        byType: {},
        byProvider: {}
      })
    })
  })

  describe('getAvailableProviders', () => {
    it('should get available providers successfully', async () => {
      const mockProviders = [
        {
          value: 'openai',
          label: 'OpenAI',
          description: 'OpenAI models',
          supportedTypes: ['TEXT', 'IMAGE', 'SPEECH']
        },
        {
          value: 'anthropic',
          label: 'Anthropic',
          description: 'Anthropic models',
          supportedTypes: ['TEXT']
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockProviders })

      const result = await getAvailableProviders()

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.PROVIDERS)
      expect(result).toEqual(mockProviders)
    })

    it('should handle empty providers list', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getAvailableProviders()
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch providers')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getAvailableProviders()
      expect(result).toEqual([])
    })
  })

  describe('getProviderModels', () => {
    it('should get provider models successfully', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT',
          status: 'active'
        },
        {
          id: 2,
          name: 'dall-e',
          displayName: 'DALL-E',
          provider: 'OpenAI',
          modelType: 'IMAGE',
          status: 'active'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockModels })

      const result = await getProviderModels('openai')

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.PROVIDER_MODELS('openai'))
      expect(result).toEqual(mockModels)
    })

    it('should handle empty models for provider', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getProviderModels('unknown')
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch provider models')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getProviderModels('openai')
      expect(result).toEqual([])
    })
  })

  describe('getDefaultAIConfig', () => {
    it('should get default AI config successfully', async () => {
      const mockConfig = {
        textModel: 'gpt-4',
        imageModel: 'dall-e',
        speechModel: 'whisper',
        embeddingProvider: 'openai'
      }

      vi.mocked(get).mockResolvedValue({ data: mockConfig })

      const result = await getDefaultAIConfig()

      expect(get).toHaveBeenCalledWith(AI_MODEL_ENDPOINTS.DEFAULT_CONFIG)
      expect(result).toEqual(mockConfig)
    })

    it('should handle empty config', async () => {
      const emptyConfig = {
        textModel: '',
        embeddingProvider: ''
      }

      vi.mocked(get).mockResolvedValue({ data: emptyConfig })

      const result = await getDefaultAIConfig()
      expect(result).toEqual(emptyConfig)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch default config')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getDefaultAIConfig()
      expect(result).toEqual({
        textModel: '',
        embeddingProvider: ''
      })
    })
  })

  describe('getModelsByType', () => {
    it('should get models by type successfully', async () => {
      const mockAllModels = [
        {
          id: 1,
          name: 'gpt-4',
          modelType: 'TEXT',
          status: 'active'
        },
        {
          id: 2,
          name: 'dall-e',
          modelType: 'IMAGE',
          status: 'active'
        },
        {
          id: 3,
          name: 'claude',
          modelType: 'TEXT',
          status: 'inactive'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockAllModels })

      const result = await getModelsByType('TEXT')

      expect(result).toEqual([
        {
          id: 1,
          name: 'gpt-4',
          modelType: 'TEXT',
          status: 'active'
        }
      ])
    })

    it('should handle no models of specified type', async () => {
      const mockAllModels = [
        {
          id: 1,
          name: 'dall-e',
          modelType: 'IMAGE',
          status: 'active'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockAllModels })

      const result = await getModelsByType('TEXT')
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getModelsByType('TEXT')
      expect(result).toEqual([])
    })
  })

  describe('getFirstAvailableTextModel', () => {
    it('should get first available text model successfully', async () => {
      const mockTextModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT',
          status: 'active'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockTextModels })

      const result = await getFirstAvailableTextModel()

      expect(result).toEqual(mockTextModels[0])
    })

    it('should handle no available text models', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getFirstAvailableTextModel()
      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getFirstAvailableTextModel()
      expect(result).toBeNull()
    })
  })

  describe('getModelCapabilities', () => {
    it('should get model capabilities successfully', async () => {
      const mockCapabilities = ['text-generation', 'chat', 'code-generation']

      vi.mocked(get).mockResolvedValue({ data: mockCapabilities })

      const result = await getModelCapabilities(1)

      expect(get).toHaveBeenCalledWith(`${AI_MODEL_ENDPOINTS.MODELS}/1/capabilities`)
      expect(result).toEqual(mockCapabilities)
    })

    it('should handle empty capabilities', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getModelCapabilities(1)
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch model capabilities')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getModelCapabilities(1)
      expect(result).toEqual([])
    })
  })

  describe('checkModelCapability', () => {
    it('should check model capability successfully', async () => {
      vi.mocked(get).mockResolvedValue({ data: { supported: true } })

      const result = await checkModelCapability(1, 'text-generation')

      expect(get).toHaveBeenCalledWith(`${AI_MODEL_ENDPOINTS.MODELS}/1/capabilities/text-generation`)
      expect(result).toBe(true)
    })

    it('should handle unsupported capability', async () => {
      vi.mocked(get).mockResolvedValue({ data: { supported: false } })

      const result = await checkModelCapability(1, 'unknown-capability')
      expect(result).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to check capability')
      vi.mocked(get).mockRejectedValue(error)

      const result = await checkModelCapability(1, 'text-generation')
      expect(result).toBe(false)
    })
  })

  describe('getProviderOptions', () => {
    it('should get provider options successfully', async () => {
      const mockProviders = [
        {
          value: 'openai',
          label: 'OpenAI',
          description: 'OpenAI models',
          supportedTypes: ['TEXT']
        },
        {
          value: 'anthropic',
          label: 'Anthropic',
          description: 'Anthropic models',
          supportedTypes: ['TEXT']
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockProviders })

      const result = await getProviderOptions()

      expect(result).toEqual([
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' }
      ])
    })

    it('should handle empty providers', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getProviderOptions()
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch providers')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getProviderOptions()
      expect(result).toEqual([])
    })
  })

  describe('getModelOptions', () => {
    it('should get all model options successfully', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT'
        },
        {
          id: 2,
          name: 'dall-e',
          displayName: 'DALL-E',
          provider: 'OpenAI',
          modelType: 'IMAGE'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockModels })

      const result = await getModelOptions()

      expect(result).toEqual([
        { label: 'GPT-4', value: 'gpt-4', provider: 'OpenAI' },
        { label: 'DALL-E', value: 'dall-e', provider: 'OpenAI' }
      ])
    })

    it('should get model options by type', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'OpenAI',
          modelType: 'TEXT'
        },
        {
          id: 2,
          name: 'claude',
          displayName: 'Claude',
          provider: 'Anthropic',
          modelType: 'TEXT'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockModels })

      const result = await getModelOptions('TEXT')

      expect(result).toEqual([
        { label: 'GPT-4', value: 'gpt-4', provider: 'OpenAI' },
        { label: 'Claude', value: 'claude', provider: 'Anthropic' }
      ])
    })

    it('should handle empty models', async () => {
      vi.mocked(get).mockResolvedValue({ data: [] })

      const result = await getModelOptions()
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(get).mockRejectedValue(error)

      const result = await getModelOptions()
      expect(result).toEqual([])
    })
  })

  describe('initializeAIConfig', () => {
    it('should initialize AI config successfully', async () => {
      const mockStats = {
        totalModels: 10,
        activeModels: 8,
        byType: { TEXT: 6 },
        byProvider: { OpenAI: 5 }
      }

      const mockConfig = {
        textModel: 'gpt-4',
        embeddingProvider: 'openai'
      }

      const mockProviders = [
        {
          value: 'openai',
          label: 'OpenAI',
          supportedTypes: ['TEXT']
        }
      ]

      vi.mocked(get)
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockConfig })
        .mockResolvedValueOnce({ data: mockProviders })

      const result = await initializeAIConfig()

      expect(result).toEqual({
        stats: mockStats,
        defaultConfig: mockConfig,
        providers: mockProviders
      })
    })

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Initialization failed')
      vi.mocked(get).mockRejectedValue(error)

      const result = await initializeAIConfig()
      expect(result).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed API responses', async () => {
      vi.mocked(get).mockResolvedValue({ data: 'invalid' })

      const result = await getAIModels()
      expect(result).toEqual('invalid')
    })

    it('should handle missing displayName in model options', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'gpt-4',
          provider: 'OpenAI',
          modelType: 'TEXT'
        }
      ]

      vi.mocked(get).mockResolvedValue({ data: mockModels })

      const result = await getModelOptions()
      expect(result).toEqual([
        { label: 'gpt-4', value: 'gpt-4', provider: 'OpenAI' }
      ])
    })
  })
})