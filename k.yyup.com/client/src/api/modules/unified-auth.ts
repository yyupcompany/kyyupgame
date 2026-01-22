import requestInstance, { type ApiResponse } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const UNIFIED_AUTH_ENDPOINTS = {
  LOGIN_WITH_CODE: `${API_PREFIX}/auth/login-with-code`,
  LOGIN: `${API_PREFIX}/auth/login`,
  SEND_CODE: `${API_PREFIX}/auth/send-code`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  LOGOUT: `${API_PREFIX}/auth/logout`
} as const;

export interface UnifiedAuthParams {
  phone: string;
  password: string;
  tenantCode?: string;
}

export interface TraditionalAuthParams {
  username: string;
  password: string;
}

export interface UnifiedAuthResponse {
  token: string;
  globalUserId: number;
  user: any;
  tenants?: any[];
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  token?: string;
}

/**
 * 统一认证登录 - 用于手机号登录
 */
export function loginWithUnifiedAuth(data: UnifiedAuthParams): Promise<ApiResponse<UnifiedAuthResponse>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.LOGIN_WITH_CODE, data);
}

/**
 * 传统登录 - 也通过统一认证系统处理
 */
export function loginWithTraditionalAuth(data: TraditionalAuthParams): Promise<ApiResponse<AuthResponse>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.LOGIN, data);
}

/**
 * 统一认证验证码登录
 */
export function loginWithCode(data: {
  phone: string;
  code: string;
  password: string;
  role: string;
}): Promise<ApiResponse<UnifiedAuthResponse>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.LOGIN_WITH_CODE, data);
}

/**
 * 发送验证码
 */
export function sendVerificationCode(data: {
  phone: string;
  type: string;
}): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.SEND_CODE, data);
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.REFRESH, { refreshToken });
}

/**
 * 登出
 */
export function logout(): Promise<ApiResponse<{ success: boolean }>> {
  return requestInstance.post(UNIFIED_AUTH_ENDPOINTS.LOGOUT);
}