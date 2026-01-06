const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeSqlScript() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'Aa123456.',
    database: 'kargerdensales',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 开始执行数据库索引优化脚本...');

    // 读取SQL脚本
    const sqlScript = fs.readFileSync(path.join(__dirname, 'server/migrations/optimize-performance.sql'), 'utf8');

    // 分割SQL语句
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    // 逐个执行SQL语句
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          successCount++;
          console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
        } catch (error) {
          errorCount++;
          console.log(`⚠️  执行跳过: ${statement.substring(0, 50)}...`);
          console.log(`   原因: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 执行完成统计:`);
    console.log(`   ✅ 成功: ${successCount} 条语句`);
    console.log(`   ⚠️  跳过: ${errorCount} 条语句`);

    // 验证索引创建结果
    const [indexes] = await connection.execute(`
      SELECT COUNT(*) as total_indexes,
             COUNT(DISTINCT TABLE_NAME) as tables_optimized
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = 'kargerdensales'
        AND INDEX_NAME LIKE 'idx_%'
    `);

    console.log(`\n📈 索引优化结果:`);
    console.log(`   📊 总索引数: ${indexes[0].total_indexes}`);
    console.log(`   📋 优化表数: ${indexes[0].tables_optimized}`);

    console.log('\n🎉 数据库索引优化完成！');

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

executeSqlScript();