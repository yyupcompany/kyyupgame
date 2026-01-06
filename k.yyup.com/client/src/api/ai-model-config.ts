/**
 * AI模型配置API
 * 动态获取数据库中的AI模型配置，移除硬编码
 */

import { get } from '@/utils/request'

// API端点常量
export const AI_MODEL_ENDPOINTS = {
  MODELS: '/api/ai/models',
  MODELS_DEFAULT: '/api/ai/models/default',
  MODELS_STATS: '/api/ai/models/stats',
  PROVIDERS: '/api/ai/providers',
  PROVIDER_MODELS: (provider: string) => `/api/ai/providers/${provider}/models`,
  DEFAULT_CONFIG: '/api/ai/default-config'
}

// 模型类型定义
export interface AIModel {
  id: number
  name: string
  displayName: string
  provider: string
  modelType: 'TEXT' | 'IMAGE' | 'SPEECH' | 'MULTIMODAL' | 'VIDEO'
  endpointUrl?: string
  capabilities: string[]
  status: 'active' | 'inactive' | 'testing'
  isDefault?: boolean
  modelParameters?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    frequencyPenalty?: number
    presencePenalty?: number
  }
  createdAt: string
  updatedAt: string
}

export interface AIProvider {
  value: string
  label: string
  description?: string
  supportedTypes: string[]
}

export interface AIModelStats {
  totalModels: number
  activeModels: number
  byType: Record<string, number>
  byProvider: Record<string, number>
}

export interface DefaultAIConfig {
  textModel: string
  imageModel?: string
  speechModel?: string
  embeddingProvider: string
}

/**
 * 获取所有AI模型列表
 */
export const getAIModels = async (): Promise<AIModel[]> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.MODELS)
    return response.data || []
  } catch (error) {
    console.error('获取AI模型列表失败:', error)
    return []
  }
}

/**
 * 获取默认AI模型配置
 */
export const getDefaultAIModel = async (): Promise<AIModel | null> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.MODELS_DEFAULT)
    return response.data || null
  } catch (error) {
    console.error('获取默认AI模型失败:', error)
    return null
  }
}

/**
 * 获取AI模型统计信息
 */
export const getAIModelStats = async (): Promise<AIModelStats> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.MODELS_STATS)
    return response.data || { totalModels: 0, activeModels: 0, byType: {}, byProvider: {} }
  } catch (error) {
    console.error('获取AI模型统计失败:', error)
    return { totalModels: 0, activeModels: 0, byType: {}, byProvider: {} }
  }
}

/**
 * 获取可用的AI提供商列表
 */
export const getAvailableProviders = async (): Promise<AIProvider[]> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.PROVIDERS)
    return response.data || []
  } catch (error) {
    console.error('获取AI提供商列表失败:', error)
    // 如果API不可用，返回空数组，让系统优雅降级
    return []
  }
}

/**
 * 获取指定提供商的模型列表
 */
export const getProviderModels = async (provider: string): Promise<AIModel[]> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.PROVIDER_MODELS(provider))
    return response.data || []
  } catch (error) {
    console.error(`获取提供商 ${provider} 的模型列表失败:`, error)
    return []
  }
}

/**
 * 获取系统默认AI配置
 */
export const getDefaultAIConfig = async (): Promise<DefaultAIConfig> => {
  try {
    const response = await get(AI_MODEL_ENDPOINTS.DEFAULT_CONFIG)
    return response.data || {
      textModel: '',
      embeddingProvider: ''
    }
  } catch (error) {
    console.error('获取默认AI配置失败:', error)
    // 返回空配置，让后端使用自己的默认值
    return {
      textModel: '',
      embeddingProvider: ''
    }
  }
}

/**
 * 获取指定类型的可用模型
 */
export const getModelsByType = async (modelType: string): Promise<AIModel[]> => {
  try {
    const models = await getAIModels()
    return models.filter(model => 
      model.modelType === modelType && 
      model.status === 'active'
    )
  } catch (error) {
    console.error(`获取 ${modelType} 类型模型失败:`, error)
    return []
  }
}

/**
 * 获取第一个可用的文本模型
 */
export const getFirstAvailableTextModel = async (): Promise<AIModel | null> => {
  try {
    const textModels = await getModelsByType('TEXT')
    return textModels.length > 0 ? textModels[0] : null
  } catch (error) {
    console.error('获取可用文本模型失败:', error)
    return null
  }
}

/**
 * 获取模型能力列表
 */
export const getModelCapabilities = async (modelId: number): Promise<string[]> => {
  try {
    const response = await get(`${AI_MODEL_ENDPOINTS.MODELS}/${modelId}/capabilities`)
    return response.data || []
  } catch (error) {
    console.error('获取模型能力失败:', error)
    return []
  }
}

/**
 * 检查模型是否支持指定能力
 */
export const checkModelCapability = async (modelId: number, capability: string): Promise<boolean> => {
  try {
    const response = await get(`${AI_MODEL_ENDPOINTS.MODELS}/${modelId}/capabilities/${capability}`)
    return response.data?.supported || false
  } catch (error) {
    console.error('检查模型能力失败:', error)
    return false
  }
}

/**
 * 获取动态提供商选项（用于下拉框）
 */
export const getProviderOptions = async (): Promise<{ label: string; value: string }[]> => {
  try {
    const providers = await getAvailableProviders()
    return providers.map(provider => ({
      label: provider.label,
      value: provider.value
    }))
  } catch (error) {
    console.error('获取提供商选项失败:', error)
    return []
  }
}

/**
 * 获取动态模型选项（用于下拉框）
 */
export const getModelOptions = async (modelType?: string): Promise<{ label: string; value: string; provider: string }[]> => {
  try {
    let models: AIModel[]
    if (modelType) {
      models = await getModelsByType(modelType)
    } else {
      models = await getAIModels()
    }
    
    return models.map(model => ({
      label: model.displayName || model.name,
      value: model.name,
      provider: model.provider
    }))
  } catch (error) {
    console.error('获取模型选项失败:', error)
    return []
  }
}

/**
 * 初始化AI配置（在应用启动时调用）
 */
export const initializeAIConfig = async () => {
  try {
    console.log('🤖 初始化AI配置...')
    
    // 获取模型统计
    const stats = await getAIModelStats()
    console.log(`✅ 发现 ${stats.totalModels} 个AI模型，其中 ${stats.activeModels} 个活跃`)
    
    // 获取默认配置
    const defaultConfig = await getDefaultAIConfig()
    if (defaultConfig.textModel) {
      console.log(`✅ 默认文本模型: ${defaultConfig.textModel}`)
    }
    
    // 获取可用提供商
    const providers = await getAvailableProviders()
    console.log(`✅ 可用提供商: ${providers.map(p => p.label).join(', ')}`)
    
    return {
      stats,
      defaultConfig,
      providers
    }
  } catch (error) {
    console.error('❌ 初始化AI配置失败:', error)
    return null
  }
}