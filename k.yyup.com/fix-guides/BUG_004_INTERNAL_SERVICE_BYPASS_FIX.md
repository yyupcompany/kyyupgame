# Bug #4 修复指南 - 未验证的内部服务绕过认证

## 问题描述
代码中存在一个"内部服务绕过认证"的后门，只需要请求头中包含`x-internal-service: true`即可绕过所有认证，拥有管理员权限。

## 严重级别
**严重** - 极其严重的安全漏洞，需立即移除

## 受影响的文件
- `server/src/middlewares/auth.middleware.ts`
  - 行号: 244-264

## 漏洞代码

### 漏洞位置: auth.middleware.ts 第244-264行
```typescript
// ❌ 严重安全漏洞：任何请求都可以通过这个后门获得管理员权限
if (req.headers['x-internal-service'] === 'true') {
  const serviceName = req.headers['x-service-name'] || 'unknown-service';
  console.log('[认证] 内部服务调用绕过认证', {
    path: req.path,
    service: serviceName
  });
  req.user = {
    id: 0,  // 内部服务使用ID 0
    username: 'internal_service',
    role: 'admin',  // 内部服务拥有管理员权限
    email: 'internal@system.local',
    realName: '内部服务',
    phone: '',
    status: 'active',
    isAdmin: true,
    kindergartenId: 1
  } as any;
  next();
  return;
}
```

## 攻击场景

### 攻击示例 1: 使用 curl
```bash
# 任何人都可以发送这个请求获得管理员权限
curl -X GET http://localhost:3000/api/users \
  -H "x-internal-service: true" \
  -H "x-service-name: hacker"
```

### 攻击示例 2: 使用浏览器
```javascript
// 在浏览器控制台中执行
fetch('http://localhost:3000/api/users', {
  headers: {
    'x-internal-service': 'true',
    'x-service-name': 'malicious'
  }
})
```

### 攻击示例 3: 使用 Postman
```
GET /api/admin/delete-all-data
Headers:
  x-internal-service: true
  x-service-name: anything
```

## 修复方案

### 方案 1: 完全移除（推荐用于生产环境）

如果不需要内部服务调用，完全移除这个后门：

**步骤 1: 删除漏洞代码**

在 `server/src/middlewares/auth.middleware.ts` 中：

```typescript
// ❌ 删除以下代码（第244-264行）
/*
if (req.headers['x-internal-service'] === 'true') {
  const serviceName = req.headers['x-service-name'] || 'unknown-service';
  console.log('[认证] 内部服务调用绕过认证', {
    path: req.path,
    service: serviceName
  });
  req.user = {
    id: 0,
    username: 'internal_service',
    role: 'admin',
    email: 'internal@system.local',
    realName: '内部服务',
    phone: '',
    status: 'active',
    isAdmin: true,
    kindergartenId: 1
  } as any;
  next();
  return;
}
*/
```

**步骤 2: 搜索并删除相关引用**

```bash
# 搜索所有使用 x-internal-service 的地方
grep -r "x-internal-service" server/src/
grep -r "internal_service" server/src/
```

### 方案 2: 使用安全的内部服务认证（如果需要内部服务调用）

如果确实需要内部服务间调用，使用以下安全方案：

#### 步骤 1: 创建 API 密钥配置

创建文件 `server/src/config/internal-service.config.ts`:

```typescript
import crypto from 'crypto';

/**
 * 内部服务配置
 */
interface InternalServiceConfig {
  name: string;
  apiKey: string;
  allowedIPs: string[];
  allowedPaths: string[];
}

/**
 * 验证 API 密钥格式
 */
function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new Error('INTERNAL_SERVICE_API_KEY 未设置');
  }

  if (apiKey.length < 64) {
    throw new Error('INTERNAL_SERVICE_API_KEY 长度不足，至少需要64个字符');
  }
}

/**
 * 生成安全的 API 密钥
 */
export function generateInternalServiceKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 内部服务白名单配置
 */
const INTERNAL_SERVICES: InternalServiceConfig[] = [
  {
    name: 'payment-service',
    apiKey: process.env.PAYMENT_SERVICE_API_KEY || '',
    allowedIPs: ['127.0.0.1', '::1'], // 只允许本地
    allowedPaths: ['/api/payments/*', '/api/webhooks/payment']
  },
  {
    name: 'notification-service',
    apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || '',
    allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8'],
    allowedPaths: ['/api/notifications/*']
  }
  // 添加更多内部服务...
];

/**
 * 验证内部服务请求
 */
export function validateInternalServiceRequest(req: {
  headers: { [key: string]: string | undefined };
  ip: string;
  path: string;
}): { valid: boolean; serviceName?: string; error?: string } {
  const apiKey = req.headers['x-api-key'];
  const serviceName = req.headers['x-service-name'];

  if (!apiKey || !serviceName) {
    return { valid: false, error: '缺少 API 密钥或服务名称' };
  }

  // 查找服务配置
  const service = INTERNAL_SERVICES.find(s => s.name === serviceName);

  if (!service) {
    return { valid: false, error: '未知的服务名称' };
  }

  // 验证 API 密钥
  if (service.apiKey !== apiKey) {
    return { valid: false, error: '无效的 API 密钥' };
  }

  // 验证 IP 白名单
  const clientIP = req.ip;
  const isIPAllowed = service.allowedIPs.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR 范围（需要 ip-range-check 库）
      return true; // 简化处理
    }
    return allowedIP === clientIP;
  });

  if (!isIPAllowed) {
    return { valid: false, error: 'IP 地址不在允许列表中' };
  }

  // 验证路径访问权限
  const isPathAllowed = service.allowedPaths.some(allowedPath => {
    // 将通配符转换为正则表达式
    const pattern = allowedPath
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(req.path);
  });

  if (!isPathAllowed) {
    return { valid: false, error: '无权访问此路径' };
  }

  return { valid: true, serviceName: service.name };
}

/**
 * 获取内部服务用户信息
 */
export function getInternalServiceUser(serviceName: string) {
  return {
    id: 0,
    username: `service_${serviceName}`,
    role: 'service',
    email: `${serviceName}@internal.local`,
    isAdmin: false, // 不再是管理员
    isInternalService: true,
    serviceName
  };
}
```

#### 步骤 2: 更新环境变量

更新 `server/.env`:

```bash
# 内部服务 API 密钥（每个服务一个）
# 使用以下命令生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PAYMENT_SERVICE_API_KEY=your-generated-64-char-hex-key
NOTIFICATION_SERVICE_API_KEY=your-different-64-char-hex-key

# 内部服务 IP 白名单（逗号分隔）
INTERNAL_SERVICE_ALLOWED_IPS=127.0.0.1,::1,10.0.0.0/8
```

#### 步骤 3: 创建安全的内部服务认证中间件

创建文件 `server/src/middlewares/internal-service-auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { validateInternalServiceRequest, getInternalServiceUser } from '../config/internal-service.config';
import { logger } from '../utils/logger';

/**
 * 内部服务认证中间件
 */
export function internalServiceAuth(req: Request, res: Response, next: NextFunction) {
  // 检查是否为内部服务请求
  const hasServiceHeader = req.headers['x-service-name'];

  if (!hasServiceHeader) {
    return next(); // 不是内部服务请求，继续正常认证流程
  }

  // 验证内部服务请求
  const validation = validateInternalServiceRequest(req);

  if (!validation.valid) {
    logger.warn('内部服务认证失败', {
      ip: req.ip,
      path: req.path,
      serviceName: req.headers['x-service-name'],
      error: validation.error
    });

    return res.status(401).json({
      success: false,
      error: {
        message: '内部服务认证失败',
        detail: process.env.NODE_ENV === 'development' ? validation.error : undefined,
        code: 'INTERNAL_SERVICE_AUTH_FAILED'
      }
    });
  }

  // 设置内部服务用户
  req.user = getInternalServiceUser(validation.serviceName!);

  logger.info('内部服务认证成功', {
    serviceName: validation.serviceName,
    path: req.path,
    ip: req.ip
  });

  next();
}
```

#### 步骤 4: 更新 auth.middleware.ts

**修复前（第244-264行）:**
```typescript
if (req.headers['x-internal-service'] === 'true') {
  const serviceName = req.headers['x-service-name'] || 'unknown-service';
  console.log('[认证] 内部服务调用绕过认证', {
    path: req.path,
    service: serviceName
  });
  req.user = {
    id: 0,
    username: 'internal_service',
    role: 'admin',
    email: 'internal@system.local',
    realName: '内部服务',
    phone: '',
    status: 'active',
    isAdmin: true,
    kindergartenId: 1
  } as any;
  next();
  return;
}
```

**修复后（使用安全的中间件）:**
```typescript
import { internalServiceAuth } from './internal-service-auth.middleware';

// 在认证流程开始时，先检查内部服务
internalServiceAuth(req, res, (err) => {
  if (err) return;
  // 如果是有效的内部服务请求，用户已被设置，直接返回
  if (req.user && req.user.isInternalService) {
    return next();
  }
  // 继续正常认证流程...
});
```

或者更简洁的方式，在 `server/src/app.ts` 中：

```typescript
import { internalServiceAuth } from './middlewares/internal-service-auth.middleware';

// 在认证中间件之前应用
app.use('/api/', internalServiceAuth);
app.use('/api/', authMiddleware);
```

#### 步骤 5: 生成并配置 API 密钥

创建脚本 `server/scripts/generate-service-keys.js`:

```javascript
const crypto = require('crypto');

console.log('生成内部服务 API 密钥...\n');

const services = [
  'PAYMENT_SERVICE_API_KEY',
  'NOTIFICATION_SERVICE_API_KEY',
  'AI_SERVICE_API_KEY',
  'REPORT_SERVICE_API_KEY'
];

console.log('请将以下内容添加到 .env 文件:\n');
console.log('========================================');

services.forEach(service => {
  const key = crypto.randomBytes(32).toString('hex');
  console.log(`${service}=${key}`);
});

console.log('========================================\n');
console.log('⚠️  重要提醒:');
console.log('1. 请妥善保管这些密钥');
console.log('2. 不要提交到版本控制系统');
console.log('3. 每个服务使用不同的密钥');
console.log('4. 定期轮换这些密钥');
```

运行脚本生成密钥：
```bash
cd server && node scripts/generate-service-keys.js
```

### 方案 3: 使用双向 TLS（适用于生产环境）

对于最高安全级别的内部服务通信，使用双向 TLS：

#### 步骤 1: 生成 CA 和证书

```bash
# 创建证书目录
mkdir -p server/certs

# 生成 CA 私钥
openssl genrsa -out server/certs/ca-key.pem 4096

# 生成 CA 证书
openssl req -x509 -new -nodes -key server/certs/ca-key.pem \
  -days 3650 -out server/certs/ca-cert.pem \
  -subj "/CN=Internal Services CA"

# 为每个服务生成证书
# 示例：payment-service
openssl genrsa -out server/certs/payment-key.pem 4096
openssl req -new -key server/certs/payment-key.pem \
  -out server/certs/payment-csr.pem \
  -subj "/CN=payment-service"
openssl x509 -req -in server/certs/payment-csr.pem \
  -CA server/certs/ca-cert.pem -CAkey server/certs/ca-key.pem \
  -CAcreateserial -out server/certs/payment-cert.pem -days 365
```

#### 步骤 2: 配置 Express 使用 mTLS

创建文件 `server/src/config/mtls.config.ts`:

```typescript
import https from 'https';
import fs from 'fs';
import path from 'path';

/**
 * mTLS 配置
 */
export const mtlsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../../certs/server-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../certs/server-cert.pem')),
  ca: fs.readFileSync(path.join(__dirname, '../../certs/ca-cert.pem')),
  requestCert: true,
  rejectUnauthorized: true,
  ca: [fs.readFileSync(path.join(__dirname, '../../certs/ca-cert.pem'))]
};

/**
 * 验证客户端证书
 */
export function validateClientCertificate(cert: any): { valid: boolean; serviceName?: string } {
  if (!cert) {
    return { valid: false };
  }

  // 从证书 CN 提取服务名称
  const cn = cert.subject.CN;
  const allowedServices = ['payment-service', 'notification-service', 'ai-service'];

  if (!allowedServices.includes(cn)) {
    return { valid: false };
  }

  return { valid: true, serviceName: cn };
}
```

#### 步骤 3: 创建 mTLS 中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { validateClientCertificate } from '../config/mtls.config';

export function mtlsAuth(req: Request, res: Response, next: NextFunction) {
  const cert = (req.socket as any).getPeerCertificate();

  if (!cert || Object.keys(cert).length === 0) {
    return res.status(401).json({
      success: false,
      error: {
        message: '需要客户端证书',
        code: 'CERTIFICATE_REQUIRED'
      }
    });
  }

  const validation = validateClientCertificate(cert);

  if (!validation.valid) {
    return res.status(403).json({
      success: false,
      error: {
        message: '无效的客户端证书',
        code: 'INVALID_CERTIFICATE'
      }
    });
  }

  // 设置用户
  req.user = {
    id: 0,
    username: `service_${validation.serviceName}`,
    role: 'service',
    isInternalService: true,
    serviceName: validation.serviceName
  };

  next();
}
```

## 审计和监控

### 步骤 1: 审计现有使用

创建脚本 `server/scripts/audit-internal-bypass.js`:

```javascript
const fs = require('fs');
const path = require('path');

function searchInDirectory(dir, searchTerm) {
  const results = [];

  function search(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        search(filePath);
      } else if (file.match(/\.(ts|js|json)$/)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(searchTerm)) {
          const lines = content.split('\n');
          const matches = lines
            .map((line, index) => ({ line, index: index + 1 }))
            .filter(({ line }) => line.includes(searchTerm));

          if (matches.length > 0) {
            results.push({
              file: filePath,
              matches: matches.map(m => `  第${m.index}行: ${m.line.trim()}`)
            });
          }
        }
      }
    }
  }

  search(dir);
  return results;
}

console.log('🔍 搜索内部服务绕过相关代码...\n');

const searchTerms = [
  'x-internal-service',
  'internal_service',
  'isAdmin: true'
];

for (const term of searchTerms) {
  console.log(`\n📝 搜索: ${term}`);
  const results = searchInDirectory(path.join(__dirname, '../src'), term);

  if (results.length === 0) {
    console.log('✅ 未找到相关代码');
  } else {
    console.log(`⚠️  找到 ${results.length} 个文件:\n`);
    results.forEach(({ file, matches }) => {
      console.log(`\n${file}:`);
      matches.forEach(match => console.log(match));
    });
  }
}
```

运行审计脚本：
```bash
cd server && node scripts/audit-internal-bypass.js
```

### 步骤 2: 添加审计日志

创建文件 `server/src/utils/audit-logger.ts`:

```typescript
import { logger } from './logger';

/**
 * 审计事件类型
 */
type AuditEventType =
  | 'internal_service_access'
  | 'internal_service_auth_failed'
  | 'admin_access'
  | 'sensitive_operation';

/**
 * 记录审计日志
 */
export function auditLog(
  eventType: AuditEventType,
  details: {
    userId?: number;
    service?: string;
    ip: string;
    path: string;
    method: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ...details
  };

  // 记录到专用日志文件
  logger.info('[AUDIT]', logEntry);

  // 生产环境可以发送到 SIEM 系统
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送到审计日志系统
  }
}

/**
 * 内部服务访问审计
 */
export function auditInternalServiceAccess(params: {
  service: string;
  ip: string;
  path: string;
  method: string;
  success: boolean;
}) {
  auditLog('internal_service_access', {
    service: params.service,
    ip: params.ip,
    path: params.path,
    method: params.method,
    metadata: { success: params.success }
  });
}
```

## 验证步骤

### 1. 安全测试
创建测试文件 `server/tests/__tests__/internal-service-security.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Internal Service Security', () => {
  it('should reject requests without API key', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-service-name', 'test-service');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INTERNAL_SERVICE_AUTH_FAILED');
  });

  it('should reject requests with invalid API key', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-service-name', 'test-service')
      .set('x-api-key', 'invalid-key-12345');

    expect(response.status).toBe(401);
  });

  it('should reject requests from unauthorized IP', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-service-name', 'test-service')
      .set('x-api-key', process.env.PAYMENT_SERVICE_API_KEY)
      .set('X-Forwarded-For', '192.168.1.100'); // 未授权的 IP

    expect(response.status).toBe(401);
  });

  it('should allow valid internal service requests', async () => {
    const response = await request(app)
      .post('/api/payments/notify')
      .set('x-service-name', 'payment-service')
      .set('x-api-key', process.env.PAYMENT_SERVICE_API_KEY);

    expect([200, 201]).toContain(response.status);
  });

  it('should not grant admin privileges to internal services', async () => {
    const response = await request(app)
      .get('/api/admin/settings')
      .set('x-service-name', 'payment-service')
      .set('x-api-key', process.env.PAYMENT_SERVICE_API_KEY);

    expect(response.status).toBe(403); // 应该被拒绝
  });
});
```

### 2. 渗透测试
使用测试工具验证修复：

```bash
# 测试旧的后门是否已移除
curl -X GET http://localhost:3000/api/users \
  -H "x-internal-service: true" \
  -H "x-service-name: hacker"

# 应该返回 401 Unauthorized

# 测试新的安全机制
curl -X GET http://localhost:3000/api/payments/notify \
  -H "x-service-name: payment-service" \
  -H "x-api-key: $PAYMENT_SERVICE_API_KEY"

# 应该正常工作（如果 IP 和路径都允许）
```

### 3. 代码审查
```bash
# 确保后门代码已完全移除
grep -r "x-internal-service" server/src/ || echo "✅ 后门代码已移除"

# 确保没有直接设置 isAdmin: true
grep -r "isAdmin.*true" server/src/ | grep -v ".test" | grep -v ".spec"
```

## 修复完成检查清单

### 方案 1（完全移除）
- [ ] 后门代码已完全删除
- [ ] 相关引用已清理
- [ ] 审计日志已确认
- [ ] 安全测试已通过

### 方案 2（安全认证）
- [ ] 内部服务配置已创建
- [ ] API 密钥已生成
- [ ] IP 白名单已配置
- [ ] 路径限制已配置
- [ ] 安全认证中间件已实现
- [ ] auth.middleware.ts 已更新
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 审计日志已实现

### 方案 3（mTLS）
- [ ] CA 证书已生成
- [ ] 服务证书已生成
- [ ] mTLS 配置已实现
- [ ] 客户端证书验证已实现
- [ ] 生产环境已配置

---

**修复时间估计:**
- 方案 1（完全移除）: 30 分钟 - 1 小时
- 方案 2（安全认证）: 4-6 小时
- 方案 3（mTLS）: 8-12 小时

**推荐**: 生产环境使用方案 2 或方案 3
