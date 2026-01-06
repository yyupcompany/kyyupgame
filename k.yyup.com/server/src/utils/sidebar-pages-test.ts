import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface PageTestResult {
  path: string;
  title: string;
  category: string;
  status: 'success' | 'not_found' | 'error' | 'auth_required';
  httpCode?: number;
  responseTime?: number;
  error?: string;
  apiEndpoints?: string[];
}

interface SidebarPage {
  path: string;
  title: string;
  category: string;
}

class SidebarPagesTest {
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

  // 从MainLayout提取的侧边栏页面
  private getSidebarPages(): SidebarPage[] {
    return [
      // 工作台
      { path: '/dashboard', title: '数据概览', category: '工作台' },
      { path: '/dashboard/schedule', title: '日程管理', category: '工作台' },
      { path: '/dashboard/important-notices', title: '消息通知', category: '工作台' },
      { path: '/dashboard/campus-overview', title: '园区概览', category: '工作台' },
      { path: '/dashboard/data-statistics', title: '数据统计', category: '工作台' },

      // 招生管理
      { path: '/enrollment-plan', title: '招生计划', category: '招生管理' },
      { path: '/enrollment', title: '招生活动', category: '招生管理' },
      { path: '/enrollment-plan/statistics', title: '招生统计', category: '招生管理' },
      { path: '/enrollment-plan/quota-manage', title: '名额管理', category: '招生管理' },

      // 客户管理
      { path: '/customer', title: '客户列表', category: '客户管理' },
      { path: '/principal/customer-pool', title: '客户池', category: '客户管理' },

      // 学生管理
      { path: '/class', title: '班级管理', category: '学生管理' },
      { path: '/application', title: '入园申请', category: '学生管理' },

      // 活动管理
      { path: '/activity', title: '活动列表', category: '活动管理' },
      { path: '/activity/create', title: '创建活动', category: '活动管理' },
      { path: '/principal/activities', title: '园长活动', category: '活动管理' },

      // 家长服务
      { path: '/parent', title: '家长列表', category: '家长服务' },
      { path: '/parent/children', title: '孩子列表', category: '家长服务' },

      // 教师管理
      { path: '/teacher', title: '教师列表', category: '教师管理' },

      // 营销工具
      { path: '/principal/poster-editor', title: '海报编辑', category: '营销工具' },
      { path: '/principal/poster-generator', title: '海报生成器', category: '营销工具' },
      { path: '/chat', title: '在线咨询', category: '营销工具' },
      { path: '/ai', title: 'AI助手', category: '营销工具' },

      // 数据分析
      { path: '/statistics', title: '统计报表', category: '数据分析' },
      { path: '/principal/performance', title: '绩效管理', category: '数据分析' },
      { path: '/principal/marketing-analysis', title: '经营分析', category: '数据分析' },
      { path: '/principal/dashboard', title: '园长仪表盘', category: '数据分析' },

      // 系统管理
      { path: '/system/users', title: '用户管理', category: '系统管理' },
      { path: '/system/roles', title: '角色管理', category: '系统管理' },
      { path: '/system/permissions', title: '权限管理', category: '系统管理' },
      { path: '/system/logs', title: '系统日志', category: '系统管理' },
      { path: '/system/backup', title: '数据备份', category: '系统管理' },
      { path: '/system/settings', title: '系统配置', category: '系统管理' },
      { path: '/system/ai-model-config', title: 'AI模型配置', category: '系统管理' }
    ];
  }

  // 登录获取token
  private async login(): Promise<boolean> {
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

  // 根据前端路径推断相关的后端API
  private inferApiEndpoints(pagePath: string): string[] {
    const apis: string[] = [];

    // 根据页面路径推断可能的API
    if (pagePath === '/dashboard') {
      apis.push('/api/dashboard/overview', '/api/dashboard/statistics');
    } else if (pagePath === '/dashboard/schedule') {
      apis.push('/api/schedules');
    } else if (pagePath === '/dashboard/important-notices') {
      apis.push('/api/notifications');
    } else if (pagePath === '/dashboard/campus-overview') {
      apis.push('/api/dashboard/campus-overview');
    } else if (pagePath === '/dashboard/data-statistics') {
      apis.push('/api/dashboard/statistics');
    } else if (pagePath === '/enrollment-plan') {
      apis.push('/api/enrollment-plans');
    } else if (pagePath === '/enrollment') {
      apis.push('/api/enrollment', '/api/activities');
    } else if (pagePath === '/enrollment-plan/statistics') {
      apis.push('/api/enrollment-statistics');
    } else if (pagePath === '/enrollment-plan/quota-manage') {
      apis.push('/api/enrollment-quotas');
    } else if (pagePath === '/customer') {
      apis.push('/api/customers');
    } else if (pagePath === '/principal/customer-pool') {
      apis.push('/api/customer-pool');
    } else if (pagePath === '/class') {
      apis.push('/api/classes');
    } else if (pagePath === '/application') {
      apis.push('/api/enrollment-applications');
    } else if (pagePath === '/activity') {
      apis.push('/api/activities');
    } else if (pagePath === '/activity/create') {
      apis.push('/api/activities');
    } else if (pagePath === '/principal/activities') {
      apis.push('/api/principal/activities');
    } else if (pagePath === '/parent') {
      apis.push('/api/parents');
    } else if (pagePath === '/parent/children') {
      apis.push('/api/students');
    } else if (pagePath === '/teacher') {
      apis.push('/api/teachers');
    } else if (pagePath === '/principal/poster-editor') {
      apis.push('/api/poster-templates');
    } else if (pagePath === '/principal/poster-generator') {
      apis.push('/api/poster-generations');
    } else if (pagePath === '/chat') {
      apis.push('/api/chat');
    } else if (pagePath === '/ai') {
      apis.push('/api/ai/conversations', '/api/ai/models');
    } else if (pagePath === '/statistics') {
      apis.push('/api/statistics');
    } else if (pagePath === '/principal/performance') {
      apis.push('/api/principal-performance', '/api/performance');
    } else if (pagePath === '/principal/marketing-analysis') {
      apis.push('/api/marketing/analysis');
    } else if (pagePath === '/principal/dashboard') {
      apis.push('/api/principal/dashboard');
    } else if (pagePath === '/system/users') {
      apis.push('/api/users');
    } else if (pagePath === '/system/roles') {
      apis.push('/api/roles');
    } else if (pagePath === '/system/permissions') {
      apis.push('/api/permissions');
    } else if (pagePath === '/system/logs') {
      apis.push('/api/system-logs');
    } else if (pagePath === '/system/backup') {
      apis.push('/api/system-backup');
    } else if (pagePath === '/system/settings') {
      apis.push('/api/system-configs');
    } else if (pagePath === '/system/ai-model-config') {
      apis.push('/api/system/ai-models');
    }

    return apis;
  }

  // 测试API可访问性
  private async testApi(apiPath: string): Promise<{exists: boolean, status?: number}> {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.backendUrl}${apiPath}`,
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        validateStatus: (status) => true // 接受所有状态码
      });

      return {
        exists: response.status !== 404,
        status: response.status
      };
    } catch (error) {
      return { exists: false };
    }
  }

  // 测试前端页面
  private async testFrontendPage(pagePath: string): Promise<boolean> {
    try {
      // 测试前端页面是否可访问
      const response = await axios({
        method: 'GET',
        url: `${this.frontendUrl}${pagePath}`,
        validateStatus: (status) => true
      });

      // 前端SPA应用通常返回200
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 运行测试
  async runTest() {
    console.log('🚀 开始测试侧边栏页面...\n');

    // 登录
    if (!await this.login()) {
      console.error('登录失败，无法继续测试');
      return;
    }

    const pages = this.getSidebarPages();
    const results: PageTestResult[] = [];
    const categoryStats: { [key: string]: { total: number, success: number } } = {};

    console.log(`📊 共发现 ${pages.length} 个侧边栏页面\n`);

    // 按分类测试
    const categories = [...new Set(pages.map(p => p.category))];
    
    for (const category of categories) {
      console.log(`\n🔍 测试 ${category} 模块...`);
      const categoryPages = pages.filter(p => p.category === category);
      categoryStats[category] = { total: categoryPages.length, success: 0 };

      for (const page of categoryPages) {
        const startTime = Date.now();
        
        // 测试相关API
        const apiEndpoints = this.inferApiEndpoints(page.path);
        const apiResults: string[] = [];
        let allApisExist = true;

        for (const api of apiEndpoints) {
          const apiTest = await this.testApi(api);
          if (apiTest.exists) {
            apiResults.push(`${api} (${apiTest.status})`);
          } else {
            allApisExist = false;
            apiResults.push(`${api} (404)`);
          }
        }

        const responseTime = Date.now() - startTime;
        const status = allApisExist ? 'success' : 'not_found';
        
        if (status === 'success') {
          categoryStats[category].success++;
        }

        results.push({
          path: page.path,
          title: page.title,
          category: page.category,
          status,
          responseTime,
          apiEndpoints: apiResults
        });

        const icon = status === 'success' ? '✅' : '❌';
        console.log(`${icon} ${page.title} (${page.path})`);
        if (apiResults.length > 0) {
          console.log(`   └─ APIs: ${apiResults.join(', ')}`);
        }

        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // 生成测试报告
    this.generateTestReport(results, categoryStats);
  }

  // 生成测试报告
  private generateTestReport(results: PageTestResult[], categoryStats: { [key: string]: { total: number, success: number } }) {
    const totalPages = results.length;
    const successPages = results.filter(r => r.status === 'success').length;
    const successRate = ((successPages / totalPages) * 100).toFixed(2);

    const report = `# 侧边栏页面测试报告

测试时间: ${new Date().toLocaleString()}
测试环境: 
- 后端: ${this.backendUrl}
- 前端: ${this.frontendUrl}

## 测试概览

- 总页面数: ${totalPages}
- 成功页面: ${successPages}
- 失败页面: ${totalPages - successPages}
- 成功率: ${successRate}%

## 分类统计

| 模块 | 总数 | 成功 | 成功率 |
|------|------|------|--------|
${Object.entries(categoryStats).map(([category, stats]) => 
  `| ${category} | ${stats.total} | ${stats.success} | ${((stats.success / stats.total) * 100).toFixed(0)}% |`
).join('\n')}

## 详细测试结果

### ✅ 成功的页面

${results.filter(r => r.status === 'success').map(r => 
  `#### ${r.title} (${r.path})
- 分类: ${r.category}
- 响应时间: ${r.responseTime}ms
- API端点: ${r.apiEndpoints?.join(', ') || '无'}
`).join('\n')}

### ❌ 失败的页面

${results.filter(r => r.status !== 'success').map(r => 
  `#### ${r.title} (${r.path})
- 分类: ${r.category}
- 状态: ${r.status}
- API端点: ${r.apiEndpoints?.join(', ') || '无'}
`).join('\n')}

## 问题分析

${results.filter(r => r.status !== 'success').length > 0 ? `
以下页面存在问题需要修复:

${results.filter(r => r.status !== 'success').map(r => {
  const missingApis = r.apiEndpoints?.filter(api => api.includes('(404)')).map(api => api.split(' ')[0]) || [];
  return `- **${r.title}** (${r.path}): 缺失API ${missingApis.join(', ')}`;
}).join('\n')}
` : '所有页面测试通过！'}

## 建议

1. 确保所有页面对应的后端API已实现
2. 检查路由配置是否正确
3. 验证权限配置是否合理
4. 考虑添加页面加载性能监控
`;

    const reportPath = path.join(__dirname, '../../', 'sidebar-pages-test-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 测试报告已生成: ${reportPath}`);
    console.log(`📊 总体成功率: ${successRate}%`);
  }
}

// 命令行执行
if (require.main === module) {
  const tester = new SidebarPagesTest();
  tester.runTest()
    .then(() => console.log('\n✨ 侧边栏页面测试完成'))
    .catch(error => console.error('❌ 测试失败:', error));
}

export default SidebarPagesTest;