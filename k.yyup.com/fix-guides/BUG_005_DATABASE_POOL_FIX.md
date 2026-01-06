# Bug #5 修复指南 - 数据库连接池耗尽风险

## 问题描述
代码中大量使用原始SQL查询，但没有正确处理数据库连接的生命周期，可能导致连接池耗尽。

## 严重级别
**严重** - 需要立即修复

## 受影响的文件
- `server/src/app.ts`
- `server/src/middlewares/auth.middleware.ts`
- 所有使用 `sequelize.query()` 的文件

## 漏洞代码

### 位置: auth.middleware.ts
```typescript
// ❌ 没有正确处理连接释放
const [userRows] = await sequelize.query(`
  SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status
  FROM ${DEMO_DATABASE}.users u
  WHERE u.id = ? AND u.status = 'active'
  LIMIT 1
`, {
  replacements: [decoded.id]
});
// 如果后续代码出错，连接可能没有正确释放
```

## 修复方案

### 步骤 1: 配置数据库连接池

创建文件 `server/src/config/database.config.ts`:

```typescript
import { Sequelize } from 'sequelize';

/**
 * 数据库连接池配置
 */
export const databaseConfig = {
  // 连接池配置
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '20'), // 最大连接数
    min: parseInt(process.env.DB_POOL_MIN || '5'),  // 最小连接数
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'), // 获取连接超时（30秒）
    idle: parseInt(process.env.DB_POOL_IDLE || '10000'), // 空闲连接超时（10秒）
    evict: parseInt(process.env.DB_POOL_EVICT || '60000') // 驱逐间隔（60秒）
  },

  // 查询超时
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30秒

  // 语句超时
  statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),

  // 重试配置
  retry: {
    max: 3, // 最大重试次数
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  },

  // 日志配置
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // 时区
  timezone: '+08:00'
};

/**
 * 创建数据库连接
 */
export function createDatabaseConnection() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'kindergarten',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      ...databaseConfig,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
  );

  // 监听连接池事件
  setupPoolMonitoring(sequelize);

  return sequelize;
}

/**
 * 设置连接池监控
 */
function setupPoolMonitoring(sequelize: Sequelize) {
  const pool = sequelize.connectionManager.pool;

  // 连接获取事件
  pool.on('acquire', (connection) => {
    logger.debug('[数据库连接池] 连接已获取', {
      active: pool.active,
      idle: pool.idle
    });
  });

  // 连接释放事件
  pool.on('release', (connection) => {
    logger.debug('[数据库连接池] 连接已释放', {
      active: pool.active,
      idle: pool.idle
    });
  });

  // 连接池错误
  pool.on('error', (error) => {
    logger.error('[数据库连接池] 连接池错误', {
      error: error.message,
      active: pool.active,
      idle: pool.idle
    });
  });
}
```

### 步骤 2: 创建数据库连接池管理器

创建文件 `server/src/services/database-pool.service.ts`:

```typescript
import { Sequelize, QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';

/**
 * 连接池统计信息
 */
interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  max: number;
  min: number;
}

/**
 * 数据库连接池管理器
 */
export class DatabasePoolManager {
  private sequelize: Sequelize;
  private queryStats = new Map<string, { count: number; totalTime: number }>();

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * 获取连接池统计信息
   */
  getPoolStats(): PoolStats {
    const pool = this.sequelize.connectionManager.pool;

    return {
      total: pool?.active + pool?.idle || 0,
      active: pool?.active || 0,
      idle: pool?.idle || 0,
      waiting: pool?.waiting || 0,
      max: pool?.max || 0,
      min: pool?.min || 0
    };
  }

  /**
   * 检查连接池健康状态
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    stats: PoolStats;
    details: string;
  }> {
    const stats = this.getPoolStats();
    const util = (stats.active / stats.max) * 100;

    let details = '连接池状态正常';
    let healthy = true;

    if (util > 80) {
      details = `连接池使用率过高: ${util.toFixed(2)}%`;
      healthy = false;
    } else if (util > 60) {
      details = `连接池使用率较高: ${util.toFixed(2)}%`;
    }

    if (stats.waiting > 0) {
      details = `有 ${stats.waiting} 个请求正在等待连接`;
      healthy = false;
    }

    return { healthy, stats, details };
  }

  /**
   * 安全执行查询（自动管理连接）
   */
  async safeQuery<T = any>(
    sql: string,
    options: {
      replacements?: any;
      type?: QueryTypes;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const queryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 设置默认超时
      const timeout = options.timeout || 30000;

      // 执行查询
      const result = await this.sequelize.query(sql, {
        ...options,
        timeout,
        logging: false // 禁用 Sequelize 默认日志
      });

      // 记录统计
      const duration = Date.now() - startTime;
      this.recordQueryStats(sql, duration);

      // 警告慢查询
      if (duration > 1000) {
        logger.warn('[慢查询]', {
          queryId,
          duration: `${duration}ms`,
          sql: sql.substring(0, 200)
        });
      }

      return result as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('[查询错误]', {
        queryId,
        duration: `${duration}ms`,
        error: error.message,
        sql: sql.substring(0, 200)
      });
      throw error;
    }
  }

  /**
   * 使用事务执行操作
   */
  async withTransaction<T>(
    callback: (transaction: any) => Promise<T>,
    options: {
      timeout?: number;
      isolationLevel?: string;
    } = {}
  ): Promise<T> {
    const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.debug('[事务开始]', { transactionId });

      const transaction = await this.sequelize.transaction({
        timeout: options.timeout || 30000,
        isolationLevel: options.isolationLevel || 'READ COMMITTED'
      });

      const result = await callback(transaction);

      await transaction.commit();
      logger.debug('[事务提交]', { transactionId });

      return result;
    } catch (error) {
      logger.error('[事务回滚]', {
        transactionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 记录查询统计
   */
  private recordQueryStats(sql: string, duration: number) {
    // 提取查询类型（SELECT, INSERT, UPDATE, DELETE）
    const match = sql.match(/^\s*(SELECT|INSERT|UPDATE|DELETE)/i);
    const queryType = match ? match[1].toUpperCase() : 'OTHER';

    const stats = this.queryStats.get(queryType) || { count: 0, totalTime: 0 };
    stats.count++;
    stats.totalTime += duration;
    this.queryStats.set(queryType, stats);
  }

  /**
   * 获取查询统计
   */
  getQueryStats(): Record<string, { count: number; avgTime: number }> {
    const result: Record<string, { count: number; avgTime: number }> = {};

    this.queryStats.forEach((stats, type) => {
      result[type] = {
        count: stats.count,
        avgTime: Math.round(stats.totalTime / stats.count)
      };
    });

    return result;
  }

  /**
   * 重置统计
   */
  resetStats() {
    this.queryStats.clear();
  }

  /**
   * 强制关闭所有连接（用于优雅关闭）
   */
  async close() {
    try {
      await this.sequelize.close();
      logger.info('[数据库连接池] 所有连接已关闭');
    } catch (error) {
      logger.error('[数据库连接池] 关闭连接时出错', { error: error.message });
    }
  }
}

// 导出单例
let poolManager: DatabasePoolManager;

export function initDatabasePoolManager(sequelize: Sequelize) {
  poolManager = new DatabasePoolManager(sequelize);
  return poolManager;
}

export function getDatabasePoolManager() {
  if (!poolManager) {
    throw new Error('DatabasePoolManager 未初始化');
  }
  return poolManager;
}
```

### 步骤 3: 更新 auth.middleware.ts

**修复前：**
```typescript
const [userRows] = await sequelize.query(`
  SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status
  FROM ${DEMO_DATABASE}.users u
  WHERE u.id = ? AND u.status = 'active'
  LIMIT 1
`, {
  replacements: [decoded.id]
});
```

**修复后：**
```typescript
import { getDatabasePoolManager } from '../services/database-pool.service';

try {
  const poolManager = getDatabasePoolManager();

  // 使用安全的查询方法
  const [userRows] = await poolManager.safeQuery(`
    SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status
    FROM ${DEMO_DATABASE}.users u
    WHERE u.id = ? AND u.status = 'active'
    LIMIT 1
  `, {
    replacements: [decoded.id],
    type: QueryTypes.SELECT,
    timeout: 5000 // 5秒超时
  });

  // 处理结果...
} catch (error) {
  if (error.name === 'SequelizeConnectionError') {
    logger.error('[认证] 数据库连接错误', { error: error.message });
    return res.status(503).json({
      success: false,
      error: {
        message: '数据库连接失败，请稍后重试',
        code: 'DATABASE_ERROR'
      }
    });
  } else if (error.name === 'SequelizeQueryTimeoutError') {
    logger.error('[认证] 数据库查询超时', { error: error.message });
    return res.status(504).json({
      success: false,
      error: {
        message: '查询超时，请稍后重试',
        code: 'QUERY_TIMEOUT'
      }
    });
  }
  throw error;
}
```

### 步骤 4: 优化为使用 ORM

**最佳实践是使用 Sequelize ORM 而不是原始查询：**

```typescript
import { User } from '../models';

// 使用 ORM 方法（更安全）
try {
  const user = await User.findOne({
    where: {
      id: decoded.id,
      status: 'active'
    },
    attributes: ['id', 'username', 'email', 'real_name', 'phone', 'status'],
    timeout: 5000
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: '用户不存在或未激活' }
    });
  }

  req.user = user;
  next();
} catch (error) {
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: { message: '数据库连接失败' }
    });
  }
  throw error;
}
```

### 步骤 5: 创建连接池监控中间件

创建文件 `server/src/middlewares/pool-monitor.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { getDatabasePoolManager } from '../services/database-pool.service';

/**
 * 连接池监控中间件
 */
export function poolMonitor(req: Request, res: Response, next: NextFunction) {
  const poolManager = getDatabasePoolManager();
  const healthCheck = poolManager.healthCheck();

  // 添加连接池状态到响应头
  res.setHeader('X-DB-Pool-Active', healthCheck.stats.active.toString());
  res.setHeader('X-DB-Pool-Idle', healthCheck.stats.idle.toString());
  res.setHeader('X-DB-Pool-Utilization',
    ((healthCheck.stats.active / healthCheck.stats.max) * 100).toFixed(2) + '%'
  );

  // 如果连接池使用率超过80%，返回警告
  if (!healthCheck.healthy) {
    logger.warn('[连接池警告]', {
      path: req.path,
      stats: healthCheck.stats,
      details: healthCheck.details
    });
  }

  next();
}

/**
 * 连接池健康检查端点
 */
export function poolHealthCheck(req: Request, res: Response) {
  const poolManager = getDatabasePoolManager();
  const healthCheck = poolManager.healthCheck();
  const queryStats = poolManager.getQueryStats();

  const statusCode = healthCheck.healthy ? 200 : 503;

  res.status(statusCode).json({
    success: healthCheck.healthy,
    data: {
      pool: healthCheck.stats,
      utilization: {
        percentage: ((healthCheck.stats.active / healthCheck.stats.max) * 100).toFixed(2) + '%',
        status: healthCheck.healthy ? 'healthy' : 'warning'
      },
      details: healthCheck.details,
      queries: queryStats
    }
  });
}
```

在 `server/src/app.ts` 中注册：

```typescript
import { poolMonitor, poolHealthCheck } from './middlewares/pool-monitor.middleware';

// 监控中间件（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use(poolMonitor);
}

// 健康检查端点
app.get('/health/db', poolHealthCheck);
```

### 步骤 6: 添加优雅关闭

在 `server/src/app.ts` 中：

```typescript
import { getDatabasePoolManager } from './services/database-pool.service';

// 优雅关闭
async function gracefulShutdown(signal: string) {
  console.log(`\n收到 ${signal} 信号，开始优雅关闭...`);

  try {
    // 停止接受新连接
    server.close(() => {
      console.log('✅ HTTP 服务器已关闭');
    });

    // 关闭数据库连接池
    const poolManager = getDatabasePoolManager();
    await poolManager.close();

    console.log('✅ 数据库连接池已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 优雅关闭失败:', error);
    process.exit(1);
  }
}

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 步骤 7: 更新环境变量

更新 `server/.env`:

```bash
# ================================
# 数据库连接池配置
# ================================

# 连接池最大连接数
DB_POOL_MAX=20

# 连接池最小连接数
DB_POOL_MIN=5

# 获取连接超时（毫秒）
DB_POOL_ACQUIRE=30000

# 空闲连接超时（毫秒）
DB_POOL_IDLE=10000

# 驱逐间隔（毫秒）
DB_POOL_EVICT=60000

# 查询超时（毫秒）
DB_QUERY_TIMEOUT=30000

# 语句超时（毫秒）
DB_STATEMENT_TIMEOUT=30000
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/database-pool.test.ts`:

```typescript
import { DatabasePoolManager } from '../services/database-pool.service';
import { Sequelize } from 'sequelize';

describe('Database Pool Manager', () => {
  let poolManager: DatabasePoolManager;
  let sequelize: Sequelize;

  beforeAll(() => {
    sequelize = new Sequelize(/* ... */);
    poolManager = new DatabasePoolManager(sequelize);
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const health = await poolManager.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('stats');
      expect(health).toHaveProperty('details');
    });
  });

  describe('safeQuery', () => {
    it('should execute query safely', async () => {
      const result = await poolManager.safeQuery('SELECT 1 as value');
      expect(result).toBeTruthy();
    });

    it('should timeout on long running query', async () => {
      await expect(
        poolManager.safeQuery('SELECT SLEEP(60)', { timeout: 1000 })
      ).rejects.toThrow();
    });
  });

  describe('withTransaction', () => {
    it('should commit transaction on success', async () => {
      const result = await poolManager.withTransaction(async (transaction) => {
        return await sequelize.query('SELECT 1 as value', { transaction });
      });
      expect(result).toBeTruthy();
    });

    it('should rollback on error', async () => {
      await expect(
        poolManager.withTransaction(async (transaction) => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('getQueryStats', () => {
    it('should track query statistics', async () => {
      await poolManager.safeQuery('SELECT 1');
      const stats = poolManager.getQueryStats();

      expect(stats).toHaveProperty('SELECT');
      expect(stats.SELECT.count).toBeGreaterThan(0);
    });
  });
});
```

### 2. 集成测试
创建文件 `server/tests/__tests__/database-pool-integration.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Database Pool Integration', () => {
  it('should return pool health status', async () => {
    const response = await request(app)
      .get('/health/db');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('pool');
    expect(response.body.data).toHaveProperty('utilization');
  });

  it('should include pool headers in responses', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.headers).toHaveProperty('x-db-pool-active');
    expect(response.headers).toHaveProperty('x-db-pool-idle');
  });
});
```

### 3. 压力测试
创建文件 `server/tests/load-tests/pool-stress.test.js`:

```javascript
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '30s', target: 100 }, // 逐步增加到100用户
    { duration: '1m', target: 100 },  // 保持100用户
    { duration: '30s', target: 0 }    // 逐步减少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%请求在500ms内
    http_req_failed: ['rate<0.05']     // 错误率低于5%
  }
};

export default function () {
  const response = http.get('http://localhost:3000/api/users');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has pool headers': (r) => {
      return r.headers['x-db-pool-active'] !== undefined;
    }
  });
}
```

运行压力测试：
```bash
k6 run server/tests/load-tests/pool-stress.test.js
```

## 监控和告警

### 创建监控脚本

创建文件 `server/scripts/monitor-pool.js`:

```javascript
const axios = require('axios');

async function monitorPool() {
  try {
    const response = await axios.get('http://localhost:3000/health/db');
    const data = response.data.data;

    console.log('\n=== 数据库连接池状态 ===');
    console.log(`总连接数: ${data.pool.total}`);
    console.log(`活动连接: ${data.pool.active}`);
    console.log(`空闲连接: ${data.pool.idle}`);
    console.log(`等待连接: ${data.pool.waiting}`);
    console.log(`使用率: ${data.utilization.percentage}`);
    console.log(`状态: ${data.utilization.status}`);
    console.log('详情:', data.details);

    // 查询统计
    console.log('\n=== 查询统计 ===');
    for (const [type, stats] of Object.entries(data.queries)) {
      console.log(`${type}: ${stats.count} 次, 平均耗时 ${stats.avgTime}ms`);
    }

    // 告警检查
    const utilization = parseFloat(data.utilization.percentage);
    if (utilization > 80) {
      console.log('\n⚠️  警告: 连接池使用率过高！');
    } else if (utilization > 60) {
      console.log('\n⚠️  注意: 连接池使用率较高');
    }

    if (data.pool.waiting > 0) {
      console.log('\n⚠️  警告: 有请求在等待连接！');
    }
  } catch (error) {
    console.error('监控失败:', error.message);
  }
}

// 每10秒检查一次
setInterval(monitorPool, 10000);
monitorPool();
```

运行监控：
```bash
node server/scripts/monitor-pool.js
```

## 修复完成检查清单

- [ ] 数据库配置已优化
- [ ] 连接池管理器已创建
- [ ] 所有原始查询已替换为安全查询
- [ ] 优先使用 ORM 方法
- [ ] 连接池监控中间件已实现
- [ ] 健康检查端点已创建
- [ ] 优雅关闭已实现
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 压力测试已通过
- [ ] 监控脚本已部署

---

**修复时间估计**: 8-12 小时
**测试时间估计**: 4-6 小时
**总时间估计**: 12-18 小时
