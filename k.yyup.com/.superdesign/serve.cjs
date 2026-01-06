#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;
const baseDir = __dirname;

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // 处理路径
  if (filePath === '/index.html') {
    // 创建一个简单的索引页面
    const indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>主题Demo展示</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px;
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 2rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        .demo-card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }
        .demo-card:hover {
            transform: translateY(-5px);
        }
        .demo-link {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        .demo-link:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 主题Demo展示</h1>
        <p>选择一个主题查看设计效果</p>
        
        <div class="demo-grid">
            <div class="demo-card">
                <h3>🌟 玻璃拟态主题</h3>
                <p>现代化的玻璃效果设计，具有透明度和模糊背景</p>
                <a href="/design_iterations/glassmorphism-theme.html" class="demo-link">查看Demo</a>
            </div>
            
            <div class="demo-card">
                <h3>✨ 极简主题</h3>
                <p>简洁清爽的极简设计，专注于内容和用户体验</p>
                <a href="/design_iterations/minimalist-theme-demo.html" class="demo-link">查看Demo</a>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexHtml);
    return;
  }
  
  // 处理静态文件
  const fullPath = path.join(baseDir, filePath);
  
  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  // 获取文件扩展名
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  }[ext] || 'text/plain';
  
  // 读取并发送文件
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal server error');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Demo服务器已启动`);
  console.log(`📍 本地访问: http://localhost:${port}`);
  console.log(`🌐 网络访问: http://10.107.188.215:${port}`);
  console.log('');
  console.log('可用的Demo页面:');
  console.log(`  • 主页: http://localhost:${port}`);
  console.log(`  • 玻璃拟态主题: http://localhost:${port}/design_iterations/glassmorphism-theme.html`);
  console.log(`  • 极简主题: http://localhost:${port}/design_iterations/minimalist-theme-demo.html`);
});