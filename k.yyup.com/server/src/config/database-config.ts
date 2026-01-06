/**
 * 数据库连接配置文件
 * 提供数据库连接信息和配置选项
 */

import { getDatabaseConfig } from './database-unified';

// 获取基础配置
const baseConfig = getDatabaseConfig();

// 数据库连接配置
export const dbConnectionConfig = {
  // 开发环境配置
  development: {
    ...baseConfig,
    database: baseConfig.database,
    logging: true
  },
  
  // 测试环境配置
  test: {
    ...baseConfig,
    database: baseConfig.database + '_test',
    logging: false
  },
  
  // 生产环境配置
  production: {
    ...baseConfig,
    logging: false
  }
};

// 连接池配置
export const poolConfig = {
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
  min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 2,
  acquire: 30000,
  idle: 10000,
  evict: 10000
};

// 查询优化配置
export const queryOptimizationConfig = {
  useQueryCache: true,
  logSlowQueries: true,
  slowQueryThreshold: 1000, // ms
  prepareStatements: true
};

// 监控配置
export const monitoringConfig = {
  monitorPool: true,
  monitorQueries: true,
  alertSlowQueries: true
};

// 获取当前环境配置
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return dbConnectionConfig[env as keyof typeof dbConnectionConfig];
}; 