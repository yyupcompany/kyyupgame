#!/usr/bin/env node

/**
 * Sass @import to @use 迁移脚本
 * 自动将 @import 语句转换为 @use 语句
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const STYLES_DIR = path.join(__dirname, '../src/styles');
const BACKUP_DIR = path.join(__dirname, '../src/styles-backup');

// 创建备份目录
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✅ 创建备份目录: ${BACKUP_DIR}`);
}

// 获取所有 .scss 文件
const scssFiles = glob.sync('**/*.scss', {
  cwd: STYLES_DIR,
  absolute: true
});

console.log(`\n📁 找到 ${scssFiles.length} 个 SCSS 文件\n`);

// 第一步：分析所有导入
const importMap = new Map();

scssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const importRegex = /@import\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const key = `${path.dirname(file)}/${importPath}`;
    if (!importMap.has(key)) {
      importMap.set(key, []);
    }
    importMap.get(key).push(file);
  }
});

// 第二步：转换文件
let convertedCount = 0;
let errorCount = 0;

scssFiles.forEach(file => {
  try {
    const relativePath = path.relative(STYLES_DIR, file);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    
    // 创建备份
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.copyFileSync(file, backupPath);

    // 读取原始内容
    let content = fs.readFileSync(file, 'utf-8');
    const originalContent = content;

    // 转换 @import 为 @use
    content = content.replace(/@import\s+['"]([^'"]+)['"]\s*;/g, (match, importPath) => {
      const fileName = path.basename(importPath, '.scss');
      const dirName = path.basename(path.dirname(importPath));
      
      let namespace = fileName;
      if (fileName === 'index') {
        namespace = dirName;
      }
      
      return `@use '${importPath}' as ${namespace};`;
    });

    // 如果内容有变化，写入文件
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8');
      convertedCount++;
      console.log(`✅ 转换: ${relativePath}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ 错误 (${path.relative(STYLES_DIR, file)}): ${error.message}`);
  }
});

console.log(`\n📊 迁移完成:`);
console.log(`   ✅ 转换文件: ${convertedCount}`);
console.log(`   ❌ 错误: ${errorCount}`);
console.log(`   💾 备份位置: ${BACKUP_DIR}`);
console.log(`\n⚠️  注意: 这个脚本只转换了 @import 语句。`);
console.log(`   你可能需要手动调整变量和 mixin 的使用。\n`);

