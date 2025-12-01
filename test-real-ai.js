/**
 * 测试真实AI功能
 * 使用修改后的统一认证AI桥接服务测试豆包AI
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

async function testRealAI() {
  console.log('🔍 开始测试真实AI功能...');

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

    // 2. 验证JWT token内容
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    console.log('📋 JWT payload:', JSON.stringify(payload, null, 2));

    // 3. 测试AI对话功能 - 直接调用统一认证的AI桥接服务
    console.log('\n🤖 步骤2: 测试统一认证AI桥接服务...');
    const testQuestions = [
      '你好，请用中文介绍一下你自己',
      '今天是什么日期？',
      '幼儿园管理系统有哪些主要功能模块？'
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n❓ 问题 ${i + 1}: ${question}`);

      try {
        const aiResponse = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/v1/ai/bridge/chat`, {
          model: 'doubao-pro-4k',
          messages: [
            { role: 'system', content: '你是一个专业的幼儿园管理助手，请用中文回答问题。' },
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

        console.log('✅ AI桥接服务调用成功');
        console.log('📊 响应数据:', JSON.stringify(aiResponse.data, null, 2));

        if (aiResponse.data.success && aiResponse.data.data) {
          console.log('💬 AI回复内容:');
          console.log(aiResponse.data.data.content || aiResponse.data.data.message || '无内容');

          if (aiResponse.data.usage) {
            console.log('📊 使用统计:');
            console.log(`   - 输入Token: ${aiResponse.data.usage.inputTokens}`);
            console.log(`   - 输出Token: ${aiResponse.data.usage.outputTokens}`);
            console.log(`   - 总Token: ${aiResponse.data.usage.totalTokens}`);
            console.log(`   - 费用: ¥${aiResponse.data.usage.cost}`);
            console.log(`   - 响应时间: ${aiResponse.data.usage.responseTime}ms`);
          }
        }

      } catch (error) {
        console.error('❌ AI桥接请求失败:');
        if (error.response) {
          console.error(`   状态码: ${error.response.status}`);
          console.error(`   错误信息:`, error.response.data);
          if (error.response.status === 401) {
            console.error('🔒 认证失败 - 检查JWT token是否有效');
          } else if (error.response.status === 429) {
            console.error('⏱️ 请求频率过高');
          } else if (error.response.status === 500) {
            console.error('💥 服务器内部错误 - 可能是AI服务配置问题');
          }
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ 请求超时 - AI处理可能需要更长时间');
        } else {
          console.error('❓ 未知错误:', error.message);
        }
      }
    }

    // 4. 测试获取模型列表
    console.log('\n🤖 步骤3: 测试获取可用模型列表...');
    try {
      const modelsResponse = await axios.get(`${CONFIG.UNIFIED_BACKEND}/api/v1/ai/bridge/models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取模型列表成功');
      console.log('📝 模型列表:', JSON.stringify(modelsResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ 获取模型列表失败:', error.response?.data || error.message);
    }

    console.log('\n🎉 真实AI功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testRealAI();