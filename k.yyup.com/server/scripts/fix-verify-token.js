#!/usr/bin/env node

/**
 * 批量修复verifyToken未定义问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始批量修复verifyToken问题...');

// 搜索所有需要修复的路由文件
const routesDir = path.join(__dirname, '../src/routes');
const filesToFix = [];

function findRouteFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('router.use(verifyToken)') && !content.includes('import { verifyToken }')) {
        filesToFix.push(filePath);
      }
    }
  }
}

findRouteFiles(routesDir);

console.log(`📋 找到 ${filesToFix.length} 个需要修复的文件`);

// 修复每个文件
let fixedCount = 0;
for (const filePath of filesToFix) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 检查是否已经导入了verifyToken
    if (content.includes('import { verifyToken }')) {
      console.log(`⚠️  ${filePath} 已包含verifyToken导入，跳过`);
      continue;
    }

    // 查找import语句的位置
    const importRegex = /import\s+.*\s+from\s+['"][^'"]+['"];?\s*\n/g;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      // 在最后一个import后添加verifyToken导入
      const lastImport = imports[imports.length - 1];
      const lastImportEnd = content.lastIndexOf(lastImport) + lastImport.length;

      const importStatement = "\nimport { verifyToken } from '../middleware/auth-middleware';";

      content = content.slice(0, lastImportEnd) + importStatement + content.slice(lastImportEnd);

      fs.writeFileSync(filePath, content);
      console.log(`✅ 修复: ${path.relative(process.cwd(), filePath)}`);
      fixedCount++;
    } else {
      console.log(`⚠️  ${filePath} 未找到import语句，跳过`);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

console.log(`\n🎉 批量修复完成！`);
console.log(`✅ 成功修复: ${fixedCount} 个文件`);
console.log(`⚠️  跳过文件: ${filesToFix.length - fixedCount} 个`);