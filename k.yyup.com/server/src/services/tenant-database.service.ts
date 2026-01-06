/**
 * 租户数据库服务 - 共享连接池版本
 * 所有租户共享一个数据库连接池，通过完整表名访问不同租户的数据库
 *
 * 架构说明：
 * - 单一MySQL实例，包含多个租户数据库（tenant_k001, tenant_k002, ...）
 * - 所有租户共享一个连接池（默认30个连接）
 * - 通过完整表名访问：SELECT * FROM tenant_k001.users
 */

import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

/**
 * 连接池统计信息
 */
interface PoolStats {
  poolSize: {
    max: number;
    min: number;
  };
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
}

/**
 * 租户数据库服务类 - 共享连接池版本
 */
export class TenantDatabaseService {
  private globalConnection: Sequelize | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<Sequelize> | null = null;

  // 连接池配置
  private readonly poolConfig = {
    max: parseInt(process.env.DB_POOL_MAX || '30'),  // 默认30个连接
    min: parseInt(process.env.DB_POOL_MIN || '5'),   // 默认5个连接
    acquire: 30000,  // 获取连接超时30秒
    idle: 10000      // 空闲连接超时10秒
  };

  constructor() {
    logger.info('[数据库] 租户数据库服务初始化（共享连接池模式）', {
      poolSize: `${this.poolConfig.min}-${this.poolConfig.max}`
    });
  }

  /**
   * 初始化全局共享连接（单例）
   * 应该在应用启动时调用
   */
  async initializeGlobalConnection(): Promise<Sequelize> {
    // 如果已经初始化，直接返回
    if (this.globalConnection && this.isInitialized) {
      return this.globalConnection;
    }

    // 如果正在初始化中，等待完成
    if (this.initPromise) {
      return this.initPromise;
    }

    // 开始初始化
    this.initPromise = this._createGlobalConnection();

    try {
      this.globalConnection = await this.initPromise;
      this.isInitialized = true;
      return this.globalConnection;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * 创建全局数据库连接
   */
  private async _createGlobalConnection(): Promise<Sequelize> {
    const sequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'mysql', // 连接到MySQL系统数据库，通过完整表名访问租户数据库
      dialect: 'mysql',
      timezone: '+08:00',
      pool: this.poolConfig,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      logging: (msg: string) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`[数据库] ${msg}`);
        }
      }
    });

    try {
      await sequelize.authenticate();
      logger.info('[数据库] ✅ 全局共享连接池初始化成功', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        poolSize: `${this.poolConfig.min}-${this.poolConfig.max}`
      });

      // 设置连接事件监听
      this._setupConnectionEventListeners(sequelize);

      return sequelize;
    } catch (error) {
      logger.error('[数据库] ❌ 全局共享连接池初始化失败', error);
      throw new Error(`无法初始化数据库连接: ${error}`);
    }
  }

  /**
   * 设置连接事件监听
   */
  private _setupConnectionEventListeners(sequelize: Sequelize): void {
    sequelize.addHook('beforeConnect', () => {
      logger.debug('[数据库] 准备获取连接');
    });

    sequelize.addHook('afterConnect', () => {
      logger.debug('[数据库] 连接已获取');
    });

    sequelize.addHook('beforeDisconnect', () => {
      logger.debug('[数据库] 准备释放连接');
    });

    sequelize.addHook('afterDisconnect', () => {
      logger.debug('[数据库] 连接已释放');
    });
  }

  /**
   * 获取全局共享连接
   * 这是获取数据库连接的主要方法
   */
  getGlobalConnection(): Sequelize {
    if (!this.globalConnection || !this.isInitialized) {
      throw new Error('数据库连接未初始化，请先调用 initializeGlobalConnection()');
    }
    return this.globalConnection;
  }

  /**
   * 获取租户数据库连接（兼容旧接口）
   * 返回全局共享连接，通过完整表名访问租户数据库
   *
   * @deprecated 建议使用 getGlobalConnection() 配合完整表名
   */
  async getTenantConnection(tenantCode: string): Promise<Sequelize> {
    // 确保全局连接已初始化
    if (!this.globalConnection || !this.isInitialized) {
      await this.initializeGlobalConnection();
    }

    logger.debug('[数据库] 获取租户连接（共享模式）', { tenantCode });
    return this.globalConnection!;
  }

  /**
   * 构建完整的表名
   * @param tenantCode 租户代码
   * @param tableName 表名
   * @returns 完整表名，如：tenant_k001.users
   */
  getFullTableName(tenantCode: string, tableName: string): string {
    return `tenant_${tenantCode}.${tableName}`;
  }

  /**
   * 关闭全局连接
   */
  async closeGlobalConnection(): Promise<void> {
    if (this.globalConnection) {
      try {
        await this.globalConnection.close();
        this.globalConnection = null;
        this.isInitialized = false;
        this.initPromise = null;
        logger.info('[数据库] ✅ 全局共享连接池已关闭');
      } catch (error) {
        logger.error('[数据库] ❌ 关闭全局共享连接池失败', error);
      }
    }
  }

  /**
   * 关闭租户数据库连接（兼容旧接口）
   * 在共享连接池模式下，这个方法不执行任何操作
   *
   * @deprecated 共享连接池模式下无需关闭单个租户连接
   */
  async closeTenantConnection(tenantCode: string): Promise<void> {
    logger.debug('[数据库] 共享连接池模式下无需关闭单个租户连接', { tenantCode });
    // 不执行任何操作
  }

  /**
   * 关闭所有连接（兼容旧接口）
   */
  async closeAllConnections(): Promise<void> {
    await this.closeGlobalConnection();
  }

  /**
   * 获取连接池统计信息
   */
  async getPoolStats(): Promise<PoolStats> {
    if (!this.globalConnection) {
      return {
        poolSize: this.poolConfig,
        activeConnections: 0,
        idleConnections: 0,
        waitingRequests: 0
      };
    }

    // Sequelize 不直接暴露连接池统计，返回配置信息
    return {
      poolSize: {
        max: this.poolConfig.max,
        min: this.poolConfig.min
      },
      activeConnections: this.isInitialized ? 1 : 0,
      idleConnections: this.poolConfig.min,
      waitingRequests: 0
    };
  }

  /**
   * 获取活跃连接数量（兼容旧接口）
   * 共享连接池模式下始终返回1
   */
  getActiveConnectionsCount(): number {
    return this.isInitialized ? 1 : 0;
  }

  /**
   * 获取所有活跃的租户列表（兼容旧接口）
   * 共享连接池模式下返回空数组，因为不再跟踪单个租户
   */
  getActiveTenants(): string[] {
    return [];
  }

  /**
   * 检查租户数据库是否存在
   */
  async checkTenantDatabaseExists(tenantCode: string): Promise<boolean> {
    try {
      const connection = await this.initializeGlobalConnection();

      const [results] = await connection.query(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
        {
          replacements: [`tenant_${tenantCode}`],
          type: 'SELECT'
        }
      );

      return (results as any[]).length > 0;
    } catch (error) {
      logger.error('[数据库] 检查租户数据库存在性失败', { tenantCode, error });
      return false;
    }
  }

  /**
   * 获取租户数据库统计信息
   */
  async getTenantDatabaseStats(tenantCode: string): Promise<any> {
    try {
      const connection = await this.initializeGlobalConnection();
      const databaseName = `tenant_${tenantCode}`;

      // 获取表统计信息
      const [tableStats] = await connection.query(
        'SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
        {
          replacements: [databaseName],
          type: 'SELECT'
        }
      );

      // 获取数据大小统计
      const [sizeStats] = await connection.query(
        `SELECT
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
        FROM information_schema.tables
        WHERE table_schema = ?`,
        {
          replacements: [databaseName],
          type: 'SELECT'
        }
      );

      return {
        tenantCode,
        databaseName,
        tableCount: (tableStats as any)[0]?.table_count || 0,
        sizeMB: (sizeStats as any)[0]?.size_mb || 0,
        connectionStatus: 'active',
        connectionMode: 'shared_pool'
      };
    } catch (error) {
      logger.error('[数据库] 获取租户数据库统计信息失败', { tenantCode, error });
      return {
        tenantCode,
        databaseName: `tenant_${tenantCode}`,
        tableCount: 0,
        sizeMB: 0,
        connectionStatus: 'error',
        connectionMode: 'shared_pool',
        error: error
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      if (!this.globalConnection || !this.isInitialized) {
        return {
          healthy: false,
          details: {
            status: 'not_initialized',
            message: '全局连接未初始化'
          }
        };
      }

      await this.globalConnection.authenticate();

      return {
        healthy: true,
        details: {
          status: 'healthy',
          connectionMode: 'shared_pool',
          poolSize: `${this.poolConfig.min}-${this.poolConfig.max}`,
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          status: 'unhealthy',
          connectionMode: 'shared_pool',
          error: error,
          lastChecked: new Date().toISOString()
        }
      };
    }
  }
}

// 创建单例实例
export const tenantDatabaseService = new TenantDatabaseService();

export default tenantDatabaseService;