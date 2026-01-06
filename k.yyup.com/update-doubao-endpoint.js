/**
 * 更新豆包Seed-1.6的API端点
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function updateDoubaoEndpoint() {
  try {
    console.log('🔧 开始更新豆包Seed-1.6 API端点...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 更新API端点
    const [results, metadata] = await sequelize.query(`
      UPDATE ai_model_config 
      SET 
        endpoint_url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        updated_at = NOW()
      WHERE name = 'doubao-seed-1.6-250615'
    `);

    console.log('✅ API端点更新成功，影响行数:', metadata.affectedRows);

    // 验证更新结果
    console.log('🔍 验证更新结果...');
    const [verifyResults] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        endpoint_url,
        api_key,
        status,
        JSON_EXTRACT(model_parameters, '$.model_id') as model_id
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1.6-250615'
    `);

    if (verifyResults.length > 0) {
      console.log('📊 更新后的配置:');
      console.table(verifyResults);
      console.log('✅ API端点更新成功！');
      console.log('🌐 新端点: https://ark.cn-beijing.volces.com/api/v3/chat/completions');
    } else {
      console.log('❌ 未找到更新后的配置');
    }

  } catch (error) {
    console.error('❌ 更新API端点失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行更新
updateDoubaoEndpoint()
  .then(() => {
    console.log('✅ API端点更新完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  });
