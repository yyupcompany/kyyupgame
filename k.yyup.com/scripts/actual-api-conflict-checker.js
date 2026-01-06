#!/usr/bin/env node

/**
 * 实际运行中的API冲突检测器
 * 检查真正会冲突的API端点（完全相同的路径）
 */

const fs = require('fs');
const path = require('path');

class ActualAPIConflictChecker {
  constructor() {
    this.serverRoutesPath = path.join(__dirname, '../server/src/routes/index.ts');
    this.conflicts = [];
  }

  /**
   * 读取主路由文件，分析实际的路由映射
   */
  analyzeActualRoutes() {
    console.log('🔍 分析实际运行中的路由映射...\n');

    const indexContent = fs.readFileSync(this.serverRoutesPath, 'utf8');

    // 提取路由使用模式
    const routerUsageMatches = indexContent.match(/router\.use\(['"]([^'"]+)['"].*?from\s+['"]\.\/([^'"]+)['"]/g);

    const routeMappings = [];
    if (routerUsageMatches) {
      routerUsageMatches.forEach(match => {
        const pathMatch = match.match(/router\.use\(['"]([^'"]+)['"].*?from\s+['"]\.\/([^'"]+)['"]/);
        if (pathMatch) {
          const [, pathPrefix, routeFile] = pathMatch;
          routeMappings.push({ pathPrefix, routeFile });
        }
      });
    }

    console.log(`📋 发现 ${routeMappings.length} 个路由映射:`);
    routeMappings.forEach(mapping => {
      console.log(`   ${mapping.pathPrefix} -> ${mapping.routeFile}`);
    });

    // 检查可能的路径冲突
    this.checkPathConflicts(routeMappings);
  }

  /**
   * 检查路径冲突
   */
  checkPathConflicts(routeMappings) {
    console.log('\n🔍 检查路径冲突...\n');

    // 读取index.ts中直接定义的路由
    const indexContent = fs.readFileSync(this.serverRoutesPath, 'utf8');

    // 提取直接在index.ts中定义的路由
    const directRoutes = [];

    // 匹配 router.get/put/post/delete('/path', ...
    const routeMatches = indexContent.match(/router\.(get|put|post|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g);
    if (routeMatches) {
      routeMatches.forEach(match => {
        const pathMatch = match.match(/router\.(get|put|post|delete|patch)\s*\(\s*['"]([^'"]+)['"]/);
        if (pathMatch) {
          const [, method, path] = pathMatch;
          directRoutes.push({ method, path, file: 'index.ts' });
        }
      });
    }

    console.log(`📋 在index.ts中发现 ${directRoutes.length} 个直接路由:`);

    // 检查路径重复
    const pathMap = new Map();

    // 添加直接路由
    directRoutes.forEach(route => {
      const key = `${route.method.toUpperCase()} ${route.path}`;
      if (!pathMap.has(key)) {
        pathMap.set(key, []);
      }
      pathMap.get(key).push(route);
    });

    // 检查路由文件中是否定义了相同路径（忽略路径前缀）
    this.checkRouteFileConflicts(routeMappings, pathMap);

    // 报告冲突
    this.reportConflicts(pathMap);
  }

  /**
   * 检查路由文件中的冲突
   */
  checkRouteFileConflicts(routeMappings, pathMap) {
    routeMappings.forEach(mapping => {
      const routeFilePath = path.join(__dirname, '../server/src/routes', mapping.routeFile + '.ts');

      if (fs.existsSync(routeFilePath)) {
        const routeContent = fs.readFileSync(routeFilePath, 'utf8');

        // 提取路由定义
        const routeMatches = routeContent.match(/router\.(get|put|post|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g);

        if (routeMatches) {
          routeMatches.forEach(match => {
            const pathMatch = match.match(/router\.(get|put|post|delete|patch)\s*\(\s*['"]([^'"]+)['"]/);
            if (pathMatch) {
              const [, method, path] = pathMatch;
              const fullPath = mapping.pathPrefix + path;

              // 检查是否与直接路由冲突（去掉前缀比较）
              directRoutes.forEach(directRoute => {
                if (path === directRoute.path && method === directRoute.method) {
                  const key = `${method.toUpperCase()} ${path}`;
                  if (!pathMap.has(key)) {
                    pathMap.set(key, []);
                  }
                  pathMap.get(key).push({
                    method,
                    path,
                    fullPath,
                    file: mapping.routeFile,
                    conflictType: 'prefix-conflict'
                  });
                }
              });
            }
          });
        }
      }
    });
  }

  /**
   * 报告冲突
   */
  reportConflicts(pathMap) {
    console.log('\n📊 API冲突检测报告\n');
    console.log('─'.repeat(50));

    let conflictCount = 0;
    let severeConflicts = [];

    pathMap.forEach((routes, key) => {
      if (routes.length > 1) {
        conflictCount++;
        console.log(`\n🚨 冲突 ${conflictCount}: ${key}`);
        console.log(`   发现 ${routes.length} 个重复定义:`);

        routes.forEach((route, index) => {
          if (route.conflictType === 'prefix-conflict') {
            console.log(`   ${index + 1}. [路径前缀冲突] ${route.file}: ${route.fullPath}`);
          } else {
            console.log(`   ${index + 1}. [直接冲突] ${route.file}: ${route.path}`);
          }
        });

        // 标记严重冲突（相同的完整路径）
        const fullPaths = routes.map(r => r.fullPath || r.path);
        const uniqueFullPaths = [...new Set(fullPaths)];
        if (uniqueFullPaths.length === 1 && routes.length > 1) {
          severeConflicts.push({
            endpoint: key,
            count: routes.length,
            files: routes.map(r => r.file)
          });
        }
      }
    });

    console.log('\n' + '─'.repeat(50));
    console.log(`📈 检测结果:`);
    console.log(`   总冲突数: ${conflictCount}`);
    console.log(`   严重冲突: ${severeConflicts.length}`);

    if (severeConflicts.length > 0) {
      console.log('\n🚨 需要立即修复的严重冲突:');
      severeConflicts.forEach(conflict => {
        console.log(`   - ${conflict.endpoint}: ${conflict.files.join(', ')}`);
      });
    }

    // 生成修复建议
    this.generateFixSuggestions(severeConflicts);

    return {
      totalConflicts: conflictCount,
      severeConflicts,
      allConflicts: Array.from(pathMap.entries()).filter(([_, routes]) => routes.length > 1)
    };
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions(severeConflicts) {
    console.log('\n💡 修复建议:');

    if (severeConflicts.length === 0) {
      console.log('   ✅ 没有发现严重的API路径冲突');
      console.log('   ✅ 所有API路径都是唯一的');
    } else {
      console.log('   🔴 立即修复:');
      severeConflicts.forEach(conflict => {
        console.log(`   - ${conflict.endpoint}: 确定唯一的数据源，删除重复定义`);
      });
    }

    console.log('\n   📋 一般建议:');
    console.log('   1. 使用路径前缀区分不同模块 (如 /api/website-automation/tasks)');
    console.log('   2. 避免在多个文件中定义完全相同的路径');
    console.log('   3. 建立清晰的API命名规范');
    console.log('   4. 定期运行冲突检测工具');
  }

  /**
   * 运行检测
   */
  run() {
    console.log('🔧 实际API冲突检测工具\n');
    console.log('🎯 检测实际运行中会冲突的API端点\n');

    try {
      this.analyzeActualRoutes();
      console.log('\n✅ 检测完成！');
    } catch (error) {
      console.error('\n❌ 检测过程中出错:', error.message);
      process.exit(1);
    }
  }
}

// 运行检测
if (require.main === module) {
  const checker = new ActualAPIConflictChecker();
  checker.run();
}

module.exports = ActualAPIConflictChecker;