import { vi } from 'vitest'
import { TEST_TOKEN, getCurrentTestUser, authApiMocks } from './auth.mock'

/**
 * 统一的API Mock系统
 * 拦截和模拟API请求
 */

// Mock数据生成器
export const mockDataGenerators = {
  // Dashboard数据
  dashboardStats: () => ({
    success: true,
    data: {
      totalStudents: 150,
      totalTeachers: 20,
      totalClasses: 8,
      activeEnrollments: 25,
      todayAttendance: 142,
      pendingTasks: 5
    }
  }),
  
  dashboardOverview: () => ({
    success: true,
    data: {
      recentActivities: [
        { id: 1, type: 'enrollment', description: '新学生张三报名', time: '2023-01-01' },
        { id: 2, type: 'class', description: '小班A开始上课', time: '2023-01-02' }
      ],
      upcomingEvents: [
        { id: 1, title: '家长会', date: '2023-01-15', time: '14:00' },
        { id: 2, title: '体检日', date: '2023-01-20', time: '09:00' }
      ]
    }
  }),
  
  // AI相关数据
  aiModels: () => ({
    success: true,
    data: [
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai', status: 'active' },
      { id: 'claude-3', name: 'Claude-3', provider: 'anthropic', status: 'active' }
    ]
  }),
  
  aiConversations: () => ({
    success: true,
    data: [
      { id: 1, title: '对话 2025/9/12 14:48:16', type: 'management', createdAt: new Date().toISOString() }
    ]
  }),
  
  // 健康检查
  health: () => ({
    status: 'up',
    timestamp: new Date().toISOString(),
    checks: [{ name: 'api', status: 'up' }]
  })
}

// API路由映射
export const apiRoutes = {
  // 认证相关
  ...authApiMocks,
  
  // Dashboard相关
  '/dashboard/stats': {
    method: 'GET',
    response: mockDataGenerators.dashboardStats
  },
  
  '/dashboard/overview': {
    method: 'GET',
    response: mockDataGenerators.dashboardOverview
  },
  
  '/dashboard/todos': {
    method: 'GET',
    response: () => ({
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5
      }
    })
  },
  
  '/dashboard/schedules': {
    method: 'GET',
    response: () => ({
      success: true,
      data: []
    })
  },
  
  '/dashboard/activities': {
    method: 'GET',
    response: () => ({
      success: true,
      data: []
    })
  },
  
  // AI相关
  '/ai/models': {
    method: 'GET',
    response: mockDataGenerators.aiModels
  },

  '/ai/conversations': {
    method: 'GET',
    response: mockDataGenerators.aiConversations
  },

  // Auto Image API
  '/auto-image/generate': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        imageUrl: 'https://example.com/generated-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 150,
          total_tokens: 200
        },
        metadata: {
          prompt: data?.prompt || 'Generated image',
          model: 'dall-e-3',
          parameters: data || {},
          duration: 2.5
        }
      },
      message: '图片生成成功'
    })
  },

  '/auto-image/activity': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        imageUrl: 'https://example.com/activity-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 100
        }
      },
      message: '活动图片生成成功'
    })
  },

  '/auto-image/poster': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        imageUrl: 'https://example.com/poster-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 120
        }
      },
      message: '海报图片生成成功'
    })
  },

  '/auto-image/template': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        imageUrl: 'https://example.com/template-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 110
        }
      },
      message: '模板图片生成成功'
    })
  },

  '/auto-image/batch': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        results: data?.requests?.map((_: any, index: number) => ({
          success: true,
          imageUrl: `https://example.com/image-${index + 1}.jpg`
        })) || [],
        summary: {
          total: data?.requests?.length || 0,
          success: data?.requests?.length || 0,
          failure: 0
        }
      },
      message: '批量图片生成完成'
    })
  },

  '/auto-image/status': {
    method: 'GET',
    response: () => ({
      success: true,
      data: {
        available: true,
        model: 'dall-e-3'
      },
      message: '服务状态正常'
    })
  },

  // 健康检查
  '/health': {
    method: 'GET',
    response: mockDataGenerators.health
  }
}

/**
 * 创建Mock响应
 */
function createMockResponse(data: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    clone: vi.fn().mockReturnThis()
  }
}

/**
 * Mock fetch函数
 */
export function createMockFetch() {
  return vi.fn().mockImplementation(async (url: string, options: any = {}) => {
    const method = options.method || 'GET'
    const urlPath = url.replace(/^https?:\/\/[^\/]+/, '').split('?')[0]
    
    console.log(`🔧 Mock API请求: ${method} ${urlPath}`)
    
    // 查找匹配的路由
    const route = apiRoutes[urlPath as keyof typeof apiRoutes]
    
    if (route && (route.method === method || method === 'GET')) {
      const responseData = typeof route.response === 'function' 
        ? route.response() 
        : route.response
      
      return createMockResponse(responseData, 200)
    }
    
    // 默认成功响应
    console.log(`⚠️ 未找到匹配的Mock路由: ${method} ${urlPath}`)
    return createMockResponse({
      success: true,
      data: null,
      message: 'Mock响应'
    }, 200)
  })
}

/**
 * Mock request工具模块
 */
export function createMockRequest() {
  const mockRequest = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    delete: vi.fn(),
    request: vi.fn()
  }

  // 配置各种HTTP方法的mock响应
  const setupMethodMock = (method: string) => {
    mockRequest[method as keyof typeof mockRequest] = vi.fn().mockImplementation(async (url: string, data?: any, config?: any) => {
      const urlPath = url.replace(/^https?:\/\/[^\/]+\/api/, '').split('?')[0]

      console.log(`🔧 Mock Request请求: ${method.toUpperCase()} ${urlPath}`, data ? 'with data' : 'no data')

      // 查找匹配的路由
      const route = apiRoutes[urlPath as keyof typeof apiRoutes]

      if (route) {
        const responseData = typeof route.response === 'function'
          ? route.response(data) // 传递请求给响应函数
          : route.response

        return responseData
      }

      // 默认响应
      return {
        success: true,
        data: null,
        message: 'Mock响应'
      }
    })
  }

  // 设置所有HTTP方法
  ['get', 'post', 'put', 'patch', 'del', 'delete', 'request'].forEach(setupMethodMock)

  return mockRequest
}

/**
 * Mock axios实例
 */
export function createMockAxios() {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    request: vi.fn(),

    // 拦截器
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
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
      timeout: 10000,
      baseURL: 'http://localhost:3000/api'
    },

    create: vi.fn().mockReturnThis()
  }
  
  // 配置各种HTTP方法的mock响应
  const setupMethodMock = (method: string) => {
    mockAxios[method as keyof typeof mockAxios] = vi.fn().mockImplementation(async (url: string, data?: any, config?: any) => {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:3000/api${url}`
      const urlPath = fullUrl.replace(/^https?:\/\/[^\/]+\/api/, '').split('?')[0]

      console.log(`🔧 Mock Axios请求: ${method.toUpperCase()} ${urlPath}`, data ? 'with data' : 'no data')

      // 查找匹配的路由
      const route = apiRoutes[urlPath as keyof typeof apiRoutes]

      if (route) {
        const responseData = typeof route.response === 'function'
          ? route.response(data)  // 传递请求给响应函数
          : route.response

        return {
          data: responseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config || {}
        }
      }

      // 默认响应
      return {
        data: {
          success: true,
          data: null,
          message: 'Mock响应'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config || {}
      }
    })
  }
  
  // 设置所有HTTP方法
  ['get', 'post', 'put', 'delete', 'patch'].forEach(setupMethodMock)
  
  return mockAxios
}

/**
 * 初始化API Mock
 */
export function initApiMock() {
  // Mock全局fetch
  global.fetch = createMockFetch()

  // Mock axios
  const mockAxios = createMockAxios()

  // Mock request工具模块
  const mockRequest = createMockRequest()

  // Mock axios模块
  vi.doMock('axios', () => ({
    default: mockAxios,
    ...mockAxios
  }))

  // Mock request工具模块 - 包含所有导出
  vi.doMock('@/utils/request', () => ({
    default: mockRequest,
    request: mockRequest,
    get: mockRequest.get,
    post: mockRequest.post,
    put: mockRequest.put,
    patch: mockRequest.patch,
    del: mockRequest.del,
    delete: mockRequest.delete,
    // AI服务相关导出（与真实导出完全一致）
    aiService: mockAxios,
    aiRequest: mockAxios,
    videoCreationRequest: {
      get: mockAxios.get,
      post: mockAxios.post,
      put: mockAxios.put,
      delete: mockAxios.delete
    },
    // 兼容历史导出
    requestFunc: mockRequest,
    requestMethod: mockRequest,
    getApiBaseURL: () => 'http://localhost:3000/api',
    isAIRequest: (url: string) => url.includes('/ai/') || url.startsWith('ai/'),
    retryRequest: async (fn: Function) => fn(),
    shouldRetry: () => false,
    buildApiUrl: (url: string) => url.startsWith('http') ? url : `/api${url}`
  }))

  console.log('✅ API Mock系统已初始化')

  return {
    fetch: global.fetch,
    axios: mockAxios,
    request: mockRequest
  }
}

/**
 * 添加自定义API路由
 */
export function addApiRoute(path: string, method: string, response: any) {
  apiRoutes[path as keyof typeof apiRoutes] = {
    method: method.toUpperCase(),
    response: typeof response === 'function' ? response : () => response
  } as any
}

/**
 * 重置所有Mock
 */
export function resetApiMocks() {
  vi.clearAllMocks()
  console.log('🔄 API Mock已重置')
}

// 导出默认配置
export default {
  mockDataGenerators,
  apiRoutes,
  createMockFetch,
  createMockAxios,
  initApiMock,
  addApiRoute,
  resetApiMocks
}
