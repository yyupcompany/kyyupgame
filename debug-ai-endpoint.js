/**
 * AI端点调试脚本
 */

const axios = require('axios');

async function debugAIEndpoint() {
  console.log('🔍 调试AI端点...');

  try {
    // 1. 先登录获取token
    console.log('\n📝 步骤1: 登录...');
    const authResponse = await axios.post('http://localhost:4001/api/auth/login', {
      phone: '18611141133',
      password: '123456'
    });

    const token = authResponse.data.data.token;
    console.log('✅ 登录成功');

    // 2. 测试AI端点 - 简单调用
    console.log('\n🤖 步骤2: 调用AI端点...');

    const response = await axios.post(
      'http://localhost:4001/api/ai/unified/stream-chat',
      {
        message: '你好，请简单介绍一下你自己'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'text', // 获取原始文本
        timeout: 30000
      }
    );

    console.log('📥 响应状态:', response.status);
    console.log('📥 响应头:', response.headers);
    console.log('📥 响应数据类型:', typeof response.data);
    console.log('📥 响应数据长度:', response.data.length);
    console.log('📥 响应数据前500字符:');
    console.log(response.data.substring(0, 500));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.response) {
      console.error('📥 状态码:', error.response.status);
      console.error('📥 响应数据:', error.response.data);
    }
  }
}

debugAIEndpoint();