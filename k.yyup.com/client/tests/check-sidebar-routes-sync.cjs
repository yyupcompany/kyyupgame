/**
 * 侧边栏导航配置与路由配置同步性检查
 * 确保侧边栏中的每个链接都有对应的路由定义
 */

const fs = require('fs');
const path = require('path');

class SidebarRoutesSyncChecker {
  constructor() {
    this.clientPath = path.join(__dirname, '..');
    this.sidebarRoutes = [];
    this.routeDefinitions = [];
    this.unmatchedSidebarRoutes = [];
    this.unmatchedRouteDefinitions = [];
  }

  // 读取侧边栏导航配置
  extractSidebarRoutes() {
    console.log('📋 提取侧边栏导航配置...');
    
    // 查找可能的导航配置文件
    const possibleFiles = [
      path.join(this.clientPath, 'src/config/navigation.ts'),
      path.join(this.clientPath, 'src/config/menu.ts'),
      path.join(this.clientPath, 'src/layouts/navigation.ts'),
      path.join(this.clientPath, 'src/components/layout/navigation.ts'),
      path.join(this.clientPath, 'src/router/navigation.ts')
    ];
    
    let navigationConfig = null;
    let configFile = null;
    
    for (const file of possibleFiles) {
      if (fs.existsSync(file)) {
        configFile = file;
        navigationConfig = fs.readFileSync(file, 'utf8');
        console.log(`✅ 找到导航配置文件: ${file}`);
        break;
      }
    }
    
    if (!navigationConfig) {
      console.log('❌ 未找到导航配置文件');
      return [];
    }
    
    // 使用正则表达式提取路由
    const routeMatches = navigationConfig.match(/route\s*:\s*['\"][^'\"]+['\"]/g);
    if (routeMatches) {
      this.sidebarRoutes = routeMatches.map(match => {
        const route = match.match(/['\"]([^'\"]+)['\"]/)[1];
        return {
          route: route,
          source: 'navigation-config',
          file: configFile
        };
      });
    }
    
    console.log(`📊 从导航配置中提取到 ${this.sidebarRoutes.length} 个路由`);
    
    return this.sidebarRoutes;
  }

  // 读取路由定义
  extractRouteDefinitions() {
    console.log('🛣️ 提取路由定义...');
    
    const routeFiles = [
      path.join(this.clientPath, 'src/router/index.ts'),
      path.join(this.clientPath, 'src/router/optimized-routes.ts'),
      path.join(this.clientPath, 'src/router/routes.ts')
    ];
    
    this.routeDefinitions = [];
    
    for (const file of routeFiles) {
      if (fs.existsSync(file)) {
        console.log(`📄 读取路由文件: ${file}`);
        const content = fs.readFileSync(file, 'utf8');
        
        // 提取路由定义
        this.extractRoutesFromContent(content, file);
      }
    }
    
    console.log(`📊 从路由配置中提取到 ${this.routeDefinitions.length} 个路由`);
    
    return this.routeDefinitions;
  }

  extractRoutesFromContent(content, file) {
    // 移除注释的路由
    const lines = content.split('\n');
    let inBlockComment = false;
    let activeLines = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 跳过单行注释
      if (trimmed.startsWith('//')) {
        continue;
      }
      
      // 处理块注释
      if (trimmed.includes('/*')) {
        inBlockComment = true;
      }
      
      if (trimmed.includes('*/')) {
        inBlockComment = false;
        continue;
      }
      
      if (inBlockComment) {
        continue;
      }
      
      activeLines.push(line);
    }
    
    const activeContent = activeLines.join('\n');
    
    // 使用递归解析路由结构
    this.parseRouteStructure(activeContent, file, '');
  }

  parseRouteStructure(content, file, parentPath) {
    // 使用更简单的方法：先找到所有path定义，然后分析上下文
    const pathMatches = content.match(/path\s*:\s*['\"]([^'\"]+)['\"]/g);
    
    if (!pathMatches) return;
    
    // 分析每个path在代码中的上下文
    pathMatches.forEach(pathMatch => {
      const path = pathMatch.match(/['\"]([^'\"]+)['\"]/)[1];
      
      // 跳过包含参数的路由
      if (path.includes(':') || path.includes('*')) {
        return;
      }
      
      // 构建完整路径
      let fullPath = parentPath;
      if (path !== '') {
        fullPath += (fullPath && !fullPath.endsWith('/') ? '/' : '') + path;
      }
      
      // 确保路径以/开头
      if (fullPath && !fullPath.startsWith('/')) {
        fullPath = '/' + fullPath;
      }
      
      // 添加路由定义
      if (fullPath && fullPath !== '/') {
        this.routeDefinitions.push({
          path: fullPath,
          source: 'route-definition',
          file: file
        });
      }
    });
    
    // 处理嵌套路由
    const childrenMatches = content.match(/children\s*:\s*\[[\s\S]*?\]/g);
    if (childrenMatches) {
      childrenMatches.forEach(childrenMatch => {
        const childrenContent = childrenMatch.match(/children\s*:\s*\[([\s\S]*)\]/)[1];
        
        // 找到这个children所属的父路由
        const beforeChildren = content.substring(0, content.indexOf(childrenMatch));
        const parentPathMatches = beforeChildren.match(/path\s*:\s*['\"]([^'\"]+)['\"]/g);
        
        if (parentPathMatches && parentPathMatches.length > 0) {
          const lastParentPath = parentPathMatches[parentPathMatches.length - 1];
          const parentPath = lastParentPath.match(/['\"]([^'\"]+)['\"]/)[1];
          
          let fullParentPath = parentPath;
          if (!fullParentPath.startsWith('/')) {
            fullParentPath = '/' + fullParentPath;
          }
          
          this.parseRouteStructure(childrenContent, file, fullParentPath);
        }
      });
    }
  }

  // 检查同步性
  checkSynchronization() {
    console.log('🔍 检查同步性...');
    
    // 标准化路由格式
    const normalizeRoute = (route) => {
      return route.replace(/^\//, '').replace(/\/$/, '');
    };
    
    // 创建路由定义映射
    const routeMap = new Map();
    this.routeDefinitions.forEach(route => {
      const normalized = normalizeRoute(route.path);
      routeMap.set(normalized, route);
    });
    
    // 检查侧边栏路由
    this.unmatchedSidebarRoutes = [];
    const matchedRoutes = [];
    
    this.sidebarRoutes.forEach(sidebarRoute => {
      const normalized = normalizeRoute(sidebarRoute.route);
      
      if (routeMap.has(normalized)) {
        matchedRoutes.push({
          route: sidebarRoute.route,
          status: 'matched',
          sidebarSource: sidebarRoute.file,
          routeSource: routeMap.get(normalized).file
        });
      } else {
        this.unmatchedSidebarRoutes.push({
          route: sidebarRoute.route,
          status: 'unmatched',
          source: sidebarRoute.file,
          issue: '侧边栏路由没有对应的路由定义'
        });
      }
    });
    
    // 检查路由定义
    const sidebarMap = new Map();
    this.sidebarRoutes.forEach(route => {
      const normalized = normalizeRoute(route.route);
      sidebarMap.set(normalized, route);
    });
    
    this.unmatchedRouteDefinitions = [];
    this.routeDefinitions.forEach(routeDefinition => {
      const normalized = normalizeRoute(routeDefinition.path);
      
      if (!sidebarMap.has(normalized) && !normalized.includes('login') && !normalized.includes('404')) {
        this.unmatchedRouteDefinitions.push({
          path: routeDefinition.path,
          status: 'unmatched',
          source: routeDefinition.file,
          issue: '路由定义没有对应的侧边栏链接'
        });
      }
    });
    
    return {
      matchedRoutes,
      unmatchedSidebarRoutes: this.unmatchedSidebarRoutes,
      unmatchedRouteDefinitions: this.unmatchedRouteDefinitions
    };
  }

  // 生成报告
  generateReport() {
    console.log('📊 生成同步性报告...');
    
    const syncResult = this.checkSynchronization();
    
    const summary = {
      totalSidebarRoutes: this.sidebarRoutes.length,
      totalRouteDefinitions: this.routeDefinitions.length,
      matchedRoutes: syncResult.matchedRoutes.length,
      unmatchedSidebarRoutes: syncResult.unmatchedSidebarRoutes.length,
      unmatchedRouteDefinitions: syncResult.unmatchedRouteDefinitions.length,
      syncRate: 0,
      timestamp: new Date().toISOString()
    };
    
    if (summary.totalSidebarRoutes > 0) {
      summary.syncRate = ((summary.matchedRoutes / summary.totalSidebarRoutes) * 100).toFixed(2);
    }
    
    // 控制台输出
    console.log('\\n📋 同步性检查结果:');
    console.log('================================================================================');
    console.log(`📊 侧边栏路由总数: ${summary.totalSidebarRoutes}`);
    console.log(`📊 路由定义总数: ${summary.totalRouteDefinitions}`);
    console.log(`✅ 匹配路由: ${summary.matchedRoutes}`);
    console.log(`❌ 未匹配侧边栏路由: ${summary.unmatchedSidebarRoutes}`);
    console.log(`⚠️ 未匹配路由定义: ${summary.unmatchedRouteDefinitions}`);
    console.log(`📈 同步率: ${summary.syncRate}%`);
    
    // 显示匹配的路由
    if (syncResult.matchedRoutes.length > 0) {
      console.log('\\n✅ 匹配的路由:');
      console.log('================================================================================');
      syncResult.matchedRoutes.forEach((route, index) => {
        console.log(`${index + 1}. ${route.route}`);
      });
    }
    
    // 显示未匹配的侧边栏路由
    if (syncResult.unmatchedSidebarRoutes.length > 0) {
      console.log('\\n❌ 未匹配的侧边栏路由 (需要修复):');
      console.log('================================================================================');
      syncResult.unmatchedSidebarRoutes.forEach((route, index) => {
        console.log(`${index + 1}. ${route.route}`);
        console.log(`   问题: ${route.issue}`);
        console.log(`   来源: ${route.source}`);
        console.log('');
      });
    }
    
    // 显示未匹配的路由定义
    if (syncResult.unmatchedRouteDefinitions.length > 0) {
      console.log('\\n⚠️ 未匹配的路由定义 (可能需要添加到侧边栏):');
      console.log('================================================================================');
      syncResult.unmatchedRouteDefinitions.forEach((route, index) => {
        console.log(`${index + 1}. ${route.path}`);
        console.log(`   问题: ${route.issue}`);
        console.log(`   来源: ${route.source}`);
        console.log('');
      });
    }
    
    // 生成修复建议
    console.log('\\n💡 修复建议:');
    console.log('================================================================================');
    
    if (syncResult.unmatchedSidebarRoutes.length > 0) {
      console.log('针对未匹配的侧边栏路由:');
      syncResult.unmatchedSidebarRoutes.forEach(route => {
        console.log(`  - ${route.route}: 取消注释对应的路由定义或从侧边栏移除此链接`);
      });
    }
    
    if (syncResult.unmatchedRouteDefinitions.length > 0) {
      console.log('针对未匹配的路由定义:');
      syncResult.unmatchedRouteDefinitions.forEach(route => {
        console.log(`  - ${route.path}: 考虑添加到侧边栏导航或确认是否为隐藏路由`);
      });
    }
    
    // 保存报告
    const reportData = {
      summary,
      syncResult,
      metadata: {
        testType: 'Sidebar Routes Sync Check',
        generatedAt: new Date().toISOString(),
        description: '检查侧边栏导航配置与路由配置的同步性'
      }
    };
    
    const reportPath = path.join(__dirname, 'sidebar-routes-sync-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\\n📄 详细报告已保存到: ${reportPath}`);
    
    return reportData;
  }

  // 运行检查
  async run() {
    console.log('🚀 开始侧边栏路由同步性检查...');
    
    try {
      this.extractSidebarRoutes();
      this.extractRouteDefinitions();
      this.generateReport();
      
      console.log('\\n✅ 检查完成!');
      
    } catch (error) {
      console.error('❌ 检查失败:', error);
    }
  }
}

// 执行检查
async function main() {
  const checker = new SidebarRoutesSyncChecker();
  await checker.run();
}

// 检查是否直接运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SidebarRoutesSyncChecker;