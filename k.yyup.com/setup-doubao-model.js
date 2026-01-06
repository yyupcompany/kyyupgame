/**
 * 设置豆包1.6模型配置
 */

const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'Aa123456', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function setupDoubaoModel() {
  try {
    console.log('🚀 开始设置豆包1.6模型配置...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 检查豆包模型是否已存在
    const [existingModels] = await sequelize.query(`
      SELECT id, name, display_name, status 
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1.6-250615'
    `);
    
    if (existingModels.length > 0) {
      console.log('⚠️ 豆包模型已存在，更新配置...');
      
      // 更新现有配置
      await sequelize.query(`
        UPDATE ai_model_config 
        SET 
          endpoint_url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
          api_key = '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
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
          is_default = true,
          updated_at = NOW()
        WHERE name = 'doubao-seed-1.6-250615'
      `);
      
      console.log('✅ 豆包模型配置更新成功');
      
    } else {
      console.log('➕ 添加新的豆包1.6模型...');
      
      // 先将其他模型设为非默认
      await sequelize.query(`
        UPDATE ai_model_config 
        SET is_default = false 
        WHERE is_default = true
      `);
      
      // 添加新的豆包模型
      await sequelize.query(`
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
          '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
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
          true,
          'active',
          '豆包Seed-1.6模型，支持工具调用、多模态输入、思考模式，适用于复杂任务处理',
          JSON_ARRAY(
            'text_generation', 
            'tool_calling', 
            'multimodal', 
            'image_understanding',
            'thinking_mode',
            'function_calling'
          ),
          4096,
          1,
          NOW(),
          NOW()
        )
      `);
      
      console.log('✅ 豆包1.6模型添加成功');
    }
    
    // 验证配置
    const [finalModel] = await sequelize.query(`
      SELECT 
        name,
        display_name,
        provider,
        endpoint_url,
        status,
        is_default,
        JSON_EXTRACT(model_parameters, '$.model_id') as model_id
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1.6-250615'
    `);
    
    if (finalModel.length > 0) {
      const model = finalModel[0];
      console.log('\n🎉 豆包1.6模型配置完成！');
      console.log('✅ 模型名称:', model.name);
      console.log('✅ 显示名称:', model.display_name);
      console.log('✅ 提供商:', model.provider);
      console.log('✅ API端点:', model.endpoint_url);
      console.log('✅ 状态:', model.status);
      console.log('✅ 默认模型:', model.is_default ? '是' : '否');
      console.log('✅ 模型ID:', model.model_id);
    }

  } catch (error) {
    console.error('❌ 设置豆包模型失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行设置
setupDoubaoModel()
  .then(() => {
    console.log('\n✅ 豆包1.6模型设置完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 设置失败:', error);
    process.exit(1);
  });
