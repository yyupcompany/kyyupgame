# Bug #12 修复指南 - 错误处理中间件可能暴露堆栈跟踪

## 问题描述
在全局错误处理中间件中，可能返回error.stack，这在生产环境是危险的。

## 严重级别
**高**

## 受影响的文件
- `server/src/app.ts`
  - 行号: 782-791

## 漏洞代码

### 位置: app.ts 第782-791行
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

## 问题分析

1. **stack信息泄露**: `console.error(err.stack)` 会输出完整堆栈到日志
2. **可能暴露**: 文件路径、依赖库版本、内部实现细节
3. **开发环境**: 需要详细信息用于调试
4. **生产环境**: 永远不应该暴露stack信息

## 修复方案（安全且不影响调试）

### 步骤 1: 修改全局错误处理

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
// ================================
// 安全的全局错误处理
// ================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV === 'development';

  // 记录错误到日志（但不记录stack）
  console.error('[服务器错误]', {
    message: err.message,
    name: err.name,
    code: (err as any).code,
    path: req.path,
    method: req.method,
    // 开发环境记录更多调试信息
    ...(isDev && {
      stack: err.stack?.split('\n').slice(0, 3).join('\n'), // 只保留前3行stack
      query: req.query,
      body: req.body
    })
  });

  // 构建错误响应
  const errorResponse: any = {
    success: false,
    error: {
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    }
  };

  // 只在开发环境返回详细信息
  if (isDev) {
    errorResponse.error.detail = {
      message: err.message,
      type: err.name,
      // 不返回完整stack，只返回必要信息
      hint: '请查看服务器日志获取详细错误信息'
    };
  }

  // 根据错误类型返回不同的状态码
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json(errorResponse);
});
```

### 步骤 2: 添加请求ID用于追踪

为了帮助调试，不暴露stack的情况下追踪错误：

```typescript
import { v4 as uuidv4 } from 'uuid';

// 请求ID中间件（在所有中间件之前）
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// 在错误处理中使用
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id || 'unknown';

  console.error('[服务器错误]', {
    requestId,  // 用于追踪
    message: err.message,
    path: req.path
  });

  res.status(500).json({
    success: false,
    error: {
      message: '服务器内部错误',
      requestId,  // 客户端可以使用这个ID报告问题
      code: 'INTERNAL_ERROR'
    }
  });
});
```

### 步骤 3: TypeScript类型定义

确保类型正确：

```typescript
// 扩展Express Request类型
declare module 'express' {
  interface Request {
    id?: string;
  }
}
```

### 步骤 4: 可选：添加Sentry错误追踪

如果需要生产环境的错误追踪，可以集成Sentry（可选）：

```typescript
import * as Sentry from '@sentry/node';

// 只在生产环境启用
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // 移除敏感信息
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    }
  });
}

// 在错误处理中
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 发送到Sentry（生产环境）
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err, {
      tags: {
        requestId: req.id
      }
    });
  }

  // ... 其他处理逻辑
});
```

### 步骤 5: 环境变量配置

在 `server/.env` 中添加（可选）：

```bash
# ================================
# 错误追踪配置（可选）
# ================================

# Sentry DSN（可选，用于生产环境错误追踪）
SENTRY_DSN=

# 是否启用详细错误日志（仅开发环境）
ENABLE_VERBOSE_ERRORS=development
```

## 本地调试保证

### 开发环境功能

在开发环境（`NODE_ENV=development`）：

- ✅ 返回详细的错误信息（message, type）
- ✅ 返回请求ID用于追踪
- ✅ console输出部分stack信息（前3行）
- ✅ 不影响正常调试

### 生产环境功能

在生产环境（`NODE_ENV=production`）：

- ✅ 只返回通用错误消息
- ✅ 返回请求ID用于问题报告
- ✅ 错误发送到Sentry（如果配置）
- ✅ 不暴露任何stack信息

## 验证步骤

### 1. 单元测试
```typescript
describe('错误处理中间件', () => {
  it('应该在生产环境不暴露stack', async () => {
    process.env.NODE_ENV = 'production';

    const response = await request(app)
      .get('/api/test-error');

    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error).not.toHaveProperty('stack');
    expect(response.body.error).not.toHaveProperty('detail');
  });

  it('应该在开发环境返回详细错误', async () => {
    process.env.NODE_ENV = 'development';

    const response = await request(app)
      .get('/api/test-error');

    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error).toHaveProperty('detail');
    expect(response.body.error).toHaveProperty('requestId');
  });

  it('应该生成唯一的请求ID', async () => {
    const response1 = await request(app).get('/api/test');
    const response2 = await request(app).get('/api/test');

    expect(response1.headers['x-request-id']).toBeDefined();
    expect(response2.headers['x-request-id']).toBeDefined();
    expect(response1.headers['x-request-id']).not.toBe(response2.headers['x-request-id']);
  });
});
```

### 2. 手动测试

**开发环境测试**：
```bash
# 设置开发环境
export NODE_ENV=development

# 启动服务器
cd server && npm run dev

# 触发一个错误
curl http://localhost:3000/api/test-error

# 检查：应该返回详细错误信息
```

**生产环境测试**：
```bash
# 设置生产环境
export NODE_ENV=production

# 启动服务器
cd server && npm run dev

# 触发一个错误
curl http://localhost:3000/api/test-error

# 检查：应该只返回通用错误，没有stack
```

### 3. 检查日志

确认日志中没有泄露敏感信息：
```bash
# 查看日志
tail -f server/logs/app.log

# 确认：不应该有完整的stack trace
```

## 回滚方案

如果修复后出现问题：

1. **快速回滚**：恢复原有的错误处理代码
2. **环境变量控制**：
   ```bash
   # 强制启用开发模式
   export NODE_ENV=development
   ```
3. **条件编译**：使用环境变量控制是否使用新的错误处理

## 修复完成检查清单

- [ ] 全局错误处理已更新
- [ ] 请求ID中间件已添加
- [ ] 开发环境返回详细错误
- [ ] 生产环境不暴露stack
- [ ] TypeScript类型已定义
- [ ] Sentry集成（可选）
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试正常工作
- [ ] 日志没有泄露敏感信息

## 风险评估

- **风险级别**: 低
- **影响范围**: 错误响应格式
- **回滚难度**: 低（简单恢复原有代码）
- **本地调试影响**: 无（开发环境保持详细错误）

---

**修复时间估计**: 2-3 小时
**测试时间估计**: 1-2 小时
**总时间估计**: 3-5 小时
