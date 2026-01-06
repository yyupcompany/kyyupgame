#!/usr/bin/env node

/**
 * 简单登录验证测试
 * 手动测试登录功能是否正常
 */

const { chromium } = require('playwright');

async function testLogin() {
  console.log('🚀 开始简单登录验证测试...');

  const browser = await chromium.launch({ headless: false }); // 显示浏览器以便观察
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 访问主页...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面完全加载
    await page.waitForTimeout(3000);

    console.log('📸 页面已加载，当前URL:', page.url());

    // 查找所有可能的登录相关元素
    const loginElements = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const inputs = Array.from(document.querySelectorAll('input'));

      return {
        buttons: buttons.map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          tagName: el.tagName,
          type: el.type
        })),
        inputs: inputs.map(el => ({
          placeholder: el.placeholder,
          type: el.type,
          name: el.name,
          className: el.className
        }))
      };
    });

    console.log('🔍 找到的按钮元素:');
    loginElements.buttons.forEach((btn, i) => {
      if (btn.text && (btn.text.includes('登录') || btn.text.includes('登') || btn.className.includes('login'))) {
        console.log(`  ${i + 1}. 文本: "${btn.text}", 类名: "${btn.className}"`);
      }
    });

    console.log('📝 找到的输入框:');
    loginElements.inputs.forEach((input, i) => {
      if (input.placeholder || input.type === 'text' || input.type === 'password') {
        console.log(`  ${i + 1}. 占位符: "${input.placeholder}", 类型: ${input.type}, 名称: ${input.name}`);
      }
    });

    // 尝试截图
    await page.screenshot({ path: 'login-page-debug.png', fullPage: true });
    console.log('📸 已保存页面截图: login-page-debug.png');

    console.log('⏳ 浏览器将保持打开30秒，请手动检查页面...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
    console.log('🧹 浏览器已关闭');
  }
}

testLogin().catch(console.error);