/**
 * 最新AI功能测试脚本
 * 使用修复后的JWT token测试AI对话功能
 */

const axios = require('axios');

// 配置
const CONFIG = {
  TENANT_BACKEND: 'http://localhost:3000',  // 幼儿园租户后端
  UNIFIED_BACKEND: 'http://localhost:4001',  // 统一认证系统
  TEST_ACCOUNT: {
    phone: '18611141133',
    password: '123456'
  }
};

async function testAIWithNewToken() {
  console.log('🔍 开始AI功能测试（使用最新修复的JWT token）...');

  try {
    // 1. 获取最新的JWT token
    console.log('\n📝 步骤1: 获取最新的JWT token...');
    const authResponse = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/auth/login`, {
      phone: CONFIG.TEST_ACCOUNT.phone,
      password: CONFIG.TEST_ACCOUNT.password,
      tenantCode: 'k004'  // 明确指定租户代码
    });

    if (!authResponse.data.success) {
      throw new Error('登录失败: ' + authResponse.data.message);
    }

    const token = authResponse.data.data.token;
    console.log('✅ 获取最新JWT token成功');
    console.log('👤 用户:', authResponse.data.data.user.realName);
    console.log('🏢 租户代码:', authResponse.data.data.user.defaultTenant?.tenantCode);

    // 2. 解码并验证JWT token内容
    console.log('\n🔍 步骤2: 验证JWT token内容...');
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    console.log('📋 JWT payload:', JSON.stringify(payload, null, 2));

    if (!payload.tenantCode) {
      throw new Error('JWT token中缺少tenantCode字段');
    }
    console.log('✅ JWT token验证通过，包含tenantCode:', payload.tenantCode);

    // 3. 测试AI对话功能
    console.log('\n🤖 步骤3: 测试AI对话功能...');

    const testQuestions = [
      '你好，请介绍一下你自己',
      '今天是什么日子？',
      '幼儿园管理系统有哪些功能？'
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n❓ 问题 ${i + 1}: ${question}`);

      try {
        // 发送AI请求
        const aiResponse = await axios.post(`${CONFIG.TENANT_BACKEND}/api/ai/unified/stream-chat`, {
          message: question
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        });

        console.log('📡 AI响应流开始...');
        let fullResponse = '';

        aiResponse.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('📡 流结束');
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  process.stdout.write(parsed.content);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        aiResponse.data.on('end', () => {
          console.log('\n✅ AI对话完成');
        });

        // 等待流结束
        await new Promise((resolve) => {
          aiResponse.data.on('end', resolve);
          aiResponse.data.on('error', resolve);
        });

        console.log(`📝 完整回答: ${fullResponse}`);

      } catch (error) {
        console.error('❌ AI请求失败:', error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          console.error('🔒 认证失败 - 检查JWT token是否包含tenantCode');
        }
      }
    }

    console.log('\n🎉 AI功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testAIWithNewToken();