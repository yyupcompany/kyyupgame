/**
 * 呼叫链条集成测试
 *
 * 测试完整的通话流程：
 * SIP配置 → 音频流 → 豆包实时语音 → AI对话 → 语音回复
 *
 * 用法: node tests/call-chain-integration-test.js
 */

// 先初始化数据库连接
require('../dist/config/database');

const { sipConfigService } = require('../dist/services/sip-config.service');
const { callCenterRealtimeService } = require('../dist/services/call-center-realtime.service');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  sipUsername: 'sales001',
  sipPassword: 'zhuge3944',
  sipServer: '47.94.82.59',
  sipPort: 5060,
  testPhoneNumber: '13800138000',
  customerId: 1001
};

// 测试状态
const testState = {
  sipConfigLoaded: false,
  callSessionCreated: false,
  audioSent: false,
  userSpeechReceived: false,
  aiResponseReceived: false,
  callEnded: false,
  errors: []
};

/**
 * 测试1: SIP配置加载
 */
async function testSIPConfigLoading() {
  console.log('\n========================================');
  console.log('测试1: SIP配置加载');
  console.log('========================================\n');

  try {
    // 加载SIP配置
    await sipConfigService.loadConfig();
    
    const config = sipConfigService.getConfig();
    
    if (!config) {
      throw new Error('SIP配置未加载');
    }

    console.log('✅ SIP配置加载成功:');
    console.log(`   服务器: ${config.server_host}:${config.server_port}`);
    console.log(`   用户名: ${config.username}`);
    console.log(`   协议: ${config.protocol}`);

    // 验证是否是sales001账号
    if (config.username === TEST_CONFIG.sipUsername) {
      console.log(`✅ 确认使用 ${TEST_CONFIG.sipUsername} 账号`);
      testState.sipConfigLoaded = true;
    } else {
      console.warn(`⚠️  当前配置使用的是 ${config.username}，不是 ${TEST_CONFIG.sipUsername}`);
      console.log('💡 提示: 运行以下命令切换到sales001账号:');
      console.log('   node scripts/insert-sales001-sip-config.js');
    }

    return true;
  } catch (error) {
    console.error('❌ SIP配置加载失败:', error.message);
    testState.errors.push(`SIP配置加载: ${error.message}`);
    return false;
  }
}

/**
 * 测试2: 创建通话会话
 */
async function testCallSessionCreation() {
  console.log('\n========================================');
  console.log('测试2: 创建通话会话');
  console.log('========================================\n');

  try {
    const callId = `test_call_${Date.now()}`;
    const systemPrompt = `你是一位专业的幼儿园招生顾问。
你的任务是礼貌、热情地与家长交流，了解需求，介绍幼儿园特色。
回复要简洁明了，每次回复控制在50字以内。`;

    console.log(`📞 创建通话会话: ${callId}`);
    console.log(`   客户ID: ${TEST_CONFIG.customerId}`);
    console.log(`   电话号码: ${TEST_CONFIG.testPhoneNumber}`);

    // 设置事件监听
    setupEventListeners();

    // 创建通话会话
    await callCenterRealtimeService.startCall(
      callId,
      TEST_CONFIG.customerId,
      systemPrompt
    );

    console.log('✅ 通话会话创建成功');
    testState.callSessionCreated = true;
    testState.currentCallId = callId;

    // 等待会话就绪
    await sleep(2000);

    return true;
  } catch (error) {
    console.error('❌ 创建通话会话失败:', error.message);
    testState.errors.push(`创建通话会话: ${error.message}`);
    return false;
  }
}

/**
 * 测试3: 发送音频数据
 */
async function testAudioSending() {
  console.log('\n========================================');
  console.log('测试3: 发送音频数据');
  console.log('========================================\n');

  try {
    console.log('🎤 模拟发送音频数据...');

    // 模拟PCM音频数据 (16kHz, 16bit, mono)
    // 1秒音频 = 16000 samples × 2 bytes = 32000 bytes
    const audioChunk = Buffer.alloc(32000);

    // 模拟填充一些音频数据（实际应该是真实的音频）
    for (let i = 0; i < audioChunk.length; i += 2) {
      // 模拟正弦波音频
      const sample = Math.sin(2 * Math.PI * 440 * i / 32000) * 32767;
      audioChunk.writeInt16LE(sample, i);
    }

    console.log(`   音频格式: PCM 16kHz 16bit Mono`);
    console.log(`   音频大小: ${audioChunk.length} bytes`);
    console.log(`   音频时长: 1秒`);

    // 分批发送音频（模拟实时流）
    const chunkSize = 6400; // 200ms per chunk
    const chunks = Math.ceil(audioChunk.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, audioChunk.length);
      const chunk = audioChunk.slice(start, end);

      await callCenterRealtimeService.processAudio(
        testState.currentCallId,
        chunk
      );

      console.log(`   发送音频块 ${i + 1}/${chunks} (${chunk.length} bytes)`);
      await sleep(200); // 模拟实时流
    }

    console.log('✅ 音频数据发送完成');
    testState.audioSent = true;

    // 等待AI处理
    console.log('\n⏳ 等待AI处理和回复...');
    await sleep(5000);

    return true;
  } catch (error) {
    console.error('❌ 发送音频数据失败:', error.message);
    testState.errors.push(`发送音频数据: ${error.message}`);
    return false;
  }
}

/**
 * 测试4: 结束通话
 */
async function testCallEnding() {
  console.log('\n========================================');
  console.log('测试4: 结束通话');
  console.log('========================================\n');

  try {
    console.log('📞 结束通话...');

    await callCenterRealtimeService.endCall(testState.currentCallId);

    console.log('✅ 通话结束成功');
    testState.callEnded = true;

    await sleep(1000);

    return true;
  } catch (error) {
    console.error('❌ 结束通话失败:', error.message);
    testState.errors.push(`结束通话: ${error.message}`);
    return false;
  }
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  console.log('📡 设置事件监听...\n');

  // 通话就绪
  callCenterRealtimeService.on('call-ready', (data) => {
    console.log('\n✅ 事件: 通话就绪');
    console.log(`   Call ID: ${data.callId}`);
  });

  // 用户语音
  callCenterRealtimeService.on('user-speech', (data) => {
    console.log('\n🎤 事件: 用户语音');
    console.log(`   文本: ${data.text}`);
    console.log(`   是否最终: ${data.isFinal}`);
    testState.userSpeechReceived = true;
  });

  // AI回复
  callCenterRealtimeService.on('audio-response', (data) => {
    console.log('\n🤖 事件: AI回复');
    console.log(`   文本: ${data.text}`);
    console.log(`   音频大小: ${data.audioData.length} bytes`);
    console.log(`   时长: ${data.duration}秒`);
    testState.aiResponseReceived = true;
  });

  // 用户打断
  callCenterRealtimeService.on('user-interrupted', (data) => {
    console.log('\n⏸️  事件: 用户打断');
    console.log(`   Call ID: ${data.callId}`);
  });

  // 错误
  callCenterRealtimeService.on('call-error', (data) => {
    console.error('\n❌ 事件: 通话错误');
    console.error(`   Call ID: ${data.callId}`);
    console.error(`   错误: ${data.error}`);
    testState.errors.push(`通话错误: ${data.error}`);
  });

  // 通话结束
  callCenterRealtimeService.on('call-ended', (data) => {
    console.log('\n📞 事件: 通话结束');
    console.log(`   Call ID: ${data.callId}`);
    console.log(`   时长: ${data.duration}秒`);
  });
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  console.log('\n========================================');
  console.log('测试报告');
  console.log('========================================\n');

  const results = [
    { name: 'SIP配置加载', status: testState.sipConfigLoaded },
    { name: '通话会话创建', status: testState.callSessionCreated },
    { name: '音频数据发送', status: testState.audioSent },
    { name: '用户语音识别', status: testState.userSpeechReceived },
    { name: 'AI语音回复', status: testState.aiResponseReceived },
    { name: '通话结束', status: testState.callEnded }
  ];

  console.log('测试结果:');
  results.forEach(result => {
    const icon = result.status ? '✅' : '❌';
    console.log(`  ${icon} ${result.name}`);
  });

  const passedTests = results.filter(r => r.status).length;
  const totalTests = results.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n通过率: ${passedTests}/${totalTests} (${passRate}%)`);

  if (testState.errors.length > 0) {
    console.log('\n错误列表:');
    testState.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log('\n链条状态:');
  console.log('  SIP配置 → 音频流 → 豆包实时语音 → AI对话 → 语音回复');
  console.log(`  ${testState.sipConfigLoaded ? '✅' : '❌'}        ${testState.audioSent ? '✅' : '❌'}      ${testState.userSpeechReceived ? '✅' : '❌'}            ${testState.aiResponseReceived ? '✅' : '❌'}      ${testState.callEnded ? '✅' : '❌'}`);

  const allPassed = passedTests === totalTests;
  console.log(`\n${allPassed ? '🎉' : '⚠️'} 测试${allPassed ? '全部通过' : '部分失败'}！`);

  return allPassed;
}

/**
 * 主测试流程
 */
async function runIntegrationTest() {
  console.log('🧪 开始呼叫链条集成测试...');
  console.log(`   SIP账号: ${TEST_CONFIG.sipUsername}`);
  console.log(`   SIP服务器: ${TEST_CONFIG.sipServer}:${TEST_CONFIG.sipPort}`);
  console.log(`   测试电话: ${TEST_CONFIG.testPhoneNumber}`);

  try {
    // 测试1: SIP配置加载
    const step1 = await testSIPConfigLoading();
    if (!step1) {
      console.log('\n⚠️  SIP配置加载失败，后续测试可能受影响');
    }

    // 测试2: 创建通话会话
    const step2 = await testCallSessionCreation();
    if (!step2) {
      throw new Error('创建通话会话失败，终止测试');
    }

    // 测试3: 发送音频数据
    const step3 = await testAudioSending();
    if (!step3) {
      console.log('\n⚠️  发送音频数据失败');
    }

    // 测试4: 结束通话
    const step4 = await testCallEnding();
    if (!step4) {
      console.log('\n⚠️  结束通话失败');
    }

    // 生成测试报告
    const allPassed = generateTestReport();

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n💥 测试异常:', error.message);
    console.error(error);
    generateTestReport();
    process.exit(1);
  }
}

/**
 * 辅助函数: 延迟
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
runIntegrationTest();

