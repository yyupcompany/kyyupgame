#!/usr/bin/env node
/**
 * 后端路由扫描工具
 * 扫描 /persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/routes 目录下的所有后端路由定义
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
  totalFiles: 0,
  totalRoutes: 0,
  routesByFile: [],
  routeSummary: {
    byMethod: {},
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
    mountPoints: []
  };

  // 提取 router.get/post/put/delete 等路由定义
  HTTP_METHODS.forEach(method => {
    // 匹配 router.method('/path', ...) 或 router['method']('/path', ...)
    // 支持单引号、双引号、反引号
    const patterns = [
      new RegExp(`router\\.${method}\\s*\\(\\s*'([^']+)'\\s*[,)]`, 'gm'),
      new RegExp(`router\\.${method}\\s*\\(\\s*"([^"]+)"\\s*[,)]`, 'gm'),
      new RegExp(`router\\.${method}\\s*\\(\\s+\`([^\`]+)\`\\s*[,)]`, 'gm')
    ];

    patterns.forEach(pattern => {
      let match;
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
  const useRegex = /(?:app|router)\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
  let useMatch;
  while ((useMatch = useRegex.exec(content)) !== null) {
    routes.mountPoints.push({
      path: useMatch[1],
      line: content.substring(0, useMatch.index).split('\n').length
    });
  }

  // 提取 module.exports 或 export default
  if (content.includes('module.exports') || content.includes('export default')) {
    routes.exports.push({
      type: content.includes('module.exports') ? 'module.exports' : 'export default'
    });
  }

  return routes;
}

/**
 * 解析路由路径参数
 */
function parseRoutePath(path) {
  // 将 :param 转换为 {param} 格式
  return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '{$1}');
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
 * 分析主入口文件的路由挂载
 */
function analyzeMountPoints() {
  const indexPath = path.join(ROUTES_DIR, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    routeInfo.warnings.push('主入口文件 index.ts 不存在');
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf-8');

  // 提取 app.use 或 router.use 挂载点
  const mountRegex = /(?:app|router)\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;

  while ((match = mountRegex.exec(content)) !== null) {
    const mountPath = match[1];
    const routerVar = match[2];

    routeInfo.mountPoints.push({
      path: mountPath,
      routerVar: routerVar,
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // 查找模块导入
  const importRegex = /import\s+(\w+)\s+from\s+['"`]\.\/([^'"`]+)['"`]/g;
  while ((match = importRegex.exec(content)) !== null) {
    const varName = match[1];
    const modulePath = match[2];

    // 检查是否有对应的挂载点
    const hasMount = routeInfo.mountPoints.some(mp => mp.routerVar === varName);

    routeInfo.mountPoints.push({
      path: null, // 模块可能直接调用
      routerVar: varName,
      modulePath: modulePath,
      isDirectCall: !hasMount
    });
  }
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
        line: route.line
      });
    });
  });

  // 查找重复
  pathMap.forEach((locations, key) => {
    if (locations.length > 1) {
      routeInfo.routeSummary.duplicates.push({
        endpoint: key,
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

  // 按路径统计
  const pathCounts = {};
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      const path = route.fullPath || route.path;

      if (!pathCounts[path]) {
        pathCounts[path] = 0;
      }

      pathCounts[path]++;
    });
  });

  routeInfo.routeSummary.byPath = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .reduce((acc, [path, count]) => {
      acc[path] = count;
      return acc;
    }, {});
}

/**
 * 主扫描函数
 */
function scanRoutes() {
  console.log('🚀 开始扫描后端路由...\n');

  // 1. 获取所有路由文件
  console.log('📁 扫描路由文件...');
  const routeFiles = getAllRouteFiles(ROUTES_DIR);
  routeInfo.totalFiles = routeFiles.length;
  console.log(`   找到 ${routeFiles.length} 个路由文件\n`);

  // 2. 分析路由挂载点
  console.log('🔍 分析路由挂载点...');
  analyzeMountPoints();
  console.log(`   找到 ${routeInfo.mountPoints.length} 个挂载点\n`);

  // 3. 扫描每个文件的路由定义
  console.log('📊 扫描路由定义...');
  routeFiles.forEach(filePath => {
    const fileInfo = extractRoutesFromFile(filePath);

    if (fileInfo.routes.length > 0 || fileInfo.mountPoints.length > 0) {
      routeInfo.routesByFile.push(fileInfo);
      routeInfo.totalRoutes += fileInfo.routes.length;
    }
  });
  console.log(`   找到 ${routeInfo.totalRoutes} 个路由定义\n`);

  // 4. 尝试构建完整路径
  console.log('🔗 构建完整路径...');
  routeInfo.routesByFile.forEach(fileInfo => {
    fileInfo.routes.forEach(route => {
      // 如果文件在子模块中，尝试添加模块前缀
      const moduleMatch = fileInfo.file.match(/^(ai|auth|users|enrollment|activity|teaching|business|system|marketing|content|other|centers|customer-pool|payment)\//i);

      if (moduleMatch) {
        const moduleName = moduleMatch[1].toLowerCase();
        route.fullPath = buildFullPath(`/${moduleName}`, route.path);
        route.module = moduleName;
      } else {
        route.fullPath = route.path;
        route.module = 'root';
      }
    });
  });

  // 5. 检测重复
  console.log('🔍 检测重复路由...');
  detectDuplicates();
  console.log(`   找到 ${routeInfo.routeSummary.duplicates.length} 个重复路由\n`);

  // 6. 生成统计
  console.log('📈 生成统计报告...');
  generateSummary();

  // 7. 保存报告
  console.log('💾 保存报告...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(routeInfo, null, 2));

  // 8. 输出摘要
  console.log('\n✅ 扫描完成!\n');
  console.log('📊 扫描摘要:');
  console.log(`   总文件数: ${routeInfo.totalFiles}`);
  console.log(`   总路由数: ${routeInfo.totalRoutes}`);
  console.log(`   挂载点数: ${routeInfo.mountPoints.length}`);
  console.log(`   重复路由: ${routeInfo.routeSummary.duplicates.length}`);
  console.log(`\n📄 报告已保存到: ${OUTPUT_FILE}\n`);

  // 输出方法分布
  console.log('📊 HTTP 方法分布:');
  Object.entries(routeInfo.routeSummary.byMethod)
    .sort((a, b) => b[1] - a[1])
    .forEach(([method, count]) => {
      console.log(`   ${method.padEnd(8)}: ${count}`);
    });

  // 输出前20个最常用的路径
  console.log('\n🔝 前20个最常用路由路径:');
  const topPaths = Object.entries(routeInfo.routeSummary.byPath)
    .slice(0, 20);

  topPaths.forEach(([path, count], index) => {
    console.log(`   ${index + 1}. ${path} (${count})`);
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
