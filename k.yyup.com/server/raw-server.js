const http = require('http');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 健康检查
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'raw-node-http'
    }));
    return;
  }

  // AI流式聊天
  if (req.url === '/api/ai/unified/stream-chat' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('收到请求:', body);

      // 设置SSE头
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // 发送SSE事件
      res.write(`event: thinking_start\n`);
      res.write(`data: {"message":"🤔 AI开始思考...","timestamp":"${new Date().toISOString()}"}\n\n`);

      setTimeout(() => {
        res.write(`event: final_answer\n`);
        res.write(`data: {"message":"💬 AI回答完成","content":"这是真实数据测试","toolUsed":0,"modelName":"test-model"}\n\n`);
        res.write(`event: complete\n`);
        res.write(`data: {"message":"🎉 对话完成","timestamp":"${new Date().toISOString()}"}\n\n`);
        res.end();
      }, 2000);
    });
    return;
  }

  // 默认响应
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 原始HTTP服务器启动成功!`);
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 AI端点: http://localhost:${PORT}/api/ai/unified/stream-chat`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}\n`);
});
