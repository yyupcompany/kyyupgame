#!/usr/bin/env node

/**
 * 按钮布局修复脚本
 * 
 * 功能：
 * 1. 扫描所有Vue文件中的按钮布局
 * 2. 识别常见的按钮错位模式
 * 3. 自动应用统一的按钮样式类
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, '../client/src');

// 按钮布局模式
const BUTTON_PATTERNS = {
  // 表格操作按钮
  tableActions: {
    pattern: /<el-table[\s\S]*?<template[^>]*#default="scope"[\s\S]*?<el-button/,
    replacement: 'table-action-buttons',
    description: '表格操作按钮'
  },
  
  // 表单底部按钮
  formFooter: {
    pattern: /<el-form[\s\S]*?<el-button[^>]*type="primary"[\s\S]*?<el-button/,
    replacement: 'form-footer-buttons',
    description: '表单底部按钮'
  },
  
  // 卡片头部按钮
  cardHeader: {
    pattern: /<el-card[\s\S]*?<template[^>]*#header[\s\S]*?<el-button/,
    replacement: 'card-header-buttons',
    description: '卡片头部按钮'
  },
  
  // 对话框底部按钮
  dialogFooter: {
    pattern: /<el-dialog[\s\S]*?<template[^>]*#footer[\s\S]*?<el-button/,
    replacement: 'dialog-footer-buttons',
    description: '对话框底部按钮'
  },
  
  // 抽屉底部按钮
  drawerFooter: {
    pattern: /<el-drawer[\s\S]*?<template[^>]*#footer[\s\S]*?<el-button/,
    replacement: 'drawer-footer-buttons',
    description: '抽屉底部按钮'
  }
};

const issues = [];
const fixes = [];

function scanFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否包含el-button
  if (!content.includes('el-button')) {
    return;
  }
  
  const fileIssues = [];
  
  // 检查表格操作按钮
  if (content.includes('el-table') && content.includes('scope')) {
    const hasTableActionClass = content.includes('table-action-buttons');
    
    if (!hasTableActionClass) {
      // 检查是否有多个按钮在一起
      const buttonMatches = content.match(/<el-button[^>]*>[^<]*<\/el-button>\s*<el-button/g);
      
      if (buttonMatches && buttonMatches.length > 0) {
        fileIssues.push({
          type: 'table-actions',
          description: '表格操作按钮未使用统一样式类',
          suggestion: '添加 class="table-action-buttons" 到按钮容器'
        });
      }
    }
  }
  
  // 检查表单底部按钮
  if (content.includes('el-form')) {
    const hasFormFooterClass = content.includes('form-footer-buttons');
    
    if (!hasFormFooterClass) {
      // 检查是否有提交和取消按钮
      const hasSubmit = content.includes('type="primary"') || content.includes('提交') || content.includes('保存');
      const hasCancel = content.includes('取消');
      
      if (hasSubmit && hasCancel) {
        fileIssues.push({
          type: 'form-footer',
          description: '表单底部按钮未使用统一样式类',
          suggestion: '添加 class="form-footer-buttons" 到按钮容器'
        });
      }
    }
  }
  
  // 检查卡片头部按钮
  if (content.includes('el-card')) {
    const hasCardHeaderClass = content.includes('card-header-buttons');
    
    if (!hasCardHeaderClass && content.includes('#header')) {
      fileIssues.push({
        type: 'card-header',
        description: '卡片头部按钮未使用统一样式类',
        suggestion: '添加 class="card-header-buttons" 到按钮容器'
      });
    }
  }
  
  // 检查对话框底部按钮
  if (content.includes('el-dialog')) {
    const hasDialogFooterClass = content.includes('dialog-footer-buttons');
    
    if (!hasDialogFooterClass && content.includes('#footer')) {
      fileIssues.push({
        type: 'dialog-footer',
        description: '对话框底部按钮未使用统一样式类',
        suggestion: '添加 class="dialog-footer-buttons" 到按钮容器'
      });
    }
  }
  
  // 检查抽屉底部按钮
  if (content.includes('el-drawer')) {
    const hasDrawerFooterClass = content.includes('drawer-footer-buttons');
    
    if (!hasDrawerFooterClass && content.includes('#footer')) {
      fileIssues.push({
        type: 'drawer-footer',
        description: '抽屉底部按钮未使用统一样式类',
        suggestion: '添加 class="drawer-footer-buttons" 到按钮容器'
      });
    }
  }
  
  if (fileIssues.length > 0) {
    issues.push({
      file: relativePath,
      issues: fileIssues
    });
  }
}

function scanDirectory(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    // 跳过node_modules和隐藏文件
    if (file.startsWith('.') || file === 'node_modules') {
      return;
    }
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, path.join(basePath, file));
    } else if (file.endsWith('.vue')) {
      const relativePath = path.join(basePath, file);
      scanFile(filePath, relativePath);
    }
  });
}

console.log('🔍 开始扫描按钮布局问题...\n');

// 扫描pages目录
const pagesDir = path.join(clientDir, 'pages');
scanDirectory(pagesDir, 'pages');

// 扫描components目录
const componentsDir = path.join(clientDir, 'components');
scanDirectory(componentsDir, 'components');

console.log('\n📊 扫描结果统计:\n');
console.log(`扫描的文件: ${issues.length} 个文件有按钮布局问题\n`);

if (issues.length > 0) {
  console.log('📋 按钮布局问题详情:\n');
  
  // 按问题类型分组
  const byType = {};
  
  issues.forEach(item => {
    item.issues.forEach(issue => {
      if (!byType[issue.type]) {
        byType[issue.type] = [];
      }
      byType[issue.type].push(item.file);
    });
  });
  
  Object.keys(byType).forEach(type => {
    console.log(`\n${type}:`);
    console.log(`  文件数: ${byType[type].length}`);
    console.log(`  示例文件:`);
    byType[type].slice(0, 5).forEach(file => {
      console.log(`    - ${file}`);
    });
    if (byType[type].length > 5) {
      console.log(`    ... 还有 ${byType[type].length - 5} 个文件`);
    }
  });
  
  console.log('\n\n💡 修复建议:\n');
  console.log('1. 表格操作按钮:');
  console.log('   在按钮容器上添加: class="table-action-buttons"');
  console.log('   示例: <div class="table-action-buttons">');
  console.log('           <el-button>查看</el-button>');
  console.log('           <el-button>编辑</el-button>');
  console.log('         </div>\n');
  
  console.log('2. 表单底部按钮:');
  console.log('   在按钮容器上添加: class="form-footer-buttons"');
  console.log('   示例: <div class="form-footer-buttons">');
  console.log('           <el-button type="primary">保存</el-button>');
  console.log('           <el-button>取消</el-button>');
  console.log('         </div>\n');
  
  console.log('3. 卡片头部按钮:');
  console.log('   在按钮容器上添加: class="card-header-buttons"');
  console.log('   示例: <div class="card-header-buttons">');
  console.log('           <el-button>新增</el-button>');
  console.log('           <el-button>导出</el-button>');
  console.log('         </div>\n');
  
  console.log('4. 对话框/抽屉底部按钮:');
  console.log('   在footer插槽中添加对应的样式类');
  console.log('   示例: <template #footer>');
  console.log('           <div class="dialog-footer-buttons">');
  console.log('             <el-button type="primary">确定</el-button>');
  console.log('             <el-button>取消</el-button>');
  console.log('           </div>');
  console.log('         </template>\n');
  
  // 生成修复报告
  const reportPath = 'BUTTON_LAYOUT_ISSUES.md';
  let report = '# 按钮布局问题报告\n\n';
  report += `**扫描时间**: ${new Date().toLocaleString()}\n\n`;
  report += `**问题文件数**: ${issues.length}\n\n`;
  report += '---\n\n';
  
  Object.keys(byType).forEach(type => {
    report += `## ${type}\n\n`;
    report += `**文件数**: ${byType[type].length}\n\n`;
    report += '**文件列表**:\n\n';
    byType[type].forEach(file => {
      report += `- ${file}\n`;
    });
    report += '\n';
  });
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
} else {
  console.log('✅ 未发现明显的按钮布局问题');
  console.log('\n💡 提示:');
  console.log('   如果仍有按钮错位问题，可能是CSS样式冲突');
  console.log('   请检查页面中是否有自定义的按钮样式覆盖了统一样式');
}

console.log('\n✨ 扫描完成！');

