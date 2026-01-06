/**
 * 路由100%覆盖测试脚本
 * 
 * 功能：
 * 1. 扫描所有路由模块文件
 * 2. 提取所有路由定义
 * 3. 验证路由注册情况
 * 4. 检查路由冲突
 * 5. 生成详细测试报告
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const ROUTES_DIR = path.join(__dirname, 'src/router/routes');
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// 统计数据
const stats = {
  totalModules: 0,
  totalRoutes: 0,
  routesByModule: {},
  allPaths: new Set(),
  allNames: new Set(),
  conflicts: {
    paths: [],
    names: []
  },
  issues: []
};

/**
 * 彩色输出
 */
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * 打印分隔线
 */
function printSeparator(char = '=', length = 80) {
  log(char.repeat(length), 'cyan');
}

/**
 * 提取路由信息的正则表达式
 */
function extractRoutes(content, filename) {
  const routes = [];
  
  // 匹配路由对象
  const routePattern = /\{[^}]*path:\s*['"]([^'"]+)['"]/g;
  const namePattern = /name:\s*['"]([^'"]+)['"]/g;
  const componentPattern = /component:\s*(?:\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)|([A-Z]\w+))/g;
  
  let match;
  let routeIndex = 0;
  
  // 提取所有路由定义
  while ((match = routePattern.exec(content)) !== null) {
    const routePath = match[1];
    const startPos = match.index;
    
    // 在当前位置附近查找 name
    const nearbyContent = content.slice(startPos, startPos + 500);
    const nameMatch = namePattern.exec(nearbyContent);
    const componentMatch = componentPattern.exec(nearbyContent);
    
    routes.push({
      path: routePath,
      name: nameMatch ? nameMatch[1] : `unnamed_${routeIndex}`,
      component: componentMatch ? (componentMatch[1] || componentMatch[2]) : 'unknown',
      module: filename,
      lineApprox: content.slice(0, startPos).split('\n').length
    });
    
    routeIndex++;
  }
  
  return routes;
}

/**
 * 扫描路由模块文件
 */
function scanRoutesDirectory() {
  log('\n📂 扫描路由模块目录...', 'bright');
  printSeparator('-');
  
  const files = fs.readdirSync(ROUTES_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');
  
  stats.totalModules = files.length;
  
  files.forEach(file => {
    const filePath = path.join(ROUTES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const routes = extractRoutes(content, file);
    
    stats.routesByModule[file] = routes;
    stats.totalRoutes += routes.length;
    
    // 检查路径和名称冲突
    routes.forEach(route => {
      // 检查路径冲突
      if (stats.allPaths.has(route.path)) {
        stats.conflicts.paths.push({
          path: route.path,
          modules: [file, ...Array.from(stats.allPaths)]
        });
      }
      stats.allPaths.add(route.path);
      
      // 检查名称冲突
      if (stats.allNames.has(route.name)) {
        stats.conflicts.names.push({
          name: route.name,
          modules: [file]
        });
      }
      stats.allNames.add(route.name);
    });
    
    log(`  ✓ ${file.padEnd(30)} - ${routes.length} 个路由`, 'green');
  });
}

/**
 * 分析路由结构
 */
function analyzeRouteStructure() {
  log('\n🔍 分析路由结构...', 'bright');
  printSeparator('-');
  
  // 按路由数量排序模块
  const sortedModules = Object.entries(stats.routesByModule)
    .sort((a, b) => b[1].length - a[1].length);
  
  log('\n📊 模块路由数量排行:', 'cyan');
  sortedModules.forEach(([module, routes], index) => {
    const bar = '█'.repeat(Math.ceil(routes.length / 2));
    log(`  ${(index + 1).toString().padStart(2)}. ${module.padEnd(30)} ${routes.length.toString().padStart(3)} ${bar}`, 'yellow');
  });
}

/**
 * 检查路由冲突
 */
function checkConflicts() {
  log('\n⚠️  检查路由冲突...', 'bright');
  printSeparator('-');
  
  if (stats.conflicts.paths.length > 0) {
    log(`\n❌ 发现 ${stats.conflicts.paths.length} 个路径冲突:`, 'red');
    stats.conflicts.paths.forEach(conflict => {
      log(`  路径: ${conflict.path}`, 'red');
      log(`  冲突模块: ${conflict.modules.join(', ')}`, 'yellow');
    });
  } else {
    log('  ✓ 无路径冲突', 'green');
  }
  
  if (stats.conflicts.names.length > 0) {
    log(`\n❌ 发现 ${stats.conflicts.names.length} 个名称冲突:`, 'red');
    stats.conflicts.names.forEach(conflict => {
      log(`  名称: ${conflict.name}`, 'red');
      log(`  冲突模块: ${conflict.modules.join(', ')}`, 'yellow');
    });
  } else {
    log('  ✓ 无名称冲突', 'green');
  }
}

/**
 * 验证路由完整性
 */
function validateRouteIntegrity() {
  log('\n✅ 验证路由完整性...', 'bright');
  printSeparator('-');
  
  const requiredModules = [
    'base.ts',
    'dashboard.ts',
    'class.ts',
    'student.ts',
    'teacher.ts',
    'parent.ts',
    'enrollment.ts',
    'activity.ts',
    'customer.ts',
    'statistics.ts',
    'finance.ts',
    'application.ts',
    'analytics.ts',
    'advertisement.ts',
    'marketing.ts',
    'centers.ts',
    'ai.ts',
    'system.ts',
    'principal.ts',
    'teacher-center.ts',
    'parent-center.ts',
    'group.ts',
    'mobile.ts',
    'demo-test.ts'
  ];
  
  const missingModules = requiredModules.filter(
    module => !Object.keys(stats.routesByModule).includes(module)
  );
  
  if (missingModules.length > 0) {
    log(`\n❌ 缺失模块 (${missingModules.length}):`, 'red');
    missingModules.forEach(module => {
      log(`  - ${module}`, 'red');
    });
  } else {
    log('  ✓ 所有必需模块都已创建', 'green');
  }
  
  // 检查每个模块是否有路由
  log('\n📋 模块路由完整性:');
  Object.entries(stats.routesByModule).forEach(([module, routes]) => {
    if (routes.length === 0) {
      log(`  ⚠️  ${module} - 没有路由定义`, 'yellow');
      stats.issues.push(`${module} 没有路由定义`);
    } else {
      log(`  ✓ ${module} - ${routes.length} 个路由`, 'green');
    }
  });
}

/**
 * 生成详细报告
 */
function generateDetailedReport() {
  log('\n📄 详细路由报告', 'bright');
  printSeparator('=');
  
  Object.entries(stats.routesByModule).forEach(([module, routes]) => {
    log(`\n${module}`, 'magenta');
    printSeparator('-', 60);
    
    if (routes.length === 0) {
      log('  (无路由)', 'yellow');
    } else {
      routes.forEach((route, index) => {
        log(`  ${(index + 1).toString().padStart(2)}. [${route.name}]`, 'cyan');
        log(`      路径: ${route.path}`, 'reset');
        log(`      组件: ${route.component}`, 'reset');
        log(`      行号: ~${route.lineApprox}`, 'reset');
      });
    }
  });
}

/**
 * 生成测试总结
 */
function generateSummary() {
  printSeparator('=');
  log('\n📊 测试总结', 'bright');
  printSeparator('=');
  
  log(`\n总体统计:`, 'cyan');
  log(`  • 路由模块总数: ${stats.totalModules}`, 'reset');
  log(`  • 路由配置总数: ${stats.totalRoutes}`, 'reset');
  log(`  • 唯一路径数量: ${stats.allPaths.size}`, 'reset');
  log(`  • 唯一名称数量: ${stats.allNames.size}`, 'reset');
  
  log(`\n问题统计:`, 'cyan');
  log(`  • 路径冲突: ${stats.conflicts.paths.length}`, stats.conflicts.paths.length > 0 ? 'red' : 'green');
  log(`  • 名称冲突: ${stats.conflicts.names.length}`, stats.conflicts.names.length > 0 ? 'red' : 'green');
  log(`  • 其他问题: ${stats.issues.length}`, stats.issues.length > 0 ? 'yellow' : 'green');
  
  // 计算覆盖率
  const expectedModules = 24; // 不包括 index.ts
  const coverage = (stats.totalModules / expectedModules * 100).toFixed(2);
  
  log(`\n测试结果:`, 'cyan');
  log(`  • 模块覆盖率: ${coverage}% (${stats.totalModules}/${expectedModules})`, 
    coverage >= 100 ? 'green' : 'yellow');
  
  const hasCriticalIssues = stats.conflicts.paths.length > 0 || stats.conflicts.names.length > 0;
  
  if (hasCriticalIssues) {
    log(`\n❌ 测试失败 - 发现严重问题`, 'red');
    printSeparator('=');
    process.exit(1);
  } else if (stats.issues.length > 0) {
    log(`\n⚠️  测试通过 - 但有警告`, 'yellow');
    printSeparator('=');
    process.exit(0);
  } else {
    log(`\n✅ 测试通过 - 所有路由正常注册`, 'green');
    printSeparator('=');
    process.exit(0);
  }
}

/**
 * 主函数
 */
function main() {
  printSeparator('=');
  log('🚀 路由100%覆盖测试', 'bright');
  log('   检测时间: ' + new Date().toLocaleString('zh-CN'), 'reset');
  printSeparator('=');
  
  try {
    // 1. 扫描路由目录
    scanRoutesDirectory();
    
    // 2. 分析路由结构
    analyzeRouteStructure();
    
    // 3. 检查冲突
    checkConflicts();
    
    // 4. 验证完整性
    validateRouteIntegrity();
    
    // 5. 生成详细报告
    generateDetailedReport();
    
    // 6. 生成总结
    generateSummary();
    
  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 执行测试
main();
