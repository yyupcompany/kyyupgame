# 统一日志系统使用规范指南

## 📋 概述

本文档提供了项目中统一日志系统的使用规范和最佳实践，确保整个项目的日志管理标准化、规范化。

## 🎯 适用范围

- **后端服务** (`k.yyup.com/server/src/`) - 使用统一的logger工具
- **前端应用** (`k.yyup.com/client/src/`) - 使用frontendLogger工具
- **工具脚本** - 根据环境选择合适的logger

## 🏗️ 日志系统架构

### 后端Logger (`/server/src/utils/logger.ts`)

```typescript
import logger from '../utils/logger';

// 日志级别
logger.debug('调试信息', { data: '额外数据' });
logger.info('一般信息');
logger.warn('警告信息');
logger.error('错误信息', error);
```

### 前端Logger (`/client/src/utils/frontend-logger.ts`)

```typescript
import frontendLogger from '@/utils/frontend-logger';

// 日志级别 (异步调用)
await frontendLogger.debug('调试信息', { data: '额外数据' });
await frontendLogger.info('一般信息');
await frontendLogger.warn('警告信息');
await frontendLogger.error('错误信息', error);
```

## 📝 日志级别使用指南

### 🔍 DEBUG (调试级别)
**用途**: 开发调试、详细的执行流程
**适用场景**:
- 开发环境下的详细调试信息
- 函数入参和返回值的详细记录
- 复杂算法的中间步骤
- 数据库查询的详细信息

```typescript
// ✅ 正确使用
logger.debug('开始处理用户请求', { userId, requestParams });

// ❌ 错误使用 - 生产环境不应有debug信息
logger.debug('用户登录了'); // 这应该是info级别
```

### ℹ️ INFO (信息级别)
**用途**: 正常的业务流程信息
**适用场景**:
- 用户操作记录
- 系统状态变化
- 重要的业务流程节点
- 服务启动和关闭

```typescript
// ✅ 正确使用
logger.info('用户登录成功', { userId, loginTime });
logger.info('服务启动完成', { port: 3000 });

// ❌ 错误使用 - 过于琐碎的信息
logger.info('收到请求'); // 这应该是debug级别
```

### ⚠️ WARN (警告级别)
**用途**: 潜在问题、异常但不影响功能
**适用场景**:
- 降级操作
- 重试操作
- 配置警告
- 性能问题

```typescript
// ✅ 正确使用
logger.warn('缓存未命中，直接查询数据库', { cacheKey });
logger.warn('API响应时间较长', { url, duration: 2500 });

// ❌ 错误使用 - 应该是error级别
logger.warn('数据库连接失败'); // 这是严重错误
```

### ❌ ERROR (错误级别)
**用途**: 系统错误、异常情况
**适用场景**:
- 数据库操作失败
- 网络请求失败
- 业务逻辑错误
- 系统异常

```typescript
// ✅ 正确使用
logger.error('数据库操作失败', error);
logger.error('API请求失败', { url, error });

// ❌ 错误使用 - 应该是warn级别
logger.error('用户输入格式不正确'); // 这不是系统错误
```

## 🔧 导入规范

### 后端导入
```typescript
// ✅ 统一导入方式
import logger from '../utils/logger';

// ❌ 错误导入方式
const logger = require('../utils/logger');
import { logger } from '../utils/logger';
```

### 前端导入
```typescript
// ✅ 统一导入方式
import frontendLogger from '@/utils/frontend-logger';

// ❌ 错误导入方式
import { frontendLogger } from '@/utils/frontend-logger';
```

## 📊 日志格式规范

### 后端日志格式
```
[2025-01-30T10:30:45.123Z] [INFO] [UserController:login:45] 用户登录成功 {"userId": 123, "ip": "192.168.1.100"}
```

### 前端日志格式
```
[2025-01-30T10:30:45.123Z] [ERROR] [User:123] [LoginService.ts:25:8] 登录失败 {"error": "Invalid credentials"}
```

## 🚫 禁止的日志使用

### 1. 直接使用console
```typescript
// ❌ 禁止使用
console.log('用户登录');
console.error('发生错误');
console.warn('警告信息');
```

### 2. 敏感信息记录
```typescript
// ❌ 禁止记录敏感信息
logger.info('用户密码', { password: '123456' });
logger.debug('Token信息', { token: 'Bearer xxx' });
```

### 3. 过度日志
```typescript
// ❌ 避免过度日志
for (let i = 0; i < 10000; i++) {
  logger.debug(`处理第${i}个元素`); // 会产生大量日志
}
```

## ✅ 最佳实践

### 1. 结构化日志
```typescript
// ✅ 使用结构化数据
logger.info('用户操作', {
  userId: user.id,
  action: 'login',
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### 2. 错误处理
```typescript
// ✅ 正确的错误日志
try {
  await someOperation();
} catch (error) {
  logger.error('操作失败', {
    operation: 'someOperation',
    userId: req.user?.id,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  });
  throw error;
}
```

### 3. 性能监控
```typescript
// ✅ 性能相关日志
const startTime = Date.now();
await someExpensiveOperation();
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn('操作耗时过长', {
    operation: 'someExpensiveOperation',
    duration: `${duration}ms`
  });
} else {
  logger.debug('操作完成', {
    operation: 'someExpensiveOperation',
    duration: `${duration}ms`
  });
}
```

### 4. 业务流程追踪
```typescript
// ✅ 业务流程日志
logger.info('开始处理订单', { orderId, userId });

try {
  logger.debug('验证库存', { orderId, productId });
  await checkInventory();

  logger.debug('创建支付', { orderId, amount });
  await createPayment();

  logger.info('订单处理完成', { orderId, status: 'completed' });
} catch (error) {
  logger.error('订单处理失败', { orderId, error });
  throw error;
}
```

## 🔒 安全注意事项

### 1. 敏感信息过滤
```typescript
// ✅ 敏感信息脱敏
logger.info('用户信息', {
  userId: user.id,
  phone: user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
  email: user.email?.replace(/(.{2}).*(@.*)/, '$1****$2')
});
```

### 2. 生产环境配置
```typescript
// 后端生产环境配置
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('warn'); // 只记录warn及以上级别
}

// 前端生产环境配置
frontendLogger.setConfig({
  level: LogLevel.WARN,
  enableUserTracking: true,
  logToServer: true
});
```

## 📈 性能优化建议

### 1. 异步日志
```typescript
// 前端使用异步日志
await frontendLogger.error('错误信息', error);

// 后端logger已内置异步处理
logger.error('错误信息', error); // 自动异步处理
```

### 2. 批量操作优化
```typescript
// ❌ 避免大量单独日志
items.forEach(item => {
  logger.debug('处理项目', { itemId: item.id });
});

// ✅ 使用汇总日志
logger.debug('批量处理项目', {
  itemCount: items.length,
  itemIds: items.map(item => item.id)
});
```

## 🧪 测试环境日志

### 开发环境
- 所有级别的日志都启用
- 详细的调试信息
- 源码位置信息

### 测试环境
- 启用info及以上级别
- 保留必要的业务流程日志
- 禁用详细的调试信息

### 生产环境
- 仅启用warn及以上级别
- 必要的错误和警告信息
- 用户行为追踪

## 📋 检查清单

在提交代码前，请确保：

- [ ] 没有使用`console.log`、`console.error`、`console.warn`
- [ ] 所有日志使用了统一的logger工具
- [ ] 日志级别使用正确
- [ ] 没有记录敏感信息
- [ ] 错误日志包含足够的上下文信息
- [ ] 日志信息简洁明了，避免冗余

## 🔧 故障排除

### 常见问题

1. **logger导入失败**
   ```bash
   # 检查路径是否正确
   ls -la /path/to/utils/logger.ts
   ```

2. **前端日志不工作**
   ```javascript
   // 检查是否正确导入
   console.log(frontendLogger); // 确认对象存在
   ```

3. **生产环境日志过多**
   ```typescript
   // 检查日志级别配置
   frontendLogger.setConfig({ level: LogLevel.WARN });
   ```

## 📚 相关文档

- [项目架构文档](./SYSTEM_ARCHITECTURE_SUMMARY.md)
- [API开发规范](./API_DEVELOPMENT_GUIDE.md)
- [安全规范](./SECURITY_GUIDELINES.md)

---

**版本**: 1.0
**最后更新**: 2025-01-30
**维护者**: 开发团队

如有问题或建议，请联系开发团队或在项目issue中反馈。