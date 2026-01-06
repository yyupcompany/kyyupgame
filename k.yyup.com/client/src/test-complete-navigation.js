/**
 * 测试完整的4角色侧边栏导航配置
 */

import { 
  getCompleteRoleNavigation, 
  completeRoleNavigationStats, 
  featureStats 
} from './config/complete-role-navigation.js';

console.log('=== 完整的4角色侧边栏导航配置测试 ===\n');

// 测试各角色的导航配置
const roles = ['admin', 'principal', 'teacher', 'parent'];

roles.forEach(role => {
  console.log(`🎯 ${role.toUpperCase()} 角色配置:`);
  const navigation = getCompleteRoleNavigation(role);
  console.log(`  - 角色: ${navigation.role}`);
  console.log(`  - 章节数: ${navigation.sections.length}`);
  
  let totalItems = 0;
  navigation.sections.forEach((section, index) => {
    const sectionItems = section.items.length;
    let childrenCount = 0;
    
    section.items.forEach(item => {
      if (item.children && item.children.length > 0) {
        childrenCount += item.children.length;
      }
    });
    
    totalItems += sectionItems + childrenCount;
    console.log(`  ${index + 1}. ${section.title} (${sectionItems}项${childrenCount > 0 ? `, ${childrenCount}个子项` : ''})`);
  });
  
  console.log(`  - 总菜单项: ${totalItems}`);
  console.log('');
});

// 显示完整统计信息
console.log('=== 完整角色权限统计 ===');
Object.entries(completeRoleNavigationStats).forEach(([role, stats]) => {
  console.log(`${role.toUpperCase()}: ${stats.sections}个章节, ${stats.items}个菜单项 (${stats.totalPages}个页面)`);
});

// 显示功能分类统计
console.log('\n=== 功能分类统计 ===');
console.log('📊 核心功能:');
Object.entries(featureStats.coreFeatures).forEach(([key, count]) => {
  console.log(`  - ${key}: ${count}个功能`);
});

console.log('\n🏢 管理功能:');
Object.entries(featureStats.managementFeatures).forEach(([key, count]) => {
  console.log(`  - ${key}: ${count}个功能`);
});

console.log('\n⚙️ 系统功能:');
Object.entries(featureStats.systemFeatures).forEach(([key, count]) => {
  console.log(`  - ${key}: ${count}个功能`);
});

console.log('\n=== 重要功能验证 ===');
// 验证重要功能是否包含
const adminNav = getCompleteRoleNavigation('admin');
const importantFeatures = [
  'ai-forecasting',
  'smart-planning', 
  'poster-editor',
  'poster-generator',
  'intelligent-marketing',
  'nlp-analytics',
  'prediction-engine',
  'intelligent-analysis'
];

console.log('🔍 验证重要功能是否包含:');
importantFeatures.forEach(feature => {
  let found = false;
  adminNav.sections.forEach(section => {
    section.items.forEach(item => {
      if (item.id === feature) {
        found = true;
        console.log(`  ✅ ${feature} - 找到 (${item.title})`);
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.id === feature) {
            found = true;
            console.log(`  ✅ ${feature} - 找到 (${child.title})`);
          }
        });
      }
    });
  });
  if (!found) {
    console.log(`  ❌ ${feature} - 未找到`);
  }
});

console.log('\n=== 测试完成 ===');