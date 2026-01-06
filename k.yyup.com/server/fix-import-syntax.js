#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复import语句语法错误
 */

const controllersDir = path.join(__dirname, 'src/controllers');

// 递归查找所有TypeScript文件
function findTsFiles(dir) {
  const files = [];
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

// 修复单个文件的import语法
function fixFileImports(filePath) {
  console.log(`正在处理: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // 修复缺少分号的import语句
  // 匹配: import something from 'path'import other from 'path2'
  const importPattern = /import\s+[^;\n]*from\s+['"][^'"]*['"](\s*import)/g;
  content = content.replace(importPattern, (match, nextImport) => {
    hasChanges = true;
    return match.replace(nextImport, `;\nimport`);
  });

  // 修复缺少分号的独立import语句结尾
  const singleImportPattern = /import\s+[^;\n]*from\s+['"][^'"]*['"](?!\s*;)(?=\n)/g;
  content = content.replace(singleImportPattern, (match) => {
    hasChanges = true;
    return match + ';';
  });

  // 修复const/let/var语句缺少分号
  const statementPattern = /(const|let|var)\s+[^=]*=[^;]*?(?=\n)/g;
  content = content.replace(statementPattern, (match) => {
    // 避免在注释或字符串中添加分号
    if (!match.trim().startsWith('//') && !match.includes('//')) {
      hasChanges = true;
      return match + ';';
    }
    return match;
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ 已修复: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  无需修复: ${filePath}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🔧 开始修复import语法错误...\n');

  const tsFiles = findTsFiles(controllersDir);
  console.log(`找到 ${tsFiles.length} 个TypeScript文件\n`);

  let fixedCount = 0;

  for (const file of tsFiles) {
    if (fixFileImports(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✨ 语法修复完成！共修复了 ${fixedCount} 个文件`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFileImports, findTsFiles };