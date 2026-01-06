/**
 * 数据库连接池配置
 * 用于优化数据库连接管理，提高性能和资源利用率
 */

import { Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const MAX_POOL_SIZE = process.env.DB_MAX_POOL_SIZE 
  ? parseInt(process.env.DB_MAX_POOL_SIZE) 
  : (NODE_ENV === 'production' ? 25 : 10);
const MIN_POOL_SIZE = process.env.DB_MIN_POOL_SIZE 
  ? parseInt(process.env.DB_MIN_POOL_SIZE) 
  : (NODE_ENV === 'production' ? 5 : 2);
const IDLE_TIMEOUT = process.env.DB_IDLE_TIMEOUT 
  ? parseInt(process.env.DB_IDLE_TIMEOUT) 
  : 30000; // 默认30秒

/**
 * 根据当前环境获取连接池配置
 */
export function getConnectionPoolConfig(): Options {
  const baseConfig: Options = {
    pool: {
      max: MAX_POOL_SIZE, // 连接池最大连接数
      min: MIN_POOL_SIZE, // 连接池最小连接数
      idle: IDLE_TIMEOUT, // 连接在释放前可以空闲的最长时间（毫秒）
      acquire: 60000,     // 连接池在抛出错误之前尝试获取连接的最长时间（毫秒）
      evict: 30000,       // 运行清理闲置连接的频率（毫秒）
    },
    retry: {
      max: 3,             // 数据库操作失败时的最大重试次数
      match: [            // 可以重试的错误类型
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/
      ]
    }
  };

  // 根据环境调整配置
  switch (NODE_ENV) {
    case 'production':
      return {
        ...baseConfig,
        logging: false, // 生产环境禁用SQL日志
        pool: {
          ...baseConfig.pool,
          // 生产环境可能需要更多连接
          max: MAX_POOL_SIZE,
          min: MIN_POOL_SIZE,
          // 更积极的连接健康检查
          idle: 20000,
          acquire: 30000,
          evict: 15000
        }
      };
    case 'testing':
      return {
        ...baseConfig,
        logging: false, // 测试环境禁用SQL日志
        pool: {
          ...baseConfig.pool,
          // 测试环境可以使用较小的连接池
          max: 5,
          min: 1,
          idle: 10000
        }
      };
    case 'development':
    default:
      return {
        ...baseConfig,
        logging: console.log, // 开发环境启用SQL日志
        pool: {
          ...baseConfig.pool,
          // 开发环境使用默认设置
        }
      };
  }
}

/**
 * 监控连接池的使用情况
 * @param pool Sequelize连接池
 * @returns 连接池状态信息
 */
export function getConnectionPoolStats(pool: any): {
  total: number;
  idle: number;
  used: number;
  waiting: number;
} {
  if (!pool || !pool.pool) {
    return { total: 0, idle: 0, used: 0, waiting: 0 };
  }

  const { size, available, pending } = pool.pool;
  return {
    total: size,           // 总连接数
    idle: available,       // 空闲连接数
    used: size - available, // 使用中的连接数
    waiting: pending       // 等待连接的请求数
  };
}

/**
 * 获取连接池健康状态
 * @param stats 连接池统计信息
 * @returns 健康状态和建议
 */
export function getConnectionPoolHealth(stats: {
  total: number;
  idle: number;
  used: number;
  waiting: number;
}): {
  status: 'healthy' | 'warning' | 'critical';
  utilization: number;
  recommendations: string[];
} {
  const { total, idle, used, waiting } = stats;
  const utilization = total > 0 ? used / total : 0;
  const recommendations: string[] = [];

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  // 检查利用率
  if (utilization > 0.9) {
    status = 'critical';
    recommendations.push('连接池利用率过高(>90%)，考虑增加最大连接数或优化查询释放连接');
  } else if (utilization > 0.7) {
    status = 'warning';
    recommendations.push('连接池利用率较高(>70%)，监控应用性能');
  }

  // 检查等待连接数
  if (waiting > 5) {
    status = 'critical';
    recommendations.push(`${waiting}个请求正在等待连接，考虑增加连接池大小或优化查询执行时间`);
  } else if (waiting > 0) {
    if (status !== 'critical') status = 'warning';
    recommendations.push(`${waiting}个请求正在等待连接，可能需要优化连接池设置`);
  }

  // 检查空闲连接
  if (idle > total * 0.5 && total > 10) {
    recommendations.push('过多空闲连接，考虑减少最小连接数以节省资源');
  }

  return {
    status,
    utilization,
    recommendations
  };
} 