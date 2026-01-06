import { vi } from 'vitest'
/**
 * AI Analysis Service Test
 * AI分析服务测试
 * 
 * 测试覆盖范围：
 * - 豆包模型分析功能
 * - 模型配置获取
 * - 请求消息构建
 * - API调用处理
 * - 响应解析
 * - 结构化响应解析
 * - Markdown结构解析
 * - 文本结构解析
 * - Fallback响应生成
 * - 分析历史获取
 * - 报告导出功能
 * - 模型可用性验证
 * - 错误处理机制
 * - 网络超时处理
 * - 数据验证
 */

import { AIAnalysisService } from '../../../src/services/ai-analysis.service'
import { AIModelConfig } from '../../../src/models/ai-model-config.model'
import axios from 'axios'

// Mock dependencies
jest.mock('../../../src/models/ai-model-config.model')
jest.mock('axios')
jest.mock('sequelize')

const mockedSequelize = require('sequelize')


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

describe('AIAnalysisService', () => {
  let aiAnalysisService: AIAnalysisService
  let mockAIModelConfig: jest.Mocked<typeof AIModelConfig>
  let mockAxios: jest.Mocked<typeof axios>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockAIModelConfig = AIModelConfig as jest.Mocked<typeof AIModelConfig>
    mockAxios = axios as jest.Mocked<typeof axios>

    // Create service instance
    aiAnalysisService = new AIAnalysisService()
  })

  describe('analyzeWithDoubao', () => {
    it('应该成功使用豆包模型进行分析', async () => {
      // Mock model configuration
      const mockModel = {
        id: 1,
        name: 'doubao-seed-1.6-250615',
        displayName: '豆包1.6模型',
        provider: 'ByteDance',
        modelType: 'text',
        apiVersion: 'v1',
        endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        apiKey: 'test-api-key',
        modelParameters: {
          temperature: 0.3,
          maxTokens: 4000,
          topP: 0.8
        },
        isDefault: true,
        status: 'active',
        description: '豆包模型配置',
        capabilities: ['text'],
        maxTokens: 4000,
        creatorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockAIModelConfig.findOne.mockResolvedValue(mockModel as any)

      // Mock API response
      const mockResponse = {
        status: 200,
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: '测试分析摘要',
                  insights: [
                    {
                      title: '测试洞察',
                      description: '测试描述',
                      importance: 'high',
                      category: 'trend'
                    }
                  ],
                  trends: {
                    direction: '上升',
                    confidence: '高',
                    factors: ['因素1', '因素2']
                  },
                  recommendations: [
                    {
                      action: '测试建议',
                      priority: 'high',
                      timeline: '短期',
                      expectedImpact: '预期影响'
                    }
                  ],
                  risks: [],
                  metrics: {}
                })
              }
            }
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const prompt = '测试分析提示'
      const options = {
        type: 'enrollment_trends',
        context: '招生趋势分析',
        requireStructured: true
      }

      const result = await aiAnalysisService.analyzeWithDoubao(prompt, options)

      expect(result).toEqual({
        summary: '测试分析摘要',
        insights: [
          {
            title: '测试洞察',
            description: '测试描述',
            importance: 'high',
            category: 'trend'
          }
        ],
        trends: {
          direction: '上升',
          confidence: '高',
          factors: ['因素1', '因素2']
        },
        recommendations: [
          {
            action: '测试建议',
            priority: 'high',
            timeline: '短期',
            expectedImpact: '预期影响'
          }
        ],
        risks: [],
        metrics: {}
      })

      expect(mockAIModelConfig.findOne).toHaveBeenCalledWith({
        where: {
          status: 'active',
          isDefault: true,
          name: {
            [mockedSequelize.Op.like]: '%doubao-seed%'
          }
        }
      })

      expect(mockAxios.post).toHaveBeenCalledWith(
        mockModel.endpointUrl,
        {
          model: mockModel.name,
          messages: [
            {
              role: 'system',
              content: expect.stringContaining('你是一个专业的幼儿园数据分析专家')
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: mockModel.modelParameters?.temperature,
          max_tokens: mockModel.modelParameters?.maxTokens,
          top_p: mockModel.modelParameters?.topP,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockModel.apiKey}`
          },
          timeout: 60000
        }
      )
    })

    it('应该使用fallback配置当数据库中没有模型配置', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null)

      const mockResponse = {
        status: 200,
        data: {
          choices: [
            {
              message: {
                content: '测试分析内容'
              }
            }
          ]
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const prompt = '测试提示'
      const options = {
        type: 'general',
        context: '测试上下文'
      }

      const result = await aiAnalysisService.analyzeWithDoubao(prompt, options)

      expect(result).toEqual({
        summary: '分析完成',
        content: '测试分析内容',
        usage: mockResponse.data.usage
      })

      // Should have called findOne twice (second time with specific name)
      expect(mockAIModelConfig.findOne).toHaveBeenCalledTimes(2)
      expect(mockAIModelConfig.findOne).toHaveBeenCalledWith({
        where: {
          name: 'doubao-seed-1.6-250615',
          status: 'active'
        }
      })
    })

    it('应该生成fallback响应当API调用失败', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null)
      mockAxios.post.mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      const prompt = '测试提示'
      const options = {
        type: 'enrollment_trends',
        context: '测试上下文',
        requireStructured: true
      }

      const result = await aiAnalysisService.analyzeWithDoubao(prompt, options)

      expect(result).toEqual({
        summary: expect.stringContaining('基于现有数据进行基础招生趋势分析'),
        insights: expect.arrayContaining([
          expect.objectContaining({
            title: '招生数据概览',
            importance: 'high',
            category: 'trend'
          })
        ]),
        trends: expect.objectContaining({
          direction: '稳定',
          confidence: '中'
        }),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            action: '建立完善的招生数据跟踪体系',
            priority: 'high'
          })
        ]),
        risks: expect.arrayContaining([
          expect.objectContaining({
            risk: '数据不足导致分析偏差'
          })
        ]),
        metrics: expect.objectContaining({
          key_indicators: expect.any(Object)
        }),
        fallback: true
      })

      expect(consoleSpy).toHaveBeenCalledWith('❌ 豆包AI分析失败:', expect.any(Error))
      expect(consoleWarnSpy).toHaveBeenCalledWith('🔄 AI服务不可用，生成fallback响应...')

      consoleSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('应该处理非结构化响应', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null)

      const mockResponse = {
        status: 200,
        data: {
          choices: [
            {
              message: {
                content: '这是一个非结构化的分析响应内容，包含各种信息和建议。'
              }
            }
          ]
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const prompt = '测试提示'
      const options = {
        type: 'general',
        context: '测试上下文',
        requireStructured: false
      }

      const result = await aiAnalysisService.analyzeWithDoubao(prompt, options)

      expect(result).toEqual({
        summary: '分析完成',
        content: '这是一个非结构化的分析响应内容，包含各种信息和建议。',
        usage: mockResponse.data.usage
      })
    })

    it('应该处理API响应格式异常', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null)

      const mockResponse = {
        status: 200,
        data: {} // Missing choices
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      const prompt = '测试提示'
      const options = {
        type: 'general',
        context: '测试上下文'
      }

      const result = await aiAnalysisService.analyzeWithDoubao(prompt, options)

      expect(result).toHaveProperty('fallback', true)

      consoleSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('generateServiceFallbackResponse', () => {
    it('应该为招生趋势分析生成正确的fallback响应', async () => {
      const service = aiAnalysisService as any
      const options = {
        type: 'enrollment_trends',
        context: '招生分析'
      }

      const result = service.generateServiceFallbackResponse(options)

      expect(result.summary).toContain('招生趋势分析')
      expect(result.insights).toHaveLength(2)
      expect(result.insights[0].title).toBe('招生数据概览')
      expect(result.trends.direction).toBe('稳定')
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].action).toContain('招生数据跟踪体系')
      expect(result.fallback).toBe(true)
    })

    it('应该为活动效果分析生成正确的fallback响应', async () => {
      const service = aiAnalysisService as any
      const options = {
        type: 'activity_effectiveness',
        context: '活动分析'
      }

      const result = service.generateServiceFallbackResponse(options)

      expect(result.summary).toContain('活动效果评估')
      expect(result.insights[0].title).toBe('活动开展情况')
      expect(result.recommendations[0].action).toContain('活动效果评估体系')
      expect(result.fallback).toBe(true)
    })

    it('应该为绩效预测生成正确的fallback响应', async () => {
      const service = aiAnalysisService as any
      const options = {
        type: 'performance_prediction',
        context: '绩效分析'
      }

      const result = service.generateServiceFallbackResponse(options)

      expect(result.summary).toContain('绩效分析')
      expect(result.insights[0].title).toBe('绩效管理体系')
      expect(result.recommendations[0].action).toContain('绩效评估标准')
      expect(result.fallback).toBe(true)
    })

    it('应该为风险评估生成正确的fallback响应', async () => {
      const service = aiAnalysisService as any
      const options = {
        type: 'risk_assessment',
        context: '风险分析'
      }

      const result = service.generateServiceFallbackResponse(options)

      expect(result.summary).toContain('风险分析')
      expect(result.insights[0].title).toBe('风险管理重要性')
      expect(result.risks).toHaveLength(2)
      expect(result.risks[0].risk).toBe('运营风险')
      expect(result.fallback).toBe(true)
    })

    it('应该为未知类型生成默认fallback响应', async () => {
      const service = aiAnalysisService as any
      const options = {
        type: 'unknown_type',
        context: '未知分析'
      }

      const result = service.generateServiceFallbackResponse(options)

      expect(result.summary).toContain('AI分析服务暂时不可用')
      expect(result.insights[0].title).toBe('服务状态')
      expect(result.recommendations[0].action).toContain('稍后重试')
      expect(result.fallback).toBe(true)
    })
  })

  describe('parseStructuredResponse', () => {
    it('应该成功解析JSON格式响应', () => {
      const service = aiAnalysisService as any
      const content = JSON.stringify({
        summary: '测试摘要',
        insights: [{ title: '测试洞察', importance: 'high' }],
        trends: { direction: '上升' }
      })

      const result = service.parseStructuredResponse(content)

      expect(result).toEqual({
        summary: '测试摘要',
        insights: [{ title: '测试洞察', importance: 'high' }],
        trends: { direction: '上升' }
      })
    })

    it('应该解析Markdown格式响应', () => {
      const service = aiAnalysisService as any
      const content = `
# 分析摘要
测试摘要内容

## 洞察
- 洞察1：重要发现
- 洞察2：次要发现

## 建议
- 建议1：立即行动
- 建议2：长期规划

## 风险
- 风险1：潜在问题
      `

      const result = service.parseStructuredResponse(content)

      expect(result.summary).toBe('测试摘要内容')
      expect(result.insights).toHaveLength(2)
      expect(result.insights[0].title).toBe('洞察1：重要发现')
      expect(result.recommendations).toHaveLength(2)
      expect(result.recommendations[0].action).toBe('建议1：立即行动')
      expect(result.risks).toHaveLength(1)
      expect(result.risks[0].risk).toBe('风险1：潜在问题')
    })

    it('应该解析纯文本格式响应', () => {
      const service = aiAnalysisService as any
      const content = '这是一个纯文本分析响应，包含各种信息和建议。'

      const result = service.parseStructuredResponse(content)

      expect(result.summary).toBe('这是一个纯文本分析响应，包含各种信息和建议...')
      expect(result.content).toBe(content)
      expect(result.insights).toHaveLength(1)
      expect(result.insights[0].title).toBe('分析完成')
    })

    it('应该处理JSON解析失败的情况', () => {
      const service = aiAnalysisService as any
      const invalidJson = '{ invalid json }'

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = service.parseStructuredResponse(invalidJson)

      expect(result.summary).toContain('JSON解析失败')
      expect(result.content).toBe(invalidJson)
      expect(result.raw).toBe(true)

      consoleSpy.mockRestore()
    })
  })

  describe('parseMarkdownStructure', () => {
    it('应该正确解析Markdown结构', () => {
      const service = aiAnalysisService as any
      const content = `
# 分析标题
分析摘要内容

## 洞察
- 洞察项目1
- 洞察项目2

## 建议
- 建议项目1
- 建议项目2

## 风险
- 风险项目1
      `

      const result = service.parseMarkdownStructure(content)

      expect(result.summary).toBe('分析摘要内容')
      expect(result.insights).toHaveLength(2)
      expect(result.insights[0].title).toBe('洞察项目1')
      expect(result.recommendations).toHaveLength(2)
      expect(result.recommendations[0].action).toBe('建议项目1')
      expect(result.risks).toHaveLength(1)
      expect(result.risks[0].risk).toBe('风险项目1')
    })

    it('应该处理没有标题的Markdown内容', () => {
      const service = aiAnalysisService as any
      const content = `
分析摘要内容，没有标题

## 洞察
- 洞察项目
      `

      const result = service.parseMarkdownStructure(content)

      expect(result.summary).toBe('分析摘要内容，没有标题')
      expect(result.insights).toHaveLength(1)
    })

    it('应该处理空内容', () => {
      const service = aiAnalysisService as any
      const content = ''

      const result = service.parseMarkdownStructure(content)

      expect(result.summary).toBe('')
      expect(result.insights).toHaveLength(0)
      expect(result.recommendations).toHaveLength(0)
      expect(result.risks).toHaveLength(0)
    })
  })

  describe('parseTextStructure', () => {
    it('应该正确解析文本结构', () => {
      const service = aiAnalysisService as any
      const content = '这是一个较长的文本分析响应内容，包含详细的分析结果和建议。'

      const result = service.parseTextStructure(content)

      expect(result.summary).toBe('这是一个较长的文本分析响应内容，包含详细的分析结果和建议...')
      expect(result.content).toBe(content)
      expect(result.insights).toHaveLength(1)
      expect(result.insights[0].title).toBe('分析完成')
      expect(result.trends.direction).toBe('待分析')
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].action).toBe('查看详细分析报告')
    })

    it('应该处理短文本', () => {
      const service = aiAnalysisService as any
      const content = '短文本'

      const result = service.parseTextStructure(content)

      expect(result.summary).toBe('短文本')
      expect(result.content).toBe('短文本')
    })
  })

  describe('getAnalysisHistory', () => {
    it('应该成功获取分析历史', async () => {
      const history = await aiAnalysisService.getAnalysisHistory(1, 'enrollment')

      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]).toHaveProperty('id')
      expect(history[0]).toHaveProperty('title')
      expect(history[0]).toHaveProperty('type')
      expect(history[0]).toHaveProperty('summary')
      expect(history[0]).toHaveProperty('createdAt')
      expect(history[0]).toHaveProperty('status')
    })

    it('应该获取所有类型的分析历史', async () => {
      const history = await aiAnalysisService.getAnalysisHistory(1)

      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
    })
  })

  describe('exportAnalysisReport', () => {
    it('应该成功导出PDF格式报告', async () => {
      const reportUrl = await aiAnalysisService.exportAnalysisReport(1, 'pdf')

      expect(reportUrl).toBe('/api/ai/analysis/export/1.pdf')
    })

    it('应该成功导出Excel格式报告', async () => {
      const reportUrl = await aiAnalysisService.exportAnalysisReport(1, 'excel')

      expect(reportUrl).toBe('/api/ai/analysis/export/1.xlsx')
    })

    it('应该默认导出PDF格式', async () => {
      const reportUrl = await aiAnalysisService.exportAnalysisReport(1)

      expect(reportUrl).toBe('/api/ai/analysis/export/1.pdf')
    })
  })

  describe('validateDoubaoModel', () => {
    it('应该成功验证豆包模型可用性', async () => {
      const mockModel = {
        id: 1,
        name: 'doubao-seed-1.6-250615',
        status: 'active',
        endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        apiKey: 'test-api-key'
      }

      mockAIModelConfig.findOne.mockResolvedValue(mockModel as any)

      const mockResponse = {
        status: 200,
        data: {
          choices: [
            {
              message: {
                content: '测试响应'
              }
            }
          ]
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await aiAnalysisService.validateDoubaoModel()

      expect(result).toBe(true)
      expect(mockAIModelConfig.findOne).toHaveBeenCalledWith({
        where: {
          name: 'doubao-seed-1.6-250615',
          status: 'active'
        }
      })
      expect(mockAxios.post).toHaveBeenCalledWith(
        mockModel.endpointUrl,
        {
          model: mockModel.name,
          messages: [
            {
              role: 'user',
              content: '测试连接'
            }
          ],
          temperature: 0.7,
          max_tokens: 10,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockModel.apiKey}`
          },
          timeout: 10000,
          proxy: false,
          httpAgent: false,
          httpsAgent: false
        }
      )
    })

    it('应该处理模型配置不存在的情况', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null)

      const result = await aiAnalysisService.validateDoubaoModel()

      expect(result).toBe(false)
    })

    it('应该处理API验证失败的情况', async () => {
      const mockModel = {
        id: 1,
        name: 'doubao-seed-1.6-250615',
        status: 'active',
        endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        apiKey: 'test-api-key'
      }

      mockAIModelConfig.findOne.mockResolvedValue(mockModel as any)
      mockAxios.post.mockRejectedValue(new Error('API Error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await aiAnalysisService.validateDoubaoModel()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('豆包模型验证失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})