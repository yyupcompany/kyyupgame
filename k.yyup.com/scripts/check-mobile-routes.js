#!/usr/bin/env node

/**
 * 移动端路由完整性检查脚本
 *
 * 功能：
 * 1. 扫描 mobile/centers 目录下的所有页面文件
 * 2. 检查这些页面是否在 mobile-routes.ts 中注册
 * 3. 生成缺失的路由配置
 * 4. 输出详细的检查报告
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const PAGES_DIR = path.join(BASE_DIR, '../client/src/pages/mobile/centers');
const ROUTES_FILE = path.join(BASE_DIR, '../client/src/router/mobile-routes.ts');

console.log('🔍 移动端路由完整性检查工具\n');
console.log('=' .repeat(60));

// 步骤1：扫描所有页面文件
console.log('\n📂 步骤1: 扫描页面文件...');
const pageFiles = [];

function scanDirectory(dir, basePath = '') {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, path.join(basePath, file));
    } else if (file === 'index.vue') {
      const relativePath = path.join(basePath, file);
      const routePath = '/mobile/centers/' + basePath.replace(/\\/g, '/');
      pageFiles.push({
        routePath,
        filePath: fullPath,
        relativePath: `src/pages/mobile/centers/${relativePath}`
      });
    }
  });
}

if (fs.existsSync(PAGES_DIR)) {
  scanDirectory(PAGES_DIR);
  console.log(`✅ 找到 ${pageFiles.length} 个页面文件`);
} else {
  console.log(`❌ 页面目录不存在: ${PAGES_DIR}`);
  process.exit(1);
}

// 步骤2：读取路由配置
console.log('\n📋 步骤2: 读取路由配置...');
let routesContent = '';
if (fs.existsSync(ROUTES_FILE)) {
  routesContent = fs.readFileSync(ROUTES_FILE, 'utf-8');
  console.log(`✅ 路由配置文件已读取`);
} else {
  console.log(`❌ 路由配置文件不存在: ${ROUTES_FILE}`);
  process.exit(1);
}

// 步骤3：检查每个页面是否已注册路由
console.log('\n🔎 步骤3: 检查路由注册状态...');

const registeredRoutes = [];
const unregisteredRoutes = [];

pageFiles.forEach(page => {
  const routePath = page.routePath;
  const routeName = routePath.split('/').pop()
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^./, (g) => g.toUpperCase()) + 'Mobile';

  // 检查路由是否存在
  const routePattern1 = new RegExp(`path:\\s*['"]${routePath.replace(/\//g, '\\/')}['"]`, 'i');
  const routePattern2 = new RegExp(`path:\\s*['"]${routePath.replace(/\//g, '\\/')}['"]`, 'i');
  const componentPattern = new RegExp(`import\\(.*${page.relativePath.replace('.vue', '')}`, 'i');

  const isRegistered = routePattern1.test(routesContent) ||
                       routePattern2.test(routesContent) ||
                       componentPattern.test(routesContent);

  if (isRegistered) {
    registeredRoutes.push(page);
  } else {
    unregisteredRoutes.push({
      ...page,
      suggestedName: routeName
    });
  }
});

console.log(`✅ 已注册路由: ${registeredRoutes.length} 个`);
console.log(`❌ 未注册路由: ${unregisteredRoutes.length} 个`);

// 步骤4：生成详细报告
console.log('\n' + '='.repeat(60));
console.log('📊 检查报告\n');

if (unregisteredRoutes.length > 0) {
  console.log(`⚠️  发现 ${unregisteredRoutes.length} 个未注册的路由:\n`);

  unregisteredRoutes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.routePath}`);
    console.log(`   文件: ${route.relativePath}`);
    console.log(`   建议名称: ${route.suggestedName}`);
    console.log('');
  });

  // 步骤5：生成路由配置代码
  console.log('='.repeat(60));
  console.log('🔧 生成的路由配置:\n');
  console.log('// 将以下代码添加到 mobile-routes.ts 中\n');

  const routeImports = [];
  const routeConfigs = [];

  unregisteredRoutes.forEach(route => {
    const importPath = route.relativePath.replace('.vue', '');
    const routeName = route.suggestedName;
    const displayName = route.routePath.split('/').pop().replace(/-/g, ' ');

    routeImports.push(`import { ${routeName} } from '../pages/mobile/centers/${route.routePath.replace('/mobile/centers/', '')}';`);

    routeConfigs.push(`  {
    path: '${route.routePath}',
    name: '${routeName}',
    component: () => import('../${importPath}'),
    meta: {
      title: '${displayName}',
      requiresAuth: true,
    }
  }`);
  });

  // 输出导入语句（如果使用动态导入则不需要）
  // console.log('// Imports\n' + routeImports.join('\n') + '\n');

  // 输出路由配置
  console.log('// 在 routes 数组中添加:\n');
  console.log(routeConfigs.join(',\n\n'));
  console.log('');
} else {
  console.log('🎉 所有路由都已正确注册！');
}

// 步骤6：保存报告
const reportPath = path.join(BASE_DIR, '../mobile-routes-check-report.md');
const reportContent = `# 移动端路由完整性检查报告

生成时间: ${new Date().toISOString()}

## 统计信息

- 总页面数: ${pageFiles.length}
- 已注册路由: ${registeredRoutes.length}
- 未注册路由: ${unregisteredRoutes.length}
- 注册率: ${((registeredRoutes.length / pageFiles.length) * 100).toFixed(2)}%

## 未注册路由列表

${unregisteredRoutes.map((route, index) => `
${index + 1}. **${route.routePath}**
   - 文件: \`${route.relativePath}\`
   - 建议名称: \`${route.suggestedName}\`
`).join('\n')}

## 建议操作

1. 复制上面生成的路由配置代码
2. 粘贴到 \`client/src/router/mobile-routes.ts\` 中
3. 保存文件并重启开发服务器
4. 验证路由是否可以正常访问

---

生成工具: scripts/check-mobile-routes.js
`;

fs.writeFileSync(reportPath, reportContent);
console.log('='.repeat(60));
console.log(`\n📄 完整报告已保存到: ${reportPath}\n`);

// 退出码
process.exit(unregisteredRoutes.length > 0 ? 1 : 0);
