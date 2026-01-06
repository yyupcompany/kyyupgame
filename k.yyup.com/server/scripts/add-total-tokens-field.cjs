const { Sequelize } = require('sequelize');

// 数据库配置 - 使用正确的凭据
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addTotalTokensField() {
  try {
    console.log('🔄 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('🔄 添加 total_tokens 字段...');
    
    // 检查字段是否已存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'kargerdensales'
        AND TABLE_NAME = 'ai_model_usage'
        AND COLUMN_NAME = 'total_tokens'
    `);

    if (results.length > 0) {
      console.log('⚠️  total_tokens 字段已存在，跳过添加');
    } else {
      // 添加字段
      await sequelize.query(`
        ALTER TABLE ai_model_usage 
        ADD COLUMN total_tokens INT DEFAULT 0 COMMENT '总token数（prompt_tokens + completion_tokens）'
      `);
      console.log('✅ total_tokens 字段添加成功');
    }

    // 验证字段
    console.log('\n📋 ai_model_usage 表结构:');
    const [columns] = await sequelize.query('DESCRIBE ai_model_usage');
    console.table(columns);

    console.log('\n✅ 操作完成');
  } catch (error) {
    console.error('❌ 操作失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addTotalTokensField();

