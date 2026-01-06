/**
 * Mobile模块专用API客户端配置
 *
 * 提供针对移动端优化的HTTP客户端配置
 * 使用统一的端点常量和环境变量管理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/api/endpoints/base';
import mobileConfig from '@/aimobile/config/mobile.config';
import { MOBILE_API_ENDPOINTS, MobileEndpointUtils, MOBILE_CACHE_STRATEGIES } from './endpoints';

/**
 * Mobile API客户端类
 */
class MobileApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: mobileConfig.api.baseURL,
      timeout: mobileConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'kindergarten-mobile',
        'X-App-Version': process.env.VITE_APP_VERSION || '1.0.0',
      }
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加移动端特有的请求头
        config.headers = {
          ...config.headers,
          'X-Platform': 'mobile',
          'X-Timestamp': Date.now().toString(),
        };

        // 添加缓存控制头
        const endpointCategory = MobileEndpointUtils.getEndpointCategory(config.url || '');
        const cacheStrategy = MOBILE_CACHE_STRATEGIES[endpointCategory.toUpperCase() as keyof typeof MOBILE_CACHE_STRATEGIES];

        if (cacheStrategy) {
          config.headers['Cache-Control'] = cacheStrategy.strategy === 'cache-first'
            ? `max-age=${Math.floor(cacheStrategy.ttl / 1000)}`
            : 'no-cache';
        }

        // 添加认证token
        const token = localStorage.getItem('mobile-auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[Mobile API] ${config.method?.toUpperCase()} ${config.url}`, {
          category: endpointCategory,
          cacheStrategy: cacheStrategy?.strategy,
        });

        return config;
      },
      (error) => {
        console.error('[Mobile API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`[Mobile API] Response ${response.config.method?.toUpperCase()} ${response.config.url}:`, {
          status: response.status,
          success: response.data.success,
        });

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        console.error('[Mobile API] Response error:', {
          url: originalRequest?.url,
          status: error.response?.status,
          message: error.message,
        });

        // Token过期自动刷新
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.success) {
              const newToken = refreshResponse.data.token;
              localStorage.setItem('mobile-auth-token', newToken);

              // 重新发送原始请求
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            console.error('[Mobile API] Token refresh failed:', refreshError);
            // 跳转到登录页
            window.location.href = '/mobile/login';
          }
        }

        // 网络错误重试
        if (error.code === 'NETWORK_ERROR' && !originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        if (error.code === 'NETWORK_ERROR' && originalRequest._retryCount < mobileConfig.api.retryAttempts) {
          originalRequest._retryCount++;
          console.log(`[Mobile API] Retrying request (${originalRequest._retryCount}/${mobileConfig.api.retryAttempts}):`, originalRequest.url);

          // 延迟重试
          await new Promise(resolve => setTimeout(resolve, mobileConfig.api.retryDelay));
          return this.instance(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 刷新认证token
   */
  private async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = localStorage.getItem('mobile-refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${mobileConfig.api.baseURL}/auth/refresh-token`, {
      refreshToken
    });

    return response.data;
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * 文件上传
   */
  async upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };

    const response = await this.instance.post<ApiResponse<T>>(url, formData, uploadConfig);
    return response.data;
  }

  /**
   * 批量请求
   */
  async batch<T = any>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    data?: any;
    config?: AxiosRequestConfig;
  }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map(async ({ method, url, data, config }) => {
      switch (method) {
        case 'GET':
          return this.get<T>(url, config);
        case 'POST':
          return this.post<T>(url, data, config);
        case 'PUT':
          return this.put<T>(url, data, config);
        case 'DELETE':
          return this.delete<T>(url, config);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });

    return Promise.all(promises);
  }
}

// 创建并导出Mobile API客户端实例
export const mobileApi = new MobileApiClient();

/**
 * 便捷的API调用函数 - 使用统一端点
 */
export const mobileApiCalls = {
  // ==================== 认证相关 ====================
  auth: {
    login: (credentials: { username: string; password: string }) =>
      mobileApi.post(MOBILE_API_ENDPOINTS.AUTH.LOGIN, credentials),

    logout: () =>
      mobileApi.post(MOBILE_API_ENDPOINTS.AUTH.LOGOUT),

    getUserInfo: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.AUTH.USER_INFO),

    refreshToken: (refreshToken: string) =>
      mobileApi.post(MOBILE_API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }),
  },

  // ==================== 用户信息 ====================
  user: {
    getProfile: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.USER.PROFILE),

    updateProfile: (data: any) =>
      mobileApi.put(MOBILE_API_ENDPOINTS.USER.UPDATE_PROFILE, data),
  },

  // ==================== 仪表盘 ====================
  dashboard: {
    getStats: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.DASHBOARD.STATS),

    getOverview: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.DASHBOARD.OVERVIEW),

    getTodos: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.DASHBOARD.TODOS),

    getSchedules: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.DASHBOARD.SCHEDULES),
  },

  // ==================== 学生管理 ====================
  student: {
    getList: (params?: any) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.STUDENT.LIST, { params }),

    getById: (id: string | number) =>
      mobileApi.get(`${MOBILE_API_ENDPOINTS.STUDENT.BASE}/${id}`),

    search: (query: string) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.STUDENT.SEARCH, { params: { q: query } }),

    getGrowthRecords: (id: string | number) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.STUDENT.GROWTH_RECORDS(id)),
  },

  // ==================== 班级管理 ====================
  class: {
    getList: (params?: any) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.CLASS.LIST, { params }),

    getById: (id: string | number) =>
      mobileApi.get(`${MOBILE_API_ENDPOINTS.CLASS.BASE}/${id}`),

    getStudents: (id: string | number) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.CLASS.GET_STUDENTS(id)),

    getTeachers: (id: string | number) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.CLASS.GET_TEACHERS(id)),
  },

  // ==================== 活动管理 ====================
  activity: {
    getList: (params?: any) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.ACTIVITY.LIST, { params }),

    getById: (id: string | number) =>
      mobileApi.get(`${MOBILE_API_ENDPOINTS.ACTIVITY.BASE}/${id}`),

    getRegistrations: (params?: any) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.ACTIVITY.REGISTRATIONS, { params }),
  },

  // ==================== AI功能 ====================
  ai: {
    getConversations: () =>
      mobileApi.get(MOBILE_API_ENDPOINTS.AI.CONVERSATIONS),

    sendMessage: (conversationId: string | number, message: string) =>
      mobileApi.post(MOBILE_API_ENDPOINTS.AI.SEND_MESSAGE(conversationId), { message }),

    getStudentRecommendations: (studentId: string | number) =>
      mobileApi.get(MOBILE_API_ENDPOINTS.AI.STUDENT_RECOMMENDATIONS(studentId)),
  },

  // ==================== 文件上传 ====================
  upload: {
    file: (file: File) =>
      mobileApi.upload(MOBILE_API_ENDPOINTS.UPLOAD.FILE, file),

    image: (file: File) =>
      mobileApi.upload(MOBILE_API_ENDPOINTS.UPLOAD.IMAGE, file),

    avatar: (file: File) =>
      mobileApi.upload(MOBILE_API_ENDPOINTS.UPLOAD.AVATAR, file),
  }
} as const;

// TypeScript类型定义
export type MobileApiInstance = MobileApiClient;
export type MobileApiCalls = typeof mobileApiCalls;

// 导出API实例和便捷调用函数
export default mobileApi;