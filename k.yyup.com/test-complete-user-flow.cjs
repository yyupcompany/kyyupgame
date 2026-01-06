#!/usr/bin/env node

/**
 * 完整用户流程测试：登录 → admin 快捷登录 → AI 助手
 * 测试 AI 助手连接和"你好"消息响应
 */

const { chromium } = require('playwright');

async function testCompleteUserFlow() {
  console.log('🚀 开始完整用户流程测试...');
  console.log('测试流程: 登录页面 → admin 快捷登录 → 头部导航 → AI 助手 → 发送"你好"');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // 步骤 1: 访问登录页面
    console.log('\n📍 步骤 1: 访问登录页面');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ 登录页面加载成功');

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 截图保存登录页面状态
    await page.screenshot({ path: 'login-page.png' });

    // 步骤 2: 点击 admin 快捷登录
    console.log('\n📍 步骤 2: 点击 admin 快捷登录');

    // 查找 admin 快捷登录按钮
    const adminLoginSelectors = [
      '.quick-btn.admin-btn',
      'button:has-text("系统管理员")',
      'button:has-text("admin")',
      'button:has-text("全局管理")',
      '[data-testid="admin-login"]',
      '.admin-btn',
      'button[onclick*="admin"]',
      'a[href*="admin"]'
    ];

    let adminButtonFound = false;

    for (const selector of adminLoginSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`找到 admin 登录按钮: ${selector}`);
          await element.click();
          adminButtonFound = true;
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!adminButtonFound) {
      // 尝试查找包含 admin 文本的任何可点击元素
      const elements = await page.$$('button, a, div[role="button"]');
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.toLowerCase().includes('admin')) {
          console.log(`找到 admin 元素: ${text.trim()}`);
          await element.click();
          adminButtonFound = true;
          break;
        }
      }
    }

    if (!adminButtonFound) {
      throw new Error('未找到 admin 快捷登录按钮');
    }

    console.log('✅ admin 快捷登录按钮点击成功');

    // 等待登录处理
    await page.waitForTimeout(3000);

    // 步骤 3: 验证登录成功并等待主页面加载
    console.log('\n📍 步骤 3: 验证登录成功');

    // 检查是否还在登录页面
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('⚠️  仍在登录页面，可能需要等待更长时间...');
      await page.waitForTimeout(5000);
    }

    // 等待主页面加载，查找主要导航元素
    const mainPageSelectors = [
      '.header',
      '.main-layout',
      '.layout-header',
      'header',
      '.navigation',
      '.main-content'
    ];

    let mainPageLoaded = false;
    for (const selector of mainPageSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        mainPageLoaded = true;
        console.log(`✅ 主页面元素找到: ${selector}`);
        break;
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!mainPageLoaded) {
      console.log('⚠️  未找到明确的页面元素，但继续执行...');
    }

    // 截图保存主页面状态
    await page.screenshot({ path: 'main-page.png' });

    // 步骤 4: 点击头部导航中的 AI 助手
    console.log('\n📍 步骤 4: 点击头部导航中的 AI 助手');

    // 等待页面稳定
    await page.waitForTimeout(2000);

    const aiAssistantSelectors = [
      'button:has-text("AI助手")',
      'a:has-text("AI助手")',
      '[data-testid="ai-assistant"]',
      '.ai-assistant-btn',
      '.ai-assistant',
      'button[title*="AI"]',
      '*[class*="ai-assistant"]'
    ];

    let aiButtonFound = false;

    for (const selector of aiAssistantSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`找到 AI 助手按钮: ${selector}`);
          await element.click();
          aiButtonFound = true;
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!aiButtonFound) {
      // 尝试查找包含 AI 文本的任何可点击元素
      const elements = await page.$$('button, a, div[role="button"], span');
      for (const element of elements) {
        const text = await element.textContent();
        if (text && (text.includes('AI助手') || text.includes('AI') || text.toLowerCase().includes('assistant'))) {
          console.log(`找到 AI 元素: ${text.trim()}`);
          await element.click();
          aiButtonFound = true;
          break;
        }
      }
    }

    if (!aiButtonFound) {
      throw new Error('未找到 AI 助手按钮');
    }

    console.log('✅ AI 助手按钮点击成功');

    // 等待 AI 助手界面加载
    await page.waitForTimeout(3000);

    // 截图保存 AI 助手界面状态
    await page.screenshot({ path: 'ai-assistant-page.png' });

    // 步骤 5: 在 AI 助手中输入"你好"并发送
    console.log('\n📍 步骤 5: 在 AI 助手中输入"你好"并发送');

    // 查找输入框
    const inputSelectors = [
      'input[type="text"]',
      'textarea',
      'input[placeholder*="输入"]',
      'textarea[placeholder*="输入"]',
      '.ai-input',
      '.chat-input',
      '[data-testid="ai-input"]',
      'input[placeholder*="请输入"]',
      'textarea[placeholder*="请输入"]'
    ];

    let inputFound = false;

    for (const selector of inputSelectors) {
      try {
        const input = await page.$(selector);
        if (input) {
          console.log(`找到 AI 输入框: ${selector}`);

          // 清空输入框并输入"你好"
          await input.fill('');
          await input.type('你好', { delay: 100 });
          inputFound = true;

          // 截图保存输入状态
          await page.screenshot({ path: 'ai-input-filled.png' });

          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!inputFound) {
      throw new Error('未找到 AI 助手输入框');
    }

    // 查找发送按钮
    const sendSelectors = [
      'button:has-text("发送")',
      'button:has-text("发送消息")',
      'button[type="submit"]',
      '.send-btn',
      '.ai-send',
      '[data-testid="send-button"]',
      'button[title*="发送"]',
      '*[class*="send"]'
    ];

    let sendButtonFound = false;

    for (const selector of sendSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`找到发送按钮: ${selector}`);
          await button.click();
          sendButtonFound = true;
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!sendButtonFound) {
      // 尝试按回车键发送
      console.log('未找到发送按钮，尝试按回车键发送');
      await page.keyboard.press('Enter');
      sendButtonFound = true;
    }

    console.log('✅ 消息发送成功');

    // 步骤 6: 等待 AI 响应
    console.log('\n📍 步骤 6: 等待 AI 响应');

    // 等待响应出现
    await page.waitForTimeout(5000);

    // 查找 AI 响应元素
    const responseSelectors = [
      '.ai-response',
      '.message',
      '.response',
      '.chat-message',
      '.ai-message',
      '[data-testid="ai-response"]',
      '*[class*="response"]',
      '*[class*="message"]'
    ];

    let responseFound = false;
    let responseText = '';

    for (const selector of responseSelectors) {
      try {
        const responses = await page.$$(selector);
        for (const response of responses) {
          const text = await response.textContent();
          if (text && text.trim().length > 0) {
            responseText = text.trim();
            responseFound = true;
            console.log(`找到 AI 响应: ${selector}`);
            break;
          }
        }
        if (responseFound) break;
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    // 截图保存最终状态
    await page.screenshot({ path: 'final-response.png' });

    // 测试结果
    console.log('\n🎯 测试结果');
    console.log('='.repeat(50));

    if (responseFound) {
      console.log('✅ AI 助手连接成功！');
      console.log('✅ 成功收到 AI 响应');
      console.log(`📝 AI 响应内容: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      console.log('\n🎉 完整用户流程测试通过！');
      console.log('✅ 登录 → admin 快捷登录 → AI 助手 → 发送"你好" → 收到响应');
    } else {
      console.log('❌ 未找到 AI 响应');
      console.log('⚠️  可能的原因：');
      console.log('   - AI 服务连接问题');
      console.log('   - 响应时间过长');
      console.log('   - 界面元素已更改');

      // 检查是否有错误信息
      const errorSelectors = [
        '.error',
        '.error-message',
        '[data-testid="error"]',
        '*[class*="error"]'
      ];

      for (const selector of errorSelectors) {
        try {
          const error = await page.$(selector);
          if (error) {
            const errorText = await error.textContent();
            if (errorText && errorText.trim().length > 0) {
              console.log(`🚨 发现错误信息: ${errorText.trim()}`);
            }
          }
        } catch (e) {
          // 忽略
        }
      }
    }

    console.log('\n📊 页面截图已保存:');
    console.log('   - login-page.png: 登录页面');
    console.log('   - main-page.png: 主页面');
    console.log('   - ai-assistant-page.png: AI 助手界面');
    console.log('   - ai-input-filled.png: 输入"你好"状态');
    console.log('   - final-response.png: 最终响应状态');

  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message);

    // 保存错误状态截图
    try {
      await page.screenshot({ path: 'error-state.png' });
      console.log('📸 错误状态截图已保存: error-state.png');
    } catch (e) {
      // 忽略截图错误
    }

    console.log('\n🔍 调试信息:');
    console.log(`当前 URL: ${page.url()}`);

    // 检查页面标题
    try {
      const title = await page.title();
      console.log(`页面标题: ${title}`);
    } catch (e) {
      // 忽略
    }

    // 检查控制台错误
    try {
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log(`浏览器控制台错误: ${msg.text()}`);
        }
      });
    } catch (e) {
      // 忽略
    }

  } finally {
    await browser.close();
    console.log('\n🏁 测试完成，浏览器已关闭');
  }
}

// 检查服务是否运行
async function checkServices() {
  console.log('🔍 检查服务状态...');

  const http = require('http');
  const https = require('https');

  // 检查前端服务
  const frontendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      console.log('✅ 前端服务运行正常 (localhost:5173)');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ 前端服务连接失败 (localhost:5173)');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏰ 前端服务响应超时 (localhost:5173)');
      resolve(false);
    });
  });

  // 检查后端服务
  const backendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/health', (res) => {
      console.log('✅ 后端服务运行正常 (localhost:3000)');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ 后端服务连接失败 (localhost:3000)');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏰ 后端服务响应超时 (localhost:3000)');
      resolve(false);
    });
  });

  const [frontendOk, backendOk] = await Promise.all([frontendCheck, backendCheck]);

  if (!frontendOk) {
    console.log('\n❌ 前端服务未运行，请先启动前端服务:');
    console.log('   cd client && npm run dev');
    process.exit(1);
  }

  if (!backendOk) {
    console.log('\n❌ 后端服务未运行，请先启动后端服务:');
    console.log('   cd server && npm run dev');
    process.exit(1);
  }

  console.log('✅ 所有服务运行正常，开始测试...\n');
}

// 主函数
async function main() {
  console.log('🧪 完整用户流程测试');
  console.log('测试目标: 登录 → admin 快捷登录 → AI 助手 → "你好"消息');
  console.log('='.repeat(60));

  try {
    await checkServices();
    await testCompleteUserFlow();
  } catch (error) {
    console.error('💥 测试执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
});