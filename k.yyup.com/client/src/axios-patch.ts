// 这个文件用于修复axios的导入问题
import { AxiosRequestConfig, AxiosResponse } from 'axios';

// 获取基础URL配置
const getBaseURL = (): string => {
  // 开发环境使用相对路径，让vite代理处理
  if (import.meta.env.DEV) {
    return '';
  }
  // 生产环境也使用相对路径
  return '';
};

// 构建完整URL
const buildFullUrl = (url: string, baseURL: string = getBaseURL()): string => {
  // 如果是完整URL，直接返回
  if (url.startsWith('http')) {
    return url;
  }
  // 如果URL以/api开头，说明已经是完整的API路径
  if (url.startsWith('/api')) {
    return `${baseURL}${url}`;
  }
  // 否则拼接baseURL
  return baseURL ? `${baseURL}${url}` : url;
};

// 创建一个简单的axios实现
const axios = function(config: AxiosRequestConfig): Promise<AxiosResponse> {
  const fullUrl = buildFullUrl(config.url || '');
  
  return fetch(fullUrl, {
    method: config.method || 'get',
    headers: config.headers as any,
    body: config.data ? JSON.stringify(config.data) : undefined
  }).then(response => {
    return response.json().then(data => {
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
        config,
        request: null
      } as AxiosResponse;
    });
  });
} as any;

// 添加必要的方法
axios.get = function(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios({ ...config, url, method: 'get' });
};

axios.post = function(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios({ ...config, url, method: 'post', data });
};

axios.put = function(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios({ ...config, url, method: 'put', data });
};

axios.delete = function(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios({ ...config, url, method: 'delete' });
};

// 添加默认值
axios.defaults = {
  headers: {
    common: {},
    get: {},
    post: { 'Content-Type': 'application/json' },
    put: { 'Content-Type': 'application/json' },
    delete: {}
  }
};

// 添加拦截器
axios.interceptors = {
  request: {
    use: function() {
      // 简单实现
      return 0;
    },
    eject: function() {}
  },
  response: {
    use: function() {
      // 简单实现
      return 0;
    },
    eject: function() {}
  }
};

// 导出
export default axios; 