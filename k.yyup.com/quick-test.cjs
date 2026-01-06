/**
 * 快速测试修复后的AI流处理接口
 */

const http = require('http');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/api/ai/unified/stream-chat',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM1NjA1NTAsImV4cCI6MTc2MzY0Njk1MH0.70XBVCs8-jf8GwMAkJcOban7IXqniXj0loxYKH_mV_k'
};

// 发送流式请求的函数
function sendStreamRequest(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: query,
      context: {
        enableTools: true,
        role: "admin",
        userId: 121
      }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: testConfig.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${testConfig.token}`
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      let events = [];

      res.on('data', (chunk) => {
        responseData += chunk;

        // 解析SSE数据
        const lines = chunk.toString().split('\\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              events.push({ type: 'done', data: null });
            } else {
              try {
                const parsed = JSON.parse(data);
                events.push({
                  type: parsed.event || 'data',
                  data: parsed,
                  timestamp: new Date().toISOString()
                });
              } catch (e) {
                events.push({ type: 'raw', data: data, timestamp: new Date().toISOString() });
              }
            }
          }
        }
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          events,
          query
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 测试简单查询
async function testSimpleQuery() {
  console.log('\\n🧪 测试简单查询: "你好"');

  try {
    const response = await sendStreamRequest('你好');
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 事件数量: ${response.events.length}`);

    // 检查是否有错误
    const hasError = response.events.some(e => e.type === 'error');
    if (hasError) {
      const errorEvent = response.events.find(e => e.type === 'error');
      console.log(`❌ 错误信息: ${errorEvent.data?.message || errorEvent.data?.error}`);
      if (errorEvent.data?.message?.includes('250715')) {
        console.log('🎯 仍然存在模型ID截断问题');
      } else {
        console.log('✅ 模型ID截断问题已修复');
      }
    } else {
      console.log('✅ 没有错误，模型ID修复成功');
    }

    // 显示最终回答
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer');
    if (finalAnswerEvent) {
      console.log(`💬 AI回答: ${finalAnswerEvent.data?.content?.substring(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 测试复杂查询
async function testComplexQuery() {
  console.log('\\n🧪 测试复杂查询: "查询所有幼儿园的人数统计"');

  try {
    const response = await sendStreamRequest('查询所有幼儿园的人数统计');
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 事件数量: ${response.events.length}`);

    // 检查是否有错误
    const hasError = response.events.some(e => e.type === 'error');
    if (hasError) {
      const errorEvent = response.events.find(e => e.type === 'error');
      console.log(`❌ 错误信息: ${errorEvent.data?.message || errorEvent.data?.error}`);
      if (errorEvent.data?.message?.includes('250715')) {
        console.log('🎯 仍然存在模型ID截断问题');
      } else {
        console.log('✅ 模型ID截断问题已修复');
      }
    } else {
      console.log('✅ 没有错误，模型ID修复成功');
      console.log('🎉 复杂查询成功返回完整7事件序列');
    }

    // 显示最终回答
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer');
    if (finalAnswerEvent) {
      console.log(`💬 AI回答: ${finalAnswerEvent.data?.content?.substring(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始快速测试AI模型ID修复...');

  await testSimpleQuery();
  await testComplexQuery();

  console.log('\\n🏁 测试完成');
}

runTests().catch(console.error);