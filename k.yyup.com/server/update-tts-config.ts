/**
 * 更新TTS配置到数据库
 * 使用单向流式WebSocket V3配置
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function updateTTSConfig() {
  try {
    console.log('🔍 查询现有TTS配置...\n');
    
    // 查询现有TTS配置
    const [existing] = await sequelize.query(`
      SELECT id, name, display_name, provider, model_type, endpoint_url, api_key, status 
      FROM ai_model_config 
      WHERE model_type = 'tts' OR name LIKE '%tts%'
      ORDER BY id
    `);
    
    console.log('现有TTS配置:');
    console.log(existing);
    console.log('');
    
    // 更新或插入V3双向流式配置
    console.log('📝 更新TTS V3双向流式配置...\n');

    const updateQuery = `
      INSERT INTO ai_model_config (
        name,
        display_name,
        model_type,
        provider,
        api_version,
        endpoint_url,
        api_key,
        model_parameters,
        status,
        is_default,
        description,
        created_at,
        updated_at
      ) VALUES (
        'volcengine-tts-v3-bidirection',
        '火山引擎TTS V3双向流式',
        'tts',
        'bytedance_doubao',
        'v3',
        'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
        '7563592522',
        '{"appKey":"7563592522","accessKey":"jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3","resourceId":"volc.service_type.10029","speaker":"zh_female_cancan_mars_bigtts","format":"mp3","sampleRate":24000}',
        'active',
        1,
        '火山引擎TTS V3双向流式WebSocket服务，支持实时流式传输和在线语音交互',
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        endpoint_url = VALUES(endpoint_url),
        api_key = VALUES(api_key),
        model_parameters = VALUES(model_parameters),
        api_version = VALUES(api_version),
        description = VALUES(description),
        updated_at = NOW()
    `;
    
    await sequelize.query(updateQuery);
    
    console.log('✅ TTS配置已更新\n');
    
    // 查询更新后的配置
    const [updated] = await sequelize.query(`
      SELECT id, name, display_name, provider, model_type, endpoint_url,
             LEFT(api_key, 40) as api_key_preview, model_parameters, status, is_default
      FROM ai_model_config
      WHERE name = 'volcengine-tts-v3-bidirection'
    `);
    
    console.log('更新后的配置:');
    console.log(updated);
    
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

updateTTSConfig()
  .then(() => {
    console.log('\n✅ 完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 失败:', error.message);
    process.exit(1);
  });

