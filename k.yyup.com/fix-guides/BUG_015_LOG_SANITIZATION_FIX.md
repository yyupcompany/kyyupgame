# Bug #15 修复指南 - 日志中的敏感信息

## 问题描述
代码中多处记录可能包含敏感信息的日志，如手机号、token等。特别是在认证相关的日志中。

## 严重级别
**高** - 需要谨慎修复（涉及认证日志）

## 受影响的文件
- `server/src/app.ts`
- `server/src/middlewares/auth.middleware.ts`
- 多个日志记录位置

## 问题分析

1. **手机号泄露**: 日志中包含完整手机号
2. **Token泄露**: 日志中可能记录token（即使是部分）
3. **密码泄露**: 可能记录密码相关字段
4. **合规性问题**: 违反数据保护法规

## 修复方案（添加脱敏函数，不修改logger.ts）

### 步骤 1: 创建日志脱敏工具

在 `server/src/utils/log-sanitizer.ts` 创建新文件（不修改logger.ts）：

```typescript
/**
 * 日志脱敏工具
 * 在调用logger之前使用，不修改logger.ts本身
 */

/**
 * 敏感字段模式
 */
const SENSITIVE_PATTERNS = {
  // 密码相关
  password: /password/i,
  pwd: /pwd/i,
  passwd: /passwd/i,

  // Token相关
  token: /token/i,
  authorization: /authorization/i,
  bearer: /bearer/i,
  session: /session/i,

  // 密钥相关
  secret: /secret/i,
  key: /key/i,
  private: /private/i,

  // 个人信息
  phone: /phone/i,
  mobile: /mobile/i,
  idcard: /idcard/i,
  ssn: /ssn/i,

  // 金融信息
  credit: /credit/i,
  bank: /bank/i,
  card: /card/i
};

/**
 * 敏感值替换模式
 */
const SENSITIVE_VALUE_PATTERNS = [
  // JWT token
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,

  // API密钥
  /[A-Za-z0-9]{32,}/g,

  // 手机号
  /1[3-9]\d{9}/g,

  // 身份证号
  /\d{17}[\dXx]/g,

  // 邮箱（部分脱敏）
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
];

/**
 * 脱敏字符串
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let result = input;

  // 替换敏感值模式
  result = result.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '***JWT***');
  result = result.replace(/1[3-9]\d{9}/g, (match) => {
    return match.substring(0, 3) + '****' + match.substring(7);
  });
  result = result.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
    const [local, domain] = match.split('@');
    if (local.length <= 2) {
      return '*@' + domain;
    }
    return local.substring(0, 2) + '***@' + domain;
  });

  return result;
}

/**
 * 脱敏对象
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // 检查是否为敏感字段
    const isSensitive = Object.keys(SENSITIVE_PATTERNS).some(pattern => {
      const regex = SENSITIVE_PATTERNS[pattern as keyof typeof SENSITIVE_PATTERNS];
      return regex.test(lowerKey);
    });

    if (isSensitive) {
      // 脱敏处理
      if (typeof value === 'string') {
        if (value.length > 20) {
          sanitized[key] = value.substring(0, 8) + '...';
        } else {
          sanitized[key] = '***';
        }
      } else if (typeof value === 'number') {
        sanitized[key] = '***';
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 脱敏日志数据
 */
export function sanitizeLogData(data: any): any {
  try {
    return JSON.stringify(sanitizeObject(data));
  } catch (error) {
    // 如果序列化失败，返回字符串表示
    return String(data).substring(0, 200) + '...';
  }
}

/**
 * 条件脱敏：开发环境可选择不脱敏
 */
export function shouldSanitize(): boolean {
  // 生产环境总是脱敏
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // 开发环境可以通过环境变量控制
  return process.env.SANITIZE_LOGS !== 'false';
}
```

### 步骤 2: 在auth.middleware.ts中使用

**修复前：**
```typescript
// ❌ 记录可能包含敏感信息的日志
console.log('[认证] 开始统一认证', {
  phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 虽然做了部分掩码
  tenantCode: currentTenantCode,
  domain
});
```

**修复后：**
```typescript
import { sanitizeObject, shouldSanitize } from '../utils/log-sanitizer';

// 在日志记录之前脱敏
const logData = {
  phone: phone, // 不再手动掩码，统一处理
  tenantCode: currentTenantCode,
  domain,
  timestamp: new Date().toISOString()
};

if (shouldSanitize()) {
  console.log('[认证] 开始统一认证', sanitizeObject(logData));
} else {
  // 开发环境可以选择记录完整信息
  console.log('[认证] 开始统一认证', logData);
}
```

### 步骤 3: 在app.ts中使用

**修复前：**
```typescript
// ❌ 可能记录敏感信息
console.log('[服务器错误]', {
  message: err.message,
  stack: err.stack,
  headers: req.headers // ⚠️ 可能包含authorization
});
```

**修复后：**
```typescript
import { sanitizeObject, shouldSanitize } from './utils/log-sanitizer';

// 脱敏后再记录日志
const logData = {
  message: err.message,
  stack: err.stack,
  headers: shouldSanitize() ? '[REDACTED]' : req.headers, // 敏感信息脱敏
  path: req.path,
  method: req.method
};

console.log('[服务器错误]', sanitizeObject(logData));
```

### 步骤 4: 创建安全的日志包装器

为了方便使用，创建包装函数：

```typescript
// 在 server/src/utils/safe-logger.ts

import { sanitizeObject, shouldSanitize } from './log-sanitizer';

/**
 * 安全的日志记录器
 */
export const safeLog = {
  /**
   * 记录info日志
   */
  info(message: string, data?: any) {
    if (shouldSanitize() && data) {
      console.log(`[INFO] ${message}`, sanitizeObject(data));
    } else {
      console.log(`[INFO] ${message}`, data);
    }
  },

  /**
   * 记录warn日志
   */
  warn(message: string, data?: any) {
    if (shouldSanitize() && data) {
      console.warn(`[WARN] ${message}`, sanitizeObject(data));
    } else {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  /**
   * 记录error日志
   */
  error(message: string, error?: Error | any) {
    const logError = error instanceof Error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3) // 只保留前3行stack
        }
      : error;

    if (shouldSanitize() && logError) {
      console.error(`[ERROR] ${message}`, sanitizeObject(logError));
    } else {
      console.error(`[ERROR] ${message}`, logError);
    }
  },

  /**
   * 记录debug日志（仅开发环境）
   */
  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      if (shouldSanitize() && data) {
        console.log(`[DEBUG] ${message}`, sanitizeObject(data));
      } else {
        console.log(`[DEBUG] ${message}`, data);
      }
    }
  }
};
```

### 步骤 5: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# 日志脱敏配置
# ================================

# 是否脱敏日志（默认true）
# 生产环境总是true
# 开发环境可以设置为false以便调试
SANITIZE_LOGS=true
```

## 本地调试保证

### 开发环境可选脱敏

```typescript
if (process.env.NODE_ENV === 'development') {
  // 开发环境可以选择不脱敏，便于调试
  if (process.env.SANITIZE_LOGS !== 'false') {
    // 仍然脱敏，但保留更多信息
    console.log('[调试]', sanitizeObject(data));
  } else {
    // 完全不脱敏，便于调试
    console.log('[调试]', data);
  }
}
```

### 保持功能完整

- ✅ 所有日志仍然记录
- ✅ 只是敏感信息被脱敏
- ✅ 开发环境可以关闭脱敏
- ✅ 不修改logger.ts本身

## 验证步骤

### 1. 测试脱敏函数
```typescript
import { sanitizeString, sanitizeObject } from '../utils/log-sanitizer';

describe('日志脱敏', () => {
  it('应该脱敏JWT token', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    const result = sanitizeString(token);
    expect(result).toBe('***JWT***');
  });

  it('应该脱敏手机号', () => {
    const phone = '13800138000';
    const result = sanitizeString(phone);
    expect(result).toBe('138****8000');
  });

  it('应该脱敏对象中的敏感字段', () => {
    const data = {
      username: 'test',
      password: 'secret123',
      phone: '13800138000'
    };
    const result = sanitizeObject(data);
    expect(result.password).toBe('***');
    expect(result.phone).toBe('138****8000');
    expect(result.username).toBe('test');
  });
});
```

### 2. 检查日志输出

```bash
# 启动服务器
cd server && npm run dev

# 触发一个登录请求
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"test123"}'

# 检查日志，确保：
# - 手机号已脱敏
# - token已脱敏
# - 密码不存在于日志中
```

### 3. 测试开发环境调试

```bash
# 关闭日志脱敏（开发调试用）
export SANITIZE_LOGS=false

# 重启服务器
cd server && npm run dev

# 检查日志，应该看到完整信息
```

## 回滚方案

如果脱敏导致调试困难：

1. **临时关闭脱敏**：
   ```bash
   export SANITIZE_LOGS=false
   ```

2. **仅对生产环境启用**：
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     // 只在生产环境脱敏
   }
   ```

3. **完全禁用**：移除脱敏调用

## 修复完成检查清单

- [ ] 日志脱敏工具已创建
- [ ] auth.middleware.ts已更新
- [ ] app.ts已更新
- [ ] 安全日志包装器已创建
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试不受影响
- [ ] 生产环境已启用

## 风险评估

- **风险级别**: 低
- **影响范围**: 日志输出
- **回滚难度**: 低（设置环境变量或禁用）
- **本地调试影响**: 可选（通过环境变量控制）

---

**修复时间估计**: 3-4 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 5-7 小时
