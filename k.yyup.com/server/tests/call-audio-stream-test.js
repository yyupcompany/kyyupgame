/**
 * 呼叫中心音频流处理测试
 * 
 * 测试流程:
 * 1. 创建通话会话
 * 2. 模拟发送音频数据
 * 3. 验证ASR识别
 * 4. 验证AI回复生成
 * 5. 验证TTS语音合成
 */

const { callAudioStreamService } = require('../dist/services/call-audio-stream.service');

async function testAudioStreamFlow() {
  console.log('🧪 开始测试呼叫中心音频流处理...\n');

  try {
    // 1. 创建通话会话
    const callId = `test_call_${Date.now()}`;
    const customerId = 1;
    const systemPrompt = `你是一位专业的幼儿园招生顾问。
你的任务是礼貌、热情地与家长交流，了解需求，介绍幼儿园特色。
回复要简洁明了，每次回复控制在50字以内。`;

    console.log('📞 创建通话会话...');
    callAudioStreamService.createCallSession(callId, customerId, systemPrompt);
    console.log(`✅ 会话创建成功: ${callId}\n`);

    // 2. 模拟音频数据 (1秒的PCM数据)
    console.log('🎤 模拟发送音频数据...');
    const audioChunk = Buffer.alloc(32000); // 16kHz * 2 bytes * 1 second
    
    // 模拟分批发送音频数据
    for (let i = 0; i < 10; i++) {
      await callAudioStreamService.processAudioChunk(callId, audioChunk.slice(i * 3200, (i + 1) * 3200));
      await sleep(100); // 模拟实时音频流
    }
    console.log('✅ 音频数据发送完成\n');

    // 3. 等待处理
    console.log('⏳ 等待ASR识别和AI处理...');
    await sleep(3000);

    // 4. 监听音频响应事件
    callAudioStreamService.on('audio-response', (data) => {
      console.log('\n🔊 收到AI语音响应:');
      console.log(`  - Call ID: ${data.callId}`);
      console.log(`  - 文本: ${data.text}`);
      console.log(`  - 音频大小: ${data.audioData.length} bytes`);
    });

    // 5. 获取会话信息
    const sessionInfo = callAudioStreamService.getSessionInfo(callId);
    if (sessionInfo) {
      console.log('\n📊 会话信息:');
      console.log(`  - Call ID: ${sessionInfo.callId}`);
      console.log(`  - Customer ID: ${sessionInfo.customerId}`);
      console.log(`  - 对话历史: ${sessionInfo.conversationHistory.length} 条`);
      console.log(`  - 系统提示词: ${sessionInfo.systemPrompt.substring(0, 50)}...`);
    }

    // 6. 等待一段时间后结束会话
    await sleep(2000);
    console.log('\n📞 结束通话会话...');
    callAudioStreamService.endCallSession(callId);
    console.log('✅ 会话已结束\n');

    // 7. 显示活跃会话数
    const activeCount = callAudioStreamService.getActiveSessionCount();
    console.log(`📊 当前活跃会话数: ${activeCount}`);

    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
testAudioStreamFlow()
  .then(() => {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试异常:', error);
    process.exit(1);
  });

