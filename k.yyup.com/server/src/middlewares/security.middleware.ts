/**
 * 安全防护中间件
 * 处理SQL注入、XSS攻击、暴力破解防护等安全措施
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult, query } from 'express-validator';
import helmet from 'helmet';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 暴力破解防护 - 登录限制
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10000, // 临时关闭速率限制用于测试
  message: {
    success: false,
    error: 'TOO_MANY_ATTEMPTS',
    message: '登录尝试过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入限制
  handler: (...args: any[]) => {
    const req = args[0] as any;
    const res = args[1] as any;
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_ATTEMPTS',
      message: '登录尝试过于频繁，请稍后再试'
    });
  }
});

/**
 * API通用频率限制
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10000, // 临时关闭速率限制用于测试
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (...args: any[]) => {
    const req = args[0] as any;
    const res = args[1] as any;
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: '请求过于频繁，请稍后再试'
    });
  }
});

/**
 * 严格的频率限制 - 用于敏感操作
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 限制每个IP 10次请求
  message: {
    success: false,
    error: 'STRICT_RATE_LIMIT',
    message: '操作过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 登录参数验证和清理
 */
export const loginValidation = [
  body('email').optional().isEmail().normalizeEmail().escape()
    .withMessage('邮箱格式无效'),
  body('username').optional().isLength({ min: 1, max: 50 }).trim().escape()
    .withMessage('用户名长度必须在1-50字符之间'),
  body('password').isLength({ min: 6 }).escape()
    .withMessage('密码至少6位'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '参数验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 通用参数验证中间件
 */
export const validateInput = (validations: any[]) => {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '参数验证失败',
          details: errors.array()
        });
      }
      next();
    }
  ];
};

/**
 * XSS防护中间件
 */
export const xssProtection = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * SQL注入防护 - 检查危险字符
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const dangerousPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT|MERGE|SELECT|UPDATE|UNION( ALL){0,1})\b)/gi,
    /(\b(AND|OR)\b.{1,6}?(=|>|<|\!|\+|\*|\%|\&|\|))/gi,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi,
    /(\'((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52)))/gi,
    /(\*|\;|\+|\')|((\%27)|(\'))\s*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
    /((\%27)|(\'))union/gi,
    /exec(\s|\+)+(s|x)p\w+/gi
  ];

  const checkObject = (obj: any, path = ''): boolean => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
          for (const pattern of dangerousPatterns) {
            if (pattern.test(value)) {
              console.warn(`[SQL注入检测] 发现可疑模式在 ${currentPath}: ${value}`);
              return true;
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          if (checkObject(value, currentPath)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 检查请求体、查询参数和路径参数
  const requestData = { ...req.body, ...req.query, ...req.params };
  
  if (checkObject(requestData)) {
    res.status(400).json({
      success: false,
      error: 'SECURITY_VIOLATION',
      message: '请求包含不安全的内容'
    });
    return;
  }

  next();
};

/**
 * 文件上传安全检查
 */
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx'
  ];

  const files = req.files ? (Array.isArray(req.files) ? req.files : [req.file]) : [req.file];

  for (const file of files) {
    if (!file) continue;

    // 检查MIME类型
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: `不支持的文件类型: ${file.mimetype}`
      });
    }

    // 检查文件扩展名
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_EXTENSION',
        message: `不支持的文件扩展名: ${fileExt}`
      });
    }

    // 检查文件大小 (10MB限制)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'FILE_TOO_LARGE',
        message: '文件大小不能超过10MB'
      });
    }

    // 清理文件名
    file.originalname = file.originalname.replace(/[^\w\-_\.]|\.\.+/g, '');
  }

  next();
};

/**
 * 请求大小限制
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      error: 'REQUEST_TOO_LARGE',
      message: '请求体大小超过限制'
    });
    return;
  }

  next();
};

/**
 * 安全头设置
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // 移除敏感的服务器信息
  res.removeHeader('X-Powered-By');
  
  // 添加安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS安全配置
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://k.yyup.cc',
    process.env.FRONTEND_URL?.replace('https://', 'http://') || 'http://k.yyup.cc'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  next();
};

/**
 * IP白名单检查 (可选)
 */
export const ipWhitelist = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (whitelist.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!clientIP || !whitelist.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'IP_NOT_ALLOWED',
        message: '访问被拒绝'
      });
    }

    next();
  };
};

/**
 * 请求日志记录
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 记录请求信息
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    
    // 记录错误请求的详细信息
    if (res.statusCode >= 400) {
      console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined,
        query: Object.keys(req.query).length > 0 ? req.query : undefined
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

export default {
  loginLimiter,
  apiLimiter,
  strictLimiter,
  loginValidation,
  validateInput,
  xssProtection,
  sqlInjectionProtection,
  fileUploadSecurity,
  requestSizeLimit,
  securityHeaders,
  ipWhitelist,
  requestLogger
};