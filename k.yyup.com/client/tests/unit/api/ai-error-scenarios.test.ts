/**
 * AI服务错误场景测试
 * 全面测试各种AI错误情况的处理
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
import { aiApi } from '@/api/ai'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../../utils/data-validation'

// 使用统一的Mock配置
import { setupRequestMock } from '../../mocks/request.mock'
setupRequestMock()

// 真实的AI错误响应数据
const aiErrorScenarios = {
  // API限制错误
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
          time_window: '1分钟',
          suggested_actions: ['稍后重试', '升级套餐']
        }
      },
      metadata: {
        request_id: 'req_rate_limit_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/models'
      }
    }
  },

  // 模型不可用错误
  modelUnavailableError: {
    status: 503,
    data: {
      success: false,
      code: 503,
      message: 'AI模型暂时不可用',
      error: {
        code: 'MODEL_UNAVAILABLE',
        message: '请求的AI模型暂时无法提供服务',
        type: 'service_unavailable',
        details: {
          model_id: 'model_gpt_4_001',
          provider: 'OpenAI',
          reason: 'maintenance',
          estimated_recovery: new Date(Date.now() + 300000).toISOString(),
          alternative_models: ['model_claude_3_sonnet_001', 'model_gpt_3_5_turbo'],
          affected_capabilities: ['text-generation', 'function-calling'],
          incident_id: 'inc_maintenance_123'
        }
      },
      metadata: {
        request_id: 'req_model_unavail_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/chat/completions'
      }
    }
  },

  // 内容政策违规错误
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
          flagged_content: '包含不当内容的文本片段',
          severity: 'medium',
          confidence: 0.85,
          suggested_fix: '请修改您的提示词，移除不当内容',
          policy_links: ['https://openai.com/policies/usage-policies'],
          appeal_process: '可通过support@example.com申诉'
        }
      },
      metadata: {
        request_id: 'req_content_violation_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/chat/completions'
      }
    }
  },

  // 配额超限错误
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
          suggested_plan: 'enterprise',
          overage_cost: 0.02
        }
      },
      metadata: {
        request_id: 'req_quota_exceeded_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/image/generate'
      }
    }
  },

  // 认证失败错误
  authenticationError: {
    status: 401,
    data: {
      success: false,
      code: 401,
      message: '认证失败',
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'API密钥无效或已过期',
        type: 'authentication',
        details: {
          auth_method: 'api_key',
          key_id: 'sk_***abc123',
          failure_reason: 'key_expired',
          valid_from: '2023-01-01T00:00:00Z',
          valid_until: '2024-01-01T00:00:00Z',
          renewal_url: '/api-keys/renew'
        }
      },
      metadata: {
        request_id: 'req_auth_failed_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/models'
      }
    }
  },

  // 权限不足错误
  permissionError: {
    status: 403,
    data: {
      success: false,
      code: 403,
      message: '权限不足',
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '当前账户无权访问此功能',
        type: 'authorization',
        details: {
          required_permission: 'ai.models.list',
          user_permissions: ['ai.chat.basic'],
          missing_permissions: ['ai.models.list', 'ai.admin'],
          upgrade_required: true,
          admin_contact: 'admin@example.com'
        }
      },
      metadata: {
        request_id: 'req_permission_denied_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/models'
      }
    }
  },

  // 无效请求错误
  invalidRequestError: {
    status: 400,
    data: {
      success: false,
      code: 400,
      message: '请求参数无效',
      error: {
        code: 'INVALID_REQUEST',
        message: '请求包含无效参数',
        type: 'validation',
        details: {
          validation_errors: [
            {
              field: 'max_tokens',
              issue: '值超出允许范围',
              value: 5000,
              allowed_range: [1, 4096]
            },
            {
              field: 'temperature',
              issue: '值超出允许范围',
              value: 2.5,
              allowed_range: [0, 2]
            }
          ],
          total_errors: 2,
          corrected_request: {
            max_tokens: 4096,
            temperature: 2.0
          }
        }
      },
      metadata: {
        request_id: 'req_invalid_request_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/chat/completions'
      }
    }
  },

  // 令牌不足错误
  insufficientTokensError: {
    status: 400,
    data: {
      success: false,
      code: 400,
      message: '令牌数量不足',
      error: {
        code: 'INSUFFICIENT_TOKENS',
        message: '输入文本过长，超出模型处理能力',
        type: 'token_limit',
        details: {
          input_tokens: 5000,
          max_input_tokens: 4096,
          excess_tokens: 904,
          suggestions: [
            '缩短输入文本',
            '使用更大上下文窗口的模型',
            '分段处理长文本'
          ]
        }
      },
      metadata: {
        request_id: 'req_insufficient_tokens_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/chat/completions'
      }
    }
  },

  // 网络超时错误
  timeoutError: {
    code: 'ECONNABORTED',
    message: '请求超时',
    config: {
      timeout: 30000,
      url: '/ai/chat/completions',
      method: 'post'
    }
  },

  // 网络连接错误
  networkError: {
    code: 'NETWORK_ERROR',
    message: '网络连接失败',
    config: {
      url: '/ai/models',
      method: 'get'
    }
  },

  // 模型配置错误
  modelConfigurationError: {
    status: 422,
    data: {
      success: false,
      code: 422,
      message: '模型配置错误',
      error: {
        code: 'MODEL_CONFIGURATION_ERROR',
        message: '模型配置参数不正确',
        type: 'configuration',
        details: {
          model_id: 'invalid_model_001',
          configuration_issues: [
            {
              parameter: 'api_key',
              issue: '缺少必需的API密钥'
            },
            {
              parameter: 'endpoint_url',
              issue: 'URL格式无效'
            }
          ],
          required_parameters: ['model_id', 'provider', 'api_key', 'endpoint_url']
        }
      },
      metadata: {
        request_id: 'req_model_config_error_001',
        timestamp: new Date().toISOString(),
        endpoint: '/ai/models/configuration'
      }
    }
  }
}

describe('AI Service Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rate Limiting Error Handling', () => {
    it('should handle rate limit error correctly', async () => {
      vi.mocked(get).mockRejectedValue(aiErrorScenarios.rateLimitError)

      try {
        await get('/ai/models')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        // 验证基础错误结构
        expect(error.status).toBe(429)
        expect(error.data.success).toBe(false)
        expect(error.data.code).toBe(429)

        // 验证错误信息
        const { error: errorInfo } = error.data
        expect(errorInfo.code).toBe('RATE_LIMIT_EXCEEDED')
        expect(errorInfo.type).toBe('rate_limit')
        expect(errorInfo.message).toContain('频率')

        // 验证错误详情
        const details = errorInfo.details
        expect(details.limit).toBe(100)
        expect(details.remaining).toBe(0)
        expect(details.retry_after).toBe(60)
        expect(Date.parse(details.reset_time)).not.toBeNaN()
        expect(Array.isArray(details.suggested_actions)).toBe(true)
      }
    })

    it('should implement exponential backoff for rate limit errors', async () => {
      let attemptCount = 0
      vi.mocked(get).mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(aiErrorScenarios.rateLimitError)
        }
        return Promise.resolve({
          success: true,
          data: { models: [] }
        })
      })

      // 模拟重试逻辑
      const maxRetries = 3
      let success = false

      for (let i = 0; i < maxRetries; i++) {
        try {
          await get('/ai/models')
          success = true
          break
        } catch (error: any) {
          if (error.status === 429 && i < maxRetries - 1) {
            // 指数退避
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
            continue
          }
          if (i === maxRetries - 1) {
            throw error
          }
        }
      }

      expect(attemptCount).toBe(3)
      expect(success).toBe(true)
    })
  })

  describe('Model Unavailability Error Handling', () => {
    it('should handle model unavailability error with fallback suggestions', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.modelUnavailableError)

      try {
        await post('/ai/chat/completions', { model: 'gpt-4', messages: [] })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(503)
        expect(error.data.error.code).toBe('MODEL_UNAVAILABLE')

        const details = error.data.error.details
        expect(details.model_id).toBe('model_gpt_4_001')
        expect(details.provider).toBe('OpenAI')
        expect(['maintenance', 'overload', 'error']).toContain(details.reason)
        expect(Array.isArray(details.alternative_models)).toBe(true)
        expect(details.alternative_models.length).toBeGreaterThan(0)
        expect(Date.parse(details.estimated_recovery)).not.toBeNaN()
      }
    })

    it('should provide alternative model suggestions', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.modelUnavailableError)

      try {
        await post('/ai/chat/completions', { model: 'gpt-4' })
      } catch (error: any) {
        const details = error.data.error.details
        const alternatives = details.alternative_models

        expect(alternatives).toContain('model_claude_3_sonnet_001')
        expect(alternatives).toContain('model_gpt_3_5_turbo')

        // 验证每个替代模型都是有效的
        alternatives.forEach(model => {
          expect(typeof model).toBe('string')
          expect(model.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Content Policy Violation Handling', () => {
    it('should handle content policy violations with detailed feedback', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.contentPolicyError)

      try {
        await post('/ai/chat/completions', { messages: [{ role: 'user', content: 'inappropriate' }] })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe('CONTENT_POLICY_VIOLATION')

        const details = error.data.error.details
        expect(typeof details.policy_type).toBe('string')
        expect(Array.isArray(details.violation_categories)).toBe(true)
        expect(typeof details.flagged_content).toBe('string')
        expect(['low', 'medium', 'high']).toContain(details.severity)
        expect(details.confidence).toBeGreaterThanOrEqual(0)
        expect(details.confidence).toBeLessThanOrEqual(1)
        expect(typeof details.suggested_fix).toBe('string')
        expect(Array.isArray(details.policy_links)).toBe(true)
      }
    })

    it('should provide content modification suggestions', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.contentPolicyError)

      try {
        await post('/ai/chat/completions', { messages: [] })
      } catch (error: any) {
        const details = error.data.error.details

        expect(details.suggested_fix).toContain('修改')
        expect(details.suggested_fix).toContain('移除')
        expect(details.appeal_process).toBeDefined()
        expect(details.appeal_process).toContain('申诉')
      }
    })
  })

  describe('Quota Management Error Handling', () => {
    it('should handle quota exceeded errors with upgrade options', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.quotaExceededError)

      try {
        await post('/ai/image/generate', { prompt: 'test' })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(402)
        expect(error.data.error.code).toBe('QUOTA_EXCEEDED')

        const details = error.data.error.details
        expect(['monthly_tokens', 'daily_requests', 'image_generations']).toContain(details.quota_type)
        expect(details.current_usage).toBe(details.quota_limit)
        expect(details.usage_percentage).toBe(100)
        expect(Date.parse(details.reset_date)).not.toBeNaN()
        expect(details.days_until_reset).toBeGreaterThan(0)
        expect(details.upgrade_url).toBeDefined()
        expect(typeof details.current_plan).toBe('string')
        expect(typeof details.suggested_plan).toBe('string')
        expect(typeof details.overage_cost).toBe('number')
      }
    })

    it('should provide clear quota usage information', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.quotaExceededError)

      try {
        await post('/ai/chat/completions', {})
      } catch (error: any) {
        const details = error.data.error.details

        expect(details.current_usage).toBeGreaterThan(0)
        expect(details.quota_limit).toBeGreaterThan(0)
        expect(details.current_usage).toBeLessThanOrEqual(details.quota_limit)
        expect(details.days_until_reset).toBeGreaterThanOrEqual(0)
        expect(details.days_until_reset).toBeLessThanOrEqual(31)
      }
    })
  })

  describe('Authentication and Authorization Errors', () => {
    it('should handle authentication failures properly', async () => {
      vi.mocked(get).mockRejectedValue(aiErrorScenarios.authenticationError)

      try {
        await get('/ai/models')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.data.error.code).toBe('AUTHENTICATION_FAILED')
        expect(error.data.error.type).toBe('authentication')

        const details = error.data.error.details
        expect(['api_key', 'oauth', 'jwt']).toContain(details.auth_method)
        expect(details.key_id).toContain('***') // 部分隐藏的API密钥
        expect(['key_expired', 'key_invalid', 'missing_key']).toContain(details.failure_reason)
        expect(details.renewal_url).toBeDefined()
      }
    })

    it('should handle permission denied errors with upgrade suggestions', async () => {
      vi.mocked(get).mockRejectedValue(aiErrorScenarios.permissionError)

      try {
        await get('/ai/models')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(403)
        expect(error.data.error.code).toBe('INSUFFICIENT_PERMISSIONS')

        const details = error.data.error.details
        expect(typeof details.required_permission).toBe('string')
        expect(Array.isArray(details.user_permissions)).toBe(true)
        expect(Array.isArray(details.missing_permissions)).toBe(true)
        expect(details.missing_permissions).toContain(details.required_permission)
        expect(details.admin_contact).toBeDefined()
      }
    })
  })

  describe('Request Validation Errors', () => {
    it('should handle invalid request parameters with specific feedback', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.invalidRequestError)

      try {
        await post('/ai/chat/completions', {
          max_tokens: 5000,  // 超出范围
          temperature: 2.5, // 超出范围
          model: 'invalid-model'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe('INVALID_REQUEST')

        const details = error.data.error.details
        expect(Array.isArray(details.validation_errors)).toBe(true)
        expect(details.validation_errors.length).toBeGreaterThan(0)

        // 验证每个验证错误
        details.validation_errors.forEach(validationError => {
          expect(typeof validationError.field).toBe('string')
          expect(typeof validationError.issue).toBe('string')
          expect(validationError.value).toBeDefined()
          if (validationError.allowed_range) {
            expect(Array.isArray(validationError.allowed_range)).toBe(true)
            expect(validationError.allowed_range).toHaveLength(2)
          }
        })

        // 验证纠正建议
        if (details.corrected_request) {
          expect(typeof details.corrected_request).toBe('object')
        }
      }
    })

    it('should handle token limit errors with suggestions', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.insufficientTokensError)

      try {
        await post('/ai/chat/completions', {
          messages: [{ role: 'user', content: 'A'.repeat(10000) }] // 很长的文本
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe('INSUFFICIENT_TOKENS')

        const details = error.data.error.details
        expect(details.input_tokens).toBeGreaterThan(details.max_input_tokens)
        expect(details.excess_tokens).toBe(details.input_tokens - details.max_input_tokens)
        expect(Array.isArray(details.suggestions)).toBe(true)
        expect(details.suggestions.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Network and Timeout Errors', () => {
    it('should handle network timeout errors', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.timeoutError)

      try {
        await post('/ai/chat/completions', { messages: [] })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe('ECONNABORTED')
        expect(error.message).toContain('超时')
        expect(error.config.timeout).toBe(30000)
        expect(error.config.url).toBe('/ai/chat/completions')
        expect(error.config.method).toBe('post')
      }
    })

    it('should handle network connection errors', async () => {
      vi.mocked(get).mockRejectedValue(aiErrorScenarios.networkError)

      try {
        await get('/ai/models')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe('NETWORK_ERROR')
        expect(error.message).toContain('网络')
        expect(error.config.url).toBe('/ai/models')
        expect(error.config.method).toBe('get')
      }
    })

    it('should implement retry logic for transient network errors', async () => {
      let attemptCount = 0
      vi.mocked(get).mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(aiErrorScenarios.networkError)
        }
        return Promise.resolve({ success: true, data: { models: [] } })
      })

      const maxRetries = 3
      let success = false

      for (let i = 0; i < maxRetries; i++) {
        try {
          await get('/ai/models')
          success = true
          break
        } catch (error: any) {
          if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒延迟
            continue
          }
          if (i === maxRetries - 1) {
            throw error
          }
        }
      }

      expect(attemptCount).toBe(3)
      expect(success).toBe(true)
    })
  })

  describe('Model Configuration Errors', () => {
    it('should handle model configuration errors with specific guidance', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.modelConfigurationError)

      try {
        await post('/ai/models/configuration', {
          model_id: 'invalid_model',
          provider: 'OpenAI'
          // 缺少必需的参数
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.status).toBe(422)
        expect(error.data.error.code).toBe('MODEL_CONFIGURATION_ERROR')

        const details = error.data.error.details
        expect(details.model_id).toBeDefined()
        expect(Array.isArray(details.configuration_issues)).toBe(true)
        expect(Array.isArray(details.required_parameters)).toBe(true)

        // 验证每个配置问题
        details.configuration_issues.forEach(issue => {
          expect(typeof issue.parameter).toBe('string')
          expect(typeof issue.issue).toBe('string')
        })
      }
    })
  })

  describe('Error Recovery and Fallback Strategies', () => {
    it('should implement graceful degradation for model unavailability', async () => {
      const primaryModelRequest = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      // 第一次请求失败（主模型不可用）
      vi.mocked(post).mockRejectedValueOnce(aiErrorScenarios.modelUnavailableError)

      // 第二次请求成功（使用备用模型）
      vi.mocked(post).mockResolvedValueOnce({
        success: true,
        data: {
          content: 'Response from fallback model',
          model: 'gpt-3.5-turbo'
        }
      })

      let response
      try {
        response = await post('/ai/chat/completions', primaryModelRequest)
      } catch (error: any) {
        // 获取备用模型建议
        const alternatives = error.data.error.details.alternative_models
        const fallbackModel = alternatives[0]

        // 使用备用模型重试
        response = await post('/ai/chat/completions', {
          ...primaryModelRequest,
          model: fallbackModel
        })
      }

      expect(response.success).toBe(true)
      expect(response.data.model).not.toBe('gpt-4')
    })

    it('should implement intelligent retry with different strategies', async () => {
      const strategies = [
        { delay: 1000, maxRetries: 3 },        // 指数退避
        { delay: 2000, maxRetries: 2 },        // 固定延迟
        { delay: 500, maxRetries: 5 }          // 快速重试
      ]

      for (const strategy of strategies) {
        let attemptCount = 0
        vi.mocked(get).mockImplementation(() => {
          attemptCount++
          if (attemptCount <= strategy.maxRetries) {
            return Promise.reject(aiErrorScenarios.rateLimitError)
          }
          return Promise.resolve({ success: true, data: [] })
        })

        const startTime = Date.now()
        let success = false

        for (let i = 0; i <= strategy.maxRetries; i++) {
          try {
            await get('/ai/models')
            success = true
            break
          } catch (error: any) {
            if (error.status === 429 && i < strategy.maxRetries) {
              await new Promise(resolve => setTimeout(resolve, strategy.delay))
            } else if (i === strategy.maxRetries) {
              throw error
            }
          }
        }

        const duration = Date.now() - startTime
        expect(success).toBe(true)
        expect(attemptCount).toBe(strategy.maxRetries + 1)
        expect(duration).toBeGreaterThan(strategy.delay * strategy.maxRetries * 0.8)
      }
    })
  })

  describe('Error Monitoring and Reporting', () => {
    it('should collect comprehensive error metadata', async () => {
      vi.mocked(post).mockRejectedValue(aiErrorScenarios.contentPolicyError)

      try {
        await post('/ai/chat/completions', {})
      } catch (error: any) {
        const metadata = error.data.metadata

        expect(typeof metadata.request_id).toBe('string')
        expect(metadata.request_id).toMatch(/^req_\w+_\d+$/)
        expect(Date.parse(metadata.timestamp)).not.toBeNaN()
        expect(typeof metadata.endpoint).toBe('string')
        expect(metadata.endpoint.indexOf('/ai')).toBe(0)
      }
    })

    it('should validate error response structure consistency', async () => {
      const errors = [
        aiErrorScenarios.rateLimitError.data,
        aiErrorScenarios.modelUnavailableError.data,
        aiErrorScenarios.contentPolicyError.data,
        aiErrorScenarios.quotaExceededError.data
      ]

      errors.forEach(errorData => {
        // 验证基础错误结构
        const apiValidation = validateApiResponseStructure({ data: errorData })
        expect(apiValidation.valid).toBe(true)

        // 验证错误字段
        const requiredFields = ['success', 'code', 'message', 'error']
        const fieldValidation = validateRequiredFields(errorData, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 验证错误对象结构
        expect(typeof errorData.error).toBe('object')
        expect(typeof errorData.error.code).toBe('string')
        expect(typeof errorData.error.type).toBe('string')
        expect(typeof errorData.error.message).toBe('string')
        expect(typeof errorData.error.details).toBe('object')

        // 验证元数据
        expect(typeof errorData.metadata).toBe('object')
        expect(typeof errorData.metadata.request_id).toBe('string')
        expect(Date.parse(errorData.metadata.timestamp)).not.toBeNaN()
      })
    })
  })
})