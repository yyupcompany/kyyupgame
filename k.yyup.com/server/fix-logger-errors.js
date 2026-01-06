#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 批量修复Logger编译错误的脚本
 *
 * 主要修复：
 * 1. unknown类型到Error类型的转换
 * 2. LogContext类型错误（传递string而不是LogContext对象）
 * 3. logger未定义的错误
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

// 修复单个文件
function fixFile(filePath) {
  console.log(`正在处理文件: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // 1. 修复unknown类型到Error类型的转换
  // 匹配: CallingLogger.logError(context, 'message', error);
  const errorPattern = /CallingLogger\.logError\(([^,]+),\s*([^,]+),\s*error\s*\)/g;
  content = content.replace(errorPattern, (match, context, message) => {
    hasChanges = true;
    return `const errorObj = error instanceof Error ? error : new Error(String(error));\n      CallingLogger.logError(${context}, ${message}, errorObj)`;
  });

  // 2. 修复LogContext类型错误 - 传递string而不是LogContext对象
  // 匹配: CallingLogger.logError('string message', error);
  const contextPattern = /CallingLogger\.logError\(\s*'([^']+)',\s*error\s*\)/g;
  content = content.replace(contextPattern, (match, message) => {
    hasChanges = true;
    const controllerName = path.basename(filePath, '.controller.ts').replace('-', '');
    return `const context = CallingLogger.createControllerContext('${controllerName}', 'unknownOperation');\n      const errorObj = error instanceof Error ? error : new Error(String(error));\n      CallingLogger.logError(context, '${message}', errorObj)`;
  });

  // 3. 修复logger未定义的错误 - 添加import语句
  if (content.includes('logger.') && !content.includes('import logger')) {
    // 检查是否已经有CallingLogger的import
    if (content.includes('import { CallingLogger')) {
      // 如果有CallingLogger，添加logger导入
      if (!content.includes('import logger')) {
        const importIndex = content.indexOf('import { CallingLogger');
        const importEnd = content.indexOf('\n', importIndex);
        content = content.slice(0, importEnd) + "\nimport logger from '../utils/logger';" + content.slice(importEnd);
        hasChanges = true;
      }
    } else {
      // 如果没有CallingLogger，添加两个import
      const firstImport = content.indexOf('import ');
      if (firstImport !== -1) {
        const importEnd = content.indexOf('\n', firstImport);
        content = content.slice(0, importEnd) + "\nimport { CallingLogger } from '../utils/CallingLogger';\nimport logger from '../utils/logger';" + content.slice(importEnd);
        hasChanges = true;
      }
    }
  }

  // 4. 修复其他LogContext相关错误
  // 匹配: CallingLogger.logInfo('string message', data);
  const logInfoPattern = /CallingLogger\.log(Info|Success|Warn|Debug|System)\(\s*'([^']+)',\s*([^)]*)\)/g;
  content = content.replace(logInfoPattern, (match, method, message, data) => {
    hasChanges = true;
    const controllerName = path.basename(filePath, '.controller.ts').replace('-', '');
    const cleanData = data ? data : '';
    return `const context = CallingLogger.createControllerContext('${controllerName}', 'unknownOperation');\n      CallingLogger.log${method}(context, '${message}', ${cleanData})`;
  });

  // 5. 修复错误的import语句位置
  // 移除在文件中间的import语句
  const wrongImportPattern = /\n\s*import.*logger.*from.*utils.*;\n/g;
  const wrongImports = content.match(wrongImportPattern);
  if (wrongImports) {
    // 找到正确的import位置（文件开头）
    const firstImportIndex = content.indexOf('import ');
    if (firstImportIndex !== -1) {
      const firstImportEnd = content.indexOf('\n', firstImportIndex);

      // 移除错误的import
      content = content.replace(wrongImportPattern, '');

      // 在正确的位置添加import
      for (const wrongImport of wrongImports) {
        content = content.slice(0, firstImportEnd) + wrongImport.trim() + '\n' + content.slice(firstImportEnd);
      }
      hasChanges = true;
    }
  }

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
  console.log('🔧 开始修复Logger编译错误...\n');

  const tsFiles = findTsFiles(controllersDir);
  console.log(`找到 ${tsFiles.length} 个TypeScript文件\n`);

  let fixedCount = 0;

  for (const file of tsFiles) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✨ 修复完成！共修复了 ${fixedCount} 个文件`);

  if (fixedCount > 0) {
    console.log('\n📝 修复内容:');
    console.log('1. 修复了unknown类型到Error类型的转换');
    console.log('2. 修复了LogContext类型错误');
    console.log('3. 添加了缺失的logger导入');
    console.log('4. 修复了错误的import语句位置');
    console.log('\n🚀 现在可以重新编译检查了！');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, findTsFiles };