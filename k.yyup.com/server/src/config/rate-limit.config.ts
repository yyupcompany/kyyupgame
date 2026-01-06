/**
 * 速率限制配置
 *
 * 提供不同类型的API速率限制
 * 防止DDoS攻击和暴力破解
 */

import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * 是否跳过成功请求的计数（环境变量控制）
 */
const skipSuccessfulRequests = process.env.SKIP_SUCCESSFUL_REQUESTS === 'true';

/**
 * 速率限制配置（从环境变量读取）
 */
const RATE_LIMIT_CONFIG = {
  // 全局限制
  GLOBAL_WINDOW_MS: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW || '900000', 10), // 15分钟
  GLOBAL_MAX: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || (isDevelopment ? '10000' : '1000'), 10),

  // 认证API限制
  AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '900000', 10), // 15分钟
  AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || (isDevelopment ? '100' : '5'), 10),

  // 文件上传限制
  UPLOAD_WINDOW_MS: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW || '3600000', 10), // 1小时
  UPLOAD_MAX: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || (isDevelopment ? '100' : '10'), 10),

  // API查询限制
  QUERY_WINDOW_MS: parseInt(process.env.RATE_LIMIT_QUERY_WINDOW || '60000', 10), // 1分钟
  QUERY_MAX: parseInt(process.env.RATE_LIMIT_QUERY_MAX || (isDevelopment ? '200' : '60'), 10)
};

/**
 * 全局速率限制
 */
export const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.GLOBAL_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.GLOBAL_MAX,
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
      code: 'TOO_MANY_REQUESTS'
    }
  },
  standardHeaders: true, // 返回速率限制信息在头信息中
  legacyHeaders: false,
  skipSuccessfulRequests, // 不计算成功请求的计数
  skip: (req: Request) => {
    // 跳过健康检查和文档
    const skipPaths = ['/health', '/api-docs', '/api-docs.json', '/api/json'];
    return skipPaths.some(path => req.path.startsWith(path));
  }
});

/**
 * 认证API速率限制（更严格，防止暴力破解）
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH_MAX,
  message: {
    success: false,
    error: {
      message: '登录尝试次数过多，请15分钟后再试',
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      retryAfter: 900
    }
  },
  skipSuccessfulRequests: true, // 成功的登录不计入限制
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 文件上传速率限制
 */
export const uploadLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.UPLOAD_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.UPLOAD_MAX,
  message: {
    success: false,
    error: {
      message: '文件上传次数过多，请1小时后再试',
      code: 'TOO_MANY_UPLOADS'
    }
  },
  standardHeaders: true
});

/**
 * API查询速率限制
 */
export const apiQueryLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.QUERY_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.QUERY_MAX,
  message: {
    success: false,
    error: {
      message: '查询请求过于频繁，请稍后再试',
      code: 'TOO_MANY_QUERIES'
    }
  },
  standardHeaders: true
});

/**
 * 创建自定义速率限制器
 *
 * @param options 速率限制选项
 * @returns rateLimit中间件
 */
export function createCustomLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: isDevelopment ? options.max * 10 : options.max, // 开发环境放宽10倍
    message: {
      success: false,
      error: {
        message: options.message || '请求过于频繁',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    keyGenerator: (req: Request) => {
      // 根据用户ID或IP生成key
      const userId = (req as any).user?.id;
      const ip = req.ip || req.connection.remoteAddress;
      const prefix = options.keyPrefix || 'custom';
      return `${prefix}:${userId || ip}`;
    }
  });
}

/**
 * IP白名单检查
 */
const IP_WHITELIST = new Set(
  (process.env.RATE_LIMIT_WHITELIST || '').split(',').filter(Boolean)
);

/**
 * 检查IP是否在白名单中
 */
function isWhitelistedIP(req: Request): boolean {
  const ip = req.ip || req.connection.remoteAddress;
  return IP_WHITELIST.has(ip);
}

/**
 * 带白名单的速率限制器
 * 跳过白名单IP的限制
 */
export function createWhitelistedLimiter(baseLimiter: ReturnType<typeof rateLimit>) {
  return rateLimit({
    ...baseLimiter,
    skip: (req: Request) => {
      return isWhitelistedIP(req);
    }
  });
}

/**
 * 导出所有速率限制器
 */
export default {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  apiQueryLimiter,
  createCustomLimiter,
  createWhitelistedLimiter
};

/**
 * 导出配置常量
 */
export const RATE_LIMIT = RATE_LIMIT_CONFIG;
