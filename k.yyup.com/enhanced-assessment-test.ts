/**
 * 增强版评估测试 - 包含快速登录和手动登录
 */

import { browserManager, pageOperations, screenshotService, consoleMonitor } from './playwright-api-service/dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './assessment-test-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testLoginMethods() {
  console.log('='.repeat(80));
  console.log('🎯 增强版评估测试 - 多种登录方式');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    // 1. 启动浏览器
    console.log('\n1️⃣ 启动浏览器...');
    await browserManager.launch({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    });
    console.log('✅ 浏览器启动成功');

    // 2. 访问登录页面
    console.log('\n2️⃣ 访问登录页面...');
    await pageOperations.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await pageOperations.wait(2000);
    await screenshotService.saveScreenshot('01-login-page.png', SCREENSHOT_DIR);
    console.log('✅ 已保存登录页面截图');

    const page = browserManager.getPage();

    // 3. 监控控制台错误
    console.log('\n3️⃣ 启动控制台监控...');
    consoleMonitor.startMonitoring();

    // 4. 尝试快速登录按钮
    console.log('\n4️⃣ 尝试快速登录按钮...');
    const quickButtons = [
      { selector: '.quick-btn.parent-btn', name: '家长' },
      { selector: '.quick-btn.teacher-btn', name: '教师' },
      { selector: '.quick-btn.admin-btn', name: '系统管理员' },
      { selector: '.quick-btn.principal-btn', name: '园长' }
    ];

    let loginSuccess = false;
    let loggedInAs = '';

    for (const btn of quickButtons) {
      try {
        console.log(`\n🔄 尝试点击 ${btn.name} 快速登录...`);

        const button = await page.waitForSelector(btn.selector, { timeout: 3000 });
        if (button) {
          console.log(`✅ 找到 ${btn.name} 按钮`);
          await button.click();
          console.log('⏳ 等待页面响应...');
          await pageOperations.wait(3000);

          // 检查控制台错误
          const errors = consoleMonitor.getErrors();
          if (errors.length > 0) {
            console.log('⚠️  检测到控制台错误:');
            errors.slice(-3).forEach(e => console.log(`   - ${e.text}`));
          }

          const currentUrl = await pageOperations.getURL();
          console.log(`🔍 当前URL: ${currentUrl}`);

          if (!currentUrl.includes('/login')) {
            loginSuccess = true;
            loggedInAs = `${btn.name} (快速登录)`;
            console.log(`✅ ${btn.name} 快速登录成功！`);
            break;
          } else {
            console.log(`⚠️  仍停留在登录页面`);
          }
        }
      } catch (e) {
        console.log(`❌ ${btn.name} 快速登录失败: ${e.message}`);
      }
    }

    // 5. 如果快速登录失败，尝试手动输入
    if (!loginSuccess) {
      console.log('\n5️⃣ 快速登录失败，尝试手动输入凭据...');

      const credentials = [
        { username: 'admin', password: 'admin123', name: '管理员' },
        { username: 'teacher', password: 'teacher123', name: '教师' },
        { username: 'parent', password: 'parent123', name: '家长' }
      ];

      for (const cred of credentials) {
        try {
          console.log(`\n🔄 尝试手动登录: ${cred.username}`);

          // 找到输入框
          const usernameInput = await page.waitForSelector('input[type="text"]', { timeout: 5000 });
          const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });

          console.log('✅ 找到输入框');

          // 清除并输入用户名
          await usernameInput.click({ clickCount: 3 });
          await page.keyboard.press('Backspace');
          await usernameInput.fill(cred.username);
          await pageOperations.wait(500);

          // 清除并输入密码
          await passwordInput.click({ clickCount: 3 });
          await page.keyboard.press('Backspace');
          await passwordInput.fill(cred.password);
          await pageOperations.wait(500);

          // 截图填写后的表单
          await screenshotService.saveScreenshot(`02-form-filled-${cred.username}.png`, SCREENSHOT_DIR);

          // 点击登录按钮
          const loginButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
          console.log('✅ 找到登录按钮，正在点击...');
          await loginButton.click();

          // 等待响应
          console.log('⏳ 等待登录响应...');
          await pageOperations.wait(5000);

          // 检查控制台错误
          const errors = consoleMonitor.getErrors();
          if (errors.length > 0) {
            console.log('⚠️  检测到控制台错误:');
            errors.slice(-5).forEach(e => console.log(`   - ${e.text}`));
          }

          const currentUrl = await pageOperations.getURL();
          console.log(`🔍 当前URL: ${currentUrl}`);

          // 检查是否成功
          if (!currentUrl.includes('/login')) {
            loginSuccess = true;
            loggedInAs = `${cred.name} (手动登录: ${cred.username})`;
            console.log(`✅ ${cred.name} 手动登录成功！`);
            break;
          } else {
            // 检查是否有错误消息
            try {
              const errorMsg = await page.$('.error-message, .alert, [class*="error"]');
              if (errorMsg) {
                const text = await errorMsg.textContent();
                console.log(`⚠️  登录失败消息: ${text}`);
              }
            } catch (e) {
              // 没有错误消息元素
            }
            console.log(`⚠️  手动登录失败，尝试下一个...`);
          }

          await pageOperations.wait(2000);
        } catch (e) {
          console.log(`❌ ${cred.username} 手动登录出错: ${e.message}`);
        }
      }
    }

    // 6. 如果仍然失败，检查后端服务状态
    if (!loginSuccess) {
      console.log('\n6️⃣ 登录仍然失败，检查后端服务状态...');

      try {
        const response = await fetch(`${BASE_URL.replace('5173', '3000')}/api/health`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ 后端服务正常:`, data);
        } else {
          console.log(`⚠️  后端服务响应异常: ${response.status}`);
        }
      } catch (e) {
        console.log(`❌ 无法连接到后端服务: ${e.message}`);
        console.log('💡 提示: 请确保后端服务在 http://localhost:3000 运行');
      }

      // 检查网络请求
      console.log('\n🔍 检查网络请求...');
      const responses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          responses.push({
            url: response.url(),
            status: response.status(),
            ok: response.ok()
          });
        }
      });

      // 再次尝试快速登录以捕获网络请求
      try {
        const button = await page.waitForSelector('.quick-btn.parent-btn', { timeout: 3000 });
        await button.click();
        await pageOperations.wait(3000);
      } catch (e) {
        // 忽略
      }

      console.log('\n📊 捕获的网络请求:');
      responses.forEach(r => {
        const status = r.ok ? '✅' : '❌';
        console.log(`  ${status} ${r.status} - ${r.url}`);
      });
    }

    // 7. 生成报告
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    const errors = consoleMonitor.getErrors();
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${minutes}分${seconds}秒`,
      loginSuccess,
      loggedInAs,
      consoleErrors: errors.length,
      screenshots: fs.readdirSync(SCREENSHOT_DIR).map(f => f),
      networkRequests: '见上方日志'
    };

    const reportPath = path.join(SCREENSHOT_DIR, `login-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('📋 测试报告');
    console.log('='.repeat(80));
    console.log(`登录状态: ${loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    if (loginSuccess) {
      console.log(`登录方式: ${loggedInAs}`);
    }
    console.log(`控制台错误: ${errors.length} 个`);
    console.log(`总耗时: ${report.duration}`);
    console.log(`截图目录: ${SCREENSHOT_DIR}`);
    console.log(`报告文件: ${reportPath}`);
    console.log('='.repeat(80));

    console.log('\n📸 生成的截图:');
    fs.readdirSync(SCREENSHOT_DIR).forEach(f => {
      console.log(`  - ${f}`);
    });

    if (!loginSuccess) {
      console.log('\n❌ 所有登录方式都失败');
      console.log('\n💡 可能的原因:');
      console.log('  1. 后端服务未运行 (需要: npm run start:backend)');
      console.log('  2. 数据库未初始化 (需要: npm run seed-data:complete)');
      console.log('  3. 测试用户不存在 (需要: node create-test-users.cjs)');
      console.log('  4. MySQL服务未启动');
    }

    console.log('\n✨ 测试完成！');
    console.log('\n💡 浏览器将保持打开 60 秒，您可以手动测试');
    await new Promise(resolve => setTimeout(resolve, 60000));

    return loginSuccess ? 0 : 1;

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return 1;

  } finally {
    console.log('\n🔚 关闭浏览器...');
    await browserManager.close();
    console.log('✅ 浏览器已关闭');
  }
}

// 执行测试
testLoginMethods()
  .then(exitCode => {
    console.log(`\n脚本执行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });