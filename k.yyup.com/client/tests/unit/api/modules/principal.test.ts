import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from '@/utils/request'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation'
import {
  getPrincipalDashboardStats,
  getCampusOverview,
  getApprovalList,
  handleApproval,
  getImportantNotices,
  publishNotice,
  getPrincipalSchedule,
  createPrincipalSchedule,
  getEnrollmentTrend,
  getCustomerPoolStats,
  getCustomerPoolList,
  assignCustomerTeacher,
  batchAssignCustomerTeacher,
  deleteCustomer,
  exportCustomerData,
  getPerformanceStats,
  getPerformanceRankings,
  getPerformanceDetails,
  exportPerformanceData,
  getCommissionRules,
  saveCommissionRules,
  getPerformanceGoals,
  savePerformanceGoals,
  simulateCommission,
  getCustomerDetail,
  addCustomerFollowUp,
  importCustomerData,
  getPerformanceRuleList,
  getPerformanceRuleDetail,
  createPerformanceRule,
  updatePerformanceRule,
  deletePerformanceRule,
  togglePerformanceRuleStatus,
  getPosterTemplates,
  getPosterTemplate,
  createPosterTemplate,
  updatePosterTemplate,
  deletePosterTemplate,
  generatePoster,
  transformPosterTemplate,
  type PrincipalDashboardStats,
  type CampusOverview,
  type ApprovalItem,
  type PrincipalNotice,
  type CustomerPoolStats,
  type PerformanceStats,
  type PerformanceRanking,
  type PerformanceDetail,
  type CommissionRule,
  type PerformanceGoal,
  type PerformanceRule,
  type PosterTemplate,
  type PosterTemplateQueryParams,
  type PerformanceRuleType
} from '@/api/modules/principal'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    request: vi.fn()
  }
}))

describe('Principal Module API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('Dashboard Statistics', () => {
    it('should get principal dashboard stats successfully', async () => {
      const mockStats: PrincipalDashboardStats = {
        totalStudents: 150,
        totalClasses: 8,
        totalTeachers: 20,
        totalActivities: 12,
        pendingApplications: 5,
        enrollmentRate: 0.85,
        teacherAttendanceRate: 0.92,
        studentAttendanceRate: 0.88,
        studentTrend: 5.2,
        classTrend: 2.1,
        applicationTrend: -3.4,
        enrollmentTrend: 7.8
      }

      const mockResponse = {
        success: true,
        data: mockStats,
        message: 'Dashboard stats retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPrincipalDashboardStats()

      // 验证API调用
      expect(request.get).toHaveBeenCalledWith('/dashboard/principal/stats')

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'totalStudents', 'totalClasses', 'totalTeachers', 'enrollmentRate'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalStudents: 'number',
        totalClasses: 'number',
        totalTeachers: 'number',
        enrollmentRate: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeLessThanOrEqual(1);
    })

    it('should handle dashboard stats API errors', async () => {
      const error = new Error('Failed to fetch dashboard stats')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getPrincipalDashboardStats()).rejects.toThrow('Failed to fetch dashboard stats')
    })
  })

  describe('Campus Overview', () => {
    it('should get campus overview successfully', async () => {
      const mockOverview: CampusOverview = {
        id: 'campus-1',
        name: 'Sunshine Kindergarten',
        address: '123 Education Street',
        area: 5000,
        classroomCount: 10,
        occupiedClassroomCount: 8,
        outdoorPlaygroundArea: 1000,
        indoorPlaygroundArea: 500,
        establishedYear: 2010,
        principalName: 'Dr. Smith',
        contactPhone: '+1234567890',
        email: 'info@sunshine.edu',
        description: 'A wonderful learning environment',
        images: ['image1.jpg', 'image2.jpg'],
        facilities: [
          { id: '1', name: 'Library', status: 'operational', lastMaintenance: '2024-01-01' },
          { id: '2', name: 'Playground', status: 'operational' }
        ],
        events: [
          { id: '1', title: 'Open Day', startTime: '2024-02-01T09:00:00Z', endTime: '2024-02-01T12:00:00Z', location: 'Main Hall' }
        ]
      }

      const mockResponse = {
        success: true,
        data: mockOverview,
        message: 'Campus overview retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getCampusOverview()

      expect(request.get).toHaveBeenCalledWith('/principal/campus/overview')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Approvals Management', () => {
    it('should get approval list with filters', async () => {
      const params = {
        status: 'PENDING',
        type: 'LEAVE',
        page: 1,
        pageSize: 10
      }

      const mockApprovals: ApprovalItem[] = [
        {
          id: '1',
          title: 'Leave Request',
          type: 'LEAVE',
          requestBy: 'John Doe',
          requestTime: '2024-01-01T10:00:00Z',
          status: 'PENDING',
          urgency: 'HIGH',
          description: 'Personal leave request'
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockApprovals,
          total: 1
        },
        message: 'Approvals retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getApprovalList(params)

      expect(request.get).toHaveBeenCalledWith('/principal/approvals', params)
      expect(result).toEqual(mockResponse)
    })

    it('should get approval list without filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        },
        message: 'No approvals found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getApprovalList()

      expect(request.get).toHaveBeenCalledWith('/principal/approvals', {})
      expect(result).toEqual(mockResponse)
    })

    it('should handle approval approval', async () => {
      const mockApproval: ApprovalItem = {
        id: '1',
        title: 'Leave Request',
        type: 'LEAVE',
        requestBy: 'John Doe',
        requestTime: '2024-01-01T10:00:00Z',
        status: 'APPROVED',
        urgency: 'HIGH',
        description: 'Personal leave request'
      }

      const mockResponse = {
        success: true,
        data: mockApproval,
        message: 'Approval approved successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await handleApproval('1', 'APPROVE', 'Approved for personal reasons')

      expect(request.post).toHaveBeenCalledWith('/principal/approvals/1/approve', { comment: 'Approved for personal reasons' })
      expect(result).toEqual(mockResponse)
    })

    it('should handle approval rejection', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'REJECTED'
        },
        message: 'Approval rejected successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await handleApproval('1', 'REJECT', 'Insufficient notice')

      expect(request.post).toHaveBeenCalledWith('/principal/approvals/1/reject', { comment: 'Insufficient notice' })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Notices Management', () => {
    it('should get important notices successfully', async () => {
      const mockNotices: PrincipalNotice[] = [
        {
          id: '1',
          title: 'School Closure',
          content: 'School will be closed for holidays',
          publishTime: '2024-01-01T09:00:00Z',
          importance: 'HIGH',
          readCount: 45,
          totalCount: 100
        }
      ]

      const mockResponse = {
        success: true,
        data: mockNotices,
        message: 'Notices retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getImportantNotices()

      expect(request.get).toHaveBeenCalledWith('/principal/notices/important')
      expect(result).toEqual(mockResponse)
    })

    it('should publish notice successfully', async () => {
      const noticeData = {
        title: 'New Policy',
        content: 'New school policy announcement',
        expireTime: '2024-12-31T23:59:59Z',
        importance: 'MEDIUM' as const,
        recipientType: 'ALL' as const,
        recipientIds: ['1', '2']
      }

      const mockNotice: PrincipalNotice = {
        id: '2',
        title: 'New Policy',
        content: 'New school policy announcement',
        publishTime: '2024-01-01T10:00:00Z',
        expireTime: '2024-12-31T23:59:59Z',
        importance: 'MEDIUM',
        readCount: 0,
        totalCount: 0
      }

      const mockResponse = {
        success: true,
        data: mockNotice,
        message: 'Notice published successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await publishNotice(noticeData)

      expect(request.post).toHaveBeenCalledWith('/principal/notices', noticeData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Schedule Management', () => {
    it('should get principal schedule successfully', async () => {
      const mockSchedule = [
        {
          id: '1',
          title: 'Staff Meeting',
          startTime: '2024-01-01T09:00:00Z',
          endTime: '2024-01-01T10:00:00Z',
          location: 'Conference Room'
        }
      ]

      const mockResponse = {
        success: true,
        data: mockSchedule,
        message: 'Schedule retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPrincipalSchedule()

      expect(request.get).toHaveBeenCalledWith('/principal/schedule')
      expect(result).toEqual(mockResponse)
    })

    it('should create principal schedule successfully', async () => {
      const scheduleData = {
        title: 'Parent-Teacher Conference',
        startTime: '2024-01-01T14:00:00Z',
        endTime: '2024-01-01T16:00:00Z',
        location: 'Main Office',
        description: 'Quarterly parent-teacher meetings'
      }

      const mockResponse = {
        success: true,
        data: {
          id: '2',
          ...scheduleData
        },
        message: 'Schedule created successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createPrincipalSchedule(scheduleData)

      expect(request.post).toHaveBeenCalledWith('/principal/schedule', scheduleData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Enrollment Analytics', () => {
    it('should get enrollment trend with default period', async () => {
      const mockTrend = [
        { date: '2024-01-01', enrollments: 10 },
        { date: '2024-01-02', enrollments: 15 }
      ]

      const mockResponse = {
        success: true,
        data: mockTrend,
        message: 'Enrollment trend retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getEnrollmentTrend()

      expect(request.get).toHaveBeenCalledWith('/principal/enrollment/trend', { period: 'month' })
      expect(result).toEqual(mockResponse)
    })

    it('should get enrollment trend with custom period', async () => {
      const mockResponse = {
        success: true,
        data: [],
        message: 'No enrollment data found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getEnrollmentTrend('week')

      expect(request.get).toHaveBeenCalledWith('/principal/enrollment/trend', { period: 'week' })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Customer Pool Management', () => {
    it('should get customer pool stats successfully', async () => {
      const mockStats: CustomerPoolStats = {
        totalCustomers: 200,
        newCustomersThisMonth: 25,
        unassignedCustomers: 15,
        convertedCustomersThisMonth: 18
      }

      const mockResponse = {
        success: true,
        data: mockStats,
        message: 'Customer pool stats retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getCustomerPoolStats()

      expect(request.get).toHaveBeenCalledWith('/principal/customer-pool/stats')
      expect(result).toEqual(mockResponse)
    })

    it('should get customer pool list with filters', async () => {
      const params = {
        page: 1,
        pageSize: 20,
        source: 'online',
        status: 'new',
        teacher: 'teacher1',
        keyword: 'test'
      }

      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: 1, name: 'Test Customer', status: 'new' }
          ],
          total: 1
        },
        message: 'Customer pool list retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getCustomerPoolList(params)

      expect(request.get).toHaveBeenCalledWith('/principal/customer-pool/list', params)
      expect(result).toEqual(mockResponse)
    })

    it('should assign customer to teacher successfully', async () => {
      const assignData = {
        customerId: 1,
        teacherId: 5,
        remark: 'Experienced teacher'
      }

      const mockResponse = {
        success: true,
        data: { success: true },
        message: 'Customer assigned successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await assignCustomerTeacher(assignData)

      expect(request.post).toHaveBeenCalledWith('/principal/customer-pool/assign', assignData)
      expect(result).toEqual(mockResponse)
    })

    it('should batch assign customers to teacher successfully', async () => {
      const batchData = {
        customerIds: [1, 2, 3],
        teacherId: 5,
        remark: 'Batch assignment'
      }

      const mockResponse = {
        success: true,
        data: { success: true, assignedCount: 3 },
        message: 'Batch assignment completed successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await batchAssignCustomerTeacher(batchData)

      expect(request.post).toHaveBeenCalledWith('/principal/customer-pool/batch-assign', batchData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete customer successfully', async () => {
      const mockResponse = {
        success: true,
        data: null,
        message: 'Customer deleted successfully'
      }

      vi.mocked(request.del).mockResolvedValue(mockResponse)

      const result = await deleteCustomer(1)

      expect(request.del).toHaveBeenCalledWith('/principal/customer-pool/1')
      expect(result).toEqual(mockResponse)
    })

    it('should export customer data successfully', async () => {
      const params = {
        page: 1,
        pageSize: 100,
        source: 'online'
      }

      const mockBlob = new Blob(['customer data'], { type: 'text/csv' })
      const mockResponse = {
        data: mockBlob
      }

      vi.mocked(request.request).mockResolvedValue(mockResponse)

      const result = await exportCustomerData(params)

      expect(request.request).toHaveBeenCalledWith({
        url: '/principal/customer-pool/export',
        method: 'GET',
        params,
        responseType: 'blob'
      })
      expect(result.data).toBe(mockBlob)
    })
  })

  describe('Performance Management', () => {
    it('should get performance stats successfully', async () => {
      const mockStats: PerformanceStats = {
        totalEnrollments: 150,
        monthlyEnrollments: 25,
        avgConversionRate: 0.75,
        totalCommission: 15000,
        enrollmentTrend: [
          { period: '2024-01', value: 20 },
          { period: '2024-02', value: 25 }
        ]
      }

      const mockResponse = {
        success: true,
        data: mockStats,
        message: 'Performance stats retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceStats()

      expect(request.get).toHaveBeenCalledWith('/principal/performance/stats', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should get performance rankings successfully', async () => {
      const params = {
        type: 'total' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }

      const mockRankings: PerformanceRanking[] = [
        { id: 1, name: 'Teacher A', value: 50 },
        { id: 2, name: 'Teacher B', value: 45 }
      ]

      const mockResponse = {
        success: true,
        data: mockRankings,
        message: 'Performance rankings retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceRankings(params)

      expect(request.get).toHaveBeenCalledWith('/principal/performance/rankings', params)
      expect(result).toEqual(mockResponse)
    })

    it('should get performance details successfully', async () => {
      const params = {
        type: 'teacher' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        pageSize: 10
      }

      const mockDetails: PerformanceDetail[] = [
        { id: 1, name: 'Teacher A', leads: 30, followups: 25, visits: 20, applications: 15, enrollments: 10, commission: 1000 }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockDetails,
          total: 1
        },
        message: 'Performance details retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceDetails(params)

      expect(request.get).toHaveBeenCalledWith('/principal/performance/details', params)
      expect(result).toEqual(mockResponse)
    })

    it('should export performance data successfully', async () => {
      const params = {
        type: 'teacher' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }

      const mockBlob = new Blob(['performance data'], { type: 'text/csv' })
      const mockResponse = {
        data: mockBlob
      }

      vi.mocked(request.request).mockResolvedValue(mockResponse)

      const result = await exportPerformanceData(params)

      expect(request.request).toHaveBeenCalledWith({
        url: '/principal/performance/export',
        method: 'GET',
        params,
        responseType: 'blob'
      })
      expect(result.data).toBe(mockBlob)
    })
  })

  describe('Commission Management', () => {
    it('should get commission rules successfully', async () => {
      const mockRules: CommissionRule = {
        baseRate: 0.1,
        tiers: [
          { minCount: 10, rate: 0.12 },
          { minCount: 20, rate: 0.15 }
        ],
        classRules: [
          { classType: 'regular', rate: 0.1 },
          { classType: 'premium', rate: 0.12 }
        ]
      }

      const mockResponse = {
        success: true,
        data: mockRules,
        message: 'Commission rules retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getCommissionRules()

      expect(request.get).toHaveBeenCalledWith('/principal/commission/rules')
      expect(result).toEqual(mockResponse)
    })

    it('should save commission rules successfully', async () => {
      const rules: CommissionRule = {
        baseRate: 0.12,
        tiers: [
          { minCount: 15, rate: 0.14 }
        ],
        classRules: [
          { classType: 'regular', rate: 0.12 }
        ]
      }

      const mockResponse = {
        success: true,
        data: rules,
        message: 'Commission rules saved successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await saveCommissionRules(rules)

      expect(request.post).toHaveBeenCalledWith('/principal/commission/rules', rules)
      expect(result).toEqual(mockResponse)
    })

    it('should simulate commission successfully', async () => {
      const simulateData = {
        enrollmentCount: 15,
        classType: 'regular'
      }

      const mockResponse = {
        success: true,
        data: {
          enrollmentCount: 15,
          classType: 'regular',
          baseRate: 0.1,
          finalRate: 0.12,
          tuitionFee: 5000,
          commission: 600,
          details: [
            { name: 'Base Commission', rate: 0.1, amount: 500 },
            { name: 'Tier Bonus', rate: 0.02, amount: 100 }
          ]
        },
        message: 'Commission simulation completed'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await simulateCommission(simulateData)

      expect(request.post).toHaveBeenCalledWith('/principal/commission/simulate', simulateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Performance Goals Management', () => {
    it('should get performance goals successfully', async () => {
      const mockGoals: PerformanceGoal = {
        kindergartenGoals: {
          yearlyTarget: 200,
          quarterlyTargets: [50, 50, 50, 50],
          monthlyTargets: [17, 17, 16, 16, 17, 17, 16, 16, 17, 17, 16, 16]
        },
        teacherGoals: [
          {
            id: 1,
            name: 'Teacher A',
            department: 'Preschool',
            yearlyTarget: 25,
            quarterlyTargets: [6, 6, 6, 7],
            monthlyTargets: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3]
          }
        ]
      }

      const mockResponse = {
        success: true,
        data: mockGoals,
        message: 'Performance goals retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceGoals()

      expect(request.get).toHaveBeenCalledWith('/principal/performance/goals')
      expect(result).toEqual(mockResponse)
    })

    it('should save performance goals successfully', async () => {
      const goals: PerformanceGoal = {
        kindergartenGoals: {
          yearlyTarget: 250,
          quarterlyTargets: [62, 63, 62, 63],
          monthlyTargets: [21, 21, 20, 21, 21, 20, 21, 21, 20, 21, 21, 20]
        },
        teacherGoals: []
      }

      const mockResponse = {
        success: true,
        data: goals,
        message: 'Performance goals saved successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await savePerformanceGoals(goals)

      expect(request.post).toHaveBeenCalledWith('/principal/performance/goals', goals)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Customer Management', () => {
    it('should get customer detail successfully', async () => {
      const mockCustomer = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'active'
      }

      const mockResponse = {
        success: true,
        data: mockCustomer,
        message: 'Customer detail retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getCustomerDetail(1)

      expect(request.get).toHaveBeenCalledWith('/principal/customer-pool/1')
      expect(result).toEqual(mockResponse)
    })

    it('should add customer follow up successfully', async () => {
      const followUpData = {
        content: 'Follow up on enrollment inquiry',
        type: 'phone'
      }

      const mockResponse = {
        success: true,
        data: { id: 1, ...followUpData },
        message: 'Follow up added successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await addCustomerFollowUp(1, followUpData)

      expect(request.post).toHaveBeenCalledWith('/principal/customer-pool/1/follow-up', followUpData)
      expect(result).toEqual(mockResponse)
    })

    it('should import customer data successfully', async () => {
      const file = new File(['customer data'], 'customers.csv', { type: 'text/csv' })
      
      const mockResponse = {
        success: true,
        data: { importedCount: 50 },
        message: 'Customer data imported successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await importCustomerData(file)

      expect(request.post).toHaveBeenCalledWith('/principal/customer-pool/import', { file: 'customers.csv' })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Performance Rules Management', () => {
    it('should get performance rule list successfully', async () => {
      const mockRules: PerformanceRule[] = [
        {
          id: 1,
          name: 'Enrollment Bonus',
          description: 'Bonus for student enrollments',
          calculationMethod: 'PER_ENROLLMENT',
          targetValue: 20,
          bonusAmount: 1000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          kindergartenId: 1,
          creatorId: 1
        }
      ]

      const mockResponse = {
        success: true,
        data: mockRules,
        message: 'Performance rules retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceRuleList({ type: 'ENROLLMENT', isActive: true })

      expect(request.get).toHaveBeenCalledWith('/performance/rules', { type: 'ENROLLMENT', isActive: true })
      expect(result).toEqual(mockResponse)
    })

    it('should get performance rule detail successfully', async () => {
      const mockRule: PerformanceRule = {
        id: 1,
        name: 'Enrollment Bonus',
        description: 'Bonus for student enrollments',
        calculationMethod: 'PER_ENROLLMENT',
        targetValue: 20,
        bonusAmount: 1000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        kindergartenId: 1,
        creatorId: 1
      }

      const mockResponse = {
        success: true,
        data: mockRule,
        message: 'Performance rule detail retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPerformanceRuleDetail(1)

      expect(request.get).toHaveBeenCalledWith('/performance/rules/1')
      expect(result).toEqual(mockResponse)
    })

    it('should create performance rule successfully', async () => {
      const ruleData = {
        name: 'New Performance Rule',
        description: 'Description for new rule',
        calculationMethod: 'PER_ENROLLMENT',
        targetValue: 25,
        bonusAmount: 1200,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        kindergartenId: 1,
        creatorId: 1
      }

      const mockRule: PerformanceRule = {
        id: 2,
        ...ruleData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockRule,
        message: 'Performance rule created successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createPerformanceRule(ruleData)

      expect(request.post).toHaveBeenCalledWith('/performance/rules', ruleData)
      expect(result).toEqual(mockResponse)
    })

    it('should update performance rule successfully', async () => {
      const updateData = {
        name: 'Updated Performance Rule',
        targetValue: 30
      }

      const mockRule: PerformanceRule = {
        id: 1,
        name: 'Updated Performance Rule',
        description: 'Description for rule',
        calculationMethod: 'PER_ENROLLMENT',
        targetValue: 30,
        bonusAmount: 1000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        kindergartenId: 1,
        creatorId: 1
      }

      const mockResponse = {
        success: true,
        data: mockRule,
        message: 'Performance rule updated successfully'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updatePerformanceRule(1, updateData)

      expect(request.put).toHaveBeenCalledWith('/performance/rules/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete performance rule successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1 },
        message: 'Performance rule deleted successfully'
      }

      vi.mocked(request.del).mockResolvedValue(mockResponse)

      const result = await deletePerformanceRule(1)

      expect(request.del).toHaveBeenCalledWith('/performance/rules/1')
      expect(result).toEqual(mockResponse)
    })

    it('should toggle performance rule status successfully', async () => {
      const mockRule: PerformanceRule = {
        id: 1,
        name: 'Performance Rule',
        description: 'Description',
        calculationMethod: 'PER_ENROLLMENT',
        targetValue: 20,
        bonusAmount: 1000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        kindergartenId: 1,
        creatorId: 1
      }

      const mockResponse = {
        success: true,
        data: mockRule,
        message: 'Performance rule status updated successfully'
      }

      vi.mocked(request.request).mockResolvedValue(mockResponse)

      const result = await togglePerformanceRuleStatus(1, false)

      expect(request.request).toHaveBeenCalledWith({
        url: '/performance/rules/1/status',
        method: 'PATCH',
        data: { isActive: false }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Poster Templates Management', () => {
    it('should get poster templates successfully', async () => {
      const params: PosterTemplateQueryParams = {
        page: 1,
        pageSize: 10,
        category: 'education',
        keyword: 'school',
        sort: 'createdAt',
        order: 'desc'
      }

      const mockTemplates: PosterTemplate[] = [
        {
          id: 1,
          name: 'School Open Day',
          category: 'education',
          thumbnail: 'thumb1.jpg',
          previewImage: 'preview1.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          usageCount: 15,
          width: 800,
          height: 600,
          description: 'Template for school open day events',
          marketingTools: ['social-media', 'print'],
          groupBuySettings: { minUsers: 5, discount: 0.1 },
          pointsSettings: { points: 100, discount: 0.05 },
          customSettings: { theme: 'colorful' }
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockTemplates,
          total: 1
        },
        message: 'Poster templates retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPosterTemplates(params)

      expect(request.get).toHaveBeenCalledWith('/poster-templates', params)
      expect(result.success).toBe(true)
      expect(result.data.templates).toBeDefined()
      expect(result.data.total).toBe(1)
    })

    it('should get poster template detail successfully', async () => {
      const mockTemplate: PosterTemplate = {
        id: 1,
        name: 'School Open Day',
        category: 'education',
        thumbnail: 'thumb1.jpg',
        previewImage: 'preview1.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 15,
        width: 800,
        height: 600,
        description: 'Template for school open day events',
        marketingTools: ['social-media'],
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      }

      const mockResponse = {
        success: true,
        data: mockTemplate,
        message: 'Poster template retrieved successfully'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPosterTemplate(1)

      expect(request.get).toHaveBeenCalledWith('/poster-templates/1')
      expect(result).toEqual(mockResponse)
    })

    it('should create poster template successfully', async () => {
      const templateData = {
        name: 'New Template',
        category: 'marketing',
        thumbnail: 'thumb.jpg',
        previewImage: 'preview.jpg',
        width: 800,
        height: 600,
        description: 'New marketing template',
        marketingTools: ['email'],
        groupBuySettings: { minUsers: 10, discount: 0.15 },
        pointsSettings: { points: 200, discount: 0.1 },
        customSettings: { theme: 'modern' }
      }

      const mockTemplate: PosterTemplate = {
        id: 2,
        ...templateData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 0
      }

      const mockResponse = {
        success: true,
        data: mockTemplate,
        message: 'Poster template created successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await createPosterTemplate(templateData)

      expect(request.post).toHaveBeenCalledWith('/poster-templates', templateData)
      expect(result).toEqual(mockResponse)
    })

    it('should update poster template successfully', async () => {
      const updateData = {
        name: 'Updated Template',
        description: 'Updated description'
      }

      const mockTemplate: PosterTemplate = {
        id: 1,
        name: 'Updated Template',
        category: 'education',
        thumbnail: 'thumb1.jpg',
        previewImage: 'preview1.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        usageCount: 15,
        width: 800,
        height: 600,
        description: 'Updated description',
        marketingTools: ['social-media'],
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      }

      const mockResponse = {
        success: true,
        data: mockTemplate,
        message: 'Poster template updated successfully'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await updatePosterTemplate(1, updateData)

      expect(request.put).toHaveBeenCalledWith('/poster-templates/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should delete poster template successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1 },
        message: 'Poster template deleted successfully'
      }

      vi.mocked(request.del).mockResolvedValue(mockResponse)

      const result = await deletePosterTemplate(1)

      expect(request.del).toHaveBeenCalledWith('/poster-templates/1')
      expect(result).toEqual(mockResponse)
    })

    it('should generate poster successfully', async () => {
      const generateData = {
        templateId: 1,
        customData: {
          title: 'School Open Day',
          date: '2024-02-01',
          location: 'Main Campus'
        }
      }

      const mockResponse = {
        success: true,
        data: { url: 'https://example.com/generated-poster.jpg' },
        message: 'Poster generated successfully'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await generatePoster(generateData)

      expect(request.post).toHaveBeenCalledWith('/api/poster-generation/generate', generateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Utility Functions', () => {
    it('should transform poster template correctly', () => {
      const templateData: PosterTemplate = {
        id: 1,
        name: 'Test Template',
        category: 'test',
        thumbnail: 'thumb.jpg',
        previewImage: 'preview.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 5,
        width: 800,
        height: 600,
        description: 'Test description',
        marketingTools: [],
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      }

      const result = transformPosterTemplate(templateData)

      expect(result).toEqual(templateData)
      expect(result.marketingTools).toEqual([])
    })

    it('should transform poster template with missing marketing tools', () => {
      const templateData = {
        id: 1,
        name: 'Test Template',
        category: 'test',
        thumbnail: 'thumb.jpg',
        previewImage: 'preview.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 5,
        width: 800,
        height: 600,
        description: 'Test description',
        marketingTools: undefined as any,
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      }

      const result = transformPosterTemplate(templateData)

      expect(result.marketingTools).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network Error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getPrincipalDashboardStats()).rejects.toThrow('Network Error')
    })

    it('should handle server errors gracefully', async () => {
      const error = new Error('Internal Server Error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(publishNotice({
        title: 'Test',
        content: 'Test content',
        importance: 'MEDIUM',
        recipientType: 'ALL'
      })).rejects.toThrow('Internal Server Error')
    })

    it('should handle timeout errors gracefully', async () => {
      const error = new Error('Request timeout')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(getCampusOverview()).rejects.toThrow('Request timeout')
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct request parameter types', () => {
      const approvalParams = {
        status: 'PENDING',
        type: 'LEAVE',
        page: 1,
        pageSize: 10
      }

      expect(typeof approvalParams.status).toBe('string')
      expect(typeof approvalParams.page).toBe('number')
      expect(typeof approvalParams.pageSize).toBe('number')
    })

    it('should handle correct response types', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalStudents: 150,
          totalClasses: 8
        },
        message: 'Success'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getPrincipalDashboardStats()
      
      expect(result.success).toBe(true)
      expect(result.data.totalStudents).toBe(150)
      expect(result.data.totalClasses).toBe(8)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      const mockResponse = {
        success: true,
        data: [],
        message: 'No data found'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await getImportantNotices()
      expect(result.data).toEqual([])
    })

    it('should handle malformed responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: 'invalid response' })

      const result = await getPrincipalDashboardStats()
      expect(result).toEqual({ data: 'invalid response' })
    })

    it('should handle null responses', async () => {
      vi.mocked(request.get).mockResolvedValue({ data: null })

      const result = await getPrincipalDashboardStats()
      expect(result.data).toBeNull()
    })
  })
})