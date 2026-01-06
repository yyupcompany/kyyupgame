/**
 * 限流中间件
 * 
 * 使用Redis实现API限流，防止恶意请求和刷接口
 */

import { Request, Response, NextFunction } from 'express';
import RedisService from '../services/redis.service';
import { logger } from '../utils/logger';

/**
 * 限流配置选项
 */
export interface RateLimitOptions {
  windowMs: number;  // 时间窗口（毫秒）
  max: number;       // 最大请求数
  keyGenerator?: (req: Request) => string;  // 自定义key生成器
  skipSuccessfulRequests?: boolean;  // 是否跳过成功的请求
  skipFailedRequests?: boolean;      // 是否跳过失败的请求
  message?: string;  // 自定义错误消息
  statusCode?: number;  // 自定义状态码
  handler?: (req: Request, res: Response) => void;  // 自定义处理器
}

/**
 * 限流统计
 */
interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
}

// 全局限流统计
const rateLimitStats: Record<string, RateLimitStats> = {};

/**
 * 创建限流中间件
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = '请求过于频繁，请稍后再试',
    statusCode = 429,
    handler
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 生成限流key
      const key = keyGenerator
        ? keyGenerator(req)
        : `ratelimit:api:${req.user?.id || req.ip}:${req.path}`;

      // 初始化统计
      if (!rateLimitStats[key]) {
        rateLimitStats[key] = {
          totalRequests: 0,
          blockedRequests: 0,
          blockRate: 0
        };
      }

      // 更新总请求数
      rateLimitStats[key].totalRequests++;

      // 获取当前计数
      const count = await RedisService.incr(key);

      // 如果是第一次请求，设置过期时间
      if (count === 1) {
        await RedisService.expire(key, Math.ceil(windowMs / 1000));
      }

      // 检查是否超过限制
      if (count > max) {
        // 更新阻止请求数
        rateLimitStats[key].blockedRequests++;
        rateLimitStats[key].blockRate = 
          (rateLimitStats[key].blockedRequests / rateLimitStats[key].totalRequests) * 100;

        logger.warn(`限流触发: ${key}, 请求数: ${count}, 限制: ${max}`);

        // 使用自定义处理器或默认处理
        if (handler) {
          return handler(req, res);
        }

        return res.status(statusCode).json({
          success: false,
          message,
          retryAfter: Math.ceil(windowMs / 1000),
          limit: max,
          current: count
        });
      }

      // 添加限流信息到响应头
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      // 如果需要跳过成功/失败的请求，在响应后处理
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send;
        res.send = function(data: any) {
          const statusCode = res.statusCode;
          const shouldSkip = 
            (skipSuccessfulRequests && statusCode < 400) ||
            (skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // 减少计数
            RedisService.decr(key).catch(err => {
              logger.error('减少限流计数失败:', err);
            });
          }

          return originalSend.call(this, data);
        };
      }

      next();
    } catch (error) {
      logger.error('限流中间件错误:', error);
      // 限流失败时不阻止请求
      next();
    }
  };
}

/**
 * 预定义的限流策略
 */
export const RateLimitPresets = {
  /**
   * 严格限流 - 用于敏感操作
   * 1分钟内最多10次请求
   */
  strict: {
    windowMs: 60 * 1000,
    max: 10,
    message: '操作过于频繁，请1分钟后再试'
  },

  /**
   * 标准限流 - 用于普通API
   * 1分钟内最多60次请求
   */
  standard: {
    windowMs: 60 * 1000,
    max: 60,
    message: '请求过于频繁，请稍后再试'
  },

  /**
   * 宽松限流 - 用于查询接口
   * 1分钟内最多120次请求
   */
  loose: {
    windowMs: 60 * 1000,
    max: 120,
    message: '请求过于频繁，请稍后再试'
  },

  /**
   * 登录限流 - 防止暴力破解
   * 15分钟内最多5次登录尝试
   */
  login: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: '登录尝试次数过多，请15分钟后再试',
    keyGenerator: (req: Request) => `ratelimit:login:${req.ip}:${req.body.username || 'unknown'}`
  },

  /**
   * 注册限流 - 防止批量注册
   * 1小时内最多3次注册
   */
  register: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: '注册次数过多，请1小时后再试',
    keyGenerator: (req: Request) => `ratelimit:register:${req.ip}`
  },

  /**
   * 验证码限流 - 防止刷验证码
   * 1分钟内最多3次请求
   */
  captcha: {
    windowMs: 60 * 1000,
    max: 3,
    message: '验证码请求过于频繁，请1分钟后再试',
    keyGenerator: (req: Request) => `ratelimit:captcha:${req.ip}`
  },

  /**
   * 文件上传限流
   * 1分钟内最多5次上传
   */
  upload: {
    windowMs: 60 * 1000,
    max: 5,
    message: '文件上传过于频繁，请稍后再试'
  },

  /**
   * 导出限流
   * 5分钟内最多2次导出
   */
  export: {
    windowMs: 5 * 60 * 1000,
    max: 2,
    message: '导出操作过于频繁，请5分钟后再试'
  }
};

/**
 * 获取限流统计
 */
export function getRateLimitStats(key?: string): Record<string, RateLimitStats> | RateLimitStats | null {
  if (key) {
    return rateLimitStats[key] || null;
  }
  return rateLimitStats;
}

/**
 * 清除限流统计
 */
export function clearRateLimitStats(key?: string): void {
  if (key) {
    delete rateLimitStats[key];
  } else {
    Object.keys(rateLimitStats).forEach(k => delete rateLimitStats[k]);
  }
}

/**
 * IP限流中间件
 * 基于IP地址的全局限流
 */
export function ipRateLimitMiddleware(options: Omit<RateLimitOptions, 'keyGenerator'>) {
  return rateLimitMiddleware({
    ...options,
    keyGenerator: (req: Request) => `ratelimit:ip:${req.ip}`
  });
}

/**
 * 用户限流中间件
 * 基于用户ID的限流
 */
export function userRateLimitMiddleware(options: Omit<RateLimitOptions, 'keyGenerator'>) {
  return rateLimitMiddleware({
    ...options,
    keyGenerator: (req: Request) => {
      const userId = req.user?.id || 'anonymous';
      return `ratelimit:user:${userId}:${req.path}`;
    }
  });
}

/**
 * 路径限流中间件
 * 基于API路径的全局限流
 */
export function pathRateLimitMiddleware(options: Omit<RateLimitOptions, 'keyGenerator'>) {
  return rateLimitMiddleware({
    ...options,
    keyGenerator: (req: Request) => `ratelimit:path:${req.path}`
  });
}

export default rateLimitMiddleware;

