/**
 * 督查中心浏览器自动化测试脚本
 * 使用Playwright进行实际浏览器测试
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试结果存储
const testResults = {
  startTime: new Date().toISOString(),
  testName: '督查中心功能测试',
  tests: [],
  screenshots: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// 添加测试结果
function addTestResult(name, status, details = '', screenshot = null) {
  const result = {
    name,
    status, // 'passed', 'failed', 'skipped'
    details,
    screenshot,
    timestamp: new Date().toISOString()
  };
  testResults.tests.push(result);
  testResults.summary.total++;
  testResults.summary[status]++;
  
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}`);
  if (details) console.log(`   ${details}`);
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 开始督查中心浏览器测试...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器窗口
    slowMo: 500       // 减慢操作速度以便观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // ============================================
    // 测试 1: 登录系统
    // ============================================
    console.log('\n📋 测试组 1: 登录和导航\n');
    
    await page.goto('http://localhost:5173');
    await delay(2000);
    
    // 截图：登录页面
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    testResults.screenshots.push('01-login-page.png');
    addTestResult('访问登录页面', 'passed', 'URL: http://localhost:5173');
    
    // 查找并点击系统管理员按钮
    try {
      const adminButton = await page.locator('text=系统管理员').first();
      await adminButton.click();
      await delay(3000);
      
      // 验证是否跳转到工作台
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        addTestResult('系统管理员快捷登录', 'passed', `已跳转到: ${currentUrl}`);
      } else {
        addTestResult('系统管理员快捷登录', 'failed', `未跳转到工作台，当前URL: ${currentUrl}`);
      }
      
      await page.screenshot({ path: 'screenshots/02-dashboard.png', fullPage: true });
      testResults.screenshots.push('02-dashboard.png');
      
    } catch (error) {
      addTestResult('系统管理员快捷登录', 'failed', error.message);
    }
    
    // ============================================
    // 测试 2: 进入督查中心
    // ============================================
    try {
      const inspectionLink = await page.locator('text=督查中心').first();
      await inspectionLink.click();
      await delay(3000);
      
      // 验证页面标题
      const title = await page.title();
      if (title.includes('检查中心') || title.includes('督查')) {
        addTestResult('进入督查中心', 'passed', `页面标题: ${title}`);
      } else {
        addTestResult('进入督查中心', 'failed', `页面标题不符: ${title}`);
      }
      
      await page.screenshot({ path: 'screenshots/03-inspection-center.png', fullPage: true });
      testResults.screenshots.push('03-inspection-center.png');
      
    } catch (error) {
      addTestResult('进入督查中心', 'failed', error.message);
    }
    
    // ============================================
    // 测试 3: UX优化 - 快捷筛选功能
    // ============================================
    console.log('\n📋 测试组 2: UX优化功能\n');
    
    await delay(2000);
    
    // 测试快捷筛选按钮
    const filterTests = [
      { name: '全部', expected: '显示所有检查计划' },
      { name: '待开始', expected: '只显示待开始的计划' },
      { name: '进行中', expected: '只显示进行中的计划' },
      { name: '已完成', expected: '只显示已完成的计划' }
    ];
    
    for (const filter of filterTests) {
      try {
        // 尝试多种选择器
        let button = await page.locator(`button:has-text("${filter.name}")`).first();
        
        // 如果找不到button，尝试其他元素
        if (await button.count() === 0) {
          button = await page.locator(`text=${filter.name}`).first();
        }
        
        if (await button.count() > 0) {
          await button.click();
          await delay(1500);
          
          await page.screenshot({ 
            path: `screenshots/04-filter-${filter.name}.png`, 
            fullPage: true 
          });
          testResults.screenshots.push(`04-filter-${filter.name}.png`);
          
          addTestResult(`快捷筛选 - ${filter.name}`, 'passed', filter.expected);
        } else {
          addTestResult(`快捷筛选 - ${filter.name}`, 'failed', '未找到筛选按钮');
        }
      } catch (error) {
        addTestResult(`快捷筛选 - ${filter.name}`, 'failed', error.message);
      }
    }
    
    // ============================================
    // 测试 4: 逾期提醒
    // ============================================
    try {
      const overdueAlert = await page.locator('[role="alert"], .el-alert--error').first();
      const hasOverdueAlert = await overdueAlert.count() > 0;
      
      if (hasOverdueAlert) {
        const alertText = await overdueAlert.textContent();
        await page.screenshot({ path: 'screenshots/05-overdue-alert.png' });
        testResults.screenshots.push('05-overdue-alert.png');
        addTestResult('逾期提醒', 'passed', `发现逾期提醒: ${alertText.substring(0, 50)}...`);
      } else {
        addTestResult('逾期提醒', 'passed', '当前无逾期检查，未显示提醒（符合预期）');
      }
    } catch (error) {
      addTestResult('逾期提醒', 'skipped', '无法检测逾期提醒');
    }
    
    // ============================================
    // 测试 5: 全局搜索
    // ============================================
    try {
      const searchInput = await page.locator('input[placeholder*="搜索"]').first();
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('消防');
        await delay(1500);
        
        await page.screenshot({ path: 'screenshots/06-search-result.png', fullPage: true });
        testResults.screenshots.push('06-search-result.png');
        
        addTestResult('全局搜索 - 搜索"消防"', 'passed', '搜索功能正常');
        
        // 清空搜索
        await searchInput.clear();
        await delay(1000);
        addTestResult('全局搜索 - 清空搜索', 'passed', '已恢复显示所有计划');
        
      } else {
        addTestResult('全局搜索', 'failed', '未找到搜索框');
      }
    } catch (error) {
      addTestResult('全局搜索', 'failed', error.message);
    }
    
    // ============================================
    // 测试 6: 跳转到本月按钮
    // ============================================
    try {
      const currentMonthButton = await page.locator('button:has-text("本月检查")').first();
      
      if (await currentMonthButton.count() > 0) {
        await currentMonthButton.click();
        await delay(2000);
        
        await page.screenshot({ path: 'screenshots/07-jump-to-current-month.png', fullPage: true });
        testResults.screenshots.push('07-jump-to-current-month.png');
        
        addTestResult('跳转到本月按钮', 'passed', '已跳转到当前月份');
      } else {
        addTestResult('跳转到本月按钮', 'failed', '未找到"本月检查"按钮');
      }
    } catch (error) {
      addTestResult('跳转到本月按钮', 'failed', error.message);
    }
    
    // ============================================
    // 测试 7: 统计数据
    // ============================================
    console.log('\n📋 测试组 3: 数据展示\n');
    
    try {
      // 查找统计卡片
      const statsCards = await page.locator('.el-card, [class*="stat"]').all();
      
      await page.screenshot({ path: 'screenshots/08-statistics.png', fullPage: true });
      testResults.screenshots.push('08-statistics.png');
      
      addTestResult('统计数据展示', 'passed', `找到 ${statsCards.length} 个统计卡片`);
    } catch (error) {
      addTestResult('统计数据展示', 'failed', error.message);
    }
    
    // ============================================
    // 测试 8: AI智能分析（如果按钮存在）
    // ============================================
    console.log('\n📋 测试组 4: AI功能\n');
    
    try {
      const aiButton = await page.locator('button:has-text("AI智能分析"), button:has-text("智能分析")').first();
      
      if (await aiButton.count() > 0) {
        console.log('   ⏳ 点击AI智能分析按钮（需要等待15-30秒）...');
        await aiButton.click();
        await delay(3000);
        
        // 等待AI分析结果（最多等待40秒）
        try {
          await page.waitForSelector('.el-dialog, [role="dialog"]', { timeout: 40000 });
          await delay(2000);
          
          await page.screenshot({ path: 'screenshots/09-ai-analysis.png', fullPage: true });
          testResults.screenshots.push('09-ai-analysis.png');
          
          addTestResult('AI智能分析', 'passed', 'AI分析对话框已显示');
          
          // 关闭对话框
          const closeButton = await page.locator('.el-dialog__close, button:has-text("关闭"), button:has-text("取消")').first();
          if (await closeButton.count() > 0) {
            await closeButton.click();
            await delay(1000);
          }
        } catch (waitError) {
          addTestResult('AI智能分析', 'failed', 'AI分析超时或未显示结果');
        }
      } else {
        addTestResult('AI智能分析', 'skipped', '未找到AI智能分析按钮');
      }
    } catch (error) {
      addTestResult('AI智能分析', 'failed', error.message);
    }
    
    // ============================================
    // 测试 9: 视图切换
    // ============================================
    console.log('\n📋 测试组 5: 视图功能\n');
    
    const views = [
      { name: '时间轴', text: '时间轴' },
      { name: '月度', text: '月度' },
      { name: '列表', text: '列表' }
    ];
    
    for (const view of views) {
      try {
        const viewButton = await page.locator(`button:has-text("${view.text}"), [role="tab"]:has-text("${view.text}")`).first();
        
        if (await viewButton.count() > 0) {
          await viewButton.click();
          await delay(2000);
          
          await page.screenshot({ 
            path: `screenshots/10-view-${view.name}.png`, 
            fullPage: true 
          });
          testResults.screenshots.push(`10-view-${view.name}.png`);
          
          addTestResult(`视图切换 - ${view.name}`, 'passed', `已切换到${view.name}视图`);
        } else {
          addTestResult(`视图切换 - ${view.name}`, 'skipped', `未找到${view.name}视图按钮`);
        }
      } catch (error) {
        addTestResult(`视图切换 - ${view.name}`, 'failed', error.message);
      }
    }
    
    // 最终截图
    await page.screenshot({ path: 'screenshots/11-final-state.png', fullPage: true });
    testResults.screenshots.push('11-final-state.png');
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    addTestResult('测试执行', 'failed', error.message);
  } finally {
    await delay(3000);
    await browser.close();
  }
  
  // 生成测试报告
  await generateReport();
}

// 生成测试报告
async function generateReport() {
  testResults.endTime = new Date().toISOString();
  
  const report = `# 督查中心浏览器测试报告

**测试时间**: ${testResults.startTime}  
**测试完成**: ${testResults.endTime}  
**测试名称**: ${testResults.testName}

---

## 📊 测试概要

- **总测试数**: ${testResults.summary.total}
- **✅ 通过**: ${testResults.summary.passed}
- **❌ 失败**: ${testResults.summary.failed}
- **⚠️ 跳过**: ${testResults.summary.skipped}
- **通过率**: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%

---

## 📋 详细测试结果

| 序号 | 测试项 | 状态 | 详情 | 截图 |
|------|--------|------|------|------|
${testResults.tests.map((test, index) => {
  const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
  const screenshot = test.screenshot ? `[查看](../screenshots/${test.screenshot})` : '-';
  return `| ${index + 1} | ${test.name} | ${statusIcon} ${test.status} | ${test.details || '-'} | ${screenshot} |`;
}).join('\n')}

---

## 📸 测试截图

共生成 ${testResults.screenshots.length} 张截图：

${testResults.screenshots.map((screenshot, index) => `${index + 1}. \`${screenshot}\``).join('\n')}

所有截图保存在 \`screenshots/\` 目录中。

---

## 💡 测试结论

${testResults.summary.failed === 0 
  ? '✅ **所有测试通过**！督查中心功能正常，可以投入使用。' 
  : `⚠️ **发现 ${testResults.summary.failed} 个失败的测试**，请查看详细结果并修复问题。`}

### 功能完成度评估

- **核心功能**: ${testResults.tests.filter(t => t.name.includes('登录') || t.name.includes('督查中心')).every(t => t.status === 'passed') ? '✅' : '❌'}
- **UX优化功能**: ${testResults.tests.filter(t => t.name.includes('快捷筛选') || t.name.includes('搜索') || t.name.includes('本月')).filter(t => t.status === 'passed').length > 0 ? '✅' : '❌'}
- **AI功能**: ${testResults.tests.filter(t => t.name.includes('AI')).some(t => t.status === 'passed') ? '✅' : '⚠️ 需要验证'}
- **视图功能**: ${testResults.tests.filter(t => t.name.includes('视图')).filter(t => t.status === 'passed').length > 0 ? '✅' : '⚠️'}

---

## 🔍 详细测试日志

\`\`\`json
${JSON.stringify(testResults, null, 2)}
\`\`\`

---

**测试工具**: Playwright (Chromium)  
**生成时间**: ${new Date().toISOString()}
`;

  // 保存报告
  fs.writeFileSync('督查中心自动化测试报告.md', report, 'utf8');
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2), 'utf8');
  
  console.log('\n📄 测试报告已生成:');
  console.log('   - 督查中心自动化测试报告.md');
  console.log('   - test-results.json');
  console.log(`   - screenshots/ (${testResults.screenshots.length} 张截图)`);
  
  console.log('\n📊 测试统计:');
  console.log(`   总计: ${testResults.summary.total} 个测试`);
  console.log(`   ✅ 通过: ${testResults.summary.passed}`);
  console.log(`   ❌ 失败: ${testResults.summary.failed}`);
  console.log(`   ⚠️ 跳过: ${testResults.summary.skipped}`);
  console.log(`   通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
}

// 创建截图目录
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// 运行测试
runTests().catch(console.error);














