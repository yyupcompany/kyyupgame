const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
});

async function checkTable() {
  try {
    console.log('🔍 检查video_projects表结构...\n');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 查询表结构
    const [results] = await sequelize.query('DESCRIBE video_projects');
    
    console.log('📋 表结构:');
    console.table(results);
    
    // 检查是否需要初始化模型
    console.log('\n🔧 检查模型是否已在models/index.ts中初始化...');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTable();

