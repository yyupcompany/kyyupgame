import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response } from 'express'
import { DashboardController } from '/home/zhgue/yyupcc/k.yyup.com/server/src/controllers/dashboard.controller'
import { DashboardService } from '/home/zhgue/yyupcc/k.yyup.com/server/src/services/dashboard/dashboard.service'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/services/dashboard/dashboard.service')

// 控制台错误检测变量
let consoleSpy: any

describe('DashboardController', () => {
  let dashboardController: DashboardController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let dashboardServiceMock: any

  beforeEach(() => {
    dashboardController = new DashboardController()
    dashboardServiceMock = vi.mocked(DashboardService)
    
    mockRequest = {
      user: { id: 1, role: 'admin' },
      query: {},
      body: {}
    }

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    }
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('getDashboardData', () => {
    it('should return dashboard data successfully', async () => {
      const mockDashboardData = {
        statistics: {
          totalStudents: 150,
          totalTeachers: 20,
          totalClasses: 8,
          totalActivities: 12
        },
        recentActivities: [
          { id: 1, title: 'Activity 1', date: '2025-01-14' },
          { id: 2, title: 'Activity 2', date: '2025-01-13' }
        ],
        notifications: [
          { id: 1, message: 'Notification 1', type: 'info' },
          { id: 2, message: 'Notification 2', type: 'warning' }
        ]
      }

      dashboardServiceMock.getDashboardData.mockResolvedValue(mockDashboardData)

      await dashboardController.getDashboardData(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getDashboardData).toHaveBeenCalledWith(mockRequest.user)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDashboardData
      })
    })

    it('should handle errors when getting dashboard data', async () => {
      const error = new Error('Failed to get dashboard data')
      dashboardServiceMock.getDashboardData.mockRejectedValue(error)

      await dashboardController.getDashboardData(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get dashboard data',
        error: error.message
      })
    })

    it('should handle missing user in request', async () => {
      mockRequest.user = undefined

      await dashboardController.getDashboardData(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated'
      })
    })

    it('should handle query parameters for date range', async () => {
      mockRequest.query = {
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      }

      const mockDashboardData = { statistics: {}, recentActivities: [], notifications: [] }
      dashboardServiceMock.getDashboardData.mockResolvedValue(mockDashboardData)

      await dashboardController.getDashboardData(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getDashboardData).toHaveBeenCalledWith(
        mockRequest.user,
        mockRequest.query
      )
    })
  })

  describe('getStatistics', () => {
    it('should return statistics data successfully', async () => {
      const mockStatistics = {
        enrollmentStats: {
          total: 50,
          pending: 10,
          approved: 35,
          rejected: 5
        },
        classStats: {
          total: 10,
          active: 8,
          inactive: 2
        },
        financialStats: {
          revenue: 500000,
          expenses: 300000,
          profit: 200000
        }
      }

      dashboardServiceMock.getStatistics.mockResolvedValue(mockStatistics)

      await dashboardController.getStatistics(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getStatistics).toHaveBeenCalledWith(mockRequest.user)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics
      })
    })

    it('should handle errors when getting statistics', async () => {
      const error = new Error('Failed to get statistics')
      dashboardServiceMock.getStatistics.mockRejectedValue(error)

      await dashboardController.getStatistics(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      })
    })
  })

  describe('getRecentActivities', () => {
    it('should return recent activities successfully', async () => {
      const mockActivities = [
        { id: 1, title: 'Activity 1', date: '2025-01-14', type: 'enrollment' },
        { id: 2, title: 'Activity 2', date: '2025-01-13', type: 'class' }
      ]

      dashboardServiceMock.getRecentActivities.mockResolvedValue(mockActivities)

      await dashboardController.getRecentActivities(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getRecentActivities).toHaveBeenCalledWith(
        mockRequest.user,
        mockRequest.query
      )
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivities
      })
    })

    it('should handle limit parameter', async () => {
      mockRequest.query = { limit: '5' }

      const mockActivities = []
      dashboardServiceMock.getRecentActivities.mockResolvedValue(mockActivities)

      await dashboardController.getRecentActivities(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getRecentActivities).toHaveBeenCalledWith(
        mockRequest.user,
        { limit: '5' }
      )
    })
  })

  describe('getNotifications', () => {
    it('should return notifications successfully', async () => {
      const mockNotifications = [
        { id: 1, message: 'Notification 1', type: 'info', read: false },
        { id: 2, message: 'Notification 2', type: 'warning', read: true }
      ]

      dashboardServiceMock.getNotifications.mockResolvedValue(mockNotifications)

      await dashboardController.getNotifications(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getNotifications).toHaveBeenCalledWith(
        mockRequest.user,
        mockRequest.query
      )
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications
      })
    })

    it('should handle unread filter', async () => {
      mockRequest.query = { unread: 'true' }

      const mockNotifications = []
      dashboardServiceMock.getNotifications.mockResolvedValue(mockNotifications)

      await dashboardController.getNotifications(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getNotifications).toHaveBeenCalledWith(
        mockRequest.user,
        { unread: 'true' }
      )
    })
  })

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      mockRequest.params = { id: '1' }

      dashboardServiceMock.markNotificationAsRead.mockResolvedValue(undefined)

      await dashboardController.markNotificationAsRead(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.markNotificationAsRead).toHaveBeenCalledWith(
        mockRequest.user,
        '1'
      )
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marked as read'
      })
    })

    it('should handle invalid notification id', async () => {
      mockRequest.params = { id: 'invalid' }

      await dashboardController.markNotificationAsRead(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid notification ID'
      })
    })

    it('should handle notification not found', async () => {
      mockRequest.params = { id: '999' }

      dashboardServiceMock.markNotificationAsRead.mockResolvedValue(undefined)

      await dashboardController.markNotificationAsRead(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      })
    })
  })

  describe('getQuickActions', () => {
    it('should return quick actions successfully', async () => {
      const mockQuickActions = [
        { id: 1, title: 'Add Student', icon: 'user-plus', action: '/student/create' },
        { id: 2, title: 'Create Activity', icon: 'calendar-plus', action: '/activity/create' }
      ]

      dashboardServiceMock.getQuickActions.mockResolvedValue(mockQuickActions)

      await dashboardController.getQuickActions(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getQuickActions).toHaveBeenCalledWith(mockRequest.user)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuickActions
      })
    })

    it('should handle role-based quick actions', async () => {
      mockRequest.user = { id: 1, role: 'teacher' }

      const mockQuickActions = []
      dashboardServiceMock.getQuickActions.mockResolvedValue(mockQuickActions)

      await dashboardController.getQuickActions(mockRequest as Request, mockResponse as Response)

      expect(dashboardServiceMock.getQuickActions).toHaveBeenCalledWith(mockRequest.user)
    })
  })
})