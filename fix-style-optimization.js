#!/usr/bin/env node

/**
 * 批量修复所有FAIL状态页面的硬编码颜色问题
 *
 * 自动替换所有硬编码颜色为设计令牌
 */

const fs = require('fs');
const path = require('path');

// 要修复的文件列表
const FILES_TO_FIX = [
  'k.yyup.com/client/src/pages/teacher-center/performance-rewards/index.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/share-stats/index.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/games/achievements.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/enrollment/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/teaching/index.vue',
  'k.yyup.com/client/src/pages/parent-center/profile/index.vue'
];

// 颜色映射表
const COLOR_REPLACEMENTS = [
  // Primary Colors
  { from: /#409eff/g, to: 'var(--primary-color)' },
  { from: /#3a8ee6/g, to: 'var(--primary-hover)' },
  { from: /#5b8def/g, to: 'var(--primary-color)' },
  { from: /#66b1ff/g, to: 'var(--primary-light)' },
  { from: /#1677ff/g, to: 'var(--primary-color)' },
  { from: /#1989fa/g, to: 'var(--primary-color)' },
  { from: /#40a9ff/g, to: 'var(--primary-light)' },

  // Success Colors
  { from: /#67c23a/g, to: 'var(--success-color)' },
  { from: /#85ce61/g, to: 'var(--success-hover)' },
  { from: /#529b2e/g, to: 'var(--success-dark)' },
  { from: /#52c41a/g, to: 'var(--success-color)' },
  { from: /#07c160/g, to: 'var(--success-color)' },
  { from: /#38d9a9/g, to: 'var(--success-light)' },

  // Warning Colors
  { from: /#e6a23c/g, to: 'var(--warning-color)' },
  { from: /#ebb563/g, to: 'var(--warning-hover)' },
  { from: /#b3a375/g, to: 'var(--warning-dark)' },
  { from: /#faad14/g, to: 'var(--warning-color)' },
  { from: /#ffcd38/g, to: 'var(--warning-light)' },
  { from: /#ffc107/g, to: 'var(--warning-color)' },
  { from: /#ff9800/g, to: 'var(--warning-color)' },
  { from: /#ff5722/g, to: 'var(--danger-color)' },

  // Danger Colors
  { from: /#f56c6c/g, to: 'var(--danger-color)' },
  { from: /#f78989/g, to: 'var(--danger-hover)' },
  { from: /#c95959/g, to: 'var(--danger-dark)' },
  { from: /#ff4d4f/g, to: 'var(--danger-color)' },
  { from: /#ee0a24/g, to: 'var(--danger-color)' },
  { from: /#ff6b6b/g, to: 'var(--danger-hover)' },
  { from: /#ff8787/g, to: 'var(--danger-hover)' },

  // Info Colors
  { from: /#909399/g, to: 'var(--info-color)' },
  { from: /#a6a9ad/g, to: 'var(--info-hover)' },
  { from: /#73767a/g, to: 'var(--info-dark)' },

  // Text Colors
  { from: /#2c3e50/g, to: 'var(--text-primary)' },
  { from: /#5a6c7d/g, to: 'var(--text-secondary)' },
  { from: /#8492a6/g, to: 'var(--text-tertiary)' },
  { from: /#c0c4cc/g, to: 'var(--text-muted)' },
  { from: /#323233/g, to: 'var(--text-primary)' },
  { from: /#646566/g, to: 'var(--text-secondary)' },
  { from: /#969799/g, to: 'var(--text-tertiary)' },
  { from: /#333/g, to: 'var(--text-primary)' },
  { from: /#666/g, to: 'var(--text-secondary)' },
  { from: /#999/g, to: 'var(--text-tertiary)' },

  // Background Colors
  { from: /#ffffff/g, to: 'var(--white)' },
  { from: /#fff/g, to: 'var(--white)' },
  { from: /#000000/g, to: 'var(--black)' },
  { from: /#000/g, to: 'var(--black)' },
  { from: /#f7f8fa/g, to: 'var(--bg-page)' },
  { from: /#fafbfc/g, to: 'var(--bg-secondary)' },
  { from: /#f5f7fa/g, to: 'var(--bg-hover)' },
  { from: /#f5f5f5/g, to: 'var(--bg-page)' },
  { from: /#f8f8f8/g, to: 'var(--bg-page)' },
  { from: /#f8f9fa/g, to: 'var(--bg-page)' },

  // Border Colors
  { from: /#dcdfe6/g, to: 'var(--border-color)' },
  { from: /#e4e7ed/g, to: 'var(--border-light)' },
  { from: /#f0f0f0/g, to: 'var(--border-light)' },
  { from: /#e0e0e0/g, to: 'var(--border-light)' },
  { from: /#ebedf0/g, to: 'var(--border-light)' },
  { from: /#c8c9cc/g, to: 'var(--border-dark)' },

  // Special colors
  { from: /#ffd21e/g, to: 'var(--warning-color)' },
  { from: /rgba\(0, 0, 0, 0\.6\)/g, to: 'rgba(0, 0, 0, 0.6)' },
];

// 替换 gradients
const GRADIENT_REPLACEMENTS = [
  {
    from: /linear-gradient\(135deg, #1989fa 0%, #40a9ff 100%\)/g,
    to: 'var(--gradient-primary)'
  },
  {
    from: /linear-gradient\(135deg, #07c160 0%, #38d9a9 100%\)/g,
    to: 'var(--gradient-success)'
  },
  {
    from: /linear-gradient\(135deg, #67c23a 0%, #529b2e 100%\)/g,
    to: 'var(--gradient-success)'
  },
  {
    from: /linear-gradient\(135deg, #e6a23c 0%, #ebb563 100%\)/g,
    to: 'linear-gradient(135deg, var(--warning-color) 0%, var(--warning-hover) 100%)'
  },
  {
    from: /linear-gradient\(135deg, #f56c6c 0%, #f78989 100%\)/g,
    to: 'linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%)'
  },
  {
    from: /linear-gradient\(135deg, #ff9800 0%, #ff5722 100%\)/g,
    to: 'linear-gradient(135deg, var(--warning-color) 0%, var(--danger-color) 100%)'
  },
  {
    from: /linear-gradient\(135deg, #ffd21e 0%, #ff9800 100%\)/g,
    to: 'linear-gradient(135deg, var(--warning-color) 0%, var(--warning-color) 100%)'
  },
  {
    from: /linear-gradient\(135deg, #c8c9cc 0%, #ebedf0 100%\)/g,
    to: 'linear-gradient(135deg, var(--border-dark) 0%, var(--border-light) 100%)'
  },
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

    // 替换渐变
    for (const replacement of GRADIENT_REPLACEMENTS) {
      const matches = content.match(replacement.from);
      if (matches) {
        content = content.replace(replacement.from, replacement.to);
        totalReplacements += matches.length;
        console.log(`  ✓ 替换渐变 ${matches.length} 处`);
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
  console.log('🚀 开始批量修复硬编码颜色...\n');
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
  console.log('📊 修复总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`✅ 成功: ${successCount}/${FILES_TO_FIX.length} 个文件`);
  console.log(`❌ 失败: ${failCount}/${FILES_TO_FIX.length} 个文件`);
  console.log(`🔢 总计替换: ${totalReplacements} 处硬编码颜色`);

  if (failCount > 0) {
    console.log('\n❌ 失败的文件:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.path}: ${r.error || '未知错误'}`);
    });
  }

  console.log('\n✨ 所有修复完成!');
}

// 运行
main();
