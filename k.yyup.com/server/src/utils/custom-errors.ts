/**
 * 自定义错误类型
 * 用于区分业务逻辑错误和系统错误
 */

/**
 * 业务逻辑错误基类
 */
export class BusinessError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BUSINESS_ERROR') {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * 资源已存在错误
 */
export class ResourceExistsError extends BusinessError {
  constructor(message: string) {
    super(message, 409, 'RESOURCE_EXISTS');
    this.name = 'ResourceExistsError';
  }
}

/**
 * 资源不存在错误
 */
export class ResourceNotFoundError extends BusinessError {
  constructor(message: string) {
    super(message, 404, 'RESOURCE_NOT_FOUND');
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends BusinessError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * 权限错误
 */
export class PermissionError extends BusinessError {
  constructor(message: string) {
    super(message, 403, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

/**
 * 系统错误（真正的服务器内部错误）
 */
export class SystemError extends Error {
  public readonly statusCode: number = 500;
  public readonly errorCode: string = 'SYSTEM_ERROR';

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'SystemError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}