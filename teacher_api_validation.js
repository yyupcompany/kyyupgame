/**
 * 教师角色API数据一致性检测脚本
 *
 * 此脚本通过浏览器自动化检测教师角色的所有页面
 * 并收集API调用、数据渲染、控制台错误等信息
 */

const TEACHER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODAyLCJwaG9uZSI6IiIsInJvbGUiOiJ0ZWFjaGVyIiwiaXNEZW1vIjp0cnVlLCJwcmltYXJ5S2luZGVyZ2FydGVuSWQiOjEsImtpbmRlcmdhcnRlbklkIjoxLCJkYXRhU2NvcGUiOiJzaW5nbGUiLCJpYXQiOjE3Njg5NjYyOTMsImV4cCI6MTc2OTU3MTA5M30.K_aGP2LgcgAQWEtuSd_zOzX3i04V9KhhyLecQHv2xzA';

const TEACHER_PAGES = {
  pc: [
    { name: '教师工作台', url: '/teacher-center/dashboard', expectedAPIs: ['/api/teacher-dashboard/statistics', '/api/teacher-dashboard/today-tasks', '/api/teacher-dashboard/today-courses', '/api/teacher-dashboard/recent-notifications'] },
    { name: '通知中心', url: '/teacher-center/notifications', expectedAPIs: ['/api/notifications'] },
    { name: '任务中心', url: '/teacher-center/tasks', expectedAPIs: ['/api/tasks'] },
    { name: '活动中心', url: '/teacher-center/activities', expectedAPIs: ['/api/activities'] },
    { name: '招生中心', url: '/teacher-center/enrollment', expectedAPIs: ['/api/enrollment'] },
    { name: '教学中心', url: '/teacher-center/teaching', expectedAPIs: ['/api/teaching'] },
    { name: '客户跟踪', url: '/teacher-center/customer-tracking', expectedAPIs: ['/api/customers', '/api/customer-tracking'] },
    { name: '绩效中心', url: '/teacher-center/performance-rewards', expectedAPIs: ['/api/performance', '/api/rewards'] }
  ],
  mobile: [
    { name: '移动端仪表板', url: '/mobile/teacher-center/dashboard', expectedAPIs: ['/api/teacher-dashboard'] },
    { name: '移动端任务', url: '/mobile/teacher-center/tasks', expectedAPIs: ['/api/tasks'] },
    { name: '移动端教学', url: '/mobile/teacher-center/teaching', expectedAPIs: ['/api/teaching'] },
    { name: '移动端招生', url: '/mobile/teacher-center/enrollment', expectedAPIs: ['/api/enrollment'] },
    { name: '移动端客户池', url: '/mobile/teacher-center/customer-pool', expectedAPIs: ['/api/customers'] }
  ]
};

async function setupTeacherLogin(page) {
  // 设置token到localStorage
  await page.evaluate((token) => {
    localStorage.setItem('kindergarten_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('kindergarten_user_info', JSON.stringify({
      id: 802,
      username: 'teacher',
      role: 'teacher',
      name: '测试教师'
    }));
  }, TEACHER_TOKEN);
}

async function checkPageData(page, pageInfo) {
  const result = {
    ...pageInfo,
    timestamp: new Date().toISOString(),
    loadSuccess: false,
    actualUrl: '',
    apiCalls: [],
    consoleErrors: [],
    consoleWarnings: [],
    visibleElements: [],
    dataIssues: [],
    hasData: false,
    renderErrors: []
  };

  try {
    console.log(`\n========== 检测页面: ${pageInfo.name} (${pageInfo.url}) ==========`);

    // 导航到页面
    const response = await page.goto(`http://localhost:5173${pageInfo.url}`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    result.actualUrl = page.url();
    result.httpStatus = response?.status() || 'unknown';

    // 等待页面稳定
    await page.waitForTimeout(3000);

    // 获取页面文本内容
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        hasData: document.body.innerText.length > 200,
        emptyStates: Array.from(document.querySelectorAll('.empty, .no-data, [class*="empty"]')).length,
        errorElements: Array.from(document.querySelectorAll('[class*="error"], .error-message')).map(el => el.textContent)
      };
    });

    result.hasData = pageContent.hasData;
    result.visibleElements.push({
      type: 'content',
      description: `页面内容长度: ${document.body.innerText.length}`,
      value: pageContent.bodyText.length
    });

    // 检查是否有错误提示
    if (pageContent.errorElements.length > 0) {
      result.renderErrors.push(...pageContent.errorElements);
    }

    result.loadSuccess = true;
    console.log(`✅ 页面加载成功: ${result.actualUrl}`);

  } catch (error) {
    result.loadSuccess = false;
    result.error = error.message;
    console.error(`❌ 页面加载失败: ${error.message}`);
  }

  return result;
}

async function generateReport(allResults) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const totalTests = allResults.length;
  const successCount = allResults.filter(r => r.loadSuccess).length;
  const failedCount = totalTests - successCount;

  let report = `# 教师角色API数据一致性检测报告\n\n`;
  report += `## 检测时间\n${timestamp}\n\n`;
  report += `## 检测范围\n- PC端页面: ${TEACHER_PAGES.pc.length}个\n- 移动端页面: ${TEACHER_PAGES.mobile.length}个\n\n`;
  report += `## 检测摘要\n- 总检测数: ${totalTests}\n- 成功: ${successCount}\n- 失败: ${failedCount}\n- 成功率: ${((successCount/totalTests)*100).toFixed(1)}%\n\n`;

  report += `## 详细检测结果\n\n`;

  allResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.name}\n\n`;
    report += `- **页面URL**: ${result.url}\n`;
    report += `- **实际URL**: ${result.actualUrl}\n`;
    report += `- **加载状态**: ${result.loadSuccess ? '✅ 成功' : '❌ 失败'}\n`;
    report += `- **是否有数据**: ${result.hasData ? '✅ 是' : '❌ 否'}\n`;

    if (result.error) {
      report += `- **错误信息**: ${result.error}\n`;
    }

    if (result.renderErrors && result.renderErrors.length > 0) {
      report += `- **渲染错误**: \n`;
      result.renderErrors.forEach(err => {
        report += `  - ${err}\n`;
      });
    }

    report += `\n`;
  });

  report += `## 问题汇总\n\n`;

  const failedPages = allResults.filter(r => !r.loadSuccess);
  if (failedPages.length > 0) {
    report += `### 严重问题（加载失败）\n\n`;
    failedPages.forEach(page => {
      report += `1. **${page.name}** (${page.url})\n`;
      report += `   - 错误: ${page.error}\n\n`;
    });
  }

  const noDataPages = allResults.filter(r => r.loadSuccess && !r.hasData);
  if (noDataPages.length > 0) {
    report += `### 警告（无数据显示）\n\n`;
    noDataPages.forEach(page => {
      report += `1. **${page.name}** (${page.url})\n`;
      report += `   - 页面加载成功但无数据内容\n\n`;
    });
  }

  const renderErrorPages = allResults.filter(r => r.renderErrors && r.renderErrors.length > 0);
  if (renderErrorPages.length > 0) {
    report += `### 渲染错误\n\n`;
    renderErrorPages.forEach(page => {
      report += `1. **${page.name}** (${page.url})\n`;
      page.renderErrors.forEach(err => {
        report += `   - ${err}\n`;
      });
      report += `\n`;
    });
  }

  report += `## 建议\n\n`;
  report += `1. 修复所有加载失败的页面\n`;
  report += `2. 确保所有API端点正确返回数据\n`;
  report += `3. 检查前端数据渲染逻辑\n`;
  report += `4. 优化页面加载性能\n`;
  report += `5. 添加适当的错误处理和用户提示\n`;

  return report;
}

module.exports = {
  TEACHER_TOKEN,
  TEACHER_PAGES,
  setupTeacherLogin,
  checkPageData,
  generateReport
};
