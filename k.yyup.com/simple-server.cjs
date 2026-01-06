#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class SimpleStaticServer {
  constructor(port = 8080) {
    this.port = port;
    this.server = null;
    this.mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.mimeTypes[ext] || 'text/plain';
  }

  start() {
    this.server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      let filePath = parsedUrl.pathname;

      // 默认文件
      if (filePath === '/') {
        filePath = '/index.html';
      }

      // 构建完整路径
      const fullPath = path.join(__dirname, filePath);

      // 添加CORS头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // 处理OPTIONS请求
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // 检查文件是否存在
      fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1><p>File not found: ' + filePath + '</p>');
          return;
        }

        // 读取文件
        fs.readFile(fullPath, (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 Server Error</h1><p>Error reading file: ' + err.message + '</p>');
            return;
          }

          const mimeType = this.getMimeType(fullPath);
          res.writeHead(200, { 'Content-Type': mimeType });
          res.end(data);
        });
      });
    });

    this.server.listen(this.port, () => {
      console.log(`🚀 简单静态服务器运行在 http://localhost:${this.port}`);
      console.log(`📁 服务目录: ${__dirname}`);
    });

    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${this.port} 已被占用`);
      } else {
        console.error('❌ 服务器错误:', err);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('🛑 服务器已停止');
      });
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const port = process.argv[2] || 8080;
  const server = new SimpleStaticServer(port);

  server.start();

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n👋 收到关闭信号...');
    server.stop();
    process.exit(0);
  });
}

module.exports = SimpleStaticServer;