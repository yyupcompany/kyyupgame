const mysql = require('mysql2/promise');

async function checkAllModelsDetails() {
  let connection = null;

  try {
    // 连接到目标数据库 (admin_tenant_management)
    console.log('🎯 连接到 admin_tenant_management 数据库...');
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'admin_tenant_management'
    });

    console.log('✅ 数据库连接成功');

    // 查询所有AI模型配置
    console.log('\n📋 查询所有AI模型配置...');
    const [rows] = await connection.execute('SELECT * FROM ai_model_config ORDER BY id ASC');

    if (rows.length === 0) {
      console.log('❌ 没有找到 AI 模型配置');
      return;
    }

    console.log(`\n🎯 找到 ${rows.length} 个 AI 模型配置:`);

    rows.forEach((model, index) => {
      console.log(`\n${index + 1}. 模型详情:`);
      console.log(`   ID: ${model.id}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   显示名称: ${model.display_name}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   模型类型: ${model.model_type}`);
      console.log(`   API版本: ${model.api_version}`);
      console.log(`   端点URL: ${model.endpoint_url}`);
      console.log(`   API密钥: ${model.api_key}`);
      console.log(`   是否默认: ${model.is_default ? '是' : '否'}`);
      console.log(`   状态: ${model.status}`);
      console.log(`   最大令牌数: ${model.max_tokens}`);

      if (model.description) {
        console.log(`   描述: ${model.description}`);
      }

      if (model.model_parameters) {
        console.log(`   模型参数: ${JSON.stringify(model.model_parameters, null, 6)}`);
      }

      if (model.capabilities) {
        console.log(`   能力: ${JSON.stringify(model.capabilities, null, 4)}`);
      }

      console.log(`   创建时间: ${model.created_at}`);
      console.log(`   更新时间: ${model.updated_at}`);
      console.log(`   创建者ID: ${model.creator_id || 'null'}`);
      console.log('   ----------------------------------------');
    });

    console.log(`\n📊 统计信息:`);
    const typeStats = {};
    const providerStats = {};

    rows.forEach(model => {
      typeStats[model.model_type] = (typeStats[model.model_type] || 0) + 1;
      providerStats[model.provider] = (providerStats[model.provider] || 0) + 1;
    });

    console.log('按类型统计:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}个`);
    });

    console.log('按提供商统计:');
    Object.entries(providerStats).forEach(([provider, count]) => {
      console.log(`  ${provider}: ${count}个`);
    });

    // 检查默认模型
    const defaultModels = rows.filter(model => model.is_default === 1);
    console.log(`\n🎯 默认模型 (${defaultModels.length}个):`);
    defaultModels.forEach(model => {
      console.log(`  - ${model.name} (${model.model_type})`);
    });

    // 检查活跃模型
    const activeModels = rows.filter(model => model.status === 'active');
    console.log(`\n✅ 活跃模型 (${activeModels.length}个):`);
    activeModels.forEach(model => {
      console.log(`  - ${model.name} (${model.provider})`);
    });

  } catch (error) {
    console.error('❌ 查询过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
    }
  }
}

checkAllModelsDetails();