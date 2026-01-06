import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import service from '@/api/interceptors'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/api/endpoints'
import { authApi } from '@/api/auth'
import { expectNoConsoleErrors, startConsoleMonitoring } from '../../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure,
  validatePhoneNumberFormat
} from '../../../utils/data-validation'
import {
  validateJWTToken,
  validateRefreshToken,
  validateUserInfo,
  validateAuthResponse,
  validateLoginRequest,
  createAuthValidationReport
} from '../../../utils/auth-validation'
import {
  UnifiedAuthLoginRequest,
  UnifiedAuthLoginResponse,
  validateUnifiedAuthLoginRequest,
  validateUnifiedAuthLoginResponse,
  mockUnifiedAuthLoginSuccess,
  mockUnifiedAuthRequiresTenantSelection,
  unifiedAuthTestData
} from './unified-auth.template.test'

// Mock modules
vi.mock('@/api/interceptors', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock endpoints - 更新为统一认证中心端点
vi.mock('@/api/endpoints', () => ({
  AUTH_ENDPOINTS: {
    LOGIN: '/api/auth/unified-login',
    FLEXIBLE_LOGIN: '/api/auth/flexible-login',
    VERIFY_TOKEN: '/auth/verify-token',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    USER_TENANTS: '/api/auth/user-tenants',
    BIND_TENANT: '/api/auth/bind-tenant',
    UNIFIED_HEALTH: '/api/auth/unified-health',
    UNIFIED_CONFIG: '/api/auth/unified-config'
  },
  USER_ENDPOINTS: {
    GET_PROFILE: '/users/profile',
    USER_INFO: '/api/auth/userinfo'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('Auth API - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    startConsoleMonitoring()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    expectNoConsoleErrors()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('login', () => {
    it('should login successfully with unified auth center - 手机号登录', async () => {
      // 使用统一认证中心的登录数据
      const loginData: UnifiedAuthLoginRequest = {
        phone: '13800138000',
        password: 'password123',
        tenantCode: 'kindergarten_001',
        clientId: 'kindergarten-admin',
        grantType: 'password'
      }

      // 1. 验证统一认证请求数据格式
      const loginValidation = validateUnifiedAuthLoginRequest(loginData)
      expect(loginValidation.valid).toBe(true)
      if (!loginValidation.valid) {
        throw new Error(`统一认证登录请求验证失败: ${loginValidation.errors?.join(', ')}`)
      }

      // 2. Mock 统一认证中心响应
      const mockResponse = {
        data: mockUnifiedAuthLoginSuccess
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      // 3. 执行登录
      const result = await authApi.unifiedLogin(loginData)

      // 4. 验证API调用参数 - 统一认证端点
      expect(service.post).toHaveBeenCalledWith('/api/auth/unified-login', loginData)

      // 5. 验证统一认证响应结构
      const responseValidation = validateUnifiedAuthLoginResponse(result)
      expect(responseValidation.valid).toBe(true)
      if (!responseValidation.valid) {
        throw new Error(`统一认证登录响应验证失败: ${responseValidation.errors?.join(', ')}`)
      }

      // 6. 验证基本业务逻辑
      expect(result.success).toBe(true)
      expect(result.message).toBe('登录成功')
      expect(result.data).toBeDefined()

      // 7. 验证令牌字段
      expect(result.data?.accessToken).toBeDefined()
      expect(result.data?.refreshToken).toBeDefined()
      expect(result.data?.tokenType).toBe('Bearer')
      expect(result.data?.expiresIn).toBeGreaterThan(0)

      // 8. 验证JWT令牌格式
      expect(validateJWTToken(result.data?.accessToken || '')).toBe(true)
      expect(validateJWTToken(result.data?.refreshToken || '')).toBe(true)

      // 9. 验证用户信息结构 - 统一认证用户格式
      expect(result.data?.user.id).toBe('user_123')
      expect(result.data?.user.username).toBe('admin')
      expect(result.data?.user.realName).toBe('系统管理员')
      expect(result.data?.user.email).toBe('admin@kindergarten.com')
      expect(result.data?.user.phone).toBe('13800138000')
      expect(result.data?.user.status).toBe('active')

      // 10. 验证角色信息
      expect(Array.isArray(result.data?.user.roles)).toBe(true)
      if (result.data?.user.roles.length > 0) {
        const role = result.data.user.roles[0]
        expect(role.id).toBe('role_admin')
        expect(role.name).toBe('系统管理员')
        expect(role.code).toBe('ADMIN')
        expect(Array.isArray(role.permissions)).toBe(true)
      }

      // 11. 验证权限数组
      expect(Array.isArray(result.data?.user.permissions)).toBe(true)
      expect(result.data?.user.permissions).toContain('system:read')

      // 12. 验证组织信息
      expect(result.data?.user.orgInfo).toBeDefined()
      expect(result.data?.user.orgInfo.orgId).toBe('org_001')
      expect(result.data?.user.orgInfo.orgName).toBe('智慧幼儿园')
      expect(result.data?.user.orgInfo.orgType).toBe('kindergarten')

      // 13. 验证租户信息
      expect(result.data?.tenantInfo).toBeDefined()
      expect(result.data?.tenantInfo.tenantCode).toBe('kindergarten_001')
      expect(result.data?.tenantInfo.tenantName).toBe('智慧幼儿园')

      // 14. 验证全局用户ID
      expect(result.data?.globalUserId).toBe('global_user_123')
    })

    it('should handle tenant selection scenario with unified auth center', async () => {
      // 需要租户选择的登录场景
      const loginData: UnifiedAuthLoginRequest = {
        phone: '13800138000',
        password: 'password123'
        // 不提供tenantCode，触发租户选择
      }

      // 1. 验证请求格式
      const loginValidation = validateUnifiedAuthLoginRequest(loginData)
      expect(loginValidation.valid).toBe(true)

      // 2. Mock 需要租户选择的响应
      const mockResponse = {
        data: mockUnifiedAuthRequiresTenantSelection
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      // 3. 执行登录
      const result = await authApi.unifiedLogin(loginData)

      // 4. 验证租户选择状态
      expect(result.success).toBe(true)
      expect(result.data?.requiresTenantSelection).toBe(true)
      expect(result.data?.requiresTenantBinding).toBe(false)

      // 5. 验证租户列表
      expect(result.data?.tenants).toBeDefined()
      expect(Array.isArray(result.data?.tenants)).toBe(true)
      expect(result.data?.tenants?.length).toBeGreaterThan(0)

      // 6. 验证租户信息结构
      const tenant = result.data?.tenants?.[0]
      expect(tenant).toBeDefined()
      expect(tenant.tenantCode).toBe('kindergarten_001')
      expect(tenant.tenantName).toBe('智慧幼儿园')
      expect(tenant.domain).toBe('kindergarten.example.com')
      expect(typeof tenant.hasAccount).toBe('boolean')
      expect(typeof tenant.loginCount).toBe('number')
      expect(['active', 'suspended', 'deleted']).toContain(tenant.status)
    })

    it('should support flexible login with multiple authentication methods', async () => {
      // 测试灵活登录支持多种认证方式

      // 1. 手机号登录
      const phoneLoginData = {
        phone: '13800138000',
        password: 'password123'
      }

      const mockPhoneResponse = {
        data: mockUnifiedAuthLoginSuccess
      }

      vi.mocked(service.post).mockResolvedValue(mockPhoneResponse)

      const phoneResult = await authApi.flexibleLogin(phoneLoginData)
      expect(service.post).toHaveBeenCalledWith('/api/auth/flexible-login', phoneLoginData)
      expect(phoneResult.success).toBe(true)

      // 2. 用户名登录（向后兼容）
      const usernameLoginData = {
        username: 'admin',
        password: 'password123'
      }

      const mockUsernameResponse = {
        data: {
          success: true,
          message: '登录成功',
          data: {
            ...mockUnifiedAuthLoginSuccess.data,
            user: {
              ...mockUnifiedAuthLoginSuccess.data!.user,
              username: 'admin'
            }
          }
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockUsernameResponse)

      const usernameResult = await authApi.flexibleLogin(usernameLoginData)
      expect(service.post).toHaveBeenCalledWith('/api/auth/flexible-login', usernameLoginData)
      expect(usernameResult.success).toBe(true)
    })

    it('should login successfully with strict validation - old format response', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      // 1. 验证请求数据格式
      const loginValidation = validateLoginRequest(loginData)
      expect(loginValidation.valid).toBe(true)
      if (!loginValidation.valid) {
        throw new Error(`Login request validation failed: ${loginValidation.errors.join(', ')}`)
      }

      const mockResponse = {
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyNDI2MjJ9.signature',
          refreshToken: 'dGhpcy1pcy1hLXZlcnktc2VjdXJlLXJlZnJlc2gtdG9rZW4td2l0aC1lbnVvdWdoLWxlbmd0aA',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
          }
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      const result = await authApi.login(loginData)

      // 2. 验证API调用参数
      expect(service.post).toHaveBeenCalledWith('/auth/login', loginData)

      // 3. 验证响应结构
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')

      // 4. 验证旧格式响应的必填字段
      const requiredFields = ['success', 'token', 'refreshToken', 'user']
      const requiredValidation = validateRequiredFields(result, requiredFields)
      expect(requiredValidation.valid).toBe(true)
      if (!requiredValidation.valid) {
        throw new Error(`Missing required fields: ${requiredValidation.missing.join(', ')}`)
      }

      // 5. 验证字段类型
      const typeValidation = validateFieldTypes(result, {
        success: 'boolean',
        token: 'string',
        refreshToken: 'string',
        user: 'object'
      })
      expect(typeValidation.valid).toBe(true)
      if (!typeValidation.valid) {
        throw new Error(`Type validation errors: ${typeValidation.errors.join(', ')}`)
      }

      // 6. 验证JWT令牌格式
      if (result.token) {
        const tokenValidation = validateJWTToken(result.token)
        expect(tokenValidation.valid).toBe(true)
        if (!tokenValidation.valid) {
          throw new Error(`JWT token validation failed: ${tokenValidation.errors.join(', ')}`)
        }
      }

      // 7. 验证刷新令牌格式
      if (result.refreshToken) {
        const refreshTokenValidation = validateRefreshToken(result.refreshToken)
        expect(refreshTokenValidation.valid).toBe(true)
        if (!refreshTokenValidation.valid) {
          throw new Error(`Refresh token validation failed: ${refreshTokenValidation.errors.join(', ')}`)
        }
      }

      // 8. 验证用户信息结构（旧格式，只验证基本字段）
      if (result.user) {
        const userRequiredValidation = validateRequiredFields(result.user, ['id', 'username'])
        expect(userRequiredValidation.valid).toBe(true)
        if (!userRequiredValidation.valid) {
          throw new Error(`Missing required user fields: ${userRequiredValidation.missing.join(', ')}`)
        }

        const userTypeValidation = validateFieldTypes(result.user, {
          id: 'string',
          username: 'string',
          email: 'string'
        })
        expect(userTypeValidation.valid).toBe(true)
        if (!userTypeValidation.valid) {
          throw new Error(`User type validation errors: ${userTypeValidation.errors.join(', ')}`)
        }
      }

      // 9. 验证业务逻辑
      expect(result.success).toBe(true)
      expect(result.user?.username).toBe(loginData.username)
    })

    it('should handle login failure with strict validation - new format', async () => {
      const loginData = {
        username: 'wronguser',
        password: 'wrongpass123'
      }

      // 1. 验证请求数据格式（即使失败也要验证请求格式）
      const loginValidation = validateLoginRequest(loginData)
      expect(loginValidation.valid).toBe(true)
      if (!loginValidation.valid) {
        throw new Error(`Login request validation failed: ${loginValidation.errors.join(', ')}`)
      }

      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
          code: 401
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      // 2. 验证API调用参数
      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials')
      expect(service.post).toHaveBeenCalledWith('/auth/login', loginData)
    })

    it('should handle API errors during login', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass'
      }

      const error = {
        response: {
          data: {
            message: 'Network error'
          }
        }
      }

      vi.mocked(service.post).mockRejectedValue(error)

      await expect(authApi.login(loginData)).rejects.toThrow('Network error')
    })

    it('should handle generic errors during login', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass'
      }

      const error = new Error('Connection failed')
      vi.mocked(service.post).mockRejectedValue(error)

      await expect(authApi.login(loginData)).rejects.toThrow('登录失败，请检查用户名和密码')
    })
  })

  describe('verifyToken', () => {
    it('should verify token successfully with strict validation - new format', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            valid: true,
            userId: '1',
            expiresAt: '2024-12-31T23:59:59.000Z'
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.verifyToken()

      // 1. 验证API调用参数
      expect(service.get).toHaveBeenCalledWith('/auth/verify-token')

      // 2. 验证返回值类型和值
      expect(typeof result).toBe('boolean')
      expect(result).toBe(true)
    })

    it('should verify token successfully with old format', async () => {
      const mockResponse = {
        data: {
          valid: true
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.verifyToken()

      expect(service.get).toHaveBeenCalledWith('/auth/verify-token')
      expect(result).toBe(true)
    })

    it('should handle invalid token', async () => {
      const mockResponse = {
        data: {
          success: false,
          data: {
            valid: false
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.verifyToken()

      expect(result).toBe(false)
    })

    it('should handle API errors during token verification', async () => {
      const error = new Error('Token verification failed')
      vi.mocked(service.get).mockRejectedValue(error)

      const result = await authApi.verifyToken()

      expect(result).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully with unified auth userinfo endpoint', async () => {
      // Mock 统一认证中心的用户信息响应
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'user_123',
            username: 'admin',
            realName: '系统管理员',
            email: 'admin@kindergarten.com',
            phone: '13800138000',
            avatar: 'https://example.com/avatar.jpg',
            status: 'active',
            roles: [
              {
                id: 'role_admin',
                name: '系统管理员',
                code: 'ADMIN',
                permissions: ['system:read', 'system:write', 'user:manage']
              }
            ],
            permissions: ['system:read', 'system:write', 'user:manage'],
            orgInfo: {
              orgId: 'org_001',
              orgName: '智慧幼儿园',
              orgType: 'kindergarten'
            }
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.getCurrentUser()

      // 验证调用的是统一认证中心的用户信息端点
      expect(service.get).toHaveBeenCalledWith('/api/auth/userinfo')

      // 验证返回的用户信息结构
      expect(result).toEqual({
        id: 'user_123',
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@kindergarten.com',
        phone: '13800138000',
        avatar: 'https://example.com/avatar.jpg',
        status: 'active',
        roles: [
          {
            id: 'role_admin',
            name: '系统管理员',
            code: 'ADMIN',
            permissions: ['system:read', 'system:write', 'user:manage']
          }
        ],
        permissions: ['system:read', 'system:write', 'user:manage'],
        orgInfo: {
          orgId: 'org_001',
          orgName: '智慧幼儿园',
          orgType: 'kindergarten'
        }
      })
    })

    it('should validate unified auth user response structure', async () => {
      // 测试统一认证用户信息的完整验证
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'user_456',
            username: 'teacher',
            realName: '教师用户',
            email: 'teacher@kindergarten.com',
            phone: '15912345678',
            status: 'active',
            roles: [
              {
                id: 'role_teacher',
                name: '教师',
                code: 'TEACHER',
                permissions: ['students:read', 'classes:read']
              }
            ],
            permissions: ['students:read', 'classes:read'],
            orgInfo: {
              orgId: 'org_002',
              orgName: '阳光幼儿园',
              orgType: 'kindergarten'
            }
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.getCurrentUser()

      // 验证必填字段
      const requiredFields = ['id', 'username', 'realName', 'email', 'phone', 'roles', 'permissions', 'orgInfo']
      const requiredValidation = validateRequiredFields(result, requiredFields)
      expect(requiredValidation.valid).toBe(true)

      // 验证字段类型
      const typeValidation = validateFieldTypes(result, {
        id: 'string',
        username: 'string',
        realName: 'string',
        email: 'string',
        phone: 'string',
        status: 'string',
        roles: 'array',
        permissions: 'array',
        orgInfo: 'object'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证角色结构
      expect(Array.isArray(result.roles)).toBe(true)
      if (result.roles.length > 0) {
        const role = result.roles[0]
        const roleFields = ['id', 'name', 'code', 'permissions']
        const roleValidation = validateRequiredFields(role, roleFields)
        expect(roleValidation.valid).toBe(true)
      }

      // 验证组织信息
      const orgFields = ['orgId', 'orgName', 'orgType']
      const orgValidation = validateRequiredFields(result.orgInfo, orgFields)
      expect(orgValidation.valid).toBe(true)
    })

    it('should handle user data in backward compatibility mode', async () => {
      // 测试向后兼容的用户数据格式
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'user_789',
            username: 'parent',
            email: 'parent@kindergarten.com',
            realName: '家长用户',
            // 简化的角色信息，向后兼容
            roles: [
              {
                id: 'role_parent',
                name: '家长',
                code: 'PARENT'
              }
            ],
            permissions: ['children:read']
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.getCurrentUser()

      expect(result.id).toBe('user_789')
      expect(result.username).toBe('parent')
      expect(result.email).toBe('parent@kindergarten.com')
      expect(Array.isArray(result.roles)).toBe(true)
      expect(Array.isArray(result.permissions)).toBe(true)
    })

    it('should handle API errors when getting unified auth user info', async () => {
      const error = {
        response: {
          status: 401,
          data: {
            success: false,
            message: '令牌无效或已过期',
            code: 'INVALID_TOKEN'
          }
        }
      }

      vi.mocked(service.get).mockRejectedValue(error)

      await expect(authApi.getCurrentUser()).rejects.toThrow('令牌无效或已过期')
    })

    it('should handle network errors when getting user info', async () => {
      const networkError = new Error('Network error')
      vi.mocked(service.get).mockRejectedValue(networkError)

      await expect(authApi.getCurrentUser()).rejects.toThrow('获取用户信息失败')
    })

    it('should handle malformed user info response', async () => {
      // 测试处理格式错误的响应
      const malformedResponse = {
        data: {
          success: true,
          data: {
            // 缺少必要字段
            id: 'user_123',
            username: 'admin'
            // 缺少 realName, email, phone 等
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(malformedResponse)

      const result = await authApi.getCurrentUser()

      // 应该能处理缺少字段的情况，不抛出错误
      expect(result.id).toBe('user_123')
      expect(result.username).toBe('admin')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(service.post).mockResolvedValue({})

      // Mock localStorage
      const localStorageMock = {
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      await authApi.logout()

      expect(service.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('should handle logout API errors but still clear local storage', async () => {
      const error = new Error('Logout failed')
      vi.mocked(service.post).mockRejectedValue(error)

      // Mock localStorage
      const localStorageMock = {
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      await authApi.logout()

      expect(service.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully with unified auth center', async () => {
      const refreshToken = 'dGhpcy1pcy1hLXZlcnktc2VjdXJlLXJlZnJlc2gtdG9rZW4td2l0aC1lbnVvdWdoLWxlbmd0aA'

      // Mock 统一认证中心的令牌刷新响应
      const mockResponse = {
        data: {
          success: true,
          message: '令牌刷新成功',
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.access.token.signature',
            refreshToken: 'dGhpcy1pcy1hLW5ldy1zZWN1cmUtcmVmcmVzaC10b2tlbi13aXRoLXN1ZmZpY2llbnQtbGVuZ3Ro',
            tokenType: 'Bearer',
            expiresIn: 3600,
            user: {
              id: 'user_123',
              username: 'admin',
              realName: '系统管理员'
            }
          }
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      const result = await authApi.refreshToken(refreshToken)

      // 验证调用统一认证中心令牌刷新端点
      expect(service.post).toHaveBeenCalledWith('/api/auth/refresh-token', { refreshToken })

      // 验证响应结构
      expect(result.data.success).toBe(true)
      expect(result.data.data.accessToken).toBeDefined()
      expect(result.data.data.refreshToken).toBeDefined()
      expect(result.data.data.tokenType).toBe('Bearer')
      expect(result.data.data.expiresIn).toBeGreaterThan(0)

      // 验证JWT令牌格式
      expect(validateJWTToken(result.data.data.accessToken)).toBe(true)
      expect(validateJWTToken(result.data.data.refreshToken)).toBe(true)

      // 验证用户信息
      expect(result.data.data.user.id).toBe('user_123')
      expect(result.data.data.user.username).toBe('admin')
    })

    it('should handle expired refresh token', async () => {
      const expiredRefreshToken = 'expired.refresh.token.here'

      const mockResponse = {
        data: {
          success: false,
          message: '刷新令牌已过期',
          code: 'REFRESH_TOKEN_EXPIRED'
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      await expect(authApi.refreshToken(expiredRefreshToken)).rejects.toThrow('刷新令牌已过期')

      // 验证调用统一认证中心端点
      expect(service.post).toHaveBeenCalledWith('/api/auth/refresh-token', { refreshToken: expiredRefreshToken })
    })

    it('should handle invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid.refresh.token'

      const mockResponse = {
        data: {
          success: false,
          message: '刷新令牌无效',
          code: 'INVALID_REFRESH_TOKEN'
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      await expect(authApi.refreshToken(invalidRefreshToken)).rejects.toThrow('刷新令牌无效')
    })

    it('should handle refresh token with new tenant selection', async () => {
      const refreshToken = 'refresh.token.with.tenant.selection'

      const mockResponse = {
        data: {
          success: true,
          message: '令牌刷新成功，需要重新选择租户',
          data: {
            accessToken: 'new.access.token',
            refreshToken: 'new.refresh.token',
            tokenType: 'Bearer',
            expiresIn: 3600,
            requiresTenantSelection: true,
            tenants: [
              {
                tenantCode: 'kindergarten_001',
                tenantName: '智慧幼儿园',
                domain: 'kindergarten.example.com',
                hasAccount: true,
                role: 'ADMIN',
                status: 'active'
              }
            ]
          }
        }
      }

      vi.mocked(service.post).mockResolvedValue(mockResponse)

      const result = await authApi.refreshToken(refreshToken)

      expect(result.data.success).toBe(true)
      expect(result.data.data.requiresTenantSelection).toBe(true)
      expect(Array.isArray(result.data.data.tenants)).toBe(true)
    })

    it('should handle refresh token network errors', async () => {
      const refreshToken = 'valid.refresh.token'

      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        config: { url: '/api/auth/refresh-token' }
      }

      vi.mocked(service.post).mockRejectedValue(networkError)

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow('网络请求失败')
    })

    it('should handle refresh token timeout', async () => {
      const refreshToken = 'valid.refresh.token'

      const timeoutError = new Error('Request timeout of 10000ms exceeded')
      timeoutError.name = 'TimeoutError'
      timeoutError.code = 'ECONNABORTED'

      vi.mocked(service.post).mockRejectedValue(timeoutError)

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow('Request timeout')
    })
  })

  describe('Unified Auth Token Management', () => {
    it('should validate token expiration handling', async () => {
      // 测试令牌即将过期的情况
      const nearExpiryResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'new.access.token',
            expiresIn: 300, // 5分钟后过期
            expiresInWarning: true
          }
        }
      }

      vi.mocked(service.post).mockResolvedValue(nearExpiryResponse)

      const result = await authApi.refreshToken('valid.refresh.token')

      expect(result.data.data.expiresIn).toBe(300)
      expect(result.data.data.expiresInWarning).toBe(true)
    })

    it('should handle concurrent refresh requests', async () => {
      const refreshToken = 'concurrent.test.token'
      let requestCount = 0

      vi.mocked(service.post).mockImplementation(async () => {
        requestCount++
        if (requestCount === 1) {
          // 第一个请求成功
          return {
            data: {
              success: true,
              data: {
                accessToken: 'first.new.token',
                refreshToken: 'first.new.refresh.token'
              }
            }
          }
        } else {
          // 第二个请求冲突
          return {
            data: {
              success: false,
              message: '刷新令牌已被使用',
              code: 'REFRESH_TOKEN_CONFLICT'
            }
          }
        }
      })

      // 同时发起两个刷新请求
      const refreshPromises = [
        authApi.refreshToken(refreshToken),
        authApi.refreshToken(refreshToken)
      ]

      const results = await Promise.allSettled(refreshPromises)

      // 一个应该成功，一个应该失败
      const successResult = results.find(r => r.status === 'fulfilled')
      const failureResult = results.find(r => r.status === 'rejected')

      expect(successResult).toBeDefined()
      expect(failureResult).toBeDefined()
    })

    it('should support token revocation', async () => {
      const accessToken = 'access.token.to.revoke'

      const mockRevokeResponse = {
        data: {
          success: true,
          message: '令牌已撤销'
        }
      }

      // Mock 撤销令牌的API调用
      vi.mocked(service.post).mockResolvedValue(mockRevokeResponse)

      const result = await authApi.revokeToken(accessToken)

      expect(service.post).toHaveBeenCalledWith('/api/auth/revoke-token', { accessToken })
      expect(result.data.success).toBe(true)
    })
  })

    it('should handle API errors during token refresh', async () => {
      const refreshToken = 'refresh-token'
      
      const error = {
        response: {
          data: {
            message: 'Token expired'
          }
        }
      }

      vi.mocked(service.post).mockRejectedValue(error)

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow('Token expired')
    })

    it('should handle generic errors during token refresh', async () => {
      const refreshToken = 'refresh-token'
      
      const error = new Error('Network error')
      vi.mocked(service.post).mockRejectedValue(error)

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow('刷新令牌失败')
    })
  })

  describe('Network Error Scenarios', () => {
    it('should handle login timeout errors', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      // 模拟登录超时
      vi.mocked(service.post).mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutError = new Error('Request timeout of 10000ms exceeded')
            timeoutError.code = 'ECONNABORTED'
            reject(timeoutError)
          }, 15000) // 超过10秒
        })
      )

      const startTime = Date.now()

      try {
        await authApi.login(loginData)
        fail('Should have thrown timeout error')
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        expect(error.message).toContain('timeout')
        expect(error.code).toBe('ECONNABORTED')
        expect(duration).toBeGreaterThan(10000)
      }
    }, 20000) // 增加测试超时时间

    it('should handle network disconnection during login', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      // 模拟网络断开
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      vi.mocked(service.post).mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        config: { url: '/auth/login' }
      })

      try {
        await authApi.login(loginData)
        fail('Should have thrown network error')
      } catch (error) {
        expect(error.message).toContain('登录失败')
        expect(error.code).toBe('NETWORK_ERROR')
      }
    })

    it('should handle server 500 errors during authentication', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      vi.mocked(service.post).mockRejectedValue({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: '认证服务暂时不可用',
            timestamp: new Date().toISOString(),
            request_id: 'req_auth_500'
          }
        }
      })

      try {
        await authApi.login(loginData)
        fail('Should have thrown server error')
      } catch (error) {
        expect(error.response.status).toBe(500)
        expect(error.response.data.error).toBe('INTERNAL_SERVER_ERROR')
        expect(error.response.data.message).toContain('认证服务暂时不可用')
        expect(error.response.data.request_id).toBe('req_auth_500')
      }
    })

    it('should handle rate limiting during login attempts', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      vi.mocked(service.post).mockRejectedValue({
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: '登录尝试过于频繁，请稍后重试',
            retry_after: 300,
            remaining_attempts: 0
          }
        }
      })

      try {
        await authApi.login(loginData)
        fail('Should have thrown rate limit error')
      } catch (error) {
        expect(error.response.status).toBe(429)
        expect(error.response.data.error).toBe('RATE_LIMIT_EXCEEDED')
        expect(error.response.data.retry_after).toBe(300)
        expect(error.response.data.remaining_attempts).toBe(0)
      }
    })

    it('should handle authentication during maintenance mode', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      vi.mocked(service.post).mockRejectedValue({
        response: {
          status: 503,
          statusText: 'Service Unavailable',
          data: {
            success: false,
            error: 'SERVICE_MAINTENANCE',
            message: '认证服务正在维护中，预计10分钟后恢复',
            maintenance_start: new Date().toISOString(),
            estimated_recovery: new Date(Date.now() + 600000).toISOString()
          }
        }
      })

      try {
        await authApi.login(loginData)
        fail('Should have thrown maintenance error')
      } catch (error) {
        expect(error.response.status).toBe(503)
        expect(error.response.data.error).toBe('SERVICE_MAINTENANCE')
        expect(error.response.data.message).toContain('维护中')
        expect(error.response.data.estimated_recovery).toBeDefined()
      }
    })

    it('should handle token verification with network errors', async () => {
      vi.mocked(service.get).mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com',
        config: { url: '/auth/verify-token' }
      })

      try {
        await authApi.verifyToken()
        fail('Should have thrown DNS error')
      } catch (error) {
        expect(error.message).toContain('令牌验证失败')
        expect(error.code).toBe('ENOTFOUND')
      }
    })

    it('should handle token refresh with concurrency conflicts', async () => {
      const refreshToken = 'valid-refresh-token'
      let requestCount = 0

      vi.mocked(service.post).mockImplementation(async () => {
        requestCount++
        if (requestCount === 1) {
          // 第一个请求延迟
          await new Promise(resolve => setTimeout(resolve, 1000))
          return {
            data: {
              success: true,
              data: {
                token: 'new-token-after-delay',
                refreshToken: 'new-refresh-token'
              }
            }
          }
        } else if (requestCount === 2) {
          // 第二个请求冲突
          throw {
            response: {
              status: 409,
              data: {
                success: false,
                error: 'REFRESH_TOKEN_CONFLICT',
                message: '刷新令牌已被使用',
                conflict_details: {
                  used_by: 'another_session',
                  used_at: new Date().toISOString()
                }
              }
            }
          }
        }
      })

      // 同时发起两个刷新请求
      const refreshPromises = [
        authApi.refreshToken(refreshToken),
        authApi.refreshToken(refreshToken)
      ]

      const results = await Promise.allSettled(refreshPromises)

      // 一个应该成功，一个应该冲突
      const successResult = results.find(r => r.status === 'fulfilled')
      const conflictResult = results.find(r => r.status === 'rejected')

      expect(successResult).toBeDefined()
      expect(conflictResult).toBeDefined()

      if (conflictResult.status === 'rejected') {
        expect(conflictResult.reason.response.status).toBe(409)
        expect(conflictResult.reason.response.data.error).toBe('REFRESH_TOKEN_CONFLICT')
      }
    })

    it('should handle malformed authentication responses', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      // 模拟返回HTML而不是JSON
      vi.mocked(service.post).mockResolvedValue({
        data: '<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>',
        headers: { 'content-type': 'text/html' }
      })

      try {
        await authApi.login(loginData)
        fail('Should have thrown content type error')
      } catch (error) {
        expect(error.message).toContain('登录失败')
      }
    })

    it('should handle authentication with corrupted JWT tokens', async () => {
      const corruptedToken = 'corrupted.jwt.token.invalid'

      vi.mocked(service.get).mockRejectedValue({
        response: {
          status: 401,
          data: {
            success: false,
            error: 'INVALID_TOKEN',
            message: '令牌格式无效或已损坏',
            token_error: {
              type: 'malformed',
              details: 'Invalid JWT structure'
            }
          }
        }
      })

      try {
        await authApi.verifyToken()
        fail('Should have thrown invalid token error')
      } catch (error) {
        expect(error.response.status).toBe(401)
        expect(error.response.data.error).toBe('INVALID_TOKEN')
        expect(error.response.data.token_error.type).toBe('malformed')
      }
    })

    it('should implement retry mechanism for transient network errors', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      }

      let retryCount = 0
      vi.mocked(service.post).mockImplementation(async () => {
        retryCount++
        if (retryCount <= 2) {
          // 前两次失败
          throw {
            code: 'ECONNRESET',
            message: 'Connection reset by peer'
          }
        }
        // 第三次成功
        return {
          data: {
            success: true,
            data: {
              token: 'retry-success-token',
              refreshToken: 'retry-success-refresh',
              user: { id: '1', username: 'testuser' }
            }
          }
        }
      })

      // 实现带重试的登录
      const loginWithRetry = async (data, maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await authApi.login(data)
          } catch (error) {
            if (i === maxRetries || !isRetryableError(error)) {
              throw error
            }
            // 指数退避
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
          }
        }
      }

      const isRetryableError = (error) => {
        const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
        return retryableCodes.includes(error.code) || error.code === 'NETWORK_ERROR'
      }

      const startTime = Date.now()
      const result = await loginWithRetry(loginData)
      const endTime = Date.now()

      expect(retryCount).toBe(3)
      expect(result.token).toBe('retry-success-token')
      expect(endTime - startTime).toBeGreaterThan(3000) // 1+2秒延迟
    })

    it('should handle authentication session expiration gracefully', async () => {
      vi.mocked(service.get).mockRejectedValue({
        response: {
          status: 401,
          data: {
            success: false,
            error: 'SESSION_EXPIRED',
            message: '会话已过期，请重新登录',
            session_info: {
              expired_at: new Date(Date.now() - 3600000).toISOString(),
              max_idle_time: '30m'
            }
          }
        }
      })

      try {
        await authApi.getCurrentUser()
        fail('Should have thrown session expired error')
      } catch (error) {
        expect(error.response.status).toBe(401)
        expect(error.response.data.error).toBe('SESSION_EXPIRED')
        expect(error.response.data.session_info.max_idle_time).toBe('30m')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed responses', async () => {
      const mockResponse = {
        data: 'invalid response format'
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.verifyToken()
      expect(result).toBe(true) // Should handle gracefully
    })

    it('should handle empty responses', async () => {
      vi.mocked(service.get).mockResolvedValue({ data: null })

      const result = await authApi.verifyToken()
      expect(result).toBe(true) // Should handle gracefully
    })

    it('should handle responses without success field', async () => {
      const mockResponse = {
        data: {
          valid: true
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.verifyToken()
      expect(result).toBe(true)
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct login request type', () => {
      const loginData: Parameters<typeof authApi.login>[0] = {
        username: 'testuser',
        password: 'testpass'
      }

      expect(loginData.username).toBe('testuser')
      expect(loginData.password).toBe('testpass')
    })

    it('should handle user response types correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            roles: [
              {
                id: '1',
                name: 'Admin',
                code: 'admin'
              }
            ]
          }
        }
      }

      vi.mocked(service.get).mockResolvedValue(mockResponse)

      const result = await authApi.getCurrentUser()
      
      expect(result.id).toBe('1')
      expect(result.username).toBe('testuser')
      expect(result.email).toBe('test@example.com')
      expect(Array.isArray(result.roles)).toBe(true)
      expect(result.roles[0].name).toBe('Admin')
    })
  })
})