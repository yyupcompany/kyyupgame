#!/usr/bin/env node

/**
 * 批次颜色修复脚本 - 指定批次范围
 * Batch Color Fixer - Specify Batch Range
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { execSync } from 'child_process';

// 导入颜色映射和规则
import { COLOR_MAPPINGS, COLOR_FIX_RULES } from './comprehensive-color-fixer.js';

// 游戏文件检测
function isGameFile(filePath) {
  const gamePatterns = [
    '/games/',
    '/game-',
    'play/',
    'Princess',
    'Dinosaur',
    'Robot',
    'Animal',
    'Space',
    'ColorSorting',
    'Dollhouse',
    'Memory'
  ];
  
  return gamePatterns.some(pattern => filePath.includes(pattern));
}

// 修复单个文件的颜色
function fixFileColors(filePath) {
  try {
    if (isGameFile(filePath)) {
      return {
        filePath,
        fixed: false,
        skipped: true,
        reason: '游戏文件，跳过修复',
        fixes: []
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const fixes = [];

    COLOR_FIX_RULES.forEach(rule => {
      const originalContent = fixedContent;
      let matchCount = 0;

      fixedContent = fixedContent.replace(rule.pattern, (...args) => {
        const replacement = rule.replacement(...args);
        if (replacement !== args[0]) {
          matchCount++;
        }
        return replacement;
      });

      if (matchCount > 0) {
        fixes.push({
          rule: rule.name,
          description: rule.description,
          count: matchCount
        });
      }
    });

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
      fixedSize: fixedContent.length
    };

  } catch (error) {
    console.error(`❌ 修复文件颜色失败: ${filePath}`, error.message);
    return {
      filePath,
      fixed: false,
      error: error.message,
      fixes: []
    };
  }
}

// 获取问题文件列表
function getProblemFiles() {
  const reportPath = './hardcoded-styles-report.json';
  
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return report.files
      .filter(file => file.issueCount > 0)
      .map(file => file.file)
      .filter(file => !isGameFile(file))
      .sort();
  }
  
  const vueFiles = globSync('src/**/**/*.vue', { cwd: process.cwd() });
  return vueFiles
    .filter(file => !isGameFile(file))
    .map(file => path.join(process.cwd(), file));
}

// 批量修复指定范围
async function batchFixRange(startIndex, batchSize) {
  console.log(`🎨 开始批量修复颜色 (范围: ${startIndex}-${startIndex + batchSize - 1})...\n`);

  const problemFiles = getProblemFiles();
  const endIndex = Math.min(startIndex + batchSize, problemFiles.length);
  const filesToProcess = problemFiles.slice(startIndex, endIndex);

  const results = [];
  let totalFixes = 0;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const filePath of filesToProcess) {
    const result = fixFileColors(filePath);
    results.push(result);

    if (result.error) {
      errorCount++;
      console.log(`❌ ${filePath}: ${result.error}`);
    } else if (result.skipped) {
      skippedCount++;
      console.log(`⚪ ${filePath}: ${result.reason}`);
    } else if (result.fixed) {
      successCount++;
      totalFixes += result.fixes.reduce((sum, fix) => sum + fix.count, 0);
      console.log(`✅ ${filePath}: ${result.fixes.map(f => `${f.description}(${f.count})`).join(', ')}`);
    } else {
      console.log(`⚪ ${filePath}: 无需修复`);
    }
  }

  console.log(`\n📊 批次修复完成:`);
  console.log(`   处理文件: ${filesToProcess.length} 个`);
  console.log(`   成功修复: ${successCount} 个`);
  console.log(`   修复失败: ${errorCount} 个`);
  console.log(`   跳过文件: ${skippedCount} 个`);
  console.log(`   总修复数: ${totalFixes} 处`);

  return {
    results,
    totalFixes,
    successCount,
    errorCount,
    skippedCount,
    processedCount: filesToProcess.length,
    startIndex,
    endIndex,
    remainingCount: Math.max(0, problemFiles.length - endIndex)
  };
}

// 编译验证
async function compileVerify() {
  console.log('\n🔨 开始编译验证...');
  
  try {
    const result = execSync('npm run build', { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    console.log('✅ 编译成功');
    return { success: true, output: result };
  } catch (error) {
    console.log('❌ 编译失败');
    console.log('错误信息:', error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const batchSize = parseInt(args[1]) || 20;

  console.log(`🎨 批次颜色修复工具`);
  console.log(`📍 起始索引: ${startIndex}, 批次大小: ${batchSize}\n`);

  try {
    const batchResult = await batchFixRange(startIndex, batchSize);
    
    // 编译验证
    const compileResult = await compileVerify();
    
    // 保存批次报告
    const batchReport = {
      startIndex,
      batchSize,
      processedCount: batchResult.processedCount,
      totalFixes: batchResult.totalFixes,
      successCount: batchResult.successCount,
      errorCount: batchResult.errorCount,
      skippedCount: batchResult.skippedCount,
      remainingCount: batchResult.remainingCount,
      compileSuccess: compileResult.success,
      timestamp: new Date().toISOString(),
      results: batchResult.results
    };
    
    const reportPath = `./color-fix-batch-${startIndex}-${startIndex + batchSize - 1}-report.json`;
    fs.writeFileSync(reportPath, JSON.stringify(batchReport, null, 2));
    console.log(`\n📄 批次报告已保存: ${reportPath}`);

    if (compileResult.success) {
      console.log(`\n🎉 批次 ${startIndex}-${startIndex + batchSize - 1} 修复完成！`);
      console.log(`📊 修复统计: ${batchResult.totalFixes} 处颜色问题`);
      
      if (batchResult.remainingCount > 0) {
        const nextStart = startIndex + batchSize;
        console.log(`\n🚀 继续下一批次: node scripts/batch-color-fixer.js ${nextStart} ${batchSize + 10}`);
      } else {
        console.log(`\n🎊 所有颜色问题修复完成！`);
      }
    } else {
      console.log(`\n⚠️ 编译失败，请检查错误后继续`);
    }

  } catch (error) {
    console.error('❌ 批次修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { batchFixRange, fixFileColors };