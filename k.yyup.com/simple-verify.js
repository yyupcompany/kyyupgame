/**
 * 简化的路由验证脚本
 */

import fs from 'fs';

console.log('🔍 简化路由验证...\n');

const centersContent = fs.readFileSync('./client/src/router/mobile/centers-routes.ts', 'utf8');

// 检查第2批4个页面
const pages = [
  { name: 'enrollment-center', root: 'MobileEnrollmentCenterRoot' },
  { name: 'finance-center', root: 'MobileFinanceCenterRoot' },
  { name: 'marketing-center', root: 'MobileMarketingCenterRoot' },
  { name: 'teaching-center', root: 'MobileTeachingCenterRoot' }
];

console.log('✅ 检查根节点名称:');
pages.forEach(page => {
  if (centersContent.includes(page.root)) {
    console.log(`  ✓ ${page.name}: ${page.root}`);
  } else {
    console.log(`  ✗ ${page.name}: ${page.root} 缺失`);
  }
});

console.log('\n✅ 检查children数组:');
pages.forEach(page => {
  const pattern = new RegExp(`path: '${page.name}'[\\s\\S]*?children: \\[`, 'g');
  if (pattern.test(centersContent)) {
    console.log(`  ✓ ${page.name}: has children`);
  } else {
    console.log(`  ✗ ${page.name}: children missing`);
  }
});

console.log('\n✅ 检查requiresAuth:');
pages.forEach(page => {
  const pattern = new RegExp(`path: '${page.name}'[\\s\\S]*?requiresAuth: true`, 'g');
  if (pattern.test(centersContent)) {
    console.log(`  ✓ ${page.name}: requiresAuth: true`);
  } else {
    console.log(`  ✗ ${page.name}: requiresAuth missing`);
  }
});

console.log('\n✅ 检查roles权限:');
pages.forEach(page => {
  const pattern = new RegExp(`path: '${page.name}'[\\s\\S]*?roles: \\[`, 'g');
  if (pattern.test(centersContent)) {
    console.log(`  ✓ ${page.name}: has roles array`);
  } else {
    console.log(`  ✗ ${page.name}: roles missing`);
  }
});

console.log('\n🎯 验证总结:');
const allGood = pages.every(page =>
  centersContent.includes(page.root) &&
  new RegExp(`path: '${page.name}'[\\s\\S]*?children: \\[`, 'g').test(centersContent) &&
  new RegExp(`path: '${page.name}'[\\s\\S]*?requiresAuth: true`, 'g').test(centersContent) &&
  new RegExp(`path: '${page.name}'[\\s\\S]*?roles: \\[`, 'g').test(centersContent)
);

if (allGood) {
  console.log('🎉 所有路由验证通过！第2批新开发页面路由配置正确');
} else {
  console.log('❌ 部分路由验证失败');
}