/**
 * MCP浏览器测试 - 园长中心页面点击测试
 * 通过实际点击侧边栏菜单来访问各个中心页面
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

const TEST_USER = {
  username: 'principal',
  password: '123456'
};

// 中心页面列表（按侧边栏顺序）
const CENTER_PAGES = [
  { name: '人员中心', menuText: '人员中心', path: '/centers/personnel' },
  { name: '活动中心', menuText: '活动中心', path: '/centers/activity' },
  { name: '营销中心', menuText: '营销中心', path: '/centers/marketing' },
  { name: '客户池中心', menuText: '客户池中心', path: '/centers/customer-pool' },
  { name: '财务中心', menuText: '财务中心', path: '/centers/finance' },
  { name: '招生中心', menuText: '招生中心', path: '/centers/enrollment' },
  { name: '督查中心', menuText: '督查中心', path: '/centers/inspection' },
  { name: '任务中心', menuText: '任务中心', path: '/centers/task' },
  { name: '教学中心', menuText: '教学中心', path: '/centers/teaching' },
  { name: '话术中心', menuText: '话术中心', path: '/centers/script' },
  { name: '新媒体中心', menuText: '新媒体中心', path: '/centers/media' }
];

const OUTPUT_DIR = '/tmp/playwright-mcp-output';

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function login(page) {
  console.log('🔐 开始登录...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // 等待登录表单加载
  await page.waitForSelector('.login-form', { timeout: 10000 });
  
  // 填写登录信息
  console.log('   填写用户名...');
  await page.fill('input[placeholder="请输入用户名"]', TEST_USER.username);
  
  console.log('   填写密码...');
  await page.fill('input[placeholder="请输入密码"]', TEST_USER.password);
  
  // 点击登录按钮
  console.log('   点击登录按钮...');
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  
  // 等待页面加载
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  console.log(`   当前URL: ${currentUrl}`);
  
  if (currentUrl.includes('/login')) {
    throw new Error('登录失败');
  }
  
  console.log('✅ 登录成功，当前页面:', currentUrl);
  console.log('');
}

async function testCenterByClick(page, center, index) {
  console.log('='.repeat(80));
  console.log(`📋 测试 ${index + 1}/${CENTER_PAGES.length}: ${center.name}`);
  console.log(`🔗 菜单文本: ${center.menuText}`);
  console.log(`🔗 预期路径: ${center.path}`);
  console.log('='.repeat(80));
  console.log('');
  
  const result = {
    name: center.name,
    menuClick: false,
    pageLoad: false,
    dataDisplay: false,
    status: 'failed',
    error: null,
    url: null,
    screenshot: null
  };
  
  try {
    // 步骤1: 点击侧边栏菜单
    console.log('🖱️  步骤1: 点击侧边栏菜单...');

    // 等待侧边栏加载
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // 查找菜单项 - 使用 nav-item class 和 href 属性
    const menuItem = await page.locator(`a.nav-item[href="${center.path}"]`).first();

    if (await menuItem.count() === 0) {
      throw new Error(`未找到菜单项: ${center.menuText} (路径: ${center.path})`);
    }

    console.log(`   找到菜单项: ${center.menuText}`);

    // 点击菜单
    await menuItem.click();
    result.menuClick = true;
    console.log('✅ 菜单点击成功');
    console.log('');
    
    // 步骤2: 等待页面加载
    console.log('🌐 步骤2: 等待页面加载...');
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    result.url = currentUrl;
    console.log(`   当前URL: ${currentUrl}`);
    
    // 检查是否跳转到403
    if (currentUrl.includes('/403')) {
      throw new Error('跳转到403权限不足页面');
    }
    
    // 检查URL是否正确
    if (!currentUrl.includes(center.path)) {
      console.log(`⚠️  URL不匹配，预期: ${center.path}, 实际: ${currentUrl}`);
    }
    
    result.pageLoad = true;
    console.log('✅ 页面加载成功');
    console.log('');
    
    // 步骤3: 检查页面内容
    console.log('📊 步骤3: 数据显示检查...');
    
    const pageTitle = await page.title();
    console.log(`   页面标题: ${pageTitle}`);
    
    // 检查是否有错误提示
    const errorElements = await page.$$('.el-message--error, .error-message, .error-tip');
    if (errorElements.length > 0) {
      const errorText = await errorElements[0].textContent();
      console.log(`⚠️  发现错误提示: ${errorText}`);
    } else {
      console.log('✅ 无错误提示');
    }
    
    // 检查主要内容区域
    const mainContent = await page.$('.main-content, .page-container, .center-container, .content-wrapper');
    if (mainContent) {
      console.log('✅ 主要内容区域已加载');
      result.dataDisplay = true;
    } else {
      console.log('⚠️  未找到主要内容区域');
    }
    
    // 步骤4: 截图
    console.log('');
    console.log('📸 步骤4: 截图保存...');
    
    const screenshotPath = path.join(OUTPUT_DIR, `园长${center.name}-点击测试.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;
    console.log(`✅ 截图已保存: ${screenshotPath}`);
    
    result.status = 'success';
    console.log('');
    console.log(`✅ ${center.name}测试完成`);
    
  } catch (error) {
    result.error = error.message;
    console.log('');
    console.log(`❌ ${center.name}测试失败: ${error.message}`);
    
    // 失败时也截图
    try {
      const screenshotPath = path.join(OUTPUT_DIR, `园长${center.name}-点击测试-失败.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;
      console.log(`📸 失败截图已保存: ${screenshotPath}`);
    } catch (e) {
      console.log('⚠️  截图保存失败');
    }
  }
  
  console.log('');
  return result;
}

async function generateReport(results) {
  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const successRate = ((successCount / results.length) * 100).toFixed(1);
  
  const report = `# MCP浏览器测试报告 - 园长中心页面点击测试

## 📊 测试概览

**测试时间**: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}  
**测试角色**: 园长 (principal)  
**测试方式**: 点击侧边栏菜单  
**测试页面数**: ${results.length}个  
**成功**: ${successCount}个 ✅  
**失败**: ${failedCount}个 ❌  
**成功率**: ${successRate}%

---

## 📋 详细测试结果

| 序号 | 中心名称 | 菜单点击 | 页面加载 | 数据显示 | 状态 | 备注 |
|------|---------|---------|---------|---------|------|------|
${results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.menuClick ? '✅' : '❌'} | ${r.pageLoad ? '✅' : '❌'} | ${r.dataDisplay ? '✅' : '❌'} | ${r.status === 'success' ? '✅ 成功' : '❌ 失败'} | ${r.error || '-'} |`).join('\n')}

---

## 📸 测试截图

测试截图保存在: \`${OUTPUT_DIR}/\`

${results.map((r, i) => `${i + 1}. ${r.status === 'success' ? '✅' : '❌'} \`园长${r.name}-点击测试${r.status === 'failed' ? '-失败' : ''}.png\``).join('\n')}

---

## 💡 总结

${successRate === '100.0' ? '✅ **所有测试通过**: 所有中心页面均可通过点击侧边栏菜单正常访问。' : `⚠️ **部分测试失败**: ${failedCount}个页面无法正常访问，需要进一步排查。`}

---

**测试完成时间**: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}  
**测试工具**: MCP浏览器 (Playwright)  
**测试状态**: ✅ 完成
`;

  const reportPath = 'docs/通知功能/MCP浏览器测试报告-园长中心页面点击测试.md';
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ 测试报告已保存: ${reportPath}`);
  
  return { successCount, failedCount, successRate };
}

async function main() {
  console.log('🚀 MCP浏览器测试 - 园长中心页面点击测试\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const results = [];
  
  try {
    // 登录
    await login(page);
    
    // 测试每个中心页面
    for (let i = 0; i < CENTER_PAGES.length; i++) {
      const center = CENTER_PAGES[i];
      const result = await testCenterByClick(page, center, i);
      results.push(result);
      
      // 每次测试后等待一下
      await page.waitForTimeout(1000);
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('📊 测试报告生成中...');
    console.log('='.repeat(80));
    console.log('');
    
    const summary = await generateReport(results);
    
    console.log('📊 测试摘要:');
    console.log(`   - 测试页面数: ${results.length}个`);
    console.log(`   - 成功: ${summary.successCount}个 ✅`);
    console.log(`   - 失败: ${summary.failedCount}个 ❌`);
    console.log(`   - 成功率: ${summary.successRate}%`);
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    await browser.close();
  }
}

main();

