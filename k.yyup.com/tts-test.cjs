#!/usr/bin/env node

/**
 * 🔊 TTS连接测试用例
 * 基于 TTS连接使用帮助.md 文档创建
 * 用于验证火山引擎TTS服务配置和连接
 */

const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

// ==================== 配置区域 ====================
// 请在这里填入你的火山引擎TTS配置
const CONFIG = {
  appId: 'your-app-key',           // 替换为你的App Key
  accessToken: 'your-access-token', // 替换为你的Access Token
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
  },
  {
    name: '快速语音测试',
    text: '这是快速语音测试，语速调整为1.2倍。',
    voice: 'zh_female_moon_mars_bigtts',
    speed: 1.2,
    encoding: 'mp3'
  },
  {
    name: '长文本测试',
    text: '今天天气真好，阳光明媚，微风轻拂。小鸟在树枝上欢快地歌唱，蝴蝶在花丛中翩翩起舞。这是一个美好的一天，适合学习和玩耍。',
    voice: 'zh_female_cancan_mars_bigtts',
    speed: 1.0,
    encoding: 'mp3'
  }
];

// ==================== 核心功能函数 ====================

/**
 * 生成语音
 * @param {string} text - 要转换的文本
 * @param {Object} options - 语音选项
 * @returns {Promise<Object>} - 返回音频Buffer和格式信息
 */
function generateSpeech(text, options = {}) {
  return new Promise((resolve, reject) => {
    const params = {
      text: text,
      voice: options.voice || 'zh_female_cancan_mars_bigtts',
      speed: options.speed || 1.0,
      encoding: options.encoding || 'mp3'
    };

    const requestBody = JSON.stringify({
      app: {
        appid: CONFIG.appId,
        token: CONFIG.accessToken,
        cluster: CONFIG.cluster
      },
      user: {
        uid: CONFIG.userId
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
    console.log(`   格式: ${params.encoding}`);

    const startTime = Date.now();

    const req = https.request({
      hostname: CONFIG.endpoint,
      path: CONFIG.path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer; ${CONFIG.accessToken}`,
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
 * @param {string} text - 要转换的文本
 * @param {Object} options - 语音选项
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<Object>} - 返回音频Buffer和格式信息
 */
async function safeGenerateSpeech(text, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateSpeech(text, options);
    } catch (error) {
      console.log(`   ⚠️  第${i + 1}次尝试失败: ${error.message}`);

      if (i === maxRetries - 1) {
        throw error;
      }

      // 指数退避重试
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`   ⏳ 等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * 网络连接测试
 */
async function testNetworkConnection() {
  console.log('🌐 测试网络连接...');

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: CONFIG.endpoint,
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

/**
 * 配置验证
 */
function validateConfig() {
  console.log('⚙️  验证配置...');

  const errors = [];

  if (!CONFIG.appId || CONFIG.appId === 'your-app-key') {
    errors.push('❌ App Key 未配置或使用默认值');
  }

  if (!CONFIG.accessToken || CONFIG.accessToken === 'your-access-token') {
    errors.push('❌ Access Token 未配置或使用默认值');
  }

  if (errors.length > 0) {
    console.log('\n配置错误:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('\n请在脚本开头的 CONFIG 区域填入正确的配置信息。');
    return false;
  }

  console.log('   ✅ 配置验证通过');
  return true;
}

// ==================== 测试用例执行 ====================

/**
 * 运行单个测试用例
 */
async function runTestCase(testCase, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 测试用例 ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(60));

  try {
    const result = await safeGenerateSpeech(testCase.text, testCase);

    // 保存音频文件
    const filename = `test-${index + 1}-${testCase.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.mp3`;
    const filepath = filename;

    fs.writeFileSync(filepath, result.audioBuffer);

    console.log(`💾 音频已保存: ${filepath}`);
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
function generateReport(results, totalTime) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

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
    console.log('🎉 所有测试通过！TTS服务配置正确。');
  } else if (successCount > 0) {
    console.log('⚠️  部分测试通过，请检查失败的测试用例。');
  } else {
    console.log('❌ 所有测试失败，请检查配置和网络连接。');
  }
}

// ==================== 主程序 ====================

async function main() {
  console.log('🔊 TTS连接测试用例');
  console.log('基于 TTS连接使用帮助.md 文档');
  console.log('测试时间:', new Date().toLocaleString());
  console.log('='.repeat(60));

  // 1. 配置验证
  if (!validateConfig()) {
    process.exit(1);
  }

  // 2. 网络连接测试
  try {
    await testNetworkConnection();
  } catch (error) {
    console.error('网络连接测试失败，请检查网络连接。');
    process.exit(1);
  }

  // 3. 运行测试用例
  console.log(`\n🚀 开始运行 ${TEST_CASES.length} 个测试用例...\n`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < TEST_CASES.length; i++) {
    const result = await runTestCase(TEST_CASES[i], i);
    results.push(result);

    // 测试间隔，避免频率限制
    if (i < TEST_CASES.length - 1) {
      console.log('⏳ 等待 2 秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const totalTime = Date.now() - startTime;

  // 4. 生成报告
  generateReport(results, totalTime);

  // 5. 退出程序
  if (results.every(r => r.success)) {
    console.log('\n✅ 测试完成，程序正常退出。');
    process.exit(0);
  } else {
    console.log('\n❌ 测试存在问题，请检查配置和错误信息。');
    process.exit(1);
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

// 处理中断信号
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
  validateConfig,
  CONFIG,
  TEST_CASES
};