#!/usr/bin/env node

const axios = require('axios');
const mysql = require('mysql2/promise');

// 从数据库直接读取配置
async function getDoubaoConfig() {
  console.log('🔍 从数据库读取豆包模型配置...');

  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    user: 'root',
    password: 'pwk5ls7j',
    database: 'admin_tenant_management',
    ssl: { rejectUnauthorized: false }
  });

  const [rows] = await connection.execute(`
    SELECT model_name, api_endpoint, api_key, model_version
    FROM ai_model_configs
    WHERE provider = 'Doubao' AND model_name LIKE '%1.6%flash%'
    LIMIT 1
  `);

  await connection.end();

  if (rows.length === 0) {
    throw new Error('未找到豆包1.6 flash模型配置');
  }

  const config = rows[0];
  console.log(`✅ 找到配置: ${config.model_name} - ${config.api_endpoint}`);

  return {
    model_name: config.model_name,
    endpoint_url: config.api_endpoint,
    api_key: config.api_key,
    version: config.model_version
  };
}

// 测试代理配置修复
async function testProxyFix() {
  console.log('🚀 开始测试代理配置修复效果...\n');

  try {
    // 1. 获取豆包配置
    const config = await getDoubaoConfig();

    // 2. 测试请求 - 使用修复后的代理配置
    console.log('📡 测试HTTP请求（使用修复后的代理配置）...');

    const requestData = {
      model: config.model_name,
      messages: [
        {
          role: "user",
          content: "你好，请简单介绍一下自己"
        }
      ],
      stream: false
    };

    // 使用与修复后相同的axios配置
    const testClient = axios.create({
      proxy: false, // 这是修复的关键配置
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`
      }
    });

    console.log(`🔗 请求URL: ${config.endpoint_url}`);
    console.log(`📝 请求数据: ${JSON.stringify(requestData, null, 2)}`);
    console.log(`⚙️  代理配置: ${testClient.defaults.proxy}`);

    const startTime = Date.now();
    const response = await testClient.post(config.endpoint_url, requestData);
    const endTime = Date.now();

    console.log(`\n✅ 请求成功！`);
    console.log(`⏱️  响应时间: ${endTime - startTime}ms`);
    console.log(`📊 状态码: ${response.status}`);
    console.log(`📄 响应数据: ${JSON.stringify(response.data, null, 2)}`);

    return {
      success: true,
      responseTime: endTime - startTime,
      status: response.status,
      data: response.data
    };

  } catch (error) {
    console.error(`\n❌ 测试失败:`);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误数据: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error(`   网络错误: ${error.message}`);
      console.error(`   代理配置问题: ${error.code}`);
    } else {
      console.error(`   其他错误: ${error.message}`);
    }

    return {
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
}

// 主执行函数
async function main() {
  console.log('='.repeat(60));
  console.log('           代理配置修复验证测试');
  console.log('='.repeat(60));
  console.log('修复内容: 在axios配置中添加 proxy: false');
  console.log('修复文件: k.yyup.com/server/src/services/unified-tenant-ai-client.service.ts');
  console.log('='.repeat(60) + '\n');

  const result = await testProxyFix();

  console.log('\n' + '='.repeat(60));
  console.log('           测试结果总结');
  console.log('='.repeat(60));

  if (result.success) {
    console.log('🎉 代理配置修复成功！');
    console.log(`⚡ 连接正常，响应时间: ${result.responseTime}ms`);
    console.log('🔧 修复方案: 禁用axios代理配置');
    console.log('✅ AI API连接已恢复正常');
  } else {
    console.log('❌ 代理配置修复未解决问题');
    console.log(`🚫 错误: ${result.error}`);
    console.log('🔧 需要进一步排查网络或代理环境问题');
  }

  console.log('='.repeat(60));

  process.exit(result.success ? 0 : 1);
}

// 运行测试
main().catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});