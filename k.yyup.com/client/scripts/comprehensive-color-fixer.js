#!/usr/bin/env node

/**
 * 全面颜色修复脚本 - 基于扫描到的20种颜色模式
 * Comprehensive Color Fixer - Based on 20 Color Patterns
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { execSync } from 'child_process';

// 全面的颜色映射表 - 基于20种模式分析
const COLOR_MAPPINGS = {
  // 1. HEX颜色模式映射
  hex: {
    // 主色系
    '#409eff': 'var(--primary-color)',
    '#66b1ff': 'var(--primary-light)',
    '#337ecc': 'var(--primary-dark)',
    '#79bbff': 'var(--primary-lighter)',
    
    // 成功色系
    '#67c23a': 'var(--success-color)',
    '#85ce61': 'var(--success-light)',
    '#529b2e': 'var(--success-dark)',
    
    // 警告色系
    '#e6a23c': 'var(--warning-color)',
    '#ebb563': 'var(--warning-light)',
    '#b88230': 'var(--warning-dark)',
    
    // 危险色系
    '#f56c6c': 'var(--danger-color)',
    '#f78989': 'var(--danger-light)',
    '#c45656': 'var(--danger-dark)',
    
    // 信息色系
    '#909399': 'var(--info-color)',
    '#a6a9ad': 'var(--info-light)',
    '#73767a': 'var(--info-dark)',
    
    // 中性色系
    '#ffffff': 'var(--color-white)',
    '#f8f9fa': 'var(--color-gray-50)',
    '#f5f5f5': 'var(--color-gray-100)',
    '#e5e7eb': 'var(--color-gray-200)',
    '#d1d5db': 'var(--color-gray-300)',
    '#9ca3af': 'var(--color-gray-400)',
    '#6b7280': 'var(--color-gray-500)',
    '#4b5563': 'var(--color-gray-600)',
    '#374151': 'var(--color-gray-700)',
    '#1f2937': 'var(--color-gray-800)',
    '#111827': 'var(--color-gray-900)',
    
    // 常见边框色
    '#d9d9d9': 'var(--border-base)',
    '#f0f0f0': 'var(--border-light)',
    '#e4e7ed': 'var(--border-lighter)',
    '#dcdfe6': 'var(--border-extra-light)',
    
    // 常见背景色
    '#fafafa': 'var(--bg-page)',
    '#f5f7fa': 'var(--bg-container)',
    
    // AI助手专用色
    '#8b5cf6': 'var(--ai-primary)',
    '#a78bfa': 'var(--ai-light)',
    '#7c3aed': 'var(--ai-dark)',
    '#6d28d9': 'var(--ai-darker)',
    
    // 品牌色变体
    '#1890ff': 'var(--brand-primary)',
    '#52c41a': 'var(--brand-success)',
    '#faad14': 'var(--brand-warning)',
    '#ff4d4f': 'var(--brand-danger)',
    
    // 常见文字色
    '#303133': 'var(--text-primary)',
    '#606266': 'var(--text-regular)',
    '#909399': 'var(--text-secondary)',
    '#c0c4cc': 'var(--text-placeholder)',
    
    // 暗黑主题色
    '#1e293b': 'var(--dark-surface-1)',
    '#334155': 'var(--dark-surface-2)',
    '#475569': 'var(--dark-surface-3)',
    '#64748b': 'var(--dark-text-1)',
    '#94a3b8': 'var(--dark-text-2)',
    '#cbd5e1': 'var(--dark-border)',
    '#f1f5f9': 'var(--dark-bg-secondary)',
    
    // 特殊用途色
    '#34d399': 'var(--status-success)',
    '#f87171': 'var(--status-error)',
    '#60a5fa': 'var(--status-info)',
    '#fbbf24': 'var(--status-warning)',
    
    // 游戏相关色 - 保持原样（跳过）
    '#10b981': 'var(--game-success)',
    '#f59e0b': 'var(--game-warning)',
    '#ef4444': 'var(--game-danger)',
    '#3b82f6': 'var(--game-primary)'
  },

  // 2. RGBA颜色模式映射
  rgba: {
    // 白色透明度变体
    'rgba(255, 255, 255, 0.95)': 'var(--white-alpha-95)',
    'rgba(255, 255, 255, 0.9)': 'var(--white-alpha-90)',
    'rgba(255, 255, 255, 0.8)': 'var(--white-alpha-80)',
    'rgba(255, 255, 255, 0.75)': 'var(--white-alpha-75)',
    'rgba(255, 255, 255, 0.7)': 'var(--white-alpha-70)',
    'rgba(255, 255, 255, 0.6)': 'var(--white-alpha-60)',
    'rgba(255, 255, 255, 0.5)': 'var(--white-alpha-50)',
    'rgba(255, 255, 255, 0.4)': 'var(--white-alpha-40)',
    'rgba(255, 255, 255, 0.3)': 'var(--white-alpha-30)',
    'rgba(255, 255, 255, 0.2)': 'var(--white-alpha-20)',
    'rgba(255, 255, 255, 0.15)': 'var(--white-alpha-15)',
    'rgba(255, 255, 255, 0.1)': 'var(--white-alpha-10)',
    'rgba(255, 255, 255, 0.08)': 'var(--white-alpha-8)',
    'rgba(255, 255, 255, 0.06)': 'var(--white-alpha-6)',
    'rgba(255, 255, 255, 0.05)': 'var(--white-alpha-5)',
    'rgba(255, 255, 255, 0.04)': 'var(--white-alpha-4)',
    'rgba(255, 255, 255, 0.03)': 'var(--white-alpha-3)',
    'rgba(255, 255, 255, 0.02)': 'var(--white-alpha-2)',
    'rgba(255, 255, 255, 0.01)': 'var(--white-alpha-1)',
    
    // 黑色透明度变体
    'rgba(0, 0, 0, 0.9)': 'var(--black-alpha-90)',
    'rgba(0, 0, 0, 0.8)': 'var(--black-alpha-80)',
    'rgba(0, 0, 0, 0.7)': 'var(--black-alpha-70)',
    'rgba(0, 0, 0, 0.6)': 'var(--black-alpha-60)',
    'rgba(0, 0, 0, 0.5)': 'var(--black-alpha-50)',
    'rgba(0, 0, 0, 0.4)': 'var(--black-alpha-40)',
    'rgba(0, 0, 0, 0.3)': 'var(--black-alpha-30)',
    'rgba(0, 0, 0, 0.2)': 'var(--black-alpha-20)',
    'rgba(0, 0, 0, 0.15)': 'var(--black-alpha-15)',
    'rgba(0, 0, 0, 0.1)': 'var(--black-alpha-10)',
    'rgba(0, 0, 0, 0.08)': 'var(--black-alpha-8)',
    'rgba(0, 0, 0, 0.06)': 'var(--black-alpha-6)',
    'rgba(0, 0, 0, 0.05)': 'var(--black-alpha-5)',
    'rgba(0, 0, 0, 0.04)': 'var(--black-alpha-4)',
    'rgba(0, 0, 0, 0.03)': 'var(--black-alpha-3)',
    'rgba(0, 0, 0, 0.02)': 'var(--black-alpha-2)',
    'rgba(0, 0, 0, 0.01)': 'var(--black-alpha-1)',
    
    // 主色透明度变体
    'rgba(64, 158, 255, 0.2)': 'var(--primary-alpha-20)',
    'rgba(64, 158, 255, 0.15)': 'var(--primary-alpha-15)',
    'rgba(64, 158, 255, 0.1)': 'var(--primary-alpha-10)',
    'rgba(64, 158, 255, 0.08)': 'var(--primary-alpha-8)',
    'rgba(64, 158, 255, 0.05)': 'var(--primary-alpha-5)',
    
    // AI助手色透明度变体
    'rgba(139, 92, 246, 0.35)': 'var(--ai-alpha-35)',
    'rgba(139, 92, 246, 0.3)': 'var(--ai-alpha-30)',
    'rgba(139, 92, 246, 0.25)': 'var(--ai-alpha-25)',
    'rgba(139, 92, 246, 0.2)': 'var(--ai-alpha-20)',
    'rgba(139, 92, 246, 0.15)': 'var(--ai-alpha-15)',
    'rgba(139, 92, 246, 0.12)': 'var(--ai-alpha-12)',
    'rgba(139, 92, 246, 0.1)': 'var(--ai-alpha-10)',
    'rgba(139, 92, 246, 0.08)': 'var(--ai-alpha-8)',
    'rgba(139, 92, 246, 0.06)': 'var(--ai-alpha-6)',
    'rgba(139, 92, 246, 0.05)': 'var(--ai-alpha-5)',
    'rgba(139, 92, 246, 0.04)': 'var(--ai-alpha-4)',
    'rgba(139, 92, 246, 0.03)': 'var(--ai-alpha-3)',
    'rgba(139, 92, 246, 0.02)': 'var(--ai-alpha-2)',
    'rgba(139, 92, 246, 0.01)': 'var(--ai-alpha-1)',
    
    // 状态色透明度变体
    'rgba(103, 194, 58, 0.2)': 'var(--success-alpha-20)',
    'rgba(103, 194, 58, 0.15)': 'var(--success-alpha-15)',
    'rgba(103, 194, 58, 0.1)': 'var(--success-alpha-10)',
    
    'rgba(230, 162, 60, 0.2)': 'var(--warning-alpha-20)',
    'rgba(230, 162, 60, 0.15)': 'var(--warning-alpha-15)',
    'rgba(230, 162, 60, 0.1)': 'var(--warning-alpha-10)',
    
    'rgba(245, 108, 108, 0.2)': 'var(--danger-alpha-20)',
    'rgba(245, 108, 108, 0.15)': 'var(--danger-alpha-15)',
    'rgba(245, 108, 108, 0.1)': 'var(--danger-alpha-10)',
    
    // 暗黑主题透明度变体
    'rgba(31, 41, 55, 0.8)': 'var(--dark-alpha-80)',
    'rgba(31, 41, 55, 0.7)': 'var(--dark-alpha-70)',
    'rgba(31, 41, 55, 0.6)': 'var(--dark-alpha-60)',
    'rgba(31, 41, 55, 0.5)': 'var(--dark-alpha-50)',
    'rgba(31, 41, 55, 0.4)': 'var(--dark-alpha-40)',
    'rgba(31, 41, 55, 0.3)': 'var(--dark-alpha-30)',
    
    'rgba(55, 65, 81, 0.6)': 'var(--dark-surface-alpha-60)',
    'rgba(55, 65, 81, 0.5)': 'var(--dark-surface-alpha-50)',
    'rgba(55, 65, 81, 0.4)': 'var(--dark-surface-alpha-40)',
    
    'rgba(75, 85, 99, 0.7)': 'var(--dark-border-alpha-70)',
    'rgba(75, 85, 99, 0.6)': 'var(--dark-border-alpha-60)',
    'rgba(75, 85, 99, 0.5)': 'var(--dark-border-alpha-50)',
    
    // 渐变专用RGBA
    'rgba(102, 126, 234, 0.1)': 'var(--gradient-primary-alpha-10)',
    'rgba(118, 75, 162, 0.1)': 'var(--gradient-purple-alpha-10)',
    
    // 特殊用途RGBA
    'rgba(96, 165, 250, 0.5)': 'var(--info-alpha-50)',
    'rgba(96, 165, 250, 0.8)': 'var(--info-alpha-80)',
    'rgba(59, 130, 246, 0.5)': 'var(--info-alpha-50)',
    'rgba(59, 130, 246, 0.3)': 'var(--info-alpha-30)',
    'rgba(59, 130, 246, 0.08)': 'var(--info-alpha-8)',
    
    'rgba(16, 185, 129, 0.5)': 'var(--success-alpha-50)',
    'rgba(16, 185, 129, 0.3)': 'var(--success-alpha-30)',
    'rgba(16, 185, 129, 0.08)': 'var(--success-alpha-8)',
    
    'rgba(239, 68, 68, 0.5)': 'var(--danger-alpha-50)',
    'rgba(239, 68, 68, 0.3)': 'var(--danger-alpha-30)',
    'rgba(239, 68, 68, 0.08)': 'var(--danger-alpha-8)',
    
    'rgba(107, 114, 128, 0.6)': 'var(--neutral-alpha-60)',
    'rgba(107, 114, 128, 0.4)': 'var(--neutral-alpha-40)',
    
    // 空格变体处理
    'rgba(255,255,255,0.95)': 'var(--white-alpha-95)',
    'rgba(255,255,255,0.9)': 'var(--white-alpha-90)',
    'rgba(255,255,255,0.8)': 'var(--white-alpha-80)',
    'rgba(255,255,255,0.7)': 'var(--white-alpha-70)',
    'rgba(255,255,255,0.6)': 'var(--white-alpha-60)',
    'rgba(255,255,255,0.5)': 'var(--white-alpha-50)',
    'rgba(255,255,255,0.4)': 'var(--white-alpha-40)',
    'rgba(255,255,255,0.3)': 'var(--white-alpha-30)',
    'rgba(255,255,255,0.2)': 'var(--white-alpha-20)',
    'rgba(255,255,255,0.15)': 'var(--white-alpha-15)',
    'rgba(255,255,255,0.1)': 'var(--white-alpha-10)',
    'rgba(255,255,255,0.08)': 'var(--white-alpha-8)',
    'rgba(255,255,255,0.06)': 'var(--white-alpha-6)',
    'rgba(255,255,255,0.05)': 'var(--white-alpha-5)',
    'rgba(255,255,255,0.04)': 'var(--white-alpha-4)',
    'rgba(255,255,255,0.03)': 'var(--white-alpha-3)',
    'rgba(255,255,255,0.02)': 'var(--white-alpha-2)',
    'rgba(255,255,255,0.01)': 'var(--white-alpha-1)',
    
    'rgba(0,0,0,0.9)': 'var(--black-alpha-90)',
    'rgba(0,0,0,0.8)': 'var(--black-alpha-80)',
    'rgba(0,0,0,0.7)': 'var(--black-alpha-70)',
    'rgba(0,0,0,0.6)': 'var(--black-alpha-60)',
    'rgba(0,0,0,0.5)': 'var(--black-alpha-50)',
    'rgba(0,0,0,0.4)': 'var(--black-alpha-40)',
    'rgba(0,0,0,0.3)': 'var(--black-alpha-30)',
    'rgba(0,0,0,0.2)': 'var(--black-alpha-20)',
    'rgba(0,0,0,0.15)': 'var(--black-alpha-15)',
    'rgba(0,0,0,0.1)': 'var(--black-alpha-10)',
    'rgba(0,0,0,0.08)': 'var(--black-alpha-8)',
    'rgba(0,0,0,0.06)': 'var(--black-alpha-6)',
    'rgba(0,0,0,0.05)': 'var(--black-alpha-5)',
    'rgba(0,0,0,0.04)': 'var(--black-alpha-4)',
    'rgba(0,0,0,0.03)': 'var(--black-alpha-3)',
    'rgba(0,0,0,0.02)': 'var(--black-alpha-2)',
    'rgba(0,0,0,0.01)': 'var(--black-alpha-1)'
  }
};

// 颜色修复规则
const COLOR_FIX_RULES = [
  // 1. HEX颜色修复
  {
    name: 'hex-colors',
    pattern: /#[0-9a-fA-F]{3,6}(?!\w)/g,
    replacement: (match) => {
      // 标准化HEX颜色
      const normalized = match.toLowerCase();
      return COLOR_MAPPINGS.hex[normalized] || match;
    },
    description: 'HEX颜色'
  },

  // 2. RGBA颜色修复
  {
    name: 'rgba-colors',
    pattern: /rgba?\([^)]+\)/g,
    replacement: (match) => {
      // 标准化空格
      const normalized = match.replace(/\s+/g, '');
      return COLOR_MAPPINGS.rgba[normalized] || match;
    },
    description: 'RGBA颜色'
  },

  // 3. 渐变色修复 - 线性渐变
  {
    name: 'linear-gradients',
    pattern: /linear-gradient\([^)]+\)/g,
    replacement: (match) => {
      // 常见渐变模式映射
      if (match.includes('#667eea') && match.includes('#764ba2')) {
        return 'var(--gradient-purple)';
      }
      if (match.includes('#4CAF50') && match.includes('#66BB6A')) {
        return 'var(--gradient-success)';
      }
      if (match.includes('#f093fb') && match.includes('#f5576c')) {
        return 'var(--gradient-pink)';
      }
      // 保持复杂渐变不变
      return match;
    },
    description: '线性渐变'
  },

  // 4. 渐变色修复 - 径向渐变
  {
    name: 'radial-gradients',
    pattern: /radial-gradient\([^)]+\)/g,
    replacement: (match) => {
      // 常见径向渐变映射
      if (match.includes('rgba(139, 92, 246')) {
        return 'var(--radial-ai)';
      }
      if (match.includes('rgba(255,255,255')) {
        return 'var(--radial-light)';
      }
      return match;
    },
    description: '径向渐变'
  }
];

// 游戏文件检测 - 跳过游戏相关文件
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
    // 跳过游戏文件
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
  // 从硬编码样式扫描报告中获取问题文件
  const reportPath = './hardcoded-styles-report.json';
  
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return report.files
      .filter(file => file.issueCount > 0)
      .map(file => file.file)
      .filter(file => !isGameFile(file)) // 过滤掉游戏文件
      .sort();
  }
  
  // 如果没有报告，使用glob查找所有Vue文件
  const vueFiles = globSync('src/**/**/*.vue', { cwd: process.cwd() });
  return vueFiles
    .filter(file => !isGameFile(file))
    .map(file => path.join(process.cwd(), file));
}

// 批量修复颜色
async function batchFixColors(filePaths, batchSize) {
  console.log(`🎨 开始批量修复颜色 (批次大小: ${batchSize})...\n`);

  const results = [];
  let totalFixes = 0;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < Math.min(filePaths.length, batchSize); i++) {
    const filePath = filePaths[i];
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
  console.log(`   处理文件: ${Math.min(filePaths.length, batchSize)} 个`);
  console.log(`   成功修复: ${successCount} 个`);
  console.log(`   修复失败: ${errorCount} 个`);
  console.log(`   跳过文件: ${skippedCount} 个`);
  console.log(`   总修复数: ${totalFixes} 处`);

  return {
    results: results.slice(0, batchSize),
    totalFixes,
    successCount,
    errorCount,
    skippedCount,
    processedCount: Math.min(filePaths.length, batchSize),
    remainingCount: Math.max(0, filePaths.length - batchSize)
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

// 主函数 - 递增式批量修复
async function main() {
  console.log('🎨 全面颜色修复工具 - 递增式批量修复\n');

  try {
    const problemFiles = getProblemFiles();
    console.log(`📁 发现 ${problemFiles.length} 个需要修复的文件（已排除游戏文件）`);

    let currentBatchSize = 10;
    let processedFiles = 0;
    let totalFixes = 0;
    let batchCount = 1;

    while (processedFiles < problemFiles.length) {
      console.log(`\n🚀 第 ${batchCount} 批次 (处理 ${currentBatchSize} 个文件)`);
      console.log(`📍 进度: ${processedFiles}/${problemFiles.length} (${Math.round(processedFiles/problemFiles.length*100)}%)`);
      
      const remainingFiles = problemFiles.slice(processedFiles);
      const batchResult = await batchFixColors(remainingFiles, currentBatchSize);
      
      // 编译验证
      const compileResult = await compileVerify();
      
      if (!compileResult.success) {
        console.log('\n⚠️ 编译失败，停止当前批次修复');
        console.log('💡 建议手动修复编译错误后继续');
        break;
      }
      
      // 更新进度
      processedFiles += batchResult.processedCount;
      totalFixes += batchResult.totalFixes;
      
      // 保存批次报告
      const batchReport = {
        batchNumber: batchCount,
        batchSize: currentBatchSize,
        processedCount: batchResult.processedCount,
        totalFixes: batchResult.totalFixes,
        successCount: batchResult.successCount,
        errorCount: batchResult.errorCount,
        skippedCount: batchResult.skippedCount,
        remainingFiles: problemFiles.length - processedFiles,
        compileSuccess: compileResult.success,
        timestamp: new Date().toISOString(),
        results: batchResult.results
      };
      
      const reportPath = `./color-fix-batch-${batchCount}-report.json`;
      fs.writeFileSync(reportPath, JSON.stringify(batchReport, null, 2));
      console.log(`📄 批次 ${batchCount} 报告已保存: ${reportPath}`);
      
      // 递增批次大小
      currentBatchSize += 10;
      batchCount++;
      
      // 如果没有更多文件需要处理，退出循环
      if (batchResult.remainingCount === 0) {
        console.log('\n🎉 所有文件修复完成！');
        break;
      }
    }

    // 生成最终报告
    const finalReport = {
      totalFiles: problemFiles.length,
      processedFiles,
      totalFixes,
      batches: batchCount - 1,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('./color-fix-final-report.json', JSON.stringify(finalReport, null, 2));
    console.log(`\n📄 最终报告已保存: ./color-fix-final-report.json`);
    console.log(`🎊 颜色修复任务完成！共修复 ${totalFixes} 处颜色问题`);

  } catch (error) {
    console.error('❌ 颜色修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFileColors, batchFixColors, COLOR_MAPPINGS, COLOR_FIX_RULES };
