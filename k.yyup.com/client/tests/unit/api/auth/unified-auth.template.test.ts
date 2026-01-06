/**
 * 统一认证中心测试适配模板
 * 用于适配新的统一认证中心接口结构
 *
 * @author 统一认证中心测试适配专家
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateJWTFormat,
  validateEmailFormat,
  validatePhoneNumberFormat,
  expectNoConsoleErrors,
  startConsoleMonitoring,
  clearConsoleErrors
} from '../../../utils/data-validation'

// ========== 统一认证中心接口类型定义 ==========

/**
 * 统一认证登录请求
 */
export interface UnifiedAuthLoginRequest {
  phone: string;
  password: string;
  tenantCode?: string;
  clientId?: string;
  grantType?: string;
}

/**
 * 统一认证登录响应
 */
export interface UnifiedAuthLoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    user: UnifiedAuthUser;
    tenantInfo?: {
      tenantCode: string;
      tenantName: string;
      domain: string;
    };
    globalUserId?: string;
    requiresTenantSelection?: boolean;
    requiresTenantBinding?: boolean;
    tenants?: Array<UnifiedAuthTenant>;
  };
}

/**
 * 统一认证用户信息
 */
export interface UnifiedAuthUser {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  roles: Array<UnifiedAuthRole>;
  permissions: string[];
  orgInfo: {
    orgId: string;
    orgName: string;
    orgType: string;
  };
}

/**
 * 统一认证角色
 */
export interface UnifiedAuthRole {
  id: string;
  name: string;
  code: string;
  permissions: string[];
}

/**
 * 统一认证租户
 */
export interface UnifiedAuthTenant {
  tenantCode: string;
  tenantName: string;
  domain: string;
  hasAccount: boolean;
  role?: string;
  lastLoginAt?: string;
  loginCount: number;
  status: 'active' | 'suspended' | 'deleted';
}

// ========== Mock 数据模板 ==========

/**
 * 统一认证登录成功响应模板
 */
export const mockUnifiedAuthLoginSuccess: UnifiedAuthLoginResponse = {
  success: true,
  message: '登录成功',
  data: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6MTYxNjI0MjYyMn0.signature',
    refreshToken: 'dGhpcy1pcy1hLXZlcnktc2VjdXJlLXJlZnJlc2gtdG9rZW4td2l0aC1lbnVvdWdoLWxlbmd0aA',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
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
    },
    tenantInfo: {
      tenantCode: 'kindergarten_001',
      tenantName: '智慧幼儿园',
      domain: 'kindergarten.example.com'
    },
    globalUserId: 'global_user_123',
    requiresTenantSelection: false,
    requiresTenantBinding: false
  }
}

/**
 * 需要租户选择的登录响应
 */
export const mockUnifiedAuthRequiresTenantSelection: UnifiedAuthLoginResponse = {
  success: true,
  message: '登录成功，请选择租户',
  data: {
    user: {
      id: 'user_123',
      username: 'admin',
      realName: '系统管理员',
      email: 'admin@kindergarten.com',
      phone: '13800138000',
      status: 'active',
      roles: [],
      permissions: [],
      orgInfo: {
        orgId: '',
        orgName: '',
        orgType: ''
      }
    },
    globalUserId: 'global_user_123',
    requiresTenantSelection: true,
    requiresTenantBinding: false,
    tenants: [
      {
        tenantCode: 'kindergarten_001',
        tenantName: '智慧幼儿园',
        domain: 'kindergarten.example.com',
        hasAccount: true,
        role: 'ADMIN',
        lastLoginAt: '2024-01-01T10:00:00.000Z',
        loginCount: 15,
        status: 'active'
      },
      {
        tenantCode: 'kindergarten_002',
        tenantName: '阳光幼儿园',
        domain: 'sunshine.example.com',
        hasAccount: true,
        role: 'TEACHER',
        lastLoginAt: '2024-01-02T15:30:00.000Z',
        loginCount: 8,
        status: 'active'
      }
    ]
  }
}

/**
 * 统一认证失败响应
 */
export const mockUnifiedAuthLoginFailure = {
  success: false,
  message: '手机号或密码错误',
  code: 'INVALID_CREDENTIALS'
}

// ========== 验证工具函数 ==========

/**
 * 验证统一认证登录请求
 */
export function validateUnifiedAuthLoginRequest(request: UnifiedAuthLoginRequest): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // 验证必填字段
  if (!request.phone) {
    errors.push('手机号不能为空');
  } else if (!validatePhoneNumberFormat(request.phone)) {
    errors.push('手机号格式不正确');
  }

  if (!request.password) {
    errors.push('密码不能为空');
  } else if (request.password.length < 6) {
    errors.push('密码长度不能少于6位');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证统一认证登录响应
 */
export function validateUnifiedAuthLoginResponse(response: UnifiedAuthLoginResponse): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // 验证基本响应结构
  if (typeof response.success !== 'boolean') {
    errors.push('响应必须包含success字段');
  }

  if (!response.message || typeof response.message !== 'string') {
    errors.push('响应必须包含message字段');
  }

  if (response.success && response.data) {
    // 验证令牌字段
    const tokenFields = ['accessToken', 'tokenType', 'expiresIn'];
    for (const field of tokenFields) {
      if (!(field in response.data)) {
        errors.push(`响应缺少${field}字段`);
      }
    }

    // 验证令牌格式
    if (response.data.accessToken && !validateJWTFormat(response.data.accessToken)) {
      errors.push('访问令牌格式不正确');
    }

    if (response.data.refreshToken && !validateJWTFormat(response.data.refreshToken)) {
      errors.push('刷新令牌格式不正确');
    }

    // 验证用户信息
    const userValidation = validateUnifiedAuthUser(response.data.user);
    if (!userValidation.valid) {
      errors.push(...(userValidation.errors || []));
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证统一认证用户信息
 */
export function validateUnifiedAuthUser(user: UnifiedAuthUser): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // 验证必填字段
  const requiredFields = ['id', 'username', 'realName', 'email', 'phone', 'roles', 'permissions', 'orgInfo'];
  const requiredValidation = validateRequiredFields(user, requiredFields);
  if (!requiredValidation.valid) {
    errors.push(`用户缺少必填字段: ${requiredValidation.missing?.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(user, {
    id: 'string',
    username: 'string',
    realName: 'string',
    email: 'string',
    phone: 'string',
    status: 'string',
    roles: 'array',
    permissions: 'array',
    orgInfo: 'object'
  });
  if (!typeValidation.valid) {
    errors.push(`用户字段类型错误: ${typeValidation.errors?.join(', ')}`);
  }

  // 验证邮箱格式
  if (user.email && !validateEmailFormat(user.email)) {
    errors.push('邮箱格式不正确');
  }

  // 验证手机号格式
  if (user.phone && !validatePhoneNumberFormat(user.phone)) {
    errors.push('手机号格式不正确');
  }

  // 验证角色数组
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach((role, index) => {
      const roleValidation = validateUnifiedAuthRole(role);
      if (!roleValidation.valid) {
        errors.push(`角色${index}验证失败: ${roleValidation.errors?.join(', ')}`);
      }
    });
  }

  // 验证权限数组
  if (user.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach(permission => {
      if (typeof permission !== 'string') {
        errors.push('权限必须是字符串');
      }
    });
  }

  // 验证组织信息
  if (user.orgInfo) {
    const orgValidation = validateRequiredFields(user.orgInfo, ['orgId', 'orgName', 'orgType']);
    if (!orgValidation.valid) {
      errors.push(`组织信息缺少必填字段: ${orgValidation.missing?.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 验证统一认证角色
 */
export function validateUnifiedAuthRole(role: UnifiedAuthRole): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  const requiredFields = ['id', 'name', 'code', 'permissions'];
  const requiredValidation = validateRequiredFields(role, requiredFields);
  if (!requiredValidation.valid) {
    errors.push(`角色缺少必填字段: ${requiredValidation.missing?.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(role, {
    id: 'string',
    name: 'string',
    code: 'string',
    permissions: 'array'
  });
  if (!typeValidation.valid) {
    errors.push(`角色字段类型错误: ${typeValidation.errors?.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ========== 统一认证中心测试模板 ==========

/**
 * 统一认证中心完整测试套件模板
 */
export function createUnifiedAuthTestTemplate(authApi: any) {
  return describe('统一认证中心 - 完整测试', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      clearConsoleErrors();
      startConsoleMonitoring();
    });

    afterEach(() => {
      expectNoConsoleErrors();
    });

    describe('统一登录接口测试', () => {
      it('应该成功进行统一认证登录', async () => {
        // Arrange
        const loginRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'password123',
          tenantCode: 'kindergarten_001',
          clientId: 'kindergarten-admin',
          grantType: 'password'
        };

        // Mock API 响应
        const mockLogin = vi.fn().mockResolvedValue(mockUnifiedAuthLoginSuccess);
        authApi.unifiedLogin = mockLogin;

        // Act
        const result = await authApi.unifiedLogin(loginRequest);

        // Assert - API调用验证
        expect(mockLogin).toHaveBeenCalledWith(loginRequest);

        // Assert - 响应结构验证
        const responseValidation = validateUnifiedAuthLoginResponse(result);
        expect(responseValidation.valid).toBe(true);
        if (!responseValidation.valid) {
          throw new Error(`统一认证登录响应验证失败: ${responseValidation.errors?.join(', ')}`);
        }

        // Assert - 基本业务逻辑验证
        expect(result.success).toBe(true);
        expect(result.message).toBe('登录成功');
        expect(result.data).toBeDefined();

        // Assert - 令牌验证
        expect(result.data?.accessToken).toBeDefined();
        expect(result.data?.refreshToken).toBeDefined();
        expect(result.data?.tokenType).toBe('Bearer');
        expect(result.data?.expiresIn).toBeGreaterThan(0);

        // Assert - JWT令牌格式验证
        expect(validateJWTFormat(result.data?.accessToken || '')).toBe(true);
        expect(validateJWTFormat(result.data?.refreshToken || '')).toBe(true);

        // Assert - 用户信息验证
        const userValidation = validateUnifiedAuthUser(result.data?.user!);
        expect(userValidation.valid).toBe(true);

        // Assert - 租户信息验证
        expect(result.data?.tenantInfo).toBeDefined();
        expect(result.data?.tenantInfo?.tenantCode).toBe('kindergarten_001');
        expect(result.data?.tenantInfo?.tenantName).toBe('智慧幼儿园');

        // Assert - 全局用户ID验证
        expect(result.data?.globalUserId).toBe('global_user_123');

        // Assert - 租户选择状态验证
        expect(result.data?.requiresTenantSelection).toBe(false);
        expect(result.data?.requiresTenantBinding).toBe(false);
      });

      it('应该处理需要租户选择的登录场景', async () => {
        // Arrange
        const loginRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'password123'
          // 不提供tenantCode，触发租户选择
        };

        const mockLogin = vi.fn().mockResolvedValue(mockUnifiedAuthRequiresTenantSelection);
        authApi.unifiedLogin = mockLogin;

        // Act
        const result = await authApi.unifiedLogin(loginRequest);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.requiresTenantSelection).toBe(true);
        expect(result.data?.tenants).toBeDefined();
        expect(Array.isArray(result.data?.tenants)).toBe(true);
        expect(result.data?.tenants?.length).toBeGreaterThan(0);

        // 验证租户信息结构
        const tenant = result.data?.tenants?.[0];
        const tenantValidation = validateRequiredFields(tenant, [
          'tenantCode', 'tenantName', 'domain', 'hasAccount', 'status'
        ]);
        expect(tenantValidation.valid).toBe(true);
      });

      it('应该处理登录失败场景', async () => {
        // Arrange
        const invalidRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'wrongpassword'
        };

        const mockLogin = vi.fn().mockResolvedValue(mockUnifiedAuthLoginFailure);
        authApi.unifiedLogin = mockLogin;

        // Act
        const result = await authApi.unifiedLogin(invalidRequest);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('手机号或密码错误');
      });

      it('应该验证登录请求格式', async () => {
        // 测试无效手机号
        const invalidPhoneRequest: UnifiedAuthLoginRequest = {
          phone: 'invalid-phone',
          password: 'password123'
        };

        const phoneValidation = validateUnifiedAuthLoginRequest(invalidPhoneRequest);
        expect(phoneValidation.valid).toBe(false);
        expect(phoneValidation.errors).toContain('手机号格式不正确');

        // 测试空密码
        const emptyPasswordRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: ''
        };

        const passwordValidation = validateUnifiedAuthLoginRequest(emptyPasswordRequest);
        expect(passwordValidation.valid).toBe(false);
        expect(passwordValidation.errors).toContain('密码不能为空');

        // 测试密码过短
        const shortPasswordRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: '123'
        };

        const shortPasswordValidation = validateUnifiedAuthLoginRequest(shortPasswordRequest);
        expect(shortPasswordValidation.valid).toBe(false);
        expect(shortPasswordValidation.errors).toContain('密码长度不能少于6位');
      });
    });

    describe('灵活登录接口测试', () => {
      it('应该支持多种登录方式', async () => {
        // 测试手机号登录
        const phoneLoginRequest = {
          phone: '13800138000',
          password: 'password123'
        };

        const mockFlexibleLogin = vi.fn().mockResolvedValue(mockUnifiedAuthLoginSuccess);
        authApi.flexibleLogin = mockFlexibleLogin;

        const phoneResult = await authApi.flexibleLogin(phoneLoginRequest);
        expect(mockFlexibleLogin).toHaveBeenCalledWith(phoneLoginRequest);
        expect(phoneResult.success).toBe(true);

        // 测试用户名登录（向后兼容）
        const usernameLoginRequest = {
          username: 'admin',
          password: 'password123'
        };

        const usernameResult = await authApi.flexibleLogin(usernameLoginRequest);
        expect(mockFlexibleLogin).toHaveBeenCalledWith(usernameLoginRequest);
        expect(usernameResult.success).toBe(true);
      });
    });

    describe('用户租户管理测试', () => {
      it('应该获取用户关联的租户列表', async () => {
        // Arrange
        const tenantRequest = {
          phone: '13800138000',
          password: 'password123'
        };

        const mockTenantResponse = {
          success: true,
          message: '获取租户列表成功',
          data: {
            globalUserId: 'global_user_123',
            phone: '13800138000',
            tenants: [
              {
                tenantCode: 'kindergarten_001',
                tenantName: '智慧幼儿园',
                domain: 'kindergarten.example.com',
                hasAccount: true,
                role: 'ADMIN',
                lastLoginAt: '2024-01-01T10:00:00.000Z',
                loginCount: 15,
                status: 'active'
              }
            ]
          }
        };

        const mockGetUserTenants = vi.fn().mockResolvedValue(mockTenantResponse);
        authApi.getUserTenants = mockGetUserTenants;

        // Act
        const result = await authApi.getUserTenants(tenantRequest);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.tenants).toBeDefined();
        expect(Array.isArray(result.data?.tenants)).toBe(true);
        expect(result.data?.tenants?.length).toBeGreaterThan(0);
      });

      it('应该绑定用户到租户', async () => {
        // Arrange
        const bindRequest = {
          globalUserId: 'global_user_123',
          tenantCode: 'kindergarten_001',
          role: 'TEACHER',
          permissions: ['students:read', 'classes:read']
        };

        const mockBindResponse = {
          success: true,
          message: '绑定成功',
          data: {
            tenantUserId: 'tenant_user_123',
            globalUserId: 'global_user_123',
            tenantCode: 'kindergarten_001',
            role: 'TEACHER'
          }
        };

        const mockBindUserToTenant = vi.fn().mockResolvedValue(mockBindResponse);
        authApi.bindUserToTenant = mockBindUserToTenant;

        // Act
        const result = await authApi.bindUserToTenant(bindRequest);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.tenantUserId).toBeDefined();
        expect(result.data?.role).toBe('TEACHER');
      });
    });

    describe('统一认证健康检查测试', () => {
      it('应该检查统一认证服务健康状态', async () => {
        // Arrange
        const mockHealthResponse = {
          success: true,
          data: {
            status: 'healthy',
            message: '统一认证服务运行正常',
            latency: 45,
            timestamp: new Date().toISOString()
          }
        };

        const mockCheckHealth = vi.fn().mockResolvedValue(mockHealthResponse);
        authApi.checkUnifiedAuthHealth = mockCheckHealth;

        // Act
        const result = await authApi.checkUnifiedAuthHealth();

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.status).toBe('healthy');
        expect(typeof result.data?.latency).toBe('number');
      });

      it('应该获取统一认证配置', async () => {
        // Arrange
        const mockConfigResponse = {
          success: true,
          data: {
            config: {
              supportedLoginTypes: ['phone', 'username', 'email'],
              tokenExpiration: 3600,
              refreshTokenExpiration: 86400
            },
            available: true,
            timestamp: new Date().toISOString()
          }
        };

        const mockGetConfig = vi.fn().mockResolvedValue(mockConfigResponse);
        authApi.getUnifiedAuthConfig = mockGetConfig;

        // Act
        const result = await authApi.getUnifiedAuthConfig();

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.available).toBe(true);
        expect(result.data?.config).toBeDefined();
      });
    });

    describe('错误处理测试', () => {
      it('应该处理网络错误', async () => {
        // Arrange
        const loginRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'password123'
        };

        const networkError = new Error('Network Error');
        const mockLogin = vi.fn().mockRejectedValue(networkError);
        authApi.unifiedLogin = mockLogin;

        // Act & Assert
        await expect(authApi.unifiedLogin(loginRequest)).rejects.toThrow('Network Error');
      });

      it('应该处理API错误响应', async () => {
        // Arrange
        const loginRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'password123'
        };

        const apiError = {
          response: {
            status: 401,
            data: {
              success: false,
              message: '认证失败',
              code: 'AUTH_FAILED'
            }
          }
        };

        const mockLogin = vi.fn().mockRejectedValue(apiError);
        authApi.unifiedLogin = mockLogin;

        // Act & Assert
        await expect(authApi.unifiedLogin(loginRequest)).rejects.toThrow();
      });
    });

    describe('数据一致性测试', () => {
      it('应该确保用户信息在各个接口中保持一致', async () => {
        // Arrange
        const loginRequest: UnifiedAuthLoginRequest = {
          phone: '13800138000',
          password: 'password123',
          tenantCode: 'kindergarten_001'
        };

        // Mock登录响应
        const mockLogin = vi.fn().mockResolvedValue(mockUnifiedAuthLoginSuccess);
        authApi.unifiedLogin = mockLogin;

        // Mock获取用户信息响应
        const mockUserInfo = vi.fn().mockResolvedValue({
          success: true,
          data: mockUnifiedAuthLoginSuccess.data?.user
        });
        authApi.getUserInfo = mockUserInfo;

        // Act
        const loginResult = await authApi.unifiedLogin(loginRequest);
        const userInfoResult = await authApi.getUserInfo();

        // Assert - 确保用户信息一致
        expect(loginResult.data?.user.id).toBe(userInfoResult.data?.id);
        expect(loginResult.data?.user.username).toBe(userInfoResult.data?.username);
        expect(loginResult.data?.user.phone).toBe(userInfoResult.data?.phone);
      });
    });
  });
}

// ========== 导出常用测试数据 ==========

export const unifiedAuthTestData = {
  validLoginRequests: [
    {
      phone: '13800138000',
      password: 'password123',
      tenantCode: 'kindergarten_001'
    },
    {
      phone: '15912345678',
      password: 'test123456',
      clientId: 'kindergarten-mobile',
      grantType: 'password'
    }
  ],

  invalidLoginRequests: [
    {
      phone: 'invalid-phone',
      password: 'password123'
    },
    {
      phone: '13800138000',
      password: '' // 空密码
    },
    {
      phone: '13800138000',
      password: '123' // 密码过短
    }
  ],

  tenantCodes: ['kindergarten_001', 'kindergarten_002', 'sunshine_kindergarten'],

  userRoles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],

  permissions: [
    'system:read', 'system:write', 'user:manage',
    'students:read', 'classes:read', 'activities:read'
  ]
};