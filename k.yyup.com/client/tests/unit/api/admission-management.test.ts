import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAdmissionList,
  getAdmissionDetail,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  approveAdmission,
  rejectAdmission,
  batchApproveAdmission,
  batchRejectAdmission,
  assignClass,
  generateEnrollmentNotice,
  sendEnrollmentNotification,
  getWaitingList,
  addToWaitingList,
  removeFromWaitingList,
  promoteFromWaitingList,
  getAdmissionStatistics,
  getEnrollmentReport,
  exportAdmissionData,
  confirmAdmission,
  cancelAdmission,
  admissionApi,
  mockAdmissionData,
  mockWaitingListData,
  mockEnrollmentNoticeTemplate
} from '@/api/admission-management'
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
  ADMISSION_ENDPOINTS: {
    BASE: '/api/admissions',
    DETAIL: (id: string) => `/api/admissions/${id}`,
    UPDATE: (id: string) => `/api/admissions/${id}`,
    DELETE: (id: string) => `/api/admissions/${id}`,
    APPROVE: (id: string) => `/api/admissions/${id}/approve`,
    REJECT: (id: string) => `/api/admissions/${id}/reject`,
    BATCH_APPROVE: '/api/admissions/batch-approve',
    BATCH_REJECT: '/api/admissions/batch-reject',
    ASSIGN_CLASS: (id: string) => `/api/admissions/${id}/assign-class`,
    CONFIRM: (id: string) => `/api/admissions/${id}/confirm`,
    CANCEL: (id: string) => `/api/admissions/${id}/cancel`,
    STATISTICS: '/api/admissions/statistics',
    ENROLLMENT_REPORT: '/api/admissions/enrollment-report',
    EXPORT: '/api/admissions/export',
    NOTICE_GENERATE: '/api/admissions/generate-notice',
    NOTIFICATION_SEND: '/api/admissions/send-notification'
  },
  WAITING_LIST_ENDPOINTS: {
    BASE: '/api/waiting-list',
    ADD: '/api/waiting-list/add',
    REMOVE: (id: string) => `/api/waiting-list/${id}`,
    PROMOTE: (id: string) => `/api/waiting-list/${id}/promote`
  }
}))

describe('录取管理API服务 - 100%完整测试覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('基础CRUD操作', () => {
    describe('getAdmissionList', () => {
      it('应该正确调用获取录取列表接口并进行严格验证', async () => {
        const params = { page: 1, pageSize: 10, status: 'approved', grade: '小班' }
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
                assignedClass: '小班A',
                grade: '小班',
                status: 'approved',
                approvalDate: '2024-01-15T10:00:00Z',
                admissionDate: '2024-09-01',
                interviewScore: 85,
                ranking: 1,
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
              },
              {
                id: '2',
                applicationId: 'app_002',
                studentName: '李小红',
                studentAge: 5,
                parentName: '李小华',
                parentPhone: '13800138001',
                assignedClass: '中班A',
                grade: '中班',
                status: 'pending',
                approvalDate: null,
                admissionDate: '2024-09-01',
                interviewScore: 78,
                ranking: 2,
                createdAt: '2024-01-14T14:30:00Z',
                updatedAt: '2024-01-14T14:30:00Z'
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getAdmissionList(params)

        // 1. 验证API调用参数
        expect(mockRequest.get).toHaveBeenCalledWith('/api/admissions', { params })

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
            'assignedClass', 'grade', 'status', 'admissionDate', 'ranking', 'createdAt', 'updatedAt'
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
            assignedClass: 'string',
            grade: 'string',
            status: 'string',
            approvalDate: ['string', 'null'],
            admissionDate: 'string',
            interviewScore: ['number', 'null'],
            ranking: 'number',
            createdAt: 'string',
            updatedAt: 'string'
          })
          expect(typeValidation.valid).toBe(true)

          // 6. 验证状态枚举值
          const validStatuses = ['pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'enrolled']
          expect(validStatuses).toContain(result.data.items[0].status)

          // 7. 验证数值范围
          expect(result.data.items[0].studentAge).toBeGreaterThan(0)
          expect(result.data.items[0].studentAge).toBeLessThan(10)
          expect(result.data.items[0].ranking).toBeGreaterThan(0)
          if (result.data.items[0].interviewScore !== null) {
            expect(result.data.items[0].interviewScore).toBeGreaterThanOrEqual(0)
            expect(result.data.items[0].interviewScore).toBeLessThanOrEqual(100)
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
          message: '暂无录取记录'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getAdmissionList(params)

        // 验证空数据响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.data.items).toEqual([])
        expect(result.data.total).toBe(0)

        const paginationValidation = validatePaginationStructure(result.data)
        expect(paginationValidation.valid).toBe(true)
      })
    })

    describe('getAdmissionDetail', () => {
      it('应该正确调用获取录取详情接口并进行严格验证', async () => {
        const admissionId = '1'
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            applicationId: 'app_001',
            studentName: '张小明',
            studentAge: 4,
            studentGender: 'male',
            parentName: '张大明',
            parentPhone: '13800138000',
            parentEmail: 'zhangdaming@example.com',
            assignedClass: '小班A',
            grade: '小班',
            status: 'approved',
            approvalDate: '2024-01-15T10:00:00Z',
            admissionDate: '2024-09-01',
            interviewScore: 85,
            interviewComments: '学生表现优秀，语言表达清晰',
            ranking: 1,
            maxCapacity: 25,
            currentEnrollment: 20,
            specialRequirements: '无',
            medicalInfo: '身体健康',
            emergencyContact: '王小红 13800138002',
            tuitionFee: 12000,
            scholarshipAmount: 0,
            paymentStatus: 'pending',
            documents: [
              {
                id: 'doc_001',
                name: '出生证明',
                status: 'submitted',
                uploadDate: '2024-01-10T09:00:00Z'
              },
              {
                id: 'doc_002',
                name: '体检报告',
                status: 'submitted',
                uploadDate: '2024-01-11T14:30:00Z'
              }
            ],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getAdmissionDetail(admissionId)

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith(`/api/admissions/${admissionId}`)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(typeof result.message).toBe('string')

        // 3. 验证必填字段
        const requiredFields = [
          'id', 'applicationId', 'studentName', 'studentAge', 'parentName', 'parentPhone',
          'assignedClass', 'grade', 'status', 'admissionDate', 'ranking', 'createdAt', 'updatedAt'
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
          assignedClass: 'string',
          grade: 'string',
          status: 'string',
          approvalDate: ['string', 'null'],
          admissionDate: 'string',
          interviewScore: ['number', 'null'],
          interviewComments: ['string', 'null'],
          ranking: 'number',
          maxCapacity: 'number',
          currentEnrollment: 'number',
          specialRequirements: ['string', 'null'],
          medicalInfo: ['string', 'null'],
          emergencyContact: 'string',
          tuitionFee: 'number',
          scholarshipAmount: 'number',
          paymentStatus: 'string',
          documents: 'array',
          createdAt: 'string',
          updatedAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证枚举值
        const validStatuses = ['pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'enrolled']
        expect(validStatuses).toContain(result.data.status)

        const validGrades = ['小班', '中班', '大班', '学前班']
        expect(validGrades).toContain(result.data.grade)

        const validPaymentStatuses = ['pending', 'paid', 'partial', 'overdue']
        expect(validPaymentStatuses).toContain(result.data.paymentStatus)

        // 6. 验证数值范围
        expect(result.data.studentAge).toBeGreaterThan(0)
        expect(result.data.studentAge).toBeLessThan(10)
        expect(result.data.ranking).toBeGreaterThan(0)
        expect(result.data.maxCapacity).toBeGreaterThan(0)
        expect(result.data.currentEnrollment).toBeGreaterThanOrEqual(0)
        expect(result.data.currentEnrollment).toBeLessThanOrEqual(result.data.maxCapacity)
        expect(result.data.tuitionFee).toBeGreaterThanOrEqual(0)
        expect(result.data.scholarshipAmount).toBeGreaterThanOrEqual(0)

        // 7. 验证文档数据结构
        if (result.data.documents && result.data.documents.length > 0) {
          const docRequiredFields = ['id', 'name', 'status', 'uploadDate']
          const docValidation = validateRequiredFields(result.data.documents[0], docRequiredFields)
          expect(docValidation.valid).toBe(true)

          const docTypeValidation = validateFieldTypes(result.data.documents[0], {
            id: 'string',
            name: 'string',
            status: 'string',
            uploadDate: 'string'
          })
          expect(docTypeValidation.valid).toBe(true)

          const validDocStatuses = ['submitted', 'pending', 'rejected', 'approved']
          expect(validDocStatuses).toContain(result.data.documents[0].status)
        }
      })

      it('应该正确处理不存在的录取ID', async () => {
        const admissionId = '99999'
        const mockResponse = {
          success: false,
          data: null,
          message: '录取记录不存在',
          code: 404
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getAdmissionDetail(admissionId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/api/admissions/${admissionId}`)
        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(404)
      })
    })

    describe('createAdmission', () => {
      it('应该正确调用创建录取记录接口并进行严格验证', async () => {
        const admissionData = {
          applicationId: 'app_001',
          assignedClass: '小班A',
          grade: '小班',
          admissionDate: '2024-09-01',
          maxCapacity: 25,
          tuitionFee: 12000,
          specialRequirements: '无',
          medicalInfo: '身体健康',
          emergencyContact: '王小红 13800138002'
        }
        const mockResponse = {
          success: true,
          data: {
            id: '3',
            ...admissionData,
            studentName: '王小刚',
            studentAge: 5,
            parentName: '王大强',
            parentPhone: '13800138003',
            status: 'pending',
            ranking: 3,
            currentEnrollment: 20,
            scholarshipAmount: 0,
            paymentStatus: 'pending',
            createdAt: '2024-01-15T14:00:00Z',
            updatedAt: '2024-01-15T14:00:00Z'
          },
          message: '录取记录创建成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await createAdmission(admissionData)

        // 1. 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/api/admissions', admissionData)

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证返回数据的必填字段
        const requiredFields = [
          'id', 'applicationId', 'assignedClass', 'grade', 'admissionDate',
          'studentName', 'studentAge', 'parentName', 'parentPhone', 'status',
          'ranking', 'currentEnrollment', 'createdAt', 'updatedAt'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          applicationId: 'string',
          assignedClass: 'string',
          grade: 'string',
          admissionDate: 'string',
          maxCapacity: 'number',
          tuitionFee: 'number',
          specialRequirements: ['string', 'null'],
          medicalInfo: ['string', 'null'],
          emergencyContact: 'string',
          studentName: 'string',
          studentAge: 'number',
          parentName: 'string',
          parentPhone: 'string',
          status: 'string',
          ranking: 'number',
          currentEnrollment: 'number',
          scholarshipAmount: 'number',
          paymentStatus: 'string',
          createdAt: 'string',
          updatedAt: 'string'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证创建后的默认状态
        expect(result.data.status).toBe('pending')
        expect(result.data.id).toBeDefined()
        expect(result.data.id.length).toBeGreaterThan(0)

        // 6. 验证业务逻辑一致性
        expect(result.data.applicationId).toBe(admissionData.applicationId)
        expect(result.data.assignedClass).toBe(admissionData.assignedClass)
        expect(result.data.grade).toBe(admissionData.grade)
        expect(result.data.admissionDate).toBe(admissionData.admissionDate)
        expect(result.data.maxCapacity).toBe(admissionData.maxCapacity)
        expect(result.data.tuitionFee).toBe(admissionData.tuitionFee)
      })

      it('应该正确处理创建参数验证错误', async () => {
        const invalidAdmissionData = {
          applicationId: '', // 空申请ID
          assignedClass: '', // 空班级
          grade: '', // 空年级
          admissionDate: '', // 空入学日期
          maxCapacity: -10 // 无效容量
        }
        const mockResponse = {
          success: false,
          data: null,
          message: '参数验证失败',
          code: 400,
          errors: [
            { field: 'applicationId', message: '申请ID不能为空' },
            { field: 'assignedClass', message: '班级不能为空' },
            { field: 'grade', message: '年级不能为空' },
            { field: 'admissionDate', message: '入学日期不能为空' },
            { field: 'maxCapacity', message: '班级容量必须大于0' }
          ]
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await createAdmission(invalidAdmissionData)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.code).toBe(400)
        expect(Array.isArray(result.errors)).toBe(true)
        expect(result.errors.length).toBe(5)
      })
    })

    describe('updateAdmission', () => {
      it('应该正确调用更新录取记录接口', async () => {
        const admissionId = '1'
        const updateData = {
          assignedClass: '小班B',
          maxCapacity: 30,
          tuitionFee: 15000,
          specialRequirements: '需要特别关注'
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            ...updateData,
            updatedAt: '2024-01-15T16:00:00Z'
          },
          message: '录取记录更新成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await updateAdmission(admissionId, updateData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}`, updateData)
        expect(result.success).toBe(true)
        expect(result.data.id).toBe(admissionId)
        expect(result.data.assignedClass).toBe(updateData.assignedClass)
      })
    })

    describe('deleteAdmission', () => {
      it('应该正确调用删除录取记录接口', async () => {
        const admissionId = '1'
        const mockResponse = {
          success: true,
          message: '录取记录删除成功'
        }
        mockRequest.delete.mockResolvedValue(mockResponse)

        const result = await deleteAdmission(admissionId)

        expect(mockRequest.delete).toHaveBeenCalledWith(`/api/admissions/${admissionId}`)
        expect(result.success).toBe(true)
        expect(result.message).toBe('录取记录删除成功')
      })
    })
  })

  describe('录取决策管理', () => {
    describe('approveAdmission', () => {
      it('应该正确调用批准录取接口', async () => {
        const admissionId = '1'
        const approveData = {
          assignedClass: '小班A',
          approvalComments: '综合表现优秀，批准录取',
          scholarshipAmount: 2000
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            status: 'approved',
            approvalDate: '2024-01-15T17:00:00Z',
            approvalComments: '综合表现优秀，批准录取',
            scholarshipAmount: 2000,
            updatedAt: '2024-01-15T17:00:00Z'
          },
          message: '录取批准成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await approveAdmission(admissionId, approveData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}/approve`, approveData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('approved')
        expect(result.data.approvalDate).toBeDefined()
      })
    })

    describe('rejectAdmission', () => {
      it('应该正确调用拒绝录取接口', async () => {
        const admissionId = '1'
        const rejectData = {
          rejectReason: '班级名额已满',
          addToWaitingList: true
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            status: 'rejected',
            rejectReason: '班级名额已满',
            addToWaitingList: true,
            updatedAt: '2024-01-15T17:00:00Z'
          },
          message: '录取拒绝成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await rejectAdmission(admissionId, rejectData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}/reject`, rejectData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('rejected')
        expect(result.data.addToWaitingList).toBe(true)
      })
    })

    describe('batchApproveAdmission', () => {
      it('应该正确调用批量批准录取接口', async () => {
        const batchData = {
          admissionIds: ['1', '2', '3'],
          assignedClass: '小班A',
          approvalComments: '批量批准录取'
        }
        const mockResponse = {
          success: true,
          data: {
            approvedCount: 3,
            failedCount: 0,
            details: [
              { id: '1', success: true },
              { id: '2', success: true },
              { id: '3', success: true }
            ]
          },
          message: '批量批准成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await batchApproveAdmission(batchData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/admissions/batch-approve', batchData)
        expect(result.success).toBe(true)
        expect(result.data.approvedCount).toBe(3)
        expect(result.data.failedCount).toBe(0)
      })
    })

    describe('batchRejectAdmission', () => {
      it('应该正确调用批量拒绝录取接口', async () => {
        const batchData = {
          admissionIds: ['1', '2'],
          rejectReason: '不符合录取标准',
          addToWaitingList: false
        }
        const mockResponse = {
          success: true,
          data: {
            rejectedCount: 2,
            failedCount: 0,
            details: [
              { id: '1', success: true },
              { id: '2', success: true }
            ]
          },
          message: '批量拒绝成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await batchRejectAdmission(batchData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/admissions/batch-reject', batchData)
        expect(result.success).toBe(true)
        expect(result.data.rejectedCount).toBe(2)
      })
    })
  })

  describe('班级分配管理', () => {
    describe('assignClass', () => {
      it('应该正确调用分配班级接口', async () => {
        const admissionId = '1'
        const assignData = {
          assignedClass: '小班B',
          maxCapacity: 30,
          reason: '原班级已满，调整到新班级'
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            assignedClass: '小班B',
            maxCapacity: 30,
            currentEnrollment: 18,
            updatedAt: '2024-01-15T18:00:00Z'
          },
          message: '班级分配成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await assignClass(admissionId, assignData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}/assign-class`, assignData)
        expect(result.success).toBe(true)
        expect(result.data.assignedClass).toBe('小班B')
        expect(result.data.maxCapacity).toBe(30)
      })
    })
  })

  describe('入学确认管理', () => {
    describe('confirmAdmission', () => {
      it('应该正确调用确认入学接口', async () => {
        const admissionId = '1'
        const confirmData = {
          confirmDate: '2024-08-15',
          enrollmentFeesPaid: true,
          paymentAmount: 12000,
          paymentMethod: 'bank_transfer'
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            status: 'confirmed',
            confirmDate: '2024-08-15',
            enrollmentFeesPaid: true,
            paymentAmount: 12000,
            paymentMethod: 'bank_transfer',
            paymentStatus: 'paid',
            updatedAt: '2024-01-15T19:00:00Z'
          },
          message: '入学确认成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await confirmAdmission(admissionId, confirmData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}/confirm`, confirmData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('confirmed')
        expect(result.data.enrollmentFeesPaid).toBe(true)
        expect(result.data.paymentStatus).toBe('paid')
      })
    })

    describe('cancelAdmission', () => {
      it('应该正确调用取消录取接口', async () => {
        const admissionId = '1'
        const cancelData = {
          cancelReason: '家庭搬迁',
          refundAmount: 12000,
          refundStatus: 'pending'
        }
        const mockResponse = {
          success: true,
          data: {
            id: admissionId,
            status: 'cancelled',
            cancelReason: '家庭搬迁',
            refundAmount: 12000,
            refundStatus: 'pending',
            cancelledAt: '2024-01-15T20:00:00Z'
          },
          message: '录取取消成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await cancelAdmission(admissionId, cancelData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/admissions/${admissionId}/cancel`, cancelData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('cancelled')
        expect(result.data.cancelReason).toBe('家庭搬迁')
      })
    })
  })

  describe('候补名单管理', () => {
    describe('getWaitingList', () => {
      it('应该正确调用获取候补名单接口', async () => {
        const params = { grade: '小班', page: 1, pageSize: 10 }
        const mockResponse = {
          success: true,
          data: {
            items: [
              {
                id: '1',
                applicationId: 'app_001',
                studentName: '王小明',
                studentAge: 4,
                parentName: '王大明',
                parentPhone: '13800138000',
                grade: '小班',
                waitingRank: 1,
                addToWaitingListDate: '2024-01-15T10:00:00Z',
                estimatedEnrollmentDate: '2024-09-15',
                status: 'waiting',
                createdAt: '2024-01-15T10:00:00Z'
              }
            ],
            total: 1,
            page: 1,
            pageSize: 10
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getWaitingList(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/waiting-list', { params })
        expect(result.success).toBe(true)
        expect(Array.isArray(result.data.items)).toBe(true)
        expect(result.data.items[0].waitingRank).toBe(1)
      })
    })

    describe('addToWaitingList', () => {
      it('应该正确调用添加到候补名单接口', async () => {
        const waitingData = {
          applicationId: 'app_001',
          grade: '小班',
          reason: '班级名额已满'
        }
        const mockResponse = {
          success: true,
          data: {
            id: '1',
            ...waitingData,
            studentName: '张小红',
            waitingRank: 3,
            addToWaitingListDate: '2024-01-15T10:00:00Z',
            status: 'waiting'
          },
          message: '添加到候补名单成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await addToWaitingList(waitingData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/waiting-list/add', waitingData)
        expect(result.success).toBe(true)
        expect(result.data.waitingRank).toBe(3)
      })
    })

    describe('promoteFromWaitingList', () => {
      it('应该正确调用从候补名单提升接口', async () => {
        const waitingId = '1'
        const promoteData = {
          assignedClass: '小班A',
          promotionReason: '有空余名额'
        }
        const mockResponse = {
          success: true,
          data: {
            id: waitingId,
            status: 'promoted',
            assignedClass: '小班A',
            promotionDate: '2024-01-20T10:00:00Z',
            promotionReason: '有空余名额'
          },
          message: '候补提升成功'
        }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await promoteFromWaitingList(waitingId, promoteData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/waiting-list/${waitingId}/promote`, promoteData)
        expect(result.success).toBe(true)
        expect(result.data.status).toBe('promoted')
      })
    })
  })

  describe('入学通知管理', () => {
    describe('generateEnrollmentNotice', () => {
      it('应该正确调用生成入学通知接口', async () => {
        const noticeData = {
          admissionIds: ['1', '2'],
          templateId: 'standard_template',
          includePaymentInfo: true,
          includeSchoolCalendar: true
        }
        const mockResponse = {
          success: true,
          data: {
            noticeId: 'notice_001',
            generatedCount: 2,
            previewUrl: '/api/admissions/notice/notice_001/preview',
            downloadUrl: '/api/admissions/notice/notice_001/download',
            generatedAt: '2024-01-15T10:00:00Z'
          },
          message: '入学通知生成成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await generateEnrollmentNotice(noticeData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/admissions/generate-notice', noticeData)
        expect(result.success).toBe(true)
        expect(result.data.generatedCount).toBe(2)
        expect(result.data.previewUrl).toBeDefined()
      })
    })

    describe('sendEnrollmentNotification', () => {
      it('应该正确调用发送入学通知接口', async () => {
        const notificationData = {
          admissionIds: ['1', '2'],
          notificationType: 'email',
          message: '恭喜您的孩子被录取！',
          includeAttachments: true
        }
        const mockResponse = {
          success: true,
          data: {
            sentCount: 2,
            failedCount: 0,
            details: [
              { id: '1', parentEmail: 'parent1@example.com', sent: true },
              { id: '2', parentEmail: 'parent2@example.com', sent: true }
            ],
            sentAt: '2024-01-15T11:00:00Z'
          },
          message: '入学通知发送成功'
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await sendEnrollmentNotification(notificationData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/admissions/send-notification', notificationData)
        expect(result.success).toBe(true)
        expect(result.data.sentCount).toBe(2)
        expect(result.data.failedCount).toBe(0)
      })
    })
  })

  describe('数据统计和报告', () => {
    describe('getAdmissionStatistics', () => {
      it('应该正确调用获取录取统计接口并进行严格验证', async () => {
        const mockResponse = {
          success: true,
          data: {
            totalApplications: 200,
            approvedApplications: 120,
            rejectedApplications: 50,
            pendingApplications: 30,
            confirmedApplications: 85,
            enrolledApplications: 75,
            admissionRate: 0.6,
            confirmationRate: 0.708,
            enrollmentRate: 0.625,
            gradeDistribution: [
              { grade: '小班', total: 80, approved: 48, confirmed: 35, enrolled: 30 },
              { grade: '中班', total: 70, approved: 42, confirmed: 30, enrolled: 25 },
              { grade: '大班', total: 50, approved: 30, confirmed: 20, enrolled: 20 }
            ],
            monthlyStats: [
              { month: '2024-01', applications: 45, approvals: 25, confirmations: 18 },
              { month: '2024-02', applications: 38, approvals: 20, confirmations: 15 }
            ],
            paymentStats: {
              totalTuition: 1440000,
              paidAmount: 1080000,
              pendingAmount: 360000,
              averageTuition: 12000
            },
            waitingListStats: {
              totalWaiting: 25,
              promotedThisMonth: 5,
              averageWaitTime: 15
            }
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getAdmissionStatistics()

        // 1. 验证API调用
        expect(mockRequest.get).toHaveBeenCalledWith('/api/admissions/statistics')

        // 2. 验证API响应结构
        const apiValidation = validateApiResponseStructure(result)
        expect(apiValidation.valid).toBe(true)
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // 3. 验证统计数据必填字段
        const requiredFields = [
          'totalApplications', 'approvedApplications', 'rejectedApplications', 'pendingApplications',
          'confirmedApplications', 'enrolledApplications', 'admissionRate', 'confirmationRate', 'enrollmentRate'
        ]
        const fieldValidation = validateRequiredFields(result.data, requiredFields)
        expect(fieldValidation.valid).toBe(true)

        // 4. 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          totalApplications: 'number',
          approvedApplications: 'number',
          rejectedApplications: 'number',
          pendingApplications: 'number',
          confirmedApplications: 'number',
          enrolledApplications: 'number',
          admissionRate: 'number',
          confirmationRate: 'number',
          enrollmentRate: 'number',
          gradeDistribution: 'array',
          monthlyStats: 'array',
          paymentStats: 'object',
          waitingListStats: 'object'
        })
        expect(typeValidation.valid).toBe(true)

        // 5. 验证数值范围
        const rangeValidation = validateStatisticalRanges(result.data)
        expect(rangeValidation.valid).toBe(true)

        // 6. 验证统计数据逻辑
        const statusSum = result.data.approvedApplications + result.data.rejectedApplications + result.data.pendingApplications
        expect(statusSum).toBeLessThanOrEqual(result.data.totalApplications)

        expect(result.data.confirmedApplications).toBeLessThanOrEqual(result.data.approvedApplications)
        expect(result.data.enrolledApplications).toBeLessThanOrEqual(result.data.confirmedApplications)

        // 7. 验证年级分布数据
        if (result.data.gradeDistribution && result.data.gradeDistribution.length > 0) {
          result.data.gradeDistribution.forEach((grade: any) => {
            expect(grade.total).toBeGreaterThanOrEqual(grade.approved + grade.confirmed + grade.enrolled)
          })
        }

        // 8. 验证支付统计数据
        if (result.data.paymentStats) {
          expect(result.data.paymentStats.totalTuition).toBeGreaterThanOrEqual(result.data.paymentStats.paidAmount)
          expect(result.data.paymentStats.paidAmount).toBeGreaterThanOrEqual(0)
          expect(result.data.paymentStats.averageTuition).toBeGreaterThan(0)
        }
      })
    })

    describe('getEnrollmentReport', () => {
      it('应该正确调用获取入学报告接口', async () => {
        const params = { startDate: '2024-01-01', endDate: '2024-01-31', grade: '小班' }
        const mockResponse = {
          success: true,
          data: {
            reportId: 'report_001',
            summary: {
              period: '2024-01-01至2024-01-31',
              grade: '小班',
              totalProcessed: 50,
              enrollmentRate: 0.8,
              averageScore: 82.5
            },
            details: [
              {
                date: '2024-01-15',
                enrollments: 5,
                confirmations: 4,
                cancellations: 1
              }
            ],
            generatedAt: '2024-02-01T10:00:00Z'
          },
          message: '获取成功'
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await getEnrollmentReport(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/admissions/enrollment-report', { params })
        expect(result.success).toBe(true)
        expect(result.data.reportId).toBe('report_001')
        expect(result.data.summary.enrollmentRate).toBe(0.8)
      })
    })
  })

  describe('导出功能', () => {
    describe('exportAdmissionData', () => {
      it('应该正确调用导出录取数据接口', async () => {
        const exportParams = {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'approved',
          format: 'excel',
          includeDetails: true
        }
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        mockRequest.get.mockResolvedValue(mockBlob)

        const result = await exportAdmissionData(exportParams)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/admissions/export', {
          params: exportParams,
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })
    })
  })

  describe('admissionApi 对象方法', () => {
    describe('获取录取列表', () => {
      it('应该正确调用对象方法获取录取列表', async () => {
        const params = { page: 1, pageSize: 10 }
        const mockResponse = { success: true, data: { items: [], total: 0 } }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await admissionApi.getAdmissionList(params)

        expect(mockRequest.get).toHaveBeenCalledWith('/api/admissions', { params })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('获取录取详情', () => {
      it('应该正确调用对象方法获取录取详情', async () => {
        const admissionId = '1'
        const mockResponse = { success: true, data: { id: admissionId } }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await admissionApi.getAdmissionDetail(admissionId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/api/admissions/${admissionId}`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('模拟数据验证', () => {
    it('应该提供正确的录取模拟数据结构', () => {
      expect(mockAdmissionData).toBeInstanceOf(Array)
      expect(mockAdmissionData.length).toBeGreaterThan(0)

      const firstAdmission = mockAdmissionData[0]
      expect(firstAdmission).toHaveProperty('id')
      expect(firstAdmission).toHaveProperty('applicationId')
      expect(firstAdmission).toHaveProperty('studentName')
      expect(firstAdmission).toHaveProperty('status')
      expect(firstAdmission).toHaveProperty('assignedClass')
    })

    it('应该提供正确的候补名单模拟数据', () => {
      expect(mockWaitingListData).toBeInstanceOf(Array)
      expect(mockWaitingListData.length).toBeGreaterThan(0)

      const firstWaiting = mockWaitingListData[0]
      expect(firstWaiting).toHaveProperty('id')
      expect(firstWaiting).toHaveProperty('applicationId')
      expect(firstWaiting).toHaveProperty('waitingRank')
      expect(firstWaiting).toHaveProperty('status')
    })

    it('应该提供正确的入学通知模板', () => {
      expect(mockEnrollmentNoticeTemplate).toHaveProperty('templateId')
      expect(mockEnrollmentNoticeTemplate).toHaveProperty('templateName')
      expect(mockEnrollmentNoticeTemplate).toHaveProperty('content')
      expect(mockEnrollmentNoticeTemplate).toHaveProperty('variables')
      expect(Array.isArray(mockEnrollmentNoticeTemplate.variables)).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockRequest.get.mockRejectedValue(error)

      await expect(getAdmissionList()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理无效的录取ID参数', async () => {
      const invalidId = ''
      const mockResponse = { error: '无效的ID', code: 400 }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await getAdmissionDetail(invalidId)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空数据响应', async () => {
      mockRequest.get.mockResolvedValue({ data: [], total: 0 })

      const result = await getAdmissionList()
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })
})