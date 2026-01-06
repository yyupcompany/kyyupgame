/**
 * 真实拨打电话测试（非模拟）
 * 
 * 使用真实的SIP客户端拨打电话到: 18611141133
 * 使用账号: sales001 / zhuge3944
 * 
 * 用法: node tests/make-real-call-actual.js
 */

// 先初始化数据库连接
require('../dist/config/database');

const { sipClientService } = require('../dist/services/sip-client.service');
const { doubaoRealtimeVoiceService } = require('../dist/services/doubao-realtime-voice.service');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 测试配置
const CALL_CONFIG = {
  phoneNumber: '18611141133',
  sipUsername: 'sales001',
  customerId: 1001
};

// 测试状态
const testState = {
  callId: null,
  voiceSessionId: null,
  startTime: null,
  connected: false,
  errors: []
};

/**
 * 保存通话记录
 */
async function saveCallRecord(callId, phoneNumber, status, duration = 0) {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    // 检查是否有call_records表
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'call_records'
    `);

    if (tables.length === 0) {
      console.log('⚠️  call_records表不存在，创建表...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS call_records (
          id INT PRIMARY KEY AUTO_INCREMENT,
          call_id VARCHAR(100) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          direction ENUM('inbound', 'outbound') DEFAULT 'outbound',
          status VARCHAR(50) NOT NULL,
          duration INT DEFAULT 0,
          start_time TIMESTAMP NULL,
          end_time TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      console.log('✅ call_records表创建成功');
    }

    await connection.query(`
      INSERT INTO call_records (
        call_id,
        phone_number,
        direction,
        status,
        duration,
        start_time,
        end_time,
        created_at,
        updated_at
      ) VALUES (?, ?, 'outbound', ?, ?, NOW(), NOW(), NOW(), NOW())
    `, [callId, phoneNumber, status, duration]);

    console.log('✅ 通话记录已保存');
  } catch (error) {
    console.warn('⚠️  保存通话记录失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 设置SIP事件监听
 */
function setupSIPEventListeners() {
  console.log('📡 设置SIP事件监听...\n');

  // 呼叫发起
  sipClientService.on('call-initiated', (data) => {
    console.log('📞 事件: 呼叫已发起');
    console.log(`   Call ID: ${data.callId}`);
    console.log(`   号码: ${data.phoneNumber}\n`);
  });

  // 振铃
  sipClientService.on('call-ringing', (data) => {
    console.log('📞 事件: 振铃中...');
    console.log(`   Call ID: ${data.callId}\n`);
  });

  // 接通
  sipClientService.on('call-answered', async (data) => {
    console.log('✅ 事件: 通话已接通！');
    console.log(`   Call ID: ${data.callId}\n`);
    
    testState.connected = true;
    
    // 启动豆包实时语音
    try {
      console.log('🎤 启动豆包实时语音服务...');
      const sessionId = await doubaoRealtimeVoiceService.createSession(
        data.callId,
        CALL_CONFIG.customerId,
        '你是一位专业的幼儿园招生顾问，请用亲切、专业的语气与家长沟通。'
      );
      testState.voiceSessionId = sessionId;
      console.log(`✅ 豆包语音会话已创建: ${sessionId}\n`);
    } catch (error) {
      console.error('❌ 启动豆包语音失败:', error.message);
    }
  });

  // 音频流
  sipClientService.on('audio-stream', (data) => {
    console.log('🎤 事件: 接收到音频流');
    console.log(`   Call ID: ${data.callId}\n`);
    
    // TODO: 将音频流发送到豆包实时语音
  });

  // 挂断
  sipClientService.on('call-hangup', (data) => {
    console.log('📞 事件: 对方已挂断');
    console.log(`   Call ID: ${data.callId}\n`);
  });

  // 结束
  sipClientService.on('call-ended', async (data) => {
    console.log('📞 事件: 通话已结束');
    console.log(`   Call ID: ${data.callId}\n`);
    
    // 计算通话时长
    const duration = testState.startTime 
      ? Math.floor((Date.now() - testState.startTime.getTime()) / 1000)
      : 0;
    
    // 保存通话记录
    await saveCallRecord(data.callId, data.phoneNumber, 'completed', duration);
    
    // 结束豆包语音会话
    if (testState.voiceSessionId) {
      try {
        await doubaoRealtimeVoiceService.endSession(testState.voiceSessionId);
        console.log('✅ 豆包语音会话已结束\n');
      } catch (error) {
        console.error('❌ 结束豆包语音会话失败:', error.message);
      }
    }
  });

  // 来电
  sipClientService.on('incoming-call', (data) => {
    console.log('📞 事件: 收到来电');
    console.log(`   Call ID: ${data.callId}`);
    console.log(`   号码: ${data.phoneNumber}\n`);
  });
}

/**
 * 设置豆包语音事件监听
 */
function setupDoubaoEventListeners() {
  console.log('📡 设置豆包语音事件监听...\n');

  // 会话就绪
  doubaoRealtimeVoiceService.on('session-ready', (data) => {
    console.log('🎤 事件: 豆包语音会话就绪');
    console.log(`   Session ID: ${data.sessionId}\n`);
  });

  // 用户语音
  doubaoRealtimeVoiceService.on('user-speech', (data) => {
    console.log('🎤 事件: 用户语音');
    console.log(`   文本: ${data.text}`);
    console.log(`   是否最终: ${data.isFinal}\n`);
  });

  // AI回复
  doubaoRealtimeVoiceService.on('ai-response', (data) => {
    console.log('🤖 事件: AI回复');
    console.log(`   文本: ${data.text}`);
    console.log(`   音频大小: ${data.audioData ? data.audioData.length : 0} bytes\n`);
    
    // TODO: 将AI音频发送回SIP
  });

  // 用户打断
  doubaoRealtimeVoiceService.on('user-interrupted', (data) => {
    console.log('⚠️  事件: 用户打断');
    console.log(`   Session ID: ${data.sessionId}\n`);
  });

  // 错误
  doubaoRealtimeVoiceService.on('session-error', (data) => {
    console.error('❌ 事件: 豆包语音错误');
    console.error(`   错误: ${data.error}\n`);
  });
}

/**
 * 真实拨打电话
 */
async function makeRealCall() {
  console.log('\n🚀 开始真实拨打电话\n');
  console.log('=' .repeat(50));
  console.log('通话信息');
  console.log('=' .repeat(50));
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`SIP账号: ${CALL_CONFIG.sipUsername}`);
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 步骤1: 连接SIP服务器
    console.log('步骤1: 连接SIP服务器');
    await sipClientService.connect();
    console.log('');

    // 步骤2: 设置事件监听
    console.log('步骤2: 设置事件监听');
    setupSIPEventListeners();
    setupDoubaoEventListeners();

    // 步骤3: 拨打电话
    console.log('步骤3: 拨打电话');
    testState.startTime = new Date();
    const callId = await sipClientService.makeCall(CALL_CONFIG.phoneNumber);
    testState.callId = callId;
    console.log('');

    // 步骤4: 等待通话（30秒）
    console.log('步骤4: 等待通话进行中...');
    console.log('   （30秒后自动挂断）\n');
    
    await sleep(30000);

    // 步骤5: 挂断电话
    console.log('步骤5: 挂断电话');
    if (testState.callId) {
      await sipClientService.hangup(testState.callId);
    }
    console.log('');

    // 步骤6: 断开SIP连接
    console.log('步骤6: 断开SIP连接');
    await sipClientService.disconnect();
    console.log('');

    // 生成报告
    generateReport();

  } catch (error) {
    console.error('\n❌ 拨打电话失败:', error.message);
    console.error(error);
    
    testState.errors.push(error.message);
    
    // 保存失败记录
    if (testState.callId) {
      await saveCallRecord(testState.callId, CALL_CONFIG.phoneNumber, 'failed');
    }
    
    // 清理
    try {
      await sipClientService.disconnect();
    } catch (e) {
      // 忽略清理错误
    }
    
    generateReport();
    process.exit(1);
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n' + '=' .repeat(50));
  console.log('测试报告');
  console.log('=' .repeat(50));
  
  if (testState.callId) {
    console.log(`Call ID: ${testState.callId}`);
  }
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`通话状态: ${testState.connected ? '已接通' : '未接通'}`);
  
  if (testState.startTime) {
    const duration = Math.floor((Date.now() - testState.startTime.getTime()) / 1000);
    console.log(`通话时长: ${duration}秒`);
  }
  
  if (testState.errors.length > 0) {
    console.log('\n错误列表:');
    testState.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('=' .repeat(50));
  console.log('');
  
  if (testState.connected) {
    console.log('✅ 测试成功！真实通话已建立！\n');
  } else {
    console.log('⚠️  测试未完全成功，请检查错误信息\n');
  }
}

/**
 * 辅助函数: 延迟
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数
 */
async function main() {
  await makeRealCall();
  process.exit(0);
}

// 运行测试
main();

