const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const [results] = await sequelize.query("SHOW TABLES LIKE 'activity_shares'");
    
    if (results.length > 0) {
      console.log('✅ activity_shares 表已存在');
      
      // 查看表结构
      const [columns] = await sequelize.query("DESCRIBE activity_shares");
      console.log('\n📋 表结构:');
      console.table(columns);
      
      // 查看记录数
      const [count] = await sequelize.query("SELECT COUNT(*) as count FROM activity_shares");
      console.log(`\n📊 当前记录数: ${count[0].count}`);
    } else {
      console.log('❌ activity_shares 表不存在，需要创建');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkTable();

