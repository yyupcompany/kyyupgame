import { Response } from 'express';
import { ApiError } from './apiError';

export interface ApiResponseData<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiResponse {
  /**
   * 成功响应
   * @param res 响应对象
   * @param data 响应数据
   * @param message 成功消息
   * @param statusCode HTTP状态码
   */
  static success<T>(res: Response, data: T, message = '操作成功', statusCode = 200): void {
    // 处理list字段，确保它始终是数组类型
    if (data && typeof data === 'object' && 'list' in (data as any)) {
      const dataWithList = data as any;
      
      // 如果list不是数组，则将其转换为数组
      if (!Array.isArray(dataWithList.list)) {
        console.log('ApiResponse: 将非数组list转换为数组，原类型:', typeof dataWithList.list);
        
        if (dataWithList.list === null) {
          dataWithList.list = [];
        } else if (typeof dataWithList.list === 'object') {
          // 如果是对象，放入数组中
          dataWithList.list = Object.keys(dataWithList.list).length > 0 ? [dataWithList.list] : [];
        } else {
          // 其他情况，使用空数组
          dataWithList.list = [];
        }
      }
      
      console.log('ApiResponse: 最终list是否为数组:', Array.isArray(dataWithList.list));
    }
    
    res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * 错误响应
   * @param res 响应对象
   * @param message 错误消息
   * @param code 错误代码
   * @param statusCode HTTP状态码
   */
  static error(res: Response, message: string, code: string, statusCode = 400): void {
    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message
      }
    });
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
    const totalPages = Math.ceil(total / pageSize);
    
    res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages
      },
      message
    });
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
      // 包含更详细的错误信息，包括错误名称和堆栈
      const errorCode = (error as any).code || 'SERVER_ERROR';
      const errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: errorCode,
        originalError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      };
      
      res.status(500).json({
        success: false,
        error: {
          code: errorCode,
          message: error.message || defaultMessage,
          details: errorDetails
        }
      });
    } else {
      this.serverError(res, defaultMessage);
    }
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
    res.status(200).json({
      success: true,
      data: {
        permissions: permissions || [],
        isAdmin: isAdmin,
        userId: userId,
        userRole: userRole,
        total: permissions ? permissions.length : 0
      },
      message
    });
  }
} 