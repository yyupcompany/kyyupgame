import service from './interceptors';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './endpoints';

// ========== 统一认证接口定义 ==========

/**
 * 统一认证登录请求参数
 */
export interface UnifiedLoginRequest {
  phone: string;
  password: string;
  tenantCode?: string;
}

/**
 * 统一认证登录响应
 */
export interface UnifiedLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user: User;
    tenantInfo?: {
      tenantCode: string;
      tenantName: string;
    };
    globalUserId?: string;
    requiresTenantSelection?: boolean;
    requiresTenantBinding?: boolean;
    tenants?: Array<{
      tenantCode: string;
      tenantName: string;
      domain: string;
      hasAccount: boolean;
      role?: string;
      lastLoginAt?: string;
      loginCount: number;
      status: 'active' | 'suspended' | 'deleted';
    }>;
  };
}

/**
 * 获取用户租户列表请求
 */
export interface GetUserTenantsRequest {
  phone: string;
  password: string;
}

/**
 * 获取用户租户列表响应
 */
export interface GetUserTenantsResponse {
  success: boolean;
  message: string;
  data?: {
    globalUserId: string;
    phone: string;
    tenants: Array<{
      tenantCode: string;
      tenantName: string;
      domain: string;
      hasAccount: boolean;
      role?: string;
      lastLoginAt?: string;
      loginCount: number;
      status: 'active' | 'suspended' | 'deleted';
    }>;
  };
}

/**
 * 绑定用户到租户请求
 */
export interface BindTenantRequest {
  globalUserId: string;
  tenantCode: string;
  role?: string;
  permissions?: string[];
  // 用户信息
  phone?: string;
  realName?: string;
  // 教师/家长特有字段
  kindergartenId?: number;
  classId?: number;
  teacherTitle?: string;
  teachingSubjects?: string[];
  // 家长特有字段
  childName?: string;
  childRelation?: string;
  // token用于后续操作
  token?: string;
}

/**
 * 绑定用户到租户响应
 */
export interface BindTenantResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      globalUserId: string;
      phone: string;
      realName: string;
      role: string;
      status: string;
      authSource: string;
    };
    tenantInfo: {
      tenantCode: string;
      tenantName: string;
    };
    approvalStatus: string;
    hasFullAccess: boolean;
  };
}

/**
 * 用户登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 用户信息接口
 */
export interface User {
  id: string | number;
  username: string;
  email?: string;
  realName?: string;
  phone?: string;
  role?: string;
  roles?: Array<{
    id: string | number;
    name: string;
    code: string;
  }>;
  permissions?: string[];
  status?: number;
}

/**
 * 用户登录响应
 */
export interface LoginResponse {
  success?: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/**
 * 认证API服务
 */
export const authApi = {
  /**
   * 用户登录
   * @param data 登录信息
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await service.post(AUTH_ENDPOINTS.LOGIN, data);
      
      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        // 新格式：{ success: true, data: { token, user }, message }
        if (response.data.success) {
          return {
            success: true,
            token: response.data.data?.token || response.data.token,
            refreshToken: response.data.data?.refreshToken || response.data.refreshToken,
            user: response.data.data?.user || response.data.user,
            message: response.data.message
          };
        } else {
          throw new Error(response.data.message || '登录失败');
        }
      } else {
        // 旧格式：{ token, user }
        return {
          success: true,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user
        };
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      
      // 提取错误信息
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '登录失败，请检查用户名和密码';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * 验证令牌
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await service.get(AUTH_ENDPOINTS.VERIFY_TOKEN);
      
      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        return response.data.success && (response.data.data?.valid ?? response.data.valid);
      } else {
        return response.data.valid ?? true;
      }
    } catch (error) {
      console.error('令牌验证失败:', error);
      return false;
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    try {
      // 先尝试 /me 端点
      let response;
      try {
        response = await service.get(USER_ENDPOINTS.GET_PROFILE); // Using profile endpoint as 'me' equivalent
      } catch (meError: any) {
        console.warn('尝试 /me 端点失败，使用 /profile 端点:', meError.message);
        // 如果 /me 失败，尝试 /profile 端点
        response = await service.get(USER_ENDPOINTS.GET_PROFILE);
      }
      
      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return response.data.data || response.data.user;
        } else {
          throw new Error(response.data.message || '获取用户信息失败');
        }
      } else {
        return response.data.user || response.data;
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '获取用户信息失败';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await service.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error: any) {
      console.error('登出失败:', error);
      // 即使API调用失败，也不抛出错误，因为本地清理更重要
    } finally {
      // 无论API是否成功，都清除本地存储的令牌
      localStorage.removeItem('kindergarten_token');
    }
  },

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    try {
      const response = await service.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
      
      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return {
            token: response.data.data?.token || response.data.token,
            refreshToken: response.data.data?.refreshToken || response.data.refreshToken
          };
        } else {
          throw new Error(response.data.message || '刷新令牌失败');
        }
      } else {
        return {
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
      }
    } catch (error: any) {
      console.error('刷新令牌失败:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '刷新令牌失败';
      
      throw new Error(errorMessage);
    }
  },

  // ========== 统一认证API方法 ==========

  /**
   * 统一认证登录
   */
  async unifiedLogin(data: UnifiedLoginRequest): Promise<UnifiedLoginResponse> {
    try {
      const response = await service.post('/api/auth/unified-login', data);

      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || '登录成功',
            data: response.data.data
          };
        } else {
          throw new Error(response.data.message || '统一认证登录失败');
        }
      } else {
        return {
          success: true,
          message: '登录成功',
          data: response.data
        };
      }
    } catch (error: any) {
      console.error('统一认证登录失败:', error);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '统一认证登录失败';

      throw new Error(errorMessage);
    }
  },

  /**
   * 灵活登录（支持多种登录方式）
   */
  async flexibleLogin(data: UnifiedLoginRequest | LoginRequest): Promise<UnifiedLoginResponse | LoginResponse> {
    try {
      const response = await service.post('/api/auth/flexible-login', data);

      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || '登录成功',
            data: response.data.data
          };
        } else {
          throw new Error(response.data.message || '登录失败');
        }
      } else {
        return {
          success: true,
          message: '登录成功',
          data: response.data
        };
      }
    } catch (error: any) {
      console.error('灵活登录失败:', error);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '登录失败';

      throw new Error(errorMessage);
    }
  },

  /**
   * 获取用户关联的租户列表
   */
  async getUserTenants(data: GetUserTenantsRequest): Promise<GetUserTenantsResponse> {
    try {
      const response = await service.post('/api/auth/user-tenants', data);

      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || '获取租户列表成功',
            data: response.data.data
          };
        } else {
          throw new Error(response.data.message || '获取租户列表失败');
        }
      } else {
        return {
          success: true,
          message: '获取租户列表成功',
          data: response.data
        };
      }
    } catch (error: any) {
      console.error('获取租户列表失败:', error);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '获取租户列表失败';

      throw new Error(errorMessage);
    }
  },

  /**
   * 绑定用户到租户
   */
  async bindUserToTenant(data: BindTenantRequest): Promise<BindTenantResponse> {
    try {
      const response = await service.post('/api/auth/bind-tenant', data);

      // 处理不同的响应格式
      if (response.data.success !== undefined) {
        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || '绑定成功',
            data: response.data.data
          };
        } else {
          throw new Error(response.data.message || '绑定失败');
        }
      } else {
        return {
          success: true,
          message: '绑定成功',
          data: response.data
        };
      }
    } catch (error: any) {
      console.error('绑定用户到租户失败:', error);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '绑定失败';

      throw new Error(errorMessage);
    }
  },

  /**
   * 检查统一认证健康状态
   */
  async checkUnifiedAuthHealth(): Promise<{
    success: boolean;
    data?: {
      status: string;
      message: string;
      latency?: number;
      timestamp: string;
    };
    message?: string;
  }> {
    try {
      const response = await service.get('/api/auth/unified-health');

      return {
        success: true,
        data: response.data,
        message: response.data?.message || '健康检查成功'
      };
    } catch (error: any) {
      console.error('统一认证健康检查失败:', error);

      return {
        success: false,
        message: error.response?.data?.message ||
                  error.response?.data?.error ||
                  error.message ||
                  '健康检查失败'
      };
    }
  },

  /**
   * 获取统一认证配置
   */
  async getUnifiedAuthConfig(): Promise<{
    success: boolean;
    data?: {
      config?: any;
      available?: boolean;
      timestamp: string;
    };
    message?: string;
  }> {
    try {
      const response = await service.get('/api/auth/unified-config');

      return {
        success: true,
        data: response.data,
        message: response.data?.message || '获取配置成功'
      };
    } catch (error: any) {
      console.error('获取统一认证配置失败:', error);

      return {
        success: false,
        message: error.response?.data?.message ||
                  error.response?.data?.error ||
                  error.message ||
                  '获取配置失败'
      };
    }
  }
}; 