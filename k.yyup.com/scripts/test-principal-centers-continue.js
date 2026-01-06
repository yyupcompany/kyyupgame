/**
 * MCP浏览器测试脚本 - 继续测试园长中心页面
 * 
 * 测试目标：
 * 1. 重新测试活动中心和营销中心（验证权限修复）
 * 2. 测试剩余8个中心页面
 * 3. 记录权限验证时间、页面加载状态、数据显示
 * 4. 截图保存成功加载的页面
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

// 测试用户凭据
const TEST_USER = {
  username: 'principal',
  password: '123456'
};

// 待测试的中心页面列表
const CENTER_PAGES = [
  // 重新测试（验证权限修复）
  { name: '活动中心', path: '/centers/activity', retest: true },
  { name: '营销中心', path: '/centers/marketing', retest: true },
  
  // 新测试
  { name: '客户池中心', path: '/centers/customer-pool', retest: false },
  { name: '财务中心', path: '/centers/finance', retest: false },
  { name: '招生中心', path: '/centers/enrollment', retest: false },
  { name: '督查中心', path: '/centers/inspection', retest: false },
  { name: '任务中心', path: '/centers/task', retest: false },
  { name: '教学中心', path: '/centers/teaching', retest: false },
  { name: '话术中心', path: '/centers/script', retest: false },
  { name: '新媒体中心', path: '/centers/media', retest: false }
];

// 测试结果
const testResults = [];

async function login(page) {
  console.log('🔐 开始登录...');

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // 等待登录表单加载
  await page.waitForSelector('.login-form', { timeout: 10000 });

  console.log('   填写用户名...');
  await page.fill('input[placeholder="请输入用户名"]', TEST_USER.username);

  console.log('   填写密码...');
  await page.fill('input[placeholder="请输入密码"]', TEST_USER.password);

  console.log('   点击登录按钮...');
  // 点击登录按钮并等待导航
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);

  // 等待页面稳定
  await page.waitForTimeout(2000);

  // 检查是否登录成功
  const currentUrl = page.url();
  console.log(`   当前URL: ${currentUrl}`);

  // 检查是否仍在登录页面
  if (currentUrl.includes('/login')) {
    // 检查是否有错误提示
    const errorMsg = await page.$('.el-message--error, .error-message');
    if (errorMsg) {
      const errorText = await errorMsg.textContent();
      throw new Error(`登录失败: ${errorText}`);
    }

    // 截图保存
    await page.screenshot({ path: '/tmp/login-failed.png' });
    throw new Error('登录失败：仍在登录页面（截图已保存到 /tmp/login-failed.png）');
  }

  console.log(`✅ 登录成功，当前页面: ${currentUrl}\n`);
}

async function testCenterPage(page, center) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 测试: ${center.name} ${center.retest ? '(重新测试 - 验证权限修复)' : ''}`);
  console.log(`🔗 路径: ${center.path}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const result = {
    name: center.name,
    path: center.path,
    retest: center.retest,
    permissionCheck: { success: false, time: 0 },
    pageLoad: { success: false, error: null },
    dataDisplay: { success: false, data: {} },
    screenshot: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 1. 权限验证
    console.log('🔍 步骤1: 权限验证...');
    const permissionStart = Date.now();
    
    const permissionResponse = await page.request.post(`${API_URL}/api/dynamic-permissions/check-permission`, {
      data: {
        path: center.path
      },
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`
      }
    });
    
    const permissionTime = Date.now() - permissionStart;
    const permissionData = await permissionResponse.json();
    
    result.permissionCheck.time = permissionTime;
    result.permissionCheck.success = permissionData.success && permissionData.data.hasPermission;
    
    if (result.permissionCheck.success) {
      console.log(`✅ 权限验证通过 (${permissionTime}ms)`);
    } else {
      console.log(`❌ 权限验证失败 (${permissionTime}ms)`);
      console.log(`   原因: ${permissionData.message || '无权限'}`);
      result.pageLoad.error = '权限验证失败';
      return result;
    }
    
    // 2. 页面加载
    console.log('\n🌐 步骤2: 页面加载...');
    
    await page.goto(`${BASE_URL}${center.path}`);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // 检查是否跳转到403页面
    const currentUrl = page.url();
    if (currentUrl.includes('/403')) {
      console.log('❌ 页面加载失败: 跳转到403权限不足页面');
      result.pageLoad.error = '403权限不足';
      return result;
    }
    
    console.log('✅ 页面加载成功');
    result.pageLoad.success = true;
    
    // 3. 数据显示检查
    console.log('\n📊 步骤3: 数据显示检查...');
    
    // 等待主要内容加载
    await page.waitForTimeout(2000);
    
    // 检查页面标题
    const pageTitle = await page.title();
    console.log(`   页面标题: ${pageTitle}`);
    
    // 检查是否有错误提示
    const errorElements = await page.$$('.el-message--error, .error-message');
    if (errorElements.length > 0) {
      const errorText = await errorElements[0].textContent();
      console.log(`⚠️  发现错误提示: ${errorText}`);
      result.dataDisplay.error = errorText;
    }
    
    // 检查主要内容区域
    const mainContent = await page.$('.main-content, .page-container, .center-container');
    if (mainContent) {
      console.log('✅ 主要内容区域已加载');
      result.dataDisplay.success = true;
    } else {
      console.log('⚠️  未找到主要内容区域');
    }
    
    // 4. 截图
    console.log('\n📸 步骤4: 截图保存...');
    
    const screenshotDir = '/tmp/playwright-mcp-output';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `园长${center.name}-${center.retest ? '重测-' : ''}成功加载.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    result.screenshot = screenshotPath;
    console.log(`✅ 截图已保存: ${screenshotPath}`);
    
    console.log(`\n✅ ${center.name}测试完成`);
    
  } catch (error) {
    console.log(`\n❌ ${center.name}测试失败: ${error.message}`);
    result.pageLoad.error = error.message;
  }
  
  return result;
}

async function generateReport(results) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 测试报告生成中...');
  console.log('='.repeat(80) + '\n');
  
  const successCount = results.filter(r => r.pageLoad.success).length;
  const failCount = results.filter(r => !r.pageLoad.success).length;
  const retestCount = results.filter(r => r.retest).length;
  const retestSuccessCount = results.filter(r => r.retest && r.pageLoad.success).length;
  
  const report = `# MCP浏览器测试报告 - 园长中心页面测试（继续）

## 📊 测试概览

**测试时间**: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}  
**测试角色**: 园长 (principal)  
**测试页面数**: ${results.length}个  
**成功**: ${successCount}个 ✅  
**失败**: ${failCount}个 ❌  
**成功率**: ${((successCount / results.length) * 100).toFixed(1)}%

### 权限修复验证

**重新测试页面**: ${retestCount}个  
**修复成功**: ${retestSuccessCount}个  
**修复成功率**: ${retestCount > 0 ? ((retestSuccessCount / retestCount) * 100).toFixed(1) : 0}%

---

## 📋 详细测试结果

| 序号 | 中心名称 | 权限验证 | 页面加载 | 数据显示 | 状态 | 备注 |
|------|---------|---------|---------|---------|------|------|
${results.map((r, i) => {
  const permStatus = r.permissionCheck.success ? `✅ 通过 (${r.permissionCheck.time}ms)` : `❌ 失败 (${r.permissionCheck.time}ms)`;
  const loadStatus = r.pageLoad.success ? '✅ 成功' : '❌ 失败';
  const dataStatus = r.dataDisplay.success ? '✅ 正常' : '⚠️ 异常';
  const status = r.pageLoad.success ? '✅ 成功' : '❌ 失败';
  const note = r.retest ? '重新测试' : (r.pageLoad.error || '-');
  
  return `| ${i + 1} | ${r.name} | ${permStatus} | ${loadStatus} | ${dataStatus} | ${status} | ${note} |`;
}).join('\n')}

---

## 🔍 权限修复验证详情

${results.filter(r => r.retest).map(r => `### ${r.name}

**路径**: \`${r.path}\`  
**权限验证**: ${r.permissionCheck.success ? `✅ 通过 (${r.permissionCheck.time}ms)` : `❌ 失败`}  
**页面加载**: ${r.pageLoad.success ? '✅ 成功' : `❌ 失败 - ${r.pageLoad.error}`}  
**数据显示**: ${r.dataDisplay.success ? '✅ 正常' : '⚠️ 异常'}  
**截图**: ${r.screenshot ? `✅ 已保存` : '❌ 未保存'}

**结论**: ${r.pageLoad.success ? '✅ 权限修复成功，页面可正常访问' : '❌ 权限修复失败或存在其他问题'}
`).join('\n---\n\n')}

---

## 📊 测试统计

### 权限验证时间统计

- **最快**: ${Math.min(...results.map(r => r.permissionCheck.time))}ms
- **最慢**: ${Math.max(...results.map(r => r.permissionCheck.time))}ms
- **平均**: ${Math.round(results.reduce((sum, r) => sum + r.permissionCheck.time, 0) / results.length)}ms

### 失败原因分析

${failCount > 0 ? results.filter(r => !r.pageLoad.success).map(r => `- **${r.name}**: ${r.pageLoad.error}`).join('\n') : '无失败页面'}

---

## 📸 测试截图

测试截图保存在: \`/tmp/playwright-mcp-output/\`

${results.filter(r => r.screenshot).map((r, i) => `${i + 1}. ✅ \`园长${r.name}-${r.retest ? '重测-' : ''}成功加载.png\``).join('\n')}

---

## 💡 总结

${retestSuccessCount === retestCount && retestCount > 0 ? 
`✅ **权限修复验证成功**: 所有重新测试的页面均可正常访问，权限复制脚本工作正常。` : 
retestCount > 0 ? 
`⚠️ **权限修复部分成功**: ${retestSuccessCount}/${retestCount}个页面修复成功，仍有${retestCount - retestSuccessCount}个页面存在问题。` : 
''}

${successCount === results.length ? 
`🎉 **测试全部通过**: 所有${results.length}个中心页面均可正常访问，园长角色权限配置完整。` : 
`⚠️ **部分测试失败**: ${failCount}个页面无法访问，需要进一步排查问题。`}

---

**测试完成时间**: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}  
**测试工具**: MCP浏览器 (Playwright)  
**测试状态**: ✅ 完成
`;

  // 保存报告
  const reportPath = 'docs/通知功能/MCP浏览器测试报告-园长中心页面测试-继续.md';
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log(`\n✅ 测试报告已保存: ${reportPath}\n`);
  
  // 打印摘要
  console.log('📊 测试摘要:');
  console.log(`   - 测试页面数: ${results.length}个`);
  console.log(`   - 成功: ${successCount}个 ✅`);
  console.log(`   - 失败: ${failCount}个 ❌`);
  console.log(`   - 成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);
  console.log(`   - 权限修复验证: ${retestSuccessCount}/${retestCount}个成功`);
}

async function main() {
  console.log('🚀 MCP浏览器测试 - 园长中心页面测试（继续）\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 登录
    await login(page);
    
    // 测试所有中心页面
    for (const center of CENTER_PAGES) {
      const result = await testCenterPage(page, center);
      testResults.push(result);
      
      // 等待一下，避免请求过快
      await page.waitForTimeout(1000);
    }
    
    // 生成报告
    await generateReport(testResults);
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    await browser.close();
  }
}

main();

