/**
 * 更新AI模型配置
 * 1. 将 doubao-seedream-4-5-251128 设为文生图默认模型
 * 2. 将 doubao-seedream-3-0-t2i-250415 设为非默认
 * 3. 确保配置正确
 */

const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function updateAIModelConfig() {
  try {
    console.log('🚀 开始更新AI模型配置...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查看当前文生图模型状态
    console.log('📋 当前文生图模型状态:');
    const [currentModels] = await sequelize.query(`
      SELECT name, display_name, provider, model_type, is_default, status
      FROM ai_model_config
      WHERE model_type = 'image' AND provider LIKE '%doubao%'
      ORDER BY is_default DESC, name
    `);
    console.table(currentModels);
    console.log('');

    // 2. 将旧模型设为非默认
    console.log('🔄 将旧模型 doubao-seedream-3-0-t2i-250415 设为非默认...');
    const [updateOld] = await sequelize.query(`
      UPDATE ai_model_config
      SET is_default = 0, updated_at = NOW()
      WHERE name = 'doubao-seedream-3-0-t2i-250415'
    `);
    console.log(`   ✅ 更新了 ${updateOld} 行`);

    // 3. 将新模型设为默认
    console.log('🔄 将新模型 doubao-seedream-4-5-251128 设为默认...');
    const [updateNew] = await sequelize.query(`
      UPDATE ai_model_config
      SET is_default = 1, updated_at = NOW()
      WHERE name = 'doubao-seedream-4-5-251128'
    `);
    console.log(`   ✅ 更新了 ${updateNew} 行`);

    // 4. 更新新模型的配置信息（如果需要）
    console.log('🔧 更新新模型配置参数...');
    const [updateConfig] = await sequelize.query(`
      UPDATE ai_model_config
      SET model_parameters = JSON_OBJECT(
        'temperature', 0.7,
        'max_tokens', 14400,
        'top_p', 0.9,
        'frequency_penalty', 0,
        'presence_penalty', 0,
        'supports_tools', false,
        'supports_multimodal', true,
        'supports_images', true,
        'model_id', '251128',
        'quality', 'high',
        'style', 'natural',
        'min_pixels', 3686400,
        'default_size', '1920x1920'
      ),
      capabilities = JSON_OBJECT(
        'text_to_image', true,
        'image_quality', 'ultra_high',
        'styles', JSON_ARRAY('natural', 'cartoon', 'realistic', 'artistic'),
        'sizes', JSON_ARRAY('1920x1920', '2048x2048', '1024x2048', '2048x1024')
      ),
      max_tokens = 14400,
      updated_at = NOW()
      WHERE name = 'doubao-seedream-4-5-251128'
    `);
    console.log(`   ✅ 更新了 ${updateConfig} 行`);

    // 5. 验证更新结果
    console.log('\n📋 更新后的文生图模型状态:');
    const [updatedModels] = await sequelize.query(`
      SELECT name, display_name, provider, model_type, is_default, status, max_tokens
      FROM ai_model_config
      WHERE model_type = 'image' AND provider LIKE '%doubao%'
      ORDER BY is_default DESC, name
    `);
    console.table(updatedModels);

    // 6. 显示默认模型信息
    console.log('\n🎯 当前默认文生图模型详情:');
    const [defaultModel] = await sequelize.query(`
      SELECT name, display_name, provider, endpoint_url, api_key, model_parameters, capabilities
      FROM ai_model_config
      WHERE model_type = 'image' AND is_default = 1
    `);

    if (defaultModel.length > 0) {
      const model = defaultModel[0];
      console.log(`   名称: ${model.name}`);
      console.log(`   显示: ${model.display_name}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   端点: ${model.endpoint_url}`);
      console.log(`   API密钥: ${model.api_key.substring(0, 10)}...`);
      console.log(`   最大tokens: ${model.max_tokens}`);
      console.log(`   状态: ${model.status}`);
      console.log(`   是否默认: ${model.is_default ? '是' : '否'}`);

      if (model.model_parameters) {
        const params = typeof model.model_parameters === 'string'
          ? JSON.parse(model.model_parameters)
          : model.model_parameters;
        console.log(`   默认尺寸: ${params.default_size || '1920x1920'}`);
        console.log(`   最小像素: ${params.min_pixels || '3686400'}`);
      }
    } else {
      console.log('⚠️  未找到默认文生图模型');
    }

    console.log('\n✅ AI模型配置更新完成！');

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行更新
updateAIModelConfig();