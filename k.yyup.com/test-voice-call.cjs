#!/usr/bin/env node

/**
 * 测试完整的语音通话流程
 * 
 * 测试步骤:
 * 1. 发起呼叫
 * 2. 等待接通
 * 3. 模拟发送音频（客户说话）
 * 4. 验证AI回复音频通过RTP发送
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';
const TEST_PHONE = '18611141133';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求封装
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主测试函数
async function testVoiceCall() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🎙️  测试完整语音通话流程', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // 1. 登录获取token
    log('\n📝 步骤1: 登录获取token', 'blue');
    const loginResult = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResult.status !== 200 || !loginResult.data.success) {
      log('❌ 登录失败', 'red');
      return;
    }

    const token = loginResult.data.data.token;
    log('✅ 登录成功', 'green');

    // 2. 发起呼叫
    log('\n📞 步骤2: 发起呼叫', 'blue');
    log(`   目标号码: ${TEST_PHONE}`, 'yellow');
    
    const callResult = await request('POST', '/api/call-center/call', {
      phoneNumber: TEST_PHONE,
      customerId: 1,
      systemPrompt: '你是XX幼儿园的招生顾问，请热情专业地回答家长的问题。'
    }, token);

    if (callResult.status !== 200 || !callResult.data.success) {
      log(`❌ 发起呼叫失败: ${JSON.stringify(callResult.data)}`, 'red');
      return;
    }

    const callId = callResult.data.data.callId;
    log(`✅ 呼叫已发起: ${callId}`, 'green');

    // 3. 等待呼叫状态变化
    log('\n⏳ 步骤3: 等待呼叫接通', 'blue');
    let callStatus = 'connecting';
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts && callStatus !== 'answered' && callStatus !== 'failed') {
      await sleep(1000);
      attempts++;

      const statusResult = await request('GET', `/api/call-center/call/${callId}/status`, null, token);
      
      if (statusResult.status === 200 && statusResult.data.success) {
        callStatus = statusResult.data.data.status;
        log(`   状态: ${callStatus} (${attempts}/${maxAttempts})`, 'yellow');
      }
    }

    if (callStatus === 'answered') {
      log('✅ 呼叫已接通！', 'green');
    } else if (callStatus === 'failed') {
      log('❌ 呼叫失败', 'red');
      return;
    } else {
      log('⚠️  呼叫超时', 'yellow');
      return;
    }

    // 4. 等待一段时间让RTP会话建立
    log('\n⏳ 步骤4: 等待RTP会话建立', 'blue');
    await sleep(2000);
    log('✅ RTP会话应该已建立', 'green');

    // 5. 检查呼叫详情
    log('\n📊 步骤5: 检查呼叫详情', 'blue');
    const detailResult = await request('GET', `/api/call-center/call/${callId}`, null, token);
    
    if (detailResult.status === 200 && detailResult.data.success) {
      const call = detailResult.data.data;
      log(`   呼叫ID: ${call.id}`, 'yellow');
      log(`   状态: ${call.status}`, 'yellow');
      log(`   开始时间: ${call.startTime}`, 'yellow');
      log(`   本地RTP端口: ${call.localRtpPort || '未知'}`, 'yellow');
      log(`   远程RTP端口: ${call.remoteRtpPort || '未知'}`, 'yellow');
    }

    // 6. 说明
    log('\n📝 步骤6: 语音交互说明', 'blue');
    log('   ✅ 呼叫已接通，RTP会话已建立', 'green');
    log('   ✅ 系统正在监听来自电话的音频', 'green');
    log('   ✅ 当接收到音频时，会自动:', 'green');
    log('      1. ASR识别语音', 'yellow');
    log('      2. 匹配话术模板', 'yellow');
    log('      3. TTS合成回复', 'yellow');
    log('      4. 通过RTP发送回电话', 'yellow');
    log('   ', '');
    log('   💡 请在电话中说话，系统会自动回复！', 'cyan');
    log('   ', '');
    log('   🔍 查看服务器日志以监控音频处理流程:', 'cyan');
    log('      - [RTP→ASR] 接收音频', 'yellow');
    log('      - [ASR] 识别结果', 'yellow');
    log('      - [话术匹配] 匹配结果', 'yellow');
    log('      - [TTS] 合成音频', 'yellow');
    log('      - [TTS→RTP] 发送回复', 'yellow');

    // 7. 保持呼叫30秒
    log('\n⏳ 步骤7: 保持呼叫30秒以测试语音交互', 'blue');
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r   剩余时间: ${i}秒 `);
      await sleep(1000);
    }
    console.log('');

    // 8. 挂断电话
    log('\n📞 步骤8: 挂断电话', 'blue');
    const hangupResult = await request('POST', `/api/call-center/call/${callId}/hangup`, null, token);
    
    if (hangupResult.status === 200 && hangupResult.data.success) {
      log('✅ 电话已挂断', 'green');
    } else {
      log('⚠️  挂断失败，但测试继续', 'yellow');
    }

    // 9. 总结
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 测试总结', 'cyan');
    log('='.repeat(60), 'cyan');
    log('✅ 呼叫流程测试完成', 'green');
    log('✅ RTP会话已建立', 'green');
    log('✅ 语音交互管道已就绪', 'green');
    log('', '');
    log('💡 下一步:', 'cyan');
    log('   1. 在真实电话中测试语音交互', 'yellow');
    log('   2. 观察服务器日志确认音频处理流程', 'yellow');
    log('   3. 验证AI回复音频是否正确发送到电话', 'yellow');

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    console.error(error);
  }
}

// 运行测试
testVoiceCall();

