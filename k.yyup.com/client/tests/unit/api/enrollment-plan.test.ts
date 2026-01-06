
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


vi.mock('@/api/modules/enrollment-plan', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/enrollment-plan', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getEnrollmentPlans,
  getEnrollmentPlan,
  createEnrollmentPlan,
  updateEnrollmentPlan,
  deleteEnrollmentPlan,
  getEnrollmentPlanStatistics,
  getEnrollmentPlanQuotas,
  updateEnrollmentPlanQuotas,
  getQuotaUsageHistory,
  publishEnrollmentPlan,
  cancelEnrollmentPlan,
  completeEnrollmentPlan,
  getEnrollmentAnalytics,
  getEnrollmentPlanOverview,
  exportEnrollmentPlanData,
  setEnrollmentPlanClasses,
  setEnrollmentPlanAssignees,
  getEnrollmentPlanTrackings,
  addEnrollmentPlanTracking,
  updateEnrollmentPlanStatus,
  getEnrollmentPlanClasses,
  getAllEnrollmentPlanStatistics,
  copyEnrollmentPlan,
  exportEnrollmentPlans,
  enrollmentPlanApi,
  mockEnrollmentPlans
} from '@/api/enrollment-plan'
import { expectNoConsoleErrors } from '../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validatePaginationStructure,
  validateApiResponseStructure,
  validateStatisticalRanges
} from '../../utils/data-validation'

// Mock request modules
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  ApiResponse: vi.fn()
}))

vi.mock('@/api/endpoints', () => ({
  ENROLLMENT_PLAN_ENDPOINTS: {
    BASE: '/enrollment-plans',
    GET_BY_ID: (id: number) => `/enrollment-plans/${id}`,
    UPDATE: (id: number) => `/enrollment-plans/${id}`,
    DELETE: (id: number) => `/enrollment-plans/${id}`,
    ANALYTICS: '/enrollment-plans/analytics',
    EXPORT: (id: number) => `/enrollment-plans/${id}/export`,
    UPDATE_STATUS: (id: number) => `/enrollment-plans/${id}/status`
  },
  ENROLLMENT_QUOTA_ENDPOINTS: {
    BASE: '/enrollment-quotas'
  },
  API_PREFIX: '/api'
}))

vi.mock('@/utils/dataTransform', () => ({
  transformEnrollmentPlanData: vi.fn((data) => data),
  transformListResponse: vi.fn((response, transformFn) => ({
    ...response,
    data: response.data ? response.data.map(transformFn) : []
  })),
  transformEnrollmentPlanFormData: vi.fn((data) => data)
}))

const mockRequest = require('@/utils/request').request
const mockGet = require('@/utils/request').get
const mockPost = require('@/utils/request').post
const mockPut = require('@/utils/request').put
const mockDel = require('@/utils/request').del
const mockEndpoints = require('@/api/endpoints')
const mockTransform = require('@/utils/dataTransform')

// 控制台错误检测变量
let consoleSpy: any

describe('招生计划API服务 - 严格验证', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    expectNoConsoleErrors()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基础CRUD操作', () => {
    describe('getEnrollmentPlans', () => {
      it('应该正确调用获取招生计划列表接口并进行严格验证', async () => {
        const params = { page: 1, pageSize: 10, status: 'active' }
        const mockResponse = {
          success: true,
          data: {
            items: [
              {
                id: 1,
                name: '2023年秋季招生计划',
                status: 'active',
                startDate: '2023-09-01',
                endDate: '2024-01-31',
                targetCount: 200,
                currentApplications: 150,
                createdAt: '2023-06-01T10:00:00Z',
                updatedAt: '2023-06-01T10:00:00Z'
              },
              {
                id: 2,
                name: '2024年春季招生计划',
                status: 'draft',
                startDate: '2024-02-01',
                endDate: '2024-06-30',
                targetCount: 180,
                currentApplications: 0,
                createdAt: '2023-12-01T10:00:00Z',
                updatedAt: '2023-12-01T10:00:00Z'
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          },
          message: '获取成功'
        }
        mockGet.mockResolvedValue(mockResponse)
        mockTransform.transformListResponse.mockReturnValue(mockResponse)

        const result = await getEnrollmentPlans(params)

        // 1. 验证API调用参数
        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.BASE, { params })
        expect(mockTransform.transformListResponse).toHaveBeenCalledWith(mockResponse, mockTransform.transformEnrollmentPlanData)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(typeof result.message).toBe('string')

        // 3. 验证分页结构
        const paginationValidation = validatePaginationStructure(result.data)
        expect(paginationValidation.valid).toBe(true)
        expect(Array.isArray(result.data.items)).toBe(true)
        expect(typeof result.data.total).toBe('number')
        expect(typeof result.data.page).toBe('number')
        expect(typeof result.data.pageSize).toBe('number')

        // 4. 验证列表项必填字段
        if (result.data.items.length > 0) {
          const requiredFields = ['id', 'name', 'status', 'startDate', 'endDate', 'targetCount', 'currentApplications', 'createdAt', 'updatedAt']
          const itemValidation = validateRequiredFields(result.data.items[0], requiredFields)
          expect(itemValidation.valid).toBe(true)

          // 5. 验证字段类型
          const typeValidation = validateFieldTypes(result.data.items[0], {
            id: 'number',
            name: 'string',
            status: 'string',
            startDate: 'string',
            endDate: 'string',
            targetCount: 'number',
            currentApplications: 'number',
            createdAt: 'string',
            updatedAt: 'string'
          })
          expect(typeValidation.valid).toBe(true)

          // 6. 验证状态枚举值
          const validStatuses = ['active', 'draft', 'completed', 'cancelled']
          expect(validStatuses).toContain(result.data.items[0].status)

          // 7. 验证数值范围
          expect(result.data.items[0].targetCount).toBeGreaterThan(0)
          expect(result.data.items[0].currentApplications).toBeGreaterThanOrEqual(0)
        }

        // 8. 验证分页数据范围
        expect(result.data.page).toBeGreaterThanOrEqual(1)
        expect(result.data.pageSize).toBeGreaterThan(0)
        expect(result.data.total).toBeGreaterThanOrEqual(0)
      })

      it('应该正确处理空数据的验证', async () => {
        const params = { page: 1, pageSize: 10 }
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10
          },
          message: '暂无数据'
        }
        mockGet.mockResolvedValue(mockResponse)
        mockTransform.transformListResponse.mockReturnValue(mockResponse)

        const result = await getEnrollmentPlans(params)

        // 验证空数据响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.data.items).toEqual([])
        expect(result.data.total).toBe(0)

        const paginationValidation = validatePaginationStructure(result.data)
        expect(paginationValidation.valid).toBe(true)
      })
    })

    describe('getEnrollmentPlan', () => {
      it('应该正确调用获取招生计划详情接口并进行严格验证', async () => {
        const planId = 1
        const mockResponse = {
          success: true,
          data: {
            id: planId,
            name: '2023年秋季招生计划',
            description: '针对2023年秋季学期的招生计划',
            targetCount: 200,
            currentApplications: 150,
            status: 'active',
            startDate: '2023-09-01',
            endDate: '2024-01-31',
            kindergartenId: 1,
            year: 2023,
            term: '秋季',
            createdAt: '2023-06-01T10:00:00Z',
            updatedAt: '2023-06-15T14:30:00Z',
            quotas: [
              {
                id: 1,
                className: '小班1班',
                capacity: 30,
                enrolled: 25,
                ageGroup: '3-4岁'
              },
              {
                id: 2,
                className: '中班1班',
                capacity: 35,
                enrolled: 28,
                ageGroup: '4-5岁'
              }
            ],
            assignees: [
              {
                id: 1,
                name: '张老师',
                role: 'primary'
              }
            ]
          },
          message: '获取成功'
        }
        mockGet.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await getEnrollmentPlan(planId)

        // 1. 验证API调用
        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}`)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(typeof result.message).toBe('string')

        // 3. 验证必填字段
        const requiredFields = [
          'id', 'name', 'targetCount', 'currentApplications', 'status',
          'startDate', 'endDate', 'kindergartenId', 'year', 'term',
          'createdAt', 'updatedAt'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'number',
          name: 'string',
          description: 'string',
          targetCount: 'number',
          currentApplications: 'number',
          status: 'string',
          startDate: 'string',
          endDate: 'string',
          kindergartenId: 'number',
          year: 'number',
          term: 'string',
          createdAt: 'string',
          updatedAt: 'string',
          quotas: 'array',
          assignees: 'array'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证枚举值
        const validStatuses = ['active', 'draft', 'completed', 'cancelled']
        expect(validStatuses).toContain(result.data.status)

        const validTerms = ['春季', '夏季', '秋季', '冬季']
        expect(validTerms).toContain(result.data.term)

        // 6. 验证数值范围
        expect(result.data.targetCount).toBeGreaterThan(0)
        expect(result.data.currentApplications).toBeGreaterThanOrEqual(0)
        expect(result.data.kindergartenId).toBeGreaterThan(0)
        expect(result.data.year).toBeGreaterThan(2020)

        // 7. 验证关联数据结构
        if (result.data.quotas && result.data.quotas.length > 0) {
          const quotaRequiredFields = ['id', 'className', 'capacity', 'enrolled', 'ageGroup']
          const quotaValidation = validateRequiredFields(result.data.quotas[0], quotaRequiredFields)
          expect(quotaValidation.valid).toBe(true)

          const quotaTypeValidation = validateFieldTypes(result.data.quotas[0], {
            id: 'number',
            className: 'string',
            capacity: 'number',
            enrolled: 'number',
            ageGroup: 'string'
          })
          expect(quotaTypeValidation.valid).toBe(true)

          // 验证名额逻辑
          expect(result.data.quotas[0].capacity).toBeGreaterThan(0)
          expect(result.data.quotas[0].enrolled).toBeGreaterThanOrEqual(0)
          expect(result.data.quotas[0].enrolled).toBeLessThanOrEqual(result.data.quotas[0].capacity)
        }

        if (result.data.assignees && result.data.assignees.length > 0) {
          const assigneeRequiredFields = ['id', 'name', 'role']
          const assigneeValidation = validateRequiredFields(result.data.assignees[0], assigneeRequiredFields)
          expect(assigneeValidation.valid).toBe(true)

          const validRoles = ['primary', 'secondary', 'assistant']
          expect(validRoles).toContain(result.data.assignees[0].role)
        }
      })

      it('应该正确处理不存在的计划ID', async () => {
        const planId = 99999
        const mockResponse = {
          success: false,
          data: null,
          message: '招生计划不存在',
          code: 404
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlan(planId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}`)
        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(404)
      })
    })

    describe('createEnrollmentPlan', () => {
      it('应该正确调用创建招生计划接口并进行严格验证', async () => {
        const planData = {
          name: '2024年秋季招生计划',
          description: '针对2024年秋季学期的新招生计划',
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          targetCount: 150,
          kindergartenId: 1,
          year: 2024,
          term: '秋季'
        }
        const mockResponse = {
          success: true,
          data: {
            id: 3,
            name: planData.name,
            description: planData.description,
            startDate: planData.startDate,
            endDate: planData.endDate,
            targetCount: planData.targetCount,
            currentApplications: 0,
            status: 'draft',
            kindergartenId: planData.kindergartenId,
            year: planData.year,
            term: planData.term,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          message: '创建成功'
        }
        mockPost.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanFormData.mockReturnValue(planData)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await createEnrollmentPlan(planData)

        // 1. 验证数据转换和API调用
        expect(mockTransform.transformEnrollmentPlanFormData).toHaveBeenCalledWith(planData)
        expect(mockPost).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.BASE, planData)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证返回数据的必填字段
        const requiredFields = [
          'id', 'name', 'startDate', 'endDate', 'targetCount',
          'currentApplications', 'status', 'kindergartenId', 'year',
          'term', 'createdAt', 'updatedAt'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'number',
          name: 'string',
          description: 'string',
          startDate: 'string',
          endDate: 'string',
          targetCount: 'number',
          currentApplications: 'number',
          status: 'string',
          kindergartenId: 'number',
          year: 'number',
          term: 'string',
          createdAt: 'string',
          updatedAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证创建后的默认状态
        expect(result.data.status).toBe('draft')
        expect(result.data.currentApplications).toBe(0)
        expect(result.data.id).toBeGreaterThan(0)

        // 6. 验证业务逻辑一致性
        expect(result.data.startDate).toBe(planData.startDate)
        expect(result.data.endDate).toBe(planData.endDate)
        expect(result.data.targetCount).toBe(planData.targetCount)
        expect(result.data.kindergartenId).toBe(planData.kindergartenId)
      })

      it('应该正确处理创建参数验证错误', async () => {
        const invalidPlanData = {
          name: '', // 空名称
          startDate: '2024-06-01',
          endDate: '2024-05-01', // 结束时间早于开始时间
          targetCount: -10 // 负数
        }
        const mockResponse = {
          success: false,
          data: null,
          message: '参数验证失败',
          code: 400,
          errors: [
            { field: 'name', message: '名称不能为空' },
            { field: 'endDate', message: '结束时间必须晚于开始时间' },
            { field: 'targetCount', message: '目标人数必须大于0' }
          ]
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await createEnrollmentPlan(invalidPlanData)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(400)
        expect(Array.isArray(result.errors)).toBe(true)
        expect(result.errors.length).toBe(3)
      })
    })

    describe('updateEnrollmentPlan', () => {
      it('应该正确调用更新招生计划接口', async () => {
        const planId = 1
        const updateData = { targetCount: 250, status: 'active' }
        const mockResponse = {
          data: {
            id: planId,
            name: '2023年秋季招生计划',
            ...updateData
          }
        }
        mockPut.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanFormData.mockReturnValue(updateData)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await updateEnrollmentPlan(planId, updateData)

        expect(mockTransform.transformEnrollmentPlanFormData).toHaveBeenCalledWith(updateData)
        expect(mockPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}`, updateData)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteEnrollmentPlan', () => {
      it('应该正确调用删除招生计划接口', async () => {
        const planId = 1
        const mockResponse = { success: true }
        mockDel.mockResolvedValue(mockResponse)

        const result = await deleteEnrollmentPlan(planId)

        expect(mockDel).toHaveBeenCalledWith(`/enrollment-plans/${planId}`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('名额管理', () => {
    describe('getEnrollmentPlanQuotas', () => {
      it('应该正确调用获取招生计划名额接口', async () => {
        const planId = 1
        const mockResponse = {
          data: [
            { id: 1, className: '小班1班', quota: 30, used: 25 },
            { id: 2, className: '小班2班', quota: 30, used: 20 }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlanQuotas(planId)

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, { 
          params: { planId } 
        })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateEnrollmentPlanQuotas', () => {
      it('应该正确调用更新招生计划名额接口', async () => {
        const planId = 1
        const quotaData = [
          { classId: 1, quota: 35 },
          { classId: 2, quota: 25 }
        ]
        const mockResponse = { success: true }
        mockPut.mockResolvedValue(mockResponse)

        const result = await updateEnrollmentPlanQuotas(planId, quotaData)

        expect(mockPut).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, {
          planId,
          ...quotaData
        })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getQuotaUsageHistory', () => {
      it('应该正确调用获取名额使用历史接口', async () => {
        const planId = 1
        const params = { page: 1, pageSize: 10 }
        const mockResponse = {
          data: [
            { date: '2023-06-01', action: '增加名额', amount: 5, operator: 'admin' }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getQuotaUsageHistory(planId, params)

        expect(mockGet).toHaveBeenCalledWith(`/api/enrollment-plans/${planId}/quota-usage-history`, params)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('计划状态管理', () => {
    describe('publishEnrollmentPlan', () => {
      it('应该正确调用发布招生计划接口', async () => {
        const planId = 1
        const mockResponse = { success: true, message: '计划已发布' }
        mockPut.mockResolvedValue(mockResponse)

        const result = await publishEnrollmentPlan(planId)

        expect(mockPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}/publish`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('cancelEnrollmentPlan', () => {
      it('应该正确调用取消招生计划接口', async () => {
        const planId = 1
        const mockResponse = { success: true, message: '计划已取消' }
        mockPut.mockResolvedValue(mockResponse)

        const result = await cancelEnrollmentPlan(planId)

        expect(mockPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}/cancel`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('completeEnrollmentPlan', () => {
      it('应该正确调用完成招生计划接口', async () => {
        const planId = 1
        const mockResponse = { success: true, message: '计划已完成' }
        mockPut.mockResolvedValue(mockResponse)

        const result = await completeEnrollmentPlan(planId)

        expect(mockPut).toHaveBeenCalledWith(`/enrollment-plans/${planId}/complete`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateEnrollmentPlanStatus', () => {
      it('应该正确调用更新招生计划状态接口', async () => {
        const planId = 1
        const status = 2
        const mockResponse = { success: true }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await updateEnrollmentPlanStatus(planId, status)

        expect(mockRequest.put).toHaveBeenCalledWith(`/enrollment-plans/${planId}/status`, { status })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('数据分析', () => {
    describe('getEnrollmentAnalytics', () => {
      it('应该正确调用获取招生数据分析接口', async () => {
        const params = {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          planId: '1'
        }
        const mockResponse = {
          data: {
            totalApplications: 150,
            conversionRate: 0.75,
            trend: '+15%'
          }
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentAnalytics(params)

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.ANALYTICS, { params })
        expect(result).toEqual(mockResponse)
      })

      it('应该在不传参数时调用数据分析接口', async () => {
        const mockResponse = { data: {} }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentAnalytics()

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.ANALYTICS, { params: undefined })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getEnrollmentPlanStatistics', () => {
      it('应该正确调用获取招生计划统计接口', async () => {
        const planId = 1
        const mockResponse = {
          data: {
            totalApplications: 120,
            approvedApplications: 100,
            rejectedApplications: 20,
            completionRate: 0.83
          }
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlanStatistics(planId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}/statistics`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getEnrollmentPlanOverview', () => {
      it('应该正确调用获取招生计划概览接口并进行严格验证', async () => {
        const mockResponse = {
          success: true,
          data: {
            totalPlans: 5,
            activePlans: 2,
            draftPlans: 1,
            completedPlans: 2,
            cancelledPlans: 0,
            totalTargets: 500,
            totalApplications: 350,
            approvedApplications: 280,
            pendingApplications: 60,
            rejectedApplications: 10,
            averageConversionRate: 0.8,
            enrollmentRate: 0.7,
            monthlyStats: [
              { month: '2023-01', applications: 45, approvals: 38 },
              { month: '2023-02', applications: 52, approvals: 44 },
              { month: '2023-03', applications: 38, approvals: 32 }
            ],
            ageDistribution: [
              { ageGroup: '3-4岁', count: 120, percentage: 34.3 },
              { ageGroup: '4-5岁', count: 150, percentage: 42.9 },
              { ageGroup: '5-6岁', count: 80, percentage: 22.8 }
            ]
          },
          message: '获取成功'
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlanOverview()

        // 1. 验证API调用
        expect(mockGet).toHaveBeenCalledWith('/enrollment-plans/overview')

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证统计数据必填字段
        const requiredFields = [
          'totalPlans', 'activePlans', 'completedPlans', 'totalTargets',
          'totalApplications', 'approvedApplications', 'averageConversionRate',
          'enrollmentRate', 'monthlyStats', 'ageDistribution'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          totalPlans: 'number',
          activePlans: 'number',
          draftPlans: 'number',
          completedPlans: 'number',
          cancelledPlans: 'number',
          totalTargets: 'number',
          totalApplications: 'number',
          approvedApplications: 'number',
          pendingApplications: 'number',
          rejectedApplications: 'number',
          averageConversionRate: 'number',
          enrollmentRate: 'number',
          monthlyStats: 'array',
          ageDistribution: 'array'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证数值范围和逻辑一致性
        expect(result.data.totalPlans).toBeGreaterThan(0)
        expect(result.data.totalTargets).toBeGreaterThan(0)
        expect(result.data.totalApplications).toBeGreaterThanOrEqual(0)
        expect(result.data.averageConversionRate).toBeGreaterThanOrEqual(0)
        expect(result.data.averageConversionRate).toBeLessThanOrEqual(1)
        expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0)
        expect(result.data.enrollmentRate).toBeLessThanOrEqual(1)

        // 6. 验证统计数据逻辑
        const planStatusSum = result.data.activePlans + result.data.draftPlans +
                            result.data.completedPlans + result.data.cancelledPlans
        expect(planStatusSum).toBe(result.data.totalPlans)

        const applicationStatusSum = result.data.approvedApplications +
                                   result.data.pendingApplications +
                                   result.data.rejectedApplications
        expect(applicationStatusSum).toBeLessThanOrEqual(result.data.totalApplications)

        // 7. 验证月度统计数据
        if (result.data.monthlyStats && result.data.monthlyStats.length > 0) {
          const monthRequiredFields = ['month', 'applications', 'approvals']
          const monthValidation = validateRequiredFields(result.data.monthlyStats[0], monthRequiredFields)
          expect(monthValidation.valid).toBe(true)

          const monthTypeValidation = validateFieldTypes(result.data.monthlyStats[0], {
            month: 'string',
            applications: 'number',
            approvals: 'number'
          })
          expect(monthTypeValidation.valid).toBe(true)

          // 验证月度逻辑
          expect(result.data.monthlyStats[0].applications).toBeGreaterThanOrEqual(0)
          expect(result.data.monthlyStats[0].approvals).toBeGreaterThanOrEqual(0)
          expect(result.data.monthlyStats[0].approvals).toBeLessThanOrEqual(result.data.monthlyStats[0].applications)
        }

        // 8. 验证年龄分布数据
        if (result.data.ageDistribution && result.data.ageDistribution.length > 0) {
          const ageRequiredFields = ['ageGroup', 'count', 'percentage']
          const ageValidation = validateRequiredFields(result.data.ageDistribution[0], ageRequiredFields)
          expect(ageValidation.valid).toBe(true)

          const ageTypeValidation = validateFieldTypes(result.data.ageDistribution[0], {
            ageGroup: 'string',
            count: 'number',
            percentage: 'number'
          })
          expect(ageTypeValidation.valid).toBe(true)

          // 验证百分比逻辑
          const totalPercentage = result.data.ageDistribution.reduce((sum: number, item: any) => sum + item.percentage, 0)
          expect(totalPercentage).toBeCloseTo(100, 1) // 允许小数点误差
        }
      })
    })

    describe('getAllEnrollmentPlanStatistics', () => {
      it('应该正确调用获取所有招生计划统计接口', async () => {
        const mockResponse = {
          data: {
            summary: {
              totalPlans: 10,
              totalApplications: 500,
              averageConversionRate: 0.7
            },
            byYear: [
              { year: 2023, plans: 5, applications: 300 },
              { year: 2024, plans: 5, applications: 200 }
            ]
          }
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getAllEnrollmentPlanStatistics()

        expect(mockGet).toHaveBeenCalledWith('/enrollment-plans/all-statistics')
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('班级和负责人管理', () => {
    describe('getEnrollmentPlanClasses', () => {
      it('应该正确调用获取招生计划班级接口', async () => {
        const planId = 1
        const mockResponse = {
          data: [
            { id: 1, name: '小班1班', capacity: 30, enrolled: 25 },
            { id: 2, name: '小班2班', capacity: 30, enrolled: 20 }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlanClasses(planId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}/classes`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('setEnrollmentPlanClasses', () => {
      it('应该正确调用设置招生计划班级接口', async () => {
        const planId = 1
        const classData = {
          classIds: [1, 2, 3],
          quotas: [30, 25, 20]
        }
        const mockResponse = { success: true }
        mockPost.mockResolvedValue(mockResponse)

        const result = await setEnrollmentPlanClasses(planId, classData)

        expect(mockPost).toHaveBeenCalledWith(`/enrollment-plans/${planId}/classes`, classData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('setEnrollmentPlanAssignees', () => {
      it('应该正确调用设置招生计划负责人接口', async () => {
        const planId = 1
        const assigneeData = {
          primaryAssigneeId: 1,
          secondaryAssigneeIds: [2, 3]
        }
        const mockResponse = { success: true }
        mockPost.mockResolvedValue(mockResponse)

        const result = await setEnrollmentPlanAssignees(planId, assigneeData)

        expect(mockPost).toHaveBeenCalledWith(`/enrollment-plans/${planId}/assignees`, assigneeData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('跟踪记录管理', () => {
    describe('getEnrollmentPlanTrackings', () => {
      it('应该正确调用获取招生计划跟踪记录接口', async () => {
        const planId = 1
        const mockResponse = {
          data: [
            { id: 1, date: '2023-06-01', action: '电话跟进', result: '家长感兴趣', operator: '张老师' },
            { id: 2, date: '2023-06-05', action: '现场参观', result: '决定报名', operator: '李老师' }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentPlanTrackings(planId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/${planId}/trackings`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('addEnrollmentPlanTracking', () => {
      it('应该正确调用添加招生计划跟踪记录接口', async () => {
        const planId = 1
        const trackingData = {
          action: '微信沟通',
          result: '发送资料',
          nextFollowUp: '2023-06-10'
        }
        const mockResponse = {
          data: { id: 3, ...trackingData, planId }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await addEnrollmentPlanTracking(planId, trackingData)

        expect(mockPost).toHaveBeenCalledWith(`/enrollment-plans/${planId}/trackings`, trackingData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('导出功能', () => {
    describe('exportEnrollmentPlanData', () => {
      it('应该正确调用导出招生计划数据接口', async () => {
        const planId = 1
        const options = {
          includeQuotas: true,
          includeApplications: true,
          includeTracking: false
        }
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        mockRequest.get.mockResolvedValue(mockBlob)

        const result = await exportEnrollmentPlanData(planId, options)

        expect(mockRequest.get).toHaveBeenCalledWith(`/enrollment-plans/${planId}/export`, {
          params: { id: planId, ...options },
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })
    })

    describe('exportEnrollmentPlans', () => {
      it('应该正确调用导出招生计划列表接口', async () => {
        const params = { status: 'active', year: 2023 }
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        mockRequest.get.mockResolvedValue(mockBlob)

        const result = await exportEnrollmentPlans(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-plans/export', {
          params,
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })
    })

    describe('copyEnrollmentPlan', () => {
      it('应该正确调用复制招生计划接口', async () => {
        const planId = 1
        const mockResponse = {
          data: {
            id: 4,
            name: '2023年秋季招生计划 (副本)',
            originalId: planId,
            status: 'draft'
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await copyEnrollmentPlan(planId)

        expect(mockPost).toHaveBeenCalledWith(`/enrollment-plans/${planId}/copy`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('enrollmentPlanApi 对象', () => {
    describe('getEnrollmentPlans', () => {
      it('应该正确调用获取招生计划列表接口', async () => {
        const params = { page: 1, pageSize: 10 }
        const mockResponse = {
          data: { plans: mockEnrollmentPlans, total: 3 }
        }
        mockGet.mockResolvedValue(mockResponse)
        mockTransform.transformListResponse.mockReturnValue(mockResponse)

        const result = await enrollmentPlanApi.getEnrollmentPlans(params)

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.BASE, { params })
        expect(mockTransform.transformListResponse).toHaveBeenCalledWith(mockResponse, mockTransform.transformEnrollmentPlanData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getEnrollmentPlanById', () => {
      it('应该正确调用获取招生计划详情接口', async () => {
        const planId = '1'
        const mockResponse = {
          data: mockEnrollmentPlans[0]
        }
        mockGet.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await enrollmentPlanApi.getEnrollmentPlanById(planId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-plans/1`)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createEnrollmentPlan', () => {
      it('应该正确调用创建招生计划接口', async () => {
        const planData = {
          name: '2024年秋季招生计划',
          targetCount: 150
        }
        const mockResponse = {
          data: { id: 4, ...planData }
        }
        mockPost.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanFormData.mockReturnValue(planData)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await enrollmentPlanApi.createEnrollmentPlan(planData)

        expect(mockTransform.transformEnrollmentPlanFormData).toHaveBeenCalledWith(planData)
        expect(mockPost).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_PLAN_ENDPOINTS.BASE, planData)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateEnrollmentPlan', () => {
      it('应该正确调用更新招生计划接口', async () => {
        const planId = '1'
        const updateData = { targetCount: 250 }
        const mockResponse = {
          data: { id: 1, ...updateData }
        }
        mockPut.mockResolvedValue(mockResponse)
        mockTransform.transformEnrollmentPlanFormData.mockReturnValue(updateData)
        mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)

        const result = await enrollmentPlanApi.updateEnrollmentPlan(planId, updateData)

        expect(mockTransform.transformEnrollmentPlanFormData).toHaveBeenCalledWith(updateData)
        expect(mockPut).toHaveBeenCalledWith(`/enrollment-plans/1`, updateData)
        expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteEnrollmentPlan', () => {
      it('应该正确调用删除招生计划接口', async () => {
        const planId = '1'
        const mockResponse = { success: true }
        mockDel.mockResolvedValue(mockResponse)

        const result = await enrollmentPlanApi.deleteEnrollmentPlan(planId)

        expect(mockDel).toHaveBeenCalledWith(`/enrollment-plans/1`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('模拟数据', () => {
    it('应该提供正确的模拟数据结构', () => {
      expect(mockEnrollmentPlans).toBeInstanceOf(Array)
      expect(mockEnrollmentPlans.length).toBe(3)
      
      const firstPlan = mockEnrollmentPlans[0]
      expect(firstPlan).toHaveProperty('id')
      expect(firstPlan).toHaveProperty('name')
      expect(firstPlan).toHaveProperty('startDate')
      expect(firstPlan).toHaveProperty('endDate')
      expect(firstPlan).toHaveProperty('targetCount')
      expect(firstPlan).toHaveProperty('status')
      expect(firstPlan).toHaveProperty('description')
      expect(firstPlan).toHaveProperty('createdAt')
      expect(firstPlan).toHaveProperty('updatedAt')
      expect(firstPlan).toHaveProperty('year')
      expect(firstPlan).toHaveProperty('term')
      expect(firstPlan).toHaveProperty('kindergartenId')
    })

    it('应该包含不同状态的计划', () => {
      const statuses = mockEnrollmentPlans.map(plan => plan.status)
      expect(statuses).toContain('active')
      expect(statuses).toContain('draft')
      expect(statuses).toContain('completed')
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockGet.mockRejectedValue(error)

      await expect(getEnrollmentPlans()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的ID参数', async () => {
      const invalidId = -1
      const mockResponse = { error: '无效的ID', code: 400 }
      mockGet.mockResolvedValue(mockResponse)

      const result = await getEnrollmentPlan(invalidId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空数据响应', async () => {
      mockGet.mockResolvedValue({ data: [], total: 0 })
      mockTransform.transformListResponse.mockReturnValue({ data: [], total: 0 })

      const result = await getEnrollmentPlans()
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('数据转换', () => {
    it('应该正确调用数据转换函数', async () => {
      const planData = { name: '测试计划' }
      const mockResponse = { data: { id: 1, ...planData } }
      
      mockTransform.transformEnrollmentPlanFormData.mockReturnValue(planData)
      mockTransform.transformEnrollmentPlanData.mockReturnValue(mockResponse.data)
      mockPost.mockResolvedValue(mockResponse)

      await createEnrollmentPlan(planData)

      expect(mockTransform.transformEnrollmentPlanFormData).toHaveBeenCalledWith(planData)
      expect(mockTransform.transformEnrollmentPlanData).toHaveBeenCalledWith(mockResponse.data)
    })
  })
})