const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  dialect: 'mysql',
  logging: console.log,
  timezone: '+08:00'
});

async function testDatabase() {
  try {
    console.log('🔧 测试远端数据库连接...');
    console.log(`   主机: dbconn.sealoshzh.site:43906`);
    console.log(`   数据库: kargerdensales`);
    console.log(`   用户: root`);
    console.log(`   密码: pwk5l****`);
    console.log('');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功!\n');
    
    // 获取所有表
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 数据库中共有 ${tables.length} 个表\n`);
    
    // 查找assessment和task相关的表
    const assessmentTables = tables.filter(t => 
      t.includes('assessment') || 
      t.includes('task') ||
      t.includes('physical')
    );
    
    console.log('📋 Assessment 和 Task 相关的表:');
    if (assessmentTables.length > 0) {
      assessmentTables.forEach(t => console.log(`   ✓ ${t}`));
    } else {
      console.log('   ❌ 未找到相关表');
    }
    
    // 检查必需的表
    const requiredTables = [
      'assessment_configs',
      'assessment_questions',
      'assessment_physical_items',
      'assessment_records',
      'tasks',
      'task_comments',
      'task_attachments'
    ];
    
    console.log('\n🔍 检查必需的表:');
    for (const table of requiredTables) {
      const exists = tables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }
    
    // 如果缺少表，给出创建建议
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n⚠️  缺少以下表:');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 建议: 需要运行migration来创建缺失的表');
    }
    
    await sequelize.close();
    console.log('\n✅ 数据库检查完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库连接或查询失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDatabase();
