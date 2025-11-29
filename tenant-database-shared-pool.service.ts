/**
 * 改进的租户数据库服务 - 使用共享连接池
 * 所有租户共享一个连接池，通过完整表名访问不同数据库
 */

import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

export class TenantDatabaseSharedPoolService {
  private globalConnection: Sequelize | null = null;

  /**
   * 初始化全局连接（单例）
   */
  async initializeGlobalConnection(): Promise<Sequelize> {
    if (this.globalConnection) {
      return this.globalConnection;
    }

    const maxPoolSize = parseInt(process.env.DB_POOL_MAX || '30');
    const minPoolSize = parseInt(process.env.DB_POOL_MIN || '5');

    this.globalConnection = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'mysql', // 连接到MySQL系统数据库
      dialect: 'mysql',
      timezone: '+08:00',
      pool: {
        max: maxPoolSize,        // 全局最大连接数（默认30）
        min: minPoolSize,        // 全局最少连接数（默认5）
        acquire: 30000,          // 获取连接超时30秒
        idle: 10000              // 空闲连接超时10秒
      },
      logging: (msg: string) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`[数据库] ${msg}`);
        }
      }
    });

    try {
      await this.globalConnection.authenticate();
      logger.info('全局数据库连接成功', {
        host: process.env.DB_HOST,
        poolSize: `${minPoolSize}-${maxPoolSize}`,
        port: process.env.DB_PORT || 3306
      });
      return this.globalConnection;
    } catch (error) {
      logger.error('全局数据库连接失败', error);
      throw error;
    }
  }

  /**
   * 获取全局连接
   */
  getGlobalConnection(): Sequelize {
    if (!this.globalConnection) {
      throw new Error('全局数据库连接未初始化');
    }
    return this.globalConnection;
  }

  /**
   * 查询租户数据库（使用完整表名）
   */
  async queryTenantDatabase(
    tenantCode: string,
    sql: string,
    options?: any
  ): Promise<any> {
    const connection = this.getGlobalConnection();
    
    // 替换表名为完整的数据库.表名格式
    const modifiedSql = this.prependTenantDatabase(sql, tenantCode);
    
    try {
      const result = await connection.query(modifiedSql, options);
      return result;
    } catch (error) {
      logger.error('租户数据库查询失败', {
        tenantCode,
        sql: modifiedSql,
        error
      });
      throw error;
    }
  }

  /**
   * 为SQL语句中的表名添加数据库前缀
   * 例如: SELECT * FROM users → SELECT * FROM tenant_k001.users
   */
  private prependTenantDatabase(sql: string, tenantCode: string): string {
    const databaseName = `tenant_${tenantCode}`;
    
    // 简单的正则替换（生产环境需要更复杂的SQL解析）
    // 这里只处理常见的表名
    const tableNames = [
      'users', 'roles', 'permissions', 'user_roles',
      'classes', 'students', 'teachers', 'parents',
      'announcements', 'activities', 'enrollments'
    ];

    let modifiedSql = sql;
    for (const tableName of tableNames) {
      // 匹配 FROM/JOIN/INTO 后面的表名
      const regex = new RegExp(
        `(FROM|JOIN|INTO|UPDATE|DELETE FROM)\\s+${tableName}\\b`,
        'gi'
      );
      modifiedSql = modifiedSql.replace(
        regex,
        `$1 ${databaseName}.${tableName}`
      );
    }

    return modifiedSql;
  }

  /**
   * 获取连接池统计信息
   */
  async getPoolStats(): Promise<any> {
    const connection = this.getGlobalConnection();
    
    return {
      poolSize: {
        max: connection.options.pool?.max || 10,
        min: connection.options.pool?.min || 2
      },
      activeConnections: connection.connectionManager.pool?.size || 0,
      idleConnections: connection.connectionManager.pool?.idle?.length || 0
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const connection = this.getGlobalConnection();
      await connection.authenticate();
      logger.info('数据库连接池健康检查通过');
      return true;
    } catch (error) {
      logger.error('数据库连接池健康检查失败', error);
      return false;
    }
  }

  /**
   * 关闭全局连接
   */
  async closeGlobalConnection(): Promise<void> {
    if (this.globalConnection) {
      try {
        await this.globalConnection.close();
        this.globalConnection = null;
        logger.info('全局数据库连接已关闭');
      } catch (error) {
        logger.error('关闭全局数据库连接失败', error);
      }
    }
  }
}

// 创建单例实例
export const tenantDatabaseSharedPoolService = new TenantDatabaseSharedPoolService();

export default tenantDatabaseSharedPoolService;

