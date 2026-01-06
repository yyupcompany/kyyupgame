#!/usr/bin/env node

/**
 * 检查数据库中所有 modelType='speech' 的TTS模型配置
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkSpeechModels() {
  console.log('🔍 检查数据库中的TTS模型配置...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kindergarten_management'
  });

  try {
    // 查询所有 modelType='speech' 的模型
    const [speechModels] = await connection.execute(
      `SELECT id, name, model_type, status, endpoint_url, api_key, model_parameters
       FROM ai_model_config
       WHERE model_type = 'speech'
       ORDER BY id`
    );

    console.log(`📊 找到 ${speechModels.length} 个 modelType='speech' 的模型:\n`);

    speechModels.forEach((model, index) => {
      console.log(`${index + 1}. 模型ID: ${model.id}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   状态: ${model.status}`);
      console.log(`   端点URL: ${model.endpoint_url || '(无)'}`);
      console.log(`   API Key: ${model.api_key ? '***' + model.api_key.slice(-4) : '(无)'}`);
      
      if (model.model_parameters) {
        try {
          const params = typeof model.model_parameters === 'string' 
            ? JSON.parse(model.model_parameters) 
            : model.model_parameters;
          console.log(`   模型参数: ${JSON.stringify(params, null, 2)}`);
        } catch (e) {
          console.log(`   模型参数: ${model.model_parameters}`);
        }
      }
      console.log('');
    });

    // 查询 doubao-tts-bigmodel
    const [doubaoModel] = await connection.execute(
      `SELECT id, name, model_type, status, endpoint_url, api_key, model_parameters
       FROM ai_model_config
       WHERE name = 'doubao-tts-bigmodel'`
    );

    console.log('🔍 doubao-tts-bigmodel 模型信息:\n');
    if (doubaoModel.length > 0) {
      const model = doubaoModel[0];
      console.log(`   模型ID: ${model.id}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   模型类型: ${model.model_type}`);
      console.log(`   状态: ${model.status}`);
      console.log(`   端点URL: ${model.endpoint_url || '(无)'}`);
      console.log(`   API Key: ${model.api_key ? '***' + model.api_key.slice(-4) : '(无)'}`);
      
      if (model.model_parameters) {
        try {
          const params = typeof model.model_parameters === 'string' 
            ? JSON.parse(model.model_parameters) 
            : model.model_parameters;
          console.log(`   模型参数: ${JSON.stringify(params, null, 2)}`);
        } catch (e) {
          console.log(`   模型参数: ${model.model_parameters}`);
        }
      }
    } else {
      console.log('   ❌ 未找到 doubao-tts-bigmodel 模型');
    }

    console.log('\n📋 分析结果:');
    
    // 查找 active 状态的 speech 模型
    const activeModel = speechModels.find(m => m.status === 'active');
    if (activeModel) {
      console.log(`✅ 当前激活的 speech 模型: ${activeModel.name} (ID: ${activeModel.id})`);
      console.log(`   端点URL: ${activeModel.endpoint_url || '(无)'}`);
      
      const isV3WebSocket = activeModel.endpoint_url?.includes('wss://') || 
                           activeModel.endpoint_url?.includes('/v3/tts');
      console.log(`   是否V3 WebSocket: ${isV3WebSocket ? '✅ 是' : '❌ 否'}`);
    } else {
      console.log('⚠️ 没有激活状态的 speech 模型');
    }

    // 检查 doubao-tts-bigmodel 的状态
    if (doubaoModel.length > 0) {
      const model = doubaoModel[0];
      if (model.model_type !== 'speech') {
        console.log(`\n⚠️ 警告: doubao-tts-bigmodel 的 model_type 是 '${model.model_type}'，不是 'speech'`);
        console.log(`   这意味着它不会被 text-to-speech.controller.ts 查询到！`);
      }
      if (model.status !== 'active') {
        console.log(`\n⚠️ 警告: doubao-tts-bigmodel 的状态是 '${model.status}'，不是 'active'`);
      }
    }

  } finally {
    await connection.end();
  }
}

checkSpeechModels().catch(console.error);

