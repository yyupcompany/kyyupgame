#!/usr/bin/env node

/**
 * 前端页面到后端路由的完整API调用链路分析脚本
 * 从实际使用的角度分析API调用一致性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  clientSrcPath: path.join(__dirname, 'client/src'),
  serverSrcPath: path.join(__dirname, 'server/src'),
  apiPattern: /import.*from.*api|from\s+['"]@\/api|request\.(get|post|put|delete|patch)|axios\.(get|post|put|delete|patch)/g,
  endpointPattern: /ENDPOINTS|API_.*|\/api\/[a-zA-Z0-9\-\/_]+/g,
  routePattern: /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
};

// 分析结果
const analysisResult = {
  frontendPages: [],
  frontendApiCalls: new Map(), // 页面 -> API调用列表
  frontendEndpoints: new Map(), // 端点配置 -> 实际路径
  backendRoutes: new Map(), // 路由文件 -> 路由列表
  actualApiPaths: new Set(), // 实际使用的API路径
  missingBackendRoutes: new Set(), // 前端调用但后端不存在的路径
  unusedBackendRoutes: new Set(), // 后端存在但前端未使用的路径
  summary: {
    totalFrontendPages: 0,
    totalApiCalls: 0,
    totalBackendRoutes: 0,
    matchedRoutes: 0,
    missingRoutes: 0,
    unusedRoutes: 0
  }
};

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dir, extensions = ['.vue', '.ts', '.js']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 分析前端页面的API调用
 */
function analyzeFrontendPages() {
  console.log('🔍 分析前端页面API调用...');
  
  const pagesDir = path.join(CONFIG.clientSrcPath, 'pages');
  const pageFiles = getAllFiles(pagesDir, ['.vue']);
  
  for (const pageFile of pageFiles) {
    const relativePath = path.relative(CONFIG.clientSrcPath, pageFile);
    const pageName = relativePath.replace(/\\/g, '/');
    
    try {
      const content = fs.readFileSync(pageFile, 'utf8');
      const apiCalls = extractApiCalls(content, pageFile);
      
      analysisResult.frontendPages.push({
        file: relativePath,
        name: pageName,
        apiCalls: apiCalls.length,
        calls: apiCalls
      });
      
      analysisResult.frontendApiCalls.set(pageName, apiCalls);
      analysisResult.summary.totalApiCalls += apiCalls.length;
      
    } catch (error) {
      console.warn(`⚠️  读取文件失败: ${pageFile}`, error.message);
    }
  }
  
  analysisResult.summary.totalFrontendPages = analysisResult.frontendPages.length;
}

/**
 * 提取API调用
 */
function extractApiCalls(content, filePath) {
  const apiCalls = [];
  
  // 提取import语句中的API模块
  const importMatches = content.match(/import.*from\s+['"]@\/api\/([^'"]+)['"]/g) || [];
  for (const importMatch of importMatches) {
    const modulePath = importMatch.match(/from\s+['"]@\/api\/([^'"]+)['"]/)[1];
    apiCalls.push({
      type: 'import',
      module: modulePath,
      file: filePath
    });
  }
  
  // 提取直接的API调用
  const requestMatches = content.match(/request\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
  for (const requestMatch of requestMatches) {
    const match = requestMatch.match(/request\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (match) {
      apiCalls.push({
        type: 'direct',
        method: match[1],
        path: match[2],
        file: filePath
      });
      analysisResult.actualApiPaths.add(match[2]);
    }
  }
  
  // 提取endpoint引用
  const endpointMatches = content.match(/[A-Z_]+_ENDPOINTS\.[A-Z_]+/g) || [];
  for (const endpointMatch of endpointMatches) {
    apiCalls.push({
      type: 'endpoint',
      reference: endpointMatch,
      file: filePath
    });
  }
  
  return apiCalls;
}

/**
 * 分析前端API端点配置
 */
function analyzeFrontendEndpoints() {
  console.log('🔍 分析前端API端点配置...');
  
  const apiDir = path.join(CONFIG.clientSrcPath, 'api');
  const endpointFiles = getAllFiles(path.join(apiDir, 'endpoints'), ['.ts']);
  
  for (const endpointFile of endpointFiles) {
    try {
      const content = fs.readFileSync(endpointFile, 'utf8');
      const relativePath = path.relative(CONFIG.clientSrcPath, endpointFile);
      
      // 提取端点定义
      const endpointDefs = content.match(/export\s+const\s+[A-Z_]+_ENDPOINTS\s*=\s*{([^}]+)}/gs) || [];
      
      for (const endpointDef of endpointDefs) {
        const constName = endpointDef.match(/export\s+const\s+([A-Z_]+_ENDPOINTS)/)[1];
        
        // 提取端点路径
        const pathMatches = endpointDef.match(/['"`]([^'"`]+)['"`]/g) || [];
        const paths = pathMatches.map(p => p.replace(/['"`]/g, ''));
        
        analysisResult.frontendEndpoints.set(constName, {
          file: relativePath,
          paths: paths
        });
        
        // 添加到实际使用路径
        paths.forEach(path => {
          if (path.startsWith('/')) {
            analysisResult.actualApiPaths.add(path);
          }
        });
      }
      
    } catch (error) {
      console.warn(`⚠️  读取端点文件失败: ${endpointFile}`, error.message);
    }
  }
}

/**
 * 分析后端路由
 */
function analyzeBackendRoutes() {
  console.log('🔍 分析后端路由...');
  
  const routesDir = path.join(CONFIG.serverSrcPath, 'routes');
  const routeFiles = getAllFiles(routesDir, ['.ts', '.js']);
  
  for (const routeFile of routeFiles) {
    try {
      const content = fs.readFileSync(routeFile, 'utf8');
      const relativePath = path.relative(CONFIG.serverSrcPath, routeFile);
      
      // 提取路由定义
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      const routes = [];
      
      for (const routeMatch of routeMatches) {
        const match = routeMatch.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          const routePath = match[2];
          routes.push({
            method: match[1],
            path: routePath,
            fullPath: `/api${routePath.startsWith('/') ? '' : '/'}${routePath}`
          });
        }
      }
      
      if (routes.length > 0) {
        analysisResult.backendRoutes.set(relativePath, {
          file: relativePath,
          routes: routes
        });
        analysisResult.summary.totalBackendRoutes += routes.length;
      }
      
    } catch (error) {
      console.warn(`⚠️  读取路由文件失败: ${routeFile}`, error.message);
    }
  }
}

/**
 * 对比前后端路由
 */
function compareRoutes() {
  console.log('🔍 对比前后端路由...');
  
  // 收集所有后端路由路径
  const backendPaths = new Set();
  for (const [file, routeInfo] of analysisResult.backendRoutes) {
    for (const route of routeInfo.routes) {
      backendPaths.add(route.fullPath);
    }
  }
  
  // 检查前端调用的API路径是否在后端存在
  for (const frontendPath of analysisResult.actualApiPaths) {
    let normalizedFrontendPath = frontendPath;
    if (!normalizedFrontendPath.startsWith('/api')) {
      normalizedFrontendPath = `/api${normalizedFrontendPath.startsWith('/') ? '' : '/'}${normalizedFrontendPath}`;
    }
    
    if (backendPaths.has(normalizedFrontendPath)) {
      analysisResult.summary.matchedRoutes++;
    } else {
      analysisResult.missingBackendRoutes.add(normalizedFrontendPath);
      analysisResult.summary.missingRoutes++;
    }
  }
  
  // 检查后端路由是否被前端使用
  for (const backendPath of backendPaths) {
    if (!analysisResult.actualApiPaths.has(backendPath) && 
        !analysisResult.actualApiPaths.has(backendPath.replace('/api', ''))) {
      analysisResult.unusedBackendRoutes.add(backendPath);
      analysisResult.summary.unusedRoutes++;
    }
  }
}

/**
 * 生成详细报告
 */
function generateReport() {
  console.log('\n📊 生成API调用链路分析报告...\n');
  
  // 摘要信息
  console.log('=== 📈 分析摘要 ===');
  console.log(`前端页面总数: ${analysisResult.summary.totalFrontendPages}`);
  console.log(`API调用总数: ${analysisResult.summary.totalApiCalls}`);
  console.log(`后端路由总数: ${analysisResult.summary.totalBackendRoutes}`);
  console.log(`匹配路由数: ${analysisResult.summary.matchedRoutes}`);
  console.log(`缺失路由数: ${analysisResult.summary.missingRoutes}`);
  console.log(`未使用路由数: ${analysisResult.summary.unusedRoutes}`);
  console.log(`匹配率: ${((analysisResult.summary.matchedRoutes / Math.max(analysisResult.summary.totalApiCalls, 1)) * 100).toFixed(2)}%`);
  
  // 前端页面API调用详情
  console.log('\n=== 📱 前端页面API调用详情 ===');
  const sortedPages = analysisResult.frontendPages
    .sort((a, b) => b.apiCalls - a.apiCalls)
    .slice(0, 20); // 显示前20个
  
  for (const page of sortedPages) {
    if (page.apiCalls > 0) {
      console.log(`\n📄 ${page.name} (${page.apiCalls} 个API调用)`);
      for (const call of page.calls.slice(0, 5)) { // 显示前5个调用
        console.log(`   ${call.type}: ${call.module || call.path || call.reference}`);
      }
      if (page.calls.length > 5) {
        console.log(`   ... 还有 ${page.calls.length - 5} 个调用`);
      }
    }
  }
  
  // 缺失的后端路由
  if (analysisResult.missingBackendRoutes.size > 0) {
    console.log('\n=== ❌ 缺失的后端路由 (前端调用但后端不存在) ===');
    for (const missingRoute of Array.from(analysisResult.missingBackendRoutes).slice(0, 20)) {
      console.log(`   ${missingRoute}`);
    }
    if (analysisResult.missingBackendRoutes.size > 20) {
      console.log(`   ... 还有 ${analysisResult.missingBackendRoutes.size - 20} 个缺失路由`);
    }
  }
  
  // 未使用的后端路由
  if (analysisResult.unusedBackendRoutes.size > 0) {
    console.log('\n=== ⚠️  未使用的后端路由 (后端存在但前端未使用) ===');
    for (const unusedRoute of Array.from(analysisResult.unusedBackendRoutes).slice(0, 20)) {
      console.log(`   ${unusedRoute}`);
    }
    if (analysisResult.unusedBackendRoutes.size > 20) {
      console.log(`   ... 还有 ${analysisResult.unusedBackendRoutes.size - 20} 个未使用路由`);
    }
  }
  
  // 实际使用的API路径统计
  console.log('\n=== 🎯 实际使用的API路径统计 ===');
  const pathStats = {};
  for (const apiPath of analysisResult.actualApiPaths) {
    const category = apiPath.split('/')[1] || 'root';
    pathStats[category] = (pathStats[category] || 0) + 1;
  }
  
  const sortedCategories = Object.entries(pathStats)
    .sort(([,a], [,b]) => b - a);
  
  for (const [category, count] of sortedCategories) {
    console.log(`   /${category}: ${count} 个调用`);
  }
}

/**
 * 保存详细报告到文件
 */
function saveDetailedReport() {
  const reportPath = path.join(__dirname, 'api-chain-analysis-report.json');
  
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: analysisResult.summary,
    frontendPages: analysisResult.frontendPages,
    frontendEndpoints: Array.from(analysisResult.frontendEndpoints.entries()).map(([key, value]) => ({ key, ...value })),
    backendRoutes: Array.from(analysisResult.backendRoutes.entries()).map(([key, value]) => ({ key, ...value })),
    actualApiPaths: Array.from(analysisResult.actualApiPaths),
    missingBackendRoutes: Array.from(analysisResult.missingBackendRoutes),
    unusedBackendRoutes: Array.from(analysisResult.unusedBackendRoutes)
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`\n💾 详细报告已保存到: ${reportPath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始前端页面到后端路由的完整API调用链路分析...\n');
  
  try {
    analyzeFrontendPages();
    analyzeFrontendEndpoints();
    analyzeBackendRoutes();
    compareRoutes();
    generateReport();
    saveDetailedReport();
    
    console.log('\n✅ 分析完成！');
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行分析
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, analysisResult };