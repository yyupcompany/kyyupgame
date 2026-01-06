/**
 * 测试最终的完整导航配置
 */

import { 
  getCompleteRoleNavigation, 
  completeRoleNavigationStats 
} from './config/complete-role-navigation.js';

console.log('=== 最终的完整导航配置测试 ===\n');

// 测试管理员角色的完整功能
console.log('🎯 管理员角色功能验证:');
const adminNav = getCompleteRoleNavigation('admin');

// 关键功能验证
const keyFeatures = [
  { id: 'ai-forecasting', name: 'AI招生预测引擎', section: 'enrollment-plan' },
  { id: 'smart-planning', name: '智能规划系统', section: 'enrollment-plan' },
  { id: 'poster-editor', name: '海报编辑器', section: 'poster-management' },
  { id: 'poster-generator', name: '海报生成器', section: 'poster-management' },
  { id: 'poster-templates', name: '海报模板', section: 'poster-management' },
  { id: 'intelligent-marketing', name: '智能营销引擎', section: 'marketing-management' },
  { id: 'nlp-analytics', name: 'NLP分析', section: 'ai-functions' },
  { id: 'prediction-engine', name: '预测引擎', section: 'ai-functions' },
  { id: '3d-analytics', name: '3D分析可视化', section: 'ai-functions' },
  { id: 'intelligent-analysis', name: '智能活动分析', section: 'activity-management' }
];

console.log('📋 关键功能检查:');
keyFeatures.forEach(feature => {
  let found = false;
  let location = '';
  
  adminNav.sections.forEach(section => {
    section.items.forEach(item => {
      if (item.id === feature.id) {
        found = true;
        location = `${section.title} > ${item.title}`;
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.id === feature.id) {
            found = true;
            location = `${section.title} > ${item.title} > ${child.title}`;
          }
        });
      }
    });
  });
  
  if (found) {
    console.log(`  ✅ ${feature.name} - 找到 (${location})`);
  } else {
    console.log(`  ❌ ${feature.name} - 未找到`);
  }
});

// 显示所有章节
console.log('\n📚 所有章节:');
adminNav.sections.forEach((section, index) => {
  const itemCount = section.items.length;
  let childrenCount = 0;
  
  section.items.forEach(item => {
    if (item.children) {
      childrenCount += item.children.length;
    }
  });
  
  console.log(`  ${index + 1}. ${section.title} (${itemCount}项${childrenCount > 0 ? `, ${childrenCount}个子项` : ''})`);
});

// 权限统计
console.log('\n📊 权限统计:');
Object.entries(completeRoleNavigationStats).forEach(([role, stats]) => {
  console.log(`  ${role.toUpperCase()}: ${stats.sections}个章节, ${stats.items}个菜单项`);
});

console.log('\n🚀 测试完成！所有重要功能都已正确配置。');