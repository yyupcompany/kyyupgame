/**
 * 设置标准版豆包模型为默认模型
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function setDefaultDoubaoStandard() {
  try {
    console.log('🔧 开始设置标准版豆包模型为默认...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 1. 先清除所有默认标记
    console.log('📝 清除所有模型的默认标记...');
    await sequelize.query(`
      UPDATE ai_model_config SET is_default = 0
    `);
    
    // 2. 设置标准版豆包模型为默认
    console.log('🎯 设置标准版豆包模型为默认...');
    const [updateResults] = await sequelize.query(`
      UPDATE ai_model_config 
      SET is_default = 1 
      WHERE name = 'doubao-seed-1.6-250615' AND status = 'active'
    `);
    
    if (updateResults.affectedRows > 0) {
      console.log('✅ 成功设置 doubao-seed-1.6-250615 为默认模型');
    } else {
      console.log('❌ 未找到标准版豆包模型或设置失败');
    }
    
    // 3. 验证设置结果
    console.log('🔍 验证设置结果...');
    const [results] = await sequelize.query(`
      SELECT id, name, display_name, is_default, status
      FROM ai_model_config 
      WHERE is_default = 1
    `);
    
    if (results.length > 0) {
      const defaultModel = results[0];
      console.log('🎉 当前默认模型:');
      console.log(`   ID: ${defaultModel.id}`);
      console.log(`   名称: ${defaultModel.name}`);
      console.log(`   显示名称: ${defaultModel.display_name}`);
      console.log(`   状态: ${defaultModel.status}`);
    } else {
      console.log('❌ 未找到默认模型');
    }
    
    await sequelize.close();
    console.log('✅ 操作完成');
    
  } catch (error) {
    console.error('❌ 设置失败:', error.message);
    process.exit(1);
  }
}

setDefaultDoubaoStandard();
