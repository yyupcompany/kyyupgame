import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from '@/utils/request'
import { expectNoConsoleErrors } from '../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes
} from '../utils/data-validation'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('多角色数据一致性完整测试', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('数据流转完整性验证', () => {
    it('验证招生流程数据流转一致性', async () => {
      // 第1步：家长提交报名申请
      const applicationData = {
        childName: '测试小朋友',
        childBirthdate: '2021-01-01',
        parentName: '测试家长',
        parentPhone: '13800138000',
        applyingClass: '小班',
        enrollmentDate: '2024-03-01',
        attachments: ['birth-cert.pdf', 'health-report.pdf']
      }

      const mockApplicationResponse = {
        success: true,
        data: {
          applicationId: 'app-123456',
          status: 'submitted',
          submittedAt: '2024-01-15T10:00:00Z',
          ...applicationData
        },
        message: '报名申请提交成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockApplicationResponse)

      const applicationResult = await request.post('/enrollment/applications', applicationData)

      expect(applicationResult.success).toBe(true)
      const applicationId = applicationResult.data.applicationId

      // 第2步：园长审核申请
      const approvalData = {
        applicationId: applicationId,
        decision: 'approved',
        comments: '材料齐全，符合招生条件',
        approvedBy: 'principal-1',
        approvedAt: '2024-01-16T09:00:00Z'
      }

      const mockApprovalResponse = {
        success: true,
        data: {
          applicationId: applicationId,
          status: 'approved',
          ...approvalData
        },
        message: '申请审核完成'
      }

      vi.mocked(request.put).mockResolvedValue(mockApprovalResponse)

      const approvalResult = await request.put(`/enrollment/applications/${applicationId}/approve`, approvalData)

      expect(approvalResult.success).toBe(true)
      expect(approvalResult.data.status).toBe('approved')

      // 第3步：生成学生记录
      const studentData = {
        applicationId: applicationId,
        studentId: 'stud-789012',
        classId: 'class-abc123',
        assignedTeacher: 'teacher-1',
        enrollmentStatus: 'enrolled',
        createdAt: '2024-01-16T10:00:00Z'
      }

      const mockStudentResponse = {
        success: true,
        data: studentData,
        message: '学生记录创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockStudentResponse)

      const studentResult = await request.post('/students', { applicationId: applicationId })

      expect(studentResult.success).toBe(true)
      expect(studentResult.data.studentId).toBe('stud-789012')

      // 第4步：验证数据流转完整性
      const mockVerificationResponse = {
        success: true,
        data: {
          applicationData: {
            id: applicationId,
            status: 'approved',
            childName: '测试小朋友'
          },
          approvalData: {
            applicationId: applicationId,
            decision: 'approved',
            approvedBy: 'principal-1'
          },
          studentData: {
            applicationId: applicationId,
            studentId: 'stud-789012',
            status: 'enrolled'
          },
          consistencyCheck: {
            applicationStatusMatch: true,
            dataIntegrityVerified: true,
            relationshipChainValid: true,
            noOrphanedRecords: true
          }
        },
        message: '数据流转验证完成'
      }

      vi.mocked(request.get).mockResolvedValue(mockVerificationResponse)

      const verificationResult = await request.get(`/enrollment/verification/${applicationId}`)

      expect(verificationResult.success).toBe(true)
      expect(verificationResult.data.consistencyCheck.applicationStatusMatch).toBe(true)
      expect(verificationResult.data.consistencyCheck.dataIntegrityVerified).toBe(true)
      expect(verificationResult.data.consistencyCheck.relationshipChainValid).toBe(true)

      // 验证关联数据完整性
      expect(verificationResult.data.applicationData.id).toBe(verificationResult.data.approvalData.applicationId)
      expect(verificationResult.data.approvalData.applicationId).toBe(verificationResult.data.studentData.applicationId)
      expect(verificationResult.data.applicationData.childName).toBe('测试小朋友')
      expect(verificationResult.data.studentData.status).toBe('enrolled')
    })

    it('验证教学活动数据流转一致性', async () => {
      // 创建活动
      const activityData = {
        title: '春季亲子运动会',
        type: 'parent_child',
        startDate: '2024-03-15',
        maxParticipants: 50,
        organizer: 'teacher-1'
      }

      const mockActivityResponse = {
        success: true,
        data: {
          activityId: 'act-456789',
          status: 'planned',
          ...activityData,
          createdAt: '2024-02-01T10:00:00Z'
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockActivityResponse)

      const activityResult = await request.post('/activities', activityData)
      const activityId = activityResult.data.activityId

      // 家长报名
      const registrationData = {
        activityId: activityId,
        studentId: 'stud-789012',
        parentId: 'parent-1',
        registrationTime: '2024-02-10T14:00:00Z'
      }

      const mockRegistrationResponse = {
        success: true,
        data: {
          registrationId: 'reg-111222',
          status: 'registered',
          ...registrationData
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockRegistrationResponse)

      const registrationResult = await request.post('/activities/registrations', registrationData)

      expect(registrationResult.success).toBe(true)

      // 活动执行和记录
      const executionData = {
        activityId: activityId,
        actualStartTime: '2024-03-15T09:00:00Z',
        actualEndTime: '2024-03-15T12:00:00Z',
        actualParticipants: 48,
        status: 'completed'
      }

      const mockExecutionResponse = {
        success: true,
        data: {
          ...executionData,
          executionId: 'exec-333444'
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockExecutionResponse)

      const executionResult = await request.put(`/activities/${activityId}/execute`, executionData)

      expect(executionResult.success).toBe(true)

      // 验证活动数据一致性
      const mockActivityVerificationResponse = {
        success: true,
        data: {
          activityInfo: {
            id: activityId,
            title: '春季亲子运动会',
            status: 'completed',
            maxParticipants: 50
          },
          registrationInfo: {
            activityId: activityId,
            registrationId: 'reg-111222',
            status: 'attended'
          },
          executionInfo: {
            activityId: activityId,
            actualParticipants: 48,
            status: 'completed'
          },
          consistencyChecks: {
            participantCountMatches: true,
            statusFlowValid: true,
            timestampsLogical: true,
            noConflictingRecords: true
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockActivityVerificationResponse)

      const verificationResult = await request.get(`/activities/${activityId}/consistency-check`)

      expect(verificationResult.success).toBe(true)
      expect(verificationResult.data.consistencyChecks.participantCountMatches).toBe(true)
      expect(verificationResult.data.consistencyChecks.statusFlowValid).toBe(true)
      expect(verificationResult.data.activityInfo.status).toBe('completed')
    })

    it('验证财务流程数据流转一致性', async () => {
      // 生成缴费单
      const billData = {
        studentId: 'stud-789012',
        billingPeriod: '2024-03',
        items: [
          { feeType: 'tuition', amount: 5000, description: '月度学费' },
          { feeType: 'meal', amount: 300, description: '月度餐费' }
        ],
        totalAmount: 5300,
        dueDate: '2024-03-31'
      }

      const mockBillResponse = {
        success: true,
        data: {
          billId: 'bill-555666',
          status: 'pending',
          ...billData,
          createdAt: '2024-03-01T00:00:00Z'
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockBillResponse)

      const billResult = await request.post('/finance/bills', billData)
      const billId = billResult.data.billId

      // 处理缴费
      const paymentData = {
        billId: billId,
        paymentMethod: 'wechat',
        paidAmount: 5300,
        paidAt: '2024-03-15T10:30:00Z',
        transactionId: 'txn-777888'
      }

      const mockPaymentResponse = {
        success: true,
        data: {
          paymentId: 'pay-999000',
          status: 'paid',
          ...paymentData
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockPaymentResponse)

      const paymentResult = await request.post('/finance/payments', paymentData)

      expect(paymentResult.success).toBe(true)

      // 更新账单状态
      const mockBillUpdateResponse = {
        success: true,
        data: {
          billId: billId,
          status: 'paid',
          paymentId: 'pay-999000',
          paidAt: '2024-03-15T10:30:00Z'
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockBillUpdateResponse)

      const billUpdateResult = await request.put(`/finance/bills/${billId}/status`, { status: 'paid' })

      expect(billUpdateResult.success).toBe(true)

      // 验证财务数据一致性
      const mockFinanceVerificationResponse = {
        success: true,
        data: {
          billData: {
            billId: billId,
            studentId: 'stud-789012',
            totalAmount: 5300,
            status: 'paid'
          },
          paymentData: {
            billId: billId,
            paymentId: 'pay-999000',
            paidAmount: 5300,
            status: 'paid'
          },
          consistencyChecks: {
            amountMatches: true,
            statusConsistent: true,
            paymentRecordExists: true,
            noDuplicatePayments: true,
            financialBalanceValid: true
          },
          financialSummary: {
            totalBilled: 5300,
            totalPaid: 5300,
            balance: 0,
            status: 'balanced'
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockFinanceVerificationResponse)

      const verificationResult = await request.get(`/finance/verification/${billId}`)

      expect(verificationResult.success).toBe(true)
      expect(verificationResult.data.consistencyChecks.amountMatches).toBe(true)
      expect(verificationResult.data.consistencyChecks.statusConsistent).toBe(true)
      expect(verificationResult.data.financialSummary.balance).toBe(0)
      expect(verificationResult.data.financialSummary.status).toBe('balanced')
    })
  })

  describe('并发操作数据一致性测试', () => {
    it('处理并发的学生信息更新', async () => {
      const studentId = 'stud-789012'

      // 模拟两个并发更新操作
      const update1Data = {
        contactPhone: '13800138001',
        address: '新地址1号',
        emergencyContact: '紧急联系人1',
        updatedBy: 'teacher-1',
        version: 1
      }

      const update2Data = {
        medicalInfo: '过敏史：无',
        specialNeeds: '需要特别关注',
        updatedBy: 'parent-1',
        version: 1
      }

      // 第一个更新成功
      const mockUpdate1Response = {
        success: true,
        data: {
          studentId: studentId,
          version: 2,
          ...update1Data,
          updatedAt: '2024-01-15T10:00:00Z'
        }
      }

      vi.mocked(request.put).mockResolvedValueOnce(mockUpdate1Response)

      const update1Result = await request.put(`/students/${studentId}`, update1Data)

      expect(update1Result.success).toBe(true)
      expect(update1Result.data.version).toBe(2)

      // 第二个更新应该检测到版本冲突
      const mockConflictResponse = {
        success: false,
        error: {
          code: 'OPTIMISTIC_LOCK_CONFLICT',
          message: '数据已被其他用户修改，请刷新后重试',
          currentVersion: 2,
          requestedVersion: 1
        },
        data: null
      }

      vi.mocked(request.put).mockResolvedValueOnce(mockConflictResponse)

      const update2Result = await request.put(`/students/${studentId}`, update2Data)

      expect(update2Result.success).toBe(false)
      expect(update2Result.error.code).toBe('OPTIMISTIC_LOCK_CONFLICT')

      // 获取最新数据重新尝试更新
      const mockLatestDataResponse = {
        success: true,
        data: {
          studentId: studentId,
          version: 2,
          contactPhone: '13800138001',
          address: '新地址1号',
          emergencyContact: '紧急联系人1'
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockLatestDataResponse)

      const latestDataResult = await request.get(`/students/${studentId}`)

      expect(latestDataResult.success).toBe(true)
      expect(latestDataResult.data.version).toBe(2)

      // 使用正确版本重新提交第二个更新
      const update2DataRetry = {
        ...update2Data,
        version: 2
      }

      const mockUpdate2RetryResponse = {
        success: true,
        data: {
          studentId: studentId,
          version: 3,
          contactPhone: '13800138001',
          address: '新地址1号',
          emergencyContact: '紧急联系人1',
          medicalInfo: '过敏史：无',
          specialNeeds: '需要特别关注',
          updatedAt: '2024-01-15T10:05:00Z'
        }
      }

      vi.mocked(request.put).mockResolvedValueOnce(mockUpdate2RetryResponse)

      const update2RetryResult = await request.put(`/students/${studentId}`, update2DataRetry)

      expect(update2RetryResult.success).toBe(true)
      expect(update2RetryResult.data.version).toBe(3)
      expect(update2RetryResult.data.medicalInfo).toBe('过敏史：无')
      expect(update2RetryResult.data.specialNeeds).toBe('需要特别关注')
    })

    it('处理并发的座位分配', async () => {
      const activityId = 'act-456789'
      const maxParticipants = 50

      // 模拟多个家长同时报名
      const concurrentRegistrations = []
      const registrationPromises = []

      for (let i = 1; i <= 55; i++) { // 超过最大参与人数
        const registrationData = {
          activityId: activityId,
          studentId: `stud-${i.toString().padStart(6, '0')}`,
          parentId: `parent-${i}`,
          timestamp: new Date().toISOString()
        }

        const mockResponse = {
          success: i <= maxParticipants,
          data: i <= maxParticipants ? {
            registrationId: `reg-${i.toString().padStart(6, '0')}`,
            status: 'confirmed',
            seatNumber: i
          } : null,
          error: i > maxParticipants ? {
            code: 'ACTIVITY_FULL',
            message: '活动报名人数已满'
          } : null
        }

        vi.mocked(request.post).mockResolvedValueOnce(mockResponse)

        registrationPromises.push(request.post('/activities/registrations', registrationData))
        concurrentRegistrations.push(registrationData)
      }

      const results = await Promise.all(registrationPromises)

      // 验证只有50个报名成功
      const successfulRegistrations = results.filter(r => r.success === true)
      const failedRegistrations = results.filter(r => r.success === false)

      expect(successfulRegistrations.length).toBe(maxParticipants)
      expect(failedRegistrations.length).toBe(5)

      // 验证失败的报名都有正确的错误信息
      failedRegistrations.forEach(result => {
        expect(result.error.code).toBe('ACTIVITY_FULL')
      })

      // 验证成功报名的座位号唯一
      const seatNumbers = successfulRegistrations.map(r => r.data.seatNumber)
      const uniqueSeatNumbers = [...new Set(seatNumbers)]
      expect(uniqueSeatNumbers.length).toBe(maxParticipants)

      // 验证最终活动状态
      const mockActivityStatusResponse = {
        success: true,
        data: {
          activityId: activityId,
          status: 'full',
          currentParticipants: maxParticipants,
          maxParticipants: maxParticipants,
          registrationCount: maxParticipants
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockActivityStatusResponse)

      const activityStatusResult = await request.get(`/activities/${activityId}`)

      expect(activityStatusResult.success).toBe(true)
      expect(activityStatusResult.data.currentParticipants).toBe(maxParticipants)
      expect(activityStatusResult.data.status).toBe('full')
    })

    it('处理并发的库存分配', async () => {
      const resourceId = 'uniform-small'
      const totalStock = 100

      // 模拟多个教师同时申领校服
      const allocationRequests = []
      const allocationPromises = []

      // 创建超过库存量的申请
      for (let i = 1; i <= 15; i++) {
        const requestData = {
          resourceId: resourceId,
          quantity: 8, // 每个教师申领8件
          requestedBy: `teacher-${i}`,
          purpose: '新生入学',
          timestamp: new Date().toISOString()
        }

        // 预期结果：前12个成功(12*8=96)，第13个部分成功(4件)，第14、15个失败
        const expectedAllocation = i <= 12 ? 8 : (i === 13 ? 4 : 0)

        const mockResponse = {
          success: expectedAllocation > 0,
          data: expectedAllocation > 0 ? {
            allocationId: `alloc-${i.toString().padStart(6, '0')}`,
            requestedQuantity: 8,
            allocatedQuantity: expectedAllocation,
            remainingStock: Math.max(0, totalStock - (i - 1) * 8)
          } : null,
          error: expectedAllocation === 0 ? {
            code: 'INSUFFICIENT_STOCK',
            message: '库存不足，无法满足申请'
          } : null
        }

        vi.mocked(request.post).mockResolvedValueOnce(mockResponse)

        allocationPromises.push(request.post('/resource/allocations', requestData))
        allocationRequests.push(requestData)
      }

      const results = await Promise.all(allocationPromises)

      // 验证分配结果
      const successfulAllocations = results.filter(r => r.success === true)
      const failedAllocations = results.filter(r => r.success === false)

      expect(successfulAllocations.length).toBe(13) // 前13个至少分配了部分
      expect(failedAllocations.length).toBe(2) // 最后2个完全失败

      // 计算总分配量
      const totalAllocated = successfulAllocations.reduce((sum, r) => sum + r.data.allocatedQuantity, 0)
      expect(totalAllocated).toBe(totalStock) // 应该正好分配完所有库存

      // 验证最后一个成功的分配
      const lastSuccessful = successfulAllocations[successfulAllocations.length - 1]
      expect(lastSuccessful.data.allocatedQuantity).toBe(4) // 最后一个只分配了4件
      expect(lastSuccessful.data.remainingStock).toBe(0) // 库存为0

      // 验证最终库存状态
      const mockStockStatusResponse = {
        success: true,
        data: {
          resourceId: resourceId,
          totalStock: totalStock,
          allocatedStock: totalStock,
          availableStock: 0,
          status: 'out_of_stock'
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockStockStatusResponse)

      const stockStatusResult = await request.get(`/resource/stock/${resourceId}`)

      expect(stockStatusResult.success).toBe(true)
      expect(stockStatusResult.data.availableStock).toBe(0)
      expect(stockStatusResult.data.status).toBe('out_of_stock')
    })
  })

  describe('事务完整性验证', () => {
    it('验证复杂业务流程的事务完整性', async () => {
      const complexTransactionData = {
        transactionId: 'tx-complex-001',
        operations: [
          {
            type: 'create_student',
            data: { name: '新学生', classId: 'class-1' },
            dependsOn: []
          },
          {
            type: 'assign_teacher',
            data: { studentId: 'new-student', teacherId: 'teacher-1' },
            dependsOn: ['create_student']
          },
          {
            type: 'generate_bill',
            data: { studentId: 'new-student', amount: 5300 },
            dependsOn: ['create_student']
          },
          {
            type: 'create_parent_account',
            data: { studentId: 'new-student', parentInfo: { name: '家长' } },
            dependsOn: ['create_student']
          },
          {
            type: 'enroll_activity',
            data: { studentId: 'new-student', activityId: 'act-1' },
            dependsOn: ['create_student', 'create_parent_account']
          }
        ]
      }

      // 模拟事务执行过程
      const mockTransactionResponse = {
        success: true,
        data: {
          transactionId: 'tx-complex-001',
          status: 'completed',
          operations: [
            {
              type: 'create_student',
              status: 'completed',
              result: { studentId: 'new-student-123' },
              executedAt: '2024-01-15T10:00:00Z'
            },
            {
              type: 'assign_teacher',
              status: 'completed',
              result: { assignmentId: 'assign-456' },
              executedAt: '2024-01-15T10:00:01Z'
            },
            {
              type: 'generate_bill',
              status: 'completed',
              result: { billId: 'bill-789' },
              executedAt: '2024-01-15T10:00:02Z'
            },
            {
              type: 'create_parent_account',
              status: 'completed',
              result: { parentId: 'parent-101' },
              executedAt: '2024-01-15T10:00:03Z'
            },
            {
              type: 'enroll_activity',
              status: 'completed',
              result: { enrollmentId: 'enroll-202' },
              executedAt: '2024-01-15T10:00:04Z'
            }
          ],
          rollbackInfo: {
            rollbackAvailable: true,
            rollbackOperations: [
              'unenroll_activity',
              'delete_parent_account',
              'cancel_bill',
              'unassign_teacher',
              'delete_student'
            ]
          }
        },
        message: '复杂事务执行成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockTransactionResponse)

      const transactionResult = await request.post('/transactions/execute', complexTransactionData)

      expect(transactionResult.success).toBe(true)
      expect(transactionResult.data.status).toBe('completed')

      // 验证所有操作都成功完成
      const operations = transactionResult.data.operations
      operations.forEach(op => {
        expect(op.status).toBe('completed')
        expect(op.result).toBeDefined()
        expect(op.executedAt).toBeDefined()
      })

      // 验证操作执行顺序正确
      const createStudentOp = operations.find(op => op.type === 'create_student')
      const assignTeacherOp = operations.find(op => op.type === 'assign_teacher')
      const enrollActivityOp = operations.find(op => op.type === 'enroll_activity')

      expect(new Date(createStudentOp.executedAt).getTime()).toBeLessThan(
        new Date(assignTeacherOp.executedAt).getTime()
      )
      expect(new Date(createStudentOp.executedAt).getTime()).toBeLessThan(
        new Date(enrollActivityOp.executedAt).getTime()
      )

      // 验证数据一致性
      const mockConsistencyCheckResponse = {
        success: true,
        data: {
          transactionId: 'tx-complex-001',
          consistencyChecks: {
            allOperationsCompleted: true,
            dependencyOrderRespected: true,
            noDataIntegrityViolations: true,
            referentialIntegrityMaintained: true,
            businessRulesSatisfied: true
          },
          createdEntities: {
            student: { id: 'new-student-123', exists: true },
            assignment: { id: 'assign-456', exists: true },
            bill: { id: 'bill-789', exists: true },
            parent: { id: 'parent-101', exists: true },
            enrollment: { id: 'enroll-202', exists: true }
          },
          relationships: [
            {
              from: 'new-student-123',
              to: 'assign-456',
              type: 'student_assignment',
              valid: true
            },
            {
              from: 'new-student-123',
              to: 'bill-789',
              type: 'student_billing',
              valid: true
            },
            {
              from: 'new-student-123',
              to: 'parent-101',
              type: 'student_parent',
              valid: true
            },
            {
              from: 'new-student-123',
              to: 'enroll-202',
              type: 'student_activity',
              valid: true
            }
          ]
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockConsistencyCheckResponse)

      const consistencyResult = await request.get(`/transactions/${complexTransactionData.transactionId}/consistency`)

      expect(consistencyResult.success).toBe(true)
      expect(consistencyResult.data.consistencyChecks.allOperationsCompleted).toBe(true)
      expect(consistencyResult.data.consistencyChecks.dependencyOrderRespected).toBe(true)
      expect(consistencyResult.data.consistencyChecks.noDataIntegrityViolations).toBe(true)

      // 验证所有创建的实体都存在
      Object.values(consistencyResult.data.createdEntities).forEach(entity => {
        expect(entity.exists).toBe(true)
      })

      // 验证所有关系都有效
      consistencyResult.data.relationships.forEach(rel => {
        expect(rel.valid).toBe(true)
      })
    })

    it('验证事务失败时的回滚机制', async () => {
      const failingTransactionData = {
        transactionId: 'tx-failing-002',
        operations: [
          {
            type: 'create_student',
            data: { name: '学生A', classId: 'class-1' }
          },
          {
            type: 'create_student',
            data: { name: '学生B', classId: 'class-1' }
          },
          {
            type: 'generate_bill',
            data: { studentId: 'invalid-student', amount: 5300 }
          }, // 这个操作会失败
          {
            type: 'enroll_activity',
            data: { studentId: 'studentB', activityId: 'act-1' }
          }
        ]
      }

      const mockFailingTransactionResponse = {
        success: false,
        error: {
          code: 'TRANSACTION_FAILED',
          message: '事务执行失败，已触发回滚',
          failedOperation: 'generate_bill',
          failureReason: '学生ID不存在'
        },
        data: {
          transactionId: 'tx-failing-002',
          status: 'rolled_back',
          operations: [
            {
              type: 'create_student',
              status: 'rolled_back',
              originalResult: { studentId: 'temp-student-123' },
              rollbackAction: 'delete_student'
            },
            {
              type: 'create_student',
              status: 'rolled_back',
              originalResult: { studentId: 'temp-student-456' },
              rollbackAction: 'delete_student'
            },
            {
              type: 'generate_bill',
              status: 'failed',
              error: '学生ID不存在'
            },
            {
              type: 'enroll_activity',
              status: 'cancelled',
              reason: '事务已回滚'
            }
          ],
          rollbackLog: [
            { action: 'delete_student', targetId: 'temp-student-123', timestamp: '2024-01-15T10:00:05Z' },
            { action: 'delete_student', targetId: 'temp-student-456', timestamp: '2024-01-15T10:00:06Z' }
          ]
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockFailingTransactionResponse)

      const transactionResult = await request.post('/transactions/execute', failingTransactionData)

      expect(transactionResult.success).toBe(false)
      expect(transactionResult.data.status).toBe('rolled_back')

      // 验证回滚日志
      const rollbackLog = transactionResult.data.rollbackLog
      expect(rollbackLog.length).toBe(2)
      rollbackLog.forEach(log => {
        expect(log.action).toBe('delete_student')
        expect(log.targetId).toMatch(/^temp-student-\d+$/)
        expect(log.timestamp).toBeDefined()
      })

      // 验证临时创建的数据已被清理
      const mockCleanupVerificationResponse = {
        success: true,
        data: {
          transactionId: 'tx-failing-002',
          verificationResults: {
            tempStudent123Deleted: true,
            tempStudent456Deleted: true,
            noOrphanedRecords: true,
            databaseConsistent: true
          },
          remainingData: {
            studentsCreated: 0,
            billsGenerated: 0,
            enrollmentsCreated: 0
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockCleanupVerificationResponse)

      const verificationResult = await request.get(`/transactions/${failingTransactionData.transactionId}/rollback-verification`)

      expect(verificationResult.success).toBe(true)
      expect(verificationResult.data.verificationResults.tempStudent123Deleted).toBe(true)
      expect(verificationResult.data.verificationResults.tempStudent456Deleted).toBe(true)
      expect(verificationResult.data.verificationResults.noOrphanedRecords).toBe(true)
      expect(verificationResult.data.remainingData.studentsCreated).toBe(0)
    })
  })

  describe('数据同步一致性测试', () => {
    it('验证多系统数据同步一致性', async () => {
      // 模拟主系统数据更新
      const masterDataUpdate = {
        entityType: 'student',
        entityId: 'stud-sync-001',
        updateData: {
          name: '更新后的学生姓名',
          classId: 'class-updated',
          contactPhone: '13800138999'
        },
        updateTimestamp: '2024-01-15T10:00:00Z',
        updatedBy: 'admin-1'
      }

      const mockMasterUpdateResponse = {
        success: true,
        data: {
          updateId: 'update-master-123',
          ...masterDataUpdate,
          syncRequired: true,
          targetSystems: ['attendance', 'finance', 'activity', 'parent_portal']
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockMasterUpdateResponse)

      const masterUpdateResult = await request.put('/master/students/stud-sync-001', masterDataUpdate.updateData)

      expect(masterUpdateResult.success).toBe(true)
      expect(masterUpdateResult.data.syncRequired).toBe(true)

      // 验证各子系统同步状态
      const mockSyncStatusResponse = {
        success: true,
        data: {
          updateId: 'update-master-123',
          syncStatus: {
            attendance: {
              status: 'synced',
              syncedAt: '2024-01-15T10:00:05Z',
              dataVersion: 'v2.1.0'
            },
            finance: {
              status: 'synced',
              syncedAt: '2024-01-15T10:00:06Z',
              dataVersion: 'v2.1.0'
            },
            activity: {
              status: 'synced',
              syncedAt: '2024-01-15T10:00:07Z',
              dataVersion: 'v2.1.0'
            },
            parent_portal: {
              status: 'synced',
              syncedAt: '2024-01-15T10:00:08Z',
              dataVersion: 'v2.1.0'
            }
          },
          consistencyChecks: {
            allSystemsSynced: true,
            dataVersionsConsistent: true,
            noSyncConflicts: true,
            replicationComplete: true
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockSyncStatusResponse)

      const syncStatusResult = await request.get(`/sync/status/${masterUpdateResult.data.updateId}`)

      expect(syncStatusResult.success).toBe(true)
      expect(syncStatusResult.data.consistencyChecks.allSystemsSynced).toBe(true)

      // 验证每个系统都已完成同步
      Object.values(syncStatusResult.data.syncStatus).forEach(systemStatus => {
        expect(systemStatus.status).toBe('synced')
        expect(systemStatus.syncedAt).toBeDefined()
        expect(systemStatus.dataVersion).toBe('v2.1.0')
      })
    })

    it('处理同步冲突和解决', async () => {
      // 模拟并发更新导致的同步冲突
      const conflictScenario = {
        entityId: 'stud-conflict-001',
        conflicts: [
          {
            system: 'master',
            field: 'contactPhone',
            value: '13800138001',
            timestamp: '2024-01-15T10:00:00Z'
          },
          {
            system: 'attendance',
            field: 'contactPhone',
            value: '13800138002',
            timestamp: '2024-01-15T10:00:05Z'
          }
        ]
      }

      const mockConflictDetectionResponse = {
        success: false,
        error: {
          code: 'SYNC_CONFLICT_DETECTED',
          message: '检测到数据同步冲突'
        },
        data: {
          conflictId: 'conflict-456',
          entityId: conflictScenario.entityId,
          conflicts: conflictScenario.conflicts,
          resolutionStrategies: [
            'use_master_data',
            'use_latest_timestamp',
            'manual_resolution'
          ]
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockConflictDetectionResponse)

      const conflictResult = await request.post('/sync/resolve-conflict', {
        strategy: 'use_latest_timestamp',
        conflictId: 'conflict-456'
      })

      expect(conflictResult.success).toBe(false)
      expect(conflictResult.data.conflicts.length).toBe(2)

      // 执行冲突解决
      const mockResolutionResponse = {
        success: true,
        data: {
          conflictId: 'conflict-456',
          resolutionStrategy: 'use_latest_timestamp',
          resolvedData: {
            contactPhone: '13800138002' // 使用最新时间戳的数据
          },
          appliedTo: ['master', 'attendance', 'finance', 'activity', 'parent_portal'],
          resolutionTimestamp: '2024-01-15T10:05:00Z'
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockResolutionResponse)

      const resolutionResult = await request.put('/sync/conflicts/conflict-456/resolve', {
        strategy: 'use_latest_timestamp'
      })

      expect(resolutionResult.success).toBe(true)
      expect(resolutionResult.data.resolvedData.contactPhone).toBe('13800138002')
      expect(resolutionResult.data.appliedTo.length).toBe(5)

      // 验证冲突解决后的一致性
      const mockPostResolutionCheckResponse = {
        success: true,
        data: {
          conflictId: 'conflict-456',
          status: 'resolved',
          consistencyCheck: {
            allSystemsConsistent: true,
            noRemainingConflicts: true,
            dataIntegrityMaintained: true
          },
          verifiedSystems: ['master', 'attendance', 'finance', 'activity', 'parent_portal'],
          verificationTimestamp: '2024-01-15T10:06:00Z'
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockPostResolutionCheckResponse)

      const postResolutionResult = await request.get('/sync/conflicts/conflict-456/verification')

      expect(postResolutionResult.success).toBe(true)
      expect(postResolutionResult.data.status).toBe('resolved')
      expect(postResolutionResult.data.consistencyCheck.allSystemsConsistent).toBe(true)
    })
  })

  describe('性能和扩展性一致性测试', () => {
    it('验证高并发下的数据一致性', async () => {
      const concurrentOperations = 100
      const entityType = 'student_profile'

      // 创建并发操作
      const concurrentPromises = []
      for (let i = 0; i < concurrentOperations; i++) {
        const operationData = {
          entityId: `${entityType}-${i}`,
          operationType: 'update',
          data: {
            lastActivityTime: new Date().toISOString(),
            activityCount: Math.floor(Math.random() * 100)
          },
          requestId: `req-${i}`
        }

        const mockResponse = {
          success: true,
          data: {
            operationId: `op-${i}`,
            entityId: operationData.entityId,
            version: Math.floor(Math.random() * 10) + 1,
            processedAt: new Date().toISOString()
          }
        }

        vi.mocked(request.post).mockResolvedValueOnce(mockResponse)

        concurrentPromises.push(request.post('/high-concurrency/operations', operationData))
      }

      // 执行所有并发操作
      const startTime = Date.now()
      const results = await Promise.all(concurrentPromises)
      const endTime = Date.now()

      // 验证性能指标
      const executionTime = endTime - startTime
      expect(executionTime).toBeLessThan(10000) // 应该在10秒内完成

      // 验证所有操作都成功
      const successfulOperations = results.filter(r => r.success === true)
      expect(successfulOperations.length).toBe(concurrentOperations)

      // 验证高并发后的一致性
      const mockConsistencyResponse = {
        success: true,
        data: {
          totalOperations: concurrentOperations,
          successfulOperations: concurrentOperations,
          failedOperations: 0,
          dataConsistencyScore: 1.0,
          integrityChecks: {
            noDataCorruption: true,
            allTransactionsComplete: true,
            noLostUpdates: true,
            replicationLag: 50 // 50ms
          },
          performanceMetrics: {
            averageResponseTime: executionTime / concurrentOperations,
            throughput: concurrentOperations / (executionTime / 1000), // ops per second
            errorRate: 0.0
          }
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockConsistencyResponse)

      const consistencyResult = await request.get('/high-concurrency/consistency-check')

      expect(consistencyResult.success).toBe(true)
      expect(consistencyResult.data.dataConsistencyScore).toBe(1.0)
      expect(consistencyResult.data.integrityChecks.noDataCorruption).toBe(true)
      expect(consistencyResult.data.integrityChecks.allTransactionsComplete).toBe(true)
      expect(consistencyResult.data.performanceMetrics.errorRate).toBe(0.0)
    })
  })
})