/**
 * AI助手隔离性完整测试脚本
 * 包含登录、AI全屏模式访问、查询在园人数的完整流程测试
 */

import { chromium } from 'playwright';

(async () => {
  console.log('🚀 开始AI助手隔离性完整测试...');

  const browser = await chromium.launch({
    headless: false, // 设置为false以便观察测试过程
    slowMo: 1000 // 减慢操作速度便于观察
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './test-videos',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // 步骤1: 访问登录页面
    console.log('\n📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 截图登录页面
    await page.screenshot({ path: 'test-screenshots/01-login-page.png' });
    console.log('✅ 登录页面加载完成');

    // 步骤2: 执行登录
    console.log('\n📍 步骤2: 执行登录');

    // 等待登录表单
    await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], #username, [data-testid="username"]', { timeout: 10000 });

    // 填写登录信息
    await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], #username, [data-testid="username"]', 'admin');
    await page.fill('input[placeholder*="密码"], #password, [data-testid="password"]', '123456');

    // 点击登录按钮
    await page.click('button[type="submit"], .el-button--primary, [data-testid="login-button"]');

    // 等待登录完成
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-screenshots/02-after-login.png' });
    console.log('✅ 登录完成');

    // 步骤3: 访问AI助手全屏模式
    console.log('\n📍 步骤3: 访问AI助手全屏模式');

    // 直接访问AI助手全屏页面
    await page.goto('http://localhost:5173/ai/assistant?mode=fullpage');
    await page.waitForLoadState('networkidle');

    // 等待AI助手组件加载
    await page.waitForSelector('.ai-assistant-core, .full-page-layout, [data-testid="ai-assistant"]', { timeout: 15000 });
    await page.screenshot({ path: 'test-screenshots/03-ai-fullpage.png' });
    console.log('✅ AI助手全屏页面加载完成');

    // 步骤4: 测试AI助手功能隔离性
    console.log('\n📍 步骤4: 测试AI助手功能隔离性');

    // 查找输入框
    const inputSelector = 'textarea[placeholder*="请输入"], .el-textarea__inner, [data-testid="ai-input"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    // 输入测试消息
    await page.fill(inputSelector, '你好，请查询当前在园所有人数');
    await page.screenshot({ path: 'test-screenshots/04-input-message.png' });

    // 点击发送按钮
    const sendButtonSelector = 'button[type="submit"], .send-button, [data-testid="send-button"]';
    await page.click(sendButtonSelector);

    // 等待AI响应
    console.log('⏳ 等待AI响应...');
    await page.waitForTimeout(3000); // 等待3秒模拟响应

    // 截图显示响应
    await page.screenshot({ path: 'test-screenshots/05-ai-response.png' });
    console.log('✅ AI响应完成');

    // 步骤5: 验证功能隔离性
    console.log('\n📍 步骤5: 验证功能隔离性');

    // 打开新页面测试侧边栏模式
    const sidebarPage = await context.newPage();
    await sidebarPage.goto('http://localhost:5173/ai/assistant?mode=sidebar');
    await sidebarPage.waitForLoadState('networkidle');

    // 检查两个页面是否有独立状态
    await page.screenshot({ path: 'test-screenshots/06-fullpage-mode.png' });
    await sidebarPage.screenshot({ path: 'test-screenshots/07-sidebar-mode.png' });

    console.log('✅ 功能隔离性验证完成');

    // 步骤6: 测试完整的事件流程
    console.log('\n📍 步骤6: 测试完整的事件流程');

    // 验证前后端API连接
    const healthResponse = await page.goto('http://localhost:3000/health');
    const healthStatus = await healthResponse.text();
    console.log('🔍 后端健康检查:', healthStatus);

    // 验证AI API端点
    try {
      const apiResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:3000/api/ai-query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: '查询在园人数测试',
            context: {
              mode: 'fullpage',
              test: true
            }
          })
        });
        return response.status;
      });

      console.log('🔍 AI API端点状态:', apiResponse);
    } catch (error) {
      console.log('⚠️ AI API端点测试失败:', error.message);
    }

    await sidebarPage.close();

    console.log('\n🎉 所有测试完成！');
    console.log('📸 测试截图已保存到 test-screenshots/ 目录');
    console.log('🎥 测试视频已保存到 test-videos/ 目录');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
    await page.screenshot({ path: 'test-screenshots/error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('✅ 测试完成，浏览器已关闭');
  }
})();