/**
 * 调试aibridge服务从数据库加载配置的过程
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugAiBridgeLoading() {
  let connection;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 调试aibridge数据库配置加载');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ 数据库连接成功');

    // 检查环境变量
    console.log('\n🔧 环境变量配置:');
    console.log(`   AIBRIDGE_API_KEY: ${process.env.AIBRIDGE_API_KEY || '未设置'}`);
    console.log(`   AIBRIDGE_BASE_URL: ${process.env.AIBRIDGE_BASE_URL || '未设置'}`);

    // 查找默认模型
    const [defaultModel] = await connection.execute(`
      SELECT * FROM ai_model_configs
      WHERE isDefault = true AND status = 'active' AND deletedAt IS NULL
      LIMIT 1
    `);

    console.log('\n📊 默认模型配置:');
    if (defaultModel.length > 0) {
      const model = defaultModel[0];
      console.log(`   名称: ${model.name}`);
      console.log(`   显示名: ${model.displayName}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   端点: ${model.endpointUrl}`);
      console.log(`   API密钥: ${model.apiKey ? model.apiKey.substring(0, 8) + '...' + model.apiKey.substring(model.apiKey.length - 4) : '未设置'}`);
      console.log(`   是否默认: ${model.isDefault}`);
      console.log(`   状态: ${model.status}`);
    } else {
      console.log('   ❌ 未找到默认模型');
    }

    // 查找所有doubao模型
    const [doubaoModels] = await connection.execute(`
      SELECT * FROM ai_model_configs
      WHERE provider = 'doubao' OR name LIKE '%doubao%' OR name LIKE '%flash%'
      AND status = 'active' AND deletedAt IS NULL
      ORDER BY isDefault DESC, createdAt ASC
    `);

    console.log('\n🎯 Doubao相关模型:');
    doubaoModels.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.displayName}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   API密钥: ${model.apiKey ? model.apiKey.substring(0, 8) + '...' + model.apiKey.substring(model.apiKey.length - 4) : '未设置'}`);
      console.log(`   密钥长度: ${model.apiKey ? model.apiKey.length : 0}`);
      console.log(`   是否默认: ${model.isDefault}`);
    });

    // 模拟ai-bridge服务的模型查找逻辑
    console.log('\n🔍 模拟AI Bridge服务查找逻辑:');

    if (defaultModel.length > 0) {
      console.log('✅ 找到默认模型，应该使用数据库配置');
      console.log(`   模型: ${defaultModel[0].name}`);
      console.log(`   API密钥: ${defaultModel[0].apiKey ? '已设置' : '未设置'}`);
    } else {
      console.log('⚠️ 未找到默认模型，将回退到环境变量');
      console.log(`   环境变量API密钥: ${process.env.AIBRIDGE_API_KEY || '未设置'}`);
    }

    console.log('\n💡 问题分析:');
    if (defaultModel.length > 0 && defaultModel[0].apiKey) {
      console.log('1. ✅ 数据库中有默认模型配置');
      console.log('2. ✅ API密钥已设置');
      console.log('3. ⚠️ 但AI服务可能还在使用环境变量或缓存');

      console.log('\n🛠️ 建议检查:');
      console.log('   - AI Bridge服务是否正确从数据库读取配置');
      console.log('   - 是否存在配置缓存需要清理');
      console.log('   - 服务器是否需要重启以重新加载配置');
    } else if (defaultModel.length === 0) {
      console.log('1. ❌ 数据库中未找到默认模型');
      console.log('2. 需要设置一个默认模型');
    } else if (!defaultModel[0].apiKey) {
      console.log('1. ❌ 默认模型的API密钥未设置');
      console.log('2. 需要配置有效的API密钥');
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行调试
if (require.main === module) {
  debugAiBridgeLoading();
}

module.exports = { debugAiBridgeLoading };