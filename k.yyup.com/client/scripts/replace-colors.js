#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { replaceColors, needsSpecialHandling, colorMap } from './color-mapper.js';

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.vue')) {
      callback(filePath);
    }
  });
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    
    // 检查是否包含需要替换的颜色
    const containsColors = Object.keys(colorMap).some(color => 
      content.includes(color) && !needsSpecialHandling(content, color)
    );
    
    if (containsColors) {
      modifiedContent = replaceColors(content);
      hasChanges = content !== modifiedContent;
    }
    
    // 记录特殊颜色
    Object.keys(colorMap).forEach(color => {
      if (content.includes(color) && needsSpecialHandling(content, color)) {
        console.log(`⚠️  特殊颜色需要手动处理: ${color} 在 ${filePath}`);
      }
    });
    
    // 如果有修改，写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ 已处理: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    return false;
  }
}

// 主函数
function main() {
  const srcDir = path.join(process.cwd(), 'src');
  let processedCount = 0;
  let modifiedCount = 0;
  
  console.log('🎨 开始批量替换硬编码颜色...\n');
  
  walkDir(srcDir, (filePath) => {
    processedCount++;
    if (processFile(filePath)) {
      modifiedCount++;
    }
  });
  
  console.log(`\n📊 处理完成:`);
  console.log(`   - 总文件数: ${processedCount}`);
  console.log(`   - 修改文件数: ${modifiedCount}`);
  console.log(`   - 未修改文件数: ${processedCount - modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log('\n✨ 颜色替换完成！请检查特殊颜色标记的文件。');
  } else {
    console.log('\n💡 没有发现需要替换的颜色。');
  }
}

// 运行脚本
main();

export { processFile, walkDir };