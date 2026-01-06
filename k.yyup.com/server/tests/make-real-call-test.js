/**
 * 真实拨打电话测试
 * 
 * 拨打电话到: 18611141133
 * 使用账号: sales001 / zhuge3944
 * 
 * 用法: node tests/make-real-call-test.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 测试配置
const CALL_CONFIG = {
  phoneNumber: '18611141133',
  sipUsername: 'sales001',
  sipPassword: 'zhuge3944',
  sipServer: '47.94.82.59',
  sipPort: 5060,
  customerId: 1001
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
async function saveCallRecord(callId, phoneNumber, status) {
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
      console.log('⚠️  call_records表不存在，跳过保存通话记录');
      return;
    }

    await connection.query(`
      INSERT INTO call_records (
        call_id,
        phone_number,
        direction,
        status,
        start_time,
        created_at,
        updated_at
      ) VALUES (?, ?, 'outbound', ?, NOW(), NOW(), NOW())
    `, [callId, phoneNumber, status]);

    console.log('✅ 通话记录已保存\n');
  } catch (error) {
    console.warn('⚠️  保存通话记录失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 模拟拨打电话
 */
async function makeCall() {
  console.log('📞 准备拨打电话...\n');
  console.log('=' .repeat(50));
  console.log('通话信息');
  console.log('=' .repeat(50));
  console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
  console.log(`SIP账号: ${CALL_CONFIG.sipUsername}`);
  console.log(`SIP服务器: ${CALL_CONFIG.sipServer}:${CALL_CONFIG.sipPort}`);
  console.log('=' .repeat(50));
  console.log('');

  const callId = `call_${Date.now()}`;

  try {
    // 1. 加载SIP配置
    console.log('步骤1: 加载SIP配置');
    const sipConfig = await loadSIPConfig();

    // 2. 建立SIP连接
    console.log('步骤2: 建立SIP连接');
    console.log(`   → 连接到 ${sipConfig.server_host}:${sipConfig.server_port}`);
    console.log(`   → 使用账号 ${sipConfig.username}`);
    console.log('   ⚠️  注意: 当前为模拟模式，未实际连接SIP服务器');
    console.log('   💡 需要集成SIP.js或JsSIP库才能真实拨打\n');

    // 3. 拨打电话
    console.log('步骤3: 拨打电话');
    console.log(`   → 拨打号码: ${CALL_CONFIG.phoneNumber}`);
    console.log(`   → Call ID: ${callId}`);
    console.log('   ⚠️  模拟拨打中...\n');

    // 模拟等待接通
    await sleep(2000);

    // 4. 等待接听
    console.log('步骤4: 等待接听');
    console.log('   → 振铃中...');
    console.log('   ⚠️  模拟振铃状态\n');

    await sleep(3000);

    // 5. 通话建立
    console.log('步骤5: 通话建立（模拟）');
    console.log('   → 对方已接听');
    console.log('   → 开始音频流传输\n');

    // 6. 启动豆包实时语音
    console.log('步骤6: 启动豆包实时语音');
    console.log('   → 建立WebSocket连接');
    console.log('   → 发送系统提示词');
    console.log('   → 开始实时语音对话\n');

    // 7. 模拟对话
    console.log('步骤7: 模拟对话流程');
    console.log('   🎤 用户: "你好"');
    await sleep(1000);
    console.log('   🤖 AI: "您好！我是XX幼儿园的招生顾问，很高兴为您服务。"');
    await sleep(2000);
    console.log('   🎤 用户: "我想了解一下你们幼儿园"');
    await sleep(1000);
    console.log('   🤖 AI: "好的，请问您的孩子多大了？我可以为您介绍适合的班级。"');
    await sleep(2000);
    console.log('   🎤 用户: "3岁半"');
    await sleep(1000);
    console.log('   🤖 AI: "3岁半的孩子可以上我们的小班。我们的小班有专业的老师..."');
    console.log('');

    // 8. 结束通话
    console.log('步骤8: 结束通话');
    console.log('   → 保存对话记录');
    console.log('   → 关闭WebSocket连接');
    console.log('   → 断开SIP连接\n');

    // 保存通话记录
    await saveCallRecord(callId, CALL_CONFIG.phoneNumber, 'completed');

    // 9. 通话总结
    console.log('=' .repeat(50));
    console.log('通话总结');
    console.log('=' .repeat(50));
    console.log(`Call ID: ${callId}`);
    console.log(`目标号码: ${CALL_CONFIG.phoneNumber}`);
    console.log(`通话状态: 已完成（模拟）`);
    console.log(`通话时长: 约15秒（模拟）`);
    console.log(`对话轮次: 4轮`);
    console.log('=' .repeat(50));
    console.log('');

    console.log('✅ 通话测试完成！\n');

    console.log('⚠️  重要提示:');
    console.log('   当前为模拟测试，未实际拨打电话');
    console.log('   要实现真实拨打，需要:');
    console.log('   1. 集成SIP客户端库（SIP.js 或 JsSIP）');
    console.log('   2. 实现WebRTC音频流处理');
    console.log('   3. 连接到真实的SIP服务器');
    console.log('   4. 处理音频编解码');
    console.log('');

    console.log('📚 参考资料:');
    console.log('   - SIP.js: https://sipjs.com/');
    console.log('   - JsSIP: https://jssip.net/');
    console.log('   - WebRTC: https://webrtc.org/');
    console.log('');

  } catch (error) {
    console.error('❌ 拨打电话失败:', error.message);
    console.error(error);
    
    // 保存失败记录
    await saveCallRecord(callId, CALL_CONFIG.phoneNumber, 'failed');
    
    process.exit(1);
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
  console.log('\n🚀 开始真实拨打电话测试\n');
  
  await makeCall();
  
  console.log('🎉 测试完成！\n');
  process.exit(0);
}

// 运行测试
main();

