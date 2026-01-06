import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixDefaultModels() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查看当前默认模型
    console.log('\n📋 查看当前默认模型...');
    const [currentDefaults] = await sequelize.query(`
      SELECT id, name, model_type, provider, is_default 
      FROM ai_model_config 
      WHERE is_default = 1
    `);

    console.log('📊 当前默认模型:');
    currentDefaults.forEach(config => {
      console.log(`  - ${config.name} (${config.model_type}) - ${config.provider} - ID: ${config.id}`);
    });

    // 只保留文本类型的模型为默认
    console.log('\n🔧 修复默认模型设置...');
    
    // 首先将所有模型设为非默认
    await sequelize.query(`
      UPDATE ai_model_config 
      SET is_default = 0
    `);
    
    // 然后只将文本类型的模型设为默认
    await sequelize.query(`
      UPDATE ai_model_config 
      SET is_default = 1
      WHERE model_type = 'text' AND name = 'Doubao-1.5-pro-32k'
    `);

    console.log('✅ 默认模型设置已修复');

    // 验证修复结果
    console.log('\n📋 验证修复结果...');
    const [updatedDefaults] = await sequelize.query(`
      SELECT id, name, model_type, provider, is_default 
      FROM ai_model_config 
      WHERE is_default = 1
    `);

    console.log('📊 修复后的默认模型:');
    if (updatedDefaults.length === 0) {
      console.log('  - 无默认模型');
    } else {
      updatedDefaults.forEach(config => {
        console.log(`  - ${config.name} (${config.model_type}) - ${config.provider} - ID: ${config.id}`);
      });
    }

    // 显示所有模型状态
    console.log('\n📋 所有模型状态:');
    const [allModels] = await sequelize.query(`
      SELECT id, name, model_type, provider, is_default, status 
      FROM ai_model_config 
      WHERE status = 'active'
      ORDER BY model_type, is_default DESC
    `);

    allModels.forEach(config => {
      const defaultFlag = config.is_default ? '✅ 默认' : '  ';
      console.log(`  ${defaultFlag} ${config.name} (${config.model_type}) - ${config.provider}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDefaultModels();
