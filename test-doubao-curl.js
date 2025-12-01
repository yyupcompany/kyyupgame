#!/usr/bin/env node

/**
 * 获取豆包模型配置并生成curl测试命令
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'admin_tenant_management',
  user: 'root',
  password: 'pwk5ls7j',
  ssl: { rejectUnauthorized: false }
};

async function getDoubaoFlashConfig() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT name, display_name, endpoint_url, api_key, model_parameters
      FROM ai_model_config
      WHERE name = 'doubao-seed-1-6-flash-250715' AND status = 'active'
    `);

    await connection.end();

    if (rows.length > 0) {
      return rows[0];
    } else {
      throw new Error('未找到豆包1.6 flash模型配置');
    }
  } catch (error) {
    console.error('数据库查询失败:', error.message);
    return null;
  }
}

function generateCurlCommand(config) {
  let modelParams = {};
  try {
    modelParams = JSON.parse(config.model_parameters || '{}');
  } catch (e) {
    console.log('⚠️ 模型参数解析失败，使用默认配置');
  }

  // 构建请求数据 - 使用正确的model参数
  const requestData = {
    model: modelParams.model_id || config.name,
    messages: [
      {
        role: "user",
        content: "你好，请介绍一下自己"
      }
    ],
    stream: false,
    max_tokens: 100,
    temperature: 0.1,
    top_p: 0.9
  };

  // 生成curl命令
  const curlCommand = `curl -X POST '${config.endpoint_url}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${config.api_key}' \\
  -d '${JSON.stringify(requestData)}' \\
  --verbose \\
  --connect-timeout 30 \\
  --max-time 60`;

  return {
    config: config,
    requestData: requestData,
    curlCommand: curlCommand
  };
}

async function main() {
  console.log('═'.repeat(60));
  console.log('       豆包1.6 Flash模型curl测试');
  console.log('═'.repeat(60));

  // 1. 获取模型配置
  console.log('🔍 正在获取豆包1.6 flash模型配置...');
  const config = await getDoubaoFlashConfig();

  if (!config) {
    console.error('❌ 无法获取模型配置');
    process.exit(1);
  }

  console.log('✅ 成功获取模型配置:');
  console.log(`📝 模型名称: ${config.display_name} (${config.name})`);
  console.log(`🔗 端点URL: ${config.endpoint_url}`);
  console.log(`🔑 API Key: ${config.api_key.substring(0, 20)}...`);
  console.log(`⚙️ 模型参数:`, config.model_parameters);

  // 2. 生成curl命令
  console.log('\n🛠️ 生成curl测试命令...');
  const { requestData, curlCommand } = generateCurlCommand(config);

  console.log('\n📤 请求数据:');
  console.log(JSON.stringify(requestData, null, 2));

  console.log('\n🔧 curl命令:');
  console.log(curlCommand);

  // 3. 执行curl命令
  console.log('\n🚀 执行curl测试...');
  console.log('─'.repeat(60));

  const { exec } = require('child_process');

  exec(curlCommand, (error, stdout, stderr) => {
    console.log('\n📋 curl执行结果:');
    console.log('─'.repeat(60));

    if (error) {
      console.error(`❌ 执行错误: ${error.message}`);
      console.error(`退出码: ${error.code}`);
    }

    if (stderr) {
      console.log('📡 详细输出:');
      console.log(stderr);
    }

    if (stdout) {
      console.log('📝 API响应:');
      console.log(stdout);

      try {
        const response = JSON.parse(stdout);
        console.log('\n✅ 解析后的响应:');
        console.log(JSON.stringify(response, null, 2));

        if (response.choices && response.choices.length > 0) {
          console.log('\n💬 AI回复:');
          console.log(response.choices[0].message?.content || '无内容');
        }
      } catch (parseError) {
        console.log('\n⚠️ 无法解析JSON响应，原始内容已显示');
      }
    }

    console.log('─'.repeat(60));
    console.log('测试完成');
  });
}

// 运行测试
main().catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});