/**
 * 路由更新验证脚本
 * 验证第2批新开发页面的路由配置完整性
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 验证路由更新完整性...\n');

// 验证文件存在
const centersRoutesFile = './client/src/router/mobile/centers-routes.ts';
const mobileRoutesFile = './client/src/router/mobile-routes.ts';

if (!fs.existsSync(centersRoutesFile)) {
  console.error('❌ centers-routes.ts 文件不存在');
  process.exit(1);
}

if (!fs.existsSync(mobileRoutesFile)) {
  console.error('❌ mobile-routes.ts 文件不存在');
  process.exit(1);
}

console.log('✅ 路由文件检查通过');

// 读取centers-routes.ts内容
const centersContent = fs.readFileSync(centersRoutesFile, 'utf8');

// 验证第2批新开发的4个页面路由
const batch2Pages = [
  {
    name: 'enrollment-center',
    title: '招生中心',
    icon: 'School',
    expectedPattern: /path: 'enrollment-center'/,
    hasNestedStructure: true
  },
  {
    name: 'finance-center',
    title: '财务中心',
    icon: 'Money',
    expectedPattern: /path: 'finance-center'/,
    hasNestedStructure: true
  },
  {
    name: 'marketing-center',
    title: '营销中心',
    icon: 'Promotion',
    expectedPattern: /path: 'marketing-center'/,
    hasNestedStructure: true
  },
  {
    name: 'teaching-center',
    title: '教学中心',
    icon: 'Reading',
    expectedPattern: /path: 'teaching-center'/,
    hasNestedStructure: true
  }
];

let allPassed = true;

batch2Pages.forEach(page => {
  console.log(`\n📋 验证 ${page.title} 路由:`);

  // 检查路由路径存在
  if (page.expectedPattern.test(centersContent)) {
    console.log(`  ✅ 路由路径存在: ${page.name}`);
  } else {
    console.log(`  ❌ 路由路径缺失: ${page.name}`);
    allPassed = false;
  }

  // 检查组件导入路径
  const componentPattern = new RegExp(`@/pages/mobile/centers/${page.name}/index\\.vue`, 'g');
  if (componentPattern.test(centersContent)) {
    console.log(`  ✅ 组件导入正确: ${page.name}`);
  } else {
    console.log(`  ❌ 组件导入错误: ${page.name}`);
    allPassed = false;
  }

  // 检查图标配置
  const iconPattern = new RegExp(`icon: '${page.icon}'`, 'g');
  if (iconPattern.test(centersContent)) {
    console.log(`  ✅ 图标配置正确: ${page.icon}`);
  } else {
    console.log(`  ❌ 图标配置错误: ${page.icon}`);
    allPassed = false;
  }

  // 检查嵌套结构（如果需要）
  if (page.hasNestedStructure) {
    // 构建正确的根节点名称
    const parts = page.name.split('-');
    const rootName = 'Mobile' + parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Root';
    const rootPattern = new RegExp(rootName, 'g');
    const childrenPattern = new RegExp(`children:\\s*\\[`, 'g');
    const routeSection = centersContent.match(new RegExp(`path: '${page.name}'[\\s\\S]*?},\\s*}`, 'g')) || [];

    if (routeSection.length > 0 && rootPattern.test(routeSection[0])) {
      console.log(`  ✅ 嵌套路由根节点: ${rootName}`);
    } else {
      console.log(`  ❌ 嵌套路由根节点缺失: ${rootName}`);
      allPassed = false;
    }

    if (routeSection.length > 0 && childrenPattern.test(routeSection[0])) {
      console.log(`  ✅ 嵌套路由子节点: children[]`);
    } else {
      console.log(`  ❌ 嵌套路由子节点缺失: children[]`);
      allPassed = false;
    }
  }

  // 检查meta信息
  const metaPattern = new RegExp(`title: '${page.title}'`, 'g');
  if (metaPattern.test(centersContent)) {
    console.log(`  ✅ 页面标题正确: ${page.title}`);
  } else {
    console.log(`  ❌ 页面标题错误: ${page.title}`);
    allPassed = false;
  }

  // 检查权限配置
  const authPattern = /requiresAuth: true/g;
  const rolePattern = /roles: \[['"]*admin['"]*, ['"]*principal['"]*/g;
  const routeSection = centersContent.match(new RegExp(`path: '${page.name}'[\\s\\S]*?},\\s*}`, 'g')) || [];

  if (routeSection.length > 0 && authPattern.test(routeSection[0])) {
    console.log(`  ✅ 认证配置正确: requiresAuth: true`);
  } else {
    console.log(`  ❌ 认证配置错误`);
    allPassed = false;
  }

  if (routeSection.length > 0 && rolePattern.test(routeSection[0])) {
    console.log(`  ✅ 权限配置正确: roles包含admin和principal`);
  } else {
    console.log(`  ❌ 权限配置错误`);
    allPassed = false;
  }
});

// 统计信息
console.log('\n📊 路由统计信息:');
const routeCount = (centersContent.match(/path:/g) || []).length;
const componentCount = (centersContent.match(/component: \(\) => import/g) || []).length;
const nestedRoutes = (centersContent.match(/Root.*name:/g) || []).length;

console.log(`  🔗 总路由数: ${routeCount}`);
console.log(`  📦 组件导入数: ${componentCount}`);
console.log(`  🌳 嵌套路由数: ${nestedRoutes}`);

// 验证组件文件实际存在
console.log('\n📁 验证组件文件存在性:');
batch2Pages.forEach(page => {
  const componentPath = `./client/src/pages/mobile/centers/${page.name}/index.vue`;
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ 组件文件存在: ${page.name}`);
  } else {
    console.log(`  ❌ 组件文件缺失: ${page.name}`);
    allPassed = false;
  }
});

// 最终结果
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 路由更新验证成功！第2批新开发页面路由配置完整');
  console.log('\n✨ 更新内容摘要:');
  console.log('  - enrollment-center: 招生中心（已存在，保持3层嵌套）');
  console.log('  - finance-center: 财务中心（升级为3层嵌套）');
  console.log('  - marketing-center: 营销中心（升级为3层嵌套）');
  console.log('  - teaching-center: 教学中心（已存在，保持3层嵌套）');
} else {
  console.log('❌ 路由更新验证失败，请检查上述错误项');
  process.exit(1);
}