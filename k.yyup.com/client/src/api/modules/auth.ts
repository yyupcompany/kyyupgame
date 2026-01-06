import { get, post, ApiResponse } from '@/utils/request';
import { AUTH_ENDPOINTS } from '@/api/endpoints';

/**
 * 用户登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 用户登录响应
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
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
  };
}

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return post(AUTH_ENDPOINTS.LOGIN, data);
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse> {
    return post(AUTH_ENDPOINTS.LOGOUT);
  },

  /**
   * 获取用户信息
   */
  getUserInfo(): Promise<ApiResponse<LoginResponse['user']>> {
    return get(AUTH_ENDPOINTS.USER_INFO);
  },

  /**
   * 刷新Token
   */
  refreshToken(data: { refreshToken: string }): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    return post(AUTH_ENDPOINTS.REFRESH_TOKEN, data);
  }
};

// 兼容性导出
export const login = authApi.login;
export const logout = authApi.logout;
export const getUserInfo = authApi.getUserInfo;
export const refreshToken = authApi.refreshToken;