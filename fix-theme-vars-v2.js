#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages';

// 更全面的修复规则
const replacementPatterns = [
  // --bg-secondary -> --bg-page
  {
    pattern: /var\(--bg-secondary(?:,\s*[^)]+)?\)/g,
    replacement: 'var(--bg-page)',
    description: '--bg-secondary -> --bg-page'
  },
  // --bg-primary (但不匹配 --bg-primary-light)
  {
    pattern: /var\(--bg-primary(?:,\s*[^)]+)?\)(?!-)/g,
    replacement: 'var(--bg-page)',
    description: '--bg-primary -> --bg-page'
  },
  // --bg-color -> --bg-card
  {
    pattern: /var\(--bg-color(?:,\s*[^)]+)?\)/g,
    replacement: 'var(--bg-card)',
    description: '--bg-color -> --bg-card'
  }
];

let fixedCount = 0;
let errorCount = 0;
const errors = [];

// 递归获取所有Vue文件
function getAllVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log('正在扫描所有Vue文件...');
const allVueFiles = getAllVueFiles(basePath);
console.log(`找到 ${allVueFiles.length} 个Vue文件\n`);

// 处理每个文件
allVueFiles.forEach((fullPath, index) => {
  const relativePath = path.relative(basePath, fullPath);

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    let originalContent = content;

    // 应用所有替换规则
    replacementPatterns.forEach(rule => {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        modified = true;
        content = newContent;
        console.log(`  ✓ 应用规则: ${rule.description}`);
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedCount++;
      console.log(`✅ [${fixedCount}] ${relativePath}`);
    }
  } catch (error) {
    errorCount++;
    errors.push({ file: relativePath, error: error.message });
    console.error(`❌ Error fixing ${relativePath}:`, error.message);
  }
});

// 输出总结
console.log('\n' + '='.repeat(80));
console.log('主题变量批量修复完成');
console.log('='.repeat(80));
console.log(`总文件数: ${allVueFiles.length}`);
console.log(`成功修复: ${fixedCount}`);
console.log(`错误数量: ${errorCount}`);

if (errors.length > 0) {
  console.log('\n错误详情:');
  errors.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}

console.log('\n修复规则:');
replacementPatterns.forEach(rule => {
  console.log(`  - ${rule.description}`);
});

// 验证修复结果
console.log('\n' + '='.repeat(80));
console.log('验证修复结果...');
console.log('='.repeat(80));

try {
  const remainingBgSecondary = execSync(
    `grep -r "var(--bg-secondary)" ${basePath} --include="*.vue" | wc -l`,
    { encoding: 'utf8' }
  ).trim();

  const remainingBgPrimary = execSync(
    `grep -r "var(--bg-primary)" ${basePath} --include="*.vue" | grep -v "var(--bg-primary-light)" | wc -l`,
    { encoding: 'utf8' }
  ).trim();

  const remainingBgColor = execSync(
    `grep -r "var(--bg-color)" ${basePath} --include="*.vue" | wc -l`,
    { encoding: 'utf8' }
  ).trim();

  console.log(`剩余 --bg-secondary: ${remainingBgSecondary}`);
  console.log(`剩余 --bg-primary: ${remainingBgPrimary}`);
  console.log(`剩余 --bg-color: ${remainingBgColor}`);

  if (remainingBgSecondary === '0' && remainingBgPrimary === '0' && remainingBgColor === '0') {
    console.log('\n✅ 所有错误的主题变量已成功修复！');
  } else {
    console.log('\n⚠️  仍有部分主题变量未修复，可能需要手动检查');
  }
} catch (error) {
  console.error('验证失败:', error.message);
}
