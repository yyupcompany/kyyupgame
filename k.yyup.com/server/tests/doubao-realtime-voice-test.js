/**
 * 豆包实时语音大模型测试
 * 
 * 测试端到端语音对话功能
 */

const { callCenterRealtimeService } = require('../dist/services/call-center-realtime.service');

async function testRealtimeVoice() {
  console.log('🧪 开始测试豆包实时语音大模型...\n');

  try {
    const callId = `test_call_${Date.now()}`;
    const customerId = 1001;
    const systemPrompt = `你是一位专业的幼儿园招生顾问。
你的任务是礼貌、热情地与家长交流，了解需求，介绍幼儿园特色。
回复要简洁明了，每次回复控制在50字以内。`;

    // 1. 监听事件
    console.log('📡 设置事件监听...');
    
    callCenterRealtimeService.on('call-ready', (data) => {
      console.log('\n✅ 通话就绪:');
      console.log(`  - Call ID: ${data.callId}`);
      console.log(`  - Session ID: ${data.sessionId}`);
    });

    callCenterRealtimeService.on('user-speech', (data) => {
      console.log('\n🎤 用户语音:');
      console.log(`  - 文本: ${data.text}`);
      console.log(`  - 是否最终: ${data.isFinal}`);
    });

    callCenterRealtimeService.on('ai-response', (data) => {
      console.log('\n🤖 AI回复:');
      console.log(`  - 文本: ${data.text}`);
      console.log(`  - 音频大小: ${data.audioData.length} bytes`);
      console.log(`  - 时长: ${data.duration}秒`);
    });

    callCenterRealtimeService.on('user-interrupted', (data) => {
      console.log('\n⏸️  用户打断:');
      console.log(`  - Call ID: ${data.callId}`);
    });

    callCenterRealtimeService.on('call-error', (data) => {
      console.error('\n❌ 通话错误:');
      console.error(`  - Call ID: ${data.callId}`);
      console.error(`  - 错误: ${data.error}`);
    });

    callCenterRealtimeService.on('call-ended', (data) => {
      console.log('\n📞 通话结束:');
      console.log(`  - Call ID: ${data.callId}`);
      console.log(`  - 时长: ${data.duration}秒`);
    });

    // 2. 开始通话
    console.log('\n📞 开始通话...');
    await callCenterRealtimeService.startCall(callId, customerId, systemPrompt);
    console.log('✅ 通话已开始\n');

    // 3. 等待会话就绪
    await sleep(2000);

    // 4. 模拟发送音频数据
    console.log('🎤 模拟发送音频数据...');
    
    // 模拟1秒的PCM音频数据 (16kHz, 16bit, mono)
    const audioChunk = Buffer.alloc(32000);
    
    // 分批发送音频（模拟实时流）
    for (let i = 0; i < 5; i++) {
      await callCenterRealtimeService.processAudio(
        callId, 
        audioChunk.slice(i * 6400, (i + 1) * 6400)
      );
      await sleep(200); // 每200ms发送一次
    }
    
    console.log('✅ 音频数据发送完成\n');

    // 5. 等待AI处理和回复
    console.log('⏳ 等待AI处理...');
    await sleep(5000);

    // 6. 查看活跃通话
    const activeCount = callCenterRealtimeService.getActiveCallCount();
    console.log(`\n📊 当前活跃通话数: ${activeCount}`);

    const callInfo = callCenterRealtimeService.getCallInfo(callId);
    if (callInfo) {
      console.log('\n📋 通话信息:');
      console.log(`  - Call ID: ${callInfo.callId}`);
      console.log(`  - Session ID: ${callInfo.sessionId}`);
      console.log(`  - Customer ID: ${callInfo.customerId}`);
      console.log(`  - 开始时间: ${new Date(callInfo.startTime).toLocaleString()}`);
    }

    // 7. 结束通话
    console.log('\n📞 结束通话...');
    await callCenterRealtimeService.endCall(callId);
    
    await sleep(1000);

    console.log('\n✅ 测试完成！');
    console.log('\n📊 最终统计:');
    console.log(`  - 活跃通话数: ${callCenterRealtimeService.getActiveCallCount()}`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
testRealtimeVoice()
  .then(() => {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试异常:', error);
    process.exit(1);
  });

