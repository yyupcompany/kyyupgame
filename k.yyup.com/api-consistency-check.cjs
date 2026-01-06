#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const SERVER_ROUTES_DIR = '/home/zhgue/k.yyup.cc/server/src/routes';
const CLIENT_API_DIR = '/home/zhgue/k.yyup.cc/client/src/api';

// 存储分析结果
const backendRoutes = new Map();
const frontendEndpoints = new Map();
const inconsistencies = [];

// 提取路由路径的函数
function extractRoutePaths(filePath, content, type) {
  const paths = new Set();
  
  if (type === 'backend') {
    // 提取Express路由定义
    const routePatterns = [
      /router\.(get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`]+)['\"`]/g,
      /router\.(use)\s*\(\s*['\"`]([^'\"`]+)['\"`]/g,
    ];
    
    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[2];
        paths.add(path);
      }
    });
    
    // 提取index.ts中的路由挂载
    const mountPatterns = [
      /router\.use\s*\(\s*['\"`]([^'\"`]+)['\"`]\s*,\s*\w+Routes\)/g,
      /router\.use\s*\(\s*['\"`]([^'\"`]+)['\"`]\s*,\s*[^,)]+\)/g,
    ];
    
    mountPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1];
        paths.add(path);
      }
    });
    
  } else if (type === 'frontend') {
    // 提取前端端点定义
    const endpointPatterns = [
      /const\s+\w+_ENDPOINTS\s*=\s*{[^}]*}/g,
      /export\s+const\s+\w+_ENDPOINTS\s*=\s*{[^}]*}/g,
    ];
    
    endpointPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const endpointBlock = match[0];
        // 提取路径值
        const pathMatches = endpointBlock.match(/['\"`]([^'\"`]+)['\"`]/g);
        if (pathMatches) {
          pathMatches.forEach(pathMatch => {
            const path = pathMatch.slice(1, -1); // 移除引号
            if (path.startsWith('/')) {
              paths.add(path);
            }
          });
        }
      }
    });
  }
  
  return Array.from(paths);
}

// 递归读取目录
function readDirectory(dir, type, results = new Map()) {
  if (!fs.existsSync(dir)) {
    console.log(`目录不存在: ${dir}`);
    return results;
  }
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      readDirectory(fullPath, type, results);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const paths = extractRoutePaths(fullPath, content, type);
        
        if (paths.length > 0) {
          results.set(fullPath, paths);
        }
      } catch (error) {
        console.error(`读取文件失败 ${fullPath}:`, error.message);
      }
    }
  });
  
  return results;
}

// 分析路径一致性
function analyzeConsistency() {
  console.log('🔍 开始分析前后端API路径一致性...\n');
  
  // 读取后端路由
  console.log('📂 扫描后端路由文件...');
  const backendResults = readDirectory(SERVER_ROUTES_DIR, 'backend');
  
  // 读取前端端点
  console.log('📂 扫描前端API文件...');
  const frontendResults = readDirectory(CLIENT_API_DIR, 'frontend');
  
  // 收集所有路径
  const allBackendPaths = new Set();
  const allFrontendPaths = new Set();
  
  backendResults.forEach((paths, file) => {
    paths.forEach(path => {
      allBackendPaths.add(path);
      if (!backendRoutes.has(path)) {
        backendRoutes.set(path, []);
      }
      backendRoutes.get(path).push(file);
    });
  });
  
  frontendResults.forEach((paths, file) => {
    paths.forEach(path => {
      allFrontendPaths.add(path);
      if (!frontendEndpoints.has(path)) {
        frontendEndpoints.set(path, []);
      }
      frontendEndpoints.get(path).push(file);
    });
  });
  
  console.log(`\n📊 统计结果:`);
  console.log(`- 后端路由文件数: ${backendResults.size}`);
  console.log(`- 后端API路径数: ${allBackendPaths.size}`);
  console.log(`- 前端API文件数: ${frontendResults.size}`);
  console.log(`- 前端API路径数: ${allFrontendPaths.size}`);
  
  // 分析一致性
  console.log(`\n🔍 分析路径一致性...`);
  
  // 1. 前端有但后端没有的路径
  const missingInBackend = [];
  allFrontendPaths.forEach(path => {
    if (!allBackendPaths.has(path)) {
      missingInBackend.push({
        path,
        frontendFiles: frontendEndpoints.get(path) || []
      });
    }
  });
  
  // 2. 后端有但前端没有的路径
  const missingInFrontend = [];
  allBackendPaths.forEach(path => {
    if (!allFrontendPaths.has(path)) {
      missingInFrontend.push({
        path,
        backendFiles: backendRoutes.get(path) || []
      });
    }
  });
  
  // 3. 路径格式分析
  const pathFormats = {
    kebabCase: [],      // kebab-case
    camelCase: [],      // camelCase
    snakeCase: [],      // snake_case
    pascalCase: [],     // PascalCase
    mixed: []           // 混合格式
  };
  
  function classifyPathFormat(path) {
    const segments = path.split('/').filter(s => s);
    const hasKebab = segments.some(s => s.includes('-'));
    const hasCamel = segments.some(s => /[a-z][A-Z]/.test(s));
    const hasSnake = segments.some(s => s.includes('_'));
    const hasPascal = segments.some(s => /^[A-Z]/.test(s));
    
    if (hasKebab && !hasCamel && !hasSnake && !hasPascal) return 'kebabCase';
    if (hasCamel && !hasKebab && !hasSnake && !hasPascal) return 'camelCase';
    if (hasSnake && !hasKebab && !hasCamel && !hasPascal) return 'snakeCase';
    if (hasPascal && !hasKebab && !hasCamel && !hasSnake) return 'pascalCase';
    return 'mixed';
  }
  
  allBackendPaths.forEach(path => {
    const format = classifyPathFormat(path);
    pathFormats[format].push({ path, type: 'backend' });
  });
  
  allFrontendPaths.forEach(path => {
    const format = classifyPathFormat(path);
    pathFormats[format].push({ path, type: 'frontend' });
  });
  
  // 生成报告
  const report = {
    summary: {
      backendFiles: backendResults.size,
      backendPaths: allBackendPaths.size,
      frontendFiles: frontendResults.size,
      frontendPaths: allFrontendPaths.size,
      missingInBackend: missingInBackend.length,
      missingInFrontend: missingInFrontend.length,
      exactMatches: allBackendPaths.size + allFrontendPaths.size - missingInBackend.length - missingInFrontend.length
    },
    inconsistencies: {
      missingInBackend,
      missingInFrontend
    },
    pathFormats,
    backendDetails: Object.fromEntries(backendRoutes),
    frontendDetails: Object.fromEntries(frontendEndpoints)
  };
  
  // 输出报告
  console.log(`\n📋 一致性分析报告:`);
  console.log(`- 完全匹配的路径: ${report.summary.exactMatches / 2}`);
  console.log(`- 前端有但后端没有: ${report.summary.missingInBackend}`);
  console.log(`- 后端有但前端没有: ${report.summary.missingInFrontend}`);
  
  if (missingInBackend.length > 0) {
    console.log(`\n❌ 前端调用但后端不存在的路径 (${missingInBackend.length}):`);
    missingInBackend.slice(0, 10).forEach(item => {
      console.log(`   ${item.path} - ${item.frontendFiles.join(', ')}`);
    });
    if (missingInBackend.length > 10) {
      console.log(`   ... 还有 ${missingInBackend.length - 10} 个`);
    }
  }
  
  if (missingInFrontend.length > 0) {
    console.log(`\n⚠️  后端存在但前端未使用的路径 (${missingInFrontend.length}):`);
    missingInFrontend.slice(0, 10).forEach(item => {
      console.log(`   ${item.path} - ${item.backendFiles.join(', ')}`);
    });
    if (missingInFrontend.length > 10) {
      console.log(`   ... 还有 ${missingInFrontend.length - 10} 个`);
    }
  }
  
  console.log(`\n📝 路径格式分析:`);
  Object.entries(pathFormats).forEach(([format, paths]) => {
    const backend = paths.filter(p => p.type === 'backend').length;
    const frontend = paths.filter(p => p.type === 'frontend').length;
    console.log(`- ${format}: 后端 ${backend}, 前端 ${frontend}`);
  });
  
  // 保存详细报告
  const reportPath = '/home/zhgue/k.yyup.cc/api-consistency-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 详细报告已保存到: ${reportPath}`);
  
  return report;
}

// 运行分析
if (require.main === module) {
  analyzeConsistency();
}

module.exports = { analyzeConsistency };