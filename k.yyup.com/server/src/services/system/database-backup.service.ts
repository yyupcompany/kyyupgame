/**
 * 数据库备份服务
 * 提供真正的数据库备份和恢复功能
 */

import { Sequelize, QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { sequelize } from '../../init';
import { getDatabaseConfig } from '../../config/database-unified';

export interface BackupOptions {
  name?: string;
  description?: string;
  includeData?: boolean;
  includeTables?: string[];
  excludeTables?: string[];
}

export interface BackupResult {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: Date;
  description?: string;
  tableCount: number;
  recordCount: number;
}

export interface RestoreOptions {
  filename: string;
  dropExisting?: boolean;
  ignoreErrors?: boolean;
}

export class DatabaseBackupService {
  private sequelize: Sequelize;
  private backupDir: string;

  constructor() {
    this.sequelize = sequelize;
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  /**
   * 确保备份目录存在
   */
  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取所有表名
   */
  private async getAllTables(): Promise<string[]> {
    const dbConfig = getDatabaseConfig();
    const query = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = :database 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    const result = await this.sequelize.query(query, {
      replacements: { database: dbConfig.database },
      type: QueryTypes.SELECT
    }) as { TABLE_NAME: string }[];
    
    return result.map(row => row.TABLE_NAME);
  }

  /**
   * 获取表结构
   */
  private async getTableStructure(tableName: string): Promise<string> {
    const query = `SHOW CREATE TABLE \`${tableName}\``;
    const result = await this.sequelize.query(query, {
      type: QueryTypes.SELECT
    }) as { 'Create Table': string }[];
    
    if (result.length > 0) {
      return result[0]['Create Table'];
    }
    throw new Error(`无法获取表 ${tableName} 的结构`);
  }

  /**
   * 获取表数据
   */
  private async getTableData(tableName: string): Promise<{ sql: string; count: number }> {
    // 首先获取记录数
    const countQuery = `SELECT COUNT(*) as count FROM \`${tableName}\``;
    const countResult = await this.sequelize.query(countQuery, {
      type: QueryTypes.SELECT
    }) as { count: number }[];
    
    const recordCount = countResult[0]?.count || 0;
    
    if (recordCount === 0) {
      return { sql: '', count: 0 };
    }

    // 获取所有数据
    const dataQuery = `SELECT * FROM \`${tableName}\``;
    const rows = await this.sequelize.query(dataQuery, {
      type: QueryTypes.SELECT
    });

    if (rows.length === 0) {
      return { sql: '', count: 0 };
    }

    // 生成INSERT语句
    const columns = Object.keys(rows[0] as object);
    const insertStatements: string[] = [];
    
    for (const row of rows) {
      const values = columns.map(col => {
        const value = (row as any)[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`;
        }
        if (value instanceof Date) {
          return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
        }
        return String(value);
      });
      
      insertStatements.push(
        `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});`
      );
    }

    return {
      sql: insertStatements.join('\n'),
      count: recordCount
    };
  }

  /**
   * 创建数据库备份
   */
  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const {
      name,
      description,
      includeData = true,
      includeTables,
      excludeTables = []
    } = options;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = name ? `${name}-${timestamp}.sql` : `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    // 获取要备份的表
    let tables = await this.getAllTables();
    
    if (includeTables && includeTables.length > 0) {
      tables = tables.filter(table => includeTables.includes(table));
    }
    
    if (excludeTables.length > 0) {
      tables = tables.filter(table => !excludeTables.includes(table));
    }

    const dbConfig = getDatabaseConfig();
    const sqlContent: string[] = [];
    let totalRecords = 0;

    // 添加备份头部信息
    sqlContent.push('-- ========================================');
    sqlContent.push(`-- 数据库备份文件`);
    sqlContent.push(`-- 生成时间: ${new Date().toISOString()}`);
    sqlContent.push(`-- 数据库: ${dbConfig.database}`);
    sqlContent.push(`-- 描述: ${description || '无描述'}`);
    sqlContent.push('-- ========================================');
    sqlContent.push('');
    sqlContent.push('SET FOREIGN_KEY_CHECKS = 0;');
    sqlContent.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
    sqlContent.push('SET AUTOCOMMIT = 0;');
    sqlContent.push('START TRANSACTION;');
    sqlContent.push('');

    // 备份每个表
    for (const tableName of tables) {
      try {
        sqlContent.push(`-- ========================================`);
        sqlContent.push(`-- 表: ${tableName}`);
        sqlContent.push(`-- ========================================`);
        
        // 获取表结构
        const createTableSql = await this.getTableStructure(tableName);
        sqlContent.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
        sqlContent.push(createTableSql + ';');
        sqlContent.push('');

        // 如果需要包含数据
        if (includeData) {
          const { sql: insertSql, count } = await this.getTableData(tableName);
          if (insertSql) {
            sqlContent.push(`-- 数据插入: ${tableName} (${count} 条记录)`);
            sqlContent.push(insertSql);
            sqlContent.push('');
            totalRecords += count;
          }
        }
      } catch (error) {
        console.error(`备份表 ${tableName} 时出错:`, error);
        sqlContent.push(`-- 错误: 无法备份表 ${tableName}: ${error}`);
        sqlContent.push('');
      }
    }

    // 添加备份尾部
    sqlContent.push('COMMIT;');
    sqlContent.push('SET FOREIGN_KEY_CHECKS = 1;');
    sqlContent.push('');
    sqlContent.push('-- ========================================');
    sqlContent.push(`-- 备份完成`);
    sqlContent.push(`-- 表数量: ${tables.length}`);
    sqlContent.push(`-- 记录数量: ${totalRecords}`);
    sqlContent.push(`-- 完成时间: ${new Date().toISOString()}`);
    sqlContent.push('-- ========================================');

    // 写入文件
    const finalSql = sqlContent.join('\n');
    fs.writeFileSync(filePath, finalSql, 'utf8');

    // 获取文件信息
    const stats = fs.statSync(filePath);

    return {
      filename,
      size: stats.size,
      sizeFormatted: this.formatFileSize(stats.size),
      createdAt: stats.birthtime,
      description,
      tableCount: tables.length,
      recordCount: totalRecords
    };
  }

  /**
   * 恢复数据库备份
   */
  async restoreBackup(options: RestoreOptions): Promise<{ success: boolean; message: string; tablesRestored: number }> {
    const { filename, dropExisting = true, ignoreErrors = false } = options;
    const filePath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`备份文件不存在: ${filename}`);
    }

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim());

    let tablesRestored = 0;
    const transaction = await this.sequelize.transaction();

    try {
      for (const statement of statements) {
        const trimmedStmt = statement.trim();
        if (!trimmedStmt) continue;

        try {
          await this.sequelize.query(trimmedStmt, { transaction });

          if (trimmedStmt.toUpperCase().startsWith('CREATE TABLE')) {
            tablesRestored++;
          }
        } catch (error) {
          if (!ignoreErrors) {
            throw error;
          }
          console.warn(`忽略SQL执行错误: ${error}`);
        }
      }

      await transaction.commit();
      return {
        success: true,
        message: '数据库恢复成功',
        tablesRestored
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`数据库恢复失败: ${error}`);
    }
  }

  /**
   * 获取备份文件列表
   */
  async getBackupList(): Promise<Array<{
    filename: string;
    size: number;
    sizeFormatted: string;
    createdAt: Date;
    type: string;
  }>> {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          sizeFormatted: this.formatFileSize(stats.size),
          createdAt: stats.birthtime,
          type: 'database'
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return files;
  }

  /**
   * 删除备份文件
   */
  async deleteBackup(filename: string): Promise<void> {
    const filePath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`备份文件不存在: ${filename}`);
    }

    fs.unlinkSync(filePath);
  }

  /**
   * 获取备份统计信息
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    totalSizeFormatted: string;
    latestBackup: Date | null;
    oldestBackup: Date | null;
  }> {
    const backups = await this.getBackupList();

    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        totalSizeFormatted: '0 B',
        latestBackup: null,
        oldestBackup: null
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const dates = backups.map(backup => backup.createdAt).sort((a, b) => a.getTime() - b.getTime());

    return {
      totalBackups: backups.length,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      latestBackup: dates[dates.length - 1],
      oldestBackup: dates[0]
    };
  }

  /**
   * 清理旧备份
   */
  async cleanupOldBackups(retentionDays: number = 7): Promise<{ deletedCount: number; freedSpace: number }> {
    const backups = await this.getBackupList();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;
    let freedSpace = 0;

    for (const backup of backups) {
      if (backup.createdAt < cutoffDate) {
        try {
          await this.deleteBackup(backup.filename);
          deletedCount++;
          freedSpace += backup.size;
        } catch (error) {
          console.error(`删除备份文件失败: ${backup.filename}`, error);
        }
      }
    }

    return { deletedCount, freedSpace };
  }

  /**
   * 验证备份文件
   */
  async validateBackup(filename: string): Promise<{ valid: boolean; errors: string[] }> {
    const filePath = path.join(this.backupDir, filename);
    const errors: string[] = [];

    if (!fs.existsSync(filePath)) {
      errors.push('备份文件不存在');
      return { valid: false, errors };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // 基本格式检查
      if (!content.includes('CREATE TABLE')) {
        errors.push('备份文件中未找到表结构定义');
      }

      if (!content.includes('SET FOREIGN_KEY_CHECKS')) {
        errors.push('备份文件缺少外键检查设置');
      }

      // 检查SQL语法（简单检查）
      const statements = content.split(';').filter(stmt => stmt.trim());
      for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (trimmed && !trimmed.startsWith('--') && !trimmed.match(/^(CREATE|INSERT|DROP|SET|START|COMMIT)/i)) {
          errors.push(`可能存在无效的SQL语句: ${trimmed.substring(0, 50)}...`);
          break;
        }
      }

    } catch (error) {
      errors.push(`读取备份文件失败: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 导出服务实例
export default new DatabaseBackupService();
