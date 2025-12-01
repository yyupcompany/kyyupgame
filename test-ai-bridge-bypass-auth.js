/**
 * 临时测试脚本 - 绕过租户认证直接测试AI桥接功能
 */

const axios = require('axios');

async function testAIBridgeWithoutAuth() {
  console.log('🧪 开始测试AI桥接功能（绕过认证）...');

  try {
    // 测试健康检查端点（通常不需要认证）
    console.log('\n1. 测试健康检查端点...');
    try {
      const healthResponse = await axios.get('http://localhost:4001/api/v1/ai/bridge/health', {
        timeout: 5000
      });
      console.log('✅ 健康检查成功:', healthResponse.data);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.message);
      if (error.code === 'ECONNABORTED') {
        console.log('⚠️  请求超时，可能是中间件问题');
      }
    }

    // 测试不需要认证的模型列表端点
    console.log('\n2. 测试模型列表端点...');
    try {
      const modelsResponse = await axios.get('http://localhost:4001/api/v1/ai/bridge/models', {
        timeout: 5000
      });
      console.log('✅ 模型列表获取成功:', modelsResponse.data);
    } catch (error) {
      console.log('❌ 模型列表获取失败:', error.message);
      if (error.code === 'ECONNABORTED') {
        console.log('⚠️  请求超时，可能是中间件问题');
      }
    }

    // 创建一个简单的测试令牌来测试聊天端点
    console.log('\n3. 测试聊天端点（使用模拟令牌）...');
    try {
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
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
          'X-Tenant-Code': 'k004'
        },
        timeout: 10000
      });
      console.log('✅ 聊天测试成功:', chatResponse.data);
    } catch (error) {
      console.log('❌ 聊天测试失败:', error.message);
      if (error.response) {
        console.log('响应状态:', error.response.status);
        console.log('响应数据:', error.response.data);
      }
      if (error.code === 'ECONNABORTED') {
        console.log('⚠️  请求超时，可能是中间件问题');
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 直接测试AI桥接服务层
async function testAIBridgeServiceDirectly() {
  console.log('\n🔧 直接测试AI桥接服务层...');

  try {
    // 动态导入AI桥接服务
    const { TenantAIBridgeService } = require('./unified-tenant-system/server/src/services/tenant/tenant-ai-bridge.service.ts');

    // 创建测试请求
    const testRequest = {
      model: 'doubao-pro-4k',
      messages: [
        {
          role: 'user',
          content: '你好，这是一个测试'
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
      userId: 'test-user-123',
      modelConfig: {
        provider: 'doubao',
        endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        apiKey: 'test-api-key',
        modelVersion: 'doubao-pro-4k'
      }
    };

    console.log('发送测试请求到AI桥接服务...');
    const result = await TenantAIBridgeService.handleAIRequest(testRequest);

    console.log('✅ AI桥接服务直接测试成功:', result);

  } catch (error) {
    console.log('❌ AI桥接服务直接测试失败:', error.message);
    console.log('错误详情:', error.stack);
  }
}

// 运行测试
async function runTests() {
  await testAIBridgeWithoutAuth();
  await testAIBridgeServiceDirectly();

  console.log('\n🎯 测试完成');
  console.log('如果所有测试都超时，那么问题确实在租户认证中间件');
  console.log('建议：临时禁用verifyTenantToken中间件进行测试');
}

runTests().catch(console.error);