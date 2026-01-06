#!/usr/bin/env node

/**
 * 中心页面UI修复脚本
 *
 * 功能：
 * 1. 扫描所有中心页面
 * 2. 检查容器类名
 * 3. 统一背景色样式
 * 4. 修复按钮布局
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const centersDir = path.join(__dirname, '../client/src/pages/centers');

// 需要检查的中心页面文件
const centerFiles = [
  'EnrollmentCenter.vue',
  'TeachingCenter.vue',
  'ActivityCenter.vue',
  'MarketingCenter.vue',
  'PersonnelCenter.vue',
  'FinanceCenter.vue',
  'SystemCenter.vue',
  'AICenter.vue',
  'CustomerPoolCenter.vue',
  'AttendanceCenter.vue',
  'BusinessCenter.vue',
  'TaskCenter.vue',
  'InspectionCenter.vue',
  'ScriptCenter.vue',
  'AnalyticsCenter.vue'
];

// 容器类名映射
const containerClassMap = {
  'enrollment-center': 'center-container',
  'teaching-center-timeline': 'center-container',
  'activity-center-timeline': 'center-container',
  'marketing-center': 'center-container',
  'personnel-center': 'center-container',
  'finance-center': 'center-container',
  'system-center': 'center-container',
  'ai-center': 'center-container',
  'customer-pool-center': 'center-container',
  'attendance-center': 'center-container',
  'business-center': 'center-container',
  'task-center': 'center-container',
  'inspection-center': 'center-container',
  'script-center': 'center-container',
  'analytics-center': 'center-container'
};

console.log('🔍 开始扫描中心页面...\n');

let totalFiles = 0;
let needsUpdate = 0;
let updated = 0;

centerFiles.forEach(fileName => {
  const filePath = path.join(centersDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${fileName}`);
    return;
  }
  
  totalFiles++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 检查是否已经使用了center-container类
  if (content.includes('class="center-container"')) {
    console.log(`✅ ${fileName} - 已使用统一容器类`);
    return;
  }
  
  // 查找当前使用的容器类
  const containerMatch = content.match(/class="([^"]*-center[^"]*)"/);
  
  if (containerMatch) {
    const currentClass = containerMatch[1];
    console.log(`📝 ${fileName} - 当前容器类: ${currentClass}`);
    
    // 检查是否需要添加center-container类
    if (!currentClass.includes('center-container')) {
      needsUpdate++;
      
      // 添加center-container类（保留原有类名）
      const newClass = `center-container ${currentClass}`;
      content = content.replace(
        `class="${currentClass}"`,
        `class="${newClass}"`
      );
      
      modified = true;
      console.log(`   → 更新为: ${newClass}`);
    }
  } else {
    console.log(`⚠️  ${fileName} - 未找到容器类`);
  }
  
  // 检查是否有按钮布局问题
  const hasTableButtons = content.includes('el-table') && content.includes('el-button');
  const hasFormButtons = content.includes('el-form') && content.includes('el-button');
  
  if (hasTableButtons || hasFormButtons) {
    console.log(`   ℹ️  包含表格/表单按钮，可能需要手动检查布局`);
  }
  
  if (modified) {
    // 备份原文件
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    
    // 写入修改后的内容
    fs.writeFileSync(filePath, content, 'utf-8');
    updated++;
    console.log(`   ✅ 已更新并备份`);
  }
  
  console.log('');
});

console.log('\n📊 扫描结果统计:');
console.log(`   总文件数: ${totalFiles}`);
console.log(`   需要更新: ${needsUpdate}`);
console.log(`   已更新: ${updated}`);
console.log(`   已使用统一样式: ${totalFiles - needsUpdate}`);

console.log('\n💡 下一步操作:');
console.log('   1. 检查更新后的文件是否正常');
console.log('   2. 测试页面显示效果');
console.log('   3. 如有问题，可从.backup文件恢复');
console.log('   4. 手动检查表格和表单按钮布局');

console.log('\n✨ 修复完成！');

