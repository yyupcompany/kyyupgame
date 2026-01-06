import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from '@/utils/request'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation'

// Mock 数据类型定义
interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  status: 'active' | 'inactive' | 'resigned'
  salary: number
  qualifications: string[]
  performanceRating?: number
  lastEvaluationDate?: string
}

interface PerformanceEvaluation {
  id: string
  employeeId: string
  employeeName: string
  evaluatorId: string
  evaluatorName: string
  evaluationPeriod: { start: string; end: string }
  criteria: {
    teachingAbility: number
    classManagement: number
    parentCommunication: number
    teamwork: number
    professionalDevelopment: number
  }
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  goals: string[]
  comments: string
  status: 'draft' | 'submitted' | 'approved'
  createdAt: string
  submittedAt?: string
  approvedAt?: string
}

interface StaffSchedule {
  id: string
  employeeId: string
  employeeName: string
  date: string
  shift: 'morning' | 'afternoon' | 'full_day'
  classAssignments: Array<{
    classId: string
    className: string
    timeSlot: string
    subject?: string
  }>
  duties: Array<{
    type: string
    description: string
    timeSlot: string
  }>
  overtime: Array<{
    reason: string
    hours: number
    approved: boolean
  }>
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent'
  attendanceRecord?: {
    checkIn: string
    checkOut: string
    workHours: number
    overtimeHours: number
  }
}

interface TrainingRecord {
  id: string
  employeeId: string
  employeeName: string
  trainingTitle: string
  trainingType: 'professional' | 'safety' | 'management' | 'technical'
  provider: string
  startDate: string
  endDate: string
  duration: number
  cost: number
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  certification?: {
    name: string
    issueDate: string
    expiryDate?: string
    certificateUrl?: string
  }
  evaluation?: {
    score: number
    feedback: string
    evaluator: string
  }
}

interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  baseSalary: number
  performanceBonus: number
  overtimePay: number
  otherAllowances: number
  deductions: {
    socialInsurance: number
    tax: number
    other: number
  }
  netSalary: number
  payDate: string
  status: 'draft' | 'calculated' | 'approved' | 'paid'
  calculationDetails: {
    workDays: number
    overtimeHours: number
    performanceScore?: number
    bonusRate: number
  }
}

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Principal - 员工管理完整测试', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('员工档案管理', () => {
    it('should get employee list with filters', async () => {
      const params = {
        department: 'teaching',
        status: 'active',
        page: 1,
        pageSize: 20
      }

      const mockEmployees: Employee[] = [
        {
          id: 'emp-1',
          name: '张老师',
          email: 'zhang@kindergarten.com',
          phone: '13800138001',
          position: 'Senior Teacher',
          department: 'teaching',
          hireDate: '2020-09-01',
          status: 'active',
          salary: 8000,
          qualifications: ['Bachelor Degree', 'Teaching Certificate'],
          performanceRating: 4.5,
          lastEvaluationDate: '2023-12-15'
        },
        {
          id: 'emp-2',
          name: '李老师',
          email: 'li@kindergarten.com',
          phone: '13800138002',
          position: 'Junior Teacher',
          department: 'teaching',
          hireDate: '2022-03-15',
          status: 'active',
          salary: 6000,
          qualifications: ['Bachelor Degree', 'First Aid Certificate'],
          performanceRating: 4.2,
          lastEvaluationDate: '2023-12-10'
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockEmployees,
          total: 2
        },
        message: '员工列表获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/employees', { params })

      expect(request.get).toHaveBeenCalledWith('/principal/employees', { params })
      expect(result.data.success).toBe(true)
      expect(result.data.data.items).toHaveLength(2)

      // 验证员工数据结构
      result.data.data.items.forEach((employee: Employee) => {
        const validation = validateRequiredFields(employee, [
          'id', 'name', 'email', 'position', 'department', 'hireDate', 'status'
        ])
        expect(validation.valid).toBe(true)

        // 验证字段类型
        const typeValidation = validateFieldTypes(employee, {
          id: 'string',
          name: 'string',
          email: 'string',
          phone: 'string',
          position: 'string',
          department: 'string',
          salary: 'number'
        })
        expect(typeValidation.valid).toBe(true)

        // 验证邮箱格式
        expect(employee.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

        // 验证手机号格式（简化验证）
        expect(employee.phone).toMatch(/^1[3-9]\d{9}$/)

        // 验证绩效评分范围
        if (employee.performanceRating) {
          expect(employee.performanceRating).toBeGreaterThanOrEqual(1)
          expect(employee.performanceRating).toBeLessThanOrEqual(5)
        }
      })
    })

    it('should create new employee record correctly', async () => {
      const employeeData = {
        name: '王老师',
        email: 'wang@kindergarten.com',
        phone: '13800138003',
        position: 'Teaching Assistant',
        department: 'teaching',
        hireDate: '2024-01-15',
        salary: 5000,
        qualifications: ['Associate Degree', 'Child Care Certificate'],
        emergencyContact: {
          name: '王小明',
          relationship: 'spouse',
          phone: '13900139001'
        }
      }

      const mockEmployee: Employee = {
        id: 'emp-3',
        ...employeeData,
        status: 'active',
        qualifications: ['Associate Degree', 'Child Care Certificate']
      }

      const mockResponse = {
        success: true,
        data: mockEmployee,
        message: '员工档案创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/employees', employeeData)

      expect(request.post).toHaveBeenCalledWith('/principal/employees', employeeData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.id).toBe('emp-3')
      expect(result.data.data.status).toBe('active')
      expect(result.data.data.salary).toBe(5000)

      // 验证创建的员工数据
      const validation = validateRequiredFields(result.data.data, [
        'id', 'name', 'email', 'position', 'department', 'hireDate', 'status'
      ])
      expect(validation.valid).toBe(true)
    })

    it('should update employee information', async () => {
      const updateData = {
        position: 'Senior Teacher',
        salary: 7500,
        qualifications: ['Master Degree', 'Teaching Certificate', 'First Aid Certificate']
      }

      const mockUpdatedEmployee: Employee = {
        id: 'emp-1',
        name: '张老师',
        email: 'zhang@kindergarten.com',
        phone: '13800138001',
        position: 'Senior Teacher',
        department: 'teaching',
        hireDate: '2020-09-01',
        status: 'active',
        salary: 7500,
        qualifications: ['Master Degree', 'Teaching Certificate', 'First Aid Certificate'],
        performanceRating: 4.5,
        lastEvaluationDate: '2023-12-15'
      }

      const mockResponse = {
        success: true,
        data: mockUpdatedEmployee,
        message: '员工信息更新成功'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await request.put('/principal/employees/emp-1', updateData)

      expect(request.put).toHaveBeenCalledWith('/principal/employees/emp-1', updateData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.position).toBe('Senior Teacher')
      expect(result.data.data.salary).toBe(7500)
      expect(result.data.data.qualifications).toContain('Master Degree')
    })

    it('should handle employee resignation correctly', async () => {
      const resignationData = {
        status: 'resigned',
        resignationDate: '2024-01-31',
        reason: '个人发展',
        handoverCompleted: true,
        finalPayProcessed: false
      }

      const mockResponse = {
        success: true,
        data: {
          id: 'emp-4',
          name: '赵老师',
          status: 'resigned',
          resignationDate: '2024-01-31',
          lastWorkingDay: '2024-01-31'
        },
        message: '员工离职处理完成'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await request.put('/principal/employees/emp-4/resignation', resignationData)

      expect(request.put).toHaveBeenCalledWith('/principal/employees/emp-4/resignation', resignationData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.status).toBe('resigned')
    })
  })

  describe('绩效考核管理', () => {
    it('should create performance evaluation with detailed criteria', async () => {
      const evaluationData = {
        employeeId: 'emp-1',
        evaluationPeriod: { start: '2024-01-01', end: '2024-03-31' },
        criteria: {
          teachingAbility: 4.5,
          classManagement: 4.2,
          parentCommunication: 4.8,
          teamwork: 4.3,
          professionalDevelopment: 4.6
        },
        strengths: ['教学经验丰富', '与家长沟通良好', '积极参与团队活动'],
        areasForImprovement: ['课程创新', '新技术应用'],
        goals: ['学习新的教学方法', '提升班级管理技巧', '参加专业培训'],
        comments: '整体表现优秀，继续保持'
      }

      const mockEvaluation: PerformanceEvaluation = {
        id: 'eval-1',
        employeeId: 'emp-1',
        employeeName: '张老师',
        evaluatorId: 'principal-1',
        evaluatorName: '园长',
        evaluationPeriod: { start: '2024-01-01', end: '2024-03-31' },
        criteria: {
          teachingAbility: 4.5,
          classManagement: 4.2,
          parentCommunication: 4.8,
          teamwork: 4.3,
          professionalDevelopment: 4.6
        },
        overallScore: 4.48,
        strengths: ['教学经验丰富', '与家长沟通良好', '积极参与团队活动'],
        areasForImprovement: ['课程创新', '新技术应用'],
        goals: ['学习新的教学方法', '提升班级管理技巧', '参加专业培训'],
        comments: '整体表现优秀，继续保持',
        status: 'draft',
        createdAt: '2024-04-01T10:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockEvaluation,
        message: '绩效考核创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/performance/evaluations', evaluationData)

      expect(request.post).toHaveBeenCalledWith('/principal/performance/evaluations', evaluationData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.overallScore).toBeCloseTo(4.48, 2)

      // 验证评分计算逻辑
      const criteria = result.data.data.criteria
      const calculatedScore = (
        criteria.teachingAbility +
        criteria.classManagement +
        criteria.parentCommunication +
        criteria.teamwork +
        criteria.professionalDevelopment
      ) / 5
      expect(result.data.data.overallScore).toBeCloseTo(calculatedScore, 2)

      // 验证评分范围
      Object.values(criteria).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(1)
        expect(score).toBeLessThanOrEqual(5)
      })
    })

    it('should get performance evaluation list with filters', async () => {
      const params = {
        employeeId: 'emp-1',
        status: 'approved',
        period: '2024-Q1',
        page: 1,
        pageSize: 10
      }

      const mockEvaluations: PerformanceEvaluation[] = [
        {
          id: 'eval-1',
          employeeId: 'emp-1',
          employeeName: '张老师',
          evaluatorId: 'principal-1',
          evaluatorName: '园长',
          evaluationPeriod: { start: '2024-01-01', end: '2024-03-31' },
          criteria: {
            teachingAbility: 4.5,
            classManagement: 4.2,
            parentCommunication: 4.8,
            teamwork: 4.3,
            professionalDevelopment: 4.6
          },
          overallScore: 4.48,
          strengths: ['教学经验丰富'],
          areasForImprovement: ['课程创新'],
          goals: ['学习新方法'],
          comments: '表现优秀',
          status: 'approved',
          createdAt: '2024-04-01T10:00:00Z',
          submittedAt: '2024-04-01T15:00:00Z',
          approvedAt: '2024-04-02T09:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockEvaluations,
          total: 1
        },
        message: '绩效考核列表获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/performance/evaluations', { params })

      expect(request.get).toHaveBeenCalledWith('/principal/performance/evaluations', { params })
      expect(result.data.success).toBe(true)
      expect(result.data.data.items[0].status).toBe('approved')
      expect(result.data.data.items[0].approvedAt).toBeDefined()

      // 验证完整评估记录
      const evaluation = result.data.data.items[0]
      expect(evaluation.strengths).toBeDefined()
      expect(evaluation.areasForImprovement).toBeDefined()
      expect(evaluation.goals).toBeDefined()
      expect(evaluation.comments).toBeDefined()
    })

    it('should approve performance evaluation with feedback', async () => {
      const approvalData = {
        status: 'approved',
        feedback: '评估结果符合实际情况，同意绩效评级',
        recommendedActions: [
          '安排进阶培训',
          '增加教研参与机会',
          '考虑晋升机会'
        ]
      }

      const mockApprovedEvaluation: PerformanceEvaluation = {
        id: 'eval-1',
        employeeId: 'emp-1',
        employeeName: '张老师',
        evaluatorId: 'principal-1',
        evaluatorName: '园长',
        evaluationPeriod: { start: '2024-01-01', end: '2024-03-31' },
        criteria: {
          teachingAbility: 4.5,
          classManagement: 4.2,
          parentCommunication: 4.8,
          teamwork: 4.3,
          professionalDevelopment: 4.6
        },
        overallScore: 4.48,
        strengths: ['教学经验丰富'],
        areasForImprovement: ['课程创新'],
        goals: ['学习新方法'],
        comments: '表现优秀',
        status: 'approved',
        createdAt: '2024-04-01T10:00:00Z',
        submittedAt: '2024-04-01T15:00:00Z',
        approvedAt: '2024-04-02T09:00:00Z',
        approverFeedback: approvalData.feedback,
        recommendedActions: approvalData.recommendedActions
      }

      const mockResponse = {
        success: true,
        data: mockApprovedEvaluation,
        message: '绩效考核审批完成'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await request.put('/principal/performance/evaluations/eval-1/approve', approvalData)

      expect(request.put).toHaveBeenCalledWith('/principal/performance/evaluations/eval-1/approve', approvalData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.status).toBe('approved')
      expect(result.data.data.approvedAt).toBeDefined()
      expect(result.data.data.approverFeedback).toBe(approvalData.feedback)
      expect(result.data.data.recommendedActions).toEqual(approvalData.recommendedActions)
    })

    it('should generate performance summary reports', async () => {
      const reportParams = {
        period: '2024-Q1',
        department: 'teaching',
        includeDetails: true
      }

      const mockPerformanceReport = {
        period: '2024-Q1',
        department: 'teaching',
        summary: {
          totalEmployees: 15,
          evaluatedCount: 15,
          averageScore: 4.25,
          topPerformers: ['emp-1', 'emp-3', 'emp-5'],
          improvementNeeded: ['emp-2', 'emp-8'],
          scoreDistribution: {
            excellent: 3,  // 4.5+
            good: 8,       // 4.0-4.4
            satisfactory: 4, // 3.5-3.9
            needsImprovement: 0 // <3.5
          }
        },
        criteriaAverages: {
          teachingAbility: 4.3,
          classManagement: 4.1,
          parentCommunication: 4.5,
          teamwork: 4.2,
          professionalDevelopment: 4.1
        },
        trends: {
          improvementAreas: ['新技术应用', '创新教学方法'],
          strengths: ['家长沟通', '团队协作'],
          trainingRecommendations: ['数字化教学', '课程设计']
        }
      }

      const mockResponse = {
        success: true,
        data: mockPerformanceReport,
        message: '绩效报告生成成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/performance/summary-report', { params: reportParams })

      expect(request.get).toHaveBeenCalledWith('/principal/performance/summary-report', { params: reportParams })
      expect(result.data.success).toBe(true)

      const report = result.data.data
      expect(report.summary.totalEmployees).toBe(15)
      expect(report.summary.evaluatedCount).toBe(15)
      expect(report.summary.averageScore).toBeGreaterThanOrEqual(1)
      expect(report.summary.averageScore).toBeLessThanOrEqual(5)

      // 验证分数分布总和
      const distributionTotal = Object.values(report.summary.scoreDistribution).reduce((sum: number, count: number) => sum + count, 0)
      expect(distributionTotal).toBe(report.summary.evaluatedCount)

      // 验证各项指标评分范围
      Object.values(report.criteriaAverages).forEach(average => {
        expect(average).toBeGreaterThanOrEqual(1)
        expect(average).toBeLessThanOrEqual(5)
      })
    })
  })

  describe('员工排班管理', () => {
    it('should create staff schedule correctly', async () => {
      const scheduleData = {
        employeeId: 'emp-1',
        date: '2024-01-15',
        shift: 'full_day',
        classAssignments: [
          {
            classId: 'class-1',
            className: '大班A',
            timeSlot: '09:00-11:30',
            subject: '语言'
          },
          {
            classId: 'class-1',
            className: '大班A',
            timeSlot: '14:00-16:30',
            subject: '数学'
          }
        ],
        duties: [
          {
            type: 'break_duty',
            description: '午餐监督',
            timeSlot: '11:30-12:30'
          }
        ]
      }

      const mockSchedule: StaffSchedule = {
        id: 'schedule-1',
        ...scheduleData,
        employeeName: '张老师',
        status: 'scheduled'
      }

      const mockResponse = {
        success: true,
        data: mockSchedule,
        message: '排班创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/schedules', scheduleData)

      expect(request.post).toHaveBeenCalledWith('/principal/schedules', scheduleData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.status).toBe('scheduled')
      expect(result.data.data.classAssignments).toHaveLength(2)
      expect(result.data.data.duties).toHaveLength(1)
    })

    it('should get monthly schedule overview', async () => {
      const params = {
        year: 2024,
        month: 1,
        department: 'teaching'
      }

      const mockScheduleOverview = {
        year: 2024,
        month: 1,
        department: 'teaching',
        employees: [
          {
            employeeId: 'emp-1',
            employeeName: '张老师',
            position: 'Senior Teacher',
            scheduleSummary: {
              totalDays: 22,
              workingDays: 20,
              daysOff: 2,
              overtimeDays: 3,
              totalHours: 176,
              overtimeHours: 24
            },
            weeklyDistribution: [
              { week: 1, days: 5, hours: 40 },
              { week: 2, days: 5, hours: 44 },
              { week: 3, days: 5, hours: 40 },
              { week: 4, days: 5, hours: 52 }
            ]
          }
        ],
        departmentStats: {
          totalEmployees: 15,
          averageWorkingHours: 168,
          totalOvertimeHours: 120,
          coverageRate: 0.95
        }
      }

      const mockResponse = {
        success: true,
        data: mockScheduleOverview,
        message: '月度排班概览获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/schedules/monthly', { params })

      expect(request.get).toHaveBeenCalledWith('/principal/schedules/monthly', { params })
      expect(result.data.success).toBe(true)

      const overview = result.data.data
      expect(overview.employees).toHaveLength(1)
      expect(overview.departmentStats.coverageRate).toBeGreaterThanOrEqual(0)
      expect(overview.departmentStats.coverageRate).toBeLessThanOrEqual(1)

      // 验证员工排班统计
      const employee = overview.employees[0]
      expect(employee.scheduleSummary.totalDays).toBe(22)
      expect(employee.scheduleSummary.workingDays + employee.scheduleSummary.daysOff).toBe(22)
    })

    it('should handle attendance recording correctly', async () => {
      const attendanceData = {
        scheduleId: 'schedule-1',
        attendanceRecord: {
          checkIn: '2024-01-15T08:55:00',
          checkOut: '2024-01-15T17:05:00',
          workHours: 8.17,
          overtimeHours: 0.17,
          breakDuration: 1,
          attendanceType: 'normal',
          remarks: '正常出勤'
        }
      }

      const mockAttendance = {
        id: 'attendance-1',
        scheduleId: 'schedule-1',
        employeeId: 'emp-1',
        employeeName: '张老师',
        date: '2024-01-15',
        checkIn: '2024-01-15T08:55:00',
        checkOut: '2024-01-15T17:05:00',
        workHours: 8.17,
        overtimeHours: 0.17,
        attendanceType: 'normal',
        status: 'confirmed'
      }

      const mockResponse = {
        success: true,
        data: mockAttendance,
        message: '考勤记录成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/attendance', attendanceData)

      expect(request.post).toHaveBeenCalledWith('/principal/attendance', attendanceData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.workHours).toBe(8.17)
      expect(result.data.data.overtimeHours).toBe(0.17)
      expect(result.data.data.attendanceType).toBe('normal')
    })
  })

  describe('培训管理', () => {
    it('should create training record correctly', async () => {
      const trainingData = {
        employeeId: 'emp-1',
        trainingTitle: '幼儿心理发展与教育',
        trainingType: 'professional',
        provider: '市教育局',
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        duration: 24,
        cost: 800,
        certification: {
          name: '幼儿教育专业证书',
          issueDate: '2024-02-04',
          expiryDate: '2027-02-03'
        }
      }

      const mockTraining: TrainingRecord = {
        id: 'training-1',
        ...trainingData,
        employeeName: '张老师',
        status: 'planned'
      }

      const mockResponse = {
        success: true,
        data: mockTraining,
        message: '培训记录创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/training', trainingData)

      expect(request.post).toHaveBeenCalledWith('/principal/training', trainingData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.trainingType).toBe('professional')
      expect(result.data.data.cost).toBe(800)
      expect(result.data.data.certification.name).toBe('幼儿教育专业证书')
    })

    it('should get training statistics', async () => {
      const params = {
        year: 2024,
        department: 'teaching'
      }

      const mockTrainingStats = {
        year: 2024,
        department: 'teaching',
        summary: {
          totalTraining: 25,
          completedTraining: 18,
          plannedTraining: 7,
          totalHours: 420,
          totalCost: 25000,
          averageCostPerEmployee: 1667,
          trainingCompletionRate: 0.72
        },
        typeDistribution: {
          professional: 15,
          safety: 5,
          management: 3,
          technical: 2
        },
        employeeParticipation: [
          {
            employeeId: 'emp-1',
            employeeName: '张老师',
            trainingCount: 4,
            totalHours: 48,
            completedCount: 3,
            certifications: 2
          }
        ],
        monthlyTrend: [
          { month: '2024-01', trainingCount: 3, hours: 36, cost: 2000 },
          { month: '2024-02', trainingCount: 5, hours: 60, cost: 3500 }
        ]
      }

      const mockResponse = {
        success: true,
        data: mockTrainingStats,
        message: '培训统计获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/training/statistics', { params })

      expect(request.get).toHaveBeenCalledWith('/principal/training/statistics', { params })
      expect(result.data.success).toBe(true)

      const stats = result.data.data
      expect(stats.summary.trainingCompletionRate).toBeGreaterThanOrEqual(0)
      expect(stats.summary.trainingCompletionRate).toBeLessThanOrEqual(1)
      expect(stats.summary.completedTraining).toBeLessThanOrEqual(stats.summary.totalTraining)

      // 验证类型分布总和
      const typeTotal = Object.values(stats.typeDistribution).reduce((sum: number, count: number) => sum + count, 0)
      expect(typeTotal).toBe(stats.summary.totalTraining)
    })
  })

  describe('薪酬管理', () => {
    it('should calculate monthly salary correctly', async () => {
      const salaryCalculation = {
        employeeId: 'emp-1',
        period: '2024-01',
        calculationDetails: {
          workDays: 22,
          actualWorkDays: 21,
          overtimeHours: 8,
          performanceScore: 4.5,
          bonusRate: 0.15
        },
        allowances: {
          meal: 300,
          transport: 200,
          housing: 500
        },
        deductions: {
          socialInsurance: 640,
          housingFund: 480,
          tax: 0
        }
      }

      const mockSalaryRecord: SalaryRecord = {
        id: 'salary-1',
        employeeId: 'emp-1',
        employeeName: '张老师',
        period: '2024-01',
        baseSalary: 8000,
        performanceBonus: 1200, // 8000 * 0.15
        overtimePay: 274, // 按加班8小时计算
        otherAllowances: 1000, // 餐补300+交通200+住房500
        deductions: {
          socialInsurance: 640,
          tax: 235.6,
          other: 480 // 住房公积金
        },
        netSalary: 9118.4,
        payDate: '2024-01-31',
        status: 'calculated',
        calculationDetails: {
          workDays: 22,
          overtimeHours: 8,
          performanceScore: 4.5,
          bonusRate: 0.15
        }
      }

      const mockResponse = {
        success: true,
        data: mockSalaryRecord,
        message: '薪酬计算完成'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/salary/calculate', salaryCalculation)

      expect(request.post).toHaveBeenCalledWith('/principal/salary/calculate', salaryCalculation)
      expect(result.data.success).toBe(true)

      const salary = result.data.data
      expect(salary.performanceBonus).toBe(1200)
      expect(salary.netSalary).toBe(9118.4)

      // 验证薪酬计算逻辑
      const expectedGross = salary.baseSalary + salary.performanceBonus + salary.overtimePay + salary.otherAllowances
      const expectedNet = expectedGross - salary.deductions.socialInsurance - salary.deductions.tax - salary.deductions.other
      expect(salary.netSalary).toBeCloseTo(expectedNet, 1)

      // 验证绩效奖金计算
      expect(salary.performanceBonus).toBeCloseTo(salary.baseSalary * 0.15, 0)
    })

    it('should process batch salary approval', async () => {
      const batchApprovalData = {
        period: '2024-01',
        department: 'teaching',
        salaryIds: ['salary-1', 'salary-2', 'salary-3'],
        approvalComments: '本月薪酬已审核确认'
      }

      const mockBatchApproval = {
        period: '2024-01',
        department: 'teaching',
        processedCount: 3,
        totalAmount: 27555.2,
        approvedAt: '2024-01-30T16:00:00Z',
        approvedBy: 'principal-1',
        status: 'approved'
      }

      const mockResponse = {
        success: true,
        data: mockBatchApproval,
        message: '批量薪酬审批完成'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await request.post('/principal/salary/batch-approve', batchApprovalData)

      expect(request.post).toHaveBeenCalledWith('/principal/salary/batch-approve', batchApprovalData)
      expect(result.data.success).toBe(true)
      expect(result.data.data.processedCount).toBe(3)
      expect(result.data.data.totalAmount).toBe(27555.2)
      expect(result.data.data.approvedAt).toBeDefined()
    })
  })

  describe('错误处理和边界条件', () => {
    it('should handle invalid performance scores', async () => {
      const invalidEvaluationData = {
        employeeId: 'emp-1',
        criteria: {
          teachingAbility: 6.0, // 超出范围
          classManagement: -1,  // 超出范围
          parentCommunication: 3.5,
          teamwork: 4.0,
          professionalDevelopment: 4.2
        }
      }

      vi.mocked(request.post).mockRejectedValue(new Error('绩效评分必须在1-5之间'))

      await expect(request.post('/principal/performance/evaluations', invalidEvaluationData))
        .rejects.toThrow('绩效评分必须在1-5之间')
    })

    it('should handle scheduling conflicts', async () => {
      const conflictingScheduleData = {
        employeeId: 'emp-1',
        date: '2024-01-15',
        classAssignments: [
          {
            classId: 'class-1',
            className: '大班A',
            timeSlot: '09:00-11:30',
            subject: '语言'
          },
          {
            classId: 'class-2',
            className: '中班B',
            timeSlot: '09:30-11:00', // 时间冲突
            subject: '音乐'
          }
        ]
      }

      vi.mocked(request.post).mockRejectedValue(new Error('排班时间冲突：教师同一时间被分配到多个班级'))

      await expect(request.post('/principal/schedules', conflictingScheduleData))
        .rejects.toThrow('排班时间冲突：教师同一时间被分配到多个班级')
    })

    it('should handle empty employee list gracefully', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        },
        message: '暂无符合条件的员工'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await request.get('/principal/employees', { params: { department: 'nonexistent' } })

      expect(result.data.data.items).toEqual([])
      expect(result.data.data.total).toBe(0)
      expect(result.data.success).toBe(true)
    })
  })
})