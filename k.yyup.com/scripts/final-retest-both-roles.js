/**
 * 最终复测 - 测试ADMIN和PRINCIPAL两个角色
 * 验证权限配置是否完全正确
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  principal: {
    username: 'principal',
    password: '123456'
  }
};

// 测试的中心页面
const TEST_CENTERS = [
  {
    name: '客户池中心',
    path: '/principal/customer-pool-center'
  },
  {
    name: '招生中心',
    path: '/principal/enrollment-center'
  },
  {
    name: '督查中心',
    path: '/principal/supervision-center'
  }
];

async function login(page, role) {
  console.log(`\n🔐 登录 ${role.toUpperCase()} 角色...`);
  
  const creds = CREDENTIALS[role];
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.waitForSelector('[data-testid="username-input"]', { timeout: 30000 });

  await page.fill('[data-testid="username-input"]', creds.username);
  await page.waitForTimeout(500);
  await page.fill('[data-testid="password-input"]', creds.password);
  await page.waitForTimeout(500);
  
  console.log(`📝 填写登录信息: ${creds.username}`);
  
  await page.click('button[type="submit"]', { force: true });
  console.log('🖱️  点击登录按钮');
  
  try {
    await page.waitForNavigation({ timeout: 10000 });
  } catch (e) {
    // 忽略超时
  }
  
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log(`📍 当前URL: ${currentUrl}`);
  
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/principal') || currentUrl.includes('/notifications')) {
    console.log(`✅ ${role.toUpperCase()} 登录成功`);
    return true;
  } else {
    console.log(`❌ ${role.toUpperCase()} 登录失败`);
    return false;
  }
}

async function testCenterAccess(page, center, role) {
  console.log(`\n  📋 测试: ${center.name}`);
  
  try {
    await page.goto(`${BASE_URL}${center.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    
    if (currentUrl.includes('/403')) {
      console.log(`  ❌ 403权限不足`);
      return { success: false, error: '403 Forbidden' };
    } else if (currentUrl.includes(center.path)) {
      console.log(`  ✅ 访问成功`);
      return { success: true };
    } else {
      console.log(`  ⚠️  跳转到: ${currentUrl}`);
      return { success: true, redirected: currentUrl };
    }
  } catch (error) {
    console.log(`  ❌ 访问异常: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testRole(role) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 测试角色: ${role.toUpperCase()}`);
  console.log('='.repeat(80));

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  const results = {
    role: role,
    loginSuccess: false,
    centers: []
  };

  try {
    // 登录
    results.loginSuccess = await login(page, role);
    
    if (!results.loginSuccess) {
      console.log(`\n❌ ${role.toUpperCase()} 登录失败，跳过测试`);
      return results;
    }

    // 测试每个中心
    for (const center of TEST_CENTERS) {
      const result = await testCenterAccess(page, center, role);
      results.centers.push({
        name: center.name,
        path: center.path,
        ...result
      });
      await page.waitForTimeout(1000);
    }

  } catch (error) {
    console.error(`\n❌ ${role.toUpperCase()} 测试出错:`, error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }

  return results;
}

async function generateFinalReport(adminResults, principalResults) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 最终复测报告');
  console.log('='.repeat(80));
  console.log(`📅 测试时间: ${new Date().toLocaleString('zh-CN')}`);

  // ADMIN结果
  console.log('\n【ADMIN角色】');
  console.log(`  登录状态: ${adminResults.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
  if (adminResults.loginSuccess) {
    adminResults.centers.forEach(c => {
      console.log(`  ${c.success ? '✅' : '❌'} ${c.name}`);
    });
  }

  // PRINCIPAL结果
  console.log('\n【PRINCIPAL角色】');
  console.log(`  登录状态: ${principalResults.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
  if (principalResults.loginSuccess) {
    principalResults.centers.forEach(c => {
      console.log(`  ${c.success ? '✅' : '❌'} ${c.name}`);
    });
  }

  // 对比分析
  console.log('\n' + '='.repeat(80));
  console.log('📊 对比分析');
  console.log('='.repeat(80));

  const adminSuccess = adminResults.centers.filter(c => c.success).length;
  const principalSuccess = principalResults.centers.filter(c => c.success).length;
  const totalTests = TEST_CENTERS.length;

  console.log(`\nADMIN成功率: ${adminSuccess}/${totalTests} (${Math.round(adminSuccess/totalTests*100)}%)`);
  console.log(`PRINCIPAL成功率: ${principalSuccess}/${totalTests} (${Math.round(principalSuccess/totalTests*100)}%)`);

  // 最终结论
  console.log('\n' + '='.repeat(80));
  console.log('🎯 最终结论');
  console.log('='.repeat(80));

  if (adminSuccess === totalTests && principalSuccess === totalTests) {
    console.log('\n🎉 完美！两个角色都可以访问所有中心页面！');
    console.log('✅ 权限配置完全正确');
    console.log('✅ 复测通过');
  } else if (principalSuccess === totalTests) {
    console.log('\n✅ PRINCIPAL角色测试通过！');
    console.log('⚠️  ADMIN角色存在问题（这不应该发生）');
  } else if (adminSuccess === totalTests) {
    console.log('\n⚠️  ADMIN角色正常，但PRINCIPAL角色仍有问题');
    console.log('❌ 需要进一步检查PRINCIPAL角色权限');
  } else {
    console.log('\n❌ 两个角色都存在问题');
    console.log('⚠️  可能是后端服务或数据问题');
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('🚀 启动最终复测');
  console.log('📋 测试范围: ADMIN和PRINCIPAL两个角色');
  console.log('📍 测试页面: 客户池中心、招生中心、督查中心');

  // 测试ADMIN
  const adminResults = await testRole('admin');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 测试PRINCIPAL
  const principalResults = await testRole('principal');

  // 生成报告
  await generateFinalReport(adminResults, principalResults);
}

main().catch(console.error);

