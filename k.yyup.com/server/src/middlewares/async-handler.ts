import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 异步错误处理包装器
 * 确保所有异步路由中的错误都会被正确捕获并传递给错误处理中间件
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error(`异步路由错误 [${req.method} ${req.path}]:`, error);
      
      // 确保响应还没有发送时才处理错误
      if (!res.headersSent) {
        next(error);
      } else {
        // 如果响应已经发送，记录错误但不再尝试发送响应
        logger.error('响应已发送，无法传递错误到错误处理中间件', {
          method: req.method,
          path: req.path,
          error: error.message
        });
      }
    });
  };
};

/**
 * 安全的控制器方法包装器
 * 为类方法提供异步错误处理
 */
export const safeController = (controller: any, methodName: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await controller[methodName](req, res, next);
  });
};