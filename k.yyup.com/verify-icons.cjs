#!/usr/bin/env node

/**
 * 验证侧边栏组件是否正确使用了统一图标系统
 */

const fs = require('fs');

console.log('🔍 验证统一图标系统使用情况...');

// 读取UnifiedIcon组件中可用的图标
const unifiedIconPath = './client/src/components/icons/UnifiedIcon.vue';
if (fs.existsSync(unifiedIconPath)) {
  const unifiedIconContent = fs.readFileSync(unifiedIconPath, 'utf8');

  // 提取图标名称 - 修改正则表达式以匹配实际结构
  const iconMatches = unifiedIconContent.match(/'([^']+)': {/g);
  const availableIcons = iconMatches ? iconMatches.map(match => match.match(/'([^']+)': {/)[1]) : [];

  console.log(`✅ UnifiedIcon 中找到 ${availableIcons.length} 个图标`);
  console.log('📋 可用图标列表:', availableIcons.slice(0, 20).join(', '), '...');

  // 检查侧边栏组件中使用的图标
  const sidebarFiles = [
    './client/src/components/layout/ParentSidebar.vue',
    './client/src/components/layout/TeacherSidebar.vue'
  ];

  sidebarFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const iconUsageMatches = content.match(/UnifiedIcon name="([^"]+)"/g);
      const usedIcons = iconUsageMatches ? iconUsageMatches.map(match => match.match(/name="([^"]+)"/)[1]) : [];

      console.log(`\n📁 ${file.split('/').pop()}`);
      console.log(`  使用的图标: ${usedIcons.join(', ')}`);

      // 检查是否有不存在的图标
      const invalidIcons = usedIcons.filter(icon => !availableIcons.includes(icon));
      if (invalidIcons.length > 0) {
        console.log(`  ⚠️  不存在的图标: ${invalidIcons.join(', ')}`);
      } else {
        console.log(`  ✅ 所有图标都存在`);
      }
    } else {
      console.log(`❌ 文件不存在: ${file}`);
    }
  });
} else {
  console.log('❌ UnifiedIcon 组件不存在');
}

console.log('\n🎯 图标验证完成');