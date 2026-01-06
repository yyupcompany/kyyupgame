/**
 * 数据库迁移版本控制配置
 *
 * 提供数据库迁移的版本管理和回滚机制
 */

import { Sequelize } from 'sequelize';

/**
 * 迁移状态
 */
export enum MigrationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

/**
 * 迁移记录接口
 */
export interface MigrationRecord {
  id: string;
  name: string;
  version: string;
  status: MigrationStatus;
  executedAt?: Date;
  rolledBackAt?: Date;
  executionTime?: number;
  checksum?: string;
  description?: string;
}

/**
 * 迁移配置
 */
export interface MigrationConfig {
  tableName: string;
  schema?: string;
  skipValidation?: boolean;
  transaction?: boolean;
  logExecution?: boolean;
  enableRollback?: boolean;
}

/**
 * 迁移脚本接口
 */
export interface MigrationScript {
  version: string;
  name: string;
  description: string;
  up: (sequelize: Sequelize, transaction?: any) => Promise<void>;
  down?: (sequelize: Sequelize, transaction?: any) => Promise<void>;
  checksum?: string;
}

/**
 * 默认配置
 */
export const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  tableName: 'migrations',
  skipValidation: false,
  transaction: true,
  logExecution: true,
  enableRollback: true
};

/**
 * 迁移版本管理器
 */
export class MigrationVersionManager {
  private migrations: Map<string, MigrationScript> = new Map();
  private records: MigrationRecord[] = [];

  constructor(
    private sequelize: Sequelize,
    private config: MigrationConfig = DEFAULT_MIGRATION_CONFIG
  ) {}

  /**
   * 注册迁移脚本
   */
  registerMigration(migration: MigrationScript): void {
    const key = `${migration.version}_${migration.name}`;

    // 验证版本格式
    if (!this.isValidVersion(migration.version)) {
      throw new Error(`无效的迁移版本: ${migration.version}`);
    }

    if (this.migrations.has(key)) {
      throw new Error(`迁移已存在: ${key}`);
    }

    // 生成校验和
    if (!migration.checksum) {
      migration.checksum = this.generateChecksum(migration);
    }

    this.migrations.set(key, migration);
  }

  /**
   * 执行所有待执行的迁移
   */
  async migrate(): Promise<MigrationRecord[]> {
    const executedRecords: MigrationRecord[] = [];

    // 确保迁移表存在
    await this.ensureMigrationTable();

    // 获取已执行的迁移
    await this.loadMigrationRecords();

    // 获取待执行的迁移
    const pendingMigrations = this.getPendingMigrations();

    for (const migration of pendingMigrations) {
      const startTime = Date.now();
      const record: MigrationRecord = {
        id: this.generateId(),
        name: migration.name,
        version: migration.version,
        status: MigrationStatus.RUNNING
      };

      try {
        // 记录执行开始
        await this.insertMigrationRecord(record);

        // 执行迁移
        if (this.config.transaction) {
          await this.sequelize.transaction(async (t) => {
            await migration.up(this.sequelize, t);
          });
        } else {
          await migration.up(this.sequelize);
        }

        // 更新记录
        record.status = MigrationStatus.COMPLETED;
        record.executedAt = new Date();
        record.executionTime = Date.now() - startTime;
        record.checksum = migration.checksum;

        await this.updateMigrationRecord(record);
        executedRecords.push(record);

        if (this.config.logExecution) {
          console.log(`✅ 迁移成功: ${migration.version} - ${migration.name}`);
        }
      } catch (error: any) {
        record.status = MigrationStatus.FAILED;
        record.executionTime = Date.now() - startTime;

        await this.updateMigrationRecord(record);

        if (this.config.logExecution) {
          console.error(`❌ 迁移失败: ${migration.version} - ${migration.name}`);
          console.error(`   错误: ${error.message}`);
        }

        throw error;
      }
    }

    return executedRecords;
  }

  /**
   * 回滚指定的迁移
   */
  async rollback(targetVersion?: string): Promise<MigrationRecord[]> {
    if (!this.config.enableRollback) {
      throw new Error('回滚功能未启用');
    }

    await this.loadMigrationRecords();

    // 获取需要回滚的迁移（按版本倒序）
    const toRollback = this.getRollbackMigrations(targetVersion);

    const rolledBackRecords: MigrationRecord[] = [];

    for (const { migration, record } of toRollback) {
      if (!migration.down) {
        throw new Error(`迁移 ${migration.version} 不支持回滚`);
      }

      try {
        if (this.config.transaction) {
          await this.sequelize.transaction(async (t) => {
            await migration.down!(this.sequelize, t);
          });
        } else {
          await migration.down!(this.sequelize);
        }

        record.status = MigrationStatus.ROLLED_BACK;
        record.rolledBackAt = new Date();

        await this.updateMigrationRecord(record);
        rolledBackRecords.push(record);

        if (this.config.logExecution) {
          console.log(`↩️  回滚成功: ${migration.version} - ${migration.name}`);
        }
      } catch (error: any) {
        if (this.config.logExecution) {
          console.error(`❌ 回滚失败: ${migration.version} - ${migration.name}`);
          console.error(`   错误: ${error.message}`);
        }

        throw error;
      }
    }

    return rolledBackRecords;
  }

  /**
   * 获取迁移状态
   */
  async getStatus(): Promise<{
    pending: MigrationScript[];
    executed: MigrationRecord[];
    latest: string;
  }> {
    await this.loadMigrationRecords();

    const pending = this.getPendingMigrations();
    const executed = this.records.filter(r => r.status === MigrationStatus.COMPLETED);
    const latest = executed.length > 0
      ? executed[executed.length - 1].version
      : '无';

    return { pending, executed, latest };
  }

  /**
   * 验证迁移完整性
   */
  async validate(): Promise<boolean> {
    if (this.config.skipValidation) {
      return true;
    }

    await this.loadMigrationRecords();

    for (const record of this.records) {
      if (record.status !== MigrationStatus.COMPLETED) {
        continue;
      }

      const migration = this.findMigration(record.name, record.version);
      if (!migration) {
        console.warn(`⚠️  迁移记录丢失: ${record.version} - ${record.name}`);
        return false;
      }

      if (migration.checksum !== record.checksum) {
        console.warn(`⚠️  迁移校验和不匹配: ${record.version} - ${record.name}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 确保迁移表存在
   */
  private async ensureMigrationTable(): Promise<void> {
    const tableName = this.config.tableName;

    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        executed_at DATETIME,
        rolled_back_at DATETIME,
        execution_time INT,
        checksum VARCHAR(255),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_version (version),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  /**
   * 加载迁移记录
   */
  private async loadMigrationRecords(): Promise<void> {
    const [results] = await this.sequelize.query(
      `SELECT * FROM ${this.config.tableName} ORDER BY version ASC`
    );

    this.records = results as any[];
  }

  /**
   * 插入迁移记录
   */
  private async insertMigrationRecord(record: MigrationRecord): Promise<void> {
    await this.sequelize.query(
      `INSERT INTO ${this.config.tableName} (id, name, version, status, description) VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [
          record.id,
          record.name,
          record.version,
          record.status,
          record.description || ''
        ]
      }
    );
  }

  /**
   * 更新迁移记录
   */
  private async updateMigrationRecord(record: MigrationRecord): Promise<void> {
    await this.sequelize.query(
      `UPDATE ${this.config.tableName}
       SET status = ?, executed_at = ?, rolled_back_at = ?, execution_time = ?, checksum = ?
       WHERE id = ?`,
      {
        replacements: [
          record.status,
          record.executedAt,
          record.rolledBackAt,
          record.executionTime,
          record.checksum,
          record.id
        ]
      }
    );
  }

  /**
   * 获取待执行的迁移
   */
  private getPendingMigrations(): MigrationScript[] {
    const executedVersions = new Set(
      this.records
        .filter(r => r.status === MigrationStatus.COMPLETED)
        .map(r => `${r.version}_${r.name}`)
    );

    return Array.from(this.migrations.values())
      .filter(m => !executedVersions.has(`${m.version}_${m.name}`))
      .sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * 获取需要回滚的迁移
   */
  private getRollbackMigrations(targetVersion?: string): Array<{ migration: MigrationScript; record: MigrationRecord }> {
    const executed = this.records
      .filter(r => r.status === MigrationStatus.COMPLETED)
      .sort((a, b) => b.version.localeCompare(a.version)); // 降序

    const toRollback: Array<{ migration: MigrationScript; record: MigrationRecord }> = [];

    for (const record of executed) {
      if (targetVersion && record.version === targetVersion) {
        break;
      }

      const migration = this.findMigration(record.name, record.version);
      if (migration) {
        toRollback.push({ migration, record });
      }
    }

    return toRollback;
  }

  /**
   * 查找迁移脚本
   */
  private findMigration(name: string, version: string): MigrationScript | undefined {
    const key = `${version}_${name}`;
    return this.migrations.get(key);
  }

  /**
   * 验证版本格式
   */
  private isValidVersion(version: string): boolean {
    return /^\d{14}$/.test(version);
  }

  /**
   * 生成校验和
   */
  private generateChecksum(migration: MigrationScript): string {
    const content = JSON.stringify({
      version: migration.version,
      name: migration.name,
      up: migration.up.toString(),
      down: migration.down?.toString()
    });

    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 创建迁移管理器实例
 */
export function createMigrationManager(
  sequelize: Sequelize,
  config?: Partial<MigrationConfig>
): MigrationVersionManager {
  return new MigrationVersionManager(sequelize, { ...DEFAULT_MIGRATION_CONFIG, ...config });
}

/**
 * 导出配置
 */
export default {
  MigrationStatus,
  DEFAULT_MIGRATION_CONFIG,
  MigrationVersionManager,
  createMigrationManager
};
