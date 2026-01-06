/**
 * 审计日志防篡改服务
 * 
 * 等保三级合规要求：
 * - 应保护审计记录免受未授权修改
 * - 本服务使用哈希链技术确保日志完整性
 * 
 * 实现原理：
 * - 每条日志记录包含前一条记录的哈希值
 * - 形成链式结构，任何篡改都会破坏链条
 * - 支持完整性验证
 */

import crypto from 'crypto';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';

/**
 * 审计日志级别
 */
export enum AuditLogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 审计日志分类
 */
export enum AuditLogCategory {
  AUTH = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFY = 'data_modify',
  SYSTEM = 'system',
  SECURITY = 'security',
  ADMIN = 'admin_operation'
}

/**
 * 审计日志条目接口
 */
export interface AuditLogEntry {
  id?: number;
  timestamp: Date;
  level: AuditLogLevel;
  category: AuditLogCategory;
  action: string;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  previousHash: string;
  currentHash: string;
}

/**
 * 审计日志模型定义
 */
export class SecureAuditLog extends Model {
  declare id: number;
  declare timestamp: Date;
  declare level: string;
  declare category: string;
  declare action: string;
  declare user_id: number | null;
  declare username: string | null;
  declare ip_address: string | null;
  declare user_agent: string | null;
  declare resource_type: string | null;
  declare resource_id: string | null;
  declare details: string | null;
  declare previous_hash: string;
  declare current_hash: string;
  declare created_at: Date;

  static initModel(sequelize: Sequelize): void {
    SecureAuditLog.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      timestamp: {
        type: DataTypes.DATE(6), // 微秒精度
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      level: {
        type: DataTypes.ENUM(...Object.values(AuditLogLevel)),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM(...Object.values(AuditLogCategory)),
        allowNull: false
      },
      action: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '操作描述'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      username: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      ip_address: {
        type: DataTypes.STRING(45), // 支持IPv6
        allowNull: true
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      resource_type: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '资源类型（如user, tenant等）'
      },
      resource_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '资源ID'
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '详细信息（JSON格式）'
      },
      previous_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: '前一条日志的哈希值'
      },
      current_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: '当前日志的哈希值'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'secure_audit_logs',
      timestamps: false,
      indexes: [
        { fields: ['timestamp'] },
        { fields: ['level'] },
        { fields: ['category'] },
        { fields: ['user_id'] },
        { fields: ['current_hash'], unique: true }
      ]
    });
  }
}

/**
 * 安全审计日志服务
 */
export class SecureAuditLogService {
  private sequelize: Sequelize | null = null;
  private initialized = false;
  private genesisHash = 'GENESIS_' + crypto.randomBytes(24).toString('hex');

  /**
   * 初始化服务
   */
  async initialize(sequelize: Sequelize): Promise<void> {
    if (this.initialized) return;

    this.sequelize = sequelize;
    SecureAuditLog.initModel(sequelize);
    
    // 同步模型（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      await SecureAuditLog.sync({ alter: true });
    }

    this.initialized = true;
    console.log('✅ [安全审计] 防篡改日志服务已初始化');
  }

  /**
   * 计算日志条目的哈希值
   */
  private calculateHash(entry: Omit<AuditLogEntry, 'currentHash' | 'id'>): string {
    const content = JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      category: entry.category,
      action: entry.action,
      userId: entry.userId,
      username: entry.username,
      ipAddress: entry.ipAddress,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      details: entry.details,
      previousHash: entry.previousHash
    });

    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 获取最后一条日志的哈希值
   */
  private async getLastHash(): Promise<string> {
    const lastLog = await SecureAuditLog.findOne({
      order: [['id', 'DESC']],
      attributes: ['current_hash']
    });

    return lastLog?.current_hash || this.genesisHash;
  }

  /**
   * 记录审计日志
   */
  async log(
    level: AuditLogLevel,
    category: AuditLogCategory,
    action: string,
    options: {
      userId?: number;
      username?: string;
      ipAddress?: string;
      userAgent?: string;
      resourceType?: string;
      resourceId?: string;
      details?: Record<string, any>;
    } = {}
  ): Promise<AuditLogEntry | null> {
    if (!this.initialized) {
      console.warn('[安全审计] 服务未初始化，日志未记录');
      return null;
    }

    try {
      const previousHash = await this.getLastHash();
      const timestamp = new Date();

      const entry: Omit<AuditLogEntry, 'id' | 'currentHash'> = {
        timestamp,
        level,
        category,
        action,
        previousHash,
        ...options
      };

      const currentHash = this.calculateHash(entry);

      const logRecord = await SecureAuditLog.create({
        timestamp,
        level,
        category,
        action,
        user_id: options.userId || null,
        username: options.username || null,
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || null,
        resource_type: options.resourceType || null,
        resource_id: options.resourceId || null,
        details: options.details ? JSON.stringify(options.details) : null,
        previous_hash: previousHash,
        current_hash: currentHash
      });

      return {
        id: logRecord.id,
        ...entry,
        currentHash
      };
    } catch (error) {
      console.error('[安全审计] 记录日志失败:', error);
      return null;
    }
  }

  /**
   * 验证日志链完整性
   * @param startId 起始ID（可选）
   * @param endId 结束ID（可选）
   */
  async verifyIntegrity(startId?: number, endId?: number): Promise<{
    valid: boolean;
    totalRecords: number;
    validRecords: number;
    invalidRecords: Array<{ id: number; reason: string }>;
  }> {
    const where: any = {};
    if (startId) where.id = { ...where.id, [Op.gte]: startId };
    if (endId) where.id = { ...where.id, [Op.lte]: endId };

    const logs = await SecureAuditLog.findAll({
      where,
      order: [['id', 'ASC']]
    });

    const invalidRecords: Array<{ id: number; reason: string }> = [];
    let previousHash = logs[0]?.previous_hash || this.genesisHash;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // 检查前一个哈希是否匹配
      if (i > 0 && log.previous_hash !== logs[i - 1].current_hash) {
        invalidRecords.push({
          id: log.id,
          reason: '前一个哈希值不匹配（链断裂）'
        });
        continue;
      }

      // 重新计算哈希并验证
      const entry: Omit<AuditLogEntry, 'currentHash' | 'id'> = {
        timestamp: new Date(log.timestamp),
        level: log.level as AuditLogLevel,
        category: log.category as AuditLogCategory,
        action: log.action,
        userId: log.user_id || undefined,
        username: log.username || undefined,
        ipAddress: log.ip_address || undefined,
        resourceType: log.resource_type || undefined,
        resourceId: log.resource_id || undefined,
        details: log.details ? JSON.parse(log.details) : undefined,
        previousHash: log.previous_hash
      };

      const calculatedHash = this.calculateHash(entry);
      
      if (calculatedHash !== log.current_hash) {
        invalidRecords.push({
          id: log.id,
          reason: '哈希值不匹配（内容可能被篡改）'
        });
      }

      previousHash = log.current_hash;
    }

    return {
      valid: invalidRecords.length === 0,
      totalRecords: logs.length,
      validRecords: logs.length - invalidRecords.length,
      invalidRecords
    };
  }

  /**
   * 查询审计日志
   */
  async query(options: {
    startDate?: Date;
    endDate?: Date;
    level?: AuditLogLevel;
    category?: AuditLogCategory;
    userId?: number;
    action?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.timestamp = {};
      if (options.startDate) where.timestamp[Op.gte] = options.startDate;
      if (options.endDate) where.timestamp[Op.lte] = options.endDate;
    }
    if (options.level) where.level = options.level;
    if (options.category) where.category = options.category;
    if (options.userId) where.user_id = options.userId;
    if (options.action) where.action = { [Op.like]: `%${options.action}%` };

    const { count, rows } = await SecureAuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });

    return {
      logs: rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        level: row.level as AuditLogLevel,
        category: row.category as AuditLogCategory,
        action: row.action,
        userId: row.user_id || undefined,
        username: row.username || undefined,
        ipAddress: row.ip_address || undefined,
        userAgent: row.user_agent || undefined,
        resourceType: row.resource_type || undefined,
        resourceId: row.resource_id || undefined,
        details: row.details ? JSON.parse(row.details) : undefined,
        previousHash: row.previous_hash,
        currentHash: row.current_hash
      })),
      total: count
    };
  }

  // 便捷方法：认证事件
  async logAuth(action: string, options: Parameters<typeof this.log>[3]) {
    return this.log(AuditLogLevel.INFO, AuditLogCategory.AUTH, action, options);
  }

  // 便捷方法：安全事件
  async logSecurity(action: string, options: Parameters<typeof this.log>[3], level = AuditLogLevel.WARNING) {
    return this.log(level, AuditLogCategory.SECURITY, action, options);
  }

  // 便捷方法：数据访问
  async logDataAccess(action: string, options: Parameters<typeof this.log>[3]) {
    return this.log(AuditLogLevel.INFO, AuditLogCategory.DATA_ACCESS, action, options);
  }

  // 便捷方法：数据修改
  async logDataModify(action: string, options: Parameters<typeof this.log>[3]) {
    return this.log(AuditLogLevel.INFO, AuditLogCategory.DATA_MODIFY, action, options);
  }

  // 便捷方法：管理操作
  async logAdmin(action: string, options: Parameters<typeof this.log>[3]) {
    return this.log(AuditLogLevel.INFO, AuditLogCategory.ADMIN, action, options);
  }
}

// 导出单例
export const secureAuditLogService = new SecureAuditLogService();
export default secureAuditLogService;
