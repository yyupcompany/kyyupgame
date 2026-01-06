import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface BackendRoute {
  method: string;
  path: string;
}

interface BackendModule {
  module: string;
  routes: BackendRoute[];
}

interface FrontendRoute {
  path: string;
  name: string;
  component?: string;
  children?: FrontendRoute[];
}

class RouteComparator {
  private backendUrl: string;

  constructor(backendUrl: string = process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site') {
    this.backendUrl = backendUrl;
  }

  // 获取后端API列表
  async getBackendRoutes(): Promise<BackendModule[]> {
    try {
      const response = await axios.get(`${this.backendUrl}/api/list`);
      return response.data.modules;
    } catch (error) {
      console.error('获取后端路由失败:', error);
      return [];
    }
  }

  // 从前端路由文件提取路由
  extractFrontendRoutes(): FrontendRoute[] {
    const routerPath = path.join(__dirname, '../../../client/src/router/index.ts');
    if (!fs.existsSync(routerPath)) {
      console.error('前端路由文件不存在:', routerPath);
      return [];
    }

    const content = fs.readFileSync(routerPath, 'utf-8');
    
    // 简单提取路径（这是一个简化的实现）
    const pathMatches = content.match(/path:\s*['"`]([^'"`]+)['"`]/g) || [];
    const routes: FrontendRoute[] = [];
    
    pathMatches.forEach(match => {
      const pathMatch = /path:\s*['"`]([^'"`]+)['"`]/.exec(match);
      const path = pathMatch?.[1];
      if (path && !path.includes(':')) { // 排除参数化路径
        routes.push({ path, name: '' });
      }
    });

    return routes;
  }

  // 比较前后端路由
  async compareRoutes() {
    console.log('🔍 开始比较前后端路由...\n');

    const backendModules = await this.getBackendRoutes();
    const frontendRoutes = this.extractFrontendRoutes();

    console.log(`📊 统计信息:`);
    console.log(`- 后端API模块数: ${backendModules.length}`);
    console.log(`- 后端API总数: ${backendModules.reduce((sum, m) => sum + m.routes.length, 0)}`);
    console.log(`- 前端路由数: ${frontendRoutes.length}\n`);

    // 分析后端API模块
    console.log('📦 后端API模块列表:');
    backendModules.forEach(module => {
      console.log(`- ${module.module}: ${module.routes.length} 个端点`);
    });

    // 查找可能缺失的前端页面
    console.log('\n🔍 分析可能需要的前端页面:');
    const suggestedPages = this.suggestFrontendPages(backendModules);
    suggestedPages.forEach(page => {
      console.log(`- ${page.path} (基于 ${page.module} 模块)`);
    });

    // 生成报告
    this.generateReport(backendModules, frontendRoutes, suggestedPages);
  }

  // 根据后端API建议前端页面
  suggestFrontendPages(backendModules: BackendModule[]): Array<{path: string, module: string}> {
    const suggestions: Array<{path: string, module: string}> = [];
    
    backendModules.forEach(module => {
      const moduleName = module.module;
      
      // 基于模块名建议页面路径
      switch(moduleName) {
        case 'activities':
        case 'activity':
          suggestions.push({ path: '/activity', module: moduleName });
          suggestions.push({ path: '/activity/list', module: moduleName });
          suggestions.push({ path: '/activity/create', module: moduleName });
          break;
        case 'enrollment-plans':
        case 'enrollment':
          suggestions.push({ path: '/enrollment', module: moduleName });
          suggestions.push({ path: '/enrollment/plans', module: moduleName });
          suggestions.push({ path: '/enrollment/applications', module: moduleName });
          break;
        case 'students':
          suggestions.push({ path: '/student', module: moduleName });
          suggestions.push({ path: '/student/list', module: moduleName });
          break;
        case 'teachers':
          suggestions.push({ path: '/teacher', module: moduleName });
          suggestions.push({ path: '/teacher/list', module: moduleName });
          break;
        case 'parents':
          suggestions.push({ path: '/parent', module: moduleName });
          suggestions.push({ path: '/parent/list', module: moduleName });
          break;
        case 'dashboard':
          suggestions.push({ path: '/dashboard', module: moduleName });
          break;
        case 'ai':
          suggestions.push({ path: '/ai', module: moduleName });
          suggestions.push({ path: '/ai/chat', module: moduleName });
          break;
      }
    });

    return suggestions;
  }

  // 生成比较报告
  generateReport(
    backendModules: BackendModule[], 
    frontendRoutes: FrontendRoute[],
    suggestions: Array<{path: string, module: string}>
  ) {
    const report = `# 前后端路由对比报告

生成时间: ${new Date().toLocaleString()}

## 统计概览

- 后端API模块数: ${backendModules.length}
- 后端API总数: ${backendModules.reduce((sum, m) => sum + m.routes.length, 0)}
- 前端路由数: ${frontendRoutes.length}

## 后端API模块详情

${backendModules.map(module => `### ${module.module}
- 端点数量: ${module.routes.length}
- 主要操作: ${[...new Set(module.routes.map(r => r.method))].join(', ')}
`).join('\n')}

## 建议的前端页面

基于后端API分析，建议创建以下前端页面：

${suggestions.map(s => `- ${s.path} (对应 ${s.module} 模块)`).join('\n')}

## 前端现有路由

${frontendRoutes.slice(0, 50).map(r => `- ${r.path}`).join('\n')}
${frontendRoutes.length > 50 ? `\n... 还有 ${frontendRoutes.length - 50} 个路由` : ''}
`;

    const reportPath = path.join(__dirname, '../../', 'route-comparison-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 报告已生成: ${reportPath}`);
  }
}

// 命令行执行
if (require.main === module) {
  const comparator = new RouteComparator();
  comparator.compareRoutes()
    .then(() => console.log('✅ 路由比较完成'))
    .catch(error => console.error('❌ 路由比较失败:', error));
}

export default RouteComparator;