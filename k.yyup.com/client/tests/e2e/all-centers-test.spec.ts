import { test, expect } from '@playwright/test';

// 所有中心页面配置
const centerPages = [
  { name: '活动中心', path: '/centers/ActivityCenter' },
  { name: '分析中心', path: '/centers/AnalyticsCenter' },
  { name: '评估中心', path: '/centers/AssessmentCenter' },
  { name: '考勤中心', path: '/centers/AttendanceCenter' },
  { name: '业务中心', path: '/centers/business' },
  { name: '呼叫中心', path: '/centers/CallCenter' },
  { name: '客户池中心', path: '/centers/CustomerPoolCenter' },
  { name: '招生中心', path: '/centers/EnrollmentCenter' },
  { name: '财务中心', path: '/centers/FinanceCenter' },
  { name: '系统中心', path: '/centers/SystemCenter' },
  { name: '任务中心', path: '/centers/TaskCenter' },
  { name: '检查中心', path: '/centers/InspectionCenter' },
  { name: '脚本中心', path: '/centers/ScriptCenter' },
  { name: '人员中心', path: '/centers/PersonnelCenter' },
  { name: '教学中心', path: '/centers/TeachingCenter' },
  { name: '营销中心', path: '/centers/MarketingCenter' },
  { name: 'AI中心', path: '/centers/AICenter' },
  { name: '媒体中心', path: '/centers/media' },
];

test.describe('所有中心页面测试', () => {
  // 登录前置操作
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  // 为每个中心页面创建测试
  for (const center of centerPages) {
    test(`${center.name} - API路径检查`, async ({ page }) => {
      const apiErrors: { url: string; status: number }[] = [];
      const consoleErrors: string[] = [];

      // 监听API响应
      page.on('response', (response) => {
        const url = response.url();
        const status = response.status();
        
        // 记录404错误
        if (status === 404) {
          apiErrors.push({ url, status });
        }
      });

      // 监听控制台错误
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // 访问页面
      await page.goto(`http://localhost:5173${center.path}`);
      await page.waitForTimeout(3000);

      // 输出结果
      console.log(`\n📋 ${center.name}:`);
      console.log(`   路径: ${center.path}`);
      
      if (apiErrors.length > 0) {
        console.log(`   ❌ 发现 ${apiErrors.length} 个404错误:`);
        apiErrors.forEach(err => {
          console.log(`      - ${err.status} ${err.url}`);
        });
      } else {
        console.log(`   ✅ 无404错误`);
      }

      if (consoleErrors.length > 0) {
        console.log(`   ⚠️  控制台错误: ${consoleErrors.length}个`);
        // 只显示前3个错误
        consoleErrors.slice(0, 3).forEach(err => {
          console.log(`      - ${err.substring(0, 150)}`);
        });
      } else {
        console.log(`   ✅ 无控制台错误`);
      }

      // 断言：不应该有404错误
      expect(apiErrors.length, `${center.name} 存在404错误`).toBe(0);
    });
  }
});
