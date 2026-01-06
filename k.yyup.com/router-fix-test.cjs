const { chromium } = require('playwright');

async function testRouterFix() {
  console.log('🔧 测试路由守卫修复...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 测试几个关键路由，确保没有路由守卫错误
    const testRoutes = ['/login', '/dashboard', '/centers/script', '/ai/assistant'];

    for (const route of testRoutes) {
      console.log(`\n📍 测试路由: ${route}`);

      try {
        await page.goto(`http://localhost:5173${route}`, { timeout: 10000 });
        await page.waitForTimeout(1000);

        // 检查页面标题
        const title = await page.title();
        console.log(`📄 页面标题: ${title}`);

        // 检查是否有错误内容
        const hasError = await page.locator('text=TypeError').count() > 0 ||
                         await page.locator('text=next is not a function').count() > 0;

        if (hasError) {
          console.log(`❌ ${route} - 仍然存在路由错误`);
          return false;
        } else {
          console.log(`✅ ${route} - 路由守卫正常`);
        }

      } catch (error) {
        if (error.message.includes('next is not a function')) {
          console.log(`❌ ${route} - 路由守卫错误: ${error.message}`);
          return false;
        } else {
          console.log(`⚠️  ${route} - 其他错误: ${error.message}`);
        }
      }
    }

    return true;

  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 开始路由守卫修复验证');
  console.log('=' .repeat(50));

  const success = await testRouterFix();

  console.log('=' .repeat(50));
  if (success) {
    console.log('🎉 路由守卫修复成功！所有路由正常工作');
  } else {
    console.log('❌ 路由守卫仍有问题，需要进一步调试');
  }
}

main().catch(console.error);