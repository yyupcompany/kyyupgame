/**
 * 测试统一认证AI桥接服务
 * 直接测试统一认证系统的AI功能，绕过租户后端
 */

const axios = require('axios');

// 配置
const CONFIG = {
  UNIFIED_BACKEND: 'http://localhost:4001',  // 统一认证系统
  TEST_ACCOUNT: {
    phone: '18611141133',
    password: '123456'
  }
};

async function testUnifiedAI() {
  console.log('🔍 开始测试统一认证AI桥接服务...');

  try {
    // 1. 获取JWT token
    console.log('\n📝 步骤1: 获取JWT token...');
    const authResponse = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/auth/login`, {
      phone: CONFIG.TEST_ACCOUNT.phone,
      password: CONFIG.TEST_ACCOUNT.password,
      tenantCode: 'k004'
    });

    if (!authResponse.data.success) {
      throw new Error('登录失败: ' + authResponse.data.message);
    }

    const token = authResponse.data.data.token;
    console.log('✅ 获取JWT token成功');
    console.log('👤 用户:', authResponse.data.data.user.realName);
    console.log('🏢 租户代码:', authResponse.data.data.user.defaultTenant?.tenantCode);

    // 2. 验证JWT token内容
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    console.log('📋 JWT payload:', JSON.stringify(payload, null, 2));

    if (!payload.tenantCode) {
      throw new Error('JWT token中缺少tenantCode字段');
    }
    console.log('✅ JWT token验证通过，包含tenantCode:', payload.tenantCode);

    // 3. 测试AI桥接服务的健康检查
    console.log('\n🏥 步骤3: 测试AI桥接服务健康检查...');
    try {
      const healthResponse = await axios.get(`${CONFIG.UNIFIED_BACKEND}/api/v1/ai/bridge/health`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ AI桥接服务健康检查:', healthResponse.data);
    } catch (error) {
      console.log('⚠️ AI桥接服务健康检查失败:', error.response?.data || error.message);
    }

    // 4. 测试获取模型列表
    console.log('\n🤖 步骤4: 测试获取AI模型列表...');
    try {
      const modelsResponse = await axios.get(`${CONFIG.UNIFIED_BACKEND}/api/v1/ai/bridge/models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取模型列表成功:', modelsResponse.data);
    } catch (error) {
      console.log('⚠️ 获取模型列表失败:', error.response?.data || error.message);
    }

    // 5. 测试AI对话功能 - 使用正确的路径不带bridge前缀
    console.log('\n💬 步骤5: 测试AI对话功能...');
    const testQuestions = [
      '你好，请介绍一下你自己',
      '今天是什么日子？',
      '幼儿园管理系统有哪些功能？'
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n❓ 问题 ${i + 1}: ${question}`);

      try {
        const aiResponse = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/v1/ai/bridge/chat`, {
          model: 'default',
          messages: [
            { role: 'system', content: '你是一个专业的幼儿园管理助手。' },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        });

        console.log('✅ AI对话成功');
        console.log('📝 AI回复:', aiResponse.data);

        if (aiResponse.data.success && aiResponse.data.data) {
          console.log('💬 回复内容:', aiResponse.data.data.content || aiResponse.data.data.message);
          if (aiResponse.data.data.usage) {
            console.log('📊 使用统计:', aiResponse.data.data.usage);
          }
        }

      } catch (error) {
        console.error('❌ AI对话请求失败:', error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          console.error('🔒 认证失败 - 检查JWT token是否有效');
        } else if (error.response?.status === 404) {
          console.error('🔍 端点不存在 - 检查AI桥接服务路径');
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ 请求超时 - AI处理可能需要更长时间');
        }
      }
    }

    console.log('\n🎉 统一认证AI桥接服务测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testUnifiedAI();