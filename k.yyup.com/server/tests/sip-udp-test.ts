/**
 * SIP UDP服务测试
 * 测试UDP方式发送SIP INVITE
 */

import { sipUDPService } from '../src/services/sip-udp.service';

async function testSIPUDP() {
  console.log('🧪 开始测试SIP UDP服务...\n');

  try {
    // 测试电话号码
    const phoneNumber = '18611141133';
    
    console.log(`📞 测试呼叫: ${phoneNumber}`);
    console.log('-----------------------------------\n');

    // 监听事件
    sipUDPService.on('call-initiated', (data) => {
      console.log('✅ 事件: 呼叫已发起');
      console.log(`   Call ID: ${data.callId}`);
      console.log(`   电话: ${data.phoneNumber}\n`);
    });

    sipUDPService.on('call-trying', (data) => {
      console.log('📞 事件: 呼叫尝试中...');
      console.log(`   Call ID: ${data.callId}\n`);
    });

    sipUDPService.on('call-ringing', (data) => {
      console.log('📞 事件: 对方振铃中...');
      console.log(`   Call ID: ${data.callId}\n`);
    });

    sipUDPService.on('call-answered', (data) => {
      console.log('✅ 事件: 通话已接通！');
      console.log(`   Call ID: ${data.callId}\n`);
    });

    sipUDPService.on('call-failed', (data) => {
      console.error('❌ 事件: 呼叫失败');
      console.error(`   Call ID: ${data.callId}`);
      console.error(`   原因: ${data.error || data.statusCode}\n`);
    });

    sipUDPService.on('call-timeout', (data) => {
      console.warn('⏱️  事件: 呼叫超时');
      console.warn(`   Call ID: ${data.callId}\n`);
    });

    sipUDPService.on('call-ended', (data) => {
      console.log('📞 事件: 通话已结束');
      console.log(`   Call ID: ${data.callId}`);
      console.log(`   时长: ${data.duration}秒\n`);
    });

    // 发起呼叫
    const callId = await sipUDPService.makeCall(phoneNumber);
    
    console.log('-----------------------------------');
    console.log(`✅ 呼叫发起成功！`);
    console.log(`   Call ID: ${callId}`);
    console.log('-----------------------------------\n');

    // 等待一段时间观察响应
    console.log('⏳ 等待30秒观察SIP响应...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 获取通话信息
    const callInfo = sipUDPService.getCallInfo(callId);
    if (callInfo) {
      console.log('📊 通话信息:');
      console.log(`   Call ID: ${callInfo.callId}`);
      console.log(`   电话: ${callInfo.phoneNumber}`);
      console.log(`   状态: ${callInfo.status}`);
      console.log(`   开始时间: ${callInfo.startTime}`);
      console.log('-----------------------------------\n');
    }

    // 如果通话已接通，等待10秒后挂断
    if (callInfo && callInfo.status === 'answered') {
      console.log('⏳ 通话已接通，10秒后自动挂断...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('📞 挂断通话...');
      await sipUDPService.hangupCall(callId);
      console.log('✅ 通话已挂断\n');
    }

    console.log('✅ 测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testSIPUDP();

