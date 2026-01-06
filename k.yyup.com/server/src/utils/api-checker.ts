import axios from 'axios';
import fs from 'fs';
import path from 'path';

// 定义API检测结果接口
interface ApiCheckResult {
  path: string;
  method: string;
  available: boolean;
  error?: string;
}

// 定义API列表接口
interface ApiDefinition {
  path: string;
  method: string;
  description: string;
  category: string;
}

// 从服务端路由自动提取API列表
const extractApisFromRoutes = () => {
  const apiList: ApiDefinition[] = [];
  
  // 这里可以扩展为自动从routes目录读取路由定义
  // 目前先手动定义一些关键API进行测试
  
  // 认证相关API
  apiList.push(
    { path: '/api/auth/login', method: 'POST', description: '用户登录', category: 'auth' },
    { path: '/api/auth/register', method: 'POST', description: '用户注册', category: 'auth' },
    { path: '/api/auth/logout', method: 'POST', description: '用户登出', category: 'auth' },
  );
  
  // 招生计划相关API
  apiList.push(
    { path: '/api/enrollment/plans', method: 'GET', description: '获取招生计划列表', category: 'enrollment' },
    { path: '/api/enrollment/plans/:id', method: 'GET', description: '获取招生计划详情', category: 'enrollment' },
    { path: '/api/enrollment/applications', method: 'GET', description: '获取招生申请列表', category: 'enrollment' },
  );
  
  // 活动相关API
  apiList.push(
    { path: '/api/activity/list', method: 'GET', description: '获取活动列表', category: 'activity' },
    { path: '/api/activity/:id', method: 'GET', description: '获取活动详情', category: 'activity' },
    { path: '/api/activity/evaluations', method: 'GET', description: '获取活动评价列表', category: 'activity' },
  );
  
  // 营销相关API
  apiList.push(
    { path: '/api/marketing/campaigns', method: 'GET', description: '获取营销活动列表', category: 'marketing' },
    { path: '/api/marketing/advertisements', method: 'GET', description: '获取广告列表', category: 'marketing' },
    { path: '/api/marketing/consultations', method: 'GET', description: '获取咨询列表', category: 'marketing' },
  );
  
  // 系统相关API
  apiList.push(
    { path: '/api/system/users', method: 'GET', description: '获取用户列表', category: 'system' },
    { path: '/api/system/roles', method: 'GET', description: '获取角色列表', category: 'system' },
    { path: '/api/system/permissions', method: 'GET', description: '获取权限列表', category: 'system' },
  );
  
  return apiList;
};

// 获取错误信息的辅助函数
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// 检测API可用性
export async function checkApiAvailability(baseUrl: string = process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site'): Promise<ApiCheckResult[]> {
  const apiList = extractApisFromRoutes();
  const results: ApiCheckResult[] = [];
  
  console.log(`开始检测 ${apiList.length} 个API的可用性...`);
  
  for (const api of apiList) {
    try {
      // 对GET请求进行OPTIONS预检，避免发送实际请求
      const checkMethod = api.method === 'GET' ? 'OPTIONS' : 'HEAD';
      
      // 替换路径中的参数占位符
      const path = api.path.replace(/\/:([^/]+)/g, '/1');
      
      await axios({
        method: checkMethod,
        url: `${baseUrl}${path}`,
        timeout: 5000,
      });
      
      results.push({
        path: api.path,
        method: api.method,
        available: true,
      });
      
      console.log(`✅ ${api.method} ${api.path} - 可用`);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      results.push({
        path: api.path,
        method: api.method,
        available: false,
        error: errorMessage,
      });
      
      console.log(`❌ ${api.method} ${api.path} - 不可用: ${errorMessage}`);
    }
  }
  
  return results;
}

// 生成API可用性报告
export async function generateApiReport(baseUrl?: string): Promise<void> {
  const results = await checkApiAvailability(baseUrl);
  
  // 按类别分组结果
  const categories: Record<string, ApiCheckResult[]> = {};
  const apiList = extractApisFromRoutes();
  
  results.forEach(result => {
    const api = apiList.find(a => a.path === result.path && a.method === result.method);
    if (api) {
      if (!categories[api.category]) {
        categories[api.category] = [];
      }
      categories[api.category].push(result);
    }
  });
  
  // 生成报告内容
  let report = `# API可用性检测报告\n\n`;
  report += `检测时间: ${new Date().toLocaleString()}\n\n`;
  report += `## 总体情况\n\n`;
  
  const availableCount = results.filter(r => r.available).length;
  const totalCount = results.length;
  const availablePercentage = (availableCount / totalCount * 100).toFixed(2);
  
  report += `- 总API数量: ${totalCount}\n`;
  report += `- 可用API数量: ${availableCount}\n`;
  report += `- 不可用API数量: ${totalCount - availableCount}\n`;
  report += `- 可用率: ${availablePercentage}%\n\n`;
  
  // 按类别生成详细报告
  for (const category in categories) {
    report += `## ${category.charAt(0).toUpperCase() + category.slice(1)}模块\n\n`;
    report += `| API路径 | 请求方法 | 状态 | 错误信息 |\n`;
    report += `|---------|----------|------|----------|\n`;
    
    categories[category].forEach(result => {
      const status = result.available ? '✅ 可用' : '❌ 不可用';
      const error = result.error || '-';
      
      report += `| ${result.path} | ${result.method} | ${status} | ${error} |\n`;
    });
    
    report += `\n`;
  }
  
  // 写入文件
  const reportDir = path.join(__dirname, '../../docs/api');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'api-availability-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`API可用性报告已生成: ${reportPath}`);
}

// 命令行执行入口
if (require.main === module) {
  const baseUrl = process.argv[2] || process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site';
  generateApiReport(baseUrl)
    .then(() => console.log('API检测完成'))
    .catch(error => console.error('API检测失败:', error));
} 