/**
 * 真实拨打电话测试（独立版本，不依赖Sequelize）
 * 
 * 使用真实的SIP客户端拨打电话到: 18611141133
 * 使用账号: sales001 / zhuge3944
 * 
 * 用法: node tests/make-real-call-standalone.js
 */

const { UserAgent, Inviter } = require('sip.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 测试配置
const CALL_CONFIG = {
  phoneNumber: '18611141133',
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
  userAgent: null,
  session: null,
  errors: []
};

/**
 * 加载SIP配置
 */
async function loadSIPConfig() {
  let connection;

  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('📞 加载SIP配置...');
    const [results] = await connection.query(`
      SELECT * FROM sip_configs WHERE username = ? AND is_active = TRUE
    `, [CALL_CONFIG.sipUsername]);

    if (!results || results.length === 0) {
      throw new Error(`未找到 ${CALL_CONFIG.sipUsername} 的SIP配置`);
    }

    const config = results[0];
    console.log('✅ SIP配置加载成功:');
    console.log(`   服务器: ${config.server_host}:${config.server_port}`);
    console.log(`   账号: ${config.username}`);
    console.log(`   协议: ${config.protocol}\n`);

    return config;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

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
        end_time
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
 * 真实拨打电话
 */
async function makeRealCall() {
  console.log('\n🚀 开始真实拨打电话\n');
  console.log('=' .repeat(50));
  console.log('通话信息');
  console.log('=' .repeat(50));
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`SIP账号: ${CALL_CONFIG.sipUsername}`);
  console.log(`SIP服务器: ${CALL_CONFIG.sipServer}:${CALL_CONFIG.sipPort}`);
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 步骤1: 加载SIP配置
    console.log('步骤1: 加载SIP配置');
    const sipConfig = await loadSIPConfig();

    // 步骤2: 创建SIP UserAgent
    console.log('步骤2: 创建SIP UserAgent');
    const uriString = `sip:${sipConfig.username}@${sipConfig.server_host}`;
    const uri = UserAgent.makeURI(uriString);
    
    if (!uri) {
      throw new Error('无效的SIP URI');
    }

    const userAgentOptions = {
      uri,
      transportOptions: {
        server: `ws://${sipConfig.server_host}:${sipConfig.server_port}`
      },
      authorizationUsername: sipConfig.username,
      authorizationPassword: sipConfig.password
    };

    testState.userAgent = new UserAgent(userAgentOptions);
    console.log('✅ UserAgent创建成功\n');

    // 步骤3: 启动UserAgent
    console.log('步骤3: 启动UserAgent');
    await testState.userAgent.start();
    console.log('✅ UserAgent已启动\n');

    // 步骤4: 拨打电话
    console.log('步骤4: 拨打电话');
    testState.callId = `call_${Date.now()}`;
    testState.startTime = new Date();

    const targetString = `sip:${CALL_CONFIG.phoneNumber}@${sipConfig.server_host}`;
    const target = UserAgent.makeURI(targetString);
    
    if (!target) {
      throw new Error('无效的电话号码');
    }

    const inviter = new Inviter(testState.userAgent, target);
    testState.session = inviter;

    console.log(`   Call ID: ${testState.callId}`);
    console.log(`   目标: ${targetString}`);

    // 设置会话监听
    inviter.stateChange.addListener((state) => {
      console.log(`📞 通话状态: ${state}`);
      
      if (state === 'Established') {
        testState.connected = true;
        console.log('✅ 通话已接通！');
      } else if (state === 'Terminated') {
        console.log('📞 通话已结束');
      }
    });

    // 发起呼叫
    await inviter.invite();
    console.log('✅ 呼叫已发起\n');

    // 步骤5: 等待通话（30秒）
    console.log('步骤5: 等待通话进行中...');
    console.log('   （30秒后自动挂断）\n');
    
    await sleep(30000);

    // 步骤6: 挂断电话
    console.log('步骤6: 挂断电话');
    if (testState.session) {
      await testState.session.bye();
      console.log('✅ 已挂断电话\n');
    }

    // 步骤7: 停止UserAgent
    console.log('步骤7: 停止UserAgent');
    if (testState.userAgent) {
      await testState.userAgent.stop();
      console.log('✅ UserAgent已停止\n');
    }

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
    
    // 保存失败记录
    if (testState.callId) {
      await saveCallRecord(testState.callId, CALL_CONFIG.phoneNumber, 'failed');
    }
    
    // 清理
    try {
      if (testState.userAgent) {
        await testState.userAgent.stop();
      }
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
    console.log(`Call ID: ${testState.callId}`);
  }
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
  await makeRealCall();
  process.exit(0);
}

// 运行测试
main();

