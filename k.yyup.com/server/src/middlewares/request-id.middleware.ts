/**
 * 请求ID追踪中间件
 *
 * 为每个请求生成唯一ID，便于日志追踪和问题排查
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 扩展Request接口，添加requestId属性
 */
declare global {
  namespace Express {
    interface Request {
      id: string;
      requestId: string;
    }
  }
}

/**
 * 请求ID配置
 */
interface RequestIdConfig {
  headerName: string;
  propName: string;
  setHeader: boolean;
  generateUuid: boolean;
}

/**
 * 默认配置
 */
const defaultConfig: RequestIdConfig = {
  headerName: 'X-Request-ID',
  propName: 'requestId',
  setHeader: true,
  generateUuid: true
};

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return uuidv4();
}

/**
 * 请求ID中间件
 */
export function requestIdMiddleware(config: Partial<RequestIdConfig> = {}) {
  const options = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    // 尝试从请求头获取现有ID
    const existingId = req.headers[options.headerName.toLowerCase()] as string;

    // 生成或使用现有ID
    const id = existingId || (options.generateUuid ? generateRequestId() : Date.now().toString(36));

    // 设置到request对象
    (req as any)[options.propName] = id;
    req.id = id;

    // 设置响应头
    if (options.setHeader) {
      res.setHeader(options.headerName, id);
    }

    next();
  };
}

/**
 * 请求时间追踪中间件
 */
export function requestTimeMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  (req as any).startTime = startTime;

  // 在响应结束时记录时间
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[Request] ${req.id} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * 日志增强中间件（添加请求ID到所有日志）
 */
export function logEnhancementMiddleware(req: Request, res: Response, next: NextFunction) {
  // 将requestId添加到console
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const requestId = req.id;

  console.log = (...args: any[]) => {
    originalLog(`[${requestId}]`, ...args);
  };

  console.error = (...args: any[]) => {
    originalError(`[${requestId}]`, ...args);
  };

  console.warn = (...args: any[]) => {
    originalWarn(`[${requestId}]`, ...args);
  };

  // 恢复原始日志（响应结束时）
  res.on('finish', () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  next();
}

/**
 * 获取请求ID
 */
export function getRequestId(req: Request): string {
  return req.id || (req as any).requestId || 'unknown';
}

/**
 * 导出默认中间件
 */
export default requestIdMiddleware;
