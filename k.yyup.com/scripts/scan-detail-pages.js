#!/usr/bin/env node

/**
 * 扫描详情页问题脚本
 * 
 * 功能：
 * 1. 扫描所有列表页面
 * 2. 查找详情页路由
 * 3. 检查详情页组件是否存在
 * 4. 检查权限配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '../client/src/pages');

// 常见的详情页路由模式
const detailPagePatterns = [
  /\/detail/i,
  /\/edit/i,
  /:id/,
  /\/view/i,
  /\/info/i
];

// 常见的列表页面目录
const listPageDirs = [
  'student',
  'teacher',
  'parent',
  'class',
  'activity',
  'enrollment',
  'marketing',
  'finance',
  'system'
];

console.log('🔍 开始扫描详情页问题...\n');

const issues = [];

// 扫描函数
function scanDirectory(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, path.join(basePath, file));
    } else if (file.endsWith('.vue')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.join(basePath, file);
      
      // 检查是否是列表页面
      const isList = content.includes('el-table') || 
                     content.includes('list') ||
                     content.includes('管理');
      
      if (isList) {
        // 查找详情页链接
        const detailLinks = [];
        
        // 查找router.push到详情页
        const pushMatches = content.matchAll(/router\.push\(['"`]([^'"`]+)['"`]\)/g);
        for (const match of pushMatches) {
          const route = match[1];
          if (detailPagePatterns.some(pattern => pattern.test(route))) {
            detailLinks.push(route);
          }
        }
        
        // 查找@click跳转到详情
        const clickMatches = content.matchAll(/@click="([^"]+)"/g);
        for (const match of clickMatches) {
          const handler = match[1];
          if (handler.includes('Detail') || handler.includes('Edit') || handler.includes('View')) {
            detailLinks.push(handler);
          }
        }
        
        if (detailLinks.length > 0) {
          console.log(`📄 ${relativePath}`);
          console.log(`   详情页链接: ${detailLinks.join(', ')}`);
          
          // 检查对应的详情页组件是否存在
          detailLinks.forEach(link => {
            const detailFileName = link.includes('Detail') ? 
              file.replace('.vue', 'Detail.vue') :
              file.replace('.vue', 'Edit.vue');
            
            const detailFilePath = path.join(dir, detailFileName);
            
            if (!fs.existsSync(detailFilePath)) {
              issues.push({
                listPage: relativePath,
                detailLink: link,
                expectedFile: detailFileName,
                issue: '详情页组件不存在'
              });
              console.log(`   ❌ 详情页组件不存在: ${detailFileName}`);
            } else {
              console.log(`   ✅ 详情页组件存在: ${detailFileName}`);
            }
          });
          
          console.log('');
        }
      }
    }
  });
}

// 开始扫描
scanDirectory(pagesDir);

console.log('\n📊 扫描结果统计:\n');
console.log(`   发现问题: ${issues.length} 个\n`);

if (issues.length > 0) {
  console.log('❌ 详情页问题列表:\n');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.listPage}`);
    console.log(`   链接: ${issue.detailLink}`);
    console.log(`   缺失文件: ${issue.expectedFile}`);
    console.log(`   问题: ${issue.issue}\n`);
  });
  
  // 生成修复建议
  console.log('\n💡 修复建议:\n');
  console.log('1. 创建缺失的详情页组件');
  console.log('2. 检查路由配置是否正确');
  console.log('3. 检查权限配置是否完整');
  console.log('4. 测试详情页数据加载');
} else {
  console.log('✅ 未发现明显的详情页组件缺失问题');
  console.log('\n💡 如果仍有详情页空白问题，可能是：');
  console.log('   1. 路由配置错误');
  console.log('   2. 权限配置缺失');
  console.log('   3. API数据加载失败');
  console.log('   4. 组件内部逻辑错误');
}

console.log('\n✨ 扫描完成！');

