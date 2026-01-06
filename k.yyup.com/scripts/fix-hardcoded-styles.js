#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 硬编码值到设计令牌的映射
const replacements = [
  // 颜色映射
  { pattern: /#8b5cf6/g, replacement: 'var(--primary-color)', description: '紫色' },
  { pattern: /#7c3aed/g, replacement: 'var(--primary-hover)', description: '深紫' },
  { pattern: /#3b82f6/g, replacement: 'var(--primary-color)', description: '蓝色' },
  { pattern: /#1d4ed8/g, replacement: 'var(--primary-hover)', description: '深蓝' },
  { pattern: /#f59e0b/g, replacement: 'var(--warning-color)', description: '橙色' },
  { pattern: /#d97706/g, replacement: 'var(--warning-color)', description: '深橙' },
  { pattern: /#fafbfc/g, replacement: 'var(--bg-secondary)', description: '浅灰背景' },
  { pattern: /#f8fafc/g, replacement: 'var(--bg-secondary)', description: '更浅灰背景' },
  { pattern: /#f1f5f9/g, replacement: 'var(--bg-tertiary)', description: '浅灰' },
  { pattern: /#374151/g, replacement: 'var(--text-primary)', description: '深灰文字' },
  { pattern: /#1f2937/g, replacement: 'var(--text-primary)', description: '更深灰文字' },
  { pattern: /#6b7280/g, replacement: 'var(--text-secondary)', description: '中灰文字' },
  { pattern: /#e5e7eb/g, replacement: 'var(--border-color)', description: '边框灰' },
  { pattern: /#d1d5db/g, replacement: 'var(--border-light)', description: '边框深灰' },
  { pattern: /#111827/g, replacement: 'var(--bg-primary)', description: '暗黑背景' },
  { pattern: /#f9fafb/g, replacement: 'var(--text-primary)', description: '暗黑文字' },
  { pattern: /#4b5563/g, replacement: 'var(--bg-tertiary)', description: '深灰' },
  
  // 像素值映射 - 间距
  { pattern: /padding:\s*4px/g, replacement: 'padding: var(--spacing-xs)', description: '4px padding' },
  { pattern: /padding:\s*6px/g, replacement: 'padding: var(--spacing-xs)', description: '6px padding' },
  { pattern: /padding:\s*8px/g, replacement: 'padding: var(--spacing-sm)', description: '8px padding' },
  { pattern: /padding:\s*10px/g, replacement: 'padding: var(--spacing-sm)', description: '10px padding' },
  { pattern: /padding:\s*12px/g, replacement: 'padding: var(--spacing-md)', description: '12px padding' },
  { pattern: /padding:\s*16px/g, replacement: 'padding: var(--spacing-lg)', description: '16px padding' },
  { pattern: /padding:\s*20px/g, replacement: 'padding: var(--spacing-lg)', description: '20px padding' },
  { pattern: /padding:\s*24px/g, replacement: 'padding: var(--spacing-xl)', description: '24px padding' },
  { pattern: /padding:\s*28px/g, replacement: 'padding: var(--spacing-xl)', description: '28px padding' },
  { pattern: /padding:\s*32px/g, replacement: 'padding: var(--spacing-2xl)', description: '32px padding' },
  
  // margin 映射
  { pattern: /margin:\s*8px/g, replacement: 'margin: var(--spacing-sm)', description: '8px margin' },
  { pattern: /margin:\s*12px/g, replacement: 'margin: var(--spacing-md)', description: '12px margin' },
  { pattern: /margin:\s*16px/g, replacement: 'margin: var(--spacing-lg)', description: '16px margin' },
  { pattern: /margin:\s*24px/g, replacement: 'margin: var(--spacing-xl)', description: '24px margin' },
  { pattern: /margin:\s*32px/g, replacement: 'margin: var(--spacing-2xl)', description: '32px margin' },
  
  // border-radius 映射
  { pattern: /border-radius:\s*2px/g, replacement: 'border-radius: var(--radius-xs)', description: '2px radius' },
  { pattern: /border-radius:\s*8px/g, replacement: 'border-radius: var(--radius-sm)', description: '8px radius' },
  { pattern: /border-radius:\s*10px/g, replacement: 'border-radius: var(--radius-sm)', description: '10px radius' },
  { pattern: /border-radius:\s*12px/g, replacement: 'border-radius: var(--radius-md)', description: '12px radius' },
  { pattern: /border-radius:\s*16px/g, replacement: 'border-radius: var(--radius-lg)', description: '16px radius' },
  { pattern: /border-radius:\s*20px/g, replacement: 'border-radius: var(--radius-xl)', description: '20px radius' },
  
  // 尺寸映射
  { pattern: /width:\s*32px/g, replacement: 'width: var(--size-avatar-sm)', description: '32px width' },
  { pattern: /height:\s*32px/g, replacement: 'height: var(--size-avatar-sm)', description: '32px height' },
  { pattern: /width:\s*40px/g, replacement: 'width: var(--size-icon-lg)', description: '40px width' },
  { pattern: /height:\s*40px/g, replacement: 'height: var(--size-icon-lg)', description: '40px height' },
  { pattern: /width:\s*48px/g, replacement: 'width: var(--size-icon-xl)', description: '48px width' },
  { pattern: /height:\s*48px/g, replacement: 'height: var(--size-icon-xl)', description: '48px height' },
  { pattern: /width:\s*80px/g, replacement: 'width: var(--size-avatar-lg)', description: '80px width' },
  { pattern: /height:\s*80px/g, replacement: 'height: var(--size-avatar-lg)', description: '80px height' },
  { pattern: /width:\s*100px/g, replacement: 'width: var(--size-avatar-xl)', description: '100px width' },
  { pattern: /height:\s*100px/g, replacement: 'height: var(--size-avatar-xl)', description: '100px height' },
  { pattern: /width:\s*120px/g, replacement: 'width: var(--size-avatar-2xl)', description: '120px width' },
  { pattern: /height:\s*120px/g, replacement: 'height: var(--size-avatar-2xl)', description: '120px height' },
  
  // 字体大小映射
  { pattern: /font-size:\s*12px/g, replacement: 'font-size: var(--text-xs)', description: '12px font' },
  { pattern: /font-size:\s*13px/g, replacement: 'font-size: var(--text-xs)', description: '13px font' },
  { pattern: /font-size:\s*14px/g, replacement: 'font-size: var(--text-sm)', description: '14px font' },
  { pattern: /font-size:\s*16px/g, replacement: 'font-size: var(--text-base)', description: '16px font' },
  { pattern: /font-size:\s*18px/g, replacement: 'font-size: var(--text-lg)', description: '18px font' },
  { pattern: /font-size:\s*1rem/g, replacement: 'font-size: var(--text-base)', description: '1rem font' },
  { pattern: /font-size:\s*1.25rem/g, replacement: 'font-size: var(--text-xl)', description: '1.25rem font' },
  { pattern: /font-size:\s*1.5rem/g, replacement: 'font-size: var(--text-2xl)', description: '1.5rem font' },
  { pattern: /font-size:\s*2rem/g, replacement: 'font-size: var(--text-4xl)', description: '2rem font' },
  
  // 字体权重映射
  { pattern: /font-weight:\s*600/g, replacement: 'font-weight: var(--font-semibold)', description: '600 weight' },
  { pattern: /font-weight:\s*700/g, replacement: 'font-weight: var(--font-bold)', description: '700 weight' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changeCount = 0;
    
    for (const replacement of replacements) {
      const matches = content.match(replacement.pattern);
      if (matches) {
        changeCount += matches.length;
        content = content.replace(replacement.pattern, replacement.replacement);
      }
    }
    
    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: 修复了 ${changeCount} 个硬编码值`);
      return changeCount;
    }
  } catch (error) {
    console.error(`❌ 处理 ${filePath} 时出错:`, error.message);
  }
  return 0;
}

// 需要修复的文件列表
const filesToFix = [
  'client/src/pages/system/system-dialog-styles.scss',
  'client/src/pages/system/user-management-ux-styles.scss',
  'client/src/pages/system/Dashboard.vue',
  'client/src/pages/system/Security.vue',
  'client/src/pages/system/User.vue',
];

console.log('🔧 开始修复硬编码样式值...\n');

let totalChanges = 0;
for (const file of filesToFix) {
  const filePath = path.join('/home/devbox/project/k.yyup.com', file);
  totalChanges += fixFile(filePath);
}

console.log(`\n✨ 完成！总共修复了 ${totalChanges} 个硬编码值`);

