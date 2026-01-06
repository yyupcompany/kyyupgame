import { vi } from 'vitest'

/**
 * 专门的request模块Mock
 * 解决测试中的导入和导出问题
 */

// 创建独立的Mock函数，避免初始化顺序问题
const createMockRequestFunction = () => vi.fn()
const createMockAxiosFunction = () => vi.fn()

const mockRequest = {
  get: createMockRequestFunction(),
  post: createMockRequestFunction(),
  put: createMockRequestFunction(),
  patch: createMockRequestFunction(),
  del: createMockRequestFunction(),
  delete: createMockRequestFunction(),
  request: createMockRequestFunction()
}

const mockAxios = {
  get: createMockAxiosFunction(),
  post: createMockAxiosFunction(),
  put: createMockAxiosFunction(),
  delete: createMockAxiosFunction(),
  patch: createMockAxiosFunction(),
  request: createMockAxiosFunction(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() }
  },
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    },
    timeout: 10000,
    baseURL: 'http://localhost:3000/api'
  },
  create: vi.fn().mockReturnThis()
}

// 创建完整的AI服务Mock，包含所有AI相关方法
const createMockAIService = () => ({
  // 基础HTTP方法
  get: createMockAxiosFunction(),
  post: createMockAxiosFunction(),
  put: createMockAxiosFunction(),
  delete: createMockAxiosFunction(),
  patch: createMockAxiosFunction(),
  request: createMockAxiosFunction(),

  // AI专用功能方法
  generateImage: vi.fn(),
  generateText: vi.fn(),
  generateAudio: vi.fn(),
  generateVideo: vi.fn(),

  // 活动图片生成
  generateActivityImage: vi.fn(),
  generatePosterImage: vi.fn(),
  generateTemplateImage: vi.fn(),

  // 快速生成方法
  quickGenerateActivityImage: vi.fn(),
  quickGeneratePosterImage: vi.fn(),
  quickGenerateTemplateImage: vi.fn(),

  // 智能生成
  smartGenerateImage: vi.fn(),
  smartGeneratePrompt: vi.fn(),

  // 批量操作
  batchReplaceDefaultImages: vi.fn(),

  // 服务状态检查
  checkServiceStatus: vi.fn(),

  // AI模型配置
  getModels: vi.fn(),
  getModelConfig: vi.fn(),
  updateModelConfig: vi.fn(),

  // AI对话和分析
  analyzeData: vi.fn(),
  chatCompletion: vi.fn(),
  streamChat: vi.fn(),
  textToSpeech: vi.fn(),
  speechToText: vi.fn(),
  imageAnalysis: vi.fn(),
  documentProcessing: vi.fn(),
  createEmbedding: vi.fn(),
  searchMemories: vi.fn(),

  // Axios拦截器模拟
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() }
  },

  // 默认配置
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    },
    timeout: 600000,
    baseURL: 'http://localhost:3000/api'
  },

  // 创建实例方法
  create: vi.fn().mockReturnThis()
})

// 创建AI服务实例
const mockAiServiceInstance = createMockAIService()

// 创建与真实 @/utils/request 完全一致的导出
const mockRequestModule = {
  // 默认导出
  default: mockRequest,

  // HTTP方法
  get: mockRequest.get,
  post: mockRequest.post,
  put: mockRequest.put,
  patch: mockRequest.patch,
  del: mockRequest.del,
  delete: mockRequest.delete,
  request: mockRequest,

  // AI服务相关导出 - 使用完整的AI服务Mock
  aiService: mockAiServiceInstance,
  aiRequest: mockAiServiceInstance,
  videoCreationRequest: {
    get: mockAiServiceInstance.get,
    post: mockAiServiceInstance.post,
    put: mockAiServiceInstance.put,
    delete: mockAiServiceInstance.delete
  },

  // 兼容性导出
  requestFunc: mockRequest,
  requestMethod: mockRequest,

  // 工具函数
  getApiBaseURL: () => 'http://localhost:3000/api',
  isAIRequest: (url: string) => url.includes('/ai/') || url.startsWith('ai/'),
  retryRequest: async (fn: Function) => fn(),
  shouldRetry: () => false,
  buildApiUrl: (url: string) => url.startsWith('http') ? url : `/api${url}`,

  // 类型导出（模拟）
  ApiResponse: vi.fn(),
}

// 默认导出
export default mockRequestModule

// 命名导出，支持解构导入 - 从mockRequestModule解构，避免重复导出
export const {
  get,
  post,
  put,
  patch,
  del,
  delete: deleteFn,
  request: requestFn,
  aiService,
  aiRequest,
  videoCreationRequest,
  requestFunc: requestFuncFn,
  requestMethod: requestMethodFn,
  getApiBaseURL,
  isAIRequest,
  retryRequest,
  shouldRetry,
  buildApiUrl
} = mockRequestModule

// 为保持向后兼容性，提供单独的导出
export const {
  get: requestGet,
  post: requestPost,
  put: requestPut,
  patch: requestPatch,
  del: requestDel,
  delete: requestDelete
} = mockRequestModule

// 兼容性导出，使用不同的名称
export {
  mockRequest as requestInstance,
  mockAiServiceInstance as aiServiceInstance
}

/**
 * Vitest Mock工厂函数
 */
export function createRequestMock() {
  return mockRequestModule
}

/**
 * 简化的Mock设置函数
 */
export function setupRequestMock() {
  vi.mock('@/utils/request', () => mockRequestModule)
  return mockRequestModule
}

/**
 * 重置所有Mock
 */
export function resetRequestMocks() {
  vi.clearAllMocks()
  console.log('🔄 Request Mock已重置')
}