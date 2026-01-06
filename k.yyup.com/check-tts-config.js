import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkTTSConfig() {
  try {
    console.log('🔍 查询TTS模型配置...\n');
    
    // 查询TTS相关的模型配置
    const [results] = await sequelize.query(`
      SELECT 
        id, 
        name, 
        display_name, 
        provider, 
        model_type, 
        endpoint_url, 
        LEFT(api_key, 20) as api_key_preview,
        model_parameters, 
        status, 
        is_default 
      FROM ai_model_config 
      WHERE model_type = 'tts' 
         OR name LIKE '%tts%' 
         OR name LIKE '%speech%'
         OR display_name LIKE '%语音%'
         OR display_name LIKE '%TTS%'
      ORDER BY is_default DESC, id ASC
    `);
    
    if (results.length === 0) {
      console.log('❌ 未找到TTS模型配置');
      console.log('\n🔍 查询所有AI模型配置...\n');
      
      const [allModels] = await sequelize.query(`
        SELECT 
          id, 
          name, 
          display_name, 
          provider, 
          model_type, 
          endpoint_url, 
          LEFT(api_key, 20) as api_key_preview,
          status, 
          is_default 
        FROM ai_model_config 
        ORDER BY model_type, is_default DESC, id ASC
      `);
      
      console.log('📋 所有AI模型配置:');
      console.table(allModels);
    } else {
      console.log('✅ 找到TTS模型配置:');
      console.table(results);
      
      // 显示完整的配置信息
      for (const model of results) {
        console.log(`\n📝 模型详情: ${model.display_name} (${model.name})`);
        console.log(`   ID: ${model.id}`);
        console.log(`   提供商: ${model.provider}`);
        console.log(`   类型: ${model.model_type}`);
        console.log(`   端点: ${model.endpoint_url}`);
        console.log(`   API Key预览: ${model.api_key_preview}...`);
        console.log(`   状态: ${model.status}`);
        console.log(`   默认: ${model.is_default ? '是' : '否'}`);
        
        if (model.model_parameters) {
          try {
            let params = model.model_parameters;
            if (typeof params === 'string') {
              params = JSON.parse(params);
            }
            console.log(`   模型参数:`, JSON.stringify(params, null, 2));
          } catch (e) {
            console.log(`   模型参数: ${JSON.stringify(model.model_parameters)}`);
          }
        }
      }
      
      // 获取完整的API Key用于测试
      console.log('\n🔑 获取完整API Key用于测试...');
      const [fullConfig] = await sequelize.query(`
        SELECT api_key, endpoint_url, model_parameters
        FROM ai_model_config
        WHERE (model_type = 'tts' OR model_type = 'speech')
          AND status = 'active'
        ORDER BY is_default DESC
        LIMIT 1
      `);
      
      if (fullConfig.length > 0) {
        const config = fullConfig[0];
        console.log('\n✅ TTS配置信息:');
        console.log(`   端点: ${config.endpoint_url}`);
        console.log(`   API Key: ${config.api_key}`);

        // 解析模型参数
        let modelParams = {};
        if (config.model_parameters) {
          try {
            modelParams = config.model_parameters;
            if (typeof modelParams === 'string') {
              modelParams = JSON.parse(modelParams);
            }
            console.log(`   模型参数:`, JSON.stringify(modelParams, null, 2));
          } catch (e) {
            console.log(`   模型参数解析失败: ${JSON.stringify(config.model_parameters)}`);
          }
        }

        // 生成curl测试命令
        console.log('\n📋 curl测试命令:');
        console.log('```bash');
        console.log(`curl -X POST "${config.endpoint_url}" \\`);
        console.log(`  -H "Authorization: Bearer ${config.api_key}" \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{`);
        console.log(`    "model": "${modelParams.model || 'tts-1-hd'}",`);
        console.log(`    "input": "春风里，和孩子一起放一只会飞的快乐",`);
        console.log(`    "voice": "${modelParams.voice || 'alloy'}",`);
        console.log(`    "speed": ${modelParams.speed || 1},`);
        console.log(`    "response_format": "${modelParams.response_format || 'mp3'}"`);
        console.log(`  }' \\`);
        console.log(`  --output test-audio.mp3`);
        console.log('```');
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }
}

checkTTSConfig();

