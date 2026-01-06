/**
 * 海报制作功能复测脚本
 * 测试从活动中心到海报生成的完整流程
 */

import { chromium } from 'playwright';

async function testPosterFlow() {
  console.log('🚀 开始海报功能复测...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 放慢操作以便观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 步骤1: 设置登录状态（模拟已登录）
    console.log('📍 步骤1: 设置登录状态');

    // 设置localStorage模拟登录
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1,
        username: 'admin',
        role: 'PRINCIPAL',
        name: '管理员'
      }));
    });

    console.log('✅ 登录状态设置完成\n');

    // 步骤2: 直接访问AI海报编辑器
    console.log('📍 步骤2: 直接访问AI海报编辑器');
    await page.goto('http://localhost:5173/principal/poster-editor');
    await page.waitForTimeout(5000);
    console.log('✅ AI海报编辑器加载完成\n');

    // 截图1: AI海报编辑器初始状态
    await page.screenshot({ path: 'screenshots/01-poster-editor-initial.png', fullPage: true });
    console.log('📸 截图保存: 01-poster-editor-initial.png\n');

    // 步骤3: 输入海报描述并生成
    console.log('📍 步骤3: 输入海报描述并生成');
    // 等待页面加载
    await page.waitForTimeout(2000);

    // 查找聊天输入框
    const chatInputSelectors = [
      'textarea',
      '.chat-input textarea',
      'input[type="text"]',
      '[placeholder*="描述"]',
      '[placeholder*="输入"]'
    ];

    let chatInput = null;
    for (const selector of chatInputSelectors) {
      try {
        chatInput = await page.$(selector);
        if (chatInput) {
          console.log(`✅ 找到输入框，选择器: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (chatInput) {
      await chatInput.fill('请生成一张温馨可爱的幼儿园春游活动海报，包含卡通儿童、春天花朵和蓝天白云元素');
      await page.waitForTimeout(1000);
      console.log('✅ 输入描述完成\n');

      // 截图2: 输入描述后
      await page.screenshot({ path: 'screenshots/02-input-description.png', fullPage: true });
      console.log('📸 截图保存: 02-input-description.png\n');

      // 查找发送按钮
      const sendButtonSelectors = [
        'button:has-text("发送")',
        '.send-button',
        '[aria-label="发送"]',
        'button[type="submit"]'
      ];

      let sendButton = null;
      for (const selector of sendButtonSelectors) {
        try {
          sendButton = await page.$(selector);
          if (sendButton) {
            console.log(`✅ 找到发送按钮，选择器: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (sendButton) {
        await sendButton.click();
        console.log('✅ 点击发送按钮\n');

        // 等待AI生成
        console.log('⏳ 等待AI生成海报（最多30秒）...');
        await page.waitForTimeout(30000);

        // 截图3: AI生成后
        await page.screenshot({ path: 'screenshots/03-after-generation.png', fullPage: true });
        console.log('📸 截图保存: 03-after-generation.png\n');

        // 检查是否有生成的海报
        const posterImage = await page.$('.poster-image, img[alt*="海报"], img[src*="poster"]');
        if (posterImage) {
          console.log('✅ 海报生成成功！\n');
        } else {
          console.log('⚠️  未检测到生成的海报图片（可能还在生成中）\n');
        }
      } else {
        console.log('⚠️  未找到发送按钮\n');
        // 尝试按Enter键发送
        await chatInput.press('Enter');
        console.log('✅ 尝试按Enter键发送\n');
        await page.waitForTimeout(30000);
        await page.screenshot({ path: 'screenshots/03-after-enter.png', fullPage: true });
      }
    } else {
      console.log('⚠️  未找到聊天输入框\n');
      console.log('页面URL:', page.url());
    }

    console.log('\n✅ 测试流程完成！');
    console.log('📁 截图已保存到 screenshots/ 目录\n');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    console.log('📸 错误截图: error.png\n');
  } finally {
    // 保持浏览器打开30秒以便查看
    console.log('⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('👋 浏览器已关闭');
  }
}

// 运行测试
testPosterFlow().catch(console.error);

