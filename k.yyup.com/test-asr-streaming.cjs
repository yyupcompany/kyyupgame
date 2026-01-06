/**
 * 火山引擎流式ASR测试
 * 
 * 测试流式语音识别功能
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// 火山引擎ASR配置
const ASR_CONFIG = {
  appId: '7563592522',
  appKey: '7563592522',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.bigasr.sauc.duration',
  endpoint: 'wss://openspeech.bytedance.com/api/v2/asr'
};

/**
 * 测试ASR连接
 */
async function testASRConnection() {
  console.log('\n========================================');
  console.log('测试: ASR WebSocket连接');
  console.log('========================================\n');

  return new Promise((resolve, reject) => {
    const sessionId = uuidv4();
    
    console.log('🎤 连接到ASR服务...');
    console.log(`   端点: ${ASR_CONFIG.endpoint}`);
    console.log(`   App Key: ${ASR_CONFIG.appKey}`);
    console.log(`   会话ID: ${sessionId}`);

    // 创建WebSocket连接
    const ws = new WebSocket(ASR_CONFIG.endpoint, {
      headers: {
        'X-Api-App-Key': ASR_CONFIG.appKey,
        'X-Api-Access-Key': ASR_CONFIG.accessKey,
        'X-Api-Resource-Id': ASR_CONFIG.resourceId,
        'X-Api-Request-Id': sessionId
      }
    });

    let isConnected = false;
    let hasReceivedMessage = false;

    // 连接成功
    ws.on('open', () => {
      console.log('\n✅ WebSocket连接成功');
      isConnected = true;

      // 发送开始识别消息
      const startMessage = {
        type: 'start',
        data: {
          appid: ASR_CONFIG.appId,
          token: ASR_CONFIG.accessKey,
          format: 'pcm',
          rate: 16000,
          bits: 16,
          channel: 1,
          language: 'zh-CN',
          vad_enable: true,
          show_language: true,
          show_utterances: true
        }
      };

      console.log('\n📤 发送开始识别消息...');
      console.log(JSON.stringify(startMessage, null, 2));
      ws.send(JSON.stringify(startMessage));

      // 等待2秒后发送结束消息
      setTimeout(() => {
        console.log('\n📤 发送结束识别消息...');
        ws.send(JSON.stringify({ type: 'finish' }));

        // 再等待1秒后关闭连接
        setTimeout(() => {
          ws.close();
          resolve({
            success: true,
            connected: isConnected,
            receivedMessage: hasReceivedMessage
          });
        }, 1000);
      }, 2000);
    });

    // 接收消息
    ws.on('message', (data) => {
      hasReceivedMessage = true;
      try {
        const message = JSON.parse(data.toString());
        console.log('\n📨 收到消息:');
        console.log(JSON.stringify(message, null, 2));
      } catch (error) {
        console.log('\n📨 收到二进制消息:', data.length, 'bytes');
      }
    });

    // 连接错误
    ws.on('error', (error) => {
      console.error('\n❌ WebSocket错误:', error.message);
      reject({
        success: false,
        error: error.message
      });
    });

    // 连接关闭
    ws.on('close', (code, reason) => {
      console.log(`\n🔌 WebSocket连接关闭: ${code} - ${reason}`);
    });

    // 超时保护
    setTimeout(() => {
      if (!isConnected) {
        ws.close();
        reject({
          success: false,
          error: '连接超时'
        });
      }
    }, 10000);
  });
}

/**
 * 测试ASR音频识别（模拟）
 */
async function testASRRecognition() {
  console.log('\n========================================');
  console.log('测试: ASR音频识别（模拟）');
  console.log('========================================\n');

  console.log('⚠️  需要真实音频文件进行测试');
  console.log('   音频格式要求:');
  console.log('   - 格式: PCM');
  console.log('   - 采样率: 16000 Hz');
  console.log('   - 位深: 16 bit');
  console.log('   - 声道: 单声道');
  console.log('   - 编码: 线性PCM');

  return {
    success: true,
    note: '需要真实音频文件'
  };
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   火山引擎ASR流式识别测试              ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = {
    connection: null,
    recognition: null
  };

  try {
    // 测试1: 连接测试
    results.connection = await testASRConnection();
    console.log('\n✅ 连接测试完成');

  } catch (error) {
    console.error('\n❌ 连接测试失败:', error);
    results.connection = error;
  }

  // 测试2: 识别测试
  results.recognition = await testASRRecognition();

  // 测试总结
  console.log('\n========================================');
  console.log('测试总结');
  console.log('========================================\n');

  console.log('测试结果:');
  console.log(`  ${results.connection?.success ? '✅' : '❌'} ASR连接测试`);
  console.log(`  ${results.recognition?.success ? '✅' : '❌'} ASR识别测试 (模拟)`);

  if (results.connection?.success) {
    console.log('\n连接详情:');
    console.log(`  已连接: ${results.connection.connected ? '是' : '否'}`);
    console.log(`  收到消息: ${results.connection.receivedMessage ? '是' : '否'}`);
  }

  console.log('\n📋 下一步建议:');
  console.log('   1. 准备16kHz PCM格式的测试音频文件');
  console.log('   2. 实现音频流式发送功能');
  console.log('   3. 测试实时语音识别');
  console.log('   4. 集成到呼叫中心');

  console.log('\n📄 相关文档:');
  console.log('   - ASR API文档: https://www.volcengine.com/docs/6561/1354869');
  console.log('   - 端到端语音大模型: https://www.volcengine.com/docs/6561/1594356');

  return results;
}

// 运行测试
runTests()
  .then((results) => {
    console.log('\n测试完成');
    process.exit(results.connection?.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n测试异常:', error);
    process.exit(1);
  });

