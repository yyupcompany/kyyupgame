#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 启动幼儿园管理系统桌面版...');

// 检查是否已安装依赖
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ 未检测到依赖包，正在安装...');

  const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 依赖安装完成！');
      startApp();
    } else {
      console.log('❌ 依赖安装失败，请检查网络连接');
      process.exit(1);
    }
  });
} else {
  startApp();
}

function startApp() {
  console.log('🎯 启动开发服务器...');

  // 启动开发模式
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  devProcess.on('close', (code) => {
    console.log(`开发服务器已退出，代码: ${code}`);
  });

  // 处理Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 正在关闭应用...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });
}