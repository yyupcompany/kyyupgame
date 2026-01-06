#!/usr/bin/env node

/**
 * 全面尺寸修复脚本 - 基于扫描到的10种尺寸模式
 * Comprehensive Size Fixer - Based on 10 Size Patterns
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { execSync } from 'child_process';

// 全面的尺寸映射表 - 基于10种模式分析
const SIZE_MAPPINGS = {
  // 1. CSS尺寸属性映射
  cssSize: {
    '4': 'var(--size-xs)',
    '8': 'var(--size-sm)',
    '12': 'var(--size-md)',
    '16': 'var(--size-md)',
    '20': 'var(--size-lg)',
    '24': 'var(--size-lg)',
    '28': 'var(--size-xl)',
    '32': 'var(--size-xl)',
    '36': 'var(--size-2xl)',
    '40': 'var(--size-2xl)',
    '44': 'var(--size-3xl)',
    '48': 'var(--size-3xl)',
    '56': 'var(--size-4xl)',
    '64': 'var(--size-4xl)',
    '72': 'var(--size-5xl)',
    '80': 'var(--size-5xl)',
    '96': 'var(--size-6xl)',
    '120': 'var(--size-6xl)',
    '160': 'var(--size-7xl)',
    '200': 'var(--size-8xl)',
    '240': 'var(--size-9xl)',
    '280': 'var(--size-10xl)',
    '320': 'var(--size-11xl)',
    '400': 'var(--size-12xl)',
    '480': 'var(--size-13xl)',
    '560': 'var(--size-14xl)',
    '640': 'var(--size-15xl)',
    '720': 'var(--size-16xl)',
    '800': 'var(--size-17xl)',
    '960': 'var(--size-18xl)',
    '1024': 'var(--size-19xl)',
    '1200': 'var(--size-20xl)',
    '1400': 'var(--size-21xl)',
    '1600': 'var(--size-22xl)'
  },

  // 2. 字体尺寸映射
  fontSize: {
    '8': 'var(--text-3xs)',
    '10': 'var(--text-2xs)',
    '11': 'var(--text-xs)',
    '12': 'var(--text-sm)',
    '13': 'var(--text-sm)',
    '14': 'var(--text-base)',
    '15': 'var(--text-base)',
    '16': 'var(--text-md)',
    '17': 'var(--text-md)',
    '18': 'var(--text-lg)',
    '19': 'var(--text-lg)',
    '20': 'var(--text-xl)',
    '21': 'var(--text-xl)',
    '22': 'var(--text-2xl)',
    '24': 'var(--text-2xl)',
    '26': 'var(--text-3xl)',
    '28': 'var(--text-3xl)',
    '30': 'var(--text-3xl)',
    '32': 'var(--text-4xl)',
    '36': 'var(--text-4xl)',
    '40': 'var(--text-5xl)',
    '48': 'var(--text-5xl)',
    '56': 'var(--text-6xl)',
    '64': 'var(--text-6xl)'
  },

  // 3. 边框圆角映射
  borderRadius: {
    '0': 'var(--radius-none)',
    '2': 'var(--radius-xs)',
    '3': 'var(--radius-xs)',
    '4': 'var(--radius-sm)',
    '6': 'var(--radius-md)',
    '8': 'var(--radius-lg)',
    '10': 'var(--radius-xl)',
    '12': 'var(--radius-xl)',
    '14': 'var(--radius-2xl)',
    '16': 'var(--radius-2xl)',
    '20': 'var(--radius-3xl)',
    '24': 'var(--radius-3xl)',
    '28': 'var(--radius-4xl)',
    '32': 'var(--radius-4xl)',
    '999': 'var(--radius-full)'
  },

  // 4. 图标尺寸映射
  iconSize: {
    '8': 'var(--icon-xs)',
    '12': 'var(--icon-xs)',
    '16': 'var(--icon-sm)',
    '18': 'var(--icon-sm)',
    '20': 'var(--icon-md)',
    '24': 'var(--icon-lg)',
    '28': 'var(--icon-lg)',
    '32': 'var(--icon-xl)',
    '36': 'var(--icon-xl)',
    '40': 'var(--icon-2xl)',
    '48': 'var(--icon-2xl)',
    '56': 'var(--icon-3xl)',
    '64': 'var(--icon-3xl)'
  },

  // 5. 头像尺寸映射
  avatarSize: {
    '24': 'var(--avatar-xs)',
    '32': 'var(--avatar-sm)',
    '40': 'var(--avatar-md)',
    '48': 'var(--avatar-lg)',
    '56': 'var(--avatar-xl)',
    '64': 'var(--avatar-xl)',
    '80': 'var(--avatar-2xl)',
    '96': 'var(--avatar-2xl)',
    '120': 'var(--avatar-3xl)'
  },

  // 6. 容器尺寸映射
  containerSize: {
    '280': 'var(--sidebar-width)',
    '320': 'var(--container-sm)',
    '480': 'var(--container-md)',
    '640': 'var(--container-lg)',
    '768': 'var(--container-lg)',
    '1024': 'var(--container-xl)',
    '1140': 'var(--container-xl)',
    '1200': 'var(--container-2xl)',
    '1280': 'var(--container-2xl)',
    '1400': 'var(--container-3xl)',
    '1600': 'var(--container-3xl)'
  },

  // 7. 按钮尺寸映射
  buttonSize: {
    '24': 'var(--button-height-xs)',
    '28': 'var(--button-height-sm)',
    '32': 'var(--button-height-sm)',
    '36': 'var(--button-height-md)',
    '40': 'var(--button-height-lg)',
    '44': 'var(--button-height-lg)',
    '48': 'var(--button-height-xl)',
    '56': 'var(--button-height-xl)'
  },

  // 8. 控件尺寸映射
  controlSize: {
    '80': 'var(--control-width-xs)',
    '100': 'var(--control-width-sm)',
    '120': 'var(--control-width-sm)',
    '160': 'var(--control-width-md)',
    '180': 'var(--control-width-md)',
    '200': 'var(--control-width-lg)',
    '240': 'var(--control-width-lg)',
    '280': 'var(--control-width-xl)',
    '320': 'var(--control-width-xl)'
  },

  // 9. 间距尺寸映射
  spacingSize: {
    '4': 'var(--spacing-xs)',
    '8': 'var(--spacing-sm)',
    '12': 'var(--spacing-md)',
    '16': 'var(--spacing-lg)',
    '20': 'var(--spacing-xl)',
    '24': 'var(--spacing-2xl)',
    '28': 'var(--spacing-3xl)',
    '32': 'var(--spacing-4xl)',
    '40': 'var(--spacing-5xl)',
    '48': 'var(--spacing-6xl)',
    '56': 'var(--spacing-7xl)',
    '64': 'var(--spacing-8xl)'
  },

  // 10. 特殊用途尺寸映射
  specialSize: {
    '20': 'var(--indicator-size)',
    '24': 'var(--badge-size)',
    '32': 'var(--thumbnail-size)',
    '40': 'var(--preview-size)',
    '56': 'var(--card-preview-size)',
    '64': 'var(--large-preview-size)',
    '120': 'var(--dialog-width-xs)',
    '160': 'var(--dialog-width-sm)',
    '200': 'var(--dialog-width-md)',
    '240': 'var(--dialog-width-lg)',
    '280': 'var(--dialog-width-xl)',
    '320': 'var(--dialog-width-2xl)',
    '400': 'var(--modal-width-lg)',
    '480': 'var(--modal-width-xl)',
    '560': 'var(--modal-width-2xl)',
    '640': 'var(--modal-width-3xl)',
    '720': 'var(--modal-width-4xl)',
    '800': 'var(--modal-width-5xl)'
  }
};

// 尺寸修复规则
const SIZE_FIX_RULES = [
  // 1. CSS尺寸属性修复
  {
    name: 'css-size-properties',
    pattern: /(?:width|height|min-width|min-height|max-width|max-height):\s*(\d+)px/g,
    replacement: (match, property, value) => {
      const token = SIZE_MAPPINGS.cssSize[value];
      return token ? `${property}: ${token}` : match;
    },
    description: 'CSS尺寸属性'
  },

  // 2. 字体大小修复
  {
    name: 'font-size',
    pattern: /font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)/g,
    replacement: (match, value, unit) => {
      if (unit === 'px') {
        const token = SIZE_MAPPINGS.fontSize[value];
        return token ? `font-size: ${token}` : match;
      }
      return match;
    },
    description: '字体大小'
  },

  // 3. 边框圆角修复
  {
    name: 'border-radius',
    pattern: /border-radius:\s*(\d+)px/g,
    replacement: (match, value) => {
      const token = SIZE_MAPPINGS.borderRadius[value];
      return token ? `border-radius: ${token}` : match;
    },
    description: '边框圆角'
  },

  // 4. 内联样式尺寸修复
  {
    name: 'inline-size-styles',
    pattern: /style="([^"]*(?:width|height|min-width|min-height|max-width|max-height|font-size|border-radius):\s*(\d+)px[^"]*)"/g,
    replacement: (match, styleContent, property, value) => {
      let token;
      if (property.includes('font-size')) {
        token = SIZE_MAPPINGS.fontSize[value];
      } else if (property.includes('border-radius')) {
        token = SIZE_MAPPINGS.borderRadius[value];
      } else {
        token = SIZE_MAPPINGS.cssSize[value];
      }
      
      if (token) {
        return styleContent.replace(`${property}: ${value}px`, `${property}: ${token}`);
      }
      return match;
    },
    description: '内联样式尺寸'
  },

  // 5. 图标和头像组合尺寸修复
  {
    name: 'icon-avatar-combo',
    pattern: /(?:width|height):\s*(\d+)px;\s*(?:width|height):\s*\1px/g,
    replacement: (match, value) => {
      // 检查是否是图标或头像常用尺寸
      if (SIZE_MAPPINGS.iconSize[value]) {
        return `width: var(--icon-size); height: var(--icon-size)`;
      }
      if (SIZE_MAPPINGS.avatarSize[value]) {
        return `width: var(--avatar-size); height: var(--avatar-size)`;
      }
      return match;
    },
    description: '图标和头像组合尺寸'
  },

  // 6. 特殊容器尺寸修复
  {
    name: 'special-container-sizes',
    pattern: /(?:width|max-width|min-width):\s*(\d+)px/g,
    replacement: (match, property, value) => {
      // 特殊容器尺寸映射
      const specialMappings = {
        '280': 'var(--sidebar-width)',
        '320': 'var(--container-sm)',
        '600': 'var(--dialog-width-md)',
        '800': 'var(--modal-width-lg)',
        '1200': 'var(--container-2xl)',
        '1400': 'var(--container-3xl)'
      };
      
      const token = specialMappings[value] || SIZE_MAPPINGS.containerSize[value];
      return token ? `${property}: ${token}` : match;
    },
    description: '特殊容器尺寸'
  },

  // 7. 按钮高度修复
  {
    name: 'button-height',
    pattern: /height:\s*(\d+)px/g,
    replacement: (match, value) => {
      const token = SIZE_MAPPINGS.buttonSize[value];
      return token ? `height: ${token}` : match;
    },
    description: '按钮高度'
  },

  // 8. 行高修复
  {
    name: 'line-height',
    pattern: /line-height:\s*(\d+(?:\.\d+)?)(px)?/g,
    replacement: (match, value, unit) => {
      if (!unit) {
        // 无单位的行高保持原样
        return match;
      }
      const token = SIZE_MAPPINGS.spacingSize[value];
      return token ? `line-height: ${token}` : match;
    },
    description: '行高'
  },

  // 9. 间隙尺寸修复
  {
    name: 'gap-size',
    pattern: /gap:\s*(\d+)px/g,
    replacement: (match, value) => {
      const token = SIZE_MAPPINGS.spacingSize[value];
      return token ? `gap: ${token}` : match;
    },
    description: '间隙尺寸'
  },

  // 10. 响应式断点修复
  {
    name: 'responsive-breakpoints',
    pattern: /@(?:media|media\s+screen)\s*\([^)]*(?:max-width|min-width):\s*(\d+)px[^)]*\)/g,
    replacement: (match, value) => {
      const breakpointMappings = {
        '480': 'var(--breakpoint-sm)',
        '768': 'var(--breakpoint-md)',
        '1024': 'var(--breakpoint-lg)',
        '1200': 'var(--breakpoint-xl)',
        '1400': 'var(--breakpoint-2xl)'
      };
      
      const token = breakpointMappings[value];
      if (token) {
        return match.replace(`${value}px`, token);
      }
      return match;
    },
    description: '响应式断点'
  }
];

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

// 修复单个文件的尺寸
function fixFileSizes(filePath) {
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

    SIZE_FIX_RULES.forEach(rule => {
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
      fixedSize: content.length
    };

  } catch (error) {
    console.error(`❌ 修复文件尺寸失败: ${filePath}`, error.message);
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
  console.log(`📏 开始批量修复尺寸 (范围: ${startIndex}-${startIndex + batchSize - 1})...\n`);

  const problemFiles = getProblemFiles();
  const endIndex = Math.min(startIndex + batchSize, problemFiles.length);
  const filesToProcess = problemFiles.slice(startIndex, endIndex);

  const results = [];
  let totalFixes = 0;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const filePath of filesToProcess) {
    const result = fixFileSizes(filePath);
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

  console.log(`📏 全面尺寸修复工具`);
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
    
    const reportPath = `./size-fix-batch-${startIndex}-${startIndex + batchSize - 1}-report.json`;
    fs.writeFileSync(reportPath, JSON.stringify(batchReport, null, 2));
    console.log(`\n📄 批次报告已保存: ${reportPath}`);

    if (compileResult.success) {
      console.log(`\n🎉 批次 ${startIndex}-${startIndex + batchSize - 1} 修复完成！`);
      console.log(`📊 修复统计: ${batchResult.totalFixes} 处尺寸问题`);
      
      if (batchResult.remainingCount > 0) {
        const nextStart = startIndex + batchSize;
        console.log(`\n🚀 继续下一批次: node scripts/comprehensive-size-fixer.js ${nextStart} ${batchSize + 10}`);
      } else {
        console.log(`\n🎊 所有尺寸问题修复完成！`);
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

export { batchFixRange, fixFileSizes, SIZE_MAPPINGS, SIZE_FIX_RULES };
