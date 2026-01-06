/**
 * 修复为正确的豆包模型ID
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function fixCorrectModelId() {
  try {
    console.log('🔧 修复为正确的豆包模型ID...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 更新为正确的模型ID
    const [results] = await sequelize.query(`
      UPDATE ai_model_config 
      SET 
        name = 'doubao-seed-1-6-thinking-250715',
        display_name = '豆包Seed-1.6-Thinking（工具调用+多模态+思考）',
        model_parameters = JSON_SET(
          model_parameters, 
          '$.model_id', 'doubao-seed-1-6-thinking-250715'
        ),
        description = '豆包Seed-1.6-Thinking模型，支持工具调用、多模态输入（图片理解）、深度思考模式，适用于复杂任务处理和组件调用',
        updated_at = NOW()
      WHERE name LIKE '%doubao%' OR name LIKE '%250615%' OR name LIKE '%250715%'
    `);

    console.log('✅ 模型ID更新成功，影响行数:', results.affectedRows);

    // 验证更新结果
    console.log('🔍 验证更新结果...');
    const [verifyResults] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        provider,
        endpoint_url,
        status,
        JSON_EXTRACT(model_parameters, '$.model_id') as model_id,
        JSON_EXTRACT(model_parameters, '$.supports_tools') as supports_tools,
        JSON_EXTRACT(model_parameters, '$.supports_multimodal') as supports_multimodal,
        JSON_EXTRACT(model_parameters, '$.supports_thinking') as supports_thinking
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1-6-thinking-250715'
    `);

    if (verifyResults.length > 0) {
      console.log('📊 更新后的豆包模型配置:');
      console.table(verifyResults);
      console.log('✅ 豆包模型ID修复成功！');
      console.log('🎯 正确的模型ID: doubao-seed-1-6-thinking-250715');
      console.log('🛠️ 支持工具调用:', verifyResults[0].supports_tools ? '是' : '否');
      console.log('🖼️ 支持多模态:', verifyResults[0].supports_multimodal ? '是' : '否');
      console.log('🧠 支持思考模式:', verifyResults[0].supports_thinking ? '是' : '否');
    } else {
      console.log('❌ 未找到更新后的模型配置');
    }

    // 显示所有活跃模型
    console.log('\n📋 所有活跃模型列表:');
    const [allModels] = await sequelize.query(`
      SELECT 
        name,
        display_name,
        provider,
        status,
        is_default
      FROM ai_model_config 
      WHERE model_type = 'text' AND status = 'active'
      ORDER BY is_default DESC, created_at ASC
    `);
    
    console.table(allModels);
    console.log(`\n📈 总计活跃模型数: ${allModels.length}`);

  } catch (error) {
    console.error('❌ 修复模型ID失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixCorrectModelId()
  .then(() => {
    console.log('✅ 豆包模型ID修复完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });
