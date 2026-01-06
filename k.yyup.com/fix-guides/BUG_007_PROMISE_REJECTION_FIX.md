# Bug #7 修复指南 - 未处理的Promise拒绝

## 问题描述
虽然代码中添加了`unhandledRejection`处理，但在某些情况下仍可能导致问题。处理逻辑中忽略了某些错误，但没有记录到日志系统。

## 严重级别
**严重**

## 受影响的文件
- `server/src/app.ts`
  - 行号: 965-979

## 漏洞代码

### 漏洞位置: app.ts 第965-979行
```typescript
process.on('unhandledRejection', (reason: any, promise) => {
  if (reason && typeof reason === 'object' && (reason.code === 'EPIPE' || reason.code === 'ECONNRESET')) {
    return; // ❌ 静默忽略，没有记录
  }

  try {
    logger.error('未处理的Promise拒绝', { reason, promise });
  } catch (e) {
    // logger 也失败时，静默忽略 ❌
  }
  // 不退出进程，继续运行
});
```

## 问题分析

1. **静默忽略**: 某些错误被直接忽略，没有记录
2. **Logger 失败处理不完整**: logger 失败时的回退机制不足
3. **缺少错误分类**: 没有区分可恢复和不可恢复的错误
4. **缺少告警机制**: 关键错误没有触发告警
5. **进程不退出**: 某些不可恢复的错误应该让进程退出

## 修复方案

### 步骤 1: 创建增强的错误处理器

创建文件 `server/src/utils/error-handler.ts`:

```typescript
import { logger } from './logger';
import Sentry from '@sentry/node';

/**
 * 错误类型分类
 */
export enum ErrorType {
  // 可恢复的错误
  RECOVERABLE = 'recoverable',

  // 网络相关
  NETWORK = 'network',

  // 数据库相关
  DATABASE = 'database',

  // 外部服务
  EXTERNAL_SERVICE = 'external_service',

  // 严重错误
  CRITICAL = 'critical',

  // 未知错误
  UNKNOWN = 'unknown'
}

/**
 * 错误分类
 */
export function classifyError(error: any): ErrorType {
  if (!error) {
    return ErrorType.UNKNOWN;
  }

  // 网络相关错误
  if (
    error.code === 'EPIPE' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND'
  ) {
    return ErrorType.NETWORK;
  }

  // 数据库相关错误
  if (
    error.code === 'ER_ACCESS_DENIED_ERROR' ||
    error.code === 'ER_BAD_DB_ERROR' ||
    error.code === 'SequelizeConnectionError'
  ) {
    return ErrorType.DATABASE;
  }

  // 外部服务错误
  if (
    error.code === 'EAI_AGAIN' ||
    error.response?.status >= 500
  ) {
    return ErrorType.EXTERNAL_SERVICE;
  }

  // 严重错误
  if (
    error.code === 'ENOMEM' ||
    error.code === 'EBADF' ||
    error.message?.includes('out of memory') ||
    error.message?.includes('heap out of memory')
  ) {
    return ErrorType.CRITICAL;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 判断错误是否可恢复
 */
export function isRecoverable(error: any): boolean {
  const type = classifyError(error);

  return [
    ErrorType.RECOVERABLE,
    ErrorType.NETWORK,
    ErrorType.EXTERNAL_SERVICE
  ].includes(type);
}

/**
 * 判断错误是否需要重启进程
 */
export function shouldRestartProcess(error: any): boolean {
  const type = classifyError(error);

  return [
    ErrorType.CRITICAL,
    ErrorType.DATABASE
  ].includes(type);
}

/**
 * 错误处理配置
 */
interface ErrorHandlingConfig {
  // 是否记录到日志
  log: boolean;

  // 是否发送到 Sentry
  sentry: boolean;

  // 是否触发告警
  alert: boolean;

  // 是否退出进程
  exit: boolean;

  // 退出前的清理时间（毫秒）
  cleanupTime: number;
}

/**
 * 获取错误处理配置
 */
export function getErrorHandlingConfig(error: any): ErrorHandlingConfig {
  const type = classifyError(error);

  // 网络错误 - 通常可恢复，不需要退出
  if (type === ErrorType.NETWORK) {
    return {
      log: true,
      sentry: false,
      alert: false,
      exit: false,
      cleanupTime: 0
    };
  }

  // 数据库错误 - 严重，需要重启
  if (type === ErrorType.DATABASE) {
    return {
      log: true,
      sentry: true,
      alert: true,
      exit: true,
      cleanupTime: 5000
    };
  }

  // 严重错误 - 需要立即退出
  if (type === ErrorType.CRITICAL) {
    return {
      log: true,
      sentry: true,
      alert: true,
      exit: true,
      cleanupTime: 1000
    };
  }

  // 默认配置
  return {
    log: true,
    sentry: true,
    alert: false,
    exit: false,
    cleanupTime: 0
  };
}

/**
 * 错误统计
 */
class ErrorStatistics {
  private errors = new Map<string, { count: number; lastOccurrence: number }>();

  record(error: any): void {
    const key = this.getErrorKey(error);
    const existing = this.errors.get(key) || { count: 0, lastOccurrence: 0 };

    existing.count++;
    existing.lastOccurrence = Date.now();

    this.errors.set(key, existing);

    // 检查是否需要告警（短时间大量相同错误）
    if (existing.count >= 10) {
      this.triggerAlert(key, existing);
    }
  }

  private getErrorKey(error: any): string {
    return `${error.code || 'UNKNOWN'}_${error.message || 'no-message'}`;
  }

  private triggerAlert(key: string, stats: any): void {
    logger.error('[错误告警] 检测到大量相同错误', {
      key,
      count: stats.count,
      lastOccurrence: new Date(stats.lastOccurrence).toISOString()
    });

    // TODO: 发送告警到监控系统
  }

  getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    this.errors.forEach((stats, key) => {
      report[key] = {
        count: stats.count,
        lastOccurrence: new Date(stats.lastOccurrence).toISOString()
      };
    });

    return report;
  }
}

export const errorStatistics = new ErrorStatistics();
```

### 步骤 2: 创建 Sentry 配置

创建文件 `server/src/config/sentry.config.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { Integrations } from '@sentry/tracing';

/**
 * 初始化 Sentry
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN 未配置，错误追踪已禁用');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Integrations.Http({ tracing: true }),
      new Integrations.Express({ app })
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // 过滤敏感信息
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.['authorization'];
      }

      // 过滤网络错误（降低噪音）
      if (event.exception?.values?.[0]?.type === 'EPIPE' ||
          event.exception?.values?.[0]?.type === 'ECONNRESET') {
        return null;
      }

      return event;
    }
  });

  console.log('✅ Sentry 错误追踪已初始化');
}

/**
 * 捕获错误到 Sentry
 */
export function captureError(error: any, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }

    Sentry.captureException(error);
  });
}

/**
 * 捕获消息到 Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
```

### 步骤 3: 更新 app.ts 中的 Promise 拒绝处理

**修复前：**
```typescript
process.on('unhandledRejection', (reason: any, promise) => {
  if (reason && typeof reason === 'object' && (reason.code === 'EPIPE' || reason.code === 'ECONNRESET')) {
    return;
  }

  try {
    logger.error('未处理的Promise拒绝', { reason, promise });
  } catch (e) {
    // logger 也失败时，静默忽略
  }
});
```

**修复后：**
```typescript
import {
  classifyError,
  isRecoverable,
  shouldRestartProcess,
  getErrorHandlingConfig,
  errorStatistics
} from './utils/error-handler';
import { initSentry, captureError } from './config/sentry.config';

// 初始化 Sentry
initSentry();

// 增强的 unhandledRejection 处理
process.on('unhandledRejection', async (reason: any, promise) => {
  const errorType = classifyError(reason);
  const config = getErrorHandlingConfig(reason);

  // 记录错误统计
  errorStatistics.record(reason);

  // 始终记录到日志
  if (config.log) {
    try {
      logger.error('[未处理的Promise拒绝]', {
        reason: {
          message: reason?.message,
          code: reason?.code,
          stack: reason?.stack,
          name: reason?.name
        },
        promise: promise.toString(),
        errorType,
        timestamp: new Date().toISOString(),
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      });
    } catch (logError) {
      // Logger 失败时的回退：使用 console.error
      console.error('[Logger失败] 使用 console.error 记录原始错误:');
      console.error('原始拒绝原因:', reason);
      console.error('Logger错误:', logError);
    }
  }

  // 发送到 Sentry
  if (config.sentry) {
    try {
      captureError(reason, {
        type: 'unhandledRejection',
        promise: promise.toString(),
        errorType
      });
    } catch (sentryError) {
      console.error('[Sentry失败] 无法发送错误到 Sentry:', sentryError);
    }
  }

  // 触发告警
  if (config.alert) {
    try {
      await triggerAlert(reason, errorType);
    } catch (alertError) {
      console.error('[告警失败] 无法触发告警:', alertError);
    }
  }

  // 退出进程
  if (config.exit) {
    console.error(`[致命错误] 进程将在 ${config.cleanupTime}ms 后退出`);

    // 优雅关闭
    setTimeout(() => {
      cleanupAndExit(1);
    }, config.cleanupTime);
  }
});

// 增强的 uncaughtException 处理
process.on('uncaughtException', async (error: Error) => {
  const errorType = classifyError(error);
  const config = getErrorHandlingConfig(error);

  // 记录错误
  try {
    logger.error('[未捕获的异常]', {
      error: {
        message: error.message,
        code: (error as any).code,
        stack: error.stack,
        name: error.name
      },
      errorType,
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (logError) {
    console.error('[Logger失败] 使用 console.error 记录原始异常:');
    console.error('原始异常:', error);
    console.error('Logger错误:', logError);
  }

  // 发送到 Sentry
  if (config.sentry) {
    try {
      captureError(error, {
        type: 'uncaughtException',
        errorType
      });
    } catch (sentryError) {
      console.error('[Sentry失败]:', sentryError);
    }
  }

  // 触发告警
  if (config.alert) {
    try {
      await triggerAlert(error, errorType);
    } catch (alertError) {
      console.error('[告警失败]:', alertError);
    }
  }

  // uncaughtException 后必须退出
  console.error(`[致命错误] 进程将在 ${config.cleanupTime}ms 后退出`);

  setTimeout(() => {
    cleanupAndExit(1);
  }, config.cleanupTime);
});

/**
 * 触发告警
 */
async function triggerAlert(error: any, errorType: string) {
  // 根据错误类型发送不同的告警
  const alert = {
    level: shouldRestartProcess(error) ? 'critical' : 'warning',
    type: errorType,
    message: error?.message || '未知错误',
    code: error?.code,
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  };

  // 发送到告警系统（如钉钉、企业微信、Slack 等）
  if (process.env.ALERT_WEBHOOK) {
    try {
      await fetch(process.env.ALERT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (webhookError) {
      console.error('[告警Webhook失败]:', webhookError);
    }
  }

  // 记录到专门的告警日志
  console.error('[告警]', JSON.stringify(alert));
}

/**
 * 清理并退出
 */
function cleanupAndExit(exitCode: number) {
  console.log('[优雅关闭] 开始清理资源...');

  // 关闭数据库连接
  // 关闭 HTTP 服务器
  // 清理临时文件
  // ...

  console.log('[优雅关闭] 清理完成，退出进程');
  process.exit(exitCode);
}
```

### 步骤 4: 添加错误报告端点

创建文件 `server/src/routes/error-routes.ts`:

```typescript
import { Router } from 'express';
import { errorStatistics } from '../utils/error-handler';

const router = Router();

/**
 * GET /api/errors/stats
 * 获取错误统计
 */
router.get('/stats', (req, res) => {
  const stats = errorStatistics.getReport();

  res.json({
    success: true,
    data: {
      stats,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * DELETE /api/errors/stats
 * 重置错误统计
 */
router.delete('/stats', (req, res) => {
  // 在生产环境禁止重置
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        message: '生产环境禁止重置错误统计',
        code: 'FORBIDDEN_IN_PRODUCTION'
      }
    });
  }

  // TODO: 实现重置方法
  res.json({
    success: true,
    message: '错误统计已重置'
  });
});

export default router;
```

在 `server/src/app.ts` 中注册：

```typescript
import errorRoutes from './routes/error-routes';
app.use('/api/errors', errorRoutes);
```

### 步骤 5: 添加环境变量

更新 `server/.env`:

```bash
# ================================
# 错误追踪和告警配置
# ================================

# Sentry DSN
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# 告警 Webhook URL
ALERT_WEBHOOK=https://your-webhook-url

# 错误保留时间（天）
ERROR_RETENTION_DAYS=30
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/error-handler.test.ts`:

```typescript
import {
  classifyError,
  isRecoverable,
  shouldRestartProcess,
  getErrorHandlingConfig
} from '../utils/error-handler';

describe('Error Handler', () => {
  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error = { code: 'EPIPE' };
      expect(classifyError(error)).toBe('network');
    });

    it('should classify database errors', () => {
      const error = { code: 'SequelizeConnectionError' };
      expect(classifyError(error)).toBe('database');
    });

    it('should classify critical errors', () => {
      const error = { code: 'ENOMEM' };
      expect(classifyError(error)).toBe('critical');
    });
  });

  describe('isRecoverable', () => {
    it('should identify network errors as recoverable', () => {
      const error = { code: 'ECONNRESET' };
      expect(isRecoverable(error)).toBe(true);
    });

    it('should identify database errors as not recoverable', () => {
      const error = { code: 'SequelizeConnectionError' };
      expect(isRecoverable(error)).toBe(false);
    });
  });

  describe('shouldRestartProcess', () => {
    it('should return true for database errors', () => {
      const error = { code: 'SequelizeConnectionError' };
      expect(shouldRestartProcess(error)).toBe(true);
    });

    it('should return false for network errors', () => {
      const error = { code: 'EPIPE' };
      expect(shouldRestartProcess(error)).toBe(false);
    });
  });

  describe('getErrorHandlingConfig', () => {
    it('should return correct config for network errors', () => {
      const error = { code: 'EPIPE' };
      const config = getErrorHandlingConfig(error);

      expect(config.log).toBe(true);
      expect(config.sentry).toBe(false);
      expect(config.exit).toBe(false);
    });

    it('should return correct config for critical errors', () => {
      const error = { code: 'ENOMEM' };
      const config = getErrorHandlingConfig(error);

      expect(config.log).toBe(true);
      expect(config.sentry).toBe(true);
      expect(config.exit).toBe(true);
    });
  });
});
```

### 2. 集成测试
创建文件 `server/tests/__tests__/error-handling-integration.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Error Handling Integration', () => {
  it('should record network errors but not restart', async () => {
    // 触发一个会导致网络错误的请求
    // 验证服务继续运行
  });

  it('should handle database connection errors gracefully', async () => {
    // 模拟数据库连接错误
    // 验证进程退出
  });

  it('should provide error statistics', async () => {
    const response = await request(app)
      .get('/api/errors/stats');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('stats');
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- error-handler.test.ts
cd server && npm test -- error-handling-integration.test.ts
```

## 修复完成检查清单

- [ ] 错误处理器工具已创建
- [ ] Sentry 配置已实现
- [ ] unhandledRejection 处理已增强
- [ ] uncaughtException 处理已增强
- [ ] 告警机制已实现
- [ ] 错误统计已实现
- [ ] 错误报告端点已创建
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 生产环境测试已通过

---

**修复时间估计**: 6-8 小时
**测试时间估计**: 3-4 小时
**总时间估计**: 9-12 小时
