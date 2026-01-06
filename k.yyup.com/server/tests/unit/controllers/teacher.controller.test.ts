import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response } from 'express'
import { TeacherController } from '/home/zhgue/yyupcc/k.yyup.com/server/src/controllers/teacher.controller'
import { TeacherService } from '/home/zhgue/yyupcc/k.yyup.com/server/src/services/teacher/teacher.service'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/services/teacher/teacher.service')

// 控制台错误检测变量
let consoleSpy: any

describe('TeacherController', () => {
  let teacherController: TeacherController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let teacherServiceMock: any

  beforeEach(() => {
    teacherController = new TeacherController()
    teacherServiceMock = vi.mocked(TeacherService)
    
    mockRequest = {
      user: { id: 1, role: 'admin' },
      query: {},
      body: {},
      params: {}
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

  describe('getTeachers', () => {
    it('should return teachers list successfully', async () => {
      const mockTeachers = {
        data: [
          {
            id: 1,
            name: '王老师',
            gender: '女',
            subject: '语文',
            experience: 5,
            classes: ['小一班', '小二班'],
            phone: '13800138000',
            email: 'wang@school.com',
            status: 'active'
          },
          {
            id: 2,
            name: '李老师',
            gender: '男',
            subject: '数学',
            experience: 3,
            classes: ['小三班'],
            phone: '13900139000',
            email: 'li@school.com',
            status: 'active'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      }

      teacherServiceMock.getTeachers.mockResolvedValue(mockTeachers)

      await teacherController.getTeachers(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.getTeachers).toHaveBeenCalledWith(mockRequest.query)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTeachers
      })
    })

    it('should handle pagination parameters', async () => {
      mockRequest.query = {
        page: '2',
        pageSize: '20',
        search: '王',
        subject: '语文',
        gender: '女',
        status: 'active',
        experience: '5+'
      }

      const mockTeachers = { data: [], total: 0, page: 2, pageSize: 20 }
      teacherServiceMock.getTeachers.mockResolvedValue(mockTeachers)

      await teacherController.getTeachers(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.getTeachers).toHaveBeenCalledWith(mockRequest.query)
    })

    it('should handle errors when getting teachers', async () => {
      const error = new Error('Failed to get teachers')
      teacherServiceMock.getTeachers.mockRejectedValue(error)

      await teacherController.getTeachers(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get teachers',
        error: error.message
      })
    })
  })

  describe('getTeacherById', () => {
    it('should return teacher by id successfully', async () => {
      const mockTeacher = {
        id: 1,
        name: '王老师',
        gender: '女',
        subject: '语文',
        experience: 5,
        classes: ['小一班', '小二班'],
        phone: '13800138000',
        email: 'wang@school.com',
        status: 'active',
        address: '北京市朝阳区',
        birthDate: '1990-01-01',
        hireDate: '2020-01-01',
        education: '本科',
        certificate: '教师资格证',
        salary: 8000
      }

      mockRequest.params = { id: '1' }
      teacherServiceMock.getTeacherById.mockResolvedValue(mockTeacher)

      await teacherController.getTeacherById(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.getTeacherById).toHaveBeenCalledWith('1')
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTeacher
      })
    })

    it('should handle invalid teacher id', async () => {
      mockRequest.params = { id: 'invalid' }

      await teacherController.getTeacherById(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid teacher ID'
      })
    })

    it('should handle teacher not found', async () => {
      mockRequest.params = { id: '999' }
      teacherServiceMock.getTeacherById.mockResolvedValue(null)

      await teacherController.getTeacherById(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Teacher not found'
      })
    })
  })

  describe('createTeacher', () => {
    it('should create teacher successfully', async () => {
      const teacherData = {
        name: '赵老师',
        gender: '女',
        subject: '英语',
        experience: 2,
        phone: '13700137000',
        email: 'zhao@school.com',
        address: '北京市海淀区',
        birthDate: '1995-01-01',
        education: '本科',
        certificate: '教师资格证',
        salary: 6000
      }

      mockRequest.body = teacherData

      const createdTeacher = {
        id: 3,
        ...teacherData,
        status: 'active',
        hireDate: new Date().toISOString(),
        classes: []
      }

      teacherServiceMock.createTeacher.mockResolvedValue(createdTeacher)

      await teacherController.createTeacher(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.createTeacher).toHaveBeenCalledWith(teacherData)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdTeacher,
        message: 'Teacher created successfully'
      })
    })

    it('should handle validation errors', async () => {
      const invalidTeacherData = {
        name: '', // Invalid: empty name
        gender: 'unknown', // Invalid: not in enum
        subject: '', // Invalid: empty subject
        experience: 'invalid' // Invalid: not a number
      }

      mockRequest.body = invalidTeacherData

      const validationError = new Error('Validation failed')
      teacherServiceMock.createTeacher.mockRejectedValue(validationError)

      await teacherController.createTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: validationError.message
      })
    })

    it('should handle duplicate teacher error', async () => {
      const teacherData = {
        name: '王老师',
        gender: '女',
        subject: '语文',
        phone: '13800138000'
      }

      mockRequest.body = teacherData

      const duplicateError = new Error('Teacher with this email or phone already exists')
      teacherServiceMock.createTeacher.mockRejectedValue(duplicateError)

      await teacherController.createTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(409)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Teacher already exists',
        error: duplicateError.message
      })
    })
  })

  describe('updateTeacher', () => {
    it('should update teacher successfully', async () => {
      const teacherId = '1'
      const updateData = {
        name: '王老师（更新）',
        subject: '语文、数学',
        salary: 8500
      }

      mockRequest.params = { id: teacherId }
      mockRequest.body = updateData

      const updatedTeacher = {
        id: 1,
        name: '王老师（更新）',
        gender: '女',
        subject: '语文、数学',
        experience: 5,
        classes: ['小一班', '小二班'],
        phone: '13800138000',
        email: 'wang@school.com',
        status: 'active',
        salary: 8500
      }

      teacherServiceMock.updateTeacher.mockResolvedValue(updatedTeacher)

      await teacherController.updateTeacher(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.updateTeacher).toHaveBeenCalledWith(teacherId, updateData)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedTeacher,
        message: 'Teacher updated successfully'
      })
    })

    it('should handle invalid teacher id for update', async () => {
      mockRequest.params = { id: 'invalid' }
      mockRequest.body = { name: 'Updated Name' }

      await teacherController.updateTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid teacher ID'
      })
    })

    it('should handle teacher not found for update', async () => {
      mockRequest.params = { id: '999' }
      mockRequest.body = { name: 'Updated Name' }

      teacherServiceMock.updateTeacher.mockResolvedValue(null)

      await teacherController.updateTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Teacher not found'
      })
    })
  })

  describe('deleteTeacher', () => {
    it('should delete teacher successfully', async () => {
      const teacherId = '1'
      mockRequest.params = { id: teacherId }

      teacherServiceMock.deleteTeacher.mockResolvedValue(undefined)

      await teacherController.deleteTeacher(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.deleteTeacher).toHaveBeenCalledWith(teacherId)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Teacher deleted successfully'
      })
    })

    it('should handle invalid teacher id for deletion', async () => {
      mockRequest.params = { id: 'invalid' }

      await teacherController.deleteTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid teacher ID'
      })
    })

    it('should handle teacher not found for deletion', async () => {
      mockRequest.params = { id: '999' }

      teacherServiceMock.deleteTeacher.mockResolvedValue(undefined)

      await teacherController.deleteTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Teacher not found'
      })
    })

    it('should handle constraint violation error', async () => {
      mockRequest.params = { id: '1' }

      const constraintError = new Error('Cannot delete teacher with assigned classes')
      teacherServiceMock.deleteTeacher.mockRejectedValue(constraintError)

      await teacherController.deleteTeacher(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(409)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot delete teacher due to existing assignments',
        error: constraintError.message
      })
    })
  })

  describe('assignTeacherToClass', () => {
    it('should assign teacher to class successfully', async () => {
      const teacherId = '1'
      const classId = '1'

      mockRequest.params = { id: teacherId }
      mockRequest.body = { classId }

      const assignmentResult = {
        teacherId: 1,
        classId: 1,
        className: '小一班',
        assignedAt: new Date().toISOString()
      }

      teacherServiceMock.assignTeacherToClass.mockResolvedValue(assignmentResult)

      await teacherController.assignTeacherToClass(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.assignTeacherToClass).toHaveBeenCalledWith(teacherId, classId)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: assignmentResult,
        message: 'Teacher assigned to class successfully'
      })
    })

    it('should handle invalid parameters for assignment', async () => {
      mockRequest.params = { id: '1' }
      mockRequest.body = { classId: 'invalid' }

      await teacherController.assignTeacherToClass(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid class ID'
      })
    })

    it('should handle assignment conflict', async () => {
      mockRequest.params = { id: '1' }
      mockRequest.body = { classId: '1' }

      const conflictError = new Error('Teacher is already assigned to this class')
      teacherServiceMock.assignTeacherToClass.mockRejectedValue(conflictError)

      await teacherController.assignTeacherToClass(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(409)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Assignment conflict',
        error: conflictError.message
      })
    })
  })

  describe('getTeacherStatistics', () => {
    it('should return teacher statistics successfully', async () => {
      const mockStatistics = {
        totalTeachers: 15,
        maleTeachers: 6,
        femaleTeachers: 9,
        averageExperience: 4.2,
        activeTeachers: 14,
        bySubject: [
          { subject: '语文', count: 5 },
          { subject: '数学', count: 4 },
          { subject: '英语', count: 3 },
          { subject: '其他', count: 3 }
        ],
        byExperience: [
          { range: '0-2年', count: 4 },
          { range: '3-5年', count: 7 },
          { range: '6-10年', count: 3 },
          { range: '10年以上', count: 1 }
        ]
      }

      teacherServiceMock.getTeacherStatistics.mockResolvedValue(mockStatistics)

      await teacherController.getTeacherStatistics(mockRequest as Request, mockResponse as Response)

      expect(teacherServiceMock.getTeacherStatistics).toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics
      })
    })

    it('should handle errors when getting statistics', async () => {
      const error = new Error('Failed to get teacher statistics')
      teacherServiceMock.getTeacherStatistics.mockRejectedValue(error)

      await teacherController.getTeacherStatistics(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get teacher statistics',
        error: error.message
      })
    })
  })
})