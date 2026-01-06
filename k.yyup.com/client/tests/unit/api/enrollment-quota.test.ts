
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


vi.mock('@/api/modules/enrollment-quota', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/enrollment-quota', () => ({
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
  getEnrollmentQuotas,
  getEnrollmentQuota,
  createEnrollmentQuota,
  batchCreateEnrollmentQuotas,
  updateEnrollmentQuota,
  deleteEnrollmentQuota,
  batchAdjustEnrollmentQuota,
  getQuotasByPlanId,
  allocateEnrollmentQuota,
  getEnrollmentQuotaStatistics,
  allocateQuotaByAge,
  exportEnrollmentQuotas,
  getQuotaAdjustmentHistory,
  mockEnrollmentQuotas
} from '../../../../src/api/enrollment-quota'

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
  ENROLLMENT_QUOTA_ENDPOINTS: {
    BASE: '/enrollment-quotas',
    GET_BY_ID: (id: number) => `/enrollment-quotas/${id}`,
    UPDATE: (id: number) => `/enrollment-quotas/${id}`,
    DELETE: (id: number) => `/enrollment-quotas/${id}`
  },
  API_PREFIX: '/api'
}))

const mockRequest = require('@/utils/request').request
const mockGet = require('@/utils/request').get
const mockPost = require('@/utils/request').post
const mockPut = require('@/utils/request').put
const mockDel = require('@/utils/request').del
const mockEndpoints = require('@/api/endpoints')

describe('招生名额API服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础CRUD操作', () => {
    describe('getEnrollmentQuotas', () => {
      it('应该正确调用获取招生名额列表接口', async () => {
        const params = {
          page: 1,
          pageSize: 10,
          planId: 1,
          className: '小班'
        }
        const mockResponse = {
          data: [
            { id: 1, className: '小班1班', totalQuota: 30, usedQuota: 25 },
            { id: 2, className: '小班2班', totalQuota: 30, usedQuota: 20 }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentQuotas(params)

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, { params })
        expect(result).toEqual(mockResponse)
      })

      it('应该在不传参数时调用获取名额列表接口', async () => {
        const mockResponse = { data: [], total: 0 }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentQuotas()

        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, { params: undefined })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getEnrollmentQuota', () => {
      it('应该正确调用获取招生名额详情接口', async () => {
        const quotaId = 1
        const mockResponse = {
          data: {
            id: quotaId,
            className: '小班1班',
            ageRange: '3-4岁',
            totalQuota: 30,
            usedQuota: 28,
            remainingQuota: 2,
            usageRate: 93.33
          }
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentQuota(quotaId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createEnrollmentQuota', () => {
      it('应该正确调用创建招生名额接口', async () => {
        const quotaData = {
          planId: 1,
          className: '小班3班',
          ageRange: '3-4岁',
          totalQuota: 25
        }
        const mockResponse = {
          data: {
            id: 7,
            ...quotaData,
            usedQuota: 0,
            remainingQuota: 25,
            usageRate: 0
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await createEnrollmentQuota(quotaData)

        expect(mockPost).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, quotaData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('batchCreateEnrollmentQuotas', () => {
      it('应该正确调用批量创建招生名额接口', async () => {
        const batchData = {
          planId: 1,
          quotas: [
            { className: '小班3班', ageRange: '3-4岁', totalQuota: 25 },
            { className: '中班3班', ageRange: '4-5岁', totalQuota: 30 }
          ]
        }
        const mockResponse = {
          data: {
            success: true,
            created: 2,
            quotas: [
              { id: 7, ...batchData.quotas[0] },
              { id: 8, ...batchData.quotas[1] }
            ]
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await batchCreateEnrollmentQuotas(batchData)

        expect(mockPost).toHaveBeenCalledWith('/enrollment-quotas/batch', batchData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateEnrollmentQuota', () => {
      it('应该正确调用更新招生名额接口', async () => {
        const quotaId = 1
        const updateData = {
          totalQuota: 35,
          usedQuota: 30
        }
        const mockResponse = {
          data: {
            id: quotaId,
            className: '小班1班',
            ...updateData,
            remainingQuota: 5,
            usageRate: 85.71
          }
        }
        mockPut.mockResolvedValue(mockResponse)

        const result = await updateEnrollmentQuota(quotaId, updateData)

        expect(mockPut).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}`, updateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteEnrollmentQuota', () => {
      it('应该正确调用删除招生名额接口', async () => {
        const quotaId = 1
        const mockResponse = { success: true, message: '名额删除成功' }
        mockDel.mockResolvedValue(mockResponse)

        const result = await deleteEnrollmentQuota(quotaId)

        expect(mockDel).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('批量操作', () => {
    describe('batchAdjustEnrollmentQuota', () => {
      it('应该正确调用批量调整招生名额接口', async () => {
        const adjustData = {
          planId: 1,
          adjustments: [
            { quotaId: 1, adjustment: 5, reason: '增加名额' },
            { quotaId: 2, adjustment: -3, reason: '减少名额' }
          ]
        }
        const mockResponse = {
          data: {
            success: true,
            adjusted: 2,
            details: [
              { quotaId: 1, oldQuota: 30, newQuota: 35 },
              { quotaId: 2, oldQuota: 30, newQuota: 27 }
            ]
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await batchAdjustEnrollmentQuota(adjustData)

        expect(mockPost).toHaveBeenCalledWith('/enrollment-quotas/batch-adjust', adjustData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('计划相关操作', () => {
    describe('getQuotasByPlanId', () => {
      it('应该正确调用获取计划所有名额接口', async () => {
        const planId = 1
        const mockResponse = {
          data: [
            { id: 1, className: '小班1班', totalQuota: 30, usedQuota: 28 },
            { id: 2, className: '小班2班', totalQuota: 30, usedQuota: 25 },
            { id: 3, className: '中班1班', totalQuota: 35, usedQuota: 32 }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getQuotasByPlanId(planId)

        expect(mockGet).toHaveBeenCalledWith('/enrollment-quotas/by-plan/1')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('allocateEnrollmentQuota', () => {
      it('应该正确调用分配招生名额接口', async () => {
        const allocateData = {
          planId: 1,
          allocations: [
            { classId: 1, quota: 30 },
            { classId: 2, quota: 25 }
          ]
        }
        const mockResponse = {
          data: {
            success: true,
            allocated: 2,
            totalQuota: 55
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await allocateEnrollmentQuota(allocateData)

        expect(mockPost).toHaveBeenCalledWith('/api/enrollment/quotas/allocate', allocateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('allocateQuotaByAge', () => {
      it('应该正确调用按年龄分配名额接口', async () => {
        const planId = 1
        const ageData = {
          ageGroups: [
            { ageRange: '3-4岁', quota: 60 },
            { ageRange: '4-5岁', quota: 70 },
            { ageRange: '5-6岁', quota: 80 }
          ]
        }
        const mockResponse = {
          data: {
            success: true,
            totalQuota: 210,
            allocation: ageData.ageGroups
          }
        }
        mockPost.mockResolvedValue(mockResponse)

        const result = await allocateQuotaByAge(planId, ageData)

        expect(mockPost).toHaveBeenCalledWith('/enrollment-quotas/allocate-by-age/1', ageData)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('统计分析', () => {
    describe('getEnrollmentQuotaStatistics', () => {
      it('应该正确调用获取招生名额统计接口', async () => {
        const planId = 1
        const mockResponse = {
          data: {
            totalQuota: 210,
            usedQuota: 189,
            remainingQuota: 21,
            usageRate: 90.0,
            byClass: [
              { className: '小班1班', totalQuota: 30, usedQuota: 28, usageRate: 93.33 },
              { className: '小班2班', totalQuota: 30, usedQuota: 25, usageRate: 83.33 }
            ],
            byAge: [
              { ageRange: '3-4岁', totalQuota: 60, usedQuota: 53, usageRate: 88.33 },
              { ageRange: '4-5岁', totalQuota: 70, usedQuota: 62, usageRate: 88.57 },
              { ageRange: '5-6岁', totalQuota: 80, usedQuota: 74, usageRate: 92.5 }
            ]
          }
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getEnrollmentQuotaStatistics(planId)

        expect(mockGet).toHaveBeenCalledWith('/enrollment-quotas/statistics', { params: { planId } })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getQuotaAdjustmentHistory', () => {
      it('应该正确调用获取名额调整历史接口', async () => {
        const quotaId = 1
        const mockResponse = {
          data: [
            {
              id: 1,
              quotaId,
              adjustment: 5,
              oldQuota: 25,
              newQuota: 30,
              reason: '增加名额',
              operator: 'admin',
              timestamp: '2023-05-15T10:30:00Z'
            },
            {
              id: 2,
              quotaId,
              adjustment: -2,
              oldQuota: 30,
              newQuota: 28,
              reason: '调整名额',
              operator: 'manager',
              timestamp: '2023-05-16T14:20:00Z'
            }
          ]
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await getQuotaAdjustmentHistory(quotaId)

        expect(mockGet).toHaveBeenCalledWith(`/enrollment-quotas/${quotaId}/adjustment-history`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('导出功能', () => {
    describe('exportEnrollmentQuotas', () => {
      it('应该正确调用导出招生名额数据接口', async () => {
        const planId = 1
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        mockRequest.get.mockResolvedValue(mockBlob)

        const result = await exportEnrollmentQuotas(planId)

        expect(mockRequest.get).toHaveBeenCalledWith('/enrollment-quotas/export', {
          params: { planId },
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })
    })
  })

  describe('模拟数据', () => {
    it('应该提供正确的模拟数据结构', () => {
      expect(mockEnrollmentQuotas).toBeInstanceOf(Array)
      expect(mockEnrollmentQuotas.length).toBe(6)
      
      const firstQuota = mockEnrollmentQuotas[0]
      expect(firstQuota).toHaveProperty('id')
      expect(firstQuota).toHaveProperty('planId')
      expect(firstQuota).toHaveProperty('className')
      expect(firstQuota).toHaveProperty('ageRange')
      expect(firstQuota).toHaveProperty('totalQuota')
      expect(firstQuota).toHaveProperty('usedQuota')
      expect(firstQuota).toHaveProperty('remainingQuota')
      expect(firstQuota).toHaveProperty('usageRate')
      expect(firstQuota).toHaveProperty('lastUpdated')
    })

    it('应该包含所有班级类型', () => {
      const classNames = mockEnrollmentQuotas.map(quota => quota.className)
      expect(classNames).toContain('小班1班')
      expect(classNames).toContain('小班2班')
      expect(classNames).toContain('中班1班')
      expect(classNames).toContain('中班2班')
      expect(classNames).toContain('大班1班')
      expect(classNames).toContain('大班2班')
    })

    it('应该包含所有年龄段', () => {
      const ageRanges = mockEnrollmentQuotas.map(quota => quota.ageRange)
      expect(ageRanges).toContain('3-4岁')
      expect(ageRanges).toContain('4-5岁')
      expect(ageRanges).toContain('5-6岁')
    })

    it('应该正确计算使用率和剩余名额', () => {
      mockEnrollmentQuotas.forEach(quota => {
        expect(quota.remainingQuota).toBe(quota.totalQuota - quota.usedQuota)
        expect(quota.usageRate).toBeCloseTo((quota.usedQuota / quota.totalQuota) * 100, 2)
      })
    })

    it('应该有不同的使用率分布', () => {
      const usageRates = mockEnrollmentQuotas.map(quota => quota.usageRate)
      expect(usageRates.some(rate => rate >= 90)).toBe(true)
      expect(usageRates.some(rate => rate < 90 && rate >= 80)).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockGet.mockRejectedValue(error)

      await expect(getEnrollmentQuotas()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的ID参数', async () => {
      const invalidId = -1
      const mockResponse = { error: '无效的ID', code: 400 }
      mockGet.mockResolvedValue(mockResponse)

      const result = await getEnrollmentQuota(invalidId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空数据响应', async () => {
      mockGet.mockResolvedValue({ data: [], total: 0 })

      const result = await getEnrollmentQuotas()
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('应该正确处理批量操作错误', async () => {
      const batchData = { planId: 1, quotas: [] }
      const mockResponse = { 
        error: '批量创建失败', 
        code: 400,
        details: '名额数据格式错误'
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await batchCreateEnrollmentQuotas(batchData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('参数验证', () => {
    it('应该正确处理各种查询参数组合', async () => {
      const testCases = [
        { planId: 1 },
        { className: '小班' },
        { ageRange: '3-4岁' },
        { page: 1, pageSize: 20 },
        { planId: 1, className: '小班', page: 1, pageSize: 10 }
      ]

      for (const params of testCases) {
        mockGet.mockResolvedValue({ data: [], total: 0 })
        await getEnrollmentQuotas(params)
        expect(mockGet).toHaveBeenCalledWith(mockEndpoints.ENROLLMENT_QUOTA_ENDPOINTS.BASE, { params })
      }
    })

    it('应该正确处理分配操作的参数', async () => {
      const allocateData = {
        planId: 1,
        allocations: [
          { classId: 1, quota: 30 },
          { classId: 2, quota: 25 }
        ]
      }
      mockPost.mockResolvedValue({ success: true })

      await allocateEnrollmentQuota(allocateData)
      expect(mockPost).toHaveBeenCalledWith('/api/enrollment/quotas/allocate', allocateData)
    })

    it('应该正确处理按年龄分配的参数', async () => {
      const planId = 1
      const ageData = {
        ageGroups: [
          { ageRange: '3-4岁', quota: 60 },
          { ageRange: '4-5岁', quota: 70 },
          { ageRange: '5-6岁', quota: 80 }
        ]
      }
      mockPost.mockResolvedValue({ success: true })

      await allocateQuotaByAge(planId, ageData)
      expect(mockPost).toHaveBeenCalledWith('/enrollment-quotas/allocate-by-age/1', ageData)
    })
  })

  describe('数据完整性', () => {
    it('应该确保模拟数据的完整性', () => {
      mockEnrollmentQuotas.forEach((quota, index) => {
        expect(quota.id).toBeGreaterThan(0)
        expect(quota.planId).toBe(1) // 所有名额都属于同一个计划
        expect(quota.className).toBeTruthy()
        expect(quota.ageRange).toBeTruthy()
        expect(quota.totalQuota).toBeGreaterThan(0)
        expect(quota.usedQuota).toBeGreaterThanOrEqual(0)
        expect(quota.usedQuota).toBeLessThanOrEqual(quota.totalQuota)
        expect(quota.remainingQuota).toBe(quota.totalQuota - quota.usedQuota)
        expect(quota.usageRate).toBeGreaterThanOrEqual(0)
        expect(quota.usageRate).toBeLessThanOrEqual(100)
        expect(quota.lastUpdated).toBeTruthy()
      })
    })

    it('应该确保模拟数据的合理性', () => {
      const totalQuota = mockEnrollmentQuotas.reduce((sum, quota) => sum + quota.totalQuota, 0)
      const totalUsed = mockEnrollmentQuotas.reduce((sum, quota) => sum + quota.usedQuota, 0)
      const totalRemaining = mockEnrollmentQuotas.reduce((sum, quota) => sum + quota.remainingQuota, 0)
      
      expect(totalQuota).toBe(210)
      expect(totalUsed).toBe(189)
      expect(totalRemaining).toBe(21)
      expect(totalQuota).toBe(totalUsed + totalRemaining)
    })
  })
})