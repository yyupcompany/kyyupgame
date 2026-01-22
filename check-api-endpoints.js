#!/usr/bin/env node

/**
 * 检查实际存在的API端点
 * 通过检查后端路由文件来分析可用的API
 */

const fs = require('fs');
const path = require('path');

const routesDir = '/persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/routes';

// 递归查找所有路由文件
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      findRouteFiles(filePath, fileList);
    } else if (file.endsWith('.routes.ts') || file.endsWith('.routes.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 提取路由定义
function extractRoutesFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const routes = [];

    // 提取 router.get, router.post 等定义
    const routePatterns = [
      /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g,
      /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g
    ];

    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        routes.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: path.basename(filePath)
        });
      }
    });

    return routes;
  } catch (error) {
    return [];
  }
}

// 主函数
async function main() {
  console.log('正在扫描后端路由文件...\n');

  const routeFiles = findRouteFiles(routesDir);
  console.log(`找到 ${routeFiles.length} 个路由文件\n`);

  const allRoutes = [];

  routeFiles.forEach(file => {
    const routes = extractRoutesFromFile(file);
    if (routes.length > 0) {
      console.log(`\n${path.relative(routesDir, file)}:`);
      routes.forEach(route => {
        console.log(`  ${route.method} ${route.path}`);
        allRoutes.push({
          ...route,
          relativePath: path.relative(routesDir, file)
        });
      });
    }
  });

  // 保存到文件
  const outputPath = '/persistent/home/zhgue/kyyupgame/backend-routes-analysis.json';
  fs.writeFileSync(outputPath, JSON.stringify(allRoutes, null, 2));
  console.log(`\n\n路由分析已保存到: ${outputPath}`);

  // 统计
  console.log(`\n总计发现 ${allRoutes.length} 个路由端点`);

  // 按路径分类
  const byPath = {};
  allRoutes.forEach(route => {
    const pathParts = route.path.split('/').filter(p => p);
    const category = pathParts[0] || 'root';
    if (!byPath[category]) byPath[category] = [];
    byPath[category].push(route);
  });

  console.log('\n按路径分类:');
  Object.keys(byPath).sort().forEach(category => {
    console.log(`  /${category}: ${byPath[category].length} 个端点`);
  });
}

main().catch(console.error);
