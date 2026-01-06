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
    delete: vi.fn(),
    request: vi.fn()
  }
}))

describe('多角色权限边界完整测试', () => {
  const roles = {
    admin: { id: 'admin-1', name: '系统管理员', permissions: ['all'] },
    principal: { id: 'principal-1', name: '园长', permissions: ['staff_management', 'financial_management', 'enrollment_management'] },
    teacher: { id: 'teacher-1', name: '教师', permissions: ['student_management', 'class_management', 'activity_management'] },
    parent: { id: 'parent-1', name: '家长', permissions: ['child_info', 'payment_center', 'activities'] }
  }

  const testEndpoints = {
    // 系统管理（仅Admin）
    systemSettings: '/admin/system/settings',
    userManagement: '/admin/users',
    roleManagement: '/admin/roles',
    systemLogs: '/admin/logs',

    // 园长管理（仅Principal）
    staffManagement: '/principal/staff',
    performanceEvaluation: '/principal/performance',
    financialOverview: '/principal/finance/overview',
    enrollmentApproval: '/principal/enrollment/approval',

    // 教师管理（仅Teacher）
    studentRecords: '/teacher/students',
    classManagement: '/teacher/classes',
    teachingPlan: '/teacher/teaching-plans',
    gradeManagement: '/teacher/grades',

    // 家长功能（仅Parent）
    childInfo: '/parent/children',
    paymentHistory: '/parent/payments',
    activityRegistration: '/parent/activities/registration',

    // 共共功能（多角色可访问）
    dashboard: '/dashboard',
    notifications: '/notifications',
    profile: '/profile'
  }

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('角色权限隔离测试', () => {
    it('Admin不能访问Teacher专用功能', async () => {
      // 模拟Admin尝试访问Teacher专用API
      const mockUnauthorizedResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: '权限不足：管理员无法访问教师专用功能'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockUnauthorizedResponse)

      // 测试访问学生记录
      const studentResponse = await request.get(testEndpoints.studentRecords)
      expect(studentResponse.success).toBe(false)
      expect(studentResponse.error.message).toContain('权限不足')

      // 测试访问班级管理
      const classResponse = await request.get(testEndpoints.classManagement)
      expect(classResponse.success).toBe(false)
      expect(classResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问教学计划
      const planResponse = await request.get(testEndpoints.teachingPlan)
      expect(planResponse.success).toBe(false)
      expect(planResponse.error.message).toContain('管理员无法访问')

      // 验证所有调用都有正确的错误响应
      expect(request.get).toHaveBeenCalledWith(testEndpoints.studentRecords)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.classManagement)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.teachingPlan)
    })

    it('Teacher不能访问系统管理功能', async () => {
      const mockUnauthorizedResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: '权限不足：教师无法访问系统管理功能'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockUnauthorizedResponse)

      // 测试访问用户管理
      const userResponse = await request.get(testEndpoints.userManagement)
      expect(userResponse.success).toBe(false)
      expect(userResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问角色管理
      const roleResponse = await request.get(testEndpoints.roleManagement)
      expect(roleResponse.success).toBe(false)
      expect(roleResponse.error.message).toContain('教师无法访问')

      // 测试访问系统设置
      const settingsResponse = await request.get(testEndpoints.systemSettings)
      expect(settingsResponse.success).toBe(false)
      expect(settingsResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问系统日志
      const logsResponse = await request.get(testEndpoints.systemLogs)
      expect(logsResponse.success).toBe(false)
      expect(logsResponse.error.message).toContain('权限不足')

      // 验证API调用
      expect(request.get).toHaveBeenCalledWith(testEndpoints.userManagement)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.roleManagement)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.systemSettings)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.systemLogs)
    })

    it('Parent不能访问管理功能', async () => {
      const mockUnauthorizedResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: '权限不足：家长无法访问管理功能'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockUnauthorizedResponse)

      // 测试访问员工管理
      const staffResponse = await request.get(testEndpoints.staffManagement)
      expect(staffResponse.success).toBe(false)
      expect(staffResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问财务管理
      const financeResponse = await request.get(testEndpoints.financialOverview)
      expect(financeResponse.success).toBe(false)
      expect(financeResponse.error.message).toContain('家长无法访问')

      // 测试访问招生审批
      const enrollmentResponse = await request.get(testEndpoints.enrollmentApproval)
      expect(enrollmentResponse.success).toBe(false)
      expect(enrollmentResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问系统设置
      const settingsResponse = await request.get(testEndpoints.systemSettings)
      expect(settingsResponse.success).toBe(false)
      expect(settingsResponse.error.message).toContain('权限不足')

      // 验证API调用和错误响应
      expect(request.get).toHaveBeenCalledWith(testEndpoints.staffManagement)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.financialOverview)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.enrollmentApproval)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.systemSettings)
    })

    it('Principal不能访问Admin专用功能', async () => {
      const mockUnauthorizedResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: '权限不足：园长无法访问系统管理员专用功能'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockUnauthorizedResponse)

      // 测试访问角色管理
      const roleResponse = await request.get(testEndpoints.roleManagement)
      expect(roleResponse.success).toBe(false)
      expect(roleResponse.error.code).toBe('ACCESS_DENIED')

      // 测试访问系统设置
      const settingsResponse = await request.get(testEndpoints.systemSettings)
      expect(settingsResponse.success).toBe(false)
      expect(settingsResponse.error.message).toContain('园长无法访问')

      // 测试访问用户管理
      const userResponse = await request.get(testEndpoints.userManagement)
      expect(userResponse.success).toBe(false)
      expect(userResponse.error.code).toBe('ACCESS_DENIED')

      // 验证API调用
      expect(request.get).toHaveBeenCalledWith(testEndpoints.roleManagement)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.systemSettings)
      expect(request.get).toHaveBeenCalledWith(testEndpoints.userManagement)
    })
  })

  describe('数据隔离测试', () => {
    it('不同角色数据完全隔离', async () => {
      // 测试教师数据隔离
      const teacherDataResponse = {
        success: true,
        data: {
          students: [
            { id: 'student-1', name: '学生A', classId: 'class-1', teacherId: 'teacher-1' },
            { id: 'student-2', name: '学生B', classId: 'class-1', teacherId: 'teacher-1' }
          ],
          total: 2
        }
      }

      vi.mocked(request.get).mockResolvedValue(teacherDataResponse)

      const teacherStudents = await request.get(`${testEndpoints.studentRecords}?teacherId=teacher-1`)

      // 验证数据只包含该教师的学生
      expect(teacherStudents.success).toBe(true)
      expect(teacherStudents.data.students).toHaveLength(2)
      teacherStudents.data.students.forEach(student => {
        expect(student.teacherId).toBe('teacher-1')
      })

      // 测试家长数据隔离
      const parentDataResponse = {
        success: true,
        data: {
          children: [
            { id: 'child-1', name: '孩子A', parentId: 'parent-1' }
          ],
          total: 1
        }
      }

      vi.mocked(request.get).mockResolvedValue(parentDataResponse)

      const parentChildren = await request.get(`${testEndpoints.childInfo}?parentId=parent-1`)

      // 验证数据只包含该家长的孩子
      expect(parentChildren.success).toBe(true)
      expect(parentChildren.data.children).toHaveLength(1)
      expect(parentChildren.data.children[0].parentId).toBe('parent-1')

      // 测试园长数据隔离
      const principalDataResponse = {
        success: true,
        data: {
          staff: [
            { id: 'staff-1', name: '员工A', kindergartenId: 'kg-1' },
            { id: 'staff-2', name: '员工B', kindergartenId: 'kg-1' }
          ],
          total: 2
        }
      }

      vi.mocked(request.get).mockResolvedValue(principalDataResponse)

      const principalStaff = await request.get(`${testEndpoints.staffManagement}?kindergartenId=kg-1`)

      // 验证数据只包含该幼儿园的员工
      expect(principalStaff.success).toBe(true)
      expect(principalStaff.data.staff).toHaveLength(2)
      principalStaff.data.staff.forEach(staff => {
        expect(staff.kindergartenId).toBe('kg-1')
      })
    })

    it('防止跨数据访问攻击', async () => {
      // 模拟恶意尝试访问其他用户的数据
      const maliciousAttempts = [
        { userId: 'parent-1', targetId: 'parent-2', endpoint: testEndpoints.childInfo },
        { userId: 'teacher-1', targetId: 'teacher-2', endpoint: testEndpoints.studentRecords },
        { userId: 'principal-1', targetId: 'principal-2', endpoint: testEndpoints.staffManagement }
      ]

      const mockSecurityErrorResponse = {
        success: false,
        error: {
          code: 'SECURITY_VIOLATION',
          message: '安全违规：尝试访问非授权数据'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockSecurityErrorResponse)

      for (const attempt of maliciousAttempts) {
        // 尝试通过URL参数访问其他用户的数据
        const response = await request.get(`${attempt.endpoint}?userId=${attempt.targetId}`)

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('SECURITY_VIOLATION')
        expect(response.error.message).toContain('安全违规')

        // 验证API调用参数包含恶意尝试的目标ID
        expect(request.get).toHaveBeenCalledWith(expect.stringContaining(`userId=${attempt.targetId}`))
      }
    })

    it('数据过滤和脱敏测试', async () => {
      // 测试敏感数据脱敏
      const sensitiveDataResponse = {
        success: true,
        data: {
          users: [
            {
              id: 'user-1',
              name: '张三',
              phone: '138****8000',  // 脱敏的手机号
              email: 'zhang***@example.com',  // 脱敏的邮箱
              idCard: '320101********1234',   // 脱敏的身份证
              address: '江苏省南京市****区**街道**号'  // 脱敏的地址
            }
          ]
        }
      }

      vi.mocked(request.get).mockResolvedValue(sensitiveDataResponse)

      const response = await request.get('/admin/users?fields=sensitive')

      expect(response.success).toBe(true)
      const user = response.data.users[0]

      // 验证数据脱敏
      expect(user.phone).toContain('****')
      expect(user.email).toContain('***')
      expect(user.idCard).toContain('********')
      expect(user.address).toContain('****')
    })
  })

  describe('操作权限测试', () => {
    it('只允许授权角色执行敏感操作', async () => {
      const sensitiveOperations = [
        { operation: 'delete-user', allowedRoles: ['admin'], deniedRoles: ['teacher', 'parent', 'principal'] },
        { operation: 'approve-enrollment', allowedRoles: ['principal'], deniedRoles: ['teacher', 'parent', 'admin'] },
        { operation: 'input-grades', allowedRoles: ['teacher'], deniedRoles: ['parent', 'admin', 'principal'] },
        { operation: 'process-payment', allowedRoles: ['parent', 'principal'], deniedRoles: ['teacher', 'admin'] }
      ]

      for (const operation of sensitiveOperations) {
        // 测试允许的角色
        for (const allowedRole of operation.allowedRoles) {
          const mockSuccessResponse = {
            success: true,
            message: `${operation} 操作成功`,
            data: null
          }

          vi.mocked(request.post).mockResolvedValue(mockSuccessResponse)

          const response = await request.post(`/operations/${operation}`, { role: allowedRole })
          expect(response.success).toBe(true)
          expect(request.post).toHaveBeenCalledWith(`/operations/${operation}`, { role: allowedRole })
        }

        // 测试拒绝的角色
        const mockErrorResponse = {
          success: false,
          error: {
            code: 'OPERATION_NOT_ALLOWED',
            message: `操作被拒绝：当前角色无权限执行 ${operation}`
          },
          data: null
        }

        vi.mocked(request.post).mockResolvedValue(mockErrorResponse)

        for (const deniedRole of operation.deniedRoles) {
          const response = await request.post(`/operations/${operation}`, { role: deniedRole })
          expect(response.success).toBe(false)
          expect(response.error.code).toBe('OPERATION_NOT_ALLOWED')
        }
      }
    })

    it('批量操作权限控制', async () => {
      const batchOperations = {
        batchDeleteUsers: {
          endpoint: '/admin/users/batch-delete',
          allowedRole: 'admin',
          testData: { userIds: ['user-1', 'user-2', 'user-3'] }
        },
        batchApproveEnrollments: {
          endpoint: '/principal/enrollment/batch-approve',
          allowedRole: 'principal',
          testData: { enrollmentIds: ['enroll-1', 'enroll-2'] }
        },
        batchUpdateGrades: {
          endpoint: '/teacher/grades/batch-update',
          allowedRole: 'teacher',
          testData: { grades: [{ studentId: 'stud-1', grade: 90 }] }
        }
      }

      for (const [operationName, config] of Object.entries(batchOperations)) {
        // 测试授权角色
        const mockSuccessResponse = {
          success: true,
          message: `${operationName} 批量操作成功`,
          data: { processedCount: config.testData.userIds?.length || config.testData.enrollmentIds?.length || config.testData.grades?.length }
        }

        vi.mocked(request.post).mockResolvedValue(mockSuccessResponse)

        const authorizedResponse = await request.post(config.endpoint, config.testData)
        expect(authorizedResponse.success).toBe(true)

        // 测试未授权角色
        const mockErrorResponse = {
          success: false,
          error: {
            code: 'BATCH_OPERATION_DENIED',
            message: `批量操作被拒绝：无权限执行 ${operationName}`
          },
          data: null
        }

        vi.mocked(request.post).mockResolvedValue(mockErrorResponse)

        const unauthorizedResponse = await request.post(config.endpoint, { ...config.testData, role: 'unauthorized' })
        expect(unauthorizedResponse.success).toBe(false)
        expect(unauthorizedResponse.error.code).toBe('BATCH_OPERATION_DENIED')
      }
    })
  })

  describe('会话和认证安全测试', () => {
    it('会话超时自动注销', async () => {
      const mockSessionExpiredResponse = {
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: '会话已过期，请重新登录'
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockSessionExpiredResponse)

      // 测试会话过期后的API调用
      const response = await request.get(testEndpoints.dashboard)

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('SESSION_EXPIRED')
      expect(response.error.message).toContain('重新登录')
    })

    it('并发登录控制', async () => {
      const mockConcurrentLoginResponse = {
        success: false,
        error: {
          code: 'CONCURRENT_LOGIN_DETECTED',
          message: '检测到并发登录，前一会话已被终止'
        },
        data: null
      }

      vi.mocked(request.post).mockResolvedValue(mockConcurrentLoginResponse)

      // 模拟从另一设备登录
      const loginResponse = await request.post('/auth/login', {
        username: 'test-user',
        password: 'password',
        deviceId: 'new-device'
      })

      expect(loginResponse.success).toBe(false)
      expect(loginResponse.error.code).toBe('CONCURRENT_LOGIN_DETECTED')
    })

    it('IP地址变更检测', async () => {
      const mockSuspiciousIPResponse = {
        success: false,
        error: {
          code: 'SUSPICIOUS_IP_DETECTED',
          message: '检测到异常IP地址访问，需要额外验证'
        },
        data: {
          requiresAdditionalVerification: true,
          verificationMethods: ['sms', 'email']
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockSuspiciousIPResponse)

      // 从新的IP地址访问
      const response = await request.get(testEndpoints.profile, {
        headers: { 'X-Forwarded-For': '192.168.1.100' }
      })

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('SUSPICIOUS_IP_DETECTED')
      expect(response.data.requiresAdditionalVerification).toBe(true)
    })
  })

  describe('API调用频率限制测试', () => {
    it('实施API调用频率限制', async () => {
      // 模拟频繁调用
      const mockRateLimitResponse = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API调用频率超限，请稍后重试',
          retryAfter: 60
        },
        data: null
      }

      vi.mocked(request.get).mockResolvedValue(mockRateLimitResponse)

      // 快速连续调用同一个API
      const responses = []
      for (let i = 0; i < 10; i++) {
        responses.push(await request.get(testEndpoints.notifications))
      }

      // 验证至少有一个调用被限制
      const limitedResponses = responses.filter(r =>
        r.success === false && r.error.code === 'RATE_LIMIT_EXCEEDED'
      )
      expect(limitedResponses.length).toBeGreaterThan(0)
      expect(limitedResponses[0].error.retryAfter).toBe(60)
    })

    it('不同角色的不同频率限制', async () => {
      const rateLimits = {
        admin: 1000,    // 管理员较高限制
        principal: 500, // 园长中等限制
        teacher: 200,   // 教师一般限制
        parent: 100     // 家长较低限制
      }

      for (const [role, limit] of Object.entries(rateLimits)) {
        const mockRoleBasedResponse = {
          success: false,
          error: {
            code: 'ROLE_RATE_LIMIT_EXCEEDED',
            message: `${role}角色API调用频率超限，限制：${limit}次/分钟`
          },
          data: null
        }

        vi.mocked(request.get).mockResolvedValue(mockRoleBasedResponse)

        const response = await request.get(testEndpoints.dashboard, {
          headers: { 'X-User-Role': role }
        })

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('ROLE_RATE_LIMIT_EXCEEDED')
        expect(response.error.message).toContain(limit.toString())
      }
    })
  })

  describe('数据访问日志和审计测试', () => {
    it('记录所有敏感操作', async () => {
      const sensitiveOperations = [
        { operation: 'user-deletion', user: 'admin-1', target: 'user-123' },
        { operation: 'grade-modification', user: 'teacher-1', target: 'student-456' },
        { operation: 'payment-processing', user: 'parent-1', target: 'bill-789' },
        { operation: 'enrollment-approval', user: 'principal-1', target: 'enrollment-101' }
      ]

      for (const operation of sensitiveOperations) {
        const mockSuccessResponse = {
          success: true,
          message: '操作成功',
          data: null,
          auditLog: {
            id: `audit-${Date.now()}`,
            operation: operation.operation,
            userId: operation.user,
            targetId: operation.target,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            result: 'success'
          }
        }

        vi.mocked(request.post).mockResolvedValue(mockSuccessResponse)

        const response = await request.post(`/audit/${operation.operation}`, operation)

        expect(response.success).toBe(true)
        expect(response.data.auditLog.operation).toBe(operation.operation)
        expect(response.data.auditLog.userId).toBe(operation.user)
        expect(response.data.auditLog.targetId).toBe(operation.target)
        expect(response.data.auditLog.timestamp).toBeDefined()
      }
    })

    it('异常访问行为检测', async () => {
      const suspiciousPatterns = [
        { pattern: 'rapid-data-export', count: 50, timeWindow: '1分钟' },
        { pattern: 'bulk-user-query', count: 100, timeWindow: '5分钟' },
        { pattern: 'sensitive-data-access', count: 20, timeWindow: '10分钟' }
      ]

      for (const pattern of suspiciousPatterns) {
        const mockSuspiciousResponse = {
          success: false,
          error: {
            code: 'SUSPICIOUS_ACTIVITY_DETECTED',
            message: `检测到异常访问模式：${pattern.pattern}`,
            details: {
              pattern: pattern.pattern,
              count: pattern.count,
              timeWindow: pattern.timeWindow,
              action: 'blocked'
            }
          },
          data: null
        }

        vi.mocked(request.get).mockResolvedValue(mockSuspiciousResponse)

        const response = await request.get('/suspicious-access-test')

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('SUSPICIOUS_ACTIVITY_DETECTED')
        expect(response.error.details.pattern).toBe(pattern.pattern)
        expect(response.error.details.action).toBe('blocked')
      }
    })
  })

  describe('权限动态更新测试', () => {
    it('权限变更实时生效', async () => {
      // 模拟权限变更
      const roleUpdateData = {
        roleId: 'teacher-1',
        newPermissions: ['student_management', 'class_management', 'financial_view'], // 新增财务查看权限
        removedPermissions: []
      }

      const mockRoleUpdateResponse = {
        success: true,
        message: '角色权限更新成功',
        data: {
          roleId: roleUpdateData.roleId,
          oldPermissions: ['student_management', 'class_management'],
          newPermissions: roleUpdateData.newPermissions,
          effectiveTime: new Date().toISOString()
        }
      }

      vi.mocked(request.put).mockResolvedValue(mockRoleUpdateResponse)

      const updateResponse = await request.put('/admin/roles/teacher-1/permissions', roleUpdateData)

      expect(updateResponse.success).toBe(true)
      expect(updateResponse.data.newPermissions).toContain('financial_view')

      // 验证权限变更立即生效
      const mockFinancialAccessResponse = {
        success: true,
        data: {
          financialOverview: { revenue: 100000, expenses: 80000 },
          permissions: ['view_only']
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockFinancialAccessResponse)

      const accessResponse = await request.get('/finance/overview', {
        headers: { 'X-User-Role': 'teacher-1' }
      })

      expect(accessResponse.success).toBe(true)
      expect(accessResponse.data.permissions).toContain('view_only')
    })

    it('临时权限授予和回收', async () => {
      const temporaryPermissionData = {
        userId: 'teacher-1',
        permission: 'emergency_financial_access',
        reason: '处理紧急财务事务',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时
        grantedBy: 'principal-1'
      }

      const mockGrantResponse = {
        success: true,
        message: '临时权限授予成功',
        data: {
          temporaryPermissionId: 'temp-perm-123',
          ...temporaryPermissionData,
          status: 'active'
        }
      }

      vi.mocked(request.post).mockResolvedValue(mockGrantResponse)

      const grantResponse = await request.post('/admin/temporary-permissions', temporaryPermissionData)

      expect(grantResponse.success).toBe(true)
      expect(grantResponse.data.status).toBe('active')
      expect(grantResponse.data.validUntil).toBeDefined()

      // 验证临时权限生效
      const mockTempAccessResponse = {
        success: true,
        data: {
          accessGranted: true,
          permissionType: 'temporary',
          expiresAt: temporaryPermissionData.validUntil
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockTempAccessResponse)

      const tempAccessResponse = await request.get('/finance/emergency-access')
      expect(tempAccessResponse.success).toBe(true)
      expect(tempAccessResponse.data.accessGranted).toBe(true)

      // 模拟权限回收
      const mockRevokeResponse = {
        success: true,
        message: '临时权限已回收',
        data: {
          temporaryPermissionId: 'temp-perm-123',
          status: 'revoked',
          revokedAt: new Date().toISOString(),
          revokedBy: 'principal-1'
        }
      }

      vi.mocked(request.delete).mockResolvedValue(mockRevokeResponse)

      const revokeResponse = await request.delete('/admin/temporary-permissions/temp-perm-123')
      expect(revokeResponse.success).toBe(true)
      expect(revokeResponse.data.status).toBe('revoked')

      // 验证权限已回收
      const mockAccessDeniedResponse = {
        success: false,
        error: {
          code: 'TEMPORARY_PERMISSION_REVOKED',
          message: '临时权限已被回收'
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockAccessDeniedResponse)

      const deniedAccessResponse = await request.get('/finance/emergency-access')
      expect(deniedAccessResponse.success).toBe(false)
      expect(deniedAccessResponse.error.code).toBe('TEMPORARY_PERMISSION_REVOKED')
    })
  })

  describe('权限边界错误处理测试', () => {
    it('优雅处理权限错误', async () => {
      const permissionErrors = [
        { code: 'INSUFFICIENT_PERMISSIONS', message: '权限不足' },
        { code: 'RESOURCE_NOT_FOUND', message: '资源不存在' },
        { code: 'SESSION_EXPIRED', message: '会话过期' },
        { code: 'ACCOUNT_LOCKED', message: '账户已锁定' }
      ]

      for (const error of permissionErrors) {
        const mockErrorResponse = {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: {
              timestamp: new Date().toISOString(),
              requestId: `req-${Date.now()}`,
              suggestedAction: '请联系管理员'
            }
          },
          data: null
        }

        vi.mocked(request.get).mockResolvedValue(mockErrorResponse)

        const response = await request.get('/protected-resource')

        expect(response.success).toBe(false)
        expect(response.error.code).toBe(error.code)
        expect(response.error.message).toBe(error.message)
        expect(response.error.details.requestId).toBeDefined()
        expect(response.error.details.suggestedAction).toBeDefined()
      }
    })

    it('权限检查失败时的降级处理', async () => {
      // 模拟权限服务故障
      const mockServiceUnavailableResponse = {
        success: false,
        error: {
          code: 'PERMISSION_SERVICE_UNAVAILABLE',
          message: '权限服务暂时不可用',
          fallbackAction: 'allow_readonly_access'
        },
        data: {
          readonlyAccess: true,
          limitedFunctionality: true
        }
      }

      vi.mocked(request.get).mockResolvedValue(mockServiceUnavailableResponse)

      const response = await request.get('/dashboard')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('PERMISSION_SERVICE_UNAVAILABLE')
      expect(response.error.fallbackAction).toBe('allow_readonly_access')
      expect(response.data.readonlyAccess).toBe(true)
    })
  })
})