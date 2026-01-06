/**
 * 统一数据库配置文件
 * 所有数据库连接都应该从这里获取配置
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { DATABASE_TIMEOUTS } from './database-timeout.config';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 数据库配置接口
export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  dialect: 'mysql' | 'sqlite';
  storage?: string;
  timezone?: string;
  define: {
    charset?: string;
    collate?: string;
    timestamps: boolean;
    underscored: boolean;
    freezeTableName: boolean;
  };
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
    evict?: number;
  };
  dialectOptions?: {
    connectTimeout?: number;
    acquireTimeout?: number;
    timeout?: number;
    dateStrings?: boolean;
    typeCast?: boolean;
  };
  logging?: boolean | ((msg: string) => void);
}

// 获取统一的数据库配置
export function getDatabaseConfig(): any {
  // 🔥 优先检查是否强制使用远程MySQL数据库（即使在测试环境）
  const forceRemoteMySQL = process.env.DISABLE_SQLITE === 'true' || process.env.USE_REMOTE_DB === 'true';

  if (forceRemoteMySQL) {
    console.log('🚫 SQLite已被禁用，强制使用远程MySQL数据库');
  } else if (process.env.NODE_ENV === 'test') {
    // 只有在没有强制使用MySQL时，测试环境才使用SQLite
    console.log('🧪 测试环境：使用SQLite内存数据库');
    return {
      dialect: 'sqlite' as const,
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
      pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };
  }

  // 验证必需的MySQL连接参数
  const requiredParams = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingParams = requiredParams.filter(param => !process.env[param]);

  if (missingParams.length > 0) {
    throw new Error(`缺少必需的数据库连接参数: ${missingParams.join(', ')}`);
  }

  // 打印调试信息
  console.log('=== 数据库配置调试信息 ===');
  console.log('✅ 强制使用远程MySQL数据库');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_TYPE:', process.env.DB_TYPE);
  console.log('USE_REMOTE_DB:', process.env.USE_REMOTE_DB);
  console.log('DISABLE_SQLITE:', process.env.DISABLE_SQLITE);
  console.log('========================');

  // 强制使用远程MySQL数据库配置
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'mysql' as const,
    timezone: '+08:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      // 连接超时设置
      connectTimeout: DATABASE_TIMEOUTS.connectionTimeout,
      // 查询超时设置
      timeout: DATABASE_TIMEOUTS.queryTimeout
    },
    pool: {
      max: 20,
      min: 5,
      acquire: DATABASE_TIMEOUTS.acquireTimeout,
      idle: 3000,
      evict: 15000
    },
    // 全局查询超时（Sequelize级别）
    benchmark: true,
    // 慢查询日志
    logging: process.env.NODE_ENV !== 'production' ?
      (sql: string, timing?: number) => {
        if (timing && timing > DATABASE_TIMEOUTS.slowQueryThreshold) {
          console.warn(`⚠️ 慢查询检测 (${timing}ms):`, sql.substring(0, 200));
        }
      } : false
  };

  // 验证配置完整性
  if (config.dialect !== 'mysql') {
    throw new Error('数据库配置错误：必须使用MySQL数据库');
  }

  console.log('✅ MySQL数据库配置验证通过');
  return config;
}

// 导出默认配置
export const dbConfig = getDatabaseConfig();

// 兼容性导出
export default dbConfig; 