#!/usr/bin/env node

/**
 * Phase 2: 修复剩余的硬编码颜色
 */

const fs = require('fs');
const path = require('path');

// 要修复的文件列表
const FILES_TO_FIX = [
  'k.yyup.com/client/src/pages/teacher-center/performance-rewards/index.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/index.vue',
];

// Phase 2 颜色映射表
const COLOR_REPLACEMENTS = [
  // Ant Design colors
  { from: /#1890ff/g, to: 'var(--primary-color)' },
  { from: /#e6f7ff/g, to: 'var(--primary-light)' },
  { from: /#262626/g, to: 'var(--text-primary)' },
  { from: /#e8e8e8/g, to: 'var(--border-light)' },
  { from: /#f6ffed/g, to: 'var(--success-light)' },
  { from: /#b7eb8f/g, to: 'var(--success-hover)' },
  { from: /#389e0d/g, to: 'var(--success-color)' },

  // Dark mode colors
  { from: /#1a1a1a/g, to: 'var(--bg-card)' },
  { from: /#2a2a2a/g, to: 'var(--bg-secondary)' },
  { from: /#333/g, to: 'var(--text-primary)' },

  // Additional colors
  { from: /#f0f8ff/g, to: 'var(--primary-light)' },
];

/**
 * 修复单个文件
 */
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return { success: false, path: filePath, replacements: 0 };
  }

  console.log(`\n🔧 修复文件: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;

    // 替换颜色
    for (const replacement of COLOR_REPLACEMENTS) {
      const matches = content.match(replacement.from);
      if (matches) {
        content = content.replace(replacement.from, replacement.to);
        totalReplacements += matches.length;
        console.log(`  ✓ 替换 ${matches.length} 处: ${matches[0]} → ${replacement.to}`);
      }
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`✅ 完成! 共替换 ${totalReplacements} 处硬编码颜色`);
    return { success: true, path: filePath, replacements: totalReplacements };

  } catch (error) {
    console.error(`❌ 修复失败: ${error.message}`);
    return { success: false, path: filePath, replacements: 0, error: error.message };
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Phase 2: 修复剩余硬编码颜色...\n');
  console.log(`📋 共 ${FILES_TO_FIX.length} 个文件需要修复\n`);

  const results = [];
  let totalReplacements = 0;

  for (const file of FILES_TO_FIX) {
    const filePath = path.join(process.cwd(), file);
    const result = fixFile(filePath);
    results.push(result);
    if (result.success) {
      totalReplacements += result.replacements;
    }
  }

  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 2 修复总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`✅ 成功: ${successCount}/${FILES_TO_FIX.length} 个文件`);
  console.log(`❌ 失败: ${failCount}/${FILES_TO_FIX.length} 个文件`);
  console.log(`🔢 总计替换: ${totalReplacements} 处硬编码颜色`);

  console.log('\n✨ Phase 2 修复完成!');
}

// 运行
main();
