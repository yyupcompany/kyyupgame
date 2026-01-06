/**
 * CSRF保护配置
 *
 * 提供CSRF（跨站请求伪造）保护
 * 注意：csurf包已废弃，这里使用自定义实现
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * 是否启用CSRF保护
 * 可以通过环境变量控制，默认在生产环境启用
 */
const enableCSRF = process.env.ENABLE_CSRF === 'true' || process.env.NODE_ENV === 'production';

/**
 * 生成CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 验证CSRF token
 */
function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }

  // 使用恒定时间比较防止时序攻击
  const tokenBuffer = Buffer.from(token, 'hex');
  const storedBuffer = Buffer.from(storedToken, 'hex');

  if (tokenBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuffer, storedBuffer);
}

/**
 * CSRF token存储（session-based）
 * 在实际应用中应该使用session或数据库存储
 * 这里使用内存存储作为示例
 */
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

/**
 * 清理过期的token
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expiresAt < now) {
      csrfTokens.delete(key);
    }
  }
}

// 每小时清理一次过期token
if (enableCSRF) {
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}

/**
 * 获取或创建CSRF token
 */
function getOrCreateCSRFToken(req: Request): string {
  // 从session或其他存储中获取token
  // 这里简化处理，使用IP地址作为key
  const key = req.ip || 'unknown';
  const now = Date.now();

  let tokenData = csrfTokens.get(key);

  // 如果token不存在或已过期，创建新token
  if (!tokenData || tokenData.expiresAt < now) {
    const token = generateCSRFToken();
    tokenData = {
      token,
      expiresAt: now + (60 * 60 * 1000) // 1小时过期
    };
    csrfTokens.set(key, tokenData);
  }

  return tokenData.token;
}

/**
 * CSRF保护中间件（带环境检测）
 */
export const csrfProtection = enableCSRF
  ? (req: Request, res: Response, next: NextFunction) => {
      // 跳过GET、HEAD、OPTIONS请求
      const method = req.method?.toUpperCase();
      if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return next();
      }

      // 从header获取token
      const token = req.headers['x-csrf-token'] as string;

      // 从session或其他存储获取存储的token
      const key = req.ip || 'unknown';
      const tokenData = csrfTokens.get(key);

      if (!token || !tokenData || !validateCSRFToken(token, tokenData.token)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'CSRF token验证失败',
            code: 'INVALID_CSRF_TOKEN'
          }
        });
      }

      next();
    }
  : // 开发/测试环境：返回空中间件
    (req: Request, res: Response, next: NextFunction) => {
      if (isDevelopment || isTest) {
        // 开发/测试环境：设置假token以便开发
        res.locals._csrf = 'development-csrf-token';
      }
      next();
    };

/**
 * CSRF token端点
 */
export function getCsrfToken(req: Request, res: Response) {
  if (enableCSRF) {
    const token = getOrCreateCSRFToken(req);
    res.json({
      success: true,
      data: {
        csrfToken: token,
        enabled: true
      }
    });
  } else {
    // 开发环境返回假token
    res.json({
      success: true,
      data: {
        csrfToken: 'development-csrf-token',
        enabled: false,
        note: 'CSRF保护未启用（开发环境）'
      }
    });
  }
}

/**
 * 错误处理
 */
export function csrfErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code === 'EBADCSRFTOKEN' || err.code === 'INVALID_CSRF_TOKEN') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF token验证失败',
        code: 'INVALID_CSRF_TOKEN'
      }
    });
  }
  next(err);
}

/**
 * 导出配置
 */
export const csrfConfig = {
  enabled: enableCSRF,
  isDevelopment,
  isTest
};

/**
 * 导出工具函数
 */
export default {
  csrfProtection,
  getCsrfToken,
  csrfErrorHandler,
  csrfConfig,
  generateCSRFToken,
  validateCSRFToken
};
