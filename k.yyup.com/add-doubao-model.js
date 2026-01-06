/**
 * 添加豆包Seed-1.6模型（保留现有模型）
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'Aa123456', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addDoubaoModel() {
  try {
    console.log('🚀 开始添加豆包Seed-1.6模型（保留现有模型）...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 首先查看现有模型
    console.log('📋 查看现有模型列表...');
    const [existingModels] = await sequelize.query(`
      SELECT name, display_name, provider, status, is_default
      FROM ai_model_config 
      WHERE model_type = 'text' AND status = 'active'
      ORDER BY is_default DESC, created_at ASC
    `);
    
    console.log('现有活跃模型:');
    console.table(existingModels);
    
    // 检查豆包模型是否已存在
    const doubaoExists = existingModels.some(m => m.name === 'doubao-seed-1.6-250615');
    
    if (doubaoExists) {
      console.log('⚠️ 豆包Seed-1.6模型已存在，更新配置...');
      
      // 更新现有配置
      const [updateResults] = await sequelize.query(`
        UPDATE ai_model_config 
        SET 
          endpoint_url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
          api_key = '99944eb3-b9bf-46f2-940e-3ee480b699a0',
          model_parameters = JSON_OBJECT(
            'temperature', 0.7,
            'max_tokens', 4096,
            'top_p', 0.9,
            'frequency_penalty', 0,
            'presence_penalty', 0,
            'supports_tools', true,
            'supports_multimodal', true,
            'supports_thinking', true,
            'model_id', 'doubao-seed-1.6-250615'
          ),
          status = 'active',
          updated_at = NOW()
        WHERE name = 'doubao-seed-1.6-250615'
      `);
      
      console.log('✅ 豆包模型配置更新成功');
      
    } else {
      console.log('➕ 添加新的豆包Seed-1.6模型...');
      
      // 添加新的豆包模型
      const [insertResults] = await sequelize.query(`
        INSERT INTO ai_model_config (
          name,
          display_name,
          provider,
          model_type,
          api_version,
          endpoint_url,
          api_key,
          model_parameters,
          is_default,
          status,
          description,
          capabilities,
          max_tokens,
          creator_id,
          created_at,
          updated_at
        ) VALUES (
          'doubao-seed-1.6-250615',
          '豆包Seed-1.6（工具调用+多模态）',
          'ByteDance',
          'text',
          'v3',
          'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
          '99944eb3-b9bf-46f2-940e-3ee480b699a0',
          JSON_OBJECT(
            'temperature', 0.7,
            'max_tokens', 4096,
            'top_p', 0.9,
            'frequency_penalty', 0,
            'presence_penalty', 0,
            'supports_tools', true,
            'supports_multimodal', true,
            'supports_thinking', true,
            'model_id', 'doubao-seed-1.6-250615'
          ),
          false,
          'active',
          '豆包Seed-1.6模型，支持工具调用、多模态输入（图片理解）、思考模式，适用于复杂任务处理和组件调用',
          JSON_ARRAY(
            'text_generation', 
            'tool_calling', 
            'multimodal', 
            'image_understanding',
            'thinking_mode',
            'function_calling',
            'component_rendering'
          ),
          4096,
          1,
          NOW(),
          NOW()
        )
      `);
      
      console.log('✅ 豆包Seed-1.6模型添加成功');
    }
    
    // 验证最终结果
    console.log('\n🔍 验证最终配置...');
    const [finalModels] = await sequelize.query(`
      SELECT 
        name,
        display_name,
        provider,
        endpoint_url,
        status,
        is_default,
        JSON_EXTRACT(model_parameters, '$.supports_tools') as supports_tools,
        JSON_EXTRACT(model_parameters, '$.supports_multimodal') as supports_multimodal,
        JSON_EXTRACT(model_parameters, '$.model_id') as model_id
      FROM ai_model_config 
      WHERE model_type = 'text' AND status = 'active'
      ORDER BY is_default DESC, created_at ASC
    `);
    
    console.log('📊 最终模型配置列表:');
    console.table(finalModels);
    
    // 检查豆包模型
    const doubaoModel = finalModels.find(m => m.name === 'doubao-seed-1.6-250615');
    if (doubaoModel) {
      console.log('\n🎉 豆包Seed-1.6模型配置完成！');
      console.log('✅ 模型名称:', doubaoModel.name);
      console.log('✅ 显示名称:', doubaoModel.display_name);
      console.log('✅ API端点:', doubaoModel.endpoint_url);
      console.log('✅ 工具调用支持:', doubaoModel.supports_tools ? '是' : '否');
      console.log('✅ 多模态支持:', doubaoModel.supports_multimodal ? '是' : '否');
      console.log('✅ 模型ID:', doubaoModel.model_id);
    }
    
    console.log(`\n📈 总计活跃模型数: ${finalModels.length}`);
    console.log('💡 所有现有模型都已保留，豆包Seed-1.6已成功添加！');

  } catch (error) {
    console.error('❌ 添加豆包模型失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行添加
addDoubaoModel()
  .then(() => {
    console.log('✅ 豆包模型添加完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 添加失败:', error);
    process.exit(1);
  });
