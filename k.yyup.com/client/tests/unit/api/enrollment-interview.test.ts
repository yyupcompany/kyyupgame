import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getInterviewList,
  getInterviewDetail,
  createInterview,
  updateInterview,
  deleteInterview,
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
  submitInterviewEvaluation,
  getInterviewStatistics,
  getInterviewCalendar,
  getInterviewRooms,
  assignInterviewer,
  getInterviewEvaluation,
  exportInterviewReport,
  generateInterviewScore,
  interviewApi,
  mockInterviewData,
  mockEvaluationCriteria,
  mockInterviewRooms,
  mockInterviewers
} from '@/api/enrollment-interview'
import { expectNoConsoleErrors } from '../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validatePaginationStructure,
  validateApiResponseStructure,
  validateStatisticalRanges
} from '../utils/data-validation'

// Mock request utility
const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('@/utils/request', () => ({
  request: mockRequest,
  get: mockRequest.get,
  post: mockRequest.post,
  put: mockRequest.put,
  delete: mockRequest.delete
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  INTERVIEW_ENDPOINTS: {
    BASE: '/api/interviews',
    DETAIL: (id: string) => `/api/interviews/${id}`,
    UPDATE: (id: string) => `/api/interviews/${id}`,
    DELETE: (id: string) => `/api/interviews/${id}`,
    SCHEDULE: '/api/interviews/schedule',
    RESCHEDULE: (id: string) => `/api/interviews/${id}/reschedule`,
    CANCEL: (id: string) => `/api/interviews/${id}/cancel`,
    COMPLETE: (id: string) => `/api/interviews/${id}/complete`,
    EVALUATION: (id: string) => `/api/interviews/${id}/evaluation`,
    STATISTICS: '/api/interviews/statistics',
    CALENDAR: '/api/interviews/calendar',
    ROOMS: '/api/interviews/rooms',
    ASSIGNER: (id: string) => `/api/interviews/${id}/assign`,
    EXPORT: '/api/interviews/export',
    SCORE: '/api/interviews/score'
  }
}))

describe('面试管理API服务 - 100%完整测试覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('基础CRUD操作', () => {
    describe('getInterviewList', () => {
      it('应该正确调用获取面试列表接口并进行严格验证', async () => {
        const params = { page: 1, pageSize: 10, status: 'scheduled', date: '2024-01-15' }
        const mockResponse = {
          success: true,
          data: {
            items: [
              {
                id: '1',
                applicationId: 'app_001',
                studentName: '张小明',
                studentAge: 4,
                parentName: '张大明',
                parentPhone: '13800138000',
                interviewDate: '2024-01-15T10:00:00Z',
                interviewTime: '10:00-11:00',
                interviewRoom: '会议室A',
                interviewerId: 'interviewer_001',
                interviewerName: '李老师',
                status: 'scheduled',
                evaluationScore: null,
                createdAt: '2024-01-10T09:00:00Z',
                updatedAt: '2024-01-10T09:00:00Z'
              },
              {
                id: '2',
                applicationId: 'app_002',
                studentName: '李小红',
                studentAge: 5,
                parentName: '李小华',
                parentPhone: '13800138001',
                interviewDate: '2024-01-15T11:00:00Z',
                interviewTime: '11:00-12:00',
                interviewRoom: '会议室B',
                interviewerId: 'interviewer_002',
                interviewerName: '王老师',
                status: 'completed',
                evaluationScore: 85,
                createdAt: '2024-01-09T14:30:00Z',
                updatedAt: '2024-01-15T12:00:00Z'
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewList(params)

        // 1. 验证API调用参数
        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews', { params })

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
          const requiredFields = [
            'id', 'applicationId', 'studentName', 'studentAge', 'parentName', 'parentPhone',
            'interviewDate', 'interviewTime', 'interviewRoom', 'interviewerId', 'interviewerName',
            'status', 'createdAt', 'updatedAt'
          ]
          const itemValidation = validateRequiredFields(result.data.items[0], requiredFields)
          expect(itemValidation.valid).toBe(true)

          // 5. 验证字段类型
          const typeValidation = validateFieldTypes(result.data.items[0], {
            id: 'string',
            applicationId: 'string',
            studentName: 'string',
            studentAge: 'number',
            parentName: 'string',
            parentPhone: 'string',
            interviewDate: 'string',
            interviewTime: 'string',
            interviewRoom: 'string',
            interviewerId: 'string',
            interviewerName: 'string',
            status: 'string',
            evaluationScore: ['number', 'null'],
            createdAt: 'string',
            updatedAt: 'string'
          })
          expect(typeValidation.valid).toBe(true)

          // 6. 验证状态枚举值
          const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']
          expect(validStatuses).toContain(result.data.items[0].status)

          // 7. 验证数值范围
          expect(result.data.items[0].studentAge).toBeGreaterThan(0)
          expect(result.data.items[0].studentAge).toBeLessThan(10)
          if (result.data.items[0].evaluationScore !== null) {
            expect(result.data.items[0].evaluationScore).toBeGreaterThanOrEqual(0)
            expect(result.data.items[0].evaluationScore).toBeLessThanOrEqual(100)
          }
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
          message: '暂无面试安排'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewList(params)

        // 验证空数据响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.data.items).toEqual([])
        expect(result.data.total).toBe(0)

        const paginationValidation = validatePaginationStructure(result.data)
        expect(paginationValidation.valid).toBe(true)
      })
    })

    describe('getInterviewDetail', () => {
      it('应该正确调用获取面试详情接口并进行严格验证', async () => {
        const interviewId = '1'
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            applicationId: 'app_001',
            studentName: '张小明',
            studentAge: 4,
            studentGender: 'male',
            parentName: '张大明',
            parentPhone: '13800138000',
            parentEmail: 'zhangdaming@example.com',
            interviewDate: '2024-01-15T10:00:00Z',
            interviewTime: '10:00-11:00',
            interviewRoom: '会议室A',
            interviewerId: 'interviewer_001',
            interviewerName: '李老师',
            interviewerPhone: '13800138002',
            status: 'scheduled',
            evaluationScore: null,
            evaluationComments: null,
            criteria: [
              {
                id: '1',
                name: '语言表达能力',
                score: null,
                comments: null,
                weight: 0.3
              },
              {
                id: '2',
                name: '社交互动能力',
                score: null,
                comments: null,
                weight: 0.25
              },
              {
                id: '3',
                name: '自理能力',
                score: null,
                comments: null,
                weight: 0.25
              },
              {
                id: '4',
                name: '学习兴趣',
                score: null,
                comments: null,
                weight: 0.2
              }
            ],
            notes: '家长表示孩子比较活泼，希望老师重点关注',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-10T09:00:00Z'
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewDetail(interviewId)

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/api/interviews/${interviewId}`)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(typeof result.message).toBe('string')

        // 3. 验证必填字段
        const requiredFields = [
          'id', 'applicationId', 'studentName', 'studentAge', 'studentGender',
          'parentName', 'parentPhone', 'interviewDate', 'interviewTime', 'interviewRoom',
          'interviewerId', 'interviewerName', 'status', 'criteria', 'createdAt', 'updatedAt'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          applicationId: 'string',
          studentName: 'string',
          studentAge: 'number',
          studentGender: 'string',
          parentName: 'string',
          parentPhone: 'string',
          parentEmail: ['string', 'null'],
          interviewDate: 'string',
          interviewTime: 'string',
          interviewRoom: 'string',
          interviewerId: 'string',
          interviewerName: 'string',
          interviewerPhone: 'string',
          status: 'string',
          evaluationScore: ['number', 'null'],
          evaluationComments: ['string', 'null'],
          criteria: 'array',
          notes: ['string', 'null'],
          createdAt: 'string',
          updatedAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证枚举值
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']
        expect(validStatuses).toContain(result.data.status)

        const validGenders = ['male', 'female']
        expect(validGenders).toContain(result.data.studentGender)

        // 6. 验证评估标准
        if (result.data.criteria && result.data.criteria.length > 0) {
          const criteriaRequiredFields = ['id', 'name', 'score', 'comments', 'weight']
          const criteriaValidation = validateRequiredFields(result.data.criteria[0], criteriaRequiredFields)
          expect(criteriaValidation.valid).toBe(true)

          const criteriaTypeValidation = validateFieldTypes(result.data.criteria[0], {
            id: 'string',
            name: 'string',
            score: ['number', 'null'],
            comments: ['string', 'null'],
            weight: 'number'
          })
          expect(criteriaTypeValidation.valid).toBe(true)

          // 验证权重总和
          const totalWeight = result.data.criteria.reduce((sum: number, item: any) => sum + item.weight, 0)
          expect(totalWeight).toBeCloseTo(1.0, 2)

          // 验证单个权重范围
          result.data.criteria.forEach((criterion: any) => {
            expect(criterion.weight).toBeGreaterThan(0)
            expect(criterion.weight).toBeLessThanOrEqual(1)
            if (criterion.score !== null) {
              expect(criterion.score).toBeGreaterThanOrEqual(0)
              expect(criterion.score).toBeLessThanOrEqual(100)
            }
          })
        }
      })

      it('应该正确处理不存在的面试ID', async () => {
        const interviewId = '99999'
        const mockResponse = {
          success: false,
          data: null,
          message: '面试不存在',
          code: 404
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewDetail(interviewId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/api/interviews/${interviewId}`)
        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(404)
      })
    })

    describe('createInterview', () => {
      it('应该正确调用创建面试接口并进行严格验证', async () => {
        const interviewData = {
          applicationId: 'app_001',
          interviewDate: '2024-01-20T14:00:00Z',
          interviewTime: '14:00-15:00',
          interviewRoom: '会议室C',
          interviewerId: 'interviewer_003',
          notes: '首次面试，请重点关注'
        }
        const mockResponse = {
          success: true,
          data: {
            id: '3',
            ...interviewData,
            studentName: '王小刚',
            studentAge: 5,
            parentName: '王大强',
            parentPhone: '13800138003',
            interviewerName: '赵老师',
            status: 'scheduled',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          message: '面试安排成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await createInterview(interviewData)

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/api/interviews', interviewData)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证返回数据的必填字段
        const requiredFields = [
          'id', 'applicationId', 'interviewDate', 'interviewTime', 'interviewRoom',
          'interviewerId', 'studentName', 'studentAge', 'parentName', 'parentPhone',
          'interviewerName', 'status', 'createdAt', 'updatedAt'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          applicationId: 'string',
          interviewDate: 'string',
          interviewTime: 'string',
          interviewRoom: 'string',
          interviewerId: 'string',
          studentName: 'string',
          studentAge: 'number',
          parentName: 'string',
          parentPhone: 'string',
          interviewerName: 'string',
          status: 'string',
          notes: ['string', 'null'],
          createdAt: 'string',
          updatedAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证创建后的默认状态
        expect(result.data.status).toBe('scheduled')
        expect(result.data.id).toBeDefined()
        expect(result.data.id.length).toBeGreaterThan(0)

        // 6. 验证业务逻辑一致性
        expect(result.data.applicationId).toBe(interviewData.applicationId)
        expect(result.data.interviewDate).toBe(interviewData.interviewDate)
        expect(result.data.interviewTime).toBe(interviewData.interviewTime)
        expect(result.data.interviewRoom).toBe(interviewData.interviewRoom)
        expect(result.data.interviewerId).toBe(interviewData.interviewerId)
      })

      it('应该正确处理创建参数验证错误', async () => {
        const invalidInterviewData = {
          applicationId: '', // 空申请ID
          interviewDate: '2024-01-20T14:00:00Z',
          interviewTime: '', // 空时间
          interviewRoom: '', // 空会议室
          interviewerId: '' // 空面试官ID
        }
        const mockResponse = {
          success: false,
          data: null,
          message: '参数验证失败',
          code: 400,
          errors: [
            { field: 'applicationId', message: '申请ID不能为空' },
            { field: 'interviewTime', message: '面试时间不能为空' },
            { field: 'interviewRoom', message: '面试地点不能为空' },
            { field: 'interviewerId', message: '面试官不能为空' }
          ]
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await createInterview(invalidInterviewData)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(400)
        expect(Array.isArray(result.errors)).toBe(true)
        expect(result.errors.length).toBe(4)
      })
    })

    describe('updateInterview', () => {
      it('应该正确调用更新面试接口', async () => {
        const interviewId = '1'
        const updateData = {
          interviewDate: '2024-01-25T15:00:00Z',
          interviewTime: '15:00-16:00',
          interviewRoom: '会议室D',
          interviewerId: 'interviewer_004'
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            ...updateData,
            updatedAt: '2024-01-15T14:00:00Z'
          },
          message: '面试信息更新成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await updateInterview(interviewId, updateData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/interviews/${interviewId}`, updateData)
        expect(result.success).toBe(true)
        expect(result.data.id).toBe(interviewId)
        expect(result.data.interviewDate).toBe(updateData.interviewDate)
      })
    })

    describe('deleteInterview', () => {
      it('应该正确调用删除面试接口', async () => {
        const interviewId = '1'
        const mockResponse = {
          success: true,
          message: '面试删除成功'
        }
        mockRequest.delete.mockResolvedValue(mockResponse)

        const result = await deleteInterview(interviewId)

        expect(mockRequest.delete).toHaveBeenCalledWith(`/api/interviews/${interviewId}`)
        expect(result.success).toBe(true)
        expect(result.message).toBe('面试删除成功')
      })
    })
  })

  describe('面试状态管理', () => {
    describe('scheduleInterview', () => {
      it('应该正确调用安排面试接口', async () => {
        const scheduleData = {
          applicationId: 'app_001',
          interviewDate: '2024-01-20T10:00:00Z',
          interviewTime: '10:00-11:00',
          interviewRoom: '会议室A',
          interviewerId: 'interviewer_001'
        }
        const mockResponse = {
          success: true,
          data: {
            id: '4',
            ...scheduleData,
            status: 'scheduled'
          },
          message: '面试安排成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await scheduleInterview(scheduleData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/interviews/schedule', scheduleData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('scheduled')
      })
    })

    describe('rescheduleInterview', () => {
      it('应该正确调用重新安排面试接口', async () => {
        const interviewId = '1'
        const rescheduleData = {
          interviewDate: '2024-01-22T14:00:00Z',
          interviewTime: '14:00-15:00',
          interviewRoom: '会议室B',
          reason: '面试官临时有事'
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            ...rescheduleData,
            status: 'rescheduled'
          },
          message: '面试重新安排成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await rescheduleInterview(interviewId, rescheduleData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/interviews/${interviewId}/reschedule`, rescheduleData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('rescheduled')
      })
    })

    describe('cancelInterview', () => {
      it('应该正确调用取消面试接口', async () => {
        const interviewId = '1'
        const cancelData = {
          reason: '家长取消面试',
          notifyParent: true
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            status: 'cancelled',
            cancelReason: '家长取消面试'
          },
          message: '面试取消成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await cancelInterview(interviewId, cancelData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/interviews/${interviewId}/cancel`, cancelData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('cancelled')
      })
    })

    describe('completeInterview', () => {
      it('应该正确调用完成面试接口', async () => {
        const interviewId = '1'
        const completeData = {
          evaluationScore: 85,
          evaluationComments: '孩子表现优秀，语言表达清晰',
          recommendAdmission: true
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            status: 'completed',
            evaluationScore: 85,
            evaluationComments: '孩子表现优秀，语言表达清晰'
          },
          message: '面试完成'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await completeInterview(interviewId, completeData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/interviews/${interviewId}/complete`, completeData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('completed')
      })
    })
  })

  describe('面试评估功能', () => {
    describe('submitInterviewEvaluation', () => {
      it('应该正确调用提交面试评估接口并进行严格验证', async () => {
        const interviewId = '1'
        const evaluationData = {
          criteria: [
            { id: '1', score: 90, comments: '语言表达能力很强' },
            { id: '2', score: 85, comments: '与同学互动良好' },
            { id: '3', score: 80, comments: '基本自理能力具备' },
            { id: '4', score: 88, comments: '对学习很感兴趣' }
          ],
          overallComments: '综合表现优秀，建议录取',
          recommendAdmission: true,
          suggestedClass: '小班A'
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            evaluationScore: 85.75,
            evaluationStatus: 'completed',
            criteria: evaluationData.criteria,
            overallComments: '综合表现优秀，建议录取',
            recommendAdmission: true,
            suggestedClass: '小班A',
            evaluatedAt: '2024-01-15T16:00:00Z',
            evaluatedBy: '李老师'
          },
          message: '面试评估提交成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await submitInterviewEvaluation(interviewId, evaluationData)

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith(`/api/interviews/${interviewId}/evaluation`, evaluationData)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证必填字段
        const requiredFields = [
          'id', 'evaluationScore', 'evaluationStatus', 'criteria', 'overallComments',
          'recommendAdmission', 'evaluatedAt', 'evaluatedBy'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          evaluationScore: 'number',
          evaluationStatus: 'string',
          criteria: 'array',
          overallComments: 'string',
          recommendAdmission: 'boolean',
          suggestedClass: ['string', 'null'],
          evaluatedAt: 'string',
          evaluatedBy: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证评估分数计算
        expect(result.data.evaluationScore).toBeCloseTo(85.75, 2)
        expect(result.data.evaluationScore).toBeGreaterThanOrEqual(0)
        expect(result.data.evaluationScore).toBeLessThanOrEqual(100)

        // 6. 验证评估标准数据
        if (result.data.criteria && result.data.criteria.length > 0) {
          result.data.criteria.forEach((criterion: any) => {
            expect(criterion.score).toBeGreaterThanOrEqual(0)
            expect(criterion.score).toBeLessThanOrEqual(100)
            expect(typeof criterion.comments).toBe('string')
          })
        }

        // 7. 验证枚举值
        expect(result.data.recommendAdmission).toBe(true)
        expect(['completed', 'pending', 'reviewed']).toContain(result.data.evaluationStatus)
      })
    })

    describe('generateInterviewScore', () => {
      it('应该正确调用生成面试分数接口', async () => {
        const scoreData = {
          criteria: [
            { id: '1', score: 90, weight: 0.3 },
            { id: '2', score: 85, weight: 0.25 },
            { id: '3', score: 80, weight: 0.25 },
            { id: '4', score: 88, weight: 0.2 }
          ]
        }
        const mockResponse = {
          success: true,
          data: {
            overallScore: 85.75,
            grade: 'A',
            level: '优秀',
            breakdown: [
              { name: '语言表达能力', score: 90, weight: 0.3, contribution: 27 },
              { name: '社交互动能力', score: 85, weight: 0.25, contribution: 21.25 },
              { name: '自理能力', score: 80, weight: 0.25, contribution: 20 },
              { name: '学习兴趣', score: 88, weight: 0.2, contribution: 17.6 }
            ]
          },
          message: '分数计算成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await generateInterviewScore(scoreData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/interviews/score', scoreData)
        expect(result.success).toBe(true)
        expect(result.data.overallScore).toBeCloseTo(85.75, 2)
        expect(['A', 'B', 'C', 'D']).toContain(result.data.grade)
      })
    })
  })

  describe('数据统计和分析', () => {
    describe('getInterviewStatistics', () => {
      it('应该正确调用获取面试统计接口并进行严格验证', async () => {
        const mockResponse = {
          success: true,
          data: {
            totalInterviews: 150,
            scheduledInterviews: 45,
            completedInterviews: 95,
            cancelledInterviews: 10,
            averageScore: 82.5,
            passRate: 0.85,
            noShowRate: 0.05,
            monthlyStats: [
              { month: '2024-01', total: 25, completed: 20, cancelled: 3, averageScore: 83.2 },
              { month: '2024-02', total: 30, completed: 25, cancelled: 2, averageScore: 81.8 },
              { month: '2024-03', total: 28, completed: 24, cancelled: 4, averageScore: 82.7 }
            ],
            scoreDistribution: [
              { range: '90-100', count: 20, percentage: 21.1 },
              { range: '80-89', count: 45, percentage: 47.4 },
              { range: '70-79', count: 25, percentage: 26.3 },
              { range: '60-69', count: 5, percentage: 5.2 }
            ],
            interviewerStats: [
              { id: 'interviewer_001', name: '李老师', totalInterviews: 35, averageScore: 84.2 },
              { id: 'interviewer_002', name: '王老师', totalInterviews: 30, averageScore: 81.5 }
            ]
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewStatistics()

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews/statistics')

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证统计数据必填字段
        const requiredFields = [
          'totalInterviews', 'scheduledInterviews', 'completedInterviews', 'cancelledInterviews',
          'averageScore', 'passRate', 'noShowRate', 'monthlyStats', 'scoreDistribution'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          totalInterviews: 'number',
          scheduledInterviews: 'number',
          completedInterviews: 'number',
          cancelledInterviews: 'number',
          averageScore: 'number',
          passRate: 'number',
          noShowRate: 'number',
          monthlyStats: 'array',
          scoreDistribution: 'array',
          interviewerStats: 'array'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证数值范围和逻辑
        expect(result.data.totalInterviews).toBeGreaterThanOrEqual(0)
        expect(result.data.averageScore).toBeGreaterThanOrEqual(0)
        expect(result.data.averageScore).toBeLessThanOrEqual(100)
        expect(result.data.passRate).toBeGreaterThanOrEqual(0)
        expect(result.data.passRate).toBeLessThanOrEqual(1)
        expect(result.data.noShowRate).toBeGreaterThanOrEqual(0)
        expect(result.data.noShowRate).toBeLessThanOrEqual(1)

        // 6. 验证统计数据逻辑
        const statusSum = result.data.scheduledInterviews + result.data.completedInterviews + result.data.cancelledInterviews
        expect(statusSum).toBeLessThanOrEqual(result.data.totalInterviews)

        // 7. 验证月度统计数据
        if (result.data.monthlyStats && result.data.monthlyStats.length > 0) {
          const monthRequiredFields = ['month', 'total', 'completed', 'cancelled', 'averageScore']
          const monthValidation = validateRequiredFields(result.data.monthlyStats[0], monthRequiredFields)
          expect(monthValidation.valid).toBe(true)

          const monthTypeValidation = validateFieldTypes(result.data.monthlyStats[0], {
            month: 'string',
            total: 'number',
            completed: 'number',
            cancelled: 'number',
            averageScore: 'number'
          })
          expect(monthTypeValidation.valid).toBe(true)

          // 验证月度逻辑
          result.data.monthlyStats.forEach((month: any) => {
            expect(month.total).toBeGreaterThanOrEqual(month.completed + month.cancelled)
            expect(month.averageScore).toBeGreaterThanOrEqual(0)
            expect(month.averageScore).toBeLessThanOrEqual(100)
          })
        }

        // 8. 验证分数分布数据
        if (result.data.scoreDistribution && result.data.scoreDistribution.length > 0) {
          const totalPercentage = result.data.scoreDistribution.reduce((sum: number, item: any) => sum + item.percentage, 0)
          expect(totalPercentage).toBeCloseTo(100, 1)
        }
      })
    })

    describe('getInterviewCalendar', () => {
      it('应该正确调用获取面试日历接口', async () => {
        const params = { startDate: '2024-01-01', endDate: '2024-01-31' }
        const mockResponse = {
          success: true,
          data: [
            {
              date: '2024-01-15',
              interviews: [
                {
                  id: '1',
                  time: '10:00-11:00',
                  studentName: '张小明',
                  interviewerName: '李老师',
                  room: '会议室A'
                },
                {
                  id: '2',
                  time: '11:00-12:00',
                  studentName: '李小红',
                  interviewerName: '王老师',
                  room: '会议室B'
                }
              ]
            }
          ],
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewCalendar(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews/calendar', { params })
        expect(result.success).toBe(true)
        expect(Array.isArray(result.data)).toBe(true)
      })
    })
  })

  describe('资源配置功能', () => {
    describe('getInterviewRooms', () => {
      it('应该正确调用获取面试室列表接口', async () => {
        const mockResponse = {
          success: true,
          data: [
            {
              id: 'room_001',
              name: '会议室A',
              capacity: 5,
              equipment: ['投影仪', '白板', '摄像头'],
              location: '一楼东侧',
              status: 'available'
            },
            {
              id: 'room_002',
              name: '会议室B',
              capacity: 3,
              equipment: ['白板', '玩具'],
              location: '一楼西侧',
              status: 'occupied'
            }
          ],
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getInterviewRooms()

        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews/rooms')
        expect(result.success).toBe(true)
        expect(Array.isArray(result.data)).toBe(true)
        expect(result.data.length).toBe(2)
      })
    })

    describe('assignInterviewer', () => {
      it('应该正确调用分配面试官接口', async () => {
        const interviewId = '1'
        const assignData = {
          interviewerId: 'interviewer_003',
          reason: '原面试官临时有事'
        }
        const mockResponse = {
          success: true,
          data: {
            id: interviewId,
            interviewerId: 'interviewer_003',
            interviewerName: '赵老师',
            assignedAt: '2024-01-15T14:00:00Z'
          },
          message: '面试官分配成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await assignInterviewer(interviewId, assignData)

        expect(mockRequest.post).toHaveBeenCalledWith(`/api/interviews/${interviewId}/assign`, assignData)
        expect(result.success).toBe(true)
        expect(result.data.interviewerId).toBe('interviewer_003')
      })
    })
  })

  describe('导出功能', () => {
    describe('exportInterviewReport', () => {
      it('应该正确调用导出面试报告接口', async () => {
        const exportParams = {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'excel',
          includeDetails: true
        }
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        mockRequest.get.mockResolvedValue(mockBlob)

        const result = await exportInterviewReport(exportParams)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews/export', {
          params: exportParams,
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })
    })
  })

  describe('interviewApi 对象方法', () => {
    describe('获取面试列表', () => {
      it('应该正确调用对象方法获取面试列表', async () => {
        const params = { page: 1, pageSize: 10 }
        const mockResponse = { success: true, data: { items: [], total: 0 } }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await interviewApi.getInterviewList(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/interviews', { params })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('获取面试详情', () => {
      it('应该正确调用对象方法获取面试详情', async () => {
        const interviewId = '1'
        const mockResponse = { success: true, data: { id: interviewId } }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await interviewApi.getInterviewDetail(interviewId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/api/interviews/${interviewId}`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('模拟数据验证', () => {
    it('应该提供正确的面试模拟数据结构', () => {
      expect(mockInterviewData).toBeInstanceOf(Array)
      expect(mockInterviewData.length).toBeGreaterThan(0)

      const firstInterview = mockInterviewData[0]
      expect(firstInterview).toHaveProperty('id')
      expect(firstInterview).toHaveProperty('applicationId')
      expect(firstInterview).toHaveProperty('studentName')
      expect(firstInterview).toHaveProperty('interviewDate')
      expect(firstInterview).toHaveProperty('status')
    })

    it('应该提供正确的评估标准模拟数据', () => {
      expect(mockEvaluationCriteria).toBeInstanceOf(Array)
      expect(mockEvaluationCriteria.length).toBeGreaterThan(0)

      const firstCriterion = mockEvaluationCriteria[0]
      expect(firstCriterion).toHaveProperty('id')
      expect(firstCriterion).toHaveProperty('name')
      expect(firstCriterion).toHaveProperty('weight')
      expect(typeof firstCriterion.weight).toBe('number')
    })

    it('应该提供正确的面试室模拟数据', () => {
      expect(mockInterviewRooms).toBeInstanceOf(Array)
      expect(mockInterviewRooms.length).toBeGreaterThan(0)

      const firstRoom = mockInterviewRooms[0]
      expect(firstRoom).toHaveProperty('id')
      expect(firstRoom).toHaveProperty('name')
      expect(firstRoom).toHaveProperty('capacity')
    })

    it('应该提供正确的面试官模拟数据', () => {
      expect(mockInterviewers).toBeInstanceOf(Array)
      expect(mockInterviewers.length).toBeGreaterThan(0)

      const firstInterviewer = mockInterviewers[0]
      expect(firstInterviewer).toHaveProperty('id')
      expect(firstInterviewer).toHaveProperty('name')
      expect(firstInterviewer).toHaveProperty('title')
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockRequest.get.mockRejectedValue(error)

      await expect(getInterviewList()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的面试ID参数', async () => {
      const invalidId = ''
      const mockResponse = { error: '无效的ID', code: 400 }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getInterviewDetail(invalidId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空数据响应', async () => {
      mockRequest.get.mockResolvedValue({ data: [], total: 0 })

      const result = await getInterviewList()
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })
})