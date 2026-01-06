#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 扫描所有移动端页面的API调用\n');

const mobileDir = 'client/src/pages/mobile';
const serverRoutesDir = 'server/src/routes';

// 收集所有API端点
const apiEndpoints = new Set();
const routeFiles = fs.readdirSync(serverRoutesDir).filter(f => f.endsWith('.routes.ts'));

for (const file of routeFiles) {
  const content = fs.readFileSync(path.join(serverRoutesDir, file), 'utf-8');
  // 匹配 router.get/post/put/delete('path', ...)
  const matches = content.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g) || [];
  for (const match of matches) {
    const path = match.match(/['"]([^'"]+)['"]/)[1];
    apiEndpoints.add(path);
  }
}

console.log(`📊 后端已定义的API端点数: ${apiEndpoints.size}\n`);

// 扫描前端API调用
const apiCalls = new Map();
const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.vue') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/request\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g) || [];
      for (const match of matches) {
        const method = match.match(/(get|post|put|delete|patch)/)[1];
        const apiPath = match.match(/['"]([^'"]+)['"]/)[1];
        // 移除开头的 / 和 /api/
        let cleanPath = apiPath.replace(/^\/api\//, '').replace(/^\//, '');
        if (!apiCalls.has(cleanPath)) {
          apiCalls.set(cleanPath, { files: [], method });
        }
        if (filePath.includes(mobileDir)) {
          apiCalls.get(cleanPath).files.push(filePath.replace(process.cwd() + '/', ''));
        }
      }
    }
  }
};

walkDir(mobileDir);

console.log(`📞 前端移动端调用的API数: ${apiCalls.size}\n`);

// 检查哪些前端调用在后端没有定义
const brokenCalls = [];
const workingCalls = [];

for (const [apiPath, data] of apiCalls) {
  // 检查是否存在（考虑路径参数）
  let found = false;
  for (const endpoint of apiEndpoints) {
    // 处理路径参数 /api/:id -> /api
    const endpointClean = endpoint.replace(/\/:[^\/]+(\/|$)/g, '/$1').replace(/\/$/, '');
    const apiPathClean = apiPath.replace(/\/[0-9]+/g, '/:id').replace(/\/[a-f0-9-]{36}$/g, '/:id').replace(/\/$/, '');
    if (endpointClean === `/${apiPathClean}` || endpointClean === `/${apiPath}`) {
      found = true;
      break;
    }
  }
  
  if (found) {
    workingCalls.push({ path: apiPath, files: data.files });
  } else {
    brokenCalls.push({ path: apiPath, files: data.files });
  }
}

if (brokenCalls.length > 0) {
  console.log('❌ 找到 ' + brokenCalls.length + ' 个不存在的API端点调用:\n');
  for (const call of brokenCalls.sort((a, b) => b.files.length - a.files.length)) {
    console.log(`  ❌ /${call.path}`);
    call.files.slice(0, 3).forEach(f => {
      console.log(`     └─ ${f}`);
    });
    if (call.files.length > 3) {
      console.log(`     └─ ... 还有 ${call.files.length - 3} 个文件`);
    }
  }
} else {
  console.log('✅ 所有API端点都存在！');
}

console.log(`\n✅ 验证通过的API端点: ${workingCalls.length}`);

