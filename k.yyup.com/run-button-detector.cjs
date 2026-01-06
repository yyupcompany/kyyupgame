#!/usr/bin/env node

/**
 * 按钮检测脚本运行器
 * 提供便捷的命令行接口来运行按钮链接检测
 */

const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 启动按钮和链接检测工具...\n');

try {
  // 检查是否安装了glob依赖
  try {
    require('glob');
  } catch (error) {
    console.log('📦 安装必要的依赖...');
    execSync('npm install glob --save-dev', { stdio: 'inherit', cwd: __dirname });
  }

  // 运行检测脚本
  console.log('🔍 开始检测...\n');
  require('./button-link-detector.js');

} catch (error) {
  console.error('❌ 运行失败:', error.message);
  process.exit(1);
}