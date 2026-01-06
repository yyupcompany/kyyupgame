/**
 * 修复网页搜索引擎配置
 */

import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixSearchConfig() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查看当前搜索引擎配置
    console.log('\n📋 查看当前搜索引擎配置...');
    const [currentConfig] = await sequelize.query(`
      SELECT id, name, display_name, provider, model_type, capabilities, status, is_default
      FROM ai_model_config 
      WHERE name = 'volcano-fusion-search'
    `);

    if (currentConfig.length === 0) {
      console.log('❌ 未找到volcano-fusion-search配置');
      return;
    }

    console.log('📊 当前配置:');
    console.table(currentConfig);

    // 修复配置
    console.log('\n🔧 修复搜索引擎配置...');
    
    // 方案1：将搜索引擎设置为text类型，并添加web_search能力
    const [updateResult] = await sequelize.query(`
      UPDATE ai_model_config
      SET
        model_type = 'text',
        capabilities = JSON_ARRAY('fusion_search','vector_search','text_search','hybrid_search','ai_search','semantic_understanding','rag_support','result_reranking','auto_summarization','intent_recognition','multi_modal_search','elasticsearch_compatible','knn_search','spatial_temporal_search','web_search')
      WHERE name = 'volcano-fusion-search'
    `);

    console.log('✅ 配置更新完成');

    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const [verifyConfig] = await sequelize.query(`
      SELECT id, name, display_name, provider, model_type, capabilities, status, is_default
      FROM ai_model_config 
      WHERE name = 'volcano-fusion-search'
    `);

    console.log('📊 修复后配置:');
    console.table(verifyConfig);

    // 测试模型选择逻辑
    console.log('\n🧪 测试模型选择逻辑...');
    const [testResult] = await sequelize.query(`
      SELECT id, name, display_name, model_type, capabilities
      FROM ai_model_config 
      WHERE model_type = 'text' 
        AND status = 'active'
        AND (capabilities LIKE '%web_search%' OR JSON_CONTAINS(capabilities, '"web_search"'))
    `);

    if (testResult.length > 0) {
      console.log('✅ 找到具有web_search能力的text模型:');
      testResult.forEach(model => {
        console.log(`  - ${model.name}: ${model.capabilities}`);
      });
    } else {
      console.log('❌ 仍未找到具有web_search能力的text模型');
    }

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixSearchConfig();
