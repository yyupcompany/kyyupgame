/**
 * 检查中心页面的具体错误
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const PROBLEM_CENTERS = [
  { name: '人员中心', path: '/centers/personnel', issue: 'API错误' },
  { name: '客户池中心', path: '/centers/customer-pool', issue: '权限不足' },
  { name: '招生中心', path: '/centers/enrollment', issue: '权限不足' },
  { name: '督查中心', path: '/centers/inspection', issue: '资源不存在' }
];

async function checkCenter(page, center) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 检查: ${center.name}`);
  console.log(`📋 问题: ${center.issue}`);
  console.log(`🔗 路径: ${center.path}`);
  console.log('='.repeat(80));
  
  const errors = [];
  const warnings = [];
  const apiCalls = [];
  
  // 监听控制台
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  // 监听网络请求
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('/api/')) {
      apiCalls.push({
        url: url.replace('http://localhost:3000', ''),
        status,
        ok: response.ok()
      });
    }
  });
  
  try {
    // 访问页面
    await page.goto(`${BASE_URL}${center.path}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // 检查页面内容
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasErrorMessage: !!document.querySelector('.el-message--error, .error-message'),
        errorText: document.querySelector('.el-message--error, .error-message')?.textContent,
        hasContent: !!document.querySelector('.main-content, .page-container, .center-container')
      };
    });
    
    console.log('\n📊 页面信息:');
    console.log(`   标题: ${pageContent.title}`);
    console.log(`   有错误提示: ${pageContent.hasErrorMessage}`);
    if (pageContent.errorText) {
      console.log(`   错误内容: ${pageContent.errorText}`);
    }
    console.log(`   有主要内容: ${pageContent.hasContent}`);
    
    console.log('\n🌐 API调用:');
    const failedAPIs = apiCalls.filter(api => !api.ok);
    if (failedAPIs.length > 0) {
      console.log(`   失败的API (${failedAPIs.length}个):`);
      failedAPIs.forEach(api => {
        console.log(`     ${api.status} - ${api.url}`);
      });
    } else {
      console.log('   ✅ 所有API调用成功');
    }
    
    console.log('\n❌ 控制台错误:');
    if (errors.length > 0) {
      errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.substring(0, 200)}`);
      });
      if (errors.length > 5) {
        console.log(`   ... 还有 ${errors.length - 5} 个错误`);
      }
    } else {
      console.log('   ✅ 无控制台错误');
    }
    
    // 截图
    const screenshotPath = `/tmp/${center.name}-错误检查.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 截图已保存: ${screenshotPath}`);
    
  } catch (error) {
    console.error(`\n❌ 检查失败: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 检查中心页面错误\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 登录
    console.log('🔐 登录...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="请输入用户名"]', 'principal');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(2000);
    console.log('✅ 登录成功\n');
    
    // 检查每个问题中心
    for (const center of PROBLEM_CENTERS) {
      await checkCenter(page, center);
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    await browser.close();
  }
}

main();

