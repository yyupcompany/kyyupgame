/**
 * 添加豆包新模型 doubao-seedream-4-5-251128 到数据库
 */

const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addDoubaoNewModel() {
  try {
    console.log('🚀 开始添加豆包新模型 doubao-seedream-4-5-251128...');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 首先获取现有的豆包文生图模型配置
    const [existingModel] = await sequelize.query(`
      SELECT name, display_name, provider, endpoint_url, api_key
      FROM ai_model_config
      WHERE name = 'doubao-seedream-3-0-t2i-250415'
    `);

    if (existingModel.length === 0) {
      console.error('❌ 未找到现有的豆包文生图模型配置');
      return;
    }

    const config = existingModel[0];
    console.log('📋 现有模型配置:');
    console.log('   API密钥:', config.api_key);
    console.log('   端点URL:', config.endpoint_url);

    // 添加新模型配置
    const [result] = await sequelize.query(`
      INSERT INTO ai_model_config (
        name,
        display_name,
        provider,
        model_type,
        api_version,
        endpoint_url,
        api_key,
        model_parameters,
        status,
        is_default,
        description,
        capabilities,
        created_at,
        updated_at
      ) VALUES (
        'doubao-seedream-4-5-251128',
        'Doubao SeedDream 4.5 (文生图升级版)',
        'bytedance_doubao',
        'image',
        'v3',
        '${config.endpoint_url}',
        '${config.api_key}',
        JSON_OBJECT(
          'temperature', 0.7,
          'max_tokens', 1000,
          'top_p', 0.9,
          'frequency_penalty', 0,
          'presence_penalty', 0,
          'supports_tools', false,
          'supports_multimodal', true,
          'supports_images', true,
          'model_id', '251128',
          'quality', 'standard',
          'style', 'natural'
        ),
        'active',
        0,
        '豆包 SeedDream 4.5 文生图模型，升级版图片生成能力',
        JSON_OBJECT(
          'text_to_image', true,
          'image_quality', 'high',
          'styles', JSON_ARRAY('natural', 'cartoon', 'realistic', 'artistic')
        ),
        NOW(),
        NOW()
      )
    `);

    console.log('✅ 新模型添加成功!');
    console.log('   模型名称: doubao-seedream-4-5-251128');
    console.log('   显示名称: Doubao SeedDream 4.5 (文生图升级版)');
    console.log('   API密钥:', config.api_key);
    console.log('   端点URL:', config.endpoint_url);

  } catch (error) {
    console.error('❌ 添加模型失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行
addDoubaoNewModel();