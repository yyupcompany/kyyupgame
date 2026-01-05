/**
 * 域名验证中间件
 * 用于验证API请求的来源域名，确保只有授权域名可以访问
 */

import { Request, Response, NextFunction } from 'express';

// 🔧 修复：动态构建授权域名列表，避免硬编码
const port = process.env.PORT || 3000;
const frontendPort = process.env.FRONTEND_PORT || 5173;

// 授权域名列表
const ALLOWED_ORIGINS = [
  // 开发环境 - 使用动态端口
  `http://localhost:${frontendPort}`,
  `http://127.0.0.1:${frontendPort}`,
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,

  // 生产环境
  'https://k.yyup.cc',
  'https://k.yyup.com',
  'https://www.k.yyup.cc',
  'https://www.k.yyup.com',

  // 统一认证中心
  'https://rent.yyup.cc',
  'https://www.rent.yyup.cc',

  // 子租户域名（正则匹配）
  '/*.k.yyup.cc',
  '/*.k.yyup.com'
];

// Demo系统域名
const DEMO_DOMAINS = [
  'k.yyup.cc',
  'k.yyup.com',
  'localhost',
  '127.0.0.1'
];

/**
 * 检查是否为授权的域名
 */
function isAllowedOrigin(origin: string): boolean {
  // 直接匹配
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // 正则匹配子域名
  const patterns = [
    /^https:\/\/[a-z0-9-]+\.k\.yyup\.cc$/,
    /^https:\/\/[a-z0-9-]+\.k\.yyup\.com$/,
    /^http:\/\/[a-z0-9-]+\.localhost:\d+$/,
    /^http:\/\/[a-z0-9-]+\.127\.0\.0\.1:\d+$/
  ];

  return patterns.some(pattern => pattern.test(origin));
}

/**
 * 检查是否为Demo系统
 */
function isDemoSystem(host: string): boolean {
  const cleanHost = host.split(':')[0];
  return DEMO_DOMAINS.includes(cleanHost);
}

/**
 * 域名验证中间件
 */
export const domainValidationMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const host = req.get('Host');

    // 开发环境宽松验证
    if (process.env.NODE_ENV === 'development') {
      // 开发环境允许localhost和IP访问
      if (!host || host.includes('localhost') || host.includes('127.0.0.1')) {
        req.isDemo = true;
        req.tenantType = 'development';
        return next();
      }
    }

    // 验证Host头
    if (!host) {
      console.warn('[域名验证] 缺少Host头:', { origin, referer, userAgent: req.get('User-Agent') });
      return res.status(400).json({
        success: false,
        message: 'Bad Request: Missing Host header',
        code: 'MISSING_HOST'
      });
    }

    // 提取Origin或Referer中的域名
    let requestOrigin = origin;
    if (!requestOrigin && referer) {
      try {
        const refererUrl = new URL(referer);
        requestOrigin = refererUrl.origin;
      } catch (e) {
        // Invalid referer URL
      }
    }

    // 验证请求来源
    if (requestOrigin && !isAllowedOrigin(requestOrigin)) {
      console.warn('[域名验证] 未授权的域名访问:', {
        host,
        origin: requestOrigin,
        referer,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        message: 'Access Denied: Unauthorized domain',
        code: 'UNAUTHORIZED_DOMAIN',
        data: {
          host,
          origin: requestOrigin
        }
      });
    }

    // 设置请求上下文信息
    req.isDemo = isDemoSystem(host);
    req.tenantType = req.isDemo ? 'demo' : 'production';
    req.allowedOrigin = requestOrigin;

    // 为Demo系统添加特殊响应头
    if (req.isDemo) {
      res.set({
        'X-Demo-Mode': 'true',
        'X-Demo-Notice': 'This is a demo environment - Do not submit real data',
        'X-Environment': 'demo'
      });
    }

    // 记录授权访问
    console.log('[域名验证] 访问已授权:', {
      host,
      origin: requestOrigin,
      isDemo: req.isDemo,
      tenantType: req.tenantType,
      path: req.path,
      method: req.method
    });

    next();

  } catch (error) {
    console.error('[域名验证] 中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: Domain validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

/**
 * CORS配置生成器
 */
export const getCorsOptions = () => ({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 开发环境允许无origin的请求（如Postman、curl等）
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      } else {
        // 生产环境必须提供origin
        return callback(new Error('Origin required'), false);
      }
    }

    // 检查是否为授权域名
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] 未授权的域名:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Request-Time',
    'X-Source',
    'X-Tenant-Code',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Demo-Mode',
    'X-Demo-Notice',
    'X-Environment',
    'X-Total-Count',
    'X-Page-Count'
  ],
  maxAge: 86400, // 预检请求缓存24小时
  optionsSuccessStatus: 200 // 兼容旧版本浏览器
});

/**
 * 租户信息获取函数
 */
export const getTenantInfo = (host: string) => {
  const cleanHost = host.split(':')[0];

  // Demo系统信息
  if (isDemoSystem(cleanHost)) {
    return {
      type: 'demo',
      code: 'k_tenant',
      domain: cleanHost,
      database: process.env.DB_NAME || 'kargerdensales',
      features: ['full_access', 'mock_data', 'extended_limits']
    };
  }

  // 子租户信息
  const subTenantMatch = cleanHost.match(/^([a-z0-9-]+)\.k\.yyup\.cc$/);
  if (subTenantMatch) {
    const tenantCode = subTenantMatch[1];
    return {
      type: 'sub_tenant',
      code: tenantCode,
      domain: cleanHost,
      database: `tenant_${tenantCode}`,
      features: ['limited_access', 'real_data', 'standard_limits']
    };
  }

  // 默认信息
  return {
    type: 'unknown',
    code: null,
    domain: cleanHost,
    database: null,
    features: []
  };
};

export default domainValidationMiddleware;