#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 扩展的颜色映射表，包含更多特殊场景
const extendedColorMap = {
  // 基础颜色映射
  '#409eff': 'var(--primary-color)',
  '#337ecc': 'var(--primary-hover)',
  '#79bbff': 'var(--primary-light)',
  '#67c23a': 'var(--success-color)',
  '#85ce61': 'var(--success-light)',
  '#e6a23c': 'var(--warning-color)',
  '#f56c6c': 'var(--danger-color)',
  '#909399': 'var(--info-color)',
  
  // 文本颜色
  '#303133': 'var(--text-primary)',
  '#606266': 'var(--text-regular)',
  '#a8abb2': 'var(--text-tertiary)',
  '#c0c4cc': 'var(--text-placeholder)',
  '#dcdfe6': 'var(--text-disabled)',
  
  // 背景颜色
  '#ffffff': 'var(--bg-color)',
  '#f8fafc': 'var(--text-primary-light)',
  '#f5f7fa': 'var(--bg-hover)',
  '#fafafa': 'var(--bg-tertiary)',
  '#f5f5f5': 'var(--bg-secondary)',
  '#e4e7ed': 'var(--border-color-light)',
  '#ebeef5': 'var(--border-color-lighter)',
  
  // 边框颜色
  '#dcdfe6': 'var(--border-color)',
  '#e4e7ed': 'var(--border-color-light)',
  '#334155': 'var(--bg-hover-dark)',
  '#1e293b': 'var(--text-primary-dark)',
  '#cbd5e1': 'var(--text-secondary-dark)',
  '#94a3b8': 'var(--text-muted)',
  
  // 中心点缀色
  '#6366F1': 'var(--accent-personnel)',
  '#3B82F6': 'var(--accent-enrollment)',
  '#F59E0B': 'var(--accent-activity)',
  '#8B5CF6': 'var(--accent-marketing)',
  '#06B6D4': 'var(--accent-system)',
  '#0EA5E9': 'var(--accent-ai)',
  
  // 渐变色
  'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)': 'var(--gradient-success)',
  
  // 特殊处理
  '#000000': {
    replacement: 'var(--text-primary)',
    contexts: ['text', 'color', 'font']
  },
  '#f8fafc': {
    replacement: 'var(--text-primary-light)',
    contexts: ['text', 'color', 'font', 'markdown', 'editor']
  }
};

// 智能颜色替换函数
function smartReplaceAllColors(content) {
  let replacedContent = content;
  
  Object.entries(extendedColorMap).forEach(([color, replacement]) => {
    if (typeof replacement === 'string') {
      // 简单替换
      const patterns = [
        new RegExp(`color:\\s*${color}`, 'gi'),
        new RegExp(`background:\\s*${color}`, 'gi'),
        new RegExp(`background-color:\\s*${color}`, 'gi'),
        new RegExp(`border-color:\\s*${color}`, 'gi'),
        new RegExp(`border:\\s*1px solid ${color}`, 'gi'),
        new RegExp(`"${color}"`, 'g'),
        new RegExp(`'${color}'`, 'g'),
        new RegExp(`:\\s*${color}`, 'g'),
        new RegExp(`color:\\s*\\$\\{[^}]*\\}\\s*${color}`, 'g'), // Vue表达式中的颜色
      ];
      
      patterns.forEach(pattern => {
        replacedContent = replacedContent.replace(pattern, (match) => {
          if (match.includes('color:')) {
            return match.replace(color, replacement);
          } else if (match.includes('background') || match.includes('border')) {
            return match.replace(color, replacement);
          } else {
            return match.replace(color, replacement);
          }
        });
      });
    } else if (typeof replacement === 'object') {
      // 上下文感知替换
      const { replacement: repl, contexts } = replacement;
      
      // 检测文件上下文
      const hasContext = contexts.some(context => 
        content.toLowerCase().includes(context)
      );
      
      if (hasContext) {
        const patterns = [
          new RegExp(`color:\\s*${color}`, 'gi'),
          new RegExp(`background:\\s*${color}`, 'gi'),
          new RegExp(`background-color:\\s*${color}`, 'gi'),
          new RegExp(`border-color:\\s*${color}`, 'gi'),
          new RegExp(`"${color}"`, 'g'),
          new RegExp(`'${color}'`, 'g'),
          new RegExp(`:\\s*${color}`, 'g'),
        ];
        
        patterns.forEach(pattern => {
          replacedContent = replacedContent.replace(pattern, (match) => {
            return match.replace(color, repl);
          });
        });
      }
    }
  });
  
  return replacedContent;
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 应用智能替换
    const modifiedContent = smartReplaceAllColors(content);
    
    // 如果有修改，写回文件
    if (modifiedContent !== originalContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ 已处理: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    return false;
  }
}

// 递归处理所有Vue文件
function processAllVueFiles() {
  const vueFiles = [];
  
  function collectVueFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // 跳过特定目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          collectVueFiles(filePath);
        }
      } else if (file.endsWith('.vue')) {
        vueFiles.push(filePath);
      }
    });
  }
  
  collectVueFiles(path.join(process.cwd(), 'src'));
  
  console.log(`🎨 开始处理 ${vueFiles.length} 个Vue文件...\n`);
  
  let modifiedCount = 0;
  
  vueFiles.forEach(filePath => {
    if (processFile(filePath)) {
      modifiedCount++;
    }
  });
  
  console.log(`\n📊 处理完成:`);
  console.log(`   - 总文件数: ${vueFiles.length}`);
  console.log(`   - 修改文件数: ${modifiedCount}`);
  console.log(`   - 未修改文件数: ${vueFiles.length - modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log('\n✨ 颜色替换完成！');
  } else {
    console.log('\n💡 没有发现需要修改的颜色。');
  }
}

// 运行脚本
processAllVueFiles();
