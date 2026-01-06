#!/usr/bin/env node
/**
 * 后端路由扫描工具 v2
 * 扫描 /persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/routes 目录下的所有后端路由定义
 * 支持模块化路由的完整路径分析
 */

const fs = require('fs');
const path = require('path');

// 路由目录
const ROUTES_DIR = '/persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/routes';
// 输出文件
const OUTPUT_FILE = '/persistent/home/zhgue/kyyupgame/backend-routes-scan-report.json';

// 存储所有路由信息
const routeInfo = {
  scanDate: new Date().toISOString(),
  scanVersion: '2.0',
  totalFiles: 0,
  totalRoutes: 0,
  routesByFile: [],
  moduleRoutes: {
    ai: { prefix: '/api', routes: [] },
    auth: { prefix: '/api', routes: [] },
    users: { prefix: '/api', routes: [] },
    enrollment: { prefix: '/api', routes: [] },
    activity: { prefix: '/api', routes: [] },
    teaching: { prefix: '/api', routes: [] },
    business: { prefix: '/api', routes: [] },
    system: { prefix: '/api', routes: [] },
    marketing: { prefix: '/api', routes: [] },
    content: { prefix: '/api', routes: [] },
    other: { prefix: '/api', routes: [] }
  },
  routeSummary: {
    byMethod: {},
    byModule: {},
    byPath: {},
    duplicates: []
  },
  mountPoints: [],
  warnings: []
};

// HTTP方法列表
const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'all', 'use'];

/**
 * 递归扫描目录获取所有路由文件
 */
function getAllRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllRouteFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('.backup')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 从代码中提取路由定义
 */
function extractRoutesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(ROUTES_DIR, filePath);

  const routes = {
    file: relativePath,
    fullPath: filePath,
    routes: [],
    exports: [],
    imports: [],
    mountPoints: [],
    module: detectModule(relativePath)
  };

  // 提取 router.get/post/put/delete 等路由定义
  HTTP_METHODS.forEach(method => {
    // 支持单引号、双引号、反引号
    const patterns = [
      new RegExp(`router\\.${method}\\s*\\(\\s*'([^']+)'\\s*[,)]`, 'gm'),
      new RegExp(`router\\.${method}\\s*\\(\\s*"([^"]+)"\\s*[,)]`, 'gm'),
      new RegExp(`router\\.${method}\\s*\\(\\s+\`([^\`]+)\`\\s*[,)]`, 'gm')
    ];

    patterns.forEach(pattern => {
      let match;
      // 重置正则表达式的lastIndex
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        routes.routes.push({
          method: method.toUpperCase(),
          path: match[1],
          line: content.substring(0, match.index).split('\n').length,
          type: 'router'
        });
      }
    });
  });

  // 提取 app.use 或 router.use 挂载点
  const usePatterns = [
    /(?:app|router)\.use\s*\(\s*'([^']+)'\s*,/g,
    /(?:app|router)\.use\s*\(\s*"([^"]+)"\s*,/g,
    /(?:app|router)\.use\s*\(\s+`([^`]+)`\s*,/g
  ];

  usePatterns.forEach(pattern => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      routes.mountPoints.push({
        path: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  });

  // 提取 module.exports 或 export default
  if (content.includes('module.exports') || content.includes('export default')) {
    routes.exports.push({
      type: content.includes('module.exports') ? 'module.exports' : 'export default'
    });
  }

  // 提取import语句
  const importRegex = /import\s+(\w+)\s+from\s+['"`]\.\/([^'"`]+)['"`]/g;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    routes.imports.push({
      varName: importMatch[1],
      modulePath: importMatch[2]
    });
  }

  return routes;
}

/**
 * 检测文件所属模块
 */
function detectModule(filePath) {
  const moduleDir = filePath.split('/')[0];
  const moduleMap = {
    'ai': 'ai',
    'auth': 'auth',
    'users': 'users',
    'enrollment': 'enrollment',
    'activity': 'activity',
    'teaching': 'teaching',
    'business': 'business',
    'system': 'system',
    'marketing': 'marketing',
    'content': 'content',
    'other': 'other',
    'centers': 'other',
    'customer-pool': 'business',
    'payment': 'business'
  };

  return moduleMap[moduleDir] || 'root';
}

/**
 * 构建完整路径
 */
function buildFullPath(mountPath, routePath) {
  // 移除前导和尾随斜杠
  const cleanMount = mountPath.replace(/^\/+|\/+$/g, '');
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');

  if (!cleanMount) return `/${cleanRoute}`;
  if (!cleanRoute) return `/${cleanMount}`;
  return `/${cleanMount}/${cleanRoute}`;
}

/**
 * 分析模块路由的挂载点
 */
function analyzeModuleMountPoints() {
  const modules = ['ai', 'auth', 'users', 'enrollment', 'activity', 'teaching', 'business', 'system', 'marketing', 'content', 'other'];

  modules.forEach(module => {
    const indexPath = path.join(ROUTES_DIR, module, 'index.ts');

    if (!fs.existsSync(indexPath)) {
      return;
    }

    const content = fs.readFileSync(indexPath, 'utf-8');

    // 提取 router.use 挂载点
    const usePatterns = [
      /router\.use\s*\(\s*'([^']+)'\s*,\s*(\w+)/g,
      /router\.use\s*\(\s*"([^"]+)"\s*,\s*(\w+)/g
    ];

    usePatterns.forEach(pattern => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const mountPath = match[1];
        const routerVar = match[2];

        if (routeInfo.moduleRoutes[module]) {
          routeInfo.moduleRoutes[module].routes.push({
            mountPath: mountPath,
            routerVar: routerVar,
            fullPath: buildFullPath(routeInfo.moduleRoutes[module].prefix, mountPath)
          });
        }
      }
    });
  });
}

/**
 * 分析主入口文件的路由挂载
 */
function analyzeMountPoints() {
  const indexPath = path.join(ROUTES_DIR, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    routeInfo.warnings.push('主入口文件 index.ts 不存在');
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf-8');

  // 提取 router.use 挂载点 (主入口的挂载)
  const usePatterns = [
    /router\.use\s*\(\s*'([^']+)'\s*,\s*(\w+)/g,
    /router\.use\s*\(\s*"([^"]+)"\s*,\s*(\w+)/g
  ];

  usePatterns.forEach(pattern => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      const mountPath = match[1];
      const routerVar = match[2];

      routeInfo.mountPoints.push({
        path: mountPath,
        routerVar: routerVar,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  });

  // 查找模块导入
  const importRegex = /import\s+(\w+)\s+from\s+['"`]\.\/([^'"`]+)['"`]/g;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    const varName = importMatch[1];
    const modulePath = importMatch[2];

    // 检查是否是模块导入
    const moduleMatch = modulePath.match(/^(ai|auth|users|enrollment|activity|teaching|business|system|marketing|content|other)\//);

    if (moduleMatch) {
      const moduleName = moduleMatch[1];

      // 检查是否有对应的挂载点
      const hasMount = routeInfo.mountPoints.some(mp => mp.routerVar === varName);

      routeInfo.mountPoints.push({
        path: null, // 模块可能直接调用
        routerVar: varName,
        modulePath: modulePath,
        moduleName: moduleName,
        isDirectCall: !hasMount,
        type: 'module'
      });
    }
  }
}

/**
 * 为路由构建完整路径
 */
function buildFullRoutes() {
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const module = fileInfo.module;

      // 根据模块确定前缀
      let prefix = '/api';

      // 如果是根目录的路由文件，使用主入口的挂载点
      if (module === 'root') {
        // 查找主入口中是否有对应的挂载点
        const mountInfo = routeInfo.mountPoints.find(mp => {
          // 根据文件名推断挂载点
          const fileName = fileInfo.file.replace(/\.routes\.ts$/, '').replace(/\.ts$/, '');
          return mp.path && mp.path.includes(fileName);
        });

        if (mountInfo && mountInfo.path) {
          route.fullPath = buildFullPath(mountInfo.path, route.path);
          route.mountPoint = mountInfo.path;
        } else {
          route.fullPath = `/api${route.path.startsWith('/') ? '' : '/'}${route.path}`;
          route.mountPoint = '/api';
        }
      } else {
        // 模块路由，使用模块的前缀
        route.fullPath = buildFullPath(prefix, buildFullPath(module, route.path));
        route.mountPoint = `${prefix}/${module}`;
      }

      route.module = module;
    });
  });
}

/**
 * 检测重复路由
 */
function detectDuplicates() {
  const pathMap = new Map();

  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const fullPath = route.fullPath || route.path;
      const key = `${route.method}:${fullPath}`;

      if (!pathMap.has(key)) {
        pathMap.set(key, []);
      }

      pathMap.get(key).push({
        file: fileInfo.file,
        line: route.line,
        module: route.module
      });
    });
  });

  // 查找重复
  pathMap.forEach((locations, key) => {
    if (locations.length > 1) {
      routeInfo.routeSummary.duplicates.push({
        endpoint: key,
        count: locations.length,
        locations: locations
      });
    }
  });
}

/**
 * 生成统计报告
 */
function generateSummary() {
  // 按方法统计
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const method = route.method;

      if (!routeInfo.routeSummary.byMethod[method]) {
        routeInfo.routeSummary.byMethod[method] = 0;
      }

      routeInfo.routeSummary.byMethod[method]++;
    });
  });

  // 按模块统计
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const module = route.module || 'root';

      if (!routeInfo.routeSummary.byModule[module]) {
        routeInfo.routeSummary.byModule[module] = 0;
      }

      routeInfo.routeSummary.byModule[module]++;
    });
  });

  // 按路径统计
  const pathCounts = {};
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const fullPath = route.fullPath || route.path;

      if (!pathCounts[fullPath]) {
        pathCounts[fullPath] = 0;
      }

      pathCounts[fullPath]++;
    });
  });

  routeInfo.routeSummary.byPath = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .reduce((acc, [path, count]) => {
      acc[path] = count;
      return acc;
    }, {});
}

/**
 * 生成详细的路由清单
 */
function generateRouteInventory() {
  const inventory = {
    byModule: {},
    allRoutes: []
  };

  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const module = route.module || 'root';

      if (!inventory.byModule[module]) {
        inventory.byModule[module] = [];
      }

      inventory.byModule[module].push({
        method: route.method,
        path: route.path,
        fullPath: route.fullPath,
        file: fileInfo.file,
        line: route.line
      });

      inventory.allRoutes.push({
        method: route.method,
        path: route.path,
        fullPath: route.fullPath,
        module: module,
        file: fileInfo.file,
        line: route.line
      });
    });
  });

  return inventory;
}

/**
 * 主扫描函数
 */
function scanRoutes() {
  console.log('🚀 开始扫描后端路由 (v2.0)...\n');

  // 1. 获取所有路由文件
  console.log('📁 扫描路由文件...');
  const routeFiles = getAllRouteFiles(ROUTES_DIR);
  routeInfo.totalFiles = routeFiles.length;
  console.log(`   找到 ${routeFiles.length} 个路由文件\n`);

  // 2. 分析模块挂载点
  console.log('🔍 分析模块路由挂载点...');
  analyzeModuleMountPoints();
  const moduleMountCount = Object.values(routeInfo.moduleRoutes)
    .reduce((sum, module) => sum + module.routes.length, 0);
  console.log(`   找到 ${moduleMountCount} 个模块挂载点\n`);

  // 3. 分析主入口挂载点
  console.log('🔍 分析主入口挂载点...');
  analyzeMountPoints();
  console.log(`   找到 ${routeInfo.mountPoints.length} 个主入口挂载点\n`);

  // 4. 扫描每个文件的路由定义
  console.log('📊 扫描路由定义...');
  routeFiles.forEach(filePath => {
    const fileInfo = extractRoutesFromFile(filePath);

    if (fileInfo.routes.length > 0 || fileInfo.mountPoints.length > 0) {
      routeInfo.routesByFile.push(fileInfo);
      routeInfo.totalRoutes += fileInfo.routes.length;
    }
  });
  console.log(`   找到 ${routeInfo.totalRoutes} 个路由定义\n`);

  // 5. 构建完整路径
  console.log('🔗 构建完整路径...');
  buildFullRoutes();
  console.log(`   已为所有路由构建完整路径\n`);

  // 6. 检测重复
  console.log('🔍 检测重复路由...');
  detectDuplicates();
  console.log(`   找到 ${routeInfo.routeSummary.duplicates.length} 个重复路由\n`);

  // 7. 生成统计
  console.log('📈 生成统计报告...');
  generateSummary();

  // 8. 生成详细清单
  console.log('📋 生成详细清单...');
  routeInfo.inventory = generateRouteInventory();

  // 9. 保存报告
  console.log('💾 保存报告...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(routeInfo, null, 2));

  // 10. 输出摘要
  console.log('\n✅ 扫描完成!\n');
  console.log('📊 扫描摘要:');
  console.log(`   总文件数: ${routeInfo.totalFiles}`);
  console.log(`   总路由数: ${routeInfo.totalRoutes}`);
  console.log(`   模块挂载点: ${moduleMountCount}`);
  console.log(`   主入口挂载点: ${routeInfo.mountPoints.length}`);
  console.log(`   重复路由: ${routeInfo.routeSummary.duplicates.length}`);
  console.log(`\n📄 报告已保存到: ${OUTPUT_FILE}\n`);

  // 输出方法分布
  console.log('📊 HTTP 方法分布:');
  Object.entries(routeInfo.routeSummary.byMethod)
    .sort((a, b) => b[1] - a[1])
    .forEach(([method, count]) => {
      console.log(`   ${method.padEnd(8)}: ${count}`);
    });

  // 输出模块分布
  console.log('\n📊 模块路由分布:');
  Object.entries(routeInfo.routeSummary.byModule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([module, count]) => {
      console.log(`   ${module.padEnd(12)}: ${count}`);
    });

  // 输出前20个最常用的路径
  console.log('\n🔝 前20个最常用路由路径:');
  const topPaths = Object.entries(routeInfo.routeSummary.byPath)
    .slice(0, 20);

  topPaths.forEach(([path, count], index) => {
    console.log(`   ${index + 1}. ${path} (${count})`);
  });

  // 输出AI路由详情
  console.log('\n🤖 AI模块路由详情:');
  const aiRoutes = routeInfo.inventory?.byModule?.ai || [];
  console.log(`   总计: ${aiRoutes.length} 个AI路由`);
  console.log('   挂载点:');
  routeInfo.moduleRoutes.ai.routes.forEach(mount => {
    console.log(`     - ${mount.fullPath} (${mount.routerVar})`);
  });

  // 输出前10个AI路由
  console.log('   前10个AI路由端点:');
  aiRoutes.slice(0, 10).forEach((route, index) => {
    console.log(`     ${index + 1}. ${route.method} ${route.fullPath}`);
  });

  // 输出警告
  if (routeInfo.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    routeInfo.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }

  return routeInfo;
}

// 执行扫描
if (require.main === module) {
  try {
    scanRoutes();
  } catch (error) {
    console.error('❌ 扫描失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { scanRoutes, extractRoutesFromFile };
