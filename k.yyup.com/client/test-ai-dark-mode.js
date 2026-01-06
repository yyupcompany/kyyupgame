import { chromium } from 'playwright';

async function testAIDarkMode() {
  console.log('🚀 开始AI助手暗黑模式测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问AI助手页面...');
    await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 快速登录
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');

      // 重新访问AI助手页面
      await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // 查找主题切换器并切换到暗黑模式
    console.log('🔍 查找主题切换器...');
    const themeButton = await page.$('.theme-btn');
    if (themeButton) {
      console.log('✅ 找到主题切换器');

      // 点击主题切换器
      await themeButton.click();
      await page.waitForTimeout(2000);

      // 查找暗黑主题选项
      const themeOptions = await page.$$('.theme-option');
      let darkThemeFound = false;

      for (let i = 0; i < themeOptions.length; i++) {
        const option = themeOptions[i];
        const text = await option.textContent();
        if (text && text.includes('暗黑主题')) {
          console.log('🎨 切换到暗黑主题...');
          await option.click();
          await page.waitForTimeout(3000);
          darkThemeFound = true;
          break;
        }
      }

      if (!darkThemeFound) {
        console.log('⚠️ 未找到暗黑主题选项，使用默认主题测试');
      }

      // 检查页面的背景色（检测泛白问题）
      console.log('🔍 检查页面背景色...');
      const backgroundColors = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const aiFullPage = document.querySelector('.ai-full-page-layout');
        const pageContainer = document.querySelector('.page-container');

        const computedStyle = (element) => {
          if (!element) return null;
          const style = window.getComputedStyle(element);
          return {
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            color: style.color
          };
        };

        return {
          body: computedStyle(body),
          html: computedStyle(html),
          aiFullPage: computedStyle(aiFullPage),
          pageContainer: computedStyle(pageContainer),
          dataTheme: html.getAttribute('data-theme'),
          bodyClasses: body.className,
          htmlClasses: html.className
        };
      });

      console.log('\n🎨 页面背景色分析:');
      console.log(`  Data主题: ${backgroundColors.dataTheme || '无'}`);
      console.log(`  Body类: ${backgroundColors.bodyClasses || '无'}`);
      console.log(`  HTML类: ${backgroundColors.htmlClasses || '无'}`);

      if (backgroundColors.aiFullPage) {
        console.log(`  AI全页背景色: ${backgroundColors.aiFullPage.backgroundColor}`);
        console.log(`  AI全页背景图: ${backgroundColors.aiFullPage.backgroundImage}`);
      }

      if (backgroundColors.pageContainer) {
        console.log(`  页面容器背景色: ${backgroundColors.pageContainer.backgroundColor}`);
        console.log(`  页面容器背景图: ${backgroundColors.pageContainer.backgroundImage}`);
      }

      // 检查是否有明显的白色背景（泛白问题）
      const hasWhiteBackground = backgroundColors.aiFullPage?.backgroundColor?.includes('255, 255, 255') ||
                              backgroundColors.pageContainer?.backgroundColor?.includes('255, 255, 255');

      if (hasWhiteBackground) {
        console.log('⚠️ 发现白色背景，可能存在泛白问题');
      } else {
        console.log('✅ 未发现明显的白色背景');
      }

      // 截图验证
      console.log('📸 生成暗黑模式截图...');
      await page.screenshot({ path: 'ai-dark-mode-test.png' });
      console.log('   📸 截图保存: ai-dark-mode-test.png');

    } else {
      console.log('❌ 未找到主题切换器');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('✅ AI助手暗黑模式测试完成');
}

testAIDarkMode().catch(console.error);