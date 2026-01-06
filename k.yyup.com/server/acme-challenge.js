const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5173;

// 创建 .well-known/acme-challenge 目录
const challengeDir = path.join(__dirname, '.well-known/acme-challenge');
if (!fs.existsSync(challengeDir)) {
  fs.mkdirSync(challengeDir, { recursive: true });
  console.log('✅ ACME challenge 目录已创建');
}

// 提供 ACME 验证文件
app.use('/.well-known/acme-challenge', express.static(challengeDir));

// 健康检查
app.get('/health', (req, res) => {
  res.send('ACME Challenge Server is running');
});

// 根目录重定向到HTTPS
app.get('/', (req, res) => {
  res.redirect(`https://${req.get('host')}`);
});

// 启动服务器
app.listen(port, () => {
  console.log(`🔍 ACME验证服务器运行在端口 ${port}`);
  console.log(`📁 验证文件目录: ${challengeDir}`);
  console.log('💡 请将验证文件放置到该目录中');
});

module.exports = app;