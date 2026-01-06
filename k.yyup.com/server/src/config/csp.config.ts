/**
 * 内容安全策略（CSP）配置
 *
 * 防止XSS攻击、数据注入等安全威胁
 */

import helmet from 'helmet';

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * CSP源配置
 */
export const CSP_SOURCES = {
  // 默认源
  defaultSrc: ["'self'"],

  // 脚本源
  scriptSrc: isDevelopment
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] // 开发环境需要
    : ["'self'"],

  // 样式源
  styleSrc: ["'self'", "'unsafe-inline'"], // CSS需要inline

  // 图片源
  imgSrc: ["'self'", "data:", "https:", "blob:", "http:"],

  // 字体源
  fontSrc: ["'self'", "data:"],

  // 连接源（API、WebSocket）
  connectSrc: [
    "'self'",
    "http://localhost:*",
    "https://localhost:*",
    ...(isProduction ? [] : ["ws://localhost:*", "wss://localhost:*"])
  ],

  // 媒体源
  mediaSrc: ["'self'", "blob:"],

  // 对象源
  objectSrc: ["'none'"], // 不允许插件

  // 嵌入源
  childSrc: ["'self'"],

  // 框架源
  frameSrc: ["'none'"], // 不允许iframe

  // Worker源
  workerSrc: ["'self'", "blob:"],

  // Manifest源
  manifestSrc: ["'self'"],

  // 基础URI
  baseUri: ["'self'"],

  // 表单action
  formAction: ["'self'"],

  // Frame-ancestors（防止点击劫持）
  frameAncestors: ["'none'"],

  // Upgrade-insecure-requests（自动升级HTTP到HTTPS）
  upgradeInsecureRequests: isProduction
};

/**
 * CSP配置
 */
export const cspConfig = {
  directives: {
    ...CSP_SOURCES,

    // 添加报告URI（用于监控CSP违规）
    ...(isProduction && {
      reportUri: '/api/security/csp-report'
    }),

    // 添加报告到
    ...(isProduction && {
      reportTo: 'csp-endpoint'
    })
  },

  // 报告模式（不阻止，只报告）
  reportOnly: process.env.CSP_REPORT_ONLY === 'true'
};

/**
 * Helmet安全头配置
 */
export const helmetConfig = {
  // Content Security Policy
  contentSecurityPolicy: cspConfig,

  // HTTP Strict Transport Security (仅HTTPS)
  hsts: isProduction
    ? {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true
      }
    : false,

  // X-Frame-Options (防止点击劫持)
  frameguard: {
    action: 'deny' // 不允许在任何iframe中嵌入
  },

  // X-Content-Type-Options (防止MIME嗅探)
  noSniff: true,

  // X-XSS-Protection (已过时，但保留用于兼容)
  xssFilter: true,

  // Referrer-Policy
  referrerPolicy: {
    policy: ['strict-origin-when-cross-origin']
  },

  // Permissions-Policy (原Feature-Policy)
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      magnetometer: ["'none'"],
      gyroscope: ["'none'"],
      accelerometer: ["'none'"]
    }
  },

  // 跨域资源策略
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },

  // 跨域嵌入策略
  crossOriginEmbedderPolicy: false,

  // 跨域打开策略
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups'
  }
};

/**
 * 开发环境宽松配置
 */
export const developmentHelmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:*'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "http:"],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*", "ws://localhost:*", "wss://localhost:*"],
      fontSrc: ["'self'", "data:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"], // 开发环境允许iframe
      workerSrc: ["'self'", "blob:", 'http://localhost:*']
    }
  },

  // 其他安全头保持默认
  noSniff: true,
  frameguard: { action: 'deny' }
};

/**
 * 获取当前环境配置
 */
export function getHelmetConfig() {
  return isDevelopment ? developmentHelmetConfig : helmetConfig;
}

/**
 * 导出所有配置
 */
export default {
  CSP_SOURCES,
  cspConfig,
  helmetConfig,
  developmentHelmetConfig,
  getHelmetConfig
};
