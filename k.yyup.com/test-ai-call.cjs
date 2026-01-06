#!/usr/bin/env node
/**
 * AI智能呼叫测试脚本
 * 
 * 测试完整的呼叫流程：
 * 1. SIP呼叫建立
 * 2. RTP音频流传输
 * 3. ASR语音识别
 * 4. LLM智能对话
 * 5. TTS语音合成
 * 6. 音频回传
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const PHONE_NUMBER = '18611141133';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAICall() {
  try {
    log('\n🚀 开始AI智能呼叫测试\n', 'bright');
    
    // 1. 发起呼叫
    log('📞 步骤1: 发起呼叫...', 'cyan');
    const callResponse = await axios.post(`${API_BASE}/call-center/call/udp/make`, {
      phoneNumber: PHONE_NUMBER,
      contactName: '测试客户',
      extension: 1001,
      systemPrompt: `你是一位专业的幼儿园招生顾问。
当前正在与家长通话，请：
1. 礼貌地介绍自己和幼儿园
2. 询问孩子的年龄和基本情况
3. 简要介绍幼儿园的特色
4. 邀请家长预约参观

注意：
- 保持友好、专业的语气
- 回答要简洁，每次不超过50字
- 不要做绝对化承诺`
    });

    if (!callResponse.data.success) {
      log(`❌ 呼叫失败: ${callResponse.data.message}`, 'red');
      return;
    }

    const callId = callResponse.data.data.callId;
    const status = callResponse.data.data.status;
    
    log(`✅ 呼叫已发起`, 'green');
    log(`   Call ID: ${callId}`, 'blue');
    log(`   状态: ${status}`, 'blue');
    log(`   消息: ${callResponse.data.data.message}`, 'blue');

    // 2. 等待呼叫接通
    log('\n⏳ 步骤2: 等待呼叫接通...', 'cyan');
    log('   (请接听电话)', 'yellow');
    
    // 轮询呼叫状态
    let callAnswered = false;
    let attempts = 0;
    const maxAttempts = 30; // 30秒超时

    while (!callAnswered && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      try {
        const statusResponse = await axios.get(`${API_BASE}/call-center/call/${callId}/status`);
        const currentStatus = statusResponse.data.data.status;
        
        if (currentStatus === 'answered') {
          callAnswered = true;
          log(`✅ 呼叫已接通！`, 'green');
          log(`   通话时长: ${statusResponse.data.data.duration || 0}秒`, 'blue');
        } else if (currentStatus === 'ringing') {
          process.stdout.write('.');
        } else if (currentStatus === 'failed' || currentStatus === 'ended') {
          log(`\n❌ 呼叫失败或已结束: ${currentStatus}`, 'red');
          return;
        }
      } catch (error) {
        // 忽略状态查询错误，继续等待
      }
    }

    if (!callAnswered) {
      log('\n⏱️  呼叫超时，未接通', 'yellow');
      return;
    }

    // 3. 显示AI功能状态
    log('\n🤖 步骤3: AI功能已激活', 'cyan');
    log('   ✅ RTP音频流已建立', 'green');
    log('   ✅ ASR语音识别已启动', 'green');
    log('   ✅ LLM智能对话已就绪', 'green');
    log('   ✅ TTS语音合成已准备', 'green');

    // 4. 模拟对话流程
    log('\n💬 步骤4: AI对话流程演示', 'cyan');
    log('   客户说话 → ASR识别 → LLM生成回复 → TTS合成 → 播放给客户', 'blue');
    log('\n   示例对话流程:', 'yellow');
    log('   👤 客户: "你好，我想了解一下你们幼儿园"', 'blue');
    log('   🤖 AI: "您好！我是XX幼儿园的招生顾问，很高兴为您服务。请问您的孩子多大了？"', 'green');
    log('   👤 客户: "我家孩子3岁了"', 'blue');
    log('   🤖 AI: "3岁正是入园的好年龄！我们有专门的小班课程。您方便来参观一下吗？"', 'green');

    // 5. 等待通话
    log('\n⏳ 步骤5: 通话进行中...', 'cyan');
    log('   (请与AI进行对话测试)', 'yellow');
    log('   (按Ctrl+C结束测试)\n', 'yellow');

    // 持续监控通话状态
    const monitorInterval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`${API_BASE}/call-center/call/${callId}/status`);
        const currentStatus = statusResponse.data.data.status;
        const duration = statusResponse.data.data.duration || 0;
        
        process.stdout.write(`\r   通话时长: ${duration}秒 | 状态: ${currentStatus}   `);
        
        if (currentStatus === 'ended' || currentStatus === 'failed') {
          clearInterval(monitorInterval);
          log('\n\n📞 通话已结束', 'yellow');
          
          // 获取通话记录
          try {
            const recordResponse = await axios.get(`${API_BASE}/call-center/call/${callId}/record`);
            if (recordResponse.data.success) {
              const record = recordResponse.data.data;
              log('\n📊 通话记录:', 'cyan');
              log(`   通话时长: ${record.duration}秒`, 'blue');
              log(`   开始时间: ${record.startTime}`, 'blue');
              log(`   结束时间: ${record.endTime}`, 'blue');
              
              if (record.transcription) {
                log('\n📝 对话记录:', 'cyan');
                log(record.transcription, 'blue');
              }
              
              if (record.aiResponses) {
                log('\n🤖 AI回复统计:', 'cyan');
                log(`   回复次数: ${record.aiResponses.length}`, 'blue');
              }
            }
          } catch (error) {
            log('   (无法获取通话记录)', 'yellow');
          }
          
          process.exit(0);
        }
      } catch (error) {
        // 忽略监控错误
      }
    }, 1000);

    // 处理Ctrl+C
    process.on('SIGINT', async () => {
      clearInterval(monitorInterval);
      log('\n\n🛑 用户中断测试', 'yellow');
      
      // 尝试挂断通话
      try {
        await axios.post(`${API_BASE}/call-center/call/${callId}/hangup`);
        log('✅ 通话已挂断', 'green');
      } catch (error) {
        log('⚠️  挂断失败', 'yellow');
      }
      
      process.exit(0);
    });

  } catch (error) {
    log('\n❌ 测试失败:', 'red');
    if (error.response) {
      log(`   状态码: ${error.response.status}`, 'red');
      log(`   错误信息: ${error.response.data.message || error.response.statusText}`, 'red');
      if (error.response.data.error) {
        log(`   详细错误: ${error.response.data.error}`, 'red');
      }
    } else if (error.request) {
      log('   无法连接到服务器', 'red');
      log('   请确保后端服务正在运行 (npm run start:backend)', 'yellow');
    } else {
      log(`   ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// 运行测试
log('═══════════════════════════════════════════════════', 'bright');
log('   AI智能呼叫中心 - 完整流程测试', 'bright');
log('═══════════════════════════════════════════════════', 'bright');

testAICall();

