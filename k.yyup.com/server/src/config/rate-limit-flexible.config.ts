/**
 * 灵活的限流配置
 *
 * 提供可配置的限流策略，支持不同场景的限流需求
 */

import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

/**
 * 限流策略配置
 */
export interface RateLimitConfig {
  windowMs: number;           // 时间窗口（毫秒）
  max: number;                // 最大请求数
  message?: string;           // 超限消息
  keyGenerator?: (req: Request) => string;  // 自定义key生成器
  skip?: (req: Request) => boolean;        // 跳过条件
  standardHeaders?: boolean;  // 标准化响应头
  legacyHeaders?: boolean;    // 传统响应头
}

/**
 * 预定义限流策略
 */
export const RateLimitPresets = {
  // 严格限流（登录等敏感操作）
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5,
    message: '请求过于频繁，请稍后再试'
  },

  // 登录限流
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10,
    message: '登录尝试次数过多，请15分钟后再试',
    keyGenerator: (req: Request) => {
      // 基于IP+用户名组合限流
      const identifier = req.body.phone || req.body.username || req.body.email || req.ip;
      return `login:${identifier}`;
    }
  },

  // API限流
  API: {
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 100,
    message: 'API请求超限'
  },

  // AI服务限流（较宽松）
  AI_SERVICE: {
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 20,
    message: 'AI服务请求超限，请稍后再试'
  },

  // 文件上传限流
  UPLOAD: {
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 10,
    message: '上传请求过于频繁'
  },

  // 短信验证码限流
  SMS: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5,
    message: '验证码发送次数已达上限',
    keyGenerator: (req: Request) => {
      const phone = req.body.phone;
      return phone ? `sms:${phone}` : `sms:${req.ip}`;
    }
  },

  // 宽松限流（开发环境）
  LENIENT: {
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 1000,
    message: '请求过于频繁'
  }
} as const;

/**
 * 创建限流中间件
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return rateLimit({
    windowMs: config.windowMs,
    max: isDevelopment ? config.max * 10 : config.max, // 开发环境宽松10倍
    message: config.message || '请求过于频繁，请稍后再试',
    standardHeaders: config.standardHeaders ?? true,
    legacyHeaders: config.legacyHeaders ?? false,
    keyGenerator: config.keyGenerator,
    skip: config.skip,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          message: config.message || '请求过于频繁',
          code: 'TOO_MANY_REQUESTS',
          retryAfter: Math.ceil(config.windowMs / 1000)
        }
      });
    }
  });
}

/**
 * IP限流器（防止IP级别的攻击）
 */
export class IPRateLimiter {
  private limiters: Map<string, RateLimiterMemory> = new Map();

  constructor(private options: { points: number; duration: number }) {}

  /**
   * 检查并消耗限流配额
   */
  async consume(key: string, points: number = 1): Promise<boolean> {
    if (!this.limiters.has(key)) {
      this.limiters.set(key, new RateLimiterMemory({
        points: this.options.points,
        duration: this.options.duration
      }));
    }

    const limiter = this.limiters.get(key)!;
    try {
      await limiter.consume(points);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取剩余配额
   */
  async getRemainingPoints(key: string): Promise<number> {
    if (!this.limiters.has(key)) {
      return this.options.points;
    }

    const limiter = this.limiters.get(key)!;
    return limiter.getRemainingPoints();
  }

  /**
   * 清除限流记录
   */
  clear(key: string): void {
    this.limiters.delete(key);
  }
}

/**
 * 基于用户的限流中间件
 */
export function createUserRateLimiter() {
  const userLimiter = new IPRateLimiter({
    points: 100,      // 每小时100次请求
    duration: 3600    // 1小时
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    // 获取用户标识
    const userId = (req as any).user?.id || req.ip;
    const key = `user:${userId}`;

    const allowed = await userLimiter.consume(key);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        error: {
          message: '用户请求超限',
          code: 'USER_RATE_LIMIT_EXCEEDED',
          retryAfter: 3600
        }
      });
    }

    // 将限流器添加到请求对象，供后续使用
    (req as any).rateLimiter = userLimiter;

    next();
  };
}

/**
 * 动态限流中间件（根据用户角色调整限流）
 */
export function createDynamicRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const isAdmin = user?.isAdmin;

    // 管理员无限制
    if (isAdmin) {
      return next();
    }

    // 普通用户限流
    const limiter = createRateLimitMiddleware({
      windowMs: 1 * 60 * 1000,
      max: user ? 100 : 20, // 登录用户100次/分钟，未登录20次/分钟
      message: '请求过于频繁，请稍后再试'
    });

    return limiter(req, res, next);
  };
}

/**
 * 导出预设中间件
 */
export const rateLimitMiddlewares = {
  strict: createRateLimitMiddleware(RateLimitPresets.STRICT),
  login: createRateLimitMiddleware(RateLimitPresets.LOGIN),
  api: createRateLimitMiddleware(RateLimitPresets.API),
  aiService: createRateLimitMiddleware(RateLimitPresets.AI_SERVICE),
  upload: createRateLimitMiddleware(RateLimitPresets.UPLOAD),
  sms: createRateLimitMiddleware(RateLimitPresets.SMS),
  lenient: createRateLimitMiddleware(RateLimitPresets.LENIENT),
  userBased: createUserRateLimiter(),
  dynamic: createDynamicRateLimiter()
} as const;

/**
 * 导出配置
 */
export default {
  RateLimitPresets,
  createRateLimitMiddleware,
  IPRateLimiter,
  createUserRateLimiter,
  createDynamicRateLimiter,
  rateLimitMiddlewares
};
