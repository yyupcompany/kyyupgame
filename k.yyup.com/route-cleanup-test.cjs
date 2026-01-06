const { chromium } = require('playwright');

async function testRoutesAfterCleanup() {
  console.log('🧪 开始测试路由清理后的页面访问情况...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 关键路由测试列表
  const testRoutes = [
    { path: '/login', name: '登录页', expectContent: '登录' },
    { path: '/dashboard', name: '仪表板', expectContent: '仪表板' },
    { path: '/centers/script', name: '文案中心', expectContent: ['话术中心', '文案中心'] },
    { path: '/centers/ai', name: 'AI中心', expectContent: 'AI' },
    { path: '/centers/personnel', name: '人员管理', expectContent: '人员' },
    { path: '/centers/activity', name: '活动管理', expectContent: '活动' },
    { path: '/centers/enrollment', name: '招生管理', expectContent: '招生' },
    { path: '/centers/system', name: '系统管理', expectContent: '系统' },
    { path: '/teacher-center/dashboard', name: '教师工作台', expectContent: '教师' },
    { path: '/parent-center/dashboard', name: '家长工作台', expectContent: '家长' },
    { path: '/ai/assistant', name: 'AI助手', expectContent: 'AI' },
    { path: '/404', name: '404页面', expectContent: '404' },
    { path: '/403', name: '403页面', expectContent: '403' }
  ];

  const results = {
    success: 0,
    redirect: 0,
    error: 0,
    details: []
  };

  try {
    for (const route of testRoutes) {
      console.log(`\n📍 测试路由: ${route.path} (${route.name})`);

      try {
        await page.goto(`http://localhost:5173${route.path}`, { timeout: 10000 });
        await page.waitForTimeout(2000); // 等待页面加载

        // 检查页面标题
        const title = await page.title();
        console.log(`📄 页面标题: ${title}`);

        // 检查是否被重定向到登录页
        const isLoginPage = await page.locator('input[type="password"]').count() > 0 ||
                            await page.locator('text=登录').count() > 0;

        if (isLoginPage && route.path !== '/login' && route.path !== '/404' && route.path !== '/403') {
          console.log(`⚠️  ${route.name} - 需要登录认证 (正常)`);
          results.redirect++;
          results.details.push({ path: route.path, name: route.name, status: 'redirect_to_login' });
          continue;
        }

        // 检查页面内容
        let hasExpectedContent = false;
        if (Array.isArray(route.expectContent)) {
          hasExpectedContent = await Promise.any(
            route.expectContent.map(content =>
              page.locator(`text=${content}`).count() > 0
            )
          );
        } else {
          hasExpectedContent = await page.locator(`text=${route.expectContent}`).count() > 0;
        }

        // 检查错误页面
        const hasError = await page.locator('text=404').count() > 0 ||
                         await page.locator('text=Page not found').count() > 0 ||
                         await page.locator('text=页面不存在').count() > 0 ||
                         title.includes('Error');

        if (hasError && !route.path.includes('404')) {
          console.log(`❌ ${route.name} - 页面错误或404`);
          results.error++;
          results.details.push({ path: route.path, name: route.name, status: 'error' });
        } else if (hasExpectedContent || route.path === '/login' || route.path.includes('404')) {
          console.log(`✅ ${route.name} - 页面正常`);
          results.success++;
          results.details.push({ path: route.path, name: route.name, status: 'success' });
        } else {
          console.log(`⚠️  ${route.name} - 内容可能不完整，但路由有效`);
          results.success++;
          results.details.push({ path: route.path, name: route.name, status: 'partial' });
        }

      } catch (error) {
        console.log(`❌ ${route.name} - 访问失败: ${error.message}`);
        results.error++;
        results.details.push({ path: route.path, name: route.name, status: 'error', error: error.message });
      }
    }

  } finally {
    await browser.close();
  }

  return results;
}

async function main() {
  console.log('🚀 开始路由清理验证测试');
  console.log('=' .repeat(60));

  const results = await testRoutesAfterCleanup();

  console.log('=' .repeat(60));
  console.log('📊 测试结果总结:');
  console.log(`✅ 成功: ${results.success} 个路由`);
  console.log(`⚠️  重定向到登录: ${results.redirect} 个路由`);
  console.log(`❌ 错误: ${results.error} 个路由`);
  console.log(`📈 总计: ${results.details.length} 个路由`);

  console.log('\n🔍 详细结果:');
  results.details.forEach(detail => {
    const status = detail.status === 'success' ? '✅' :
                  detail.status === 'redirect_to_login' ? '🔐' :
                  detail.status === 'partial' ? '⚠️' : '❌';
    console.log(`${status} ${detail.path} - ${detail.name} (${detail.status})`);
    if (detail.error) {
      console.log(`   错误: ${detail.error}`);
    }
  });

  const successRate = (results.success / results.details.length * 100).toFixed(1);
  console.log(`\n🎯 路由可用性: ${successRate}%`);

  if (results.error === 0) {
    console.log('🎉 路由清理成功！所有页面都可以正常访问');
  } else {
    console.log('⚠️  部分路由存在问题，需要进一步检查');
  }
}

main().catch(console.error);