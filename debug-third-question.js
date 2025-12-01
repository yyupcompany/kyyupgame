/**
 * 调试第三个问题的调用链路
 */

const axios = require('axios');

async function debugThirdQuestion() {
  console.log('🔍 调试第三个问题："幼儿园管理系统有哪些功能？"');

  try {
    // 1. 登录获取token
    console.log('\n📝 步骤1: 登录...');
    const authResponse = await axios.post('http://localhost:4001/api/auth/login', {
      phone: '18611141133',
      password: '123456'
    });

    const token = authResponse.data.data.token;
    console.log('✅ 登录成功');

    // 2. 详细跟踪第三个问题的调用
    console.log('\n🤖 步骤2: 调用AI - 第三个问题...');

    const question = '幼儿园管理系统有哪些功能？';
    console.log('❓ 问题:', question);

    const startTime = Date.now();
    let eventCount = 0;
    let contentUpdates = 0;
    let finalAnswerReceived = false;
    let finalAnswer = '';

    const response = await axios.post(
      'http://localhost:4001/api/ai/unified/stream-chat',
      {
        message: question,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        timeout: 60000 // 增加超时时间到60秒
      }
    );

    console.log('📡 开始接收流数据...');

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          const event = line.substring(7).trim();
          eventCount++;
          console.log(`  📋 Event ${eventCount}: ${event}`);
        } else if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          if (data === '[DONE]') {
            console.log('  🏁 流结束标记 [DONE]');
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // 记录不同类型的消息
            if (parsed.type === 'content_update') {
              contentUpdates++;
              console.log(`  📝 Content Update ${contentUpdates}: "${parsed.content}"`);
            } else if (parsed.type === 'final_answer') {
              finalAnswerReceived = true;
              finalAnswer = parsed.content;
              console.log(`  🎯 Final Answer Received: "${finalAnswer.substring(0, 50)}..."`);
            } else if (parsed.type === 'thinking_start') {
              console.log(`  🤔 Thinking Start: ${parsed.message}`);
            } else if (parsed.type === 'thinking_complete') {
              console.log(`  ✅ Thinking Complete: ${parsed.message}`);
            } else if (parsed.type === 'start') {
              console.log(`  🔗 Stream Start: ${parsed.message}`);
            } else if (parsed.type === 'complete') {
              console.log(`  ✅ Stream Complete: ${parsed.message}`);
            } else {
              console.log(`  ❓ Other Event (${parsed.type || 'unknown'}):`, Object.keys(parsed));
            }
          } catch (e) {
            console.log(`  ⚠️ Parse Error: ${e.message}`);
          }
        }
      }
    });

    // 监听流结束
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('  ⏰ 60秒超时，强制结束');
        response.data.destroy();
        resolve();
      }, 60000);

      response.data.on('end', () => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        console.log(`\n📊 流统计:`);
        console.log(`  ⏱️  总耗时: ${duration}ms`);
        console.log(`  📋 事件数量: ${eventCount}`);
        console.log(`  📝 内容更新: ${contentUpdates}`);
        console.log(`  🎯 最终答案: ${finalAnswerReceived ? '是' : '否'}`);

        if (finalAnswer) {
          console.log(`  💬 最终答案长度: ${finalAnswer.length} 字符`);
          console.log(`  💬 最终答案内容: ${finalAnswer}`);
        }

        resolve();
      });

      response.data.on('error', (error) => {
        clearTimeout(timeout);
        console.log(`\n❌ 流错误:`);
        console.log(`  📥 错误类型: ${error.name}`);
        console.log(`  📥 错误消息: ${error.message}`);
        console.log(`  📥 错误代码: ${error.code}`);
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ 总体错误:', error.message);
    if (error.response) {
      console.error('📥 HTTP错误:', error.response.status, error.response.statusText);
      console.error('📥 响应数据:', error.response.data);
    } else if (error.request) {
      console.error('📥 请求错误: 请求已发送但无响应');
    }
  }
}

debugThirdQuestion();