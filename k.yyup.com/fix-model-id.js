/**
 * 修复豆包Seed-1.6模型ID
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function fixModelId() {
  try {
    console.log('🔧 开始修复豆包Seed-1.6模型ID...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 更新模型ID和name
    const [results, metadata] = await sequelize.query(`
      UPDATE ai_model_config 
      SET 
        name = 'doubao-seed-1-6-250615',
        model_parameters = JSON_SET(
          model_parameters, 
          '$.model_id', 'doubao-seed-1-6-250615'
        ),
        updated_at = NOW()
      WHERE name = 'Doubao-Seed-1.6' OR name = '250615'
    `);

    console.log('✅ 模型ID更新成功，影响行数:', metadata.affectedRows);

    // 验证更新结果
    console.log('🔍 验证更新结果...');
    const [verifyResults] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        provider,
        model_type,
        endpoint_url,
        status,
        is_default,
        JSON_EXTRACT(model_parameters, '$.model_id') as model_id,
        capabilities
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1-6-250615'
    `);

    if (verifyResults.length > 0) {
      console.log('📊 更新后的模型配置:');
      console.table(verifyResults);
      console.log('✅ 模型ID修复成功！');
      console.log('🎯 新的模型ID: doubao-seed-1-6-250615');
    } else {
      console.log('❌ 未找到更新后的模型配置');
    }

  } catch (error) {
    console.error('❌ 修复模型ID失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixModelId()
  .then(() => {
    console.log('✅ 模型ID修复完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });
