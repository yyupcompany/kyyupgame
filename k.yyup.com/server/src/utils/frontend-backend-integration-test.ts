import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface TestResult {
  frontend: string;
  backend: string;
  status: 'success' | 'missing_frontend' | 'missing_backend' | 'error';
  error?: string;
}

interface FrontendRoute {
  path: string;
  name: string;
  meta?: {
    title: string;
    requiresAuth?: boolean;
  };
}

class FrontendBackendIntegrationTest {
  private backendUrl: string;
  private frontendUrl: string;
  private token: string = '';

  constructor(
    backendUrl: string = process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site', 
    frontendUrl: string = process.env.FRONTEND_URL || 'https://k.yyup.cc'
  ) {
    this.backendUrl = backendUrl;
    this.frontendUrl = frontendUrl;
  }

  // 登录获取token
  async login(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.backendUrl}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });

      if (response.data?.success && response.data?.data?.token) {
        this.token = response.data.data.token;
        console.log('✅ 登录成功');
        return true;
      }
    } catch (error) {
      console.error('❌ 登录失败:', error);
    }
    return false;
  }

  // 根据前端路由推断对应的后端API
  inferBackendApi(frontendPath: string): string[] {
    const apis: string[] = [];

    // 基于前端路径模式推断后端API
    if (frontendPath.includes('/dashboard')) {
      apis.push('/api/dashboard/overview');
      apis.push('/api/dashboard/statistics');
    } else if (frontendPath.includes('/student')) {
      apis.push('/api/students');
      if (frontendPath.includes('list')) apis.push('/api/students');
      if (frontendPath.includes('detail')) apis.push('/api/students/:id');
    } else if (frontendPath.includes('/teacher')) {
      apis.push('/api/teachers');
      if (frontendPath.includes('list')) apis.push('/api/teachers');
      if (frontendPath.includes('detail')) apis.push('/api/teachers/:id');
    } else if (frontendPath.includes('/parent')) {
      apis.push('/api/parents');
      if (frontendPath.includes('list')) apis.push('/api/parents');
      if (frontendPath.includes('detail')) apis.push('/api/parents/:id');
    } else if (frontendPath.includes('/enrollment')) {
      if (frontendPath.includes('plan')) {
        apis.push('/api/enrollment-plans');
      } else if (frontendPath.includes('application')) {
        apis.push('/api/enrollment-applications');
      } else {
        apis.push('/api/enrollment');
      }
    } else if (frontendPath.includes('/activity')) {
      apis.push('/api/activities');
      if (frontendPath.includes('list')) apis.push('/api/activities');
      if (frontendPath.includes('detail')) apis.push('/api/activities/:id');
    } else if (frontendPath.includes('/class')) {
      apis.push('/api/classes');
    } else if (frontendPath.includes('/ai')) {
      apis.push('/api/ai/conversations');
      apis.push('/api/ai/models');
    }

    return apis;
  }

  // 测试后端API是否可访问
  async testBackendApi(apiPath: string): Promise<boolean> {
    try {
      // 将参数化路径转换为实际路径
      const testPath = apiPath.replace(':id', '1');
      
      const response = await axios.get(`${this.backendUrl}${testPath}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        validateStatus: (status) => status < 500 // 不把4xx当作错误
      });

      return response.status !== 404;
    } catch (error) {
      return false;
    }
  }

  // 运行集成测试
  async runIntegrationTest() {
    console.log('🚀 开始前后端集成测试...\n');

    // 登录
    if (!await this.login()) {
      console.error('登录失败，无法继续测试');
      return;
    }

    // 从路由文件提取前端路由
    const frontendRoutes = this.extractFrontendRoutes();
    console.log(`📊 发现 ${frontendRoutes.length} 个前端路由\n`);

    const results: TestResult[] = [];

    // 测试每个前端路由对应的后端API
    for (const route of frontendRoutes) {
      if (route.path.includes(':') || route.path === '/login') continue; // 跳过参数化路径和登录页

      const backendApis = this.inferBackendApi(route.path);
      
      for (const api of backendApis) {
        const exists = await this.testBackendApi(api);
        
        results.push({
          frontend: route.path,
          backend: api,
          status: exists ? 'success' : 'missing_backend'
        });

        const icon = exists ? '✅' : '❌';
        console.log(`${icon} ${route.path} -> ${api}`);
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 生成测试报告
    this.generateTestReport(results);
  }

  // 提取前端路由
  private extractFrontendRoutes(): FrontendRoute[] {
    const routerPath = path.join(__dirname, '../../../client/src/router/index.ts');
    if (!fs.existsSync(routerPath)) {
      console.error('前端路由文件不存在');
      return [];
    }

    const content = fs.readFileSync(routerPath, 'utf-8');
    const routes: FrontendRoute[] = [];

    // 简单提取（实际项目中应该用AST解析）
    const routeMatches = content.matchAll(/path:\s*['"`]([^'"`]+)['"`][\s\S]*?name:\s*['"`]([^'"`]+)['"`]/g);
    
    for (const match of routeMatches) {
      routes.push({
        path: match[1],
        name: match[2]
      });
    }

    return routes;
  }

  // 生成测试报告
  private generateTestReport(results: TestResult[]) {
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status !== 'success').length;
    const successRate = ((successCount / results.length) * 100).toFixed(2);

    const report = `# 前后端集成测试报告

测试时间: ${new Date().toLocaleString()}

## 测试概览

- 测试总数: ${results.length}
- 成功: ${successCount}
- 失败: ${failureCount}
- 成功率: ${successRate}%

## 测试详情

### 成功的集成 ✅

${results.filter(r => r.status === 'success').map(r => 
  `- ${r.frontend} -> ${r.backend}`
).join('\n')}

### 缺失的后端API ❌

${results.filter(r => r.status === 'missing_backend').map(r => 
  `- ${r.frontend} -> ${r.backend}`
).join('\n')}

## 建议

1. 检查缺失的后端API是否已实现
2. 确认前端路由是否正确映射到后端API
3. 考虑添加API版本控制
`;

    const reportPath = path.join(__dirname, '../../', 'frontend-backend-integration-test-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 测试报告已生成: ${reportPath}`);
    console.log(`📊 测试成功率: ${successRate}%`);
  }
}

// 命令行执行
if (require.main === module) {
  const tester = new FrontendBackendIntegrationTest();
  tester.runIntegrationTest()
    .then(() => console.log('\n✨ 集成测试完成'))
    .catch(error => console.error('❌ 测试失败:', error));
}

export default FrontendBackendIntegrationTest;