import { getSequelize } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 数据库索引优化脚本执行器
 * 通过项目的Sequelize连接执行索引优化
 */
export async function executeDatabaseOptimization() {
  console.log('🚀 开始执行数据库索引优化...');

  const sequelize = getSequelize();

  try {
    // 读取SQL脚本
    const sqlScriptPath = path.join(__dirname, '../../migrations/optimize-performance.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

    console.log('📖 SQL脚本读取成功，开始执行索引优化...');

    // 分割SQL语句
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    // 逐个执行SQL语句
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // 跳过事务控制语句
          if (statement.toUpperCase().includes('START TRANSACTION') ||
              statement.toUpperCase().includes('COMMIT') ||
              statement.toUpperCase().includes('BEGIN')) {
            skipCount++;
            continue;
          }

          await sequelize.query(statement);
          successCount++;
          console.log(`✅ 执行成功: ${statement.substring(0, 60)}...`);
        } catch (error: any) {
          // 跳过已存在的索引错误
          if (error.message.includes('Duplicate key name') ||
              error.message.includes('already exists') ||
              error.message.includes('table already exists')) {
            skipCount++;
            console.log(`⏭️  跳过已存在: ${statement.substring(0, 60)}...`);
          } else {
            errorCount++;
            console.log(`⚠️  执行失败: ${statement.substring(0, 60)}...`);
            console.log(`   错误: ${error.message}`);
          }
        }
      }
    }

    console.log(`\n📊 执行完成统计:`);
    console.log(`   ✅ 成功: ${successCount} 条语句`);
    console.log(`   ⏭️  跳过: ${skipCount} 条语句`);
    console.log(`   ❌ 失败: ${errorCount} 条语句`);

    // 验证索引创建结果
    const [indexes] = await sequelize.query(`
      SELECT COUNT(*) as total_indexes,
             COUNT(DISTINCT TABLE_NAME) as tables_optimized
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND INDEX_NAME LIKE 'idx_%'
    `);

    console.log(`\n📈 索引优化结果:`);
    console.log(`   📊 总索引数: ${(indexes[0] as any).total_indexes}`);
    console.log(`   📋 优化表数: ${(indexes[0] as any).tables_optimized}`);

    // 查看具体创建的索引
    const [indexDetails] = await sequelize.query(`
      SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND INDEX_NAME LIKE 'idx_%'
      GROUP BY TABLE_NAME, INDEX_NAME
      ORDER BY TABLE_NAME, INDEX_NAME
      LIMIT 20
    `);

    console.log(`\n📋 新创建的索引示例:`);
    (indexDetails as any[]).forEach((index: any) => {
      console.log(`   🏷️  ${index.TABLE_NAME}.${index.INDEX_NAME} (${index.columns})`);
    });

    if ((indexDetails as any[]).length > 20) {
      console.log(`   ... 还有 ${(indexes[0] as any).total_indexes - 20} 个索引`);
    }

    console.log('\n🎉 数据库索引优化完成！');
    console.log('💡 建议：重启应用以使索引优化生效');

    return {
      success: true,
      totalIndexes: (indexes[0] as any).total_indexes,
      tablesOptimized: (indexes[0] as any).tables_optimized,
      successCount,
      errorCount,
      skipCount
    };

  } catch (error) {
    console.error('❌ 索引优化失败:', error);
    throw error;
  }
}

/**
 * 测试索引优化效果
 */
export async function testIndexOptimization() {
  console.log('🧪 开始测试索引优化效果...');

  const sequelize = getSequelize();

  try {
    // 测试系统中心查询性能
    console.time('系统用户查询');
    const [systemUsers] = await sequelize.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.status = 'active'
      ORDER BY u.created_at DESC
      LIMIT 50
    `);
    console.timeEnd('系统用户查询');

    // 测试财务查询性能
    console.time('财务统计查询');
    const [financeStats] = await sequelize.query(`
      SELECT
        COUNT(*) as total_bills,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
      FROM payment_bills
      WHERE status = 'pending'
    `);
    console.timeEnd('财务统计查询');

    // 测试活动查询性能
    console.time('活动数据查询');
    const [activities] = await sequelize.query(`
      SELECT a.*, COUNT(ar.id) as registration_count
      FROM activities a
      LEFT JOIN activity_registrations ar ON a.id = ar.activity_id
      WHERE a.status = 'published'
      GROUP BY a.id
      ORDER BY a.start_time DESC
      LIMIT 20
    `);
    console.timeEnd('活动数据查询');

    console.log('✅ 索引优化效果测试完成');

    return {
      systemUsersCount: (systemUsers as any[]).length,
      financeStats: financeStats[0],
      activitiesCount: (activities as any[]).length
    };

  } catch (error) {
    console.error('❌ 索引优化测试失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    try {
      await executeDatabaseOptimization();
      await testIndexOptimization();
      process.exit(0);
    } catch (error) {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    }
  })();
}