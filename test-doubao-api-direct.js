#!/usr/bin/env node

/**
 * 独立豆包API测试脚本
 * 直接测试数据库中的AI模型配置，绕过所有中间件
 */

const axios = require('axios');

// 数据库配置 - 与统一认证系统保持一致
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'admin_tenant_management',
  user: 'root',
  password: 'pwk5ls7j',  // 使用统一认证系统的正确密码
  ssl: { rejectUnauthorized: false }
};

// 查询AI模型配置
const mysql = require('mysql2/promise');

async function getAIModels() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await connection.execute(
      `SELECT id, name, display_name, provider, model_type, endpoint_url,
              api_key, model_parameters, status, is_default
       FROM ai_model_config
       WHERE status = 'active'
       ORDER BY is_default DESC, created_at ASC`
    );

    await connection.end();
    return rows;
  } catch (error) {
    console.error('❌ 数据库查询失败:', error.message);
    return [];
  }
}

// 测试豆包API调用
async function testDoubaoAPI(modelConfig) {
  console.log(`\n🧪 测试模型: ${modelConfig.display_name} (${modelConfig.name})`);
  console.log(`🔗 端点: ${modelConfig.endpoint_url}`);
  console.log(`🔑 API Key: ${modelConfig.api_key.substring(0, 20)}...`);

  try {
    // 豆包API标准请求格式
    const requestData = {
      model: modelConfig.name,
      messages: [
        {
          role: "user",
          content: "你好，请简单介绍一下自己"
        }
      ],
      stream: false,
      max_tokens: 1000,
      temperature: 0.7
    };

    const response = await axios.post(
      modelConfig.endpoint_url,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.api_key}`
        },
        timeout: 30000
      }
    );

    console.log('✅ API调用成功!');
    console.log('响应状态:', response.status);

    if (response.data) {
      const choices = response.data.choices || [];
      if (choices.length > 0) {
        console.log('📝 AI回复:', choices[0].message?.content || '无内容');
      } else {
        console.log('📝 AI回复: 无有效回复');
      }
    }

    return {
      success: true,
      model: modelConfig.name,
      response: response.data
    };

  } catch (error) {
    console.error('❌ API调用失败:');
    console.error('错误代码:', error.response?.status || 'N/A');
    console.error('错误信息:', error.message);

    if (error.response) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }

    return {
      success: false,
      model: modelConfig.name,
      error: error.message,
      status: error.response?.status
    };
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('       独立豆包API测试');
  console.log('═'.repeat(60));
  console.log('');

  // 1. 从数据库获取AI模型配置
  console.log('🔍 正在从数据库获取AI模型配置...');
  const models = await getAIModels();

  if (models.length === 0) {
    console.error('❌ 未找到活跃的AI模型配置');
    process.exit(1);
  }

  console.log(`✅ 找到 ${models.length} 个活跃AI模型:`);

  // 2. 显示模型信息
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.display_name} (${model.name})`);
    console.log(`   - 提供商: ${model.provider}`);
    console.log(`   - 类型: ${model.model_type}`);
    console.log(`   - 默认: ${model.is_default ? '是' : '否'}`);
    console.log(`   - 状态: ${model.status}`);
    console.log('');
  });

  // 3. 测试每个豆包模型
  console.log('🚀 开始测试AI模型API调用...\n');

  const results = [];
  let successCount = 0;

  for (const model of models) {
    const result = await testDoubaoAPI(model);
    results.push(result);

    if (result.success) {
      successCount++;
    }

    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log('                测试结果统计');
  console.log('='.repeat(60));

  console.log(`总模型数: ${models.length}`);
  console.log(`成功调用: ${successCount}`);
  console.log(`失败调用: ${models.length - successCount}`);
  console.log(`成功率: ${((successCount / models.length) * 100).toFixed(1)}%`);

  // 显示详细结果
  console.log('\n详细结果:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.model}: ${result.success ? '✅' : '❌'}`);
    if (!result.success) {
      console.log(`   错误: ${result.error}`);
    }
  });

  // 5. 找到最佳可用模型
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    console.log('\n✅ 可用的豆包模型推荐:');
    successfulResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.model}`);
    });
  } else {
    console.log('\n❌ 没有可用的豆包模型');
  }

  // 6. 保存结果到文件
  const testResult = {
    timestamp: new Date().toISOString(),
    databaseConfig: dbConfig,
    models: models,
    testResults: results,
    statistics: {
      total: models.length,
      success: successCount,
      failed: models.length - successCount,
      successRate: ((successCount / models.length) * 100).toFixed(1) + '%'
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    '/home/zhgue/kyyupgame/doubao-api-test-results.json',
    JSON.stringify(testResult, null, 2)
  );

  console.log('\n📄 测试结果已保存到: /home/zhgue/kyyupgame/doubao-api-test-results.json');

  process.exit(successCount > 0 ? 0 : 1);
}

// 运行测试
main().catch(error => {
  console.error('❌ 测试脚本执行失败:', error.message);
  process.exit(1);
});