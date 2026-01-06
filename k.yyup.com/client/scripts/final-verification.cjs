#!/usr/bin/env node

/**
 * 最终验证脚本 - 检查颜色替换完成度
 * Final Verification Script - Check Color Replacement Completion
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 颜色检测正则表达式
const COLOR_PATTERNS = [
  // 十六进制颜色
  /#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g,
  /#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g,
  // RGB/RGBA颜色
  /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g,
  // HSL/HSLA颜色
  /hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)/g
];

// 需要排除的文件和目录
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.git/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  'scripts/**',
  'public/**'
];

// 特殊处理的组件（IME相关）
const IME_COMPONENTS = [
  'MarkdownRenderer.vue',
  'InputArea.vue',
  'input/**',
  'editor/**'
];

// 统计结果
let stats = {
  totalFiles: 0,
  filesWithColors: 0,
  totalColors: 0,
  filesWithDesignTokens: 0,
  filesWithMixedColors: 0,
  filesWithHardcodedColors: 0,
  imeComponentFiles: 0,
  imeComponentIssues: 0
};

/**
 * 检查文件是否包含设计令牌
 */
function hasDesignTokens(content) {
  const tokenPatterns = [
    /var\(--[a-zA-Z][a-zA-Z0-9-]*\)/g,
    /--[a-zA-Z][a-zA-Z0-9-]*:/g,
    /\$[a-zA-Z][a-zA-Z0-9-]*:/g
  ];
  
  return tokenPatterns.some(pattern => pattern.test(content));
}

/**
 * 检查文件是否为IME相关组件
 */
function isIMEComponent(filePath) {
  return IME_COMPONENTS.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filePath);
  });
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const isIME = isIMEComponent(filePath);
    
    // 检测硬编码颜色
    const hardcodedColors = [];
    COLOR_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // 排除注释中的颜色
        const lineStart = content.lastIndexOf('\n', match.index);
        const lineEnd = content.indexOf('\n', match.index);
        const line = content.substring(lineStart + 1, lineEnd || content.length);
        
        if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
          hardcodedColors.push({
            color: match[0],
            line: content.substring(0, match.index).split('\n').length,
            context: line.trim()
          });
        }
      }
    });

    // 检测设计令牌
    const hasTokens = hasDesignTokens(content);
    
    // 更新统计
    stats.totalFiles++;
    
    if (hardcodedColors.length > 0) {
      stats.filesWithColors++;
      stats.totalColors += hardcodedColors.length;
      
      if (hasTokens) {
        stats.filesWithMixedColors++;
      } else {
        stats.filesWithHardcodedColors++;
      }
    }
    
    if (hasTokens) {
      stats.filesWithDesignTokens++;
    }
    
    if (isIME) {
      stats.imeComponentFiles++;
      if (hardcodedColors.length > 0) {
        stats.imeComponentIssues++;
      }
    }
    
    return {
      filePath,
      isIME,
      hardcodedColors,
      hasTokens,
      needsAttention: hardcodedColors.length > 0 && !hasTokens
    };
    
  } catch (error) {
    console.error(`❌ 分析文件失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 生成验证报告
 */
function generateReport(results) {
  console.log('\n🔍 === 颜色替换最终验证报告 ===\n');
  
  // 总体统计
  console.log('📊 总体统计:');
  console.log(`   总文件数: ${stats.totalFiles}`);
  console.log(`   包含颜色的文件数: ${stats.filesWithColors}`);
  console.log(`   硬编码颜色总数: ${stats.totalColors}`);
  console.log(`   使用设计令牌的文件数: ${stats.filesWithDesignTokens}`);
  console.log(`   混合使用（硬编码+令牌）的文件数: ${stats.filesWithMixedColors}`);
  console.log(`   纯硬编码颜色的文件数: ${stats.filesWithHardcodedColors}`);
  
  // IME组件统计
  console.log('\n🎯 IME相关组件统计:');
  console.log(`   IME组件文件数: ${stats.imeComponentFiles}`);
  console.log(`   有问题的IME组件数: ${stats.imeComponentIssues}`);
  
  // 完成度计算
  const completionRate = ((stats.filesWithDesignTokens / stats.totalFiles) * 100).toFixed(2);
  const colorReplacementRate = stats.totalColors > 0 ? 
    ((stats.totalColors - stats.filesWithHardcodedColors * 2) / stats.totalColors * 100).toFixed(2) : 100;
  
  console.log('\n📈 完成度分析:');
  console.log(`   设计令牌使用率: ${completionRate}%`);
  console.log(`   颜色替换完成度: ${colorReplacementRate}%`);
  
  // 问题文件列表
  const problemFiles = results.filter(r => r && r.needsAttention);
  const imeProblemFiles = results.filter(r => r && r.isIME && r.hardcodedColors.length > 0);
  
  if (problemFiles.length > 0) {
    console.log('\n⚠️ 需要关注的文件:');
    problemFiles.slice(0, 10).forEach(file => {
      console.log(`   📁 ${file.filePath}`);
      file.hardcodedColors.slice(0, 3).forEach(color => {
        console.log(`      - 第${color.line}行: ${color.color} (${color.context.substring(0, 50)}...)`);
      });
    });
    
    if (problemFiles.length > 10) {
      console.log(`   ... 还有 ${problemFiles.length - 10} 个文件需要处理`);
    }
  }
  
  if (imeProblemFiles.length > 0) {
    console.log('\n🔧 IME组件需要修复:');
    imeProblemFiles.forEach(file => {
      console.log(`   📝 ${file.filePath}`);
      file.hardcodedColors.forEach(color => {
        console.log(`      - 第${color.line}行: ${color.color} → 建议替换为设计令牌`);
      });
    });
  }
  
  // 总结和建议
  console.log('\n💡 总结和建议:');
  
  if (stats.filesWithHardcodedColors === 0 && stats.imeComponentIssues === 0) {
    console.log('   ✅ 恭喜！所有颜色已成功替换为设计令牌');
    console.log('   ✅ IME组件颜色处理完成');
    console.log('   🎉 颜色系统重构任务圆满完成！');
  } else {
    if (stats.filesWithHardcodedColors > 0) {
      console.log(`   ⚠️ 还有 ${stats.filesWithHardcodedColors} 个文件需要处理硬编码颜色`);
    }
    
    if (stats.imeComponentIssues > 0) {
      console.log(`   🔧 优先处理 ${stats.imeComponentIssues} 个IME组件的颜色问题`);
    }
    
    if (colorReplacementRate > 90) {
      console.log('   🟢 颜色替换接近完成，建议处理剩余问题文件');
    } else if (colorReplacementRate > 70) {
      console.log('   🟡 颜色替换进展良好，需要继续处理问题文件');
    } else {
      console.log('   🔴 颜色替换还需要大量工作');
    }
  }
  
  return {
    completionRate: parseFloat(completionRate),
    colorReplacementRate: parseFloat(colorReplacementRate),
    isComplete: stats.filesWithHardcodedColors === 0 && stats.imeComponentIssues === 0
  };
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始最终验证...\n');
  
  try {
    // 查找所有Vue文件
    const vueFiles = glob.sync('**/*.vue', { 
      cwd: process.cwd(),
      ignore: EXCLUDE_PATTERNS 
    });
    
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);
    
    // 分析所有文件
    const results = [];
    for (const file of vueFiles) {
      const result = analyzeFile(file);
      if (result) {
        results.push(result);
      }
    }
    
    // 生成报告
    const report = generateReport(results);
    
    // 保存详细报告
    const reportPath = path.join(process.cwd(), 'color-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      results: results.filter(r => r && (r.hardcodedColors.length > 0 || r.isIME)),
      report
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    // 退出码
    process.exit(report.isComplete ? 0 : 1);
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, generateReport };
