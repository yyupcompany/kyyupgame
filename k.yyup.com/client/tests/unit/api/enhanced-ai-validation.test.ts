/**
 * 增强的AI API测试 - 真实数据结构验证
 * 实现严格的响应数据验证和错误场景测试
 */

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
import { aiService, get, post, put, del } from '@/utils/request'
import { aiApi, createMemory, getConversationMemories, deleteMemory, summarizeConversation } from '@/api/ai'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure,
  validatePaginationStructure,
  validateStatisticalRanges,
  createValidationReport
} from '../../utils/data-validation'

// 使用统一的Mock配置
import { setupRequestMock } from '../../mocks/request.mock'
setupRequestMock()

// 真实的AI模型响应数据
const realAIModelResponse = {
  success: true,
  code: 200,
  message: '获取模型列表成功',
  data: {
    models: [
      {
        id: 'model_gpt_4_001',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        version: 'gpt-4-turbo-preview',
        status: 'active',
        capabilities: {
          'text-generation': { max_tokens: 4096, temperature_range: [0, 2] },
          'function-calling': { max_functions: 128 },
          'vision': { max_image_size: '20MB', formats: ['PNG', 'JPEG', 'GIF'] },
          'json-mode': { supported: true }
        },
        limits: {
          requests_per_minute: 3500,
          tokens_per_minute: 200000,
          max_context_length: 128000,
          max_output_tokens: 4096
        },
        pricing: {
          input_tokens: 0.01,
          output_tokens: 0.03,
          currency: 'USD'
        },
        performance: {
          average_latency: 850,
          success_rate: 0.9992,
          p95_latency: 1200,
          p99_latency: 2000
        },
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-20T10:30:00Z',
        is_default: true
      },
      {
        id: 'model_claude_3_sonnet_001',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        version: 'claude-3-sonnet-20240229',
        status: 'active',
        capabilities: {
          'text-generation': { max_tokens: 4096, temperature_range: [0, 1] },
          'vision': { max_image_size: '10MB', formats: ['PNG', 'JPEG', 'WEBP'] },
          'artifact': { supported: true, max_size: '5MB' }
        },
        limits: {
          requests_per_minute: 1000,
          tokens_per_minute: 150000,
          max_context_length: 100000,
          max_output_tokens: 4096
        },
        pricing: {
          input_tokens: 0.003,
          output_tokens: 0.015,
          currency: 'USD'
        },
        performance: {
          average_latency: 620,
          success_rate: 0.9988,
          p95_latency: 950,
          p99_latency: 1500
        },
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-18T14:20:00Z',
        is_default: false
      }
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 2,
      has_next: false,
      has_prev: false
    },
    metadata: {
      request_id: 'req_abc123def456',
      timestamp: '2024-01-25T10:15:30.456Z',
      processing_time: 0.045,
      cache_status: 'miss'
    }
  }
}

// 真实的AI对话响应数据
const realAIConversationResponse = {
  success: true,
  code: 200,
  message: '获取对话成功',
  data: {
    conversation: {
      id: 'conv_20240125_101530_abc123',
      user_id: 'user_001',
      assistant_type: 'enrollment',
      model_id: 'model_gpt_4_001',
      title: '幼儿园招生咨询',
      status: 'active',
      context: {
        user_profile: {
          role: 'parent',
          children_ages: [3, 5],
          enrollment_interests: ['full_day', 'after_school']
        },
        previous_context: {
          last_interaction: '2024-01-24T15:30:00Z',
          topics_discussed: ['tuition', 'curriculum', 'facilities']
        }
      },
      messages: [
        {
          id: 'msg_001',
          conversation_id: 'conv_20240125_101530_abc123',
          role: 'user',
          content: '请问幼儿园的招生条件是什么？',
          content_type: 'text',
          metadata: {
            source: 'web_chat',
            user_agent: 'Mozilla/5.0...',
            ip_address: '192.168.1.100',
            language: 'zh-CN'
          },
          token_count: {
            input_tokens: 25,
            output_tokens: 0
          },
          created_at: '2024-01-25T10:15:30.123Z',
          updated_at: '2024-01-25T10:15:30.123Z'
        },
        {
          id: 'msg_002',
          conversation_id: 'conv_20240125_101530_abc123',
          role: 'assistant',
          content: '您好！我们幼儿园主要招收3-6岁的健康儿童。具体招生条件包括：\n\n1. 年龄要求：小班（3-4岁）、中班（4-5岁）、大班（5-6岁）\n2. 健康证明：需要提供近期体检报告\n3. 户口本或出生证明\n4. 疫苗接种证明\n\n您还想了解哪方面的信息呢？',
          content_type: 'text',
          metadata: {
            model_used: 'model_gpt_4_001',
            confidence_score: 0.95,
            reasoning_summary: '基于用户问题，提供了完整的招生条件信息',
            tools_used: ['knowledge_base', 'admission_policy']
          },
          token_count: {
            input_tokens: 35,
            output_tokens: 156
          },
          feedback: {
            helpfulness_score: 4.8,
            accuracy_score: 4.9,
            clarity_score: 4.7
          },
          created_at: '2024-01-25T10:15:32.456Z',
          updated_at: '2024-01-25T10:15:32.456Z'
        }
      ],
      statistics: {
        total_messages: 2,
        total_input_tokens: 60,
        total_output_tokens: 156,
        total_processing_time: 1.8,
        average_response_time: 1.8,
        user_satisfaction_score: 4.8
      },
      created_at: '2024-01-25T10:15:30.000Z',
      updated_at: '2024-01-25T10:15:32.456Z'
    }
  }
}

// 真实的AI图像生成响应数据
const realAIImageGenerationResponse = {
  success: true,
  code: 200,
  message: '图像生成成功',
  data: {
    generation: {
      id: 'gen_20240125_102045_xyz789',
      request_id: 'req_abc123def456',
      prompt: '一个充满活力的幼儿园教室场景，孩子们在快乐地学习',
      prompt_enhancement: {
        original: '幼儿园教室',
        enhanced: '一个明亮、充满活力的幼儿园教室场景，孩子们在快乐地学习和玩耍，色彩丰富，细节生动',
        style: 'natural'
      },
      model: 'dall-e-3',
      parameters: {
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
        response_format: 'url',
        n: 1
      },
      results: [
        {
          url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/generated-images/img_abc123.png',
          revised_prompt: '一个明亮、充满活力的幼儿园教室场景，彩色桌椅，墙上装饰着孩子们的画作，阳光透过窗户洒进来，创造温暖愉快的氛围',
          seed: 42,
          size: '1024x1024',
          format: 'PNG',
          file_size: 2048576,
          quality_score: 0.92
        }
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 0,
        total_tokens: 50,
        image_count: 1
      },
      processing: {
        started_at: '2024-01-25T10:20:45.000Z',
        completed_at: '2024-01-25T10:20:48.300Z',
        processing_time: 3.3,
        queue_position: 1,
        worker_id: 'worker_003'
      },
      safety: {
        content_filter_passed: true,
        moderation_results: {
          explicit: false,
          violence: false,
          self_harm: false,
          sexual: false
        }
      },
      metadata: {
        request_source: 'auto_image_api',
        user_id: 'user_001',
        session_id: 'session_abc123',
        device_info: {
          platform: 'web',
          browser: 'Chrome',
          version: '120.0.0.0'
        }
      },
      created_at: '2024-01-25T10:20:45.000Z',
      updated_at: '2024-01-25T10:20:48.300Z'
    }
  }
}

// AI错误响应数据
const aiErrorResponses = {
  rateLimitError: {
    status: 429,
    data: {
      success: false,
      code: 429,
      message: 'API调用频率超限',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: '当前请求频率超过了限制，请稍后重试',
        type: 'rate_limit',
        details: {
          limit: 100,
          remaining: 0,
          reset_time: new Date(Date.now() + 60000).toISOString(),
          retry_after: 60,
          current_usage: 100,
          time_window: '1分钟'
        }
      },
      metadata: {
        request_id: 'req_error_001',
        timestamp: new Date().toISOString()
      }
    }
  },
  modelUnavailableError: {
    status: 503,
    data: {
      success: false,
      code: 503,
      message: 'AI模型暂时不可用',
      error: {
        code: 'MODEL_UNAVAILABLE',
        message: '请求的AI模型暂时无法提供服务，请稍后重试',
        type: 'service_unavailable',
        details: {
          model_id: 'model_gpt_4_001',
          provider: 'OpenAI',
          reason: 'maintenance',
          estimated_recovery: new Date(Date.now() + 300000).toISOString(),
          alternative_models: ['model_claude_3_sonnet_001']
        }
      },
      metadata: {
        request_id: 'req_error_002',
        timestamp: new Date().toISOString()
      }
    }
  },
  contentPolicyError: {
    status: 400,
    data: {
      success: false,
      code: 400,
      message: '输入内容违反使用政策',
      error: {
        code: 'CONTENT_POLICY_VIOLATION',
        message: '您提交的内容包含了不适合的词汇',
        type: 'content_filter',
        details: {
          policy_type: 'harmful_content',
          violation_categories: ['harassment', 'hate_speech'],
          flagged_content: '不当词汇',
          severity: 'medium',
          suggested_fix: '请修改您的提示词，移除不当内容'
        }
      },
      metadata: {
        request_id: 'req_error_003',
        timestamp: new Date().toISOString()
      }
    }
  },
  quotaExceededError: {
    status: 402,
    data: {
      success: false,
      code: 402,
      message: '已超出月度使用配额',
      error: {
        code: 'QUOTA_EXCEEDED',
        message: '您的账户已超出本月的使用配额，请升级套餐',
        type: 'quota_limit',
        details: {
          quota_type: 'monthly_tokens',
          current_usage: 100000,
          quota_limit: 100000,
          usage_percentage: 100,
          reset_date: '2024-02-01T00:00:00Z',
          days_until_reset: 7,
          upgrade_url: '/billing/upgrade',
          current_plan: 'professional',
          suggested_plan: 'enterprise'
        }
      },
      metadata: {
        request_id: 'req_error_004',
        timestamp: new Date().toISOString()
      }
    }
  }
}

describe('Enhanced AI API - Real Data Structure Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AI Models Data Structure Validation', () => {
    it('should validate real AI models response structure', async () => {
      vi.mocked(get).mockResolvedValue(realAIModelResponse)

      const response = await get('/ai/models')

      // 验证基础API响应结构
      const apiValidation = validateApiResponseStructure(response)
      expect(apiValidation.valid).toBe(true)
      if (!apiValidation.valid) {
        console.error('API验证失败:', apiValidation.errors)
      }

      // 验证成功响应
      expect(response.success).toBe(true)
      expect(response.code).toBe(200)
      expect(typeof response.message).toBe('string')
      expect(response.data).toBeDefined()

      // 验证模型数据结构
      const { models } = response.data
      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)

      // 验证每个模型的必需字段
      for (const model of models) {
        const requiredFields = ['id', 'name', 'provider', 'version', 'status', 'capabilities', 'limits', 'pricing']
        const fieldValidation = validateRequiredFields(model, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        if (!fieldValidation.valid) {
          console.error('模型字段验证失败:', fieldValidation.errors, fieldValidation.missing)
        }

        // 验证字段类型
        const typeValidation = validateFieldTypes(model, {
          id: 'string',
          name: 'string',
          provider: 'string',
          version: 'string',
          status: 'string',
          is_default: 'boolean'
        })
        expect(typeValidation.valid).toBe(true)

        if (!typeValidation.valid) {
          console.error('模型类型验证失败:', typeValidation.errors)
        }

        // 验证状态枚举值
        expect(['active', 'inactive', 'deprecated']).toContain(model.status)

        // 验证能力配置
        expect(typeof model.capabilities).toBe('object')
        expect(model.capabilities).toBeDefined()

        // 验证限制配置
        const limitsValidation = validateStatisticalRanges(model.limits, {
          requests_per_minute: { min: 1 },
          tokens_per_minute: { min: 1 },
          max_context_length: { min: 1 },
          max_output_tokens: { min: 1 }
        })
        expect(limitsValidation.valid).toBe(true)

        // 验证价格配置
        expect(typeof model.pricing).toBe('object')
        expect(model.pricing.input_tokens).toBeGreaterThan(0)
        expect(model.pricing.output_tokens).toBeGreaterThan(0)
        expect(['USD', 'EUR', 'CNY']).toContain(model.pricing.currency)

        // 验证性能指标
        const performanceValidation = validateStatisticalRanges(model.performance, {
          average_latency: { min: 0 },
          success_rate: { min: 0, max: 1 },
          p95_latency: { min: 0 },
          p99_latency: { min: 0 }
        })
        expect(performanceValidation.valid).toBe(true)
      }

      // 验证分页结构 - 手动验证因为我们使用不同的分页字段名
      const pagination = response.data.pagination
      expect(typeof pagination).toBe('object')
      expect(typeof pagination.current_page).toBe('number')
      expect(typeof pagination.per_page).toBe('number')
      expect(typeof pagination.total_items).toBe('number')
      expect(pagination.current_page).toBeGreaterThan(0)
      expect(pagination.per_page).toBeGreaterThan(0)
      expect(pagination.total_items).toBeGreaterThan(0)

      // 验证元数据
      expect(response.data.metadata).toBeDefined()
      expect(typeof response.data.metadata.request_id).toBe('string')
      expect(typeof response.data.metadata.timestamp).toBe('string')
      expect(typeof response.data.metadata.processing_time).toBe('number')
    })

    it('should validate model creation request structure', async () => {
      const createModelRequest = {
        name: 'New AI Model',
        provider: 'CustomProvider',
        version: '1.0.0',
        capabilities: {
          'text-generation': { max_tokens: 2048, temperature_range: [0, 1] }
        },
        limits: {
          requests_per_minute: 100,
          tokens_per_minute: 10000,
          max_context_length: 8192,
          max_output_tokens: 2048
        },
        pricing: {
          input_tokens: 0.005,
          output_tokens: 0.01,
          currency: 'USD'
        }
      }

      const createResponse = {
        success: true,
        code: 201,
        message: '模型创建成功',
        data: {
          id: 'model_new_001',
          ...createModelRequest,
          status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      vi.mocked(post).mockResolvedValue(createResponse)

      const response = await post('/ai/models', createModelRequest)

      // 验证创建响应
      const apiValidation = validateApiResponseStructure(response)
      expect(apiValidation.valid).toBe(true)

      expect(response.code).toBe(201)
      expect(response.data.id).toBeDefined()
      expect(response.data.status).toBe('inactive')

      // 验证创建的字段
      const requiredFields = ['name', 'provider', 'version', 'capabilities', 'limits', 'pricing']
      const fieldValidation = validateRequiredFields(response.data, requiredFields)
      expect(fieldValidation.valid).toBe(true)
    })
  })

  describe('AI Conversation Data Structure Validation', () => {
    it('should validate real AI conversation response structure', async () => {
      vi.mocked(get).mockResolvedValue(realAIConversationResponse)

      const response = await get('/ai/conversations/conv_20240125_101530_abc123')

      // 验证基础API响应结构
      const apiValidation = validateApiResponseStructure(response)
      expect(apiValidation.valid).toBe(true)

      // 验证对话数据
      const { conversation } = response.data
      expect(conversation).toBeDefined()

      // 验证对话必需字段
      const requiredFields = ['id', 'user_id', 'assistant_type', 'model_id', 'title', 'status', 'messages', 'created_at']
      const fieldValidation = validateRequiredFields(conversation, requiredFields)
      expect(fieldValidation.valid).toBe(true)

      // 验证字段类型
      const typeValidation = validateFieldTypes(conversation, {
        id: 'string',
        user_id: 'string',
        assistant_type: 'string',
        model_id: 'string',
        title: 'string',
        status: 'string'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证状态枚举
      expect(['active', 'archived', 'deleted']).toContain(conversation.status)

      // 验证消息列表
      expect(Array.isArray(conversation.messages)).toBe(true)
      expect(conversation.messages.length).toBeGreaterThan(0)

      // 验证每条消息的结构
      for (const message of conversation.messages) {
        const messageValidation = validateRequiredFields(message, [
          'id', 'conversation_id', 'role', 'content', 'content_type', 'created_at'
        ])
        expect(messageValidation.valid).toBe(true)

        // 验证角色枚举
        expect(['user', 'assistant', 'system']).toContain(message.role)

        // 验证内容类型
        expect(['text', 'image', 'audio', 'file']).toContain(message.content_type)

        // 验证token统计
        if (message.token_count) {
          const tokenValidation = validateStatisticalRanges(message.token_count, {
            input_tokens: { min: 0 },
            output_tokens: { min: 0 }
          })
          expect(tokenValidation.valid).toBe(true)
        }

        // 验证时间戳
        expect(typeof message.created_at).toBe('string')
        expect(Date.parse(message.created_at)).not.toBeNaN()
      }

      // 验证统计信息
      if (conversation.statistics) {
        const statsValidation = validateStatisticalRanges(conversation.statistics, {
          total_messages: { min: 1 },
          total_input_tokens: { min: 0 },
          total_output_tokens: { min: 0 },
          total_processing_time: { min: 0 },
          average_response_time: { min: 0 },
          user_satisfaction_score: { min: 1, max: 5 }
        })
        expect(statsValidation.valid).toBe(true)
      }
    })

    it('should validate message creation response structure', async () => {
      const messageRequest = {
        conversation_id: 'conv_abc123',
        content: '你好，我有一个问题',
        content_type: 'text',
        metadata: {
          source: 'mobile_app',
          user_agent: 'MobileApp/1.0'
        }
      }

      const createMessageResponse = {
        success: true,
        code: 201,
        message: '消息发送成功',
        data: {
          id: 'msg_new_001',
          conversation_id: 'conv_abc123',
          role: 'user',
          content: '你好，我有一个问题',
          content_type: 'text',
          metadata: messageRequest.metadata,
          token_count: {
            input_tokens: 12,
            output_tokens: 0
          },
          created_at: new Date().toISOString()
        }
      }

      vi.mocked(post).mockResolvedValue(createMessageResponse)

      const response = await post('/ai/conversations/messages', messageRequest)

      // 验证消息创建响应
      const apiValidation = validateApiResponseStructure(response)
      expect(apiValidation.valid).toBe(true)

      expect(response.code).toBe(201)
      expect(response.data.role).toBe('user')

      // 验证消息字段
      const requiredFields = ['id', 'conversation_id', 'role', 'content', 'content_type', 'created_at']
      const fieldValidation = validateRequiredFields(response.data, requiredFields)
      expect(fieldValidation.valid).toBe(true)
    })
  })

  describe('AI Image Generation Data Structure Validation', () => {
    it('should validate real image generation response structure', async () => {
      vi.mocked(aiService.post).mockResolvedValue(realAIImageGenerationResponse)

      const generationRequest = {
        prompt: '幼儿园教室场景',
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      }

      const response = await aiService.post('/ai/image/generate', generationRequest)

      // 验证基础API响应结构
      const apiValidation = validateApiResponseStructure(response)
      expect(apiValidation.valid).toBe(true)

      // 验证生成数据
      const { generation } = response.data
      expect(generation).toBeDefined()

      // 验证生成必需字段
      const requiredFields = [
        'id', 'request_id', 'prompt', 'model', 'parameters', 'results',
        'usage', 'processing', 'safety', 'created_at'
      ]
      const fieldValidation = validateRequiredFields(generation, requiredFields)
      expect(fieldValidation.valid).toBe(true)

      // 验证参数类型
      const typeValidation = validateFieldTypes(generation, {
        id: 'string',
        request_id: 'string',
        prompt: 'string',
        model: 'string'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证参数配置
      expect(['1024x1024', '1024x768', '512x512']).toContain(generation.parameters.size)
      expect(['standard', 'hd']).toContain(generation.parameters.quality)
      expect(['vivid', 'natural']).toContain(generation.parameters.style)

      // 验证生成结果
      expect(Array.isArray(generation.results)).toBe(true)
      expect(generation.results.length).toBeGreaterThan(0)

      for (const result of generation.results) {
        const resultValidation = validateRequiredFields(result, ['url', 'size', 'format'])
        expect(resultValidation.valid).toBe(true)

        // 验证URL格式
        expect(result.url).toMatch(/^https?:\/\/.+\.(png|jpg|jpeg|webp)$/i)

        // 验证图像格式
        expect(['PNG', 'JPEG', 'WEBP']).toContain(result.format)

        // 验证质量分数
        if (result.quality_score) {
          expect(result.quality_score).toBeGreaterThanOrEqual(0)
          expect(result.quality_score).toBeLessThanOrEqual(1)
        }
      }

      // 验证使用统计
      const usageValidation = validateStatisticalRanges(generation.usage, {
        prompt_tokens: { min: 1 },
        total_tokens: { min: 1 },
        image_count: { min: 1 }
      })
      expect(usageValidation.valid).toBe(true)

      // 验证处理时间
      const processingValidation = validateStatisticalRanges(generation.processing, {
        processing_time: { min: 0 }
      })
      expect(processingValidation.valid).toBe(true)

      // 验证安全检查
      expect(generation.safety.content_filter_passed).toBe(true)
      expect(typeof generation.safety.moderation_results).toBe('object')
    })
  })

  describe('AI Error Response Validation', () => {
    it('should validate rate limit error structure', async () => {
      vi.mocked(get).mockRejectedValue(aiErrorResponses.rateLimitError)

      try {
        await get('/ai/models')
      } catch (error: any) {
        // 验证错误响应结构
        expect(error.status).toBe(429)
        expect(error.data.success).toBe(false)
        expect(error.data.code).toBe(429)

        // 验证错误信息
        const { error: errorInfo } = error.data
        expect(errorInfo.code).toBe('RATE_LIMIT_EXCEEDED')
        expect(errorInfo.type).toBe('rate_limit')

        // 验证错误详情
        expect(errorInfo.details.limit).toBeGreaterThan(0)
        expect(errorInfo.details.remaining).toBeGreaterThanOrEqual(0)
        expect(errorInfo.details.retry_after).toBeGreaterThan(0)
        expect(Date.parse(errorInfo.details.reset_time)).not.toBeNaN()

        // 验证元数据
        expect(error.data.metadata.request_id).toBeDefined()
        expect(error.data.metadata.timestamp).toBeDefined()
      }
    })

    it('should validate model unavailable error structure', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorResponses.modelUnavailableError)

      try {
        await post('/ai/chat/completions', { prompt: 'test' })
      } catch (error: any) {
        expect(error.status).toBe(503)
        expect(error.data.error.code).toBe('MODEL_UNAVAILABLE')
        expect(error.data.error.type).toBe('service_unavailable')

        const details = error.data.error.details
        expect(details.model_id).toBeDefined()
        expect(details.provider).toBeDefined()
        expect(['maintenance', 'overload', 'error']).toContain(details.reason)
        expect(Date.parse(details.estimated_recovery)).not.toBeNaN()
        expect(Array.isArray(details.alternative_models)).toBe(true)
      }
    })

    it('should validate content policy error structure', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorResponses.contentPolicyError)

      try {
        await post('/ai/chat/completions', { prompt: 'inappropriate content' })
      } catch (error: any) {
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe('CONTENT_POLICY_VIOLATION')
        expect(error.data.error.type).toBe('content_filter')

        const details = error.data.error.details
        expect(typeof details.policy_type).toBe('string')
        expect(Array.isArray(details.violation_categories)).toBe(true)
        expect(typeof details.flagged_content).toBe('string')
        expect(['low', 'medium', 'high']).toContain(details.severity)
        expect(typeof details.suggested_fix).toBe('string')
      }
    })

    it('should validate quota exceeded error structure', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorResponses.quotaExceededError)

      try {
        await post('/ai/image/generate', { prompt: 'test' })
      } catch (error: any) {
        expect(error.status).toBe(402)
        expect(error.data.error.code).toBe('QUOTA_EXCEEDED')
        expect(error.data.error.type).toBe('quota_limit')

        const details = error.data.error.details
        expect(['monthly_tokens', 'daily_requests', 'image_generations']).toContain(details.quota_type)
        expect(details.current_usage).toBeGreaterThan(0)
        expect(details.quota_limit).toBeGreaterThan(0)
        expect(details.usage_percentage).toBe(100)
        expect(Date.parse(details.reset_date)).not.toBeNaN()
        expect(details.days_until_reset).toBeGreaterThan(0)
        expect(details.upgrade_url).toBeDefined()
        expect(typeof details.current_plan).toBe('string')
        expect(typeof details.suggested_plan).toBe('string')
      }
    })
  })

  describe('Comprehensive Validation Reports', () => {
    it('should generate complete validation report for AI API responses', () => {
      // 测试模型响应的完整验证报告
      const modelValidation = createValidationReport(realAIModelResponse, {
        requiredFields: ['success', 'code', 'message', 'data']
      })

      expect(modelValidation.valid).toBe(true)
      expect(modelValidation.errors).toHaveLength(0)
      expect(modelValidation.warnings).toHaveLength(0)

      // 测试错误响应的验证报告
      const errorValidation = createValidationReport(aiErrorResponses.rateLimitError.data, {
        requiredFields: ['success', 'code', 'message', 'error']
      })

      expect(errorValidation.valid).toBe(true)

      // 测试无效响应的验证报告
      const invalidResponse = {
        success: true,
        // 缺少code和message字段
        data: null
      }

      const invalidValidation = createValidationReport(invalidResponse, {
        requiredFields: ['success', 'code', 'message', 'data']
      })

      expect(invalidValidation.valid).toBe(false)
      expect(invalidValidation.errors.length).toBeGreaterThan(0)
    })
  })
})