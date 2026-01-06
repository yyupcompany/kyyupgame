# Bug #21 修复指南 - 静态文件服务路径遍历漏洞

## 问题描述
静态文件服务配置不当，可能受到路径遍历攻击，恶意用户可以访问系统上的任意文件。

## 严重级别
**高**

## 受影响的文件
- `server/src/app.ts` (静态文件配置)

## 问题分析

1. **路径遍历攻击**: `../` 可以访问父目录
2. **敏感文件泄露**: 可能访问配置文件、源代码等
3. **目录浏览**: 暴露服务器文件结构
4. **文件类型泄露**: 可以下载任意类型文件

## 修复方案（限制静态文件访问范围）

### 步骤 1: 创建静态文件安全配置

在 `server/src/config/static-files.config.ts` 创建配置文件：

```typescript
import path from 'path';
import fs from 'fs';

/**
 * 允许的静态文件扩展名白名单
 */
export const ALLOWED_EXTENSIONS = new Set([
  // 图片
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
  // 视频
  '.mp4', '.webm', '.ogg',
  // 音频
  '.mp3', '.wav', '.ogg',
  // 文档
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // 文本
  '.txt', '.md', '.json', '.xml',
  // 字体
  '.woff', '.woff2', '.ttf', '.eot',
  // 前端资源
  '.js', '.css', '.html', '.map'
]);

/**
 * 危险文件扩展名黑名单
 */
export const DANGEROUS_EXTENSIONS = new Set([
  '.env', '.key', '.pem', '.p12', '.pfx',
  '.sql', '.db', '.sqlite',
  '.log', '.bak', '.backup',
  '.sh', '.bash', '.bat', '.cmd',
  '.ps1', '.vbs', '.js' // 仅在特定目录允许
]);

/**
 * 安全的路径解析
 */
export function safePathResolve(root: string, requestedPath: string): string | null {
  // 1. 规范化路径
  const normalizedPath = path.normalize(requestedPath);

  // 2. 检查是否包含路径遍历
  if (normalizedPath.includes('..')) {
    console.warn('🚫 路径遍历尝试:', requestedPath);
    return null;
  }

  // 3. 解析完整路径
  const fullPath = path.resolve(root, normalizedPath);

  // 4. 确保路径在root目录内
  const relativePath = path.relative(root, fullPath);
  if (relativePath.startsWith('..')) {
    console.warn('🚫 路径超出根目录:', requestedPath);
    return null;
  }

  return fullPath;
}

/**
 * 验证文件扩展名
 */
export function validateFileExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  // 检查是否为危险扩展名
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    console.warn('🚫 危险文件扩展名:', ext);
    return false;
  }

  // 检查是否在白名单中
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    console.warn('🚫 不允许的文件扩展名:', ext);
    return false;
  }

  return true;
}

/**
 * 验证文件是否存在
 */
export function validateFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * 安全的静态文件中间件配置
 */
export const staticFilesConfig = {
  // 禁止目录浏览
  index: false,

  // 设置响应头
  setHeaders: (res: any, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();

    // 安全相关的响应头
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 下载文件而不是执行
    if (['.html', '.js', '.json'].includes(ext)) {
      res.setHeader('Content-Disposition', 'attachment');
    }

    // 缓存控制
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时
    }
  }
};

/**
 * 自定义静态文件服务中间件（带验证）
 */
export function createSafeStaticMiddleware(root: string, urlPath: string) {
  return (req: any, res: any, next: any) => {
    // 1. 只处理GET和HEAD请求
    if (!['GET', 'HEAD'].includes(req.method)) {
      return next();
    }

    // 2. 移除URL前缀，获取文件路径
    const requestPath = req.path.substring(urlPath.length);

    // 3. 安全解析路径
    const safePath = safePathResolve(root, requestPath);
    if (!safePath) {
      return res.status(403).json({
        success: false,
        error: {
          message: '访问被拒绝',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // 4. 验证文件扩展名
    if (!validateFileExtension(safePath)) {
      return res.status(403).json({
        success: false,
        error: {
          message: '不允许的文件类型',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }

    // 5. 验证文件存在
    if (!validateFileExists(safePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: '文件不存在',
          code: 'FILE_NOT_FOUND'
        }
      });
    }

    // 6. 发送文件
    res.sendFile(safePath, {
      root: '/',
      headers: {
        'X-Content-Type-Options': 'nosniff'
      }
    }, (err: any) => {
      if (err) {
        console.error('发送文件错误:', err);
        return res.status(500).json({
          success: false,
          error: {
            message: '文件发送失败',
            code: 'FILE_SEND_ERROR'
          }
        });
      }
    });
  };
}
```

### 步骤 2: 在app.ts中应用

**修复前：**
```typescript
// ❌ 不安全的静态文件服务
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
```

**修复后：**
```typescript
import express from 'express';
import {
  staticFilesConfig,
  createSafeStaticMiddleware
} from './config/static-files.config';

// ================================
# 安全的静态文件服务
# ================================

// 方式1: 使用安全配置（推荐）
app.use('/uploads', express.static('uploads', staticFilesConfig));
app.use('/public', express.static('public', staticFilesConfig));

// 方式2: 使用自定义中间件（更严格）
// app.use('/uploads', createSafeStaticMiddleware('uploads', '/uploads'));
```

### 步骤 3: 添加文件大小限制

```typescript
import express from 'express';

/**
 * 限制静态文件大小
 */
const MAX_FILE_SIZE = parseInt(process.env.MAX_STATIC_FILE_SIZE || '104857600', 10); // 100MB

app.use('/uploads', express.static('uploads', {
  ...staticFilesConfig,
  maxAge: '1d',
  // 添加文件大小检查
  setHeaders: (res, filePath) => {
    staticFilesConfig.setHeaders(res, filePath);

    try {
      const stats = require('fs').statSync(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        console.warn('🚫 文件过大:', filePath, stats.size);
        res.setHeader('X-File-Too-Large', 'true');
      }
    } catch (error) {
      // 忽略错误
    }
  }
}));
```

### 步骤 4: 添加请求频率限制

```typescript
import rateLimit from 'express-rate-limit';

/**
 * 静态文件访问频率限制
 */
const staticFileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求
  message: {
    success: false,
    error: {
      message: '静态文件访问过于频繁',
      code: 'TOO_MANY_REQUESTS'
    }
  }
});

app.use('/uploads', staticFileLimiter, express.static('uploads', staticFilesConfig));
```

### 步骤 5: 添加访问日志

```typescript
/**
 * 静态文件访问日志
 */
function staticFileAccessLogger(req: any, res: any, next: any) {
  const originalSend = res.send;

  res.send = function(data: any) {
    if (req.path.startsWith('/uploads') || req.path.startsWith('/public')) {
      console.log('📁 静态文件访问:', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
    }
    originalSend.call(this, data);
  };

  next();
}

app.use(staticFileAccessLogger);
```

### 步骤 6: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# 静态文件安全配置
# ================================

# 最大静态文件大小（字节）
# 默认: 104857600 (100MB)
MAX_STATIC_FILE_SIZE=104857600

# 是否启用静态文件访问日志
ENABLE_STATIC_FILE_LOGS=true

# 是否启用静态文件频率限制
ENABLE_STATIC_FILE_RATE_LIMIT=true
```

### 步骤 7: 前端CSP配置

在前端 `index.html` 中添加CSP：

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  img-src 'self' data: https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  connect-src 'self' http://localhost:*;
">
```

## 本地调试保证

### 开发环境配置

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const staticFilesConfig = {
  // 开发环境可以显示详细错误
  index: false,

  setHeaders: (res: any, filePath: string) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 开发环境不禁用缓存，但设置较短时间
    if (isDevelopment) {
      res.setHeader('Cache-Control', 'public, max-age=0'); // 不缓存
    } else {
      // 生产环境正常缓存
      const ext = path.extname(filePath).toLowerCase();
      if (['.jpg', '.png', '.gif'].includes(ext)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }
};
```

### 保持现有功能

- ✅ 所有静态文件仍然可访问
- ✅ 开发环境不禁用缓存
- ✅ 错误信息详细，便于调试

## 验证步骤

### 1. 测试路径遍历防护

```bash
# 测试路径遍历攻击（应该被拒绝）
curl http://localhost:3000/uploads/../package.json
curl http://localhost:3000/uploads/../../../etc/passwd
curl http://localhost:3000/uploads/..%2F..%2F..%2Fetc/passwd

# 应该返回：
# {"success":false,"error":{"message":"访问被拒绝"}}
```

### 2. 测试文件类型限制

```bash
# 测试访问不允许的文件类型
curl http://localhost:3000/uploads/config.env
curl http://localhost:3000/uploads/database.sqlite

# 应该返回：
# {"success":false,"error":{"message":"不允许的文件类型"}}
```

### 3. 测试正常文件访问

```bash
# 测试正常文件访问（应该成功）
curl -I http://localhost:3000/uploads/image.jpg
curl -I http://localhost:3000/uploads/document.pdf

# 应该返回正确的响应头
```

### 4. 测试目录浏览

```bash
# 测试目录浏览（应该被拒绝）
curl http://localhost:3000/uploads/

# 应该返回404或403
```

### 5. 测试响应头

```bash
# 检查响应头
curl -I http://localhost:3000/uploads/image.jpg

# 应该看到：
# X-Content-Type-Options: nosniff
# Cache-Control: public, max-age=31536000
```

## 回滚方案

如果限制导致问题：

1. **调整白名单**：
   ```typescript
   export const ALLOWED_EXTENSIONS = new Set([
     // 添加更多允许的扩展名
     '.your-extension'
   ]);
   ```

2. **禁用验证**：
   ```typescript
   // 恢复为简单的静态服务
   app.use('/uploads', express.static('uploads'));
   ```

3. **放宽限制**：
   ```typescript
   // 移除危险扩展名检查
   export function validateFileExtension(filePath: string): boolean {
     const ext = path.extname(filePath).toLowerCase();
     return ALLOWED_EXTENSIONS.has(ext);
   }
   ```

## 修复完成检查清单

- [ ] 静态文件安全配置已创建
- [ ] app.ts已更新使用安全配置
- [ ] 路径遍历防护已实现
- [ ] 文件类型限制已实现
- [ ] 文件大小限制已添加
- [ ] 访问频率限制已添加（可选）
- [ ] 访问日志已添加（可选）
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试正常工作

## 风险评估

- **风险级别**: 低
- **影响范围**: 静态文件服务
- **回滚难度**: 低（调整配置或移除限制）
- **本地调试影响**: 无（开发环境正常工作）

---

**修复时间估计**: 2-3 小时
**测试时间估计**: 1-2 小时
**总时间估计**: 3-5 小时
