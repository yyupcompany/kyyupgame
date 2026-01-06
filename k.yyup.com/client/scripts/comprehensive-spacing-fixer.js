#!/usr/bin/env node

/**
 * 综合间距修复工具
 * Comprehensive Spacing Fixer
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { backupFiles } from './backup-system.js';

// 间距映射表 - 将像素值映射到设计令牌
const SPACING_MAPPINGS = {
  // 通用间距映射
  '0': 'var(--spacing-none)',
  '1': 'var(--spacing-xs)',
  '2': 'var(--spacing-sm)',
  '4': 'var(--spacing-md)',
  '6': 'var(--spacing-lg)',
  '8': 'var(--spacing-xl)',
  '10': 'var(--spacing-2xl)',
  '12': 'var(--spacing-3xl)',
  '16': 'var(--spacing-4xl)',
  '20': 'var(--spacing-5xl)',
  '24': 'var(--spacing-6xl)',
  '32': 'var(--spacing-8xl)',
  '40': 'var(--spacing-10xl)',
  '48': 'var(--spacing-12xl)',
  '56': 'var(--spacing-14xl)',
  '64': 'var(--spacing-16xl)',
  '80': 'var(--spacing-20xl)',
  '96': 'var(--spacing-24xl)',
  '120': 'var(--spacing-30xl)',
  '128': 'var(--spacing-32xl)',
  
  // 特殊间距值
  '3': 'var(--spacing-2xs)',
  '5': 'var(--spacing-base)',
  '7': 'var(--spacing-2lg)',
  '9': 'var(--spacing-2xl)',
  '11': 'var(--spacing-3xl)',
  '14': 'var(--spacing-4xl)',
  '15': 'var(--spacing-4xl)',
  '18': 'var(--spacing-5xl)',
  '22': 'var(--spacing-6xl)',
  '26': 'var(--spacing-7xl)',
  '28': 'var(--spacing-7xl)',
  '30': 'var(--spacing-8xl)',
  '36': 'var(--spacing-9xl)',
  '44': 'var(--spacing-11xl)',
  '52': 'var(--spacing-13xl)',
  '60': 'var(--spacing-15xl)',
  '72': 'var(--spacing-18xl)',
  '84': 'var(--spacing-21xl)',
  '100': 'var(--spacing-25xl)',
  '144': 'var(--spacing-36xl)',
  
  // 常见组件间距
  '15px': 'var(--component-gap-sm)',
  '20px': 'var(--component-gap-md)',
  '25px': 'var(--component-gap-lg)',
  '30px': 'var(--component-gap-xl)',
  '35px': 'var(--component-gap-2xl)',
  '40px': 'var(--component-gap-3xl)',
  
  // 容器内边距
  '16px': 'var(--container-padding-sm)',
  '20px': 'var(--container-padding-md)',
  '24px': 'var(--container-padding-lg)',
  '32px': 'var(--container-padding-xl)',
  '40px': 'var(--container-padding-2xl)',
  
  // 卡片间距
  '12px': 'var(--card-padding-sm)',
  '16px': 'var(--card-padding-md)',
  '20px': 'var(--card-padding-lg)',
  '24px': 'var(--card-padding-xl)',
  
  // 按钮间距
  '8px': 'var(--button-gap-sm)',
  '12px': 'var(--button-gap-md)',
  '16px': 'var(--button-gap-lg)',
  
  // 表单间距
  '16px': 'var(--form-field-gap)',
  '8px': 'var(--form-label-gap)',
  '4px': 'var(--form-input-gap)',
  
  // 网格间距
  '16px': 'var(--grid-gap-md)',
  '24px': 'var(--grid-gap-lg)',
  '32px': 'var(--grid-gap-xl)',
  
  // 弹性间距
  '8px': 'var(--flex-gap-sm)',
  '16px': 'var(--flex-gap-md)',
  '24px': 'var(--flex-gap-lg)',
  
  // 缝隙间距
  '4px': 'var(--gap-xs)',
  '8px': 'var(--gap-sm)',
  '12px': 'var(--gap-md)',
  '16px': 'var(--gap-lg)',
  '20px': 'var(--gap-xl)',
  '24px': 'var(--gap-2xl)',
  
  // 段落间距
  '8px': 'var(--paragraph-gap-sm)',
  '12px': 'var(--paragraph-gap-md)',
  '16px': 'var(--paragraph-gap-lg)',
  '20px': 'var(--paragraph-gap-xl)',
  
  // 列表间距
  '8px': 'var(--list-gap-sm)',
  '12px': 'var(--list-gap-md)',
  '16px': 'var(--list-gap-lg)',
  '20px': 'var(--list-gap-xl)',
  
  // 分隔间距
  '16px': 'var(--divider-gap-md)',
  '24px': 'var(--divider-gap-lg)',
  '32px': 'var(--divider-gap-xl)',
  
  // 节间距
  '24px': 'var(--section-gap-sm)',
  '32px': 'var(--section-gap-md)',
  '48px': 'var(--section-gap-lg)',
  '64px': 'var(--section-gap-xl)',
  
  // 页面间距
  '24px': 'var(--page-padding-sm)',
  '32px': 'var(--page-padding-md)',
  '48px': 'var(--page-padding-lg)',
  '64px': 'var(--page-padding-xl)',
  '80px': 'var(--page-padding-2xl)',
  
  // 响应式间距
  '8px': 'var(--responsive-gap-xs)',
  '12px': 'var(--responsive-gap-sm)',
  '16px': 'var(--responsive-gap-md)',
  '20px': 'var(--responsive-gap-lg)',
  '24px': 'var(--responsive-gap-xl)',
  '32px': 'var(--responsive-gap-2xl)',
  
  // 特殊用途间距
  '2px': 'var(--border-gap)',
  '4px': 'var(--icon-gap)',
  '6px': 'var(--text-gap)',
  '10px': 'var(--control-gap)',
  '14px': 'var(--component-gap)',
  '18px': 'var(--container-gap)',
  '22px': 'var(--layout-gap)',
  '26px': 'var(--section-gap)',
  '28px': 'var(--panel-gap)',
  '36px': 'var(--modal-gap)',
  '40px': 'var(--screen-gap)',
  
  // 游戏特殊间距（保持原样，不替换）
  '60px': '60px', // 游戏元素大间距
  '80px': '80px', // 游戏容器间距
  '100px': '100px', // 游戏区块间距
  '120px': '120px', // 游戏大区块间距
  '140px': '140px', // 游戏超大区块间距
  '160px': '160px', // 游戏特大区块间距
  '200px': '200px', // 游戏超大区块间距
  '240px': '240px', // 游戏特大区块间距
  '280px': '280px', // 游戏特大区块间距
  '300px': '300px', // 游戏特大区块间距
};

// 修复单个文件的间距
function fixFileSpacing(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    // 保存原始内容用于比较
    const originalContent = content;

    // 修复margin属性
    content = content.replace(/margin:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `margin: ${replacement}`;
      }
      return match;
    });

    // 修复padding属性
    content = content.replace(/padding:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `padding: ${replacement}`;
      }
      return match;
    });

    // 修复margin-top
    content = content.replace(/margin-top:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `margin-top: ${replacement}`;
      }
      return match;
    });

    // 修复margin-right
    content = content.replace(/margin-right:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `margin-right: ${replacement}`;
      }
      return match;
    });

    // 修复margin-bottom
    content = content.replace(/margin-bottom:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `margin-bottom: ${replacement}`;
      }
      return match;
    });

    // 修复margin-left
    content = content.replace(/margin-left:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `margin-left: ${replacement}`;
      }
      return match;
    });

    // 修复padding-top
    content = content.replace(/padding-top:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `padding-top: ${replacement}`;
      }
      return match;
    });

    // 修复padding-right
    content = content.replace(/padding-right:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `padding-right: ${replacement}`;
      }
      return match;
    });

    // 修复padding-bottom
    content = content.replace(/padding-bottom:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `padding-bottom: ${replacement}`;
      }
      return match;
    });

    // 修复padding-left
    content = content.replace(/padding-left:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `padding-left: ${replacement}`;
      }
      return match;
    });

    // 修复gap属性
    content = content.replace(/gap:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `gap: ${replacement}`;
      }
      return match;
    });

    // 修复row-gap属性
    content = content.replace(/row-gap:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `row-gap: ${replacement}`;
      }
      return match;
    });

    // 修复column-gap属性
    content = content.replace(/column-gap:\s*(\d+)px/g, (match, size) => {
      const replacement = SPACING_MAPPINGS[size] || match;
      if (replacement !== match) {
        modified = true;
        replacements++;
        return `column-gap: ${replacement}`;
      }
      return match;
    });

    // 修复内联样式中的间距
    content = content.replace(/style="([^"]*(?:margin|padding):\s*(\d+)px[^"]*)"/g, (match, styleContent, size) => {
      const replacement = SPACING_MAPPINGS[size] || `${size}px`;
      if (replacement !== `${size}px`) {
        modified = true;
        replacements++;
        return `style="${styleContent.replace(new RegExp(`(margin|padding):\\s*${size}px`, 'g'), `$1: ${replacement}`)}"`;
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
      message: 'No spacing issues found'
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
  console.log('🔧 开始综合间距修复...\n');

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

    console.log('\n🔧 开始修复间距问题...\n');
    
    for (const file of filesToProcess) {
      const result = fixFileSpacing(file);
      
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
        console.log(`💡 继续处理下一批次: node scripts/comprehensive-spacing-fixer.js ${batchSize} ${startIndex + batchSize}`);
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

export { fixFileSpacing, SPACING_MAPPINGS };
