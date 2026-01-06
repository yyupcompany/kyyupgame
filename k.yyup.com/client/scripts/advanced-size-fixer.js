#!/usr/bin/env node

/**
 * 高级尺寸修复脚本 - 处理剩余的特殊字体大小和内联样式
 * Advanced Size Fixer - Handle remaining special font sizes and inline styles
 */

import fs from 'fs';
import path from 'path';

// 扩展的设计令牌映射表 - 包含特殊值
const EXTENDED_TOKENS = {
  // 扩展字体大小系统 - 包含特殊值
  fontSize: {
    '8': 'var(--text-3xs)',
    '9': 'var(--text-2xs)',
    '10': 'var(--text-xs)',
    '11': 'var(--text-xs)',
    '12': 'var(--text-sm)',
    '13': 'var(--text-sm)',
    '14': 'var(--text-base)',
    '15': 'var(--text-base)',
    '16': 'var(--text-lg)',
    '17': 'var(--text-lg)',
    '18': 'var(--text-lg)',
    '19': 'var(--text-xl)',
    '20': 'var(--text-xl)',
    '21': 'var(--text-xl)',
    '22': 'var(--text-2xl)',
    '24': 'var(--text-2xl)',
    '26': 'var(--text-3xl)',
    '28': 'var(--text-3xl)',
    '30': 'var(--text-3xl)',
    '32': 'var(--text-4xl)',
    '36': 'var(--text-4xl)',
    '40': 'var(--text-5xl)',
    '48': 'var(--text-5xl)'
  },

  // 扩展尺寸系统
  size: {
    '16': 'var(--size-xs)',
    '18': 'var(--size-sm)',
    '20': 'var(--size-sm)',
    '22': 'var(--size-md)',
    '24': 'var(--size-md)',
    '26': 'var(--size-lg)',
    '28': 'var(--size-lg)',
    '30': 'var(--size-xl)',
    '32': 'var(--size-xl)',
    '34': 'var(--size-2xl)',
    '36': 'var(--size-2xl)',
    '38': 'var(--size-3xl)',
    '40': 'var(--size-3xl)',
    '42': 'var(--size-4xl)',
    '44': 'var(--size-4xl)',
    '46': 'var(--size-5xl)',
    '48': 'var(--size-5xl)',
    '50': 'var(--size-6xl)',
    '52': 'var(--size-6xl)',
    '54': 'var(--size-7xl)',
    '56': 'var(--size-7xl)',
    '58': 'var(--size-8xl)',
    '60': 'var(--size-8xl)',
    '62': 'var(--size-9xl)',
    '64': 'var(--size-9xl)',
    '66': 'var(--size-10xl)',
    '68': 'var(--size-10xl)',
    '70': 'var(--size-11xl)',
    '72': 'var(--size-11xl)',
    '74': 'var(--size-12xl)',
    '76': 'var(--size-12xl)',
    '78': 'var(--size-13xl)',
    '80': 'var(--size-13xl)',
    '82': 'var(--size-14xl)',
    '84': 'var(--size-14xl)',
    '86': 'var(--size-15xl)',
    '88': 'var(--size-15xl)',
    '90': 'var(--size-16xl)',
    '92': 'var(--size-16xl)',
    '94': 'var(--size-17xl)',
    '96': 'var(--size-17xl)',
    '98': 'var(--size-18xl)',
    '100': 'var(--size-18xl)'
  }
};

// 高级修复规则
const ADVANCED_FIX_RULES = [
  // 特殊字体大小 - 处理10px、11px、15px等
  {
    name: 'special-font-size',
    pattern: /font-size:\s*(\d+(?:\.\d+)?)(px)/g,
    replacement: (match, value, unit) => {
      if (unit === 'px') {
        const token = EXTENDED_TOKENS.fontSize[value];
        if (token) {
          return `font-size: ${token}`;
        }
      }
      return match; // 保持原样
    },
    description: '特殊字体大小'
  },

  // 内联样式中的字体大小
  {
    name: 'inline-font-size',
    pattern: /style="([^"]*font-size:\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, value) => {
      const token = EXTENDED_TOKENS.fontSize[value];
      if (token) {
        return styleContent.replace(`font-size: ${value}px`, `font-size: ${token}`);
      }
      return match;
    },
    description: '内联字体大小'
  },

  // 内联样式中的尺寸属性 - 更积极的替换策略
  {
    name: 'inline-size-aggressive',
    pattern: /style="([^"]*(?:width|height|min-width|min-height|max-width|max-height):\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, value) => {
      const token = EXTENDED_TOKENS.size[value];
      if (token) {
        return styleContent.replace(new RegExp(`(?:width|height|min-width|min-height|max-width|max-height):\\s*${value}px`, 'g'), `$1: ${token}`);
      }
      return match;
    },
    description: '内联尺寸属性'
  },

  // 内联样式中的间距属性
  {
    name: 'inline-spacing-aggressive',
    pattern: /style="([^"]*(?:margin|padding)(?:-(?:top|right|bottom|left))?:\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, value) => {
      // 使用原始间距映射
      const spacingTokens = {
        '0': '0', '1': 'var(--spacing-xs)', '2': 'var(--spacing-xs)', '3': 'var(--spacing-xs)',
        '4': 'var(--spacing-sm)', '5': 'var(--spacing-sm)', '6': 'var(--spacing-sm)', '8': 'var(--spacing-md)',
        '10': 'var(--spacing-md)', '12': 'var(--spacing-md)', '14': 'var(--spacing-lg)', '16': 'var(--spacing-lg)',
        '18': 'var(--spacing-lg)', '20': 'var(--spacing-xl)', '24': 'var(--spacing-xl)', '28': 'var(--spacing-2xl)',
        '32': 'var(--spacing-2xl)', '36': 'var(--spacing-3xl)', '40': 'var(--spacing-3xl)', '48': 'var(--spacing-4xl)',
        '56': 'var(--spacing-4xl)', '64': 'var(--spacing-5xl)'
      };
      
      const token = spacingTokens[value];
      if (token) {
        return styleContent.replace(new RegExp(`(?:margin|padding)(?:-(?:top|right|bottom|left))?:\\s*${value}px`, 'g'), `$1: ${token}`);
      }
      return match;
    },
    description: '内联间距属性'
  },

  // 内联样式中的圆角属性
  {
    name: 'inline-border-radius',
    pattern: /style="([^"]*border-radius:\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, value) => {
      const radiusTokens = {
        '0': '0', '2': 'var(--radius-xs)', '3': 'var(--radius-xs)', '4': 'var(--radius-sm)',
        '6': 'var(--radius-sm)', '8': 'var(--radius-md)', '10': 'var(--radius-md)', '12': 'var(--radius-lg)',
        '16': 'var(--radius-lg)', '20': 'var(--radius-xl)', '24': 'var(--radius-2xl)'
      };
      
      const token = radiusTokens[value];
      if (token) {
        return styleContent.replace(`border-radius: ${value}px`, `border-radius: ${token}`);
      }
      return match;
    },
    description: '内联圆角属性'
  }
];

// 修复单个文件
function advancedFixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const fixes = [];

    ADVANCED_FIX_RULES.forEach(rule => {
      const originalContent = fixedContent;
      let matchCount = 0;

      fixedContent = fixedContent.replace(rule.pattern, (...args) => {
        matchCount++;
        return rule.replacement(...args);
      });

      if (matchCount > 0) {
        fixes.push({
          rule: rule.name,
          description: rule.description,
          count: matchCount
        });
      }
    });

    // 只有内容发生变化时才写入文件
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      return {
        filePath,
        fixed: true,
        fixes,
        originalSize: content.length,
        fixedSize: fixedContent.length
      };
    }

    return {
      filePath,
      fixed: false,
      fixes: [],
      originalSize: content.length,
      fixedSize: content.length
    };

  } catch (error) {
    console.error(`❌ 高级修复文件失败: ${filePath}`, error.message);
    return {
      filePath,
      fixed: false,
      error: error.message,
      fixes: []
    };
  }
}

// 批量高级修复
async function batchAdvancedFix(filePaths) {
  console.log('🔧 开始高级尺寸修复...\n');

  const results = [];
  let totalFixes = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      const result = advancedFixFile(filePath);
      results.push(result);

      if (result.error) {
        errorCount++;
        console.log(`❌ ${filePath}: ${result.error}`);
      } else if (result.fixed) {
        successCount++;
        totalFixes += result.fixes.reduce((sum, fix) => sum + fix.count, 0);
        console.log(`✅ ${filePath}: ${result.fixes.map(f => `${f.description}(${f.count})`).join(', ')}`);
      } else {
        console.log(`⚪ ${filePath}: 无需修复`);
      }
    } else {
      console.log(`⚠️ 文件不存在: ${filePath}`);
    }
  }

  console.log(`\n📊 高级修复完成:`);
  console.log(`   成功修复: ${successCount} 个文件`);
  console.log(`   修复失败: ${errorCount} 个文件`);
  console.log(`   总修复数: ${totalFixes} 处`);

  return results;
}

// 主函数
async function main() {
  console.log('🔧 高级尺寸修复工具 - 处理特殊字体大小和内联样式\n');

  try {
    // 从分析报告中读取需要修复的文件
    const analysisPath = './size-analysis-report.json';
    
    if (!fs.existsSync(analysisPath)) {
      console.error('❌ 请先运行 analyze-sizes.js 生成分析报告');
      process.exit(1);
    }

    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    const filesToFix = analysis.results
      .filter(result => result.totalIssues > 0)
      .map(result => result.filePath);

    if (filesToFix.length === 0) {
      console.log('✅ 没有需要修复的文件');
      return;
    }

    console.log(`📁 将高级修复 ${filesToFix.length} 个文件:`);
    filesToFix.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    console.log('\n⚠️ 高级修复将处理特殊字体大小和内联样式');
    console.log('💡 确保已创建备份\n');

    // 执行批量高级修复
    const results = await batchAdvancedFix(filesToFix);

    // 保存修复报告
    const reportPath = './advanced-size-fix-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        successCount: results.filter(r => r.fixed).length,
        errorCount: results.filter(r => r.error).length,
        totalFixes: results.reduce((sum, r) => 
          sum + r.fixes.reduce((s, f) => s + f.count, 0), 0)
      },
      results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细高级修复报告已保存到: ${reportPath}`);

  } catch (error) {
    console.error('❌ 高级修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { advancedFixFile, batchAdvancedFix, EXTENDED_TOKENS, ADVANCED_FIX_RULES };
