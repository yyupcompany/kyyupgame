#!/usr/bin/env node

/**
 * 🔊 TTS连接测试用例（数据库版本）
 * 从数据库获取火山引擎TTS配置并测试连接
 */

const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

// ==================== 数据库配置 ====================
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'kindergarten',
  charset: 'utf8mb4'
};

// 默认TTS配置
const DEFAULT_TTS_CONFIG = {
  endpoint: 'openspeech.bytedance.com',
  path: '/api/v1/tts',
  cluster: 'volcano_tts',
  userId: '62170702'
};

// 测试用例配置
const TEST_CASES = [
  {
    name: '基础测试',
    text: '你好，这是TTS基础测试',
    voice: 'zh_female_cancan_mars_bigtts',
    speed: 1.0,
    encoding: 'mp3'
  },
  {
    name: '儿童友好测试',
    text: '小朋友，欢迎来到我们的幼儿园！今天我们一起学习吧！',
    voice: 'zh_female_cancan_mars_bigtts',
    speed: 0.9,
    encoding: 'mp3'
  },
  {
    name: '男声测试',
    text: '这是一段男声音频测试，适合用于旁白说明。',
    voice: 'zh_male_jinguan_mars_bigtts',
    speed: 1.0,
    encoding: 'mp3'
  }
];

// ==================== 数据库操作函数 ====================

/**
 * 连接数据库
 */
async function connectDatabase() {
  try {
    console.log('🔗 连接数据库...');
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('   ✅ 数据库连接成功');
    return connection;
  } catch (error) {
    console.error(`   ❌ 数据库连接失败: ${error.message}`);
    throw error;
  }
}

/**
 * 从数据库获取TTS配置
 */
async function getTTSConfigFromDB(connection) {
  try {
    console.log('📋 查询TTS配置...');

    const [rows] = await connection.execute(`
      SELECT name, endpoint_url, api_key, model_parameters, status
      FROM ai_model_config
      WHERE model_type = 'speech' AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      console.log('   ⚠️  未找到活跃的TTS配置');
      return null;
    }

    const config = rows[0];
    console.log(`   ✅ 找到TTS配置: ${config.name}`);

    // 解析model_parameters
    let modelParams = {};
    if (config.model_parameters) {
      try {
        modelParams = typeof config.model_parameters === 'string'
          ? JSON.parse(config.model_parameters)
          : config.model_parameters;
      } catch (parseError) {
        console.log('   ⚠️  model_parameters解析失败，使用备用方案');
      }
    }

    // 构建TTS配置
    const ttsConfig = {
      ...DEFAULT_TTS_CONFIG,
      appId: modelParams.appKey || config.api_key,
      accessToken: modelParams.accessToken || modelParams.accessKey || config.api_key,
      name: config.name,
      endpoint: config.endpoint_url || DEFAULT_TTS_CONFIG.endpoint
    };

    // 验证必要字段
    if (!ttsConfig.appId || ttsConfig.appId === 'your-app-key') {
      console.log('   ❌ App Key未配置或无效');
      return null;
    }

    if (!ttsConfig.accessToken || ttsConfig.accessToken === 'your-access-token') {
      console.log('   ❌ Access Token未配置或无效');
      return null;
    }

    console.log('   ✅ TTS配置验证通过');
    console.log(`   📊 配置名称: ${ttsConfig.name}`);
    console.log(`   📊 端点: ${ttsConfig.endpoint}`);
    console.log(`   📊 App ID: ${ttsConfig.appId.substring(0, 8)}...`);

    return ttsConfig;

  } catch (error) {
    console.error(`   ❌ 查询TTS配置失败: ${error.message}`);
    return null;
  }
}

/**
 * 关闭数据库连接
 */
async function closeDatabase(connection) {
  try {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  } catch (error) {
    console.error(`关闭数据库连接失败: ${error.message}`);
  }
}

// ==================== TTS核心功能函数 ====================

/**
 * 生成语音
 */
function generateSpeech(text, options = {}, config) {
  return new Promise((resolve, reject) => {
    const params = {
      text: text,
      voice: options.voice || 'zh_female_cancan_mars_bigtts',
      speed: options.speed || 1.0,
      encoding: options.encoding || 'mp3'
    };

    const requestBody = JSON.stringify({
      app: {
        appid: config.appId,
        token: config.accessToken,
        cluster: config.cluster
      },
      user: {
        uid: config.userId
      },
      audio: {
        voice_type: params.voice,
        encoding: params.encoding,
        speed_ratio: params.speed,
        emotion: 'natural'
      },
      request: {
        reqid: crypto.randomUUID(),
        text: params.text,
        operation: 'query'
      }
    });

    console.log(`🔊 正在合成语音: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`);
    console.log(`   音色: ${params.voice}`);
    console.log(`   语速: ${params.speed}`);

    const startTime = Date.now();

    const req = https.request({
      hostname: config.endpoint,
      path: config.path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer; ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      console.log(`   状态码: ${res.statusCode}`);

      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          try {
            const errorInfo = JSON.parse(errorData);
            reject(new Error(`HTTP ${res.statusCode}: ${errorInfo.message || errorInfo.status_msg || '未知错误'}`));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: 请求失败`));
          }
        });
        return;
      }

      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const audioBuffer = Buffer.concat(data);
        const duration = Date.now() - startTime;

        console.log(`   ✅ 合成成功，耗时: ${duration}ms`);
        console.log(`   📊 音频大小: ${(audioBuffer.length / 1024).toFixed(1)} KB`);

        resolve({
          audioBuffer: audioBuffer,
          format: params.encoding,
          duration: duration,
          size: audioBuffer.length
        });
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ 请求错误: ${error.message}`);
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时（30秒）'));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 安全的语音生成（带重试机制）
 */
async function safeGenerateSpeech(text, options = {}, config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateSpeech(text, options, config);
    } catch (error) {
      console.log(`   ⚠️  第${i + 1}次尝试失败: ${error.message}`);

      if (i === maxRetries - 1) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`   ⏳ 等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * 网络连接测试
 */
async function testNetworkConnection(config) {
  console.log('🌐 测试网络连接...');

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: config.endpoint,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    }, (res) => {
      console.log(`   ✅ 服务器连接正常 (状态码: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log(`   ❌ 网络连接失败: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('网络连接超时'));
    });

    req.end();
  });
}

// ==================== 测试用例执行 ====================

/**
 * 运行单个测试用例
 */
async function runTestCase(testCase, index, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 测试用例 ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(60));

  try {
    const result = await safeGenerateSpeech(testCase.text, testCase, config);

    const filename = `test-db-${index + 1}-${testCase.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.mp3`;

    fs.writeFileSync(filename, result.audioBuffer);

    console.log(`💾 音频已保存: ${filename}`);
    console.log(`📊 文件信息: 大小 ${(result.size / 1024).toFixed(1)} KB, 耗时 ${result.duration}ms`);

    return { success: true, filename, result };

  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 生成测试报告
 */
function generateReport(results, totalTime, configName) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  console.log(`配置来源: 数据库 (${configName})`);
  console.log(`总测试用例: ${results.length}`);
  console.log(`成功: ${successCount} ✅`);
  console.log(`失败: ${failureCount} ❌`);
  console.log(`总耗时: ${(totalTime / 1000).toFixed(2)} 秒`);
  console.log(`成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log('\n📁 生成的音频文件:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.filename}`);
    });
  }

  if (failureCount > 0) {
    console.log('\n❌ 失败的测试:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  if (successCount === results.length) {
    console.log('🎉 所有测试通过！数据库TTS配置正确。');
  } else if (successCount > 0) {
    console.log('⚠️  部分测试通过，请检查失败的测试用例。');
  } else {
    console.log('❌ 所有测试失败，请检查配置和网络连接。');
  }
}

// ==================== 主程序 ====================

async function main() {
  console.log('🔊 TTS连接测试用例（数据库版本）');
  console.log('从数据库获取火山引擎TTS配置');
  console.log('测试时间:', new Date().toLocaleString());
  console.log('='.repeat(60));

  let connection = null;
  let config = null;

  try {
    // 1. 连接数据库
    connection = await connectDatabase();

    // 2. 获取TTS配置
    config = await getTTSConfigFromDB(connection);

    if (!config) {
      console.log('\n❌ 无法获取有效的TTS配置');
      console.log('请检查数据库中的 ai_model_config 表是否存在活跃的TTS配置');
      console.log('SQL示例: INSERT INTO ai_model_config (name, model_type, provider, status, api_key, model_parameters) VALUES');
      console.log('  ("volcengine-tts-v3-bidirection", "speech", "volcengine", "active", "your-api-key", \'{"appKey": "your-app-key", "accessKey": "your-access-key"}\');');
      process.exit(1);
    }

    // 3. 网络连接测试
    await testNetworkConnection(config);

    // 4. 运行测试用例
    console.log(`\n🚀 开始运行 ${TEST_CASES.length} 个测试用例...\n`);

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < TEST_CASES.length; i++) {
      const result = await runTestCase(TEST_CASES[i], i, config);
      results.push(result);

      if (i < TEST_CASES.length - 1) {
        console.log('⏳ 等待 2 秒后继续下一个测试...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalTime = Date.now() - startTime;

    // 5. 生成报告
    generateReport(results, totalTime, config.name);

    // 6. 退出程序
    if (results.every(r => r.success)) {
      console.log('\n✅ 测试完成，程序正常退出。');
      process.exit(0);
    } else {
      console.log('\n❌ 测试存在问题，请检查配置和错误信息。');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 程序执行失败:', error.message);
    process.exit(1);
  } finally {
    await closeDatabase(connection);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⚠️  测试被用户中断');
  process.exit(1);
});

// 运行主程序
if (require.main === module) {
  main();
}

module.exports = {
  generateSpeech,
  safeGenerateSpeech,
  testNetworkConnection,
  getTTSConfigFromDB,
  connectDatabase,
  closeDatabase,
  TEST_CASES
};