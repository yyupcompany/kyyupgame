import { Sequelize, Dialect } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * 数据库配置接口
 */
interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: Dialect;
  timezone: string;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean;
}

// 🔧 修复：从init.ts导入sequelize实例，而不是创建新的实例
// 这确保整个应用使用同一个sequelize实例
let sequelizeInstance: Sequelize | null = null;

/**
 * 设置Sequelize实例（由init.ts调用）
 * @param instance Sequelize实例
 */
export const setSequelizeInstance = (instance: Sequelize): void => {
  console.log('🔧 [setSequelizeInstance] 设置sequelize实例');
  sequelizeInstance = instance;
};

/**
 * 创建并返回一个新的Sequelize实例.
 * 这个函数现在只负责创建和认证连接.
 * @returns {Promise<Sequelize>} 返回一个已认证的Sequelize实例.
 */
export const initDatabase = async (): Promise<Sequelize> => {
  const { getDatabaseConfig } = await import('./database-unified');
  const dbConfig = getDatabaseConfig() as DbConfig;

  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      timezone: dbConfig.timezone,
      logging: dbConfig.logging ? console.log : false,
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
      dialectOptions: {
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
      },
      pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
      },
    }
  );

  try {
    await sequelize.authenticate();
    console.log('数据库连接验证成功.');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw new Error('数据库连接失败');
  }

  sequelizeInstance = sequelize;
  return sequelize;
};

/**
 * 获取Sequelize实例
 * 如果尚未初始化，则会抛出错误
 * @returns {Sequelize} 返回Sequelize实例
 */
export const getSequelize = (): Sequelize => {
  console.log('🔍 [getSequelize] 被调用');
  console.log('🔍 [getSequelize] sequelize实例状态:', sequelizeInstance ? '已初始化' : '未初始化');

  if (!sequelizeInstance) {
    console.error('❌ [getSequelize] sequelize为空');
    // 🔧 修复：尝试从init.ts导入sequelize
    try {
      const { sequelize: initSequelize } = require('../init');
      if (initSequelize) {
        console.log('✅ [getSequelize] 从init.ts获取到sequelize实例');
        sequelizeInstance = initSequelize;
        return sequelizeInstance;
      }
    } catch (error) {
      console.error('❌ [getSequelize] 从init.ts获取sequelize失败:', error);
    }
    
    throw new Error('数据库尚未初始化，请先调用 initDatabase。');
  }

  console.log('✅ [getSequelize] 返回sequelize实例');
  return sequelizeInstance;
};

/**
 * 关闭数据库连接
 * @returns {Promise<void>}
 */
export const closeDatabase = async (): Promise<void> => {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    console.log('数据库连接已关闭.');
  }
};

/**
 * 记录数据库操作日志
 * @param {string} operation - 操作名称
 * @param {boolean} result - 操作结果
 * @param {string} [message] - 附加信息
 */
export function logDbOperation(operation: string, result: boolean, message?: string) {
  const logDir = path.join(__dirname, '../../logs');
  
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'database.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${operation}: ${result ? 'SUCCESS' : 'FAILED'} ${message || ''}\n`;
  
  fs.appendFileSync(logFile, logMessage);
}

// 导出实例，但不作为默认导出
// 🔧 修复：导出sequelizeInstance而不是undefined的sequelize
export { sequelizeInstance as sequelize }; 

