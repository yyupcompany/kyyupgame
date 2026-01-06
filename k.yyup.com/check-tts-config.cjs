/**
 * 检查TTS模型配置
 */

const { Sequelize, DataTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

// 定义AIModelConfig模型
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  displayName: {
    type: DataTypes.STRING,
    field: 'display_name'
  },
  provider: DataTypes.STRING,
  modelType: {
    type: DataTypes.STRING,
    field: 'model_type'
  },
  endpointUrl: {
    type: DataTypes.STRING,
    field: 'endpoint_url'
  },
  apiKey: {
    type: DataTypes.STRING,
    field: 'api_key'
  },
  modelParameters: {
    type: DataTypes.TEXT,
    field: 'model_parameters'
  },
  status: DataTypes.STRING
}, {
  tableName: 'ai_model_config',
  timestamps: false
});

async function checkTTSConfig() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    const ttsModels = await AIModelConfig.findAll({
      where: {
        modelType: 'speech',
        status: 'active'
      }
    });
    
    console.log(`找到 ${ttsModels.length} 个TTS模型配置:\n`);
    
    ttsModels.forEach((model, index) => {
      console.log(`模型 ${index + 1}:`);
      console.log(`  ID: ${model.id}`);
      console.log(`  名称: ${model.name}`);
      console.log(`  显示名称: ${model.displayName}`);
      console.log(`  提供商: ${model.provider}`);
      console.log(`  端点URL: ${model.endpointUrl}`);
      console.log(`  API Key: ${model.apiKey}`);
      console.log(`  模型参数: ${model.modelParameters}`);
      console.log('');

      // 检查是否会被识别为V3 WebSocket
      const isV3WebSocket = model.endpointUrl?.includes('wss://') ||
                           model.endpointUrl?.includes('/v3/tts');
      console.log(`  会被识别为V3 WebSocket: ${isV3WebSocket ? '✅ 是' : '❌ 否'}`);
      console.log('');
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkTTSConfig();

