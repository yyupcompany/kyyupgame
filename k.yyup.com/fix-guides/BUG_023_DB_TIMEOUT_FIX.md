# Bug #23 修复指南 - 数据库查询缺少超时设置

## 问题描述
数据库查询没有设置超时时间，长时间运行的查询可能导致资源耗尽。

## 严重级别
**中**

## 受影响的文件
- `server/src/controllers/` (业务层)
- `server/src/services/` (业务层)

## 问题分析

1. **资源耗尽**: 长时间查询占用数据库连接
2. **连接池耗尽**: 慢查询导致连接池被占满
3. **用户体验差**: 请求长时间无响应
4. **级联故障**: 多个慢查询导致整个系统变慢

## 修复方案（在具体查询中添加timeout参数）

### 步骤 1: 创建数据库超时配置

在 `server/src/config/database-timeout.config.ts` 创建配置文件：

```typescript
/**
 * 数据库查询超时配置
 * 单位：毫秒
 */

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 默认超时配置
 */
export const DB_TIMEOUTS = {
  // 短查询（简单查询）
  SHORT: isDevelopment ? 30000 : 5000,      // 开发: 30秒, 生产: 5秒

  // 中等查询（常规查询）
  MEDIUM: isDevelopment ? 60000 : 10000,    // 开发: 60秒, 生产: 10秒

  // 长查询（复杂查询、报表）
  LONG: isDevelopment ? 120000 : 30000,     // 开发: 120秒, 生产: 30秒

  // 批量操作
  BULK: isDevelopment ? 300000 : 60000,     // 开发: 300秒, 生产: 60秒

  // 连接超时
  CONNECTION: isDevelopment ? 60000 : 10000 // 开发: 60秒, 生产: 10秒
};

/**
 * 从环境变量读取自定义超时
 */
export function getTimeout(defaultTimeout: number): number {
  const envTimeout = parseInt(process.env.DB_QUERY_TIMEOUT || '', 10);
  return isNaN(envTimeout) ? defaultTimeout : envTimeout;
}

/**
 * 查询类型超时映射
 */
export const QUERY_TYPE_TIMEOUTS = {
  // 列表查询
  list: getTimeout(DB_TIMEOUTS.MEDIUM),

  // 详情查询
  detail: getTimeout(DB_TIMEOUTS.SHORT),

  // 统计查询
  statistics: getTimeout(DB_TIMEOUTS.LONG),

  // 创建操作
  create: getTimeout(DB_TIMEOUTS.SHORT),

  // 更新操作
  update: getTimeout(DB_TIMEOUTS.MEDIUM),

  // 删除操作
  delete: getTimeout(DB_TIMEOUTS.MEDIUM),

  // 批量操作
  bulk: getTimeout(DB_TIMEOUTS.BULK),

  // 报表查询
  report: getTimeout(DB_TIMEOUTS.LONG)
};
```

### 步骤 2: 创建超时包装器

在 `server/src/utils/database-timeout.ts` 创建工具文件：

```typescript
import { DB_TIMEOUTS } from '../config/database-timeout.config';
import { QueryOptions } from 'sequelize';

/**
 * 为查询选项添加超时
 */
export function withTimeout(
  options: QueryOptions = {},
  timeout: number = DB_TIMEOUTS.MEDIUM
): QueryOptions {
  return {
    ...options,
    timeout
  };
}

/**
 * 创建超时Promise
 */
export function createTimeoutPromise<T>(timeoutMs: number, operation: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`数据库操作超时: ${operation} (${timeoutMs}ms)`));
    }, timeoutMs);
  });
}

/**
 * 带超时的查询执行
 */
export async function executeWithTimeout<T>(
  query: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  try {
    // 使用Promise.race实现超时
    const result = await Promise.race([
      query,
      createTimeoutPromise<T>(timeoutMs, operationName)
    ]);

    return result;
  } catch (error: any) {
    // 检查是否为超时错误
    if (error.message && error.message.includes('超时')) {
      console.error(`⏱️  数据库操作超时: ${operationName} (${timeoutMs}ms)`);
      throw new Error(`操作超时，请优化查询或稍后重试`);
    }

    throw error;
  }
}

/**
 * 记录慢查询
 */
export function logSlowQuery(operation: string, duration: number, threshold: number = 3000) {
  if (duration > threshold) {
    console.warn(`🐌 慢查询检测: ${operation} (${duration}ms)`);
    // 可以发送到监控系统
    // monitoringService.recordSlowQuery(operation, duration);
  }
}

/**
 * 带性能监控的查询执行
 */
export async function executeWithMonitoring<T>(
  query: Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await query;
    const duration = Date.now() - startTime;

    logSlowQuery(operationName, duration);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ 查询失败: ${operationName} (${duration}ms)`, error);
    throw error;
  }
}
```

### 步骤 3: 在服务中使用

**修复前：**
```typescript
// ❌ 没有超时设置
const users = await User.findAll({
  where: { status: 'active' }
});
```

**修复后：**
```typescript
import { withTimeout, DB_TIMEOUTS } from '../../utils/database-timeout';

// ✅ 添加超时设置
const users = await User.findAll(withTimeout({
  where: { status: 'active' }
}, DB_TIMEOUTS.MEDIUM));
```

### 步骤 4: 常见查询模式

```typescript
import {
  withTimeout,
  executeWithTimeout,
  executeWithMonitoring,
  DB_TIMEOUTS
} from '../../utils/database-timeout';

/**
 * 列表查询（带分页）
 */
async function getUserList(page: number, pageSize: number) {
  const users = await User.findAll(withTimeout({
    where: { status: 'active' },
    offset: (page - 1) * pageSize,
    limit: pageSize,
    order: [['createdAt', 'DESC']]
  }, DB_TIMEOUTS.MEDIUM));

  return users;
}

/**
 * 详情查询
 */
async function getUserById(id: number) {
  const user = await User.findByPk(id, withTimeout({
    include: ['roles', 'permissions']
  }, DB_TIMEOUTS.SHORT));

  return user;
}

/**
 * 统计查询（可能较慢）
 */
async function getUserStatistics() {
  const stats = await User.findOne(withTimeout({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('SUM', sequelize.case({
        when: { status: 'active' },
        then: 1
      })), 'active'],
      [sequelize.fn('SUM', sequelize.case({
        when: { status: 'inactive' },
        then: 1
      })), 'inactive']
    ]
  }, DB_TIMEOUTS.LONG));

  return stats;
}

/**
 * 复杂关联查询
 */
async function getUserWithClasses(id: number) {
  const user = await User.findByPk(id, withTimeout({
    include: [
      {
        model: Class,
        include: [Student, Teacher]
      }
    ]
  }, DB_TIMEOUTS.LONG));

  return user;
}

/**
 * 批量创建
 */
async function bulkCreateUsers(users: any[]) {
  const result = await User.bulkCreate(users, withTimeout({
    validate: true,
    individualHooks: true
  }, DB_TIMEOUTS.BULK));

  return result;
}

/**
 * 使用监控包装
 */
async function getUserWithMonitoring(id: number) {
  const query = User.findByPk(id, {
    include: ['roles']
  });

  return executeWithMonitoring(
    query,
    `getUserWithMonitoring(${id})`
  );
}
```

### 步骤 5: 在控制器中使用

```typescript
import { withTimeout, DB_TIMEOUTS } from '../../utils/database-timeout';

export async function getUserList(req: Request, res: Response) {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    // 添加超时设置
    const { count, rows } = await User.findAndCountAll(withTimeout({
      where: { status: 'active' },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    }, DB_TIMEOUTS.MEDIUM));

    res.json({
      success: true,
      data: {
        total: count,
        list: rows,
        page,
        pageSize
      }
    });
  } catch (error: any) {
    if (error.message.includes('超时')) {
      return res.status(408).json({
        success: false,
        error: {
          message: '查询超时，请稍后重试',
          code: 'QUERY_TIMEOUT'
        }
      });
    }
    throw error;
  }
}
```

### 步骤 6: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# 数据库超时配置
# ================================

# 全局查询超时（毫秒）
# 0表示使用默认值
DB_QUERY_TIMEOUT=0

# 连接超时（毫秒）
DB_CONNECTION_TIMEOUT=10000
```

### 步骤 7: 数据库连接池配置

在 `server/src/config/database-unified.ts` 中：

```typescript
export const databaseConfig = {
  // 连接池配置
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10), // 获取连接超时
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)      // 空闲连接超时
  },

  // 语句超时
  dialectOptions: {
    // MySQL超时设置
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10)
  },

  // 重试配置
  retry: {
    max: 3, // 最大重试次数
    match: [ // 需要重试的错误类型
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
};
```

## 本地调试保证

### 开发环境宽松超时

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const DB_TIMEOUTS = {
  SHORT: isDevelopment ? 30000 : 5000,   // 开发: 30秒
  MEDIUM: isDevelopment ? 60000 : 10000, // 开发: 60秒
  LONG: isDevelopment ? 120000 : 30000   // 开发: 120秒
};
```

- ✅ 开发环境超时更长，便于调试
- ✅ 生产环境严格限制，防止资源耗尽
- ✅ 不影响开发时的断点调试

### 可配置超时

```bash
# 开发环境可以设置更长的超时
DB_QUERY_TIMEOUT=120000
```

## 验证步骤

### 1. 测试超时功能

```typescript
// 创建一个会超时的查询
async function testTimeout() {
  try {
    // 设置1秒超时
    await User.findAll({
      timeout: 1000,
      // 使用sleep模拟慢查询
      where: sequelize.literal('SLEEP(10)')
    });
  } catch (error: any) {
    console.log('超时错误:', error.message);
    // 应该抛出超时错误
  }
}
```

### 2. 测试慢查询日志

```typescript
// 执行一个慢查询
await User.findAll({
  where: sequelize.literal('SLEEP(5)')
});

// 应该在控制台看到慢查询警告
// 🐌 慢查询检测: User.findAll (5000ms)
```

### 3. 测试开发环境

```bash
# 设置开发环境
export NODE_ENV=development

# 启动服务器
cd server && npm run dev

# 查询应该有更长的超时时间
```

### 4. 测试生产环境

```bash
# 设置生产环境
export NODE_ENV=production

# 启动服务器
cd server && npm run dev

# 查询应该有较短的超时时间
```

### 5. 测试错误处理

```bash
# 测试超时错误响应
curl http://localhost:3000/api/users

# 如果超时，应该返回：
# {"success":false,"error":{"message":"查询超时，请稍后重试","code":"QUERY_TIMEOUT"}}
```

## 回滚方案

如果超时导致问题：

1. **调整超时值**：
   ```bash
   export DB_QUERY_TIMEOUT=300000
   ```

2. **禁用特定查询的超时**：
   ```typescript
   await User.findAll({
     // 不设置timeout
   });
   ```

3. **仅对生产环境启用**：
   ```typescript
   const timeout = process.env.NODE_ENV === 'production' ? DB_TIMEOUTS.MEDIUM : undefined;
   await User.findAll(timeout ? { timeout } : {});
   ```

## 修复完成检查清单

- [ ] 数据库超时配置已创建
- [ ] 超时工具函数已创建
- [ ] 服务层已添加超时设置
- [ ] 控制器已更新错误处理
- [ ] 环境变量已配置
- [ ] 连接池已优化
- [ ] 慢查询日志已实现
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试不受影响

## 风险评估

- **风险级别**: 低
- **影响范围**: 所有数据库查询
- **回滚难度**: 低（调整超时值或移除）
- **本地调试影响**: 无（开发环境宽松超时）

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
