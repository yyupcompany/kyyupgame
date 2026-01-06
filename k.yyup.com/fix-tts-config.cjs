/**
 * 修复TTS模型配置
 * 将HTTP端点改为V3 WebSocket端点
 */

const { Sequelize, DataTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixTTSConfig() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    console.log('📝 修复TTS模型配置...\n');
    
    // 方案1: 将doubao-tts-bigmodel改为使用V3双向流式端点
    const [updateResult] = await sequelize.query(`
      UPDATE ai_model_config
      SET 
        endpoint_url = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
        model_parameters = JSON_SET(
          COALESCE(model_parameters, '{}'),
          '$.appKey', '7563592522',
          '$.accessKey', 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
          '$.resourceId', 'volc.service_type.10029',
          '$.speaker', 'zh_female_cancan_mars_bigtts',
          '$.sampleRate', 24000,
          '$.format', 'mp3'
        )
      WHERE name = 'doubao-tts-bigmodel'
    `);
    
    console.log('✅ 已更新doubao-tts-bigmodel配置');
    console.log(`   影响行数: ${updateResult.affectedRows || 0}\n`);
    
    // 验证更新结果
    const [models] = await sequelize.query(`
      SELECT 
        id, name, display_name, endpoint_url, 
        api_key, model_parameters
      FROM ai_model_config
      WHERE name = 'doubao-tts-bigmodel'
    `);
    
    if (models.length > 0) {
      const model = models[0];
      console.log('📊 更新后的配置:');
      console.log(`   ID: ${model.id}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   端点URL: ${model.endpoint_url}`);
      console.log(`   API Key: ${model.api_key}`);
      
      if (model.model_parameters) {
        const params = typeof model.model_parameters === 'string' 
          ? JSON.parse(model.model_parameters) 
          : model.model_parameters;
        console.log(`   模型参数:`, JSON.stringify(params, null, 2));
      }
      
      console.log('\n✅ 配置修复完成！');
      console.log('\n📋 下一步:');
      console.log('   1. 重启后端服务（或等待自动重载）');
      console.log('   2. 运行测试: node test-local-tts-api.cjs');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixTTSConfig();

