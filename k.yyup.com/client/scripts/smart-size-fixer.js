#!/usr/bin/env node

/**
 * 智能尺寸修复脚本
 * Smart Size Fixer Script
 * 
 * 基于分析结果创建针对性的修复策略
 */

import fs from 'fs';
import path from 'path';

// 设计令牌映射表
const DESIGN_TOKENS = {
  // 间距系统
  spacing: {
    '0': '0',
    '1': 'var(--spacing-xs)',
    '2': 'var(--spacing-xs)', 
    '3': 'var(--spacing-xs)',
    '4': 'var(--spacing-sm)',
    '5': 'var(--spacing-sm)',
    '6': 'var(--spacing-sm)',
    '8': 'var(--spacing-md)',
    '10': 'var(--spacing-md)',
    '12': 'var(--spacing-md)',
    '14': 'var(--spacing-lg)',
    '16': 'var(--spacing-lg)',
    '18': 'var(--spacing-lg)',
    '20': 'var(--spacing-xl)',
    '24': 'var(--spacing-xl)',
    '28': 'var(--spacing-2xl)',
    '32': 'var(--spacing-2xl)',
    '36': 'var(--spacing-3xl)',
    '40': 'var(--spacing-3xl)',
    '48': 'var(--spacing-4xl)',
    '56': 'var(--spacing-4xl)',
    '64': 'var(--spacing-5xl)'
  },

  // 圆角系统
  borderRadius: {
    '0': '0',
    '2': 'var(--radius-xs)',
    '3': 'var(--radius-xs)',
    '4': 'var(--radius-sm)',
    '6': 'var(--radius-sm)',
    '8': 'var(--radius-md)',
    '10': 'var(--radius-md)',
    '12': 'var(--radius-lg)',
    '16': 'var(--radius-lg)',
    '20': 'var(--radius-xl)',
    '24': 'var(--radius-2xl)'
  },

  // 字体大小系统
  fontSize: {
    '10': 'var(--text-xs)',
    '11': 'var(--text-xs)',
    '12': 'var(--text-sm)',
    '13': 'var(--text-sm)',
    '14': 'var(--text-base)',
    '15': 'var(--text-base)',
    '16': 'var(--text-lg)',
    '18': 'var(--text-lg)',
    '20': 'var(--text-xl)',
    '22': 'var(--text-xl)',
    '24': 'var(--text-2xl)',
    '28': 'var(--text-2xl)',
    '30': 'var(--text-3xl)',
    '32': 'var(--text-3xl)',
    '36': 'var(--text-4xl)',
    '40': 'var(--text-4xl)',
    '48': 'var(--text-5xl)'
  },

  // 尺寸系统（width/height）
  size: {
    '20': 'var(--size-xs)',
    '24': 'var(--size-sm)',
    '28': 'var(--size-md)',
    '32': 'var(--size-md)',
    '36': 'var(--size-lg)',
    '40': 'var(--size-lg)',
    '44': 'var(--size-xl)',
    '48': 'var(--size-xl)',
    '56': 'var(--size-2xl)',
    '64': 'var(--size-2xl)',
    '72': 'var(--size-3xl)',
    '80': 'var(--size-3xl)',
    '96': 'var(--size-4xl)',
    '112': 'var(--size-4xl)',
    '128': 'var(--size-5xl)',
    '144': 'var(--size-5xl)',
    '160': 'var(--size-6xl)',
    '176': 'var(--size-6xl)',
    '192': 'var(--size-7xl)',
    '208': 'var(--size-7xl)',
    '224': 'var(--size-8xl)',
    '240': 'var(--size-8xl)',
    '256': 'var(--size-9xl)',
    '288': 'var(--size-9xl)',
    '320': 'var(--size-10xl)',
    '360': 'var(--size-10xl)',
    '384': 'var(--size-11xl)',
    '420': 'var(--size-11xl)',
    '448': 'var(--size-12xl)',
    '480': 'var(--size-12xl)',
    '512': 'var(--size-13xl)',
    '576': 'var(--size-13xl)',
    '640': 'var(--size-14xl)',
    '720': 'var(--size-14xl)',
    '768': 'var(--size-15xl)',
    '864': 'var(--size-15xl)',
    '960': 'var(--size-16xl)',
    '1080': 'var(--size-16xl)'
  },

  // 间隙系统
  gap: {
    '2': 'var(--gap-xs)',
    '4': 'var(--gap-sm)',
    '6': 'var(--gap-md)',
    '8': 'var(--gap-lg)',
    '10': 'var(--gap-xl)',
    '12': 'var(--gap-2xl)',
    '16': 'var(--gap-3xl)',
    '20': 'var(--gap-4xl)',
    '24': 'var(--gap-5xl)'
  },

  // 行高系统
  lineHeight: {
    '1': '1',
    '1.2': 'var(--line-height-tight)',
    '1.3': 'var(--line-height-snug)',
    '1.4': 'var(--line-height-normal)',
    '1.5': 'var(--line-height-relaxed)',
    '1.6': 'var(--line-height-loose)',
    '2': 'var(--line-height-loose)'
  }
};

// 修复规则配置
const FIX_RULES = [
  // CSS尺寸属性
  {
    name: 'css-size-px',
    pattern: /(?:width|height|min-width|min-height|max-width|max-height):\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.size[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS尺寸属性'
  },

  // CSS间距属性
  {
    name: 'css-spacing-px',
    pattern: /(?:margin|padding)(?:-(?:top|right|bottom|left))?:\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.spacing[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS间距属性'
  },

  // CSS位置属性
  {
    name: 'css-position',
    pattern: /(?:top|right|bottom|left):\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.spacing[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS位置属性'
  },

  // CSS圆角属性
  {
    name: 'css-border-radius',
    pattern: /border-radius:\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.borderRadius[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS圆角属性'
  },

  // CSS字体大小
  {
    name: 'css-font-size',
    pattern: /font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)/g,
    replacement: (match, property, value, unit) => {
      // 只处理px单位
      if (unit === 'px') {
        const token = DESIGN_TOKENS.fontSize[value] || `${value}${unit}`;
        return `${property}: ${token}`;
      }
      return match;
    },
    description: 'CSS字体大小'
  },

  // CSS间隙属性
  {
    name: 'css-gap',
    pattern: /gap:\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.gap[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS间隙属性'
  },

  // CSS行高
  {
    name: 'css-line-height',
    pattern: /line-height:\s*(\d+(?:\.\d+)?)/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.lineHeight[value] || value;
      return `${property}: ${token}`;
    },
    description: 'CSS行高'
  },

  // CSS最小高度
  {
    name: 'css-min-height',
    pattern: /min-height:\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = DESIGN_TOKENS.size[value] || `${value}px`;
      return `${property}: ${token}`;
    },
    description: 'CSS最小高度'
  },

  // 内联样式尺寸（谨慎处理）
  {
    name: 'inline-size-px',
    pattern: /style="([^"]*(?:width|height|margin|padding|font-size):\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, property, value) => {
      // 内联样式修复策略：只替换常见的合理值
      const reasonableValues = ['20', '24', '28', '32', '36', '40', '44', '48'];
      if (reasonableValues.includes(value)) {
        let token;
        if (property.includes('width') || property.includes('height')) {
          token = DESIGN_TOKENS.size[value] || `${value}px`;
        } else if (property.includes('margin') || property.includes('padding')) {
          token = DESIGN_TOKENS.spacing[value] || `${value}px`;
        } else if (property.includes('font-size')) {
          token = DESIGN_TOKENS.fontSize[value] || `${value}px`;
        } else {
          token = `${value}px`;
        }
        return styleContent.replace(`${property}: ${value}px`, `${property}: ${token}`);
      }
      return match;
    },
    description: '内联样式尺寸'
  }
];

// 修复单个文件
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const fixes = [];

    FIX_RULES.forEach(rule => {
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
    console.error(`❌ 修复文件失败: ${filePath}`, error.message);
    return {
      filePath,
      fixed: false,
      error: error.message,
      fixes: []
    };
  }
}

// 批量修复文件
async function batchFixFiles(filePaths) {
  console.log('🔧 开始批量修复...\n');

  const results = [];
  let totalFixes = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      const result = fixFile(filePath);
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

  console.log(`\n📊 修复完成:`);
  console.log(`   成功修复: ${successCount} 个文件`);
  console.log(`   修复失败: ${errorCount} 个文件`);
  console.log(`   总修复数: ${totalFixes} 处`);

  return results;
}

// 主函数
async function main() {
  console.log('🔧 智能尺寸修复工具\n');

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

    console.log(`📁 将修复 ${filesToFix.length} 个文件:`);
    filesToFix.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    console.log('\n⚠️ 修复前请确保已创建备份！');
    console.log('💡 建议先运行: node scripts/backup-system.js\n');

    // 询问是否继续
    // 在实际使用中，可以添加用户确认逻辑

    // 执行批量修复
    const results = await batchFixFiles(filesToFix);

    // 保存修复报告
    const reportPath = './size-fix-report.json';
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
    console.log(`\n📄 详细修复报告已保存到: ${reportPath}`);

  } catch (error) {
    console.error('❌ 修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFile, batchFixFiles, DESIGN_TOKENS, FIX_RULES };
