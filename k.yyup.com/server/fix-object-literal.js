#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复对象字面量语法错误
 * 修复模式: CallingLogger.createControllerContext('name', 'action', {;  ->  CallingLogger.createControllerContext('name', 'action', {
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

// 修复单个文件的对象字面量语法错误
function fixFileObjectLiterals(filePath) {
  console.log(`正在处理: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // 修复 CallingLogger.createControllerContext 中的 {; 错误
  const contextPattern = /CallingLogger\.createControllerContext\([^,]+,\s*[^,]+,\s*\{\s*;/g;
  content = content.replace(contextPattern, (match) => {
    hasChanges = true;
    return match.replace('{;', '{');
  });

  // 修复其他对象字面量中的 {; 错误
  const objectPattern = /\{\s*;/g;
  content = content.replace(objectPattern, (match) => {
    hasChanges = true;
    return match.replace('{;', '{');
  });

  // 修复解构赋值中的错误, 比如 const { page = 1,; pageSize = 10 } = req.query;
  const destructuringPattern = /\{\s*([^}]*);\s*([^}]*)\}/g;
  content = content.replace(destructuringPattern, (match, before, after) => {
    // 检查是否在解构赋值中有多余的分号
    if (before.includes('=') && after.includes(',')) {
      hasChanges = true;
      return `{${before}${after}}`;
    }
    return match;
  });

  // 修复 const 声明中的错误，比如 const params = {;
  const constPattern = /const\s+(\w+)\s*=\s*\{\s*;/g;
  content = content.replace(constPattern, (match, varName) => {
    hasChanges = true;
    return `const ${varName} = {`;
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
  console.log('🔧 开始修复对象字面量语法错误...\n');

  const tsFiles = findTsFiles(controllersDir);
  console.log(`找到 ${tsFiles.length} 个TypeScript文件\n`);

  let fixedCount = 0;

  for (const file of tsFiles) {
    if (fixFileObjectLiterals(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✨ 对象字面量语法修复完成！共修复了 ${fixedCount} 个文件`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFileObjectLiterals, findTsFiles };