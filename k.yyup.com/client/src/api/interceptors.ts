import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
import { environmentConfig } from '../config/environment';

// 创建axios实例 - 使用动态环境配置
const service = axios.create({
  baseURL: environmentConfig.apiBaseUrl,
  timeout: environmentConfig.apiTimeout
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token - 保持与userStore一致
    let token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
    
    // 移除模拟token逻辑，使用真实认证
    
    // 强制添加Authorization头，确保在所有环境下都有认证信息
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ 设置认证头:', config.url, 'token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ 没有找到认证token，请求可能会失败:', config.url);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 用于防止重复跳转登录页
let isRedirectingToLogin = false;

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 400:
          ElMessage.error('请求参数错误');
          break;
        case 401:
          // 401错误：未授权或token过期
          // 检查是否是真正的认证失败（token过期或无效）
          const errorData401 = error.response?.data as any;
          const isAuthError = errorData401?.error?.code === 'TOKEN_EXPIRED' ||
                            errorData401?.error?.code === 'INVALID_TOKEN' ||
                            errorData401?.error?.code === 'UNAUTHORIZED' ||
                            errorData401?.message?.includes('过期') ||
                            errorData401?.message?.includes('expired') ||
                            errorData401?.message?.includes('未授权') ||
                            errorData401?.message?.includes('unauthorized') ||
                            !errorData401; // 如果没有错误信息，可能是认证失败
          
          if (isAuthError && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            ElMessage.error('登录已过期，请重新登录');
            // 清除所有token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('kindergarten_token');
            localStorage.removeItem('token');
            localStorage.removeItem('kindergarten_refresh_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            // 跳转到登录页
            router.push('/login').finally(() => {
              // 重置标志，允许下次登录后再次处理401
              setTimeout(() => {
                isRedirectingToLogin = false;
              }, 1000);
            });
          } else if (!isAuthError) {
            // 不是认证错误，只显示提示，不退出登录
            const errorMsg = errorData401?.message || '请求失败，请稍后重试';
            ElMessage.warning(errorMsg);
          }
          break;
        case 403:
          // 403错误：权限不足，但不应该退出登录
          // 只显示提示信息，不跳转登录页
          const errorMessage = (error.response?.data as any)?.message || '权限不足，无法访问此资源';
          ElMessage.warning(errorMessage);
          // 不清除token，不跳转登录页
          break;
        case 404:
          // 404错误静默处理，不显示消息（避免刷屏）
          console.warn('请求的资源不存在:', error.config?.url);
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        case 502:
        case 503:
        case 504:
          // 服务器不可用，静默处理（避免刷屏）
          console.warn('服务器暂时不可用:', error.config?.url);
          break;
        default:
          // 其他错误静默处理
          console.error(`请求失败: ${error.message}`, error.config?.url);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应 - 静默处理（避免刷屏）
      console.warn('服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      console.error(`请求错误: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// 替换全局axios默认配置 - 使用动态环境配置
axios.defaults.baseURL = environmentConfig.apiBaseUrl;
axios.defaults.timeout = environmentConfig.apiTimeout;

// 注册请求拦截器和响应拦截器
axios.interceptors.request.use(
  config => {
    // 从localStorage获取token - 保持与userStore一致
    let token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
    
    // 移除模拟token逻辑，使用真实认证
    
    // 强制添加Authorization头，确保在所有环境下都有认证信息
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ 全局拦截器设置认证头:', config.url, 'token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ 全局拦截器没有找到认证token，请求可能会失败:', config.url);
    }
    
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // 401错误：未授权或token过期
          // 检查是否是真正的认证失败（token过期或无效）
          const errorData401Global = error.response?.data as any;
          const isAuthErrorGlobal = errorData401Global?.error?.code === 'TOKEN_EXPIRED' ||
                            errorData401Global?.error?.code === 'INVALID_TOKEN' ||
                            errorData401Global?.error?.code === 'UNAUTHORIZED' ||
                            errorData401Global?.message?.includes('过期') ||
                            errorData401Global?.message?.includes('expired') ||
                            errorData401Global?.message?.includes('未授权') ||
                            errorData401Global?.message?.includes('unauthorized') ||
                            !errorData401Global; // 如果没有错误信息，可能是认证失败
          
          if (isAuthErrorGlobal && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            ElMessage.error('登录已过期，请重新登录');
            // 清除所有token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('kindergarten_token');
            localStorage.removeItem('token');
            localStorage.removeItem('kindergarten_refresh_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            // 跳转到登录页
            router.push('/login').finally(() => {
              setTimeout(() => {
                isRedirectingToLogin = false;
              }, 1000);
            });
          } else if (!isAuthErrorGlobal) {
            // 不是认证错误，只显示提示，不退出登录
            const errorMsgGlobal = errorData401Global?.message || '请求失败，请稍后重试';
            ElMessage.warning(errorMsgGlobal);
          }
          break;
        case 403:
          // 403错误：权限不足，但不应该退出登录
          // 只显示提示信息，不跳转登录页
          const errorMessage403 = (error.response?.data as any)?.message || '权限不足，无法访问此资源';
          ElMessage.warning(errorMessage403);
          // 不清除token，不跳转登录页
          break;
        case 404:
          // 404错误静默处理
          console.warn('请求的资源不存在:', error.config?.url);
          break;
        case 502:
        case 503:
        case 504:
          // 服务器不可用，静默处理
          console.warn('服务器暂时不可用:', error.config?.url);
          break;
        default:
          // 其他错误由具体业务处理
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default service; 