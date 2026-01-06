# Bug #18 修复指南 - 缺少请求速率限制

## 问题描述
没有实现任何API速率限制，容易受到DDoS攻击和暴力破解攻击。

## 严重级别
**高**

## 受影响的文件
- `server/src/app.ts` (全局中间件)

## 问题分析

1. **DDoS攻击**: 恶意用户可以发送大量请求导致服务器崩溃
2. **暴力破解**: 登录接口没有速率限制，容易被暴力破解密码
3. **资源耗尽**: 无限制的请求消耗服务器资源
4. **数据库压力**: 大量请求导致数据库压力过大

## 修复方案（添加速率限制中间件）

### 步骤 1: 安装依赖

```bash
cd server && npm install express-rate-limit
```

### 步骤 2: 创建速率限制配置

在 `server/src/config/rate-limit.config.ts` 创建配置文件：

```typescript
import rateLimit from 'express-rate-limit';
import RateLimitStore from 'express-rate-limit';
import { Request } from 'express';

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 是否跳过成功请求的计数
 */
const skipSuccessfulRequests = process.env.SKIP_SUCCESSFUL_REQUESTS === 'true';

/**
 * 全局速率限制
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: isDevelopment ? 10000 : 1000, // 开发环境更宽松
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
      code: 'TOO_MANY_REQUESTS'
    }
  },
  standardHeaders: true, // 返回速率限制信息在头信息中
  legacyHeaders: false,
  skipSuccessfulRequests, // 不计算成功请求的计数
  skip: (req: Request) => {
    // 跳过健康检查和文档
    const skipPaths = ['/health', '/api-docs', '/api/json'];
    return skipPaths.some(path => req.path.startsWith(path));
  }
});

/**
 * 认证API速率限制（更严格）
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5, // 开发环境宽松
  message: {
    success: false,
    error: {
      message: '登录尝试次数过多，请15分钟后再试',
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      retryAfter: 900
    }
  },
  skipSuccessfulRequests: true, // 成功的登录不计入限制
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 文件上传速率限制
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: isDevelopment ? 100 : 10,
  message: {
    success: false,
    error: {
      message: '文件上传次数过多，请1小时后再试',
      code: 'TOO_MANY_UPLOADS'
    }
  },
  standardHeaders: true
});

/**
 * API查询速率限制
 */
export const apiQueryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: isDevelopment ? 200 : 60,
  message: {
    success: false,
    error: {
      message: '查询请求过于频繁，请稍后再试',
      code: 'TOO_MANY_QUERIES'
    }
  },
  standardHeaders: true
});

/**
 * 创建自定义速率限制器
 */
export function createCustomLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: isDevelopment ? options.max * 10 : options.max, // 开发环境放宽10倍
    message: {
      success: false,
      error: {
        message: options.message || '请求过于频繁',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    keyGenerator: (req: Request) => {
      // 根据用户ID或IP生成key
      const userId = req.user?.id;
      const ip = req.ip;
      const prefix = options.keyPrefix || 'custom';
      return `${prefix}:${userId || ip}`;
    }
  });
}
```

### 步骤 3: 在app.ts中应用

**修复前：**
```typescript
// ❌ 没有速率限制
app.use('/api/', (req, res, next) => {
  next();
});
```

**修复后：**
```typescript
import {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  apiQueryLimiter,
  createCustomLimiter
} from './config/rate-limit.config';

// ================================
# 速率限制中间件
# ================================

// 1. 全局限制（应用到所有API）
app.use('/api/', globalLimiter);

// 2. 认证API更严格
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// 3. 文件上传限制
app.use('/api/upload', uploadLimiter);

// 4. 查询API限制
app.get('/api/*', apiQueryLimiter);

// 5. 自定义限制（示例）
const reportLimiter = createCustomLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每小时10次
  message: '报告生成次数过多',
  keyPrefix: 'report'
});

app.use('/api/reports/generate', reportLimiter);
```

### 步骤 4: 添加IP黑名单（可选）

创建 `server/src/utils/ip-blacklist.ts`：

```typescript
import { Request } from 'express';

/**
 * IP黑名单（用于阻止恶意IP）
 */
const BLACKLISTED_IPS = new Set<string>();

/**
 * 添加IP到黑名单
 */
export function addToBlacklist(ip: string, reason: string) {
  BLACKLISTED_IPS.add(ip);
  console.log(`🚫 IP ${ip} 已添加到黑名单: ${reason}`);
}

/**
 * 从黑名单移除IP
 */
export function removeFromBlacklist(ip: string) {
  BLACKLISTED_IPS.delete(ip);
  console.log(`✅ IP ${ip} 已从黑名单移除`);
}

/**
 * 检查IP是否在黑名单中
 */
export function isBlacklisted(req: Request): boolean {
  const ip = req.ip || req.socket.remoteAddress;
  return BLACKLISTED_IPS.has(ip);
}

/**
 * IP黑名单中间件
 */
export function ipBlacklistMiddleware(req: Request, res: Response, next: any) {
  if (isBlacklisted(req)) {
    return res.status(403).json({
      success: false,
      error: {
        message: '您的IP已被封禁',
        code: 'IP_BANNED'
      }
    });
  }
  next();
}
```

在app.ts中使用：
```typescript
import { ipBlacklistMiddleware } from './utils/ip-blacklist';

// 在所有中间件之前应用
app.use(ipBlacklistMiddleware);
```

### 步骤 5: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# 速率限制配置
# ================================

# 是否跳过成功请求的计数（推荐true）
SKIP_SUCCESSFUL_REQUESTS=true

# 全局速率限制（每15分钟请求数）
# 开发环境: 10000
# 生产环境: 1000
RATE_LIMIT_GLOBAL_MAX=1000

# 认证API速率限制（每15分钟登录尝试次数）
RATE_LIMIT_AUTH_MAX=5

# 查询API速率限制（每1分钟请求数）
RATE_LIMIT_QUERY_MAX=60
```

使用环境变量：
```typescript
const globalLimiter = rateLimit({
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '1000', 10),
  // ...
});
```

### 步骤 6: 添加速率限制监控

创建 `server/src/utils/rate-limit-monitor.ts`：

```typescript
import { Counter } from 'prom-client';

/**
 * 速率限制监控
 */
export class RateLimitMonitor {
  private requests = new Map<string, number[]>();

  /**
   * 记录请求
   */
  recordRequest(key: string, windowMs: number) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // 清理过期的时间戳
    const validTimestamps = timestamps.filter(
      ts => now - ts < windowMs
    );

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return validTimestamps.length;
  }

  /**
   * 获取请求计数
   */
  getCount(key: string): number {
    const timestamps = this.requests.get(key) || [];
    return timestamps.length;
  }

  /**
   * 获取统计信息
   */
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};

    this.requests.forEach((timestamps, key) => {
      stats[key] = timestamps.length;
    });

    return stats;
  }
}

export const rateLimitMonitor = new RateLimitMonitor();
```

## 本地调试保证

### 开发环境宽松限制

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const globalLimiter = rateLimit({
  max: isDevelopment ? 10000 : 1000, // 开发环境宽松10倍
  // ...
});
```

### 跳过成功请求

```typescript
skipSuccessfulRequests: true, // 成功请求不计入限制
```

这样正常的API调用不会影响开发。

### 可配置的限制

```bash
# 开发环境可以设置更高的限制
RATE_LIMIT_GLOBAL_MAX=10000
```

## 验证步骤

### 1. 测试速率限制

```bash
# 测试全局限制
for i in {1..100}; do
  curl http://localhost:3000/api/users &
done

# 应该在达到限制后返回429错误
```

### 2. 测试认证限制

```bash
# 测试登录限制
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone":"test","password":"wrong"}' &
done

# 应该在5次失败后被限制
```

### 3. 测试开发环境

```bash
# 设置开发环境
export NODE_ENV=development

# 启动服务器
cd server && npm run dev

# 进行正常的API调用
curl http://localhost:3000/api/users

# 应该不受影响（限制很宽松）
```

### 4. 查看速率限制状态

```bash
# 查看响应头
curl -I http://localhost:3000/api/users

# 应该看到速率限制信息
# X-RateLimit-Limit: 1000
# X-RateLimit-Remaining: 999
# X-RateLimit-Reset: 1234567890
```

## 回滚方案

如果速率限制影响开发：

1. **调整限制值**：
   ```bash
   export RATE_LIMIT_GLOBAL_MAX=100000
   ```

2. **跳过特定路径**：
   ```typescript
   skip: (req) => req.path.startsWith('/api/test')
   ```

3. **完全禁用**：
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
     // 只在生产环境启用速率限制
     app.use('/api/', globalLimiter);
   }
   ```

## 修复完成检查清单

- [ ] express-rate-limit已安装
- [ ] 速率限制配置已创建
- [ ] 全局限制已应用
- [ ] 认证API限制已应用
- [ ] 文件上传限制已应用
- [ ] IP黑名单已实现（可选）
- [ ] 环境变量已配置
- [ ] 监控工具已实现
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试不受影响

## 风险评估

- **风险级别**: 低
- **影响范围**: 所有API请求
- **回滚难度**: 低（调整配置或禁用）
- **本地调试影响**: 无（开发环境宽松限制）

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
