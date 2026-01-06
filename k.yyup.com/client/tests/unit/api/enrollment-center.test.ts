
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


vi.mock('@/api/modules/enrollment-center', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/enrollment-center', () => ({
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
  EnrollmentCenterAPI,
  getEnrollmentOverview,
  getEnrollmentPlans,
  getEnrollmentPlanDetail,
  createEnrollmentPlan,
  updateEnrollmentPlan,
  deleteEnrollmentPlan,
  getEnrollmentApplications,
  getEnrollmentApplicationDetail,
  updateApplicationStatus,
  getEnrollmentConsultations,
  getConsultationStatistics,
  getAnalyticsTrends,
  getAnalyticsFunnel,
  getAnalyticsRegions,
  getAnalyticsMetrics,
  aiPredict,
  aiStrategy,
  aiCapacityAnalysis
} from '../../../../src/api/enrollment-center'

// Mock request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockRequest = require('@/utils/request').request

describe('招生中心API服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('概览数据API', () => {
    describe('getOverview', () => {
      it('应该正确调用获取概览数据接口', async () => {
        const params = { timeRange: 'month', kindergartenId: 1 }
        const mockResponse = {
          statistics: {
            totalConsultations: { value: 100, trend: 10, trendText: '+10%' },
            applications: { value: 50, trend: 5, trendText: '+5%' },
            trials: { value: 30, trend: -2, trendText: '-2%' },
            conversionRate: { value: 60, trend: 8, trendText: '+8%' }
          },
          charts: {
            enrollmentTrend: {
              categories: ['1月', '2月', '3月'],
              series: [{ name: '报名数', data: [10, 15, 20] }]
            },
            sourceChannel: {
              categories: ['线上', '线下', '推荐'],
              series: [{ name: '渠道', data: [30, 40, 30] }]
            }
          },
          quickStats: {
            pendingApplications: 5,
            todayConsultations: 10,
            upcomingInterviews: 3
          }
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getOverview(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/overview', { params })
        expect(result).toEqual(mockResponse)
      })

      it('应该在不传参数时正确调用概览接口', async () => {
        const mockResponse = { statistics: {}, charts: {}, quickStats: {} }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getOverview()

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/overview', { params: undefined })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('计划管理API', () => {
    describe('getPlans', () => {
      it('应该正确调用获取计划列表接口', async () => {
        const query = {
          page: 1,
          pageSize: 10,
          search: '2024',
          year: 2024,
          semester: 'spring',
          status: 'active'
        }
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getPlans(query)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/plans', { params: query })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getPlanDetail', () => {
      it('应该正确调用获取计划详情接口', async () => {
        const planId = 1
        const mockResponse = {
          id: planId,
          title: '2024年春季招生计划',
          year: 2024,
          semester: 'spring',
          targetCount: 100,
          appliedCount: 50,
          progress: 50,
          status: 'active'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getPlanDetail(planId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/enrollment-center/plans/${planId}`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createPlan', () => {
      it('应该正确调用创建计划接口', async () => {
        const planData = {
          title: '2024年秋季招生计划',
          year: 2024,
          semester: 'autumn',
          targetCount: 150,
          startDate: '2024-09-01',
          endDate: '2024-12-31',
          quotas: [
            { classId: 1, quota: 50 },
            { classId: 2, quota: 100 }
          ]
        }
        const mockResponse = { id: 2, ...planData }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.createPlan(planData)

        expect(mockRequest.post).toHaveBeenCalledWith('/enrollment-center/plans', planData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updatePlan', () => {
      it('应该正确调用更新计划接口', async () => {
        const planId = 1
        const updateData = { targetCount: 120, status: 'inactive' }
        const mockResponse = { id: planId, ...updateData }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.updatePlan(planId, updateData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/enrollment-center/plans/${planId}`, updateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deletePlan', () => {
      it('应该正确调用删除计划接口', async () => {
        const planId = 1
        const mockResponse = { success: true }
        mockRequest.delete.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.deletePlan(planId)

        expect(mockRequest.delete).toHaveBeenCalledWith(`/enrollment-center/plans/${planId}`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('申请管理API', () => {
    describe('getApplications', () => {
      it('应该正确调用获取申请列表接口', async () => {
        const query = {
          page: 1,
          pageSize: 10,
          search: '张三',
          planId: 1,
          status: 'pending',
          applicationDateFrom: '2024-01-01',
          applicationDateTo: '2024-12-31'
        }
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getApplications(query)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/applications', { params: query })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getApplicationDetail', () => {
      it('应该正确调用获取申请详情接口', async () => {
        const applicationId = 1
        const mockResponse = {
          id: applicationId,
          applicationNo: 'APP2024001',
          studentName: '张三',
          gender: '男',
          birthDate: '2020-01-01',
          parentName: '张父',
          parentPhone: '13800138000',
          status: 'pending'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getApplicationDetail(applicationId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/enrollment-center/applications/${applicationId}`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateApplicationStatus', () => {
      it('应该正确调用更新申请状态接口', async () => {
        const applicationId = 1
        const statusData = {
          status: 'approved',
          remarks: '通过审核',
          notifyParent: true
        }
        const mockResponse = { id: applicationId, ...statusData }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.updateApplicationStatus(applicationId, statusData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/enrollment-center/applications/${applicationId}/status`, statusData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('咨询管理API', () => {
    describe('getConsultations', () => {
      it('应该正确调用获取咨询列表接口', async () => {
        const query = {
          page: 1,
          pageSize: 10,
          search: '李四',
          status: 'pending',
          source: 'online'
        }
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getConsultations(query)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/consultations', { params: query })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getConsultationStatistics', () => {
      it('应该正确调用获取咨询统计接口', async () => {
        const mockResponse = {
          todayConsultations: 10,
          pendingFollowUp: 5,
          monthlyConversions: 20,
          averageResponseTime: 30,
          sourceAnalysis: [
            { source: '线上', count: 50, conversionRate: 0.4 },
            { source: '线下', count: 30, conversionRate: 0.6 }
          ],
          statusDistribution: [
            { status: 'pending', count: 10, percentage: 50 },
            { status: 'completed', count: 10, percentage: 50 }
          ]
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getConsultationStatistics()

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/consultations/statistics')
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('数据分析API', () => {
    describe('getAnalyticsTrends', () => {
      it('应该正确调用获取趋势分析接口', async () => {
        const params = {
          timeRange: 'month',
          dimension: 'source',
          compareWith: 'lastYear'
        }
        const mockResponse = {
          categories: ['1月', '2月', '3月'],
          series: [
            { name: '咨询数', data: [100, 120, 110] },
            { name: '报名数', data: [50, 60, 55] }
          ]
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getAnalyticsTrends(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/analytics/trends', { params })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getAnalyticsFunnel', () => {
      it('应该正确调用获取漏斗分析接口', async () => {
        const params = { timeRange: 'quarter' }
        const mockResponse = {
          stages: [
            { name: '咨询', count: 100, percentage: 100 },
            { name: '报名', count: 50, percentage: 50 },
            { name: '录取', count: 30, percentage: 30 }
          ]
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getAnalyticsFunnel(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/analytics/funnel', { params })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getAnalyticsRegions', () => {
      it('应该正确调用获取地域分析接口', async () => {
        const params = { timeRange: 'year' }
        const mockResponse = {
          regions: [
            { name: '朝阳区', count: 50, percentage: 40 },
            { name: '海淀区', count: 30, percentage: 24 },
            { name: '西城区', count: 20, percentage: 16 },
            { name: '其他', count: 25, percentage: 20 }
          ]
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getAnalyticsRegions(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/analytics/regions', { params })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getAnalyticsMetrics', () => {
      it('应该正确调用获取关键指标接口', async () => {
        const params = {
          timeRange: 'quarter',
          compareWith: 'lastPeriod'
        }
        const mockResponse = {
          yoyGrowth: 15,
          momGrowth: 5,
          targetCompletion: 80,
          averageCost: 1000,
          comparison: {
            current: {
              period: '2024 Q1',
              consultations: 300,
              applications: 150,
              conversions: 75
            },
            previous: {
              period: '2023 Q4',
              consultations: 280,
              applications: 140,
              conversions: 70
            }
          }
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.getAnalyticsMetrics(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-center/analytics/metrics', { params })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('AI功能API', () => {
    describe('aiPredict', () => {
      it('应该正确调用AI预测接口', async () => {
        const predictData = {
          planId: 1,
          timeRange: 'quarter',
          factors: ['历史数据', '市场趋势', '季节因素']
        }
        const mockResponse = {
          prediction: {
            expectedApplications: 120,
            confidence: 0.85,
            factors: [
              { name: '历史数据', impact: 0.4, description: '基于历史报名趋势' },
              { name: '市场趋势', impact: 0.3, description: '市场整体需求增长' },
              { name: '季节因素', impact: 0.3, description: '春季报名高峰期' }
            ]
          },
          chart: {
            categories: ['1月', '2月', '3月'],
            series: [
              { name: '预测值', data: [30, 40, 50] },
              { name: '置信区间', data: [25, 35, 45] }
            ]
          }
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.aiPredict(predictData)

        expect(mockRequest.post).toHaveBeenCalledWith('/enrollment-center/ai/predict', predictData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('aiStrategy', () => {
      it('应该正确调用AI策略建议接口', async () => {
        const strategyData = {
          planId: 1,
          focusArea: 'marketing'
        }
        const mockResponse = {
          suggestions: [
            {
              id: 'strategy1',
              title: '优化线上推广',
              description: '增加社交媒体投放和SEO优化',
              expectedImprovement: '+20%',
              confidence: 0.9,
              priority: 'high',
              category: 'marketing',
              implementation: {
                steps: ['制定推广计划', '选择投放渠道', '监控效果'],
                timeline: '2周',
                resources: ['营销团队', '推广预算']
              }
            }
          ],
          metrics: {
            predictedApplications: 150,
            recommendedQuota: 150,
            optimalTiming: '2024-03-01',
            riskAssessment: 'low'
          }
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.aiStrategy(strategyData)

        expect(mockRequest.post).toHaveBeenCalledWith('/enrollment-center/ai/strategy', strategyData)
        expect(result).toEqual(mockResponse)
      })

      it('应该在不传参数时调用AI策略建议接口', async () => {
        const mockResponse = { suggestions: [], metrics: {} }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.aiStrategy()

        expect(mockRequest.post).toHaveBeenCalledWith('/enrollment-center/ai/strategy', undefined)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('aiCapacityAnalysis', () => {
      it('应该正确调用AI容量分析接口', async () => {
        const capacityData = {
          planId: 1,
          targetIncrease: 20
        }
        const mockResponse = {
          currentCapacity: 100,
          recommendedCapacity: 120,
          utilization: 0.83,
          recommendations: [
            '增加班级数量',
            '优化师资配置',
            '扩建教学设施'
          ]
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await EnrollmentCenterAPI.aiCapacityAnalysis(capacityData)

        expect(mockRequest.post).toHaveBeenCalledWith('/enrollment-center/ai/capacity', capacityData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('便捷方法导出', () => {
    it('应该正确导出所有便捷方法', () => {
      expect(getEnrollmentOverview).toBe(EnrollmentCenterAPI.getOverview)
      expect(getEnrollmentPlans).toBe(EnrollmentCenterAPI.getPlans)
      expect(getEnrollmentPlanDetail).toBe(EnrollmentCenterAPI.getPlanDetail)
      expect(createEnrollmentPlan).toBe(EnrollmentCenterAPI.createPlan)
      expect(updateEnrollmentPlan).toBe(EnrollmentCenterAPI.updatePlan)
      expect(deleteEnrollmentPlan).toBe(EnrollmentCenterAPI.deletePlan)
      expect(getEnrollmentApplications).toBe(EnrollmentCenterAPI.getApplications)
      expect(getEnrollmentApplicationDetail).toBe(EnrollmentCenterAPI.getApplicationDetail)
      expect(updateApplicationStatus).toBe(EnrollmentCenterAPI.updateApplicationStatus)
      expect(getEnrollmentConsultations).toBe(EnrollmentCenterAPI.getConsultations)
      expect(getConsultationStatistics).toBe(EnrollmentCenterAPI.getConsultationStatistics)
      expect(getAnalyticsTrends).toBe(EnrollmentCenterAPI.getAnalyticsTrends)
      expect(getAnalyticsFunnel).toBe(EnrollmentCenterAPI.getAnalyticsFunnel)
      expect(getAnalyticsRegions).toBe(EnrollmentCenterAPI.getAnalyticsRegions)
      expect(getAnalyticsMetrics).toBe(EnrollmentCenterAPI.getAnalyticsMetrics)
      expect(aiPredict).toBe(EnrollmentCenterAPI.aiPredict)
      expect(aiStrategy).toBe(EnrollmentCenterAPI.aiStrategy)
      expect(aiCapacityAnalysis).toBe(EnrollmentCenterAPI.aiCapacityAnalysis)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockRequest.get.mockRejectedValue(error)

      await expect(EnrollmentCenterAPI.getOverview()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的ID参数', async () => {
      const invalidId = -1
      const mockResponse = { error: '无效的ID', code: 400 }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await EnrollmentCenterAPI.getPlanDetail(invalidId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空数据响应', async () => {
      mockRequest.get.mockResolvedValue({ data: [], total: 0 })

      const result = await EnrollmentCenterAPI.getPlans()
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('类型安全', () => {
    it('应该正确处理类型化的响应数据', async () => {
      const typedResponse = {
        statistics: {
          totalConsultations: { value: 100, trend: 10, trendText: '+10%' },
          applications: { value: 50, trend: 5, trendText: '+5%' },
          trials: { value: 30, trend: -2, trendText: '-2%' },
          conversionRate: { value: 60, trend: 8, trendText: '+8%' }
        },
        charts: {
          enrollmentTrend: { categories: [], series: [] },
          sourceChannel: { categories: [], series: [] }
        },
        quickStats: {
          pendingApplications: 5,
          todayConsultations: 10,
          upcomingInterviews: 3
        }
      }
      mockRequest.get.mockResolvedValue(typedResponse)

      const result = await EnrollmentCenterAPI.getOverview()
      
      // 验证返回类型符合预期
      expect(result).toHaveProperty('statistics')
      expect(result).toHaveProperty('charts')
      expect(result).toHaveProperty('quickStats')
      expect(result.statistics).toHaveProperty('totalConsultations')
      expect(result.statistics.totalConsultations).toHaveProperty('value')
      expect(result.statistics.totalConsultations).toHaveProperty('trend')
      expect(result.statistics.totalConsultations).toHaveProperty('trendText')
    })
  })
})