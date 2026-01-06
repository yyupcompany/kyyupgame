#!/usr/bin/env node

/**
 * 页面说明文档种子数据初始化脚本
 */

const path = require('path');
const { execSync } = require('child_process');

// 设置环境变量
process.env.NODE_ENV = 'development';

async function runSeedPageGuides() {
  try {
    console.log('🌱 开始初始化页面说明文档种子数据...');
    
    // 动态导入ES模块
    const { PageGuideSeedService } = await import('../dist/services/page-guide-seed.service.js');
    const { initDatabase } = await import('../dist/config/database.js');
    
    // 初始化数据库连接
    console.log('🔗 初始化数据库连接...');
    await initDatabase();
    
    // 运行种子数据
    console.log('📊 运行页面说明文档种子数据...');
    await PageGuideSeedService.seedPageGuides();
    
    console.log('✅ 页面说明文档种子数据初始化完成！');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 页面说明文档种子数据初始化失败:', error);
    process.exit(1);
  }
}

// 检查是否需要先编译TypeScript
function ensureCompiled() {
  try {
    const fs = require('fs');
    const serviceFile = path.join(__dirname, '../dist/services/page-guide-seed.service.js');
    
    if (!fs.existsSync(serviceFile)) {
      console.log('🔧 编译TypeScript文件...');
      execSync('npm run build', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit' 
      });
    }
  } catch (error) {
    console.error('❌ 编译失败:', error.message);
    process.exit(1);
  }
}

// 主执行流程
async function main() {
  console.log('🚀 启动页面说明文档种子数据初始化...');
  
  // 确保文件已编译
  ensureCompiled();
  
  // 运行种子数据
  await runSeedPageGuides();
}

// 执行脚本
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
