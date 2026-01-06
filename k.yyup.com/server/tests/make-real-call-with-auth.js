/**
 * 真实拨打电话测试（带认证）
 * 
 * 使用kanderadmin账号认证后拨打电话到: 18611141133
 * 认证账号: kanderadmin / Szblade3944
 * 拨打账号: sales001 / zhuge3944
 * 
 * 用法: node tests/make-real-call-with-auth.js
 */

const sip = require('sip');
const digest = require('sip/digest');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 测试配置
const CALL_CONFIG = {
  phoneNumber: '18611141133',
  // 认证账号
  authUsername: 'kanderadmin',
  authPassword: 'Szblade3944',
  // 拨打账号
  sipUsername: 'sales001',
  sipPassword: 'zhuge3944',
  sipServer: '47.94.82.59',
  sipPort: 5060
};

// 测试状态
const testState = {
  callId: null,
  startTime: null,
  connected: false,
  registered: false,
  authSession: {},
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

    const [tables] = await connection.query(`SHOW TABLES LIKE 'call_records'`);

    if (tables.length === 0) {
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
    }

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
 * 注册到SIP服务器
 */
function registerToServer() {
  return new Promise((resolve, reject) => {
    console.log('步骤1: 注册到SIP服务器');
    console.log(`   使用账号: ${CALL_CONFIG.authUsername}\n`);

    const localUri = `sip:${CALL_CONFIG.authUsername}@${CALL_CONFIG.sipServer}`;
    const fromTag = Math.random().toString(36).substring(7);

    const registerRequest = {
      method: 'REGISTER',
      uri: `sip:${CALL_CONFIG.sipServer}`,
      headers: {
        to: { uri: localUri },
        from: { uri: localUri, params: { tag: fromTag } },
        'call-id': `register_${Date.now()}`,
        cseq: { method: 'REGISTER', seq: 1 },
        contact: [{ uri: localUri, params: { expires: '3600' } }],
        expires: '3600',
        'max-forwards': '70'
      }
    };

    console.log('   发送REGISTER请求...');

    sip.send(registerRequest, (response) => {
      console.log(`\n📞 收到REGISTER响应: ${response.status} ${response.reason}`);

      if (response.status === 200) {
        console.log('✅ 注册成功！\n');
        testState.registered = true;
        resolve(true);
      } else if (response.status === 401 || response.status === 407) {
        console.log('🔐 需要认证，使用digest认证...\n');

        // 使用digest认证
        const credentials = {
          user: CALL_CONFIG.authUsername,
          password: CALL_CONFIG.authPassword
        };

        // 签名请求
        const authRequest = digest.signRequest(
          testState.authSession,
          registerRequest,
          response,
          credentials
        );

        console.log('   发送带认证的REGISTER请求...');

        // 重新发送带认证的请求
        sip.send(authRequest, (authResponse) => {
          console.log(`\n📞 收到认证响应: ${authResponse.status} ${authResponse.reason}`);

          if (authResponse.status === 200) {
            console.log('✅ 认证成功！注册完成！\n');
            testState.registered = true;
            resolve(true);
          } else {
            console.error(`❌ 认证失败: ${authResponse.status} ${authResponse.reason}\n`);
            testState.errors.push(`认证失败: ${authResponse.status} ${authResponse.reason}`);
            reject(new Error(`认证失败: ${authResponse.status}`));
          }
        });
      } else {
        console.error(`❌ 注册失败: ${response.status} ${response.reason}\n`);
        testState.errors.push(`注册失败: ${response.status} ${response.reason}`);
        reject(new Error(`注册失败: ${response.status}`));
      }
    });
  });
}

/**
 * 拨打电话
 */
function makeCall() {
  return new Promise((resolve, reject) => {
    console.log('步骤2: 拨打电话');
    console.log(`   目标号码: ${CALL_CONFIG.phoneNumber}\n`);

    testState.callId = `call_${Date.now()}`;
    testState.startTime = new Date();

    const localUri = `sip:${CALL_CONFIG.sipUsername}@${CALL_CONFIG.sipServer}`;
    const remoteUri = `sip:${CALL_CONFIG.phoneNumber}@${CALL_CONFIG.sipServer}`;
    const fromTag = Math.random().toString(36).substring(7);

    const inviteRequest = {
      method: 'INVITE',
      uri: remoteUri,
      headers: {
        to: { uri: remoteUri },
        from: { uri: localUri, params: { tag: fromTag } },
        'call-id': testState.callId,
        cseq: { method: 'INVITE', seq: 1 },
        contact: [{ uri: localUri }],
        'content-type': 'application/sdp',
        'max-forwards': 70
      },
      content: generateSDP(CALL_CONFIG.sipServer)
    };

    console.log('   发送INVITE请求...');

    sip.send(inviteRequest, (response) => {
      console.log(`\n📞 收到INVITE响应: ${response.status} ${response.reason}`);

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
          uri: remoteUri,
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
        resolve(true);
      } else if (response.status >= 300) {
        console.error(`❌ 通话失败: ${response.status} ${response.reason}\n`);
        testState.errors.push(`通话失败: ${response.status} ${response.reason}`);
        resolve(false);
      }
    });
  });
}

/**
 * 真实拨打电话（带认证）
 */
async function makeRealCallWithAuth() {
  console.log('\n🚀 开始真实拨打电话（带认证）\n');
  console.log('=' .repeat(50));
  console.log('通话信息');
  console.log('=' .repeat(50));
  console.log(`认证账号: ${CALL_CONFIG.authUsername}`);
  console.log(`拨打账号: ${CALL_CONFIG.sipUsername}`);
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`SIP服务器: ${CALL_CONFIG.sipServer}:${CALL_CONFIG.sipPort}`);
  console.log(`协议: UDP`);
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 启动SIP栈
    console.log('步骤0: 启动SIP栈');
    sip.start({
      port: 5060,
      udp: true,
      tcp: false,
      publicAddress: CALL_CONFIG.sipServer
    }, (request) => {
      console.log(`📞 收到请求: ${request.method}`);
    });
    console.log('✅ SIP栈已启动\n');

    // 步骤1: 注册
    await registerToServer();

    // 步骤2: 拨打电话
    await makeCall();

    // 步骤3: 等待通话（30秒）
    console.log('步骤3: 等待通话进行中...');
    console.log('   （30秒后自动挂断）\n');
    await sleep(30000);

    // 步骤4: 挂断电话
    console.log('步骤4: 挂断电话');
    if (testState.dialog) {
      const remoteUri = `sip:${CALL_CONFIG.phoneNumber}@${CALL_CONFIG.sipServer}`;
      const byeRequest = {
        method: 'BYE',
        uri: remoteUri,
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
  console.log(`拨打账号: ${CALL_CONFIG.sipUsername}`);
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`注册状态: ${testState.registered ? '已注册' : '未注册'}`);
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
  } else if (testState.registered) {
    console.log('⚠️  注册成功但通话未建立，请检查错误信息\n');
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
  await makeRealCallWithAuth();

  // 等待一段时间让所有响应处理完成
  await sleep(2000);

  process.exit(0);
}

// 运行测试
main();

