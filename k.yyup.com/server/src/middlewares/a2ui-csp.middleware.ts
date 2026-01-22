/**
 * A2UI 内容安全策略中间件
 * 为A2UI相关路由提供严格的安全头配置
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 默认CSP配置 - 适用于A2UI API端点
 */
const A2UI_CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'"], // 禁止内联脚本
  'style-src': ["'self'", "'unsafe-inline'"], // 允许内联样式用于Vue
  'img-src': ["'self'", "data:", "https:", "blob:"],
  'media-src': ["'self'", "data:", "https:", "blob:"],
  'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
  'connect-src': ["'self'", "https:", "ws:", "wss:"],
  'frame-src': ["'none'"], // 禁止iframe嵌入
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};

/**
 * 宽松CSP配置 - 适用于开发环境
 */
const A2UI_CSP_POLICY_DEV = {
  ...A2UI_CSP_POLICY,
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // 开发环境允许内联脚本
  'connect-src': ["'self'", "http://localhost:*", "ws://localhost:*", "https:"]
};

/**
 * 生成CSP头字符串
 */
function generateCSPHeader(policy: Record<string, string[]>): string {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      const sourceList = sources.join(' ');
      return `${directive} ${sourceList}`;
    })
    .join('; ');
}

/**
 * A2UI CSP中间件 - 生产环境
 */
export function a2uiCSPMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 判断是否开发环境
  const isDevelopment = process.env.NODE_ENV === 'development';

  const cspPolicy = isDevelopment ? A2UI_CSP_POLICY_DEV : A2UI_CSP_POLICY;
  const cspHeader = generateCSPHeader(cspPolicy);

  // 设置Content-Security-Policy头
  res.setHeader('Content-Security-Policy', cspHeader);

  // X-Content-Type-Options - 防止MIME类型混淆
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options - 禁止被iframe嵌入
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection - 旧版浏览器的XSS保护
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - 控制引用来源信息
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - 限制浏览器功能
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'vr=()'
  ].join(', '));

  next();
}

/**
 * 严格的A2UI CSP中间件 - 用于敏感端点
 * 禁用更多可能造成安全问题的功能
 */
export function strictA2uiCSPMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const strictPolicy = {
    'default-src': ["'self'"],
    'script-src': isDevelopment ? ["'self'", "'unsafe-inline'"] : ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'media-src': ["'self'", "https:"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'connect-src': ["'self'", "https:"],
    'frame-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'plugin-types': ["none"],
    'require-trusted-types-for': ["'script'"]
  };

  const cspHeader = generateCSPHeader(strictPolicy);
  res.setHeader('Content-Security-Policy', cspHeader);

  // 额外的安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}

/**
 * WebSocket连接的CSP头设置
 */
export function setWebSocketCSPHeaders(res: Response): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}

/**
 * SSE (Server-Sent Events) 的CSP头设置
 */
export function setSSECSPHeaders(req: Request, res: Response, allowedOrigins: string[]): void {
  const origin = req.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲

  // 严格的CORS配置
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // 安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}

/**
 * 获取当前CSP配置（用于调试）
 */
export function getCurrentCSPConfig(): Record<string, string[]> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? A2UI_CSP_POLICY_DEV : A2UI_CSP_POLICY;
}

/**
 * CSP报告配置 - 用于收集违规报告
 */
export function getCSPReportConfig(reportUri: string): Record<string, string[]> {
  return {
    ...A2UI_CSP_POLICY,
    'report-uri': [reportUri],
    'report-to': ['csp-endpoint']
  };
}

/**
 * CSP违规处理中间件
 */
export function cspViolationHandler(req: Request, res: Response): void {
  // 记录违规信息
  const violation = {
    timestamp: new Date().toISOString(),
    documentUri: req.get('referer'),
    violatedDirective: req.body['violated-directive'],
    blockedUri: req.body['blocked-uri'],
    sourceFile: req.body['source-file'],
    lineNumber: req.body['line-number'],
    userAgent: req.get('user-agent')
  };

  console.error('[CSP Violation]', JSON.stringify(violation, null, 2));

  // 可以选择发送报告到监控系统
  // await monitoringService.reportCSPViolation(violation);

  // 返回成功响应（避免泄露违规细节）
  res.status(204).send();
}
