/**
 * 认证相关API端点
 * 注意：所有路径使用相对路径（不带前导斜杠），因为 request.ts 的 baseURL 已经包含了 /api
 */
import { API_PREFIX } from './base';

// 认证相关接口
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}auth/login`,
  REGISTER: `${API_PREFIX}auth/register`,
  LOGOUT: `${API_PREFIX}auth/logout`,
  REFRESH_TOKEN: `${API_PREFIX}auth/refresh-token`,
  VERIFY_TOKEN: `${API_PREFIX}auth/verify-token`,
  FORGOT_PASSWORD: `${API_PREFIX}auth/forgot-password`,
  RESET_PASSWORD: `${API_PREFIX}auth/reset-password`,
  CHANGE_PASSWORD: `${API_PREFIX}auth/change-password`,
  USER_INFO: `${API_PREFIX}auth/me`,
} as const;