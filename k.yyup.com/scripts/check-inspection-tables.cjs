const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkTables() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有与检查中心相关的表
    const [inspectionTables] = await sequelize.query(`SHOW TABLES LIKE '%inspection%'`);
    const [documentTables] = await sequelize.query(`SHOW TABLES LIKE '%document%'`);
    const tables = [...inspectionTables, ...documentTables];

    console.log('📋 检查中心相关数据表:');
    console.log('='.repeat(60));
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📊 表名: ${tableName}`);
      
      // 查询表结构
      const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
      console.log(`   字段数: ${columns.length}`);
      
      // 查询数据量
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   数据量: ${count[0].count} 条`);
      
      // 显示字段列表
      console.log('   字段列表:');
      columns.forEach((col, index) => {
        console.log(`     ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ 总计: ${tables.length} 个表`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

checkTables();

