import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EnrollmentService } from '/home/zhgue/yyupcc/k.yyup.com/server/src/services/enrollment/enrollment.service'
import { Enrollment } from '/home/zhgue/yyupcc/k.yyup.com/server/src/models/enrollment-application.model'
import { Student } from '/home/zhgue/yyupcc/k.yyup.com/server/src/models/student.model'
import { Class } from '/home/zhgue/yyupcc/k.yyup.com/server/src/models/class.model'
import { Parent } from '/home/zhgue/yyupcc/k.yyup.com/server/src/models/parent.model'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/models/enrollment-application.model')
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/models/student.model')
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/models/class.model')
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/models/parent.model')

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentService', () => {
  let enrollmentService: EnrollmentService
  let mockEnrollmentModel: any
  let mockStudentModel: any
  let mockClassModel: any
  let mockParentModel: any

  beforeEach(() => {
    enrollmentService = new EnrollmentService()
    mockEnrollmentModel = vi.mocked(Enrollment)
    mockStudentModel = vi.mocked(Student)
    mockClassModel = vi.mocked(Class)
    mockParentModel = vi.mocked(Parent)

    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.restoreAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('getEnrollments', () => {
    it('should return enrollments list successfully', async () => {
      const query = {
        page: 1,
        pageSize: 10,
        status: 'pending',
        search: '张'
      }

      const mockEnrollments = {
        rows: [
          {
            id: 1,
            studentName: '张小明',
            parentName: '张父',
            status: 'pending',
            applicationDate: '2025-01-14',
            class: '小一班'
          },
          {
            id: 2,
            studentName: '张小红',
            parentName: '张母',
            status: 'approved',
            applicationDate: '2025-01-13',
            class: '小二班'
          }
        ],
        count: 2
      }

      mockEnrollmentModel.findAndCountAll.mockResolvedValue(mockEnrollments)

      const result = await enrollmentService.getEnrollments(query)

      expect(mockEnrollmentModel.findAndCountAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'pending'
        }),
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.any(Object)
          })
        ]),
        limit: 10,
        offset: 0,
        order: [['applicationDate', 'DESC']]
      })
      expect(result).toEqual({
        data: mockEnrollments.rows,
        total: mockEnrollments.count,
        page: 1,
        pageSize: 10
      })
    })

    it('should handle search functionality', async () => {
      const query = {
        search: '张小明'
      }

      const mockEnrollments = { rows: [], count: 0 }
      mockEnrollmentModel.findAndCountAll.mockResolvedValue(mockEnrollments)

      await enrollmentService.getEnrollments(query)

      expect(mockEnrollmentModel.findAndCountAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          '$or': expect.arrayContaining([
            expect.objectContaining({ studentName: expect.any(Object) }),
            expect.objectContaining({ parentName: expect.any(Object) })
          ])
        }),
        include: expect.any(Array),
        limit: 10,
        offset: 0,
        order: [['applicationDate', 'DESC']]
      })
    })

    it('should handle database error', async () => {
      const query = { page: 1, pageSize: 10 }
      const error = new Error('Database connection failed')

      mockEnrollmentModel.findAndCountAll.mockRejectedValue(error)

      const result = await enrollmentService.getEnrollments(query)

      expect(result).toEqual({
        success: false,
        message: 'Failed to get enrollments',
        error: error.message
      })
    })
  })

  describe('getEnrollmentById', () => {
    it('should return enrollment by id successfully', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        studentName: '张小明',
        parentName: '张父',
        status: 'pending',
        applicationDate: '2025-01-14',
        class: '小一班',
        parentPhone: '13800138000',
        parentEmail: 'zhang@example.com',
        address: '北京市朝阳区',
        notes: '特殊需求：无'
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)

      const result = await enrollmentService.getEnrollmentById(enrollmentId)

      expect(mockEnrollmentModel.findByPk).toHaveBeenCalledWith(enrollmentId, {
        include: expect.any(Array)
      })
      expect(result).toEqual(mockEnrollment)
    })

    it('should handle enrollment not found', async () => {
      const enrollmentId = 999

      mockEnrollmentModel.findByPk.mockResolvedValue(null)

      const result = await enrollmentService.getEnrollmentById(enrollmentId)

      expect(result).toBeNull()
    })

    it('should handle database error', async () => {
      const enrollmentId = 1
      const error = new Error('Database error')

      mockEnrollmentModel.findByPk.mockRejectedValue(error)

      const result = await enrollmentService.getEnrollmentById(enrollmentId)

      expect(result).toEqual({
        success: false,
        message: 'Failed to get enrollment',
        error: error.message
      })
    })
  })

  describe('createEnrollment', () => {
    it('should create enrollment successfully', async () => {
      const enrollmentData = {
        studentName: '王小华',
        parentName: '王父',
        parentPhone: '13700137000',
        parentEmail: 'wang@example.com',
        address: '北京市海淀区',
        classPreference: '小一班',
        dateOfBirth: '2021-01-01',
        gender: '男',
        notes: '无特殊需求'
      }

      const mockCreatedEnrollment = {
        id: 3,
        ...enrollmentData,
        status: 'pending',
        applicationDate: new Date().toISOString()
      }

      mockEnrollmentModel.create.mockResolvedValue(mockCreatedEnrollment)

      const result = await enrollmentService.createEnrollment(enrollmentData)

      expect(mockEnrollmentModel.create).toHaveBeenCalledWith({
        ...enrollmentData,
        status: 'pending'
      })
      expect(result).toEqual(mockCreatedEnrollment)
    })

    it('should handle validation error', async () => {
      const invalidEnrollmentData = {
        studentName: '', // Invalid: empty name
        parentName: '', // Invalid: empty parent name
        parentPhone: 'invalid' // Invalid: invalid phone format
      }

      const validationError = new Error('Validation failed')
      mockEnrollmentModel.create.mockRejectedValue(validationError)

      const result = await enrollmentService.createEnrollment(invalidEnrollmentData)

      expect(result).toEqual({
        success: false,
        message: 'Failed to create enrollment',
        error: validationError.message
      })
    })

    it('should handle duplicate enrollment error', async () => {
      const enrollmentData = {
        studentName: '张小明',
        parentName: '张父',
        parentPhone: '13800138000'
      }

      const duplicateError = new Error('Enrollment with this student and parent already exists')
      mockEnrollmentModel.create.mockRejectedValue(duplicateError)

      const result = await enrollmentService.createEnrollment(enrollmentData)

      expect(result).toEqual({
        success: false,
        message: 'Enrollment already exists',
        error: duplicateError.message
      })
    })
  })

  describe('updateEnrollment', () => {
    it('should update enrollment successfully', async () => {
      const enrollmentId = 1
      const updateData = {
        status: 'approved',
        classAssigned: '小一班',
        notes: '审批通过'
      }

      const mockEnrollment = {
        id: enrollmentId,
        studentName: '张小明',
        parentName: '张父',
        status: 'pending',
        update: vi.fn().mockResolvedValue({
          id: enrollmentId,
          studentName: '张小明',
          parentName: '张父',
          status: 'approved',
          classAssigned: '小一班',
          notes: '审批通过'
        })
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)

      const result = await enrollmentService.updateEnrollment(enrollmentId, updateData)

      expect(mockEnrollmentModel.findByPk).toHaveBeenCalledWith(enrollmentId)
      expect(mockEnrollment.update).toHaveBeenCalledWith(updateData)
      expect(result).toEqual({
        id: enrollmentId,
        studentName: '张小明',
        parentName: '张父',
        status: 'approved',
        classAssigned: '小一班',
        notes: '审批通过'
      })
    })

    it('should handle enrollment not found for update', async () => {
      const enrollmentId = 999
      const updateData = { status: 'approved' }

      mockEnrollmentModel.findByPk.mockResolvedValue(null)

      const result = await enrollmentService.updateEnrollment(enrollmentId, updateData)

      expect(result).toEqual({
        success: false,
        message: 'Enrollment not found'
      })
    })

    it('should handle invalid status transition', async () => {
      const enrollmentId = 1
      const updateData = {
        status: 'approved',
        classAssigned: '小一班'
      }

      const mockEnrollment = {
        id: enrollmentId,
        status: 'rejected',
        update: vi.fn().mockRejectedValue(new Error('Cannot approve rejected enrollment'))
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)

      const result = await enrollmentService.updateEnrollment(enrollmentId, updateData)

      expect(result).toEqual({
        success: false,
        message: 'Invalid status transition',
        error: 'Cannot approve rejected enrollment'
      })
    })
  })

  describe('deleteEnrollment', () => {
    it('should delete enrollment successfully', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        destroy: vi.fn().mockResolvedValue(undefined)
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)

      const result = await enrollmentService.deleteEnrollment(enrollmentId)

      expect(mockEnrollmentModel.findByPk).toHaveBeenCalledWith(enrollmentId)
      expect(mockEnrollment.destroy).toHaveBeenCalled()
      expect(result).toEqual({ success: true, message: 'Enrollment deleted successfully' })
    })

    it('should handle enrollment not found for deletion', async () => {
      const enrollmentId = 999

      mockEnrollmentModel.findByPk.mockResolvedValue(null)

      const result = await enrollmentService.deleteEnrollment(enrollmentId)

      expect(result).toEqual({
        success: false,
        message: 'Enrollment not found'
      })
    })

    it('should handle deletion of approved enrollment', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        status: 'approved',
        destroy: vi.fn().mockRejectedValue(new Error('Cannot delete approved enrollment'))
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)

      const result = await enrollmentService.deleteEnrollment(enrollmentId)

      expect(result).toEqual({
        success: false,
        message: 'Cannot delete approved enrollment',
        error: 'Cannot delete approved enrollment'
      })
    })
  })

  describe('approveEnrollment', () => {
    it('should approve enrollment and create student successfully', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        studentName: '张小明',
        parentName: '张父',
        parentPhone: '13800138000',
        parentEmail: 'zhang@example.com',
        address: '北京市朝阳区',
        classPreference: '小一班',
        dateOfBirth: '2020-01-01',
        gender: '男',
        status: 'pending',
        update: vi.fn().mockResolvedValue({
          id: enrollmentId,
          status: 'approved'
        })
      }

      const mockClass = {
        id: 1,
        name: '小一班',
        capacity: 25,
        currentStudents: 20
      }

      const mockStudent = {
        id: 1,
        name: '张小明',
        classId: 1,
        status: 'active'
      }

      const mockParent = {
        id: 1,
        name: '张父',
        phone: '13800138000',
        email: 'zhang@example.com'
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)
      mockClassModel.findOne.mockResolvedValue(mockClass)
      mockStudentModel.create.mockResolvedValue(mockStudent)
      mockParentModel.create.mockResolvedValue(mockParent)

      const result = await enrollmentService.approveEnrollment(enrollmentId, '小一班')

      expect(mockEnrollmentModel.findByPk).toHaveBeenCalledWith(enrollmentId)
      expect(mockClassModel.findOne).toHaveBeenCalledWith({ where: { name: '小一班' } })
      expect(mockParentModel.create).toHaveBeenCalledWith({
        name: mockEnrollment.parentName,
        phone: mockEnrollment.parentPhone,
        email: mockEnrollment.parentEmail,
        address: mockEnrollment.address
      })
      expect(mockStudentModel.create).toHaveBeenCalledWith({
        name: mockEnrollment.studentName,
        classId: mockClass.id,
        parentId: mockParent.id,
        gender: mockEnrollment.gender,
        dateOfBirth: mockEnrollment.dateOfBirth,
        status: 'active'
      })
      expect(mockEnrollment.update).toHaveBeenCalledWith({
        status: 'approved',
        classAssigned: '小一班',
        approvedAt: expect.any(Date)
      })
      expect(result).toEqual({
        success: true,
        message: 'Enrollment approved and student created successfully',
        student: mockStudent
      })
    })

    it('should handle class not found', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        status: 'pending'
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)
      mockClassModel.findOne.mockResolvedValue(null)

      const result = await enrollmentService.approveEnrollment(enrollmentId, '小一班')

      expect(result).toEqual({
        success: false,
        message: 'Class not found'
      })
    })

    it('should handle class at full capacity', async () => {
      const enrollmentId = 1
      const mockEnrollment = {
        id: enrollmentId,
        status: 'pending'
      }

      const mockClass = {
        id: 1,
        name: '小一班',
        capacity: 25,
        currentStudents: 25
      }

      mockEnrollmentModel.findByPk.mockResolvedValue(mockEnrollment)
      mockClassModel.findOne.mockResolvedValue(mockClass)

      const result = await enrollmentService.approveEnrollment(enrollmentId, '小一班')

      expect(result).toEqual({
        success: false,
        message: 'Class is at full capacity'
      })
    })
  })

  describe('getEnrollmentStatistics', () => {
    it('should return enrollment statistics successfully', async () => {
      const mockStatistics = {
        total: 50,
        pending: 15,
        approved: 25,
        rejected: 10,
        byMonth: [
          { month: '2025-01', count: 20 },
          { month: '2024-12', count: 15 },
          { month: '2024-11', count: 15 }
        ],
        byClass: [
          { className: '小一班', count: 18 },
          { className: '小二班', count: 15 },
          { className: '小三班', count: 17 }
        ]
      }

      mockEnrollmentModel.count.mockResolvedValue(mockStatistics.total)
      mockEnrollmentModel.findAll.mockResolvedValue([]) // Mock for grouped queries

      const result = await enrollmentService.getEnrollmentStatistics()

      expect(result).toEqual(mockStatistics)
    })

    it('should handle database error when getting statistics', async () => {
      const error = new Error('Database error')
      mockEnrollmentModel.count.mockRejectedValue(error)

      const result = await enrollmentService.getEnrollmentStatistics()

      expect(result).toEqual({
        success: false,
        message: 'Failed to get enrollment statistics',
        error: error.message
      })
    })
  })
})