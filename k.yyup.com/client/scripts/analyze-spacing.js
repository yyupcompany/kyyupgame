#!/usr/bin/env node

/**
 * 间距问题手动检测工具
 * Manual Spacing Issue Detection Tool
 */

import fs from 'fs';
import path from 'path';

// 从尺寸分析报告中获取高问题文件
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
  'src/pages/parent-center/games/play/DollhouseTidy.vue',
  'src/pages/parent/ParentStatistics.vue',
  'src/pages/parent-center/games/play/FruitPicking.vue',
  'src/pages/parent-center/games/play/CarRacing.vue'
];

// 检测单个文件的间距问题
function analyzeFileSpacing(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const issues = [];
    
    lines.forEach((line, lineIndex) => {
      // 检测各种间距模式
      const spacingPatterns = [
        // margin属性
        {
          pattern: /margin:\s*(\d+)px/g,
          type: 'css-margin-px',
          description: 'CSS外边距'
        },
        // padding属性
        {
          pattern: /padding:\s*(\d+)px/g,
          type: 'css-padding-px',
          description: 'CSS内边距'
        },
        // margin-top
        {
          pattern: /margin-top:\s*(\d+)px/g,
          type: 'css-margin-top',
          description: 'CSS上外边距'
        },
        // margin-right
        {
          pattern: /margin-right:\s*(\d+)px/g,
          type: 'css-margin-right',
          description: 'CSS右外边距'
        },
        // margin-bottom
        {
          pattern: /margin-bottom:\s*(\d+)px/g,
          type: 'css-margin-bottom',
          description: 'CSS下外边距'
        },
        // margin-left
        {
          pattern: /margin-left:\s*(\d+)px/g,
          type: 'css-margin-left',
          description: 'CSS左外边距'
        },
        // padding-top
        {
          pattern: /padding-top:\s*(\d+)px/g,
          type: 'css-padding-top',
          description: 'CSS上内边距'
        },
        // padding-right
        {
          pattern: /padding-right:\s*(\d+)px/g,
          type: 'css-padding-right',
          description: 'CSS右内边距'
        },
        // padding-bottom
        {
          pattern: /padding-bottom:\s*(\d+)px/g,
          type: 'css-padding-bottom',
          description: 'CSS下内边距'
        },
        // padding-left
        {
          pattern: /padding-left:\s*(\d+)px/g,
          type: 'css-padding-left',
          description: 'CSS左内边距'
        },
        // gap属性
        {
          pattern: /gap:\s*(\d+)px/g,
          type: 'css-gap-px',
          description: 'CSS间隙'
        },
        // row-gap
        {
          pattern: /row-gap:\s*(\d+)px/g,
          type: 'css-row-gap',
          description: 'CSS行间隙'
        },
        // column-gap
        {
          pattern: /column-gap:\s*(\d+)px/g,
          type: 'css-column-gap',
          description: 'CSS列间隙'
        },
        // 内联样式中的间距
        {
          pattern: /style="[^"]*(?:margin|padding):\s*(\d+)px[^"]*"/g,
          type: 'inline-spacing',
          description: '内联样式间距'
        }
      ];
      
      spacingPatterns.forEach(({ pattern, type, description }) => {
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

// 分析间距问题的不同模式
function analyzeSpacingPatterns(results) {
  console.log('\n🔍 === 间距问题模式分析 ===\n');
  
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
  console.log('📊 间距问题类型统计:');
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
  console.log('🔍 开始手动检测间距问题...\n');
  
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
        const result = analyzeFileSpacing(file);
        results.push(result);
        totalIssues += result.totalIssues;
        
        if (result.totalIssues > 0) {
          console.log(`📄 ${result.filePath}: ${result.totalIssues} 个间距问题`);
        }
      } else {
        console.log(`⚠️ 文件不存在: ${file}`);
      }
    }
    
    console.log(`\n📊 检测完成:`);
    console.log(`   检测文件数: ${results.length}`);
    console.log(`   总问题数: ${totalIssues}`);
    
    // 分析模式
    const { patternStats, examples } = analyzeSpacingPatterns(results);
    
    // 保存分析结果
    const analysisPath = './spacing-analysis-report.json';
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

export { analyzeFileSpacing, analyzeSpacingPatterns };