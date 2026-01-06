#!/usr/bin/env node

/**
 * 租户数据库同步工具
 * 使用模板数据库同步所有租户的数据库结构
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class TenantDatabaseSync {
  constructor() {
    this.config = this.loadConfig();
    this.templateDb = this.config.templateDatabase;
    this.pool = mysql.createPool({
      host: this.config.connection.host,
      port: this.config.connection.port,
      user: this.config.connection.username,
      password: this.config.connection.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  loadConfig() {
    return JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'tenant-db-config.json'),
        'utf8'
      )
    );
  }

  /**
   * 获取模板数据库的表结构
   */
  async getTemplateSchema() {
    const connection = await this.pool.getConnection();
    try {
      // 获取所有表
      const [tables] = await connection.execute(
        `SELECT TABLE_NAME
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = ?
         AND TABLE_TYPE = 'BASE TABLE'`,
        [this.templateDb]
      );

      const schema = {};

      for (const table of tables) {
        const tableName = table.TABLE_NAME;

        // 获取表结构
        const [columns] = await connection.execute(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
                  COLUMN_DEFAULT, COLUMN_KEY, EXTRA,
                  CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY ORDINAL_POSITION`,
          [this.templateDb, tableName]
        );

        // 获取索引
        const [indexes] = await connection.execute(
          `SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
           FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
          [this.templateDb, tableName]
        );

        // 获取外键
        const [foreignKeys] = await connection.execute(
          `SELECT CONSTRAINT_NAME, COLUMN_NAME,
                  REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
          [this.templateDb, tableName]
        );

        schema[tableName] = {
          columns: columns,
          indexes: indexes,
          foreignKeys: foreignKeys
        };
      }

      return schema;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取所有租户数据库列表
   */
  async getTenantDatabases() {
    const connection = await this.pool.getConnection();
    try {
      // 从统一租户管理系统获取租户数据库列表
      // 这里使用简单的查询示例
      const [databases] = await connection.execute(
        `SELECT SCHEMA_NAME as database_name
         FROM INFORMATION_SCHEMA.SCHEMATA
         WHERE SCHEMA_NAME LIKE 'tenant_%'
         ORDER BY SCHEMA_NAME`
      );

      return databases.map(db => db.database_name);
    } finally {
      connection.release();
    }
  }

  /**
   * 比较两个数据库的结构差异
   */
  compareSchemas(templateSchema, tenantSchema) {
    const differences = [];

    // 检查缺失的表
    for (const tableName of Object.keys(templateSchema)) {
      if (!tenantSchema[tableName]) {
        differences.push({
          type: 'missing_table',
          table: tableName,
          sql: this.generateCreateTableSQL(tableName, templateSchema[tableName])
        });
        continue;
      }

      // 检查列差异
      const templateCols = templateSchema[tableName].columns;
      const tenantCols = tenantSchema[tableName].columns;

      for (const col of templateCols) {
        const tenantCol = tenantCols.find(c => c.COLUMN_NAME === col.COLUMN_NAME);

        if (!tenantCol) {
          differences.push({
            type: 'missing_column',
            table: tableName,
            column: col.COLUMN_NAME,
            sql: this.generateAddColumnSQL(tableName, col)
          });
        } else if (this.hasColumnChanges(col, tenantCol)) {
          differences.push({
            type: 'column_change',
            table: tableName,
            column: col.COLUMN_NAME,
            sql: this.generateModifyColumnSQL(tableName, col)
          });
        }
      }

      // 检查索引差异
      this.compareIndexes(
        templateSchema[tableName].indexes,
        tenantSchema[tableName].indexes || [],
        tableName,
        differences
      );
    }

    return differences;
  }

  /**
   * 检查列是否有变更
   */
  hasColumnChanges(templateCol, tenantCol) {
    return (
      templateCol.DATA_TYPE !== tenantCol.DATA_TYPE ||
      templateCol.IS_NULLABLE !== tenantCol.IS_NULLABLE ||
      templateCol.COLUMN_DEFAULT !== tenantCol.COLUMN_DEFAULT ||
      templateCol.CHARACTER_MAXIMUM_LENGTH !== tenantCol.CHARACTER_MAXIMUM_LENGTH ||
      templateCol.NUMERIC_PRECISION !== tenantCol.NUMERIC_PRECISION ||
      templateCol.NUMERIC_SCALE !== tenantCol.NUMERIC_SCALE
    );
  }

  /**
   * 比较索引
   */
  compareIndexes(templateIndexes, tenantIndexes, tableName, differences) {
    const templateIndexMap = this.groupIndexesByName(templateIndexes);
    const tenantIndexMap = this.groupIndexesByName(tenantIndexes);

    for (const [indexName, indexCols] of Object.entries(templateIndexMap)) {
      if (!tenantIndexMap[indexName]) {
        differences.push({
          type: 'missing_index',
          table: tableName,
          index: indexName,
          sql: this.generateCreateIndexSQL(tableName, indexName, indexCols)
        });
      }
    }
  }

  groupIndexesByName(indexes) {
    const grouped = {};
    for (const idx of indexes) {
      if (!grouped[idx.INDEX_NAME]) {
        grouped[idx.INDEX_NAME] = [];
      }
      grouped[idx.INDEX_NAME].push(idx);
    }
    return grouped;
  }

  /**
   * 生成CREATE TABLE SQL
   */
  generateCreateTableSQL(tableName, tableSchema) {
    const columns = tableSchema.columns.map(col => {
      let definition = `\`${col.COLUMN_NAME}\` ${col.DATA_TYPE}`;

      if (col.CHARACTER_MAXIMUM_LENGTH) {
        definition += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
      }

      if (col.IS_NULLABLE === 'NO') {
        definition += ' NOT NULL';
      }

      if (col.COLUMN_DEFAULT) {
        definition += ` DEFAULT ${col.COLUMN_DEFAULT}`;
      }

      if (col.EXTRA) {
        definition += ` ${col.EXTRA}`;
      }

      return definition;
    });

    const primaryKeys = tableSchema.columns
      .filter(col => col.COLUMN_KEY === 'PRI')
      .map(col => `\`${col.COLUMN_NAME}\``);

    let sql = `CREATE TABLE \`${tableName}\` (\n  ${columns.join(',\n  ')}`;

    if (primaryKeys.length > 0) {
      sql += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
    }

    sql += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

    return sql;
  }

  /**
   * 生成ADD COLUMN SQL
   */
  generateAddColumnSQL(tableName, column) {
    let definition = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${column.COLUMN_NAME}\` ${column.DATA_TYPE}`;

    if (column.CHARACTER_MAXIMUM_LENGTH) {
      definition += `(${column.CHARACTER_MAXIMUM_LENGTH})`;
    }

    if (column.IS_NULLABLE === 'NO') {
      definition += ' NOT NULL';
    }

    if (column.COLUMN_DEFAULT) {
      definition += ` DEFAULT ${column.COLUMN_DEFAULT}`;
    }

    return definition + ';';
  }

  /**
   * 生成MODIFY COLUMN SQL
   */
  generateModifyColumnSQL(tableName, column) {
    let definition = `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${column.COLUMN_NAME}\` ${column.DATA_TYPE}`;

    if (column.CHARACTER_MAXIMUM_LENGTH) {
      definition += `(${column.CHARACTER_MAXIMUM_LENGTH})`;
    }

    if (column.IS_NULLABLE === 'NO') {
      definition += ' NOT NULL';
    }

    if (column.COLUMN_DEFAULT) {
      definition += ` DEFAULT ${column.COLUMN_DEFAULT}`;
    }

    return definition + ';';
  }

  /**
   * 生成CREATE INDEX SQL
   */
  generateCreateIndexSQL(tableName, indexName, indexCols) {
    const columns = indexCols
      .sort((a, b) => a.SEQ_IN_INDEX - b.SEQ_IN_INDEX)
      .map(col => `\`${col.COLUMN_NAME}\``)
      .join(', ');

    const unique = indexCols[0].NON_UNIQUE === 0 ? 'UNIQUE ' : '';

    return `CREATE ${unique}INDEX \`${indexName}\` ON \`${tableName}\` (${columns});`;
  }

  /**
   * 获取租户数据库的结构
   */
  async getTenantSchema(databaseName) {
    const connection = await this.pool.getConnection();
    try {
      const [tables] = await connection.execute(
        `SELECT TABLE_NAME
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = ?
         AND TABLE_TYPE = 'BASE TABLE'`,
        [databaseName]
      );

      const schema = {};

      for (const table of tables) {
        const tableName = table.TABLE_NAME;

        const [columns] = await connection.execute(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
                  COLUMN_DEFAULT, COLUMN_KEY, EXTRA,
                  CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY ORDINAL_POSITION`,
          [databaseName, tableName]
        );

        const [indexes] = await connection.execute(
          `SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
           FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
          [databaseName, tableName]
        );

        schema[tableName] = {
          columns: columns,
          indexes: indexes
        };
      }

      return schema;
    } finally {
      connection.release();
    }
  }

  /**
   * 同步单个租户数据库
   */
  async syncTenantDatabase(tenantDb, differences) {
    const connection = await this.pool.getConnection();
    try {
      // 开始事务
      await connection.beginTransaction();

      // 执行所有SQL语句
      for (const diff of differences) {
        console.log(`  执行: ${diff.sql.substring(0, 100)}...`);
        await connection.execute(diff.sql);
      }

      // 提交事务
      await connection.commit();
      console.log(`✅ 租户数据库 ${tenantDb} 同步成功`);
      return { success: true, tenant: tenantDb };
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error(`❌ 租户数据库 ${tenantDb} 同步失败:`, error.message);
      return { success: false, tenant: tenantDb, error: error.message };
    } finally {
      connection.release();
    }
  }

  /**
   * 执行批量同步
   */
  async syncAllTenants() {
    console.log('🔄 开始获取模板数据库结构...');
    const templateSchema = await this.getTemplateSchema();

    console.log('🔄 获取所有租户数据库列表...');
    const tenantDbs = await this.getTenantDatabases();

    console.log(`📊 找到 ${tenantDbs.length} 个租户数据库`);

    const results = [];
    const batchSize = 5; // 每批处理5个数据库

    // 分批处理
    for (let i = 0; i < tenantDbs.length; i += batchSize) {
      const batch = tenantDbs.slice(i, i + batchSize);
      console.log(`\n📦 处理第 ${Math.floor(i/batchSize) + 1} 批 (${i + 1}-${Math.min(i + batchSize, tenantDbs.length)})`);

      // 并发处理当前批次
      const batchPromises = batch.map(async (tenantDb) => {
        try {
          // 获取租户数据库结构
          const tenantSchema = await this.getTenantSchema(tenantDb);

          // 比较差异
          const differences = this.compareSchemas(templateSchema, tenantSchema);

          if (differences.length === 0) {
            console.log(`  ✅ ${tenantDb} - 无需同步`);
            return { success: true, tenant: tenantDb, synced: false };
          }

          console.log(`  🔄 ${tenantDb} - 发现 ${differences.length} 个差异，开始同步...`);

          // 执行同步
          const result = await this.syncTenantDatabase(tenantDb, differences);
          return { ...result, synced: true, differences: differences.length };
        } catch (error) {
          console.error(`  ❌ ${tenantDb} - 处理失败:`, error.message);
          return { success: false, tenant: tenantDb, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 短暂休息，避免数据库压力过大
      if (i + batchSize < tenantDbs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 统计结果
    const summary = this.generateSummary(results);
    console.log('\n📊 同步完成统计:');
    console.log(summary);

    // 生成详细报告
    await this.generateSyncReport(results);

    return results;
  }

  /**
   * 生成统计摘要
   */
  generateSummary(results) {
    const total = results.length;
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const synced = results.filter(r => r.synced).length;

    return {
      total: total,
      success: success,
      failed: failed,
      synced: synced,
      successRate: `${((success / total) * 100).toFixed(2)}%`
    };
  }

  /**
   * 生成同步报告
   */
  async generateSyncReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(results),
      details: results
    };

    const reportPath = path.join(
      __dirname,
      '../reports',
      `tenant-db-sync-${Date.now()}.json`
    );

    // 确保目录存在
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
  }

  /**
   * 关闭连接池
   */
  async close() {
    await this.pool.end();
  }
}

// 主函数
async function main() {
  const sync = new TenantDatabaseSync();

  try {
    await sync.syncAllTenants();
  } catch (error) {
    console.error('❌ 同步过程中发生错误:', error);
    process.exit(1);
  } finally {
    await sync.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = TenantDatabaseSync;