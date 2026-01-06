/**
 * AI服务Mock配置
 * 为AI相关的API测试提供完整的Mock支持
 */

import { vi } from 'vitest'

// 生成唯一的请求ID
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 生成唯一的消息ID
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 生成唯一的对话ID
export const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 真实的AI模型配置数据
export const mockAIModelConfigs = [
  {
    id: '1',
    name: 'GPT-4',
    provider: 'OpenAI',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    isActive: true,
    capabilities: ['text-generation', 'chat', 'analysis'],
    contextWindow: 8192,
    description: 'GPT-4 高级语言模型',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Claude',
    provider: 'Anthropic',
    model: 'claude-3-sonnet',
    temperature: 0.5,
    maxTokens: 4096,
    isActive: true,
    capabilities: ['text-generation', 'chat', 'analysis', 'vision'],
    contextWindow: 100000,
    description: 'Claude 3 Sonnet 高级AI助手',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    model: 'dall-e-3',
    temperature: 0.8,
    maxTokens: 0,
    isActive: true,
    capabilities: ['image-generation'],
    contextWindow: 0,
    description: 'DALL-E 3 图像生成模型',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// 真实的AI对话数据
export const mockAIConversations = [
  {
    id: generateConversationId(),
    title: '关于幼儿园招生咨询',
    type: 'enrollment',
    messages: [
      {
        id: generateMessageId(),
        role: 'user' as const,
        content: '请问幼儿园的招生条件是什么？',
        timestamp: '2024-01-01T10:00:00Z',
        metadata: { source: 'web' }
      },
      {
        id: generateMessageId(),
        role: 'assistant' as const,
        content: '我们的幼儿园主要招收3-6岁的健康儿童，具体包括...',
        timestamp: '2024-01-01T10:00:05Z',
        metadata: {
          model: 'gpt-4',
          tokens: { input: 25, output: 150, total: 175 },
          processing_time: 1.2
        }
      }
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:05Z'
  },
  {
    id: generateConversationId(),
    title: '教学活动策划讨论',
    type: 'education',
    messages: [
      {
        id: generateMessageId(),
        role: 'user' as const,
        content: '请帮我设计一个春季户外活动方案',
        timestamp: '2024-01-01T14:00:00Z',
        metadata: { source: 'mobile' }
      },
      {
        id: generateMessageId(),
        role: 'assistant' as const,
        content: '我为您设计了一个"春天花园探险"主题的户外活动...',
        timestamp: '2024-01-01T14:00:08Z',
        metadata: {
          model: 'claude-3-sonnet',
          tokens: { input: 30, output: 280, total: 310 },
          processing_time: 2.1
        }
      }
    ],
    createdAt: '2024-01-01T14:00:00Z',
    updatedAt: '2024-01-01T14:00:08Z'
  }
]

// 真实的AI分析结果数据
export const mockAIAnalysisResults = [
  {
    id: '1',
    type: 'enrollment_prediction',
    title: '2024年春季招生预测分析',
    data: {
      predicted_applications: 156,
      confidence_interval: [145, 167],
      success_probability: 0.85,
      factors: ['季节性因素', '市场竞争', '品牌影响力']
    },
    insights: [
      '春季招生预期比去年同期增长12%',
      '主要竞争对手增加了营销投入',
      '建议加强线上宣传力度'
    ],
    recommendations: [
      '推出早鸟优惠政策',
      '增加校园开放日活动',
      '优化线上报名流程'
    ],
    confidence: 0.85,
    generatedAt: '2024-01-01T09:00:00Z',
    parameters: {
      time_range: '2024-03-01_to_2024-05-31',
      data_sources: ['historical_applications', 'market_trends', 'competitor_analysis']
    }
  },
  {
    id: '2',
    type: 'student_performance',
    title: '班级学习表现分析',
    data: {
      average_score: 85.6,
      improvement_rate: 0.12,
      key_subjects: ['语言发展', '数学逻辑', '社会情感'],
      at_risk_students: 3
    },
    insights: [
      '整体学习水平良好，但有提升空间',
      '语言发展领域表现突出',
      '需要关注个别学生的社会情感发展'
    ],
    recommendations: [
      '增加个性化教学活动',
      '组织家长沟通会',
      '设计更多合作学习游戏'
    ],
    confidence: 0.78,
    generatedAt: '2024-01-01T15:30:00Z',
    parameters: {
      class_id: 'class_001',
      evaluation_period: '2024-01',
      metrics: ['academic_performance', 'social_skills', 'creativity']
    }
  }
]

// AI服务使用统计
export const mockAIUsageStats = {
  total_requests: 1250,
  successful_requests: 1187,
  failed_requests: 63,
  average_response_time: 1.8,
  total_tokens_used: 45680,
  breakdown_by_model: {
    'gpt-4': { requests: 650, tokens: 28500, avg_time: 2.1 },
    'claude-3-sonnet': { requests: 450, tokens: 15400, avg_time: 1.5 },
    'dall-e-3': { requests: 150, tokens: 0, avg_time: 3.2 }
  },
  breakdown_by_type: {
    'chat': { requests: 800, success_rate: 0.96 },
    'analysis': { requests: 300, success_rate: 0.92 },
    'image_generation': { requests: 150, success_rate: 0.88 }
  },
  period: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z'
  }
}

// AI用户配额信息
export const mockUserQuota = {
  user_id: 'user_001',
  plan_type: 'professional',
  limits: {
    monthly_tokens: 100000,
    daily_requests: 500,
    concurrent_requests: 5,
    image_generations: 100
  },
  usage: {
    tokens_used_this_month: 45680,
    requests_today: 127,
    images_generated_this_month: 23
  },
  remaining: {
    tokens: 54320,
    daily_requests: 373,
    image_generations: 77
  },
  reset_dates: {
    monthly_quota: '2024-02-01T00:00:00Z',
    daily_requests: '2024-01-02T00:00:00Z'
  }
}

// AI错误场景数据
export const mockAIErrorScenarios = {
  rate_limit: {
    status: 429,
    data: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API调用频率超限，请稍后重试',
        retry_after: 60,
        limit: 100,
        reset_time: new Date(Date.now() + 60000).toISOString()
      }
    }
  },
  model_unavailable: {
    status: 503,
    data: {
      success: false,
      error: {
        code: 'MODEL_UNAVAILABLE',
        message: 'AI模型暂时不可用，请稍后重试',
        model: 'gpt-4',
        estimated_recovery: new Date(Date.now() + 300000).toISOString()
      }
    }
  },
  content_policy_violation: {
    status: 400,
    data: {
      success: false,
      error: {
        code: 'CONTENT_POLICY_VIOLATION',
        message: '输入内容违反使用政策',
        policy_type: 'harmful_content',
        details: '内容包含不适合的词汇'
      }
    }
  },
  quota_exceeded: {
    status: 402,
    data: {
      success: false,
      error: {
        code: 'QUOTA_EXCEEDED',
        message: '已超出月度使用配额',
        quota_type: 'monthly_tokens',
        current_usage: 100000,
        quota_limit: 100000,
        upgrade_url: '/billing/upgrade'
      }
    }
  },
  invalid_request: {
    status: 400,
    data: {
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: '请求参数无效',
        details: {
          field: 'max_tokens',
          issue: '值超出允许范围 (1-4096)',
          received: 5000
        }
      }
    }
  },
  network_timeout: {
    code: 'ECONNABORTED',
    message: '请求超时',
    timeout: 30000
  }
}

// 真实的流式AI响应数据
export const mockStreamingResponse = {
  id: generateRequestId(),
  model: 'gpt-4',
  created: Date.now(),
  object: 'chat.completion.chunk',
  chunks: [
    { content: '', role: 'assistant', finish_reason: null },
    { content: '我', role: null, finish_reason: null },
    { content: '正在', role: null, finish_reason: null },
    { content: '为您', role: null, finish_reason: null },
    { content: '分析', role: null, finish_reason: null },
    { content: '这个', role: null, finish_reason: null },
    { content: '问题', role: null, finish_reason: null },
    { content: '...', role: null, finish_reason: null },
    { content: '', role: null, finish_reason: 'stop' }
  ]
}

// AI图像生成结果
export const mockImageGenerationResult = {
  success: true,
  data: {
    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/generated-images/image_001.png',
    revised_prompt: '一个充满活力的幼儿园教室场景，孩子们在快乐地学习',
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    usage: {
      prompt_tokens: 50,
      completion_tokens: 0,
      total_tokens: 50
    },
    processing_time: 3.2,
    generation_id: 'gen_' + generateRequestId(),
    created_at: new Date().toISOString()
  }
}

// AI记忆数据
export const mockAIMemories = [
  {
    id: 'memory_001',
    user_id: 'user_001',
    conversation_id: generateConversationId(),
    content: '用户询问关于春季招生活动的建议',
    memory_type: 'episodic',
    importance: 8,
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
    tags: ['招生', '春季', '活动'],
    created_at: '2024-01-01T10:00:00Z',
    last_accessed: '2024-01-01T10:00:00Z'
  },
  {
    id: 'memory_002',
    user_id: 'user_001',
    conversation_id: generateConversationId(),
    content: '用户关心孩子的语言发展问题',
    memory_type: 'semantic',
    importance: 9,
    embedding: [0.6, 0.7, 0.8, 0.9, 1.0],
    tags: ['语言发展', '儿童教育', '关注点'],
    created_at: '2024-01-01T14:00:00Z',
    last_accessed: '2024-01-01T14:00:00Z'
  }
]

// 创建Mock AI服务实例
export const createMockAIService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    request: vi.fn(),
    // AI专用方法
    generateImage: vi.fn(),
    analyzeData: vi.fn(),
    chatCompletion: vi.fn(),
    textToSpeech: vi.fn(),
    speechToText: vi.fn(),
    imageAnalysis: vi.fn(),
    documentProcessing: vi.fn(),
    streamChat: vi.fn(),
    createEmbedding: vi.fn(),
    searchMemories: vi.fn()
  }
}

// 预配置的Mock AI服务
export const mockAIService = createMockAIService()

// 设置默认的Mock实现
mockAIService.get.mockResolvedValue({ success: true, data: null })
mockAIService.post.mockResolvedValue({ success: true, data: null })
mockAIService.put.mockResolvedValue({ success: true, data: null })
mockAIService.delete.mockResolvedValue({ success: true, data: null })
mockAIService.patch.mockResolvedValue({ success: true, data: null })

// AI专用方法的默认实现
mockAIService.generateImage.mockResolvedValue(mockImageGenerationResult)
mockAIService.analyzeData.mockResolvedValue({
  success: true,
  data: mockAIAnalysisResults[0]
})
mockAIService.chatCompletion.mockResolvedValue({
  success: true,
  data: {
    content: '这是AI助手的回复',
    usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
    model: 'gpt-4',
    timestamp: new Date().toISOString()
  }
})
mockAIService.streamChat.mockImplementation(async function* () {
  for (const chunk of mockStreamingResponse.chunks) {
    yield chunk
    await new Promise(resolve => setTimeout(resolve, 100))
  }
})
mockAIService.createEmbedding.mockResolvedValue({
  success: true,
  data: {
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
    usage: { prompt_tokens: 10, total_tokens: 10 }
  }
})
mockAIService.searchMemories.mockResolvedValue({
  success: true,
  data: mockAIMemories
})

// 导出配置Mock的辅助函数
export const configureMockAIService = (config: {
  shouldFail?: boolean
  errorType?: keyof typeof mockAIErrorScenarios
  delay?: number
} = {}) => {
  const { shouldFail = false, errorType = 'network_timeout', delay = 0 } = config

  // 重置所有Mock
  vi.clearAllMocks()

  if (shouldFail) {
    const error = mockAIErrorScenarios[errorType]
    mockAIService.get.mockRejectedValue(error)
    mockAIService.post.mockRejectedValue(error)
    mockAIService.put.mockRejectedValue(error)
    mockAIService.delete.mockRejectedValue(error)
    mockAIService.generateImage.mockRejectedValue(error)
    mockAIService.chatCompletion.mockRejectedValue(error)
  } else {
    // 成功响应
    mockAIService.get.mockImplementation(async (url, config) => {
      if (delay) await new Promise(resolve => setTimeout(resolve, delay))
      return { success: true, data: mockAIModelConfigs }
    })

    mockAIService.post.mockImplementation(async (url, data, config) => {
      if (delay) await new Promise(resolve => setTimeout(resolve, delay))
      return { success: true, data: { id: generateRequestId(), ...data } }
    })
  }
}

export default mockAIService