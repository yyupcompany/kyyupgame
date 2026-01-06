#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// API 映射表
const apiMapping = {
  "'/ai-billing/bills'": "'/ai-billing/statistics'",
  "'/business/overview'": "'/business-center/overview'",
  "'/call-center/records'": "'/call-center/calls/history'",
  "'/tasks/my'": "'/tasks'",
  "'/photo-albums'": "'/photo-album'",
  "'/principal/dashboard'": "'/principal/dashboard-stats'",
  "'/system/status'": "'/system/health'",
  "'/system-logs'": "'/system/logs'"
};

let fixCount = 0;
const mobileDir = 'client/src/pages/mobile';

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  for (const [old, newPath] of Object.entries(apiMapping)) {
    if (newContent.includes(old)) {
      newContent = newContent.replaceAll(old, newPath);
      console.log(`✅ ${filePath.replace(process.cwd() + '/', '')} - ${old} -> ${newPath}`);
      fixCount++;
    }
  }
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

// 递归遍历所有.vue文件
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.vue')) {
      fixFile(filePath);
    }
  }
}

console.log('🔧 开始修复API调用...\n');
walkDir(mobileDir);
console.log(`\n✅ 共修复 ${fixCount} 处API调用`);

