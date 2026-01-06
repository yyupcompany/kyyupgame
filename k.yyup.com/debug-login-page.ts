/**
 * 调试登录页面元素
 */
import { browserManager, pageOperations } from './playwright-api-service/dist/index.js';

async function debugLoginPage() {
  console.log('🔍 调试登录页面元素...\n');

  try {
    await browserManager.launch({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    });

    await pageOperations.goto('http://localhost:5173/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await pageOperations.wait(3000);

    const page = browserManager.getPage();

    // 获取页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}\n`);

    // 获取当前URL
    const url = await page.url();
    console.log(`🔗 当前URL: ${url}\n`);

    // 查找所有input元素
    console.log('📝 所有input元素:');
    const inputs = await page.$$('input');
    console.log(`找到 ${inputs.length} 个input元素\n`);

    for (let i = 0; i < inputs.length; i++) {
      try {
        const element = inputs[i];
        const tagName = await element.evaluate(el => el.tagName);
        const type = await element.evaluate(el => el.getAttribute('type'));
        const placeholder = await element.evaluate(el => el.getAttribute('placeholder'));
        const name = await element.evaluate(el => el.getAttribute('name'));
        const id = await element.evaluate(el => el.getAttribute('id'));
        const className = await element.evaluate(el => el.getAttribute('class'));

        console.log(`Input ${i + 1}:`);
        console.log(`  Tag: ${tagName}`);
        console.log(`  Type: ${type || 'N/A'}`);
        console.log(`  Placeholder: ${placeholder || 'N/A'}`);
        console.log(`  Name: ${name || 'N/A'}`);
        console.log(`  ID: ${id || 'N/A'}`);
        console.log(`  Class: ${className || 'N/A'}`);
        console.log('');
      } catch (e) {
        console.log(`Input ${i + 1}: 获取信息失败\n`);
      }
    }

    // 查找所有button元素
    console.log('\n🔘 所有button元素:');
    const buttons = await page.$$('button');
    console.log(`找到 ${buttons.length} 个button元素\n`);

    for (let i = 0; i < buttons.length; i++) {
      try {
        const element = buttons[i];
        const text = await element.evaluate(el => el.textContent?.trim());
        const type = await element.evaluate(el => el.getAttribute('type'));
        const id = await element.evaluate(el => el.getAttribute('id'));
        const className = await element.evaluate(el => el.getAttribute('class'));

        console.log(`Button ${i + 1}:`);
        console.log(`  Text: ${text || 'N/A'}`);
        console.log(`  Type: ${type || 'N/A'}`);
        console.log(`  ID: ${id || 'N/A'}`);
        console.log(`  Class: ${className || 'N/A'}`);
        console.log('');
      } catch (e) {
        console.log(`Button ${i + 1}: 获取信息失败\n`);
      }
    }

    // 截图
    console.log('📸 保存登录页面截图...');
    await page.screenshot({ path: 'login-page-debug.png', fullPage: true });
    console.log('✅ 截图已保存: login-page-debug.png\n');

    console.log('✨ 调试完成！');
    await browserManager.close();

  } catch (error) {
    console.error('❌ 调试失败:', error);
    await browserManager.close();
  }
}

debugLoginPage();
