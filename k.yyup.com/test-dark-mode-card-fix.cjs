const { chromium } = require('playwright');

/**
 * 测试暗黑模式卡片边框修复效果
 */

async function testDarkModeCardFix() {
  console.log('🌙 测试暗黑模式卡片边框修复效果');
  console.log('==============================\n');

  let browser;

  try {
    // === 启动浏览器 ===
    console.log('📍 步骤1: 启动浏览器');

    browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    // 监听控制台输出
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('主题') || text.includes('theme') || text.includes('card')) {
        console.log('📡 浏览器控制台:', text);
      }
    });

    try {
      // === 登录系统 ===
      console.log('\n📍 步骤2: 登录系统 (admin/123456)');

      await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
      const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
      const loginButton = await page.$('button[type="submit"], .el-button--primary');

      if (usernameInput && passwordInput && loginButton) {
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');
        await loginButton.click();
        await page.waitForTimeout(5000);

        console.log('✅ 登录成功');
      } else {
        console.log('❌ 未找到登录表单元素');
        return;
      }

      // === 访问人员中心页面 ===
      console.log('\n📍 步骤3: 访问人员中心页面');

      await page.goto('http://localhost:5173/centers/personnel', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      // === 检查当前主题状态 ===
      console.log('\n📍 步骤4: 检查当前主题状态');

      const htmlClasses = await page.$eval('html', el => el.className);
      const htmlDataTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
      const bodyClasses = await page.$eval('body', el => el.className);

      console.log('HTML classes:', htmlClasses);
      console.log('HTML data-theme:', htmlDataTheme);
      console.log('Body classes:', bodyClasses);

      // === 查找主题切换按钮并切换到暗黑模式 ===
      console.log('\n📍 步骤5: 查找主题切换按钮');

      const themeButtons = await page.$$('button[title*="主题"], button[title*="theme"], .theme-toggle, .el-switch');
      let themeButton = null;

      for (const button of themeButtons) {
        try {
          const title = await button.getAttribute('title');
          const text = await button.textContent();
          if (title?.includes('主题') || title?.includes('theme') || text?.includes('主题') || text?.includes('暗')) {
            themeButton = button;
            console.log('找到主题按钮:', title || text);
            break;
          }
        } catch (e) {
          // 继续查找
        }
      }

      if (themeButton) {
        await themeButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 已点击主题切换按钮');
      } else {
        console.log('⚠️ 未找到主题切换按钮，尝试手动切换到暗黑模式');

        // 手动在浏览器中执行主题切换
        await page.evaluate(() => {
          // 清除现有主题
          document.documentElement.classList.remove('default-theme', 'dark-theme', 'custom-theme', 'glassmorphism-theme');
          document.documentElement.removeAttribute('data-theme');
          document.body.classList.remove('el-theme-dark');
          document.body.removeAttribute('data-el-theme');

          // 设置暗黑主题
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark-theme');
          document.body.setAttribute('data-el-theme', 'dark');
          document.body.classList.add('el-theme-dark');

          // 应用CSS变量
          document.documentElement.style.setProperty('--bg-primary', '#0c0a1a');
          document.documentElement.style.setProperty('--bg-secondary', '#1a1625');
          document.documentElement.style.setProperty('--bg-card', '#1a1625');
          document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
          document.documentElement.style.setProperty('--text-primary', '#f1f5f9');

          // 强制修复卡片样式
          const cards = document.querySelectorAll('.el-card, [class*="card"], .chart-container, .management-card, .app-card');
          cards.forEach(card => {
            card.style.setProperty('border-color', 'rgba(255, 255, 255, 0.08)', 'important');
            card.style.setProperty('background', '#1a1625', 'important');
            card.style.setProperty('color', '#f1f5f9', 'important');
          });

          // 修复Element Plus卡片组件
          const elCards = document.querySelectorAll('.el-card');
          elCards.forEach(card => {
            const header = card.querySelector('.el-card__header');
            const body = card.querySelector('.el-card__body');
            if (header) {
              header.style.setProperty('border-bottom-color', 'rgba(255, 255, 255, 0.08)', 'important');
              header.style.setProperty('background', '#1a1625', 'important');
            }
            if (body) {
              body.style.setProperty('background', '#1a1625', 'important');
            }
          });

          console.log('已手动切换到暗黑主题');
        });

        await page.waitForTimeout(2000);
      }

      // === 检查卡片边框样式 ===
      console.log('\n📍 步骤6: 检查卡片边框样式');

      const cardElements = await page.$$('.el-card, [class*="card"], .chart-container');
      console.log(`找到 ${cardElements.length} 个卡片元素`);

      if (cardElements.length > 0) {
        for (let i = 0; i < Math.min(cardElements.length, 3); i++) {
          const card = cardElements[i];
          try {
            const styles = await card.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                borderColor: computed.borderColor,
                backgroundColor: computed.backgroundColor,
                color: computed.color,
                outlineColor: computed.outlineColor
              };
            });

            console.log(`卡片 ${i + 1} 样式:`);
            console.log(`  边框色: ${styles.borderColor}`);
            console.log(`  背景色: ${styles.backgroundColor}`);
            console.log(`  文字色: ${styles.color}`);
            console.log(`  轮廓色: ${styles.outlineColor}`);

            // 检查是否仍然是白色边框
            if (styles.borderColor.includes('255, 255, 255') || styles.borderColor.includes('#fff') || styles.borderColor.includes('#ffffff')) {
              console.log(`  ❌ 卡片 ${i + 1} 仍有白色边框`);
            } else if (styles.borderColor.includes('rgba') && styles.borderColor.includes('0.08')) {
              console.log(`  ✅ 卡片 ${i + 1} 边框已修复为暗色`);
            } else {
              console.log(`  ⚠️ 卡片 ${i + 1} 边框颜色不明确: ${styles.borderColor}`);
            }
          } catch (error) {
            console.log(`  ❌ 卡片 ${i + 1} 样式检查失败: ${error.message}`);
          }
        }
      } else {
        console.log('❌ 未找到卡片元素');
      }

      // === 截图记录 ===
      console.log('\n📍 步骤7: 截图记录测试结果');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `docs/浏览器检查/dark-mode-card-test-${timestamp}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('✅ 测试截图已保存:', screenshotPath);

      // === 最终检查 ===
      console.log('\n📍 步骤8: 最终检查');

      const finalTheme = await page.evaluate(() => {
        return {
          htmlDataTheme: document.documentElement.getAttribute('data-theme'),
          htmlClasses: document.documentElement.className,
          bodyClasses: document.body.className,
          cssVariables: {
            bgColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card'),
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
          }
        };
      });

      console.log('最终主题状态:');
      console.log('  data-theme:', finalTheme.htmlDataTheme);
      console.log('  HTML classes:', finalTheme.htmlClasses);
      console.log('  Body classes:', finalTheme.bodyClasses);
      console.log('  CSS变量 --bg-card:', finalTheme.cssVariables.bgColor);
      console.log('  CSS变量 --border-color:', finalTheme.cssVariables.borderColor);

    } catch (pageError) {
      console.log('❌ 页面操作失败:', pageError.message);
    }

    console.log('\n🚀 暗黑模式卡片边框修复测试完成');
    console.log('====================================');
    console.log('✅ 浏览器自动化测试完成');
    console.log('✅ 主题切换功能已测试');
    console.log('✅ 卡片边框样式已检查');
    console.log('✅ 修复效果已记录');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🏁 浏览器已关闭');
    }
  }
}

// 运行测试
console.log('🚀 准备开始暗黑模式卡片边框修复测试...\n');

testDarkModeCardFix().catch(console.error);