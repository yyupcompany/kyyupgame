/**
 * 简单SSE流测试 - 测试AI流式接口是否正确返回事件数据
 */

const http = require('http');

const testData = {
  message: '你好，请简单回答',
  context: {
    enableTools: true,
    role: "admin",
    userId: 121
  }
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/unified/stream-chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData)),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM1NjA1NTAsImV4cCI6MTc2MzY0Njk1MH0.70XBVCs8-jf8GwMAkJcOban7IXqniXj0loxYKH_mV_k'
  }
};

console.log('🧪 开始测试SSE流...');
console.log('📤 发送请求:', JSON.stringify(testData, null, 2));

const req = http.request(options, (res) => {
  console.log(`📊 响应状态码: ${res.statusCode}`);
  console.log(`📋 响应头:`, res.headers);

  if (res.statusCode !== 200) {
    console.error('❌ 请求失败，状态码:', res.statusCode);
    return;
  }

  let rawData = '';
  let eventCount = 0;
  let events = [];

  res.on('data', (chunk) => {
    rawData += chunk;
    console.log(`📦 收到数据块 (${chunk.length} 字节):`);
    console.log(chunk.toString());

    // 解析SSE数据
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        eventCount++;

        if (data === '[DONE]') {
          events.push({ type: 'done', data: null });
          console.log('✅ 收到完成信号: [DONE]');
        } else {
          try {
            const parsed = JSON.parse(data);
            events.push({
              type: parsed.event || 'data',
              data: parsed,
              timestamp: new Date().toISOString()
            });
            console.log(`🎭 事件 #${eventCount}: ${parsed.event || 'data'}`);
            console.log('   数据:', JSON.stringify(parsed, null, 4));
          } catch (e) {
            events.push({ type: 'raw', data: data, timestamp: new Date().toISOString() });
            console.log(`📄 原始数据 #${eventCount}:`, data);
          }
        }
      } else if (line.startsWith('event: ')) {
        console.log(`🏷️  事件类型: ${line.substring(7)}`);
      } else if (line.startsWith('id: ')) {
        console.log(`🆔 事件ID: ${line.substring(4)}`);
      } else if (line.trim() === '') {
        console.log('--- 分隔线 ---');
      }
    }
  });

  res.on('end', () => {
    console.log('\n🏁 请求完成');
    console.log(`📊 总数据量: ${rawData.length} 字节`);
    console.log(`🎭 总事件数: ${eventCount}`);
    console.log(`📋 事件列表:`);
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.type} - ${event.timestamp}`);
    });

    if (eventCount === 0) {
      console.error('❌ 没有收到任何SSE事件数据！');
      console.log('📄 原始响应内容:');
      console.log(rawData);
    } else {
      console.log('✅ SSE流测试成功');
    }
  });

  res.on('error', (error) => {
    console.error('❌ 响应错误:', error);
  });
});

req.on('error', (error) => {
  console.error('❌ 请求错误:', error);
});

req.setTimeout(30000, () => {
  console.error('❌ 请求超时');
  req.destroy();
});

console.log('📤 发送请求...');
req.write(JSON.stringify(testData));
req.end();