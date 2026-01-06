#!/usr/bin/env node

/**
 * 精确的前后端API路径对比分析
 * 专注于实际使用的API调用路径
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 结果存储
const analysis = {
  frontendActualPaths: new Set(),
  backendDefinedPaths: new Set(),
  pathMappings: new Map(), // 前端路径 -> 后端路径
  missingInBackend: new Set(),
  unusedInBackend: new Set(),
  matchedPaths: new Set(),
  endpointDefinitions: new Map(),
  directApiCalls: []
};

/**
 * 提取前端实际使用的API路径
 */
function extractFrontendPaths() {
  console.log('🔍 提取前端实际使用的API路径...');
  
  const clientSrcPath = path.join(__dirname, 'client/src');
  const vueFiles = getAllFiles(clientSrcPath, ['.vue']);
  
  for (const vueFile of vueFiles) {
    try {
      const content = fs.readFileSync(vueFile, 'utf8');
      
      // 提取直接的API调用路径
      const directCalls = content.match(/request\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      
      for (const call of directCalls) {
        const match = call.match(/request\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          const path = match[2];
          analysis.frontendActualPaths.add(path);
          analysis.directApiCalls.push({
            file: path.relative(clientSrcPath, vueFile),
            path: path,
            method: match[1]
          });
        }
      }
      
      // 提取端点引用并解析实际路径
      const endpointRefs = content.match(/[A-Z_]+_ENDPOINTS\.[A-Z_]+/g) || [];
      
      for (const ref of endpointRefs) {
        const actualPath = resolveEndpointPath(ref);
        if (actualPath) {
          analysis.frontendActualPaths.add(actualPath);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️  处理文件失败: ${vueFile}`, error.message);
    }
  }
  
  console.log(`✅ 提取到 ${analysis.frontendActualPaths.size} 个前端API路径`);
}

/**
 * 解析端点引用为实际路径
 */
function resolveEndpointPath(endpointRef) {
  // 这里需要根据实际的端点配置来解析
  // 先返回一个映射，稍后手动处理
  const commonMappings = {
    'STUDENT_ENDPOINTS.BASE': '/students',
    'STUDENT_ENDPOINTS.LIST': '/students',
    'STUDENT_ENDPOINTS.GET_BY_ID': '/students/:id',
    'TEACHER_ENDPOINTS.BASE': '/teachers',
    'TEACHER_ENDPOINTS.LIST': '/teachers',
    'TEACHER_ENDPOINTS.GET_BY_ID': '/teachers/:id',
    'CLASS_ENDPOINTS.BASE': '/classes',
    'CLASS_ENDPOINTS.LIST': '/classes',
    'CLASS_ENDPOINTS.GET_BY_ID': '/classes/:id',
    'DASHBOARD_ENDPOINTS.STATS': '/dashboard/stats',
    'DASHBOARD_ENDPOINTS.TODOS': '/dashboard/todos',
    'USER_ENDPOINTS.BASE': '/users',
    'PARENT_ENDPOINTS.BASE': '/parents',
    'PARENT_ENDPOINTS.GET_BY_ID': '/parents/:id',
    'PARENT_ENDPOINTS.GET_CHILDREN': '/parents/:id/students'
  };
  
  return commonMappings[endpointRef];
}

/**
 * 提取后端定义的路由路径
 */
function extractBackendPaths() {
  console.log('🔍 提取后端定义的路由路径...');
  
  const serverRoutesPath = path.join(__dirname, 'server/src/routes');
  const routeFiles = getAllFiles(serverRoutesPath, ['.ts', '.js']);
  
  for (const routeFile of routeFiles) {
    try {
      const content = fs.readFileSync(routeFile, 'utf8');
      
      // 提取路由定义
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      
      for (const routeMatch of routeMatches) {
        const match = routeMatch.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          const routePath = match[2];
          const fullPath = `/api${routePath.startsWith('/') ? '' : '/'}${routePath}`;
          analysis.backendDefinedPaths.add(fullPath);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️  处理路由文件失败: ${routeFile}`, error.message);
    }
  }
  
  console.log(`✅ 提取到 ${analysis.backendDefinedPaths.size} 个后端路由路径`);
}

/**
 * 对比前后端路径
 */
function comparePaths() {
  console.log('🔍 对比前后端API路径...');
  
  // 规范化前端路径
  const normalizedFrontendPaths = new Set();
  for (const path of analysis.frontendActualPaths) {
    if (path.startsWith('/api')) {
      normalizedFrontendPaths.add(path);
    } else {
      normalizedFrontendPaths.add(`/api${path.startsWith('/') ? '' : '/'}${path}`);
    }
  }
  
  // 查找匹配的路径
  for (const frontendPath of normalizedFrontendPaths) {
    if (analysis.backendDefinedPaths.has(frontendPath)) {
      analysis.matchedPaths.add(frontendPath);
    } else {
      // 检查是否有参数化匹配
      let found = false;
      for (const backendPath of analysis.backendDefinedPaths) {
        if (isPathMatch(frontendPath, backendPath)) {
          analysis.pathMappings.set(frontendPath, backendPath);
          analysis.matchedPaths.add(frontendPath);
          found = true;
          break;
        }
      }
      if (!found) {
        analysis.missingInBackend.add(frontendPath);
      }
    }
  }
  
  // 查找未使用的后端路径
  for (const backendPath of analysis.backendDefinedPaths) {
    let used = false;
    for (const frontendPath of normalizedFrontendPaths) {
      if (backendPath === frontendPath || isPathMatch(frontendPath, backendPath)) {
        used = true;
        break;
      }
    }
    if (!used) {
      analysis.unusedInBackend.add(backendPath);
    }
  }
}

/**
 * 检查路径是否匹配（支持参数）
 */
function isPathMatch(frontendPath, backendPath) {
  // 简单的参数匹配逻辑
  const frontendParts = frontendPath.split('/');
  const backendParts = backendPath.split('/');
  
  if (frontendParts.length !== backendParts.length) {
    return false;
  }
  
  for (let i = 0; i < frontendParts.length; i++) {
    const frontendPart = frontendParts[i];
    const backendPart = backendParts[i];
    
    // 如果后端部分是参数（以:开头），则匹配任何前端部分
    if (backendPart.startsWith(':')) {
      continue;
    }
    
    // 否则必须完全匹配
    if (frontendPart !== backendPart) {
      return false;
    }
  }
  
  return true;
}

/**
 * 生成详细报告
 */
function generateReport() {
  console.log('\n📊 前后端API路径精确对比分析报告\n');
  
  // 统计信息
  console.log('=== 📈 统计摘要 ===');
  console.log(`前端实际使用的API路径: ${analysis.frontendActualPaths.size}`);
  console.log(`后端定义的路由路径: ${analysis.backendDefinedPaths.size}`);
  console.log(`匹配的路径: ${analysis.matchedPaths.size}`);
  console.log(`前端调用但后端缺失: ${analysis.missingInBackend.size}`);
  console.log(`后端存在但前端未使用: ${analysis.unusedInBackend.size}`);
  
  const matchRate = ((analysis.matchedPaths.size / Math.max(analysis.frontendActualPaths.size, 1)) * 100).toFixed(2);
  console.log(`匹配率: ${matchRate}%`);
  
  // 直接API调用详情
  console.log('\n=== 🎯 直接API调用详情 ===');
  const groupedCalls = {};
  for (const call of analysis.directApiCalls) {
    const category = call.path.split('/')[1] || 'root';
    if (!groupedCalls[category]) {
      groupedCalls[category] = [];
    }
    groupedCalls[category].push(call);
  }
  
  for (const [category, calls] of Object.entries(groupedCalls)) {
    console.log(`\n📂 /${category} (${calls.length} 个调用)`);
    for (const call of calls.slice(0, 10)) {
      console.log(`   ${call.method.toUpperCase()} ${call.path} - ${path.basename(call.file)}`);
    }
    if (calls.length > 10) {
      console.log(`   ... 还有 ${calls.length - 10} 个调用`);
    }
  }
  
  // 缺失的后端路由
  if (analysis.missingInBackend.size > 0) {
    console.log('\n=== ❌ 缺失的后端路由 ===');
    for (const missingPath of Array.from(analysis.missingInBackend)) {
      console.log(`   ${missingPath}`);
    }
  }
  
  // 路径映射
  if (analysis.pathMappings.size > 0) {
    console.log('\n=== 🔗 参数化路径映射 ===');
    for (const [frontend, backend] of analysis.pathMappings) {
      console.log(`   ${frontend} -> ${backend}`);
    }
  }
  
  // 未使用的后端路由（只显示前20个）
  if (analysis.unusedInBackend.size > 0) {
    console.log('\n=== ⚠️  未使用的后端路由 (前20个) ===');
    for (const unusedPath of Array.from(analysis.unusedInBackend).slice(0, 20)) {
      console.log(`   ${unusedPath}`);
    }
    if (analysis.unusedInBackend.size > 20) {
      console.log(`   ... 还有 ${analysis.unusedInBackend.size - 20} 个未使用路由`);
    }
  }
}

/**
 * 获取目录下所有文件
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
 * 主函数
 */
function main() {
  console.log('🚀 开始前后端API路径精确对比分析...\n');
  
  try {
    extractFrontendPaths();
    extractBackendPaths();
    comparePaths();
    generateReport();
    
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

export { main };
