/**
 * API错误类
 */
export class ApiError extends Error {
  /**
   * 状态码
   */
  public statusCode: number;

  /**
   * 错误信息
   */
  public message: string;

  /**
   * 错误代码
   */
  public code: string;

  /**
   * 构造函数
   * @param statusCode 状态码
   * @param message 错误信息
   * @param code 错误代码
   */
  constructor(
    statusCode: number,
    message: string,
    code: string = 'API_ERROR'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
    this.name = 'ApiError';
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(message: string, code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, code);
  }

  static forbidden(message: string, code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, code);
  }

  static notFound(message: string, code = 'NOT_FOUND'): ApiError {
    return new ApiError(404, message, code);
  }

  static serverError(message: string, code = 'SERVER_ERROR'): ApiError {
    return new ApiError(500, message, code);
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(409, message, code);
  }

  static tooManyRequests(message: string, code = 'TOO_MANY_REQUESTS'): ApiError {
    return new ApiError(429, message, code);
  }

  static serviceUnavailable(message: string, code = 'SERVICE_UNAVAILABLE'): ApiError {
    return new ApiError(503, message, code);
  }

  static internalError(message: string, code = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(500, message, code);
  }

  /**
   * 自定义JSON序列化方法
   * 确保Error对象的属性能被正确序列化
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      stack: this.stack
    };
  }
}