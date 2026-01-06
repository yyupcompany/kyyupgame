/**
 * API请求配置
 * 
 * 统一管理API请求的配置，避免硬编码端口号等值
 */

import env from '../env';
import { AxiosHeaders } from 'axios';
import { AUTH_ENDPOINTS /*, SYSTEM_ENDPOINTS*/ } from '../api/endpoints';

/**
 * API配置
 */
export const API_CONFIG = {
  // API请求域名从环境变量获取
  API_DOMAIN: env.apiBaseUrl,
  
  // 登录API端点
  LOGIN_URL: AUTH_ENDPOINTS.LOGIN,
  
  // 认证请求头参数名
  TOKEN_HEADER: 'Authorization',
  
  // 认证Token前缀
  TOKEN_PREFIX: 'Bearer ',
  
  // 基础URL配置
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout || 10000,
  
  // 开发服务器端口
  devServerPort: 3000,
  
  
  // 跨域配置
  withCredentials: false,
  corsHeaders: {
    'Access-Control-Allow-Origin': '*'
  }
};

/**
 * 认证配置
 */
export const AUTH_CONFIG = {
  // 获取Token的方法
  getToken: () => {
    const token = localStorage.getItem('kindergarten_token');
    if (token && token.trim() !== '') {
      return token;
    }
    return null;
  },
  
  // 保存Token的方法
  setToken: (token: string) => {
    localStorage.setItem('kindergarten_token', token);
  },
  
  // 清除Token的方法
  removeToken: () => {
    localStorage.removeItem('kindergarten_token');
  },
  
  // 获取刷新Token的方法
  getRefreshToken: (): string => {
    return localStorage.getItem('refreshToken') || '';
  },
  
  // 保存刷新Token的方法
  setRefreshToken: (token: string) => {
    localStorage.setItem('refreshToken', token);
  },
  
  // 移除刷新Token的方法
  removeRefreshToken: () => {
    localStorage.removeItem('refreshToken');
  },
  
  // 构建API URL的方法
  buildApiUrl: (url: string): string => {
    // 如果是完整URL，直接返回
    if (url.startsWith('http')) {
      return url
    }
    // 否则返回相对路径，让axios的baseURL处理
    return url
  }
};

/**
 * 错误处理配置
 */
export const ERROR_CONFIG = {
  // 显示所有错误消息
  showAllErrors: false,
  
  // 静默的错误状态码
  silentStatusCodes: [401, 403],
  
  // 需要尝试自动刷新token的状态码
  refreshTokenStatusCodes: [401]
};

/**
 * 创建请求头
 */
export function createHeaders(headers: Record<string, string>): AxiosHeaders {
  const axiosHeaders = new AxiosHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    axiosHeaders.set(key, value);
  });
  return axiosHeaders;
}

export default {
  API_CONFIG,
  AUTH_CONFIG,
  ERROR_CONFIG,
  createHeaders
}; 