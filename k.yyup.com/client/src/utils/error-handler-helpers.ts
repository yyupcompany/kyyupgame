/**
 * 统一错误处理辅助函数
 *
 * 确保前端请求处理的错误处理一致性
 */

import type { AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import { ErrorHandler } from './errorHandler';

/**
 * 错误类型定义
 */
export type ErrorType =
  | 'NETWORK'          // 网络错误
  | 'TIMEOUT'          // 超时错误
  | 'CLIENT_ERROR'     // 4xx 客户端错误
  | 'SERVER_ERROR'     // 5xx 服务器错误
  | 'AUTH_ERROR'       // 401 认证错误
  | 'PERMISSION_ERROR' // 403 权限错误
  | 'NOT_FOUND'        // 404 未找到
  | 'UNKNOWN';         // 未知错误

/**
 * 标准化的错误信息结构
 */
export interface StandardError {
  type: ErrorType;
  message: string;
  code?: string;
  status?: number;
  canRetry: boolean;
  userMessage: string;  // 用户友好的错误消息
}

/**
 * 分类错误类型
 */
export function classifyError(error: AxiosError): ErrorType {
  // 网络错误（无响应）
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    return 'NETWORK';
  }

  const status = error.response.status;

  // 客户端错误 (4xx)
  if (status >= 400 && status < 500) {
    switch (status) {
      case 401:
        return 'AUTH_ERROR';
      case 403:
        return 'PERMISSION_ERROR';
      case 404:
        return 'NOT_FOUND';
      default:
        return 'CLIENT_ERROR';
    }
  }

  // 服务器错误 (5xx)
  if (status >= 500) {
    return 'SERVER_ERROR';
  }

  return 'UNKNOWN';
}

/**
 * 判断错误是否可以重试
 */
export function canRetryError(error: AxiosError): boolean {
  const errorType = classifyError(error);

  // 可重试的错误类型
  const retryableTypes: ErrorType[] = [
    'NETWORK',
    'TIMEOUT',
    'SERVER_ERROR'
  ];

  return retryableTypes.includes(errorType);
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(errorType: ErrorType, originalMessage?: string): string {
  const friendlyMessages: Record<ErrorType, string> = {
    'NETWORK': '网络连接失败，请检查网络设置',
    'TIMEOUT': '请求超时，请稍后重试',
    'CLIENT_ERROR': '请求参数有误，请检查后重试',
    'SERVER_ERROR': '服务器暂时不可用，请稍后重试',
    'AUTH_ERROR': '登录已过期，请重新登录',
    'PERMISSION_ERROR': '没有权限执行此操作',
    'NOT_FOUND': '请求的资源不存在',
    'UNKNOWN': '操作失败，请稍后重试'
  };

  // 优先使用服务器返回的明确错误消息
  if (originalMessage && originalMessage.length > 0 && originalMessage.length < 100) {
    return originalMessage;
  }

  return friendlyMessages[errorType];
}

/**
 * 标准化错误对象
 */
export function standardizeError(error: AxiosError): StandardError {
  const errorType = classifyError(error);
  const errorData = error.response?.data as any;

  // 提取错误消息
  const originalMessage =
    errorData?.error?.message ||
    errorData?.message ||
    errorData?.error ||
    error.message;

  return {
    type: errorType,
    message: originalMessage || '未知错误',
    code: errorData?.error?.code || errorData?.code,
    status: error.response?.status,
    canRetry: canRetryError(error),
    userMessage: getUserFriendlyMessage(errorType, originalMessage)
  };
}

/**
 * 显示错误消息（带防抖）
 */
const lastErrorMessage: Record<string, number> = {};
const ERROR_THROTTLE = 3000; // 3秒内不重复显示相同错误

export function showError(stdError: StandardError, showMessage: boolean = true): void {
  if (!showMessage) {
    return;
  }

  const key = `${stdError.type}_${stdError.message}`;
  const now = Date.now();

  // 防抖检查
  if (lastErrorMessage[key] && now - lastErrorMessage[key] < ERROR_THROTTLE) {
    return;
  }

  lastErrorMessage[key] = now;

  // 根据错误类型选择显示方式
  switch (stdError.type) {
    case 'AUTH_ERROR':
      ElMessage.warning({
        message: stdError.userMessage,
        duration: 3000,
        showClose: true
      });
      break;

    case 'PERMISSION_ERROR':
      ElMessage.error({
        message: stdError.userMessage,
        duration: 3000,
        showClose: true
      });
      break;

    case 'NETWORK':
    case 'TIMEOUT':
      ElMessage.warning({
        message: stdError.userMessage,
        duration: 3000,
        showClose: true
      });
      break;

    default:
      ErrorHandler.handle(
        {
          response: {
            data: {
              success: false,
              error: {
                message: stdError.message,
                code: stdError.code
              }
            },
            status: stdError.status || 500
          }
        } as any,
        true
      );
  }
}

/**
 * 统一的响应拦截器错误处理函数
 *
 * @param error Axios错误对象
 * @param showMessage 是否显示错误消息
 * @param isAIService 是否是AI服务（特殊处理）
 * @returns Promise（应该被reject）
 */
export async function handleInterceptorError(
  error: AxiosError,
  showMessage: boolean = true,
  isAIService: boolean = false
): Promise<never> {
  // AI服务特殊处理：404静默处理
  if (isAIService && error.response?.status === 404) {
    const url = error.config?.url || '';
    if (url.includes('/memory')) {
      console.debug('AI记忆API: 数据不存在，静默处理404错误');
      return Promise.reject(error);
    }
  }

  // AI服务特殊处理：503友好提示
  if (isAIService && error.response?.status === 503) {
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

  // 标准化错误
  const stdError = standardizeError(error);

  // 显示错误消息
  showError(stdError, showMessage);

  return Promise.reject(error);
}

/**
 * 导出工具函数
 */
export default {
  classifyError,
  canRetryError,
  getUserFriendlyMessage,
  standardizeError,
  showError,
  handleInterceptorError
};
