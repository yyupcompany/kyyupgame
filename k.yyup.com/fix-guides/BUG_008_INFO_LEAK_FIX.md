# Bug #8 修复指南 - 敏感信息泄露到前端

## 问题描述
在错误响应中，开发环境下暴露了太多内部信息，可能被攻击者利用。生产环境永远不应该返回详细的错误信息。

## 严重级别
**严重**

## 受影响的文件
- `server/src/app.ts`
  - 行号: 788-791
- `server/src/middlewares/`
- 多个控制器文件

## 漏洞代码

### 漏洞位置: app.ts 第788-791行
```typescript
// ❌ 开发环境返回详细错误信息
res.status(500).json({
  success: false,
  error: {
    message: '服务器内部错误',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  }
});
```

## 问题分析

1. **错误堆栈泄露**: `err.stack` 可能暴露文件路径
2. **数据库信息泄露**: 错误可能暴露表结构、字段名
3. **第三方库版本泄露**: 错误可能暴露依赖库信息
4. **内部路径泄露**: 可能暴露服务器文件结构
5. **配置信息泄露**: 可能暴露环境变量、密钥等

## 修复方案

### 步骤 1: 创建安全的错误处理中间件

创建文件 `server/src/middlewares/error-handler.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { captureError } from '../config/sentry.config';

/**
 * 错误代码映射
 */
const ERROR_CODE_MAP: Record<string, { message: string; statusCode: number }> = {
  // 认证相关
  UNAUTHORIZED: { message: '未授权访问', statusCode: 401 },
  INVALID_TOKEN: { message: '无效的访问令牌', statusCode: 401 },
  TOKEN_EXPIRED: { message: '访问令牌已过期', statusCode: 401 },
  INVALID_CREDENTIALS: { message: '用户名或密码错误', statusCode: 401 },

  // 权限相关
  FORBIDDEN: { message: '没有权限执行此操作', statusCode: 403 },
  ROLE_REQUIRED: { message: '需要特定角色权限', statusCode: 403 },

  // 资源相关
  NOT_FOUND: { message: '请求的资源不存在', statusCode: 404 },
  RESOURCE_NOT_FOUND: { message: '资源不存在', statusCode: 404 },
  USER_NOT_FOUND: { message: '用户不存在', statusCode: 404 },

  // 验证相关
  VALIDATION_ERROR: { message: '请求数据验证失败', statusCode: 400 },
  INVALID_INPUT: { message: '输入数据无效', statusCode: 400 },
  MISSING_REQUIRED_FIELD: { message: '缺少必填字段', statusCode: 400 },

  // 业务逻辑
  DUPLICATE_RESOURCE: { message: '资源已存在', statusCode: 409 },
  CONFLICT: { message: '操作冲突', statusCode: 409 },
  OPERATION_NOT_ALLOWED: { message: '不允许的操作', statusCode: 403 },

  // 服务器错误
  INTERNAL_ERROR: { message: '服务器内部错误', statusCode: 500 },
  DATABASE_ERROR: { message: '数据库操作失败', statusCode: 500 },
  EXTERNAL_SERVICE_ERROR: { message: '外部服务调用失败', statusCode: 502 },
  SERVICE_UNAVAILABLE: { message: '服务暂时不可用', statusCode: 503 }
};

/**
 * 应用错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public data?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    data?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 清理错误信息，移除敏感内容
 */
function sanitizeError(error: any): any {
  if (!error) return null;

  // 移除堆栈跟踪
  delete error.stack;

  // 移除可能的敏感信息
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'authorization',
    'cookie',
    'session',
    'privateKey',
    'dsn',
    'connectionString'
  ];

  sensitiveKeys.forEach(key => {
    if (error[key]) {
      error[key] = '***REDACTED***';
    }
  });

  // 移除 SQL 查询中的敏感信息
  if (error.sql) {
    error.sql = error.sql.replace(/('.*?')/g, "'***'");
  }

  return error;
}

/**
 * 格式化错误响应
 */
function formatErrorResponse(error: any, isDevelopment: boolean): any {
  const mappedError = ERROR_CODE_MAP[error.code] || {
    message: '服务器内部错误',
    statusCode: 500
  };

  const response: any = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || mappedError.message
    }
  };

  // 开发环境添加调试信息
  if (isDevelopment) {
    response.error.debug = {
      statusCode: error.statusCode || mappedError.statusCode,
      // 限制的堆栈信息
      stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined,
      // 清理后的错误对象
      details: sanitizeError(error)
    };
  }

  // 添加额外的数据（如果存在）
  if (error.data && isDevelopment) {
    response.error.data = error.data;
  }

  // 记录请求 ID 用于追踪
  if (error.requestId) {
    response.error.requestId = error.requestId;
  }

  return response;
}

/**
 * 全局错误处理中间件
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 生成请求 ID
  const requestId = req.headers['x-request-id'] || generateRequestId();
  err.requestId = requestId;

  // 确定环境
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 获取状态码
  const statusCode = err instanceof AppError
    ? err.statusCode
    : (err as any).statusCode || 500;

  // 记录错误
  logError(err, req, statusCode);

  // 发送到 Sentry（仅生产环境）
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    captureError(err, {
      requestId,
      path: req.path,
      method: req.method,
      user: req.user?.id,
      headers: sanitizeHeaders(req.headers)
    });
  }

  // 格式化并发送响应
  const response = formatErrorResponse(err, isDevelopment);

  res.status(statusCode).json(response);
}

/**
 * 记录错误
 */
function logError(error: Error, req: Request, statusCode: number) {
  const logData = {
    error: {
      message: error.message,
      code: (error as any).code,
      name: error.name
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    },
    user: req.user ? {
      id: req.user.id,
      role: req.user.role
    } : null,
    statusCode
  };

  // 根据严重程度选择日志级别
  if (statusCode >= 500) {
    logger.error('[服务器错误]', logData);
  } else if (statusCode >= 400) {
    logger.warn('[客户端错误]', logData);
  } else {
    logger.info('[错误]', logData);
  }
}

/**
 * 清理请求头
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };

  // 移除敏感的请求头
  delete sanitized.authorization;
  delete sanitized.cookie;
  delete sanitized['x-api-key'];

  return sanitized;
}

/**
 * 生成请求 ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 404 处理
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路径 ${req.method} ${req.path} 不存在`,
      requestId: req.headers['x-request-id'] || generateRequestId()
    }
  });
}
```

### 步骤 2: 创建自定义错误类

创建文件 `server/src/utils/errors.ts`:

```typescript
import { AppError } from '../middlewares/error-handler.middleware';

/**
 * 认证错误
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = '无效的访问令牌') {
    super(message, 401, 'INVALID_TOKEN');
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = '访问令牌已过期') {
    super(message, 401, 'TOKEN_EXPIRED');
  }
}

/**
 * 权限错误
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '没有权限执行此操作') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class RoleRequiredError extends AppError {
  constructor(role: string) {
    super(`需要 ${role} 角色权限`, 403, 'ROLE_REQUIRED');
  }
}

/**
 * 资源错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 404, 'NOT_FOUND');
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('用户不存在', 404, 'USER_NOT_FOUND');
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string = '请求数据验证失败', data?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, data);
  }
}

export class InvalidInputError extends AppError {
  constructor(field: string, value: any) {
    super(`字段 ${field} 的值无效`, 400, 'INVALID_INPUT');
  }
}

/**
 * 业务逻辑错误
 */
export class DuplicateResourceError extends AppError {
  constructor(resource: string) {
    super(`${resource}已存在`, 409, 'DUPLICATE_RESOURCE');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '操作冲突') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string = '数据库操作失败') {
    super(message, 500, 'DATABASE_ERROR', false);
  }
}

/**
 * 外部服务错误
 */
export class ExternalServiceError extends AppError {
  constructor(service: string) {
    super(`${service}服务调用失败`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}
```

### 步骤 3: 更新 app.ts

**修复前：**
```typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: '服务器内部错误',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});
```

**修复后：**
```typescript
import {
  globalErrorHandler,
  notFoundHandler,
  AppError
} from './middlewares/error-handler.middleware';

// 在所有路由之后，404 处理之前
app.use(notFoundHandler);

// 全局错误处理（必须在最后）
app.use(globalErrorHandler);

// 注意：不要在全局错误处理之后添加任何路由或中间件
```

### 步骤 4: 更新控制器使用新的错误类

**示例：更新 user.controller.ts**

**修复前：**
```typescript
// ❌ 直接抛出错误或返回详细错误信息
try {
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: `数据库中找不到 ID 为 ${id} 的用户`,
        table: 'users',
        query: `SELECT * FROM users WHERE id = ${id}`
      }
    });
  }
} catch (error) {
  res.status(500).json({
    success: false,
    error: {
      message: error.message,
      stack: error.stack // ❌ 暴露堆栈
    }
  });
}
```

**修复后：**
```typescript
import { NotFoundError, DatabaseError } from '../../utils/errors';

try {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户');
  }

  res.json({ success: true, data: user });
} catch (error) {
  // 如果是 AppError，直接传递
  if (error instanceof AppError) {
    throw error;
  }

  // 否则包装为 DatabaseError
  throw new DatabaseError('获取用户信息失败');
}
```

### 步骤 5: 创建生产环境错误响应模板

创建文件 `server/src/templates/error-responses.ts`:

```typescript
/**
 * 生产环境错误响应模板
 * 用于统一错误消息，不泄露内部信息
 */
export const PRODUCTION_ERROR_MESSAGES = {
  // 认证相关
  AUTH_FAILED: '认证失败，请重新登录',
  TOKEN_INVALID: '会话已过期，请重新登录',
  PASSWORD_WRONG: '用户名或密码错误',
  ACCOUNT_LOCKED: '账户已被锁定，请联系管理员',

  // 权限相关
  ACCESS_DENIED: '您没有权限执行此操作',
  ADMIN_REQUIRED: '此操作需要管理员权限',

  // 资源相关
  USER_NOT_FOUND: '用户不存在',
  RESOURCE_NOT_FOUND: '请求的资源不存在',
  CLASS_NOT_FOUND: '班级不存在',
  STUDENT_NOT_FOUND: '学生不存在',

  // 验证相关
  INVALID_PHONE: '手机号格式不正确',
  INVALID_EMAIL: '邮箱格式不正确',
  PASSWORD_TOO_WEAK: '密码强度不足',
  REQUIRED_FIELD_MISSING: '请填写所有必填字段',

  // 业务逻辑
  PHONE_ALREADY_EXISTS: '该手机号已被注册',
  EMAIL_ALREADY_EXISTS: '该邮箱已被注册',
  STUDENT_ALREADY_IN_CLASS: '该学生已在班级中',
  CLASS_FULL: '班级已满员',

  // 服务器错误
  SERVER_ERROR: '服务器处理请求时出错，请稍后重试',
  DATABASE_ERROR: '数据操作失败，请稍后重试',
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后重试'
};

/**
 * 获取安全的错误消息
 */
export function getSafeErrorMessage(
  code: string,
  fallbackMessage: string = '操作失败，请稍后重试'
): string {
  return PRODUCTION_ERROR_MESSAGES[code] || fallbackMessage;
}
```

### 步骤 6: 更新环境变量

更新 `server/.env`:

```bash
# ================================
# 错误处理配置
# ================================

# 是否启用详细错误信息（仅开发环境）
ENABLE_VERBOSE_ERRORS=false

# 是否启用错误堆栈追踪（仅开发环境）
ENABLE_ERROR_STACK=false

# 生产环境错误消息级别（simple | detailed）
PRODUCTION_ERROR_LEVEL=simple
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/error-handler.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';
import { AppError } from '../middlewares/error-handler.middleware';

describe('Error Handler', () => {
  describe('生产环境错误响应', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not expose error details in production', async () => {
      const response = await request(app)
        .get('/api/test-error');

      expect(response.status).toBe(500);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).not.toHaveProperty('debug');
      expect(response.body.error).not.toHaveProperty('stack');
    });

    it('should use safe error messages in production', async () => {
      const response = await request(app)
        .get('/api/users/999999');

      expect(response.body.error.message).not.toContain('SELECT');
      expect(response.body.error.message).not.toContain('users');
    });
  });

  describe('开发环境错误响应', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include debug information in development', async () => {
      const response = await request(app)
        .get('/api/test-error');

      expect(response.body.error).toHaveProperty('debug');
      expect(response.body.error.debug).toHaveProperty('stack');
    });
  });

  describe('404 处理', () => {
    it('should return proper 404 response', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
```

### 2. 安全测试
创建文件 `server/tests/security/error-leakage.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Error Information Leakage Prevention', () => {
  it('should not expose database schema in errors', async () => {
    const response = await request(app)
      .get('/api/users/invalid');

    expect(response.body.error.message).not.toMatch(/SELECT/i);
    expect(response.body.error.message).not.toMatch(/FROM/i);
    expect(response.body.error.message).not.toMatch(/WHERE/i);
  });

  it('should not expose file paths in errors', async () => {
    const response = await request(app)
      .get('/api/test-error');

    expect(response.body.error.message).not.toMatch(/\/home\//i);
    expect(response.body.error.message).not.toMatch(/\.ts$/i);
    expect(response.body.error.message).not.toMatch(/node_modules/i);
  });

  it('should not expose library versions in errors', async () => {
    const response = await request(app)
      .get('/api/test-error');

    expect(response.body.error.message).not.toMatch(/sequelize/i);
    expect(response.body.error.message).not.toMatch(/express/i);
  });

  it('should not expose environment variables in errors', async () => {
    const response = await request(app)
      .get('/api/test-error');

    expect(response.body.error.message).not.toMatch(/process\.env/i);
    expect(response.body.error.message).not.toMatch(/JWT_SECRET/i);
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- error-handler.test.ts
cd server && npm test -- error-leakage.test.ts
```

## 前端配合修改

更新 `client/src/utils/error-handler.ts`:

```typescript
/**
 * 错误代码映射到用户友好的消息
 */
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '请先登录',
  INVALID_TOKEN: '登录已过期，请重新登录',
  TOKEN_EXPIRED: '登录已过期，请重新登录',
  FORBIDDEN: '您没有权限执行此操作',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '请检查输入信息是否正确',
  INVALID_INPUT: '输入信息格式不正确',
  DUPLICATE_RESOURCE: '该资源已存在',
  INTERNAL_ERROR: '服务器处理请求时出错，请稍后重试',
  DATABASE_ERROR: '数据操作失败，请稍后重试',
  SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后重试'
};

/**
 * 处理 API 错误响应
 */
export function handleApiError(error: any): string {
  // 开发环境显示详细错误
  if (import.meta.env.DEV && error.error?.debug) {
    console.error('API 错误详情:', error.error.debug);
  }

  // 使用错误代码获取用户友好的消息
  const code = error.error?.code;
  const message = ERROR_MESSAGES[code] || error.error?.message || '操作失败，请稍后重试';

  return message;
}

/**
 * 显示错误提示
 */
export function showErrorMessage(error: any) {
  const message = handleApiError(error);

  // 使用 Element Plus 或其他 UI 库显示错误
  ElMessage.error(message);

  // 特殊处理：需要重新登录
  if (error.error?.code === 'INVALID_TOKEN' ||
      error.error?.code === 'TOKEN_EXPIRED') {
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  }
}
```

## 修复完成检查清单

- [ ] 错误处理中间件已创建
- [ ] 自定义错误类已创建
- [ ] app.ts 已更新使用新的错误处理
- [ ] 控制器已更新使用新的错误类
- [ ] 生产环境错误响应模板已创建
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 安全测试已通过
- [ ] 前端错误处理已更新

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
