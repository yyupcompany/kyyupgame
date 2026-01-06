const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkTTSParams() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    const [ttsModels] = await sequelize.query(`
      SELECT 
        id, name, display_name, endpoint_url, 
        api_key, model_parameters
      FROM ai_model_config
      WHERE name = 'volcengine-tts-v3-unidirectional'
      LIMIT 1
    `);

    if (ttsModels.length > 0) {
      const model = ttsModels[0];
      console.log('📊 TTS模型详细配置:\n');
      console.log(`模型名称: ${model.name}`);
      console.log(`显示名称: ${model.display_name}`);
      console.log(`端点URL: ${model.endpoint_url}`);
      console.log(`API Key: ${model.api_key}`);
      console.log(`\n模型参数 (JSON):`);
      
      if (model.model_parameters) {
        const params = typeof model.model_parameters === 'string' 
          ? JSON.parse(model.model_parameters) 
          : model.model_parameters;
        console.log(JSON.stringify(params, null, 2));
      } else {
        console.log('无参数');
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTTSParams();

