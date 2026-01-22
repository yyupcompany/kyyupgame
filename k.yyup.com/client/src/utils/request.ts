// import axios from 'axios'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig /*, AxiosRequestHeaders, AxiosInstance*/ } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'
import env from '../env'
// import { API_CONFIG, AUTH_CONFIG, createHeaders } from './request-config'
import { ErrorHandler } from './errorHandler'
import { tokenStorage } from './token-storage'
// import TimeoutConfigManager from '@/config/timeout-config'
// 临时禁用超时配置管理器导入以避免编译错误
const TimeoutConfigManager = {
  getTimeoutByUrl: (url: string) => {
    if (url.includes('/ai/') || url.includes('/ai-')) return 600000;
    if (url.includes('/upload') || url.includes('/file')) return 300000;
    if (url.includes('/download') || url.includes('/export')) return 600000;
    return 10000;
  },
  getTimeoutByType: (type: string) => {
    switch (type) {
      case 'DEFAULT': return 10000;
      case 'AI_ANALYSIS': return 600000;
      case 'VIDEO_CREATION': return 180000;
      case 'AI_CHAT': return 120000;
      case 'UPLOAD': return 300000;
      case 'DOWNLOAD': return 600000;
      default: return 10000;
    }
  }
};

// 用于防止重复跳转登录页和重复显示错误消息
let isRedirectingToLogin = false;
let lastErrorTime = 0;
const ERROR_THROTTLE_TIME = 3000; // 3秒内不重复显示相同类型的错误
let isProcessing401 = false; // 401错误处理标志

// ================================
// Token刷新锁机制 - 防止并发刷新
// ================================

/**
 * 刷新锁标志
 */
let isRefreshing = false;

/**
 * 等待token刷新的订阅者队列
 */
type TokenSubscriber = (token: string) => void;
const refreshSubscribers: TokenSubscriber[] = [];

/**
 * 添加订阅者到队列
 */
function addRefreshSubscriber(callback: TokenSubscriber): void {
  refreshSubscribers.push(callback);
}

/**
 * Token刷新成功后，通知所有订阅者
 */
function onRefreshed(token: string): void {
  refreshSubscribers.forEach(callback => callback(token));
  // 清空订阅者队列
  refreshSubscribers.length = 0;
}

/**
 * 带锁的token刷新函数
 * 确保同时只有一个刷新请求在进行
 */
async function refreshTokenWithLock(): Promise<string> {
  // 如果正在刷新，返回Promise等待刷新完成
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
      // 设置超时，避免无限等待
      setTimeout(() => {
        reject(new Error('Token刷新超时'));
      }, 5000);
    });
  }

  // 开始刷新
  isRefreshing = true;

  try {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      console.warn('⚠️ 没有找到refresh token，尝试使用当前token续期');
      // 如果没有refreshToken，检查当前token是否还有效
      const currentToken = tokenStorage.getToken();
      if (!currentToken) {
        throw new Error('没有找到认证token');
      }
      // 当前token无法自动续期，需要重新登录
      throw new Error('Token已过期，请重新登录');
    }

    console.log('📝 使用refresh token刷新认证...');

    const refreshUrl = `${getApiBaseURL().replace(/\/$/, '')}/api/auth/refresh-token`;
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok || !refreshData.success) {
      throw new Error(refreshData.message || 'Token刷新失败');
    }

    // 更新token（使用抽象层）
    const newToken = refreshData.data.token;
    tokenStorage.setToken(newToken);

    if (refreshData.data.refreshToken) {
      tokenStorage.setRefreshToken(refreshData.data.refreshToken);
    }

    console.log('✅ Token刷新成功');

    // 通知所有订阅者
    onRefreshed(newToken);

    return newToken;
  } finally {
    // 无论成功或失败，都释放锁
    isRefreshing = false;
  }
}

// 统一对齐全局类型定义，避免多处定义不一致
import type { ApiResponse as GlobalApiResponse } from '../types/api'
export type ApiResponse<T = any> = GlobalApiResponse<T>

// 扩展Axios请求配置类型，增加元数据
interface RequestConfig extends Partial<InternalAxiosRequestConfig> {
  metadata?: {
    startTime: number;
  };
}

// 智能API基础URL检测 - 使用环境配置
const getApiBaseURL = (): string => {
  /**
   * 关键修复：
   * - 之前开发环境默认走 Vite 代理（/api），但当本地端口/代理状态异常时会出现请求“挂住直到超时”，导致移动端页面黑屏。
   * - PC/移动端共用同一套 request，如果代理不稳定，我们直接走后端 http://localhost:3000，保证接口可用。
   */
  if (typeof window === 'undefined') {
    return env.apiBaseUrl || '/api'
  }

  // 开发环境：优先直连后端（避免代理不稳定导致超时黑屏）
  if (env.isDevelopment) {
    const host = window.location.hostname || 'localhost'
    return `http://${host}:3000`
  }

  // 生产/其它环境：使用环境配置（默认 /api，同域）
  return env.apiBaseUrl || '/api'
};

// 创建axios实例
// ⚠️ 修复：baseURL设置为空字符串，因为endpoints.ts中的路径已经包含'/api'前缀
const service = axios.create({
  baseURL: '', // ✅ 修复：从 '/api' 改为 ''，让路径自己包含/api前缀
  timeout: TimeoutConfigManager.getTimeoutByType('DEFAULT'),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// 创建AI专用的axios实例，使用更长的超时时间
const aiService = axios.create({
  baseURL: '', // ✅ 修复：与service保持一致
  timeout: TimeoutConfigManager.getTimeoutByType('AI_ANALYSIS'),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// 创建视频创作专用的axios实例，使用较长超时时间
const videoCreationService = axios.create({
  baseURL: '', // ✅ 修复：与service保持一致
  timeout: TimeoutConfigManager.getTimeoutByType('VIDEO_CREATION'),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// AI服务请求拦截器
aiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = tokenStorage.getToken()

    // 移除模拟token逻辑，使用真实认证

    // 只有在有有效token时才添加Authorization头
    if (token) {
      if (!config.headers) {
        config.headers = {} as any
      }
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('AI请求头中的认证token:', token.substring(0, 20) + '...');
    } else {
      console.warn('AI服务：没有找到认证token，请求可能会失败');
    }

    // 添加时间戳防止缓存（仅对GET请求）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    console.log('发送AI请求:', config.method?.toUpperCase(), config.url, config.params || config.data);

    return config
  },
  (error: AxiosError) => {
    console.error('AI Request error:', error)
    return Promise.reject(error)
  }
)

// AI服务响应拦截器
aiService.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 处理后端标准响应格式 { success: boolean, data?: T, message?: string, error?: {...} }
    if (data && typeof data.success === 'boolean') {
      if (!data.success) {
        // 构造错误对象以便 ErrorHandler 处理
        const error = {
          response: {
            data: data,
            status: response.status
          }
        }

        // 使用 ErrorHandler 统一处理业务错误（包括401）
        ErrorHandler.handle(error, true)

        const errMsg = typeof data.error === 'string' ? data.error : data.error?.message
        const errorMessage = errMsg || data.message || 'AI服务错误'
        return Promise.reject(new Error(errorMessage))
      }

      // 成功响应，直接返回标准格式
      return data
    }

    // 处理后端兼容格式 { code: number, data?: T, message?: string }
    if (data && typeof data.code === 'number') {
      // 2xx状态码都认为是成功的
      if (data.code < 200 || data.code >= 300) {
        const errMsg = typeof data.error === 'string' ? data.error : data.error?.message
        const errorMessage = errMsg || data.message || 'AI服务错误'

        // 构造错误对象以便 ErrorHandler 处理
        const error = {
          response: {
            data: data,
            status: response.status
          }
        }

        ErrorHandler.handle(error, true)
        return Promise.reject(new Error(errorMessage))
      }

      // 成功响应，转换为标准格式
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    }

    // 其他格式直接返回
    return data
  },
  async (error: AxiosError) => {
    console.error('AI Response error:', error)

    // 检查是否是401错误，尝试刷新token
    const is401Error = error.response?.status === 401;
    const errorData = error.response?.data as any;

    if (is401Error) {
      // 如果已经在处理401错误，直接拒绝，避免重复处理
      if (isProcessing401) {
        console.warn('⚠️ AI服务：401错误正在处理中，跳过重复处理');
        return Promise.reject(error);
      }

      const isTokenExpired = errorData?.error?.code === 'TOKEN_EXPIRED' ||
                            errorData?.message?.includes('过期') ||
                            errorData?.message?.includes('expired') ||
                            errorData?.error === 'INVALID_CREDENTIALS' ||
                            true; // 所有401都尝试刷新token

      if (isTokenExpired) {
        // 设置处理标志
        isProcessing401 = true;

        console.warn('🔄 AI服务：尝试自动刷新token...');

        try {
          // 使用带锁的刷新函数
          const newToken = await refreshTokenWithLock();

          console.log('✅ AI服务：Token刷新成功，重试原请求');

          // 重试原请求
          const originalRequest = error.config;
          if (originalRequest) {
            // 兼容Axios类型
            originalRequest.headers = (originalRequest.headers || {}) as any;
            (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
            // 重置处理标志
            isProcessing401 = false;
            return aiService.request(originalRequest as any);
          }
        } catch (refreshError) {
          console.error('❌ AI服务：Token刷新失败:', refreshError);

          // Token刷新失败，跳转到登录页（只执行一次）
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            ElMessage.warning('会话已超时，请重新登录');

            // 清除用户信息和token（使用抽象层）
            const userStore = useUserStore();
            userStore.clearUserInfo();

            // 清除所有相关的本地存储
            tokenStorage.removeToken();
            tokenStorage.removeRefreshToken();
            localStorage.removeItem('userInfo');

            // 跳转到登录页
            setTimeout(() => {
              router.push('/login').finally(() => {
                setTimeout(() => {
                  isRedirectingToLogin = false;
                  isProcessing401 = false;
                }, 1000);
              });
            }, 1000);
          }
        }
      }
    }

    // 检查是否是网络错误（服务器未启动）
    const isNetworkError = !error.response && error.request;
    const currentTime = Date.now();

    if (isNetworkError) {
      // 网络错误，静默处理，避免刷屏
      if (currentTime - lastErrorTime > ERROR_THROTTLE_TIME) {
        console.warn('⚠️ AI服务连接失败，请检查后端服务是否启动');
        lastErrorTime = currentTime;
      }
      return Promise.reject(error);
    }

    // 使用 ErrorHandler 统一处理错误（但避免重复显示）
    if (currentTime - lastErrorTime > ERROR_THROTTLE_TIME) {
      ErrorHandler.handle(error, true);
      lastErrorTime = currentTime;
    } else {
      // 静默处理，只记录日志
      ErrorHandler.handle(error, false);
    }

    return Promise.reject(error)
  }
)

// 重试配置
const maxRetries = 1; // 减少重试次数，避免长时间等待



// 重试机制函数（修改版）
const retryRequest = async <T = any>(
  requestFn: () => Promise<T>,
  retryCount: number = 0
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: any) {
    // 检查是否应该重试
    if (retryCount >= maxRetries || !shouldRetry(error)) {
      console.error(`请求失败，已重试${retryCount}次:`, error.message);
      throw error;
    }
    
    // 其他错误直接重试
    console.warn(`请求失败，立即进行第${retryCount + 1}次重试:`, error.message);
    return retryRequest(requestFn, retryCount + 1);
  }
};


// 判断是否应该重试
const shouldRetry = (error: any): boolean => {
  // 网络错误应该重试
  if (!error.response) {
    return true;
  }
  
  // 5xx服务器错误应该重试
  if (error.response.status >= 500) {
    return true;
  }
  
  // 408请求超时应该重试
  if (error.response.status === 408) {
    return true;
  }
  
  // 429限流错误应该重试
  if (error.response.status === 429) {
    return true;
  }
  
  // 502, 503, 504 网关错误应该重试
  if ([502, 503, 504].includes(error.response.status)) {
    return true;
  }
  
  // 4xx客户端错误不应该重试（除了408, 429）
  return false;
};



// 构建完整的API URL
const buildApiUrl = (url: string): string => {
  // 如果是完整URL，直接返回
  if (url.startsWith('http')) return url

  const base = getApiBaseURL()

  // base 为相对路径（例如 /api）：交给当前域名（可能是生产同域或开发代理）
  if (base.startsWith('/')) return url

  // base 为绝对地址（开发环境直连 http://localhost:3000）：拼接
  const baseNormalized = base.replace(/\/$/, '')
  const urlNormalized = url.startsWith('/') ? url : `/${url}`
  // 如果URL已经包含/api前缀，就不再添加
  if (urlNormalized.startsWith('/api')) {
    return `${baseNormalized}${urlNormalized}`
  }
  return `${baseNormalized}/api${urlNormalized}`
}

// 请求拦截器 - 优化版本，避免导航超时
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = tokenStorage.getToken()

    // 移除模拟token逻辑，使用真实认证

    // 只有在有有效token时才添加Authorization头
    if (token) {
      if (!config.headers) {
        config.headers = {} as any
      }
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('请求头中的认证token:', token.substring(0, 20) + '...');
    } else {
      console.warn('没有找到认证token，请求可能会失败');
    }
    
    // 添加时间戳防止缓存（仅对GET请求）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.params || config.data);
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 按照后端规范处理响应
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 处理后端标准响应格式 { success: boolean, data?: T, message?: string, error?: {...} }
    if (data && typeof data.success === 'boolean') {
      if (!data.success) {
        // 构造错误对象以便 ErrorHandler 处理
        const error = {
          response: {
            data: data,
            status: response.status
          }
        }
        
        // 使用 ErrorHandler 统一处理业务错误（包括401）
        ErrorHandler.handle(error, true)
        
        const errMsg = typeof data.error === 'string' ? data.error : data.error?.message
        const errorMessage = errMsg || data.message || 'Error'
        return Promise.reject(new Error(errorMessage))
      }
      
      // 成功响应，直接返回标准格式
      return data
    }
    
    // 处理后端兼容格式 { code: number, data?: T, message?: string }
    if (data && typeof data.code === 'number') {
      // 2xx状态码都认为是成功的
      if (data.code < 200 || data.code >= 300) {
        const errMsg = typeof data.error === 'string' ? data.error : data.error?.message
        const errorMessage = errMsg || data.message || 'Error'

        // 构造错误对象以便 ErrorHandler 处理
        const error = {
          response: {
            data: data,
            status: data.code
          }
        }
        
        // 使用 ErrorHandler 统一处理错误（包括401）
        ErrorHandler.handle(error, true)
        
        return Promise.reject(new Error(errorMessage))
      }
      
      // 转换为标准格式
      return {
        success: true,
        data: data.data,
        message: data.message || 'Success'
      }
    }
    
    // 处理 {rows, count} 格式（学生API等）
    if (data && typeof data === 'object' && 'rows' in data && 'count' in data) {
      return {
        success: true,
        data: {
          items: data.rows,
          total: data.count
        },
        message: 'Success'
      }
    }

    // 处理 {data: [...], message: "..."} 格式（家长API等）
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data) && 'message' in data) {
      return {
        success: true,
        data: {
          items: data.data,
          total: data.data.length
        },
        message: data.message || 'Success'
      }
    }

    // 其他情况，包装为标准格式
    return {
      success: true,
      data: data,
      message: 'Success'
    }
  },
  async (error: AxiosError) => {
    // 检查是否是会话超时或token过期
    const is401Error = error.response?.status === 401;
    const errorData = error.response?.data as any;

    // 处理会话超时和token过期
    if (is401Error) {
      // 如果已经在处理401错误，直接拒绝，避免重复处理
      if (isProcessing401) {
        console.warn('⚠️ 401错误正在处理中，跳过重复处理');
        return Promise.reject(error);
      }

      console.warn('🔐 检测到401错误，可能是会话超时或token过期');

      // 检查是否是token过期的具体错误
      const isTokenExpired = errorData?.error?.code === 'TOKEN_EXPIRED' ||
                            errorData?.message?.includes('过期') ||
                            errorData?.message?.includes('expired') ||
                            errorData?.error === 'INVALID_CREDENTIALS' ||
                            true; // 所有401都尝试刷新token

      if (isTokenExpired) {
        // 设置处理标志
        isProcessing401 = true;

        console.warn('🔄 尝试自动刷新token...');

        try {
          // 使用带锁的刷新函数
          const newToken = await refreshTokenWithLock();

          console.log('✅ Token刷新成功，重试原请求');

          // 重试原请求
          const originalRequest = error.config;
          if (originalRequest) {
            // 兼容Axios类型
            originalRequest.headers = (originalRequest.headers || {}) as any;
            (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
            // 重置处理标志
            isProcessing401 = false;
            return service.request(originalRequest as any);
          }
        } catch (refreshError) {
          console.error('❌ Token刷新失败:', refreshError);

          // 刷新失败，跳转到登录页面（只执行一次）
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            console.warn('🕐 会话已超时，即将跳转到登录页面');

            // 显示会话超时提示（只显示一次）
            ElMessage.warning({
              message: '会话已超时，请重新登录',
              duration: 3000,
              showClose: true
            });

            // 清除用户信息和token（使用抽象层）
            const userStore = useUserStore();
            userStore.clearUserInfo();

            // 清除所有相关的本地存储
            tokenStorage.removeToken();
            tokenStorage.removeRefreshToken();
            localStorage.removeItem('userInfo');

            // 延迟跳转，让用户看到提示信息
            setTimeout(() => {
              router.push('/login').finally(() => {
                // 重置标志，允许下次登录后再次处理
                setTimeout(() => {
                  isRedirectingToLogin = false;
                  isProcessing401 = false;
                }, 1000);
              });
            }, 1000);
          }

          return Promise.reject(error);
        }
      }
    }

    // 检查是否是AI相关API的特殊错误处理
    const isAIApi = error.config?.url?.includes('/ai/memory') ||
                    error.config?.url?.includes('/ai/conversation') ||
                    error.config?.url?.includes('/expert-consultation') ||
                    error.config?.url?.includes('/ai/models');
    const is404Error = error.response?.status === 404;
    const is503Error = error.response?.status === 503; // 服务不可用

    // AI记忆相关的404错误静默处理（数据不存在是正常情况）
    if (isAIApi && is404Error && error.config?.url?.includes('/memory')) {
      console.debug('AI记忆API: 数据不存在，静默处理404错误');
      return Promise.reject(error);
    }

    // AI模型服务不可用时的友好提示
    if (isAIApi && is503Error) {
      console.warn('AI服务暂时不可用');
      // 显示友好的错误消息而不是通用的503错误
      const friendlyError = {
        ...error,
        response: {
          ...error.response,
          data: {
            success: false,
            message: 'AI服务暂时不可用，请稍后重试',
            error: {
              code: 'AI_SERVICE_UNAVAILABLE',
              message: 'AI服务暂时不可用，请稍后重试'
            }
          }
        }
      };
      ErrorHandler.handle(friendlyError, true);
      return Promise.reject(friendlyError);
    }

    // 检查是否是网络错误（服务器未启动）
    const isNetworkError = !error.response && error.request;
    const currentTime = Date.now();

    if (isNetworkError) {
      // 网络错误，静默处理，避免刷屏
      if (currentTime - lastErrorTime > ERROR_THROTTLE_TIME) {
        console.warn('⚠️ 服务器连接失败，请检查后端服务是否启动');
        lastErrorTime = currentTime;
      }
      return Promise.reject(error);
    }

    console.error('Response error:', error)

    // 使用 ErrorHandler 统一处理错误（但避免重复显示）
    if (currentTime - lastErrorTime > ERROR_THROTTLE_TIME) {
      ErrorHandler.handle(error, true);
      lastErrorTime = currentTime;
    } else {
      // 静默处理，只记录日志
      ErrorHandler.handle(error, false);
    }

    // ErrorHandler已经统一处理了所有错误类型，包括401

    return Promise.reject(error)
  }
)

// 请求方法（带重试机制）
const requestMethod = async <T = any>(config: RequestConfig & AxiosRequestConfig): Promise<ApiResponse<T>> => {
  config.url = buildApiUrl(config.url || '')
  
  return retryRequest(async () => {
    const response = await service(config)
    return response as unknown as ApiResponse<T>
  })
}



// 判断是否是AI请求
const isAIRequest = (url: string): boolean => {
  return url.includes('/ai/') || url.startsWith('ai/')
}

// AI请求方法（使用AI专用服务）
const aiRequestMethod = async <T = any>(config: RequestConfig & AxiosRequestConfig): Promise<ApiResponse<T>> => {
  config.url = buildApiUrl(config.url || '')

  return retryRequest(async () => {
    const response = await aiService(config)
    return response as unknown as ApiResponse<T>
  })
}

// 智能请求方法（自动选择普通服务或AI服务）
const smartRequestMethod = async <T = any>(config: RequestConfig & AxiosRequestConfig): Promise<ApiResponse<T>> => {
  if (isAIRequest(config.url || '')) {
    console.log('🤖 使用AI服务处理请求:', config.url)
    return aiRequestMethod<T>(config)
  } else {
    return requestMethod<T>(config)
  }
}

// 智能HTTP方法
const smartGetMethod = async <T = any>(url: string, params?: any, config: AxiosRequestConfig & Partial<RequestConfig> = {}): Promise<ApiResponse<T>> => {
  return smartRequestMethod<T>({
    ...config,
    method: 'get',
    url,
    params
  })
}

const smartPostMethod = async <T = any>(url: string, data?: any, config: AxiosRequestConfig & Partial<RequestConfig> = {}): Promise<ApiResponse<T>> => {
  return smartRequestMethod<T>({
    ...config,
    method: 'post',
    url,
    data
  })
}

const smartPutMethod = async <T = any>(url: string, data?: any, config: AxiosRequestConfig & Partial<RequestConfig> = {}): Promise<ApiResponse<T>> => {
  return smartRequestMethod<T>({
    ...config,
    method: 'put',
    url,
    data
  })
}

const smartPatchMethod = async <T = any>(url: string, data?: any, config: AxiosRequestConfig & Partial<RequestConfig> = {}): Promise<ApiResponse<T>> => {
  return smartRequestMethod<T>({
    ...config,
    method: 'patch',
    url,
    data
  })
}

const smartDelMethod = async <T = any>(url: string, config: AxiosRequestConfig & Partial<RequestConfig> = {}): Promise<ApiResponse<T>> => {
  return smartRequestMethod<T>({
    ...config,
    method: 'delete',
    url
  })
}

// 创建请求实例对象（使用智能方法）
const requestInstance = {
  request: smartRequestMethod,
  get: smartGetMethod,
  post: smartPostMethod,
  put: smartPutMethod,
  patch: smartPatchMethod,
  del: smartDelMethod,
  // 兼容历史代码：提供 delete 别名
  delete: smartDelMethod
}

// ApiResponse类型已在上面导出，无需重复导出

// 视频创作服务请求拦截器（复用AI服务的拦截器逻辑）
videoCreationService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = tokenStorage.getToken()

    if (token) {
      if (!config.headers) {
        config.headers = {} as any
      }
      config.headers['Authorization'] = `Bearer ${token}`
    }

    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  (error: AxiosError) => {
    console.error('视频创作请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 视频创作服务响应拦截器（复用主服务的响应拦截器逻辑）
videoCreationService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      ElMessage.warning('请求超时，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// 创建视频创作专用的请求方法
export const videoCreationRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return videoCreationService.get(url, config).then(res => res.data)
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return videoCreationService.post(url, data, config).then(res => res.data)
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return videoCreationService.put(url, data, config).then(res => res.data)
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return videoCreationService.delete(url, config).then(res => res.data)
  }
}

// 默认导出仍为对象（不改变历史用法）
export default requestInstance

// 直接导出各个方法，支持解构导入
export const get = requestInstance.get
export const post = requestInstance.post
export const put = requestInstance.put
export const patch = requestInstance.patch
export const del = requestInstance.del
export const request = requestInstance

// 导出AI专用服务实例
export { aiService }
export const aiRequest = aiService

// 为了兼容性，重新导出函数
export { request as requestFunc, request as requestMethod }

// 导出测试需要的内部函数
export { getApiBaseURL, isAIRequest, retryRequest, shouldRetry, buildApiUrl }