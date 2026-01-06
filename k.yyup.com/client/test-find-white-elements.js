import { chromium } from 'playwright';

async function findWhiteElements() {
  console.log('🔍 开始查找FullPageSidebar中的白色元素...');

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
      await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // 切换到暗黑模式
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

    // 详细检查FullPageSidebar及其子元素
    console.log('🔍 详细检查FullPageSidebar元素...');
    const whiteElements = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return [];

      const whiteElements = [];
      const allElements = sidebar.querySelectorAll('*');
      const whiteRegex = /rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,/i;

      allElements.forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // 检查背景色
        if (bgColor && whiteRegex.test(bgColor)) {
          whiteElements.push({
            index,
            type: 'background',
            element: element.tagName.toLowerCase() +
                     (element.className ? '.' + element.className.split(' ').slice(0, 2).join('.') : ''),
            value: bgColor,
            text: element.textContent?.slice(0, 30) || 'N/A'
          });
        }

        // 检查文字颜色（排除合理的浅色）
        if (textColor && whiteRegex.test(textColor)) {
          // 排除一些合理的浅色，只检查真正的白色
          const rgbMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            // 只有接近纯白色(240+)才报告
            if (r >= 240 && g >= 240 && b >= 240) {
              whiteElements.push({
                index,
                type: 'text',
                element: element.tagName.toLowerCase() +
                         (element.className ? '.' + element.className.split(' ').slice(0, 2).join('.') : ''),
                value: textColor,
                text: element.textContent?.slice(0, 30) || 'N/A'
              });
            }
          }
        }
      });

      return whiteElements;
    });

    if (whiteElements.length > 0) {
      console.log(`\n⚠️ 发现 ${whiteElements.length} 个白色元素:`);
      whiteElements.forEach((item, index) => {
        console.log(`   ${index + 1}. [${item.type}] ${item.element}`);
        console.log(`      值: ${item.value}`);
        if (item.text !== 'N/A') {
          console.log(`      内容: "${item.text}"`);
        }
      });

      // 生成截图，标注问题区域
      console.log('\n📸 生成FullPageSidebar详细截图...');
      await page.screenshot({
        path: 'full-sidebar-white-elements.png',
        fullPage: false
      });
      console.log('   📸 截图保存: full-sidebar-white-elements.png');

    } else {
      console.log('\n✅ 未发现明显的白色元素');
    }

    // 检查特定的Element Plus组件
    console.log('\n🔍 检查Element Plus组件...');
    const elementPlusIssues = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return [];

      const issues = [];

      // 检查el-card相关
      const cards = sidebar.querySelectorAll('.el-card');
      cards.forEach((card, index) => {
        const style = window.getComputedStyle(card);
        if (style.backgroundColor.includes('rgb(255, 255, 255)')) {
          issues.push({
            component: 'el-card',
            index,
            bg: style.backgroundColor
          });
        }
      });

      // 检查el-button相关
      const buttons = sidebar.querySelectorAll('.el-button');
      buttons.forEach((btn, index) => {
        const style = window.getComputedStyle(btn);
        if (style.backgroundColor.includes('rgb(255, 255, 255)')) {
          issues.push({
            component: 'el-button',
            index,
            bg: style.backgroundColor
          });
        }
      });

      // 检查el-menu相关
      const menus = sidebar.querySelectorAll('.el-menu-item');
      menus.forEach((menu, index) => {
        const style = window.getComputedStyle(menu);
        if (style.backgroundColor.includes('rgb(255, 255, 255)')) {
          issues.push({
            component: 'el-menu-item',
            index,
            bg: style.backgroundColor
          });
        }
      });

      return issues;
    });

    if (elementPlusIssues.length > 0) {
      console.log('\n⚠️ Element Plus组件问题:');
      elementPlusIssues.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.component}[${item.index}]: ${item.bg}`);
      });
    }

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ 白色元素检查完成');
}

findWhiteElements().catch(console.error);