const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkDoubaoConfig() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 0. 先检查所有表
    console.log('📊 检查数据库中的所有表:');
    console.log('='.repeat(80));

    const [tables] = await sequelize.query(`SHOW TABLES`);
    console.log(`\n找到 ${tables.length} 个表:\n`);

    const aiRelatedTables = tables.filter(t => {
      const tableName = Object.values(t)[0].toLowerCase();
      return tableName.includes('ai') ||
             tableName.includes('model') ||
             tableName.includes('volcengine') ||
             tableName.includes('doubao') ||
             tableName.includes('asr') ||
             tableName.includes('tts');
    });

    if (aiRelatedTables.length > 0) {
      console.log('AI相关的表:');
      aiRelatedTables.forEach(t => {
        console.log(`  - ${Object.values(t)[0]}`);
      });
    } else {
      console.log('⚠️  未找到AI相关的表');
    }
    console.log('\n');

    // 1. 先查看 ai_model_config 表结构
    console.log('📊 检查 ai_model_config 表结构:');
    console.log('='.repeat(80));

    const [columns] = await sequelize.query(`DESCRIBE ai_model_config`);
    console.log('\n表字段:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('\n');

    // 2. 先查看TTS配置示例
    console.log('📊 检查TTS模型配置示例:');
    console.log('='.repeat(80));

    const [ttsModels] = await sequelize.query(`
      SELECT
        id, name, display_name, endpoint_url,
        api_key, model_parameters
      FROM ai_model_config
      WHERE name LIKE '%tts%' OR name LIKE '%volcengine%'
      LIMIT 3
    `);

    console.log('\n🔍 TTS模型配置:');
    ttsModels.forEach(model => {
      console.log(`\n模型: ${model.name}`);
      console.log(`端点: ${model.endpoint_url}`);
      console.log(`API Key: ${model.api_key ? model.api_key.substring(0, 20) + '...' : 'N/A'}`);
      console.log(`参数: ${model.model_parameters || 'N/A'}`);
    });
    console.log('\n');

    // 3. 检查 ai_model_config 表中的豆包配置
    console.log('📊 检查 ai_model_config 表中的豆包配置:');
    console.log('='.repeat(80));

    // 使用正确的字段名
    const [aiModels] = await sequelize.query(`
      SELECT * FROM ai_model_config
      WHERE name LIKE '%doubao%'
         OR provider LIKE '%Doubao%'
         OR provider LIKE '%Volcano%'
         OR provider LIKE '%豆包%'
         OR name LIKE '%realtime%'
         OR name LIKE '%实时%'
      ORDER BY created_at DESC
    `);

    const actualTableName = 'ai_model_config';

    if (actualTableName) {
      console.log(`✅ 使用表名: ${actualTableName}\n`);
    }

    if (aiModels.length > 0) {
      console.log(`\n找到 ${aiModels.length} 个豆包/实时语音模型配置:\n`);
      aiModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   显示名称: ${model.display_name || model.displayName || 'N/A'}`);
        console.log(`   提供商: ${model.provider}`);
        console.log(`   模型类型: ${model.model_type || model.modelType}`);
        console.log(`   端点URL: ${model.endpoint_url || model.endpointUrl}`);
        console.log(`   API Key: ${model.api_key || model.apiKey ? ((model.api_key || model.apiKey).substring(0, 20) + '...') : '未配置'}`);
        console.log(`   状态: ${model.status}`);
        console.log(`   默认模型: ${model.is_default || model.isDefault ? '是' : '否'}`);
        console.log(`   创建时间: ${model.created_at || model.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n❌ 未找到豆包/实时语音模型配置\n');
    }

    // 2. 检查 volcengine_asr_configs 表
    console.log('='.repeat(80));
    console.log('📊 检查 volcengine_asr_configs 表:');
    console.log('='.repeat(80));
    
    const [asrConfigs] = await sequelize.query(`
      SELECT * FROM volcengine_asr_configs ORDER BY id DESC
    `);

    if (asrConfigs.length > 0) {
      console.log(`\n找到 ${asrConfigs.length} 个火山引擎ASR配置:\n`);
      asrConfigs.forEach((config, index) => {
        console.log(`${index + 1}. ID: ${config.id}`);
        console.log(`   App ID: ${config.app_id}`);
        console.log(`   API Key: ${config.api_key ? (config.api_key.substring(0, 20) + '...') : '未配置'}`);
        console.log(`   Cluster: ${config.cluster}`);
        console.log(`   状态: ${config.status}`);
        console.log('');
      });
    } else {
      console.log('\n❌ 未找到火山引擎ASR配置\n');
    }

    // 3. 检查所有AI模型类型
    console.log('='.repeat(80));
    console.log('📊 所有AI模型配置统计:');
    console.log('='.repeat(80));
    
    const [modelStats] = await sequelize.query(`
      SELECT
        modelType,
        provider,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM ai_model_config
      GROUP BY modelType, provider
      ORDER BY modelType, provider
    `);

    if (modelStats.length > 0) {
      console.log('\n模型类型统计:\n');
      console.log('模型类型\t\t提供商\t\t总数\t激活数');
      console.log('-'.repeat(80));
      modelStats.forEach(stat => {
        console.log(`${stat.modelType}\t\t${stat.provider}\t\t${stat.count}\t${stat.active_count}`);
      });
      console.log('');
    }

    // 4. 检查是否有实时语音相关配置
    console.log('='.repeat(80));
    console.log('📊 检查实时语音相关配置:');
    console.log('='.repeat(80));
    
    const [realtimeModels] = await sequelize.query(`
      SELECT
        id,
        name,
        displayName,
        modelType,
        status
      FROM ai_model_config
      WHERE modelType IN ('speech', 'multimodal')
         OR name LIKE '%realtime%'
         OR name LIKE '%实时%'
      ORDER BY createdAt DESC
    `);

    if (realtimeModels.length > 0) {
      console.log(`\n找到 ${realtimeModels.length} 个实时语音相关模型:\n`);
      realtimeModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} (${model.displayName})`);
        console.log(`   类型: ${model.modelType}, 状态: ${model.status}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  未找到实时语音相关模型配置\n');
    }

    // 5. 总结
    console.log('='.repeat(80));
    console.log('📝 总结:');
    console.log('='.repeat(80));
    console.log('');
    
    if (aiModels.length > 0) {
      const activeDoubao = aiModels.filter(m => m.status === 'active');
      console.log(`✅ 豆包模型配置: ${aiModels.length} 个 (激活: ${activeDoubao.length} 个)`);
      
      const hasApiKey = aiModels.filter(m => m.apiKey && !m.apiKey.includes('your-api-key'));
      if (hasApiKey.length > 0) {
        console.log(`✅ 已配置真实API Key: ${hasApiKey.length} 个`);
      } else {
        console.log(`⚠️  所有豆包模型都使用占位符API Key，需要更新为真实Key`);
      }
    } else {
      console.log('❌ 未配置豆包模型');
    }
    
    if (realtimeModels.length > 0) {
      console.log(`✅ 实时语音模型: ${realtimeModels.length} 个`);
    } else {
      console.log('⚠️  未配置实时语音模型');
    }
    
    console.log('');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDoubaoConfig();

