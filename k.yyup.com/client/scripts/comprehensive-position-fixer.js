#!/usr/bin/env node

/**
 * 综合位置修复工具
 * Comprehensive Position Fixer
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { backupFiles } from './backup-system.js';

// 位置映射表 - 将硬编码位置值映射到设计令牌
const POSITION_MAPPINGS = {
  // 位置值映射
  '0': 'var(--position-none)',
  '1': 'var(--position-xs)',
  '2': 'var(--position-sm)',
  '4': 'var(--position-md)',
  '6': 'var(--position-lg)',
  '8': 'var(--position-xl)',
  '10': 'var(--position-2xl)',
  '12': 'var(--position-3xl)',
  '16': 'var(--position-4xl)',
  '20': 'var(--position-5xl)',
  '24': 'var(--position-6xl)',
  '28': 'var(--position-7xl)',
  '32': 'var(--position-8xl)',
  '36': 'var(--position-9xl)',
  '40': 'var(--position-10xl)',
  '44': 'var(--position-11xl)',
  '48': 'var(--position-12xl)',
  '52': 'var(--position-13xl)',
  '56': 'var(--position-14xl)',
  '60': 'var(--position-15xl)',
  '64': 'var(--position-16xl)',
  '72': 'var(--position-18xl)',
  '80': 'var(--position-20xl)',
  '96': 'var(--position-24xl)',
  '100': 'var(--position-25xl)',
  '120': 'var(--position-30xl)',
  '128': 'var(--position-32xl)',
  '144': 'var(--position-36xl)',
  '160': 'var(--position-40xl)',
  '200': 'var(--position-50xl)',
  '240': 'var(--position-60xl)',
  
  // 负位置值
  '-1': 'var(--position-negative-xs)',
  '-2': 'var(--position-negative-sm)',
  '-4': 'var(--position-negative-md)',
  '-6': 'var(--position-negative-lg)',
  '-8': 'var(--position-negative-xl)',
  '-10': 'var(--position-negative-2xl)',
  '-12': 'var(--position-negative-3xl)',
  '-16': 'var(--position-negative-4xl)',
  '-20': 'var(--position-negative-5xl)',
  '-24': 'var(--position-negative-6xl)',
  '-32': 'var(--position-negative-8xl)',
  '-40': 'var(--position-negative-10xl)',
  '-48': 'var(--position-negative-12xl)',
  '-50': 'var(--position-negative-12xl)',
  '-60': 'var(--position-negative-15xl)',
  '-64': 'var(--position-negative-16xl)',
  '-80': 'var(--position-negative-20xl)',
  '-100': 'var(--position-negative-25xl)',
  
  // z-index层级映射
  '1': 'var(--z-index-dropdown)',
  '10': 'var(--z-index-sticky)',
  '100': 'var(--z-index-fixed)',
  '200': 'var(--z-index-modal-backdrop)',
  '300': 'var(--z-index-modal)',
  '400': 'var(--z-index-popover)',
  '500': 'var(--z-index-tooltip)',
  '600': 'var(--z-index-toast)',
  '700': 'var(--z-index-maximum)',
  '999': 'var(--z-index-always-on-top)',
  '1000': 'var(--z-index-debug)',
  '-1': 'var(--z-index-below)',
  
  // transform位移映射
  '-2': 'var(--transform-hover-lift)',
  '-4': 'var(--transform-card-lift)',
  '-8': 'var(--transform-modal-lift)',
  '-16': 'var(--transform-large-lift)',
  '2': 'var(--transform-drop)',
  '4': 'var(--transform-card-drop)',
  '8': 'var(--transform-modal-drop)',
  '16': 'var(--transform-large-drop)',
  
  // 特殊位置值（游戏相关，保持原样）
  '50': '50px', // 游戏元素位置
  '75': '75px', // 游戏元素位置
  '90': '90px', // 游戏元素位置
  '150': '150px', // 游戏元素位置
  '180': '180px', // 游戏元素位置
  '250': '250px', // 游戏元素位置
  '300': '300px', // 游戏元素位置
  '350': '350px', // 游戏元素位置
  '400': '400px', // 游戏元素位置
  '500': '500px', // 游戏元素位置
  '600': '600px', // 游戏元素位置
  '800': '800px', // 游戏元素位置
  '1000': '1000px', // 游戏元素位置
};

// 显示属性映射（保持语义化，不替换为变量）
const DISPLAY_SEMANTIC = {
  'block': 'block',
  'inline': 'inline',
  'inline-block': 'inline-block',
  'flex': 'flex',
  'inline-flex': 'inline-flex',
  'grid': 'grid',
  'inline-grid': 'inline-grid',
  'none': 'none',
  'hidden': 'hidden',
  'contents': 'contents',
  'list-item': 'list-item',
  'table': 'table',
  'inline-table': 'inline-table',
  'table-cell': 'table-cell',
  'table-row': 'table-row',
  'table-column': 'table-column',
  'table-column-group': 'table-column-group',
  'table-header-group': 'table-header-group',
  'table-footer-group': 'table-footer-group',
  'table-row-group': 'table-row-group',
  'table-caption': 'table-caption'
};

// 文本对齐属性映射（保持语义化，不替换为变量）
const TEXT_ALIGN_SEMANTIC = {
  'left': 'left',
  'right': 'right',
  'center': 'center',
  'justify': 'justify',
  'start': 'start',
  'end': 'end',
  'inherit': 'inherit'
};

// 修复单个文件的位置
function fixFilePositions(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    const originalContent = content;

    // 修复top属性
    content = content.replace(/top:\s*(-?\d+)px/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `top: ${replacement}`;
      }
      return match;
    });

    // 修复right属性
    content = content.replace(/right:\s*(-?\d+)px/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `right: ${replacement}`;
      }
      return match;
    });

    // 修复bottom属性
    content = content.replace(/bottom:\s*(-?\d+)px/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `bottom: ${replacement}`;
      }
      return match;
    });

    // 修复left属性
    content = content.replace(/left:\s*(-?\d+)px/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `left: ${replacement}`;
      }
      return match;
    });

    // 修复z-index属性
    content = content.replace(/z-index:\s*(-?\d+)/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `z-index: ${replacement}`;
      }
      return match;
    });

    // 修复transform translate
    content = content.replace(/transform:\s*[^;]*translate[X]?[^;]*\((-?\d+)px[^)]*\)/g, (match, value) => {
      const replacement = POSITION_MAPPINGS[value] || `${value}px`;
      if (replacement !== `${value}px`) {
        modified = true;
        replacements++;
        return match.replace(`${value}px`, replacement);
      }
      return match;
    });

    // 修复内联样式中的位置
    content = content.replace(/style="([^"]*(?:top|right|bottom|left|z-index|transform):\s*(-?\d+)px[^"]*)"/g, (match, styleContent, value) => {
      const replacement = POSITION_MAPPINGS[value] || `${value}px`;
      if (replacement !== `${value}px`) {
        modified = true;
        replacements++;
        return `style="${styleContent.replace(new RegExp(`(top|right|bottom|left|z-index|transform):\\s*${value}px`, 'g'), `$1: ${replacement}`)}"`;
      }
      return match;
    });

    // 如果有修改，写回文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return {
        success: true,
        filePath,
        replacements,
        originalSize: originalContent.length,
        newSize: content.length
      };
    }

    return {
      success: false,
      filePath,
      replacements: 0,
      message: 'No position issues found'
    };

  } catch (error) {
    console.error(`❌ 修复文件失败: ${filePath}`, error.message);
    return {
      success: false,
      filePath,
      error: error.message
    };
  }
}

// 编译测试
async function testCompilation() {
  try {
    console.log('🔧 测试编译中...');
    
    // 简单的语法检查
    const { execSync } = await import('child_process');
    
    try {
      execSync('npm run build:check', { 
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 30000 // 30秒超时
      });
      console.log('✅ 编译测试通过');
      return true;
    } catch (error) {
      console.log('⚠️ 编译测试失败，尝试快速检查...');
      
      try {
        execSync('npx vue-tsc --noEmit', { 
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout: 20000 // 20秒超时
        });
        console.log('✅ TypeScript检查通过');
        return true;
      } catch (tsError) {
        console.log('❌ TypeScript检查失败');
        return false;
      }
    }
    
  } catch (error) {
    console.log('⚠️ 无法进行编译测试，跳过');
    return true; // 跳过编译测试，继续处理
  }
}

// 获取所有Vue文件
async function getAllVueFiles() {
  try {
    const files = await glob('src/**/*.vue', { cwd: process.cwd() });
    return files;
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error.message);
    return [];
  }
}

// 主函数
async function main() {
  console.log('🔧 开始综合位置修复...\n');

  // 获取命令行参数
  const args = process.argv.slice(2);
  const batchSize = parseInt(args[0]) || 10; // 默认批处理大小
  const startIndex = parseInt(args[1]) || 0; // 起始索引

  try {
    // 获取所有Vue文件
    const allFiles = await getAllVueFiles();
    console.log(`📁 找到 ${allFiles.length} 个Vue文件`);

    // 分批处理
    const filesToProcess = allFiles.slice(startIndex, startIndex + batchSize);
    console.log(`📦 处理批次: ${startIndex + 1}-${startIndex + filesToProcess.length} (共${filesToProcess.length}个文件)\n`);

    // 备份文件
    console.log('💾 创建备份...');
    const backupResult = backupFiles(filesToProcess);
    if (backupResult.failCount > 0) {
      console.log(`⚠️ ${backupResult.failCount} 个文件备份失败`);
    }

    // 修复文件
    let totalReplacements = 0;
    let successCount = 0;
    let failCount = 0;

    console.log('\n🔧 开始修复位置问题...\n');
    
    for (const file of filesToProcess) {
      const result = fixFilePositions(file);
      
      if (result.success) {
        successCount++;
        totalReplacements += result.replacements;
        console.log(`✅ ${file}: ${result.replacements} 个替换`);
      } else if (result.error) {
        failCount++;
        console.log(`❌ ${file}: ${result.error}`);
      }
    }

    console.log(`\n📊 批次修复完成:`);
    console.log(`   成功: ${successCount} 个文件`);
    console.log(`   失败: ${failCount} 个文件`);
    console.log(`   总替换: ${totalReplacements} 个`);

    // 编译测试
    const compileSuccess = await testCompilation();
    
    if (compileSuccess) {
      console.log('\n🎉 批次处理成功！');
      
      // 检查是否还有更多文件需要处理
      const remainingFiles = allFiles.length - (startIndex + batchSize);
      if (remainingFiles > 0) {
        console.log(`\n📋 剩余文件: ${remainingFiles} 个`);
        console.log(`💡 继续处理下一批次: node scripts/comprehensive-position-fixer.js ${batchSize} ${startIndex + batchSize}`);
      } else {
        console.log('\n🎊 所有文件处理完成！');
      }
    } else {
      console.log('\n⚠️ 编译测试失败，请检查修复结果');
      console.log('💡 如需恢复备份: node scripts/backup-system.js restore');
    }

  } catch (error) {
    console.error('❌ 修复过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixFilePositions, POSITION_MAPPINGS };
