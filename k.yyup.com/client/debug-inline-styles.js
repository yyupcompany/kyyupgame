import { chromium } from 'playwright';

async function debugInlineStyles() {
  console.log('🔍 调试内联样式和动态样式...');

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

    // 深度调试内联样式
    const inlineDebug = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      const results = {
        elements: {}
      };

      const elementSelectors = {
        header: '.sidebar-header span',
        primaryTitle: '.primary-title',
        sectionTitle: '.menu-section-title',
        groupLabel: '.menu-group-label',
        menuItem: '.el-menu-item span'
      };

      Object.entries(elementSelectors).forEach(([key, selector]) => {
        const element = sidebar.querySelector(selector);
        if (element) {
          const debug = {
            text: element.textContent?.slice(0, 30) || '',
            computedColor: window.getComputedStyle(element).color,
            attributes: {},
            elementHTML: element.outerHTML,
            parentElement: element.parentElement?.tagName,
            parentClasses: Array.from(element.parentElement?.classList || []),
            allClasses: Array.from(element.classList)
          };

          // 检查所有属性
          Array.from(element.attributes).forEach(attr => {
            debug.attributes[attr.name] = attr.value;
          });

          // 检查内联样式
          debug.hasInlineStyle = !!element.style.color;
          debug.inlineStyleColor = element.style.color;
          debug.cssText = element.style.cssText;

          // 检查dataset
          debug.dataset = { ...element.dataset };

          results.elements[key] = debug;
        }
      });

      return results;
    });

    console.log('\n🎯 内联样式调试结果:');

    if (inlineDebug.error) {
      console.log(`  ❌ 错误: ${inlineDebug.error}`);
      return;
    }

    Object.entries(inlineDebug.elements).forEach(([key, element]) => {
      console.log(`\n📝 ${key}:`);
      console.log(`  文字: "${element.text}"`);
      console.log(`  计算颜色: ${element.computedColor}`);
      console.log(`  元素HTML: ${element.elementHTML}`);
      console.log(`  父元素: ${element.parentElement}`);
      console.log(`  父元素类: ${element.parentClasses.join(', ')}`);
      console.log(`  所有类: ${element.allClasses.join(', ')}`);

      console.log(`  🔧 属性:`);
      Object.entries(element.attributes).forEach(([attr, value]) => {
        console.log(`    ${attr}: ${value}`);
      });

      console.log(`  🎨 样式信息:`);
      console.log(`    有内联样式: ${element.hasInlineStyle}`);
      console.log(`    内联颜色: ${element.inlineStyleColor || '无'}`);
      console.log(`    CSS文本: ${element.cssText || '无'}`);

      console.log(`  📊 数据属性:`);
      Object.entries(element.dataset).forEach(([data, value]) => {
        console.log(`    data-${data}: ${value}`);
      });
    });

  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ 内联样式调试完成');
}

debugInlineStyles().catch(console.error);