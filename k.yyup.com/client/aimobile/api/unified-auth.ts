/**
 * 移动端统一认证API模块
 * 集成PC端统一认证系统的完整功能
 */

// 移动端使用PC端的request工具，通过相对路径导入
import { get, post, ApiResponse } from '../../utils/request'
import { CallingLogger, type LogContext } from '../../src/utils/CallingLogger'

// ===== 接口类型定义 =====

export interface AuthenticateRequest {
  phone: string;
  password: string;
  registrationSource?: 'web' | 'mobile' | 'admin' | 'tenant_creation';
  clientIp?: string;
  userAgent?: string;
}

export interface AuthenticateResponse {
  success: boolean;
  message: string;
  data?: {
    globalUserId: string;
    phone: string;
    realName?: string;
    email?: string;
    isNewUser: boolean;
    token?: string;
    refreshToken?: string;
  };
}

export interface RegisterRequest {
  phone: string;
  password: string;
  realName?: string;
  email?: string;
  registrationSource?: 'web' | 'mobile' | 'admin' | 'tenant_creation';
  clientIp?: string;
  userAgent?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    globalUserId: string;
    phone: string;
    realName?: string;
    email?: string;
  };
}

export interface FindUserTenantsRequest {
  phone: string;
  password?: string;
  globalUserId?: string;
}

export interface TenantInfo {
  tenantCode: string;
  tenantName: string;
  domain: string;
  hasAccount: boolean;
  role?: string;
  lastLoginAt?: string;
  loginCount: number;
  status: 'active' | 'suspended' | 'deleted';
}

export interface FindUserTenantsResponse {
  success: boolean;
  message: string;
  data?: {
    phone: string;
    globalUserId: string;
    tenants: TenantInfo[];
  };
}

export interface BindTenantRequest {
  globalUserId: string;
  tenantCode: string;
  role?: string;
  permissions?: string[];
}

export interface BindTenantResponse {
  success: boolean;
  message: string;
  data?: {
    tenantUserId: string;
    globalUserId: string;
    tenantCode: string;
    role: string;
  };
}

export interface UserStats {
  globalUserId: string;
  phone: string;
  realName?: string;
  tenantCount: number;
  totalLoginCount: number;
  lastLoginAt?: string;
  activeTenants: string[];
}

export interface VerificationCodeRequest {
  phone: string;
  type: 'login' | 'register' | 'reset_password';
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  data?: {
    codeId: string;
    expiresIn: number;
  };
}

export interface LoginWithCodeRequest {
  phone: string;
  code: string;
  password?: string; // 设置密码（可选）
  role?: 'parent' | 'teacher' | 'admin'; // 用户角色
  autoRegister?: boolean; // 自动注册
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
  };
}

// ===== API 端点常量 =====

// 外部服务端点常量
const EXTERNAL_ENDPOINTS = {
  IP_SERVICE: 'https://api.ipify.org?format=json'
} as const;

const UNIFIED_AUTH_ENDPOINTS = {
  BASE: '/api/unified-auth',

  // 认证相关
  AUTHENTICATE: '/api/unified-auth/authenticate',
  LOGIN_WITH_CODE: '/api/auth/login-with-code',
  SEND_CODE: '/api/auth/send-code',

  // 注册相关
  REGISTER: '/api/unified-auth/register',

  // 租户相关
  FIND_TENANTS: '/api/unified-auth/find-tenants',
  BIND_TENANT: '/api/unified-auth/bind-tenant',

  // 用户相关
  USER_STATS: '/api/unified-auth/user-stats',

  // Token相关
  VERIFY_TOKEN: '/api/unified-auth/verify-token',
  REFRESH_TOKEN: '/api/unified-auth/refresh-token'
} as const;

// ===== API 接口实现 =====

/**
 * 移动端统一认证API类
 */
/**
 * 创建API相关的日志上下文
 */
const createApiContext = (operation: string, additionalContext?: any): LogContext => {
  return CallingLogger.createApiContext('/unified-auth', operation, {
    platform: 'mobile',
    module: 'AUTH_API',
    ...additionalContext
  })
}

export class MobileUnifiedAuthAPI {
  private static instance: MobileUnifiedAuthAPI;

  public static getInstance(): MobileUnifiedAuthAPI {
    if (!MobileUnifiedAuthAPI.instance) {
      MobileUnifiedAuthAPI.instance = new MobileUnifiedAuthAPI();
    }
    return MobileUnifiedAuthAPI.instance;
  }

  /**
   * 用户认证（手机号+密码）
   */
  async authenticate(request: AuthenticateRequest): Promise<ApiResponse<AuthenticateResponse>> {
    const loggerContext = createApiContext('authenticate', { phone: request.phone })

    try {
      // 添加移动端标识
      const requestData: AuthenticateRequest = {
        ...request,
        registrationSource: request.registrationSource || 'mobile',
        clientIp: request.clientIp || await this.getClientIP(),
        userAgent: request.userAgent || this.getUserAgent()
      };

      CallingLogger.logApiCall(loggerContext, UNIFIED_AUTH_ENDPOINTS.AUTHENTICATE, 'POST', {
        phone: requestData.phone,
        registrationSource: requestData.registrationSource,
        clientIp: requestData.clientIp
      })

      const startTime = Date.now()
      const response = await post<AuthenticateResponse>(
        UNIFIED_AUTH_ENDPOINTS.AUTHENTICATE,
        requestData
      );
      const duration = Date.now() - startTime

      if (response.success) {
        CallingLogger.logSuccess(loggerContext, '移动端统一认证成功', {
          phone: request.phone,
          duration: `${duration}ms`,
          hasToken: !!response.data?.token
        })
      } else {
        CallingLogger.logWarn(loggerContext, '移动端统一认证返回失败状态', {
          phone: request.phone,
          message: response.message,
          duration: `${duration}ms`
        })
      }

      return response;

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '移动端统一认证失败', error, { phone: request.phone })
      throw this.handleError(error);
    }
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(request: VerificationCodeRequest): Promise<ApiResponse<VerificationCodeResponse>> {
    const loggerContext = createApiContext('sendVerificationCode', { phone: request.phone, type: request.type })

    try {
      CallingLogger.logInfo(loggerContext, '发送验证码请求', { phone: request.phone, type: request.type })

      const startTime = Date.now()
      const response = await post<VerificationCodeResponse>(
        UNIFIED_AUTH_ENDPOINTS.SEND_CODE,
        request
      );
      const duration = Date.now() - startTime

      if (response.success) {
        CallingLogger.logSuccess(loggerContext, '验证码发送成功', {
          phone: request.phone,
          type: request.type,
          duration: `${duration}ms`
        })
      } else {
        CallingLogger.logWarn(loggerContext, '验证码发送返回失败状态', {
          phone: request.phone,
          type: request.type,
          message: response.message,
          duration: `${duration}ms`
        })
      }

      return response;

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '发送验证码失败', error, { phone: request.phone, type: request.type })
      throw this.handleError(error);
    }
  }

  /**
   * 验证码登录（支持自动注册）
   */
  async loginWithCode(request: LoginWithCodeRequest): Promise<ApiResponse<AuthenticateResponse>> {
    const loggerContext = createApiContext('loginWithCode', {
      phone: request.phone,
      role: request.role,
      autoRegister: request.autoRegister
    })

    try {
      CallingLogger.logAuth(loggerContext, '验证码登录请求', {
        phone: request.phone,
        role: request.role,
        autoRegister: request.autoRegister
      })

      const startTime = Date.now()
      const response = await post<AuthenticateResponse>(
        UNIFIED_AUTH_ENDPOINTS.LOGIN_WITH_CODE,
        request
      );
      const duration = Date.now() - startTime

      if (response.success) {
        CallingLogger.logSuccess(loggerContext, '验证码登录成功', {
          phone: request.phone,
          role: request.role,
          duration: `${duration}ms`,
          hasToken: !!response.data?.token
        })
      } else {
        CallingLogger.logWarn(loggerContext, '验证码登录返回失败状态', {
          phone: request.phone,
          role: request.role,
          message: response.message,
          duration: `${duration}ms`
        })
      }

      return response;

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '验证码登录失败', error, {
        phone: request.phone,
        role: request.role
      })
      throw this.handleError(error);
    }
  }

  /**
   * 用户注册
   */
  async register(request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const loggerContext = createApiContext('register', { phone: request.phone })

    try {
      const requestData: RegisterRequest = {
        ...request,
        registrationSource: request.registrationSource || 'mobile',
        clientIp: request.clientIp || await this.getClientIP(),
        userAgent: request.userAgent || this.getUserAgent()
      };

      CallingLogger.logInfo(loggerContext, '移动端用户注册请求', {
        phone: requestData.phone,
        realName: requestData.realName,
        registrationSource: requestData.registrationSource
      })

      const startTime = Date.now()
      const response = await post<RegisterResponse>(
        UNIFIED_AUTH_ENDPOINTS.REGISTER,
        requestData
      );
      const duration = Date.now() - startTime

      if (response.success) {
        CallingLogger.logSuccess(loggerContext, '移动端用户注册成功', {
          phone: request.phone,
          realName: request.realName,
          duration: `${duration}ms`
        })
      } else {
        CallingLogger.logWarn(loggerContext, '移动端用户注册返回失败状态', {
          phone: request.phone,
          message: response.message,
          duration: `${duration}ms`
        })
      }

      return response;

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '移动端用户注册失败', error, { phone: request.phone })
      throw this.handleError(error);
    }
  }

  /**
   * 查找用户关联的租户
   */
  async findUserTenants(request: FindUserTenantsRequest): Promise<ApiResponse<FindUserTenantsResponse>> {
    try {
      CallingLogger.logInfo(createApiContext('findUserTenants'), '查找用户租户请求', {
        phone: request.phone,
        hasGlobalUserId: !!request.globalUserId
      });

      const response = await post<FindUserTenantsResponse>(
        UNIFIED_AUTH_ENDPOINTS.FIND_TENANTS,
        request
      );

      CallingLogger.logSuccess(createApiContext('findUserTenants'), '查找用户租户成功', { tenantCount: response.data?.tenants?.length });
      return response;

    } catch (error: any) {
      CallingLogger.logError(createApiContext('findUserTenants'), '查找用户租户失败', error, { phone: request.phone });
      throw this.handleError(error);
    }
  }

  /**
   * 绑定用户到租户
   */
  async bindUserToTenant(request: BindTenantRequest): Promise<ApiResponse<BindTenantResponse>> {
    try {
      CallingLogger.logInfo(createApiContext('bindUserToTenant'), '绑定用户到租户请求', {
        globalUserId: request.globalUserId,
        tenantCode: request.tenantCode,
        role: request.role
      });

      const response = await post<BindTenantResponse>(
        UNIFIED_AUTH_ENDPOINTS.BIND_TENANT,
        request
      );

      CallingLogger.logSuccess(createApiContext('bindUserToTenant'), '绑定用户到租户成功', { tenantCode: response.data?.tenant?.tenantCode });
      return response;

    } catch (error: any) {
      CallingLogger.logError(createApiContext('bindUserToTenant'), '绑定用户到租户失败', error, { tenantCode: request.tenantCode });
      throw this.handleError(error);
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(globalUserId: string): Promise<ApiResponse<UserStats | null>> {
    try {
      CallingLogger.logInfo(createApiContext('getUserStats'), '获取用户统计信息', { globalUserId });

      const response = await get<UserStats | null>(
        `${UNIFIED_AUTH_ENDPOINTS.USER_STATS}/${globalUserId}`
      );

      CallingLogger.logSuccess(createApiContext('getUserStats'), '获取用户统计信息成功', { hasData: !!response.data });
      return response;

    } catch (error: any) {
      CallingLogger.logError(createApiContext('getUserStats'), '获取用户统计信息失败', error, { globalUserId });
      throw this.handleError(error);
    }
  }

  /**
   * 验证Token
   */
  async verifyToken(token: string): Promise<ApiResponse<any>> {
    try {
      CallingLogger.logAuth(createApiContext('verifyToken'), '验证Token请求');

      const response = await post<any>(
        UNIFIED_AUTH_ENDPOINTS.VERIFY_TOKEN,
        { token }
      );

      CallingLogger.logSuccess(createApiContext('verifyToken'), 'Token验证成功', { valid: response.data?.valid });
      return response;

    } catch (error: any) {
      CallingLogger.logError(createApiContext('verifyToken'), 'Token验证失败', error);
      throw this.handleError(error);
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(request: TokenRefreshRequest): Promise<ApiResponse<TokenRefreshResponse>> {
    try {
      CallingLogger.logAuth(createApiContext('refreshToken'), '刷新Token请求');

      const response = await post<TokenRefreshResponse>(
        UNIFIED_AUTH_ENDPOINTS.REFRESH_TOKEN,
        request
      );

      CallingLogger.logSuccess(createApiContext('refreshToken'), 'Token刷新成功', { hasToken: !!response.data?.token });
      return response;

    } catch (error: any) {
      CallingLogger.logError(createApiContext('refreshToken'), 'Token刷新失败', error);
      throw this.handleError(error);
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 获取客户端IP地址
   */
  private async getClientIP(): Promise<string> {
    try {
      // 在移动端，可以通过第三方服务获取IP
      const response = await fetch(EXTERNAL_ENDPOINTS.IP_SERVICE);
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      CallingLogger.logWarn(createApiContext('getClientIP'), '获取客户端IP失败', error);
      return 'mobile_client';
    }
  }

  /**
   * 获取用户代理信息
   */
  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'Mobile App';
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    // 统一错误处理
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('移动端统一认证服务异常');
    }
  }
}

// ===== 导出单例实例 =====

export const mobileUnifiedAuthAPI = MobileUnifiedAuthAPI.getInstance();

// ===== 导出便捷函数 =====

export const authenticate = (request: AuthenticateRequest) =>
  mobileUnifiedAuthAPI.authenticate(request);

export const sendVerificationCode = (request: VerificationCodeRequest) =>
  mobileUnifiedAuthAPI.sendVerificationCode(request);

export const loginWithCode = (request: LoginWithCodeRequest) =>
  mobileUnifiedAuthAPI.loginWithCode(request);

export const register = (request: RegisterRequest) =>
  mobileUnifiedAuthAPI.register(request);

export const findUserTenants = (request: FindUserTenantsRequest) =>
  mobileUnifiedAuthAPI.findUserTenants(request);

export const bindUserToTenant = (request: BindTenantRequest) =>
  mobileUnifiedAuthAPI.bindUserToTenant(request);

export const getUserStats = (globalUserId: string) =>
  mobileUnifiedAuthAPI.getUserStats(globalUserId);

export const verifyToken = (token: string) =>
  mobileUnifiedAuthAPI.verifyToken(token);

export const refreshToken = (request: TokenRefreshRequest) =>
  mobileUnifiedAuthAPI.refreshToken(request);

// ===== 导出类型定义 =====

export type {
  AuthenticateRequest,
  AuthenticateResponse,
  RegisterRequest,
  RegisterResponse,
  FindUserTenantsRequest,
  FindUserTenantsResponse,
  TenantInfo,
  BindTenantRequest,
  BindTenantResponse,
  UserStats,
  VerificationCodeRequest,
  VerificationCodeResponse,
  LoginWithCodeRequest,
  TokenRefreshRequest,
  TokenRefreshResponse
};

// 默认导出
export default mobileUnifiedAuthAPI;