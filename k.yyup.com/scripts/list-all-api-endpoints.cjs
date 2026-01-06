#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const serverRoutesDir = 'server/src/routes';

// 收集所有API端点
const apiEndpoints = [];
const routeFiles = fs.readdirSync(serverRoutesDir).filter(f => f.endsWith('.routes.ts'));

for (const file of routeFiles) {
  const content = fs.readFileSync(path.join(serverRoutesDir, file), 'utf-8');
  // 匹配 router.get/post/put/delete('path', ...)
  const matches = content.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g) || [];
  for (const match of matches) {
    const method = match.match(/(get|post|put|delete|patch)/)[1];
    const path = match.match(/['"]([^'"]+)['"]/)[1];
    apiEndpoints.push({ path, method, file });
  }
}

// 按路由文件分组并排序
const grouped = {};
for (const endpoint of apiEndpoints) {
  if (!grouped[endpoint.file]) {
    grouped[endpoint.file] = [];
  }
  grouped[endpoint.file].push(endpoint);
}

// 输出相关的路由文件
const relevantFiles = [
  'teaching-center.routes.ts',
  'photo-album.routes.ts',
  'system.routes.ts',
  'tasks.routes.ts',
  'notifications.routes.ts',
  'business-center.routes.ts',
  'call-center.routes.ts',
  'inspection-center.routes.ts',
  'document.routes.ts'
];

for (const file of relevantFiles) {
  if (grouped[file]) {
    console.log(`\n📁 ${file}:`);
    grouped[file].forEach(ep => {
      console.log(`   ${ep.method.toUpperCase().padEnd(6)} ${ep.path}`);
    });
  }
}

// 如果有 index.routes.ts，查看部分端点
if (grouped['index.ts']) {
  console.log(`\n📁 index.ts (showing first 20 endpoints):`);
  grouped['index.ts'].slice(0, 20).forEach(ep => {
    console.log(`   ${ep.method.toUpperCase().padEnd(6)} ${ep.path}`);
  });
  console.log(`   ... 还有 ${grouped['index.ts'].length - 20} 个端点`);
}

