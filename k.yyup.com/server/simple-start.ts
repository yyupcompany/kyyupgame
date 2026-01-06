import express from 'express';
import cors from 'cors';
import http from 'http';

// 创建简化的Express应用
const app = express();
const server = http.createServer(app);

// 基础中间件
app.use(cors());
app.use(express.json());

// 基础路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI流式聊天路由
app.post('/api/ai/unified/stream-chat', async (req, res) => {
  console.log('收到请求:', req.body);

  // 设置SSE头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 发送测试事件
  res.write(`event: thinking_start\n`);
  res.write(`data: {"message":"🤔 AI开始思考..."}\n\n`);

  setTimeout(() => {
    res.write(`event: final_answer\n`);
    res.write(`data: {"message":"💬 AI回答完成","content":"这是真实数据测试","toolUsed":0}\n\n`);
    res.write(`event: complete\n`);
    res.write(`data: {"message":"🎉 对话完成"}\n\n`);
    res.end();
  }, 1000);
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 简化服务器启动成功!`);
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 AI端点: http://localhost:${PORT}/api/ai/unified/stream-chat`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}\n`);
});
