import { chromium } from 'playwright';

async function testFullSidebarDarkMode() {
  console.log('🚀 开始FullPageSidebar暗黑模式测试...');

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

    // 切换到暗黑模式
    console.log('🎨 切换到暗黑模式...');
    const themeButton = await page.$('.theme-btn');
    if (themeButton) {
      await themeButton.click();
      await page.waitForTimeout(2000);

      const themeOptions = await page.$$('.theme-option');
      for (let i = 0; i < themeOptions.length; i++) {
        const text = await themeOptions[i].textContent();
        if (text && text.includes('暗黑主题')) {
          await themeOptions[i].click();
          await page.waitForTimeout(3000);
          break;
        }
      }
    }

    // 检查FullPageSidebar的颜色
    console.log('🔍 检查FullPageSidebar颜色...');
    const sidebarColors = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      const sidebarHeader = document.querySelector('.sidebar-header');
      const sidebarHeaderIcon = sidebarHeader?.querySelector('.unified-icon');

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
        sidebar: computedStyle(sidebar),
        sidebarHeader: computedStyle(sidebarHeader),
        sidebarHeaderIcon: sidebarHeaderIcon ? computedStyle(sidebarHeaderIcon) : null,
        dataTheme: document.documentElement.getAttribute('data-theme')
      };
    });

    console.log('\n🎨 FullPageSidebar颜色分析:');
    console.log(`  Data主题: ${sidebarColors.dataTheme || '无'}`);

    if (sidebarColors.sidebarHeader) {
      console.log(`  侧边栏头部背景: ${sidebarColors.sidebarHeader.backgroundImage || '纯色'}`);
      console.log(`  侧边栏头部文字色: ${sidebarColors.sidebarHeader.color}`);
    }

    if (sidebarColors.sidebarHeaderIcon) {
      console.log(`  侧边栏头部图标色: ${sidebarColors.sidebarHeaderIcon.color}`);
    }

    // 检查是否有硬编码的白色(255, 255, 255)
    const hasHardcodedWhite =
      sidebarColors.sidebarHeader?.color?.includes('255, 255, 255') ||
      sidebarColors.sidebarHeaderIcon?.color?.includes('255, 255, 255');

    if (hasHardcodedWhite) {
      console.log('⚠️ 发现硬编码的白色文字，可能需要在暗黑模式下调整');
    } else {
      console.log('✅ 未发现硬编码的白色文字');
    }

    // 截图验证
    console.log('📸 生成FullPageSidebar暗黑模式截图...');
    await page.screenshot({ path: 'full-sidebar-dark-mode.png' });
    console.log('   📸 截图保存: full-sidebar-dark-mode.png');

    // 检查其他可能的AI组件
    console.log('\n🔍 检查其他可能的硬编码颜色...');
    const allHardcodedColors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const hardcodedColors = [];
      const whiteRegex = /rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,/i;
      const blackRegex = /rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,/i;

      elements.forEach((element, index) => {
        if (index > 500) return; // 限制检查数量避免性能问题

        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        if (whiteRegex.test(color) || whiteRegex.test(backgroundColor)) {
          hardcodedColors.push({
            element: element.tagName.toLowerCase() + (element.className ? '.' + element.className : ''),
            property: 'color',
            value: color || backgroundColor,
            selector: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').join('.') : '')
          });
        }
      });

      return hardcodedColors.slice(0, 10); // 只返回前10个
    });

    if (allHardcodedColors.length > 0) {
      console.log(`\n⚠️ 发现 ${allHardcodedColors.length} 个可能的硬编码白色:`);
      allHardcodedColors.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.element}: ${item.value}`);
      });
    } else {
      console.log('\n✅ 未发现明显的硬编码白色');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ FullPageSidebar暗黑模式测试完成');
}

testFullSidebarDarkMode().catch(console.error);