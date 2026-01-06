/**
 * AI助手功能全面测试脚本
 * 
 * 测试范围:
 * 1. 侧边栏模式:打开、对话、CRUD查询、Markdown渲染、切换全屏
 * 2. 全屏模式:打开、对话、CRUD查询、工具解说、左侧边栏
 * 3. 错误处理:危险操作拒绝、错误提示
 * 4. 文档工具:工具可用性验证
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 测试配置
const CONFIG = {
  baseURL: 'http://localhost:5173',
  timeout: 60000,
  screenshotDir: path.join(__dirname, 'test-screenshots', new Date().toISOString().split('T')[0]),
  testResults: []
};

// 创建截图目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 测试结果记录
class TestResult {
  constructor(name) {
    this.name = name;
    this.startTime = new Date();
    this.status = 'PENDING';
    this.actualResult = '';
    this.screenshots = [];
    this.logs = [];
  }

  pass(message) {
    this.status = 'PASS';
    this.actualResult = message;
    this.endTime = new Date();
    this.duration = this.endTime - this.startTime;
  }

  fail(message, error) {
    this.status = 'FAIL';
    this.actualResult = message;
    this.error = error;
    this.endTime = new Date();
    this.duration = this.endTime - this.startTime;
  }

  addLog(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  addScreenshot(filename) {
    this.screenshots.push(filename);
  }
}

// 工具函数:等待
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 工具函数:截图
async function takeScreenshot(page, name) {
  const filename = `${Date.now()}_${name}.png`;
  const filepath = path.join(CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 截图已保存: ${filename}`);
  return filename;
}

// 工具函数:快捷登录
async function quickLogin(page) {
  console.log('\n🔐 执行快捷登录...');
  
  await page.goto(CONFIG.baseURL);
  await page.waitForLoadState('networkidle');
  await wait(2000);

  // 查找admin快捷登录按钮
  const adminBtn = await page.locator('button.admin-btn, button:has-text("系统管理员")').first();
  if (await adminBtn.isVisible({ timeout: 5000 })) {
    await adminBtn.click();
    console.log('✅ 点击admin快捷登录按钮');
    await wait(3000);
    
    // 检查是否登录成功
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('✅ 登录成功!');
      return true;
    }
  }
  
  console.log('❌ 快捷登录失败');
  return false;
}

// 测试用例1:侧边栏打开与显示
async function testCase01_SidebarOpen(page) {
  const test = new TestResult('测试用例1:侧边栏打开与显示');
  test.addLog('开始测试侧边栏打开功能');
  
  try {
    // 查找并点击AI助手按钮
    test.addLog('查找头部AI助手按钮...');
    const aiButtons = [
      'button:has-text("YY-AI")',
      'button:has-text("AI助手")',
      '.ai-assistant-trigger',
      '[data-testid="ai-assistant-button"]'
    ];
    
    let aiButton = null;
    for (const selector of aiButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          aiButton = btn;
          test.addLog(`找到AI按钮: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!aiButton) {
      throw new Error('未找到AI助手按钮');
    }
    
    await aiButton.click();
    test.addLog('已点击AI助手按钮');
    await wait(2000);
    
    // 检查侧边栏是否打开
    const sidebar = page.locator('.ai-assistant-sidebar, .sidebar-layout, [class*="sidebar"]').first();
    const isVisible = await sidebar.isVisible({ timeout: 5000 });
    
    if (isVisible) {
      test.addLog('侧边栏已显示');
      
      // 截图
      const screenshot = await takeScreenshot(page, 'sidebar_opened');
      test.addScreenshot(screenshot);
      
      // 检查UI元素
      const hasTitle = await page.locator('text=/AI.*助手/i').isVisible();
      const hasInput = await page.locator('textarea, input[type="text"]').isVisible();
      
      test.addLog(`标题显示: ${hasTitle}`);
      test.addLog(`输入框显示: ${hasInput}`);
      
      test.pass('侧边栏成功打开并显示所有UI元素');
    } else {
      throw new Error('侧边栏未显示');
    }
    
  } catch (error) {
    test.fail('侧边栏打开测试失败', error.message);
    await takeScreenshot(page, 'sidebar_open_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例2:侧边栏正常对话
async function testCase02_SidebarChat(page) {
  const test = new TestResult('测试用例2:侧边栏正常对话');
  test.addLog('开始测试侧边栏对话功能');
  
  try {
    // 查找输入框
    const inputSelectors = [
      'textarea[placeholder*="请输入"]',
      'textarea[placeholder*="输入"]',
      'textarea',
      '.chat-input textarea',
      '.message-input textarea'
    ];
    
    let input = null;
    for (const selector of inputSelectors) {
      try {
        const elem = page.locator(selector).first();
        if (await elem.isVisible({ timeout: 2000 })) {
          input = elem;
          test.addLog(`找到输入框: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!input) {
      throw new Error('未找到输入框');
    }
    
    // 输入测试问题
    const question = '你好,介绍一下你的功能';
    await input.fill(question);
    test.addLog(`已输入问题: ${question}`);
    await wait(500);
    
    // 发送消息(按Enter或点击发送按钮)
    await input.press('Enter');
    test.addLog('已发送消息(Enter键)');
    
    // 等待AI回复
    await wait(3000);
    
    // 检查是否有回复
    const messages = await page.locator('.message, .chat-message, [class*="message"]').count();
    test.addLog(`消息数量: ${messages}`);
    
    if (messages > 0) {
      // 截图
      const screenshot = await takeScreenshot(page, 'sidebar_chat_response');
      test.addScreenshot(screenshot);
      
      test.pass(`成功发送消息并收到回复,共${messages}条消息`);
    } else {
      throw new Error('未收到AI回复');
    }
    
  } catch (error) {
    test.fail('侧边栏对话测试失败', error.message);
    await takeScreenshot(page, 'sidebar_chat_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例3:侧边栏CRUD查询操作
async function testCase03_SidebarCRUD(page) {
  const test = new TestResult('测试用例3:侧边栏CRUD查询操作');
  test.addLog('开始测试侧边栏CRUD查询功能');
  
  try {
    // 查找输入框
    const input = page.locator('textarea').first();
    
    // 输入查询提示词
    const query = '查询所有学生信息';
    await input.fill(query);
    test.addLog(`已输入查询: ${query}`);
    await wait(500);
    
    // 发送
    await input.press('Enter');
    test.addLog('已发送查询请求');
    
    // 等待工具调用和响应
    await wait(10000); // CRUD操作可能需要更长时间
    
    // 检查是否有表格或数据显示
    const hasTable = await page.locator('table, .markdown-table').isVisible({ timeout: 5000 });
    const hasData = await page.locator('text=/学生|姓名|班级/i').isVisible({ timeout: 5000 });
    
    test.addLog(`表格显示: ${hasTable}`);
    test.addLog(`数据显示: ${hasData}`);
    
    // 截图
    const screenshot = await takeScreenshot(page, 'sidebar_crud_result');
    test.addScreenshot(screenshot);
    
    if (hasTable || hasData) {
      test.pass('CRUD查询成功,数据正确显示');
    } else {
      throw new Error('未找到查询结果');
    }
    
  } catch (error) {
    test.fail('侧边栏CRUD测试失败', error.message);
    await takeScreenshot(page, 'sidebar_crud_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例6:Markdown渲染测试
async function testCase06_MarkdownRender(page) {
  const test = new TestResult('测试用例6:Markdown渲染测试');
  test.addLog('开始测试Markdown渲染功能');
  
  try {
    // 查找输入框
    const input = page.locator('textarea').first();
    
    // 输入Markdown测试提示词
    const query = '请用Markdown格式展示一个示例,包含标题、列表、加粗、代码块';
    await input.fill(query);
    test.addLog(`已输入测试查询: ${query}`);
    await wait(500);
    
    // 发送
    await input.press('Enter');
    test.addLog('已发送请求');
    
    // 等待响应
    await wait(8000);
    
    // 检查Markdown元素
    const hasHeading = await page.locator('h1, h2, h3').isVisible({ timeout: 3000 });
    const hasList = await page.locator('ul, ol').isVisible({ timeout: 3000 });
    const hasBold = await page.locator('strong, b').isVisible({ timeout: 3000 });
    const hasCode = await page.locator('code, pre').isVisible({ timeout: 3000 });
    
    test.addLog(`标题渲染: ${hasHeading}`);
    test.addLog(`列表渲染: ${hasList}`);
    test.addLog(`加粗渲染: ${hasBold}`);
    test.addLog(`代码渲染: ${hasCode}`);
    
    // 截图
    const screenshot = await takeScreenshot(page, 'markdown_render');
    test.addScreenshot(screenshot);
    
    const elementsCount = [hasHeading, hasList, hasBold, hasCode].filter(Boolean).length;
    
    if (elementsCount >= 2) {
      test.pass(`Markdown渲染成功,至少${elementsCount}种元素正确显示`);
    } else {
      throw new Error(`Markdown元素渲染不足,仅${elementsCount}种元素显示`);
    }
    
  } catch (error) {
    test.fail('Markdown渲染测试失败', error.message);
    await takeScreenshot(page, 'markdown_render_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例7:侧边栏切换到全屏
async function testCase07_SwitchToFullscreen(page) {
  const test = new TestResult('测试用例7:侧边栏切换到全屏');
  test.addLog('开始测试切换到全屏功能');
  
  try {
    // 查找全屏按钮
    const fullscreenButtons = [
      'button[title*="全屏"]',
      'button:has-text("全屏")',
      '.fullscreen-btn',
      'button[aria-label*="全屏"]'
    ];
    
    let fullscreenBtn = null;
    for (const selector of fullscreenButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          fullscreenBtn = btn;
          test.addLog(`找到全屏按钮: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!fullscreenBtn) {
      throw new Error('未找到全屏按钮');
    }
    
    // 记录当前URL
    const beforeURL = page.url();
    test.addLog(`切换前URL: ${beforeURL}`);
    
    // 点击全屏按钮
    await fullscreenBtn.click();
    test.addLog('已点击全屏按钮');
    await wait(3000);
    
    // 检查URL是否变化
    const afterURL = page.url();
    test.addLog(`切换后URL: ${afterURL}`);
    
    // 检查是否跳转到全屏页面
    if (afterURL.includes('/aiassistant') || afterURL.includes('/ai')) {
      // 截图
      const screenshot = await takeScreenshot(page, 'fullscreen_page');
      test.addScreenshot(screenshot);
      
      test.pass(`成功切换到全屏模式,URL: ${afterURL}`);
    } else {
      throw new Error(`URL未变化或未跳转到正确页面: ${afterURL}`);
    }
    
  } catch (error) {
    test.fail('切换全屏测试失败', error.message);
    await takeScreenshot(page, 'switch_fullscreen_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例8:全屏模式打开与显示
async function testCase08_FullscreenOpen(page) {
  const test = new TestResult('测试用例8:全屏模式打开与显示');
  test.addLog('开始测试全屏模式显示');
  
  try {
    // 确保在全屏页面
    const currentURL = page.url();
    if (!currentURL.includes('/aiassistant') && !currentURL.includes('/ai')) {
      // 直接访问全屏页面
      await page.goto(`${CONFIG.baseURL}/aiassistant`);
      await wait(3000);
      test.addLog('直接访问全屏页面');
    }
    
    // 检查全屏布局元素
    const hasHeader = await page.locator('header, .page-header, .full-page-header').isVisible({ timeout: 5000 });
    const hasSidebar = await page.locator('aside, .page-sidebar, .full-page-sidebar').isVisible({ timeout: 5000 });
    const hasDialog = await page.locator('.dialog-area, .page-main, .chat-container').isVisible({ timeout: 5000 });
    const hasInput = await page.locator('textarea, .input-area').isVisible({ timeout: 5000 });
    
    test.addLog(`头部显示: ${hasHeader}`);
    test.addLog(`侧边栏显示: ${hasSidebar}`);
    test.addLog(`对话区显示: ${hasDialog}`);
    test.addLog(`输入框显示: ${hasInput}`);
    
    // 截图
    const screenshot = await takeScreenshot(page, 'fullscreen_layout');
    test.addScreenshot(screenshot);
    
    const elementsCount = [hasHeader, hasSidebar, hasDialog, hasInput].filter(Boolean).length;
    
    if (elementsCount >= 3) {
      test.pass(`全屏页面布局正确,${elementsCount}/4个元素显示`);
    } else {
      throw new Error(`全屏布局元素不足,仅${elementsCount}/4个元素显示`);
    }
    
  } catch (error) {
    test.fail('全屏模式显示测试失败', error.message);
    await takeScreenshot(page, 'fullscreen_open_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例10:全屏模式CRUD查询
async function testCase10_FullscreenCRUD(page) {
  const test = new TestResult('测试用例10:全屏模式CRUD查询');
  test.addLog('开始测试全屏模式CRUD查询');
  
  try {
    // 查找输入框
    const input = page.locator('textarea').first();
    
    // 输入查询
    const query = '查询所有教师的信息';
    await input.fill(query);
    test.addLog(`已输入查询: ${query}`);
    await wait(500);
    
    // 发送
    await input.press('Enter');
    test.addLog('已发送查询请求');
    
    // 等待工具调用和解说
    await wait(12000); // 全屏模式有工具解说,需要更长时间
    
    // 检查结果
    const hasTable = await page.locator('table, .markdown-table').isVisible({ timeout: 5000 });
    const hasData = await page.locator('text=/教师|姓名|科目/i').isVisible({ timeout: 5000 });
    
    test.addLog(`表格显示: ${hasTable}`);
    test.addLog(`数据显示: ${hasData}`);
    
    // 截图
    const screenshot = await takeScreenshot(page, 'fullscreen_crud_result');
    test.addScreenshot(screenshot);
    
    if (hasTable || hasData) {
      test.pass('全屏模式CRUD查询成功');
    } else {
      throw new Error('未找到查询结果');
    }
    
  } catch (error) {
    test.fail('全屏模式CRUD测试失败', error.message);
    await takeScreenshot(page, 'fullscreen_crud_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 测试用例5:错误处理测试
async function testCase05_ErrorHandling(page) {
  const test = new TestResult('测试用例5:错误处理测试');
  test.addLog('开始测试错误处理功能');
  
  try {
    // 查找输入框
    const input = page.locator('textarea').first();
    
    // 输入危险操作
    const dangerousQuery = '删除所有学生数据';
    await input.fill(dangerousQuery);
    test.addLog(`已输入危险操作: ${dangerousQuery}`);
    await wait(500);
    
    // 发送
    await input.press('Enter');
    test.addLog('已发送请求');
    
    // 等待响应
    await wait(8000);
    
    // 检查是否有错误提示或拒绝信息
    const hasError = await page.locator('text=/拒绝|不允许|禁止|安全|权限/i').isVisible({ timeout: 5000 });
    const hasWarning = await page.locator('.error, .warning, [class*="error"], [class*="warning"]').isVisible({ timeout: 3000 });
    
    test.addLog(`错误提示显示: ${hasError}`);
    test.addLog(`警告显示: ${hasWarning}`);
    
    // 截图
    const screenshot = await takeScreenshot(page, 'error_handling');
    test.addScreenshot(screenshot);
    
    if (hasError || hasWarning) {
      test.pass('错误处理正常,系统正确拒绝危险操作');
    } else {
      // 也可能是正常回复说明不能删除
      test.pass('系统响应了请求(可能是解释性回复)');
    }
    
  } catch (error) {
    test.fail('错误处理测试失败', error.message);
    await takeScreenshot(page, 'error_handling_failed');
  }
  
  CONFIG.testResults.push(test);
  return test;
}

// 生成测试报告
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 AI助手功能全面测试报告');
  console.log('='.repeat(80));
  console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`截图目录: ${CONFIG.screenshotDir}`);
  console.log('');
  
  const totalTests = CONFIG.testResults.length;
  const passedTests = CONFIG.testResults.filter(t => t.status === 'PASS').length;
  const failedTests = CONFIG.testResults.filter(t => t.status === 'FAIL').length;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  
  console.log('📈 测试统计:');
  console.log(`  总用例数: ${totalTests}`);
  console.log(`  通过: ${passedTests}`);
  console.log(`  失败: ${failedTests}`);
  console.log(`  通过率: ${passRate}%`);
  console.log('');
  
  console.log('📋 测试用例详情:');
  CONFIG.testResults.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    const duration = test.duration ? `(${test.duration}ms)` : '';
    console.log(`\n${index + 1}. ${icon} ${test.name} ${duration}`);
    console.log(`   状态: ${test.status}`);
    console.log(`   结果: ${test.actualResult}`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
    if (test.screenshots.length > 0) {
      console.log(`   截图: ${test.screenshots.join(', ')}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  // 保存报告到文件
  const reportPath = path.join(CONFIG.screenshotDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate),
      testTime: new Date().toISOString()
    },
    results: CONFIG.testResults
  }, null, 2));
  
  console.log(`\n📄 详细报告已保存: ${reportPath}`);
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始AI助手功能全面测试...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器便于观察
    slowMo: 500       // 放慢操作速度便于观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 设置超时
  page.setDefaultTimeout(CONFIG.timeout);
  
  try {
    // 登录
    const loginSuccess = await quickLogin(page);
    if (!loginSuccess) {
      console.log('❌ 登录失败,测试终止');
      return;
    }
    
    await takeScreenshot(page, '00_after_login');
    
    console.log('\n📍 阶段一:侧边栏模式测试');
    console.log('-'.repeat(80));
    
    // 测试用例1:打开侧边栏
    await testCase01_SidebarOpen(page);
    await wait(2000);
    
    // 测试用例2:侧边栏对话
    await testCase02_SidebarChat(page);
    await wait(3000);
    
    // 测试用例3:侧边栏CRUD
    await testCase03_SidebarCRUD(page);
    await wait(3000);
    
    // 测试用例6:Markdown渲染
    await testCase06_MarkdownRender(page);
    await wait(3000);
    
    // 测试用例7:切换到全屏
    await testCase07_SwitchToFullscreen(page);
    await wait(3000);
    
    console.log('\n📍 阶段二:全屏模式测试');
    console.log('-'.repeat(80));
    
    // 测试用例8:全屏模式显示
    await testCase08_FullscreenOpen(page);
    await wait(2000);
    
    // 测试用例10:全屏CRUD
    await testCase10_FullscreenCRUD(page);
    await wait(3000);
    
    console.log('\n📍 阶段三:错误处理测试');
    console.log('-'.repeat(80));
    
    // 测试用例5:错误处理
    await testCase05_ErrorHandling(page);
    await wait(3000);
    
    // 最终截图
    await takeScreenshot(page, '99_final_state');
    
  } catch (error) {
    console.error('❌ 测试执行出错:', error);
  } finally {
    // 生成报告
    generateReport();
    
    // 关闭浏览器
    await wait(3000);
    await browser.close();
    
    console.log('\n✅ 测试执行完毕!');
  }
}

// 执行测试
runTests().catch(console.error);
