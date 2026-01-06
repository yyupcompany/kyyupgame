import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录错误详情
  logger.error(`请求路径: ${req.method} ${req.path}`, err);

  if (err instanceof ApiError) {
    // 记录API错误
    logger.error(`API错误: [${err.code}] ${err.message} (${err.statusCode})`, {
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body,
      user: req.user ? req.user.id : null
    });
    
    ApiResponse.error(res, err.code, err.message, err.statusCode);
    return;
  }

  // 处理Sequelize错误
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    logger.error(`Sequelize错误: ${err.name}`, {
      message: err.message,
      path: req.path,
      method: req.method
    });
    
    ApiResponse.badRequest(res, err.message);
    return;
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    logger.error(`JWT错误: ${err.name}`, {
      message: err.message,
      path: req.path,
      method: req.method
    });
    
    ApiResponse.unauthorized(res, '无效的token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    logger.error(`JWT错误: ${err.name}`, {
      message: err.message,
      path: req.path,
      method: req.method
    });
    
    ApiResponse.unauthorized(res, 'token已过期');
    return;
  }

  // 处理其他错误
  logger.error(`未处理的错误: ${err.name || 'Unknown Error'}`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  ApiResponse.serverError(res);
}; 