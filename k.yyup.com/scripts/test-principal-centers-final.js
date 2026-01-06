/**
 * MCP浏览器测试 - Principal角色测试中心页面（最终验证）
 * 测试客户池中心、招生中心、督查中心
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const PRINCIPAL_CREDENTIALS = {
  username: 'principal',
  password: '123456'
};

// 测试的中心页面
const TEST_CENTERS = [
  {
    name: '客户池中心',
    path: '/principal/customer-pool-center',
    apiEndpoints: [
      '/api/customer-pool/stats',
      '/api/customer-pool/list'
    ]
  },
  {
    name: '招生中心',
    path: '/principal/enrollment-center',
    apiEndpoints: [
      '/api/enrollment-center/overview',
      '/api/enrollment-center/plans'
    ]
  },
  {
    name: '督查中心',
    path: '/principal/supervision-center',
    apiEndpoints: [
      '/api/page-guides',
      '/api/supervision/stats'
    ]
  }
];

async function login(page) {
  console.log('\n🔐 开始登录...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('✅ 登录页面加载完成');
  
  await page.waitForTimeout(2000);

  // 等待登录表单加载
  await page.waitForSelector('[data-testid="username-input"]', { timeout: 30000 });
  console.log('✅ 登录表单已加载');

  // 填写登录表单
  await page.fill('[data-testid="username-input"]', PRINCIPAL_CREDENTIALS.username);
  await page.waitForTimeout(500);
  await page.fill('[data-testid="password-input"]', PRINCIPAL_CREDENTIALS.password);
  await page.waitForTimeout(500);
  
  console.log(`📝 填写登录信息: ${PRINCIPAL_CREDENTIALS.username}`);
  
  // 点击登录按钮
  await page.click('button[type="submit"]', { force: true });
  console.log('🖱️  点击登录按钮');
  
  // 等待导航完成
  try {
    await page.waitForNavigation({ timeout: 10000 });
    console.log('✅ 页面导航完成');
  } catch (e) {
    console.log('⚠️  导航超时，继续检查...');
  }
  
  await page.waitForTimeout(3000);

  // 验证登录成功
  const currentUrl = page.url();
  console.log(`📍 当前URL: ${currentUrl}`);
  
  // 检查是否有错误消息
  const errorMsg = await page.locator('[data-testid="error-message"]').textContent().catch(() => null);
  if (errorMsg) {
    console.log(`❌ 登录错误: ${errorMsg}`);
  }
  
  // 检查是否登录成功
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/principal')) {
    console.log('✅ 登录成功 - PRINCIPAL角色');
    console.log(`   跳转到: ${currentUrl}`);
    return true;
  } else if (currentUrl.includes('/login')) {
    console.log('❌ 登录失败 - 仍在登录页面');
    await page.screenshot({ path: 'principal-login-failed.png' });
    console.log('📸 已保存失败截图: principal-login-failed.png');
    return false;
  } else {
    console.log('⚠️  未知页面，继续测试...');
    return true;
  }
}

async function testCenterPage(page, center) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 测试中心: ${center.name}`);
  console.log(`📍 路径: ${center.path}`);
  console.log(`${'='.repeat(60)}`);

  const result = {
    name: center.name,
    path: center.path,
    pageAccessible: false,
    apiResults: [],
    consoleErrors: [],
    networkErrors: []
  };

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 监听网络请求
  const apiRequests = new Map();
  page.on('response', async response => {
    const url = response.url();
    
    // 检查是否是我们关注的API
    for (const apiPath of center.apiEndpoints) {
      if (url.includes(apiPath)) {
        const status = response.status();
        const apiResult = {
          endpoint: apiPath,
          status: status,
          success: status >= 200 && status < 300
        };

        try {
          const body = await response.json();
          apiResult.response = body;
        } catch (e) {
          apiResult.response = await response.text();
        }

        apiRequests.set(apiPath, apiResult);
        
        if (status === 403) {
          console.log(`❌ API 403错误: ${apiPath}`);
          result.networkErrors.push(`403 Forbidden: ${apiPath}`);
        } else if (status === 404) {
          console.log(`⚠️  API 404错误: ${apiPath}`);
          result.networkErrors.push(`404 Not Found: ${apiPath}`);
        } else if (status >= 200 && status < 300) {
          console.log(`✅ API成功: ${apiPath} (${status})`);
        } else {
          console.log(`⚠️  API错误: ${apiPath} (${status})`);
          result.networkErrors.push(`${status}: ${apiPath}`);
        }
      }
    }
  });

  try {
    // 访问页面
    console.log(`\n🌐 访问页面: ${center.path}`);
    await page.goto(`${BASE_URL}${center.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // 等待页面加载和API调用

    // 检查是否跳转到403页面
    const currentUrl = page.url();
    if (currentUrl.includes('/403')) {
      console.log('❌ 页面访问被拒绝 - 跳转到403页面');
      result.pageAccessible = false;
    } else {
      console.log('✅ 页面访问成功');
      result.pageAccessible = true;
    }

    // 等待所有API请求完成
    await page.waitForTimeout(3000);

    // 收集API结果
    result.apiResults = Array.from(apiRequests.values());
    result.consoleErrors = consoleErrors;

  } catch (error) {
    console.log(`❌ 页面访问异常: ${error.message}`);
    result.pageAccessible = false;
    result.consoleErrors.push(error.message);
  }

  return result;
}

async function generateReport(results) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PRINCIPAL角色测试报告 - 中心页面权限验证');
  console.log('='.repeat(80));

  let allSuccess = true;

  for (const result of results) {
    console.log(`\n【${result.name}】`);
    console.log(`  路径: ${result.path}`);
    console.log(`  页面访问: ${result.pageAccessible ? '✅ 成功' : '❌ 失败'}`);
    
    if (result.apiResults.length > 0) {
      console.log(`  API测试结果:`);
      for (const api of result.apiResults) {
        const status = api.success ? '✅' : '❌';
        console.log(`    ${status} ${api.endpoint} - ${api.status}`);
        if (!api.success) {
          allSuccess = false;
        }
      }
    } else {
      console.log(`  API测试结果: ⚠️  未检测到API调用`);
    }

    if (result.networkErrors.length > 0) {
      console.log(`  网络错误 (${result.networkErrors.length}个):`);
      result.networkErrors.forEach(err => console.log(`    - ${err}`));
      allSuccess = false;
    }

    if (result.consoleErrors.length > 0) {
      console.log(`  控制台错误 (${result.consoleErrors.length}个):`);
      result.consoleErrors.slice(0, 3).forEach(err => console.log(`    - ${err}`));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`总体结果: ${allSuccess ? '✅ 全部成功' : '⚠️  存在问题'}`);
  console.log('='.repeat(80));

  // 生成结论
  console.log('\n📋 测试结论:');
  if (allSuccess) {
    console.log('🎉 恭喜！principal角色现在可以正常访问所有中心页面！');
    console.log('✅ 权限配置已完成');
  } else {
    console.log('⚠️  部分功能仍存在问题');
    console.log('💡 可能的原因:');
    console.log('   1. 某些API端点不存在或未实现');
    console.log('   2. 某些权限代码仍然缺失');
    console.log('   3. 后端服务未正常运行');
  }

  return results;
}

async function main() {
  console.log('🚀 启动PRINCIPAL角色中心页面测试');
  console.log(`📅 测试时间: ${new Date().toLocaleString('zh-CN')}`);

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // 登录
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.log('❌ 登录失败，测试终止');
      return;
    }

    // 测试每个中心页面
    const results = [];
    for (const center of TEST_CENTERS) {
      const result = await testCenterPage(page, center);
      results.push(result);
      await page.waitForTimeout(2000);
    }

    // 生成报告
    await generateReport(results);

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

main().catch(console.error);

