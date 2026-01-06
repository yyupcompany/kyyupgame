#!/usr/bin/env node

/**
 * 最终验证工具
 * Final Verification Tool
 * 验证除游戏外网站样式统一性
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 统计数据
let totalFiles = 0;
let totalColorIssues = 0;
let totalSizeIssues = 0;
let totalSpacingIssues = 0;
let totalPositionIssues = 0;
let gameFiles = [];

// 检测颜色问题
function detectColorIssues(content) {
  const colorPatterns = [
    /#[0-9a-fA-F]{3}\b/g,
    /#[0-9a-fA-F]{6}\b/g,
    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    /hsl\(/g,
    /hsla\(/g
  ];
  
  let issues = 0;
  colorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues += matches.length;
    }
  });
  
  return issues;
}

// 检测尺寸问题
function detectSizeIssues(content) {
  const sizePatterns = [
    /width:\s*\d+px/g,
    /height:\s*\d+px/g,
    /min-width:\s*\d+px/g,
    /max-width:\s*\d+px/g,
    /min-height:\s*\d+px/g,
    /max-height:\s*\d+px/g,
    /font-size:\s*\d+px/g,
    /border-width:\s*\d+px/g,
    /border-radius:\s*\d+px/g
  ];
  
  let issues = 0;
  sizePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues += matches.length;
    }
  });
  
  return issues;
}

// 检测间距问题
function detectSpacingIssues(content) {
  const spacingPatterns = [
    /margin:\s*\d+px/g,
    /padding:\s*\d+px/g,
    /margin-top:\s*\d+px/g,
    /margin-right:\s*\d+px/g,
    /margin-bottom:\s*\d+px/g,
    /margin-left:\s*\d+px/g,
    /padding-top:\s*\d+px/g,
    /padding-right:\s*\d+px/g,
    /padding-bottom:\s*\d+px/g,
    /padding-left:\s*\d+px/g,
    /gap:\s*\d+px/g
  ];
  
  let issues = 0;
  spacingPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues += matches.length;
    }
  });
  
  return issues;
}

// 检测位置问题
function detectPositionIssues(content) {
  const positionPatterns = [
    /top:\s*-?\d+px/g,
    /right:\s*-?\d+px/g,
    /bottom:\s*-?\d+px/g,
    /left:\s*-?\d+px/g,
    /z-index:\s*-?\d+/g,
    /transform:.*translate\(-?\d+px/g
  ];
  
  let issues = 0;
  positionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues += matches.length;
    }
  });
  
  return issues;
}

// 判断是否为游戏文件
function isGameFile(filePath) {
  const gameKeywords = [
    'games/play/',
    'games/components/',
    'assessment/games/',
    'parent-center/games/',
    'SpaceTreasure',
    'RobotFactory',
    'PrincessMemory',
    'PrincessGarden',
    'FruitSequence',
    'DollhouseTidy',
    'DinosaurMemory',
    'ColorSorting',
    'AnimalObserver',
    'MemoryGame',
    'LogicGame',
    'AttentionGame'
  ];
  
  return gameKeywords.some(keyword => filePath.includes(keyword));
}

// 分析单个文件
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const isGame = isGameFile(filePath);
    
    if (isGame) {
      gameFiles.push(filePath);
    }
    
    const colorIssues = detectColorIssues(content);
    const sizeIssues = detectSizeIssues(content);
    const spacingIssues = detectSpacingIssues(content);
    const positionIssues = detectPositionIssues(content);
    
    totalFiles++;
    
    if (!isGame) {
      totalColorIssues += colorIssues;
      totalSizeIssues += sizeIssues;
      totalSpacingIssues += spacingIssues;
      totalPositionIssues += positionIssues;
    }
    
    return {
      filePath,
      isGame,
      colorIssues,
      sizeIssues,
      spacingIssues,
      positionIssues,
      totalIssues: colorIssues + sizeIssues + spacingIssues + positionIssues
    };
    
  } catch (error) {
    console.error(`❌ 分析文件失败: ${filePath}`, error.message);
    return null;
  }
}

// 生成报告
function generateReport(allResults) {
  const nonGameResults = allResults.filter(r => r && !r.isGame);
  const gameResults = allResults.filter(r => r && r.isGame);
  
  // 按问题数量排序
  const sortedNonGame = nonGameResults
    .filter(r => r.totalIssues > 0)
    .sort((a, b) => b.totalIssues - a.totalIssues);
  
  const sortedGame = gameResults
    .filter(r => r.totalIssues > 0)
    .sort((a, b) => b.totalIssues - a.totalIssues);
  
  console.log('\n🎯 === 最终验证报告 ===\n');
  
  console.log('📊 总体统计:');
  console.log(`   总文件数: ${totalFiles}`);
  console.log(`   游戏文件数: ${gameFiles.length}`);
  console.log(`   非游戏文件数: ${totalFiles - gameFiles.length}`);
  
  console.log('\n🎨 颜色问题 (非游戏文件):');
  console.log(`   总问题数: ${totalColorIssues}`);
  console.log(`   平均每文件: ${(totalColorIssues / Math.max(1, totalFiles - gameFiles.length)).toFixed(2)}`);
  
  console.log('\n📏 尺寸问题 (非游戏文件):');
  console.log(`   总问题数: ${totalSizeIssues}`);
  console.log(`   平均每文件: ${(totalSizeIssues / Math.max(1, totalFiles - gameFiles.length)).toFixed(2)}`);
  
  console.log('\n📐 间距问题 (非游戏文件):');
  console.log(`   总问题数: ${totalSpacingIssues}`);
  console.log(`   平均每文件: ${(totalSpacingIssues / Math.max(1, totalFiles - gameFiles.length)).toFixed(2)}`);
  
  console.log('\n📍 位置问题 (非游戏文件):');
  console.log(`   总问题数: ${totalPositionIssues}`);
  console.log(`   平均每文件: ${(totalPositionIssues / Math.max(1, totalFiles - gameFiles.length)).toFixed(2)}`);
  
  const totalNonGameIssues = totalColorIssues + totalSizeIssues + totalSpacingIssues + totalPositionIssues;
  console.log(`\n🎯 非游戏文件总问题数: ${totalNonGameIssues}`);
  
  // 问题最多的非游戏文件
  if (sortedNonGame.length > 0) {
    console.log('\n🔥 问题最多的非游戏文件 (前10个):');
    sortedNonGame.slice(0, 10).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.filePath}: ${result.totalIssues} 个问题`);
      console.log(`     颜色: ${result.colorIssues}, 尺寸: ${result.sizeIssues}, 间距: ${result.spacingIssues}, 位置: ${result.positionIssues}`);
    });
  }
  
  // 游戏文件统计
  const totalGameIssues = gameResults.reduce((sum, r) => sum + r.totalIssues, 0);
  console.log(`\n🎮 游戏文件统计:`);
  console.log(`   游戏文件数: ${gameFiles.length}`);
  console.log(`   总问题数: ${totalGameIssues}`);
  
  if (sortedGame.length > 0) {
    console.log('\n🎮 游戏文件问题统计 (前5个):');
    sortedGame.slice(0, 5).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.filePath}: ${result.totalIssues} 个问题`);
    });
  }
  
  // 样式统一性评估
  console.log('\n🎯 === 样式统一性评估 ===\n');
  
  const designTokenUsage = calculateDesignTokenUsage();
  console.log(`📊 设计令牌使用率: ${designTokenUsage}%`);
  
  if (totalNonGameIssues === 0) {
    console.log('🎉 恭喜！非游戏文件已完全实现样式统一！');
  } else if (totalNonGameIssues < 100) {
    console.log('✅ 非游戏文件样式统一性良好，仅有少量问题需要修复');
  } else if (totalNonGameIssues < 500) {
    console.log('⚠️ 非游戏文件样式统一性一般，还有一些问题需要修复');
  } else {
    console.log('❌ 非游戏文件样式统一性较差，需要进一步优化');
  }
  
  return {
    summary: {
      totalFiles,
      gameFiles: gameFiles.length,
      nonGameFiles: totalFiles - gameFiles.length,
      totalNonGameIssues,
      totalGameIssues,
      designTokenUsage
    },
    topNonGameIssues: sortedNonGame.slice(0, 20),
    topGameIssues: sortedGame.slice(0, 10)
  };
}

// 计算设计令牌使用率
function calculateDesignTokenUsage() {
  try {
    // 随机抽样检查设计令牌使用情况
    const sampleFiles = [];
    const allFiles = fs.readdirSync('./src', { recursive: true })
      .filter(file => file.endsWith('.vue'))
      .slice(0, 50); // 取前50个文件作为样本
    
    let tokenUsageCount = 0;
    let totalStyleCount = 0;
    
    allFiles.forEach(file => {
      try {
        const content = fs.readFileSync(`./src/${file}`, 'utf8');
        
        // 统计设计令牌使用
        const tokenMatches = content.match(/var\(--[a-zA-Z0-9-]+\)/g) || [];
        tokenUsageCount += tokenMatches.length;
        
        // 统计总样式属性
        const styleMatches = content.match(/[a-zA-Z-]+:\s*[^;]+/g) || [];
        totalStyleCount += styleMatches.length;
      } catch (error) {
        // 忽略读取错误
      }
    });
    
    return totalStyleCount > 0 ? Math.round((tokenUsageCount / totalStyleCount) * 100) : 0;
  } catch (error) {
    return 0;
  }
}

// 主函数
async function main() {
  console.log('🔍 开始最终验证...\n');
  
  try {
    // 获取所有Vue文件
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() });
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);
    
    const allResults = [];
    let processedCount = 0;
    
    for (const file of vueFiles) {
      const result = analyzeFile(file);
      if (result) {
        allResults.push(result);
      }
      
      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`📊 已处理: ${processedCount}/${vueFiles.length} 文件`);
      }
    }
    
    console.log(`\n📊 分析完成，共处理 ${processedCount} 个文件\n`);
    
    // 生成报告
    const report = generateReport(allResults);
    
    // 保存报告
    const reportPath = './final-verification-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      ...report
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeFile, generateReport };