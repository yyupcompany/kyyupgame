/**
 * 快速AI移动端聊天页面检查
 */

import { chromium } from 'playwright';

async function quickMobileCheck() {
  console.log('🚀 快速检查AI移动端页面...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security'] 
    });
    
    const page = await browser.newPage({
      viewport: { width: 414, height: 896 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });

    console.log('📱 导航到移动端AI聊天页面...');
    await page.goto('http://localhost:5173/mobile/ai-chat?forceMobile=1', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('✅ 页面加载成功');
    
    // 截图
    await page.screenshot({ path: `mobile-ai-check-${Date.now()}.png` });
    console.log('📸 已保存截图');

    // 检查页面标题
    const title = await page.title();
    console.log(`📋 页面标题: ${title}`);

    // 检查主要元素
    const elements = await page.evaluate(() => {
      return {
        hasChatContainer: !!document.querySelector('.mobile-ai-chat, .chat-container'),
        hasInput: !!document.querySelector('input, textarea'),
        hasSendButton: !!document.querySelector('button'),
        bodyClass: document.body.className,
        pageContent: document.body.textContent.substring(0, 200)
      };
    });

    console.log('🔍 页面元素检查:');
    console.log(`   聊天容器: ${elements.hasChatContainer ? '✅' : '❌'}`);
    console.log(`   输入框: ${elements.hasInput ? '✅' : '❌'}`);
    console.log(`   发送按钮: ${elements.hasSendButton ? '✅' : '❌'}`);
    console.log(`   Body类: ${elements.bodyClass}`);
    console.log(`   页面内容预览: ${elements.pageContent}...`);

    // 尝试简单交互
    if (elements.hasInput) {
      console.log('💬 尝试发送测试消息...');
      
      const inputSelector = 'input[type="text"], textarea, .message-input input';
      const input = await page.$(inputSelector);
      
      if (input) {
        await input.fill('Hello, 这是一个快速测试');
        console.log('✅ 输入消息成功');
        
        // 尝试点击发送或按回车
        const sendBtn = await page.$('button[type="submit"], .send-button');
        if (sendBtn) {
          await sendBtn.click();
          console.log('✅ 点击发送按钮');
        } else {
          await page.press(inputSelector, 'Enter');
          console.log('✅ 按回车发送');
        }
        
        // 等待一下看响应
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `mobile-ai-test-sent-${Date.now()}.png` });
        console.log('📸 已保存发送后截图');
      }
    }

    // 检查网络请求
    const requests = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        requests.push(req.url());
      }
    });

    console.log(`🌐 监测到 ${requests.length} 个API请求`);
    if (requests.length > 0) {
      console.log('   最近的API请求:', requests.slice(-3));
    }

    console.log('🎉 快速检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

quickMobileCheck();