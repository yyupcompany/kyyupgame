#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 颜色映射
const colorMappings = [
  ['#8b5cf6', 'var(--primary-color)'],
  ['#7c3aed', 'var(--primary-hover)'],
  ['#3b82f6', 'var(--primary-color)'],
  ['#1d4ed8', 'var(--primary-hover)'],
  ['#f59e0b', 'var(--warning-color)'],
  ['#d97706', 'var(--warning-color)'],
  ['#fafbfc', 'var(--bg-secondary)'],
  ['#f8fafc', 'var(--bg-secondary)'],
  ['#f1f5f9', 'var(--bg-tertiary)'],
  ['#374151', 'var(--text-primary)'],
  ['#1f2937', 'var(--text-primary)'],
  ['#6b7280', 'var(--text-secondary)'],
  ['#e5e7eb', 'var(--border-color)'],
  ['#d1d5db', 'var(--border-light)'],
  ['#111827', 'var(--bg-primary)'],
  ['#f9fafb', 'var(--text-primary)'],
  ['#4b5563', 'var(--bg-tertiary)'],
  ['#9ca3af', 'var(--text-secondary)'],
  ['#c7d2fe', 'var(--primary-light)'],
];

// 尺寸映射
const sizeMappings = [
  ['border-radius: 20px', 'border-radius: var(--radius-xl)'],
  ['border-radius: 16px', 'border-radius: var(--radius-lg)'],
  ['border-radius: 12px', 'border-radius: var(--radius-md)'],
  ['border-radius: 8px', 'border-radius: var(--radius-sm)'],
  ['border-radius: 2px', 'border-radius: var(--radius-xs)'],
  ['padding: 32px', 'padding: var(--spacing-2xl)'],
  ['padding: 28px', 'padding: var(--spacing-xl)'],
  ['padding: 24px', 'padding: var(--spacing-xl)'],
  ['padding: 20px', 'padding: var(--spacing-lg)'],
  ['padding: 16px', 'padding: var(--spacing-lg)'],
  ['padding: 12px', 'padding: var(--spacing-md)'],
  ['padding: 8px', 'padding: var(--spacing-sm)'],
  ['gap: 24px', 'gap: var(--spacing-xl)'],
  ['gap: 16px', 'gap: var(--spacing-lg)'],
  ['gap: 12px', 'gap: var(--spacing-md)'],
  ['gap: 8px', 'gap: var(--spacing-sm)'],
  ['margin-bottom: 32px', 'margin-bottom: var(--spacing-2xl)'],
  ['margin-bottom: 28px', 'margin-bottom: var(--spacing-xl)'],
  ['margin-bottom: 24px', 'margin-bottom: var(--spacing-xl)'],
  ['margin-bottom: 16px', 'margin-bottom: var(--spacing-lg)'],
  ['margin-bottom: 12px', 'margin-bottom: var(--spacing-md)'],
  ['margin-bottom: 8px', 'margin-bottom: var(--spacing-sm)'],
  ['margin-top: 8px', 'margin-top: var(--spacing-sm)'],
  ['font-size: 1rem', 'font-size: var(--text-base)'],
  ['font-size: 0.95rem', 'font-size: 0.95rem'],
  ['font-size: 0.875rem', 'font-size: var(--text-sm)'],
  ['font-size: 0.75rem', 'font-size: var(--text-xs)'],
  ['font-weight: 600', 'font-weight: var(--font-semibold)'],
  ['font-weight: 700', 'font-weight: var(--font-bold)'],
  ['width: 120px', 'width: var(--size-avatar-2xl)'],
  ['height: 120px', 'height: var(--size-avatar-2xl)'],
  ['width: 100px', 'width: var(--size-avatar-xl)'],
  ['height: 100px', 'height: var(--size-avatar-xl)'],
  ['width: 80px', 'width: var(--size-avatar-lg)'],
  ['height: 80px', 'height: var(--size-avatar-lg)'],
  ['width: 48px', 'width: var(--size-icon-xl)'],
  ['height: 48px', 'height: var(--size-icon-xl)'],
  ['width: 40px', 'width: var(--size-icon-lg)'],
  ['height: 40px', 'height: var(--size-icon-lg)'],
  ['width: 32px', 'width: var(--size-avatar-sm)'],
  ['height: 32px', 'height: var(--size-avatar-sm)'],
];

const files = [
  'client/src/pages/system/system-dialog-styles.scss',
  'client/src/pages/system/user-management-ux-styles.scss',
  'client/src/pages/system/Dashboard.vue',
  'client/src/pages/system/Security.vue',
  'client/src/pages/system/User.vue',
];

function fixFile(filePath) {
  const fullPath = path.join('/home/devbox/project/k.yyup.com', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return 0;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  let count = 0;
  
  // 替换颜色
  for (const [old, newVal] of colorMappings) {
    const regex = new RegExp(old.replace(/[#]/g, '\\#'), 'g');
    const matches = content.match(regex);
    if (matches) {
      count += matches.length;
      content = content.replace(regex, newVal);
    }
  }
  
  // 替换尺寸
  for (const [old, newVal] of sizeMappings) {
    const matches = content.match(new RegExp(old.replace(/[()]/g, '\\$&'), 'g'));
    if (matches) {
      count += matches.length;
      content = content.replace(new RegExp(old.replace(/[()]/g, '\\$&'), 'g'), newVal);
    }
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  return count;
}

console.log('🚀 开始修复硬编码样式值...\n');

let totalFixed = 0;
for (const file of files) {
  const fixed = fixFile(file);
  if (fixed > 0) {
    console.log(`✅ ${file}: 修复了 ${fixed} 个值`);
    totalFixed += fixed;
  }
}

console.log(`\n✨ 完成！总共修复了 ${totalFixed} 个硬编码值`);

