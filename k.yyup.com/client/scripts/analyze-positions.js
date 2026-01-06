#!/usr/bin/env node

/**
 * 位置问题手动检测工具
 * Manual Position Issue Detection Tool
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 检测单个文件的位置问题
function analyzeFilePositions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const issues = [];
    
    lines.forEach((line, lineIndex) => {
      // 检测各种位置模式
      const positionPatterns = [
        // position属性
        {
          pattern: /position:\s*(fixed|absolute|relative|static|sticky)/g,
          type: 'css-position',
          description: 'CSS定位属性'
        },
        // top属性
        {
          pattern: /top:\s*(-?\d+)px/g,
          type: 'css-top-px',
          description: 'CSS顶部位置'
        },
        // right属性
        {
          pattern: /right:\s*(-?\d+)px/g,
          type: 'css-right-px',
          description: 'CSS右侧位置'
        },
        // bottom属性
        {
          pattern: /bottom:\s*(-?\d+)px/g,
          type: 'css-bottom-px',
          description: 'CSS底部位置'
        },
        // left属性
        {
          pattern: /left:\s*(-?\d+)px/g,
          type: 'css-left-px',
          description: 'CSS左侧位置'
        },
        // z-index属性
        {
          pattern: /z-index:\s*(-?\d+)/g,
          type: 'css-z-index',
          description: 'CSS层级'
        },
        // transform属性
        {
          pattern: /transform:\s*[^;]*translate[X]?[^;]*\((-?\d+)px[^)]*\)/g,
          type: 'css-transform-translate',
          description: 'CSS变换位移'
        },
        // 内联样式中的位置
        {
          pattern: /style="[^"]*(?:position|top|right|bottom|left|z-index|transform):\s*[^"]*"/g,
          type: 'inline-position',
          description: '内联样式位置'
        },
        // 浮动属性
        {
          pattern: /float:\s*(left|right|none|inherit)/g,
          type: 'css-float',
          description: 'CSS浮动'
        },
        // 清除浮动
        {
          pattern: /clear:\s*(left|right|both|none|inherit)/g,
          type: 'css-clear',
          description: 'CSS清除浮动'
        },
        // 显示属性
        {
          pattern: /display:\s*(block|inline|inline-block|flex|grid|none|hidden)/g,
          type: 'css-display',
          description: 'CSS显示属性'
        },
        // 垂直对齐
        {
          pattern: /vertical-align:\s*(top|middle|bottom|baseline|sub|super|text-top|text-bottom|\d+%|\d+px)/g,
          type: 'css-vertical-align',
          description: 'CSS垂直对齐'
        },
        // 文本对齐
        {
          pattern: /text-align:\s*(left|right|center|justify|inherit)/g,
          type: 'css-text-align',
          description: 'CSS文本对齐'
        }
      ];
      
      positionPatterns.forEach(({ pattern, type, description }) => {
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

// 分析位置问题的不同模式
function analyzePositionPatterns(results) {
  console.log('\n🔍 === 位置问题模式分析 ===\n');
  
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
  console.log('📊 位置问题类型统计:');
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
  console.log('🔍 开始手动检测位置问题...\n');
  
  try {
    // 获取所有Vue文件
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() });
    
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件`);
    
    // 选择前20个文件进行检测
    const filesToAnalyze = vueFiles.slice(0, 20);
    
    console.log(`\n📦 检测文件列表 (前20个):`);
    filesToAnalyze.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    
    console.log('\n🔍 开始分析...\n');
    
    const results = [];
    let totalIssues = 0;
    
    for (const file of filesToAnalyze) {
      const result = analyzeFilePositions(file);
      results.push(result);
      totalIssues += result.totalIssues;
      
      if (result.totalIssues > 0) {
        console.log(`📄 ${file}: ${result.totalIssues} 个位置问题`);
      }
    }
    
    console.log(`\n📊 检测完成:`);
    console.log(`   检测文件数: ${results.length}`);
    console.log(`   总问题数: ${totalIssues}`);
    
    // 分析模式
    const { patternStats, examples } = analyzePositionPatterns(results);
    
    // 保存分析结果
    const analysisPath = './position-analysis-report.json';
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

export { analyzeFilePositions, analyzePositionPatterns };