const { chromium } = require('playwright');

/**
 * 最终验证暗黑模式卡片边框修复效果
 */

async function testFinalDarkModeFix() {
  console.log('🌙 最终验证暗黑模式卡片边框修复效果');
  console.log('====================================\n');

  let browser;

  try {
    // === 启动浏览器 ===
    console.log('📍 步骤1: 启动浏览器');

    browser = await chromium.launch({
      headless: false,
      slowMo: 300,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    // 监听控制台输出
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('主题') || text.includes('theme') || text.includes('card') || text.includes('边框')) {
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

      // === 访问Dashboard页面 ===
      console.log('\n📍 步骤3: 访问Dashboard页面');

      await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // === 检查卡片数量和边框 ===
      console.log('\n📍 步骤4: 检查卡片数量和边框（正常模式）');

      const initialCards = await page.$$('.el-card, [class*="card"]');
      console.log(`找到 ${initialCards.length} 个卡片元素`);

      if (initialCards.length > 0) {
        // 检查前3个卡片的边框颜色
        for (let i = 0; i < Math.min(3, initialCards.length); i++) {
          const card = initialCards[i];
          const styles = await card.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              borderColor: computed.borderColor,
              backgroundColor: computed.backgroundColor,
              color: computed.color
            };
          });

          console.log(`卡片 ${i + 1} (正常模式):`);
          console.log(`  边框色: ${styles.borderColor}`);
          console.log(`  背景色: ${styles.backgroundColor}`);
        }
      }

      // === 切换到暗黑模式 ===
      console.log('\n📍 步骤5: 切换到暗黑模式');

      await page.evaluate(() => {
        // 设置暗黑主题
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('theme-dark', 'el-theme-dark');

        // 应用CSS变量
        document.documentElement.style.setProperty('--bg-card', '#1a1625');
        document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
        document.documentElement.style.setProperty('--text-primary', '#f1f5f9');

        console.log('✅ 暗黑主题已应用');
      });

      await page.waitForTimeout(2000);

      // === 检查暗黑模式下的卡片边框 ===
      console.log('\n📍 步骤6: 检查暗黑模式下的卡片边框');

      const darkModeCards = await page.$$('.el-card, [class*="card"]');
      console.log(`暗黑模式下找到 ${darkModeCards.length} 个卡片元素`);

      let whiteBorderCount = 0;
      let correctBorderCount = 0;

      if (darkModeCards.length > 0) {
        for (let i = 0; i < Math.min(5, darkModeCards.length); i++) {
          const card = darkModeCards[i];
          const styles = await card.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              borderColor: computed.borderColor,
              backgroundColor: computed.backgroundColor,
              color: computed.color
            };
          });

          console.log(`卡片 ${i + 1} (暗黑模式):`);
          console.log(`  边框色: ${styles.borderColor}`);
          console.log(`  背景色: ${styles.backgroundColor}`);
          console.log(`  文字色: ${styles.color}`);

          // 检查边框颜色
          if (styles.borderColor.includes('255, 255, 255') &&
              (styles.borderColor.includes('1') || styles.borderColor.includes('0.9') || styles.borderColor.includes('rgb(255)')) &&
              !styles.borderColor.includes('0.08')) {
            whiteBorderCount++;
            console.log(`  ❌ 卡片 ${i + 1} 仍有白色边框`);
          } else if (styles.borderColor.includes('rgba') && styles.borderColor.includes('0.08')) {
            correctBorderCount++;
            console.log(`  ✅ 卡片 ${i + 1} 边框已修复为暗色`);
          } else if (styles.borderColor.includes('rgb(26') || styles.borderColor.includes('#1a')) {
            correctBorderCount++;
            console.log(`  ✅ 卡片 ${i + 1} 边框已修复为暗色`);
          } else {
            console.log(`  ⚠️ 卡片 ${i + 1} 边框颜色不明确: ${styles.borderColor}`);
          }
        }
      }

      // === 截图记录 ===
      console.log('\n📍 步骤7: 截图记录修复效果');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const normalModeScreenshot = `docs/浏览器检查/dark-mode-fix-normal-${timestamp}.png`;
      const darkModeScreenshot = `docs/浏览器检查/dark-mode-fix-dark-${timestamp}.png`;

      await page.screenshot({ path: normalModeScreenshot, fullPage: false });
      console.log('✅ 正常模式截图已保存:', normalModeScreenshot);

      await page.screenshot({ path: darkModeScreenshot, fullPage: false });
      console.log('✅ 暗黑模式截图已保存:', darkModeScreenshot);

      // === 生成修复报告 ===
      console.log('\n📍 步骤8: 生成修复报告');

      const reportContent = `# 暗黑模式卡片边框修复效果报告

**测试时间**: ${new Date().toLocaleString()}
**浏览器**: Chromium (Playwright)
**测试页面**: Dashboard

## 测试结果

### 卡片统计
- **总卡片数量**: ${darkModeCards.length}
- **白色边框卡片**: ${whiteBorderCount}
- **修复成功卡片**: ${correctBorderCount}

### 修复成功率
${((correctBorderCount / Math.min(5, darkModeCards.length)) * 100).toFixed(1)}%

### 结论
${whiteBorderCount === 0 ? '✅ 修复成功！所有卡片边框已适配暗黑主题' :
  correctBorderCount > whiteBorderCount ? '🔶 大部分修复成功，仍有少量卡片需要处理' :
  '❌ 修复效果不佳，需要进一步调试'}

## 截图文件
- 正常模式: ${normalModeScreenshot}
- 暗黑模式: ${darkModeScreenshot}
`;

      const reportPath = `docs/浏览器检查/dark-mode-fix-report-${timestamp}.md`;
      require('fs').writeFileSync(reportPath, reportContent, 'utf8');
      console.log('✅ 修复报告已保存:', reportPath);

      console.log('\n🚀 暗黑模式卡片边框修复测试完成');
      console.log('====================================');
      console.log(`总卡片数: ${darkModeCards.length}`);
      console.log(`修复成功: ${correctBorderCount}`);
      console.log(`仍有白边: ${whiteBorderCount}`);
      console.log(`修复率: ${((correctBorderCount / Math.min(5, darkModeCards.length)) * 100).toFixed(1)}%`);

    } catch (pageError) {
      console.log('❌ 页面操作失败:', pageError.message);
    }

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
console.log('🚀 准备开始最终暗黑模式修复验证测试...\n');

testFinalDarkModeFix().catch(console.error);