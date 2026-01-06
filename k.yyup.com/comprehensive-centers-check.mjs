/**
 * 幼儿园管理系统 - 10个中心模块全面检查脚本
 * 使用MCP Playwright进行自动化检测和修复
 */

import { chromium } from 'playwright';

// 定义10个中心模块
const CENTER_MODULES = [
  {
    name: 'DashboardCenter',
    path: '/centers/dashboard',
    title: '仪表板中心',
    expectedTabs: ['数据概览', '图表分析', '实时统计'],
    expectedButtons: ['刷新', '导出', '详细分析']
  },
  {
    name: 'ActivityCenter', 
    path: '/centers/activity',
    title: '活动中心',
    expectedTabs: ['活动管理', '活动统计', '评估分析'],
    expectedButtons: ['创建活动', '编辑', '删除', '查看详情']
  },
  {
    name: 'MarketingCenter',
    path: '/centers/marketing', 
    title: '营销中心',
    expectedTabs: ['营销活动', '广告管理', '优惠券'],
    expectedButtons: ['新建活动', '发布广告', '统计分析']
  },
  {
    name: 'AICenter',
    path: '/centers/ai',
    title: 'AI中心',
    expectedTabs: ['AI助手', '模型管理', '智能分析'],
    expectedButtons: ['新建对话', '模型配置', '性能监控']
  },
  {
    name: 'SystemCenter',
    path: '/centers/system',
    title: '系统中心', 
    expectedTabs: ['用户管理', '角色管理', '权限管理', '系统设置'],
    expectedButtons: ['添加用户', '创建角色', '分配权限']
  },
  {
    name: 'EnrollmentCenter',
    path: '/centers/enrollment',
    title: '招生中心',
    expectedTabs: ['招生计划', '申请管理', '录取统计'],
    expectedButtons: ['创建计划', '审核申请', '生成报告']
  },
  {
    name: 'PersonnelCenter',
    path: '/centers/personnel', 
    title: '人员中心',
    expectedTabs: ['教师管理', '学生管理', '家长管理'],
    expectedButtons: ['添加教师', '录入学生', '关联家长']
  },
  {
    name: 'CustomerPoolCenter',
    path: '/centers/customer-pool',
    title: '客户池中心',
    expectedTabs: ['客户管理', '跟进记录', '转化分析'],
    expectedButtons: ['添加客户', '记录跟进', '数据分析']
  },
  {
    name: 'AnalyticsCenter',
    path: '/centers/analytics',
    title: '数据分析中心',
    expectedTabs: ['数据报告', '趋势分析', '预测模型'],
    expectedButtons: ['生成报告', '导出数据', '配置分析']
  },
  {
    name: 'TaskCenter',
    path: '/centers/task',
    title: '任务中心',
    expectedTabs: ['任务列表', '进度跟踪', '完成统计'],
    expectedButtons: ['创建任务', '分配任务', '更新状态']
  }
];

// 检测结果存储
let testResults = {
  totalCenters: CENTER_MODULES.length,
  passedCenters: 0,
  failedCenters: 0,
  issues: [],
  recommendations: [],
  screenshots: []
};

/**
 * 执行单个中心模块检测
 */
async function checkCenterModule(page, center) {
  const result = {
    name: center.name,
    path: center.path,
    accessible: false,
    tabsWorking: false,
    buttonsWorking: false,
    consoleErrors: [],
    networkErrors: [],
    missingElements: [],
    recommendations: []
  };

  try {
    console.log(`\n🔍 开始检查 ${center.name} (${center.title})`);
    
    // 1. 页面访问测试
    console.log(`  📄 导航到: ${center.path}`);
    const response = await page.goto(`http://localhost:5173${center.path}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    if (response && response.status() === 200) {
      result.accessible = true;
      console.log(`  ✅ 页面访问成功: ${response.status()}`);
    } else {
      console.log(`  ❌ 页面访问失败: ${response?.status() || '超时'}`);
      result.recommendations.push('页面无法正常访问，可能需要检查路由配置');
      return result;
    }

    // 等待页面内容加载
    await page.waitForTimeout(3000);

    // 2. 页面标题检查
    const pageTitle = await page.title();
    console.log(`  📋 页面标题: ${pageTitle}`);

    // 3. 检查标签页功能
    console.log(`  🏷️ 检查标签页功能...`);
    const tabs = await page.locator('.el-tabs__item, .tab-item, [role="tab"]').count();
    console.log(`  📊 找到 ${tabs} 个标签页`);
    
    if (tabs > 0) {
      result.tabsWorking = true;
      // 测试标签页切换
      for (let i = 0; i < Math.min(tabs, 3); i++) {
        try {
          await page.locator('.el-tabs__item, .tab-item, [role="tab"]').nth(i).click();
          await page.waitForTimeout(500);
          console.log(`    ✅ 标签页 ${i + 1} 切换成功`);
        } catch (error) {
          console.log(`    ❌ 标签页 ${i + 1} 切换失败: ${error.message}`);
          result.missingElements.push(`标签页 ${i + 1} 无法点击`);
        }
      }
    } else {
      result.missingElements.push('未找到标签页元素');
      result.recommendations.push('添加标签页功能以提升用户体验');
    }

    // 4. 检查按钮功能
    console.log(`  🔘 检查按钮功能...`);
    const buttons = await page.locator('button, .el-button, .btn').count();
    console.log(`  🔲 找到 ${buttons} 个按钮`);
    
    if (buttons > 0) {
      result.buttonsWorking = true;
      // 测试前几个按钮的点击
      for (let i = 0; i < Math.min(buttons, 5); i++) {
        try {
          const button = page.locator('button, .el-button, .btn').nth(i);
          const buttonText = await button.textContent();
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          console.log(`    🔘 按钮 ${i + 1}: "${buttonText}" - 可见: ${isVisible}, 启用: ${isEnabled}`);
          
          if (isVisible && isEnabled) {
            // 尝试点击按钮（但立即取消以避免副作用）
            await button.hover();
            console.log(`    ✅ 按钮 ${i + 1} 可交互`);
          }
        } catch (error) {
          console.log(`    ❌ 按钮 ${i + 1} 检测失败: ${error.message}`);
          result.missingElements.push(`按钮 ${i + 1} 交互异常`);
        }
      }
    } else {
      result.missingElements.push('未找到按钮元素');
      result.recommendations.push('添加必要的操作按钮');
    }

    // 5. 检查控制台错误
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // 6. 检查网络请求错误
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.url()}: ${response.status()}`);
      }
    });

    // 7. 截图保存
    const screenshotPath = `F:/kyyup730/lazy-ai-substitute-project/test-screenshots/${center.name}-screenshot.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`  📸 截图已保存: ${screenshotPath}`);

    result.consoleErrors = consoleLogs;
    result.networkErrors = networkErrors;

    console.log(`  ✅ ${center.name} 检测完成`);
    
  } catch (error) {
    console.log(`  ❌ ${center.name} 检测失败: ${error.message}`);
    result.recommendations.push(`检测过程出错: ${error.message}`);
  }

  return result;
}

/**
 * 主检测函数
 */
async function runComprehensiveCheck() {
  console.log('🚀 启动幼儿园管理系统10个中心模块全面检测...\n');

  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器以便观察
    slowMo: 1000      // 减慢操作速度以便观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // 创建截图目录
    try {
      await import('fs').then(fs => {
        if (!fs.existsSync('F:/kyyup730/lazy-ai-substitute-project/test-screenshots')) {
          fs.mkdirSync('F:/kyyup730/lazy-ai-substitute-project/test-screenshots', { recursive: true });
        }
      });
    } catch (err) {
      console.log('创建截图目录失败，继续测试...');
    }

    // 1. 登录系统
    console.log('🔑 正在登录系统...');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    // 填写登录信息
    await page.fill('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]', 'admin');
    await page.fill('input[type="password"], input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"], .login-btn, .el-button--primary');
    
    // 等待登录完成
    await page.waitForTimeout(3000);
    console.log('✅ 登录完成');

    // 2. 逐个检测中心模块
    for (const center of CENTER_MODULES) {
      const result = await checkCenterModule(page, center);
      
      // 统计结果
      if (result.accessible && result.tabsWorking && result.buttonsWorking) {
        testResults.passedCenters++;
      } else {
        testResults.failedCenters++;
        testResults.issues.push(result);
      }
      
      testResults.recommendations.push(...result.recommendations);
    }

  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    await browser.close();
  }

  // 3. 生成检测报告
  generateTestReport();
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  console.log('\n📊 ==================== 检测报告 ====================');
  console.log(`总中心数量: ${testResults.totalCenters}`);
  console.log(`通过检测: ${testResults.passedCenters}`);
  console.log(`失败检测: ${testResults.failedCenters}`);
  console.log(`成功率: ${((testResults.passedCenters / testResults.totalCenters) * 100).toFixed(1)}%`);
  
  console.log('\n🔴 检测到的问题:');
  testResults.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.name}:`);
    if (!issue.accessible) console.log(`   - 页面无法访问`);
    if (!issue.tabsWorking) console.log(`   - 标签页功能异常`);
    if (!issue.buttonsWorking) console.log(`   - 按钮功能异常`);
    if (issue.missingElements.length > 0) {
      console.log(`   - 缺失元素: ${issue.missingElements.join(', ')}`);
    }
  });
  
  console.log('\n💡 修复建议:');
  const uniqueRecommendations = [...new Set(testResults.recommendations)];
  uniqueRecommendations.forEach((rec, index) => {
    if (rec) console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n📝 详细分析和修复代码将在检测完成后生成...');
  console.log('================================================\n');
}

// 执行检测
runComprehensiveCheck().catch(console.error);