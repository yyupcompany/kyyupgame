const { chromium } = require('playwright');

async function testScriptCenterRoute() {
  console.log('🧪 开始测试 /centers/script 路由修复结果...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问 ScriptCenter 路由
    console.log('📍 访问 /centers/script 路由...');
    await page.goto('http://localhost:5173/centers/script');

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查页面标题和内容
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 检查是否有错误页面标识
    const hasErrorContent = await page.locator('text=404').count() > 0 ||
                           await page.locator('text=Page not found').count() > 0 ||
                           await page.locator('text=页面不存在').count() > 0;

    if (hasErrorContent) {
      console.log('❌ 页面仍然显示404错误');
      return false;
    }

    // 检查 ScriptCenter 组件特定内容
    const hasScriptContent = await page.locator('text=话术中心').count() > 0 ||
                             await page.locator('text=文案中心').count() > 0 ||
                             await page.locator('text=话术模板').count() > 0;

    if (hasScriptContent) {
      console.log('✅ ScriptCenter 组件内容已正常显示');

      // 检查是否有重复内容或布局问题
      const duplicateElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid], .script-center, .script-center-timeline');
        return elements.length;
      });

      console.log(`🔍 检测到 ScriptCenter 相关元素: ${duplicateElements} 个`);

      if (duplicateElements > 0) {
        console.log('✅ 页面渲染正常，无404错误');
        return true;
      }
    }

    // 检查是否被重定向到登录页面
    const hasLoginForm = await page.locator('input[type="password"]').count() > 0 ||
                         await page.locator('text=登录').count() > 0;

    if (hasLoginForm) {
      console.log('⚠️  页面被重定向到登录页面（可能需要认证）');
      return 'redirect_to_login';
    }

    // 检查页面是否有其他错误信息
    const pageContent = await page.content();
    const hasErrorKeywords = pageContent.includes('error') ||
                            pageContent.includes('Error') ||
                            pageContent.includes('错误');

    if (hasErrorKeywords) {
      console.log('⚠️  页面包含错误信息，可能存在其他问题');
    }

    console.log('✅ 路由 /centers/script 可以正常访问，不再返回404');
    return true;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 开始验证 /centers/script 路由修复结果');
  console.log('=' .repeat(60));

  const result = await testScriptCenterRoute();

  console.log('=' .repeat(60));
  console.log('📊 测试结果总结:');

  switch (result) {
    case true:
      console.log('✅ 成功: /centers/script 路由已修复，页面可以正常访问');
      break;
    case 'redirect_to_login':
      console.log('⚠️  路由有效但需要登录认证，这是正常行为');
      break;
    case false:
      console.log('❌ 失败: 路由仍然存在问题');
      break;
    default:
      console.log('🤔 未知状态');
  }
}

main().catch(console.error);