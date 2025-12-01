/**
 * 直接测试AI桥接功能，不经过租户认证
 */

const axios = require('axios');

async function testAIBridgeDirect() {
  console.log('🚀 开始直接测试AI桥接功能...');

  try {
    // 测试健康检查端点
    console.log('\n1. 测试健康检查端点...');
    const healthResponse = await axios.get('http://localhost:4001/api/v1/ai/bridge/health', {
      timeout: 5000
    });
    console.log('✅ 健康检查成功:', healthResponse.data);

    // 测试模型列表端点
    console.log('\n2. 测试模型列表端点...');
    const modelsResponse = await axios.get('http://localhost:4001/api/v1/ai/bridge/models', {
      timeout: 5000
    });
    console.log('✅ 模型列表获取成功:', modelsResponse.data);

    // 测试聊天端点
    console.log('\n3. 测试聊天端点...');
    const chatResponse = await axios.post('http://localhost:4001/api/v1/ai/bridge/chat', {
      model: 'doubao-pro-4k',
      messages: [
        {
          role: 'user',
          content: '你好，请简单介绍一下自己'
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    console.log('✅ 聊天测试成功:', chatResponse.data);

    console.log('\n🎉 所有测试通过！');
    return true;

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
testAIBridgeDirect().then(success => {
  if (success) {
    console.log('\n✨ AI桥接功能测试成功，租户认证中间件是问题的根源');
  } else {
    console.log('\n⚠️ AI桥接功能仍有问题');
  }
}).catch(console.error);