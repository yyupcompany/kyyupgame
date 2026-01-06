#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 移动端路由完整性检查\n');
console.log('='.repeat(60));

// 1. 扫描所有移动端页面
const mobilePagesDirs = [
  'src/pages/mobile/parent-center',
  'src/pages/mobile/teacher-center',
  'src/pages/mobile/centers'
];

const allPages = [];

mobilePagesDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) return;
  
  const items = fs.readdirSync(fullPath);
  items.forEach(item => {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      const indexPath = path.join(itemPath, 'index.vue');
      if (fs.existsSync(indexPath)) {
        const moduleName = dir.split('/').pop();
        const pageName = item;
        const routePath = `/mobile/${moduleName}/${pageName}`;
        
        allPages.push({
          module: moduleName,
          page: pageName,
          routePath: routePath,
          filePath: indexPath
        });
      }
    }
  });
});

console.log(`\n📋 发现 ${allPages.length} 个移动端页面:\n`);

// 2. 读取路由配置
const routesContent = fs.readFileSync('src/router/mobile-routes.ts', 'utf-8');

// 3. 检查每个页面是否有路由
const results = {
  success: [],
  missing: []
};

allPages.forEach(page => {
  const hasRoute = routesContent.includes(`path: '${page.routePath}'`) ||
                   routesContent.includes(`path: "${page.routePath}"`);
  
  if (hasRoute) {
    results.success.push(page);
    console.log(`✅ ${page.routePath}`);
  } else {
    results.missing.push(page);
    console.log(`❌ ${page.routePath} - 缺失路由！`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 检查结果:`);
console.log(`  ✅ 已配置路由: ${results.success.length} 个`);
console.log(`  ❌ 缺失路由: ${results.missing.length} 个`);

if (results.missing.length > 0) {
  console.log(`\n⚠️  需要添加以下路由:\n`);
  results.missing.forEach(page => {
    console.log(`{
  path: '${page.routePath}',
  name: 'Mobile${page.module.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}${page.page.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}',
  component: () => import('../pages/mobile/${page.module}/${page.page}/index.vue'),
  meta: {
    title: '${page.page}',
    requiresAuth: true,
    role: ['admin', 'principal', 'teacher', 'parent']
  }
},`);
  });
} else {
  console.log(`\n🎉 所有移动端页面都已配置路由！`);
}

console.log('\n' + '='.repeat(60));
