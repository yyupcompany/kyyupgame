#!/usr/bin/env node

/**
 * 增强版颜色替换脚本 - 支持RGBA和主题适配
 * Enhanced Color Replacement Script - RGBA and Theme Support
 */

import fs from 'fs';
import path from 'path';

// 增强的颜色映射表，包含RGBA和主题适配
const enhancedColorMap = {
  // ===== 基础十六进制颜色 =====
  '#409eff': 'var(--primary-color)',
  '#337ecc': 'var(--primary-hover)',
  '#79bbff': 'var(--primary-light)',
  '#a0cfff': 'var(--primary-lighter)',
  '#c6e2ff': 'var(--primary-extra-light)',
  
  '#67c23a': 'var(--success-color)',
  '#85ce61': 'var(--success-light)',
  '#b3e19d': 'var(--success-lighter)',
  '#e1f3d8': 'var(--success-extra-light)',
  
  '#e6a23c': 'var(--warning-color)',
  '#ebb563': 'var(--warning-light)',
  '#f0c78a': 'var(--warning-lighter)',
  '#f5dab1': 'var(--warning-extra-light)',
  
  '#f56c6c': 'var(--danger-color)',
  '#f78989': 'var(--danger-light)',
  '#fab6b6': 'var(--danger-lighter)',
  '#fcd3d3': 'var(--danger-extra-light)',
  
  '#909399': 'var(--info-color)',
  '#a6a9ad': 'var(--info-light)',
  '#c8c9cc': 'var(--info-lighter)',
  '#dedfe0': 'var(--info-extra-light)',
  
  // ===== 文本颜色 =====
  '#303133': 'var(--text-primary)',
  '#606266': 'var(--text-regular)',
  '#909399': 'var(--text-secondary)',
  '#a8abb2': 'var(--text-tertiary)',
  '#c0c4cc': 'var(--text-placeholder)',
  '#dcdfe6': 'var(--text-disabled)',
  
  // ===== 背景颜色 =====
  '#ffffff': 'var(--bg-color)',
  '#f8fafc': 'var(--bg-primary-light)',
  '#f2f3f5': 'var(--bg-color-page)',
  '#f5f7fa': 'var(--bg-hover)',
  '#fafafa': 'var(--bg-tertiary)',
  '#f1f5f9': 'var(--bg-secondary-light)',
  '#e2e8f0': 'var(--bg-tertiary-light)',
  
  // ===== 边框颜色 =====
  '#dcdfe6': 'var(--border-color)',
  '#e4e7ed': 'var(--border-color-light)',
  '#ebeef5': 'var(--border-color-lighter)',
  '#cbd5e1': 'var(--text-secondary-dark)',
  '#e2e8f0': 'var(--border-light-dark)',
  
  // ===== 暗黑主题专用 =====
  '#1e293b': 'var(--text-primary-dark)',
  '#334155': 'var(--bg-hover-dark)',
  '#475569': 'var(--text-regular-dark)',
  '#64748b': 'var(--text-muted-dark)',
  '#94a3b8': 'var(--text-disabled-dark)',
  
  // ===== 中心点缀色 =====
  '#6366F1': 'var(--accent-personnel)',
  '#3B82F6': 'var(--accent-enrollment)',
  '#F59E0B': 'var(--accent-activity)',
  '#8B5CF6': 'var(--accent-marketing)',
  '#06B6D4': 'var(--accent-system)',
  '#0EA5E9': 'var(--accent-ai)',
  
  // ===== RGBA颜色映射（支持透明度） =====
  // 白色系 RGBA
  'rgba(255, 255, 255, 0.1)': 'var(--glass-bg-light)',
  'rgba(255, 255, 255, 0.15)': 'var(--glass-bg-medium)',
  'rgba(255, 255, 255, 0.2)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.25)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.3)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.4)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.5)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.75)': 'var(--text-on-primary-secondary)',
  'rgba(255, 255, 255, 0.9)': 'var(--text-on-primary)',
  
  // 黑色系 RGBA
  'rgba(0, 0, 0, 0.1)': 'var(--shadow-light)',
  'rgba(0, 0, 0, 0.2)': 'var(--shadow-medium)',
  'rgba(0, 0, 0, 0.3)': 'var(--shadow-heavy)',
  'rgba(0, 0, 0, 0.4)': 'var(--shadow-heavy)',
  'rgba(0, 0, 0, 0.5)': 'var(--shadow-heavy)',
  'rgba(0, 0, 0, 0.6)': 'var(--shadow-heavy)',
  
  // 紫色系 RGBA (营销/AI主题)
  'rgba(139, 92, 246, 0.1)': 'var(--accent-marketing-light)',
  'rgba(139, 92, 246, 0.15)': 'var(--accent-marketing-light)',
  'rgba(139, 92, 246, 0.2)': 'var(--accent-marketing-medium)',
  'rgba(139, 92, 246, 0.25)': 'var(--accent-marketing-medium)',
  'rgba(139, 92, 246, 0.3)': 'var(--accent-marketing-heavy)',
  'rgba(139, 92, 246, 0.4)': 'var(--accent-marketing-heavy)',
  'rgba(139, 92, 246, 0.5)': 'var(--accent-marketing-heavy)',
  'rgba(139, 92, 246, 0.6)': 'var(--accent-marketing-heavy)',
  
  // 紫色系 RGBA (hover状态)
  'rgba(167, 139, 250, 0.1)': 'var(--accent-marketing-hover-light)',
  'rgba(167, 139, 250, 0.15)': 'var(--accent-marketing-hover-light)',
  'rgba(167, 139, 250, 0.2)': 'var(--accent-marketing-hover-medium)',
  'rgba(167, 139, 250, 0.25)': 'var(--accent-marketing-hover-medium)',
  'rgba(167, 139, 250, 0.3)': 'var(--accent-marketing-hover-heavy)',
  'rgba(167, 139, 250, 0.4)': 'var(--accent-marketing-hover-heavy)',
  'rgba(167, 139, 250, 0.5)': 'var(--accent-marketing-hover-heavy)',
  'rgba(167, 139, 250, 0.6)': 'var(--accent-marketing-hover-heavy)',
  
  // 蓝色系 RGBA (链接/按钮)
  'rgba(59, 130, 246, 0.1)': 'var(--accent-enrollment-light)',
  'rgba(59, 130, 246, 0.15)': 'var(--accent-enrollment-light)',
  'rgba(59, 130, 246, 0.2)': 'var(--accent-enrollment-medium)',
  'rgba(59, 130, 246, 0.25)': 'var(--accent-enrollment-medium)',
  'rgba(59, 130, 246, 0.3)': 'var(--accent-enrollment-heavy)',
  'rgba(59, 130, 246, 0.4)': 'var(--accent-enrollment-heavy)',
  'rgba(59, 130, 246, 0.5)': 'var(--accent-enrollment-heavy)',
  'rgba(59, 130, 246, 0.6)': 'var(--accent-enrollment-heavy)',
  
  // 蓝色系 RGBA (hover状态)
  'rgba(37, 99, 235, 0.1)': 'var(--accent-enrollment-hover-light)',
  'rgba(37, 99, 235, 0.15)': 'var(--accent-enrollment-hover-light)',
  'rgba(37, 99, 235, 0.2)': 'var(--accent-enrollment-hover-medium)',
  'rgba(37, 99, 235, 0.25)': 'var(--accent-enrollment-hover-medium)',
  'rgba(37, 99, 235, 0.3)': 'var(--accent-enrollment-hover-heavy)',
  'rgba(37, 99, 235, 0.4)': 'var(--accent-enrollment-hover-heavy)',
  'rgba(37, 99, 235, 0.5)': 'var(--accent-enrollment-hover-heavy)',
  'rgba(37, 99, 235, 0.6)': 'var(--accent-enrollment-hover-heavy)',
  
  // 特殊颜色
  '#60a5fa': 'var(--accent-enrollment)',
  '#2563eb': 'var(--accent-enrollment-hover)',
  '#dc2626': 'var(--danger-color)',
  '#fbbf24': 'var(--warning-color)',
  '#111827': 'var(--text-primary-dark)',
  '#f3f4f6': 'var(--bg-secondary-light)',
  '#fef2f2': 'var(--danger-light-bg)',
  
  // ===== 渐变色映射 =====
  'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)': 'var(--gradient-glass)',
  'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)': 'var(--gradient-light-glass)',
  'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)': 'var(--gradient-accent-hover)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)': 'var(--gradient-purple)',
  'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)': 'var(--gradient-purple-hover)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)': 'var(--gradient-danger)',
  'linear-gradient(135deg, #f87171 0%, #ef4444 100%)': 'var(--gradient-danger-hover)',
};

// 主题感知的颜色替换函数
function themeAwareColorReplace(content) {
  let replacedContent = content;
  
  // 处理简单颜色替换
  Object.entries(enhancedColorMap).forEach(([color, replacement]) => {
    if (typeof replacement === 'string') {
      // 定义替换模式
      const patterns = [
        // CSS属性中的颜色
        new RegExp(`color:\s*${escapeRegExp(color)}`, 'gi'),
        new RegExp(`background:\s*${escapeRegExp(color)}`, 'gi'),
        new RegExp(`background-color:\s*${escapeRegExp(color)}`, 'gi'),
        new RegExp(`border-color:\s*${escapeRegExp(color)}`, 'gi'),
        new RegExp(`border:\s*[^;]*${escapeRegExp(color)}`, 'gi'),
        new RegExp(`box-shadow:[^;]*${escapeRegExp(color)}`, 'gi'),
        
        // Vue模板中的颜色
        new RegExp(`"${escapeRegExp(color)}"`, 'g'),
        new RegExp(`'${escapeRegExp(color)}'`, 'g'),
        
        // JavaScript中的颜色
        new RegExp(`:\s*${escapeRegExp(color)}`, 'g'),
        new RegExp(`=\s*${escapeRegExp(color)}`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        replacedContent = replacedContent.replace(pattern, (match) => {
          return match.replace(color, replacement);
        });
      });
      
      // 处理渐变中的颜色
      if (color.includes('linear-gradient')) {
        replacedContent = replacedContent.replace(new RegExp(escapeRegExp(color), 'g'), replacement);
      }
    }
  });
  
  return replacedContent;
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalColorCount = (content.match(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/g) || []).length;
    
    if (originalColorCount === 0) {
      return { processed: false, colorsFound: 0, colorsReplaced: 0 };
    }
    
    const processedContent = themeAwareColorReplace(content);
    const remainingColorCount = (processedContent.match(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/g) || []).length;
    const colorsReplaced = originalColorCount - remainingColorCount;
    
    if (colorsReplaced > 0) {
      fs.writeFileSync(filePath, processedContent, 'utf8');
      console.log(`✅ ${filePath}: 替换了 ${colorsReplaced} 个颜色`);
    }
    
    return { 
      processed: colorsReplaced > 0, 
      colorsFound: originalColorCount, 
      colorsReplaced 
    };
    
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    return { processed: false, colorsFound: 0, colorsReplaced: 0 };
  }
}

// 主函数
async function main() {
  console.log('🚀 开始增强版颜色替换...\n');
  
  try {
    // 查找所有Vue文件
    const { glob } = await import('glob');
    const vueFiles = await glob('**/*.vue', {
      ignore: ['node_modules/**', 'dist/**', '.git/**']
    });
    
    console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);
    
    // 统计结果
    let totalProcessed = 0;
    let totalColorsFound = 0;
    let totalColorsReplaced = 0;
    
    // 处理所有文件
    for (const file of vueFiles) {
      const result = processFile(file);
      if (result.processed) {
        totalProcessed++;
      }
      totalColorsFound += result.colorsFound;
      totalColorsReplaced += result.colorsReplaced;
    }
    
    // 输出统计结果
    console.log('\n📊 处理完成统计:');
    console.log(`   处理文件数: ${totalProcessed}`);
    console.log(`   发现颜色总数: ${totalColorsFound}`);
    console.log(`   替换颜色数: ${totalColorsReplaced}`);
    console.log(`   替换率: ${((totalColorsReplaced / totalColorsFound) * 100).toFixed(2)}%`);
    
    if (totalColorsReplaced > 0) {
      console.log('\n✨ 颜色替换完成！建议运行验证脚本检查结果。');
    } else {
      console.log('\n💡 没有找到需要替换的颜色。');
    }
    
  } catch (error) {
    console.error('❌ 处理过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { themeAwareColorReplace, enhancedColorMap };