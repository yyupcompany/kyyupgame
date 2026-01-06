const { sequelize } = require('./src/models');

async function checkNotificationSchema() {
  try {
    console.log('🔍 检查 notifications 表结构...');

    // 查询表结构
    const [results] = await sequelize.query(`
      DESCRIBE notifications
    `);

    console.log('📋 notifications 表字段:');
    results.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n🔍 检查是否有 cancelled_at 字段...');
    const hasCancelledAt = results.some(row => row.Field === 'cancelled_at');
    console.log(hasCancelledAt ? '✅ cancelled_at 字段存在' : '❌ cancelled_at 字段不存在');

    console.log('\n🔍 检查表中的数据...');
    const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`📊 notifications 表中有 ${countResult[0].count} 条记录`);

    if (countResult[0].count > 0) {
      const [sampleData] = await sequelize.query('SELECT * FROM notifications LIMIT 3');
      console.log('📝 示例数据:');
      console.log(JSON.stringify(sampleData, null, 2));
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkNotificationSchema();