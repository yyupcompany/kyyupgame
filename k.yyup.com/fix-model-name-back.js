import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixModelNameBack() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 将模型名称改回正确的 Doubao-pro-128k
    console.log('\n🔧 修复模型名称为正确的 Doubao-pro-128k...');
    const [results] = await sequelize.query(`
      UPDATE ai_model_config 
      SET name = 'Doubao-pro-128k'
      WHERE name = 'Doubao-1.5-pro-32k' AND model_type = 'text'
    `);

    console.log('✅ 模型名称已更新为 Doubao-pro-128k');

    // 验证更新结果
    console.log('\n📋 验证更新结果...');
    const [updatedResults] = await sequelize.query(`
      SELECT id, name, provider, model_type, status, is_default 
      FROM ai_model_config 
      WHERE model_type = 'text' AND status = 'active'
    `);

    console.log('📊 更新后的文本模型:');
    updatedResults.forEach(config => {
      console.log(`  - ${config.name} (${config.model_type}) - ${config.provider} - Default: ${config.is_default}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixModelNameBack();
