#!/usr/bin/env node

/**
 * 简单的代理服务器
 * 将3000端口的请求转发到3001端口的Mock服务器
 */

const http = require('http');
const url = require('url');

const PORT = 3000;
const MOCK_SERVER_PORT = 3001;

// 创建代理服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 构建目标URL
  const targetUrl = `http://localhost:${MOCK_SERVER_PORT}${req.url}`;

  // 创建代理请求
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    // 复制响应头
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    // 管道响应数据
    proxyRes.pipe(res);
  });

  // 处理代理请求错误
  proxyReq.on('error', (err) => {
    console.error('代理错误:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Mock服务器连接失败',
      message: '请确保Mock服务器在端口3001运行'
    }));
  });

  // 管道请求数据
  req.pipe(proxyReq);
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🔄 代理服务器已启动`);
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🎯 转发目标: http://localhost:${MOCK_SERVER_PORT}`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📖 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`💡 按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭代理服务器...');
  server.close(() => {
    console.log('✅ 代理服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭代理服务器...');
  server.close(() => {
    console.log('✅ 代理服务器已关闭');
    process.exit(0);
  });
});
