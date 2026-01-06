
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/api/modules/expert-consultation', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/expert-consultation', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

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
import {
  startConsultation,
  getNextExpertSpeech,
  getConsultationProgress,
  getConsultationSummary,
  generateActionPlan,
  getConsultationSession,
  expertConsultationApi,
  ExpertType,
  QueryType,
  type ConsultationRequest,
  type ConsultationPreferences,
  type ExpertSpeech,
  type ConsultationSession,
  type ConsultationProgress,
  type ConsultationSummary,
  type ActionPlan,
  type ActionItem,
  type BudgetEstimate
} from '../../../../src/api/expert-consultation'

// Mock request module
vi.mock('../utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

const mockRequest = require('../utils/request').default

// Mock endpoints
vi.mock('./endpoints', () => ({
  EXPERT_CONSULTATION_ENDPOINTS: {
    START_CONSULTATION: '/api/expert-consultation/start',
    GET_NEXT_SPEECH: (sessionId: string) => `/api/expert-consultation/${sessionId}/next-speech`,
    GET_PROGRESS: (sessionId: string) => `/api/expert-consultation/${sessionId}/progress`,
    GET_SUMMARY: (sessionId: string) => `/api/expert-consultation/${sessionId}/summary`,
    GENERATE_ACTION_PLAN: (sessionId: string) => `/api/expert-consultation/${sessionId}/action-plan`,
    GET_SESSION: (sessionId: string) => `/api/expert-consultation/${sessionId}/session`
  }
}))

const mockEndpoints = require('./endpoints').EXPERT_CONSULTATION_ENDPOINTS

describe('AI专家咨询API服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('枚举类型', () => {
    it('应该定义正确的专家类型枚举', () => {
      expect(ExpertType.INVESTOR).toBe('investor')
      expect(ExpertType.DIRECTOR).toBe('director')
      expect(ExpertType.PLANNER).toBe('planner')
      expect(ExpertType.TEACHER).toBe('teacher')
      expect(ExpertType.PARENT).toBe('parent')
      expect(ExpertType.PSYCHOLOGIST).toBe('psychologist')
    })

    it('应该定义正确的问题类型枚举', () => {
      expect(QueryType.RECRUITMENT_ACTIVITY).toBe('recruitment_activity')
      expect(QueryType.PARENT_CONVERSION).toBe('parent_conversion')
      expect(QueryType.GENERAL).toBe('general')
    })
  })

  describe('startConsultation', () => {
    it('应该正确调用启动专家咨询接口', async () => {
      const request: ConsultationRequest = {
        query: '如何提高招生转化率？',
        context: '我们是一所新开的幼儿园，目前招生情况不太理想',
        preferences: {
          expertOrder: [ExpertType.DIRECTOR, ExpertType.TEACHER, ExpertType.PARENT],
          focusAreas: ['招生策略', '家长沟通'],
          urgency: 'high'
        }
      }
      const mockResponse = {
        data: {
          sessionId: 'session-123',
          userId: 1,
          query: request.query,
          queryType: QueryType.PARENT_CONVERSION,
          expertOrder: request.preferences?.expertOrder,
          speeches: [],
          status: 'pending' as const,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await startConsultation(request)

      expect(mockRequest.post).toHaveBeenCalledWith(mockEndpoints.START_CONSULTATION, request)
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理最小咨询请求', async () => {
      const request: ConsultationRequest = {
        query: '简单咨询问题'
      }
      const mockResponse = {
        data: {
          sessionId: 'session-456',
          userId: 1,
          query: request.query,
          queryType: QueryType.GENERAL,
          expertOrder: [],
          speeches: [],
          status: 'pending' as const,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await startConsultation(request)

      expect(mockRequest.post).toHaveBeenCalledWith(mockEndpoints.START_CONSULTATION, request)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getNextExpertSpeech', () => {
    it('应该正确调用获取下一个专家发言接口', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          expertType: ExpertType.DIRECTOR,
          expertName: '王园长',
          content: '根据我的经验，提高招生转化率需要从多个方面入手...',
          keyPoints: ['定位明确', '环境优化', '师资展示'],
          recommendations: ['制定差异化定位', '改善园区环境', '加强师资宣传'],
          timestamp: '2023-01-01T00:01:00Z',
          processingTime: 2500
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getNextExpertSpeech(sessionId)

      expect(mockRequest.get).toHaveBeenCalledWith(mockEndpoints.GET_NEXT_SPEECH(sessionId))
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理不同类型的专家发言', async () => {
      const sessionId = 'session-123'
      const expertTypes = [ExpertType.TEACHER, ExpertType.PARENT, ExpertType.INVESTOR]
      
      for (const expertType of expertTypes) {
        const mockResponse = {
          data: {
            expertType,
            expertName: '专家姓名',
            content: '专家意见',
            keyPoints: ['要点1'],
            recommendations: ['建议1'],
            timestamp: '2023-01-01T00:01:00Z',
            processingTime: 1000
          }
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getNextExpertSpeech(sessionId)
        expect(result.expertType).toBe(expertType)
      }
    })
  })

  describe('getConsultationProgress', () => {
    it('应该正确调用获取咨询进度接口', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          sessionId,
          currentExpert: 1,
          totalExperts: 3,
          currentExpertType: ExpertType.DIRECTOR,
          completedExperts: [ExpertType.DIRECTOR],
          isCompleted: false,
          estimatedTimeRemaining: 30000
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationProgress(sessionId)

      expect(mockRequest.get).toHaveBeenCalledWith(mockEndpoints.GET_PROGRESS(sessionId))
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理完成的咨询进度', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          sessionId,
          currentExpert: 3,
          totalExperts: 3,
          currentExpertType: ExpertType.PSYCHOLOGIST,
          completedExperts: [ExpertType.DIRECTOR, ExpertType.TEACHER, ExpertType.PSYCHOLOGIST],
          isCompleted: true,
          estimatedTimeRemaining: 0
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationProgress(sessionId)

      expect(result.isCompleted).toBe(true)
      expect(result.estimatedTimeRemaining).toBe(0)
      expect(result.completedExperts).toHaveLength(3)
    })
  })

  describe('getConsultationSummary', () => {
    it('应该正确调用获取咨询汇总接口', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          sessionId,
          overallAnalysis: '综合各位专家的意见，我们建议从以下几个方面改进招生工作...',
          keyInsights: ['定位明确很重要', '环境是关键因素', '师资是核心竞争力'],
          consensusPoints: ['需要差异化定位', '环境需要改善', '师资需要加强'],
          conflictingViews: [
            {
              topic: '招生策略',
              viewpoints: [
                { expert: ExpertType.DIRECTOR, opinion: '应该注重品牌建设' },
                { expert: ExpertType.INVESTOR, opinion: '应该注重成本控制' }
              ]
            }
          ],
          finalRecommendations: ['制定综合策略', '平衡品牌与成本', '持续改进']
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationSummary(sessionId)

      expect(mockRequest.get).toHaveBeenCalledWith(mockEndpoints.GET_SUMMARY(sessionId))
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理没有冲突观点的汇总', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          sessionId,
          overallAnalysis: '所有专家意见一致',
          keyInsights: ['共同观点1'],
          consensusPoints: ['共识1', '共识2'],
          conflictingViews: [],
          finalRecommendations: ['建议1', '建议2']
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationSummary(sessionId)

      expect(result.conflictingViews).toEqual([])
    })
  })

  describe('generateActionPlan', () => {
    it('应该正确调用生成行动计划接口', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          planId: 'plan-123',
          sessionId,
          summary: '基于专家咨询结果，制定以下行动计划...',
          priority: 'high' as const,
          tasks: [
            {
              id: 'task-1',
              title: '制定差异化定位策略',
              description: '明确幼儿园的特色和优势',
              responsible: '市场部',
              deadline: '2023-02-01',
              priority: 'high' as const,
              status: 'pending' as const
            }
          ],
          timeline: '3个月',
          budget: {
            total: 50000,
            breakdown: [
              { category: '市场推广', amount: 30000, description: '线上推广费用' },
              { category: '环境改善', amount: 20000, description: '园区环境优化' }
            ],
            currency: 'CNY'
          },
          successMetrics: ['招生转化率提升20%', '品牌知名度提升30%']
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await generateActionPlan(sessionId)

      expect(mockRequest.post).toHaveBeenCalledWith(mockEndpoints.GENERATE_ACTION_PLAN(sessionId))
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理没有预算的行动计划', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          planId: 'plan-456',
          sessionId,
          summary: '简单行动计划',
          priority: 'medium' as const,
          tasks: [],
          timeline: '1个月',
          successMetrics: ['完成目标']
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await generateActionPlan(sessionId)

      expect(result.budget).toBeUndefined()
      expect(result.tasks).toEqual([])
    })
  })

  describe('getConsultationSession', () => {
    it('应该正确调用获取咨询会话详情接口', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        data: {
          sessionId,
          userId: 1,
          query: '如何提高招生转化率？',
          queryType: QueryType.PARENT_CONVERSION,
          expertOrder: [ExpertType.DIRECTOR, ExpertType.TEACHER, ExpertType.PARENT],
          speeches: [
            {
              expertType: ExpertType.DIRECTOR,
              expertName: '王园长',
              content: '专家发言内容',
              keyPoints: ['要点1'],
              recommendations: ['建议1'],
              timestamp: '2023-01-01T00:01:00Z',
              processingTime: 2500
            }
          ],
          status: 'in_progress' as const,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationSession(sessionId)

      expect(mockRequest.get).toHaveBeenCalledWith(mockEndpoints.GET_SESSION(sessionId))
      expect(result).toEqual(mockResponse.data)
    })

    it('应该正确处理不同状态的会话', async () => {
      const sessionId = 'session-123'
      const statuses = ['pending', 'in_progress', 'completed'] as const
      
      for (const status of statuses) {
        const mockResponse = {
          data: {
            sessionId,
            status,
            speeches: [],
            createdAt: '2023-01-01T00:00:00Z'
          }
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getConsultationSession(sessionId)
        expect(result.status).toBe(status)
      }
    })
  })

  describe('expertConsultationApi 对象', () => {
    it('应该正确导出所有API方法', () => {
      expect(expertConsultationApi).toEqual(expect.objectContaining({
        startConsultation: expect.any(Function),
        getNextExpertSpeech: expect.any(Function),
        getConsultationProgress: expect.any(Function),
        getConsultationSummary: expect.any(Function),
        generateActionPlan: expect.any(Function),
        getConsultationSession: expect.any(Function)
      }))
    })

    it('应该正确引用各个方法', () => {
      expect(expertConsultationApi.startConsultation).toBe(startConsultation)
      expect(expertConsultationApi.getNextExpertSpeech).toBe(getNextExpertSpeech)
      expect(expertConsultationApi.getConsultationProgress).toBe(getConsultationProgress)
      expect(expertConsultationApi.getConsultationSummary).toBe(getConsultationSummary)
      expect(expertConsultationApi.generateActionPlan).toBe(generateActionPlan)
      expect(expertConsultationApi.getConsultationSession).toBe(getConsultationSession)
    })
  })

  describe('类型安全', () => {
    it('应该正确处理ConsultationRequest类型', () => {
      const request: ConsultationRequest = {
        query: '测试咨询',
        context: '测试上下文',
        preferences: {
          expertOrder: [ExpertType.DIRECTOR],
          focusAreas: ['测试领域'],
          urgency: 'medium'
        }
      }

      expect(request.query).toBe('测试咨询')
      expect(request.preferences?.expertOrder).toContain(ExpertType.DIRECTOR)
      expect(request.preferences?.urgency).toBe('medium')
    })

    it('应该正确处理ExpertSpeech类型', () => {
      const speech: ExpertSpeech = {
        expertType: ExpertType.TEACHER,
        expertName: '李老师',
        content: '教学内容',
        keyPoints: ['要点1', '要点2'],
        recommendations: ['建议1'],
        timestamp: '2023-01-01T00:00:00Z',
        processingTime: 1000
      }

      expect(speech.expertType).toBe(ExpertType.TEACHER)
      expect(speech.keyPoints).toHaveLength(2)
      expect(speech.processingTime).toBe(1000)
    })

    it('应该正确处理ActionPlan类型', () => {
      const plan: ActionPlan = {
        planId: 'plan-123',
        sessionId: 'session-123',
        summary: '计划摘要',
        priority: 'high',
        tasks: [
          {
            id: 'task-1',
            title: '任务标题',
            description: '任务描述',
            responsible: '负责人',
            deadline: '2023-12-31',
            priority: 'high',
            status: 'pending'
          }
        ],
        timeline: '6个月',
        successMetrics: ['指标1', '指标2']
      }

      expect(plan.priority).toBe('high')
      expect(plan.tasks).toHaveLength(1)
      expect(plan.tasks[0].status).toBe('pending')
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockRequest.post.mockRejectedValue(error)

      await expect(startConsultation({ query: '测试' })).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的会话ID', async () => {
      const invalidSessionId = 'invalid-session'
      const mockResponse = {
        error: '会话不存在',
        code: 404
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationSession(invalidSessionId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理咨询未完成的错误', async () => {
      const sessionId = 'session-123'
      const mockResponse = {
        error: '咨询尚未完成，无法生成汇总',
        code: 400
      }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getConsultationSummary(sessionId)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空专家列表', async () => {
      const request: ConsultationRequest = {
        query: '测试咨询',
        preferences: {
          expertOrder: []
        }
      }
      const mockResponse = {
        data: {
          sessionId: 'session-empty',
          expertOrder: [],
          speeches: [],
          status: 'pending' as const,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await startConsultation(request)
      expect(result.expertOrder).toEqual([])
    })

    it('应该正确处理长咨询内容', async () => {
      const longQuery = '这是一个非常长的咨询问题'.repeat(100)
      const request: ConsultationRequest = { query: longQuery }
      const mockResponse = {
        data: {
          sessionId: 'session-long',
          query: longQuery,
          status: 'pending' as const,
          createdAt: '2023-01-01T00:00:00Z'
        }
      }
      mockRequest.post.mockResolvedValue(mockResponse)

      const result = await startConsultation(request)
      expect(result.query).toBe(longQuery)
    })

    it('应该正确处理所有优先级类型', async () => {
      const priorities = ['high', 'medium', 'low'] as const
      
      for (const priority of priorities) {
        const mockResponse = {
          data: {
            planId: `plan-${priority}`,
            sessionId: 'session-123',
            summary: '测试计划',
            priority,
            tasks: [],
            timeline: '1个月',
            successMetrics: []
          }
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await generateActionPlan('session-123')
        expect(result.priority).toBe(priority)
      }
    })
  })
})