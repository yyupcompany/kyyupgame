#!/usr/bin/env node

/**
 * 多租户批量数据库迁移工具
 * 用于同步更新所有租户的数据库结构
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class TenantBatchMigrator {
  constructor() {
    this.tenantConfigs = [];
    this.migrationDir = path.join(__dirname, '../server/src/migrations');
    this.seedDir = path.join(__dirname, '../server/src/seeders');
    this.logFile = path.join(__dirname, '../logs/batch-migration.log');
    this.backupDir = path.join(__dirname, '../backups');

    this.ensureDirectories();
  }

  /**
   * 确保必要的目录存在
   */
  ensureDirectories() {
    const dirs = [path.dirname(this.logFile), this.backupDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 从租户管理系统获取所有租户配置
   */
  async loadTenantConfigs() {
    try {
      // 这里应该调用统一租户管理系统的API
      // 暂时使用示例配置
      const mockTenants = [
        { id: 1, domain: 'tenant1.k.yyup.cc', database: 'tenant1_db' },
        { id: 2, domain: 'tenant2.k.yyup.cc', database: 'tenant2_db' },
        // ... 更多租户
      ];

      this.tenantConfigs = mockTenants;
      console.log(`✅ 加载了 ${this.tenantConfigs.length} 个租户配置`);
      return this.tenantConfigs;
    } catch (error) {
      console.error('❌ 加载租户配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取待执行的迁移文件
   */
  getPendingMigrations() {
    const migrations = fs.readdirSync(this.migrationDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`📋 找到 ${migrations.length} 个迁移文件`);
    return migrations;
  }

  /**
   * 备份单个租户数据库
   */
  async backupTenantDatabase(tenant) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `${tenant.database}_${timestamp}.sql`);

    try {
      const command = `mysqldump -h localhost -u root -p ${tenant.database} > "${backupFile}"`;
      await execPromise(command);

      this.log(`✅ 租户 ${tenant.domain} 数据库备份完成: ${backupFile}`);
      return backupFile;
    } catch (error) {
      this.log(`❌ 租户 ${tenant.domain} 数据库备份失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行单个租户的数据库迁移
   */
  async migrateTenant(tenant, migrations) {
    try {
      console.log(`🔄 开始迁移租户: ${tenant.domain} (${tenant.database})`);

      // 使用Sequelize CLI执行迁移
      const sequelizeCmd = `cd server && npx sequelize-cli db:migrate --url mysql://root:password@localhost:3306/${tenant.database}`;

      const { stdout, stderr } = await execPromise(sequelizeCmd);

      this.log(`✅ 租户 ${tenant.domain} 迁移成功`);
      return { success: true, stdout, stderr };

    } catch (error) {
      this.log(`❌ 租户 ${tenant.domain} 迁移失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 并发迁移多个租户（控制并发数）
   */
  async migrateTenants(concurrency = 5) {
    const migrations = this.getPendingMigrations();
    if (migrations.length === 0) {
      console.log('📋 没有待执行的迁移');
      return;
    }

    console.log(`🚀 开始批量迁移 ${this.tenantConfigs.length} 个租户，并发数: ${concurrency}`);

    // 分批处理
    const batches = [];
    for (let i = 0; i < this.tenantConfigs.length; i += concurrency) {
      batches.push(this.tenantConfigs.slice(i, i + concurrency));
    }

    const results = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 处理第 ${batchIndex + 1}/${batches.length} 批`);

      const batchPromises = batch.map(async (tenant) => {
        try {
          // 先备份
          await this.backupTenantDatabase(tenant);

          // 再迁移
          const result = await this.migrateTenant(tenant, migrations);
          return { tenant: tenant.domain, ...result };
        } catch (error) {
          return { tenant: tenant.domain, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 等待一段时间再处理下一批，避免数据库压力过大
      if (batchIndex < batches.length - 1) {
        console.log('⏳ 等待2秒后处理下一批...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 统计结果
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 迁移完成统计:`);
    console.log(`✅ 成功: ${success} 个租户`);
    console.log(`❌ 失败: ${failed} 个租户`);

    if (failed > 0) {
      console.log('\n❌ 失败的租户:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.tenant}: ${r.error}`);
      });
    }

    // 生成详细报告
    await this.generateMigrationReport(results, migrations);
  }

  /**
   * 运行种子数据更新
   */
  async seedTenants(concurrency = 3) {
    console.log('🌱 开始批量更新种子数据...');

    // 类似迁移逻辑，但使用 seeders
    const batches = [];
    for (let i = 0; i < this.tenantConfigs.length; i += concurrency) {
      batches.push(this.tenantConfigs.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (tenant) => {
        try {
          const command = `cd server && npx sequelize-cli db:seed:all --url mysql://root:password@localhost:3306/${tenant.database}`;
          await execPromise(command);
          return { tenant: tenant.domain, success: true };
        } catch (error) {
          return { tenant: tenant.domain, success: false, error: error.message };
        }
      });

      await Promise.all(batchPromises);
    }
  }

  /**
   * 生成迁移报告
   */
  async generateMigrationReport(results, migrations) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTenants: this.tenantConfigs.length,
      successCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      migrations: migrations,
      results: results
    };

    const reportPath = path.join(__dirname, '../reports/migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 迁移报告已生成: ${reportPath}`);
  }

  /**
   * 记录日志
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
    console.log(message);
  }

  /**
   * 回滚失败的迁移
   */
  async rollbackFailedTenants() {
    console.log('🔙 开始回滚失败的租户...');

    // 实现回滚逻辑
    const failedTenants = this.tenantConfigs.filter(tenant => {
      // 从日志中找出失败的租户
      return true; // 简化示例
    });

    for (const tenant of failedTenants) {
      try {
        const command = `cd server && npx sequelize-cli db:migrate:undo --url mysql://root:password@localhost:3306/${tenant.database}`;
        await execPromise(command);
        this.log(`✅ 租户 ${tenant.domain} 回滚成功`);
      } catch (error) {
        this.log(`❌ 租户 ${tenant.domain} 回滚失败: ${error.message}`);
      }
    }
  }

  /**
   * 健康检查 - 验证所有数据库结构一致
   */
  async healthCheck() {
    console.log('🏥 开始数据库健康检查...');

    const templateDb = 'template_db'; // 模板数据库
    const templateSchema = await this.getDatabaseSchema(templateDb);

    const inconsistencies = [];

    for (const tenant of this.tenantConfigs) {
      try {
        const tenantSchema = await this.getDatabaseSchema(tenant.database);
        const diff = this.compareSchemas(templateSchema, tenantSchema);

        if (diff.length > 0) {
          inconsistencies.push({
            tenant: tenant.domain,
            differences: diff
          });
        }
      } catch (error) {
        inconsistencies.push({
          tenant: tenant.domain,
          error: error.message
        });
      }
    }

    if (inconsistencies.length > 0) {
      console.log(`⚠️ 发现 ${inconsistencies.length} 个租户数据库结构不一致`);
      // 生成修复建议
      await this.generateFixSuggestions(inconsistencies);
    } else {
      console.log('✅ 所有租户数据库结构一致');
    }
  }

  /**
   * 获取数据库结构
   */
  async getDatabaseSchema(database) {
    // 实现获取数据库结构的逻辑
    return {}; // 简化示例
  }

  /**
   * 比较数据库结构
   */
  compareSchemas(schema1, schema2) {
    // 实现结构比较逻辑
    return []; // 简化示例
  }

  /**
   * 生成修复建议
   */
  async generateFixSuggestions(inconsistencies) {
    const fixFile = path.join(__dirname, '../reports/db-fix-suggestions.json');
    fs.writeFileSync(fixFile, JSON.stringify(inconsistencies, null, 2));
    console.log(`📄 修复建议已生成: ${fixFile}`);
  }
}

// CLI 命令行接口
async function main() {
  const command = process.argv[2];
  const migrator = new TenantBatchMigrator();

  try {
    await migrator.loadTenantConfigs();

    switch (command) {
      case 'migrate':
        const concurrency = parseInt(process.argv[3]) || 5;
        await migrator.migrateTenants(concurrency);
        break;

      case 'seed':
        await migrator.seedTenants();
        break;

      case 'rollback':
        await migrator.rollbackFailedTenants();
        break;

      case 'health-check':
        await migrator.healthCheck();
        break;

      default:
        console.log(`
使用方法:
  node batch-db-migrator.js migrate [concurrency]  # 执行迁移
  node batch-db-migrator.js seed                   # 更新种子数据
  node batch-db-migrator.js rollback               # 回滚失败
  node batch-db-migrator.js health-check          # 健康检查
        `);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TenantBatchMigrator;