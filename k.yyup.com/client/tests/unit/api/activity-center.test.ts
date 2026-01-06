import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { request } from '@/utils/request'
import {
  getActivityOverview,
  getActivityDistribution,
  getActivityTrend,
  getActivities,
  getActivityDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  publishActivity,
  cancelActivity,
  getRegistrations,
  getRegistrationDetail,
  approveRegistration,
  batchApproveRegistrations,
  getActivityAnalytics,
  getActivityReport,
  getParticipationAnalysis,
  getNotifications,
  sendActivityNotification,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate
} from '@/api/activity-center'
import { expectNoConsoleErrors } from '../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validatePaginationStructure,
  validateApiResponseStructure,
  validateStatisticalRanges
} from '../../utils/data-validation'

// Mock request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('Activity Center API - 严格验证', () => {
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

  describe('Activity Overview APIs', () => {
    it('should get activity overview with strict validation', async () => {
      const mockData = {
        success: true,
        data: {
          totalActivities: 10,
          ongoingActivities: 5,
          completedActivities: 3,
          cancelledActivities: 2,
          totalRegistrations: 100,
          approvedRegistrations: 85,
          pendingRegistrations: 10,
          rejectedRegistrations: 5,
          activeParticipants: 80,
          averageParticipationRate: 0.8,
          monthlyTrend: [
            { month: '2024-01', activities: 8, registrations: 75 },
            { month: '2024-02', activities: 12, registrations: 95 },
            { month: '2024-03', activities: 10, registrations: 88 }
          ],
          popularActivityTypes: [
            { type: 'Sports', count: 4, percentage: 40 },
            { type: 'Arts', count: 3, percentage: 30 },
            { type: 'Education', count: 3, percentage: 30 }
          ]
        },
        message: '获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockData)

      const result = await getActivityOverview()

      // 1. 验证API调用
      expect(request.get).toHaveBeenCalledWith('/activity-center/overview')

      // 2. 验证API响应结构
      const apiValidation = validateApiResponseStructure(result)
      expect(apiValidation.valid).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.message).toBe('string')

      // 3. 验证必填字段
      const requiredFields = [
        'totalActivities', 'ongoingActivities', 'completedActivities', 'cancelledActivities',
        'totalRegistrations', 'approvedRegistrations', 'activeParticipants',
        'averageParticipationRate', 'monthlyTrend', 'popularActivityTypes'
      ]
      const fieldValidation = validateRequiredFields(result.data, requiredFields)
      expect(fieldValidation.valid).toBe(true)

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalActivities: 'number',
        ongoingActivities: 'number',
        completedActivities: 'number',
        cancelledActivities: 'number',
        totalRegistrations: 'number',
        approvedRegistrations: 'number',
        pendingRegistrations: 'number',
        rejectedRegistrations: 'number',
        activeParticipants: 'number',
        averageParticipationRate: 'number',
        monthlyTrend: 'array',
        popularActivityTypes: 'array'
      })
      expect(typeValidation.valid).toBe(true)

      // 5. 验证数值范围和逻辑
      expect(result.data.totalActivities).toBeGreaterThan(0)
      expect(result.data.totalRegistrations).toBeGreaterThanOrEqual(0)
      expect(result.data.activeParticipants).toBeGreaterThanOrEqual(0)
      expect(result.data.averageParticipationRate).toBeGreaterThanOrEqual(0)
      expect(result.data.averageParticipationRate).toBeLessThanOrEqual(1)

      // 6. 验证统计逻辑
      const activityStatusSum = result.data.ongoingActivities + result.data.completedActivities + result.data.cancelledActivities
      expect(activityStatusSum).toBe(result.data.totalActivities)

      const registrationStatusSum = result.data.approvedRegistrations + result.data.pendingRegistrations + result.data.rejectedRegistrations
      expect(registrationStatusSum).toBeLessThanOrEqual(result.data.totalRegistrations)

      // 7. 验证月度趋势数据
      if (result.data.monthlyTrend && result.data.monthlyTrend.length > 0) {
        const monthRequiredFields = ['month', 'activities', 'registrations']
        const monthValidation = validateRequiredFields(result.data.monthlyTrend[0], monthRequiredFields)
        expect(monthValidation.valid).toBe(true)

        const monthTypeValidation = validateFieldTypes(result.data.monthlyTrend[0], {
          month: 'string',
          activities: 'number',
          registrations: 'number'
        })
        expect(monthTypeValidation.valid).toBe(true)

        expect(result.data.monthlyTrend[0].activities).toBeGreaterThanOrEqual(0)
        expect(result.data.monthlyTrend[0].registrations).toBeGreaterThanOrEqual(0)
      }

      // 8. 验证活动类型分布
      if (result.data.popularActivityTypes && result.data.popularActivityTypes.length > 0) {
        const typeRequiredFields = ['type', 'count', 'percentage']
        const typeValidation = validateRequiredFields(result.data.popularActivityTypes[0], typeRequiredFields)
        expect(typeValidation.valid).toBe(true)

        const typeTypeValidation = validateFieldTypes(result.data.popularActivityTypes[0], {
          type: 'string',
          count: 'number',
          percentage: 'number'
        })
        expect(typeTypeValidation.valid).toBe(true)

        // 验证百分比逻辑
        const totalPercentage = result.data.popularActivityTypes.reduce((sum: number, item: any) => sum + item.percentage, 0)
        expect(totalPercentage).toBeCloseTo(100, 1) // 允许小数点误差
      }
    })

    it('should get activity distribution', async () => {
      const mockData = {
        byType: [{ name: 'Sports', value: 5 }],
        byStatus: [{ name: 'Active', value: 3 }],
        byMonth: [{ month: '2024-01', count: 2 }]
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivityDistribution()
      expect(request.get).toHaveBeenCalledWith('/activity-center/distribution')
      expect(result).toEqual(mockData)
    })

    it('should get activity trend', async () => {
      const mockData = {
        activities: [{ date: '2024-01-01', count: 2 }],
        registrations: [{ date: '2024-01-01', count: 10 }],
        participants: [{ date: '2024-01-01', count: 8 }]
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivityTrend()
      expect(request.get).toHaveBeenCalledWith('/activity-center/trend')
      expect(result).toEqual(mockData)
    })
  })

  describe('Activity Management APIs', () => {
    it('should get activities with params', async () => {
      const mockData = {
        activities: [
          {
            id: '1',
            title: 'Test Activity',
            status: 'active'
          }
        ],
        total: 1
      }
      
      const params = {
        page: 1,
        pageSize: 10,
        title: 'Test'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivities(params)
      expect(request.get).toHaveBeenCalledWith('/activity-center/activities', { params })
      expect(result).toEqual(mockData)
    })

    it('should get activity detail', async () => {
      const mockData = {
        id: '1',
        title: 'Test Activity',
        description: 'Test Description'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivityDetail('1')
      expect(request.get).toHaveBeenCalledWith('/activity-center/activities/1')
      expect(result).toEqual(mockData)
    })

    it('should create activity', async () => {
      const activityData = {
        title: 'New Activity',
        description: 'New Description'
      }
      
      const mockResponse = { id: '1', ...activityData }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await createActivity(activityData)
      expect(request.post).toHaveBeenCalledWith('/activity-center/activities', activityData)
      expect(result).toEqual(mockResponse)
    })

    it('should update activity', async () => {
      const updateData = {
        title: 'Updated Activity'
      }
      
      const mockResponse = { id: '1', ...updateData }
      
      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })
      
      const result = await updateActivity('1', updateData)
      expect(request.put).toHaveBeenCalledWith('/activity-center/activities/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete activity', async () => {
      vi.mocked(request.delete).mockResolvedValue({ data: { success: true } })
      
      const result = await deleteActivity('1')
      expect(request.delete).toHaveBeenCalledWith('/activity-center/activities/1')
      expect(result).toEqual({ success: true })
    })

    it('should publish activity', async () => {
      const mockResponse = { id: '1', status: 'published' }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await publishActivity('1')
      expect(request.post).toHaveBeenCalledWith('/activity-center/activities/1/publish')
      expect(result).toEqual(mockResponse)
    })

    it('should cancel activity', async () => {
      const mockResponse = { id: '1', status: 'cancelled' }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await cancelActivity('1')
      expect(request.post).toHaveBeenCalledWith('/activity-center/activities/1/cancel')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Registration Management APIs', () => {
    it('should get registrations with params', async () => {
      const mockData = {
        registrations: [
          {
            id: '1',
            studentName: 'John Doe',
            status: 'pending'
          }
        ],
        total: 1
      }
      
      const params = {
        page: 1,
        pageSize: 10,
        activityId: '1'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getRegistrations(params)
      expect(request.get).toHaveBeenCalledWith('/activity-center/registrations', { params })
      expect(result).toEqual(mockData)
    })

    it('should get registration detail', async () => {
      const mockData = {
        id: '1',
        studentName: 'John Doe',
        parentName: 'Jane Doe'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getRegistrationDetail('1')
      expect(request.get).toHaveBeenCalledWith('/activity-center/registrations/1')
      expect(result).toEqual(mockData)
    })

    it('should approve registration', async () => {
      const approveData = {
        status: 'approved',
        remark: 'Good application'
      }
      
      const mockResponse = { id: '1', ...approveData }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await approveRegistration('1', approveData)
      expect(request.post).toHaveBeenCalledWith('/activity-center/registrations/1/approve', approveData)
      expect(result).toEqual(mockResponse)
    })

    it('should batch approve registrations', async () => {
      const ids = ['1', '2', '3']
      const batchData = {
        status: 'approved',
        remark: 'Batch approved'
      }
      
      const mockResponse = { success: true, processed: 3 }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await batchApproveRegistrations(ids, batchData)
      expect(request.post).toHaveBeenCalledWith('/activity-center/registrations/batch-approve', { 
        ids, 
        ...batchData 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Activity Analytics APIs', () => {
    it('should get activity analytics', async () => {
      const mockData = {
        overview: {
          totalParticipants: 100,
          completionRate: 0.85
        },
        participation: {
          byAge: [{ age: '5-6', count: 30 }]
        }
      }
      
      const params = {
        activityId: '1',
        startDate: '2024-01-01'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivityAnalytics(params)
      expect(request.get).toHaveBeenCalledWith('/activity-center/analytics', { params })
      expect(result).toEqual(mockData)
    })

    it('should get activity report', async () => {
      const mockData = {
        reportId: '1',
        activityId: '1',
        data: 'Report content'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getActivityReport('1')
      expect(request.get).toHaveBeenCalledWith('/activity-center/analytics/1/report')
      expect(result).toEqual(mockData)
    })

    it('should get participation analysis', async () => {
      const mockData = {
        totalParticipants: 100,
        averageRating: 4.5
      }
      
      const params = {
        startDate: '2024-01-01',
        type: 'sports'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getParticipationAnalysis(params)
      expect(request.get).toHaveBeenCalledWith('/activity-center/analytics/participation', { params })
      expect(result).toEqual(mockData)
    })
  })

  describe('Notification Management APIs', () => {
    it('should get notifications', async () => {
      const mockData = {
        notifications: [
          {
            id: '1',
            type: 'email',
            title: 'Activity Reminder'
          }
        ],
        total: 1
      }
      
      const params = {
        page: 1,
        pageSize: 10,
        type: 'email'
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getNotifications(params)
      expect(request.get).toHaveBeenCalledWith('/activity-center/notifications', { params })
      expect(result).toEqual(mockData)
    })

    it('should send activity notification', async () => {
      const notificationData = {
        activityId: '1',
        type: 'email',
        title: 'Activity Reminder',
        content: 'Reminder content',
        recipients: ['parent1@email.com']
      }
      
      const mockResponse = { id: '1', ...notificationData }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await sendActivityNotification(notificationData)
      expect(request.post).toHaveBeenCalledWith('/activity-center/notifications/send', notificationData)
      expect(result).toEqual(mockResponse)
    })

    it('should get notification templates', async () => {
      const mockData = {
        templates: [
          {
            id: '1',
            name: 'Activity Reminder',
            type: 'email'
          }
        ]
      }
      
      vi.mocked(request.get).mockResolvedValue({ data: mockData })
      
      const result = await getNotificationTemplates()
      expect(request.get).toHaveBeenCalledWith('/activity-center/notifications/templates')
      expect(result).toEqual(mockData)
    })

    it('should create notification template', async () => {
      const templateData = {
        name: 'New Template',
        type: 'email',
        title: 'Template Title',
        content: 'Template content'
      }
      
      const mockResponse = { id: '1', ...templateData }
      
      vi.mocked(request.post).mockResolvedValue({ data: mockResponse })
      
      const result = await createNotificationTemplate(templateData)
      expect(request.post).toHaveBeenCalledWith('/activity-center/notifications/templates', templateData)
      expect(result).toEqual(mockResponse)
    })

    it('should update notification template', async () => {
      const updateData = {
        name: 'Updated Template'
      }
      
      const mockResponse = { id: '1', ...updateData }
      
      vi.mocked(request.put).mockResolvedValue({ data: mockResponse })
      
      const result = await updateNotificationTemplate('1', updateData)
      expect(request.put).toHaveBeenCalledWith('/activity-center/notifications/templates/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete notification template', async () => {
      vi.mocked(request.delete).mockResolvedValue({ data: { success: true } })
      
      const result = await deleteNotificationTemplate('1')
      expect(request.delete).toHaveBeenCalledWith('/activity-center/notifications/templates/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(request.get).mockRejectedValue(error)
      
      await expect(getActivityOverview()).rejects.toThrow('Network error')
    })

    it('should handle empty responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })
      
      const result = await getActivityOverview()
      expect(result).toBeNull()
    })
  })
})