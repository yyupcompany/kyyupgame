#!/usr/bin/env node

/**
 * 全局位置问题扫描工具
 * Global Position Issue Scanner
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

// 主函数
async function main() {
  console.log('🔍 开始全局扫描位置问题...\n');
  
  try {
    // 获取所有Vue文件
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() });
    
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件`);
    
    const results = [];
    let totalIssues = 0;
    let processedCount = 0;
    
    for (const file of vueFiles) {
      const result = analyzeFilePositions(file);
      results.push(result);
      totalIssues += result.totalIssues;
      processedCount++;
      
      if (result.totalIssues > 0) {
        console.log(`📄 ${file}: ${result.totalIssues} 个位置问题`);
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
    
    // 初始化patternStats
    const patternStats = {};
    
    if (sortedResults.length > 0) {
      console.log('\n🔥 问题最多的文件 (前20个):');
      sortedResults.slice(0, 20).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.filePath}: ${result.totalIssues} 个问题`);
      });
      
      // 分析问题模式
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
      console.log('\n✅ 恭喜！没有发现位置问题');
    }
    
    // 保存分析结果
    const analysisPath = './global-position-analysis.json';
    fs.writeFileSync(analysisPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalIssues,
        filesWithIssues: sortedResults.length
      },
      topIssues: sortedResults.slice(0, 50),
      patternStats: patternStats
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

export { analyzeFilePositions };