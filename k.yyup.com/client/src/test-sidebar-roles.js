/**
 * 测试4角色侧边栏权限配置
 */

// 模拟导入角色配置
import { getRoleNavigation, roleNavigationStats, validateRoleHierarchy } from './config/roleNavigation';

console.log('=== 4角色侧边栏权限配置测试 ===\n');

// 测试各角色的导航配置
const roles = ['admin', 'principal', 'teacher', 'parent'];

roles.forEach(role => {
  console.log(`📋 ${role.toUpperCase()} 角色配置:`);
  const navigation = getRoleNavigation(role);
  console.log(`  - 角色: ${navigation.role}`);
  console.log(`  - 章节数: ${navigation.sections.length}`);
  console.log(`  - 总菜单项: ${navigation.sections.reduce((acc, section) => acc + section.items.length, 0)}`);
  
  navigation.sections.forEach((section, index) => {
    console.log(`  ${index + 1}. ${section.title} (${section.items.length}项)`);
    section.items.forEach(item => {
      console.log(`      - ${item.title} (${item.route})`);
    });
  });
  console.log('');
});

// 显示统计信息
console.log('=== 角色权限统计 ===');
Object.entries(roleNavigationStats).forEach(([role, stats]) => {
  console.log(`${role.toUpperCase()}: ${stats.sections}个章节, ${stats.items}个菜单项`);
});

// 验证权限继承关系
console.log('\n=== 权限继承关系验证 ===');
console.log('权限继承关系是否正确:', validateRoleHierarchy() ? '✅ 正确' : '❌ 错误');

console.log('\n=== 详细权限对比 ===');
console.log('Admin > Principal > Teacher > Parent');
console.log(`${roleNavigationStats.admin.items} > ${roleNavigationStats.principal.items} > ${roleNavigationStats.teacher.items} > ${roleNavigationStats.parent.items}`);