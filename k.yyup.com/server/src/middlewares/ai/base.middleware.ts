/**
 * AI中间层基类
 * 提供通用的错误处理、权限验证和日志记录功能
 */

import { logger } from '../../utils/logger';

/**
 * 中间层结果接口
 */
export interface IMiddlewareResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 中间层错误类
 */
export class MiddlewareError extends Error {
  code: string;
  details?: any;
  
  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'MiddlewareError';
  }
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SERVICE_ERROR: 'SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INVALID_OPERATION: 'INVALID_OPERATION',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * HTTP状态码映射
 */
export const ERROR_CODE_TO_HTTP_STATUS = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.VALIDATION_FAILED]: 400,
  [ERROR_CODES.SERVICE_ERROR]: 500,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.EXTERNAL_API_ERROR]: 502,
  [ERROR_CODES.INVALID_OPERATION]: 400,
  [ERROR_CODES.RESOURCE_EXISTS]: 409,
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503
};

/**
 * 从错误代码获取HTTP状态码
 */
export function getStatusCodeFromErrorCode(code: string): number {
  return ERROR_CODE_TO_HTTP_STATUS[code] || 500;
}

/**
 * 中间层基类
 */
export abstract class BaseMiddleware {
  /**
   * 处理错误
   * @param error 捕获的错误
   * @returns 标准化的错误响应
   */
  protected handleError(error: any): IMiddlewareResult<null> {
    logger.error('中间层错误:', error);
    
    // 处理中间层自定义错误
    if (error instanceof MiddlewareError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
    }
    
    // 处理服务层错误
    return {
      success: false,
      error: {
        code: ERROR_CODES.SERVICE_ERROR,
        message: '服务操作失败',
        details: process.env.NODE_ENV === 'production' ? undefined : error.message
      }
    };
  }
  
  /**
   * 验证用户权限
   * @param userId 用户ID
   * @param requiredPermissions 所需权限列表
   * @returns 是否有权限
   */
  protected async validatePermissions(
    userId: number, 
    requiredPermissions: string[]
  ): Promise<boolean> {
    try {
      // TODO: 实现实际的权限验证逻辑
      // 这里应该调用权限服务或数据库查询用户权限
      
      // 开发环境下默认通过权限验证
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      // 示例: 调用权限服务验证
      // const userPermissions = await permissionService.getUserPermissions(userId);
      // return requiredPermissions.every(perm => userPermissions.includes(perm));
      
      return true;
    } catch (error) {
      logger.error('权限验证错误:', error);
      return false;
    }
  }
  
  /**
   * 记录操作日志
   * @param userId 用户ID
   * @param operation 操作类型
   * @param details 操作详情
   */
  protected async logOperation(
    userId: number, 
    operation: string, 
    details: any
  ): Promise<void> {
    try {
      logger.info('用户操作:', {
        userId,
        operation,
        timestamp: new Date().toISOString(),
        details: JSON.stringify(details)
      });
      
      // TODO: 实现实际的日志记录逻辑
      // 例如写入数据库或发送到日志服务
    } catch (error) {
      logger.error('记录操作日志错误:', error);
      // 日志记录错误不应影响正常业务流程
    }
  }
  
  /**
   * 校验数据
   * @param data 待验证的数据
   * @param schema 验证规则
   * @throws MiddlewareError 如果验证失败
   */
  protected validateData(data: any, schema: any): void {
    // TODO: 实现实际的数据验证逻辑
    // 这里可以使用 Joi, Yup, Zod 等验证库
    
    // 示例验证逻辑
    if (!data) {
      throw new MiddlewareError(
        ERROR_CODES.VALIDATION_FAILED,
        '数据不能为空',
        { data }
      );
    }
    
    // 其他验证规则...
  }
  
  /**
   * 创建成功响应
   * @param data 响应数据
   * @returns 标准化的成功响应
   */
  protected createSuccessResponse<T>(data: T): IMiddlewareResult<T> {
    return {
      success: true,
      data
    };
  }
} 