#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 验证Electron项目完整性...\n');

const projectRoot = __dirname;
const requiredFiles = [
  'package.json',
  'src/main/index.js',
  'src/main/database.js',
  'src/main/server.js',
  'src/preload/index.js',
  'src/renderer/main.js',
  'src/renderer/App.vue',
  'src/renderer/pages/Login.vue',
  'src/renderer/pages/Dashboard.vue',
  'vite.config.js',
  'README.md'
];

const requiredDirs = [
  'src',
  'src/main',
  'src/preload',
  'src/renderer',
  'src/renderer/pages',
  'src/renderer/components',
  'src/renderer/stores',
  'src/renderer/router',
  'src/renderer/api',
  'src/renderer/utils',
  'public',
  'data'
];

console.log('📁 检查必需的目录...');
let missingDirs = 0;
requiredDirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} (缺失)`);
    missingDirs++;
  }
});

console.log('\n📄 检查必需的文件...');
let missingFiles = 0;
requiredFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (缺失)`);
    missingFiles++;
  }
});

console.log('\n📦 检查依赖安装...');
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules (依赖已安装)');

  // 检查关键依赖
  const packageJson = require(path.join(projectRoot, 'package.json'));
  const criticalDeps = ['electron', 'vue', 'vite'];
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`✅ ${dep} (已安装)`);
    } else {
      console.log(`❌ ${dep} (缺失)`);
      missingFiles++;
    }
  });
} else {
  console.log('❌ node_modules (依赖未安装)');
  missingFiles++;
}

console.log('\n🎯 检查数据库目录...');
const dataDir = path.join(projectRoot, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ data (已创建)');
} else {
  console.log('✅ data (已存在)');
}

console.log('\n📊 验证结果:');
if (missingFiles === 0 && missingDirs === 0) {
  console.log('🎉 项目完整性验证通过！');
  console.log('\n🚀 启动命令:');
  console.log('  npm run dev     # 开发模式');
  console.log('  node start.js   # 智能启动脚本');
  console.log('  npm run build   # 构建项目');
  console.log('  npm run dist    # 打包分发');
} else {
  console.log(`❌ 发现 ${missingFiles} 个缺失文件和 ${missingDirs} 个缺失目录`);
  console.log('\n🔧 请检查项目结构或重新运行项目初始化');
}

process.exit(missingFiles + missingDirs > 0 ? 1 : 0);