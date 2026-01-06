#!/usr/bin/env node

/**
 * 尺寸问题手动检测工具
 * Manual Size Issue Detection Tool
 */

import fs from 'fs';
import path from 'path';

// 从扫描报告中获取高问题文件
const HIGH_ISSUE_FILES = [
  'src/components/ai-assistant/panels/RightSidebar.vue',
  'src/components/ai-assistant/input/InputArea.vue',
  'src/pages/dashboard/EnterpriseDashboard.vue',
  'src/pages/parent-center/games/play/PrincessGarden.vue',
  'src/components/common/MarkdownRenderer.vue',
  'src/pages/parent-center/games/play/PrincessMemory.vue',
  'src/pages/parent-center/games/play/DinosaurMemory.vue',
  'src/pages/parent-center/games/play/RobotFactory.vue',
  'src/pages/parent-center/games/play/AnimalObserver.vue',
  'src/pages/parent-center/games/play/SpaceTreasure.vue',
  'src/pages/parent-center/games/play/ColorSorting.vue',
  'src/pages/parent-center/games/play/DollhouseTidy.vue',
  'src/pages/parent-center/games/play/PrincessMemory.vue',
  'src/pages/parent-center/games/play/AnimalObserver.vue',
  'src/pages/parent-center/games/play/SpaceTreasure.vue',
  'src/pages/parent-center/games/play/ColorSorting.vue',
  'src/pages/parent-center/games/play/DollhouseTidy.vue'
];

// 检测单个文件的尺寸问题
function analyzeFileSizes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const issues = [];
    
    lines.forEach((line, lineIndex) => {
      // 检测各种尺寸模式
      const sizePatterns = [
        // CSS尺寸属性
        {
          pattern: /(?:width|height|min-width|min-height|max-width|max-height):\s*(\d+)px/g,
          type: 'css-size-px',
          description: 'CSS尺寸属性'
        },
        // 间距属性
        {
          pattern: /(?:margin|padding):\s*(\d+)px/g,
          type: 'css-spacing-px',
          description: 'CSS间距属性'
        },
        // 位置属性
        {
          pattern: /(?:top|right|bottom|left):\s*(\d+)px/g,
          type: 'css-position',
          description: 'CSS位置属性'
        },
        // 圆角属性
        {
          pattern: /border-radius:\s*(\d+)px/g,
          type: 'css-border-radius',
          description: 'CSS圆角属性'
        },
        // 字体大小
        {
          pattern: /font-size:\s*(\d+(?:\.\d+)?(?:px|rem|em))/g,
          type: 'css-font-size',
          description: 'CSS字体大小'
        },
        // 间隙
        {
          pattern: /gap:\s*(\d+)px/g,
          type: 'css-gap',
          description: 'CSS间隙属性'
        },
        // 行高
        {
          pattern: /line-height:\s*(\d+(?:\.\d+)?)/g,
          type: 'css-line-height',
          description: 'CSS行高'
        },
        // 内联样式中的尺寸
        {
          pattern: /(?:width|height|margin|padding|font-size):\s*(\d+)px/g,
          type: 'inline-size-px',
          description: '内联样式尺寸'
        },
        // 特殊：min-height: 56px
        {
          pattern: /min-height:\s*(\d+)px/g,
          type: 'css-min-height',
          description: 'CSS最小高度'
        }
      ];
      
      sizePatterns.forEach(({ pattern, type, description }) => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          issues.push({
            line: lineIndex + 1,
            column: match.index + 1,
            match: match[0],
            type,
            description,
            context: line.trim()
          });
        }
      });
    });
    
    return {
      filePath,
      totalIssues: issues.length,
      issues
    };
    
  } catch (error) {
    console.error(`❌ 分析文件失败: ${filePath}`, error.message);
    return { filePath, totalIssues: 0, issues: [] };
  }
}

// 分析尺寸问题的不同模式
function analyzeSizePatterns(results) {
  console.log('\n🔍 === 尺寸问题模式分析 ===\n');
  
  const patternStats = {};
  const examples = {};
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const key = `${issue.type}-${issue.description}`;
      patternStats[key] = (patternStats[key] || 0) + 1;
      
      if (!examples[key] || examples[key].length < 3) {
        examples[key] = examples[key] || [];
        examples[key].push({
          file: result.filePath,
          line: issue.line,
          context: issue.context
        });
      }
    });
  });
  
  // 输出统计
  console.log('📊 尺寸问题类型统计:');
  Object.entries(patternStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      console.log(`  ${key}: ${count} 次`);
    });
  
  // 输出示例
  console.log('\n📋 典见模式示例:');
  Object.entries(examples).forEach(([key, examples]) => {
    console.log(`\n🔹 ${key}:`);
    examples.forEach(example => {
      console.log(`   ${example.file}:${example.line} - ${example.context}`);
    });
  });
  
  return { patternStats, examples };
}

// 主函数
async function main() {
  console.log('🔍 开始手动检测尺寸问题...\n');
  
  try {
    // 选择要检测的文件
    const filesToAnalyze = HIGH_ISSUE_FILES.slice(0, 20);
    
    console.log(`📁 检测文件列表:`);
    filesToAnalyze.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    
    console.log('\n🔍 开始分析...\n');
    
    const results = [];
    let totalIssues = 0;
    
    for (const file of filesToAnalyze) {
      if (fs.existsSync(file)) {
        const result = analyzeFileSizes(file);
        results.push(result);
        totalIssues += result.totalIssues;
        
        if (result.totalIssues > 0) {
          console.log(`📄 ${result.filePath}: ${result.totalIssues} 个尺寸问题`);
        }
      } else {
        console.log(`⚠️ 文件不存在: ${file}`);
      }
    }
    
    console.log(`\n📊 检测完成:`);
    console.log(`   检测文件数: ${results.length}`);
    console.log(`   总问题数: ${totalIssues}`);
    
    // 分析模式
    const { patternStats, examples } = analyzeSizePatterns(results);
    
    // 保存分析结果
    const analysisPath = './size-analysis-report.json';
    fs.writeFileSync(analysisPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalIssues,
        patternStats,
        examples
      },
      results
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${analysisPath}`);
    
  } catch (error) {
    console.error('❌ 检测过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeFileSizes, analyzeSizePatterns };