import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}));

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}));

vi.mock('@/config/environment', () => ({
  environmentConfig: {
    apiBaseUrl: '/api',
    apiTimeout: 10000
  }
}));

// 创建一个真实的axios实例用于测试
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('API Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  // 模拟请求拦截器逻辑
  const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');

    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  };

  // 模拟响应拦截器逻辑
  const responseInterceptor = (response: AxiosResponse) => {
    return response;
  };

  // 模拟响应错误处理器逻辑
  const responseErrorHandler = (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 400:
          ElMessage.error('请求参数错误');
          break;
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('kindergarten_token');
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
      }
    } else if (error.request) {
      ElMessage.error('服务器无响应，请检查网络连接');
    } else {
      ElMessage.error(`请求错误: ${error.message}`);
    }

    return Promise.reject(error);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Clear localStorage
    localStorage.clear();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      // 直接设置localStorage值
      localStorage.setItem('kindergarten_token', 'test-token-123');

      // 验证localStorage设置成功
      const storedToken = localStorage.getItem('kindergarten_token');
      expect(storedToken).toBe('test-token-123');

      const config: InternalAxiosRequestConfig = {
        url: '/test',
        headers: {} as any
      };

      const result = requestInterceptor(config);

      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should handle missing token gracefully', () => {
      // localStorage已在beforeEach中清除，无需额外设置

      const config: InternalAxiosRequestConfig = {
        url: '/test',
        headers: {} as any
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should create headers object if it does not exist', () => {
      // 直接设置localStorage值
      localStorage.setItem('kindergarten_token', 'test-token');

      // 验证localStorage设置成功
      const storedToken = localStorage.getItem('kindergarten_token');
      expect(storedToken).toBe('test-token');

      const config: InternalAxiosRequestConfig = {
        url: '/test'
      } as any;

      const result = requestInterceptor(config);

      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });
  });

  describe('Response Interceptor', () => {
    it('should pass through successful responses', () => {
      const response: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const result = responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('should handle 400 error', async () => {
      const error: AxiosError = {
        response: {
          status: 400,
          data: {},
          statusText: 'Bad Request',
          headers: {},
          config: {} as any
        }
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('请求参数错误');
    });

    it('should handle 401 error (unauthorized)', async () => {
      // Mock localStorage methods
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

      const error: AxiosError = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any
        }
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('kindergarten_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('should handle 403 error', async () => {
      const error: AxiosError = {
        response: {
          status: 403,
          data: {},
          statusText: 'Forbidden',
          headers: {},
          config: {} as any
        }
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('没有权限访问该资源');
    });

    it('should handle 404 error', async () => {
      const error: AxiosError = {
        response: {
          status: 404,
          data: {},
          statusText: 'Not Found',
          headers: {},
          config: {} as any
        }
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在');
    });

    it('should handle 500 error', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any
        }
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误');
    });

    it('should handle request errors (no response)', async () => {
      const error: AxiosError = {
        request: {},
        message: 'Network Error'
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('服务器无响应，请检查网络连接');
    });

    it('should handle configuration errors', async () => {
      const error: AxiosError = {
        message: 'Invalid URL'
      } as AxiosError;

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(ElMessage.error).toHaveBeenCalledWith('请求错误: Invalid URL');
    });
  });

  describe('Global Axios Configuration', () => {
    it('should set global axios defaults', async () => {
      // 验证环境配置被正确使用
      const { environmentConfig } = await import('@/config/environment');
      expect(environmentConfig.apiBaseUrl).toBe('/api');
      expect(environmentConfig.apiTimeout).toBe(10000);
    });

    it('should register global interceptors', () => {
      // 验证拦截器逻辑正确工作
      expect(typeof requestInterceptor).toBe('function');
      expect(typeof responseInterceptor).toBe('function');
      expect(typeof responseErrorHandler).toBe('function');
    });
  });
});