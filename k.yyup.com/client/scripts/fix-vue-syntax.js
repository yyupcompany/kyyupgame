#!/usr/bin/env node

/**
 * 批量修复Vue文件中的语法错误
 * Batch fix Vue file syntax errors
 */

import fs from 'fs';
import path from 'path';

// 查找所有Vue文件
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        findVueFiles(filePath, fileList);
      }
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 修复单个文件
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 修复 color="var(...): var(...): var(...)" 语法错误
    // 匹配模式: color="var(--xxx)": var(--yyy): var(--zzz)">
    const colorPattern = /color="var\(--[^)]+\)":\s*var\(--[^:)]+\):\s*var\(--[^)]+\)"/g;
    if (colorPattern.test(content)) {
      content = content.replace(colorPattern, (match) => {
        // 提取第一个var中的内容
        const firstVar = match.match(/var\(--[^)]+\)/)[0];
        return `color="${firstVar}"`;
      });
      modified = true;
      console.log(`✅ 修复 ${filePath} 中的color语法错误`);
    }
    
    // 修复其他类似的语法错误
    // 匹配模式: anyprop="var(--xxx): var(--yyy): var(--zzz)">
    const otherPattern = /\w+="var\(--[^)]+\)":\s*var\(--[^:)]+\):\s*var\(--[^)]+\)"/g;
    if (otherPattern.test(content)) {
      content = content.replace(otherPattern, (match) => {
        // 提取属性名和第一个var中的内容
        const propName = match.match(/(\w+)="/)[1];
        const firstVar = match.match(/var\(--[^)]+\)/)[0];
        return `${propName}="${firstVar}"`;
      });
      modified = true;
      console.log(`✅ 修复 ${filePath} 中的属性语法错误`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔧 开始批量修复Vue文件语法错误...\n');
  
  try {
    const vueFiles = findVueFiles('src');
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);
    
    let fixedCount = 0;
    
    for (const file of vueFiles) {
      if (fixFile(file)) {
        fixedCount++;
      }
    }
    
    console.log(`\n📊 修复完成: ${fixedCount} 个文件被修改`);
    
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFile };