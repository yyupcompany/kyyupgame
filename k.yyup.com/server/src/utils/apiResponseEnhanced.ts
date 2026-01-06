/**
 * 增强的API响应工具
 * 统一所有API响应格式，确保100%一致性
 */

import { Response } from 'express';
import { ApiError } from './apiError';
import { PaginationHelper, StandardPaginationOptions } from './paginationHelper';

export interface StandardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface StandardPaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface StandardAuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: {
      id: string | number;
      username: string;
      role: string;
      email?: string;
      phone?: string;
      permissions?: string[];
    };
  };
  message?: string;
}

export class ApiResponseEnhanced {
  /**
   * 标准成功响应
   * @param res 响应对象
   * @param data 响应数据
   * @param message 成功消息
   * @param statusCode HTTP状态码
   */
  static success<T>(res: Response, data: T, message = '操作成功', statusCode = 200): void {
    const response: StandardAPIResponse<T> = {
      success: true,
      data,
      message
    };

    // 处理list字段，确保它始终是数组类型
    if (data && typeof data === 'object' && 'list' in (data as any)) {
      const dataWithList = data as any;

      if (!Array.isArray(dataWithList.list)) {
        console.log('ApiResponseEnhanced: 将非数组list转换为数组，原类型:', typeof dataWithList.list);

        if (dataWithList.list === null) {
          dataWithList.list = [];
        } else if (typeof dataWithList.list === 'object') {
          dataWithList.list = Object.keys(dataWithList.list).length > 0 ? [dataWithList.list] : [];
        } else {
          dataWithList.list = [];
        }
      }
    }

    res.status(statusCode).json(response);
  }

  /**
   * 认证成功响应
   * @param res 响应对象
   * @param token 访问令牌
   * @param user 用户信息
   * @param refreshToken 刷新令牌（可选）
   * @param message 成功消息
   */
  static authSuccess(
    res: Response,
    token: string,
    user: any,
    refreshToken?: string,
    message = '登录成功'
  ): void {
    const standardUser = {
      id: user.id || user.userId,
      username: user.username || user.name,
      role: user.role || 'user',
      email: user.email,
      phone: user.phone,
      permissions: user.permissions || []
    };

    const response: StandardAuthResponse = {
      success: true,
      data: {
        token,
        refreshToken,
        user: standardUser
      },
      message
    };

    res.status(200).json(response);
  }

  /**
   * 分页数据响应
   * @param res 响应对象
   * @param items 数据列表
   * @param total 总数量
   * @param page 当前页
   * @param pageSize 每页数量
   * @param message 成功消息
   */
  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取数据成功'
  ): void {
    const paginationResponse = PaginationHelper.createPaginationResponse(
      items,
      total,
      { page, pageSize },
      message
    );

    res.status(200).json(paginationResponse);
  }

  /**
   * 使用选项的分页数据响应
   * @param res 响应对象
   * @param items 数据列表
   * @param total 总数量
   * @param options 分页选项
   * @param message 成功消息
   */
  static paginatedWithOptions<T>(
    res: Response,
    items: T[],
    total: number,
    options: StandardPaginationOptions,
    message = '获取数据成功'
  ): void {
    const paginationResponse = PaginationHelper.createPaginationResponse(
      items,
      total,
      options,
      message
    );

    res.status(200).json(paginationResponse);
  }

  /**
   * 错误响应
   * @param res 响应对象
   * @param message 错误消息
   * @param code 错误代码
   * @param statusCode HTTP状态码
   * @param details 错误详情
   */
  static error(
    res: Response,
    message: string,
    code: string,
    statusCode = 400,
    details?: any
  ): void {
    const response: StandardAPIResponse = {
      success: false,
      error: {
        code,
        message,
        details
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * 资源不存在响应
   * @param res 响应对象
   * @param message 错误消息
   */
  static notFound(res: Response, message = '资源不存在'): void {
    this.error(res, message, 'NOT_FOUND', 404);
  }

  /**
   * 请求参数错误响应
   * @param res 响应对象
   * @param message 错误消息
   */
  static badRequest(res: Response, message = '请求参数错误'): void {
    this.error(res, message, 'BAD_REQUEST', 400);
  }

  /**
   * 未授权响应
   * @param res 响应对象
   * @param message 错误消息
   */
  static unauthorized(res: Response, message = '未授权'): void {
    this.error(res, message, 'UNAUTHORIZED', 401);
  }

  /**
   * 禁止访问响应
   * @param res 响应对象
   * @param message 错误消息
   */
  static forbidden(res: Response, message = '禁止访问'): void {
    this.error(res, message, 'FORBIDDEN', 403);
  }

  /**
   * 服务器错误响应
   * @param res 响应对象
   * @param message 错误消息
   */
  static serverError(res: Response, message = '服务器内部错误'): void {
    this.error(res, message, 'SERVER_ERROR', 500);
  }

  /**
   * 权限数据响应
   * @param res 响应对象
   * @param permissions 权限列表
   * @param isAdmin 是否为管理员
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param message 成功消息
   */
  static permissions(
    res: Response,
    permissions: any[],
    isAdmin: boolean = false,
    userId?: number,
    userRole?: string,
    message = '获取用户权限成功'
  ): void {
    const data = {
      permissions: permissions || [],
      isAdmin,
      userId,
      userRole,
      total: permissions ? permissions.length : 0
    };

    this.success(res, data, message);
  }

  /**
   * 处理控制器中的错误
   * @param res 响应对象
   * @param error 错误对象
   * @param defaultMessage 默认错误消息
   */
  static handleError(res: Response, error: unknown, defaultMessage = '操作失败'): void {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
      this.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      const errorCode = (error as any).code || 'SERVER_ERROR';
      const errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: errorCode
      };

      this.error(res, error.message || defaultMessage, errorCode, 500, errorDetails);
    } else {
      this.serverError(res, defaultMessage);
    }
  }

  /**
   * 转换非标准响应为标准响应
   * @param data 原始响应数据
   * @param message 成功消息
   */
  static normalizeResponse(data: any, message = '操作成功'): StandardAPIResponse {
    // 如果已经是标准格式，直接返回
    if (data && typeof data === 'object' && 'success' in data) {
      return data as StandardAPIResponse;
    }

    // 否则包装为标准格式
    return {
      success: true,
      data,
      message
    };
  }

  /**
   * 验证响应格式是否标准
   * @param response 响应数据
   */
  static validateResponse(response: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response || typeof response !== 'object') {
      errors.push('响应必须是对象类型');
      return { valid: false, errors };
    }

    if (typeof response.success !== 'boolean') {
      errors.push('success字段必须是布尔类型');
    }

    if (response.success && response.data === undefined) {
      errors.push('成功响应必须有data字段');
    }

    if (!response.success && !response.error) {
      errors.push('失败响应必须有error字段');
    }

    if (response.error && typeof response.error !== 'object') {
      errors.push('error字段必须是对象类型');
    } else if (response.error) {
      if (!response.error.code || typeof response.error.code !== 'string') {
        errors.push('error.code字段是必需的字符串类型');
      }
      if (!response.error.message || typeof response.error.message !== 'string') {
        errors.push('error.message字段是必需的字符串类型');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 向后兼容的导出
export const ApiResponse = ApiResponseEnhanced;