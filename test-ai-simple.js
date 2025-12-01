/**
 * 简化的AI测试脚本
 * 直接使用统一认证系统进行测试
 */

const axios = require('axios');

// 配置
const CONFIG = {
  UNIFIED_BACKEND: 'http://localhost:4001',
  TEST_ACCOUNT: {
    phone: '18611141133',
    password: '123456'
  }
};

async function testAIWithUnifiedAuth() {
  console.log('🔍 开始AI测试（直接使用统一认证）...');

  try {
    // 1. 登录统一认证系统
    console.log('\n📝 步骤1: 登录统一认证系统...');
    const authResponse = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/auth/login`, {
      phone: CONFIG.TEST_ACCOUNT.phone,
      password: CONFIG.TEST_ACCOUNT.password
    });

    if (!authResponse.data.success) {
      throw new Error('登录失败: ' + authResponse.data.message);
    }

    const token = authResponse.data.data.token;
    console.log('✅ 登录成功');
    console.log('👤 用户:', authResponse.data.data.user.realName);
    console.log('🎯 Token:', token.substring(0, 30) + '...');

    // 2. 测试AI对话
    console.log('\n🤖 步骤2: 测试AI对话...');

    const testQuestions = [
      '你好，请介绍一下你自己',
      '今天是什么日子？',
      '幼儿园管理系统有哪些功能？'
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n❓ 问题 ${i + 1}: ${question}`);

      try {
        const response = await axios.post(
          `${CONFIG.UNIFIED_BACKEND}/api/ai/unified/stream-chat`,
          {
            message: question,
            stream: true  // 使用流式模式
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream'
            },
            responseType: 'stream',
            timeout: 30000
          }
        );

        // 处理SSE流式响应
        let fullResponse = '';
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              if (data === '[DONE]') {
                // 流结束
                return;
              }
              try {
                const parsed = JSON.parse(data);

                // 处理不同类型的消息
                if (parsed.type === 'content_update' && parsed.content) {
                  fullResponse += parsed.content;
                } else if (parsed.type === 'final_answer' && parsed.content) {
                  // 最终答案 - 替换之前的累积内容
                  fullResponse = parsed.content;
                } else if (!parsed.type && parsed.content) {
                  // 有些消息没有type，直接有content
                  fullResponse = parsed.content;
                }

                // 也可以打印调试信息
                if (parsed.message && parsed.message.includes('最终回答已生成')) {
                  console.log('  🎯 收到最终回答标记');
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        // 等待流结束
        await new Promise((resolve, reject) => {
          response.data.on('end', () => {
            console.log('  📡 流结束');
            resolve();
          });
          response.data.on('error', (error) => {
            console.log('  ❌ 流错误:', error.message);
            reject(error);
          });
        });

        if (fullResponse) {
          console.log('✅ AI回复:', fullResponse.substring(0, 100) + '...');
        } else {
          console.log('❌ 没有收到AI回复');
        }
      } catch (error) {
        console.log('❌ 请求失败:', error.message);
        if (error.response) {
          console.log('📥 状态码:', error.response.status);
          console.log('📥 响应:', error.response.data);
        }
      }
    }

    console.log('\n🎉 AI测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📥 响应数据:', error.response.data);
    }
  }
}

// 运行测试
testAIWithUnifiedAuth();