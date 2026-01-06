/**
 * AI Model Cache Service Test
 * AI模型缓存服务测试
 * 
 * 测试覆盖范围：
 * - 单例模式实现
 * - 缓存初始化功能
 * - 数据库模型加载
 * - Fallback模型加载
 * - 模型获取功能
 * - 专用模型获取
 * - 缓存刷新机制
 * - 缓存统计信息
 * - 数据解析处理
 * - 超时处理
 * - 错误处理机制
 * - 缓存失效处理
 * - 模型分类缓存
 */

import { AIModelCacheService } from '../../../src/services/ai-model-cache.service'
import { sequelize } from '../../../src/init'

// Mock dependencies
jest.mock('../../../src/init')


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

describe('AIModelCacheService', () => {
  let aiModelCacheService: AIModelCacheService
  let mockSequelize: jest.Mocked<typeof sequelize>

  beforeEach(() => {
    // Reset all mocks and singleton instance
    jest.clearAllMocks()
    ;
import { vi } from 'vitest'(AIModelCacheService as any).instance = null
    
    // Setup mock implementations
    mockSequelize = sequelize as jest.Mocked<typeof sequelize>

    // Create service instance
    aiModelCacheService = AIModelCacheService.getInstance()
  })

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = AIModelCacheService.getInstance()
      const instance2 = AIModelCacheService.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('应该只创建一个实例', () => {
      const getInstanceSpy = jest.spyOn(AIModelCacheService.prototype as any, 'constructor')
      
      const instance1 = AIModelCacheService.getInstance()
      const instance2 = AIModelCacheService.getInstance()
      
      expect(getInstanceSpy).toHaveBeenCalledTimes(1)
      expect(instance1).toBe(instance2)
      
      getInstanceSpy.mockRestore()
    })
  })

  describe('initializeCache', () => {
    it('应该成功初始化模型缓存', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'test-model-1',
          display_name: 'Test Model 1',
          provider: 'test-provider',
          model_type: 'text',
          endpoint_url: 'https://api.test.com/v1/chat/completions',
          api_key: 'test-key-1',
          model_parameters: '{"temperature": 0.7}',
          status: 'active',
          is_default: true
        },
        {
          id: 2,
          name: 'test-model-2',
          display_name: 'Test Model 2',
          provider: 'test-provider',
          model_type: 'image',
          endpoint_url: 'https://api.test.com/v1/images/generations',
          api_key: 'test-key-2',
          model_parameters: '{"size": "1024x768"}',
          status: 'active',
          is_default: false
        }
      ]

      mockSequelize.query.mockResolvedValue([mockModels])

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await aiModelCacheService.initializeCache()

      expect(mockSequelize.query).toHaveBeenCalledWith(`
        SELECT
          id, name, display_name, provider, model_type, endpoint_url,
          api_key, model_parameters, status, is_default
        FROM ai_model_config
        WHERE status = 'active'
        ORDER BY is_default DESC, created_at ASC
      `)

      expect(consoleSpy).toHaveBeenCalledWith('🤖 正在初始化AI模型缓存...')
      expect(consoleSpy).toHaveBeenCalledWith(`✅ AI模型缓存初始化完成，共加载 2 个模型`)

      consoleSpy.mockRestore()
    })

    it('应该处理数据库查询超时', async () => {
      // Mock database query to hang (simulate timeout)
      mockSequelize.query.mockImplementation(() => new Promise(() => {}))

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

      await aiModelCacheService.initializeCache()

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 数据库加载失败，使用fallback配置:', expect.stringContaining('数据库加载超时'))
      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️ 使用fallback配置启动，共加载 2 个模型')

      consoleSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('应该处理数据库查询失败', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'))

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

      await aiModelCacheService.initializeCache()

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ AI模型缓存初始化失败:', expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 数据库加载失败，使用fallback配置:', expect.stringContaining('Database connection failed'))
      expect(consoleLogSpy).toHaveBeenCalledWith('⚠️ 使用fallback配置启动，共加载 2 个模型')

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('应该正确解析模型参数', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'test-model',
          display_name: 'Test Model',
          provider: 'test-provider',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: '{"temperature": 0.7, "maxTokens": 1000}',
          status: 'active',
          is_default: true
        }
      ]

      mockSequelize.query.mockResolvedValue([mockModels])

      await aiModelCacheService.initializeCache()

      const model = await aiModelCacheService.getModelByName('test-model')
      expect(model.modelParameters).toEqual({
        temperature: 0.7,
        maxTokens: 1000
      })
    })

    it('应该处理无效的模型参数JSON', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'test-model',
          display_name: 'Test Model',
          provider: 'test-provider',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: 'invalid json {',
          status: 'active',
          is_default: true
        }
      ]

      mockSequelize.query.mockResolvedValue([mockModels])

      await aiModelCacheService.initializeCache()

      const model = await aiModelCacheService.getModelByName('test-model')
      expect(model.modelParameters).toEqual({})
    })
  })

  describe('loadFallbackModels', () => {
    it('应该成功加载fallback模型配置', () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()

      expect(service.modelCache.size).toBeGreaterThan(0)
      expect(service.modelCache.has('doubao-seed-1-6-thinking-250615')).toBe(true)
      expect(service.modelCache.has('doubao-seedream-3-0-t2i-250415')).toBe(true)
      expect(service.modelCache.has('DEFAULT_MODEL')).toBe(true)
      expect(service.modelCache.has('DB_QUERY_MODEL')).toBe(true)
      expect(service.modelCache.has('INTENT_MODEL')).toBe(true)
      expect(service.modelCache.has('QA_MODEL')).toBe(true)
    })

    it('应该正确设置默认模型', () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()

      const defaultModel = service.modelCache.get('DEFAULT_MODEL')
      expect(defaultModel.name).toBe('doubao-seed-1-6-thinking-250615')
      expect(defaultModel.isDefault).toBe(true)
    })
  })

  describe('getAvailableModels', () => {
    it('应该返回所有可用模型', async () => {
      const service = aiModelCacheService as any

      // Load fallback models for testing
      service.loadFallbackModels()
      service.isInitialized = true

      const models = await aiModelCacheService.getAvailableModels()

      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)
      
      // Should not include shortcut keys
      const modelNames = models.map(m => m.name)
      expect(modelNames).not.toContain('DEFAULT_MODEL')
      expect(modelNames).not.toContain('DB_QUERY_MODEL')
      expect(modelNames).toContain('doubao-seed-1-6-thinking-250615')
    })
  })

  describe('getDatabaseQueryModel', () => {
    it('应该返回数据库查询专用模型', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getDatabaseQueryModel()

      expect(model).toBeDefined()
      expect(model.name).toBe('doubao-seed-1-6-thinking-250615')
    })

    it('没有专用模型时应该返回默认模型', async () => {
      const service = aiModelCacheService as any

      // Load only default model
      service.modelCache.clear()
      service.modelCache.set('DEFAULT_MODEL', {
        name: 'default-model',
        isDefault: true
      })
      service.isInitialized = true

      const model = await aiModelCacheService.getDatabaseQueryModel()

      expect(model).toBeDefined()
      expect(model.name).toBe('default-model')
    })
  })

  describe('getIntentAnalysisModel', () => {
    it('应该返回意图分析专用模型', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getIntentAnalysisModel()

      expect(model).toBeDefined()
      expect(model.name).toBe('doubao-seed-1-6-thinking-250615')
    })
  })

  describe('getQAModel', () => {
    it('应该返回AI问答专用模型', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getQAModel()

      expect(model).toBeDefined()
      expect(model.name).toBe('doubao-seed-1-6-thinking-250615')
    })
  })

  describe('getModelByName', () => {
    it('应该根据名称返回指定模型', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getModelByName('doubao-seed-1-6-thinking-250615')

      expect(model).toBeDefined()
      expect(model.name).toBe('doubao-seed-1-6-thinking-250615')
      expect(model.displayName).toBe('Doubao 1.6 Thinking (推理增强版)')
    })

    it('模型不存在时应该返回undefined', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getModelByName('nonexistent-model')

      expect(model).toBeUndefined()
    })
  })

  describe('getDefaultModel', () => {
    it('应该返回默认模型', async () => {
      const service = aiModelCacheService as any

      service.loadFallbackModels()
      service.isInitialized = true

      const model = await aiModelCacheService.getDefaultModel()

      expect(model).toBeDefined()
      expect(model.isDefault).toBe(true)
    })
  })

  describe('ensureCacheReady', () => {
    it('应该在未初始化时重新加载缓存', async () => {
      const service = aiModelCacheService as any

      service.isInitialized = false
      service.lastRefreshTime = 0

      const loadSpy = jest.spyOn(service, 'loadModelsFromDatabase').mockResolvedValue()

      await service.ensureCacheReady()

      expect(loadSpy).toHaveBeenCalled()
      expect(service.isInitialized).toBe(true)

      loadSpy.mockRestore()
    })

    it('应该在缓存过期时重新加载', async () => {
      const service = aiModelCacheService as any

      service.isInitialized = true
      service.lastRefreshTime = Date.now() - (31 * 60 * 1000) // 31 minutes ago (expired)

      const loadSpy = jest.spyOn(service, 'loadModelsFromDatabase').mockResolvedValue()

      await service.ensureCacheReady()

      expect(loadSpy).toHaveBeenCalled()

      loadSpy.mockRestore()
    })

    it('不应该在缓存有效时重新加载', async () => {
      const service = aiModelCacheService as any

      service.isInitialized = true
      service.lastRefreshTime = Date.now() - (10 * 60 * 1000) // 10 minutes ago (valid)

      const loadSpy = jest.spyOn(service, 'loadModelsFromDatabase').mockResolvedValue()

      await service.ensureCacheReady()

      expect(loadSpy).not.toHaveBeenCalled()

      loadSpy.mockRestore()
    })
  })

  describe('refreshCache', () => {
    it('应该成功手动刷新缓存', async () => {
      const service = aiModelCacheService as any

      const loadSpy = jest.spyOn(service, 'loadModelsFromDatabase').mockResolvedValue()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await aiModelCacheService.refreshCache()

      expect(loadSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('🔄 手动刷新AI模型缓存...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ AI模型缓存刷新完成')

      loadSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('getCacheStats', () => {
    it('应该返回正确的缓存统计信息', () => {
      const service = aiModelCacheService as any

      service.isInitialized = true
      service.lastRefreshTime = Date.now()
      service.modelCache.set('test-model', { name: 'test' })

      const stats = aiModelCacheService.getCacheStats()

      expect(stats).toEqual({
        isInitialized: true,
        modelCount: 1,
        lastRefreshTime: expect.any(String),
        nextRefreshTime: expect.any(String)
      })

      expect(new Date(stats.lastRefreshTime).getTime()).toBe(service.lastRefreshTime)
    })

    it('应该处理未初始化的缓存', () => {
      const service = aiModelCacheService as any

      service.isInitialized = false
      service.lastRefreshTime = 0
      service.modelCache.clear()

      const stats = aiModelCacheService.getCacheStats()

      expect(stats).toEqual({
        isInitialized: false,
        modelCount: 0,
        lastRefreshTime: new Date(0).toISOString(),
        nextRefreshTime: new Date(service.CACHE_REFRESH_INTERVAL).toISOString()
      })
    })
  })

  describe('模型分类缓存', () => {
    it('应该正确分类缓存模型', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'dbquery-model',
          display_name: 'DB Query Model',
          provider: 'test',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: '{}',
          status: 'active',
          is_default: false
        },
        {
          id: 2,
          name: 'intent-model',
          display_name: 'Intent Model',
          provider: 'test',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: '{}',
          status: 'active',
          is_default: false
        },
        {
          id: 3,
          name: '128k-model',
          display_name: '128K Model',
          provider: 'test',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: '{}',
          status: 'active',
          is_default: false
        },
        {
          id: 4,
          name: 'doubao-general',
          display_name: 'Doubao General',
          provider: 'test',
          model_type: 'text',
          endpoint_url: 'https://api.test.com',
          api_key: 'test-key',
          model_parameters: '{}',
          status: 'active',
          is_default: true
        }
      ]

      mockSequelize.query.mockResolvedValue([mockModels])

      await aiModelCacheService.initializeCache()

      expect(await aiModelCacheService.getDatabaseQueryModel()).toBeDefined()
      expect(await aiModelCacheService.getIntentAnalysisModel()).toBeDefined()
      expect(await aiModelCacheService.getQAModel()).toBeDefined()
      expect(await aiModelCacheService.getDefaultModel()).toBeDefined()
    })
  })
})