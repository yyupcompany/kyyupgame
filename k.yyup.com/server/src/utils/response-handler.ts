/**
 * 统一响应处理工具类
 * 用于标准化API响应格式
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  code?: number;
}

export class ResponseHandler {
  /**
   * 成功响应
   */
  static success<T>(res: Response, data: T, message: string = '操作成功', code: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      code
    };
    
    res.status(code).json(response);
  }

  /**
   * 错误响应
   */
  static error(res: Response, message: string = '操作失败', code: number = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      code
    };
    
    res.status(code).json(response);
  }

  /**
   * 验证失败响应
   */
  static validation(res: Response, message: string, errors?: any): void {
    const response: ApiResponse = {
      success: false,
      message,
      data: errors,
      timestamp: new Date().toISOString(),
      code: 400
    };
    
    res.status(400).json(response);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res: Response, message: string = '未授权访问'): void {
    this.error(res, message, 401);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res: Response, message: string = '禁止访问'): void {
    this.error(res, message, 403);
  }

  /**
   * 资源未找到响应
   */
  static notFound(res: Response, message: string = '资源未找到'): void {
    this.error(res, message, 404);
  }

  /**
   * 分页响应
   */
  static paginated<T>(
    res: Response, 
    data: T[], 
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
    message: string = '获取数据成功'
  ): void {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  }
}

// 导出便捷函数
export const successResponse = ResponseHandler.success;
export const errorResponse = ResponseHandler.error;