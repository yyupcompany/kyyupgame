import { get, post, put, del } from './request';
import type { ApiResponse } from './request';
import { API_CONFIG } from './request-config';

/**
 * API请求规则实施工具
 * 该文件提供实际的规则验证和强制执行函数
 */

// 错误类型
export enum ApiRuleViolationType {
  DIRECT_AXIOS_USAGE = 'direct_axios_usage',
  WRONG_API_RESPONSE_TYPE = 'wrong_api_response_type',
  HARDCODED_URL = 'hardcoded_url',
  HARDCODED_PORT = 'hardcoded_port',
  TOKEN_MISHANDLING = 'token_mishandling'
}

// 检测直接使用axios的正则表达式
const DIRECT_AXIOS_USAGE_REGEX = /axios\.(get|post|put|delete|patch)\(/;

// 检测硬编码端口的正则表达式（动态获取开发主机名）
const getHardcodedPortRegex = () => {
  const devHost = 'localhost';
  return new RegExp(`${devHost}:(\\d{4})`, 'g');
};

// 检测硬编码URL的正则表达式
const HARDCODED_URL_REGEX = /['"`]https?:\/\/[^'"`]+['"`]/;

/**
 * 检查是否直接使用了axios
 * @param code 要检查的代码
 * @returns 是否违反规则
 */
export function checkDirectAxiosUsage(code: string): boolean {
  return DIRECT_AXIOS_USAGE_REGEX.test(code);
}

/**
 * 检查是否使用了硬编码端口
 * @param code 要检查的代码
 * @returns 违反规则的端口列表
 */
export function checkHardcodedPorts(code: string): string[] {
  const regex = getHardcodedPortRegex();
  const matches = Array.from(code.matchAll(regex));
  return matches.map(match => match[1]);
}

/**
 * 检查是否使用了硬编码URL
 * @param code 要检查的代码
 * @returns 违反规则的URL列表
 */
export function checkHardcodedUrls(code: string): string[] {
  const matches = Array.from(code.matchAll(new RegExp(HARDCODED_URL_REGEX, 'g')));
  return matches.map(match => match[0]);
}

/**
 * API请求辅助函数，包装原始请求方法，确保遵循规则
 * @param apiFunc 原始API函数
 * @param ruleChecks 要执行的规则检查
 * @returns 包装后的API函数
 */
export function enforceApiRules<T, P extends any[]>(
  apiFunc: (...args: P) => Promise<any>,
  ruleChecks: { 
    checkDirectAxios?: boolean;
    checkHardcodedUrls?: boolean;
    checkApiResponseType?: boolean;
  } = {}
): (...args: P) => Promise<ApiResponse<T>> {
  const functionString = apiFunc.toString();
  
  // 执行规则检查
  if (ruleChecks.checkDirectAxios && checkDirectAxiosUsage(functionString)) {
    console.warn('API规则违反: 直接使用了axios，应使用request工具');
  }
  
  if (ruleChecks.checkHardcodedUrls) {
    const hardcodedPorts = checkHardcodedPorts(functionString);
    if (hardcodedPorts.length > 0) {
      console.warn(`API规则违反: 发现硬编码端口 ${hardcodedPorts.join(', ')}`);
    }
    
    const hardcodedUrls = checkHardcodedUrls(functionString);
    if (hardcodedUrls.length > 0) {
      console.warn(`API规则违反: 发现硬编码URL ${hardcodedUrls.join(', ')}`);
    }
  }
  
  // 返回包装后的函数
  return async (...args: P) => {
    try {
      return await apiFunc(...args);
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  };
}

/**
 * 创建符合规则的API请求
 */
export const createApi = {
  /**
   * 创建GET请求
   * @param endpoint API端点
   */
  get(_endpoint: string) {
    return (params?: any, config?: any) => get(_endpoint, params, config);
  },
  
  /**
   * 创建POST请求
   * @param endpoint API端点
   */
  post<T = any>(endpoint: string) {
    return (data?: any, config?: any) => post<T>(endpoint, data, config);
  },
  
  /**
   * 创建PUT请求
   * @param endpoint API端点
   */
  put<T = any>(endpoint: string) {
    return (data?: any, config?: any) => put<T>(endpoint, data, config);
  },
  
  /**
   * 创建DELETE请求
   * @param endpoint API端点
   */
  delete<T = any>(endpoint: string) {
    return (config?: any) => del<T>(endpoint, config);
  }
};

/**
 * 构建API URL，避免硬编码
 * @param path API路径
 * @returns 完整的API URL
 */
export function buildApiUrl(path: string): string {
  return `${API_CONFIG.baseURL}${path}`;
}

/**
 * 辅助函数：检查并转换响应类型
 * @param response API响应
 * @returns 标准化的API响应
 */
export function ensureApiResponseFormat(response: any): ApiResponse<any> {
  // 如果已经是标准格式，直接返回
  if (response && typeof response === 'object' && 'success' in response) {
    return response as ApiResponse<any>;
  }

  // 否则转换为标准格式
  return {
    success: true,
    data: response as any,
    message: '请求成功'
  };
}

// 默认导出所有规则工具
export default {
  createApi,
  enforceApiRules,
  buildApiUrl,
  ensureApiResponseFormat,
  checkDirectAxiosUsage,
  checkHardcodedPorts,
  checkHardcodedUrls
}; 