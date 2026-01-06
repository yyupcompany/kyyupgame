/**
 * 业务中心性能优化 - 数据库索引优化脚本
 *
 * 用途：为业务中心相关表添加索引，提升查询性能
 * 执行方式：npm run optimize:business-center-indexes
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

interface IndexInfo {
  table: string;
  indexes: Array<{
    name: string;
    columns: string[];
    unique?: boolean;
  }>;
}

const indexesToCreate: IndexInfo[] = [
  // 1. 招生相关表
  {
    table: 'enrollment_applications',
    indexes: [
      { name: 'idx_status', columns: ['status'] },
      { name: 'idx_created_at', columns: ['created_at'] },
      { name: 'idx_status_created', columns: ['status', 'created_at'] }
    ]
  },
  {
    table: 'enrollment_consultations',
    indexes: [
      { name: 'idx_created_at', columns: ['created_at'] },
      { name: 'idx_status_created', columns: ['status', 'created_at'] }
    ]
  },

  // 2. 人员相关表
  {
    table: 'teachers',
    indexes: [
      { name: 'idx_status', columns: ['status'] }
    ]
  },
  {
    table: 'students',
    indexes: [
      { name: 'idx_status', columns: ['status'] }
    ]
  },
  {
    table: 'classes',
    indexes: [
      { name: 'idx_status', columns: ['status'] }
    ]
  },

  // 3. 活动相关表
  {
    table: 'activity_plans',
    indexes: [
      { name: 'idx_status', columns: ['status'] },
      { name: 'idx_created_at', columns: ['created_at'] }
    ]
  },

  // 4. 营销相关表
  {
    table: 'marketing_campaigns',
    indexes: [
      { name: 'idx_status', columns: ['status'] },
      { name: 'idx_created_at', columns: ['created_at'] }
    ]
  },

  // 5. 任务相关表
  {
    table: 'todos',
    indexes: [
      { name: 'idx_status', columns: ['status'] },
      { name: 'idx_due_date', columns: ['due_date'] },
      { name: 'idx_status_due', columns: ['status', 'due_date'] }
    ]
  },

  // 6. 财务相关表
  {
    table: 'payment_bills',
    indexes: [
      { name: 'idx_status', columns: ['status'] }
    ]
  },
  {
    table: 'payment_records',
    indexes: [
      { name: 'idx_status', columns: ['status'] }
    ]
  },

  // 7. 系统配置表
  {
    table: 'system_configs',
    indexes: [
      { name: 'idx_group_key', columns: ['group_key', 'config_key'] }
    ]
  }
];

/**
 * 检查索引是否存在
 */
async function checkIndexExists(tableName: string, indexName: string): Promise<boolean> {
  try {
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = '${tableName}'
        AND index_name = '${indexName}'
    `);

    return (results[0] as any).count > 0;
  } catch (error) {
    console.error(`检查索引失败 [${tableName}.${indexName}]:`, error);
    return false;
  }
}

/**
 * 创建索引
 */
async function createIndex(tableName: string, indexName: string, columns: string[], unique: boolean = false): Promise<void> {
  try {
    const uniqueStr = unique ? 'UNIQUE' : '';
    const columnsStr = columns.join(', ');
    
    await sequelize.query(`
      CREATE ${uniqueStr} INDEX ${indexName}
      ON ${tableName} (${columnsStr})
    `);

    console.log(`✅ 创建索引成功: ${tableName}.${indexName} (${columnsStr})`);
  } catch (error: any) {
    // 如果索引已存在，忽略错误
    if (error.original?.code === 'ER_DUP_KEYNAME') {
      console.log(`⚠️  索引已存在: ${tableName}.${indexName}`);
    } else {
      console.error(`❌ 创建索引失败 [${tableName}.${indexName}]:`, error.message);
    }
  }
}

/**
 * 优化表
 */
async function optimizeTable(tableName: string): Promise<void> {
  try {
    await sequelize.query(`OPTIMIZE TABLE ${tableName}`);
    console.log(`✅ 优化表成功: ${tableName}`);
  } catch (error: any) {
    console.error(`❌ 优化表失败 [${tableName}]:`, error.message);
  }
}

/**
 * 分析表
 */
async function analyzeTable(tableName: string): Promise<void> {
  try {
    await sequelize.query(`ANALYZE TABLE ${tableName}`);
    console.log(`✅ 分析表成功: ${tableName}`);
  } catch (error: any) {
    console.error(`❌ 分析表失败 [${tableName}]:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始优化业务中心数据库索引...\n');

  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 创建索引
    for (const tableInfo of indexesToCreate) {
      console.log(`\n📊 处理表: ${tableInfo.table}`);
      
      for (const index of tableInfo.indexes) {
        const exists = await checkIndexExists(tableInfo.table, index.name);
        
        if (exists) {
          console.log(`⏭️  跳过已存在的索引: ${tableInfo.table}.${index.name}`);
          skippedCount++;
        } else {
          await createIndex(tableInfo.table, index.name, index.columns, index.unique);
          createdCount++;
        }
      }

      // 优化和分析表
      await optimizeTable(tableInfo.table);
      await analyzeTable(tableInfo.table);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 索引优化统计:');
    console.log(`  ✅ 创建成功: ${createdCount} 个`);
    console.log(`  ⏭️  跳过已存在: ${skippedCount} 个`);
    console.log(`  ❌ 创建失败: ${errorCount} 个`);
    console.log('='.repeat(60));

    // 显示性能分析建议
    console.log('\n📈 性能分析建议:');
    console.log('  1. 使用 EXPLAIN 分析查询计划');
    console.log('  2. 监控慢查询日志');
    console.log('  3. 定期运行 OPTIMIZE TABLE');
    console.log('  4. 使用 Redis 缓存热点数据');

    console.log('\n✅ 业务中心数据库索引优化完成！');

  } catch (error) {
    console.error('❌ 优化过程中发生错误:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

