/**
 * 添加正确的豆包Seed-1.6-Thinking模型
 */

import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addCorrectDoubao() {
  try {
    console.log('🚀 添加正确的豆包Seed-1.6-Thinking模型...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 先检查是否已存在
    const [existing] = await sequelize.query(`
      SELECT name FROM ai_model_config 
      WHERE name = 'doubao-seed-1-6-thinking-250715'
    `);
    
    if (existing.length > 0) {
      console.log('⚠️ 豆包Seed-1.6-Thinking模型已存在，跳过添加');
    } else {
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
          'doubao-seed-1-6-thinking-250715',
          '豆包Seed-1.6-Thinking（工具调用+多模态+思考）',
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
            'model_id', 'doubao-seed-1-6-thinking-250715'
          ),
          false,
          'active',
          '豆包Seed-1.6-Thinking模型，支持工具调用、多模态输入（图片理解）、深度思考模式，适用于复杂任务处理和组件调用',
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
      
      console.log('✅ 豆包Seed-1.6-Thinking模型添加成功');
    }
    
    // 验证最终结果
    console.log('\n🔍 验证豆包模型配置...');
    const [doubaoModels] = await sequelize.query(`
      SELECT 
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
      WHERE name LIKE '%doubao%' AND status = 'active'
      ORDER BY created_at DESC
    `);
    
    console.log('📊 豆包模型配置列表:');
    console.table(doubaoModels);
    
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
    
    // 检查正确的豆包模型
    const correctDoubao = doubaoModels.find(m => m.name === 'doubao-seed-1-6-thinking-250715');
    if (correctDoubao) {
      console.log('\n🎉 正确的豆包Seed-1.6-Thinking模型配置完成！');
      console.log('✅ 模型名称:', correctDoubao.name);
      console.log('✅ 显示名称:', correctDoubao.display_name);
      console.log('✅ API端点:', correctDoubao.endpoint_url);
      console.log('✅ 模型ID:', correctDoubao.model_id);
      console.log('✅ 工具调用支持:', correctDoubao.supports_tools ? '是' : '否');
      console.log('✅ 多模态支持:', correctDoubao.supports_multimodal ? '是' : '否');
      console.log('✅ 思考模式支持:', correctDoubao.supports_thinking ? '是' : '否');
      
      console.log('\n🧪 现在可以测试豆包Seed-1.6-Thinking模型的完整功能！');
    }

  } catch (error) {
    console.error('❌ 添加豆包模型失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行添加
addCorrectDoubao()
  .then(() => {
    console.log('✅ 豆包模型配置完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 配置失败:', error);
    process.exit(1);
  });
