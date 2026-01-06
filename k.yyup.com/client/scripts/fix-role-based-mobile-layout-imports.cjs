#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复RoleBasedMobileLayout导入\n');

const centersDir = 'src/pages/mobile/centers';
let fixedCount = 0;
let alreadyImportedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否使用了RoleBasedMobileLayout但没有导入
  const usesComponent = /<RoleBasedMobileLayout/.test(content);
  const hasImport = /import.*RoleBasedMobileLayout/.test(content);
  
  if (!usesComponent) return;
  
  if (hasImport) {
    alreadyImportedCount++;
    return;
  }
  
  // 找到最后一个import语句
  const lastImportMatch = content.match(/^.*import\s+.*from\s+['"][^'"]+['"];?$/m);
  if (!lastImportMatch) {
    console.log(`⚠️  无法找到import语句: ${filePath}`);
    return;
  }
  
  // 构建新的import语句
  const newImport = `import RoleBasedMobileLayout from '@/pages/mobile/layouts/RoleBasedMobileLayout.vue'`;
  
  // 在最后一个import之后添加
  const insertPoint = lastImportMatch.index + lastImportMatch[0].length;
  const newContent = content.slice(0, insertPoint) + '\n' + newImport + content.slice(insertPoint);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  fixedCount++;
  console.log(`✅ 已修复: ${path.basename(path.dirname(filePath))}`);
}

// 递归处理所有.vue文件
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file === 'index.vue') {
      processFile(fullPath);
    }
  });
}

walkDir(centersDir);

console.log(`\n✅ 修复完成`);
console.log(`   已修复: ${fixedCount} 个文件`);
console.log(`   已有导入: ${alreadyImportedCount} 个文件`);
