#!/usr/bin/env node

/**
 * 全局间距问题扫描工具
 * Global Spacing Issue Scanner
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

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

// 主函数
async function main() {
  console.log('🔍 开始全局扫描间距问题...\n');
  
  try {
    // 获取所有Vue文件
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() });
    
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件`);
    
    const results = [];
    let totalIssues = 0;
    let processedCount = 0;
    
    for (const file of vueFiles) {
      const result = analyzeFileSpacing(file);
      results.push(result);
      totalIssues += result.totalIssues;
      processedCount++;
      
      if (result.totalIssues > 0) {
        console.log(`📄 ${file}: ${result.totalIssues} 个间距问题`);
      }
      
      // 每处理100个文件显示进度
      if (processedCount % 100 === 0) {
        console.log(`📊 已处理: ${processedCount}/${vueFiles.length} 文件`);
      }
    }
    
    console.log(`\n📊 扫描完成:`);
    console.log(`   总文件数: ${results.length}`);
    console.log(`   总问题数: ${totalIssues}`);
    
    // 按问题数量排序
    const sortedResults = results
      .filter(r => r.totalIssues > 0)
      .sort((a, b) => b.totalIssues - a.totalIssues);
    
    if (sortedResults.length > 0) {
      console.log('\n🔥 问题最多的文件 (前20个):');
      sortedResults.slice(0, 20).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.filePath}: ${result.totalIssues} 个问题`);
      });
      
      // 分析问题模式
      const patternStats = {};
      sortedResults.forEach(result => {
        result.issues.forEach(issue => {
          const key = `${issue.type}-${issue.description}`;
          patternStats[key] = (patternStats[key] || 0) + 1;
        });
      });
      
      console.log('\n📊 问题类型统计:');
      Object.entries(patternStats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, count]) => {
          console.log(`  ${key}: ${count} 次`);
        });
    } else {
      console.log('\n✅ 恭喜！没有发现间距问题');
    }
    
    // 保存分析结果
    const analysisPath = './global-spacing-analysis.json';
    fs.writeFileSync(analysisPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalIssues,
        filesWithIssues: sortedResults.length
      },
      topIssues: sortedResults.slice(0, 50),
      patternStats: sortedResults.length > 0 ? patternStats : {}
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${analysisPath}`);
    
  } catch (error) {
    console.error('❌ 扫描过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeFileSpacing };