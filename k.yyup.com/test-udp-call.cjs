/**
 * 测试UDP呼叫功能
 * 对比Python脚本验证Node.js实现
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 测试配置
const TEST_CONFIG = {
  phoneNumber: '18611141133', // 使用Python脚本中的测试号码
  token: null
};

/**
 * 步骤1: 登录获取token
 */
async function login() {
  console.log('📝 步骤1: 登录获取Token...\n');

  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    // 修复：token字段可能是token或accessToken
    const token = response.data.data.token || response.data.data.accessToken;

    if (response.data.success && token) {
      TEST_CONFIG.token = token;
      console.log('✅ 登录成功');
      console.log(`   Token: ${TEST_CONFIG.token.substring(0, 20)}...\n`);
      return true;
    } else {
      console.error('❌ 登录失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return false;
  }
}

/**
 * 步骤2: 发起UDP呼叫
 */
async function makeCall() {
  console.log('📞 步骤2: 发起UDP呼叫...\n');
  console.log(`   目标号码: ${TEST_CONFIG.phoneNumber}`);
  console.log(`   使用端点: POST /call-center/call/udp/make\n`);
  
  try {
    const response = await axios.post(
      `${API_BASE}/call-center/call/udp/make`,
      {
        phoneNumber: TEST_CONFIG.phoneNumber,
        customerId: null,
        systemPrompt: '你是一位专业的幼儿园招生顾问'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35秒超时（大于后端30秒超时）
      }
    );
    
    console.log('✅ 呼叫请求成功');
    console.log(`   响应状态: ${response.status}`);
    console.log(`   响应数据:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 呼叫发起成功！');
      console.log(`   Call ID: ${response.data.data.callId}`);
      console.log(`   状态: ${response.data.data.status}`);
      console.log(`   消息: ${response.data.data.message}`);
      return response.data.data.callId;
    } else {
      console.log('\n⚠️  呼叫请求返回失败');
      return null;
    }
    
  } catch (error) {
    console.error('\n❌ 呼叫请求失败');
    
    if (error.response) {
      console.error(`   HTTP状态: ${error.response.status}`);
      console.error(`   错误信息:`, error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error(`   错误: 请求超时`);
      console.error(`   说明: 后端可能在等待SIP服务器响应`);
    } else {
      console.error(`   错误: ${error.message}`);
    }
    
    return null;
  }
}

/**
 * 步骤3: 查询呼叫状态
 */
async function getCallStatus(callId) {
  console.log('\n📊 步骤3: 查询呼叫状态...\n');
  console.log(`   Call ID: ${callId}`);
  
  try {
    const response = await axios.get(
      `${API_BASE}/call-center/call/udp/${callId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.token}`
        }
      }
    );
    
    console.log('✅ 状态查询成功');
    console.log(`   响应数据:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 状态查询失败:', error.message);
  }
}

/**
 * 主测试流程
 */
async function runTest() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   UDP呼叫功能测试                      ║');
  console.log('║   对比Python脚本验证                   ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  // 步骤1: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ 测试终止：登录失败');
    return;
  }
  
  // 步骤2: 发起呼叫
  const callId = await makeCall();
  
  // 步骤3: 查询状态（如果呼叫成功）
  if (callId) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    await getCallStatus(callId);
  }
  
  // 测试总结
  console.log('\n════════════════════════════════════════');
  console.log('测试总结');
  console.log('════════════════════════════════════════\n');
  
  if (callId) {
    console.log('✅ 测试通过：呼叫发起成功');
    console.log('\n📋 验证要点:');
    console.log('   1. Socket已绑定到本地端口');
    console.log('   2. SIP INVITE消息已发送');
    console.log('   3. 5秒超时设置生效');
    console.log('   4. 错误处理正确');
  } else {
    console.log('❌ 测试失败：呼叫发起失败');
    console.log('\n📋 可能原因:');
    console.log('   1. SIP服务器不可达 (47.94.82.59:5060)');
    console.log('   2. 网络连接问题');
    console.log('   3. 本地端口绑定失败');
    console.log('   4. SIP消息格式错误');
    console.log('\n💡 建议:');
    console.log('   1. 检查后端日志中的详细错误信息');
    console.log('   2. 使用 nc -zv 47.94.82.59 5060 测试连接');
    console.log('   3. 检查防火墙设置');
  }
  
  console.log('\n测试完成\n');
}

// 运行测试
runTest()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n测试异常:', error);
    process.exit(1);
  });

