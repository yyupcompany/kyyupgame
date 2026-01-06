import fs from 'fs/promises';
import path from 'path';

// Analysis configuration
const REPORT_FILE = './manual-dashboard-analysis-report.json';
const CLIENT_SRC_PATH = './client/src';

async function analyzeDashboardImplementation() {
  console.log('🔍 开始仪表板实现分析...\n');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    dashboard: {
      routes: [],
      components: [],
      pages: [],
      apis: [],
      stores: [],
      issues: [],
      recommendations: []
    },
    loginSystem: {
      authentication: {},
      userManagement: {},
      permissions: {}
    },
    summary: {
      totalFiles: 0,
      dashboardFiles: 0,
      loginFiles: 0,
      apiFiles: 0
    }
  };

  try {
    // 1. 分析路由配置
    console.log('📋 分析路由配置...');
    const routerPath = path.join(CLIENT_SRC_PATH, 'router');
    const routerFiles = await findFiles(routerPath, /\.(ts|js)$/);
    
    for (const file of routerFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const routes = extractRoutes(content);
      analysis.dashboard.routes.push(...routes);
    }

    // 2. 分析仪表板相关组件
    console.log('📊 分析仪表板组件...');
    const dashboardPatterns = [
      /dashboard/i,
      /仪表板/,
      /总览/,
      /概览/,
      /主页/
    ];

    const allFiles = await findFiles(CLIENT_SRC_PATH, /\.(vue|ts|js)$/);
    analysis.summary.totalFiles = allFiles.length;

    for (const file of allFiles) {
      const fileName = path.basename(file);
      const content = await fs.readFile(file, 'utf-8');
      
      // 检查是否为仪表板相关文件
      const isDashboardFile = dashboardPatterns.some(pattern => 
        pattern.test(fileName) || pattern.test(content)
      );
      
      if (isDashboardFile) {
        analysis.summary.dashboardFiles++;
        const componentAnalysis = analyzeComponent(file, content);
        analysis.dashboard.components.push(componentAnalysis);
      }

      // 检查是否为登录相关文件
      if (file.includes('login') || content.includes('login') || content.includes('登录')) {
        analysis.summary.loginFiles++;
      }

      // 检查API调用
      const apiCalls = extractApiCalls(content);
      if (apiCalls.length > 0) {
        analysis.summary.apiFiles++;
        analysis.dashboard.apis.push({
          file: path.relative(CLIENT_SRC_PATH, file),
          apis: apiCalls
        });
      }
    }

    // 3. 分析状态管理
    console.log('🗃️ 分析状态管理...');
    const storesPath = path.join(CLIENT_SRC_PATH, 'stores');
    if (await pathExists(storesPath)) {
      const storeFiles = await findFiles(storesPath, /\.(ts|js)$/);
      for (const file of storeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const storeAnalysis = analyzeStore(file, content);
        analysis.dashboard.stores.push(storeAnalysis);
      }
    }

    // 4. 分析页面组件
    console.log('📄 分析页面组件...');
    const pagesPath = path.join(CLIENT_SRC_PATH, 'pages');
    if (await pathExists(pagesPath)) {
      const pageFiles = await findFiles(pagesPath, /\.vue$/);
      for (const file of pageFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const pageAnalysis = analyzePage(file, content);
        analysis.dashboard.pages.push(pageAnalysis);
      }
    }

    // 5. 生成问题和建议
    generateIssuesAndRecommendations(analysis);

    // 保存分析报告
    await fs.writeFile(REPORT_FILE, JSON.stringify(analysis, null, 2));

    // 打印分析结果
    printAnalysisResults(analysis);

    return analysis;

  } catch (error) {
    console.error('分析过程中发生错误:', error);
    return null;
  }
}

async function findFiles(dir, pattern) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findFiles(fullPath, pattern);
        files.push(...subFiles);
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // 目录不存在或无法访问
  }
  
  return files;
}

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

function extractRoutes(content) {
  const routes = [];
  
  // 匹配路由定义
  const routePattern = /\{\s*path:\s*['"]([^'"]+)['"][^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let match;
  
  while ((match = routePattern.exec(content)) !== null) {
    routes.push({
      path: match[1],
      name: match[2],
      isDashboard: match[1].includes('dashboard') || match[2].includes('dashboard') || match[2].includes('仪表板')
    });
  }
  
  return routes;
}

function analyzeComponent(filePath, content) {
  const analysis = {
    file: path.relative(CLIENT_SRC_PATH, filePath),
    type: getComponentType(filePath, content),
    hasTemplate: content.includes('<template>'),
    hasScript: content.includes('<script'),
    hasStyle: content.includes('<style'),
    usesElementPlus: content.includes('el-'),
    usesEcharts: content.includes('echarts') || content.includes('chart'),
    apiCalls: extractApiCalls(content),
    computedProperties: extractComputedProperties(content),
    watchers: extractWatchers(content),
    lifecycle: extractLifecycleHooks(content),
    issues: []
  };

  // 检查常见问题
  if (!analysis.hasTemplate) analysis.issues.push('缺少模板部分');
  if (!analysis.hasScript) analysis.issues.push('缺少脚本部分');
  if (analysis.apiCalls.length === 0 && analysis.type === 'dashboard') {
    analysis.issues.push('仪表板组件可能缺少数据获取');
  }

  return analysis;
}

function analyzeStore(filePath, content) {
  return {
    file: path.relative(CLIENT_SRC_PATH, filePath),
    name: path.basename(filePath, path.extname(filePath)),
    usesPinia: content.includes('defineStore'),
    hasState: content.includes('state:') || content.includes('state()'),
    hasActions: content.includes('actions:'),
    hasGetters: content.includes('getters:'),
    apiCalls: extractApiCalls(content)
  };
}

function analyzePage(filePath, content) {
  const analysis = {
    file: path.relative(CLIENT_SRC_PATH, filePath),
    name: path.basename(filePath, '.vue'),
    hasRouterView: content.includes('<router-view'),
    hasLoading: content.includes('loading') || content.includes('加载'),
    hasErrorHandling: content.includes('error') || content.includes('错误'),
    usesComponents: extractUsedComponents(content),
    apiCalls: extractApiCalls(content)
  };

  return analysis;
}

function getComponentType(filePath, content) {
  if (filePath.includes('dashboard') || content.includes('dashboard')) return 'dashboard';
  if (filePath.includes('login') || content.includes('login')) return 'login';
  if (filePath.includes('layout')) return 'layout';
  if (filePath.includes('component')) return 'component';
  return 'unknown';
}

function extractApiCalls(content) {
  const apiCalls = [];
  
  // 匹配 fetch、axios、API 调用
  const patterns = [
    /(?:fetch|axios)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\.(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /api\.\w+\([^)]*\)/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      apiCalls.push(match[1] || match[0]);
    }
  });

  return [...new Set(apiCalls)]; // 去重
}

function extractComputedProperties(content) {
  const computed = [];
  const pattern = /computed:\s*\{([^}]+)\}/gs;
  const match = pattern.exec(content);
  
  if (match) {
    const computedStr = match[1];
    const propPattern = /(\w+)\s*\(/g;
    let propMatch;
    
    while ((propMatch = propPattern.exec(computedStr)) !== null) {
      computed.push(propMatch[1]);
    }
  }
  
  return computed;
}

function extractWatchers(content) {
  const watchers = [];
  const pattern = /watch:\s*\{([^}]+)\}/gs;
  const match = pattern.exec(content);
  
  if (match) {
    const watchStr = match[1];
    const propPattern = /['"`]?(\w+)['"`]?\s*[:({]/g;
    let propMatch;
    
    while ((propMatch = propPattern.exec(watchStr)) !== null) {
      watchers.push(propMatch[1]);
    }
  }
  
  return watchers;
}

function extractLifecycleHooks(content) {
  const hooks = [];
  const hookPattern = /(onMounted|onBeforeMount|onUpdated|onBeforeUpdate|onUnmounted|mounted|created|beforeCreate|beforeMount|beforeUpdate|updated|beforeUnmount|unmounted)\s*\(/g;
  let match;
  
  while ((match = hookPattern.exec(content)) !== null) {
    hooks.push(match[1]);
  }
  
  return [...new Set(hooks)];
}

function extractUsedComponents(content) {
  const components = [];
  
  // 匹配组件使用
  const componentPattern = /<([A-Z][a-zA-Z0-9-]*)/g;
  let match;
  
  while ((match = componentPattern.exec(content)) !== null) {
    components.push(match[1]);
  }
  
  return [...new Set(components)];
}

function generateIssuesAndRecommendations(analysis) {
  const issues = [];
  const recommendations = [];

  // 检查仪表板组件数量
  if (analysis.dashboard.components.length === 0) {
    issues.push('未找到仪表板相关组件');
    recommendations.push('创建仪表板主组件以显示系统概览');
  }

  // 检查路由配置
  const dashboardRoutes = analysis.dashboard.routes.filter(r => r.isDashboard);
  if (dashboardRoutes.length === 0) {
    issues.push('未找到仪表板路由配置');
    recommendations.push('配置仪表板路由以支持导航');
  }

  // 检查API集成
  if (analysis.dashboard.apis.length === 0) {
    issues.push('仪表板可能缺少API数据集成');
    recommendations.push('集成后端API以获取统计数据');
  }

  // 检查状态管理
  if (analysis.dashboard.stores.length === 0) {
    recommendations.push('考虑使用状态管理来管理仪表板数据');
  }

  analysis.dashboard.issues = issues;
  analysis.dashboard.recommendations = recommendations;
}

function printAnalysisResults(analysis) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 仪表板实现分析报告');
  console.log('='.repeat(60));
  
  console.log(`\n📁 文件统计:`);
  console.log(`   总文件数: ${analysis.summary.totalFiles}`);
  console.log(`   仪表板相关: ${analysis.summary.dashboardFiles}`);
  console.log(`   登录相关: ${analysis.summary.loginFiles}`);
  console.log(`   API调用文件: ${analysis.summary.apiFiles}`);
  
  console.log(`\n🛣️ 路由分析:`);
  const dashboardRoutes = analysis.dashboard.routes.filter(r => r.isDashboard);
  console.log(`   仪表板路由: ${dashboardRoutes.length} 个`);
  dashboardRoutes.forEach(route => {
    console.log(`     - ${route.path} (${route.name})`);
  });
  
  console.log(`\n🧩 组件分析:`);
  console.log(`   仪表板组件: ${analysis.dashboard.components.length} 个`);
  analysis.dashboard.components.forEach(comp => {
    console.log(`     - ${comp.file} (${comp.type})`);
    if (comp.issues.length > 0) {
      comp.issues.forEach(issue => console.log(`       ⚠️ ${issue}`));
    }
  });
  
  console.log(`\n📄 页面分析:`);
  console.log(`   页面组件: ${analysis.dashboard.pages.length} 个`);
  
  console.log(`\n🗃️ 状态管理:`);
  console.log(`   Store文件: ${analysis.dashboard.stores.length} 个`);
  analysis.dashboard.stores.forEach(store => {
    console.log(`     - ${store.name} (Pinia: ${store.usesPinia ? '✅' : '❌'})`);
  });
  
  if (analysis.dashboard.issues.length > 0) {
    console.log(`\n⚠️ 发现的问题:`);
    analysis.dashboard.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
  
  if (analysis.dashboard.recommendations.length > 0) {
    console.log(`\n💡 建议:`);
    analysis.dashboard.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }
  
  console.log(`\n📄 详细报告已保存到: ${REPORT_FILE}`);
  console.log('='.repeat(60));
}

// 运行分析
analyzeDashboardImplementation().catch(console.error);