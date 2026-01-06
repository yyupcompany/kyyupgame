/**
 * 使用网关前缀拨打电话测试
 * 
 * 使用URI格式: sip:sales001/18611141133@47.94.82.59
 * 
 * 用法: node tests/make-call-with-gateway-prefix.js
 */

const sip = require('sip');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 测试配置
const CALL_CONFIG = {
  phoneNumber: '18611141133',
  authUsername: 'kanderadmin',
  authPassword: 'Szblade3944',
  gatewayName: 'sales001',
  sipServer: '47.94.82.59',
  sipPort: 5060
};

// 测试状态
const testState = {
  callId: null,
  startTime: null,
  connected: false,
  dialog: null,
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

    await connection.query(`
      INSERT INTO call_records (
        call_id, phone_number, direction, status, duration, start_time, end_time
      ) VALUES (?, ?, 'outbound', ?, ?, NOW(), NOW())
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
 * 生成SDP
 */
function generateSDP(host) {
  return `v=0
o=- ${Date.now()} ${Date.now()} IN IP4 ${host}
s=SIP Call
c=IN IP4 ${host}
t=0 0
m=audio 10000 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=sendrecv
`;
}

/**
 * 使用网关前缀拨打电话
 */
async function makeCallWithGatewayPrefix() {
  console.log('\n🚀 使用网关前缀拨打电话\n');
  console.log('=' .repeat(50));
  console.log('通话信息');
  console.log('=' .repeat(50));
  console.log(`认证账号: ${CALL_CONFIG.authUsername}`);
  console.log(`呼叫网关: ${CALL_CONFIG.gatewayName}`);
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`SIP服务器: ${CALL_CONFIG.sipServer}:${CALL_CONFIG.sipPort}`);
  console.log(`协议: UDP`);
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 步骤1: 启动SIP栈
    console.log('步骤1: 启动SIP栈');
    sip.start({
      port: 5060,
      udp: true,
      tcp: false,
      publicAddress: CALL_CONFIG.sipServer
    }, (request) => {
      console.log(`📞 收到请求: ${request.method}`);
    });
    console.log('✅ SIP栈已启动\n');

    // 步骤2: 拨打电话（使用网关前缀）
    console.log('步骤2: 拨打电话（使用网关前缀）');
    testState.callId = `call_${Date.now()}`;
    testState.startTime = new Date();

    const authUri = `sip:${CALL_CONFIG.authUsername}@${CALL_CONFIG.sipServer}`;
    // 🔑 关键：使用网关前缀格式
    const targetUri = `sip:${CALL_CONFIG.gatewayName}/${CALL_CONFIG.phoneNumber}@${CALL_CONFIG.sipServer}`;
    const fromTag = Math.random().toString(36).substring(7);

    console.log(`   认证URI: ${authUri}`);
    console.log(`   目标URI: ${targetUri}`);
    console.log(`   Call-ID: ${testState.callId}\n`);

    const inviteRequest = {
      method: 'INVITE',
      uri: targetUri,
      headers: {
        to: { uri: targetUri },
        from: { uri: authUri, params: { tag: fromTag } },
        'call-id': testState.callId,
        cseq: { method: 'INVITE', seq: 1 },
        contact: [{ uri: authUri }],
        'content-type': 'application/sdp',
        'max-forwards': '70'
      },
      content: generateSDP(CALL_CONFIG.sipServer)
    };

    console.log('   发送INVITE（网关前缀格式）...');
    console.log(`   URI: ${targetUri}\n`);

    // 发送请求
    sip.send(inviteRequest, (response) => {
      console.log(`\n📞 收到响应: ${response.status} ${response.reason || ''}`);

      if (response.status === 100) {
        console.log('   状态: 尝试中...');
      } else if (response.status === 180) {
        console.log('   状态: 振铃中...');
      } else if (response.status === 183) {
        console.log('   状态: 会话进行中...');
      } else if (response.status === 200) {
        console.log('✅ 通话已接通！\n');
        testState.connected = true;

        // 发送ACK
        const ackRequest = {
          method: 'ACK',
          uri: targetUri,
          headers: {
            to: response.headers.to,
            from: response.headers.from,
            'call-id': testState.callId,
            cseq: { method: 'ACK', seq: 1 }
          }
        };

        sip.send(ackRequest);
        console.log('   已发送ACK确认\n');

        testState.dialog = response;
      } else if (response.status >= 300) {
        console.error(`❌ 通话失败: ${response.status} ${response.reason || ''}\n`);
        testState.errors.push(`${response.status} ${response.reason || ''}`);
      }
    });

    console.log('✅ INVITE请求已发送\n');

    // 步骤3: 等待通话（30秒）
    console.log('步骤3: 等待通话进行中...');
    console.log('   （30秒后自动挂断）\n');
    await sleep(30000);

    // 步骤4: 挂断电话
    console.log('步骤4: 挂断电话');
    if (testState.dialog) {
      const byeRequest = {
        method: 'BYE',
        uri: targetUri,
        headers: {
          to: testState.dialog.headers.to,
          from: testState.dialog.headers.from,
          'call-id': testState.callId,
          cseq: { method: 'BYE', seq: 2 }
        }
      };

      sip.send(byeRequest);
      console.log('✅ BYE请求已发送\n');
    }

    // 步骤5: 停止SIP栈
    console.log('步骤5: 停止SIP栈');
    sip.stop();
    console.log('✅ SIP栈已停止\n');

    // 计算通话时长
    const duration = testState.startTime
      ? Math.floor((Date.now() - testState.startTime.getTime()) / 1000)
      : 0;

    // 保存通话记录
    await saveCallRecord(
      testState.callId,
      CALL_CONFIG.phoneNumber,
      testState.connected ? 'completed' : 'failed',
      duration
    );

    // 生成报告
    generateReport(duration);

  } catch (error) {
    console.error('\n❌ 拨打电话失败:', error.message);
    console.error(error);

    testState.errors.push(error.message);

    if (testState.callId) {
      await saveCallRecord(testState.callId, CALL_CONFIG.phoneNumber, 'failed');
    }

    try {
      sip.stop();
    } catch (e) {
      // 忽略清理错误
    }

    generateReport(0);
    process.exit(1);
  }
}

/**
 * 生成测试报告
 */
function generateReport(duration) {
  console.log('\n' + '=' .repeat(50));
  console.log('测试报告');
  console.log('=' .repeat(50));

  if (testState.callId) {
    console.log(`Call-ID: ${testState.callId}`);
  }
  console.log(`认证账号: ${CALL_CONFIG.authUsername}`);
  console.log(`呼叫网关: ${CALL_CONFIG.gatewayName}`);
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`通话状态: ${testState.connected ? '已接通' : '未接通'}`);
  console.log(`通话时长: ${duration}秒`);

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
  await makeCallWithGatewayPrefix();

  // 等待一段时间让所有响应处理完成
  await sleep(2000);

  process.exit(0);
}

// 运行测试
main();

