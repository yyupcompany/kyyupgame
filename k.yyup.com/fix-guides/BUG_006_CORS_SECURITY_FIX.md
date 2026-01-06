# Bug #6 修复指南 - CORS配置过于宽松

## 问题描述
CORS配置允许所有域名（`origin: '*'`），并且允许携带凭证（`credentials: true`），这是一个危险组合，可能导致CSRF攻击。

## 严重级别
**严重** - 需要立即修复

## 受影响的文件
- `server/src/app.ts`
  - 行号: 115-125

## 漏洞代码

### 漏洞位置: app.ts 第115-125行
```typescript
// ❌ 危险配置：允许所有域名 + 允许携带凭证
const corsOptions = {
  origin: '*', // 允许所有origin
  credentials: true, // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Request-Time', 'X-Source'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 预检请求缓存24小时
};
```

## 攻击场景

### 攻击示例：CSRF攻击
恶意网站 `evil.com` 可以向您的API发送请求：

```html
<!-- evil.com/malicious.html -->
<html>
<body>
  <h1>恭喜你中奖了！</h1>
  <script>
    // 用户访问这个页面时，会自动发送请求到您的API
    fetch('http://localhost:3000/api/users/delete', {
      method: 'DELETE',
      credentials: 'include' // 浏览器会自动携带cookie
    });
  </script>
</body>
</html>
```

由于 `origin: '*'`，浏览器允许这个请求，并且因为 `credentials: true`，cookie也会被发送。

## 修复方案

### 步骤 1: 创建安全的 CORS 配置

创建文件 `server/src/config/cors.config.ts`:

```typescript
import { Request } from 'express';

/**
 * CORS 配置接口
 */
interface CORSConfig {
  origin: string | string[] | boolean | RegExp | ((
    requestOrigin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => void);
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  optionsSuccessStatus?: number;
}

/**
 * 允许的域名白名单
 */
const ALLOWED_ORIGINS = [
  // 生产环境域名
  'https://k.yyup.cc',
  'https://k.yyup.com',

  // 预发布环境
  'https://staging-k.yyup.cc',

  // 开发环境
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',

  // 测试环境
  'http://test.k.yyup.cc'
];

/**
 * 检查 origin 是否在白名单中
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  // 没有 origin 的情况（如移动应用、Postman）
  if (!origin) {
    return process.env.NODE_ENV === 'development';
  }

  // 开发环境允许所有 localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  // 检查白名单
  return ALLOWED_ORIGINS.some(allowed => {
    // 精确匹配
    if (allowed === origin) {
      return true;
    }

    // 通配符子域名匹配
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '[^.]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }

    return false;
  });
}

/**
 * 严格的 CORS 配置
 */
export function getCORSConfig(): CORSConfig {
  return {
    // 动态验证 origin
    origin: (requestOrigin, callback) => {
      // 开发环境：允许 localhost
      if (process.env.NODE_ENV === 'development') {
        if (!requestOrigin ||
            requestOrigin.includes('localhost') ||
            requestOrigin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }

      // 生产环境：严格白名单
      if (isOriginAllowed(requestOrigin)) {
        return callback(null, true);
      }

      // 记录未授权的 CORS 请求
      console.warn('[CORS] 未授权的跨域请求', {
        origin: requestOrigin,
        timestamp: new Date().toISOString()
      });

      return callback(new Error('不允许的跨域来源'), false);
    },

    // 只在特定情况下允许携带凭证
    credentials: process.env.ALLOW_CREDENTIALS === 'true' ? true :
                process.env.NODE_ENV === 'development' ? true : false,

    // 允许的 HTTP 方法
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // 允许的请求头
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Request-Time',
      'X-Source'
    ],

    // 暴露的响应头
    exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],

    // 预检请求缓存时间（秒）
    maxAge: 600, // 10分钟（减少预检请求频率）

    // OPTIONS 请求成功状态码
    optionsSuccessStatus: 204
  };
}

/**
 * 宽松的 CORS 配置（仅用于公共 API）
 */
export function getPublicAPIConfig(): CORSConfig {
  return {
    origin: '*', // 公共 API 允许所有来源
    credentials: false, // 但不允许携带凭证
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600
  };
}

/**
 * 导出配置
 */
export const corsConfig = getCORSConfig();
export const publicAPIConfig = getPublicAPIConfig();
```

### 步骤 2: 创建 Origin 验证中间件

创建文件 `server/src/middlewares/origin-validator.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { isOriginAllowed } from '../config/cors.config';
import { logger } from '../utils/logger';

/**
 * 请求来源验证中间件
 * 在 CORS 之前执行，提供额外的安全层
 */
export function originValidator(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 对于需要验证的请求（非 GET/OPTIONS）
  if (!['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    // 验证 Origin 头
    if (origin && !isOriginAllowed(origin)) {
      logger.warn('[Origin验证] 未授权的请求来源', {
        origin,
        method: req.method,
        path: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: {
          message: '不允许的请求来源',
          code: 'FORBIDDEN_ORIGIN'
        }
      });
    }

    // 验证 Referer 头（额外的安全层）
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

        if (!isOriginAllowed(refererOrigin)) {
          logger.warn('[Referer验证] 不匹配的引用来源', {
            origin,
            referer,
            method: req.method,
            path: req.path
          });
        }
      } catch (error) {
        // Invalid referer, ignore
      }
    }
  }

  // 添加 CORS 相关的响应头
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  next();
}

/**
 * CSRF 保护中间件
 * 为状态改变的操作提供额外的保护
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // 对状态改变的操作进行额外验证
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    // 检查 Origin 和 Referer 的一致性
    if (origin && referer) {
      try {
        const refererUrl = new URL(referer);
        const refererHost = refererUrl.host;

        // Origin 和 Referer 的 host 应该匹配
        if (!origin.includes(refererHost) && !refererHost.includes(origin.replace(/^https?:\/\//, ''))) {
          logger.warn('[CSRF保护] Origin 和 Referer 不匹配', {
            origin,
            referer,
            host
          });

          return res.status(403).json({
            success: false,
            error: {
              message: '请求验证失败',
              code: 'CSRF_DETECTED'
            }
          });
        }
      } catch (error) {
        // Invalid referer, reject request
        return res.status(403).json({
          success: false,
          error: {
            message: '无效的请求来源',
            code: 'INVALID_REFERER'
          }
        });
      }
    }
  }

  next();
}
```

### 步骤 3: 更新 app.ts

**修复前：**
```typescript
const corsOptions = {
  origin: '*', // ❌ 允许所有origin
  credentials: true, // ❌ 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Request-Time', 'X-Source'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400
};

app.use(cors(corsOptions));
```

**修复后：**
```typescript
import cors from 'cors';
import { corsConfig, publicAPIConfig } from './config/cors.config';
import { originValidator, csrfProtection } from './middlewares/origin-validator.middleware';

// 1. 应用 origin 验证（在 CORS 之前）
app.use(originValidator);

// 2. 应用严格的 CORS 配置
app.use(cors(corsConfig));

// 3. 对状态改变的操作应用 CSRF 保护
app.use('/api/', csrfProtection);

// 4. 公共 API 使用宽松配置（但不允许凭证）
app.use('/api/public/', cors(publicAPIConfig));
```

### 步骤 4: 添加 SameSite Cookie 配置

更新 `server/src/app.ts` 中的 cookie 配置：

```typescript
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Cookie 解析器
app.use(cookieParser());

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 只在 HTTPS 下发送
    httpOnly: true, // 防止 XSS 访问
    sameSite: 'strict', // 防止 CSRF 攻击
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));
```

### 步骤 5: 添加 CSRF Token 机制（可选但推荐）

创建文件 `server/src/middlewares/csrf-token.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Token 存储
 */
const csrfTokens = new Map<string, { token: string; expiry: number }>();

/**
 * 生成 CSRF Token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 获取 CSRF Token
 */
export function getCSRFToken(sessionId: string): string {
  // 清理过期的 token
  const now = Date.now();
  for (const [id, data] of csrfTokens.entries()) {
    if (data.expiry < now) {
      csrfTokens.delete(id);
    }
  }

  // 检查是否已有有效 token
  const existing = csrfTokens.get(sessionId);
  if (existing && existing.expiry > now) {
    return existing.token;
  }

  // 生成新 token
  const token = generateCSRFToken();
  csrfTokens.set(sessionId, {
    token,
    expiry: now + (24 * 60 * 60 * 1000) // 24小时
  });

  return token;
}

/**
 * 验证 CSRF Token
 */
function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (stored.expiry < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }

  return stored.token === token;
}

/**
 * CSRF Token 中间件
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // 对安全的请求方法跳过验证
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionId = req.sessionID || req.ip || 'unknown';
  const token = req.headers['x-csrf-token'] as string;
  const headerToken = req.body._csrf || req.query._csrf;

  const csrfToken = token || headerToken;

  if (!csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF token 验证失败',
        code: 'INVALID_CSRF_TOKEN'
      }
    });
  }

  next();
}

/**
 * 提供 CSRF Token 的端点
 */
export function getCSRFTokenEndpoint(req: Request, res: Response) {
  const sessionId = req.sessionID || req.ip || 'unknown';
  const token = getCSRFToken(sessionId);

  res.json({
    success: true,
    data: {
      csrfToken: token
    }
  });
}
```

在路由中使用：

```typescript
import { csrfTokenMiddleware, getCSRFTokenEndpoint } from '../middlewares/csrf-token.middleware';

// 提供 CSRF token
app.get('/api/csrf-token', getCSRFTokenEndpoint);

// 对需要保护的端点应用 CSRF 验证
app.use('/api/users', csrfTokenMiddleware);
app.use('/api/admin', csrfTokenMiddleware);
```

### 步骤 6: 更新环境变量

更新 `server/.env`:

```bash
# ================================
# CORS 配置
# ================================

# 是否允许携带凭证（生产环境建议 false）
ALLOW_CREDENTIALS=false

# 允许的域名（逗号分隔）
ALLOWED_ORIGINS=https://k.yyup.cc,https://k.yyup.com,http://localhost:5173

# Session 密钥
SESSION_SECRET=your-random-session-secret-here

# HTTPS 强制（生产环境）
FORCE_HTTPS=true
```

### 步骤 7: 前端配合修改

更新 `client/src/utils/request.ts`:

```typescript
// 在开发环境使用代理，生产环境使用完整 URL
const API_BASE_URL = import.meta.env.PROD
  ? 'https://k.yyup.cc/api'
  : '/api';

// 请求拦截器添加 CSRF token
if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
  const csrfToken = localStorage.getItem('csrf_token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
}

// 在页面加载时获取 CSRF token
export async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('csrf_token', data.data.csrfToken);
    }
  } catch (error) {
    console.error('获取 CSRF token 失败:', error);
  }
}
```

## 验证步骤

### 1. CORS 验证测试
创建文件 `server/tests/__tests__/cors-security.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('CORS Security', () => {
  describe('允许的域名', () => {
    const allowedOrigins = [
      'https://k.yyup.cc',
      'http://localhost:5173'
    ];

    allowedOrigins.forEach(origin => {
      it(`should allow requests from ${origin}`, async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Origin', origin);

        expect(response.headers['access-control-allow-origin']).toBe(origin);
      });
    });
  });

  describe('未授权的域名', () => {
    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Origin', 'https://evil.com')
        .send({ name: 'Test' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN_ORIGIN');
    });
  });

  describe('预检请求', () => {
    it('should handle OPTIONS requests correctly', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', 'https://k.yyup.cc')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('凭证处理', () => {
    it('should not allow credentials from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Origin', 'https://k.yyup.cc');

      // 检查是否没有 Access-Control-Allow-Credentials
      // 或者根据配置验证
    });
  });
});
```

### 2. CSRF 保护测试
创建文件 `server/tests/__tests__/csrf-protection.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('CSRF Protection', () => {
  it('should reject POST requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Origin', 'https://k.yyup.cc')
      .send({ name: 'Test' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('INVALID_CSRF_TOKEN');
  });

  it('should accept POST requests with valid CSRF token', async () => {
    // 1. 获取 CSRF token
    const tokenResponse = await request(app)
      .get('/api/csrf-token')
      .set('Origin', 'https://k.yyup.cc');

    const csrfToken = tokenResponse.body.data.csrfToken;

    // 2. 使用 token 发送请求
    const response = await request(app)
      .post('/api/users')
      .set('Origin', 'https://k.yyup.cc')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Test' });

    expect([200, 201]).toContain(response.status);
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- cors-security.test.ts
cd server && npm test -- csrf-protection.test.ts
```

### 4. 手动测试
使用浏览器开发工具测试：

```javascript
// 在浏览器控制台执行（在 k.yyup.cc 上）
fetch('http://localhost:3000/api/users', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Test' })
})
.then(r => r.json())
.then(console.log);
// 应该成功

// 在 evil.com 上测试
fetch('http://localhost:3000/api/users/delete', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
// 应该被拒绝
```

## 监控和日志

### 添加 CORS 安全日志

创建文件 `server/src/utils/cors-logger.ts`:

```typescript
import { logger } from './logger';

/**
 * 记录 CORS 相关的安全事件
 */
export function logCorsSecurityEvent(event: {
  type: 'unauthorized_origin' | 'csrf_detected' | 'referer_mismatch';
  origin?: string;
  referer?: string;
  method: string;
  path: string;
  ip: string;
}) {
  const { type, origin, referer, method, path, ip } = event;

  logger.warn('[CORS安全事件]', {
    type,
    origin,
    referer,
    method,
    path,
    ip,
    timestamp: new Date().toISOString(),
    userAgent: globalThis.request?.headers['user-agent']
  });

  // 生产环境可以发送到安全监控系统
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送到 SIEM 或安全分析平台
  }
}

/**
 * 定期生成 CORS 安全报告
 */
export function generateCorsSecurityReport() {
  // 分析日志中的 CORS 安全事件
  // 生成趋势报告和威胁指标
}
```

## 修复完成检查清单

- [ ] CORS 配置文件已创建
- [ ] Origin 白名单已配置
- [ ] app.ts 中的 CORS 配置已更新
- [ ] Origin 验证中间件已实现
- [ ] CSRF 保护中间件已实现
- [ ] SameSite Cookie 配置已设置
- [ ] CSRF Token 机制已实现（可选）
- [ ] 环境变量已配置
- [ ] 前端已配合修改
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已通过
- [ ] 安全日志已实现
- [ ] 监控告警已配置

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
